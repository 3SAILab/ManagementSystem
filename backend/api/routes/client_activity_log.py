from fastapi import APIRouter, Depends, Body, Path
from backend.models.employee import Employee
from backend.services.client_activity_log_service import ClientActivityLogService
from backend.services.employee_service import EmployeeService
from backend.db.session import get_async_db
from sqlalchemy.ext.asyncio import AsyncSession
from backend.schemas.client_activity_log import ClientActivityLogCreate
from backend.api.routes.employee import get_current_employee
from backend.utils.response import api_response

router = APIRouter()

# 添加客户跟进记录
@router.post("/client_activity_log/add")
async def add_client_activity_log(
    client_activity_log: ClientActivityLogCreate = Body(...),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):

    await ClientActivityLogService.add_client_activity_log(db, client_activity_log, current_employee.id)
    return api_response(success=True, data={"msg": "客户跟进记录添加成功"})


# 根据客户ID获取客户跟进记录
@router.get("/client_activity_log/get/{client_id}")
async def get_client_activity_log(
    client_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    client_activity_log = await ClientActivityLogService.get_client_activity_log(db, client_id)
    return api_response(success=True, data=client_activity_log)


