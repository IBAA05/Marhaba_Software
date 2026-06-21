"""User repository."""
from __future__ import annotations

from sqlalchemy import or_, select

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    model = User
    soft_delete = True

    async def get_by_username_or_email(self, identifier: str) -> User | None:
        stmt = select(User).where(
            User.is_deleted.is_(False),
            or_(User.username == identifier, User.email == identifier),
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email, User.is_deleted.is_(False))
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_by_username(self, username: str) -> User | None:
        stmt = select(User).where(
            User.username == username, User.is_deleted.is_(False)
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()
