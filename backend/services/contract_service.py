from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.contract import Contract
from backend.schemas.contract import ContractCreate, ContractFilter
from fastapi import HTTPException
from datetime import datetime, timezone
from typing import List, Tuple
from sqlalchemy import and_, func, select
from sqlalchemy.orm import selectinload
from backend.models.client import Client
from backend.services import ticket_service
from backend.services.ticket_service import TicketService

from backend.utils.response import api_response

class ContractService:

    # 添加合同
    @staticmethod
    async def add_contract(db: AsyncSession, contract: ContractCreate, sales_id: int):
        contract = Contract(
            client_id=contract.client_id,
            sales_id=sales_id,
            contract_type=contract.contract_type,
            status="待结算",
            total_amount=contract.total_amount,
            paid_amount=contract.paid_amount,
            commission_rate=contract.commission_rate,
            detail_pages=contract.detail_pages,
            video_count=contract.video_count,
            image_count=contract.image_count,
            workflow_count=contract.workflow_count,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(contract)
        await db.flush()
        return api_response(success=True, data={"msg": "合同添加成功"})

    # 获取个人成交合同列表
    @staticmethod
    async def get_contracts(db: AsyncSession, filter_params: ContractFilter, employee_id: int) -> Tuple[List[Contract], int]:
        stmt = select(Contract).options(selectinload(Contract.client))

        filters = []

        if filter_params.name:
            stmt = stmt.join(Client)
            filters.append(Contract.client.name.ilike(f"%{filter_params.name}%"))

        if filter_params.status:
            # 将 Pydantic Enum 转为原始字符串值再过滤
            status_values = [s.value if hasattr(s, 'value') else s for s in filter_params.status]
            filters.append(Contract.status.in_(status_values))

        if filter_params.contract_type:
            # 将 Pydantic Enum 转为原始字符串值再过滤
            contract_type_values = [s.value if hasattr(s, 'value') else s for s in filter_params.contract_type]
            filters.append(Contract.contract_type.in_(contract_type_values))

        if employee_id:
            filters.append(Contract.sales_id == employee_id)

        if filters:
            stmt = stmt.where(and_(*filters))
        
        # 按创建时间升序排序（最新的记录在前面）
        stmt = stmt.order_by(Contract.created_at.desc())
        
        # 获取总数
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_result = await db.execute(count_stmt)
        total = total_result.scalar_one()

        # 添加分页
        stmt = stmt.offset((filter_params.page - 1) * filter_params.page_size).limit(filter_params.page_size)

        # 执行查询
        result = await db.execute(stmt)
        contracts = list(result.scalars().all())
        return contracts, total

    # 获取合同信息
    @staticmethod
    async def get_contract_completion(db: AsyncSession, contract_id: int):
        contract = await db.get(Contract, contract_id)
        if not contract:
            raise HTTPException(status_code=404, detail="合同不存在")
        # 获取合同信息
        stmt = select(Contract).where(Contract.id == contract_id)
        result = await db.execute(stmt)
        contract = result.scalar_one()
        return contract

    # 更新合同状态
    @staticmethod
    async def update_contract_status(db: AsyncSession, contract_id: int, status: str):
        contract = await db.get(Contract, contract_id)
        if not contract:
            raise HTTPException(status_code=404, detail="合同不存在")
        contract.status = status
        if status == '已结算':
            contract.paid_amount = contract.total_amount
        contract.updated_at = datetime.now(timezone.utc)
        await db.flush()
        return api_response(success=True, data={"msg": "合同状态更新成功"})


    # 销售主管根据客户id获取合同
    @staticmethod
    async def get_contracts_by_client_id(db: AsyncSession, client_id: int) -> List[Contract]:
        stmt = select(Contract).where(Contract.client_id == client_id).options(selectinload(Contract.client))
        result = await db.execute(stmt)
        contracts = result.scalars().all()
        return contracts