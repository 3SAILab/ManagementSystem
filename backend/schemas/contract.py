from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from backend.models.contract import ContractType

# 合同信息
class ContractInfo(BaseModel):
    id: int
    client_id: int
    sales_id: int
    contract_type: ContractType
    total_amount: float
    paid_amount: float
    commission_rate: float
    detail_pages: int
    video_count: int
    image_count: int
    workflow_count: int


# 添加合同
class ContractCreate(BaseModel):
    client_id: int
    contract_type: ContractType
    total_amount: float
    paid_amount: float
    commission_rate: Optional[float] = None
    detail_pages: int
    video_count: int
    image_count: int
    workflow_count: int
    transaction_time: datetime
    is_recharged: bool
    file_resource_id: Optional[int] = None
    
# 合同列表
class ContractList(BaseModel):
    id: int
    client_name: str
    sales_name: str
    contract_type: ContractType
    total_amount: float
    paid_amount: float
    commission_rate: float
    transaction_time: datetime
    status: str
    is_recharged: bool
    settlement_time: Optional[datetime] = None
    client_source: Optional[str] = None
    prepayment_commission: float
    final_payment_commission: float
# 合同过滤
class ContractFilter(BaseModel):
    name: Optional[str] = None
    status: Optional[List[str]] = None
    contract_type: Optional[List[str]] = None
    source: Optional[List[str]] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    page: int = 1
    page_size: int = 10     

# 分页合同
class PaginatedContract(BaseModel):
    contracts: List[ContractList]
    total: int
    page: int
    page_size: int
    total_pages: int
