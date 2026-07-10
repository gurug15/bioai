"""
core/cookies.py

Helpers to set and unset the four auth cookies:
  - access_token       (HttpOnly, Secure, SameSite=lax)
  - refresh_token      (HttpOnly, Secure, SameSite=lax)
  - csrf_access_token  (readable by JS, SameSite=lax)
  - csrf_refresh_token (readable by JS, SameSite=lax)

SECURE flag is True so cookies are HTTPS-only in production.
Set COOKIE_SECURE=false in .env if running over plain HTTP locally.
"""

import os
from fastapi.responses import Response
from config.envs import ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS

_SECURE = os.getenv("COOKIE_SECURE", "true").lower() != "false"
_SAMESITE = "lax"  # protects against CSRF on cross-origin navigations


def set_auth_cookies(
    response: Response,
    access_token: str,
    csrf_access: str,
    refresh_token: str,
    csrf_refresh: str,
) -> None:
    access_max_age = ACCESS_TOKEN_EXPIRE_MINUTES * 60
    refresh_max_age = REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60

    # ── HttpOnly JWTs ──────────────────────────────────────────────────────────
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=_SECURE,
        samesite=_SAMESITE,
        max_age=access_max_age,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=_SECURE,
        samesite=_SAMESITE,
        max_age=refresh_max_age,
        path="/api/auth/refresh",   # scoped: only sent to the refresh endpoint
    )

    # ── Readable CSRF tokens (JS must read and send as X-CSRF-Token header) ───
    response.set_cookie(
        key="csrf_access_token",
        value=csrf_access,
        httponly=False,
        secure=_SECURE,
        samesite=_SAMESITE,
        max_age=access_max_age,
        path="/",
    )
    response.set_cookie(
        key="csrf_refresh_token",
        value=csrf_refresh,
        httponly=False,
        secure=_SECURE,
        samesite=_SAMESITE,
        max_age=refresh_max_age,
        path="/api/auth/refresh",
    )


def unset_auth_cookies(response: Response) -> None:
    for name in ("access_token", "csrf_access_token"):
        response.delete_cookie(key=name, path="/")
    for name in ("refresh_token", "csrf_refresh_token"):
        response.delete_cookie(key=name, path="/api/auth/refresh")
