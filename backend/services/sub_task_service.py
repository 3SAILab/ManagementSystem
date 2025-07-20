from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.models.contract import Contract
from backend.models.ticket import Ticket
from backend.models.sub_task import SubTask
from backend.models.employee import Employee
from fastapi import HTTPException

from backend.schemas.sub_task import SubTaskCreate   

class SubTaskService:
    # 获取所有美工任务
    @staticmethod
    async def get_art_tasks(db: AsyncSession, contract_id: int):
        try:
            # First, find all ticket_ids for the given contract_id
            ticket_ids_result = await db.execute(
                select(Ticket.id).where(Ticket.contract_id == contract_id)
            )
            ticket_ids = ticket_ids_result.scalars().all()

            if not ticket_ids:
                return []

            # Now, query for art tasks using the collected ticket_ids
            art_tasks_result = await db.execute(
                select(SubTask)
                .where(SubTask.ticket_id.in_(ticket_ids), SubTask.task_type == '美工')
                .options(
                    selectinload(SubTask.assignee),
                    selectinload(SubTask.ticket),
                    selectinload(SubTask.charge)
                )
            )
            art_tasks = art_tasks_result.scalars().unique().all()
            return art_tasks
        except Exception as e:
            print("get_art_tasks error: ", e)
            raise HTTPException(status_code=500, detail=str(e))
        
    # 获取所有渲染任务
    @staticmethod
    async def get_render_tasks(db: AsyncSession, contract_id: int):
        try:
            # First, find all ticket_ids for the given contract_id
            ticket_ids_result = await db.execute(
                select(Ticket.id).where(Ticket.contract_id == contract_id)
            )
            ticket_ids = ticket_ids_result.scalars().all()

            if not ticket_ids:
                return []

            # Now, query for render tasks using the collected ticket_ids
            render_tasks_result = await db.execute(
                select(SubTask)
                .where(SubTask.ticket_id.in_(ticket_ids), SubTask.task_type == '渲染')
                .options(
                    selectinload(SubTask.assignee),
                    selectinload(SubTask.ticket),
                    selectinload(SubTask.charge)
                )
            )
            render_tasks = render_tasks_result.scalars().unique().all()
            return render_tasks
        except Exception as e:
            print("get_render_tasks error: ", e)
            raise HTTPException(status_code=500, detail=str(e))
        
    # 创建任务
    @staticmethod
    async def create_task(db: AsyncSession, task: SubTaskCreate):
        try:
            # 创建 SubTask 实例时，添加默认状态
            new_sub_task = SubTask(
                **task.model_dump(),
            )
            db.add(new_sub_task)
            await db.commit()
            await db.refresh(new_sub_task)
            return new_sub_task
        except Exception as e:
            await db.rollback()
            raise HTTPException(status_code=500, detail=str(e))
  