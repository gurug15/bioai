"""
Chat router — HTTP layer only.

No business logic lives here. Every handler parses the request,
delegates to chat_service, and returns the result.
"""

from uuid import UUID

from fastapi import APIRouter

from schemas.chatModel import ChatRequest, ChatResponse
from services import chat_service

chatRouter = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


@chatRouter.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    conversation_id = (
        str(request.conversation_id)
        if request.conversation_id
        else chat_service.get_default_conversation_id()
    )
    return chat_service.send_message(conversation_id, request.message)


@chatRouter.get("/conv/{conversation_id}")
async def get_conversation(conversation_id: UUID):
    messages = chat_service.get_messages(str(conversation_id))
    return {"messages": messages}


@chatRouter.post("/conv")
async def create_conversation():
    conv = chat_service.create_conversation()
    return {"conversation_id": conv.id}


@chatRouter.get("/allconv")
async def get_all_conversations():
    convs = chat_service.list_conversations()
    return [c.model_dump(exclude={"messages"}) for c in convs]
