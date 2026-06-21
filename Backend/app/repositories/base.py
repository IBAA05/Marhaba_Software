"""Generic async repository with common CRUD + pagination helpers."""
from __future__ import annotations

from typing import Any, Generic, Sequence, Type, TypeVar

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import Select

ModelType = TypeVar("ModelType")


class BaseRepository(Generic[ModelType]):
    model: Type[ModelType]
    soft_delete: bool = False

    def __init__(self, db: AsyncSession):
        self.db = db

    # ── internal ───────────────────────────────────────────────────
    def _base_select(self) -> Select:
        stmt = select(self.model)
        if self.soft_delete:
            stmt = stmt.where(self.model.is_deleted.is_(False))  # type: ignore[attr-defined]
        return stmt

    # ── reads ──────────────────────────────────────────────────────
    async def get_or_none(self, id_: Any) -> ModelType | None:
        stmt = self._base_select().where(self.model.id == id_)  # type: ignore[attr-defined]
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def list(
        self,
        *,
        conditions: list | None = None,
        offset: int = 0,
        limit: int = 20,
        order_by: Any = None,
    ) -> Sequence[ModelType]:
        stmt = self._base_select()
        for cond in conditions or []:
            stmt = stmt.where(cond)
        if order_by is not None:
            stmt = stmt.order_by(order_by)
        else:
            stmt = stmt.order_by(self.model.id.desc())  # type: ignore[attr-defined]
        stmt = stmt.offset(offset).limit(limit)
        result = await self.db.execute(stmt)
        return result.scalars().unique().all()

    async def count(self, *, conditions: list | None = None) -> int:
        stmt = select(func.count()).select_from(self.model)
        if self.soft_delete:
            stmt = stmt.where(self.model.is_deleted.is_(False))  # type: ignore[attr-defined]
        for cond in conditions or []:
            stmt = stmt.where(cond)
        result = await self.db.execute(stmt)
        return int(result.scalar_one())

    # ── writes ──────────────────────────────────────────────────
    async def create(self, obj: ModelType) -> ModelType:
        self.db.add(obj)
        await self.db.flush()
        await self.db.refresh(obj)
        return obj

    async def save(self, obj: ModelType) -> ModelType:
        self.db.add(obj)
        await self.db.flush()
        await self.db.refresh(obj)
        return obj

    async def delete(self, obj: ModelType) -> None:
        await self.db.delete(obj)
        await self.db.flush()
