from sqlalchemy import Column, DateTime, Integer, String, BigInteger, Boolean, ForeignKey, text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..db.session import Base


class FileResource(Base):
    __tablename__ = "file_resource"

    id = Column(Integer, primary_key=True, autoincrement=True)  # SERIAL 类型

    original_filename = Column(String(255), nullable=False)  # 原始文件名
    stored_filename = Column(String(255), nullable=False, unique=True)  # 存储文件名（唯一）合同成交时间+客户名称
    storage_path = Column(String(500), nullable=False)  # 存储路径
    uploaded_user_id = Column(Integer, ForeignKey("employee.id", ondelete="SET NULL"), nullable=True)  # 上传用户ID
    file_type = Column(String(100))  # MIME 类型，如 image/jpeg
    file_size = Column(BigInteger, nullable=False)  # 文件大小（字节）
    is_deleted = Column(Boolean, server_default=text('false'), nullable=False)  # 是否删除
    upload_time = Column(DateTime(timezone=True), server_default=func.now())  # 上传时间
    deleted_at = Column(DateTime(timezone=True), nullable=True)  # 软删除时间，NULL表示未删

    # 创建时间与更新时间（可选，用于审计）
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 关联到 Employee 表
    employee = relationship("Employee", foreign_keys=[uploaded_user_id], back_populates="file_resources")

    # 定义与 Contract 的一对一关系
    contract = relationship("Contract", back_populates="file_resource")