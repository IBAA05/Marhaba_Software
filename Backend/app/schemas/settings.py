"""Hotel settings schemas."""
from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, EmailStr, Field

from app.schemas.common import ORMModel


class SettingsUpdate(BaseModel):
    hotel_name: str | None = None
    logo_url: str | None = None
    address: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    website: str | None = None
    currency: str | None = None
    timezone: str | None = None
    smtp_host: str | None = None
    smtp_port: int | None = None
    smtp_user: str | None = None
    smtp_password: str | None = None
    check_in_time: str | None = None
    check_out_time: str | None = None
    tax_rate: Decimal | None = Field(default=None, ge=0, max_digits=5, decimal_places=2)


class SettingsOut(ORMModel):
    id: int
    hotel_name: str
    logo_url: str | None = None
    address: str | None = None
    phone: str | None = None
    email: str | None = None
    website: str | None = None
    currency: str
    timezone: str
    smtp_host: str | None = None
    smtp_port: int | None = None
    smtp_user: str | None = None
    # smtp_password is intentionally never returned
    check_in_time: str
    check_out_time: str
    tax_rate: Decimal
    updated_at: datetime
