from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.models.ticket import Ticket
from backend.models.sub_task import SubTask
from fastapi import HTTPException
from backend.models.contract import Contract
from backend.schemas.sub_task import SubTaskCreate   
from datetime import datetime, timezone
from sqlalchemy import update

class SubTaskService:
    # 根据合同id获取所有美工任务
    @staticmethod
    async def get_art_tasks_by_contract_id(db: AsyncSession, contract_id: int):
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
        
    # 根据合同id获取所有渲染任务
    @staticmethod
    async def get_render_tasks_by_contract_id(db: AsyncSession, contract_id: int):
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
        
    # 创建任务
    @staticmethod
    async def create_task(db: AsyncSession, task: SubTaskCreate):
        # 创建 SubTask 实例时，添加默认状态
        new_sub_task = SubTask(
            **task.model_dump(),
            progress=0,  # 初始进度为0
            edit_count=0  # 初始修改次数为0
        )
        db.add(new_sub_task)
        await db.flush()
        await db.refresh(new_sub_task)
        return new_sub_task


    # 获取未分配的美工任务(工单名称、客户名称、创建时间)
    @staticmethod
    async def get_art_tasks_unassigned(db: AsyncSession):
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
                    "id": task.ticket.id,
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

    # 获取未分配的渲染任务(工单名称、客户名称、创建时间)
    @staticmethod
    async def get_render_tasks_unassigned(db: AsyncSession):
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
                    "id": task.ticket.id,
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

    # 分配任务(设置任务分配人id和任务负责人id)
    @staticmethod
    async def assign_sub_task(db: AsyncSession, id: int, charge_id: int, assignee_id: int):
        sub_task = await db.execute(select(SubTask).where(SubTask.id == id))
        sub_task = sub_task.scalars().first()
        sub_task.charge_id = charge_id
        sub_task.assignee_id = assignee_id 
        sub_task.status = '未开始' 
        sub_task.assigned_at = datetime.now(timezone.utc)
        await db.flush()
        await db.refresh(sub_task)
        return sub_task

    # 获取任务详情
    @staticmethod
    async def get_sub_task(db: AsyncSession, id: int):
        sub_task = await db.execute(select(SubTask).where(SubTask.id == id).options(selectinload(SubTask.charge), selectinload(SubTask.assignee), selectinload(SubTask.ticket)))
        sub_task = sub_task.scalars().first()
        return sub_task
    
    # 根据负责人id获取所有任务
    @staticmethod
    async def get_sub_tasks_by_charge_id(db: AsyncSession, charge_id: int):
        sub_tasks = await db.execute(
            select(SubTask)
            .where(SubTask.charge_id == charge_id)
            .options(
                selectinload(SubTask.ticket)
                    .selectinload(Ticket.contract)
                    .selectinload(Contract.client),
                selectinload(SubTask.assignee),
                selectinload(SubTask.charge)
            )
        )
        sub_tasks = sub_tasks.scalars().all()
        return sub_tasks

    # 根据任务id获取任务详情
    @staticmethod
    async def get_sub_task_detail(db: AsyncSession, id: int):
        sub_task = await db.execute(
            select(SubTask)
            .where(SubTask.id == id)
            .options(
                selectinload(SubTask.ticket)
                    .selectinload(Ticket.contract)
                    .selectinload(Contract.client),
                selectinload(SubTask.assignee),
                selectinload(SubTask.charge)
            )
        )
        sub_task = sub_task.scalars().first()
        return sub_task
        
    # 更新任务状态
    @staticmethod
    async def update_status(db: AsyncSession, id: int, status: str, progress: int):
        now = datetime.now(timezone.utc)
        values = {"status": status, "progress": progress}
        if status == "进行中":
            values["started_at"] = now
        if status == "已完成":
            values["completed_at"] = now
        stmt = (
            update(SubTask)
            .where(SubTask.id == id)
            .values(**values)
            .returning(SubTask)
        )
        result = await db.execute(stmt)
        updated = result.scalar_one_or_none()
        if not updated:
            raise HTTPException(status_code=404, detail="任务不存在或未修改任何字段")
        await db.flush()
        return updated