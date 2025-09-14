import asyncio
from backend.config import settings
from typing import Optional, List
from fastapi import APIRouter, Body, Query
from backend.schemas.sub_task import SubTaskFilter
from backend.services.sub_task_service import SubTaskService
from backend.db.session import get_async_db
from backend.api.routes.employee import get_current_employee
from backend.models.employee import Employee
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from backend.services.progress_log_service import ProgressLogService
from backend.services.employee_service import EmployeeService
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from backend.api.deps.auth import require_roles
from backend.services.ticket_service import TicketService
from backend.utils.response import api_response

router = APIRouter()
# 获取所有美工任务
@router.get("/sub_art_tasks")
async def get_sub_art_tasks(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    return await SubTaskService.get_art_tasks(db, current_employee.id)

# 获取所有渲染任务
@router.get("/sub_render_tasks")
async def get_sub_render_tasks(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    return await SubTaskService.get_render_tasks(db, current_employee.id)

# 获取未完成任务
@router.get("/sub_tasks/uncompleted")
async def get_sub_tasks_uncompleted(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee),
    key_word: str = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    task_type: str = Query(None),
    status: List[str] = Query(None),
):
    if not task_type:
        task_type = current_employee.position.name
    if not status:
        status = ["未分配","未开始", "进行中"]
    filter_params = SubTaskFilter(key_word=key_word, page=page, page_size=page_size, task_type=task_type, status=status)
    sub_tasks, total = await SubTaskService.get_tasks_uncompleted(db, filter_params)
    sub_tasks_out = []
    for task in sub_tasks:
        sub_tasks_out.append({
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
            "charge_name": task.charge.name if task.charge else None,
            "wechat_group": task.ticket.wechat_group if task.ticket.wechat_group else None,
        })
    return {
        "sub_tasks": sub_tasks_out,
        "total": total,
    }


# 分配任务
@router.put("/assign_task/{id}")
async def assign_sub_task(
    id: int,
    charge_id: int = Body(..., embed=True),
    estimated_completion_time: int = Body(..., embed=True),
    difficulty_score: float = Body(..., embed=True),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    # 分配任务
    res = await SubTaskService.assign_sub_task(db, id, charge_id, current_employee.id, estimated_completion_time, difficulty_score)
    # 获取负责人信息
    charger = await EmployeeService.get_employee_by_id(db, charge_id)
    # 创建进度记录
    notes = f"{current_employee.name}分配任务给{charger.name}"
    await ProgressLogService.create_progress_log(db, id, notes, current_employee.id)
    return res

# 获取任务详情(分配任务时显示任务描述)
@router.get("/sub_task/{id}")
async def get_sub_task(
    id: int,
    db: AsyncSession = Depends(get_async_db)
):
    res = await SubTaskService.get_sub_task(db, id)
    out = {
        "id": res.id,
        "charge_id": res.charge_id,
        "ticket_name": res.ticket.name,
        "notes": res.ticket.notes,
        "detail_pages": res.ticket.detail_pages,
        "video_count": res.ticket.video_count,
        "image_count": res.ticket.image_count,
        "workflow_count": res.ticket.workflow_count,
        "priority": res.ticket.priority,
        "platform": res.ticket.platform,
        "wechat_group": res.ticket.wechat_group,
        "estimated_completion_time": res.estimated_completion_time,
        "difficulty_score": res.difficulty_score,
        "need_watermark": res.ticket.need_watermark
    }
    return out

# 个人工单页面信息初始化(已完成任务只获取本月的部分，其他的获取全部)
@router.get("/personal_tasks")
async def get_personal_tasks(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee),
):
    # 获取任务列表
    sub_tasks = await SubTaskService.get_sub_tasks_by_charge_id(db, current_employee.id)
    # 黄色预警（美工任务状态为已完成以外的状态且距离创建时间两天未完成，渲染任务状态为已完成以外的状态且距离创建时间一天未完成）
    # 红色预警（美工任务状态为已完成以外的状态且距离创建时间三天未完成，渲染任务状态为已完成以外的状态且距离创建时间两天未完成）
    yellow_count = 0
    red_count = 0
    sub_tasks_out = []  # 存储带警告信息的任务（可选输出）

    for task in sub_tasks:
        warning = "正常"

        if task.status == "进行中" and task.started_at is not None:
            elapsed_days = (datetime.now(ZoneInfo("Asia/Shanghai")) - task.started_at).days
            # 黄色预警条件
            yellow_threshold = task.estimated_completion_time
            red_threshold = task.estimated_completion_time + 1

            if yellow_threshold is not None:
                if elapsed_days >= red_threshold:
                    warning = "红色预警"
                    red_count += 1
                elif elapsed_days >= yellow_threshold:
                    warning = "黄色预警"
                    yellow_count += 1
        elif task.status == "已完成":
            warning = "已完成"

        if task.task_type == "美工":
            if task.difficulty_score is not None:
                performanceSalary = settings.ART_PERFORMANCE_SALARY * task.difficulty_score / 16
                performanceSalary = round(performanceSalary, 2)
            else:
                performanceSalary = 0.0
        elif task.task_type == "渲染":
            performanceSalary = None
        # 保留两位小数
        sub_tasks_out.append({
            "name": task.ticket.name,
            "progress": task.progress,
            "warning": warning,
            "client_name": task.ticket.contract.client.name,
            "status" : task.status,
            "sub_task_id": task.id,
            "estimated_completion_time": task.estimated_completion_time,
            "sales_name": task.ticket.contract.sales.name if task.ticket.contract.sales else None,
            "performanceSalary": performanceSalary,
            "need_watermark": task.ticket.need_watermark,
        })
    return {
        "sub_tasks": sub_tasks_out,
        "yellow_count": yellow_count,
        "red_count": red_count,
    }

# 根据任务id获取任务详情(点击订单卡片显示有关任务详情，创建时间、预警状态、状态、进度、优先级、开始时间、标签、负责人)
@router.get("/sub_task_detail/{id}")
async def get_sub_task_detail(
    id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    # 获取任务详情
    res = await SubTaskService.get_sub_task_detail(db, id)
    # 获取预警状态(黄色预警（美工任务状态为不是已完成且距离创建时间两天未完成，渲染任务状态为不是已完成且距离创建时间一天未完成）
    # 红色预警（美工任务状态为不是已完成且距离创建时间三天未完成，渲染任务状态为不是已完成且距离创建时间两天未完成）)
    # 获取任务类型
    # 获取预警阈值
    warning = "正常"
    if res.status == "进行中" and res.started_at is not None:
        elapsed_days = (datetime.now(ZoneInfo("Asia/Shanghai")) - res.started_at).days
        yellow_threshold = res.estimated_completion_time
        red_threshold = res.estimated_completion_time + 1
        if yellow_threshold is not None and red_threshold is not None:
            if elapsed_days >= red_threshold:
                warning = "红色预警"
            elif elapsed_days >= yellow_threshold:
                warning = "黄色预警"
    out = { 
        "id": res.id,
        "ticket_name": res.ticket.name,
        "ticket_id": res.ticket.id,
        "notes": res.ticket.notes,
        "created_at": res.created_at.astimezone(ZoneInfo("Asia/Shanghai")).strftime("%Y-%m-%d %H:%M:%S"),
        "warning": warning,
        "status": res.status,
        "progress": res.progress,
        "priority": res.ticket.priority,
        "wechat_group": res.ticket.wechat_group,
        "started_at": res.started_at.astimezone(ZoneInfo("Asia/Shanghai")).strftime("%Y-%m-%d %H:%M:%S") if res.started_at else None,
        "completed_at": res.completed_at.astimezone(ZoneInfo("Asia/Shanghai")).strftime("%Y-%m-%d %H:%M:%S") if res.completed_at else None,
        "assignee": res.assignee.name if res.assignee else None,
        "charge": res.charge.name if res.charge else None,
        "estimated_completion_time": res.estimated_completion_time,
        "need_watermark": res.ticket.need_watermark,
    }
    # 根据任务id获取关于这个任务的所有的记录
    progress_log = await ProgressLogService.get_progress_log_by_id(db, res.ticket.id)
    log_list = []
    for log in progress_log:
        log_list.append({
            "id": log.id,
            "name": log.employee.name,
            "notes": log.notes,
            "created_at": log.log_time.astimezone(ZoneInfo("Asia/Shanghai")).strftime("%Y-%m-%d %H:%M:%S"),
        })
    # 获取任务相关人员(销售、美工、渲染)
    sales = await EmployeeService.get_employee_by_id(db, res.ticket.contract.sales_id)
    # 根据工单id获取美工和渲染
    charges = await TicketService.get_charge_ticket_by_id(db, res.ticket.id)
    # 提取"美工"和"渲染"负责人（如果有多条，只取第一条）
    art_person = next((c.charge.name for c in charges if c.task_type == '美工' and c.charge is not None), None)
    render_person = next((c.charge.name for c in charges if c.task_type == '渲染' and c.charge is not None), None)
    # 获取任务相关人员信息
    related_employees = {
        "sales": sales.name,
        "art": art_person,
        "render": render_person,
    }
    return {
        "order": out,
        "progress_log": log_list,
        "related_employees": related_employees
    }

# 团队工单页面信息初始化
@router.get("/team_tasks")
async def get_team_tasks(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee),
    task_name: str = Query(None),
    charge_name: str = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    #权限验证
    
    # 获取任务列表
    filter_params = SubTaskFilter(task_name=task_name, charge_name=charge_name, page=page, page_size=page_size)
    sub_tasks,total = await SubTaskService.get_team_sub_tasks(db, current_employee.id, filter_params)
    sub_tasks_out = []  # 存储带警告信息的任务（可选输出）
    for task in sub_tasks:
        warning = "正常"

        if task.status == "进行中" and task.started_at is not None:
            elapsed_days = (datetime.now(ZoneInfo("Asia/Shanghai")) - task.started_at).days

            # 黄色预警条件
            yellow_threshold = task.estimated_completion_time
            red_threshold = task.estimated_completion_time + 1

            if yellow_threshold is not None:
                if elapsed_days >= red_threshold:
                    warning = "红色预警"
                elif elapsed_days >= yellow_threshold:
                    warning = "黄色预警"
        elif task.status == "已完成":
            warning = "已完成"
        sub_tasks_out.append({
            "name": task.ticket.name,
            "progress": task.progress,
            "warning": warning,
            "client_name": task.ticket.contract.client.name,
            "status" : task.status,
            "charge_name": task.charge.name,
            "sub_task_id": task.id,
            "estimated_completion_time": task.estimated_completion_time,
            "sales_name": task.ticket.contract.sales.name if task.ticket.contract.sales else None,
            "need_watermark": task.ticket.need_watermark,
        })
    if current_employee.position.name == "渲染":
        task_type = "渲染"
    else:
        task_type = "美工"
    # 获取任务状态数量(并行请求)，已完成的只统计本月(从一号00:00:00到当前时间)
    yellow_count, red_count, completed_count, in_progress_count = await asyncio.gather(
        SubTaskService.get_sub_tasks_count(db, task_type=task_type, warning_status=["黄色预警"]),
        SubTaskService.get_sub_tasks_count(db, task_type=task_type, warning_status=["红色预警"]),
        SubTaskService.get_sub_tasks_count(db, task_type=task_type, status=["已完成"], start_time=datetime.now(ZoneInfo("Asia/Shanghai")).replace(day=1, hour=0, minute=0, second=0)),
        SubTaskService.get_sub_tasks_count(db, task_type=task_type, status=["进行中"])
    )
    return {
        "sub_tasks": sub_tasks_out,
        "total": total,
        "task_status": {
            "yellow_count": yellow_count,
            "red_count": red_count,
            "completed_count": completed_count,
            "in_progress_count": in_progress_count,
        }
    }

# 更新任务进度
@router.put("/update_progress/{id}")
async def update_progress(
    id: int,
    progress: int = Body(..., embed=True),
    notes: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    res = await SubTaskService.get_sub_task(db, id)
    # 若新进度progress为1-99，则新任务状态为进行中，若新进度progress为100，则新任务状态为已完成
    # 若新进度progress为0，则新任务状态为未开始
    if progress == 100:
        await SubTaskService.update_status(db, id, progress, res.status, "已完成")
    elif progress == 0:
        await SubTaskService.update_status(db, id, progress, res.status, "未开始")
    else:
        await SubTaskService.update_status(db, id, progress, res.status, "进行中")
    # 创建进度记录
    res =  await ProgressLogService.create_progress_log(db, id, notes, current_employee.id)
    return res

# 根据工单id获取子任务
@router.get("/sub_tasks/ticket/{ticket_id}")
async def get_sub_tasks_by_ticket_id(
    ticket_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    sub_tasks = await SubTaskService.get_sub_tasks_by_ticket_id(db, ticket_id)
    sub_tasks_out = []
    for task in sub_tasks:
        warning = "正常"
        if task.status == "进行中" and task.started_at is not None:
            elapsed_days = (datetime.now(ZoneInfo("Asia/Shanghai")) - task.started_at).days
            yellow_threshold = task.estimated_completion_time
            red_threshold = task.estimated_completion_time + 1
            if yellow_threshold is not None and red_threshold is not None:
                if elapsed_days >= red_threshold:
                    warning = "红色预警"
                elif elapsed_days >= yellow_threshold:
                    warning = "黄色预警"
        sub_tasks_out.append({
            "id": task.id,
            "type": task.task_type,
            "progress": task.progress,
            "status": task.status,
            "charge": task.charge.name if task.charge else None,
            "leader": task.assignee.name if task.assignee else None,
            "warning": warning,
        })
    return api_response(success=True, data=sub_tasks_out)


# 获取任务列表(总负责人)
@router.get("/sub_tasks")
async def get_sub_tasks(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(require_roles("owner")),
    task_name: str = Query(None),
    charge_name: str = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    # 总负责人：只查看查看美工任务
    filter_params = SubTaskFilter(task_name=task_name, charge_name=charge_name, page=page, page_size=page_size)
    art_tasks, art_total = await SubTaskService.get_sub_tasks(db, filter_params, "美工")
    sub_tasks_out = []  # 存储带警告信息的任务（可选输出）
    for task in art_tasks:
        warning = "正常"

        if task.status == "进行中" and task.started_at is not None:
            elapsed_days = (datetime.now(ZoneInfo("Asia/Shanghai")) - task.started_at).days

            # 黄色预警条件
            yellow_threshold = task.estimated_completion_time
            red_threshold = task.estimated_completion_time + 1

            if yellow_threshold is not None:
                if elapsed_days >= red_threshold:
                    warning = "红色预警"
                elif elapsed_days >= yellow_threshold:
                    warning = "黄色预警"
        elif task.status == "已完成":
            warning = "已完成"
        sub_tasks_out.append({
            "name": task.ticket.name,
            "progress": task.progress,
            "warning": warning,
            "client_name": task.ticket.contract.client.name,
            "status" : task.status,
            "charge_name": task.charge.name,
            "sub_task_id": task.id,
            "estimated_completion_time": task.estimated_completion_time,
            "sales_name": task.ticket.contract.sales.name if task.ticket.contract.sales else None,
            "need_watermark": task.ticket.need_watermark,

        })

    # 汇总美工任务状态数量（本月完成数按当月统计）
    art_yellow, art_red, art_completed, art_in_progress = await asyncio.gather(
        SubTaskService.get_sub_tasks_count(db, task_type="美工", warning_status=["黄色预警"]),
        SubTaskService.get_sub_tasks_count(db, task_type="美工", warning_status=["红色预警"]),
        SubTaskService.get_sub_tasks_count(db, task_type="美工", status=["已完成"], start_time=datetime.now(ZoneInfo("Asia/Shanghai")).replace(day=1, hour=0, minute=0, second=0)),
        SubTaskService.get_sub_tasks_count(db, task_type="美工", status=["进行中"]) 
    )
    yellow_count = art_yellow or 0
    red_count = art_red or 0
    completed_count = art_completed or 0
    in_progress_count = art_in_progress or 0
    return {
        "sub_tasks": sub_tasks_out,
        "total": art_total,
        "task_status": {
            "yellow_count": yellow_count,
            "red_count": red_count,
            "completed_count": completed_count,
            "in_progress_count": in_progress_count,
        }
    }