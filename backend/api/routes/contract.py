from fastapi import APIRouter, Depends, Body, Query, Path, File, UploadFile, Form
from backend.models.employee import Employee
from backend.models.sub_task import SubTask
from backend.models.ticket import Ticket
from backend.schemas.contract import ContractCreate, ContractFilter, ContractList, PaginatedContract, ContractDetailWithAppendix, ContractForProduction, ContractOperationLogCreate
from backend.db.session import get_async_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.api.routes.employee import get_current_employee
from typing import List, Optional
from backend.services.file_upload_services import FileUploadService
from backend.services.sub_task_service import SubTaskService
from backend.services.ticket_service import TicketService
from backend.services.contract_service import ContractService
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from backend.utils.response import api_response
from backend.api.deps.auth import any_of, require_departments, require_roles
from backend.services.sales_service import SalesService
from backend.services.client_service import ClientService
import logging

# 营销管理部的员工或者owner
router = APIRouter()
logger = logging.getLogger(__name__)

# 添加合同
@router.post("/contracts")
async def add_contract(
    file: UploadFile = File(None),
    contract_data: str = Form(...),
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
    contract = ContractCreate.model_validate_json(contract_data)
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
    if file:
        file_resource = await FileUploadService.upload_file(db, file, client["name"],current_employee.id)
        contract.file_resource_id = file_resource.id
    return await ContractService.add_contract(db, contract, current_employee.id)

# 获取个人成交合同
@router.get("/contracts")
async def get_contracts(
    name: str = Query(None),
    status: List[str] = Query(None),
    contract_type: List[str] = Query(None),
    source: List[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    page: int = Query(1),
    page_size: int = Query(10),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    #权限认证
    """
    查询合同列表，支持客户名称、状态、合同类型筛选与分页
    """

    filter_params = ContractFilter(
        name=name, 
        status=status, 
        contract_type=contract_type, 
        source=source, 
        start_date=start_date,
        end_date=end_date,
        page=page, 
        page_size=page_size
    )
    contracts, total = await ContractService.get_contracts(db, filter_params, current_employee.id)

    total_pages = (total + page_size - 1) // page_size  # 正确的分页计算

    #将Contract对象转换为ContractList对象
    contracts_out = []
    for contract in contracts:
        # 计算首付款提点（基于成交时间所在月份）
        prepayment_commission_rate = 0
        prepayment_commission = 0
        if contract.transaction_time and contract.paid_amount > 0:
            prepayment_commission_rate = await SalesService.get_commission_rate(
                db=db,
                year=contract.transaction_time.year,
                month=contract.transaction_time.month,
                sales_id=contract.sales_id,
                source=contract.client.source.value
            )
            prepayment_commission = round(float(contract.paid_amount) * float(prepayment_commission_rate) / 100, 2)
        
        # 计算尾款提点（基于结算时间所在月份）
        final_payment_commission_rate = 0
        final_payment_commission = 0
        if (contract.status == "已结算" and contract.settlement_time and (contract.total_amount - contract.paid_amount) > 0):
            final_payment_commission_rate = await SalesService.get_commission_rate(
                db=db,
                year=contract.settlement_time.year,
                month=contract.settlement_time.month,
                sales_id=contract.sales_id,
                source=contract.client.source.value
            )
            final_payment_commission = round(
                float(contract.total_amount - contract.paid_amount) * float(final_payment_commission_rate) / 100, 2)
        
        contracts_out.append(ContractList(
            id=contract.id,
            client_id=contract.client_id,
            client_name=contract.client.name,
            sales_name=contract.sales.name if contract.sales else '',
            contract_type=contract.contract_type.value,
            total_amount=contract.total_amount,
            paid_amount=contract.paid_amount,
            transaction_time=contract.transaction_time,
            status=contract.status,
            is_recharged=contract.is_recharged,
            settlement_time=contract.settlement_time,
            client_source=contract.client.source if contract.client else None,
            prepayment_commission=prepayment_commission,
            final_payment_commission=final_payment_commission
        ))
    # 构造分页响应并导出为 dict
    paginated = PaginatedContract(
        contracts=contracts_out, 
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )
    return paginated.model_dump()


# === 新增API：合同附属功能相关 ===

# 创建附属合同
@router.post("/contracts/{parent_id}/appendix")
async def create_appendix_contract(
    parent_id: int,
    file: UploadFile = File(None),
    contract_data: str = Form(...),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    """为现有合同创建附属合同"""
    contract = ContractCreate.model_validate_json(contract_data)
    
    # 设置为附属合同
    contract.parent_contract_id = parent_id
    contract.is_appendix = True
    
    # 获取主合同的客户信息用于提点计算
    main_contract = await ContractService.get_contract_by_id(db, parent_id)
    if not main_contract:
        return api_response(success=False, error="主合同不存在")
    
    # ✅ 权限验证：只有主合同的销售人员可以创建附属合同
    if main_contract.sales_id != current_employee.id:
        return api_response(success=False, error="只有主合同的销售人员可以创建附属合同")
    
    client = await ClientService.get_client_info(db, main_contract.client_id)
    
    # 计算提点（使用与主合同相同的逻辑）
    async def get_commission_rate(client_source: str):
        if client_source == "线上":
            return 4
        else:
            start_date = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            total_received = await SalesService.get_total_received(db, start_date=start_date, end_date=contract.transaction_time, sales_id=current_employee.id)
            total_received = total_received + contract.paid_amount
            if total_received < 50000:
                return 10
            elif total_received < 100000:
                return 12
            else:
                return 15
    
    commission_rate = await get_commission_rate(client["source"])
    contract.commission_rate = commission_rate
    
    # 处理文件上传
    if file:
        file_resource = await FileUploadService.upload_file(db, file, client["name"], current_employee.id)
        contract.file_resource_id = file_resource.id
    
    # 创建附属合同
    result = await ContractService.add_contract(db, contract, current_employee.id)
    
    # 记录操作
    from backend.services.contract_operation_log_service import ContractOperationLogService
    await ContractOperationLogService.create_log(
        db,
        ContractOperationLogCreate(
            contract_id=parent_id,
            operation_type="创建附属合同",
            operation_detail=f"创建附属合同，金额：¥{contract.total_amount}，备注：{contract.notes or '无'}"
        ),
        current_employee.id
    )
    
    # ✅ 触发附属合同创建后处理
    await _handle_appendix_contract_created(db, parent_id, contract, current_employee.id)
    
    return result

# 内部函数：处理附属合同创建后的逻辑
async def _handle_appendix_contract_created(db: AsyncSession, main_contract_id: int, appendix_contract: ContractCreate, operator_id: int):
    """处理附属合同创建后的通知和工单更新逻辑"""
    try:
        # 1. 标记主合同有新的附属合同需要处理
        from backend.services.contract_operation_log_service import ContractOperationLogService
        await ContractOperationLogService.create_log(
            db,
            ContractOperationLogCreate(
                contract_id=main_contract_id,
                operation_type="附属合同需求变更",
                operation_detail=f"新增需求：详情页+{appendix_contract.detail_pages}，视频+{appendix_contract.video_count}，图片+{appendix_contract.image_count}，流程图+{appendix_contract.workflow_count}"
            ),
            operator_id
        )
        
        # 2. 查找主合同的相关工单，添加备注信息
        tickets = await db.execute(
            select(Ticket).where(Ticket.contract_id == main_contract_id)
        )
        
        for ticket in tickets.scalars():
            # 添加附属合同信息到工单备注
            appendix_note = f"\n[附属合同更新] {appendix_contract.notes or '需求增加'}"
            if ticket.notes:
                ticket.notes += appendix_note
            else:
                ticket.notes = appendix_note.strip()
        
        await db.commit()
        
        logger.info(f"附属合同创建后处理完成: main_contract_id={main_contract_id}")
        
    except Exception as e:
        logger.error(f"处理附属合同创建后逻辑失败: {str(e)}")
        await db.rollback()

# 获取合同树形结构（主合同+附属合同）
@router.get("/contracts/tree/{contract_id}")
async def get_contract_tree(
    contract_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    """获取合同及其附属合同的树形结构"""
    return await ContractService.get_contract_with_appendix(db, contract_id)

# 美工主管获取待处理合同列表
@router.get("/contracts/pending-for-production")
async def get_pending_contracts_for_production(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(require_departments("生产部"))
):
    """美工主管获取待处理的合同列表"""
    return await ContractService.get_contracts_for_production(db)

# 获取聚合后的合同列表（主合同+附属合同整合显示）
@router.get("/contracts/aggregated")
async def get_aggregated_contracts(
    name: str = Query(None),
    status: List[str] = Query(None),
    contract_type: List[str] = Query(None),
    source: List[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    page: int = Query(1),
    page_size: int = Query(10),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    """获取聚合后的合同列表，将主合同和附属合同整合显示"""
    filter_params = ContractFilter(
        name=name,
        status=status,
        contract_type=contract_type,
        source=source,
        start_date=start_date,
        end_date=end_date,
        page=page,
        page_size=page_size
    )
    
    contracts = await ContractService.get_aggregated_contracts(db, current_employee.id, filter_params)
    
    # 实现分页
    start = (page - 1) * page_size
    end = start + page_size
    paginated_contracts = contracts[start:end]
    total = len(contracts)
    
    return api_response(success=True, data={
        'contracts': paginated_contracts,
        'total': total,
        'page': page,
        'page_size': page_size,
        'total_pages': (total + page_size - 1) // page_size
    })

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

# === 其他原有API ===

@router.get("/contracts/client/{client_id}")
async def get_contracts_by_client_id(
    client_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    """根据客户id获取合同信息"""
    try:
        # 调用service层获取数据
        result = await ContractService.get_contracts_by_client_id(db, client_id)
        if result['success']:
            return api_response(success=True, data=result['data'])
        else:
            return api_response(success=False, error=result['error'])
    except Exception as e:
        logger.error(f"获取客户合同失败: {str(e)}")
        return api_response(success=False, error="获取客户合同失败")

@router.put("/contracts/{id}/status")
async def update_contract_status(
    id: int,
    status: str = Form(...),
    settlement_time: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    # 更新合同状态
    await ContractService.update_contract_status(db, id, status, settlement_time)
    return api_response(success=True, data="合同状态更新成功")

@router.get("/contracts/{id}")
async def get_contract_detail(
    id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    """
    获取合同详情 - ✅ 使用聚合需求计算
    
    返回：
    - pending_details：剩余制作需求数量（基于聚合需求）
    - completed_details：已完成制作需求数量
    - yellow_count：黄色预警数量（5<=time<7，剩余时间在5-7天之间的子任务数量）
    - red_count：红色预警数量（time<5，剩余时间小于5天的子任务数量）
    - art_tasks：美工任务列表（合同+工单+子任务，美工任务）
    - render_tasks：渲染任务列表（合同+工单+子任务，渲染任务）
    """
    # ✅ 使用聚合需求计算
    aggregated_requirements = await ContractService._get_aggregated_requirements(db, id)
    
    # 获取所有工单
    tickets_result = await db.execute(select(Ticket).where(Ticket.contract_id == id))
    tickets = tickets_result.scalars().all()
    
    # 调用 TicketService 获取完成的工单
    completed_requirements = await TicketService.get_completed_ticket_counts_by_contract(db, id)
    
    # 计算剩余需求（聚合需求 - 已完成需求）
    pending_requirements = {
        "detailPage": max(0, aggregated_requirements["detail_pages"] - completed_requirements["detail_pages"]),
        "video": max(0, aggregated_requirements["video_count"] - completed_requirements["video_count"]),
        "image": max(0, aggregated_requirements["image_count"] - completed_requirements["image_count"]),
        "workflow": max(0, aggregated_requirements["workflow_count"] - completed_requirements["workflow_count"])
    }
    
    # 美工任务和渲染任务获取
    art_tasks = []
    render_tasks = []
    
    try:
        # 获取所有子任务
        for ticket in tickets:
            sub_tasks = await TicketService.get_charge_ticket_by_id(db, ticket.id)
            for sub_task in sub_tasks:
                if sub_task.task_type == "美工":
                    art_tasks.append({
                        "task_id": sub_task.id,
                        "progress": sub_task.progress,
                        "status": sub_task.status,
                        "charge_name": sub_task.charge.name if sub_task.charge else None
                    })
                elif sub_task.task_type == "渲染":
                    render_tasks.append({
                        "task_id": sub_task.id,
                        "progress": sub_task.progress,
                        "status": sub_task.status,
                        "charge_name": sub_task.charge.name if sub_task.charge else None
                    })
        
        art_render_result = {
            "art_tasks": art_tasks,
            "render_tasks": render_tasks
        }
    except Exception as e:
        logger.error(f"获取美工渲染任务失败: {str(e)}")
        art_render_result = {
            "art_tasks": [],
            "render_tasks": []
        }
    
    return api_response(
        success=True,
        data={
            "pending_details": pending_requirements,
            "completed_details": completed_requirements,
            **art_render_result
        }
    )

@router.get("/contracts/{id}/remaining_requirements")
async def get_remaining_requirements(
    id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    """获取合同剩余需求 - ✅ 使用聚合需求计算"""
    result = await ContractService.get_remaining_requirements(db, id)
    return api_response(success=True, data=result)

@router.delete("/contracts/{id}")
async def delete_contract(
    id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    result = await ContractService.delete_contract(db, id)
    return result

@router.get("/contracts/readonly/{employee_id}")
async def get_readonly_contracts(
    employee_id: int,
    name: str = Query(None),
    status: List[str] = Query(None),
    contract_type: List[str] = Query(None),
    source: List[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    page: int = Query(1),
    page_size: int = Query(10),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    """
    只读合同列表，根据传入的员工id获取对应的合同列表
    """
    filter_params = ContractFilter(
        name=name,
        status=status,
        contract_type=contract_type,
        source=source,
        start_date=start_date,
        end_date=end_date,
        page=page,
        page_size=page_size
    )
    
    contracts, total = await ContractService.get_contracts(db, filter_params, employee_id)
    
    total_pages = (total + page_size - 1) // page_size  # 正确的分页计算

    #将Contract对象转换为ContractList对象
    contracts_out = []
    for contract in contracts:
        # 计算首付款提点（基于成交时间所在月份）
        prepayment_commission_rate = 0
        prepayment_commission = 0
        if contract.transaction_time and contract.paid_amount > 0:
            prepayment_commission_rate = await SalesService.get_commission_rate(
                db=db,
                year=contract.transaction_time.year,
                month=contract.transaction_time.month,
                sales_id=contract.sales_id,
                source=contract.client.source.value
            )
            prepayment_commission = round(float(contract.paid_amount) * float(prepayment_commission_rate) / 100, 2)
        
        # 计算尾款提点（基于结算时间所在月份）
        final_payment_commission_rate = 0
        final_payment_commission = 0
        if (contract.status == "已结算" and contract.settlement_time and (contract.total_amount - contract.paid_amount) > 0):
            final_payment_commission_rate = await SalesService.get_commission_rate(
                db=db,
                year=contract.settlement_time.year,
                month=contract.settlement_time.month,
                sales_id=contract.sales_id,
                source=contract.client.source.value
            )
            final_payment_commission = round(
                float(contract.total_amount - contract.paid_amount) * float(final_payment_commission_rate) / 100, 2)
        
        contracts_out.append(ContractList(
            id=contract.id,
            client_name=contract.client.name,
            sales_name=contract.sales.name if contract.sales else '',
            contract_type=contract.contract_type.value,
            total_amount=contract.total_amount,
            paid_amount=contract.paid_amount,
            transaction_time=contract.transaction_time,
            status=contract.status,
            is_recharged=contract.is_recharged,
            settlement_time=contract.settlement_time,
            client_source=contract.client.source if contract.client else None,
            prepayment_commission=prepayment_commission,
            final_payment_commission=final_payment_commission
        ))
    # 构造分页响应并导出为 dict
    paginated = PaginatedContract(
        contracts=contracts_out, 
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )
    return paginated.model_dump()
