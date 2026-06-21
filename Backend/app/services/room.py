"""Room business logic."""
from __future__ import annotations

from datetime import date, datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import RoomStatus, RoomType
from app.core.exceptions import ConflictError, NotFoundError
from app.models.room import Room
from app.repositories.room import RoomRepository
from app.schemas.room import RoomCreate, RoomStatusUpdate, RoomUpdate


class RoomService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.rooms = RoomRepository(db)

    async def get(self, room_id: int) -> Room:
        room = await self.rooms.get_or_none(room_id)
        if room is None:
            raise NotFoundError("Room not found")
        return room

    async def list(
        self,
        *,
        type_: RoomType | None,
        floor: int | None,
        status: RoomStatus | None,
        price_min: float | None,
        price_max: float | None,
        offset: int,
        limit: int,
    ) -> tuple[list[Room], int]:
        conditions = []
        if type_ is not None:
            conditions.append(Room.type == type_)
        if floor is not None:
            conditions.append(Room.floor == floor)
        if status is not None:
            conditions.append(Room.status == status)
        if price_min is not None:
            conditions.append(Room.price_per_night >= price_min)
        if price_max is not None:
            conditions.append(Room.price_per_night <= price_max)
        items = await self.rooms.list(
            conditions=conditions, offset=offset, limit=limit,
            order_by=Room.room_number.asc(),
        )
        total = await self.rooms.count(conditions=conditions)
        return list(items), total

    async def create(self, payload: RoomCreate) -> Room:
        if await self.rooms.get_by_number(payload.room_number):
            raise ConflictError("Room number already exists")
        room = Room(**payload.model_dump())
        await self.rooms.create(room)
        await self.db.commit()
        await self.db.refresh(room)
        return room

    async def update(self, room_id: int, payload: RoomUpdate) -> Room:
        room = await self.get(room_id)
        data = payload.model_dump(exclude_unset=True)
        if "room_number" in data and data["room_number"] != room.room_number:
            if await self.rooms.get_by_number(data["room_number"]):
                raise ConflictError("Room number already exists")
        for key, value in data.items():
            setattr(room, key, value)
        await self.rooms.save(room)
        await self.db.commit()
        await self.db.refresh(room)
        return room

    async def update_status(self, room_id: int, payload: RoomStatusUpdate) -> Room:
        room = await self.get(room_id)
        room.status = payload.status
        await self.rooms.save(room)
        await self.db.commit()
        await self.db.refresh(room)
        return room

    async def soft_delete(self, room_id: int) -> None:
        room = await self.get(room_id)
        room.is_deleted = True
        room.deleted_at = datetime.now(timezone.utc)
        await self.rooms.save(room)
        await self.db.commit()

    async def availability(
        self, check_in: date, check_out: date, type_: RoomType | None
    ) -> list[Room]:
        return await self.rooms.available_rooms(check_in, check_out, type_)

    async def type_summary(self) -> list[dict]:
        return await self.rooms.type_summary()
