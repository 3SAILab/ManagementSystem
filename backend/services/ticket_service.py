from backend.schemas.ticket import TicketCreate
from backend.models.employee import Employee
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.models.ticket import Ticket
from backend.models.sub_task import SubTask
from datetime import datetime
from fastapi import HTTPException

class TicketService:

    # 创建工单
    @staticmethod
    async def create_ticket(db: AsyncSession, ticket: TicketCreate, current_employee: Employee):
        try:
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
            await db.commit()
            await db.refresh(new_ticket)
            return new_ticket
        except Exception as e:
            await db.rollback()
            raise HTTPException(status_code=500, detail=str(e))

    # 获取所有工单
    @staticmethod
    async def get_tickets(db: AsyncSession):
        try:
            result = await db.execute(select(Ticket))
            tickets = result.scalars().all()
            return tickets
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    # 根据合同ID获取已完成的工单，并返回已完成的需求数量
    @staticmethod
    async def get_completed_ticket_counts_by_contract(db: AsyncSession, contract_id: int):
        try:
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
            # 打印任务完成情况，用于调试
            print("任务完成情况", total_detail_pages, total_video_count, total_image_count, total_workflow_count)
            return {
                "detail_pages": total_detail_pages,
                "video_count": total_video_count,
                "image_count": total_image_count,
                "workflow_count": total_workflow_count,
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


    # 根据工单id获取美工和渲染
    @staticmethod
    async def get_charge_ticket_by_id(db: AsyncSession, ticket_id: int):
        try:
            result = await db.execute(select(SubTask).where(SubTask.ticket_id == ticket_id).options(selectinload(SubTask.charge)))
            charges = result.scalars().all()
            return charges
        except Exception as e:
            print("get_charge_ticket_by_id error",e)
            raise HTTPException(status_code=500, detail=str(e))
    