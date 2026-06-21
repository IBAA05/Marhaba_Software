"""Expense ORM model (financials module)."""
from __future__ import annotations

from datetime import date
from decimal import Decimal

from sqlalchemy import (
    Date,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.enums import ExpenseCategory, ExpenseStatus
from app.database import Base
from app.models.base import IntPKMixin, TimestampMixin


class Expense(Base, IntPKMixin, TimestampMixin):
    __tablename__ = "expenses"

    name: Mapped[str] = mapped_column(String(120), nullable=False)
    category: Mapped[ExpenseCategory] = mapped_column(
        SAEnum(ExpenseCategory, name="expense_category"),
        default=ExpenseCategory.miscellaneous,
        nullable=False,
        index=True,
    )
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), default=Decimal("0.00"), nullable=False
    )
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    status: Mapped[ExpenseStatus] = mapped_column(
        SAEnum(ExpenseStatus, name="expense_status"),
        default=ExpenseStatus.completed,
        nullable=False,
        index=True,
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
