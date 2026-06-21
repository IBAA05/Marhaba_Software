"""Hotel settings routes [super_admin only]."""
from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.dependencies import DBSession, require_super_admin
from app.core.responses import ok
from app.schemas.settings import SettingsOut, SettingsUpdate
from app.services.settings import SettingsService

router = APIRouter(
    prefix="/settings",
    tags=["Settings"],
    dependencies=[Depends(require_super_admin)],
)


@router.get("", summary="Get hotel settings")
async def get_settings(db: DBSession):
    settings_row = await SettingsService(db).get()
    return ok(SettingsOut.model_validate(settings_row))


@router.put("", summary="Update hotel settings")
async def update_settings(payload: SettingsUpdate, db: DBSession):
    settings_row = await SettingsService(db).update(payload)
    return ok(SettingsOut.model_validate(settings_row), message="Settings updated")
