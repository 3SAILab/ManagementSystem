# models/employee.py

import enum
from sqlalchemy import Column, Integer, String, Numeric, Date, Boolean, ForeignKey, JSON, DateTime, Enum
from sqlalchemy.orm import relationship
from ..db.session import Base

#性别
class GenderEnum(enum.Enum):
    male = "male"
    female = "female"

#员工状态
class EmployeeStatus(enum.Enum):
    active = "active"
    inactive = "inactive"
    on_leave = "on_leave"   

#用户角色
class EmployeeRole(enum.Enum):
    employee = "employee"
    manager = "manager"
    admin = "admin"

class Employee(Base):
    __tablename__ = "employee"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    gender = Column(Enum(GenderEnum), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20))
    birth_date = Column(Date)
    hire_date = Column(Date, nullable=False)
    department = Column(String(100), nullable=False)
    position = Column(String(100), nullable=False)
    manager_id = Column(Integer, ForeignKey("employee.id"), nullable=True)

    base_salary = Column(Numeric(12, 2), nullable=False)
    work_performance_score = Column(Numeric(5, 2))
    attendance_performance_score = Column(Numeric(5, 2))
    total_salary = Column(Numeric(12, 2))

    is_probation = Column(Boolean, nullable=False)
    password_hash = Column(String(255), nullable=False)
    status = Column(Enum(EmployeeStatus), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False)
    updated_at = Column(DateTime(timezone=True))

    address = Column(String)
    role = Column(Enum(EmployeeRole), nullable=False)
    emergency_contact = Column(JSON)
    education = Column(String(50))
    university = Column(String(100))
    major = Column(String(100))
    graduation_date = Column(Date)
    id_number = Column(String(18))
    nationality = Column(String(50))
    marital_status = Column(String(20))
    bank_account = Column(String(50))

    # 如果需要自引用外键关系，可以加上下面这一行
    manager = relationship("Employee", remote_side=[id])