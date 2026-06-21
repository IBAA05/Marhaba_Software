"""Reusable FastAPI dependencies: DB session, current user, RBAC."""
from __future__ import annotations

from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import TokenType, UserRole
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import JWTError, decode_token
from app.database import get_session
from app.models.user import User
from app.repositories.token_blacklist import TokenBlacklistRepository
from app.repositories.user import UserRepository

# tokenUrl powers the Swagger "Authorize" button (BearerAuth scheme).
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async for session in get_session():
        yield session


DBSession = Annotated[AsyncSession, Depends(get_db)]


async def get_current_user(
    db: DBSession,
    token: Annotated[str | None, Depends(oauth2_scheme)],
) -> User:
    if not token:
        raise UnauthorizedError("Not authenticated")
    try:
        payload = decode_token(token)
    except JWTError as exc:  # invalid / expired
        raise UnauthorizedError("Invalid or expired token") from exc

    if payload.get("type") != TokenType.access.value:
        raise UnauthorizedError("Invalid token type")

    jti = payload.get("jti")
    if jti and await TokenBlacklistRepository(db).is_blacklisted(jti):
        raise UnauthorizedError("Token has been revoked")

    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedError("Invalid token payload")

    user = await UserRepository(db).get_or_none(user_id)
    if user is None or user.is_deleted:
        raise UnauthorizedError("User not found")
    if not user.is_active:
        raise ForbiddenError("Inactive user account")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_role(*roles: UserRole):
    """Dependency factory enforcing that the current user has one of *roles*."""

    allowed = {r.value for r in roles}

    async def _checker(user: CurrentUser) -> User:
        if user.role.value not in allowed:
            raise ForbiddenError(
                "You do not have permission to perform this action"
            )
        return user

    return _checker


# Convenience dependencies
require_super_admin = require_role(UserRole.super_admin)
require_any_staff = require_role(UserRole.super_admin, UserRole.receptionist)
