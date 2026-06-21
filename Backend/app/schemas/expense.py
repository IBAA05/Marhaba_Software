"""Expense / financials schemas."""
from __future__ import annotations

from datetime import date as date_type, datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.core.enums import ExpenseCategory, ExpenseStatus
from app.schemas.common import ORMModel


class ExpenseCreate(BaseModel):
    name: str = Field(max_length=120)
    category: ExpenseCategory = ExpenseCategory.miscellaneous
    quantity: int = Field(default=1, ge=1)
    amount: Decimal = Field(ge=0, max_digits=10, decimal_places=2)
    date: date_type
    status: ExpenseStatus = ExpenseStatus.completed
    notes: str | None = None


class ExpenseUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=120)
    category: ExpenseCategory | None = None
    quantity: int | None = Field(default=None, ge=1)
    amount: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=2)
    date: date_type | None = None
    status: ExpenseStatus | None = None
    notes: str | None = None


class ExpenseOut(ORMModel):
    id: int
    name: str
    category: ExpenseCategory
    quantity: int
    amount: Decimal
    date: date_type
    status: ExpenseStatus
    notes: str | None = None
    created_by: int | None = None
    created_at: datetime


class FinancialOverview(BaseModel):
    total_balance: Decimal
    total_income: Decimal
    total_expenses: Decimal
    period: str


class EarningsPoint(BaseModel):
    month: str
    income: Decimal
    expense: Decimal


class CategoryBreakdown(BaseModel):
    category: str
    amount: Decimal
    percentage: float


class IncomeSource(BaseModel):
    platform: str
    amount: Decimal
    percentage: float
