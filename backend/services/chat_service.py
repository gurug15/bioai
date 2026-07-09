"""
Chat service — owns the in-memory store and all business logic.

The router layer should never touch the conversations dict directly;
it always goes through these functions.
"""

from uuid import UUID, uuid4

from exceptions.customException import ConversationNotFound
from schemas.chatModel import ChatMessage, ChatResponse
from schemas.conversationModel import Conversation


# ---------------------------------------------------------------------------
# In-memory store
# ---------------------------------------------------------------------------

# Placeholder user UUID until authentication is implemented
_DEFAULT_USER_ID = UUID("00000000-0000-0000-0000-000000000001")

# string(UUID) → Conversation
_conversations: dict[str, Conversation] = {}

# Seed one conversation on startup so the UI has something to load
_seed_id = uuid4()
_conversations[str(_seed_id)] = Conversation(
    id=_seed_id,
    user_id=_DEFAULT_USER_ID,
    title="New Chat",
    messages=[],
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_or_raise(conversation_id: str) -> Conversation:
    """Return the conversation or raise ConversationNotFound."""
    conv = _conversations.get(conversation_id)
    if conv is None:
        raise ConversationNotFound(conversation_id)
    return conv


def _auto_title(conv: Conversation, first_message: str) -> None:
    """Set the conversation title from the first user message."""
    if conv.title == "New Chat" and len(conv.messages) == 1:
        conv.title = first_message[:60]


def _build_reply(message: str) -> str:
    """
    Generate the assistant reply.
    Replace this with a real LLM call when you're ready.
    """
    return f"You said: {message}"


# ---------------------------------------------------------------------------
# Service functions (called by the router)
# ---------------------------------------------------------------------------

def get_messages(conversation_id: str) -> list[ChatMessage]:
    """Return all messages for a conversation."""
    conv = _get_or_raise(conversation_id)
    return conv.messages


def create_conversation() -> Conversation:
    """
    Create a new empty conversation.
    If an untitled 'New Chat' already exists, return that instead of
    creating a duplicate.
    """
    existing = next(
        (c for c in _conversations.values() if c.title == "New Chat"),
        None,
    )
    if existing is not None:
        return existing

    new_id = uuid4()
    conv = Conversation(
        id=new_id,
        user_id=_DEFAULT_USER_ID,
        title="New Chat",
        messages=[],
    )
    _conversations[str(new_id)] = conv
    return conv


def send_message(conversation_id: str, message: str) -> ChatResponse:
    """
    Append the user message, generate an assistant reply,
    append that too, then return the assistant ChatResponse.
    """
    conv = _get_or_raise(conversation_id)

    user_message = ChatMessage(
        role="user",
        conversation_id=conv.id,
        content=message,
    )
    conv.messages.append(user_message)

    _auto_title(conv, message)

    reply_text = _build_reply(message)

    assistant_message = ChatMessage(
        role="assistant",
        conversation_id=conv.id,
        content=reply_text,
    )
    conv.messages.append(assistant_message)

    return ChatResponse(
        conversation_id=conv.id,
        message=assistant_message,
    )


def list_conversations() -> list[Conversation]:
    """Return all conversations (the router strips messages before sending)."""
    return list(_conversations.values())


def get_default_conversation_id() -> str:
    """Return the ID of the first conversation in the store."""
    return next(iter(_conversations))
