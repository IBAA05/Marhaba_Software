"""Booking repository."""
from __future__ import annotations

from datetime import date

from sqlalchemy import func, or_, select

from app.core.enums import BookingStatus
from app.models.booking import Booking
from app.models.guest import Guest
from app.models.room import Room
from app.repositories.base import BaseRepository


class BookingRepository(BaseRepository[Booking]):
    model = Booking
    soft_delete = True

    async def get_by_ref(self, booking_ref: str) -> Booking | None:
        stmt = select(Booking).where(
            Booking.booking_ref == booking_ref, Booking.is_deleted.is_(False)
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def next_sequence(self, year: int) -> int:
        prefix = f"HT-B{year}-"
        stmt = select(func.count()).select_from(Booking).where(
            Booking.booking_ref.like(f"{prefix}%")
        )
        result = await self.db.execute(stmt)
        return int(result.scalar_one()) + 1

    async def for_guest(self, guest_id: int) -> list[Booking]:
        stmt = (
            select(Booking)
            .where(Booking.guest_id == guest_id, Booking.is_deleted.is_(False))
            .order_by(Booking.check_in.desc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().unique().all())

    async def in_range(
        self, start: date, end: date, room_type=None
    ) -> list[Booking]:
        stmt = select(Booking).where(
            Booking.is_deleted.is_(False),
            Booking.check_in < end,
            Booking.check_out > start,
        )
        if room_type is not None:
            stmt = stmt.join(Room, Room.id == Booking.room_id).where(
                Room.type == room_type
            )
        result = await self.db.execute(stmt)
        return list(result.scalars().unique().all())

    async def search(self, term: str, limit: int = 10) -> list[Booking]:
        like = f"%{term}%"
        stmt = (
            select(Booking)
            .join(Guest, Guest.id == Booking.guest_id)
            .where(
                Booking.is_deleted.is_(False),
                or_(
                    Booking.booking_ref.ilike(like),
                    Guest.first_name.ilike(like),
                    Guest.last_name.ilike(like),
                ),
            )
            .order_by(Booking.created_at.desc())
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().unique().all())

    async def checkins_on(self, day: date) -> list[Booking]:
        stmt = select(Booking).where(
            Booking.is_deleted.is_(False), Booking.check_in == day
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().unique().all())

    async def checkouts_on(self, day: date) -> list[Booking]:
        stmt = select(Booking).where(
            Booking.is_deleted.is_(False), Booking.check_out == day
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().unique().all())

    async def count_created_on(self, day: date) -> int:
        stmt = select(func.count()).select_from(Booking).where(
            Booking.is_deleted.is_(False),
            func.date(Booking.created_at) == day,
        )
        result = await self.db.execute(stmt)
        return int(result.scalar_one())
