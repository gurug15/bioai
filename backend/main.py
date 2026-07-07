from fastapi import FastAPI
import uvicorn

from api.router import api_router
from exceptions.customException import ConversationNotFound, LLMServiceError
from exceptions.handlers import conversation_not_found_handler, generic_exception_handler, llm_service_error_handler



def create_app() -> FastAPI:
    app = FastAPI(
        title="My API",
        version="1.0.0",
    )

    # Middleware
    from fastapi.middleware.cors import CORSMiddleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    # Routes
    app.include_router(api_router)
    app.add_exception_handler(
    ConversationNotFound,
    conversation_not_found_handler,
)

    app.add_exception_handler(
        LLMServiceError,
        llm_service_error_handler,
    )

    app.add_exception_handler(
        Exception,
        generic_exception_handler,
    )

    return app


app = create_app()


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=5555,
        reload=True
    )