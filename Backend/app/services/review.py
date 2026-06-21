"""Review service."""
from __future__ import annotations

from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import ReviewSource
from app.core.exceptions import NotFoundError
from app.models.review import Review
from app.repositories.guest import GuestRepository
from app.repositories.review import ReviewRepository
from app.schemas.review import ReviewCreate, ReviewReply


class ReviewService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = ReviewRepository(db)
        self.guests = GuestRepository(db)

    async def list(
        self,
        *,
        rating: int | None = None,
        source: ReviewSource | None = None,
        date_from: datetime | None = None,
        date_to: datetime | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[list[Review], int]:
        return await self.repo.list(
            rating=rating,
            source=source,
            date_from=date_from,
            date_to=date_to,
            offset=offset,
            limit=limit,
        )

    async def get(self, review_id: int) -> Review:
        review = await self.repo.get_or_none(review_id)
        if review is None:
            raise NotFoundError("Review not found")
        return review

    async def create(self, payload: ReviewCreate) -> Review:
        guest = await self.guests.get_active(payload.guest_id)
        if guest is None:
            raise NotFoundError("Guest not found")
        review = Review(**payload.model_dump())
        await self.repo.add(review)
        await self.db.commit()
        await self.db.refresh(review)
        return review

    async def reply(self, review_id: int, payload: ReviewReply) -> Review:
        review = await self.get(review_id)
        review.staff_reply = payload.staff_reply
        await self.db.commit()
        await self.db.refresh(review)
        return review

    async def delete(self, review_id: int) -> None:
        review = await self.get(review_id)
        await self.repo.delete(review)
        await self.db.commit()

    async def summary(self) -> dict:
        return await self.repo.averages()
