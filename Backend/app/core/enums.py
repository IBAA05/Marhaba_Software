"""Centralised string enums shared by models and schemas."""
from __future__ import annotations

from enum import Enum


class StrEnum(str, Enum):
    """String enum that serialises to its value."""

    def __str__(self) -> str:  # pragma: no cover
        return str(self.value)


# ── Auth / RBAC ──────────────────────────────────────────────────────────
class UserRole(StrEnum):
    super_admin = "super_admin"
    receptionist = "receptionist"


class TokenType(StrEnum):
    access = "access"
    refresh = "refresh"


# ── Rooms ────────────────────────────────────────────────────────────────
class RoomType(StrEnum):
    single = "single"
    double = "double"
    suite = "suite"
    family = "family"
    deluxe = "deluxe"


class RoomStatus(StrEnum):
    available = "available"
    occupied = "occupied"
    reserved = "reserved"
    out_of_order = "out_of_order"
    need_ready = "need_ready"
    cleaning = "cleaning"


# ── Guests ───────────────────────────────────────────────────────────────
class LoyaltyTier(StrEnum):
    none = "none"
    bronze = "bronze"
    silver = "silver"
    gold = "gold"


# ── Bookings ─────────────────────────────────────────────────────────────
class BookingStatus(StrEnum):
    new = "new"
    confirmed = "confirmed"
    due_in = "due_in"
    checked_in = "checked_in"
    due_out = "due_out"
    checked_out = "checked_out"
    booking_offer = "booking_offer"
    out_of_order = "out_of_order"
    cancelled = "cancelled"


class PlatformSource(StrEnum):
    direct = "direct"
    booking_com = "booking_com"
    airbnb = "airbnb"
    expedia = "expedia"
    agoda = "agoda"
    other = "other"


# ── Housekeeping ─────────────────────────────────────────────────────────
class TaskStatus(StrEnum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    inspected = "inspected"


class TaskType(StrEnum):
    cleaning = "cleaning"
    inspection = "inspection"
    turndown = "turndown"
    maintenance = "maintenance"
    custom = "custom"


class Priority(StrEnum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"


# ── Inventory ────────────────────────────────────────────────────────────
class InventoryCategory(StrEnum):
    linens = "linens"
    toiletries = "toiletries"
    minibar = "minibar"
    cleaning = "cleaning"
    maintenance = "maintenance"
    other = "other"


class StockStatus(StrEnum):
    sufficient = "sufficient"
    low_stock = "low_stock"
    out_of_stock = "out_of_stock"


# ── Messages ─────────────────────────────────────────────────────────────
class MessageSender(StrEnum):
    guest = "guest"
    staff = "staff"


# ── Financials ───────────────────────────────────────────────────────────
class ExpenseCategory(StrEnum):
    salaries = "salaries"
    utilities = "utilities"
    maintenance = "maintenance"
    supplies = "supplies"
    marketing = "marketing"
    miscellaneous = "miscellaneous"


class ExpenseStatus(StrEnum):
    completed = "completed"
    pending = "pending"
    cancelled = "cancelled"


# ── Invoices ─────────────────────────────────────────────────────────────
class InvoiceStatus(StrEnum):
    paid = "paid"
    pending = "pending"
    overdue = "overdue"


# ── Reviews ──────────────────────────────────────────────────────────────
class ReviewSource(StrEnum):
    direct = "direct"
    google = "google"
    tripadvisor = "tripadvisor"


# ── Concierge ────────────────────────────────────────────────────────────
class RequestType(StrEnum):
    airport_transfer = "airport_transfer"
    restaurant_reservation = "restaurant_reservation"
    spa = "spa"
    wake_up_call = "wake_up_call"
    extra_amenities = "extra_amenities"
    laundry = "laundry"
    room_service = "room_service"
    custom = "custom"


class RequestStatus(StrEnum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


# ── Notifications ────────────────────────────────────────────────────────
class NotificationType(StrEnum):
    email = "email"
    sms = "sms"
    internal = "internal"


class NotificationStatus(StrEnum):
    sent = "sent"
    failed = "failed"
    pending = "pending"


class RelatedEntity(StrEnum):
    booking = "booking"
    invoice = "invoice"
    task = "task"
    concierge = "concierge"
