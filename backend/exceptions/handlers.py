from fastapi import Request
from fastapi.responses import JSONResponse

from exceptions.customException import ConversationNotFound, LLMServiceError




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