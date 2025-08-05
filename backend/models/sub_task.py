from datetime import datetime, timezone, timedelta
from sqlalchemy import (
    Column, DateTime, Integer, String, ForeignKey, func, text, Float
)
from sqlalchemy.orm import relationship
from ..db.session import Base

class SubTask(Base):
    __tablename__ = 'sub_task'

    id = Column(Integer, primary_key=True)
    ticket_id = Column(Integer, ForeignKey('ticket.id', ondelete='CASCADE'), nullable=False)
    task_type = Column(String(100), nullable=False)  # 美工、渲染
    status = Column(String(100), nullable=False)  # 未分配、未开始、修改中、已完工
    progress = Column(Integer, nullable=False) # 进度(0-100)
    edit_count = Column(Integer, nullable=False) # 修改次数
    estimated_completion_time = Column(Integer, server_default=text("2"), nullable=True) # 预计完成时间 /天
    difficulty_score = Column(Float, nullable=True) # 难度系数 任务系数
    assignee_id = Column(Integer, ForeignKey('employee.id'), nullable=True) # 分配人    
    charge_id = Column(Integer, ForeignKey('employee.id'), nullable=True) # 负责人
    assigned_at = Column(DateTime(timezone=True), nullable=True) #分配时间
    started_at = Column(DateTime(timezone=True), nullable=True) #开始时间
    completed_at = Column(DateTime(timezone=True), nullable=True) #完成时间
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False) #创建时间
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now()) #更新时间

    # 外键关联员工表
    assignee = relationship("Employee", foreign_keys=[assignee_id])
    charge = relationship("Employee", foreign_keys=[charge_id])

    # 关联工单表
    ticket = relationship("Ticket", back_populates="sub_tasks")
    # 关联进度日志表(子任务删除，进度日志全部删除)
    progress_logs = relationship("ProgressLog", back_populates="sub_task", cascade="all, delete-orphan")

