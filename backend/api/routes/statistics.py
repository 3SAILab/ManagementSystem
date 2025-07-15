from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.employee import Employee
from backend.db.session import get_async_db
from backend.api.routes.employee import get_current_employee

router = APIRouter()


# 获取每月客户数量
@router.get("/statistics/monthly-client-count")
async def get_monthly_client_count(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    pass

# 获取每月客户转化率
@router.get("/statistics/monthly-client-conversion-rate")
async def get_monthly_client_conversion_rate(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    pass

# 获取每月成交量
@router.get("/statistics/monthly-transaction-volume")
async def get_monthly_transaction_volume(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    pass

# 获取平均成交周期
@router.get("/statistics/average-transaction-cycle")
async def get_average_transaction_cycle(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    pass
