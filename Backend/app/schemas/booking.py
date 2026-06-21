"""Booking schemas."""
from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field, model_validator

from app.core.enums import BookingStatus, PlatformSource
from app.schemas.common import ORMModel
from app.schemas.guest import GuestOut
from app.schemas.room import RoomOut


class BookingBase(BaseModel):
    guest_id: int
    room_id: int
    check_in: date
    check_out: date
    adults: int = Field(default=1, ge=1)
    children: int = Field(default=0, ge=0)
    platform: PlatformSource = PlatformSource.direct
    notes: str | None = None

    @model_validator(mode="after")
    def _check_dates(self):
        if self.check_out <= self.check_in:
            raise ValueError("check_out must be after check_in")
        return self


class BookingCreate(BookingBase):
    status: BookingStatus = BookingStatus.new


class BookingUpdate(BaseModel):
    room_id: int | None = None
    check_in: date | None = None
    check_out: date | None = None
    adults: int | None = Field(default=None, ge=1)
    children: int | None = Field(default=None, ge=0)
    status: BookingStatus | None = None
    platform: PlatformSource | None = None
    notes: str | None = None


class BookingStatusUpdate(BaseModel):
    status: BookingStatus


class BookingOut(ORMModel):
    id: uuid.UUID
    booking_ref: str
    guest_id: int
    room_id: int
    check_in: date
    check_out: date
    nights: int
    adults: int
    children: int
    total_price: Decimal
    status: BookingStatus
    platform: PlatformSource
    notes: str | None = None
    created_by: int | None = None
    created_at: datetime
    updated_at: datetime


class BookingDetail(BookingOut):
    guest: GuestOut | None = None
    room: RoomOut | None = None


class GanttBooking(BaseModel):
    id: uuid.UUID
    guest_name: str
    check_in: date
    check_out: date
    status: BookingStatus
    color: str


class GanttRoom(BaseModel):
    id: int
    number: str
    type: str
    bookings: list[GanttBooking] = Field(default_factory=list)


class GanttResponse(BaseModel):
    rooms: list[GanttRoom]
    availability_counts: dict[str, dict[str, int]]
