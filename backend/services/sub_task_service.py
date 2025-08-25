from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select, or_
from sqlalchemy.orm import selectinload, joinedload
from backend.models.client import Client
from backend.models.ticket import Ticket
from backend.models.sub_task import SubTask
from backend.models.employee import Employee
from fastapi import HTTPException
from backend.models.contract import Contract
from backend.schemas.sub_task import SubTaskCreate, SubTaskFilter
from datetime import datetime, timezone
from sqlalchemy import update
from zoneinfo import ZoneInfo
from typing import Optional

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


    # 获取未完成的任务(工单名称、客户名称、创建时间)
    @staticmethod
    async def get_tasks_uncompleted(db: AsyncSession, filter_params: SubTaskFilter):
        """
        查询条件：
        key_word: str = None # 关键字(工单名称、客户名称、负责人名称)
        status: list[str] = None # 状态(未分配、未开始、进行中)
        task_type: str = None # 任务类型(美工、渲染)
        page: int = 1 # 页码
        page_size: int = 20 # 每页数量
        返回：
        sub_tasks: list[SubTask] # 任务列表(按照创建时间排序)
        total: int # 总数量
        """
        # 1. 先构造基础查询（不加options）
        base_stmt = select(SubTask).order_by(SubTask.created_at.desc())
        base_stmt = base_stmt.where(SubTask.status != "已完成")
        if filter_params.task_type:
            base_stmt = base_stmt.where(SubTask.task_type == filter_params.task_type)
        if filter_params.status:
            base_stmt = base_stmt.where(SubTask.status.in_(filter_params.status))
        if filter_params.key_word:
            base_stmt = base_stmt.where(SubTask.ticket.has(or_(Ticket.name.ilike(f"%{filter_params.key_word}%"),
                 Ticket.contract.has(Contract.client.has(Client.name.ilike(f"%{filter_params.key_word}%"))),
                 SubTask.charge.has(Employee.name.ilike(f"%{filter_params.key_word}%")))))

        # 2. 统计总数
        count_stmt = select(func.count()).select_from(base_stmt.subquery())
        total_result = await db.execute(count_stmt)
        total = total_result.scalar_one()

        # 3. 分页+ORM预加载
        stmt = base_stmt.options(
            selectinload(SubTask.charge),
            selectinload(SubTask.ticket)
                .selectinload(Ticket.contract)
                .selectinload(Contract.client),
            selectinload(SubTask.ticket)
                .selectinload(Ticket.contract)
                .selectinload(Contract.sales)
        ).offset((filter_params.page - 1) * filter_params.page_size).limit(filter_params.page_size)
        sub_tasks = await db.execute(stmt)
        sub_tasks = list(sub_tasks.scalars().all())
        return sub_tasks, total

    # 分配任务(设置任务分配人id和任务负责人id)
    @staticmethod
    async def assign_sub_task(db: AsyncSession, id: int, charge_id: int, assignee_id: int, estimated_completion_time: int, difficulty_score: float):
        sub_task = await db.execute(select(SubTask).where(SubTask.id == id).with_for_update())
        sub_task = sub_task.scalars().first()
        sub_task.charge_id = charge_id
        sub_task.assignee_id = assignee_id 
        sub_task.estimated_completion_time = estimated_completion_time
        sub_task.difficulty_score = difficulty_score
        if sub_task.status == "未分配":
            sub_task.status = '未开始' # 如果是未分配任务，则任务状态为未开始
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
        stmt = stmt.where(or_(SubTask.completed_at >= datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0), SubTask.completed_at == None))
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
        base_stmt = select(SubTask).order_by(SubTask.updated_at.desc())
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
            joinedload(SubTask.ticket)
                .joinedload(Ticket.contract)
                .joinedload(Contract.client),
            joinedload(SubTask.ticket)
                .joinedload(Ticket.contract)
                .joinedload(Contract.sales), 
            joinedload(SubTask.assignee), 
            joinedload(SubTask.charge)
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
        # 使用 SELECT FOR UPDATE 锁定行
        result = await db.execute(
            select(SubTask).where(SubTask.id == id).with_for_update()
        )
        task = result.scalar_one_or_none()
        if not task:
            raise HTTPException(status_code=404, detail="任务不存在")

        # 现在 old_status 是锁定的行的当前状态，非常安全
        now = datetime.now(timezone.utc)
        values = {"status": status, "progress": progress}

        # 使用 task.status 而不是传入的 old_status，更安全
        if task.status == "未开始" and status != "未开始":
            values["started_at"] = now
        if task.status == "已完成" and status != "已完成":
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
        )
        await db.execute(stmt)
        await db.flush()
        return task # 返回锁定的 task 对象
    
    # 根据工单id获取子任务
    @staticmethod
    async def get_sub_tasks_by_ticket_id(db: AsyncSession, ticket_id: int):
        sub_tasks = await db.execute(
            select(SubTask).where(SubTask.ticket_id == ticket_id)
            .options(
                selectinload(SubTask.charge),
                selectinload(SubTask.assignee),
            )
        )
        sub_tasks = sub_tasks.scalars().all()
        return sub_tasks
    
    # 获取 某个状态 某个时间 某种任务类型 的 任务数量 如果某个条件为空则查询所有
    """
    查询条件：
    status: list[str] = None # 状态
    start_time: datetime = None # 开始时间
    end_time: datetime = None # 结束时间
    task_type: str = None # 任务类型
    employee_id: int = None # 员工id
    warning_status: list[str] = None # 预警状态（黄色预警、红色预警、正常）
    返回：
    {
        "count": "数量",
    }
    """
    
    @staticmethod
    async def get_sub_tasks_count(
        db: AsyncSession,
        status: list[str] = None,
        start_time: datetime = None,
        end_time: datetime = None,
        task_type: str = None,
        employee_id: int = None,
        warning_status: list[str] = None,
    ) -> int:
        """
        查询符合条件的子任务数量（支持预警过滤）
        """
        stmt = select(func.count()).select_from(SubTask)

        # 基础状态过滤
        if status:
            stmt = stmt.where(SubTask.status.in_(status))

        if start_time:
            stmt = stmt.where(SubTask.started_at >= start_time)

        if end_time:
            stmt = stmt.where(SubTask.started_at <= end_time)

        if task_type:
            stmt = stmt.where(SubTask.task_type == task_type)

        if employee_id:
            stmt = stmt.where(SubTask.charge_id == employee_id)

        # 预警过滤（仅对进行中的任务有效）
        if warning_status:
            now = datetime.now(ZoneInfo("Asia/Shanghai"))
            # estimated_completion_time 是整数字段，单位：天
            elapsed_days = func.extract('epoch', now - SubTask.started_at) / 3600 / 24

            conditions = []
            if "红色预警" in warning_status:
                conditions.append(elapsed_days > SubTask.estimated_completion_time + 1)
            if "黄色预警" in warning_status:
                conditions.append(elapsed_days > SubTask.estimated_completion_time)

            if conditions:
                stmt = stmt.where(or_(*conditions) & (SubTask.status == "进行中"))

        result = await db.execute(stmt)
        count = result.scalar()
        return count or 0


    # 获取所有已分配任务
    @staticmethod
    async def get_sub_tasks(db: AsyncSession, filter_params: SubTaskFilter, task_type: str = None):
        # 1. 先构造基础查询（不加options）
        base_stmt = select(SubTask).order_by(SubTask.updated_at.desc())
        base_stmt = base_stmt.where(SubTask.charge_id != None)
        if task_type:
            base_stmt = base_stmt.where(SubTask.task_type == task_type)
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
            joinedload(SubTask.ticket)
                .joinedload(Ticket.contract)
                .joinedload(Contract.client),
            joinedload(SubTask.ticket)
                .joinedload(Ticket.contract)
                .joinedload(Contract.sales), 
            joinedload(SubTask.assignee), 
            joinedload(SubTask.charge)
        ).offset((filter_params.page - 1) * filter_params.page_size).limit(filter_params.page_size)
        sub_tasks = await db.execute(stmt)
        sub_tasks = list(sub_tasks.scalars().all())
        return sub_tasks, total
