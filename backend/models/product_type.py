from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..db.session import Base


class ProductType(Base):
    __tablename__ = "product_type"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)  # 产品类型名称
    is_active = Column(Boolean, nullable=False, default=True)  # 软删除标记
    sort_order = Column(Integer, nullable=False, default=0)  # 排序字段
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # 关联工单
    tickets = relationship("Ticket", back_populates="product_type")