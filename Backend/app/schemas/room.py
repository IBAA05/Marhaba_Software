"""Room schemas."""
from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.core.enums import RoomStatus, RoomType
from app.schemas.common import ORMModel


class RoomBase(BaseModel):
    room_number: str = Field(max_length=20)
    type: RoomType
    floor: int = 0
    price_per_night: Decimal = Field(ge=0, max_digits=10, decimal_places=2)
    max_occupancy: int = Field(default=2, ge=1)
    description: str | None = None
    amenities: list[str] = Field(default_factory=list)
    photos: list[str] = Field(default_factory=list)
    has_panorama: bool = False


class RoomCreate(RoomBase):
    status: RoomStatus = RoomStatus.available


class RoomUpdate(BaseModel):
    room_number: str | None = Field(default=None, max_length=20)
    type: RoomType | None = None
    floor: int | None = None
    price_per_night: Decimal | None = Field(
        default=None, ge=0, max_digits=10, decimal_places=2
    )
    max_occupancy: int | None = Field(default=None, ge=1)
    description: str | None = None
    amenities: list[str] | None = None
    photos: list[str] | None = None
    has_panorama: bool | None = None
    status: RoomStatus | None = None


class RoomStatusUpdate(BaseModel):
    status: RoomStatus


class RoomOut(ORMModel):
    id: int
    room_number: str
    type: RoomType
    floor: int
    price_per_night: Decimal
    max_occupancy: int
    description: str | None = None
    amenities: list[str] = Field(default_factory=list)
    photos: list[str] = Field(default_factory=list)
    has_panorama: bool
    status: RoomStatus
    created_at: datetime


class RoomTypeSummary(BaseModel):
    type: RoomType
    total: int
    available: int
