from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload
from backend.api.routes.employee import get_current_employee
from backend.db.session import get_async_db
from backend.schemas.client import ClientFilter
from backend.models.client import Client
from backend.models.employee import Employee
from backend.utils.data_utils import to_datetime
from openpyxl import Workbook
from io import BytesIO
from backend.api.deps.auth import require_departments

router = APIRouter(prefix="/export", tags=["export"])
# 运营导出客户数据(线上客户)
@router.get("/client")
async def export_online_clients(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(require_departments("营销管理部")),
    name: str = Query(None),
    status: List[str] = Query(None),
    sales_name: str = Query(None),
    source: List[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    startTime: str = Query(None),
    endTime: str = Query(None)
):
    """
    流式导出客户数据，避免内存溢出
    """
    filter_params = ClientFilter(name=name, status=status, source=source,sales_name=sales_name, page=page, page_size=page_size, startTime=startTime, endTime=endTime)

    # 构建查询语句
    stmt = select(Client)
    filters = []

    if filter_params.name:
        filters.append(or_(
            Client.name.ilike(f"%{filter_params.name}%"),
            Client.contact_name.ilike(f"%{filter_params.name}%"),
            Client.contact_phone.ilike(f"%{filter_params.name}%")
        ))
    
    if filter_params.sales_name:
        filters.append(Client.sales.has(Employee.name.ilike(f"%{filter_params.sales_name}%")))

    if filter_params.status:
        status_values = [s.value if hasattr(s, 'value') else s for s in filter_params.status]
        filters.append(Client.status.in_(status_values))

    if filter_params.source:
        source_values = [s.value if hasattr(s, 'value') else s for s in filter_params.source]
        filters.append(Client.source.in_(source_values))

    if filter_params.startTime:
        filters.append(Client.access_time >= to_datetime(filter_params.startTime))

    if filter_params.endTime:
        filters.append(Client.access_time <= to_datetime(filter_params.endTime))

    if filters:
        stmt = stmt.where(and_(*filters))
    
    stmt = stmt.options(selectinload(Client.sales))
    stmt = stmt.order_by(Client.created_at.desc())

    # 创建Excel工作簿
    wb = Workbook(write_only=True)
    # 在write_only模式下，直接创建新工作表，不需要删除默认工作表
    ws = wb.create_sheet(title="客户列表")
    
    # 写入表头
    headers = ["客户名称", "创建时间", "联系人", "联系方式", "状态", "销售"]
    ws.append(headers)
    
    # 流式处理数据
    offset = 0
    total_processed = 0
    batch_size = 1000
    while True:
        # 分页查询
        batch_stmt = stmt.offset(offset).limit(batch_size)
        result = await db.execute(batch_stmt)
        clients = list(result.scalars().all())
        
        if not clients:
            break
        
        # 处理当前批次数据
        for client in clients:
            row_data = [
                client.name,
                client.created_at.isoformat(),
                client.contact_name,
                client.contact_phone,
                client.status.value if client.status else "无",
                client.sales.name if client.sales else "无",
            ]
            ws.append(row_data)
        
        total_processed += len(clients)
        offset += batch_size
        
        # 如果返回的数据少于批次大小，说明已经处理完所有数据
        if len(clients) < batch_size:
            break
    
    # 生成Excel文件
    output = BytesIO()
    wb.save(output)
    excel_data = output.getvalue()
    output.close()
    
    return StreamingResponse(
        iter([excel_data]),
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers={'Content-Disposition': 'attachment'}
    )

