import asyncio
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.employee import Employee
from backend.db.session import get_async_db
from backend.api.routes.employee import get_current_employee
from backend.services.statistics_service import StatisticsService
from backend.services.sales_service import SalesService
from backend.utils.response import api_response
from typing import Dict, Any
import asyncio
from backend.utils.date_utils import get_month_range, get_now, get_current_month_range, get_last_month_range
from dateutil.relativedelta import relativedelta

router = APIRouter()

# 获取客户跟踪统计数据
@router.get("/statistics/client-activity-log-statistics")
async def get_client_activity_log_statistics(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
) -> Dict[str, Any]:
    # 获取统计数据
    result = await asyncio.gather(
        StatisticsService.get_monthly_client_count(db),
        StatisticsService.get_monthly_transaction_volume(db),
        StatisticsService.get_monthly_client_conversion_rate(db),
        StatisticsService.get_average_transaction_cycle(db)
    )
    monthly_client_count, monthly_client_count_change = result[0]
    monthly_transaction_volume, monthly_transaction_volume_change = result[1]
    monthly_conversion_rate, monthly_conversion_rate_change = result[2]
    average_cycle, average_cycle_change = result[3]

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
    pending_order_count = await StatisticsService.get_pending_order_count(db, current_employee.id)

    data = {
        "monthlySales": round(monthly_sales, 2),
        "monthlySalesChange": round(monthly_sales_change, 2),
        "monthlyCommission": round(monthly_commission, 2),
        "monthlyCommissionChange": round(monthly_commission_change, 2),
        "monthlyOrderCount": round(monthly_order_count, 2),
        "monthlyOrderCountChange": round(monthly_order_count_change, 2),
        "pendingOrderCount": round(pending_order_count, 2),
    }
    return api_response(success=True, data=data)

# 获取员工本月各周期提点统计数据
@router.get("/statistics/monthly-sales-by-cycle")
async def get_monthly_sales_by_cycle(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
) -> Dict[str, Any]:
    # 获取统计数据
    monthly_sales_by_cycle = await StatisticsService.get_monthly_sales_by_cycle(db, current_employee.id)
    return api_response(success=True, data=monthly_sales_by_cycle)

# 获取员工月度提点统计数据
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


# 销售数据看板 - 获取本月销售数据统计
@router.get("/statistics/sales-data-statistics")
async def get_sales_data_statistics(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee),
    month: str = Query(None)
) -> Dict[str, Any]:
    """销售数据看板 - 获取本月销售数据统计
    
    返回数据包括：
    - 销售额、往月到账金额、尾款已支付金额、尾款未支付金额、总到款金额
    - 线上订单数量、线下订单数量、线上销售额、线下销售额、总销售额环比、线上销售额环比、总到账环比
    - 销售个人业绩(按照销售额统计)、销售个人业绩(按照实际到账金额统计)、产品类目分布
    """
    # 当前时间
    now = get_now()
    current_date = now.date()
    current_year = current_date.year
    current_month = current_date.month
    # 解析入参
    try:
        target_year_str, target_month_str = month.split('-')
        target_year = int(target_year_str)
        target_month = int(target_month_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="month 格式应为 YYYY-MM")

    # 判断是否为当前月
    is_current_month = (target_year == current_year and target_month == current_month)
    if is_current_month:
        start_date, end_date = get_current_month_range()
        last_month_start_date, last_month_end_date = get_last_month_range()
        # 获取上月同期时间
        last_now = now - relativedelta(months=1)

        # 转为当天的开始时间（00:00:00），然后加一天 → 就是“下一天 00:00:00”
        last_now_date = last_now.replace(hour=0, minute=0, second=0, microsecond=0)
        last_now_end = last_now_date + relativedelta(days=1)
        
    else:
        start_date, end_date = get_month_range(int(target_year), int(target_month))
        if int(target_month) == 1:
            last_month_start_date, last_month_end_date = get_month_range(int(target_year) - 1, 12)
        else:
            last_month_start_date, last_month_end_date = get_month_range(int(target_year), int(target_month) - 1)
        last_now_end = last_month_end_date
    
    # 获取销售数据统计
    result = await asyncio.gather(
        SalesService.get_sales_amount(db, start_date=start_date, end_date=end_date), # 本月销售额
        SalesService.get_sales_amount(db, start_date=last_month_start_date, end_date=last_now_end), # 上个月同期销售额
        SalesService.get_total_received_by_last(db, last_end=start_date, start_date=start_date, end_date=end_date), # 合同成交时间不在本月，但是尾款结算时间在本月的总到账金额
        SalesService.get_total_received(db, start_date=start_date, end_date=end_date, source="线上"), # 线上总到账金额
        SalesService.get_total_received(db, start_date=last_month_start_date, end_date=last_now_end, source="线上"), # 上个月同期线上总到账金额
        SalesService.get_total_received(db, start_date=start_date, end_date=end_date), # 本月总到账金额
        SalesService.get_total_received(db, start_date=last_month_start_date, end_date=last_now_end), # 上个月同期总到账金额
        SalesService.get_received_final_amount(db, start_date=start_date, end_date=end_date), # 本月尾款到账金额
        SalesService.get_pending_receivable(db, end_date=end_date), # 待催收尾款金额
        SalesService.get_channel_stats(db, start_date=start_date, end_date=end_date), # 线上/线下订单数量与销售额
        SalesService.get_sales_order_count(db, start_date=start_date, end_date=end_date), # 各销售线上/线下订单数量
        SalesService.get_sales_performance_by_sales(db, start_date=start_date, end_date=end_date), # 销售个人业绩(按照销售额统计)
        SalesService.get_sales_performance_by_received(db, start_date=start_date, end_date=end_date), # 销售个人业绩(按照实际到账金额统计)
        SalesService.get_category_stats(db, start_date=start_date, end_date=end_date) # 产品类目销售额分布
    )
    (
        sales_amount, 
        last_month_sales_amount, 
        total_received_by_last, 
        total_online_received, 
        last_month_total_online_received, 
        total_received, 
        last_month_total_received, 
        total_final_paid, 
        pending_receivable, 
        channel_stats, 
        order_count, 
        sales_performance_by_sales, 
        sales_performance_by_received, 
        category_stats
     ) = result
    # 计算本月销售额环比
    sales_amount_change = (sales_amount - last_month_sales_amount) / last_month_sales_amount if last_month_sales_amount != 0 else 0
    # 计算本月线上销售额环比
    total_online_received_change = (total_online_received - last_month_total_online_received) / last_month_total_online_received if last_month_total_online_received != 0 else 0
    # 计算本月总到账金额环比
    total_received_change = (total_received - last_month_total_received) / last_month_total_received if last_month_total_received != 0 else 0
    return {
        "success": True,
        "data": {
            "sales_amount": sales_amount,
            "sales_amount_change": sales_amount_change,
            "total_received_by_last": total_received_by_last,
            "total_received": total_received,
            "total_online_received": total_online_received,
            "total_online_received_change": total_online_received_change,
            "total_received_change": total_received_change,
            "total_final_paid": total_final_paid,
            "pending_receivable": pending_receivable,
            "order_count": order_count,
            "online_sales": channel_stats["online_sales"] if channel_stats else 0,
            "offline_sales": channel_stats["offline_sales"] if channel_stats else 0,
            "sales_performance_by_sales": sales_performance_by_sales,
            "sales_performance_by_received": sales_performance_by_received,
            "category_stats": category_stats
        },
        "message": "获取销售数据统计成功"
    }

# 只读销售看板 - 获取指定销售人员的销售统计数据（支持按月份查询 YYYY-MM）
@router.get("/statistics/readonly-monthly-sales/{employee_id}")
async def get_readonly_monthly_sales(
    employee_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee),
    month: str = Query(None)
) -> Dict[str, Any]:
    """只读模式获取指定销售人员的销售统计数据"""
    # 获取统计数据
    monthly_sales, monthly_sales_change = await StatisticsService.get_monthly_sales(db, employee_id, month)
    monthly_commission, monthly_commission_change = await StatisticsService.get_monthly_commission(db, employee_id, month)
    monthly_order_count, monthly_order_count_change = await StatisticsService.get_monthly_order_count(db, employee_id, month)
    pending_order_count = await StatisticsService.get_pending_order_count(db, employee_id)

    data = {
        "monthlySales": round(monthly_sales, 2),
        "monthlySalesChange": round(monthly_sales_change, 2),
        "monthlyCommission": round(monthly_commission, 2),
        "monthlyCommissionChange": round(monthly_commission_change, 2),
        "monthlyOrderCount": round(monthly_order_count, 2),
        "monthlyOrderCountChange": round(monthly_order_count_change, 2),
        "pendingOrderCount": round(pending_order_count, 2),
    }
    return api_response(success=True, data=data)

# 只读销售看板 - 获取指定销售人员的本月各周期提点统计数据
@router.get("/statistics/readonly-monthly-sales-by-cycle/{employee_id}")
async def get_readonly_monthly_commission_by_cycle(
    employee_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
) -> Dict[str, Any]:
    """只读模式获取指定销售人员的本月各周期提点统计数据"""
    # 获取统计数据
    monthly_sales_by_cycle = await StatisticsService.get_monthly_sales_by_cycle(db, employee_id)
    return api_response(success=True, data=monthly_sales_by_cycle)

# 只读销售看板 - 获取指定销售人员的月度提点统计数据
@router.get("/statistics/readonly-monthly-sales-statistics/{employee_id}")
async def get_readonly_monthly_commission_statistics(
    employee_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
) -> Dict[str, Any]:
    """只读模式获取指定销售人员的月度提点统计数据"""
    # 获取统计数据
    monthly_sales_statistics = await StatisticsService.get_monthly_sales_statistics(db, employee_id)
    return api_response(success=True, data=monthly_sales_statistics)

# 美工本月系数统计
@router.get("/statistics/art-monthly-coefficient-statistics")
async def get_art_monthly_coefficient_statistics(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
) -> Dict[str, Any]:
    # 获取统计数据
    monthly_coefficient_statistics = await StatisticsService.get_art_monthly_coefficient_statistics(db)
    return api_response(success=True, data=monthly_coefficient_statistics)

# 美工本月平均每单完成时间
@router.get("/statistics/art-monthly-average-completion-time-statistics")
async def get_art_monthly_average_completion_time_statistics(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
) -> Dict[str, Any]:
    # 获取统计数据
    monthly_average_completion_time = await StatisticsService.get_art_monthly_average_completion_time_statistics(db)
    return api_response(success=True, data=monthly_average_completion_time)

# 渲染本月系数统计
@router.get("/statistics/render-monthly-coefficient-statistics")
async def get_render_monthly_coefficient_statistics(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
) -> Dict[str, Any]:
    monthly_coefficient_statistics = await StatisticsService.get_render_monthly_coefficient_statistics(db)
    return api_response(success=True, data=monthly_coefficient_statistics)

# 渲染本月平均每单完成时间
@router.get("/statistics/render-monthly-average-completion-time-statistics")
async def get_render_monthly_average_completion_time_statistics(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
) -> Dict[str, Any]:
    monthly_average_completion_time = await StatisticsService.get_render_monthly_average_completion_time_statistics(db)
    return api_response(success=True, data=monthly_average_completion_time)


# 获取员工本月各周期销售额统计数据
@router.get("/statistics/monthly-sales-amount-by-cycle")
async def get_monthly_sales_amount_by_cycle(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
) -> Dict[str, Any]:
    # 获取统计数据
    monthly_sales_amount_by_cycle = await StatisticsService.get_monthly_sales_amount_by_cycle(db, current_employee.id)
    return api_response(success=True, data=monthly_sales_amount_by_cycle)

# 获取员工月度销售额统计数据
@router.get("/statistics/monthly-sales-amount-statistics")
async def get_monthly_sales_amount_statistics(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
) -> Dict[str, Any]:
    # 获取统计数据
    monthly_sales_amount_statistics = await StatisticsService.get_monthly_sales_amount_statistics(db, current_employee.id)
    return api_response(success=True, data=monthly_sales_amount_statistics)

# 只读销售看板 - 获取指定销售人员的本月各周期销售额统计数据
@router.get("/statistics/readonly-monthly-sales-amount-by-cycle/{employee_id}")
async def get_readonly_monthly_sales_amount_by_cycle(
    employee_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
) -> Dict[str, Any]:
    """只读模式获取指定销售人员的本月各周期销售额统计数据"""
    # 获取统计数据
    monthly_sales_amount_by_cycle = await StatisticsService.get_monthly_sales_amount_by_cycle(db, employee_id)
    return api_response(success=True, data=monthly_sales_amount_by_cycle)

# 只读销售看板 - 获取指定销售人员的月度销售额统计数据
@router.get("/statistics/readonly-monthly-sales-amount-statistics/{employee_id}")
async def get_readonly_monthly_sales_amount_statistics(
    employee_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
) -> Dict[str, Any]:
    """只读模式获取指定销售人员的月度销售额统计数据"""
    # 获取统计数据
    monthly_sales_amount_statistics = await StatisticsService.get_monthly_sales_amount_statistics(db, employee_id)
    return api_response(success=True, data=monthly_sales_amount_statistics)


# 运营看板 - 获取线上客户数据统计
@router.get("/statistics/online-client-data-statistics")
async def get_online_client_data_statistics(
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
) -> Dict[str, Any]:
    # 获取统计数据
    result = await asyncio.gather(
        StatisticsService.get_monthly_client_count(db, source="线上"),
        StatisticsService.get_monthly_transaction_volume(db, source="线上"),
        StatisticsService.get_monthly_client_conversion_rate(db, source="线上"),
        StatisticsService.get_average_transaction_cycle(db, source="线上")
    )
    monthly_client_count, monthly_client_count_change = result[0]
    monthly_transaction_volume, monthly_transaction_volume_change = result[1]
    monthly_conversion_rate, monthly_conversion_rate_change = result[2]
    average_cycle, average_cycle_change = result[3]


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

