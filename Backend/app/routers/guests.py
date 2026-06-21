"""Guests routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.core.dependencies import CurrentUser, DBSession
from app.core.responses import ok, paginate
from app.schemas.booking import BookingOut
from app.schemas.common import PaginationParams
from app.schemas.guest import (
    GuestCreate,
    GuestNotify,
    GuestOut,
    GuestSearchResult,
    GuestUpdate,
)
from app.schemas.invoice import InvoiceOut
from app.services.booking import BookingService
from app.services.guest import GuestService
from app.services.invoice import InvoiceService

router = APIRouter(prefix="/guests", tags=["Guests"])


@router.get("", summary="List guests")
async def list_guests(
    db: DBSession,
    _: CurrentUser,
    pagination: PaginationParams = Depends(),
    search: str | None = None,
):
    items, total = await GuestService(db).list(
        search=search, offset=pagination.offset, limit=pagination.limit
    )
    data = [GuestOut.model_validate(g) for g in items]
    return paginate(data, total=total, page=pagination.page, limit=pagination.limit)


@router.get("/search", summary="Quick guest search (autocomplete)")
async def search_guests(db: DBSession, _: CurrentUser, q: str = Query(...)):
    guests = await GuestService(db).search(q)
    return ok([GuestSearchResult.model_validate(g) for g in guests])


@router.post("", summary="Create guest")
async def create_guest(payload: GuestCreate, db: DBSession, _: CurrentUser):
    guest = await GuestService(db).create(payload)
    return ok(GuestOut.model_validate(guest), message="Guest created")


@router.get("/{guest_id}", summary="Guest detail")
async def get_guest(guest_id: int, db: DBSession, _: CurrentUser):
    guest = await GuestService(db).get(guest_id)
    return ok(GuestOut.model_validate(guest))


@router.put("/{guest_id}", summary="Update guest")
async def update_guest(
    guest_id: int, payload: GuestUpdate, db: DBSession, _: CurrentUser
):
    guest = await GuestService(db).update(guest_id, payload)
    return ok(GuestOut.model_validate(guest), message="Guest updated")


@router.delete("/{guest_id}", summary="Soft delete guest")
async def delete_guest(guest_id: int, db: DBSession, _: CurrentUser):
    await GuestService(db).soft_delete(guest_id)
    return ok(None, message="Guest deleted")


@router.get("/{guest_id}/bookings", summary="Guest booking history")
async def guest_bookings(guest_id: int, db: DBSession, _: CurrentUser):
    await GuestService(db).get(guest_id)
    bookings = await BookingService(db).repo.for_guest(guest_id)
    return ok([BookingOut.model_validate(b) for b in bookings])


@router.get("/{guest_id}/invoices", summary="Guest invoices")
async def guest_invoices(guest_id: int, db: DBSession, _: CurrentUser):
    await GuestService(db).get(guest_id)
    invoices = await InvoiceService(db).for_guest(guest_id)
    return ok([InvoiceOut.model_validate(i) for i in invoices])


@router.post("/{guest_id}/notify", summary="Email a guest")
async def notify_guest(
    guest_id: int, payload: GuestNotify, db: DBSession, _: CurrentUser
):
    sent = await GuestService(db).notify(guest_id, payload)
    return ok({"sent": sent}, message="Notification processed")
