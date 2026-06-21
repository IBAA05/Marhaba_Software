"""Inventory business logic (incl. stock status computation + CSV export)."""
from __future__ import annotations

import csv
import io
from datetime import date

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import InventoryCategory, StockStatus
from app.core.exceptions import NotFoundError
from app.models.inventory import InventoryItem
from app.repositories.inventory import InventoryRepository
from app.schemas.inventory import ItemCreate, ItemUpdate, RestockRequest


def compute_stock_status(quantity: int, reorder_level: int) -> StockStatus:
    if quantity == 0:
        return StockStatus.out_of_stock
    if quantity <= reorder_level:
        return StockStatus.low_stock
    if quantity > reorder_level * 2:
        return StockStatus.sufficient
    return StockStatus.low_stock


def serialize_item(item: InventoryItem) -> dict:
    data = {
        "id": item.id,
        "name": item.name,
        "category": item.category,
        "quantity": item.quantity,
        "unit": item.unit,
        "reorder_level": item.reorder_level,
        "last_restocked": item.last_restocked,
        "supplier": item.supplier,
        "notes": item.notes,
        "stock_status": compute_stock_status(item.quantity, item.reorder_level),
        "created_at": item.created_at,
    }
    return data


class InventoryService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = InventoryRepository(db)

    async def get(self, item_id: int) -> InventoryItem:
        item = await self.repo.get_or_none(item_id)
        if item is None:
            raise NotFoundError("Inventory item not found")
        return item

    async def list(
        self, *, category, status, search, offset, limit
    ) -> tuple[list[dict], int]:
        conditions = []
        if category is not None:
            conditions.append(InventoryItem.category == category)
        if search:
            conditions.append(self.repo.search_condition(search))
        items = await self.repo.list(
            conditions=conditions, offset=offset, limit=limit,
            order_by=InventoryItem.name.asc(),
        )
        serialized = [serialize_item(i) for i in items]
        if status is not None:
            serialized = [s for s in serialized if s["stock_status"] == status]
        total = await self.repo.count(conditions=conditions)
        return serialized, total

    async def create(self, payload: ItemCreate) -> dict:
        item = InventoryItem(**payload.model_dump())
        await self.repo.create(item)
        await self.db.commit()
        await self.db.refresh(item)
        return serialize_item(item)

    async def update(self, item_id: int, payload: ItemUpdate) -> dict:
        item = await self.get(item_id)
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(item, key, value)
        await self.repo.save(item)
        await self.db.commit()
        await self.db.refresh(item)
        return serialize_item(item)

    async def delete(self, item_id: int) -> None:
        item = await self.get(item_id)
        await self.repo.delete(item)
        await self.db.commit()

    async def restock(self, item_id: int, payload: RestockRequest) -> dict:
        item = await self.get(item_id)
        item.quantity = payload.quantity
        item.last_restocked = date.today()
        await self.repo.save(item)
        await self.db.commit()
        await self.db.refresh(item)
        return serialize_item(item)

    async def low_stock(self) -> list[dict]:
        items = await self.repo.low_stock()
        return [serialize_item(i) for i in items]

    async def export_csv(self) -> str:
        items = await self.repo.all_items()
        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow([
            "id", "name", "category", "quantity", "unit", "reorder_level",
            "stock_status", "last_restocked", "supplier",
        ])
        for item in items:
            writer.writerow([
                item.id, item.name, item.category.value, item.quantity,
                item.unit, item.reorder_level,
                compute_stock_status(item.quantity, item.reorder_level).value,
                item.last_restocked or "", item.supplier or "",
            ])
        return buffer.getvalue()
