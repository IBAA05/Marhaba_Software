"""Calendar routes."""
from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Query

from app.core.dependencies import CurrentUser, DBSession
from app.core.responses import ok
from app.services.dashboard import DashboardService

router = APIRouter(prefix="/calendar", tags=["Calendar"])


@router.get("/month", summary="Per-day counts for a month")
async def month(
    db: DBSession,
    _: CurrentUser,
    year: int = Query(...),
    month: int = Query(..., ge=1, le=12),
):
    return ok(await DashboardService(db).calendar_month(year, month))


@router.get("/day", summary="Arrivals and departures for a day")
async def day(db: DBSession, _: CurrentUser, date_: date = Query(..., alias="date")):
    return ok(await DashboardService(db).calendar_day(date_))
