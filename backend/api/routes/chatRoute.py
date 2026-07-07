
from collections import defaultdict
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from exceptions.customException import ConversationNotFound
from schemas.chatModel import (
    ChatRequest,
    ChatResponse,
    ChatMessage,
)

conversations: dict[str, list[ChatMessage]] = defaultdict(list)
chatRouter = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


@chatRouter.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    conversation_id = request.conversation_id or "1"

    if conversation_id not in conversations:
        raise ConversationNotFound(conversation_id)

    assistant_reply = f"You said: {request.message}"

    conversations[conversation_id].append(
        ChatMessage(
            role="user",
            conversation_id=conversation_id,
            content=request.message,
        )
    )

    conversations[conversation_id].append(
        ChatMessage(
            role="assistant",
            conversation_id=conversation_id,
            content=assistant_reply,
        )
    )

    return ChatResponse(
        conversation_id=conversation_id,
        message=conversations[conversation_id][-1],
    )

@chatRouter.get("/conv/{conversation_id}")
async def get_chat(conversation_id: str):
    if conversation_id not in conversations:
        raise ConversationNotFound(conversation_id)
    return {"ChatMessages": conversations.get(conversation_id,[])}

@chatRouter.post("/conv")
async def create_chat():
    new_id = str(uuid4())
    conversations[new_id] = []
    return {"conversation_id": new_id}
