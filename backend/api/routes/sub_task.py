from fastapi import APIRouter
from backend.services.sub_task_service import SubTaskService
from backend.db.session import get_async_db
from backend.api.routes.employee import get_current_employee
from backend.models.employee import Employee
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

router = APIRouter()
# 获取所有美工任务
@router.get("/sub_art_tasks")
async def get_sub_art_tasks(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    return await SubTaskService.get_art_tasks(db, current_employee.id)

# 获取所有渲染任务
@router.get("/sub_render_tasks")
async def get_sub_render_tasks(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    return await SubTaskService.get_render_tasks(db, current_employee.id)