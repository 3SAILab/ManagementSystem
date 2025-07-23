from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.client import Client
from sqlalchemy import select, func, and_, or_
from fastapi import HTTPException
from datetime import datetime, timedelta, timezone
from backend.models.contract import Contract
from sqlalchemy.exc import SQLAlchemyError

class StatisticsService:

    #当前月份的开始和结束时间
    current_date = datetime.now(timezone.utc)
    start_date = datetime(current_date.year, current_date.month, 1)
    end_date = start_date + timedelta(days=31)

    # 上个月的开始和结束时间
    last_month_start_date = start_date - timedelta(days=31)
    last_month_end_date = start_date - timedelta(days=1)


    # 获取本月客户数量和增长率
    @staticmethod
    async def get_monthly_client_count(db: AsyncSession, sales_id: int = None):
        try:
            # 获取当前月份的客户数量
            if sales_id:
                result = await db.execute(
                    select(func.count(Client.id)).where(
                        and_(
                            Client.created_at.between(StatisticsService.start_date, StatisticsService.end_date),
                            Client.sales_id == sales_id
                        )
                    )
                )
            else:
                result = await db.execute(
                    select(func.count(Client.id)).where(
                        Client.created_at.between(StatisticsService.start_date, StatisticsService.end_date)
                    )
                )
            current_month_count = result.scalar_one_or_none() or 0
            
            # 获取上个月的客户数量
            if sales_id:
                result = await db.execute(
                    select(func.count(Client.id)).where(
                        and_(
                            Client.created_at.between(StatisticsService.last_month_start_date, StatisticsService.last_month_end_date),
                            Client.sales_id == sales_id
                        )
                    )
                )
            else:
                result = await db.execute(
                    select(func.count(Client.id)).where(
                        Client.created_at.between(StatisticsService.last_month_start_date, StatisticsService.last_month_end_date)
                    )
                )
            last_month_count = result.scalar_one_or_none() or 0
            
            # 计算客户数量变化
            if last_month_count > 0:
                return current_month_count, (current_month_count - last_month_count) / last_month_count * 100
            else:
                return current_month_count, 0
        except Exception as e:
            print("获取每月客户数量失败:", e)
            raise HTTPException(status_code=500, detail=f"获取每月客户数量失败: {str(e)}")
        
    # 获取本月成交量和增长率
    @staticmethod
    async def get_monthly_transaction_volume(db: AsyncSession, sales_id: int = None):
        try:
            # 获取当前月份的成交量
            if sales_id:
                result = await db.execute(select(func.count(Contract.id)).where(
                    and_(
                        Contract.created_at.between(StatisticsService.start_date, StatisticsService.end_date),
                        or_(Contract.contract_type == "首单", Contract.contract_type == "复购"),
                        Contract.sales_id == sales_id
                    )
                ))
            else:
                result = await db.execute(select(func.count(Contract.id)).where(
                    and_(
                        Contract.created_at.between(StatisticsService.start_date, StatisticsService.end_date),
                        or_(Contract.contract_type == "首单", Contract.contract_type == "复购")
                    )
                ))
            current_month_count = result.scalar_one_or_none() or 0
            
            # 获取上个月的成交量
            if sales_id:
                result = await db.execute(select(func.count(Contract.id)).where(
                    and_(
                        Contract.created_at.between(StatisticsService.last_month_start_date, StatisticsService.last_month_end_date),
                        or_(Contract.contract_type == "首单", Contract.contract_type == "复购"),
                        Contract.sales_id == sales_id
                    )
                ))
            else:
                result = await db.execute(select(func.count(Contract.id)).where(
                    and_(
                        Contract.created_at.between(StatisticsService.last_month_start_date, StatisticsService.last_month_end_date),
                        or_(Contract.contract_type == "首单", Contract.contract_type == "复购")
                    )
                ))
            last_month_count = result.scalar_one_or_none() or 0
            
            # 计算成交量变化
            if last_month_count > 0:
                return current_month_count, (current_month_count - last_month_count) / last_month_count * 100
            else:
                return current_month_count, 0
        except Exception as e:
            print("获取每月成交量失败:", e)
            raise HTTPException(status_code=500, detail=f"获取每月成交量失败: {str(e)}")
    

    # 获取本月客户转化率以及与上月相比的增长率
    @staticmethod
    async def get_monthly_client_conversion_rate(db: AsyncSession, sales_id: int = None):
        try:
            # 获取当前月份创建且成交的客户数量
            if sales_id:
                result = await db.execute(select(func.count(Client.id)).where(
                    and_(
                        Client.created_at.between(StatisticsService.start_date, StatisticsService.end_date),
                        or_(Client.status == "已成交", Client.status == "复购"),
                        Client.sales_id == sales_id
                    )
                ))
            else:
                result = await db.execute(select(func.count(Client.id)).where(
                    and_(
                        Client.created_at.between(StatisticsService.start_date, StatisticsService.end_date),
                        or_(Client.status == "已成交", Client.status == "复购")
                    )
                ))
            current_month_count = result.scalar_one_or_none() or 0
            
            # 获取当前月份创建的客户数量
            if sales_id:
                result = await db.execute(select(func.count(Client.id)).where(
                    and_(
                        Client.created_at.between(StatisticsService.start_date, StatisticsService.end_date),
                        Client.sales_id == sales_id
                    )
                ))
            else:
                result = await db.execute(select(func.count(Client.id)).where(
                    Client.created_at.between(StatisticsService.start_date, StatisticsService.end_date)
                ))
            current_month_client_count = result.scalar_one_or_none() or 0
            
            # 获取上个月创建且成交的客户数量
            if sales_id:
                result = await db.execute(select(func.count(Client.id)).where(
                    and_(
                        Client.created_at.between(StatisticsService.last_month_start_date, StatisticsService.last_month_end_date),
                        or_(Client.status == "已成交", Client.status == "复购"),
                        Client.sales_id == sales_id
                    )
                ))
            else:
                result = await db.execute(select(func.count(Client.id)).where(
                    and_(
                        Client.created_at.between(StatisticsService.last_month_start_date, StatisticsService.last_month_end_date),
                        or_(Client.status == "已成交", Client.status == "复购")
                    )
                ))
            last_month_count = result.scalar_one_or_none() or 0
            
            # 获取上个月创建的客户数量
            if sales_id:
                result = await db.execute(select(func.count(Client.id)).where(
                    and_(
                        Client.created_at.between(StatisticsService.last_month_start_date, StatisticsService.last_month_end_date),
                        Client.sales_id == sales_id
                    )
                ))
            else:
                result = await db.execute(select(func.count(Client.id)).where(
                    Client.created_at.between(StatisticsService.last_month_start_date, StatisticsService.last_month_end_date)
                ))
            last_month_client_count = result.scalar_one_or_none() or 0
            
            # 计算客户转化率变化
            if last_month_count > 0:
                return current_month_count / current_month_client_count, (current_month_count / current_month_client_count - last_month_count / last_month_client_count) / last_month_count / last_month_client_count * 100
            else:
                return current_month_count / current_month_client_count, 0.0
        except Exception as e:
            print("获取每月客户转化率失败:", e)
            raise HTTPException(status_code=500, detail=f"获取每月客户转化率失败: {str(e)}")
        

    # 获取平均成交周期和增长率
    @staticmethod
    async def get_average_transaction_cycle(db: AsyncSession, sales_id: int = None):
        try:
            # 获取本月平均成交周期
            if sales_id:
                result = await db.execute(
                    select(Client.created_at, func.min(Contract.created_at).label("first_contract"))
                    .join(Contract, Contract.client_id == Client.id)
                    .where(and_(
                        Contract.created_at.between(StatisticsService.start_date, StatisticsService.end_date),
                        Contract.contract_type == "首单",
                        Contract.sales_id == sales_id
                    ))
                    .group_by(Client.id, Client.created_at)
                )
            else:
                result = await db.execute(
                    select(Client.created_at, func.min(Contract.created_at).label("first_contract"))
                    .join(Contract, Contract.client_id == Client.id)
                    .where(and_(
                        Contract.created_at.between(StatisticsService.start_date, StatisticsService.end_date),
                        Contract.contract_type == "首单"
                    ))
                    .group_by(Client.id, Client.created_at)
                )
            records = result.all()
            if records:
                current_cycles = [
                    (first_contract - created_at).days for created_at, first_contract in records
                ]
                current_avg = sum(current_cycles) / len(current_cycles)
            else:
                current_avg = 0

            # 获取上月平均成交周期
            if sales_id:
                result = await db.execute(
                    select(Client.created_at, func.min(Contract.created_at).label("first_contract"))
                    .join(Contract, Contract.client_id == Client.id)
                    .where(and_(
                        Contract.created_at.between(StatisticsService.last_month_start_date, StatisticsService.last_month_end_date),
                        Contract.contract_type == "首单",
                        Contract.sales_id == sales_id
                    ))
                    .group_by(Client.id, Client.created_at)
                )
            else:
                result = await db.execute(
                    select(Client.created_at, func.min(Contract.created_at).label("first_contract"))
                    .join(Contract, Contract.client_id == Client.id)
                    .where(and_(
                        Contract.created_at.between(StatisticsService.last_month_start_date, StatisticsService.last_month_end_date),
                        Contract.contract_type == "首单"
                    ))
                    .group_by(Client.id, Client.created_at)
                )
            records = result.all()
            if records:
                last_cycles = [
                    (first_contract - created_at).days for created_at, first_contract in records
                ]
                last_avg = sum(last_cycles) / len(last_cycles)
            else:
                last_avg = 0

            # 计算平均成交周期变化率
            if last_avg > 0:
                rate = (current_avg - last_avg) / last_avg * 100
            else:
                rate = 0

            return current_avg, rate
        except Exception as e:
            print("获取平均成交周期失败:", e)
            raise HTTPException(status_code=500, detail=f"获取平均成交周期失败: {str(e)}")


    # 根据员工id获取本月销售额和增长率
    @staticmethod
    async def get_monthly_sales(db: AsyncSession, employee_id: int):
        try:
            # 获取当前月份的销售额
            result = await db.execute(select(func.sum(Contract.total_amount)).where(
                and_(
                    Contract.created_at.between(StatisticsService.start_date, StatisticsService.end_date),
                    Contract.sales_id == employee_id
                )
            ))
            current_month_sales = result.scalar_one_or_none() or 0
            # 获取上个月的销售额
            result = await db.execute(select(func.sum(Contract.total_amount)).where(
                and_(
                    Contract.created_at.between(StatisticsService.last_month_start_date, StatisticsService.last_month_end_date),
                    Contract.sales_id == employee_id
                )
            ))
            last_month_sales = result.scalar_one_or_none() or 0
            # 计算销售额变化
            if last_month_sales > 0:
                return current_month_sales, (current_month_sales - last_month_sales) / last_month_sales * 100
            else:
                return current_month_sales, 0
        except Exception as e:
            print("获取每月销售额失败:", e)
            raise HTTPException(status_code=500, detail=f"获取每月销售额失败: {str(e)}")
        
    # 根据员工id获取本月提点和增长率
    @staticmethod
    async def get_monthly_commission(db: AsyncSession, employee_id: int):
        try:
            # 获取当前月份的提点
            result = await db.execute(select(func.sum(Contract.total_amount * Contract.commission_rate / 100)).where(
                and_(
                    Contract.created_at.between(StatisticsService.start_date, StatisticsService.end_date),
                    Contract.sales_id == employee_id
                )
            ))
            current_month_commission = result.scalar_one_or_none() or 0

            # 格式化为两位小数
            current_month_commission = round(float(current_month_commission), 2)

            # 获取上个月的提点
            result = await db.execute(select(func.sum(Contract.total_amount * Contract.commission_rate / 100)).where(
                and_(
                    Contract.created_at.between(StatisticsService.last_month_start_date, StatisticsService.last_month_end_date),
                    Contract.sales_id == employee_id
                )
            ))
            last_month_commission = result.scalar_one_or_none() or 0
            # 格式化为两位小数
            last_month_commission = round(float(last_month_commission), 2)

            # 计算提点变化
            if last_month_commission > 0:
                return current_month_commission, (current_month_commission - last_month_commission) / last_month_commission * 100
            else:
                return current_month_commission, 0
        except Exception as e:  
            print("获取每月提点失败:", e)
            raise HTTPException(status_code=500, detail=f"获取每月提点失败: {str(e)}")
        
    # 根据员工id获取本月订单数和增长率
    @staticmethod
    async def get_monthly_order_count(db: AsyncSession, employee_id: int):
        try:
            # 获取当前月份的订单数
            result = await db.execute(select(func.count(Contract.id)).where(
                and_(
                    Contract.created_at.between(StatisticsService.start_date, StatisticsService.end_date),
                    Contract.sales_id == employee_id
                )
            ))
            current_month_order_count = result.scalar_one_or_none() or 0
            # 获取上个月的订单数
            result = await db.execute(select(func.count(Contract.id)).where(
                and_(
                    Contract.created_at.between(StatisticsService.last_month_start_date, StatisticsService.last_month_end_date),
                    Contract.sales_id == employee_id
                )
            ))
            last_month_order_count = result.scalar_one_or_none() or 0
            # 计算订单数变化
            if last_month_order_count > 0:
                return current_month_order_count, (current_month_order_count - last_month_order_count) / last_month_order_count * 100
            else:
                return current_month_order_count, 0
        except Exception as e:
            print("获取每月订单数失败:", e)
            raise HTTPException(status_code=500, detail=f"获取每月订单数失败: {str(e)}")
        
    # 根据员工id获取本月待结算订单数和增长率
    @staticmethod
    async def get_monthly_pending_order_count(db: AsyncSession, employee_id: int):
        try:
            # 获取当前月份的待结算订单数
            result = await db.execute(select(func.count(Contract.id)).where(
                and_(
                    Contract.created_at.between(StatisticsService.start_date, StatisticsService.end_date),
                    Contract.sales_id == employee_id,
                    Contract.total_amount - Contract.paid_amount > 0
                )
            ))
            current_month_pending_order_count = result.scalar_one_or_none() or 0
            # 获取上个月的待结算订单数
            result = await db.execute(select(func.count(Contract.id)).where(
                and_(
                    Contract.created_at.between(StatisticsService.last_month_start_date, StatisticsService.last_month_end_date),
                    Contract.sales_id == employee_id,
                    Contract.total_amount - Contract.paid_amount > 0
                )
            ))
            last_month_pending_order_count = result.scalar_one_or_none() or 0
            # 计算待结算订单数变化
            if last_month_pending_order_count > 0:
                return current_month_pending_order_count, (current_month_pending_order_count - last_month_pending_order_count) / last_month_pending_order_count * 100
            else:
                return current_month_pending_order_count, 0
        except Exception as e:
            print("获取每月待结算订单数失败:", e)
            raise HTTPException(status_code=500, detail=f"获取每月待结算订单数失败: {str(e)}")
        
    # 获取员工今年各月度销售统计数据
    @staticmethod
    async def get_monthly_sales_statistics(db: AsyncSession, employee_id: int):
        try:
            monthly_sales_statistics = []
            # 获取员工今年各月度销售统计数据
            for month in range(1, 13):
                start_date = datetime(StatisticsService.current_date.year, month, 1)
                end_date = start_date + timedelta(days=31)
                result = await db.execute(select(func.sum(Contract.total_amount * Contract.commission_rate / 100)).where(
                    and_(
                        Contract.created_at.between(start_date, end_date),
                        Contract.sales_id == employee_id
                    )
                ))
                monthly_sales = result.scalar_one_or_none() or 0
                # 格式化为两位小数
                monthly_sales = round(float(monthly_sales), 2)
                monthly_sales_statistics.append(monthly_sales)
            return monthly_sales_statistics
        except Exception as e:
            print("获取员工今年各月度销售统计数据失败:", e)
            raise HTTPException(status_code=500, detail=f"获取员工今年各月度销售统计数据失败: {str(e)}")






        




