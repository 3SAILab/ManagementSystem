from typing import List
from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ...db.session import get_async_db
from backend.api.routes.employee import get_current_employee
from backend.models.employee import Employee
from backend.services.department_service import DepartmentService
from backend.schemas.department import DepartmentOut
from backend.utils.response import api_response

router = APIRouter()


#增加部门
@router.post("/add_departments", response_model=List[DepartmentOut], status_code=201)
async def create_department(
    name: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    #判断当前用户身份
    
    if current_employee.department.name != "人力资源部" or current_employee.position.name != "人事":
        raise HTTPException(status_code=403, detail="无权限访问")
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
    #判断当前用户身份
    if current_employee.department.name != "人力资源部" or current_employee.position.name != "人事":
        raise HTTPException(status_code=403, detail="无权限访问")
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
    #判断当前用户身份
    if current_employee.department.name != "人力资源部" or current_employee.position.name != "人事":
        raise HTTPException(status_code=403, detail="无权限访问")
    
    #删除部门
    await DepartmentService.delete_department(db, id)
    return api_response(data={"message": "部门删除成功"})