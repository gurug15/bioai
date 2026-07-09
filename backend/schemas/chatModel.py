from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]  # matches DB CheckConstraint
    conversation_id: UUID
    content: str = Field(..., min_length=1)


class ChatRequest(BaseModel):
    conversation_id: UUID | None = None
    message: str = Field(..., min_length=1)


class ChatResponse(BaseModel):
    conversation_id: UUID
    message: ChatMessage