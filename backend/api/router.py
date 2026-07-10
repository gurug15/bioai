from fastapi import APIRouter

from api.routes.chatRoute import chatRouter
from api.routes.authRoute import authRouter

api_router = APIRouter(prefix="/api")

api_router.include_router(chatRouter)
api_router.include_router(authRouter)