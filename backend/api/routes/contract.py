from fastapi import APIRouter, Depends, Body, Query, Path
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
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from backend.utils.response import api_response
from backend.api.deps.auth import any_of, require_departments, require_roles
from backend.services.sales_service import SalesService
from backend.services.client_service import ClientService
# 营销管理部的员工或者owner
router = APIRouter()

# 添加合同
@router.post("/contracts")
async def add_contract(
    contract: ContractCreate = Body(...),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    #权限认证
    # 根据实际到账金额和客户来源确定本单合同的提点
    """
    线上客户 固定为4%
    线下客户：
    0-5万以下 10%
    5万-10万 12%
    10万以上 15%
    """
    async def get_commission_rate(client_source: str):
        if client_source == "线上":
            return 4
        else:
            start_date = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            total_received = await SalesService.get_total_received(db,start_date=start_date,end_date=contract.transaction_time,sales_id=current_employee.id)
            total_received = total_received + contract.paid_amount
            if total_received < 50000:
                return 10
            elif total_received < 100000:
                return 12
            else:
                return 15
    # 获取客户信息
    client = await ClientService.get_client_info(db, contract.client_id)
    commission_rate = await get_commission_rate(client["source"])    
    contract.commission_rate = commission_rate
    return await ContractService.add_contract(db, contract, current_employee.id)

# 获取个人成交合同
@router.get("/contracts")
async def get_contracts(
    name: str = Query(None),
    status: List[str] = Query(None),
    contract_type: List[str] = Query(None),
    source: List[str] = Query(None),
    page: int = Query(1),
    page_size: int = Query(10),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    #权限认证
    """
    查询合同列表，支持客户名称、状态、合同类型筛选与分页
    """

    filter_params = ContractFilter(name=name, status=status, contract_type=contract_type, source=source, page=page, page_size=page_size)
    contracts, total = await ContractService.get_contracts(db, filter_params, current_employee.id)

    total_pages = (total + page_size - 1) // page_size  # 正确的分页计算

    #将Contract对象转换为ContractList对象
    contracts_out = [
        ContractList(
            id=contract.id,
            client_name=contract.client.name,
            sales_name=contract.sales.name if contract.sales else '',
            contract_type=contract.contract_type.value,
            total_amount=contract.total_amount,
            paid_amount=contract.paid_amount,
            commission_rate=contract.commission_rate,
            transaction_time=contract.transaction_time,
            status=contract.status,
            is_recharged=contract.is_recharged,
            settlement_time=contract.settlement_time,
            client_source=contract.client.source if contract.client else None
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

# 获取所有尾款未结算合同（不限定当前登录销售）
@router.get("/contracts/pending")
async def get_all_contracts(
    name: str = Query(None),
    status: List[str] = Query(['待结算']),
    page: int = Query(1),
    page_size: int = Query(10),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    """
    查询所有尾款未结算合同列表
    用于管理端汇总视图。
    """
    filter_params = ContractFilter(name=name, status=status, page=page, page_size=page_size)
    contracts, total = await ContractService.get_pending_contracts(db, filter_params, employee_id=0)

    total_pages = (total + page_size - 1) // page_size

    contracts_out = [
        ContractList(
            id=contract.id,
            client_name=contract.client.name,
            sales_name=contract.sales.name if contract.sales else '',
            contract_type=contract.contract_type.value,
            total_amount=contract.total_amount,
            paid_amount=contract.paid_amount,
            commission_rate=contract.commission_rate,
            transaction_time=contract.transaction_time,
            status=contract.status,
            is_recharged=contract.is_recharged,
            settlement_time=contract.settlement_time
        )
        for contract in contracts
    ]

    paginated = PaginatedContract(
        contracts=contracts_out,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )
    return paginated.model_dump()

# 销售主管根据客户id获取成交合同列表
@router.get("/contracts/client/{client_id}")
async def get_contracts_by_client_id(
    client_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    #权限认证
    
    contracts = await ContractService.get_contracts_by_client_id(db, client_id)
    contracts_out = [
        ContractList(
            id=contract.id,
            client_name=contract.client.name,
            sales_name=contract.sales.name if contract.sales else '',
            contract_type=contract.contract_type.value,
            total_amount=contract.total_amount,
            paid_amount=contract.paid_amount,
            commission_rate=contract.commission_rate,
            transaction_time=contract.transaction_time,
            status=contract.status,
            is_recharged=contract.is_recharged,
            settlement_time=contract.settlement_time
        ) 
        for contract in contracts
    ]
    return contracts_out

# 更改合同状态
@router.put("/contracts/{id}/status")
async def update_contract_status(
    id: int,
    status: str = Body(..., embed=True),
    settlement_time: datetime = Body(None, embed=True),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    #权限认证

    return await ContractService.update_contract_status(db, id, status, settlement_time)


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
    # 任务名称、组长、负责人、创建时间、状态、预警情况
    yellow_count = 0
    red_count = 0

    art_tasks_out = []
    now = datetime.now(tz=ZoneInfo("Asia/Shanghai"))
    for task in art_tasks:
        yellow_threshold = task.estimated_completion_time if task.estimated_completion_time else 2
        red_threshold = task.estimated_completion_time + 1 if task.estimated_completion_time else 3
        warning = "正常"
        if task.status == "进行中" and task.started_at:
            elapsed_days = (datetime.now(ZoneInfo("Asia/Shanghai")) - task.created_at).days
            if elapsed_days > red_threshold:
                warning = "红色预警"
                red_count += 1
            elif elapsed_days > yellow_threshold:
                warning = "黄色预警"
                yellow_count += 1
        beijing_time = task.created_at.astimezone(ZoneInfo("Asia/Shanghai"))
        art_tasks_out.append({
            "id": task.id,
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
        yellow_threshold = task.estimated_completion_time if task.estimated_completion_time else 2
        red_threshold = task.estimated_completion_time + 1 if task.estimated_completion_time else 3
        warning = "正常"
        if task.status == "进行中" and task.started_at:
            elapsed_days = (datetime.now(ZoneInfo("Asia/Shanghai")) - task.created_at).days
            if elapsed_days > red_threshold:
                warning = "红色预警"
                red_count += 1
            elif elapsed_days > yellow_threshold:
                warning = "黄色预警"
                yellow_count += 1
        beijing_time = task.created_at.astimezone(ZoneInfo("Asia/Shanghai"))
        render_tasks_out.append({
            "id": task.id,
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


# 合同剩余需求
@router.get("/contracts/{id}/remaining_requirements")
async def get_remaining_requirements(
    id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    #权限认证
    result = await ContractService.get_remaining_requirements(db, id)

    return api_response(success=True, data=result)

# 删除合同
@router.delete("/contracts/{id}")
async def delete_contract(
    id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    #权限认证
    
    return await ContractService.delete_contract(db, id)

# 只读销售看板 - 获取指定销售人员的合同列表
@router.get("/contracts/readonly/{employee_id}")
async def get_readonly_contracts(
    employee_id: int,
    name: str = Query(None),
    status: List[str] = Query(None),
    contract_type: List[str] = Query(None),
    source: List[str] = Query(None),
    page: int = Query(1),
    page_size: int = Query(10),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    """只读模式获取指定销售人员的合同列表"""
    #权限认证
    
    filter_params = ContractFilter(name=name, status=status, contract_type=contract_type, source=source, page=page, page_size=page_size)
    contracts, total = await ContractService.get_contracts(db, filter_params, employee_id)

    total_pages = (total + page_size - 1) // page_size  # 正确的分页计算

    #将Contract对象转换为ContractList对象
    contracts_out = [
        ContractList(
            id=contract.id,
            client_name=contract.client.name,
            sales_name=contract.sales.name if contract.sales else '',
            contract_type=contract.contract_type.value,
            total_amount=contract.total_amount,
            paid_amount=contract.paid_amount,
            commission_rate=contract.commission_rate,
            transaction_time=contract.transaction_time,
            status=contract.status,
            is_recharged=contract.is_recharged,
            settlement_time=contract.settlement_time,
            client_source=contract.client.source if contract.client else None
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


