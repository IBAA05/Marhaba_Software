"""Dashboard & calendar aggregation service."""
from __future__ import annotations

import calendar as _calendar
from datetime import date, datetime, timedelta
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import PlatformSource, RoomStatus
from app.repositories.booking import BookingRepository
from app.repositories.housekeeping import HousekeepingRepository
from app.repositories.invoice import InvoiceRepository
from app.repositories.notification import NotificationRepository
from app.repositories.review import ReviewRepository
from app.repositories.room import RoomRepository

_MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]


class DashboardService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.bookings = BookingRepository(db)
        self.rooms = RoomRepository(db)
        self.invoices = InvoiceRepository(db)
        self.reviews = ReviewRepository(db)
        self.tasks = HousekeepingRepository(db)
        self.notifications = NotificationRepository(db)

    async def stats(self, include_revenue: bool = True) -> dict:
        today = date.today()
        checkins = await self.bookings.checkins_on(today)
        checkouts = await self.bookings.checkouts_on(today)
        new_today = [
            b
            for b in await self.bookings.recent(limit=100)
            if b.created_at and b.created_at.date() == today
        ]
        revenue: Decimal | None = None
        if include_revenue:
            revenue = Decimal(str(await self.invoices.total_revenue()))
        return {
            "new_bookings_today": len(new_today),
            "checkins_today": len(checkins),
            "checkouts_today": len(checkouts),
            "revenue_this_month": revenue,
        }

    async def room_availability(self) -> dict:
        rooms = await self.rooms.all_active()
        counts = {
            "occupied": 0,
            "reserved": 0,
            "available": 0,
            "need_ready": 0,
            "out_of_order": 0,
            "cleaning": 0,
        }
        for room in rooms:
            counts[room.status.value] = counts.get(room.status.value, 0) + 1
        return counts

    async def revenue_chart(self) -> list[dict]:
        today = date.today()
        points = []
        for i in range(5, -1, -1):
            month = (today.month - i - 1) % 12 + 1
            points.append({"month": _MONTHS[month - 1], "income": Decimal("0.00")})
        return points

    async def reservations_chart(self) -> list[dict]:
        today = date.today()
        points = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            created = [
                b
                for b in await self.bookings.checkins_on(day)
            ]
            points.append(
                {"date": day.isoformat(), "booked": len(created), "cancelled": 0}
            )
        return points

    async def platform_breakdown(self) -> list[dict]:
        bookings, total = await self.bookings.list(offset=0, limit=10000)
        counts: dict[str, int] = {}
        for b in bookings:
            counts[b.platform.value] = counts.get(b.platform.value, 0) + 1
        denom = total or 1
        return [
            {
                "platform": platform.value,
                "count": counts.get(platform.value, 0),
                "percentage": round(counts.get(platform.value, 0) / denom * 100, 2),
            }
            for platform in PlatformSource
        ]

    async def recent_bookings(self) -> list:
        return await self.bookings.recent(limit=5)

    async def ratings(self) -> dict:
        return await self.reviews.averages()

    async def upcoming_tasks(self) -> list:
        return await self.tasks.upcoming(limit=5)

    async def activity_feed(self) -> list[dict]:
        notifications = await self.notifications.recent(limit=15)
        return [
            {
                "type": n.type.value,
                "subject": n.subject,
                "message": n.message,
                "at": n.sent_at,
            }
            for n in notifications
        ]

    async def calendar_month(self, year: int, month: int) -> dict:
        days_in_month = _calendar.monthrange(year, month)[1]
        days = {}
        for day_num in range(1, days_in_month + 1):
            day = date(year, month, day_num)
            checkins = await self.bookings.checkins_on(day)
            checkouts = await self.bookings.checkouts_on(day)
            days[day.isoformat()] = {
                "bookings_count": len(checkins) + len(checkouts),
                "checkins_count": len(checkins),
                "checkouts_count": len(checkouts),
            }
        return {"year": year, "month": month, "days": days}

    async def calendar_day(self, day: date) -> dict:
        checkins = await self.bookings.checkins_on(day)
        checkouts = await self.bookings.checkouts_on(day)
        return {
            "date": day.isoformat(),
            "arrivals": [b.booking_ref for b in checkins],
            "departures": [b.booking_ref for b in checkouts],
            "arrivals_count": len(checkins),
            "departures_count": len(checkouts),
        }
