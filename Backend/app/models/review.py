"""Guest review ORM model."""
from __future__ import annotations

import uuid

from sqlalchemy import Enum as SAEnum, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import ReviewSource
from app.database import Base
from app.models.base import IntPKMixin, TimestampMixin


class Review(Base, IntPKMixin, TimestampMixin):
    __tablename__ = "reviews"

    guest_id: Mapped[int] = mapped_column(
        ForeignKey("guests.id", ondelete="CASCADE"), nullable=False, index=True
    )
    booking_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("bookings.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    overall_rating: Mapped[int] = mapped_column(Integer, nullable=False)
    cleanliness: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    staff: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    comfort: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    location: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    value: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    staff_reply: Mapped[str | None] = mapped_column(Text, nullable=True)
    source: Mapped[ReviewSource] = mapped_column(
        SAEnum(ReviewSource, name="review_source"),
        default=ReviewSource.direct,
        nullable=False,
        index=True,
    )

    guest = relationship("Guest", lazy="joined")
