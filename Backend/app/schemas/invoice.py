"""Invoice schemas."""
from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.core.enums import InvoiceStatus
from app.schemas.common import ORMModel


class InvoiceCreate(BaseModel):
    booking_id: uuid.UUID | None = None
    guest_id: int
    room_charges: Decimal = Field(default=Decimal("0.00"), ge=0, max_digits=10, decimal_places=2)
    extras: Decimal = Field(default=Decimal("0.00"), ge=0, max_digits=10, decimal_places=2)
    tax: Decimal = Field(default=Decimal("0.00"), ge=0, max_digits=10, decimal_places=2)
    discount: Decimal = Field(default=Decimal("0.00"), ge=0, max_digits=10, decimal_places=2)
    due_date: datetime | None = None
    status: InvoiceStatus = InvoiceStatus.pending


class InvoiceUpdate(BaseModel):
    room_charges: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=2)
    extras: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=2)
    tax: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=2)
    discount: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=2)
    due_date: datetime | None = None
    status: InvoiceStatus | None = None


class InvoiceOut(ORMModel):
    id: int
    invoice_ref: str
    booking_id: uuid.UUID | None = None
    guest_id: int
    room_charges: Decimal
    extras: Decimal
    tax: Decimal
    discount: Decimal
    total: Decimal
    status: InvoiceStatus
    issued_at: datetime | None = None
    due_date: datetime | None = None
    paid_at: datetime | None = None
    created_at: datetime
