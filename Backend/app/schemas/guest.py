"""Guest schemas."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.core.enums import LoyaltyTier
from app.schemas.common import ORMModel


class GuestBase(BaseModel):
    first_name: str = Field(max_length=80)
    last_name: str = Field(max_length=80)
    email: EmailStr
    phone: str | None = None
    nationality: str | None = None
    id_passport_number: str | None = None
    notes: str | None = None


class GuestCreate(GuestBase):
    pass


class GuestUpdate(BaseModel):
    first_name: str | None = Field(default=None, max_length=80)
    last_name: str | None = Field(default=None, max_length=80)
    email: EmailStr | None = None
    phone: str | None = None
    nationality: str | None = None
    id_passport_number: str | None = None
    notes: str | None = None


class GuestOut(ORMModel):
    id: int
    first_name: str
    last_name: str
    full_name: str
    email: EmailStr
    phone: str | None = None
    nationality: str | None = None
    id_passport_number: str | None = None
    loyalty_tier: LoyaltyTier
    total_stays: int
    notes: str | None = None
    created_at: datetime


class GuestNotify(BaseModel):
    subject: str = Field(max_length=255)
    message: str


class GuestSearchResult(ORMModel):
    id: int
    full_name: str
    email: EmailStr
    phone: str | None = None
    loyalty_tier: LoyaltyTier
