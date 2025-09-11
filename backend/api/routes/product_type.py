from fastapi import APIRouter, Depends, Body, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from backend.db.session import get_async_db
from backend.api.routes.employee import get_current_employee
from backend.models.employee import Employee, EmployeeRole
from backend.services.product_type_service import ProductTypeService
from backend.schemas.product_type import ProductTypeCreate, ProductTypeUpdate, ProductTypeOut
from backend.utils.response import api_response


router = APIRouter()


@router.get("/product-types", response_model=dict)
async def get_product_types(
    is_active: Optional[bool] = Query(None, description="过滤激活状态"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(100, ge=1, le=1000, description="每页数量"),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    """
    获取产品类型列表，支持激活状态过滤和分页
    """
    product_types, total = await ProductTypeService.get_product_types(
        db, is_active=is_active, page=page, page_size=page_size
    )
    
    total_pages = (total + page_size - 1) // page_size
    
    return api_response(success=True, data={
        "product_types": [ProductTypeOut.model_validate(pt) for pt in product_types],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    })


@router.get("/product-types/active", response_model=dict)
async def get_active_product_types(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    """
    获取所有激活状态的产品类型，常用于下拉选择
    """
    product_types = await ProductTypeService.get_active_product_types(db)
    
    return api_response(success=True, data=[
        ProductTypeOut.model_validate(pt) for pt in product_types
    ])


@router.get("/product-types/{product_type_id}", response_model=dict)
async def get_product_type_by_id(
    product_type_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    """
    根据ID获取产品类型详情
    """
    product_type = await ProductTypeService.get_product_type_by_id(db, product_type_id)
    
    if not product_type:
        raise HTTPException(status_code=404, detail="产品类型不存在")
    
    return api_response(success=True, data=ProductTypeOut.model_validate(product_type))


@router.post("/product-types", response_model=dict)
async def create_product_type(
    product_type_data: ProductTypeCreate = Body(...),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    """
    创建新的产品类型
    权限：仅管理员可操作
    """
    # 权限检查：仅管理员可创建产品类型  
    if current_employee.role != EmployeeRole.admin:
        raise HTTPException(status_code=403, detail="权限不足，仅管理员可操作")
    
    new_product_type = await ProductTypeService.create_product_type(db, product_type_data)
    
    return api_response(success=True, data=ProductTypeOut.model_validate(new_product_type))


@router.put("/product-types/reorder", response_model=dict)
async def reorder_product_types(
    reorder_data: List[dict] = Body(..., description="排序数据: [{'id': 1, 'sort_order': 1}, ...]"),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    """
    批量更新产品类型排序
    权限：仅管理员可操作
    """
    # 权限检查：仅管理员可重新排序
    if current_employee.role != EmployeeRole.admin:
        raise HTTPException(status_code=403, detail="权限不足，仅管理员可操作")
    
    # 验证数据格式
    if not reorder_data or not isinstance(reorder_data, list):
        raise HTTPException(status_code=400, detail="排序数据格式错误")
    
    for item in reorder_data:
        if not isinstance(item, dict) or "id" not in item or "sort_order" not in item:
            raise HTTPException(status_code=400, detail="排序数据格式错误，需要包含 id 和 sort_order 字段")
    
    success = await ProductTypeService.reorder_product_types(db, reorder_data)
    
    if success:
        return api_response(success=True, data={"message": "排序更新成功"})
    else:
        raise HTTPException(status_code=500, detail="排序更新失败")


@router.put("/product-types/{product_type_id}", response_model=dict)
async def update_product_type(
    product_type_id: int,
    product_type_data: ProductTypeUpdate = Body(...),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    """
    更新产品类型信息
    权限：仅管理员可操作
    """
    # 权限检查：仅管理员可更新产品类型
    if current_employee.role != EmployeeRole.admin:
        raise HTTPException(status_code=403, detail="权限不足，仅管理员可操作")
    
    updated_product_type = await ProductTypeService.update_product_type(
        db, product_type_id, product_type_data
    )
    
    return api_response(success=True, data=ProductTypeOut.model_validate(updated_product_type))


@router.delete("/product-types/{product_type_id}", response_model=dict)
async def delete_product_type(
    product_type_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    """
    软删除产品类型（设置 is_active=False）
    权限：仅管理员可操作
    """
    # 权限检查：仅管理员可删除产品类型
    if current_employee.role != EmployeeRole.admin:
        raise HTTPException(status_code=403, detail="权限不足，仅管理员可操作")
    
    success = await ProductTypeService.delete_product_type(db, product_type_id)
    
    if success:
        return api_response(success=True, data={"message": "产品类型已删除"})
    else:
        raise HTTPException(status_code=500, detail="删除操作失败")


@router.delete("/product-types/{product_type_id}/hard", response_model=dict)
async def hard_delete_product_type(
    product_type_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    """
    硬删除产品类型（直接从数据库删除）
    权限：仅管理员可操作
    警告：此操作不可恢复
    """
    # 权限检查：仅管理员可硬删除产品类型
    if current_employee.role != EmployeeRole.admin:
        raise HTTPException(status_code=403, detail="权限不足，仅管理员可操作")
    
    success = await ProductTypeService.hard_delete_product_type(db, product_type_id)
    
    if success:
        return api_response(success=True, data={"message": "产品类型已永久删除"})
    else:
        raise HTTPException(status_code=500, detail="硬删除操作失败")


@router.put("/product-types/{product_type_id}/toggle", response_model=dict)
async def toggle_product_type_status(
    product_type_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    """
    切换产品类型的激活状态
    权限：仅管理员可操作
    """
    # 权限检查：仅管理员可切换状态
    if current_employee.role != EmployeeRole.admin:
        raise HTTPException(status_code=403, detail="权限不足，仅管理员可操作")
    
    updated_product_type = await ProductTypeService.toggle_product_type_status(db, product_type_id)
    
    return api_response(success=True, data=ProductTypeOut.model_validate(updated_product_type))


@router.post("/product-types/batch", response_model=dict)
async def get_product_types_by_ids(
    product_type_ids: List[int] = Body(..., description="产品类型ID列表"),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    """
    根据ID列表批量获取产品类型
    """
    if not product_type_ids:
        return api_response(success=True, data=[])
    
    product_types = await ProductTypeService.get_product_types_by_ids(db, product_type_ids)
    
    return api_response(success=True, data=[
        ProductTypeOut.model_validate(pt) for pt in product_types
    ])