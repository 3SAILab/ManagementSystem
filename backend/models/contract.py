import enum
from sqlalchemy import Boolean, Column, DateTime, Enum, Integer, ForeignKey, String, Text, Numeric, func
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
    prepayment_sales_id = Column(Integer, ForeignKey("employee.id"), nullable=True)  # 预付款销售ID
    final_payment_sales_id = Column(Integer, ForeignKey("employee.id"), nullable=True)  # 尾款销售ID
    is_recharged = Column(Boolean, nullable=False) #是否充值
    contract_type = Column(Enum(ContractType), nullable=False) #合同类型
    status = Column(String(50), nullable=False) #合同状态
    total_amount = Column(Numeric(12, 2), nullable=False) #总金额
    paid_amount = Column(Numeric(12, 2), nullable=False) #已支付金额
    commission_rate = Column(Numeric(5, 2), nullable=False) #佣金比例
    detail_pages = Column(Integer, nullable=False) #详情页数
    video_count = Column(Integer, nullable=False) #视频数
    image_count = Column(Integer, nullable=False) #图片数
    workflow_count = Column(Integer, nullable=False) #工作流数
    file_resource_id = Column(Integer, ForeignKey("file_resource.id", ondelete="SET NULL"), nullable=True) #文件资源ID
    transfer_date = Column(DateTime(timezone=True), nullable=True)  # 转移日期
    transaction_time = Column(DateTime(timezone=True), nullable=False) #合同成交时间
    settlement_time = Column(DateTime(timezone=True), nullable=True) #合同已结算时间
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False) #创建时间
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now()) #更新时间

    # 外键关联到 Client 表
    client = relationship("Client", back_populates="contracts")

    # 外键关联到 Employee 表
    sales = relationship("Employee",foreign_keys=[sales_id], back_populates="contracts")
    prepayment_sales = relationship("Employee",foreign_keys=[prepayment_sales_id], back_populates="prepayment_contracts")
    final_payment_sales = relationship("Employee",foreign_keys=[final_payment_sales_id], back_populates="final_payment_contracts")
    # 关联到 Ticket 表
    tickets = relationship("Ticket", back_populates="contract")
    # 关联到 FileResource 表
    file_resource = relationship("FileResource", foreign_keys=[file_resource_id], back_populates="contract")