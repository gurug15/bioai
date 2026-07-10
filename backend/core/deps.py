"""
core/deps.py

Reusable FastAPI dependencies.

`require_access_token`  → validates access JWT + CSRF header, returns the `sub` (user email).
`require_refresh_token` → validates refresh JWT + CSRF header, returns the `sub`.
"""

from fastapi import Cookie, Header, Request
from typing import Annotated

from core.security import decode_access_token, decode_refresh_token
from exceptions.customException import TokenInvalidError


def _verify_csrf(payload: dict, csrf_header: str | None) -> None:
    """Compare the CSRF claim inside the JWT with the value sent as a request header."""
    if not csrf_header or csrf_header != payload.get("csrf"):
        raise TokenInvalidError("CSRF token mismatch")


def require_access_token(
    request: Request,
    access_token: Annotated[str | None, Cookie()] = None,
    x_csrf_token: Annotated[str | None, Header()] = None,
) -> str:
    """
    Dependency for protected endpoints.
    Reads the JWT from the HttpOnly cookie and the CSRF token from the X-CSRF-Token header.
    Returns the subject (email) on success.
    """
    if not access_token:
        raise TokenInvalidError("Missing access token")

    payload = decode_access_token(access_token)
    _verify_csrf(payload, x_csrf_token)
    return payload["sub"]


def require_refresh_token(
    request: Request,
    refresh_token: Annotated[str | None, Cookie()] = None,
    x_csrf_token: Annotated[str | None, Header()] = None,
) -> str:
    """
    Dependency for the /refresh endpoint.
    Reads the refresh JWT from the HttpOnly cookie and verifies the CSRF header.
    Returns the subject (email) on success.
    """
    if not refresh_token:
        raise TokenInvalidError("Missing refresh token")

    payload = decode_refresh_token(refresh_token)
    _verify_csrf(payload, x_csrf_token)
    return payload["sub"]
