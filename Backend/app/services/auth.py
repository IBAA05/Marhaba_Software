"""Authentication & profile business logic."""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    JWTError,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.core.enums import TokenType
from app.core.exceptions import (
    BadRequestError,
    ConflictError,
    UnauthorizedError,
)
from app.models.user import User
from app.repositories.token_blacklist import TokenBlacklistRepository
from app.repositories.user import UserRepository
from app.schemas.auth import LoginRequest
from app.schemas.user import PasswordChange, UserUpdateMe


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.users = UserRepository(db)
        self.blacklist = TokenBlacklistRepository(db)

    def _tokens(self, user: User) -> tuple[str, str]:
        claims = {"role": user.role.value, "username": user.username}
        access = create_access_token(user.id, claims)
        refresh = create_refresh_token(user.id, claims)
        return access, refresh

    async def login(self, payload: LoginRequest) -> dict:
        user = await self.users.get_by_username_or_email(payload.username)
        if user is None or not verify_password(
            payload.password, user.hashed_password
        ):
            raise UnauthorizedError("Incorrect username or password")
        if not user.is_active:
            raise UnauthorizedError("Inactive user account")

        user.last_login = datetime.now(timezone.utc)
        await self.users.save(user)
        await self.db.commit()

        access, refresh = self._tokens(user)
        return {"access_token": access, "refresh_token": refresh, "user": user}

    async def refresh(self, refresh_token: str) -> dict:
        try:
            payload = decode_token(refresh_token)
        except JWTError as exc:
            raise UnauthorizedError("Invalid or expired refresh token") from exc
        if payload.get("type") != TokenType.refresh.value:
            raise UnauthorizedError("Invalid token type")
        jti = payload.get("jti")
        if jti and await self.blacklist.is_blacklisted(jti):
            raise UnauthorizedError("Refresh token has been revoked")
        user = await self.users.get_or_none(payload.get("sub"))
        if user is None or user.is_deleted or not user.is_active:
            raise UnauthorizedError("User not found or inactive")
        access = create_access_token(
            user.id, {"role": user.role.value, "username": user.username}
        )
        return {"access_token": access}

    async def logout(self, refresh_token: str) -> None:
        try:
            payload = decode_token(refresh_token)
        except JWTError:
            return  # nothing to revoke
        jti = payload.get("jti")
        exp = payload.get("exp")
        if jti and exp:
            expires_at = datetime.fromtimestamp(exp, tz=timezone.utc)
            if not await self.blacklist.is_blacklisted(jti):
                await self.blacklist.add(jti, expires_at)
                await self.db.commit()

    async def update_me(self, user: User, payload: UserUpdateMe) -> User:
        data = payload.model_dump(exclude_unset=True)
        if "email" in data and data["email"] != user.email:
            existing = await self.users.get_by_email(data["email"])
            if existing and existing.id != user.id:
                raise ConflictError("Email already in use")
        for key, value in data.items():
            setattr(user, key, value)
        await self.users.save(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def change_password(self, user: User, payload: PasswordChange) -> None:
        if not verify_password(payload.old_password, user.hashed_password):
            raise BadRequestError("Current password is incorrect")
        user.hashed_password = hash_password(payload.new_password)
        await self.users.save(user)
        await self.db.commit()
