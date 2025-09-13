from sqlalchemy import Column, DateTime, Integer, ForeignKey, String, Text, func
from sqlalchemy.orm import relationship
from ..db.session import Base


class ContractOperationLog(Base):
    __tablename__ = "contract_operation_log"
    
    id = Column(Integer, primary_key=True)
    contract_id = Column(Integer, ForeignKey("contract.id"), nullable=False)
    operator_id = Column(Integer, ForeignKey("employee.id"), nullable=False)
    operation_type = Column(String(50), nullable=False)  # 创建工单、修改工单、处理附属合同等
    operation_detail = Column(Text, nullable=True)  # 操作详情
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # 关系
    contract = relationship("Contract")
    operator = relationship("Employee")