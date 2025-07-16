from pydantic import BaseModel
from datetime import date
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
    notes: str


# 添加合同
class ContractCreate(BaseModel):
    client_id: int
    contract_type: ContractType
    total_amount: float
    paid_amount: float
    commission_rate: float
    detail_pages: int
    video_count: int
    image_count: int
    workflow_count: int
    notes: str