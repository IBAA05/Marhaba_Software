"""Concierge service."""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import Priority, RequestStatus, RequestType
from app.core.exceptions import NotFoundError
from app.models.concierge import ConciergeRequest
from app.repositories.concierge import ConciergeRepository
from app.repositories.guest import GuestRepository
from app.schemas.concierge import (
    ConciergeCreate,
    ConciergeStatusUpdate,
    ConciergeUpdate,
)
from app.utils.email import send_email


class ConciergeService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = ConciergeRepository(db)
        self.guests = GuestRepository(db)

    async def list(
        self,
        *,
        request_type: RequestType | None = None,
        status: RequestStatus | None = None,
        priority: Priority | None = None,
        guest_id: int | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[list[ConciergeRequest], int]:
        return await self.repo.list(
            request_type=request_type,
            status=status,
            priority=priority,
            guest_id=guest_id,
            offset=offset,
            limit=limit,
        )

    async def get(self, request_id: int) -> ConciergeRequest:
        request = await self.repo.get_or_none(request_id)
        if request is None:
            raise NotFoundError("Concierge request not found")
        return request

    async def create(self, payload: ConciergeCreate) -> ConciergeRequest:
        guest = await self.guests.get_active(payload.guest_id)
        if guest is None:
            raise NotFoundError("Guest not found")
        request = ConciergeRequest(**payload.model_dump())
        await self.repo.add(request)
        await self.db.commit()
        await self.db.refresh(request)
        return request

    async def update(
        self, request_id: int, payload: ConciergeUpdate
    ) -> ConciergeRequest:
        request = await self.get(request_id)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(request, field, value)
        await self.db.commit()
        await self.db.refresh(request)
        return request

    async def update_status(
        self, request_id: int, payload: ConciergeStatusUpdate
    ) -> ConciergeRequest:
        request = await self.get(request_id)
        request.status = payload.status
        if payload.status == RequestStatus.completed:
            request.completed_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(request)
        return request

    async def cancel(self, request_id: int) -> ConciergeRequest:
        request = await self.get(request_id)
        request.status = RequestStatus.cancelled
        await self.db.commit()
        await self.db.refresh(request)
        return request

    async def notify(self, request_id: int) -> bool:
        request = await self.get(request_id)
        guest = await self.guests.get_or_none(request.guest_id)
        if guest is None:
            raise NotFoundError("Guest not found")
        return await send_email(
            guest.email,
            "Your concierge request",
            f"Your request ({request.request_type.value}) has been fulfilled.",
        )

    async def pending_count(self) -> int:
        return await self.repo.pending_count()
