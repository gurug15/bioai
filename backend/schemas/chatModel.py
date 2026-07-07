

from typing import Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["tool", "user", "assistant"]
    conversation_id:str
    content: str = Field(..., min_length=1)

class ChatRequest(BaseModel):
    conversation_id: str | None = None
    message: str


class ChatResponse(BaseModel):
    conversation_id: str
    message: ChatMessage