import asyncio
from typing import Optional
from sqlalchemy import and_, case, func, null, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date, datetime, timedelta, timezone

from backend.models.contract import Contract


class SalesService:
    """
    计算实际总到账
    start_date 开始时间（可选）
    end_date 结束时间（可选）
    sales_id 销售id （可选)
    """
    @staticmethod
    async def get_total_received(
        db: AsyncSession,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
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
                        (end_date is None or Contract.settlement_time < end_date)
                    ),
                    Contract.total_amount - Contract.paid_amount
                ),
                else_=0.0
            )
        )

        # 查询总和
        stmt = select(func.sum(total_received_expr)).select_from(Contract)

        # 添加过滤条件
        where_clauses = []

        if sales_id is not None:
            where_clauses.append(Contract.sales_id == sales_id)

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
    