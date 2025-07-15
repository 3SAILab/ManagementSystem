from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, or_, func
from typing import List, Optional, Tuple
from sqlalchemy.future import select
from backend.models.client import Client
from backend.schemas.client import ClientFilter, ClientCreate
from fastapi import HTTPException
from datetime import datetime, timezone


class ClientService:

    # 获取客户列表
    @staticmethod
    async def get_clients(db: AsyncSession, filter_params: ClientFilter) -> Tuple[List[Client], int]:
        stmt = select(Client)

        filters = []

        if filter_params.name:
            filters.append(Client.name.ilike(f"%{filter_params.name}%"))

        if filter_params.status:
            filters.append(Client.status.in_(filter_params.status))

        if filter_params.source:
            filters.append(Client.source.in_(filter_params.source))

        if filters:
            stmt = stmt.where(and_(*filters))

        # 获取总数
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_result = await db.execute(count_stmt)
        total = total_result.scalar_one()

        # 添加分页
        stmt = stmt.offset((filter_params.page - 1) * filter_params.page_size).limit(filter_params.page_size)

        # 执行查询
        result = await db.execute(stmt)
        clients = list(result.scalars().all())

        return clients, total

    #添加客户
    @staticmethod
    async def add_client(db: AsyncSession, client: ClientCreate):
        try:
            #检查客户是否存在
            result = await db.execute(select(Client).where(Client.name == client.name))
            if result.scalars().first():
                raise HTTPException(status_code=400, detail="客户已存在")
            
            #添加客户
            new_client = Client(
                **client.model_dump(),
                created_at=datetime.now(timezone.utc),
            )
            db.add(new_client)
            await db.commit()
            await db.refresh(new_client)
            return new_client
        except Exception as e:
            await db.rollback()
            raise e



