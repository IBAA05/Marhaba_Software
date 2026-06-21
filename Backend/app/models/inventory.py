"""Inventory item ORM model."""
from __future__ import annotations

from datetime import date

from sqlalchemy import Date, Enum as SAEnum, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.enums import InventoryCategory
from app.database import Base
from app.models.base import IntPKMixin, TimestampMixin


class InventoryItem(Base, IntPKMixin, TimestampMixin):
    __tablename__ = "inventory_items"

    name: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    category: Mapped[InventoryCategory] = mapped_column(
        SAEnum(InventoryCategory, name="inventory_category"),
        default=InventoryCategory.other,
        nullable=False,
        index=True,
    )
    quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    unit: Mapped[str] = mapped_column(String(40), default="pieces", nullable=False)
    reorder_level: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_restocked: Mapped[date | None] = mapped_column(Date, nullable=True)
    supplier: Mapped[str | None] = mapped_column(String(120), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
