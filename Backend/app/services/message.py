"""Messaging business logic."""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import MessageSender, RelatedEntity
from app.core.exceptions import NotFoundError
from app.models.message import Message
from app.repositories.guest import GuestRepository
from app.repositories.message import MessageRepository
from app.schemas.message import MessageCreate
from app.services.notification import NotificationService


class MessageService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = MessageRepository(db)
        self.guests = GuestRepository(db)

    async def conversations(self, filter_: str | None) -> list[dict]:
        rows = await self.repo.conversations()
        if filter_ == "unread":
            rows = [r for r in rows if r["unread_count"] > 0]
        elif filter_ == "flagged":
            rows = [r for r in rows if r["is_flagged"]]
        return rows

    async def conversation(self, guest_id: int) -> list[Message]:
        if await self.guests.get_or_none(guest_id) is None:
            raise NotFoundError("Guest not found")
        return await self.repo.conversation(guest_id)

    async def send(
        self, guest_id: int, payload: MessageCreate, staff_user_id: int
    ) -> Message:
        guest = await self.guests.get_or_none(guest_id)
        if guest is None:
            raise NotFoundError("Guest not found")
        message = Message(
            guest_id=guest_id,
            sender=MessageSender.staff,
            staff_user_id=staff_user_id,
            content=payload.content,
            attachment_url=payload.attachment_url,
            is_read=True,
            sent_at=datetime.now(timezone.utc),
        )
        await self.repo.create(message)
        await NotificationService(self.db).send_email_notification(
            recipient_email=guest.email,
            subject="New message from the hotel",
            message=payload.content,
            related_entity=RelatedEntity.booking,
            related_id=str(guest_id),
        )
        await self.db.commit()
        await self.db.refresh(message)
        return message

    async def mark_read(self, message_id: int) -> Message:
        message = await self.repo.get_or_none(message_id)
        if message is None:
            raise NotFoundError("Message not found")
        message.is_read = True
        await self.repo.save(message)
        await self.db.commit()
        await self.db.refresh(message)
        return message

    async def toggle_flag(self, message_id: int) -> Message:
        message = await self.repo.get_or_none(message_id)
        if message is None:
            raise NotFoundError("Message not found")
        message.is_flagged = not message.is_flagged
        await self.repo.save(message)
        await self.db.commit()
        await self.db.refresh(message)
        return message

    async def delete(self, message_id: int) -> None:
        message = await self.repo.get_or_none(message_id)
        if message is None:
            raise NotFoundError("Message not found")
        await self.repo.delete(message)
        await self.db.commit()

    async def unread_count(self) -> int:
        return await self.repo.unread_count()
