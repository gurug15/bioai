"""
Chat service — PostgreSQL-backed, per-user isolated business logic.

All functions accept a `db: Session` and `user_id: UUID` so that
no conversation is ever visible to another user.
"""

from uuid import UUID

from sqlalchemy.orm import Session

from database.models import Conversation as ConversationModel
from database.models import Message as MessageModel
from exceptions.customException import ConversationNotFound
from schemas.chatModel import ChatMessage, ChatResponse


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _auto_title(conv: ConversationModel, first_message: str, db: Session) -> None:
    """Set the conversation title from the first user message."""
    if conv.title == "New Chat":
        conv.title = first_message[:60]
        db.commit()


def _build_reply(message: str) -> str:
    """
    Generate the assistant reply.
    Replace this with a real LLM call when you're ready.
    """
    return f"You said: {message}"


# ---------------------------------------------------------------------------
# Service functions (called by the router)
# ---------------------------------------------------------------------------

def create_conversation(user_id: UUID, db: Session) -> ConversationModel:
    """
    Return an existing untitled 'New Chat' for this user, or create a new one.
    Never creates duplicates for the same user.
    """
    existing = (
        db.query(ConversationModel)
        .filter(
            ConversationModel.user_id == user_id,
            ConversationModel.title == "New Chat",
        )
        .first()
    )
    if existing is not None:
        return existing

    conv = ConversationModel(user_id=user_id, title="New Chat")
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv

def delete_conversation(user_id: UUID, conversation_id: str, db: Session) -> ConversationModel:
    """
    Delete an existing Chat for this user.
    """
    conv = (
        db.query(ConversationModel)
        .filter(
            ConversationModel.user_id == user_id,
            ConversationModel.id == conversation_id,
        )
        .first()
    )
    if conv is None or conv.title == "New Chat":
        raise ConversationNotFound("Can't delete an empty conversation")
    db.delete(conv)
    db.commit()

    return conv

def get_messages(conversation_id: str, user_id: UUID, db: Session) -> list[ChatMessage]:
    """Return all messages for a conversation owned by this user."""
    conv = (
        db.query(ConversationModel)
        .filter(
            ConversationModel.id == conversation_id,
            ConversationModel.user_id == user_id,
        )
        .first()
    )
    if conv is None:
        raise ConversationNotFound(conversation_id)

    return [
        ChatMessage(
            role=msg.role,
            conversation_id=msg.conversation_id,
            content=msg.content,
        )
        for msg in conv.messages
    ]


def send_message(
    conversation_id: str, message: str, user_id: UUID, db: Session
) -> ChatResponse:
    """
    Append the user message, optionally auto-title the conversation,
    generate an assistant reply, persist both, and return the reply.
    """
    conv = (
        db.query(ConversationModel)
        .filter(
            ConversationModel.id == conversation_id,
            ConversationModel.user_id == user_id,
        )
        .first()
    )
    if conv is None:
        raise ConversationNotFound(conversation_id)

    # Persist user message
    user_msg = MessageModel(
        conversation_id=conv.id,
        role="user",
        content=message,
    )
    db.add(user_msg)
    db.flush()

    # Auto-title on first message
    _auto_title(conv, message, db)

    # Generate and persist assistant reply
    reply_text = _build_reply(message)
    assistant_msg = MessageModel(
        conversation_id=conv.id,
        role="assistant",
        content=reply_text,
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return ChatResponse(
        conversation_id=conv.id,
        message=ChatMessage(
            role=assistant_msg.role,
            conversation_id=assistant_msg.conversation_id,
            content=assistant_msg.content,
        ),
    )


def list_conversations(user_id: UUID, db: Session) -> list[ConversationModel]:
    """Return all conversations for this user, newest first."""
    return (
        db.query(ConversationModel)
        .filter(ConversationModel.user_id == user_id)
        .order_by(ConversationModel.created_at.desc())
        .all()
    )
