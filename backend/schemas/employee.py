# Pydantic model for creating a user
from datetime import date
import re
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, model_validator, field_validator
from ..models.employee import Employee


# token
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# 员工权限信息
class EmployeePermission(BaseModel):
    name: str
    department_name: str
    position_name: str
    role: Literal['employee', 'manager', 'admin']
    is_probation: bool
    class Config:
        from_attributes = True

    @classmethod
    def from_model(cls, emp: Employee) -> 'EmployeePermission':
        return cls(
            name=emp.name,
            department_name=emp.department.name,
            position_name=emp.position.name,
            role=emp.role.value,
            is_probation=emp.is_probation,
        )

    def to_model(self) -> Employee:
        return Employee(
            name=self.name,
            department_name=self.department_name,
            position_name=self.position_name,
            role=self.role,
            hire_date=self.hire_date,
            is_probation=self.is_probation,
        )

#员工详细信息
class EmployeeInfo(BaseModel):
    name: str
    gender: Optional[Literal['male', 'female']] = None
    email: EmailStr
    phone: Optional[str] = None
    password: str = "123456qwerty"
    birth_date: Optional[date] = None
    hire_date: date
    department_id: int
    position_id: int
    manager_id: Optional[int] = None
    base_salary: float
    work_performance_score: Optional[float] = None
    attendance_performance_score: Optional[float] = None
    is_probation: bool
    status: Literal['active', 'inactive', 'on_leave']
    role: Literal['employee', 'manager', 'admin']
    address: Optional[dict] = None
    emergency_contact: Optional[dict] = None
    education: Optional[str] = None
    university: Optional[str] = None
    major: Optional[str] = None
    graduation_date: Optional[date] = None
    id_number: Optional[str] = None
    marital_status: Optional[str] = None
    bank_account: Optional[str] = None

    class Config:
        from_attributes = True

    @model_validator(mode='after')
    def check_hire_date(self):
        if self.hire_date > date.today():
            raise ValueError("入职日期不能晚于今天")
        return self
    
    @field_validator("phone")
    def validate_phone(cls, v):
        # 允许空值
        if v is None:
            return v
        if not re.match(r"^1[3-9]\d{9}$", v):
            raise ValueError("联系电话格式不正确")
        return v
    @field_validator("password")
    def validate_password(cls, v):
        if v is None or len(v) < 8:
            raise ValueError("密码长度不能少于8位")
        return v
    @field_validator("id_number")
    def validate_id_card(cls, v):
        # 允许空值
        if v is None:
            return v
        # 匹配 18 位身份证号，最后一位可能是数字或 X/x
        pattern = r"^\d{17}[\dXx]$"
        if not re.match(pattern, v):
            raise ValueError("身份证号码格式不正确")
        return v.title()  # 统一转为大写 X
    #从模型转换为信息
    @classmethod
    def from_model(cls, emp: Employee) -> 'EmployeeInfo':
        return cls(
            name=emp.name,
            gender=emp.gender.value if emp.gender else None,
            email=emp.email,
            phone=emp.phone,
            birth_date=emp.birth_date,
            hire_date=emp.hire_date,
            department_id=emp.department_id,
            position_id=emp.position_id,
            manager_id=emp.manager_id,
            base_salary=emp.base_salary,
            work_performance_score=emp.work_performance_score,
            attendance_performance_score=emp.attendance_performance_score,
            is_probation=emp.is_probation,
            status=emp.status.value if emp.status else None,
            role=emp.role.value,
            address=emp.address,
            emergency_contact=emp.emergency_contact,
            education=emp.education,
            university=emp.university,
            major=emp.major,
            graduation_date=emp.graduation_date,
            id_number=emp.id_number,
        )

    def to_model(self) -> Employee:
        return Employee(
            name=self.name,
            gender=self.gender,
            email=self.email,
            phone=self.phone,
            birth_date=self.birth_date,
            hire_date=self.hire_date,
            department_id=self.department_id,
            position_id=self.position_id,
            manager_id=self.manager_id,
            base_salary=self.base_salary,
            work_performance_score=self.work_performance_score,
            attendance_performance_score=self.attendance_performance_score,
            is_probation=self.is_probation,
            status=self.status,
            role=self.role,
            address=self.address,
            emergency_contact=self.emergency_contact,
            education=self.education,
            university=self.university,
            major=self.major,
            graduation_date=self.graduation_date,
            id_number=self.id_number,
            nationality=self.nationality,

        )


#员工在员工列表显示的信息
class EmployeeListInfo(BaseModel):
    id: int
    name: str
    email: str
    department_id: int
    position_id: int
    department_name: str
    position_name: str