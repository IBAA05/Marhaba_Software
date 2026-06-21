"""Message schemas."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.core.enums import MessageSender
from app.schemas.common import ORMModel


class MessageCreate(BaseModel):
    content: str = Field(min_length=1)
    attachment_url: str | None = None


class MessageOut(ORMModel):
    id: int
    guest_id: int
    sender: MessageSender
    staff_user_id: int | None = None
    content: str
    is_read: bool
    is_flagged: bool
    attachment_url: str | None = None
    sent_at: datetime


class ConversationSummary(BaseModel):
    guest_id: int
    guest_name: str
    last_message: str | None = None
    last_sent_at: datetime | None = None
    unread_count: int = 0
    is_flagged: bool = False


class UnreadCount(BaseModel):
    unread: int
