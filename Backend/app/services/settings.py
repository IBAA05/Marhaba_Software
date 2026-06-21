"""Hotel settings service."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.settings import HotelSettings
from app.repositories.settings import SettingsRepository
from app.schemas.settings import SettingsUpdate
from app.utils.security_crypto import encrypt_secret


class SettingsService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = SettingsRepository(db)

    async def get(self) -> HotelSettings:
        settings_row = await self.repo.get_singleton()
        if settings_row is None:
            settings_row = HotelSettings(hotel_name="My Hotel")
            await self.repo.add(settings_row)
            await self.db.commit()
            await self.db.refresh(settings_row)
        return settings_row

    async def update(self, payload: SettingsUpdate) -> HotelSettings:
        settings_row = await self.get()
        data = payload.model_dump(exclude_unset=True)
        if "smtp_password" in data and data["smtp_password"] is not None:
            settings_row.smtp_password = encrypt_secret(data.pop("smtp_password"))
        else:
            data.pop("smtp_password", None)
        for field, value in data.items():
            setattr(settings_row, field, value)
        await self.db.commit()
        await self.db.refresh(settings_row)
        return settings_row
