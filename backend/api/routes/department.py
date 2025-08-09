from typing import List
from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ...db.session import get_async_db
from backend.api.routes.employee import get_current_employee
from backend.models.employee import Employee
from backend.services.department_service import DepartmentService
from backend.schemas.department import DepartmentOut
from backend.utils.response import api_response
from backend.api.deps.auth import require_departments

router = APIRouter(dependencies=[Depends(require_departments("人事行政部"))])


#增加部门
@router.post("/add_departments", response_model=List[DepartmentOut], status_code=201)
async def create_department(
    name: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    
    # 业务逻辑

    result = await DepartmentService.create_department(db, name)
    if result:
        depts = await DepartmentService.search_all_departments(db)
        return depts
    else:
        raise HTTPException(status_code=400, detail="部门创建失败")

#获取部门
@router.get("/get_departments", response_model=List[DepartmentOut], status_code=200)
async def get_departments(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    
    #获取部门
    depts = await DepartmentService.search_all_departments(db)
    return depts

#删除部门
@router.delete("/delete_department", response_model=api_response, status_code=200)
async def delete_department(
    id: int = Body(..., embed=True),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    
    #删除部门
    result = await DepartmentService.delete_department(db, id)
    if result["success"]:
        return api_response(success=True)
    else:
        return api_response(success=False, error=result["message"])