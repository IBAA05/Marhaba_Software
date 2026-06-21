"""Reviews routes."""
from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends

from app.core.dependencies import CurrentUser, DBSession, require_super_admin
from app.core.enums import ReviewSource
from app.core.responses import ok, paginate
from app.schemas.common import PaginationParams
from app.schemas.review import ReviewCreate, ReviewOut, ReviewReply, ReviewSummary
from app.services.review import ReviewService

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.get("", summary="List reviews")
async def list_reviews(
    db: DBSession,
    _: CurrentUser,
    pagination: PaginationParams = Depends(),
    rating: int | None = None,
    source: ReviewSource | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
):
    items, total = await ReviewService(db).list(
        rating=rating,
        source=source,
        date_from=date_from,
        date_to=date_to,
        offset=pagination.offset,
        limit=pagination.limit,
    )
    data = [ReviewOut.model_validate(r) for r in items]
    return paginate(data, total=total, page=pagination.page, limit=pagination.limit)


@router.get("/summary", summary="Average review scores")
async def summary(db: DBSession, _: CurrentUser):
    data = await ReviewService(db).summary()
    return ok(ReviewSummary(**data))


@router.post("", summary="Add review")
async def create_review(payload: ReviewCreate, db: DBSession, _: CurrentUser):
    review = await ReviewService(db).create(payload)
    return ok(ReviewOut.model_validate(review), message="Review created")


@router.get("/{review_id}", summary="Review detail")
async def get_review(review_id: int, db: DBSession, _: CurrentUser):
    review = await ReviewService(db).get(review_id)
    return ok(ReviewOut.model_validate(review))


@router.put("/{review_id}/reply", summary="Staff reply to review")
async def reply_review(
    review_id: int, payload: ReviewReply, db: DBSession, _: CurrentUser
):
    review = await ReviewService(db).reply(review_id, payload)
    return ok(ReviewOut.model_validate(review), message="Reply added")


@router.delete(
    "/{review_id}",
    summary="Delete review",
    dependencies=[Depends(require_super_admin)],
)
async def delete_review(review_id: int, db: DBSession):
    await ReviewService(db).delete(review_id)
    return ok(None, message="Review deleted")
