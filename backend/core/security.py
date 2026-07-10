"""
core/security.py

Handles all JWT creation and decoding.

Design:
  - Access token  → short-lived (15 min), stored in HttpOnly cookie `access_token`
  - Refresh token → long-lived  (7 days),  stored in HttpOnly cookie `refresh_token`
  - CSRF tokens   → random secrets tied to each JWT, stored in *readable* cookies
                    (`csrf_access_token`, `csrf_refresh_token`) so the frontend can
                    read them and send them back as the X-CSRF-Token header.

CSRF protection works because:
  - The CSRF token value is embedded in the JWT (as claim `csrf`).
  - On protected routes the server reads the header and compares it to the JWT claim.
  - An attacker can forge a cookie-sending request but cannot read the CSRF cookie
    (same-origin restriction), so they can never supply the correct header.
"""

import secrets
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from config.envs import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET,
    REFRESH_TOKEN_EXPIRE_DAYS,
)
from exceptions.customException import TokenExpiredError, TokenInvalidError

ALGORITHM = "HS256"

# ─── token creation ───────────────────────────────────────────────────────────

def _make_csrf() -> str:
    return secrets.token_urlsafe(32)


def create_access_token(subject: str) -> tuple[str, str]:
    """Returns (encoded_jwt, csrf_token)"""
    csrf = _make_csrf()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": subject, "exp": expire, "type": "access", "csrf": csrf}
    token = jwt.encode(payload, JWT_ACCESS_SECRET, algorithm=ALGORITHM)
    return token, csrf


def create_refresh_token(subject: str) -> tuple[str, str]:
    """Returns (encoded_jwt, csrf_token)"""
    csrf = _make_csrf()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {"sub": subject, "exp": expire, "type": "refresh", "csrf": csrf}
    token = jwt.encode(payload, JWT_REFRESH_SECRET, algorithm=ALGORITHM)
    return token, csrf


# ─── token decoding ───────────────────────────────────────────────────────────

def _decode(token: str, secret: str, expected_type: str) -> dict:
    try:
        payload = jwt.decode(token, secret, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise TokenExpiredError()
    except JWTError:
        raise TokenInvalidError()

    if payload.get("type") != expected_type:
        raise TokenInvalidError("Token type mismatch")

    return payload


def decode_access_token(token: str) -> dict:
    return _decode(token, JWT_ACCESS_SECRET, "access")


def decode_refresh_token(token: str) -> dict:
    return _decode(token, JWT_REFRESH_SECRET, "refresh")
