# Pydantic model for creating a user
from datetime import date
from typing import Literal
from pydantic import BaseModel, model_validator


class EmployeeCreate(BaseModel):
    name: str
    gender: Literal['male', 'female']
    email: str 
    hire_date: date
    department: str
    position: str
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

# Pydantic model for the token
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"