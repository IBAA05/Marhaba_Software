"""Booking business logic (availability, refs, check-in/out, invoicing)."""
from __future__ import annotations

from datetime import date, datetime, timezone
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import (
    BookingStatus,
    PlatformSource,
    RelatedEntity,
    RoomStatus,
    RoomType,
)
from app.core.exceptions import BadRequestError, ConflictError, NotFoundError
from app.models.booking import Booking
from app.repositories.booking import BookingRepository
from app.repositories.guest import GuestRepository
from app.repositories.room import RoomRepository
from app.schemas.booking import BookingCreate, BookingStatusUpdate, BookingUpdate
from app.services.invoice import InvoiceService
from app.services.notification import NotificationService

_STATUS_COLORS = {
    BookingStatus.new: "#9ca3af",
    BookingStatus.confirmed: "#3b82f6",
    BookingStatus.due_in: "#f59e0b",
    BookingStatus.checked_in: "#10b981",
    BookingStatus.due_out: "#f97316",
    BookingStatus.checked_out: "#6b7280",
    BookingStatus.booking_offer: "#8b5cf6",
    BookingStatus.out_of_order: "#ef4444",
    BookingStatus.cancelled: "#d1d5db",
}


class BookingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = BookingRepository(db)
        self.rooms = RoomRepository(db)
        self.guests = GuestRepository(db)

    async def get(self, booking_id) -> Booking:
        booking = await self.repo.get_or_none(booking_id)
        if booking is None:
            raise NotFoundError("Booking not found")
        return booking

    async def _generate_ref(self) -> str:
        year = datetime.now(timezone.utc).year
        seq = await self.repo.next_sequence(year)
        return f"HT-B{year}-{seq:05d}"

    async def _price_for(self, room_id: int, check_in: date, check_out: date) -> Decimal:
        room = await self.rooms.get_or_none(room_id)
        if room is None:
            raise NotFoundError("Room not found")
        nights = max((check_out - check_in).days, 0)
        return (room.price_per_night * nights).quantize(Decimal("0.01"))

    async def list(
        self, *, status, platform, room_type, date_from, date_to,
        guest_name, booking_ref, offset, limit,
    ) -> tuple[list[Booking], int]:
        from app.models.guest import Guest
        from app.models.room import Room
        from sqlalchemy import or_, select, func

        conditions = [Booking.is_deleted.is_(False)]
        if status is not None:
            conditions.append(Booking.status == status)
        if platform is not None:
            conditions.append(Booking.platform == platform)
        if booking_ref:
            conditions.append(Booking.booking_ref.ilike(f"%{booking_ref}%"))
        if date_from is not None:
            conditions.append(Booking.check_in >= date_from)
        if date_to is not None:
            conditions.append(Booking.check_out <= date_to)

        stmt = select(Booking)
        count_stmt = select(func.count()).select_from(Booking)
        if room_type is not None:
            stmt = stmt.join(Room, Room.id == Booking.room_id).where(
                Room.type == room_type
            )
            count_stmt = count_stmt.join(Room, Room.id == Booking.room_id).where(
                Room.type == room_type
            )
        if guest_name:
            like = f"%{guest_name}%"
            stmt = stmt.join(Guest, Guest.id == Booking.guest_id).where(
                or_(Guest.first_name.ilike(like), Guest.last_name.ilike(like))
            )
            count_stmt = count_stmt.join(Guest, Guest.id == Booking.guest_id).where(
                or_(Guest.first_name.ilike(like), Guest.last_name.ilike(like))
            )
        for cond in conditions:
            stmt = stmt.where(cond)
            count_stmt = count_stmt.where(cond)
        stmt = stmt.order_by(Booking.created_at.desc()).offset(offset).limit(limit)
        items = (await self.db.execute(stmt)).scalars().unique().all()
        total = int((await self.db.execute(count_stmt)).scalar_one())
        return list(items), total

    async def create(self, payload: BookingCreate, created_by: int | None) -> Booking:
        if await self.guests.get_or_none(payload.guest_id) is None:
            raise NotFoundError("Guest not found")
        if await self.rooms.get_or_none(payload.room_id) is None:
            raise NotFoundError("Room not found")
        if await self.rooms.has_conflict(
            payload.room_id, payload.check_in, payload.check_out
        ):
            raise ConflictError("Room is not available for the selected dates")

        total_price = await self._price_for(
            payload.room_id, payload.check_in, payload.check_out
        )
        booking = Booking(
            booking_ref=await self._generate_ref(),
            guest_id=payload.guest_id,
            room_id=payload.room_id,
            check_in=payload.check_in,
            check_out=payload.check_out,
            adults=payload.adults,
            children=payload.children,
            total_price=total_price,
            status=payload.status,
            platform=payload.platform,
            notes=payload.notes,
            created_by=created_by,
        )
        await self.repo.create(booking)
        await self.db.commit()
        await self.db.refresh(booking)

        # Auto-send confirmation email to guest
        guest = await self.guests.get_or_none(payload.guest_id)
        if guest is not None:
            await NotificationService(self.db).send_email_notification(
                recipient_email=guest.email,
                subject=f"Booking confirmation {booking.booking_ref}",
                message=(
                    f"Dear {guest.full_name}, your booking {booking.booking_ref} "
                    f"from {booking.check_in} to {booking.check_out} is confirmed."
                ),
                related_entity=RelatedEntity.booking,
                related_id=str(booking.id),
            )
            await self.db.commit()
        return booking

    async def update(self, booking_id, payload: BookingUpdate) -> Booking:
        booking = await self.get(booking_id)
        data = payload.model_dump(exclude_unset=True)
        new_room = data.get("room_id", booking.room_id)
        new_in = data.get("check_in", booking.check_in)
        new_out = data.get("check_out", booking.check_out)
        if new_out <= new_in:
            raise BadRequestError("check_out must be after check_in")
        if (
            "room_id" in data or "check_in" in data or "check_out" in data
        ) and await self.rooms.has_conflict(
            new_room, new_in, new_out, exclude_booking_id=booking.id
        ):
            raise ConflictError("Room is not available for the selected dates")
        for key, value in data.items():
            setattr(booking, key, value)
        booking.total_price = await self._price_for(new_room, new_in, new_out)
        await self.repo.save(booking)
        await self.db.commit()
        await self.db.refresh(booking)
        return booking

    async def update_status(self, booking_id, payload: BookingStatusUpdate) -> Booking:
        booking = await self.get(booking_id)
        booking.status = payload.status
        await self.repo.save(booking)
        await self.db.commit()
        await self.db.refresh(booking)
        return booking

    async def cancel(self, booking_id) -> None:
        booking = await self.get(booking_id)
        booking.status = BookingStatus.cancelled
        booking.is_deleted = True
        booking.deleted_at = datetime.now(timezone.utc)
        await self.repo.save(booking)
        await self.db.commit()

    async def _set_room_status(self, room_id: int, status: RoomStatus) -> None:
        room = await self.rooms.get_or_none(room_id)
        if room is not None:
            room.status = status
            await self.rooms.save(room)

    async def check_in(self, booking_id) -> Booking:
        booking = await self.get(booking_id)
        booking.status = BookingStatus.checked_in
        await self._set_room_status(booking.room_id, RoomStatus.occupied)
        await self.repo.save(booking)
        await self.db.commit()
        await self.db.refresh(booking)
        return booking

    async def check_out(self, booking_id):
        booking = await self.get(booking_id)
        booking.status = BookingStatus.checked_out
        await self._set_room_status(booking.room_id, RoomStatus.need_ready)
        await self.repo.save(booking)
        await self.db.flush()
        # Auto-generate invoice
        invoice = await InvoiceService(self.db).create_from_booking(
            booking, commit=False
        )
        # Increment guest stays + refresh loyalty tier
        from app.services.guest import compute_loyalty_tier
        guest = await self.guests.get_or_none(booking.guest_id)
        if guest is not None:
            guest.total_stays = (guest.total_stays or 0) + 1
            guest.loyalty_tier = compute_loyalty_tier(guest.total_stays)
            await self.guests.save(guest)
        await self.db.commit()
        await self.db.refresh(booking)
        await self.db.refresh(invoice)
        return booking, invoice

    async def today(self, day: date) -> dict:
        checkins = await self.repo.checkins_on(day)
        checkouts = await self.repo.checkouts_on(day)
        return {"check_ins": checkins, "check_outs": checkouts}

    async def search(self, term: str) -> list[Booking]:
        return await self.repo.search(term)

    async def gantt(
        self, start: date, end: date, room_type: RoomType | None
    ) -> dict:
        from datetime import timedelta

        rooms = await self.rooms.list(
            conditions=([] if room_type is None else None),
            offset=0, limit=1000,
            order_by=None,
        ) if room_type is None else await self.rooms.list(
            conditions=None, offset=0, limit=1000,
        )
        # Filter rooms by type if requested
        all_rooms = await self.rooms.list(offset=0, limit=1000)
        if room_type is not None:
            all_rooms = [r for r in all_rooms if r.type == room_type]

        bookings = await self.repo.in_range(start, end, room_type)
        by_room: dict[int, list] = {}
        for b in bookings:
            guest = await b.awaitable_attrs.guest
            by_room.setdefault(b.room_id, []).append({
                "id": b.id,
                "guest_name": guest.full_name if guest else "",
                "check_in": b.check_in,
                "check_out": b.check_out,
                "status": b.status,
                "color": _STATUS_COLORS.get(b.status, "#9ca3af"),
            })

        gantt_rooms = [
            {
                "id": r.id,
                "number": r.room_number,
                "type": r.type.value,
                "bookings": by_room.get(r.id, []),
            }
            for r in all_rooms
        ]

        # availability_counts: per date, available rooms per type
        availability_counts: dict[str, dict[str, int]] = {}
        day = start
        while day < end:
            avail = await self.rooms.available_rooms(day, day + timedelta(days=1), room_type)
            counts: dict[str, int] = {}
            for r in avail:
                counts[r.type.value] = counts.get(r.type.value, 0) + 1
            availability_counts[day.isoformat()] = counts
            day += timedelta(days=1)

        return {"rooms": gantt_rooms, "availability_counts": availability_counts}
