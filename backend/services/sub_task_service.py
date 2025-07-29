from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select, or_
from sqlalchemy.orm import selectinload
from backend.models.ticket import Ticket
from backend.models.sub_task import SubTask
from backend.models.employee import Employee
from fastapi import HTTPException
from backend.models.contract import Contract
from backend.schemas.sub_task import SubTaskCreate, SubTaskFilter
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
                selectinload(SubTask.ticket)
                    .selectinload(Ticket.contract)
                    .selectinload(Contract.sales),
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
                selectinload(SubTask.ticket)
                    .selectinload(Ticket.contract)
                    .selectinload(Contract.sales),
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
            edit_count=0,  # 初始修改次数为0
            estimated_completion_time=2  # 初始预计完成时间为2天
        )
        db.add(new_sub_task)
        await db.flush()
        await db.refresh(new_sub_task)
        return new_sub_task


    # 获取未完成的美工任务(工单名称、客户名称、创建时间)
    @staticmethod
    async def get_art_tasks_uncompleted(db: AsyncSession):
        # 更改查询以正确加载关联
        
        stmt = select(SubTask).where(
            SubTask.status != "已完成", 
            SubTask.task_type == '美工'
        ).options(
            selectinload(SubTask.charge),
            selectinload(SubTask.ticket)
                .selectinload(Ticket.contract)
                .selectinload(Contract.client),
            selectinload(SubTask.ticket)
                .selectinload(Ticket.contract)
                .selectinload(Contract.sales)
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
                "sales": task.ticket.contract.sales.name if task.ticket.contract.sales else None,
                "charge_name": task.charge.name if task.charge else None
            }
            for task in art_tasks
        ]

    # 获取未完成的渲染任务(工单名称、客户名称、创建时间)
    @staticmethod
    async def get_render_tasks_uncompleted(db: AsyncSession):
        # 更改查询以正确加载关联
        stmt = select(SubTask).where(
            SubTask.status != "已完成", 
            SubTask.task_type == '渲染'
        ).options(
            selectinload(SubTask.charge),
            selectinload(SubTask.ticket)
                .selectinload(Ticket.contract)
                .selectinload(Contract.client),
            selectinload(SubTask.ticket)
                .selectinload(Ticket.contract)
                .selectinload(Contract.sales)
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
                "sales": task.ticket.contract.sales.name if task.ticket.contract.sales else None,
                "charge_name": task.charge.name if task.charge else None
            }
            for task in render_tasks
        ]

    # 分配任务(设置任务分配人id和任务负责人id)
    @staticmethod
    async def assign_sub_task(db: AsyncSession, id: int, charge_id: int, assignee_id: int, estimated_completion_time: int):
        sub_task = await db.execute(select(SubTask).where(SubTask.id == id))
        sub_task = sub_task.scalars().first()
        sub_task.charge_id = charge_id
        sub_task.assignee_id = assignee_id 
        sub_task.estimated_completion_time = estimated_completion_time
        if sub_task.charge_id == None:
            sub_task.status = '未开始' # 如果没有负责人，则任务状态为未开始
        sub_task.assigned_at = datetime.now(timezone.utc)
        await db.flush()
        await db.refresh(sub_task)
        return sub_task

    # 获取任务详情
    @staticmethod
    async def get_sub_task(db: AsyncSession, id: int):
        sub_task = await db.execute(
            select(SubTask)
            .where(SubTask.id == id)
            .options(
                selectinload(SubTask.charge), 
                selectinload(SubTask.assignee), 
                selectinload(SubTask.ticket)
                    .selectinload(Ticket.contract)
                    .selectinload(Contract.sales)
            )
        )
        sub_task = sub_task.scalars().first()
        return sub_task
    
    # 根据负责人id获取所有任务
    @staticmethod
    async def get_sub_tasks_by_charge_id(db: AsyncSession, charge_id: int):
        # 已完成任务只获取本月的部分，其他的获取全部
        stmt = select(SubTask).where(SubTask.charge_id == charge_id)
        stmt = stmt.where(or_(SubTask.completed_at >= datetime.now(timezone.utc).replace(day=1), SubTask.completed_at == None))
        stmt = stmt.options(
            selectinload(SubTask.ticket)
                .selectinload(Ticket.contract)
                .selectinload(Contract.client),
            selectinload(SubTask.ticket)
                .selectinload(Ticket.contract)
                .selectinload(Contract.sales), 
            selectinload(SubTask.assignee), 
            selectinload(SubTask.charge)
        )
        sub_tasks = await db.execute(stmt)
        sub_tasks = list(sub_tasks.scalars().all())
        return sub_tasks


    # 获取团队任务看板
    @staticmethod
    async def get_team_sub_tasks(db: AsyncSession, current_employee_id: int, filter_params: SubTaskFilter):
        # 任务负责人或负责人的上级id是current_employee_id
        # 1. 先构造基础查询（不加options）
        base_stmt = select(SubTask)
        base_stmt = base_stmt.where(
            or_(
                SubTask.charge_id == current_employee_id,
                SubTask.charge.has(Employee.manager_id == current_employee_id)
            )
        )
        if filter_params.task_name:
            base_stmt = base_stmt.where(SubTask.ticket.has(Ticket.name.ilike(f"%{filter_params.task_name}%")))
        if filter_params.charge_name:
            base_stmt = base_stmt.where(SubTask.charge.has(Employee.name.ilike(f"%{filter_params.charge_name}%")))

        # 2. 统计总数
        count_stmt = select(func.count()).select_from(base_stmt.subquery())
        total_result = await db.execute(count_stmt)
        total = total_result.scalar_one()

        # 3. 分页+ORM预加载
        stmt = base_stmt.options(
            selectinload(SubTask.ticket)
                .selectinload(Ticket.contract)
                .selectinload(Contract.client),
            selectinload(SubTask.ticket)
                .selectinload(Ticket.contract)
                .selectinload(Contract.sales), 
            selectinload(SubTask.assignee), 
            selectinload(SubTask.charge)
        ).offset((filter_params.page - 1) * filter_params.page_size).limit(filter_params.page_size)
        sub_tasks = await db.execute(stmt)
        sub_tasks = list(sub_tasks.scalars().all())
        return sub_tasks, total

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
                selectinload(SubTask.ticket)
                    .selectinload(Ticket.contract)
                    .selectinload(Contract.sales),
                selectinload(SubTask.assignee),
                selectinload(SubTask.charge)
            )
        )
        sub_task = sub_task.scalars().first()
        return sub_task
        
    # 更新任务状态
    @staticmethod
    async def update_status(db: AsyncSession, id: int, progress: int, old_status: str, status: str):
        now = datetime.now(timezone.utc)
        values = {"status": status, "progress": progress}
        if old_status == "未开始":
            values["started_at"] = now
        if old_status == "已完成" and status != "已完成":
            values["completed_at"] = None
        if status == "已完成":
            values["completed_at"] = now
        if status == "未开始":
            values["started_at"] = None
            values["completed_at"] = None
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