from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.employee import Employee
from backend.services.employee_service import EmployeeService
from backend.utils.response import api_response
from ...db.session import get_async_db
from ...schemas.employee import EmployeePermission, Token, EmployeeInfo, EmployeeListInfo
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_employee(
    db: AsyncSession = Depends(get_async_db),
    token: str = Depends(oauth2_scheme)
) -> Employee:
    return await EmployeeService.get_current_employee(db, token)

#员工登录
@router.post("/token", response_model=Token)
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
    token = EmployeeService.create_token(data={"sub": employee.email})
    # 返回包含部门和职位名称的员工信息及 Token
    return {
        "access_token": token
    }

#员工注册
@router.post("/register", response_model=api_response)
async def register(
    newEmployee: EmployeeInfo,
    db: AsyncSession = Depends(get_async_db)
):
    employee = await EmployeeService.create_employee(db, newEmployee)
    #返回员工信息
    return api_response(data={"employeeName": employee.name})

#获取员工权限信息
@router.get("/permission", response_model=EmployeePermission)
async def get_employee_permission(
    current_employee: Employee = Depends(get_current_employee)
):
    return EmployeePermission.from_model(current_employee)


#获取员工列表
@router.get("/employee/list", response_model=list[EmployeeListInfo])
async def get_employee_list(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    if current_employee.department.name != "人力资源部" or current_employee.position.name != "人事":
        raise HTTPException(status_code=403, detail="无权限访问")
    employees = await EmployeeService.get_employee_list(db)
    return employees

#根据id获取员工信息
@router.get("/employee/{id}", response_model=EmployeeInfo)
async def get_employee_info(
    id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    #判断当前用户身份
    if current_employee.department.name != "人力资源部" or current_employee.position.name != "人事":
        raise HTTPException(status_code=403, detail="无权限访问")
    
    employee = await EmployeeService.get_employee_by_id(db, id)
    return employee


#获取上级列表

@router.get("/manager/list", response_model=list[EmployeeListInfo])
async def get_employees(
    department_id: int, 
    role: str, 
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    #判断当前用户身份
    if current_employee.department.name != "人力资源部" or current_employee.position.name != "人事":
        raise HTTPException(status_code=403, detail="无权限访问")
    #获取上级列表
    employees = await EmployeeService.get_managers(db, department_id, role)
    return employees