"""Dashboard & calendar schemas."""
from __future__ import annotations

from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class DashboardStats(BaseModel):
    new_bookings_today: int
    checkins_today: int
    checkouts_today: int
    revenue_this_month: Decimal | None = None


class RoomAvailability(BaseModel):
    occupied: int
    reserved: int
    available: int
    need_ready: int


class RevenuePoint(BaseModel):
    month: str
    revenue: Decimal


class ReservationsPoint(BaseModel):
    date: date
    booked: int
    cancelled: int


class PlatformBreakdown(BaseModel):
    platform: str
    count: int
    percentage: float


class CalendarDay(BaseModel):
    date: date
    bookings_count: int
    checkins_count: int
    checkouts_count: int
