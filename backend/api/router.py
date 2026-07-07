from fastapi import APIRouter

from api.routes.chatRoute import chatRouter

api_router = APIRouter(prefix="/api")

api_router.include_router(chatRouter)