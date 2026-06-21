"""Room ORM model."""
from __future__ import annotations

from decimal import Decimal

from sqlalchemy import Boolean, Enum as SAEnum, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.enums import RoomStatus, RoomType
from app.database import Base
from app.models.base import IntPKMixin, SoftDeleteMixin, TimestampMixin


class Room(Base, IntPKMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "rooms"

    room_number: Mapped[str] = mapped_column(
        String(20), unique=True, index=True, nullable=False
    )
    type: Mapped[RoomType] = mapped_column(
        SAEnum(RoomType, name="room_type"), nullable=False, index=True
    )
    floor: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    price_per_night: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False, default=Decimal("0.00")
    )
    max_occupancy: Mapped[int] = mapped_column(Integer, nullable=False, default=2)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    amenities: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    photos: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    has_panorama: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    status: Mapped[RoomStatus] = mapped_column(
        SAEnum(RoomStatus, name="room_status"),
        default=RoomStatus.available,
        nullable=False,
        index=True,
    )
