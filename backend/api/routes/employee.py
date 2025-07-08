from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.services.employee_service import EmployeeService
from backend.utils.response import api_response
from ...db.session import get_async_db
from ...schemas.employee import EmployeeCreate, Token
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_async_db)
):
    employee = await EmployeeService.authenticate_user(db, form_data.username, form_data.password)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="账号或密码错误！",
            headers={"WWW-Authenticate": "Bearer"},
        )
    #创建Token
    access_token = EmployeeService.create_access_token(data={"sub": employee.email})
    #返回Token以及Token类型
    return {"access_token": access_token, "token_type": "bearer"}

#注册员工
@router.post("/register", response_model=api_response)
async def register(
    newEmployee: EmployeeCreate,
    db: AsyncSession = Depends(get_async_db)
):
    employee = await EmployeeService.create_employee(db, newEmployee)
    #返回员工信息
    return api_response(data={"employeeName": employee.name})
