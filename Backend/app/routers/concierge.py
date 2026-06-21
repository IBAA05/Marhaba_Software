"""Concierge routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.dependencies import CurrentUser, DBSession
from app.core.enums import Priority, RequestStatus, RequestType
from app.core.responses import ok, paginate
from app.schemas.common import PaginationParams
from app.schemas.concierge import (
    ConciergeCreate,
    ConciergeOut,
    ConciergeStatusUpdate,
    ConciergeUpdate,
    PendingCount,
)
from app.services.concierge import ConciergeService

router = APIRouter(prefix="/concierge", tags=["Concierge"])


@router.get("", summary="List concierge requests")
async def list_requests(
    db: DBSession,
    _: CurrentUser,
    pagination: PaginationParams = Depends(),
    request_type: RequestType | None = None,
    status: RequestStatus | None = None,
    priority: Priority | None = None,
    guest_id: int | None = None,
):
    items, total = await ConciergeService(db).list(
        request_type=request_type,
        status=status,
        priority=priority,
        guest_id=guest_id,
        offset=pagination.offset,
        limit=pagination.limit,
    )
    data = [ConciergeOut.model_validate(r) for r in items]
    return paginate(data, total=total, page=pagination.page, limit=pagination.limit)


@router.get("/pending", summary="Count of pending requests")
async def pending(db: DBSession, _: CurrentUser):
    count = await ConciergeService(db).pending_count()
    return ok(PendingCount(pending=count))


@router.post("", summary="Create concierge request")
async def create_request(payload: ConciergeCreate, db: DBSession, _: CurrentUser):
    request = await ConciergeService(db).create(payload)
    return ok(ConciergeOut.model_validate(request), message="Request created")


@router.get("/{request_id}", summary="Request detail")
async def get_request(request_id: int, db: DBSession, _: CurrentUser):
    request = await ConciergeService(db).get(request_id)
    return ok(ConciergeOut.model_validate(request))


@router.put("/{request_id}", summary="Update request")
async def update_request(
    request_id: int, payload: ConciergeUpdate, db: DBSession, _: CurrentUser
):
    request = await ConciergeService(db).update(request_id, payload)
    return ok(ConciergeOut.model_validate(request), message="Request updated")


@router.put("/{request_id}/status", summary="Update request status")
async def update_status(
    request_id: int, payload: ConciergeStatusUpdate, db: DBSession, _: CurrentUser
):
    request = await ConciergeService(db).update_status(request_id, payload)
    return ok(ConciergeOut.model_validate(request), message="Status updated")


@router.post("/{request_id}/notify", summary="Notify guest request fulfilled")
async def notify(request_id: int, db: DBSession, _: CurrentUser):
    sent = await ConciergeService(db).notify(request_id)
    return ok({"sent": sent}, message="Guest notified")


@router.delete("/{request_id}", summary="Cancel request")
async def cancel_request(request_id: int, db: DBSession, _: CurrentUser):
    request = await ConciergeService(db).cancel(request_id)
    return ok(ConciergeOut.model_validate(request), message="Request cancelled")
