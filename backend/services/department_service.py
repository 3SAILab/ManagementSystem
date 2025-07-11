from typing import List
from fastapi import HTTPException,status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.department import Department
from backend.schemas.department import DepartmentOut


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
        try:
            await db.commit()
            print("注册成功", department.name)
            await db.refresh(department)
            return True
        except Exception as e:
            await db.rollback()
            print(f"数据库提交失败，原始错误: {e}")  # 打印详细错误
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="部门增加成功"
            )
    
    #删除部门
    @staticmethod
    async def delete_department(db:AsyncSession,id:int):
        # 1. 查询部门是否存在
        result = await db.execute(select(Department).where(Department.id == id))
        department = result.scalars().first()
        if not department:
            print(f"部门不存在，部门ID: {id},部门名称: {department.name}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="部门不存在"
            )
        # 2. 执行删除操作
        try:
            await db.delete(department)
            await db.commit()
            print(f"删除成功，部门ID: {department.id},部门名称: {department.name}")
            return {"message": "部门删除成功"}
            
        except Exception as e:
            await db.rollback()
            print(f"数据库删除失败，原始错误: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="部门删除失败"
            )

    #列出所有部门
    @staticmethod
    async def search_all_departments(db: AsyncSession) -> List[DepartmentOut]:
        try:
            # 查询所有部门（无过滤条件）
            result = await db.execute(select(Department))
            departments = result.scalars().all()  # 获取所有记录对象
            #将Department对象转换为DepartmentOut对象
            departments = [DepartmentOut(id=dept.id, name=dept.name) for dept in departments]
            if not departments:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="没有找到任何部门"
                )
                
            return departments
            
        except Exception as e:
            print(f"数据库查询失败: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="获取部门列表失败"
            )
        

    #获取部门名称
    @staticmethod
    async def get_department_name(db: AsyncSession, id: int) -> str:
        result = await db.execute(select(Department).where(Department.id == id))
        department = result.scalars().first()
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="部门不存在"
            )
        return department.name