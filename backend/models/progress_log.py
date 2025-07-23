from sqlalchemy import Column, DateTime, Integer, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from ..db.session import Base


class ProgressLog(Base):
    __tablename__ = 'progress_log'

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey('employee.id'), nullable=False) #对应员工
    sub_task_id = Column(Integer, ForeignKey('sub_task.id'), nullable=False)
    notes = Column(Text, nullable=True)    #进度说明
    log_time = Column(DateTime(timezone=True), server_default=func.now()) #记录时间

    # 关联任务表
    sub_task = relationship("SubTask", back_populates="progress_logs")
    # 外键关联员工表
    employee = relationship("Employee", foreign_keys=[employee_id])