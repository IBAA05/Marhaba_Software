"""Notification schemas."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel

from app.core.enums import NotificationStatus, NotificationType, RelatedEntity
from app.schemas.common import ORMModel


class NotificationOut(ORMModel):
    id: int
    type: NotificationType
    recipient_email: str | None = None
    subject: str | None = None
    message: str
    status: NotificationStatus
    related_entity: RelatedEntity | None = None
    related_id: str | None = None
    is_read: bool
    sent_at: datetime | None = None
    created_at: datetime
