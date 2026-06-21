"""Housekeeping repository."""
from __future__ import annotations

from datetime import date

from sqlalchemy import func, select

from app.core.enums import TaskStatus
from app.models.housekeeping import HousekeepingTask
from app.repositories.base import BaseRepository


class HousekeepingRepository(BaseRepository[HousekeepingTask]):
    model = HousekeepingTask
    soft_delete = False

    async def today_pending(self, day: date) -> list[HousekeepingTask]:
        stmt = select(HousekeepingTask).where(
            HousekeepingTask.status == TaskStatus.pending,
            func.date(HousekeepingTask.due_time) == day,
        ).order_by(HousekeepingTask.priority.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().unique().all())

    async def latest_per_room(self) -> dict[int, HousekeepingTask]:
        stmt = select(HousekeepingTask).order_by(
            HousekeepingTask.created_at.desc()
        )
        result = await self.db.execute(stmt)
        latest: dict[int, HousekeepingTask] = {}
        for task in result.scalars().unique().all():
            latest.setdefault(task.room_id, task)
        return latest
