from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.employee import Employee
from backend.db.session import get_async_db
from backend.api.routes.employee import get_current_employee
from backend.services.statistics_service import StatisticsService
from backend.utils.response import api_response
from typing import Dict, Any

router = APIRouter()

# 获取客户跟踪统计数据
@router.get("/statistics/client-activity-log-statistics")
async def get_client_activity_log_statistics(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
) -> Dict[str, Any]:
    # 获取统计数据
    monthly_client_count, monthly_client_count_change = await StatisticsService.get_monthly_client_count(db)
    monthly_transaction_volume, monthly_transaction_volume_change = await StatisticsService.get_monthly_transaction_volume(db)
    monthly_conversion_rate, monthly_conversion_rate_change = await StatisticsService.get_monthly_client_conversion_rate(db)
    average_cycle, average_cycle_change = await StatisticsService.get_average_transaction_cycle(db)

    # 构造 JSON 数据结构
    data = {
        "monthlyClientCount": monthly_client_count,
        "monthlyClientCountChange": monthly_client_count_change,
        "monthlyTransactionVolume": monthly_transaction_volume,
        "monthlyTransactionVolumeChange": monthly_transaction_volume_change,
        "monthlyTransactionConversionRate": monthly_conversion_rate,
        "monthlyTransactionConversionRateChange": monthly_conversion_rate_change,
        "averageTransactionCycle": average_cycle,
        "averageTransactionCycleChange": average_cycle_change
    }
    

    return api_response(success=True, data=data)

# 获取员工本月销售统计数据
@router.get("/statistics/monthly-sales")
async def get_monthly_sales(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
) -> Dict[str, Any]:
    # 获取统计数据
    monthly_sales, monthly_sales_change = await StatisticsService.get_monthly_sales(db, current_employee.id)
    monthly_commission, monthly_commission_change = await StatisticsService.get_monthly_commission(db, current_employee.id)
    monthly_order_count, monthly_order_count_change = await StatisticsService.get_monthly_order_count(db, current_employee.id)
    monthly_pending_order_count, monthly_pending_order_count_change = await StatisticsService.get_monthly_pending_order_count(db, current_employee.id)

    data = {
        "monthlySales": monthly_sales,
        "monthlySalesChange": monthly_sales_change,
        "monthlyCommission": monthly_commission,
        "monthlyCommissionChange": monthly_commission_change,
        "monthlyOrderCount": monthly_order_count,
        "monthlyOrderCountChange": monthly_order_count_change,
        "monthlyPendingOrderCount": monthly_pending_order_count,
        "monthlyPendingOrderCountChange": monthly_pending_order_count_change
    }
    print(data)
    return api_response(success=True, data=data)


# 获取月度销售统计数据
@router.get("/statistics/monthly-sales-statistics")
async def get_monthly_sales_statistics(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
) -> Dict[str, Any]:
    # 获取统计数据
    monthly_sales_statistics = await StatisticsService.get_monthly_sales_statistics(db, current_employee.id)
    return api_response(success=True, data=monthly_sales_statistics)


# 根据销售id获取客户跟踪统计数据
@router.get("/statistics/client-activity-log-statistics-by-sales-id")
async def get_client_activity_log_statistics_by_sales_id(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
) -> Dict[str, Any]:
    # 获取统计数据
    monthly_client_count, monthly_client_count_change = await StatisticsService.get_monthly_client_count(db, current_employee.id)
    monthly_transaction_volume, monthly_transaction_volume_change = await StatisticsService.get_monthly_transaction_volume(db, current_employee.id)
    monthly_conversion_rate, monthly_conversion_rate_change = await StatisticsService.get_monthly_client_conversion_rate(db, current_employee.id)
    average_cycle, average_cycle_change = await StatisticsService.get_average_transaction_cycle(db, current_employee.id)

    # 构造 JSON 数据结构
    data = {
        "monthlyClientCount": monthly_client_count,
        "monthlyClientCountChange": monthly_client_count_change,
        "monthlyTransactionVolume": monthly_transaction_volume,
        "monthlyTransactionVolumeChange": monthly_transaction_volume_change,
        "monthlyTransactionConversionRate": monthly_conversion_rate,
        "monthlyTransactionConversionRateChange": monthly_conversion_rate_change,
        "averageTransactionCycle": average_cycle,
        "averageTransactionCycleChange": average_cycle_change
    }
    

    return api_response(success=True, data=data)
