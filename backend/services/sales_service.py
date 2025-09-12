import asyncio
from typing import Optional
from sqlalchemy import and_, case, func, null, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date, datetime, timedelta, timezone
from typing import Dict, Any
from backend.models.client import Client, ClientSource
from backend.models.contract import Contract
from backend.models.employee import Employee
from backend.utils.contract_utils import calculate_commission_rate
from backend.utils.date_utils import get_month_list

class SalesService:
    
    """
    计算实际总到账
    start_date 开始时间（可选）
    end_date 结束时间（可选）
    source 客户来源（可选）
    sales_id 销售id （可选)
    """
    @staticmethod
    async def get_total_received(
        db: AsyncSession,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        source: Optional[str] = None,
        sales_id: Optional[int] = None
    ) -> float:
        """
        计算指定时间区间内的实际总进账金额（含预付款 + 尾款）

        规则：
        - 预付款（paid_amount）：若 transaction_time 在 [start_date, end_date) 内 → 计入
        - 尾款（total_amount - paid_amount）：若 settlement_time 在 [start_date, end_date) 内 → 计入

        参数：
            db: AsyncSession
            start_date: 开始时间（可选）
            end_date: 结束时间（可选），使用左闭右开 [start, end)
            source: 客户来源（可选）
            sales_id: 销售员ID（可选）

        返回：
            实际到账总金额（float）
        """

        # 构建两部分到账金额的表达式
        total_received_expr = (
            # 预付款部分：基于 transaction_time
            case(
                (
                    and_(
                        (start_date is None or Contract.transaction_time >= start_date),
                        (end_date is None or Contract.transaction_time < end_date),
                        (sales_id is None or Contract.prepayment_sales_id == sales_id),
                        Contract.paid_amount > 0  # 可选：避免 0 预付款干扰
                    ),
                    Contract.paid_amount
                ),
                else_=0.0
            )
            +
            # 尾款部分：基于 settlement_time
            case(
                (
                    and_(
                        Contract.settlement_time.isnot(null()),  # 必须已结算
                        (start_date is None or Contract.settlement_time >= start_date),
                        (end_date is None or Contract.settlement_time < end_date),
                        (sales_id is None or Contract.final_payment_sales_id == sales_id)
                    ),
                    Contract.total_amount - Contract.paid_amount
                ),
                else_=0.0
            )
        )

        # 查询总和
        stmt = select(func.sum(total_received_expr)).select_from(Contract).join(Client, Client.id == Contract.client_id)

        # 添加过滤条件
        where_clauses = []

        if source is not None:
            where_clauses.append(Client.source == source)

        # 优化：只考虑可能产生进账的合同（至少有一个时间字段非空）
        relevant_time = or_(
            Contract.transaction_time.isnot(null()),
            Contract.settlement_time.isnot(null())
        )
        where_clauses.append(relevant_time)

        if where_clauses:
            stmt = stmt.where(and_(*where_clauses))

        # 执行查询
        result = await db.execute(stmt)
        total = result.scalar()

        return float(total or 0.0)

    """
    计算销售员提点
    start_date 开始时间（可选）
    end_date 结束时间（可选）
    sales_id 销售id 
    """
    @staticmethod
    async def get_sales_commission(
        db: AsyncSession,
        sales_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> float:
        """
        计算销售员提点
        规则：
        - 按照线上线下分别计算提点

        参数：
            db: AsyncSession
            start_date: 开始时间（可选）
            end_date: 结束时间（可选），使用左闭右开 [start, end)
            sales_id: 销售员ID

        返回：
            销售员提点（float）
        """
        month_list = get_month_list(start_date,end_date)
        total_amount = 0
        for month in month_list:
            start_date, end_date = month
            offline_total = await SalesService.get_total_received(db, sales_id=sales_id, start_date=start_date, end_date=end_date, source="线下")
            online_total = await SalesService.get_total_received(db, sales_id=sales_id, start_date=start_date, end_date=end_date, source="线上")
            offline_commission_rate = await SalesService.get_commission_rate(db, year=start_date.year, month=start_date.month, sales_id=sales_id, source="线下")
            online_commission_rate = await SalesService.get_commission_rate(db, year=start_date.year, month=start_date.month, sales_id=sales_id, source="线上")
            offline_amount = offline_total * offline_commission_rate/100
            online_amount = online_total * online_commission_rate/100
            total_amount = total_amount + offline_amount + online_amount

        return float(total_amount or 0.0)

    """
    统计待催收尾款金额
    start_date 开始时间（可选）
    end_date 结束时间（可选）
    sales_id 销售id （可选）
    """    
    @staticmethod
    async def get_pending_receivable(
        db: AsyncSession,
        sales_id: Optional[int] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> float:
        """
        统计待催收尾款金额
        规则：
        - 合同状态（status）: 若 status 为待结算 → 计入
        - 尾款（total_amount - paid_amount）：若 contract.transaction_time 在 [start_date, end_date) 内 → 计入

        参数：
            db: AsyncSession
            start_date: 开始时间（可选）
            end_date: 结束时间（可选），使用左闭右开 [start, end)
            sales_id: 销售员ID（可选）

        返回：
            待催收尾款金额（float）
        """
        # 构建待催收尾款金额的查询条件
        # 规则：合同状态为"待结算"且尾款金额大于0
        pending_receivable_expr = case(
            (
                and_(
                    Contract.status == "待结算",  # 合同状态为待结算
                    (Contract.total_amount - Contract.paid_amount) > 0,  # 尾款金额大于0
                    (start_date is None or Contract.transaction_time >= start_date),
                    (end_date is None or Contract.transaction_time < end_date)
                ),
                Contract.total_amount - Contract.paid_amount  # 计算尾款金额
            ),
            else_=0.0
        )

        # 查询总和
        stmt = select(func.sum(pending_receivable_expr)).select_from(Contract)

        # 添加过滤条件
        where_clauses = []

        if sales_id is not None:
            where_clauses.append(Contract.sales_id == sales_id)

        # 只考虑状态为"待结算"的合同
        where_clauses.append(Contract.status == "待结算")
        
        # 只考虑有尾款的合同
        where_clauses.append((Contract.total_amount - Contract.paid_amount) > 0)

        if where_clauses:
            stmt = stmt.where(and_(*where_clauses))

        # 执行查询
        result = await db.execute(stmt)
        total = result.scalar()

        return float(total or 0.0)
        
    """
    统计线上/线下订单数量与销售额
    start_date 开始时间（可选）
    end_date 结束时间（可选）
    """
    @staticmethod
    async def get_channel_stats(
        db: AsyncSession,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """统计线上/线下订单数量与销售额
        规则：
        - 订单（transaction_time）：若 transaction_time 在 [start_date, end_date) 内 → 计入

        参数：
            db: AsyncSession
            start_date: 开始时间（可选）
            end_date: 结束时间（可选），使用左闭右开 [start, end)

        返回：
            线上/线下订单数量与销售额（Dict）
        """
        stmt = select(
            Client.source,
            func.count(Contract.id),
            func.sum(
                case(
                    (Contract.status == "坏单", func.coalesce(Contract.paid_amount, 0)),
                    else_=func.coalesce(Contract.total_amount, 0)
                )
            )
        ).select_from(Contract)\
        .join(Client, Client.id == Contract.client_id)\
        .where(
            and_(
                (start_date is None or Contract.transaction_time >= start_date),
                (end_date is None or Contract.transaction_time < end_date)
            )
        )\
        .group_by(Client.source)

        result = await db.execute(stmt)
        rows = result.all()

        online_orders = 0
        offline_orders = 0
        online_sales = 0.0
        offline_sales = 0.0
        for source, count, amount in rows:
            amount = float(amount or 0.0)
            if source == "线上" or (hasattr(source, 'value') and source.value == "线上"):
                online_orders += count
                online_sales += amount
            else:
                offline_orders += count
                offline_sales += amount

        return {
            "online_orders": online_orders,
            "offline_orders": offline_orders,
            "online_sales": round(online_sales, 2),
            "offline_sales": round(offline_sales, 2),
        }
    
    """
    统计销售个人业绩 （按照销售额统计）
    start_date 开始时间（可选）
    end_date 结束时间（可选）
    """
    @staticmethod
    async def get_sales_performance_by_sales(
        db: AsyncSession,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> Dict[str, Dict]:
        """统计销售个人业绩 （按照销售额统计）
        规则：
        - 订单（transaction_time）：若 transaction_time 在 [start_date, end_date) 内 → 计入

        参数：
            db: AsyncSession
            start_date: 开始时间（可选）
            end_date: 结束时间（可选），使用左闭右开 [start, end)

        返回：
            销售个人业绩（Dict）
        """
        stmt = select(
            Contract.sales_id,
            func.coalesce(Employee.name, "未知").label("sales_name"),
            func.count(Contract.id),
            func.sum(
                case(
                    (Contract.status == "坏单", func.coalesce(Contract.paid_amount, 0)),
                    else_=func.coalesce(Contract.total_amount, 0)
                )
            )
        ).select_from(Contract)\
        .join(Employee, Contract.sales_id == Employee.id, isouter=True)\
        .where(
            and_(
                (start_date is None or Contract.transaction_time >= start_date),
                (end_date is None or Contract.transaction_time < end_date)
            )
        )\
        .group_by(Contract.sales_id, Employee.name)

        result = await db.execute(stmt)
        rows = result.all()

        performance = {}
        for sales_id, name, count, amount in rows:
            name = name or "未知"
            performance[name] = {
                "id": sales_id,
                "sales": round(float(amount or 0.0), 2),
                "count": count
            }

        return performance
    

    """
    统计销售个人业绩 （按照实际到账金额统计）
    start_date 开始时间（可选）
    end_date 结束时间（可选）
    """
    @staticmethod
    async def get_sales_performance_by_received(
        db: AsyncSession,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> Dict[str, Dict]:
        """统计销售个人业绩 （按照实际到账金额统计）
        规则：
        - 订单（transaction_time）：若 transaction_time 在 [start_date, end_date) 内 → 计入

        参数：
            db: AsyncSession
            start_date: 开始时间（可选）
            end_date: 结束时间（可选），使用左闭右开 [start, end)

        返回：
            销售个人业绩（Dict）
        """
        stmt = select(
            Contract.sales_id,
            func.coalesce(Employee.name, "未知").label("sales_name"),
            func.count(Contract.id),
            func.sum(
                # 构建两部分到账金额的表达式
                case(
                    (
                        and_(
                            (start_date is None or Contract.transaction_time >= start_date),
                            (end_date is None or Contract.transaction_time < end_date),
                            Contract.paid_amount > 0,  # 预付款部分
                        ),
                        Contract.paid_amount
                    ),
                    else_=0.0
                )
                +
                case(
                    (
                        and_(
                            Contract.settlement_time.isnot(null()),  # 必须已结算
                            (start_date is None or Contract.settlement_time >= start_date),
                            (end_date is None or Contract.settlement_time < end_date),
                            Contract.total_amount - Contract.paid_amount > 0
                        ),
                        Contract.total_amount - Contract.paid_amount  # 尾款部分
                    ),
                    else_=0.0
                )
            )
        ).select_from(Contract)\
        .join(Employee, Contract.sales_id == Employee.id, isouter=True)\
        .where(
            and_(
                # 只考虑可能产生进账的合同（至少有一个时间字段非空）
                or_(
                    Contract.transaction_time.isnot(null()),
                    Contract.settlement_time.isnot(null())
                )
            )
        )\
        .group_by(Contract.sales_id, Employee.name)

        result = await db.execute(stmt)
        rows = result.all()

        performance = {}
        for sales_id, name, count, amount in rows:
            name = name or "未知"
            performance[name] = {
                "id": sales_id,
                "amount": round(float(amount or 0.0), 2),
                "count": count
            }

        return performance
    
    """
    统计产品类目销售额分布
    start_date 开始时间（可选）
    end_date 结束时间（可选）
    """
    @staticmethod
    async def get_category_stats(
        db: AsyncSession,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> Dict[str, float]:
        """统计产品类目销售额分布
        规则：
        - 订单（transaction_time）：若 transaction_time 在 [start_date, end_date) 内 → 计入

        参数：
            db: AsyncSession
            start_date: 开始时间（可选）
            end_date: 结束时间（可选），使用左闭右开 [start, end)

        返回：
            产品类目销售额分布（Dict）
        """
        stmt = select(
            func.coalesce(Client.product_type_ids, []),
            func.sum(
                case(
                    (Contract.status == "坏单", func.coalesce(Contract.paid_amount, 0)),
                    else_=func.coalesce(Contract.total_amount, 0)
                )
            )
        ).select_from(Contract)\
        .join(Client, Client.id == Contract.client_id)\
        .where(
            and_(
                (start_date is None or Contract.transaction_time >= start_date),
                (end_date is None or Contract.transaction_time < end_date)
            )
        )\
        .group_by(Client.product_type_ids)

        result = await db.execute(stmt)
        rows = result.all()

        # 获取所有产品类型ID到名字的映射
        from backend.services.product_type_service import ProductTypeService
        all_product_types = await ProductTypeService.get_active_product_types(db)
        product_type_map = {pt.id: pt.name for pt in all_product_types}
        
        # 处理 product_type_ids 数组，将数组转换为产品类型名字
        category_stats = {}
        for product_type_ids, amount in rows:
            if product_type_ids:
                # 将ID数组转换为产品类型名字数组
                type_names = []
                for type_id in sorted(product_type_ids):
                    type_name = product_type_map.get(type_id, f"未知类型({type_id})")
                    type_names.append(type_name)
                key = ','.join(type_names)
            else:
                key = "其他"
            
            if key in category_stats:
                category_stats[key] += round(float(amount or 0.0), 2)
            else:
                category_stats[key] = round(float(amount or 0.0), 2)

        return category_stats
    

    """
    计算满足以下条件的尾款到账金额：
    合同成交时间段区间：[last_start, last_end) （可选）
    尾款结算时间段区间：[start_date, end_date) （可选）
    """
    @staticmethod
    async def get_total_received_by_last(
        db: AsyncSession,
        last_start: Optional[datetime] = None,
        last_end: Optional[datetime] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        sales_id: Optional[int] = None
    ) -> float:
        """
        计算合同成交时间为往月,尾款结算时间为本月尾款到账金额

        规则：
        - 合同成交时间（transaction_time）在[last_start, last_end) （可选）
        - 尾款结算时间（settlement_time）在[start_date, end_date) （可选）
        - 只计算尾款部分（total_amount - paid_amount） 且 有尾款

        参数：
            db: AsyncSession
            last_start: 合同成交时间开始（可选）
            last_end: 合同成交时间结束（可选）
            start_date: 尾款结算时间开始（可选，默认本月开始）
            end_date: 尾款结算时间结束（可选，默认本月结束）
            sales_id: 销售员ID（可选）

        返回：
            满足条件的尾款到账总金额（float）
        """
        from backend.utils.date_utils import get_current_month_range

        # 如果没有指定尾款结算时间，默认使用本月
        if start_date is None or end_date is None:
            current_start, current_end = get_current_month_range()
            if start_date is None:
                start_date = current_start
            if end_date is None:
                end_date = current_end

        # 构建查询条件
        where_clauses = []
        
        # 合同成交时间条件（可选）
        if last_start is not None:
            where_clauses.append(Contract.transaction_time >= last_start)
        if last_end is not None:
            where_clauses.append(Contract.transaction_time < last_end)
            
        # 尾款结算时间条件
        where_clauses.append(Contract.settlement_time.isnot(null()))
        if start_date is not None:
            where_clauses.append(Contract.settlement_time >= start_date)
        if end_date is not None:
            where_clauses.append(Contract.settlement_time < end_date)
        
        # 有尾款
        where_clauses.append((Contract.total_amount - Contract.paid_amount) > 0)
        
        # 可选：按销售员过滤
        if sales_id is not None:
            where_clauses.append(Contract.final_payment_sales_id == sales_id)

        # 构建查询
        stmt = select(
            func.sum(Contract.total_amount - Contract.paid_amount)
        ).select_from(Contract).where(and_(*where_clauses))

        # 执行查询
        result = await db.execute(stmt)
        total = result.scalar()

        return float(total or 0.0)
    

    """
    计算指定时间区间的销售额
    start_date 开始时间（可选）
    end_date 结束时间（可选）
    sales_id 销售id （可选）
    """
    @staticmethod
    async def get_sales_amount(
        db: AsyncSession,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        sales_id: Optional[int] = None
    ) -> float:
        """
        计算指定时间区间的销售额
        规则：
        - 订单（transaction_time）：若 transaction_time 在 [start_date, end_date) 内 → 计入

        参数：
            db: AsyncSession
            start_date: 开始时间（可选）
            end_date: 结束时间（可选），使用左闭右开 [start, end)
            sales_id: 销售员ID（可选） 

        返回：
            指定时间区间的销售额（float）
        """
        
        # 构建查询条件
        where_clauses = []
        
        # 时间范围条件
        if start_date is not None:
            where_clauses.append(Contract.transaction_time >= start_date)
        if end_date is not None:
            where_clauses.append(Contract.transaction_time < end_date)
            
        # 合同成交时间必须存在
        where_clauses.append(Contract.transaction_time.isnot(null()))
        
        # 可选：按销售员过滤
        if sales_id is not None:
            where_clauses.append(Contract.sales_id == sales_id)
        
        # 构建查询：计算销售额（坏单按已付金额，其他按总金额）
        stmt = select(
            func.sum(
                case(
                    (Contract.status == "坏单", func.coalesce(Contract.paid_amount, 0)),
                    else_=func.coalesce(Contract.total_amount, 0)
                )
            )
        ).select_from(Contract).where(and_(*where_clauses))

        # 执行查询
        result = await db.execute(stmt)
        total = result.scalar()

        return float(total or 0.0)


    """
    计算指定时间区间的已到账尾款总金额
    start_date 开始时间（可选）
    end_date 结束时间（可选）
    sales_id 销售id （可选）
    """
    @staticmethod
    async def get_received_final_amount(
        db: AsyncSession,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        sales_id: Optional[int] = None
    ) -> float:
        """
        计算指定时间区间的已到账尾款总金额
        规则：
        - 订单（settlement_time）：若 settlement_time 在 [start_date, end_date) 内 → 计入

        参数：
            db: AsyncSession
            start_date: 开始时间（可选）
            end_date: 结束时间（可选），使用左闭右开 [start, end) 
            sales_id: 销售员ID（可选）
        返回：
            指定时间区间的已到账尾款总金额（float）
        """
        from backend.utils.date_utils import get_current_month_range

        # 如果没有指定尾款结算时间，默认使用本月
        if start_date is None or end_date is None:
            current_start, current_end = get_current_month_range()
            if start_date is None:
                start_date = current_start
            if end_date is None:
                end_date = current_end

        # 构建查询条件
        where_clauses = []
        
        # 时间范围条件
        if start_date is not None:
            where_clauses.append(Contract.settlement_time >= start_date)
        if end_date is not None:
            where_clauses.append(Contract.settlement_time < end_date)
            
        # 尾款结算时间必须存在
        where_clauses.append(Contract.settlement_time.isnot(null()))
        
        # 可选：按销售员过滤
        if sales_id is not None:
            where_clauses.append(Contract.sales_id == sales_id)
        
        # 构建查询：计算已到账尾款总金额
        stmt = select(
            func.sum(Contract.total_amount - Contract.paid_amount)
        ).select_from(Contract).where(and_(*where_clauses))

        result = await db.execute(stmt)
        total = result.scalar()

        return float(total or 0.0)
    
    """
    计算指定时间的提点比例
    year: 年份
    month 月份
    sales_id 销售id
    source 客户来源
    """
    @staticmethod
    async def get_commission_rate(
        db: AsyncSession,
        year: int,
        month: int,
        sales_id: int,
        source: Optional[str] = None
    ) -> float:
        """
        计算指定时间的提点比例
        参数：
            db: AsyncSession
            year: 年份
            month: 月份
            sales_id: 销售员ID
            source: 客户来源
        返回：
            指定时间区间的提点比例（float）
        """
        from backend.utils.date_utils import get_month_range
        if source == "线上":
            total_received = None
        else:
            start_date, end_date = get_month_range(year,month)
            total_received = await SalesService.get_total_received(db, start_date=start_date, end_date=end_date, sales_id=sales_id)
        commission_rate = calculate_commission_rate(source,total_received)
        return commission_rate
    
    
    """
    统计销售个人线上和线下成交订单数
    start_date 开始时间（可选）
    end_date 结束时间（可选）
    """
    @staticmethod
    async def get_sales_order_count(
        db: AsyncSession,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> Dict[str, Dict[str, int]]:
        """
        统计销售个人线上和线下成交订单数
        规则：
        - 订单 transaction_time 在 [start_date, end_date) 内计入
        - 根据 Client.source 区分线上/线下
        返回：
            {
                "张三": { "online": 5, "offline": 3 },
                "李四": { "online": 20, "offline": 2 },
                ...
            }
        """
        online_condition = Client.source.in_(["线上"])
        offline_condition = Client.source.in_(["线下", "活动"])

        stmt = (
            select(
                Contract.sales_id,
                func.coalesce(Employee.name, "未知").label("sales_name"),
                func.sum(
                    case((online_condition, 1), else_=0)
                ).label("online_count"),
                func.sum(
                    case((offline_condition, 1), else_=0)
                ).label("offline_count"),
            )
            .select_from(Contract)
            .join(Client, Contract.client_id == Client.id)
            .join(Employee, Contract.sales_id == Employee.id, isouter=True)
            .where(
                and_(
                    (start_date is None or Contract.transaction_time >= start_date),
                    (end_date is None or Contract.transaction_time < end_date),
                )
            )
            .group_by(Contract.sales_id, Employee.name)
        )

        result = await db.execute(stmt)
        rows = result.all()

        order_count = {}
        for row in rows:
            name = row.sales_name or "未知"
            order_count[name] = {
                "online": row.online_count or 0,
                "offline": row.offline_count or 0
            }

        return order_count