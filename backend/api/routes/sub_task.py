from typing import Optional
from fastapi import APIRouter, Body
from backend.services.sub_task_service import SubTaskService
from backend.db.session import get_async_db
from backend.api.routes.employee import get_current_employee
from backend.models.employee import Employee
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from backend.services.progress_log_service import ProgressLogService
from backend.services.employee_service import EmployeeService
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

# 获取未分配任务
@router.get("/sub_art_tasks/unassigned")
async def get_sub_art_tasks_unassigned(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    if current_employee.department.name == "美工部":
        return await SubTaskService.get_art_tasks_unassigned(db)
    elif current_employee.department.name == "渲染部":
        return await SubTaskService.get_render_tasks_unassigned(db)

# 分配任务
@router.put("/assign_task/{id}")
async def assign_sub_task(
    id: int,
    charge_id: int = Body(..., embed=True),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    # 分配任务
    res = await SubTaskService.assign_sub_task(db, id, charge_id, current_employee.id)
    # 获取负责人信息
    charger = await EmployeeService.get_employee_by_id(db, charge_id)
    # 创建进度记录
    notes = f"{current_employee.name}分配任务给{charger.name}"
    await ProgressLogService.create_progress_log(db, res.id, notes)
    return res

# 获取任务详情
@router.get("/sub_task/{id}")
async def get_sub_task(
    id: int,
    db: AsyncSession = Depends(get_async_db)
):
    res = await SubTaskService.get_sub_task(db, id)
    out = {
        "id": res.id,
        "ticket_name": res.ticket.name,
        "notes": res.ticket.notes,
    }
    return out



