from sqlalchemy import Column, DateTime, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..db.session import Base


class Position(Base):
    __tablename__ = 'position'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)  # 职位名称
    department_id = Column(Integer, ForeignKey('department.id'))  # 外键约束
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 定义与 department 表的多对一关系（一个职位属于一个部门）
    department = relationship("Department", back_populates="positions")
    # 定义与 Employee 的一对多关系（一个职位有多个员工）
    employees = relationship("Employee", back_populates="position")
