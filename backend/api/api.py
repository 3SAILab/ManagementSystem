from fastapi import APIRouter

from backend.api.routes import employee
from backend.api.routes import position
from backend.api.routes import department


api_router = APIRouter()

api_router.include_router(employee.router,tags=["员工管理"])
api_router.include_router(position.router,tags=["职位管理"])
api_router.include_router(department.router,tags=["部门管理"])

