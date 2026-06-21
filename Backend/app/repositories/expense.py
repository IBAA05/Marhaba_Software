"""Expense repository."""
from __future__ import annotations

from datetime import date

from sqlalchemy import func, select

from app.core.enums import ExpenseStatus
from app.models.expense import Expense
from app.repositories.base import BaseRepository


class ExpenseRepository(BaseRepository[Expense]):
    model = Expense
    soft_delete = False

    async def total_between(
        self, start: date, end: date, status=ExpenseStatus.completed
    ) -> float:
        stmt = select(func.coalesce(func.sum(Expense.amount), 0)).where(
            Expense.date >= start, Expense.date <= end
        )
        if status is not None:
            stmt = stmt.where(Expense.status == status)
        result = await self.db.execute(stmt)
        return float(result.scalar_one())

    async def by_category(self, start: date, end: date) -> list[tuple]:
        stmt = (
            select(Expense.category, func.coalesce(func.sum(Expense.amount), 0))
            .where(Expense.date >= start, Expense.date <= end)
            .group_by(Expense.category)
        )
        result = await self.db.execute(stmt)
        return list(result.all())

    async def monthly_totals(self, year: int) -> dict[int, float]:
        stmt = (
            select(
                func.extract("month", Expense.date).label("m"),
                func.coalesce(func.sum(Expense.amount), 0),
            )
            .where(func.extract("year", Expense.date) == year)
            .group_by("m")
        )
        result = await self.db.execute(stmt)
        return {int(m): float(total) for m, total in result.all()}
