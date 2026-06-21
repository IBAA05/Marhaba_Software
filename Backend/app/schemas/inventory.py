"""Inventory schemas."""
from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, Field

from app.core.enums import InventoryCategory, StockStatus
from app.schemas.common import ORMModel


class ItemBase(BaseModel):
    name: str = Field(max_length=120)
    category: InventoryCategory = InventoryCategory.other
    quantity: int = Field(default=0, ge=0)
    unit: str = Field(default="pieces", max_length=40)
    reorder_level: int = Field(default=0, ge=0)
    supplier: str | None = None
    notes: str | None = None


class ItemCreate(ItemBase):
    last_restocked: date | None = None


class ItemUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=120)
    category: InventoryCategory | None = None
    quantity: int | None = Field(default=None, ge=0)
    unit: str | None = None
    reorder_level: int | None = Field(default=None, ge=0)
    supplier: str | None = None
    notes: str | None = None
    last_restocked: date | None = None


class RestockRequest(BaseModel):
    quantity: int = Field(ge=0, description="New absolute quantity after restock")


class ItemOut(ORMModel):
    id: int
    name: str
    category: InventoryCategory
    quantity: int
    unit: str
    reorder_level: int
    last_restocked: date | None = None
    supplier: str | None = None
    notes: str | None = None
    stock_status: StockStatus
    created_at: datetime
