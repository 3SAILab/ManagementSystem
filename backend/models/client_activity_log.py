import enum
from sqlalchemy import Column, DateTime, Integer, ForeignKey, Text
from sqlalchemy.types import Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.models.client import ClientStatus
from ..db.session import Base


class Status(enum.Enum):
    刚开始跟进 = "刚开始跟进"
    跟进中 = "跟进中"
    已成交 = "已成交"
    客户流失 = "客户流失"
    试单中 = "试单中"
    复购 = "复购"
    更换负责人 = "更换负责人"

class ClientActivityLog(Base):
    __tablename__ = "client_activity_log"

    id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey("client.id"), nullable=False) #客户ID
    sales_id = Column(Integer, ForeignKey("employee.id"), nullable=False) #销售ID
    status = Column(SQLEnum(Status, name="client_log_status_enum"), nullable=False) #状态
    log_content = Column(Text, nullable=False) #跟进内容
    log_time = Column(DateTime(timezone=True), server_default=func.now()) #跟进时间

    # 外键关联到 Client 表
    client = relationship("Client", back_populates="activity_logs")

    # 外键关联到 Employee 表
    sales = relationship("Employee", back_populates="activity_logs")