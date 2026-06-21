"""Notifications routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.dependencies import CurrentUser, DBSession
from app.core.responses import ok, paginate
from app.schemas.common import PaginationParams
from app.schemas.notification import NotificationOut
from app.services.notification import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", summary="List notifications")
async def list_notifications(
    db: DBSession,
    _: CurrentUser,
    pagination: PaginationParams = Depends(),
):
    items, total = await NotificationService(db).list(
        offset=pagination.offset, limit=pagination.limit
    )
    data = [NotificationOut.model_validate(n) for n in items]
    return paginate(data, total=total, page=pagination.page, limit=pagination.limit)


@router.get("/unread", summary="Unread internal notifications")
async def unread(db: DBSession, _: CurrentUser):
    items = await NotificationService(db).unread_internal()
    return ok([NotificationOut.model_validate(n) for n in items])


@router.put("/{notification_id}/read", summary="Mark notification as read")
async def mark_read(notification_id: int, db: DBSession, _: CurrentUser):
    notification = await NotificationService(db).mark_read(notification_id)
    return ok(NotificationOut.model_validate(notification), message="Marked as read")
