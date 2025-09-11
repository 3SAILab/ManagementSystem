from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, func, select, update, delete
from sqlalchemy.future import select
from typing import List, Optional, Tuple
from fastapi import HTTPException
from backend.models.product_type import ProductType
from backend.schemas.product_type import ProductTypeCreate, ProductTypeUpdate


class ProductTypeService:
    
    @staticmethod
    async def get_product_types(
        db: AsyncSession, 
        is_active: Optional[bool] = None,
        page: int = 1,
        page_size: int = 100
    ) -> Tuple[List[ProductType], int]:
        """
        获取产品类型列表，支持激活状态过滤和分页
        """
        stmt = select(ProductType)
        
        filters = []
        if is_active is not None:
            filters.append(ProductType.is_active == is_active)
        
        if filters:
            stmt = stmt.where(and_(*filters))
        
        # 按排序字段和创建时间排序
        stmt = stmt.order_by(ProductType.sort_order.asc(), ProductType.created_at.asc())
        
        # 获取总数
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_result = await db.execute(count_stmt)
        total = total_result.scalar_one()
        
        # 添加分页
        stmt = stmt.offset((page - 1) * page_size).limit(page_size)
        
        # 执行查询
        result = await db.execute(stmt)
        product_types = list(result.scalars().all())
        
        return product_types, total
    
    @staticmethod
    async def get_active_product_types(db: AsyncSession) -> List[ProductType]:
        """
        获取所有激活状态的产品类型，按排序字段排序
        """
        stmt = select(ProductType).where(
            ProductType.is_active == True
        ).order_by(ProductType.sort_order.asc(), ProductType.created_at.asc())
        
        result = await db.execute(stmt)
        return list(result.scalars().all())
    
    @staticmethod
    async def get_product_type_by_id(db: AsyncSession, product_type_id: int) -> Optional[ProductType]:
        """
        根据ID获取产品类型详情
        """
        stmt = select(ProductType).where(ProductType.id == product_type_id)
        result = await db.execute(stmt)
        return result.scalars().first()
    
    @staticmethod
    async def create_product_type(db: AsyncSession, product_type_data: ProductTypeCreate) -> ProductType:
        """
        创建新的产品类型
        """
        # 检查名称是否已存在
        existing = await db.execute(
            select(ProductType).where(ProductType.name == product_type_data.name)
        )
        if existing.scalars().first():
            raise HTTPException(status_code=400, detail="产品类型名称已存在")
        
        # 如果没有指定排序值，设置为最大值+1
        if product_type_data.sort_order == 0:
            max_sort_result = await db.execute(
                select(func.max(ProductType.sort_order))
            )
            max_sort = max_sort_result.scalar() or 0
            product_type_data.sort_order = max_sort + 1
        
        # 创建产品类型
        new_product_type = ProductType(**product_type_data.model_dump())
        
        db.add(new_product_type)
        await db.commit()
        await db.refresh(new_product_type)
        
        return new_product_type
    
    @staticmethod
    async def update_product_type(
        db: AsyncSession, 
        product_type_id: int, 
        product_type_data: ProductTypeUpdate
    ) -> Optional[ProductType]:
        """
        更新产品类型信息
        """
        # 检查产品类型是否存在
        product_type = await ProductTypeService.get_product_type_by_id(db, product_type_id)
        if not product_type:
            raise HTTPException(status_code=404, detail="产品类型不存在")
        
        # 如果更新名称，检查是否与其他产品类型重名
        if product_type_data.name and product_type_data.name != product_type.name:
            existing = await db.execute(
                select(ProductType).where(
                    and_(
                        ProductType.name == product_type_data.name,
                        ProductType.id != product_type_id
                    )
                )
            )
            if existing.scalars().first():
                raise HTTPException(status_code=400, detail="产品类型名称已存在")
        
        # 更新字段
        update_data = product_type_data.model_dump(exclude_unset=True)
        if update_data:
            stmt = update(ProductType).where(
                ProductType.id == product_type_id
            ).values(**update_data)
            
            await db.execute(stmt)
            await db.commit()
            
            # 重新获取更新后的数据
            product_type = await ProductTypeService.get_product_type_by_id(db, product_type_id)
        
        return product_type
    
    @staticmethod
    async def delete_product_type(db: AsyncSession, product_type_id: int) -> bool:
        """
        软删除产品类型（设置 is_active=False）
        """
        product_type = await ProductTypeService.get_product_type_by_id(db, product_type_id)
        if not product_type:
            raise HTTPException(status_code=404, detail="产品类型不存在")
        
        # 软删除
        stmt = update(ProductType).where(
            ProductType.id == product_type_id
        ).values(is_active=False)
        
        await db.execute(stmt)
        await db.commit()
        
        return True
    
    @staticmethod
    async def hard_delete_product_type(db: AsyncSession, product_type_id: int) -> bool:
        """
        硬删除产品类型（直接从数据库删除）
        警告：此操作不可恢复，请确保没有其他表引用此记录
        """
        product_type = await ProductTypeService.get_product_type_by_id(db, product_type_id)
        if not product_type:
            raise HTTPException(status_code=404, detail="产品类型不存在")
        
        # 硬删除
        stmt = delete(ProductType).where(ProductType.id == product_type_id)
        result = await db.execute(stmt)
        await db.commit()
        
        return result.rowcount > 0
    
    @staticmethod
    async def toggle_product_type_status(db: AsyncSession, product_type_id: int) -> ProductType:
        """
        切换产品类型的激活状态
        """
        product_type = await ProductTypeService.get_product_type_by_id(db, product_type_id)
        if not product_type:
            raise HTTPException(status_code=404, detail="产品类型不存在")
        
        # 切换状态
        new_status = not product_type.is_active
        stmt = update(ProductType).where(
            ProductType.id == product_type_id
        ).values(is_active=new_status)
        
        await db.execute(stmt)
        await db.commit()
        
        # 返回更新后的数据
        return await ProductTypeService.get_product_type_by_id(db, product_type_id)
    
    @staticmethod
    async def reorder_product_types(db: AsyncSession, reorder_data: List[dict]) -> bool:
        """
        批量更新产品类型排序
        reorder_data: [{"id": 1, "sort_order": 1}, {"id": 2, "sort_order": 2}, ...]
        """
        try:
            for item in reorder_data:
                product_type_id = item.get("id")
                sort_order = item.get("sort_order")
                
                if product_type_id and sort_order is not None:
                    stmt = update(ProductType).where(
                        ProductType.id == product_type_id
                    ).values(sort_order=sort_order)
                    
                    await db.execute(stmt)
            
            await db.commit()
            return True
            
        except Exception as e:
            await db.rollback()
            raise HTTPException(status_code=500, detail=f"更新排序失败: {str(e)}")
    
    @staticmethod
    async def get_product_types_by_ids(db: AsyncSession, product_type_ids: List[int]) -> List[ProductType]:
        """
        根据ID列表批量获取产品类型
        """
        if not product_type_ids:
            return []
        
        stmt = select(ProductType).where(
            and_(
                ProductType.id.in_(product_type_ids),
                ProductType.is_active == True
            )
        ).order_by(ProductType.sort_order.asc())
        
        result = await db.execute(stmt)
        return list(result.scalars().all())