from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
import bcrypt
from jose import JWTError, jwt
from sqlalchemy import select
from backend.models.employee import Employee
from backend.schemas.employee import EmployeeCreate

# JWT相关配置
SECRET_KEY = "your-secret-key"  # 在生产环境中应该使用环境变量
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24小时

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
    def create_access_token(data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    #登录验证
    @staticmethod
    async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[Employee]:
        result = await db.execute(select(Employee).where(Employee.email == email))
        employee = result.scalars().first()
        if not employee or not EmployeeService.verify_password(password, employee.password_hash):
            return None
        return employee
    
    #创建新员工
    @staticmethod
    async def create_employee(db: AsyncSession, newEmployee: EmployeeCreate):
        # 检查邮箱是否已存在
        result = await db.execute(select(Employee).where(Employee.email == newEmployee.email))
        if result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="邮箱已被使用"
            )
        
        # 哈希密码
        password_hash = EmployeeService.get_password_hash(newEmployee.password)
        
        employee = Employee(
            name=newEmployee.name,
            gender=newEmployee.gender,
            email=newEmployee.email,
            hire_date=newEmployee.hire_date,
            department=newEmployee.department,
            position=newEmployee.position,
            status=newEmployee.status,
            role=newEmployee.role,
            is_probation=newEmployee.is_probation,
            base_salary=newEmployee.base_salary,
            password_hash=password_hash,
            created_at=datetime.now(timezone.utc),
        )
        db.add(employee)
        
        try:
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
    
    #更新员工