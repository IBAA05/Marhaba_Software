"""Seed script: default super_admin, sample rooms, and a sample guest.

Usage:
    python seed.py

Safe to run multiple times; existing records (matched by natural key) are
skipped.
"""
from __future__ import annotations

import asyncio
from decimal import Decimal

from sqlalchemy import select

from app.core.config import settings
from app.core.enums import RoomStatus, RoomType, UserRole
from app.core.security import hash_password
from app.database import AsyncSessionLocal, Base, engine
from app.models import Guest, Room, User


SAMPLE_ROOMS = [
    {
        "room_number": "101",
        "type": RoomType.single,
        "floor": 1,
        "price_per_night": Decimal("80.00"),
        "max_occupancy": 1,
        "description": "Cozy single room with city view.",
        "amenities": ["wifi", "tv", "air_conditioning"],
        "photos": [],
        "has_panorama": False,
        "status": RoomStatus.available,
    },
    {
        "room_number": "102",
        "type": RoomType.double,
        "floor": 1,
        "price_per_night": Decimal("120.00"),
        "max_occupancy": 2,
        "description": "Comfortable double room.",
        "amenities": ["wifi", "tv", "minibar"],
        "photos": [],
        "has_panorama": False,
        "status": RoomStatus.available,
    },
    {
        "room_number": "201",
        "type": RoomType.suite,
        "floor": 2,
        "price_per_night": Decimal("260.00"),
        "max_occupancy": 3,
        "description": "Spacious suite with lounge area.",
        "amenities": ["wifi", "tv", "minibar", "bathtub"],
        "photos": [],
        "has_panorama": True,
        "status": RoomStatus.available,
    },
    {
        "room_number": "301",
        "type": RoomType.deluxe,
        "floor": 3,
        "price_per_night": Decimal("340.00"),
        "max_occupancy": 4,
        "description": "Deluxe room with panoramic view.",
        "amenities": ["wifi", "tv", "minibar", "bathtub", "balcony"],
        "photos": [],
        "has_panorama": True,
        "status": RoomStatus.available,
    },
]


async def seed() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Default super admin
        existing = await db.scalar(
            select(User).where(User.username == settings.FIRST_SUPERADMIN_USERNAME)
        )
        if existing is None:
            db.add(
                User(
                    username=settings.FIRST_SUPERADMIN_USERNAME,
                    full_name="Hotel Administrator",
                    email=settings.FIRST_SUPERADMIN_EMAIL,
                    hashed_password=hash_password(
                        settings.FIRST_SUPERADMIN_PASSWORD
                    ),
                    role=UserRole.super_admin,
                    is_active=True,
                )
            )
            print(f"Created super_admin '{settings.FIRST_SUPERADMIN_USERNAME}'.")
        else:
            print("Super admin already exists, skipping.")

        # Sample rooms
        for data in SAMPLE_ROOMS:
            found = await db.scalar(
                select(Room).where(Room.room_number == data["room_number"])
            )
            if found is None:
                db.add(Room(**data))
                print(f"Created room {data['room_number']}.")

        # Sample guest
        guest_email = "john.doe@example.com"
        found_guest = await db.scalar(
            select(Guest).where(Guest.email == guest_email)
        )
        if found_guest is None:
            db.add(
                Guest(
                    first_name="John",
                    last_name="Doe",
                    email=guest_email,
                    phone="+1-202-555-0143",
                    nationality="US",
                    id_passport_number="P1234567",
                    notes="VIP sample guest.",
                )
            )
            print("Created sample guest John Doe.")

        await db.commit()
    print("Seeding complete.")


if __name__ == "__main__":
    asyncio.run(seed())
