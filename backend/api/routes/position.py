from typing import List
from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ...db.session import get_async_db
from backend.api.routes.employee import get_current_employee
from backend.models.employee import Employee
from backend.services.position_service import PositionService
from backend.schemas.position import PositionCreate,PositionInfo
from backend.utils.response import api_response

router = APIRouter()


#增加职位
@router.post("/add_position", response_model=List[PositionInfo], status_code=201)
async def create_position(
    position: PositionCreate = Body(...),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    #判断当前用户身份
    if current_employee.department.name != "人事行政部":
        raise HTTPException(status_code=403, detail="无权限访问")
    # 业务逻辑

    result = await PositionService.add_position(db, position)
    if result:
        positions = await PositionService.get_positions(db)
        return positions
    else:
        raise HTTPException(status_code=400, detail="职位创建失败")

#获取所有职位信息
@router.get("/get_positions", response_model=List[PositionInfo], status_code=200)
async def get_positions(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    #判断当前用户身份
    if current_employee.department.name != "人事行政部":
        raise HTTPException(status_code=403, detail="无权限访问")
    #获取职位信息
    positions = await PositionService.get_positions(db)
    return positions

#删除职位
@router.delete("/delete_position", response_model=List[PositionInfo], status_code=200)
async def delete_position(
    id: int = Body(..., embed=True),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    #判断当前用户身份
    if current_employee.department.name != "人事行政部":
        raise HTTPException(status_code=403, detail="无权限访问")
    
    #删除职位
    await PositionService.delete_position(db, id)
    positions = await PositionService.get_positions(db)
    return positions

#根据部门id获取职位信息
@router.get("/get_positions_by_department_id", response_model=List[PositionInfo], status_code=200)
async def get_positions_by_department_id(
    department_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    #判断当前用户身份
    if current_employee.department.name != "人事行政部":
        raise HTTPException(status_code=403, detail="无权限访问")
    #获取职位信息
    positions = await PositionService.get_positions_by_department_id(db, department_id)
    return positions