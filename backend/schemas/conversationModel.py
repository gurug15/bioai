from pydantic import BaseModel
from typing import List
from uuid import UUID

from schemas.chatModel import ChatMessage



class Conversation(BaseModel):
    userId: int

    title: str
    messages: List[ChatMessage]


class CreateConversationRequest(BaseModel):
    title: str


class SendMessageRequest(BaseModel):
    message: str


class SendMessageResponse(BaseModel):
    reply: str