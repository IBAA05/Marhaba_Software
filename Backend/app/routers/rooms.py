"""Rooms routes."""
from __future__ import annotations

from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, Query

from app.core.dependencies import CurrentUser, DBSession, require_super_admin
from app.core.enums import RoomStatus, RoomType
from app.core.responses import ok, paginate
from app.schemas.common import PaginationParams
from app.schemas.room import (
    RoomCreate,
    RoomOut,
    RoomStatusUpdate,
    RoomTypeSummary,
    RoomUpdate,
)
from app.services.booking import BookingService
from app.services.room import RoomService

router = APIRouter(prefix="/rooms", tags=["Rooms"])


@router.get("", summary="List rooms")
async def list_rooms(
    db: DBSession,
    _: CurrentUser,
    pagination: PaginationParams = Depends(),
    type: RoomType | None = None,
    floor: int | None = None,
    status: RoomStatus | None = None,
    price_min: Decimal | None = None,
    price_max: Decimal | None = None,
):
    items, total = await RoomService(db).list(
        type_=type,
        floor=floor,
        status=status,
        price_min=price_min,
        price_max=price_max,
        offset=pagination.offset,
        limit=pagination.limit,
    )
    data = [RoomOut.model_validate(r) for r in items]
    return paginate(data, total=total, page=pagination.page, limit=pagination.limit)


@router.get("/availability", summary="Available rooms for a date range")
async def availability(
    db: DBSession,
    _: CurrentUser,
    check_in: date = Query(...),
    check_out: date = Query(...),
    type: RoomType | None = None,
):
    rooms = await RoomService(db).availability(check_in, check_out, type)
    return ok([RoomOut.model_validate(r) for r in rooms])


@router.get("/types/summary", summary="Count and availability per room type")
async def types_summary(db: DBSession, _: CurrentUser):
    summary = await RoomService(db).type_summary()
    return ok([RoomTypeSummary(**s) for s in summary])


@router.post(
    "", summary="Create room", dependencies=[Depends(require_super_admin)]
)
async def create_room(payload: RoomCreate, db: DBSession):
    room = await RoomService(db).create(payload)
    return ok(RoomOut.model_validate(room), message="Room created")


@router.get("/{room_id}", summary="Room detail with current booking")
async def get_room(room_id: int, db: DBSession, _: CurrentUser):
    room = await RoomService(db).get(room_id)
    data = RoomOut.model_validate(room).model_dump()
    bookings = await BookingService(db).repo.for_guest  # noqa: F841
    current = await _current_booking(db, room_id)
    data["current_booking"] = current
    return ok(data)


async def _current_booking(db, room_id: int):
    today = date.today()
    service = BookingService(db)
    bookings = await service.repo.in_range(today, today)
    for b in bookings:
        if b.room_id == room_id:
            return {
                "id": str(b.id),
                "booking_ref": b.booking_ref,
                "check_in": b.check_in.isoformat(),
                "check_out": b.check_out.isoformat(),
                "status": b.status.value,
            }
    return None


@router.put(
    "/{room_id}", summary="Update room", dependencies=[Depends(require_super_admin)]
)
async def update_room(room_id: int, payload: RoomUpdate, db: DBSession):
    room = await RoomService(db).update(room_id, payload)
    return ok(RoomOut.model_validate(room), message="Room updated")


@router.put("/{room_id}/status", summary="Update room status (receptionist)")
async def update_room_status(
    room_id: int, payload: RoomStatusUpdate, db: DBSession, _: CurrentUser
):
    room = await RoomService(db).update_status(room_id, payload)
    return ok(RoomOut.model_validate(room), message="Room status updated")


@router.delete(
    "/{room_id}", summary="Soft delete room", dependencies=[Depends(require_super_admin)]
)
async def delete_room(room_id: int, db: DBSession):
    await RoomService(db).soft_delete(room_id)
    return ok(None, message="Room deleted")
