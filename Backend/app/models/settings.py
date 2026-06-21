"""Singleton hotel settings ORM model."""
from __future__ import annotations

from decimal import Decimal

from sqlalchemy import Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.base import IntPKMixin, TimestampMixin


class HotelSettings(Base, IntPKMixin, TimestampMixin):
    __tablename__ = "hotel_settings"

    hotel_name: Mapped[str] = mapped_column(
        String(120), default="My Hotel", nullable=False
    )
    logo_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    website: Mapped[str | None] = mapped_column(String(255), nullable=True)
    currency: Mapped[str] = mapped_column(String(8), default="USD", nullable=False)
    timezone: Mapped[str] = mapped_column(
        String(64), default="UTC", nullable=False
    )
    smtp_host: Mapped[str | None] = mapped_column(String(120), nullable=True)
    smtp_port: Mapped[int | None] = mapped_column(Numeric(6, 0), nullable=True)
    smtp_user: Mapped[str | None] = mapped_column(String(120), nullable=True)
    smtp_password: Mapped[str | None] = mapped_column(String(512), nullable=True)
    check_in_time: Mapped[str] = mapped_column(
        String(8), default="14:00", nullable=False
    )
    check_out_time: Mapped[str] = mapped_column(
        String(8), default="11:00", nullable=False
    )
    tax_rate: Mapped[Decimal] = mapped_column(
        Numeric(5, 2), default=Decimal("0.00"), nullable=False
    )
