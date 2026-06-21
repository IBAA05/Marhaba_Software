"""Message repository."""
from __future__ import annotations

from sqlalchemy import func, select

from app.core.enums import MessageSender
from app.models.guest import Guest
from app.models.message import Message
from app.repositories.base import BaseRepository


class MessageRepository(BaseRepository[Message]):
    model = Message
    soft_delete = False

    async def conversation(self, guest_id: int) -> list[Message]:
        stmt = (
            select(Message)
            .where(Message.guest_id == guest_id)
            .order_by(Message.sent_at.asc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def conversations(self) -> list[dict]:
        """One summary row per guest with a message."""
        stmt = (
            select(Message, Guest)
            .join(Guest, Guest.id == Message.guest_id)
            .order_by(Message.sent_at.desc())
        )
        result = await self.db.execute(stmt)
        seen: dict[int, dict] = {}
        for msg, guest in result.all():
            entry = seen.get(guest.id)
            if entry is None:
                entry = {
                    "guest_id": guest.id,
                    "guest_name": guest.full_name,
                    "last_message": msg.content,
                    "last_sent_at": msg.sent_at,
                    "unread_count": 0,
                    "is_flagged": False,
                }
                seen[guest.id] = entry
            if (
                not msg.is_read
                and msg.sender == MessageSender.guest
            ):
                entry["unread_count"] += 1
            if msg.is_flagged:
                entry["is_flagged"] = True
        return list(seen.values())

    async def unread_count(self) -> int:
        stmt = select(func.count()).select_from(Message).where(
            Message.is_read.is_(False),
            Message.sender == MessageSender.guest,
        )
        result = await self.db.execute(stmt)
        return int(result.scalar_one())
