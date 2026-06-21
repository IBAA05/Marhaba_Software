"""Notification repository."""
from __future__ import annotations

from sqlalchemy import select

from app.core.enums import NotificationType
from app.models.notification import Notification
from app.repositories.base import BaseRepository


class NotificationRepository(BaseRepository[Notification]):
    model = Notification
    soft_delete = False

    async def unread_internal(self) -> list[Notification]:
        stmt = (
            select(Notification)
            .where(
                Notification.type == NotificationType.internal,
                Notification.is_read.is_(False),
            )
            .order_by(Notification.created_at.desc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
