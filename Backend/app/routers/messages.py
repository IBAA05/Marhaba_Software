"""Messages routes."""
from __future__ import annotations

from fastapi import APIRouter, Query

from app.core.dependencies import CurrentUser, DBSession
from app.core.responses import ok
from app.schemas.message import (
    ConversationSummary,
    MessageCreate,
    MessageOut,
    UnreadCount,
)
from app.services.message import MessageService

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.get("", summary="List conversations grouped by guest")
async def list_conversations(
    db: DBSession,
    _: CurrentUser,
    filter: str = Query("all", pattern="^(all|unread|flagged)$"),
):
    conversations = await MessageService(db).conversations(filter)
    return ok([ConversationSummary(**c) for c in conversations])


@router.get("/unread-count", summary="Total unread messages")
async def unread_count(db: DBSession, _: CurrentUser):
    count = await MessageService(db).unread_count()
    return ok(UnreadCount(unread_count=count))


@router.get("/{guest_id}", summary="Conversation thread with a guest")
async def conversation(guest_id: int, db: DBSession, _: CurrentUser):
    messages = await MessageService(db).conversation(guest_id)
    return ok([MessageOut.model_validate(m) for m in messages])


@router.post("/{guest_id}", summary="Send a message to a guest")
async def send_message(
    guest_id: int, payload: MessageCreate, db: DBSession, current_user: CurrentUser
):
    message = await MessageService(db).send(guest_id, payload, current_user.id)
    return ok(MessageOut.model_validate(message), message="Message sent")


@router.put("/{message_id}/read", summary="Mark message as read")
async def mark_read(message_id: int, db: DBSession, _: CurrentUser):
    message = await MessageService(db).mark_read(message_id)
    return ok(MessageOut.model_validate(message), message="Marked as read")


@router.put("/{message_id}/flag", summary="Toggle flagged status")
async def toggle_flag(message_id: int, db: DBSession, _: CurrentUser):
    message = await MessageService(db).toggle_flag(message_id)
    return ok(MessageOut.model_validate(message), message="Flag toggled")


@router.delete("/{message_id}", summary="Delete message")
async def delete_message(message_id: int, db: DBSession, _: CurrentUser):
    await MessageService(db).delete(message_id)
    return ok(None, message="Message deleted")
