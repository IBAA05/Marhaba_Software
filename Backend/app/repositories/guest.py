"""Guest repository."""
from __future__ import annotations

from sqlalchemy import or_, select

from app.models.guest import Guest
from app.repositories.base import BaseRepository


class GuestRepository(BaseRepository[Guest]):
    model = Guest
    soft_delete = True

    async def get_by_email(self, email: str) -> Guest | None:
        stmt = select(Guest).where(
            Guest.email == email, Guest.is_deleted.is_(False)
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    def search_condition(term: str):
        like = f"%{term}%"
        return or_(
            Guest.first_name.ilike(like),
            Guest.last_name.ilike(like),
            Guest.email.ilike(like),
            Guest.phone.ilike(like),
        )

    async def search(self, term: str, limit: int = 10) -> list[Guest]:
        stmt = (
            select(Guest)
            .where(Guest.is_deleted.is_(False), self.search_condition(term))
            .order_by(Guest.first_name)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
