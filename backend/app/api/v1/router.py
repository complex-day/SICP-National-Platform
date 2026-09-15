from fastapi import APIRouter
from app.api.v1.endpoints import auth, challenges, teams

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(challenges.router)
api_router.include_router(teams.router)


