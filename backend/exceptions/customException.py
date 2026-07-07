class ConversationNotFound(Exception):
    def __init__(self, conversation_id: str):
        self.conversation_id = conversation_id


class LLMServiceError(Exception):
    pass