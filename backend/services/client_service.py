from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, or_, func, update
from typing import List, Optional, Tuple
from sqlalchemy.future import select
from backend.models.client import Client
from backend.schemas.client import ClientFilter, ClientCreate, ClientStatus
from fastapi import HTTPException
from datetime import datetime, timezone
from backend.models.employee import Employee
from sqlalchemy.orm import selectinload

class ClientService:

    # 根据销售id获取客户列表
    @staticmethod
    async def get_clients(db: AsyncSession, filter_params: ClientFilter, sales_id: int) -> Tuple[List[Client], int]:
        stmt = select(Client)

        filters = []

        if filter_params.name:
            filters.append(Client.name.ilike(f"%{filter_params.name}%"))

        if filter_params.status:
            # 将 Pydantic Enum 转为原始字符串值再过滤
            status_values = [s.value if hasattr(s, 'value') else s for s in filter_params.status]
            filters.append(Client.status.in_(status_values))

        if filter_params.source:
            # 将 Pydantic Enum 转为原始字符串值再过滤
            source_values = [s.value if hasattr(s, 'value') else s for s in filter_params.source]
            filters.append(Client.source.in_(source_values))

        if filters:
            stmt = stmt.where(and_(*filters))

        if sales_id:
            stmt = stmt.where(Client.sales_id == sales_id)
            
        # 按创建时间升序排序（最新的记录在前面）
        stmt = stmt.order_by(Client.created_at.desc())
            
        try:
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
        except Exception as e:
            await db.rollback()
            raise e

    #添加客户
    @staticmethod
    async def add_client(db: AsyncSession, client: ClientCreate, sales_id: int):
        try:
            #检查客户是否存在
            result = await db.execute(select(Client).where(Client.name == client.name))
            if result.scalars().first():
                raise HTTPException(status_code=400, detail="客户已存在")
            
            #添加客户
            # 使用 mode="json" 将枚举转换为原始值（字符串）
            cdata = client.model_dump(mode="json")
            new_client = Client(
                **cdata,
                created_at=datetime.now(timezone.utc),
                sales_id=sales_id
            )
            db.add(new_client)
            await db.commit()
            await db.refresh(new_client)
            return new_client
        except Exception as e:
            await db.rollback()
            raise e

    #根据客户ID获取客户信息
    @staticmethod
    async def get_client_info(db: AsyncSession, id: int) -> ClientCreate:
        try:
            # 查询客户信息并只消费一次 result
            result = await db.execute(select(Client).where(Client.id == id))
            client = result.scalars().first()
            if not client:
                raise HTTPException(status_code=404, detail="客户不存在")
            # 将 Client 对象映射到 ClientCreate 模型
            client_create = ClientCreate(
                name=client.name,
                contact_name=client.contact_name,
                contact_phone=client.contact_phone,
                address=client.address,
                activity_name=client.activity_name,
                source=client.source.value,
                online_source=client.online_source,
                product_type=client.product_type,
                scale=client.scale.value,
                status=client.status.value,
            )
            return client_create
        except Exception as e:
            print(e)
            raise HTTPException(status_code=500, detail=f"查询客户信息失败: {str(e)}")

    # 更改客户状态
    @staticmethod
    async def update_client_status(db: AsyncSession, id: int, status: ClientStatus):
        try:
            # 检查客户是否存在
            result = await db.execute(select(Client).where(Client.id == id))
            client = result.scalars().first()
            if not client:
                raise HTTPException(status_code=404, detail="客户不存在")
            
            # 更新客户状态
            client.status = status
            await db.commit()
            return True
        except Exception as e:
            await db.rollback()
            print(e)
            raise HTTPException(status_code=500, detail=f"更改客户状态失败: {str(e)}")
        
    #修改客户信息
    @staticmethod
    async def update_client(db: AsyncSession, id: int, client: ClientCreate):
        try:
           existing = await db.execute(select(Client).where(Client.id==id))
           if not existing:
               raise HTTPException(404, "客户不存在")
           
           # 将Pydantic模型转换为字典，确保枚举值被正确处理
           client_data = client.model_dump(mode="json")
           
           # 更新客户信息
           await db.execute(update(Client).where(Client.id==id).values(**client_data))
           await db.commit()
           
           # 获取更新后的客户信息
           result = await db.execute(select(Client).where(Client.id==id))
           updated_client = result.scalars().first()
           
           return updated_client
        except Exception as e:
           await db.rollback()
           print(e)
           raise HTTPException(500, f"系统错误: {str(e)}")
        

    # 获取客户列表包括销售名称
    @staticmethod
    async def get_clients_with_sales_name(db: AsyncSession, filter_params: ClientFilter) -> Tuple[List[Client], int]:
        stmt = select(Client)

        filters = []

        if filter_params.name:
            filters.append(Client.name.ilike(f"%{filter_params.name}%"))

        if filter_params.status:
            # 将 Pydantic Enum 转为原始字符串值再过滤
            status_values = [s.value if hasattr(s, 'value') else s for s in filter_params.status]
            filters.append(Client.status.in_(status_values))

        if filter_params.source:
            # 将 Pydantic Enum 转为原始字符串值再过滤
            source_values = [s.value if hasattr(s, 'value') else s for s in filter_params.source]
            filters.append(Client.source.in_(source_values))

        if filters:
            stmt = stmt.where(and_(*filters))
        stmt = stmt.options(selectinload(Client.sales))
        # 按创建时间升序排序（最新的记录在前面）
        stmt = stmt.order_by(Client.created_at.desc())
            
        try:
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
        except Exception as e:
            await db.rollback()
            raise e