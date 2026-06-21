"""Guest ORM model."""
from __future__ import annotations

from sqlalchemy import Enum as SAEnum, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.enums import LoyaltyTier
from app.database import Base
from app.models.base import IntPKMixin, SoftDeleteMixin, TimestampMixin


class Guest(Base, IntPKMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "guests"

    first_name: Mapped[str] = mapped_column(String(80), nullable=False)
    last_name: Mapped[str] = mapped_column(String(80), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    nationality: Mapped[str | None] = mapped_column(String(80), nullable=True)
    id_passport_number: Mapped[str | None] = mapped_column(
        String(80), unique=True, index=True, nullable=True
    )
    loyalty_tier: Mapped[LoyaltyTier] = mapped_column(
        SAEnum(LoyaltyTier, name="loyalty_tier"),
        default=LoyaltyTier.none,
        nullable=False,
    )
    total_stays: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()
