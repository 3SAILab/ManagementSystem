from typing import List
from fastapi import HTTPException,status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.department import Department
from backend.schemas.department import DepartmentOut
from backend.models.position import Position


class DepartmentService:

    #增加部门
    @staticmethod
    async def create_department(db: AsyncSession, name: str) -> bool:
        result = await db.execute(select(Department).where(Department.name == name))
        if result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="该部门已存在"
            )
        department = Department(
            name=name
        )
        db.add(department)
        await db.flush()
        await db.refresh(department)
        return True

    #删除部门
    @staticmethod
    async def delete_department(db:AsyncSession,id:int):
        # 1. 查询部门是否存在
        result = await db.execute(select(Department).where(Department.id == id))
        department = result.scalars().first()
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="部门不存在"
            )
        # 2. 查询部门是否有对应的职位
        result = await db.execute(select(Position).where(Position.department_id == id))
        position = result.scalars().first()
        if position:
            return {"success": False, "message": "该部门有对应的职位，不能删除"}
        await db.delete(department)
        await db.flush()
        return {"success": True, "message": "删除成功"}

    #列出所有部门
    @staticmethod
    async def search_all_departments(db:AsyncSession):
        result = await db.execute(select(Department))
        departments = result.scalars().all()
        if not departments:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="没有找到任何部门"
            )
        return [DepartmentOut(id=dept.id, name=dept.name) for dept in departments]

    #获取部门名称
    @staticmethod
    async def get_department_name(db:AsyncSession,id:int):
        result = await db.execute(select(Department).where(Department.id == id))
        department = result.scalars().first()
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="部门不存在"
            )
        return department.name

        result = await db.execute(select(Department).where(Department.id == id))
        department = result.scalars().first()
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="部门不存在"
            )
        return department.name