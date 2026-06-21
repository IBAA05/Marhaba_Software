"""Review schemas."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.core.enums import ReviewSource
from app.schemas.common import ORMModel

_Rating = Field(ge=1, le=5)


class ReviewCreate(BaseModel):
    guest_id: int
    booking_id: uuid.UUID | None = None
    overall_rating: int = Field(ge=1, le=5)
    cleanliness: int = Field(default=5, ge=1, le=5)
    staff: int = Field(default=5, ge=1, le=5)
    comfort: int = Field(default=5, ge=1, le=5)
    location: int = Field(default=5, ge=1, le=5)
    value: int = Field(default=5, ge=1, le=5)
    comment: str | None = None
    source: ReviewSource = ReviewSource.direct


class ReviewReply(BaseModel):
    staff_reply: str = Field(min_length=1)


class ReviewOut(ORMModel):
    id: int
    guest_id: int
    booking_id: uuid.UUID | None = None
    overall_rating: int
    cleanliness: int
    staff: int
    comfort: int
    location: int
    value: int
    comment: str | None = None
    staff_reply: str | None = None
    source: ReviewSource
    created_at: datetime


class ReviewSummary(BaseModel):
    count: int
    overall: float
    cleanliness: float
    staff: float
    comfort: float
    location: float
    value: float
