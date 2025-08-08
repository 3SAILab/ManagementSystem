from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy import update, func, or_, and_
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
import bcrypt
from jose import JWTError, jwt
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from backend.models.department import Department
from backend.models.employee import Employee
from backend.models.employee import EmployeeStatus
from backend.models.position import Position
from backend.schemas.employee import EmployeeInfo, EmployeeListInfo
from backend.models.sub_task import SubTask
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
    
    #根据邮箱获取员工信息
    @staticmethod
    async def get_employee_by_email(db: AsyncSession, email: str) -> Employee:
        result = await db.execute(select(Employee).where(Employee.email == email))
        employee = result.scalars().first()
        return employee

    # 重置密码
    @staticmethod
    async def reset_password(db: AsyncSession, email: str, new_password: str):
        # 正确获取查询结果
        result = await db.execute(select(Employee).where(Employee.email == email).with_for_update())
        employee = result.scalar_one_or_none()  # 获取单个结果或 None
        
        if not employee:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="员工不存在")
        # 验证密码是否重复
        if EmployeeService.verify_password(new_password, employee.password_hash):
            return {"success":False,"message": "新密码不能和旧密码相同"}
        # 更新密码
        employee.password_hash = EmployeeService.get_password_hash(new_password)
        await db.flush()  
        await db.refresh(employee)  # 刷新对象状态
        
        return {"success":True,"message": "密码重置成功"}

    #创建新员工
    @staticmethod
    async def create_employee(db: AsyncSession, new_employee: EmployeeInfo) -> Employee:
        # 1. 准备插入值
        values = {
            **new_employee.model_dump(exclude={"password"}),
            "password_hash": EmployeeService.get_password_hash(new_employee.password),
            "created_at": datetime.now(timezone.utc),
        }

        # 2. 构造 UPSERT 语句，冲突时跳过并返回实体
        stmt = (
            insert(Employee)
            .values(**values)
            .on_conflict_do_nothing(index_elements=[Employee.email])
            .returning(Employee)
        )

        result = await db.execute(stmt)
        employee = result.scalar_one_or_none()

        if not employee:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="邮箱已被使用"
            )
        return employee

    
    #获取当前员工权限信息
    @staticmethod
    async def get_current_employee(db: AsyncSession, token: str) -> Employee:
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无法验证凭据",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
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
        "owner": 4,
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
        result = await db.execute(select(Employee).where(Employee.id == id).with_for_update())
        existing = result.scalar()  # 获取单个对象，如果没有则返回 None
        if not existing:
            raise HTTPException(404, "员工不存在")
        await db.execute(update(Employee).where(Employee.id==id).values(**employee.model_dump(exclude_unset=True)))
        await db.flush()
        await db.refresh(existing)
        return existing
       
    #获取组内成员以及工作负载
    @staticmethod
    async def get_group_members_with_task_count(db: AsyncSession, employee_id: int):
        # 统计所有任务
        stmt = (
            select(
                Employee.id,
                Employee.name,
                func.count(SubTask.id).label("task_count")
            )
            .outerjoin(SubTask, and_(SubTask.charge_id == Employee.id, SubTask.status != "已完成"))  # 使用outerjoin确保没有任务的员工也被包含
            .where(
                and_(
                    or_(
                    Employee.id == employee_id,
                    Employee.manager_id == employee_id
                    ),
                    Employee.status != EmployeeStatus.inactive
                )
            )
            .order_by(Employee.id)
            .group_by(Employee.id, Employee.name)
        )
        result = await db.execute(stmt)
        rows = result.all()
        
        return [
            {"id": id, "name": name, "task_count": task_count}
            for id, name, task_count in rows
        ]

    #获取组内成员
    @staticmethod
    async def get_group_members(db: AsyncSession, employee_id: int):
        # 获取组内成员
        stmt = select(Employee).where(and_(or_( Employee.id == employee_id, Employee.manager_id == employee_id), Employee.status != EmployeeStatus.inactive )).order_by(Employee.id)
        result = await db.execute(stmt)
        emps = result.scalars().all()
        return emps

    # 获取对应职位、部门、级别的员工列表(id,name)
    @staticmethod
    async def get_employee_list_by_filter(db: AsyncSession, position_name: str = None, department_name: str = None, level: str = None):
        stmt = select(Employee.id, Employee.name)
        if position_name:
            stmt = stmt.where(Employee.position.has(Position.name == position_name))
        if department_name:
            stmt = stmt.where(Employee.department.has(Department.name == department_name))
        if level:
            stmt = stmt.where(Employee.role == level)
        result = await db.execute(stmt)
        rows = result.all()
        return [{"id": id, "name": name} for id, name in rows]