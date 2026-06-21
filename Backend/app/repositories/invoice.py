"""Invoice repository."""
from __future__ import annotations

from sqlalchemy import func, select

from app.core.enums import InvoiceStatus
from app.models.invoice import Invoice
from app.repositories.base import BaseRepository


class InvoiceRepository(BaseRepository[Invoice]):
    model = Invoice
    soft_delete = False

    async def next_sequence(self, year: int) -> int:
        prefix = f"INV-{year}-"
        stmt = select(func.count()).select_from(Invoice).where(
            Invoice.invoice_ref.like(f"{prefix}%")
        )
        result = await self.db.execute(stmt)
        return int(result.scalar_one()) + 1

    async def for_guest(self, guest_id: int) -> list[Invoice]:
        stmt = (
            select(Invoice)
            .where(Invoice.guest_id == guest_id)
            .order_by(Invoice.created_at.desc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().unique().all())

    async def overdue(self) -> list[Invoice]:
        stmt = (
            select(Invoice)
            .where(Invoice.status == InvoiceStatus.overdue)
            .order_by(Invoice.due_date.asc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().unique().all())
