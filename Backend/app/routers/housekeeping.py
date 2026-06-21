"""Housekeeping routes."""
from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends

from app.core.dependencies import CurrentUser, DBSession
from app.core.enums import Priority, TaskStatus
from app.core.responses import ok, paginate
from app.schemas.common import PaginationParams
from app.schemas.housekeeping import (
    BoardRoom,
    TaskCreate,
    TaskOut,
    TaskStatusUpdate,
    TaskUpdate,
)
from app.services.housekeeping import HousekeepingService

router = APIRouter(prefix="/housekeeping", tags=["Housekeeping"])


@router.get("", summary="List housekeeping tasks")
async def list_tasks(
    db: DBSession,
    _: CurrentUser,
    pagination: PaginationParams = Depends(),
    room_id: int | None = None,
    status: TaskStatus | None = None,
    priority: Priority | None = None,
    day: date | None = None,
):
    items, total = await HousekeepingService(db).list(
        room_id=room_id,
        status=status,
        priority=priority,
        day=day,
        offset=pagination.offset,
        limit=pagination.limit,
    )
    data = [TaskOut.model_validate(t) for t in items]
    return paginate(data, total=total, page=pagination.page, limit=pagination.limit)


@router.get("/board", summary="Housekeeping board (room grid)")
async def board(db: DBSession, _: CurrentUser):
    rooms = await HousekeepingService(db).board()
    return ok([BoardRoom(**r) for r in rooms])


@router.get("/today", summary="Today's pending tasks")
async def today(db: DBSession, _: CurrentUser):
    tasks = await HousekeepingService(db).today(date.today())
    return ok([TaskOut.model_validate(t) for t in tasks])


@router.post("", summary="Create task")
async def create_task(payload: TaskCreate, db: DBSession, _: CurrentUser):
    task = await HousekeepingService(db).create(payload)
    return ok(TaskOut.model_validate(task), message="Task created")


@router.get("/{task_id}", summary="Task detail")
async def get_task(task_id: int, db: DBSession, _: CurrentUser):
    task = await HousekeepingService(db).get(task_id)
    return ok(TaskOut.model_validate(task))


@router.put("/{task_id}", summary="Update task")
async def update_task(
    task_id: int, payload: TaskUpdate, db: DBSession, _: CurrentUser
):
    task = await HousekeepingService(db).update(task_id, payload)
    return ok(TaskOut.model_validate(task), message="Task updated")


@router.put("/{task_id}/status", summary="Update task status")
async def update_status(
    task_id: int, payload: TaskStatusUpdate, db: DBSession, _: CurrentUser
):
    task = await HousekeepingService(db).update_status(task_id, payload)
    return ok(TaskOut.model_validate(task), message="Status updated")


@router.delete("/{task_id}", summary="Delete task")
async def delete_task(task_id: int, db: DBSession, _: CurrentUser):
    await HousekeepingService(db).delete(task_id)
    return ok(None, message="Task deleted")
