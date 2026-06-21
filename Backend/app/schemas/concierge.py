"""Concierge schemas."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.core.enums import Priority, RequestStatus, RequestType
from app.schemas.common import ORMModel


class ConciergeCreate(BaseModel):
    guest_id: int
    booking_id: uuid.UUID | None = None
    request_type: RequestType
    description: str | None = None
    priority: Priority = Priority.medium
    assigned_to: int | None = None
    scheduled_at: datetime | None = None
    notes: str | None = None


class ConciergeUpdate(BaseModel):
    request_type: RequestType | None = None
    description: str | None = None
    priority: Priority | None = None
    assigned_to: int | None = None
    scheduled_at: datetime | None = None
    status: RequestStatus | None = None
    notes: str | None = None


class ConciergeStatusUpdate(BaseModel):
    status: RequestStatus


class ConciergeOut(ORMModel):
    id: int
    guest_id: int
    booking_id: uuid.UUID | None = None
    request_type: RequestType
    description: str | None = None
    priority: Priority
    assigned_to: int | None = None
    status: RequestStatus
    scheduled_at: datetime | None = None
    completed_at: datetime | None = None
    notes: str | None = None
    created_at: datetime


class PendingCount(BaseModel):
    pending: int
