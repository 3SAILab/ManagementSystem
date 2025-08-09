from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.models.progress_log import ProgressLog
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from backend.models.sub_task import SubTask

class ProgressLogService:
    # 创建进度日志
    @staticmethod
    async def create_progress_log(db: AsyncSession, sub_task_id: int, notes: str, employee_id: int):
        progress_log = ProgressLog(sub_task_id=sub_task_id, notes=notes, employee_id=employee_id)
        db.add(progress_log)
        await db.flush()
        await db.refresh(progress_log)
        return progress_log
        

    # 根据任务id获取关于这个任务的所有的记录
    @staticmethod
    async def get_progress_log_by_id(db: AsyncSession, ticket_id: int):
        # 根据工单id获取任务id(包括美工和渲染任务)
        sub_tasks = await db.execute(select(SubTask).where(SubTask.ticket_id == ticket_id))
        sub_tasks = sub_tasks.scalars().all()
        if not sub_tasks:
            raise HTTPException(status_code=404, detail="工单不存在")
        progress_log_list = []
        for sub_task in sub_tasks:
            progress_log = await db.execute(
                select(ProgressLog)
                .where(ProgressLog.sub_task_id == sub_task.id)
                .options(selectinload(ProgressLog.employee))
                .options(selectinload(ProgressLog.sub_task))
            )
            progress_log_list.extend(progress_log.scalars().all())
        progress_log_list.sort(key=lambda x: x.log_time, reverse=True)
        return progress_log_list