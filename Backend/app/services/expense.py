"""Financials / expense business logic."""
from __future__ import annotations

import csv
import io
from calendar import month_abbr, monthrange
from datetime import date, datetime, timezone
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import BookingStatus, ExpenseStatus, InvoiceStatus
from app.core.exceptions import NotFoundError
from app.models.booking import Booking
from app.models.expense import Expense
from app.models.invoice import Invoice
from app.repositories.expense import ExpenseRepository
from app.schemas.expense import ExpenseCreate, ExpenseUpdate


def _q(value) -> Decimal:
    return Decimal(str(value or 0)).quantize(Decimal("0.01"))


class ExpenseService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ExpenseRepository(db)

    # ── expense CRUD ───────────────────────────────────────────────
    async def get(self, expense_id: int) -> Expense:
        expense = await self.repo.get_or_none(expense_id)
        if expense is None:
            raise NotFoundError("Expense not found")
        return expense

    async def list(
        self, *, category, status, search, date_from, date_to, offset, limit
    ) -> tuple[list[Expense], int]:
        conditions = []
        if category is not None:
            conditions.append(Expense.category == category)
        if status is not None:
            conditions.append(Expense.status == status)
        if search:
            conditions.append(Expense.name.ilike(f"%{search}%"))
        if date_from is not None:
            conditions.append(Expense.date >= date_from)
        if date_to is not None:
            conditions.append(Expense.date <= date_to)
        items = await self.repo.list(
            conditions=conditions, offset=offset, limit=limit,
            order_by=Expense.date.desc(),
        )
        total = await self.repo.count(conditions=conditions)
        return list(items), total

    async def create(self, payload: ExpenseCreate, created_by: int) -> Expense:
        expense = Expense(**payload.model_dump(), created_by=created_by)
        await self.repo.create(expense)
        await self.db.commit()
        await self.db.refresh(expense)
        return expense

    async def update(self, expense_id: int, payload: ExpenseUpdate) -> Expense:
        expense = await self.get(expense_id)
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(expense, key, value)
        await self.repo.save(expense)
        await self.db.commit()
        await self.db.refresh(expense)
        return expense

    async def delete(self, expense_id: int) -> None:
        expense = await self.get(expense_id)
        await self.repo.delete(expense)
        await self.db.commit()

    async def export_csv(self) -> str:
        items = await self.repo.list(offset=0, limit=100000,
                                     order_by=Expense.date.desc())
        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow(
            ["id", "name", "category", "quantity", "amount", "date", "status"]
        )
        for e in items:
            writer.writerow([
                e.id, e.name, e.category.value, e.quantity,
                f"{e.amount:.2f}", e.date, e.status.value,
            ])
        return buffer.getvalue()

    # ── income helpers ───────────────────────────────────────────
    async def _income_between(self, start: date, end: date) -> Decimal:
        stmt = select(func.coalesce(func.sum(Invoice.total), 0)).where(
            Invoice.status == InvoiceStatus.paid,
            func.date(Invoice.issued_at) >= start,
            func.date(Invoice.issued_at) <= end,
        )
        result = await self.db.execute(stmt)
        return _q(result.scalar_one())

    async def overview(self) -> dict:
        today = datetime.now(timezone.utc).date()
        start = today.replace(day=1)
        end = today.replace(day=monthrange(today.year, today.month)[1])
        income = await self._income_between(start, end)
        expenses = _q(await self.repo.total_between(start, end))
        return {
            "total_balance": _q(income - expenses),
            "total_income": income,
            "total_expenses": expenses,
            "period": today.strftime("%Y-%m"),
        }

    async def earnings(self, year: int) -> list[dict]:
        expense_months = await self.repo.monthly_totals(year)
        # income per month from paid invoices
        stmt = (
            select(
                func.extract("month", Invoice.issued_at).label("m"),
                func.coalesce(func.sum(Invoice.total), 0),
            )
            .where(
                Invoice.status == InvoiceStatus.paid,
                func.extract("year", Invoice.issued_at) == year,
            )
            .group_by("m")
        )
        result = await self.db.execute(stmt)
        income_months = {int(m): float(t) for m, t in result.all()}
        out = []
        for month in range(1, 13):
            out.append({
                "month": month_abbr[month],
                "income": _q(income_months.get(month, 0)),
                "expense": _q(expense_months.get(month, 0)),
            })
        return out

    async def breakdown(self, year: int) -> list[dict]:
        start = date(year, 1, 1)
        end = date(year, 12, 31)
        rows = await self.repo.by_category(start, end)
        total = sum(float(amount) for _, amount in rows) or 1.0
        return [
            {
                "category": cat.value,
                "amount": _q(amount),
                "percentage": round(float(amount) / total * 100, 2),
            }
            for cat, amount in rows
        ]

    async def income_sources(self, year: int) -> list[dict]:
        stmt = (
            select(
                Booking.platform,
                func.coalesce(func.sum(Booking.total_price), 0),
            )
            .where(
                Booking.is_deleted.is_(False),
                func.extract("year", Booking.created_at) == year,
            )
            .group_by(Booking.platform)
        )
        result = await self.db.execute(stmt)
        rows = result.all()
        total = sum(float(amount) for _, amount in rows) or 1.0
        return [
            {
                "platform": platform.value,
                "amount": _q(amount),
                "percentage": round(float(amount) / total * 100, 2),
            }
            for platform, amount in rows
        ]
