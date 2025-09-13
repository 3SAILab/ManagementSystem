from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.contract import Contract
from backend.models.ticket import Ticket
from backend.schemas.contract import ContractCreate, ContractFilter
from fastapi import HTTPException
from datetime import datetime, timezone
from typing import List, Tuple, Optional
from sqlalchemy import and_, func, select
from sqlalchemy.orm import selectinload
from backend.models.client import Client

from backend.utils.response import api_response

class ContractService:

    # 添加合同
    @staticmethod
    async def add_contract(db: AsyncSession, contract: ContractCreate, sales_id: int):
        # 查询客户是否存在
        stmt = select(Client).where(Client.id == contract.client_id).with_for_update()
        result = await db.execute(stmt)
        client = result.scalar_one()
        if not client:
            raise HTTPException(status_code=404, detail="客户不存在")
        
        # 检查订单金额是否等于已付金额，如果相等则自动设置为已结算状态
        current_time = datetime.now(timezone.utc)
        if contract.total_amount == contract.paid_amount:
            status = "已结算"
            settlement_time = contract.transaction_time
        else:
            status = "待结算"
            settlement_time = None
        
        contract = Contract(
            client_id=contract.client_id,
            sales_id=sales_id,
            prepayment_sales_id=sales_id,
            final_payment_sales_id=sales_id,
            contract_type=contract.contract_type,
            status=status,
            total_amount=contract.total_amount,
            paid_amount=contract.paid_amount,
            commission_rate=contract.commission_rate,
            detail_pages=contract.detail_pages,
            video_count=contract.video_count,
            image_count=contract.image_count,
            workflow_count=contract.workflow_count,
            transaction_time=contract.transaction_time,
            settlement_time=settlement_time,
            is_recharged=contract.is_recharged,
            created_at=current_time,
            updated_at=current_time,
            file_resource_id=contract.file_resource_id,
            notes=contract.notes,  # 合同备注
            parent_contract_id=contract.parent_contract_id,  # 主合同ID
            is_appendix=contract.is_appendix,  # 是否为附属合同
        )
        db.add(contract)
        await db.flush()
        return api_response(success=True, data={"msg": "合同添加成功"})

    # 获取合同列表
    @staticmethod
    async def get_contracts(db: AsyncSession, filter_params: ContractFilter, employee_id: int) -> Tuple[List[Contract], int]:
        stmt = select(Contract).options(
            selectinload(Contract.client),
            selectinload(Contract.sales)
            )

        filters = []
        needs_client_join = False

        if filter_params.name:
            needs_client_join = True
            filters.append(Client.name.ilike(f"%{filter_params.name}%"))

        if filter_params.status:
            # 将 Pydantic Enum 转为原始字符串值再过滤
            status_values = [s.value if hasattr(s, 'value') else s for s in filter_params.status]
            filters.append(Contract.status.in_(status_values))

        if filter_params.contract_type:
            # 将 Pydantic Enum 转为原始字符串值再过滤
            contract_type_values = [s.value if hasattr(s, 'value') else s for s in filter_params.contract_type]
            filters.append(Contract.contract_type.in_(contract_type_values))

        if filter_params.source:
            # 客户来源筛选
            needs_client_join = True
            source_values = filter_params.source
            filters.append(Client.source.in_(source_values))

        # 时间范围优先：按成交时间区间筛选
        if filter_params.start_date and filter_params.end_date:
                filters.append(and_(
                    Contract.transaction_time >= filter_params.start_date,
                    Contract.transaction_time <= filter_params.end_date
                ))
        elif filter_params.start_date:
            filters.append(Contract.transaction_time >= filter_params.start_date)
        elif filter_params.end_date:
            filters.append(Contract.transaction_time <= filter_params.end_date)

        # 如果需要客户信息，则join Client表
        if needs_client_join:
            stmt = stmt.join(Client)

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
    async def update_contract_status(db: AsyncSession, contract_id: int, status: str, settlement_time: Optional[datetime] = None):
        # 使用 with_for_update() 锁定合同行
        result = await db.execute(
            select(Contract).where(Contract.id == contract_id).with_for_update()
        )
        contract = result.scalars().first()
        if not contract:
            raise HTTPException(status_code=404, detail="合同不存在")
        
        contract.status = status
        contract.updated_at = datetime.now(timezone.utc)
        if status == '已结算':
            contract.settlement_time = settlement_time if settlement_time else datetime.now(timezone.utc)
        else:
            contract.settlement_time = None
        await db.flush()
        return api_response(success=True, data={"msg": "合同状态更新成功"})


    # 销售主管根据客户id获取合同
    @staticmethod
    async def get_contracts_by_client_id(db: AsyncSession, client_id: int) -> List[Contract]:
        stmt = select(Contract).where(Contract.client_id == client_id).options(
            selectinload(Contract.client),
            selectinload(Contract.sales)
        )
        result = await db.execute(stmt)
        contracts = result.scalars().all()
        return contracts
    
    # 合同剩余需求 (工单各项需求 - 已创建工单需求各项需求之和)
    @staticmethod
    async def get_remaining_requirements(db: AsyncSession, contract_id: int):
        contract = await db.get(Contract, contract_id)
        if not contract:
            raise HTTPException(status_code=404, detail="合同不存在")
        # 获取已创建工单需求之和
        created_requirements = await db.execute(select(func.sum(Ticket.detail_pages),func.sum(Ticket.video_count),func.sum(Ticket.image_count),func.sum(Ticket.workflow_count)).where(Ticket.contract_id == contract_id))
        created_requirements = created_requirements.one()
        # 处理 None 值的情况（当没有工单时）
        if created_requirements is None:
            created_requirements = (0, 0, 0, 0)
        
        # 计算剩余需求
        remaining_requirements = {
            "detail_pages": max(0, contract.detail_pages - (created_requirements[0] or 0)),
            "video_count": max(0, contract.video_count - (created_requirements[1] or 0)),
            "image_count": max(0, contract.image_count - (created_requirements[2] or 0)),
            "workflow_count": max(0, contract.workflow_count - (created_requirements[3] or 0))
        }
        return remaining_requirements
    


    # 删除合同
    @staticmethod
    async def delete_contract(db: AsyncSession, contract_id: int):
        contract = await db.get(Contract, contract_id)
        if not contract:
            raise HTTPException(status_code=404, detail="合同不存在")
        # 查询合同下是否存在工单
        stmt = select(Ticket).where(Ticket.contract_id == contract_id)
        result = await db.execute(stmt)
        tickets = result.scalars().all()
        if tickets:
            return api_response(success=False, error="合同下存在工单，不能删除")
        await db.delete(contract)
        await db.flush()
        return api_response(success=True, data={"msg": "合同删除成功"})
    
    # 获取尾款未结算合同列表（合同预付金额小于合同总金额且合同状态为待结算）
    @staticmethod
    async def get_pending_contracts(db: AsyncSession, filter_params: ContractFilter, employee_id: int) -> Tuple[List[Contract], int]:
        stmt = select(Contract).options(
            selectinload(Contract.client),
            selectinload(Contract.sales)
            )

        filters = []
        needs_client_join = False

        if filter_params.name:
            needs_client_join = True
            filters.append(Client.name.ilike(f"%{filter_params.name}%"))

        if filter_params.status:
            # 将 Pydantic Enum 转为原始字符串值再过滤
            status_values = [s.value if hasattr(s, 'value') else s for s in filter_params.status]
            filters.append(Contract.status.in_(status_values))
        filters.append(Contract.paid_amount < Contract.total_amount)
        # 如果需要客户信息，则join Client表
        if needs_client_join:
            stmt = stmt.join(Client)

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
    
    # 获取合同及其附属合同的树形结构
    @staticmethod
    async def get_contract_with_appendix(db: AsyncSession, contract_id: int):
        """获取合同及其所有附属合同"""
        stmt = select(Contract).where(Contract.id == contract_id).options(
            selectinload(Contract.client),
            selectinload(Contract.sales),
            selectinload(Contract.appendix_contracts)
        )
        result = await db.execute(stmt)
        main_contract = result.scalar_one_or_none()
        
        if not main_contract:
            raise HTTPException(status_code=404, detail="合同不存在")
        
        return api_response(success=True, data={
            "main_contract": main_contract,
            "appendix_contracts": main_contract.appendix_contracts
        })

    # 美工主管获取待处理合同列表
    @staticmethod
    async def get_contracts_for_production(db: AsyncSession):
        """获取美工主管待处理的合同列表"""
        # 只获取主合同（非附属合同）
        stmt = select(Contract).where(
            Contract.is_appendix == False
        ).options(
            selectinload(Contract.client),
            selectinload(Contract.sales),
            selectinload(Contract.appendix_contracts)
        ).order_by(Contract.updated_at.desc())
        
        result = await db.execute(stmt)
        contracts = result.scalars().all()
        
        return api_response(success=True, data=contracts)

    # 根据ID获取合同
    @staticmethod
    async def get_contract_by_id(db: AsyncSession, contract_id: int):
        """根据ID获取合同"""
        stmt = select(Contract).where(Contract.id == contract_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
