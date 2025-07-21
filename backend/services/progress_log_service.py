from backend.models.progress_log import ProgressLog
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

class ProgressLogService:
    # 创建进度日志
    @staticmethod
    async def create_progress_log(db: AsyncSession, sub_task_id: int, notes: str):
        try:
            progress_log = ProgressLog(sub_task_id=sub_task_id, notes=notes)
            db.add(progress_log)
            await db.commit()
            await db.refresh(progress_log)
            return progress_log
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))