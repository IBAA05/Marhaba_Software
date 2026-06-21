"""Async SMTP email sender (aiosmtplib)."""
from __future__ import annotations

import logging
from email.message import EmailMessage

import aiosmtplib

from app.core.config import settings

logger = logging.getLogger("hotel.email")


async def send_email(
    *,
    to: str,
    subject: str,
    body: str,
    html: str | None = None,
    attachments: list[tuple[str, bytes, str]] | None = None,
) -> bool:
    """Send an email asynchronously.

    attachments: list of (filename, content_bytes, mime_subtype) tuples.
    Returns True on success, False on failure (never raises).
    """
    message = EmailMessage()
    message["From"] = settings.SMTP_FROM
    message["To"] = to
    message["Subject"] = subject
    message.set_content(body)
    if html:
        message.add_alternative(html, subtype="html")

    for filename, content, subtype in attachments or []:
        message.add_attachment(
            content,
            maintype="application",
            subtype=subtype,
            filename=filename,
        )

    if not settings.SMTP_HOST or not settings.SMTP_USER:
        logger.warning("SMTP not configured; skipping email to %s", to)
        return False

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER or None,
            password=settings.SMTP_PASSWORD or None,
            start_tls=settings.SMTP_TLS,
        )
        return True
    except Exception as exc:  # pragma: no cover
        logger.error("Failed to send email to %s: %s", to, exc)
        return False
