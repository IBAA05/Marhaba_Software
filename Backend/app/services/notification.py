"""Notification service."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import (
    NotificationStatus,
    NotificationType,
    RelatedEntity,
)
from app.core.exceptions import NotFoundError
from app.models.notification import Notification
from app.repositories.notification import NotificationRepository
from app.utils.email import send_email


class NotificationService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = NotificationRepository(db)

    async def list(
        self, *, offset: int = 0, limit: int = 20
    ) -> tuple[list[Notification], int]:
        return await self.repo.list(offset=offset, limit=limit)

    async def unread_internal(self) -> list[Notification]:
        return await self.repo.unread_internal()

    async def mark_read(self, notification_id: int) -> Notification:
        notification = await self.repo.get_or_none(notification_id)
        if notification is None:
            raise NotFoundError("Notification not found")
        notification.is_read = True
        await self.db.commit()
        await self.db.refresh(notification)
        return notification

    async def log_internal(
        self,
        subject: str,
        message: str,
        *,
        related_entity: RelatedEntity | None = None,
        related_id: str | None = None,
    ) -> Notification:
        notification = Notification(
            type=NotificationType.internal,
            subject=subject,
            message=message,
            status=NotificationStatus.sent,
            related_entity=related_entity,
            related_id=related_id,
        )
        await self.repo.add(notification)
        await self.db.commit()
        await self.db.refresh(notification)
        return notification

    async def send_email_notification(
        self,
        recipient_email: str,
        subject: str,
        message: str,
        *,
        related_entity: RelatedEntity | None = None,
        related_id: str | None = None,
    ) -> Notification:
        ok = await send_email(recipient_email, subject, message)
        notification = Notification(
            type=NotificationType.email,
            recipient_email=recipient_email,
            subject=subject,
            message=message,
            status=NotificationStatus.sent if ok else NotificationStatus.failed,
            related_entity=related_entity,
            related_id=related_id,
        )
        await self.repo.add(notification)
        await self.db.commit()
        await self.db.refresh(notification)
        return notification
