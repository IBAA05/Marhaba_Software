"""Room repository."""
from __future__ import annotations

from datetime import date

from sqlalchemy import and_, func, not_, select

from app.core.enums import BookingStatus, RoomStatus
from app.models.booking import Booking
from app.models.room import Room
from app.repositories.base import BaseRepository

_BLOCKING_STATUSES = [
    BookingStatus.new,
    BookingStatus.confirmed,
    BookingStatus.due_in,
    BookingStatus.checked_in,
    BookingStatus.due_out,
    BookingStatus.booking_offer,
]


class RoomRepository(BaseRepository[Room]):
    model = Room
    soft_delete = True

    async def get_by_number(self, room_number: str) -> Room | None:
        stmt = select(Room).where(
            Room.room_number == room_number, Room.is_deleted.is_(False)
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def available_rooms(
        self, check_in: date, check_out: date, room_type=None
    ) -> list[Room]:
        """Rooms with no overlapping active booking for [check_in, check_out)."""
        overlap = (
            select(Booking.room_id)
            .where(
                Booking.is_deleted.is_(False),
                Booking.status.in_(_BLOCKING_STATUSES),
                and_(
                    Booking.check_in < check_out,
                    Booking.check_out > check_in,
                ),
            )
            .subquery()
        )
        stmt = select(Room).where(
            Room.is_deleted.is_(False),
            Room.status != RoomStatus.out_of_order,
            not_(Room.id.in_(select(overlap.c.room_id))),
        )
        if room_type is not None:
            stmt = stmt.where(Room.type == room_type)
        result = await self.db.execute(stmt.order_by(Room.room_number))
        return list(result.scalars().all())

    async def has_conflict(
        self, room_id: int, check_in: date, check_out: date, exclude_booking_id=None
    ) -> bool:
        stmt = select(func.count()).select_from(Booking).where(
            Booking.room_id == room_id,
            Booking.is_deleted.is_(False),
            Booking.status.in_(_BLOCKING_STATUSES),
            Booking.check_in < check_out,
            Booking.check_out > check_in,
        )
        if exclude_booking_id is not None:
            stmt = stmt.where(Booking.id != exclude_booking_id)
        result = await self.db.execute(stmt)
        return int(result.scalar_one()) > 0

    async def type_summary(self) -> list[dict]:
        stmt = select(
            Room.type,
            func.count().label("total"),
            func.sum(
                func.cast(Room.status == RoomStatus.available, type_=None)
            ),
        ).where(Room.is_deleted.is_(False)).group_by(Room.type)
        # Portable available count via conditional sum
        stmt = (
            select(Room.type, Room.status)
            .where(Room.is_deleted.is_(False))
        )
        result = await self.db.execute(stmt)
        rows = result.all()
        summary: dict = {}
        for rtype, status in rows:
            entry = summary.setdefault(rtype, {"total": 0, "available": 0})
            entry["total"] += 1
            if status == RoomStatus.available:
                entry["available"] += 1
        return [
            {"type": rtype, "total": v["total"], "available": v["available"]}
            for rtype, v in summary.items()
        ]

    async def count_by_status(self) -> dict:
        stmt = select(Room.status, func.count()).where(
            Room.is_deleted.is_(False)
        ).group_by(Room.status)
        result = await self.db.execute(stmt)
        return {status: count for status, count in result.all()}
