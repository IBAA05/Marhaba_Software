"""Financials routes [super_admin only]."""
from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends
from fastapi.responses import Response

from app.core.dependencies import CurrentUser, DBSession, require_super_admin
from app.core.enums import ExpenseCategory, ExpenseStatus
from app.core.responses import ok, paginate
from app.schemas.common import PaginationParams
from app.schemas.expense import (
    CategoryBreakdown,
    EarningsPoint,
    ExpenseCreate,
    ExpenseOut,
    ExpenseUpdate,
    FinancialOverview,
    IncomeSource,
)
from app.services.expense import ExpenseService

router = APIRouter(
    prefix="/financials",
    tags=["Financials"],
    dependencies=[Depends(require_super_admin)],
)


@router.get("/overview", summary="Financial overview")
async def overview(db: DBSession):
    data = await ExpenseService(db).overview()
    return ok(FinancialOverview(**data))


@router.get("/earnings", summary="Monthly income vs expense")
async def earnings(db: DBSession, year: int | None = None):
    year = year or date.today().year
    data = await ExpenseService(db).earnings(year)
    return ok([EarningsPoint(**p) for p in data])


@router.get("/breakdown", summary="Expense breakdown by category")
async def breakdown(db: DBSession, year: int | None = None):
    year = year or date.today().year
    data = await ExpenseService(db).breakdown(year)
    return ok([CategoryBreakdown(**c) for c in data])


@router.get("/income-sources", summary="Revenue by platform source")
async def income_sources(db: DBSession, year: int | None = None):
    year = year or date.today().year
    data = await ExpenseService(db).income_sources(year)
    return ok([IncomeSource(**s) for s in data])


@router.get("/expenses", summary="List expenses")
async def list_expenses(
    db: DBSession,
    pagination: PaginationParams = Depends(),
    category: ExpenseCategory | None = None,
    status: ExpenseStatus | None = None,
    search: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
):
    items, total = await ExpenseService(db).list(
        category=category,
        status=status,
        search=search,
        date_from=date_from,
        date_to=date_to,
        offset=pagination.offset,
        limit=pagination.limit,
    )
    data = [ExpenseOut.model_validate(e) for e in items]
    return paginate(data, total=total, page=pagination.page, limit=pagination.limit)


@router.get("/expenses/export", summary="Export expenses as CSV")
async def export_expenses(
    db: DBSession,
    category: ExpenseCategory | None = None,
    status: ExpenseStatus | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
):
    csv_data = await ExpenseService(db).export_csv(
        category=category, status=status, date_from=date_from, date_to=date_to
    )
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=expenses.csv"},
    )


@router.post("/expenses", summary="Add expense")
async def create_expense(
    payload: ExpenseCreate, db: DBSession, current_user: CurrentUser
):
    expense = await ExpenseService(db).create(payload, created_by=current_user.id)
    return ok(ExpenseOut.model_validate(expense), message="Expense created")


@router.get("/expenses/{expense_id}", summary="Expense detail")
async def get_expense(expense_id: int, db: DBSession):
    expense = await ExpenseService(db).get(expense_id)
    return ok(ExpenseOut.model_validate(expense))


@router.put("/expenses/{expense_id}", summary="Update expense")
async def update_expense(expense_id: int, payload: ExpenseUpdate, db: DBSession):
    expense = await ExpenseService(db).update(expense_id, payload)
    return ok(ExpenseOut.model_validate(expense), message="Expense updated")


@router.delete("/expenses/{expense_id}", summary="Delete expense")
async def delete_expense(expense_id: int, db: DBSession):
    await ExpenseService(db).delete(expense_id)
    return ok(None, message="Expense deleted")
