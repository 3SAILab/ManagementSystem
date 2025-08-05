from sqlalchemy import (
    Boolean, Column, DateTime, Integer, String, Text, TIMESTAMP, ForeignKey, func
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from ..db.session import Base

class Ticket(Base):
    __tablename__ = 'ticket'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False) #工单名称
    contract_id = Column(Integer, ForeignKey('contract.id'), nullable=False) #合同ID
    need_shoot = Column(Boolean, nullable=False, default=False, server_default='false') #是否需要拍摄
    detail_pages = Column(Integer, nullable=False, default=0) #详情页数量
    video_count = Column(Integer, nullable=False, default=0) #视频数量
    image_count = Column(Integer, nullable=False, default=0) #图片数量
    workflow_count = Column(Integer, nullable=False, default=0) #工作流数量
    wechat_group = Column(String(200), nullable=False) #微信群
    notes = Column(Text, nullable=True) #备注
    priority = Column(String(100), nullable=False)  # 高、中、低
    platform = Column(String(100), nullable=False)  # 国内、国外
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False) #创建时间
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now()) #更新时间

    # 关联子任务(工单删除时，子任务也删除)
    sub_tasks = relationship("SubTask", back_populates="ticket", cascade="all, delete-orphan")
    
    # 关联合同
    contract = relationship("Contract", back_populates="tickets")