from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.employee import Employee
from backend.services.employee_service import EmployeeService
from backend.utils.response import api_response
from ...db.session import get_async_db
from ...schemas.employee import EmployeeCreate, EmployeeInfo, LoginResponse, Token
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_employee(
    db: AsyncSession = Depends(get_async_db),
    token: str = Depends(oauth2_scheme)
) -> Employee:
    return await EmployeeService.get_current_employee(db, token)

#员工登录
@router.post("/token", response_model=LoginResponse)
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
    return {
        "employee": EmployeeInfo.from_model(employee),
        "token": {"access_token": access_token}
    }

#员工注册
@router.post("/register", response_model=api_response)
async def register(
    newEmployee: EmployeeCreate,
    db: AsyncSession = Depends(get_async_db)
):
    employee = await EmployeeService.create_employee(db, newEmployee)
    #返回员工信息
    return api_response(data={"employeeName": employee.name})

#获取员工信息
@router.get("/get_employee_info", response_model=EmployeeInfo)
async def get_employee_info(
    current_employee: Employee = Depends(get_current_employee)
):
    return current_employee