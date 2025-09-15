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
    notes: Optional[str] = None  # 合同备注
    parent_contract_id: Optional[int] = None  # 主合同ID（附属合同用）
    is_appendix: bool = False  # 是否为附属合同
    
# 合同列表
class ContractList(BaseModel):
    id: int
    client_id: Optional[int] = None
    client_name: str
    sales_name: str
    contract_type: ContractType
    total_amount: float
    paid_amount: float
    commission_rate: Optional[float] = None
    transaction_time: datetime
    status: str
    is_recharged: bool
    settlement_time: Optional[datetime] = None
    client_source: Optional[str] = None
    prepayment_commission: Optional[float] = None
    final_payment_commission: Optional[float] = None
    notes: Optional[str] = None  # 合同备注
    is_appendix: bool = False  # 是否为附属合同
    parent_contract_id: Optional[int] = None  # 主合同ID
    appendix_count: Optional[int] = 0  # 附属合同数量
    aggregated_total_amount: Optional[float] = None  # 聚合总金额（主+附属）
    aggregated_paid_amount: Optional[float] = None  # 聚合已付金额（主+附属）
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

# 操作记录相关schemas
class ContractOperationLogCreate(BaseModel):
    contract_id: int
    operation_type: str  # 操作类型：创建工单、修改工单、处理附属合同等
    operation_detail: Optional[str] = None  # 操作详情

class ContractOperationLogInfo(BaseModel):
    id: int
    contract_id: int
    operator_id: int
    operator_name: str
    operation_type: str
    operation_detail: Optional[str] = None
    created_at: datetime
    
# 合同详情（包含附属合同）
class ContractDetailWithAppendix(BaseModel):
    id: int
    client_name: str
    sales_name: str
    total_amount: float
    paid_amount: float
    notes: Optional[str] = None
    appendix_contracts: List['ContractDetailWithAppendix'] = []
    aggregated_total_amount: float  # 总金额（包含附属）
    aggregated_paid_amount: float   # 已付金额（包含附属）
    
# 美工主管合同管理列表
class ContractForProduction(BaseModel):
    id: int
    client_name: str
    sales_name: str
    total_amount: float
    paid_amount: float
    notes: Optional[str] = None
    has_new_appendix: bool = False  # 是否有新的附属合同需要处理
    last_updated: datetime
    appendix_contracts: List['ContractForProduction'] = []
