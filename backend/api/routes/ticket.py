from fastapi import APIRouter, Body, HTTPException
from backend.services.ticket_service import TicketService
from backend.services.sub_task_service import SubTaskService
from backend.db.session import get_async_db
from backend.api.routes.employee import get_current_employee
from backend.models.employee import Employee
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from backend.schemas.ticket import TicketCreate, TicketUpdate
from backend.schemas.sub_task import SubTaskCreate
from backend.services.progress_log_service import ProgressLogService
from backend.utils.response import api_response
router = APIRouter()

# 创建工单
@router.post("/tickets")
async def create_ticket(
    ticket: TicketCreate = Body(...),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    # 需求之和不能<=0
    sum = ticket.detail_pages + ticket.video_count + ticket.image_count + ticket.workflow_count
    if sum <= 0 :
        return api_response(success=False,error="工单需求不能为空！")
    # 创建工单
    new_ticket = await TicketService.create_ticket(db, ticket, current_employee)
    flag = True

    # 如果需要美工，则需要创建美工任务
    if ticket.needArt:
        art_res = await SubTaskService.create_task(db, SubTaskCreate(
            ticket_id=new_ticket.id,
            task_type="美工",
            status="未分配",
            progress=0,
            edit_count=0, 
        ))
        # 创建进度记录
        notes = f"{current_employee.name}创建了工单"
        # 只需创建一个进度记录，因为工单创建时，美工和渲染任务是同时创建的
        if flag:
            await ProgressLogService.create_progress_log(db, art_res.id, notes, current_employee.id)
            flag = False
    # 如果需要渲染，则需要创建渲染任务
    if ticket.needRender:
        render_res = await SubTaskService.create_task(db, SubTaskCreate(
            ticket_id=new_ticket.id,
            task_type="渲染",
            status="未分配",
            progress=0,
            edit_count=0,
        ))
        # 创建进度记录
        notes = f"{current_employee.name}创建了工单"
        # 只需创建一个进度记录，因为工单创建时，美工和渲染任务是同时创建的若是已经创建过，则不创建
        if flag:
            await ProgressLogService.create_progress_log(db, render_res.id, notes, current_employee.id)
            flag = False

    return {"message": "工单创建成功", "ticket": new_ticket}
        

# 获取所有工单
@router.get("/tickets")
async def get_tickets(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    tickets = await TicketService.get_tickets(db)
    return {"tickets": tickets}


# 根据合同ID获取工单列表
@router.get("/tickets/contract/{contract_id}")
async def get_tickets_by_contract(
    contract_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    tickets = await TicketService.get_ticket_by_contract_id(db, contract_id)
    return api_response(success=True, data=tickets)


# 根据工单ID获取工单信息
@router.get("/tickets/{ticket_id}")
async def get_ticket_info(
    ticket_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    ticket = await TicketService.get_ticket_by_id(db, ticket_id)
    return api_response(success=True, data=ticket)

# 根据工单ID更新工单信息
@router.put("/tickets/{ticket_id}")
async def update_ticket_by_id(
    ticket_id: int,
    ticket: TicketUpdate = Body(...),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    ticket = await TicketService.update_ticket_by_id(db, ticket_id, ticket)
    return api_response(success=True, data=ticket)


