# Pydantic model for creating a user
from datetime import date
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, model_validator
from ..models.employee import Employee

# token
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# 员工权限信息
class EmployeePermission(BaseModel):
    name: str
    department_id: int
    position_id: int
    role: Literal['普通员工', '组长', '主管']
    is_probation: bool
    class Config:
        from_attributes = True

    @classmethod
    def from_model(cls, emp: Employee) -> 'EmployeePermission':
        return cls(
            name=emp.name,
            department_id=emp.department_id,
            position_id=emp.position_id,
            role=emp.role.value,
            is_probation=emp.is_probation,
        )

    def to_model(self) -> Employee:
        return Employee(
            name=self.name,
            department_id=self.department_id,
            position_id=self.position_id,
            role=self.role,
            hire_date=self.hire_date,
            is_probation=self.is_probation,
        )

# 注册返回
class RegisterResponse(BaseModel):
    employee: EmployeePermission
    token: Token

#员工详细信息
class EmployeeInfo(BaseModel):
    name: str
    gender: Literal['male', 'female']
    email: str
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
    role: Literal['普通员工', '组长', '主管']
    address: Optional[dict] = None
    emergency_contact: Optional[dict] = None
    education: Optional[str] = None
    university: Optional[str] = None
    major: Optional[str] = None
    graduation_date: Optional[date] = None
    id_number: Optional[str] = None
    nationality: Optional[str] = None
    marital_status: Optional[str] = None
    bank_account: Optional[str] = None

    class Config:
        from_attributes = True

    @model_validator(mode='after')
    def check_hire_date(self):
        if self.hire_date > date.today():
            raise ValueError("入职日期不能晚于今天")
        return self
    #从模型转换为信息
    @classmethod
    def from_model(cls, emp: Employee) -> 'EmployeeInfo':
        return cls(
            name=emp.name,
            gender=emp.gender.value,
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
            status=emp.status.value,
            role=emp.role.value,
            address=emp.address,
            emergency_contact=emp.emergency_contact,
            education=emp.education,
            university=emp.university,
            major=emp.major,
            graduation_date=emp.graduation_date,
            id_number=emp.id_number,
            nationality=emp.nationality,
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