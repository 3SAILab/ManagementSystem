import enum
from sqlalchemy import JSON, TIMESTAMP, Column, DateTime, Integer, String
from sqlalchemy.types import Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..db.session import Base


class ClientStatus(enum.Enum):
    刚开始跟进 = "刚开始跟进"
    跟进中 = "跟进中"
    已成交 = "已成交"
    客户流失 = "客户流失"
    试单中 = "试单中"
    复购 = "复购"

class ClientSource(enum.Enum):
    线上 = "线上"
    线下 = "线下"
    活动 = "活动"

class ClientScale(enum.Enum):
    小 = "小"
    中 = "中"
    大 = "大"

class Client(Base):
    __tablename__ = "client"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False) #客户名称
    contact_name = Column(String(50), nullable=False) #联系人
    contact_phone = Column(String(50), nullable=False) #联系电话
    address = Column(JSON, nullable=False) #地址
    source = Column(SQLEnum(ClientSource, name="client_source_enum", native_enum=False), nullable=False) #来源
    online_source = Column(String(100)) #线上来源
    activity_name = Column(String(100)) #活动名称
    product_type = Column(String(100)) #产品类型
    scale = Column(SQLEnum(ClientScale, name="client_scale_enum", native_enum=False), nullable=False) #规模
    status = Column(SQLEnum(ClientStatus, name="client_status_enum", native_enum=False), nullable=False) #状态
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False) #创建时间
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now()) #更新时间
    # 关联跟踪记录
    activity_logs = relationship("ClientActivityLog", back_populates="client")

    # 关联合同
    contracts = relationship("Contract", back_populates="client")