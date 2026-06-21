"""Housekeeping task ORM model."""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import Priority, TaskStatus, TaskType
from app.database import Base
from app.models.base import IntPKMixin, TimestampMixin


class HousekeepingTask(Base, IntPKMixin, TimestampMixin):
    __tablename__ = "housekeeping_tasks"

    room_id: Mapped[int] = mapped_column(
        ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False, index=True
    )
    assigned_to: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    task_type: Mapped[TaskType] = mapped_column(
        SAEnum(TaskType, name="task_type"), default=TaskType.cleaning, nullable=False
    )
    priority: Mapped[Priority] = mapped_column(
        SAEnum(Priority, name="task_priority"),
        default=Priority.medium,
        nullable=False,
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[TaskStatus] = mapped_column(
        SAEnum(TaskStatus, name="task_status"),
        default=TaskStatus.pending,
        nullable=False,
        index=True,
    )
    due_time: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, index=True
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    room = relationship("Room", lazy="joined")
    assignee = relationship("User", lazy="joined")
