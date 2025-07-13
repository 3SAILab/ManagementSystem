from datetime import datetime, timedelta, timezone
import logging
from typing import Optional
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
import bcrypt
from jose import JWTError, jwt
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload, joinedload
from backend.models.department import Department
from backend.models.employee import Employee
from backend.models.position import Position
from backend.schemas.employee import EmployeePermission, EmployeeInfo, EmployeeListInfo

# JWT相关配置
SECRET_KEY = "your-secret-key"  # 在生产环境中应该使用环境变量
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60*24  # 二十四小时

class EmployeeService:
    #验证密码
    @staticmethod
    def verify_password(plain_password: str, password_hash: str) -> bool:
        return bcrypt.checkpw(plain_password.encode('utf-8'), password_hash.encode('utf-8'))
    
    #生成哈希密码
    @staticmethod
    def get_password_hash(password: str) -> str:
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        return hashed_password.decode('utf-8')
    
    #创建Token
    @staticmethod
    def create_token(data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    #登录验证
    @staticmethod
    async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[Employee]:
        result = await db.execute(
            select(Employee)
            .options(
                selectinload(Employee.department),
                selectinload(Employee.position),
            )
            .where(Employee.email == email)
        )
        employee = result.scalars().first()
        if not employee or not EmployeeService.verify_password(password, employee.password_hash):
            return None
        return employee
    
    #创建新员工
    @staticmethod
    async def create_employee(db: AsyncSession, newEmployee: EmployeeInfo):
        try:
            # 检查邮箱是否已存在
            result = await db.execute(select(Employee).where(Employee.email == newEmployee.email))
            if result.scalars().first():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="邮箱已被使用"
                )
            
            password_hash = EmployeeService.get_password_hash(newEmployee.password)
            employee = Employee(
                **newEmployee.model_dump(exclude={"password"}),
                password_hash=password_hash,
                created_at=datetime.now(timezone.utc),
            )
            db.add(employee)
            await db.commit()
            print("注册成功", employee.name)
            await db.refresh(employee)
            return employee
        except Exception as e:
            await db.rollback()
            print(f"数据库提交失败，原始错误: {e}")  # 打印详细错误
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="注册失败，请稍后重试"
            )
    
    #获取当前员工权限信息
    @staticmethod
    async def get_current_employee(db: AsyncSession, token: str) -> Employee:
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无法验证凭据",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email: str = payload.get("sub")
            logging.info(f"当前用户邮箱: {email}")
            if email is None:
                raise credentials_exception
        except JWTError:
            raise credentials_exception
        result = await db.execute(
            select(Employee)
            .options(
                selectinload(Employee.department),
                selectinload(Employee.position),
            )
            .where(Employee.email == email)
        )
        employee = result.scalars().first()
        if not employee:
            raise credentials_exception
        return employee
    
    #根据id获取员工信息
    @staticmethod
    async def get_employee_by_id(db: AsyncSession, id: int) -> EmployeeInfo:
        result = await db.execute(select(Employee).where(Employee.id == id))
        employee = result.scalars().first()
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="员工不存在"
            )
        return EmployeeInfo.from_model(employee)
    
    #获取员工列表
    @staticmethod
    async def get_employee_list(db: AsyncSession) -> list[EmployeeListInfo]:
        # 查询 Employee 实体并预加载关联关系
        stmt = select(Employee).options(
            selectinload(Employee.department),
            selectinload(Employee.position),
        )
        result = await db.execute(stmt)
        emps = result.scalars().all()
        # 构造返回列表
        return [
            EmployeeListInfo(
                id=e.id,
                name=e.name,
                email=e.email,
                department_id=e.department.id,
                position_id=e.position.id,
                department_name=e.department.name,
                position_name=e.position.name
            )
            for e in emps
            ] 
    
    #获取上级列表
    LEVEL_HIERARCHY = {
        "admin": 3,
        "manager": 2,
        "employee": 1
    }

    @staticmethod
    async def get_managers(
        db: AsyncSession, 
        department_id: int, 
        current_level: str
    ) -> list[EmployeeListInfo]:
        """
        获取同部门中级别高于当前级别的员工
        """
        current_level_value = EmployeeService.LEVEL_HIERARCHY.get(current_level)
        if not current_level_value:
            raise HTTPException(status_code=400, detail="无效的级别")

        higher_levels = [
            level for level, value in EmployeeService.LEVEL_HIERARCHY.items()
            if value > current_level_value
        ]

        result = await db.execute(
            select(Employee)
            .options(
                selectinload(Employee.department),
                selectinload(Employee.position),
            )
            .where(
                Employee.department_id == department_id,
                Employee.role.in_(higher_levels)
            )
        )
        emps = result.scalars().all()
        # 构造返回列表
        return [
            EmployeeListInfo(
                id=e.id,
                name=e.name,
                email=e.email,
                department_id=e.department.id,
                position_id=e.position.id,
                department_name=e.department.name,
                position_name=e.position.name
            )
            for e in emps
        ] 
    
    #修改员工工作信息
    @staticmethod
    async def update_employee_work_info(db: AsyncSession, id: int, employee: EmployeeInfo):
       try:
           existing = await db.execute(select(Employee).where(Employee.id==id))
           if not existing:
               raise HTTPException(404, "员工不存在")
           await db.execute(update(Employee).where(Employee.id==id).values(**employee.model_dump(exclude_unset=True)))
           await db.commit()
           return employee
       except Exception as e:
           await db.rollback()
           raise HTTPException(500, f"系统错误: {str(e)}")