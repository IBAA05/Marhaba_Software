"""Guest business logic (incl. loyalty tier auto-update)."""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import LoyaltyTier, NotificationType, RelatedEntity
from app.core.exceptions import ConflictError, NotFoundError
from app.models.guest import Guest
from app.repositories.guest import GuestRepository
from app.schemas.guest import GuestCreate, GuestNotify, GuestUpdate
from app.services.notification import NotificationService


def compute_loyalty_tier(total_stays: int) -> LoyaltyTier:
    if total_stays >= 10:
        return LoyaltyTier.gold
    if total_stays >= 5:
        return LoyaltyTier.silver
    if total_stays >= 1:
        return LoyaltyTier.bronze
    return LoyaltyTier.none


class GuestService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.guests = GuestRepository(db)

    async def get(self, guest_id: int) -> Guest:
        guest = await self.guests.get_or_none(guest_id)
        if guest is None:
            raise NotFoundError("Guest not found")
        return guest

    async def list(
        self, *, search: str | None, offset: int, limit: int
    ) -> tuple[list[Guest], int]:
        conditions = []
        if search:
            conditions.append(self.guests.search_condition(search))
        items = await self.guests.list(
            conditions=conditions, offset=offset, limit=limit,
            order_by=Guest.created_at.desc(),
        )
        total = await self.guests.count(conditions=conditions)
        return list(items), total

    async def create(self, payload: GuestCreate) -> Guest:
        if await self.guests.get_by_email(payload.email):
            raise ConflictError("A guest with this email already exists")
        guest = Guest(**payload.model_dump())
        guest.loyalty_tier = compute_loyalty_tier(0)
        await self.guests.create(guest)
        await self.db.commit()
        await self.db.refresh(guest)
        return guest

    async def update(self, guest_id: int, payload: GuestUpdate) -> Guest:
        guest = await self.get(guest_id)
        data = payload.model_dump(exclude_unset=True)
        if "email" in data and data["email"] != guest.email:
            existing = await self.guests.get_by_email(data["email"])
            if existing and existing.id != guest.id:
                raise ConflictError("Email already in use")
        for key, value in data.items():
            setattr(guest, key, value)
        await self.guests.save(guest)
        await self.db.commit()
        await self.db.refresh(guest)
        return guest

    async def soft_delete(self, guest_id: int) -> None:
        guest = await self.get(guest_id)
        guest.is_deleted = True
        guest.deleted_at = datetime.now(timezone.utc)
        await self.guests.save(guest)
        await self.db.commit()

    async def recompute_stays(self, guest_id: int, total_stays: int) -> Guest:
        guest = await self.get(guest_id)
        guest.total_stays = total_stays
        guest.loyalty_tier = compute_loyalty_tier(total_stays)
        await self.guests.save(guest)
        await self.db.commit()
        await self.db.refresh(guest)
        return guest

    async def search(self, term: str, limit: int = 10) -> list[Guest]:
        return await self.guests.search(term, limit)

    async def notify(self, guest_id: int, payload: GuestNotify) -> None:
        guest = await self.get(guest_id)
        await NotificationService(self.db).send_email_notification(
            recipient_email=guest.email,
            subject=payload.subject,
            message=payload.message,
            related_entity=RelatedEntity.booking,
            related_id=str(guest.id),
        )
        await self.db.commit()
