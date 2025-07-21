from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.models.ticket import Ticket
from backend.models.sub_task import SubTask
from fastapi import HTTPException
from backend.models.contract import Contract
from backend.models.client import Client
from backend.schemas.sub_task import SubTaskCreate   

class SubTaskService:
    # 获取所有美工任务
    @staticmethod
    async def get_art_tasks(db: AsyncSession, contract_id: int):
        try:
            # 合同是否存在
            ticket_ids_result = await db.execute(
                select(Ticket.id).where(Ticket.contract_id == contract_id)
            )
            ticket_ids = ticket_ids_result.scalars().all()

            if not ticket_ids:
                return []

            # 查询美工任务
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
            # 合同是否存在
            ticket_ids_result = await db.execute(
                select(Ticket.id).where(Ticket.contract_id == contract_id)
            )
            ticket_ids = ticket_ids_result.scalars().all()

            if not ticket_ids:
                return []

            # 查询渲染任务
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
                progress=0,  # 初始进度为0
                edit_count=0  # 初始修改次数为0
            )
            db.add(new_sub_task)
            await db.commit()
            await db.refresh(new_sub_task)
            return new_sub_task
        except Exception as e:
            await db.rollback()
            raise HTTPException(status_code=500, detail=str(e))


    # 获取未分配的美工任务(工单名称、客户名称、创建时间)
    @staticmethod
    async def get_art_tasks_unassigned(db: AsyncSession):
        try:
            # 更改查询以正确加载关联
            
            stmt = select(SubTask).where(
                SubTask.assignee_id == None, 
                SubTask.task_type == '美工'
            ).options(
                selectinload(SubTask.ticket).selectinload(Ticket.contract).selectinload(Contract.client)
            )
            
            art_tasks_result = await db.execute(stmt)
            art_tasks = art_tasks_result.scalars().all() or []
            
            # 返回JSON可序列化的列表
            return [
                {
                    "id": task.id,
                    "ticket": {
                        "name": task.ticket.name,
                        "client": {
                            "name": task.ticket.contract.client.name
                        }
                    },
                    "created_at": task.created_at,
                    "task_type": task.task_type,
                    "status": task.status,
                }
                for task in art_tasks
            ]
        except Exception as e:
            print("get_art_tasks_unassigned error: ", e)
            raise HTTPException(status_code=500, detail=str(e))

    # 获取未分配的渲染任务(工单名称、客户名称、创建时间)
    @staticmethod
    async def get_render_tasks_unassigned(db: AsyncSession):
        try:
            # 更改查询以正确加载关联
            stmt = select(SubTask).where(
                SubTask.assignee_id == None, 
                SubTask.task_type == '渲染'
            ).options(
                selectinload(SubTask.ticket).selectinload(Ticket.contract).selectinload(Contract.client)
            )
            
            render_tasks_result = await db.execute(stmt)
            render_tasks = render_tasks_result.scalars().all() or []
            
            # 返回JSON可序列化的列表
            return [
                {
                    "id": task.id,
                    "ticket": {
                        "name": task.ticket.name,
                        "client": {
                            "name": task.ticket.contract.client.name
                        }
                    },
                    "created_at": task.created_at,
                    "task_type": task.task_type,
                    "status": task.status,
                }
                for task in render_tasks
            ]
        except Exception as e:
            print("get_render_tasks_unassigned error: ", e)
            raise HTTPException(status_code=500, detail=str(e))

    # 分配任务(设置任务分配人id和任务负责人id)
    @staticmethod
    async def assign_sub_task(db: AsyncSession, id: int, charge_id: int, assignee_id: int):
        try:
            sub_task = await db.execute(select(SubTask).where(SubTask.id == id))
            sub_task = sub_task.scalars().first()
            sub_task.charge_id = charge_id
            sub_task.assignee_id = assignee_id 
            sub_task.status = '未开始' 
            await db.commit()
            await db.refresh(sub_task)
            return sub_task
        except Exception as e:
            await db.rollback()
            raise HTTPException(status_code=500, detail=str(e))

    # 获取任务详情
    @staticmethod
    async def get_sub_task(db: AsyncSession, id: int):
        try:
            sub_task = await db.execute(select(SubTask).where(SubTask.id == id).options(selectinload(SubTask.charge), selectinload(SubTask.assignee), selectinload(SubTask.ticket)))
            sub_task = sub_task.scalars().first()
            return sub_task
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
