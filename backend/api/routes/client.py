from fastapi import APIRouter, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.employee import Employee
from backend.db.session import get_async_db
from backend.schemas.client import ClientFilter, ClientCreate, PaginatedClient, ClientOut
from typing import List
from fastapi import Query
from backend.api.routes.employee import get_current_employee
from backend.services.client_service import ClientService
from backend.utils.response import api_response
from backend.services.client_activity_log_service import ClientActivityLogService
from backend.schemas.client_activity_log import ClientActivityLogCreate
from datetime import datetime, timezone
from backend.services.employee_service import EmployeeService
from backend.models.client_activity_log import Status
from backend.api.deps.auth import require_departments

# 验证权限
"""
营销管理部的员工
"""
router = APIRouter(dependencies=[Depends(require_departments("营销管理部"))])

# 根据销售id查询客户列表
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
    clients, total = await ClientService.get_clients(db, filter_params, current_employee.id)

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
    new_client = await ClientService.add_client(db, client, current_employee.id)

    # 添加客户活动日志
    client_activity_log = ClientActivityLogCreate(
        client_id=new_client.id,
        log_content=f"客户添加成功",
        status="刚开始跟进",
        log_time=datetime.now(timezone.utc)
    )
    await ClientActivityLogService.add_client_activity_log(db, client_activity_log, current_employee.id)
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
    await ClientService.update_client_status(db, id, status)
    return api_response(success=True, data={"msg": f"客户状态已更新为 {status}"})
    
# 获取客户列表包括销售名称(团队记录)
@router.get("/client/get_clients_with_sales_name")
async def get_clients_with_sales_name(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee),
    name: str = Query(None),
    status: List[str] = Query(None),
    sales_name: str = Query(None),
    source: List[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
):
    """
    查询客户列表，支持名称、状态、来源筛选与分页
    """
    filter_params = ClientFilter(name=name, status=status, source=source,sales_name=sales_name, page=page, page_size=page_size)
    clients, total = await ClientService.get_clients_with_sales_name(db, filter_params)

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
            created_at=client.created_at,
            sales_name=client.sales.name
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

# 修改客户负责人(销售主管可操作)
@router.put("/client/update_sales/{id}")
async def update_client_sales(
    id: int,
    sales_id: int = Body(..., description="销售ID"),
    notes: str = Body(None, description="备注"),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    # 验证权限
    await ClientService.update_client_sales(db, id, sales_id)
    # 如果客户负责人修改成功则添加一条记录
    client_activity_log = ClientActivityLogCreate(
        client_id=id,
        log_content=notes,
        status=Status.更换负责人,
        log_time=datetime.now(timezone.utc)
    )
    await ClientActivityLogService.add_client_activity_log(db, client_activity_log, current_employee.id)
    return api_response(success=True, data={"msg": f"客户负责人已更新为 {sales_id}"})


# 获取线上客户列表包括销售名称(运营看板)
@router.get("/client/get_online_clients")
async def get_online_clients(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee),
    name: str = Query(None),
    status: List[str] = Query(None),
    sales_name: str = Query(None),
    source: List[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
):
    # 验证权限
    source = ["线上"]
    filter_params = ClientFilter(name=name, status=status, source=source,sales_name=sales_name, page=page, page_size=page_size)
    clients, total = await ClientService.get_clients_with_sales_name(db, filter_params)

    total_pages = (total + page_size - 1) // page_size  # 正确的分页计算
    #将Client对象转换为ClientOut对象
    clients_out = [
        ClientOut(
            id=client.id, 
            name=client.name, 
            status=client.status.value, 
            product_type=client.product_type, 
            scale=client.scale.value, 
            created_at=client.created_at,
            sales_name=client.sales.name,
            contact_phone=client.contact_phone,
            contact_name=client.contact_name,
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

# 新增线上客户
@router.post("/client/add_online_client")
async def add_online_client(
    sales_id: int = Body(..., description="销售ID"),
    client: ClientCreate = Body(...),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    # 验证权限

    new_client = await ClientService.add_client(db, client, sales_id)
    # 添加客户活动日志
    client_activity_log = ClientActivityLogCreate(
        client_id=new_client.id,
        log_content=f"{current_employee.name}添加线上客户成功",
        status="刚开始跟进",
        log_time=datetime.now(timezone.utc)
    )
    await ClientActivityLogService.add_client_activity_log(db, client_activity_log, current_employee.id)
    return api_response(success=True, data=new_client)


# 编辑线上客户
@router.put("/client/update_online_client/{id}")
async def update_online_client(
    id: int,
    sales_id: int = Body(..., description="销售ID"),
    client: ClientCreate = Body(...),
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    # 验证权限
    # 编辑客户信息
    client_info = await ClientService.update_client(db, id, client)
    # 更新客户负责人
    if client_info.sales_id != sales_id:
        client_info = await ClientService.update_client_sales(db, id, sales_id)
    return api_response(success=True, data=client_info)