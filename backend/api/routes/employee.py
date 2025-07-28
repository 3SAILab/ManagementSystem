from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Literal, Optional
from backend.models.employee import Employee
from backend.services.employee_service import EmployeeService
from backend.utils.response import api_response
from ...db.session import get_async_db
from ...schemas.employee import EmployeePermission, Token, EmployeeInfo, EmployeeListInfo
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import Query
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

async def get_current_employee(
    db: AsyncSession = Depends(get_async_db),
    token: Optional[str] = Depends(oauth2_scheme),
    access_token: Optional[str] = Cookie(None)
) -> Employee:
    """
    获取当前登录的员工信息
    优先从Authorization头获取令牌，如果没有则从Cookie获取
    """
    
    # 如果没有从Authorization头获取到令牌，尝试从Cookie获取
    if not token and access_token:
        # 从Cookie中提取Bearer令牌
        if access_token.startswith("Bearer "):
            token = access_token[7:]
        else:
            token = access_token
            
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="未提供认证凭据",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return await EmployeeService.get_current_employee(db, token)

#员工登录
@router.post("/token", response_model=Token)
async def login(
    response: Response,
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
    
    # 设置HttpOnly Cookie
    response.set_cookie(
        key="access_token",
        value=f"Bearer {token}",
        httponly=True,
        secure=False,  # 生产环境应设为True，使用HTTPS
        samesite="lax",
        max_age=60*60*24,  # 24小时，与token过期时间一致
        path="/"
    )
    
    # 返回包含访问令牌的响应
    return {"access_token": token, "token_type": "bearer"}

#员工注册
@router.post("/register", response_model=api_response)
async def register(
    newEmployee: EmployeeInfo,
    db: AsyncSession = Depends(get_async_db),
):
    #判断权限
    #开发环境无需权限
    
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
    if current_employee.department.name != "人事行政部":
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
    if current_employee.department.name != "人事行政部":
        raise HTTPException(status_code=403, detail="无权限访问")
    
    employee = await EmployeeService.get_employee_by_id(db, id)
    return employee


#获取上级列表
@router.get("/manager/list", response_model=list[EmployeeListInfo])
async def get_managers(
    department_id: int = Query(...),
    role: Literal['employee', 'manager', 'admin'] = Query(...),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    #判断当前用户身份
    if current_employee.department.name != "人事行政部":
        raise HTTPException(status_code=403, detail="无权限访问")
    #获取上级列表
    employees = await EmployeeService.get_managers(db, department_id, role)
    return employees


#编辑员工工作信息
@router.put("/employee/work-info/{id}", response_model=EmployeeInfo)
async def update_employee_work_info(
    id: int,
    employee: EmployeeInfo,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    #判断当前用户身份
    if current_employee.department.name != "人事行政部":
        raise HTTPException(status_code=403, detail="无权限访问")
    #修改员工信息
    return await EmployeeService.update_employee_work_info(db, id, employee)

#获取组内成员以及工作负载
@router.get("/group/members/with_task_count")
async def get_group_members_with_task_count(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    #判断当前用户身份
    if current_employee.department.name == "生产部":
        #获取组内成员以及工作负载(成员未完成的任务个数)
        employees = await EmployeeService.get_group_members_with_task_count(db, current_employee.id)
        return employees
    else:
        raise HTTPException(status_code=403, detail="无权限访问")

#登出
@router.post("/logout")
async def logout(response: Response):
    """
    登出并清除HttpOnly Cookie
    """
    logger.info("用户登出，清除Cookie")
    response.delete_cookie(
        key="access_token",
        path="/",
        httponly=True,
        secure=False,  # 生产环境应设为True
        samesite="lax"
    )
    return {"message": "登出成功"}


#获取组内成员列表
@router.get("/group/members")
async def get_group_members(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    #判断当前用户身份
    #获取组内成员列表
    employees = await EmployeeService.get_group_members(db, current_employee.id)
    return employees
    

