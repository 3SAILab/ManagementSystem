from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.client import Client
from sqlalchemy import select, func, and_, or_
from fastapi import HTTPException
from datetime import datetime, timedelta
from backend.models.contract import Contract
from sqlalchemy.exc import SQLAlchemyError

class StatisticsService:

    #当前月份的开始和结束时间
    current_date = datetime.now()
    start_date = datetime(current_date.year, current_date.month, 1)
    end_date = start_date + timedelta(days=31)

    # 上个月的开始和结束时间
    last_month_start_date = start_date - timedelta(days=31)
    last_month_end_date = start_date - timedelta(days=1)


    # 获取本月客户数量和增长率
    @staticmethod
    async def get_monthly_client_count(db: AsyncSession):
        try:
            # 获取当前月份的客户数量
            result = await db.execute(
                select(func.count(Client.id)).where(Client.created_at.between(StatisticsService.start_date, StatisticsService.end_date))
            )
            current_month_count = result.scalar_one()
            # 获取上个月的客户数量
            result = await db.execute(
                select(func.count(Client.id)).where(Client.created_at.between(StatisticsService.last_month_start_date, StatisticsService.last_month_end_date))
            )
            last_month_count = result.scalar_one()
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
    async def get_monthly_transaction_volume(db: AsyncSession):
        try:
            # 获取当前月份的成交量
            result = await db.execute(select(func.count(Contract.id)).where(
                and_(
                    Contract.created_at.between(StatisticsService.start_date, StatisticsService.end_date),
                    or_(Contract.contract_type == "首单", Contract.contract_type == "复购")
                )
            ))
            current_month_count = result.scalar_one()
            # 获取上个月的成交量
            result = await db.execute(select(func.count(Contract.id)).where(
                and_(
                    Contract.created_at.between(StatisticsService.last_month_start_date, StatisticsService.last_month_end_date),
                    or_(Contract.contract_type == "首单", Contract.contract_type == "复购")
                )
            ))
            last_month_count = result.scalar_one()
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
    async def get_monthly_client_conversion_rate(db: AsyncSession):
        try:
            # 获取当前月份创建且成交的客户数量
            result = await db.execute(select(func.count(Client.id)).where(
                and_(
                    Client.created_at.between(StatisticsService.start_date, StatisticsService.end_date),
                    or_(Client.status == "已成交", Client.status == "复购")
                )
            ))
            current_month_count = result.scalar_one()
            # 获取当前月份创建的客户数量
            result = await db.execute(select(func.count(Client.id)).where(
                Client.created_at.between(StatisticsService.start_date, StatisticsService.end_date)
            ))
            current_month_client_count = result.scalar_one()
            # 获取上个月创建且成交的客户数量
            result = await db.execute(select(func.count(Client.id)).where(
                and_(
                    Client.created_at.between(StatisticsService.last_month_start_date, StatisticsService.last_month_end_date),
                    or_(Client.status == "已成交", Client.status == "复购")
                )
            ))
            last_month_count = result.scalar_one()
            # 获取上个月创建的客户数量
            result = await db.execute(select(func.count(Client.id)).where(
                Client.created_at.between(StatisticsService.last_month_start_date, StatisticsService.last_month_end_date)
            ))
            last_month_client_count = result.scalar_one()
            # 计算客户转化率变化
            if last_month_count > 0:
                return current_month_count / current_month_client_count, (current_month_count / current_month_client_count - last_month_count / last_month_client_count) / last_month_count / last_month_client_count * 100
            else:
                return current_month_count / current_month_client_count, 0.0
        except Exception as e:
            print("获取每月客户转化率失败:", e)
            raise HTTPException(status_code=500, detail=f"获取每月客户转化率失败: {str(e)}")
        

    # 获取平均成交周期
    @staticmethod
    async def get_average_transaction_cycle(db: AsyncSession):
        try:
            # 获取本月平均成交周期
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
        