"""Inventory repository."""
from __future__ import annotations

from sqlalchemy import or_, select

from app.models.inventory import InventoryItem
from app.repositories.base import BaseRepository


class InventoryRepository(BaseRepository[InventoryItem]):
    model = InventoryItem
    soft_delete = False

    @staticmethod
    def search_condition(term: str):
        like = f"%{term}%"
        return or_(
            InventoryItem.name.ilike(like),
            InventoryItem.supplier.ilike(like),
        )

    async def all_items(self) -> list[InventoryItem]:
        stmt = select(InventoryItem).order_by(InventoryItem.name)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def low_stock(self) -> list[InventoryItem]:
        stmt = select(InventoryItem).where(
            InventoryItem.quantity <= InventoryItem.reorder_level
        ).order_by(InventoryItem.quantity)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
