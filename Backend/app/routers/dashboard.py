"""Dashboard routes."""
from __future__ import annotations

from fastapi import APIRouter

from app.core.dependencies import CurrentUser, DBSession
from app.core.enums import UserRole
from app.core.responses import ok
from app.schemas.booking import BookingOut
from app.services.dashboard import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", summary="Headline stats (revenue null for receptionist)")
async def stats(db: DBSession, current_user: CurrentUser):
    include_revenue = current_user.role == UserRole.super_admin
    data = await DashboardService(db).stats(include_revenue=include_revenue)
    return ok(data)


@router.get("/room-availability", summary="Room status counts")
async def room_availability(db: DBSession, _: CurrentUser):
    return ok(await DashboardService(db).room_availability())


@router.get("/revenue-chart", summary="Last 6 months revenue")
async def revenue_chart(db: DBSession, _: CurrentUser):
    return ok(await DashboardService(db).revenue_chart())


@router.get("/reservations-chart", summary="Last 7 days booked vs cancelled")
async def reservations_chart(db: DBSession, _: CurrentUser):
    return ok(await DashboardService(db).reservations_chart())


@router.get("/platform-breakdown", summary="Booking count and % per platform")
async def platform_breakdown(db: DBSession, _: CurrentUser):
    return ok(await DashboardService(db).platform_breakdown())


@router.get("/recent-bookings", summary="Last 5 bookings")
async def recent_bookings(db: DBSession, _: CurrentUser):
    bookings = await DashboardService(db).recent_bookings()
    return ok([BookingOut.model_validate(b) for b in bookings])


@router.get("/ratings", summary="Average ratings")
async def ratings(db: DBSession, _: CurrentUser):
    return ok(await DashboardService(db).ratings())


@router.get("/tasks", summary="Next 5 upcoming tasks")
async def tasks(db: DBSession, _: CurrentUser):
    from app.schemas.housekeeping import TaskOut

    items = await DashboardService(db).upcoming_tasks()
    return ok([TaskOut.model_validate(t) for t in items])


@router.get("/activity-feed", summary="Last 15 activities")
async def activity_feed(db: DBSession, _: CurrentUser):
    return ok(await DashboardService(db).activity_feed())
