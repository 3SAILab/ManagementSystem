from sqlalchemy import Column, DateTime, Integer, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from ..db.session import Base


class ProgressLog(Base):
    __tablename__ = 'progress_log'

    id = Column(Integer, primary_key=True)
    sub_task_id = Column(Integer, ForeignKey('sub_task.id'), nullable=False) #对应子任务
    notes = Column(Text, nullable=True)    #进度说明
    log_time = Column(DateTime(timezone=True), server_default=func.now()) #记录时间

    # 外键关联子任务表
    sub_task = relationship("SubTask", foreign_keys=[sub_task_id])