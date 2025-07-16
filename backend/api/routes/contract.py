from fastapi import APIRouter, Depends, Body
from backend.models.employee import Employee
from backend.models.contract import Contract
from backend.services.contract_service import ContractService
from backend.schemas.contract import ContractCreate
from backend.db.session import get_async_db
from sqlalchemy.ext.asyncio import AsyncSession
from backend.api.routes.employee import get_current_employee
from backend.utils.response import api_response

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
