from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.models.progress_log import ProgressLog
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

class ProgressLogService:
    # 创建进度日志
    @staticmethod
    async def create_progress_log(db: AsyncSession, ticket_id: int, notes: str, employee_id: int):
        try:
            progress_log = ProgressLog(ticket_id=ticket_id, notes=notes, employee_id=employee_id)
            db.add(progress_log)
            await db.commit()
            await db.refresh(progress_log)
            return progress_log
        except Exception as e:
            await db.rollback()
            raise HTTPException(status_code=500, detail=str(e))
        

    # 根据任务id获取进度日志
    @staticmethod
    async def get_progress_log_by_id(db: AsyncSession, ticket_id: int):
        try:
            progress_log = await db.execute(select(ProgressLog)
                .where(ProgressLog.ticket_id == ticket_id)
                .options(selectinload(ProgressLog.employee))
                .order_by(ProgressLog.log_time.desc())
            )
            return progress_log.scalars().all()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))