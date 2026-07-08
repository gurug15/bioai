
from collections import defaultdict
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from schemas.conversationModel import Conversation
from exceptions.customException import ConversationNotFound
from schemas.chatModel import (
    ChatRequest,
    ChatResponse,
    ChatMessage,
)

conversations: dict[str, Conversation] = defaultdict(list)
conversations["1"] = Conversation(id="1",userId=1,title="-----", messages=[]);
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

    conversations[conversation_id].messages.append(
        ChatMessage(
            role="user",
            conversation_id=conversation_id,
            content=request.message,
        )
    )
    if conversations[conversation_id].title == "-----":
        conversations[conversation_id].title == conversations[conversation_id].messages[0] 

    conversations[conversation_id].messages.append(
        ChatMessage(
            role="assistant",
            conversation_id=conversation_id,
            content=assistant_reply,
        )
    )

    return ChatResponse(
        conversation_id=conversation_id,
        message=conversations[conversation_id].messages[-1],
    )

@chatRouter.get("/conv/{conversation_id}")
async def get_chat(conversation_id: str):
    if conversation_id not in conversations:
        raise ConversationNotFound(conversation_id)
    return {"ChatMessages": conversations.get(conversation_id).messages}

@chatRouter.post("/conv")
async def create_chat():
    new_id = str(uuid4())
    conversations[new_id] = Conversation(id=new_id, userId=1,title="-----", messages=[])
    return {"conversation_id": new_id}

@chatRouter.get("/allconv")
async def getConversationIDs():
    return [c.model_dump(exclude={"messages"}) for c in conversations.values()]
