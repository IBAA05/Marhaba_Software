"""Standard response envelope helpers and pagination model."""
from __future__ import annotations

import math
from typing import Any, Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class PaginationMeta(BaseModel):
    page: int
    limit: int
    total: int
    pages: int
    has_next: bool
    has_prev: bool

    @classmethod
    def build(cls, *, page: int, limit: int, total: int) -> "PaginationMeta":
        pages = math.ceil(total / limit) if limit else 0
        return cls(
            page=page,
            limit=limit,
            total=total,
            pages=pages,
            has_next=page < pages,
            has_prev=page > 1,
        )


class Envelope(BaseModel, Generic[T]):
    """Standard response envelope used by every endpoint."""

    success: bool = True
    data: T | None = None
    message: str = "OK"
    pagination: PaginationMeta | None = None


def ok(
    data: Any = None,
    message: str = "OK",
    pagination: PaginationMeta | None = None,
) -> dict[str, Any]:
    """Build a success envelope dict."""
    payload: dict[str, Any] = {"success": True, "data": data, "message": message}
    if pagination is not None:
        payload["pagination"] = pagination.model_dump()
    return payload


def paginate(
    data: Any,
    *,
    total: int,
    page: int,
    limit: int,
    message: str = "OK",
) -> dict[str, Any]:
    """Build a paginated success envelope."""
    meta = PaginationMeta.build(page=page, limit=limit, total=total)
    return ok(data, message=message, pagination=meta)


def fail(message: str, data: Any = None) -> dict[str, Any]:
    return {"success": False, "data": data, "message": message}
