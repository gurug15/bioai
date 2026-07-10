class ConversationNotFound(Exception):
    def __init__(self, conversation_id: str):
        self.conversation_id = conversation_id


class LLMServiceError(Exception):
    pass


class AuthError(Exception):
    def __init__(self, detail: str = "Authentication failed"):
        self.detail = detail
        super().__init__(detail)


class TokenInvalidError(Exception):
    def __init__(self, detail: str = "Invalid token"):
        self.detail = detail
        super().__init__(detail)


class TokenExpiredError(Exception):
    def __init__(self, detail: str = "Token has expired"):
        self.detail = detail
        super().__init__(detail)