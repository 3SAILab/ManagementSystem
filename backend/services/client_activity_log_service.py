from backend.schemas.client_activity_log import ClientActivityLogCreate, ClientActivityLogInfo
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from backend.models.client_activity_log import ClientActivityLog, ClientStatus
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.models.employee import Employee

class ClientActivityLogService:
    # 添加客户跟进记录
    @staticmethod
    async def add_client_activity_log(db: AsyncSession, client_activity_log: ClientActivityLogCreate, sales_id: int):
        db_client_activity_log = ClientActivityLog(**client_activity_log.model_dump(), sales_id=sales_id)
        db_client_activity_log.status = ClientStatus(db_client_activity_log.status)
        db.add(db_client_activity_log)
        await db.flush()
        await db.refresh(db_client_activity_log)
        return db_client_activity_log
        

    # 根据客户id查询客户跟进记录
    @staticmethod
    async def get_client_activity_log(db: AsyncSession, client_id: int):
        stmt = select(ClientActivityLog).where(ClientActivityLog.client_id == client_id).options(
            selectinload(ClientActivityLog.sales)
        ).order_by(ClientActivityLog.log_time.desc())
        result = await db.execute(stmt)
        client_activity_log = result.scalars().all()
        return [
            ClientActivityLogInfo(
                id=e.id,
                client_id=e.client_id,
                sales_id=e.sales_id,
                status=e.status,
                log_content=e.log_content,
                log_time=e.log_time,
                sales_name=e.sales.name
            )
            for e in client_activity_log
        ] 
