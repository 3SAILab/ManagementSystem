from typing import List
from fastapi import HTTPException,status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from backend.models.department import Department
from backend.models.position import Position
from backend.schemas.position import PositionCreate, PositionInfo

class PositionService:

    #增加职位
    @staticmethod
    async def add_position(db: AsyncSession, position: PositionCreate) -> bool:
        result = await db.execute(select(Position).where(Position.name == position.name))
        if result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="该职位已存在"   
            )
        position = Position(
            name=position.name,
            department_id=position.department_id
        )
        db.add(position)
        await db.flush()
        return True
    
    #删除职位
    @staticmethod
    async def delete_position(db:AsyncSession,id:int):
        # 1. 查询职位是否存在
        result = await db.execute(select(Position).where(Position.id == id))
        position = result.scalars().first()
        if not position:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="职位不存在"
            )
        # 2. 执行删除操作
        await db.delete(position)
        await db.flush()
        return True

    #列出所有职位
    @staticmethod
    async def get_positions(db: AsyncSession) -> List[PositionInfo]:
        result = await db.execute(select(Position).options(selectinload(Position.department)))
        positions = result.scalars().all()
        if not positions:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="没有找到任何职位"
            )
        return [
            PositionInfo(
                id=pos.id,
                name=pos.name,
                department_id=pos.department_id,
                department_name=pos.department.name
            )
            for pos in positions
        ]

    #根据部门id获取职位信息
    @staticmethod
    async def get_positions_by_department_id(db: AsyncSession, department_id: int) -> List[PositionInfo]:
        result = await db.execute(select(Position).where(Position.department_id == department_id))
        positions = result.scalars().all()
        if not positions:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="没有找到任何职位"
            )
        return [
                PositionInfo(
                    id=pos.id,
                    name=pos.name,
                    department_id=pos.department_id,
                )
            for pos in positions
        ]