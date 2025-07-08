from fastapi import APIRouter

from backend.api.routes import employee


api_router = APIRouter()

api_router.include_router(employee.router)