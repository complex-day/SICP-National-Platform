from fastapi import APIRouter
from app.api.v1.endpoints import auth, challenges, teams, academic, projects, partnerships, governance

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(challenges.router)
api_router.include_router(teams.router)
api_router.include_router(academic.router)
api_router.include_router(projects.router)
api_router.include_router(partnerships.router)
api_router.include_router(governance.router)





