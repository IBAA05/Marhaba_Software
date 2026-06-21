"""Symmetric encryption for secrets at rest (e.g. SMTP password).

Uses Fernet when `cryptography` is available; otherwise falls back to a
reversible base64 encoding so the app remains importable in minimal envs.
The key is derived from the application SECRET_KEY.
"""
from __future__ import annotations

import base64
import hashlib

from app.core.config import settings

_PREFIX_FERNET = "fernet:"
_PREFIX_PLAIN = "b64:"


def _fernet():
    try:
        from cryptography.fernet import Fernet
    except Exception:
        return None
    key = base64.urlsafe_b64encode(
        hashlib.sha256(settings.SECRET_KEY.encode()).digest()
    )
    return Fernet(key)


def encrypt_secret(value: str) -> str:
    if not value:
        return value
    fernet = _fernet()
    if fernet is not None:
        token = fernet.encrypt(value.encode()).decode()
        return f"{_PREFIX_FERNET}{token}"
    encoded = base64.urlsafe_b64encode(value.encode()).decode()
    return f"{_PREFIX_PLAIN}{encoded}"


def decrypt_secret(value: str) -> str:
    if not value:
        return value
    if value.startswith(_PREFIX_FERNET):
        fernet = _fernet()
        if fernet is None:
            return ""
        return fernet.decrypt(value[len(_PREFIX_FERNET):].encode()).decode()
    if value.startswith(_PREFIX_PLAIN):
        return base64.urlsafe_b64decode(
            value[len(_PREFIX_PLAIN):].encode()
        ).decode()
    return value
