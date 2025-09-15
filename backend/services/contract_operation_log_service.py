from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from backend.models.contract_operation_log import ContractOperationLog
from backend.models.employee import Employee
from backend.schemas.contract import ContractOperationLogCreate, ContractOperationLogInfo
from datetime import datetime, timedelta, timezone
from typing import List

class ContractOperationLogService:
    
    @staticmethod
    async def create_log(
        db: AsyncSession, 
        log_data: ContractOperationLogCreate, 
        operator_id: int
    ) -> ContractOperationLogInfo:
        """创建操作记录"""
        log = ContractOperationLog(
            contract_id=log_data.contract_id,
            operator_id=operator_id,
            operation_type=log_data.operation_type,
            operation_detail=log_data.operation_detail
        )
        
        db.add(log)
        await db.commit()
        await db.refresh(log)
        
        # 获取操作员信息
        operator = await db.get(Employee, operator_id)
        
        return ContractOperationLogInfo(
            id=log.id,
            contract_id=log.contract_id,
            operator_id=log.operator_id,
            operator_name=operator.name if operator else "未知用户",
            operation_type=log.operation_type,
            operation_detail=log.operation_detail,
            created_at=log.created_at
        )
    
    @staticmethod
    async def get_logs_by_contract(
        db: AsyncSession, 
        contract_id: int
    ) -> List[ContractOperationLogInfo]:
        """获取指定合同的操作记录"""
        result = await db.execute(
            select(ContractOperationLog, Employee.name)
            .join(Employee, ContractOperationLog.operator_id == Employee.id)
            .where(ContractOperationLog.contract_id == contract_id)
            .order_by(desc(ContractOperationLog.created_at))
        )
        
        logs = []
        for log, operator_name in result.all():
            logs.append(ContractOperationLogInfo(
                id=log.id,
                contract_id=log.contract_id,
                operator_id=log.operator_id,
                operator_name=operator_name,
                operation_type=log.operation_type,
                operation_detail=log.operation_detail,
                created_at=log.created_at
            ))
        
        return logs
    
    @staticmethod
    async def get_recent_logs(
        db: AsyncSession, 
        days: int = 7
    ) -> List[ContractOperationLogInfo]:
        """获取最近几天的操作记录"""
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        result = await db.execute(
            select(ContractOperationLog, Employee.name)
            .join(Employee, ContractOperationLog.operator_id == Employee.id)
            .where(ContractOperationLog.created_at >= cutoff_date)
            .order_by(desc(ContractOperationLog.created_at))
        )
        
        logs = []
        for log, operator_name in result.all():
            logs.append(ContractOperationLogInfo(
                id=log.id,
                contract_id=log.contract_id,
                operator_id=log.operator_id,
                operator_name=operator_name,
                operation_type=log.operation_type,
                operation_detail=log.operation_detail,
                created_at=log.created_at
            ))
        
        return logs