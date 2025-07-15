from fastapi import APIRouter, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.employee import Employee
from backend.db.session import get_async_db
from backend.schemas.client import ClientFilter, ClientCreate, PaginatedClient
from backend.services.client_service import ClientService
from typing import List
from fastapi import Query
from backend.api.routes.employee import get_current_employee

router = APIRouter()

# 查询客户列表
@router.get("/clients", response_model=PaginatedClient)
async def read_clients(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee),
    name: str = Query(None),
    status: List[str] = Query(None),
    source: List[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
):
    """
    查询客户列表，支持名称、状态、来源筛选与分页
    """

    filter_params = ClientFilter(name=name, status=status, source=source, page=page, page_size=page_size)
    clients, total = await ClientService.get_clients(db, filter_params)

    total_pages = (total + page_size - 1) // page_size  # 正确的分页计算

    return {
        "clients": clients,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }


#添加客户
@router.post("/client/add")
async def add_client(
    db: AsyncSession = Depends(get_async_db),
    client: ClientCreate = Body(...),
    current_employee: Employee = Depends(get_current_employee)
):
    # 验证权限

    # 添加客户
    pass

#编辑客户信息
@router.put("/client/update/{id}")
async def update_client(
    id: int,
    client: ClientCreate = Body(...),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    # 验证权限

    # 编辑客户信息
    pass

#根据客户ID获取客户信息
@router.get("/client/get/{id}")
async def get_client_info(
    id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    # 验证权限
    pass