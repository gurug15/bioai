"""
api/routes/authRoute.py

Auth endpoints:
  POST /api/auth/signup   - register a new user
  POST /api/auth/login    - issue access + refresh tokens in cookies
  POST /api/auth/refresh  - rotate access token using the refresh token
  DELETE /api/auth/logout - clear all auth cookies
  GET  /api/auth/me       - return the current authenticated user
"""

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from core.cookies import set_auth_cookies, unset_auth_cookies
from core.deps import require_access_token, require_refresh_token
from core.security import create_access_token, create_refresh_token
from database.db import get_db
from database.models import User
from exceptions.customException import AuthError
from schemas.userModel import UserCreate, UserLogin, UserResponse
from services.user_service import create_user, login_user

authRouter = APIRouter(prefix="/auth", tags=["auth"])


# ── Signup ──────────────────────────────────────────────────────────────────

@authRouter.post("/signup", response_model=UserResponse, status_code=201)
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user. Returns the created user (no tokens yet)."""
    return create_user(user, db)


# ── Login ───────────────────────────────────────────────────────────────────

@authRouter.post("/login")
async def login(user: UserLogin, response: Response, db: Session = Depends(get_db)):
    """
    Validates credentials, then sets four cookies:
      - access_token       (HttpOnly)
      - refresh_token      (HttpOnly, scoped to /api/auth/refresh)
      - csrf_access_token  (readable, JS must send as X-CSRF-Token header)
      - csrf_refresh_token (readable, JS must send as X-CSRF-Token on /refresh)
    """
    db_user = login_user(user, db)   # raises AuthError on bad credentials

    access_token, csrf_access = create_access_token(subject=db_user.email)
    refresh_token, csrf_refresh = create_refresh_token(subject=db_user.email)

    set_auth_cookies(response, access_token, csrf_access, refresh_token, csrf_refresh)

    return {"message": "Login successful"}


# ── Refresh ──────────────────────────────────────────────────────────────────

@authRouter.post("/refresh")
async def refresh(
    response: Response,
    subject: str = Depends(require_refresh_token),
):
    """
    Uses the refresh token cookie (+ X-CSRF-Token header) to issue a new access token.
    The refresh token is NOT rotated here to keep things simple; add rotation later.
    """
    access_token, csrf_access = create_access_token(subject=subject)

    # Only rotate the access token cookies; leave the refresh cookies as-is
    from config.envs import ACCESS_TOKEN_EXPIRE_MINUTES
    import os

    _SECURE = os.getenv("COOKIE_SECURE", "true").lower() != "false"

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=_SECURE,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    response.set_cookie(
        key="csrf_access_token",
        value=csrf_access,
        httponly=False,
        secure=_SECURE,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )

    return {"message": "Token refreshed"}


# ── Logout ───────────────────────────────────────────────────────────────────

@authRouter.delete("/logout")
async def logout(
    response: Response,
    _subject: str = Depends(require_access_token),
):
    """
    Clears all four auth cookies.  The client-side JS cannot delete HttpOnly cookies,
    so the backend must do it.
    """
    unset_auth_cookies(response)
    return {"message": "Logged out successfully"}


# ── Me (protected example) ───────────────────────────────────────────────────

@authRouter.get("/me", response_model=UserResponse)
async def me(
    subject: str = Depends(require_access_token),
    db: Session = Depends(get_db),
):
    """Return the currently authenticated user's profile."""
    db_user = db.query(User).filter(User.email == subject).first()
    if not db_user:
        raise AuthError("User not found")
    return db_user
