from fastapi import APIRouter, Depends, Body
from backend.models.employee import Employee
from backend.schemas.contract import ContractOperationLogCreate, ContractOperationLogInfo
from backend.db.session import get_async_db
from sqlalchemy.ext.asyncio import AsyncSession
from backend.api.routes.employee import get_current_employee
from backend.services.contract_operation_log_service import ContractOperationLogService
from backend.utils.response import api_response
from backend.api.deps.auth import require_departments
from datetime import datetime, timedelta, timezone

router = APIRouter()

# 记录操作
@router.post("/contract-operations")
async def create_operation_log(
    log: ContractOperationLogCreate = Body(...),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    """记录合同相关操作"""
    result = await ContractOperationLogService.create_log(db, log, current_employee.id)
    return api_response(success=True, data=result)

# 获取操作记录
@router.get("/contract-operations/{contract_id}")
async def get_operation_logs(
    contract_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    """获取指定合同的操作记录"""
    logs = await ContractOperationLogService.get_logs_by_contract(db, contract_id)
    return api_response(success=True, data=logs)

# 获取最近操作记录（用于提示）
@router.get("/contract-operations/recent/{days}")
async def get_recent_operation_logs(
    days: int = 7,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    """获取最近几天的操作记录，用于美工主管提示"""
    logs = await ContractOperationLogService.get_recent_logs(db, days)
    return api_response(success=True, data=logs)

# 生产部门获取附属合同通知
@router.get("/notifications/appendix-contracts")
async def get_appendix_contract_notifications(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(require_departments("生产部"))
):
    """生产部门获取附属合同创建通知"""
    # 获取最近7天的附属合同创建记录
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=7)
    
    from sqlalchemy import select, and_
    from backend.models.contract_operation_log import ContractOperationLog
    
    result = await db.execute(
        select(ContractOperationLog.contract_id)
        .where(and_(
            ContractOperationLog.operation_type == "创建附属合同",
            ContractOperationLog.created_at >= cutoff_date
        ))
        .distinct()
    )
    
    contract_ids = [row[0] for row in result.all()]
    
    return api_response(success=True, data={
        "appendix_contracts": contract_ids,
        "count": len(contract_ids)
    })