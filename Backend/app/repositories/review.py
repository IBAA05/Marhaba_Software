"""Review repository."""
from __future__ import annotations

from sqlalchemy import func, select

from app.models.review import Review
from app.repositories.base import BaseRepository


class ReviewRepository(BaseRepository[Review]):
    model = Review
    soft_delete = False

    async def summary(self) -> dict:
        stmt = select(
            func.count(),
            func.coalesce(func.avg(Review.overall_rating), 0),
            func.coalesce(func.avg(Review.cleanliness), 0),
            func.coalesce(func.avg(Review.staff), 0),
            func.coalesce(func.avg(Review.comfort), 0),
            func.coalesce(func.avg(Review.location), 0),
            func.coalesce(func.avg(Review.value), 0),
        )
        result = await self.db.execute(stmt)
        count, overall, clean, staff, comfort, loc, value = result.one()
        return {
            "count": int(count),
            "overall": round(float(overall), 2),
            "cleanliness": round(float(clean), 2),
            "staff": round(float(staff), 2),
            "comfort": round(float(comfort), 2),
            "location": round(float(loc), 2),
            "value": round(float(value), 2),
        }
