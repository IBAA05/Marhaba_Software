"""Concierge repository."""
from __future__ import annotations

from sqlalchemy import func, select

from app.core.enums import RequestStatus
from app.models.concierge import ConciergeRequest
from app.repositories.base import BaseRepository


class ConciergeRepository(BaseRepository[ConciergeRequest]):
    model = ConciergeRequest
    soft_delete = False

    async def pending_count(self) -> int:
        stmt = select(func.count()).select_from(ConciergeRequest).where(
            ConciergeRequest.status == RequestStatus.pending
        )
        result = await self.db.execute(stmt)
        return int(result.scalar_one())
