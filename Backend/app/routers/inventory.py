"""Inventory routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from fastapi.responses import Response

from app.core.dependencies import CurrentUser, DBSession
from app.core.enums import InventoryCategory, StockStatus
from app.core.responses import ok, paginate
from app.schemas.common import PaginationParams
from app.schemas.inventory import ItemCreate, ItemOut, ItemUpdate, RestockRequest
from app.services.inventory import InventoryService, serialize_item

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get("", summary="List inventory items")
async def list_items(
    db: DBSession,
    _: CurrentUser,
    pagination: PaginationParams = Depends(),
    category: InventoryCategory | None = None,
    status: StockStatus | None = None,
    search: str | None = None,
):
    items, total = await InventoryService(db).list(
        category=category,
        status=status,
        search=search,
        offset=pagination.offset,
        limit=pagination.limit,
    )
    data = [ItemOut.model_validate(i) for i in items]
    return paginate(data, total=total, page=pagination.page, limit=pagination.limit)


@router.get("/low-stock", summary="Items at or below reorder level")
async def low_stock(db: DBSession, _: CurrentUser):
    items = await InventoryService(db).low_stock()
    return ok([ItemOut.model_validate(i) for i in items])


@router.get("/export", summary="Export inventory as CSV")
async def export_inventory(db: DBSession, _: CurrentUser):
    csv_data = await InventoryService(db).export_csv()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=inventory.csv"},
    )


@router.post("", summary="Add inventory item")
async def create_item(payload: ItemCreate, db: DBSession, _: CurrentUser):
    item = await InventoryService(db).create(payload)
    return ok(ItemOut.model_validate(item), message="Item created")


@router.get("/{item_id}", summary="Item detail")
async def get_item(item_id: int, db: DBSession, _: CurrentUser):
    item = await InventoryService(db).get(item_id)
    return ok(ItemOut.model_validate(serialize_item(item)))


@router.put("/{item_id}", summary="Update item")
async def update_item(
    item_id: int, payload: ItemUpdate, db: DBSession, _: CurrentUser
):
    item = await InventoryService(db).update(item_id, payload)
    return ok(ItemOut.model_validate(item), message="Item updated")


@router.put("/{item_id}/restock", summary="Restock item")
async def restock_item(
    item_id: int, payload: RestockRequest, db: DBSession, _: CurrentUser
):
    item = await InventoryService(db).restock(item_id, payload)
    return ok(ItemOut.model_validate(item), message="Item restocked")


@router.delete("/{item_id}", summary="Remove item")
async def delete_item(item_id: int, db: DBSession, _: CurrentUser):
    await InventoryService(db).delete(item_id)
    return ok(None, message="Item removed")
