from backend.schemas.ticket import TicketCreate
from backend.models.employee import Employee
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.models.ticket import Ticket
from backend.models.sub_task import SubTask
from backend.schemas.ticket import TicketUpdate

class TicketService:

    # 创建工单
    @staticmethod
    async def create_ticket(db: AsyncSession, ticket: TicketCreate, current_employee: Employee):
        # 创建工单
        new_ticket = Ticket(
            name=ticket.name,
            contract_id=ticket.contract_id,
            detail_pages=ticket.detail_pages,
            video_count=ticket.video_count,
            image_count=ticket.image_count,
            workflow_count=ticket.workflow_count,
            wechat_group=ticket.wechatGroup,
            notes=ticket.notes or '',
            priority=ticket.priority,
            platform=ticket.platform
        )
        db.add(new_ticket)
        await db.flush()
        await db.refresh(new_ticket)
        return new_ticket

    # 获取所有工单
    @staticmethod
    async def get_tickets(db: AsyncSession):
        result = await db.execute(select(Ticket))
        tickets = result.scalars().all()
        return tickets

    # 根据合同ID获取已完成的工单，并返回已完成的需求数量
    @staticmethod
    async def get_completed_ticket_counts_by_contract(db: AsyncSession, contract_id: int):
        # 查找与合同ID相关的所有工单，并预加载子任务
        stmt = select(Ticket).where(Ticket.contract_id == contract_id).options(selectinload(Ticket.sub_tasks))
        result = await db.execute(stmt)
        tickets = result.scalars().all()
        # 筛选所有子任务都已完工的工单
        completed_tickets = [
            t for t in tickets
            if t.sub_tasks and all(st.status == "已完成" for st in t.sub_tasks)
        ]
        # 计算已完成工单的需求总量
        total_detail_pages = sum(t.detail_pages for t in completed_tickets)
        total_video_count = sum(t.video_count for t in completed_tickets)
        total_image_count = sum(t.image_count for t in completed_tickets)
        total_workflow_count = sum(t.workflow_count for t in completed_tickets)
        
        return {
            "detail_pages": total_detail_pages,
            "video_count": total_video_count,
            "image_count": total_image_count,
            "workflow_count": total_workflow_count,
        }


    # 根据工单id获取美工和渲染
    @staticmethod
    async def get_charge_ticket_by_id(db: AsyncSession, ticket_id: int):
        result = await db.execute(select(SubTask).where(SubTask.ticket_id == ticket_id).options(selectinload(SubTask.charge)))
        charges = result.scalars().all()
        return charges

    # 根据合同id获取所有工单 (包括工单状态，若工单对应所有子任务都已完工，则工单状态为已完成)
    @staticmethod
    async def get_ticket_by_contract_id(db: AsyncSession, contract_id: int):
        result = await db.execute(select(Ticket).where(Ticket.contract_id == contract_id).options(selectinload(Ticket.sub_tasks)))
        tickets = result.scalars().all()
        ticket_list = []
        # 遍历工单，若工单对应所有子任务都已完工，则工单状态为已完成
        for ticket in tickets:
            ticket_out = {
                "id": ticket.id,
                "name": ticket.name,
                "detail_pages": ticket.detail_pages,
                "video_count": ticket.video_count,
                "image_count": ticket.image_count,
                "workflow_count": ticket.workflow_count,
                "wechat_group": ticket.wechat_group,
                "notes": ticket.notes,
                "priority": ticket.priority,
                "platform": ticket.platform,
                "created_at": ticket.created_at,
                "status": None
            }
            if ticket.sub_tasks and all(st.status == "已完成" for st in ticket.sub_tasks):
                ticket_out["status"] = "已完成"
            else:
                ticket_out["status"] = "未完成"
            ticket_list.append(ticket_out)
        return ticket_list


    # 根据工单id获取工单信息
    @staticmethod
    async def get_ticket_by_id(db: AsyncSession, ticket_id: int):
        result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
        ticket = result.scalar_one_or_none()
        return ticket

    # 根据工单id更新工单信息
    @staticmethod
    async def update_ticket_by_id(db: AsyncSession, ticket_id: int, ticket_update: TicketUpdate):
        result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
        ticket = result.scalar_one_or_none()
        if not ticket:
            # 可选：抛出异常
            return None
        # 用 ticket_update 的数据更新 ticket
        ticket.name = ticket_update.name
        ticket.detail_pages = ticket_update.detail_pages
        ticket.video_count = ticket_update.video_count
        ticket.image_count = ticket_update.image_count
        ticket.workflow_count = ticket_update.workflow_count
        ticket.wechat_group = ticket_update.wechat_group
        ticket.notes = ticket_update.notes
        ticket.priority = ticket_update.priority
        ticket.platform = ticket_update.platform
        await db.flush()
        await db.refresh(ticket)
        return ticket


