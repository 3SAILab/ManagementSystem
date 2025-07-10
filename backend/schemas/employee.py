# Pydantic model for creating a user
from datetime import date
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, model_validator
from ..models.employee import Employee


class EmployeeCreate(BaseModel):
    name: str
    gender: Literal['male', 'female']
    email: EmailStr
    hire_date: date
    department_id: int
    position_id: int
    base_salary: float
    status: Literal['active', 'inactive', 'on_leave'] = 'active'
    role: Literal['employee', 'manager', 'admin'] = 'employee'
    is_probation: bool = True
    password: str = "123456qwerty"

    @model_validator(mode='after')
    def check_hire_date(self):
        if self.hire_date > date.today():
            raise ValueError("入职日期不能晚于今天")
        return self


# Pydantic model for reading user data (without password)
class EmployeeOut(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True

# token
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# 员工信息
class EmployeeInfo(BaseModel):
    name: str
    gender: Literal['male', 'female']
    email: EmailStr
    birth_date: Optional[date] = None
    department: str
    position: str
    manager: str
    hire_date: date
    is_probation: bool
    class Config:
        from_attributes = True

    @classmethod
    def from_model(cls, emp: Employee) -> 'EmployeeInfo':
        return cls(
            name=emp.name,
            gender=emp.gender.value if hasattr(emp.gender, 'value') else emp.gender,
            email=emp.email,
            birth_date=emp.birth_date,
            department=emp.department.name if emp.department else '',
            position=emp.position.name if emp.position else '',
            manager=emp.manager.name if emp.manager else '',
            hire_date=emp.hire_date,
            is_probation=emp.is_probation,
        )

    def to_model(self) -> Employee:
        return Employee(
            name=self.name,
            gender=self.gender,
            email=self.email,
            birth_date=self.birth_date,
            hire_date=self.hire_date,
            is_probation=self.is_probation,
        )

# 登录返回
class LoginResponse(BaseModel):
    employee: EmployeeInfo
    token: Token

# 注册返回
class RegisterResponse(BaseModel):
    employee: EmployeeInfo
    token: Token