"""
Chat router — HTTP layer only.

No business logic lives here. Every handler parses the request,
delegates to chat_service, and returns the result.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.deps import require_access_token
from database.db import get_db
from database.models import User
from exceptions.customException import AuthError
from schemas.chatModel import ChatRequest, ChatResponse
from services import chat_service

chatRouter = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


def _get_current_user(
    current_user_email: str = Depends(require_access_token),
    db: Session = Depends(get_db),
) -> User:
    """Resolve the access-token email to a User row, or raise AuthError."""
    user = db.query(User).filter(User.email == current_user_email).first()
    if user is None:
        raise AuthError("User not found")
    return user


@chatRouter.post("/", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(_get_current_user),
):
    if request.conversation_id is None:
        conv = chat_service.create_conversation(user_id=current_user.id, db=db)
        conversation_id = str(conv.id)
    else:
        conversation_id = str(request.conversation_id)

    return chat_service.send_message(
        conversation_id=conversation_id,
        message=request.message,
        user_id=current_user.id,
        db=db,
    )


@chatRouter.get("/conv/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(_get_current_user),
):
    messages = chat_service.get_messages(
        conversation_id=conversation_id,
        user_id=current_user.id,
        db=db,
    )
    return {"messages": messages}


@chatRouter.post("/conv")
async def create_conversation(
    db: Session = Depends(get_db),
    current_user: User = Depends(_get_current_user),
):
    conv = chat_service.create_conversation(user_id=current_user.id, db=db)
    return {"conversation_id": str(conv.id)}


@chatRouter.get("/allconv")
async def get_all_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(_get_current_user),
):
    convs = chat_service.list_conversations(user_id=current_user.id, db=db)
    return [
        {"id": str(c.id), "user_id": str(c.user_id), "title": c.title}
        for c in convs
    ]
