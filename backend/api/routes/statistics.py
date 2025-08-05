from fastapi import APIRouter, Depends, HTTPException
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

    # 构造 JSON 数据结构,只保留小数点后两位
    data = {
        "monthlyClientCount": round(monthly_client_count, 2),
        "monthlyClientCountChange": round(monthly_client_count_change, 2),
        "monthlyTransactionVolume": round(monthly_transaction_volume, 2),
        "monthlyTransactionVolumeChange": round(monthly_transaction_volume_change, 2),
        "monthlyTransactionConversionRate": round(monthly_conversion_rate, 2),
        "monthlyTransactionConversionRateChange": round(monthly_conversion_rate_change, 2),
        "averageTransactionCycle": round(average_cycle, 2),
        "averageTransactionCycleChange": round(average_cycle_change, 2)
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
        "monthlySales": round(monthly_sales, 2),
        "monthlySalesChange": round(monthly_sales_change, 2),
        "monthlyCommission": round(monthly_commission, 2),
        "monthlyCommissionChange": round(monthly_commission_change, 2),
        "monthlyOrderCount": round(monthly_order_count, 2),
        "monthlyOrderCountChange": round(monthly_order_count_change, 2),
        "monthlyPendingOrderCount": round(monthly_pending_order_count, 2),
        "monthlyPendingOrderCountChange": round(monthly_pending_order_count_change, 2)
    }
    return api_response(success=True, data=data)

# 获取员工本月各周期销售统计数据
@router.get("/statistics/monthly-sales-by-cycle")
async def get_monthly_sales_by_cycle(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
) -> Dict[str, Any]:
    # 获取统计数据
    monthly_sales_by_cycle = await StatisticsService.get_monthly_sales_by_cycle(db, current_employee.id)
    return api_response(success=True, data=monthly_sales_by_cycle)

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
        "monthlyClientCount": round(monthly_client_count, 2),
        "monthlyClientCountChange": round(monthly_client_count_change, 2),
        "monthlyTransactionVolume": round(monthly_transaction_volume, 2),
        "monthlyTransactionVolumeChange": round(monthly_transaction_volume_change, 2),
        "monthlyTransactionConversionRate": round(monthly_conversion_rate, 2),
        "monthlyTransactionConversionRateChange": round(monthly_conversion_rate_change, 2),
        "averageTransactionCycle": round(average_cycle, 2),
        "averageTransactionCycleChange": round(average_cycle_change, 2)
    }
    
    return api_response(success=True, data=data)


# 销售主管查看本月销售数据
@router.get("/statistics/sales-data-statistics")
async def get_sales_data_statistics(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
) -> Dict[str, Any]:
    """销售主管查看本月销售数据统计
    
    返回数据包括：
    - 销售额、定金额、尾款已支付金额、尾款未支付金额、总到款金额
    - 线上订单数量、线下订单数量、线上销售额、线下销售额
    - 销售个人业绩、产品类目分布
    """
    # 获取销售数据统计
    statistics = await StatisticsService.get_sales_data_statistics(db)
        
    return {
        "success": True,
        "data": statistics,
        "message": "获取销售数据统计成功"
    }

# 只读销售看板 - 获取指定销售人员的本月销售统计数据
@router.get("/statistics/readonly-monthly-sales/{employee_id}")
async def get_readonly_monthly_sales(
    employee_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
) -> Dict[str, Any]:
    """只读模式获取指定销售人员的本月销售统计数据"""
    # 获取统计数据
    monthly_sales, monthly_sales_change = await StatisticsService.get_monthly_sales(db, employee_id)
    monthly_commission, monthly_commission_change = await StatisticsService.get_monthly_commission(db, employee_id)
    monthly_order_count, monthly_order_count_change = await StatisticsService.get_monthly_order_count(db, employee_id)
    monthly_pending_order_count, monthly_pending_order_count_change = await StatisticsService.get_monthly_pending_order_count(db, employee_id)

    data = {
        "monthlySales": round(monthly_sales, 2),
        "monthlySalesChange": round(monthly_sales_change, 2),
        "monthlyCommission": round(monthly_commission, 2),
        "monthlyCommissionChange": round(monthly_commission_change, 2),
        "monthlyOrderCount": round(monthly_order_count, 2),
        "monthlyOrderCountChange": round(monthly_order_count_change, 2),
        "monthlyPendingOrderCount": round(monthly_pending_order_count, 2),
        "monthlyPendingOrderCountChange": round(monthly_pending_order_count_change, 2)
    }
    return api_response(success=True, data=data)

# 只读销售看板 - 获取指定销售人员的本月各周期销售统计数据
@router.get("/statistics/readonly-monthly-sales-by-cycle/{employee_id}")
async def get_readonly_monthly_sales_by_cycle(
    employee_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
) -> Dict[str, Any]:
    """只读模式获取指定销售人员的本月各周期销售统计数据"""
    # 获取统计数据
    monthly_sales_by_cycle = await StatisticsService.get_monthly_sales_by_cycle(db, employee_id)
    return api_response(success=True, data=monthly_sales_by_cycle)

# 只读销售看板 - 获取指定销售人员的月度销售统计数据
@router.get("/statistics/readonly-monthly-sales-statistics/{employee_id}")
async def get_readonly_monthly_sales_statistics(
    employee_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
) -> Dict[str, Any]:
    """只读模式获取指定销售人员的月度销售统计数据"""
    # 获取统计数据
    monthly_sales_statistics = await StatisticsService.get_monthly_sales_statistics(db, employee_id)
    return api_response(success=True, data=monthly_sales_statistics)

# 美工本月系数统计
@router.get("/statistics/monthly-coefficient-statistics")
async def get_monthly_coefficient_statistics(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
) -> Dict[str, Any]:
    # 获取统计数据
    monthly_coefficient_statistics = await StatisticsService.get_monthly_coefficient_statistics(db)
    return api_response(success=True, data=monthly_coefficient_statistics)

# 美工本月平均每单完成时间
@router.get("/statistics/monthly-average-completion-time-statistics")
async def get_monthly_average_completion_time_statistics(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
) -> Dict[str, Any]:
    # 获取统计数据
    monthly_average_completion_time = await StatisticsService.get_monthly_average_completion_time_statistics(db)
    return api_response(success=True, data=monthly_average_completion_time)

