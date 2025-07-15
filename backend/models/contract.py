import enum
from sqlalchemy import Column, Enum, Integer, ForeignKey, Text, TIMESTAMP, Numeric
from sqlalchemy.orm import relationship
from ..db.session import Base

class ContractType(enum.Enum):
    试单 = "试单"
    首单 = "首单"
    复购 = "复购"


class Contract(Base):
    __tablename__ = "contract"

    id = Column(Integer, primary_key=True) #合同ID
    client_id = Column(Integer, ForeignKey("client.id"), nullable=False) #客户ID
    sales_id = Column(Integer, ForeignKey("employee.id"), nullable=False) #销售ID
    contract_type = Column(Enum(ContractType), nullable=False) #合同类型
    total_amount = Column(Numeric(12, 2), nullable=False) #总金额
    paid_amount = Column(Numeric(12, 2), nullable=False) #已支付金额
    commission_rate = Column(Numeric(5, 2), nullable=False) #佣金比例
    detail_pages = Column(Integer, nullable=False) #详情页数
    video_count = Column(Integer, nullable=False) #视频数
    image_count = Column(Integer, nullable=False) #图片数
    workflow_count = Column(Integer, nullable=False) #工作流数
    notes = Column(Text) #备注
    created_at = Column(TIMESTAMP(timezone=False), nullable=False) #创建时间
    updated_at = Column(TIMESTAMP(timezone=False)) #更新时间

    # 外键关联到 Client 表
    client = relationship("Client", back_populates="contracts")

    # 外键关联到 Employee 表
    sales = relationship("Employee", back_populates="contracts")