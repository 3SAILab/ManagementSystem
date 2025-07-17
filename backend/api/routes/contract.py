from fastapi import APIRouter, Depends, Body, Query
from backend.models.employee import Employee
from backend.models.contract import Contract
from backend.services.contract_service import ContractService
from backend.schemas.contract import ContractCreate, ContractFilter, ContractList, PaginatedContract
from backend.db.session import get_async_db
from sqlalchemy.ext.asyncio import AsyncSession
from backend.api.routes.employee import get_current_employee
from backend.utils.response import api_response
from typing import List

router = APIRouter()

# 添加合同
@router.post("/contracts")
async def add_contract(
    contract: ContractCreate = Body(...),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    #权限认证
    
    return await ContractService.add_contract(db, contract, current_employee.id)

# 获取合同
@router.get("/contracts")
async def get_contracts(
    name: str = Query(None),
    status: List[str] = Query(None),
    contract_type: List[str] = Query(None),
    page: int = Query(1),
    page_size: int = Query(10),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    #权限认证
    """
    查询合同列表，支持客户名称、状态、合同类型筛选与分页
    """

    filter_params = ContractFilter(name=name, status=status, contract_type=contract_type, page=page, page_size=page_size)
    contracts, total = await ContractService.get_contracts(db, filter_params, current_employee.id)

    total_pages = (total + page_size - 1) // page_size  # 正确的分页计算

    #将Client对象转换为ClientOut对象
    contracts_out = [
        ContractList(
            id=contract.id,
            client_name=contract.client.name,
            contract_type=contract.contract_type.value,
            total_amount=contract.total_amount,
            paid_amount=contract.paid_amount,
            commission_rate=contract.commission_rate,
            created_at=contract.created_at
        ) 
        for contract in contracts
    ]
    # 构造分页响应并导出为 dict
    paginated = PaginatedContract(
        contracts=contracts_out, 
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )
    return paginated.model_dump()
