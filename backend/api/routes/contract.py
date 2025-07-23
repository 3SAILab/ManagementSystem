from fastapi import APIRouter, Depends, Body, Query
from backend.models.employee import Employee
from backend.models.sub_task import SubTask
from backend.schemas.contract import ContractCreate, ContractFilter, ContractList, PaginatedContract
from backend.db.session import get_async_db
from sqlalchemy.ext.asyncio import AsyncSession
from backend.api.routes.employee import get_current_employee
from typing import List
from backend.services.sub_task_service import SubTaskService
from backend.services.ticket_service import TicketService
from backend.services.contract_service import ContractService
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

router = APIRouter()

# 添加合同
@router.post("/contracts")
async def add_contract(
    contract: ContractCreate = Body(...),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    #权限认证
    
    return await ContractService.add_contract(db, contract, current_employee.id)

# 获取合同
@router.get("/contracts")
async def get_contracts(
    name: str = Query(None),
    status: List[str] = Query(None),
    contract_type: List[str] = Query(None),
    page: int = Query(1),
    page_size: int = Query(10),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    #权限认证
    """
    查询合同列表，支持客户名称、状态、合同类型筛选与分页
    """

    filter_params = ContractFilter(name=name, status=status, contract_type=contract_type, page=page, page_size=page_size)
    contracts, total = await ContractService.get_contracts(db, filter_params, current_employee.id)

    total_pages = (total + page_size - 1) // page_size  # 正确的分页计算

    #将Client对象转换为ClientOut对象
    contracts_out = [
        ContractList(
            id=contract.id,
            client_name=contract.client.name,
            contract_type=contract.contract_type.value,
            total_amount=contract.total_amount,
            paid_amount=contract.paid_amount,
            commission_rate=contract.commission_rate,
            created_at=contract.created_at
        ) 
        for contract in contracts
    ]
    # 构造分页响应并导出为 dict
    paginated = PaginatedContract(
        contracts=contracts_out, 
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )
    return paginated.model_dump()

# 合同详情页初始化数据
# 返回数据：黄色预警总个数、红色预警总个数、美工任务列表、渲染任务列表、已完成需求情况、未完成需求情况
@router.get("/contracts/{id}")
async def get_contract_detail(
    id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    art_tasks = await SubTaskService.get_art_tasks_by_contract_id(db, id)
    render_tasks = await SubTaskService.get_render_tasks_by_contract_id(db, id)
    # 黄色预警（美工任务状态为进行中且距离开始时间两天未完成，渲染任务状态为进行中且距离开始时间一天未完成）
    # 红色预警（美工任务状态为进行中且距离开始时间三天未完成，渲染任务状态为进行中且距离开始时间两天未完成）
    # 任务名称、组长、负责人、创建时间、状态、预警情况
    
    yellow_count = 0
    red_count = 0

    art_tasks_out = []
    now = datetime.now(tz=ZoneInfo("Asia/Shanghai"))
    for task in art_tasks:
        warning = "正常"
        if task.status == "进行中" and task.started_at:
            if task.started_at < now - timedelta(days=3):
                warning = "红色预警"
                red_count += 1
            elif task.started_at < now - timedelta(days=2):
                warning = "黄色预警"
                yellow_count += 1
        beijing_time = task.created_at.astimezone(ZoneInfo("Asia/Shanghai"))
        art_tasks_out.append({
            "name": task.ticket.name,
            "leader": task.assignee.name if task.assignee else None,
            "charge": task.charge.name if task.charge else None,
            "created_at": beijing_time.strftime("%Y-%m-%d %H:%M:%S"),
            "status": task.status,
            "progress": task.progress,
            "edit_count": task.edit_count,
            "warning": warning
        })
    render_tasks_out = []
    for task in render_tasks:
        warning = "正常"
        if task.status == "进行中" and task.started_at:
            # 渲染任务的预警时间不同
            if task.started_at < now - timedelta(days=2):
                warning = "红色预警"
                red_count += 1
            elif task.started_at < now - timedelta(days=1):
                warning = "黄色预警"
                yellow_count += 1
        beijing_time = task.created_at.astimezone(ZoneInfo("Asia/Shanghai"))
        render_tasks_out.append({
            "name": task.ticket.name,
            "leader": task.assignee.name if task.assignee else None,
            "charge": task.charge.name if task.charge else None,
            "created_at": beijing_time.strftime("%Y-%m-%d %H:%M:%S"),
            "status": task.status,
            "progress": task.progress,
            "edit_count": task.edit_count,
            "warning": warning
        })
    # 合同已完成需求情况
    completed_details = await TicketService.get_completed_ticket_counts_by_contract(db, id)
    # 合同需求情况
    res = await ContractService.get_contract_completion(db, id)
    return {
        "art_tasks": art_tasks_out,
        "render_tasks": render_tasks_out,
        "completed_details": {
            "detailPage": completed_details['detail_pages'],
            "video": completed_details['video_count'],
            "image": completed_details['image_count'],
            "workflow": completed_details['workflow_count']
        },
        "pending_details": {
            "detailPage": res.detail_pages - completed_details['detail_pages'],
            "video": res.video_count - completed_details['video_count'],
            "image": res.image_count - completed_details['image_count'],
            "workflow": res.workflow_count - completed_details['workflow_count']
        },
        "yellow_count": yellow_count,
        "red_count": red_count
    }