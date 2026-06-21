"""Revoked refresh/access token registry (logout / blacklist)."""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.base import IntPKMixin, TimestampMixin


class TokenBlacklist(Base, IntPKMixin, TimestampMixin):
    __tablename__ = "token_blacklist"

    jti: Mapped[str] = mapped_column(
        String(64), unique=True, index=True, nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
