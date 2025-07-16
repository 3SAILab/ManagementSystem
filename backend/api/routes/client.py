from fastapi import APIRouter, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.employee import Employee
from backend.db.session import get_async_db
from backend.schemas.client import ClientFilter, ClientCreate, PaginatedClient, ClientOut, ClientStatus
from typing import List
from fastapi import Query
from backend.api.routes.employee import get_current_employee
from backend.services.client_service import ClientService
from backend.utils.response import api_response

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

    #将Client对象转换为ClientOut对象
    clients_out = [
        ClientOut(
            id=client.id, 
            name=client.name, 
            status=client.status.value, 
            source=client.source.value, 
            product_type=client.product_type, 
            scale=client.scale.value, 
            created_at=client.created_at
        ) 
        for client in clients
    ]
    # 构造分页响应并导出为 dict
    paginated = PaginatedClient(
        clients=clients_out, 
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )
    return paginated.model_dump()


#添加客户
@router.post("/client/add", response_model=api_response)
async def add_client(
    client: ClientCreate,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    # 验证权限

    # 添加客户
    await ClientService.add_client(db, client)

    return api_response(success=True, data=client)

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
    await ClientService.update_client(db, id, client)
    return api_response(success=True, data=client)

#根据客户ID获取客户信息
@router.get("/client/get/{id}")
async def get_client_info(
    id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    # 验证权限

    client = await ClientService.get_client_info(db, id)
    return api_response(success=True, data=client)


# 更改客户状态
@router.put("/client/update_status/{id}")
async def update_client_status(
    id: int,
    status_data: dict = Body(...),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    # 验证权限
    status = status_data.get("status")
    # 直接使用字符串状态
    try:
        await ClientService.update_client_status(db, id, status)
        return api_response(success=True, data={"msg": f"客户状态已更新为 {status}"})
    except Exception as e:
        return api_response(success=False, data={"msg": f"更新客户状态失败: {str(e)}"})