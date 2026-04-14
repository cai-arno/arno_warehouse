from fastapi import APIRouter
from .endpoints import auth, questions, achievement

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(questions.router)
api_router.include_router(achievement.router)
