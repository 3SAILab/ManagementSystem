import enum
from sqlalchemy import Column, Integer, String, Numeric, Date, Boolean, ForeignKey, JSON, DateTime, Enum, func
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
    name = Column(String(100), nullable=False) #姓名
    gender = Column(Enum(GenderEnum)) #性别
    email = Column(String(255), unique=True, nullable=False) #邮箱
    phone = Column(String(50)) #手机号
    birth_date = Column(Date) #出生日期
    hire_date = Column(Date, nullable=False) #入职日期
    department_id = Column(Integer, ForeignKey("department.id"), nullable=False) #部门ID
    position_id = Column(Integer, ForeignKey("position.id"), nullable=False) #职位ID
    manager_id = Column(Integer, ForeignKey("employee.id")) #上级ID

    base_salary = Column(Numeric(12, 2), nullable=False) #基本工资
    work_performance_score = Column(Numeric(10, 2)) #工作绩效工资
    attendance_performance_score = Column(Numeric(10, 2)) #出勤绩效工资
    total_salary = Column(Numeric(12, 2)) #总工资

    is_probation = Column(Boolean, nullable=False) #是否试用期
    password_hash = Column(String(255), nullable=False) #密码
    status = Column(Enum(EmployeeStatus), nullable=False) #状态
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False) #创建时间
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now()) #更新时间

    address = Column(JSON) #地址
    role = Column(Enum(EmployeeRole), nullable=False) #角色
    emergency_contact = Column(JSON) #紧急联系人
    education = Column(String(50)) #学历
    university = Column(String(100)) #毕业院校
    major = Column(String(100)) #专业
    graduation_date = Column(Date) #毕业日期
    id_number = Column(String(18)) #身份证号
    marital_status = Column(String(20)) #婚姻状况
    bank_account = Column(String(50)) #银行账号

    # 如果需要自引用外键关系，可以加上下面这一行
    manager = relationship("Employee", remote_side=[id])
    # 定义与 Department 的多对一关系
    department = relationship("Department", back_populates="employees")
    # 定义与 Position 的多对一关系
    position = relationship("Position", back_populates="employees")
    # 定义与 Contract 的一对多关系（一个员工可以有多个合同）
    contracts = relationship("Contract", back_populates="sales")
    # 定义与 客户跟进记录 的一对多关系（一个员工处理的活动记录）
    activity_logs = relationship("ClientActivityLog", back_populates="sales")
    # 定义与 Client 的一对多关系（一个员工可以有多个客户）
    clients = relationship("Client", back_populates="sales")