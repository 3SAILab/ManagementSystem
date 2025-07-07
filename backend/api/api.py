from fastapi import APIRouter

from backend.api import user


api_router = APIRouter()

api_router.include_router(user.router)