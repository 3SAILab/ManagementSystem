import calendar
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.client import Client
from sqlalchemy import case, extract, select, func, and_, or_
from datetime import date, datetime, timedelta, timezone
from backend.models.contract import Contract
from sqlalchemy.orm import selectinload
from typing import List, Dict

from backend.models.employee import Employee
from backend.models.sub_task import SubTask


# 业务常量（避免魔法字符串）
CLIENT_STATUS_CONVERTED = ["已成交", "复购"]
CONTRACT_TYPES_VALID = ["首单", "复购"]
class StatisticsService:

    #当前月份的开始和结束时间
    current_date = datetime.now(timezone.utc)
    start_date = datetime(current_date.year, current_date.month, 1)
    end_date = start_date + timedelta(days=31)

    # 上个月的开始和结束时间
    last_month_start_date = start_date - timedelta(days=31)
    last_month_end_date = start_date - timedelta(days=1)


    # 获取本月客户数量和增长率
    """
    获取客户数量
    :param db: 数据库会话
    :param sales_id: 销售人员ID（可选）
    :param source: 客户来源（可选）
    :param start_date: 开始时间（可选）
    :param end_date: 结束时间（可选）
    :return: 客户数量
    """
    # 按条件获取客户数量
    @staticmethod
    async def _count_clients(
        db: AsyncSession,
        sales_id: int = None,
        source: str = None,
        start_date: datetime = None,
        end_date: datetime = None,
        status_in: List[str] = None
    ) -> int:
        """
        通用方法：统计指定时间范围内符合条件的客户数量
        """
        stmt = select(func.count(Client.id))
        
        # 构建 WHERE 条件
        conditions = []
        if start_date is not None:
            conditions.append(Client.created_at >= start_date)
        if end_date is not None:
            conditions.append(Client.created_at <= end_date)
        if sales_id is not None:
            conditions.append(Client.sales_id == sales_id)
        if source is not None:
            conditions.append(Client.source == source)
        if status_in is not None:
            conditions.append(Client.status.in_(status_in))
        if conditions:
            stmt = stmt.where(and_(*conditions))
        
        result = await db.execute(stmt)
        return result.scalar_one_or_none() or 0
    
    # 按条件获取合同数量
    @staticmethod
    async def _count_contracts(
        db: AsyncSession,
        start_date: datetime = None,
        end_date: datetime = None,
        sales_id: int = None,
        source: str = None
    ) -> int:
        """
        通用方法：统计指定时间范围内，合同类型为“首单”或“复购”的合同数量
        支持按销售员或客户来源筛选（通过 Client 表关联）
        所有条件均为可选
        """
        stmt = select(func.count(Contract.id)).join(Contract.client)

        # 构建 WHERE 条件（全部动态）
        conditions = []
        # 时间范围条件（可选）
        if start_date is not None:
            conditions.append(Contract.created_at >= start_date)
        if end_date is not None:
            conditions.append(Contract.created_at <= end_date)
        # 合同类型：首单 或 复购（业务固定条件）
        conditions.append(or_(Contract.contract_type == "首单", Contract.contract_type == "复购"))
        # 销售员筛选
        if sales_id is not None:
            conditions.append(Contract.sales_id == sales_id)
        # 客户来源筛选
        if source is not None:
            conditions.append(Client.source == source)
        # 应用所有条件
        if conditions:
            stmt = stmt.where(and_(*conditions))
        result = await db.execute(stmt)
        return result.scalar_one_or_none() or 0

    # 获取本月客户数量及环比增长率
    @staticmethod
    async def get_monthly_client_count(
        db: AsyncSession,
        sales_id: int = None,
        source: str = None
    ):
        """
        获取本月客户数量及环比增长率（双查询 + 公共方法）
        """
        # 获取当前月份客户数量
        current_month_count = await StatisticsService._count_clients(
            db=db,
            start_date=StatisticsService.start_date,
            end_date=StatisticsService.end_date,
            sales_id=sales_id,
            source=source
        )

        # 获取上月客户数量
        last_month_count = await StatisticsService._count_clients(
            db=db,
            start_date=StatisticsService.last_month_start_date,
            end_date=StatisticsService.last_month_end_date,
            sales_id=sales_id,
            source=source
        )

        # 计算增长率
        growth_rate = (
            (current_month_count - last_month_count) / last_month_count * 100
            if last_month_count > 0 else 0
        )

        return current_month_count, round(growth_rate, 2)

        # 获取本月成交量和增长率
    
    # 获取本月成交量和增长率
    @staticmethod
    async def get_monthly_transaction_volume(
        db: AsyncSession,
        sales_id: int = None,
        source: str = None
    ) -> tuple[int, float]:
        """
        获取本月成交量（首单+复购）及环比增长率
        """
        # 本月成交量
        current_count = await StatisticsService._count_contracts(
            db=db,
            start_date=StatisticsService.start_date,
            end_date=StatisticsService.end_date,
            sales_id=sales_id,
            source=source
        )
        # 上月成交量
        last_count = await StatisticsService._count_contracts(
            db=db,
            start_date=StatisticsService.last_month_start_date,
            end_date=StatisticsService.last_month_end_date,
            sales_id=sales_id,
            source=source
        )
        # 计算增长率
        growth_rate = (
            (current_count - last_count) / last_count * 100
            if last_count > 0 else 0
        )
        return current_count, round(growth_rate, 2)

    # 获取本月客户转化率及环比变化率
    @staticmethod
    async def get_monthly_client_conversion_rate(
        db: AsyncSession,
        sales_id: int = None,
        source: str = None
    ) -> tuple[float, float]:
        """
        获取本月客户转化率及环比变化率
        转化率 = (本月创建且已成交客户数) / (本月创建客户总数)
        变化率 = (本月转化率 - 上月转化率) / 上月转化率 * 100%
        """
        # 本月成交客户数
        current_converted = await StatisticsService._count_clients(
                db=db,
                start_date=StatisticsService.start_date,
                end_date=StatisticsService.end_date,
                sales_id=sales_id,
                source=source,
                status_in=CLIENT_STATUS_CONVERTED
            )
            # 本月客户总数
        current_total = await StatisticsService._count_clients(
                db=db,
                start_date=StatisticsService.start_date,
                end_date=StatisticsService.end_date,
                sales_id=sales_id,
                source=source
            )
            # 上月成交客户数
        last_converted = await StatisticsService._count_clients(
                db=db,
                start_date=StatisticsService.last_month_start_date,
                end_date=StatisticsService.last_month_end_date,
                sales_id=sales_id,
                source=source,
                status_in=CLIENT_STATUS_CONVERTED
            )
            # 上月客户总数
        last_total = await StatisticsService._count_clients(
                db=db,
                start_date=StatisticsService.last_month_start_date,
                end_date=StatisticsService.last_month_end_date,
                sales_id=sales_id,
                source=source
            )

        # 计算转化率
        current_rate = current_converted / current_total if current_total > 0 else 0.0
        last_rate = last_converted / last_total if last_total > 0 else 0.0

        # 计算变化率
        change_rate = 0.0
        if last_rate > 0:
            change_rate = (current_rate - last_rate) / last_rate * 100

        return round(current_rate, 4), round(change_rate, 2)

    # 获取平均成交周期及环比变化率
    @staticmethod
    async def get_average_transaction_cycle(
        db: AsyncSession,
        sales_id: int = None,
        source: str = None
    ) -> tuple[float, float]:
        """
        获取平均成交周期（天）及环比变化率
        成交周期 = 首单合同 transaction_time - 客户创建时间 created_at
        """

        async def _get_avg_cycle(start_date: datetime, end_date: datetime) -> float:
            # 先计算每个客户的成交周期（天），再求平均
            # 1. 子查询：每个客户的成交周期
            per_client_cycles = (
                select(
                    (extract('epoch', func.min(Contract.transaction_time) - Client.created_at) / 86400.0)
                    .label("cycle_days")
                )
                .select_from(Client)
                .join(Contract, Contract.client_id == Client.id)
                .where(
                    and_(
                        Contract.transaction_time.between(start_date, end_date),
                        Contract.contract_type == "首单"
                    )
                )
                .group_by(Client.id, Client.created_at)
            )

            # 添加可选过滤条件
            if sales_id is not None:
                per_client_cycles = per_client_cycles.where(Contract.sales_id == sales_id)
            if source is not None:
                per_client_cycles = per_client_cycles.where(Client.source == source)

            # 2. 外层查询：对所有客户的周期求平均
            stmt = select(func.coalesce(func.avg(per_client_cycles.subquery().c.cycle_days), 0.0))

            result = await db.execute(stmt)
            return float(result.scalar() or 0.0)

        # 并发获取本月和上月
        current_avg = await _get_avg_cycle(StatisticsService.start_date, StatisticsService.end_date)
        last_avg = await _get_avg_cycle(StatisticsService.last_month_start_date, StatisticsService.last_month_end_date)

        # 计算环比变化率
        change_rate = (
            (current_avg - last_avg) / last_avg * 100
            if last_avg > 0 else 0.0
        )

        return round(current_avg, 2), round(change_rate, 2)
    # 根据员工id获取本月销售额和环比增长率
    @staticmethod
    async def get_monthly_sales(db: AsyncSession, employee_id: int):
        # 获取当前月份的销售额(坏单只统计预付金额其余正常统计)
        # 统计坏单
        bad_contract_result = await db.execute(select(func.sum(Contract.paid_amount)).where(
            and_(
                Contract.transaction_time.between(StatisticsService.start_date, StatisticsService.end_date),
                Contract.sales_id == employee_id,
                Contract.status == "坏单"
            )
        ))
        bad_contract_sales = bad_contract_result.scalar_one_or_none() or 0
        # 统计正常单
        result = await db.execute(select(func.sum(Contract.total_amount)).where(
            and_(
                Contract.transaction_time.between(StatisticsService.start_date, StatisticsService.end_date),
                Contract.sales_id == employee_id,
                Contract.status != "坏单"
            )
        ))
        current_month_sales = result.scalar_one_or_none() or 0
        current_month_sales += bad_contract_sales
        # 获取上个月的销售额
        # 统计坏单
        bad_contract_result = await db.execute(select(func.sum(Contract.paid_amount)).where(
            and_(
                Contract.transaction_time.between(StatisticsService.last_month_start_date, StatisticsService.last_month_end_date),
                Contract.sales_id == employee_id,
                Contract.status == "坏单"
            )
        ))
        bad_contract_sales = bad_contract_result.scalar_one_or_none() or 0
        # 统计正常单
        result = await db.execute(select(func.sum(Contract.total_amount)).where(
            and_(
                Contract.transaction_time.between(StatisticsService.last_month_start_date, StatisticsService.last_month_end_date),
                Contract.sales_id == employee_id,
                Contract.status != "坏单"
            )
        ))
        last_month_sales = result.scalar_one_or_none() or 0
        last_month_sales += bad_contract_sales
        # 计算销售额变化
        if last_month_sales > 0:
            return current_month_sales, (current_month_sales - last_month_sales) / last_month_sales * 100
        else:
            return current_month_sales, 0
        
    # 根据员工id获取本月提点和增长率
    @staticmethod
    async def get_monthly_commission(db: AsyncSession, employee_id: int):
        # 获取当前月份的提点(坏单只统计预付金额其余正常统计)
        # 统计坏单
        bad_contract_result = await db.execute(select(func.sum(Contract.paid_amount * Contract.commission_rate / 100)).where(
            and_(
                Contract.transaction_time.between(StatisticsService.start_date, StatisticsService.end_date),
                Contract.sales_id == employee_id,
                Contract.status == "坏单"
            )
        ))
        bad_contract_commission = bad_contract_result.scalar_one_or_none() or 0
        # 统计正常单
        result = await db.execute(select(func.sum(Contract.total_amount * Contract.commission_rate / 100)).where(
            and_(
                Contract.transaction_time.between(StatisticsService.start_date, StatisticsService.end_date),
                Contract.sales_id == employee_id,
                Contract.status != "坏单"
            )
        ))
        current_month_commission = result.scalar_one_or_none() or 0
        current_month_commission += bad_contract_commission
        # 格式化为两位小数
        current_month_commission = round(float(current_month_commission), 2)

        # 获取上个月的提点
        # 统计坏单
        bad_contract_result = await db.execute(select(func.sum(Contract.paid_amount * Contract.commission_rate / 100)).where(
            and_(
                Contract.transaction_time.between(StatisticsService.last_month_start_date, StatisticsService.last_month_end_date),
                Contract.sales_id == employee_id,
                Contract.status == "坏单"
            )
        ))
        bad_contract_commission = bad_contract_result.scalar_one_or_none() or 0
        # 统计正常单
        result = await db.execute(select(func.sum(Contract.total_amount * Contract.commission_rate / 100)).where(
            and_(
                Contract.transaction_time.between(StatisticsService.last_month_start_date, StatisticsService.last_month_end_date),
                Contract.sales_id == employee_id,
                Contract.status != "坏单"
            )
        ))
        last_month_commission = result.scalar_one_or_none() or 0
        last_month_commission += bad_contract_commission
        # 格式化为两位小数
        last_month_commission = round(float(last_month_commission), 2)

        # 计算提点变化
        if last_month_commission > 0:
            return current_month_commission, (current_month_commission - last_month_commission) / last_month_commission * 100
        else:
            return current_month_commission, 0
        
    # 根据员工id获取本月订单数和增长率
    @staticmethod
    async def get_monthly_order_count(db: AsyncSession, employee_id: int):
        # 获取当前月份的订单数
        result = await db.execute(select(func.count(Contract.id)).where(
            and_(
                Contract.transaction_time.between(StatisticsService.start_date, StatisticsService.end_date),
                Contract.sales_id == employee_id
            )
        ))
        current_month_order_count = result.scalar_one_or_none() or 0
        # 获取上个月的订单数
        result = await db.execute(select(func.count(Contract.id)).where(
            and_(
                Contract.transaction_time.between(StatisticsService.last_month_start_date, StatisticsService.last_month_end_date),
                Contract.sales_id == employee_id
            )
        ))
        last_month_order_count = result.scalar_one_or_none() or 0
        # 计算订单数变化
        if last_month_order_count > 0:
            return current_month_order_count, (current_month_order_count - last_month_order_count) / last_month_order_count * 100
        else:
            return current_month_order_count, 0
        
    # 根据员工id获取所有待结算订单数
    @staticmethod
    async def get_pending_order_count(db: AsyncSession, employee_id: int):
        # 获取所有待结算订单数
        result = await db.execute(select(func.count(Contract.id)).where(
            and_(
                Contract.sales_id == employee_id,
                Contract.status == "待结算"
            )
        ))
        pending_order_count = result.scalar_one_or_none() or 0
        return pending_order_count
        
    # 获取员工今年各月度提点统计数据
    @staticmethod
    async def get_monthly_sales_statistics(db: AsyncSession, employee_id: int):
        monthly_sales_statistics = []
        # 获取员工今年各月度销售统计数据(其中坏单只统计预付金额其余正常统计)
        for month in range(1, 13):
            start_date = datetime(StatisticsService.current_date.year, month, 1)
            end_date = start_date + timedelta(days=31)
            # 统计坏单
            bad_contract_result = await db.execute(select(func.sum(Contract.paid_amount*Contract.commission_rate/100)).where(
                and_(
                    Contract.transaction_time.between(start_date, end_date),
                    Contract.sales_id == employee_id,
                    Contract.status == "坏单"
                )
            ))
            bad_contract_sales = bad_contract_result.scalar_one_or_none() or 0
            # 统计正常单
            result = await db.execute(select(func.sum(Contract.total_amount*Contract.commission_rate/100)).where(
                and_(
                    Contract.transaction_time.between(start_date, end_date),
                    Contract.sales_id == employee_id,
                    Contract.status != "坏单"
                )
            ))
            monthly_sales = result.scalar_one_or_none() or 0
            monthly_sales += bad_contract_sales
            # 格式化为两位小数
            monthly_sales = round(float(monthly_sales), 2)
            monthly_sales_statistics.append(monthly_sales)
        return monthly_sales_statistics

    # 获取员工本月各周期提点统计数据
    """
    把一个月分为六个周期，前五个周期都是五天，把剩余的天全都归于最后一个周期
    """
    @staticmethod
    async def get_monthly_sales_by_cycle(db: AsyncSession, employee_id: int) -> List[Dict]:
        """
        获取员工本月在六个提点周期内的提点统计数据
        - 前五个周期：各5天
        - 第六个周期：剩余所有天
        - 坏单：只统计 paid_amount * commission_rate
        - 正常单：统计 total_amount * commission_rate
        返回格式：
        [
            {"cycle": 1, "start": "2025-04-01", "end": "2025-04-05", "total_amount": 12500.0, "order_count": 3},
            ...
        ]
        """
        today = date.today()
        year, month = today.year, today.month

        # 获取本月天数
        _, num_days = calendar.monthrange(year, month)

        # 构建6个周期的起止日期
        cycles = []
        start_day = 1

        for i in range(1, 7):
            if i <= 5:
                end_day = start_day + 4
            else:
                end_day = num_days  # 最后一个周期包含剩余所有天

            if start_day > num_days:
                break

            end_day = min(end_day, num_days)
            start_date = date(year, month, start_day)
            end_date = date(year, month, end_day)

            cycles.append({
                "cycle": i,
                "start": start_date,
                "end": end_date
            })

            start_day = end_day + 1

        # 存储每个周期的结果
        sales_by_cycle = []

        for cycle in cycles:
            start = datetime.combine(cycle["start"], datetime.min.time())  # 转为 datetime
            end = datetime.combine(cycle["end"], datetime.max.time())       # 包含当天最后一秒

            # 查询坏单：只统计预付金额 × 提成比例
            bad_contract_result = await db.execute(
                select(func.sum(Contract.paid_amount * Contract.commission_rate / 100))
                .where(
                    and_(
                        Contract.transaction_time.between(start, end),
                        Contract.sales_id == employee_id,
                        Contract.status == "坏单"
                    )
                )
            )
            bad_sales = bad_contract_result.scalar_one_or_none() or 0

            # 查询正常单：统计总金额 × 提成比例（排除坏单）
            normal_contract_result = await db.execute(
                select(func.sum(Contract.total_amount * Contract.commission_rate / 100),
                    func.count(Contract.id))  # 同时统计订单数
                .where(
                    and_(
                        Contract.transaction_time.between(start, end),
                        Contract.sales_id == employee_id,
                        Contract.status != "坏单"
                    )
                )
            )
            row = normal_contract_result.fetchone()
            normal_sales = row[0] if row[0] is not None else 0
            order_count = row[1] if row[1] is not None else 0

            # 合计销售额（坏单 + 正常单）
            total_amount = bad_sales + normal_sales
            total_amount = round(float(total_amount), 2)  # 保留两位小数

            sales_by_cycle.append({
                "cycle": cycle["cycle"],
                "start": cycle["start"].isoformat(),
                "end": cycle["end"].isoformat(),
                "total_amount": total_amount,
                "order_count": order_count
            })

        return sales_by_cycle

    # 获取销售数据统计（销售主管查看）
    @staticmethod
    async def get_sales_data_statistics(db: AsyncSession):
        """获取销售数据统计，包括销售额、定金额、尾款已支付金额、尾款未支付金额、总到款金额
        线上订单数量、线下订单数量、线上销售额、线下销售额、销售个人业绩、产品类目分布"""
        
        # 获取本月所有合同数据，预加载关联的销售和客户信息
        from sqlalchemy.orm import selectinload
        
        contracts_query = select(Contract).options(
            selectinload(Contract.sales),
            selectinload(Contract.client)
        ).where(
            Contract.transaction_time.between(StatisticsService.start_date, StatisticsService.end_date)
        )
        result = await db.execute(contracts_query)
        contracts = result.scalars().all()
        
        # 获取客户来源信息
        if contracts:
            clients_query = select(Client.id, Client.source).where(
                Client.id.in_([c.client_id for c in contracts])
            )
            result = await db.execute(clients_query)
            clients = {row.id: row.source for row in result}
        else:
            clients = {}
        # 初始化统计数据
        total_sales = 0
        total_deposit = 0
        total_final_paid = 0
        total_pending_final = 0
        total_received = 0
        
        online_orders = 0
        offline_orders = 0
        online_sales = 0
        offline_sales = 0
        
        sales_performance = {}
        category_stats = {}
        
        # 处理每个合同
        for contract in contracts:
            # 计算销售额（坏单只统计预付金额）
            if contract.status == "坏单":
                sales_amount = float(contract.paid_amount)
            else:
                sales_amount = float(contract.total_amount)
            
            total_sales += sales_amount
            
            # 计算定金额和尾款
            deposit_amount = float(contract.paid_amount)
            final_amount = float(contract.total_amount) - deposit_amount
            
            total_deposit += deposit_amount
            
            # 如果状态是"已结算"则尾款已支付，否则待支付
            if contract.status == "已结算":
                total_final_paid += final_amount
            elif final_amount > 0:
                total_pending_final += final_amount
            
            # 总到款金额 = 定金额 + 已支付的尾款
            total_received = total_deposit + total_final_paid
            
            # 按客户来源统计
            client_source = clients.get(contract.client_id, "未知")
            if client_source.value == "线上":
                online_orders += 1
                online_sales += sales_amount
            else:
                offline_orders += 1
                offline_sales += sales_amount
            
            # 销售个人业绩统计
            sales_name = contract.sales.name if contract.sales else "未知"
            if sales_name not in sales_performance:
                sales_performance[sales_name] = {"sales": 0, "count": 0}
                sales_performance[sales_name]["id"] = contract.sales_id
            sales_performance[sales_name]["sales"] += sales_amount
            sales_performance[sales_name]["count"] += 1
            sales_performance[sales_name]["id"] = contract.sales_id
            
            # 产品类目统计
            category = contract.client.product_type if contract.client.product_type else "其他"
            if category not in category_stats:
                category_stats[category] = 0
            category_stats[category] += sales_amount
        
        return {
            "total_sales": round(total_sales, 2),
            "total_deposit": round(total_deposit, 2),
            "total_final_paid": round(total_final_paid, 2),
            "total_pending_final": round(total_pending_final, 2),
            "total_received": round(total_received, 2),
            "online_orders": online_orders,
            "offline_orders": offline_orders,
            "online_sales": round(online_sales, 2),
            "offline_sales": round(offline_sales, 2),
            "sales_performance": sales_performance,
            "category_stats": category_stats
        }

    # 美工本月系数统计
    @staticmethod
    async def get_monthly_coefficient_statistics(db: AsyncSession):
        # 查询每个美工员工的 difficulty_score 总和
        result = await db.execute(
            select(
                SubTask.charge_id,
                Employee.name,
                func.sum(SubTask.difficulty_score).label("total_score")
            )
            .join(Employee, SubTask.charge_id == Employee.id)  # 关联员工表
            .where(
                and_(
                    SubTask.started_at.between(StatisticsService.start_date, StatisticsService.end_date),
                    SubTask.difficulty_score.is_not(None),
                    SubTask.task_type == "美工",
                    SubTask.status == "已完成"
                )
            )
            .group_by(SubTask.charge_id, Employee.name)  # 按员工分组
            .order_by(func.sum(SubTask.difficulty_score).desc())  # 可选：按总分降序
        )
        
        # 处理查询结果
        rows = result.fetchall()
        statistics = []
        
        for row in rows:
            charge_id, name, total_score = row
            if total_score and total_score > 0:
                # 计算系数
                coefficient = float(total_score)
                coefficient = StatisticsService.calculate_coefficient(coefficient)
                # 四舍五入保留三位小数
                statistics.append({
                    "id": charge_id,
                    "name": name,
                    "coefficient": round(coefficient, 3),
                    "total_score": round(float(total_score), 3)
                })
        
        return statistics
    
    # 系数计算
    @staticmethod
    def calculate_coefficient(total_score: float) -> float:
        if total_score <= 8:
            return total_score
        if (total_score - 8) * 1.2 <= 4:
            return 8 + (total_score - 8) * 1.2
        else:
            return 8 + 4 + ((total_score - 8) * 1.2 -4) * 1.3/1.2

    # 美工本月平均每单完成时间
    @staticmethod
    async def get_monthly_average_completion_time_statistics(db: AsyncSession):
        # 查询每个美工员工的平均每单完成时间
        result = await db.execute(
            select(
                SubTask.charge_id,
                Employee.name,
                func.avg(SubTask.completed_at - SubTask.started_at).label("average_completion_time")
            )
            .join(Employee, SubTask.charge_id == Employee.id)
            .where(
                and_(
                    SubTask.started_at.between(StatisticsService.start_date, StatisticsService.end_date),
                    SubTask.task_type == "美工",
                    SubTask.status == "已完成"
                )
            )
            .group_by(SubTask.charge_id, Employee.name)
        )
        rows = result.fetchall()
        statistics = []
        for row in rows:
            charge_id, name, average_completion_time = row
            # 转换为小时，保留两位小数
            average_completion_time = average_completion_time.total_seconds() / 3600
            statistics.append({
                "id": charge_id,
                "name": name,
                "average_completion_time": round(float(average_completion_time), 2)
            })
        return statistics


    # 获取员工今年各月度销售额统计数据
    @staticmethod
    async def get_monthly_sales_amount_statistics(db: AsyncSession, employee_id: int):
        monthly_sales_amount_statistics = []
        # 获取员工今年各月度销售额统计数据(其中坏单只统计预付金额其余正常统计)
        for month in range(1, 13):
            start_date = datetime(StatisticsService.current_date.year, month, 1)
            end_date = start_date + timedelta(days=31)
            # 统计坏单
            bad_contract_result = await db.execute(select(func.sum(Contract.paid_amount)).where(
                and_(
                    Contract.transaction_time.between(start_date, end_date),
                    Contract.sales_id == employee_id,
                    Contract.status == "坏单"
                )
            ))
            bad_contract_sales = bad_contract_result.scalar_one_or_none() or 0
            # 统计正常单
            result = await db.execute(select(func.sum(Contract.total_amount)).where(
                and_(
                    Contract.transaction_time.between(start_date, end_date),
                    Contract.sales_id == employee_id,
                    Contract.status != "坏单"
                )
            ))
            monthly_sales = result.scalar_one_or_none() or 0
            monthly_sales += bad_contract_sales
            # 格式化为两位小数
            monthly_sales = round(float(monthly_sales), 2)
            monthly_sales_amount_statistics.append(monthly_sales)
        return monthly_sales_amount_statistics

    # 获取员工本月各周期销售额统计数据
    """
    把一个月分为六个周期，前五个周期都是五天，把剩余的天全都归于最后一个周期
    """
    @staticmethod
    async def get_monthly_sales_amount_by_cycle(db: AsyncSession, employee_id: int) -> List[Dict]:
        """
        获取员工本月在六个销售额周期内的销售额统计数据
        - 前五个周期：各5天
        - 第六个周期：剩余所有天
        - 坏单：只统计 paid_amount
        - 正常单：统计 total_amount
        返回格式：
        [
            {"cycle": 1, "start": "2025-04-01", "end": "2025-04-05", "total_amount": 12500.0, "order_count": 3},
            ...
        ]
        """
        today = date.today()
        year, month = today.year, today.month

        # 获取本月天数
        _, num_days = calendar.monthrange(year, month)

        # 构建6个周期的起止日期
        cycles = []
        start_day = 1

        for i in range(1, 7):
            if i <= 5:
                end_day = start_day + 4
            else:
                end_day = num_days  # 最后一个周期包含剩余所有天

            if start_day > num_days:
                break

            end_day = min(end_day, num_days)
            start_date = date(year, month, start_day)
            end_date = date(year, month, end_day)

            cycles.append({
                "cycle": i,
                "start": start_date,
                "end": end_date
            })

            start_day = end_day + 1

        # 存储每个周期的结果
        sales_by_cycle = []

        for cycle in cycles:
            start = datetime.combine(cycle["start"], datetime.min.time())  # 转为 datetime
            end = datetime.combine(cycle["end"], datetime.max.time())       # 包含当天最后一秒

            # 查询坏单：只统计预付金额
            bad_contract_result = await db.execute(
                select(func.sum(Contract.paid_amount))
                .where(
                    and_(
                        Contract.transaction_time.between(start, end),
                        Contract.sales_id == employee_id,
                        Contract.status == "坏单"
                    )
                )
            )
            bad_sales = bad_contract_result.scalar_one_or_none() or 0

            # 查询正常单：统计总金额
            normal_contract_result = await db.execute(
                select(func.sum(Contract.total_amount),
                    func.count(Contract.id))  # 同时统计订单数
                .where(
                    and_(
                        Contract.transaction_time.between(start, end),
                        Contract.sales_id == employee_id,
                        Contract.status != "坏单"
                    )
                )
            )
            row = normal_contract_result.fetchone()
            normal_sales = row[0] if row[0] is not None else 0
            order_count = row[1] if row[1] is not None else 0

            # 合计销售额（坏单 + 正常单）
            total_amount = bad_sales + normal_sales
            total_amount = round(float(total_amount), 2)  # 保留两位小数

            sales_by_cycle.append({
                "cycle": cycle["cycle"],
                "start": cycle["start"].isoformat(),
                "end": cycle["end"].isoformat(),
                "total_amount": total_amount,
                "order_count": order_count
            })

        return sales_by_cycle

