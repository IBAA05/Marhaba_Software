"""Bookings routes."""
from __future__ import annotations

import uuid
from datetime import date

from fastapi import APIRouter, Depends, Query

from app.core.dependencies import CurrentUser, DBSession
from app.core.enums import BookingStatus, PlatformSource, RoomType
from app.core.responses import ok, paginate
from app.schemas.booking import (
    BookingCreate,
    BookingDetail,
    BookingOut,
    BookingStatusUpdate,
    BookingUpdate,
    GanttResponse,
)
from app.schemas.common import PaginationParams
from app.schemas.guest import GuestOut
from app.schemas.invoice import InvoiceOut
from app.schemas.room import RoomOut
from app.services.booking import BookingService

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.get("", summary="List bookings")
async def list_bookings(
    db: DBSession,
    _: CurrentUser,
    pagination: PaginationParams = Depends(),
    status: BookingStatus | None = None,
    platform: PlatformSource | None = None,
    room_type: RoomType | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    guest_name: str | None = None,
    booking_ref: str | None = None,
):
    items, total = await BookingService(db).list(
        status=status,
        platform=platform,
        room_type=room_type,
        date_from=date_from,
        date_to=date_to,
        guest_name=guest_name,
        booking_ref=booking_ref,
        offset=pagination.offset,
        limit=pagination.limit,
    )
    data = [BookingOut.model_validate(b) for b in items]
    return paginate(data, total=total, page=pagination.page, limit=pagination.limit)


@router.get("/gantt", summary="Gantt calendar data")
async def gantt(
    db: DBSession,
    _: CurrentUser,
    start_date: date = Query(...),
    end_date: date = Query(...),
    room_type: RoomType | None = None,
):
    data = await BookingService(db).gantt(start_date, end_date, room_type)
    return ok(GanttResponse(**data))


@router.get("/today", summary="Today's check-ins and check-outs")
async def today(db: DBSession, _: CurrentUser):
    data = await BookingService(db).today(date.today())
    return ok(
        {
            "check_ins": [BookingOut.model_validate(b) for b in data["check_ins"]],
            "check_outs": [BookingOut.model_validate(b) for b in data["check_outs"]],
        }
    )


@router.get("/search", summary="Search bookings")
async def search(db: DBSession, _: CurrentUser, q: str = Query(...)):
    bookings = await BookingService(db).search(q)
    return ok([BookingOut.model_validate(b) for b in bookings])


@router.post("", summary="Create booking")
async def create_booking(
    payload: BookingCreate, db: DBSession, current_user: CurrentUser
):
    booking = await BookingService(db).create(payload, created_by=current_user.id)
    return ok(BookingOut.model_validate(booking), message="Booking created")


@router.get("/{booking_id}", summary="Booking detail with guest + room")
async def get_booking(booking_id: uuid.UUID, db: DBSession, _: CurrentUser):
    service = BookingService(db)
    booking = await service.get(booking_id)
    detail = BookingDetail.model_validate(booking)
    guest = await service.guests.get_or_none(booking.guest_id)
    room = await service.rooms.get_or_none(booking.room_id)
    if guest is not None:
        detail.guest = GuestOut.model_validate(guest)
    if room is not None:
        detail.room = RoomOut.model_validate(room)
    return ok(detail)


@router.put("/{booking_id}", summary="Update booking")
async def update_booking(
    booking_id: uuid.UUID, payload: BookingUpdate, db: DBSession, _: CurrentUser
):
    booking = await BookingService(db).update(booking_id, payload)
    return ok(BookingOut.model_validate(booking), message="Booking updated")


@router.put("/{booking_id}/status", summary="Update booking status")
async def update_status(
    booking_id: uuid.UUID,
    payload: BookingStatusUpdate,
    db: DBSession,
    _: CurrentUser,
):
    booking = await BookingService(db).update_status(booking_id, payload)
    return ok(BookingOut.model_validate(booking), message="Status updated")


@router.post("/{booking_id}/checkin", summary="Check in")
async def checkin(booking_id: uuid.UUID, db: DBSession, _: CurrentUser):
    booking = await BookingService(db).check_in(booking_id)
    return ok(BookingOut.model_validate(booking), message="Checked in")


@router.post("/{booking_id}/checkout", summary="Check out + auto invoice")
async def checkout(booking_id: uuid.UUID, db: DBSession, _: CurrentUser):
    booking, invoice = await BookingService(db).check_out(booking_id)
    return ok(
        {
            "booking": BookingOut.model_validate(booking),
            "invoice": InvoiceOut.model_validate(invoice),
        },
        message="Checked out",
    )


@router.delete("/{booking_id}", summary="Cancel booking (soft delete)")
async def cancel_booking(booking_id: uuid.UUID, db: DBSession, _: CurrentUser):
    await BookingService(db).cancel(booking_id)
    return ok(None, message="Booking cancelled")
