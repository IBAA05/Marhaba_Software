"""Authentication routes."""
from __future__ import annotations

from fastapi import APIRouter

from app.core.dependencies import CurrentUser, DBSession
from app.core.responses import ok
from app.schemas.auth import (
    AccessToken,
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    TokenPair,
)
from app.schemas.user import PasswordChange, UserOut, UserUpdateMe
from app.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", summary="Login and obtain tokens")
async def login(payload: LoginRequest, db: DBSession):
    result = await AuthService(db).login(payload)
    data = TokenPair(
        access_token=result["access_token"],
        refresh_token=result["refresh_token"],
        user=UserOut.model_validate(result["user"]),
    )
    return ok(data, message="Login successful")


@router.post("/refresh", summary="Refresh access token")
async def refresh(payload: RefreshRequest, db: DBSession):
    result = await AuthService(db).refresh(payload)
    return ok(AccessToken(access_token=result["access_token"]))


@router.post("/logout", summary="Logout and revoke refresh token")
async def logout(payload: LogoutRequest, db: DBSession, _: CurrentUser):
    await AuthService(db).logout(payload)
    return ok(None, message="Logged out")


@router.get("/me", summary="Current user profile")
async def me(current_user: CurrentUser):
    return ok(UserOut.model_validate(current_user))


@router.put("/me", summary="Update own profile")
async def update_me(payload: UserUpdateMe, db: DBSession, current_user: CurrentUser):
    user = await AuthService(db).update_me(current_user, payload)
    return ok(UserOut.model_validate(user), message="Profile updated")


@router.put("/me/password", summary="Change own password")
async def change_password(
    payload: PasswordChange, db: DBSession, current_user: CurrentUser
):
    await AuthService(db).change_password(current_user, payload)
    return ok(None, message="Password changed")
