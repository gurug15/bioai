from fastapi import Request
from fastapi.responses import JSONResponse

from exceptions.customException import (
    AuthError,
    ConversationNotFound,
    LLMServiceError,
    TokenExpiredError,
    TokenInvalidError,
)


async def conversation_not_found_handler(
    request: Request,
    exc: ConversationNotFound,
):
    return JSONResponse(
        status_code=404,
        content={
            "detail": f"Conversation '{exc.conversation_id}' not found"
        },
    )


async def llm_service_error_handler(
    request: Request,
    exc: LLMServiceError,
):
    return JSONResponse(
        status_code=503,
        content={
            "detail": "LLM service unavailable"
        },
    )


async def generic_exception_handler(
    request: Request,
    exc: Exception,
):
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error"
        },
    )


async def auth_error_handler(
    request: Request,
    exc: AuthError,
):
    return JSONResponse(
        status_code=401,
        content={
            "detail": exc.detail,
        },
    )


async def token_invalid_handler(
    request: Request,
    exc: TokenInvalidError,
):
    return JSONResponse(
        status_code=401,
        content={"detail": exc.detail},
    )


async def token_expired_handler(
    request: Request,
    exc: TokenExpiredError,
):
    return JSONResponse(
        status_code=401,
        content={"detail": exc.detail},
    )
