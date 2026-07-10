from dotenv import load_dotenv
from fastapi import FastAPI
import uvicorn

from api.router import api_router
from exceptions.customException import (
    AuthError,
    ConversationNotFound,
    LLMServiceError,
    TokenExpiredError,
    TokenInvalidError,
)
from exceptions.handlers import (
    auth_error_handler,
    conversation_not_found_handler,
    generic_exception_handler,
    llm_service_error_handler,
    token_expired_handler,
    token_invalid_handler,
)


def create_app() -> FastAPI:
    app = FastAPI(
        title="BioAI API",
        version="1.0.0",
    )

    # ── Middleware ─────────────────────────────────────────────────────────────
    from fastapi.middleware.cors import CORSMiddleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],   # tighten to your frontend origin
        allow_credentials=True,                    # required for cookies
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routes ─────────────────────────────────────────────────────────────────
    app.include_router(api_router)

    # ── Exception handlers ─────────────────────────────────────────────────────
    app.add_exception_handler(ConversationNotFound, conversation_not_found_handler)
    app.add_exception_handler(LLMServiceError, llm_service_error_handler)
    app.add_exception_handler(AuthError, auth_error_handler)
    app.add_exception_handler(TokenInvalidError, token_invalid_handler)
    app.add_exception_handler(TokenExpiredError, token_expired_handler)
    # Keep generic last so specific handlers fire first
    app.add_exception_handler(Exception, generic_exception_handler)

    return app


app = create_app()


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=5555,
        reload=True,
    )