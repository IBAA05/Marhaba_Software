"""Housekeeping schemas."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.core.enums import Priority, TaskStatus, TaskType
from app.schemas.common import ORMModel


class TaskBase(BaseModel):
    room_id: int
    assigned_to: int | None = None
    task_type: TaskType = TaskType.cleaning
    priority: Priority = Priority.medium
    notes: str | None = None
    due_time: datetime | None = None


class TaskCreate(TaskBase):
    status: TaskStatus = TaskStatus.pending


class TaskUpdate(BaseModel):
    room_id: int | None = None
    assigned_to: int | None = None
    task_type: TaskType | None = None
    priority: Priority | None = None
    notes: str | None = None
    due_time: datetime | None = None
    status: TaskStatus | None = None


class TaskStatusUpdate(BaseModel):
    status: TaskStatus


class TaskOut(ORMModel):
    id: int
    room_id: int
    assigned_to: int | None = None
    task_type: TaskType
    priority: Priority
    notes: str | None = None
    status: TaskStatus
    due_time: datetime | None = None
    completed_at: datetime | None = None
    created_at: datetime


class BoardRoom(BaseModel):
    room_id: int
    room_number: str
    room_status: str
    task_status: TaskStatus | None = None
    task_type: TaskType | None = None
    priority: Priority | None = None
    task_id: int | None = None
