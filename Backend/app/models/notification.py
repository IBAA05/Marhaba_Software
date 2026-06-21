"""Notification log ORM model."""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum as SAEnum,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.enums import NotificationStatus, NotificationType, RelatedEntity
from app.database import Base
from app.models.base import IntPKMixin, TimestampMixin


class Notification(Base, IntPKMixin, TimestampMixin):
    __tablename__ = "notifications"

    type: Mapped[NotificationType] = mapped_column(
        SAEnum(NotificationType, name="notification_type"),
        default=NotificationType.internal,
        nullable=False,
    )
    recipient_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    subject: Mapped[str | None] = mapped_column(String(255), nullable=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[NotificationStatus] = mapped_column(
        SAEnum(NotificationStatus, name="notification_status"),
        default=NotificationStatus.pending,
        nullable=False,
        index=True,
    )
    related_entity: Mapped[RelatedEntity | None] = mapped_column(
        SAEnum(RelatedEntity, name="related_entity"), nullable=True
    )
    related_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sent_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
