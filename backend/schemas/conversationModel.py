from typing import List
from uuid import UUID

from pydantic import BaseModel

from schemas.chatModel import ChatMessage


class Conversation(BaseModel):
    id: UUID
    user_id: UUID  # snake_case, UUID — matches DB User.id FK
    title: str
    messages: List[ChatMessage]


class CreateConversationRequest(BaseModel):
    title: str


class SendMessageRequest(BaseModel):
    message: str


class SendMessageResponse(BaseModel):
    reply: str