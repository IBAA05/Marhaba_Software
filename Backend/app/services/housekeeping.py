"""Housekeeping business logic."""
from __future__ import annotations

from datetime import date, datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import Priority, TaskStatus, TaskType
from app.core.exceptions import NotFoundError
from app.models.housekeeping import HousekeepingTask
from app.repositories.housekeeping import HousekeepingRepository
from app.repositories.room import RoomRepository
from app.schemas.housekeeping import TaskCreate, TaskStatusUpdate, TaskUpdate


class HousekeepingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = HousekeepingRepository(db)
        self.rooms = RoomRepository(db)

    async def get(self, task_id: int) -> HousekeepingTask:
        task = await self.repo.get_or_none(task_id)
        if task is None:
            raise NotFoundError("Task not found")
        return task

    async def list(
        self, *, room_id, status, priority, day, offset, limit
    ) -> tuple[list[HousekeepingTask], int]:
        from sqlalchemy import func
        conditions = []
        if room_id is not None:
            conditions.append(HousekeepingTask.room_id == room_id)
        if status is not None:
            conditions.append(HousekeepingTask.status == status)
        if priority is not None:
            conditions.append(HousekeepingTask.priority == priority)
        if day is not None:
            conditions.append(func.date(HousekeepingTask.due_time) == day)
        items = await self.repo.list(
            conditions=conditions, offset=offset, limit=limit,
            order_by=HousekeepingTask.created_at.desc(),
        )
        total = await self.repo.count(conditions=conditions)
        return list(items), total

    async def create(self, payload: TaskCreate) -> HousekeepingTask:
        if await self.rooms.get_or_none(payload.room_id) is None:
            raise NotFoundError("Room not found")
        task = HousekeepingTask(**payload.model_dump())
        await self.repo.create(task)
        await self.db.commit()
        await self.db.refresh(task)
        return task

    async def update(self, task_id: int, payload: TaskUpdate) -> HousekeepingTask:
        task = await self.get(task_id)
        data = payload.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(task, key, value)
        if task.status == TaskStatus.completed and task.completed_at is None:
            task.completed_at = datetime.now(timezone.utc)
        await self.repo.save(task)
        await self.db.commit()
        await self.db.refresh(task)
        return task

    async def update_status(
        self, task_id: int, payload: TaskStatusUpdate
    ) -> HousekeepingTask:
        task = await self.get(task_id)
        task.status = payload.status
        if payload.status == TaskStatus.completed:
            task.completed_at = datetime.now(timezone.utc)
        await self.repo.save(task)
        await self.db.commit()
        await self.db.refresh(task)
        return task

    async def delete(self, task_id: int) -> None:
        task = await self.get(task_id)
        await self.repo.delete(task)
        await self.db.commit()

    async def today(self, day: date) -> list[HousekeepingTask]:
        return await self.repo.today_pending(day)

    async def board(self) -> list[dict]:
        rooms = await self.rooms.list(offset=0, limit=1000)
        latest = await self.repo.latest_per_room()
        board = []
        for room in rooms:
            task = latest.get(room.id)
            board.append({
                "room_id": room.id,
                "room_number": room.room_number,
                "room_status": room.status.value,
                "task_status": task.status if task else None,
                "task_type": task.task_type if task else None,
                "priority": task.priority if task else None,
                "task_id": task.id if task else None,
            })
        return board
