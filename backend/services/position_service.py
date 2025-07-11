from typing import List
from fastapi import HTTPException,status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.department import Department
from backend.models.position import Position
from backend.schemas.department import DepartmentOut
from backend.schemas.position import PositionCreate, PositionInfo, PositionOut

class PositionService:

    #增加部门
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
            department_id=position.departmentId
        )
        db.add(position)
        try:
            await db.commit()
            print("注册成功", position.name)
            await db.refresh(position)
            return True
        except Exception as e:
            await db.rollback()
            print(f"数据库提交失败，原始错误: {e}")  # 打印详细错误
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="职位增加成功"
            )
    
    #删除职位
    @staticmethod
    async def delete_position(db:AsyncSession,id:int):
        # 1. 查询职位是否存在
        result = await db.execute(select(Position).where(Position.id == id))
        position = result.scalars().first()
        if not position:
            print(f"职位不存在，职位ID: {id},职位名称: {position.name}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="职位不存在"
            )
        # 2. 执行删除操作
        try:
            await db.delete(position)
            await db.commit()
            print(f"删除成功，职位ID: {position.id},职位名称: {position.name}")
            return {"message": "职位删除成功"}
            
        except Exception as e:
            await db.rollback()
            print(f"数据库删除失败，原始错误: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="职位删除失败"
            )

    #列出所有职位
    @staticmethod
    async def get_positions(db: AsyncSession) -> PositionOut:
        try:
            # 查询所有职位
            result = await db.execute(select(Position))
            positions = result.scalars().all()

            # 查询所有部门
            dept_result = await db.execute(select(Department))
            departments = dept_result.scalars().all()

            if not positions and not departments:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="没有找到任何职位或部门信息"
                )
            # 转换为 PositionInfo 列表
            position_infos = [
                PositionInfo(
                    id=pos.id,
                    name=pos.name,
                    department_id=pos.department_id
                ) for pos in positions
            ]

            # 转换为 DepartmentOut 列表
            department_infos = [
                DepartmentOut(
                    id=dept.id,
                    name=dept.name
                ) for dept in departments
            ]

            # 返回统一结构
            return PositionOut(
                positions=position_infos,
                departments=department_infos
            )

        except Exception as e:
            print(f"数据库查询失败: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="获取职位和部门信息失败"
            )
        