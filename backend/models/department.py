from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..db.session import Base


class Department(Base):
    __tablename__ = "department"

    id = Column(Integer, primary_key=True, autoincrement=True)  # SERIAL 类型
    name = Column(String(100), nullable=False, unique=True, index=True)                  # 部门名称
    created_at = Column(DateTime(timezone=True), server_default=func.now())              # 创建时间
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now()) # 更新时间

    positions = relationship("Position", back_populates="department", cascade="all, delete-orphan")
    employees = relationship("Employee", back_populates="department")