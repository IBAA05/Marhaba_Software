"""Hotel settings repository (singleton row)."""
from __future__ import annotations

from sqlalchemy import select

from app.models.settings import HotelSettings
from app.repositories.base import BaseRepository


class SettingsRepository(BaseRepository[HotelSettings]):
    model = HotelSettings
    soft_delete = False

    async def get_singleton(self) -> HotelSettings:
        stmt = select(HotelSettings).order_by(HotelSettings.id.asc()).limit(1)
        result = await self.db.execute(stmt)
        row = result.scalars().first()
        if row is None:
            row = HotelSettings()
            self.db.add(row)
            await self.db.flush()
            await self.db.refresh(row)
        return row
