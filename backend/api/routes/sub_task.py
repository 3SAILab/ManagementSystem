from typing import Optional
from fastapi import APIRouter, Body
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

# 获取未分配任务
@router.get("/sub_tasks/unassigned")
async def get_sub_tasks_unassigned(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    if current_employee.position.name == "美工主管":
        return await SubTaskService.get_art_tasks_unassigned(db)
    elif current_employee.position.name == "渲染主管":
        return await SubTaskService.get_render_tasks_unassigned(db)

# 分配任务
@router.put("/assign_task/{id}")
async def assign_sub_task(
    id: int,
    charge_id: int = Body(..., embed=True),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    # 分配任务
    res = await SubTaskService.assign_sub_task(db, id, charge_id, current_employee.id)
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
        "ticket_name": res.ticket.name,
        "notes": res.ticket.notes,
    }
    return out

# 个人工单页面信息初始化
@router.get("/personal_tasks")
async def get_personal_tasks(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    sub_tasks = await SubTaskService.get_sub_tasks_by_charge_id(db, current_employee.id)
    # 黄色预警（美工任务状态为已完成以外的状态且距离创建时间两天未完成，渲染任务状态为已完成以外的状态且距离创建时间一天未完成）
    # 红色预警（美工任务状态为已完成以外的状态且距离创建时间三天未完成，渲染任务状态为已完成以外的状态且距离创建时间两天未完成）
    yellow_count = 0
    red_count = 0
    sub_tasks_out = []  # 存储带警告信息的任务（可选输出）

    for task in sub_tasks:
        warning = "正常"

        if task.status != "已完成":
            elapsed_days = (datetime.now(ZoneInfo("Asia/Shanghai")) - task.created_at).days

            # 判断任务类型：假设 task.type 取值为 'design'（美工）、'rendering'（渲染）等
            is_design_task = task.task_type == '美工'      # 美工任务
            is_render_task = task.task_type == '渲染'   # 渲染任务

            # 黄色预警条件
            yellow_threshold = 2 if is_design_task else 1 if is_render_task else None
            red_threshold = 3 if is_design_task else 2 if is_render_task else None

            if yellow_threshold is not None:
                if elapsed_days > red_threshold:
                    warning = "红色预警"
                    red_count += 1
                elif elapsed_days > yellow_threshold:
                    warning = "黄色预警"
                    yellow_count += 1
        elif task.status == "已完成":
            warning = "已完成"
        beijing_time = task.created_at.astimezone(ZoneInfo("Asia/Shanghai"))
        sub_tasks_out.append({
            "name": task.ticket.name,
            "progress": task.progress,
            "warning": warning,
            "client_name": task.ticket.contract.client.name,
            "status" : task.status,
            "sub_task_id": task.id,
        })
    return {
        "sub_tasks": sub_tasks_out,
        "yellow_count": yellow_count,
        "red_count": red_count
    }

# 根据任务id获取任务详情(点击订单卡片显示有关任务详情，创建时间、预警状态、状态、进度、优先级、开始时间、标签、负责人)
@router.get("/sub_task_detail/{id}")
async def get_sub_task_detail(
    id: int,
    db: AsyncSession = Depends(get_async_db)
):
    # 获取任务详情
    res = await SubTaskService.get_sub_task_detail(db, id)
    # 获取预警状态(黄色预警（美工任务状态为不是已完成且距离创建时间两天未完成，渲染任务状态为不是已完成且距离创建时间一天未完成）
    # 红色预警（美工任务状态为不是已完成且距离创建时间三天未完成，渲染任务状态为不是已完成且距离创建时间两天未完成）)
    # 获取任务类型
    is_design_task = res.task_type == '美工'      # 美工任务
    is_render_task = res.task_type == '渲染'   # 渲染任务
    # 获取预警阈值
    yellow_threshold = 2 if is_design_task else 1 if is_render_task else None
    red_threshold = 3 if is_design_task else 2 if is_render_task else None
    warning = "正常"
    if res.status != "已完成":
        elapsed_days = (datetime.now(ZoneInfo("Asia/Shanghai")) - res.created_at).days
        if elapsed_days > red_threshold:
            warning = "红色预警"
        elif elapsed_days > yellow_threshold:
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
        "start_date": res.started_at.astimezone(ZoneInfo("Asia/Shanghai")).strftime("%Y-%m-%d %H:%M:%S") if res.started_at else None,
        "assignee": res.assignee.name if res.assignee else None,
        "charge": res.charge.name if res.charge else None,
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
    art = await EmployeeService.get_employee_by_id(db, res.assignee_id)
    render = await EmployeeService.get_employee_by_id(db, res.charge_id)
    # 获取任务相关人员信息
    related_employees = {
        "sales": sales.name,
        "art": art.name,
        "render": render.name,
    }
    return {
        "order": out,
        "progress_log": log_list,
        "related_employees": related_employees
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
    # 先判断任务状态是否为未开始，如果为未开始，则更新任务状态为进行中
    res = await SubTaskService.get_sub_task(db, id)
    if res.status == "未开始":
        await SubTaskService.update_status(db, id, "进行中", progress)
    if res.status == "进行中" and progress == 100:
        print("已完成")
        await SubTaskService.update_status(db, id, "已完成", progress)
    if res.status == "进行中" and progress != 100:
        await SubTaskService.update_status(db, id, "进行中", progress)
    # 创建进度记录
    res =  await ProgressLogService.create_progress_log(db, id, notes, current_employee.id)
    return res




