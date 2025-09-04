# utils/date_utils.py
from datetime import datetime, timezone
from typing import Tuple, List
from zoneinfo import ZoneInfo  # Python 3.9+，替代 pytz
from dateutil.relativedelta import relativedelta

# 时区定义
UTC = timezone.utc
BEIJING = ZoneInfo("Asia/Shanghai")
TIMEZONE = BEIJING  # 全局时区


def get_now() -> datetime:
    """
    获取当前 UTC 时间（推荐用于存储）
    """
    return datetime.now(UTC)


def to_datetime(date_str: str) -> datetime:
    """
    将字符串解析为带时区的 datetime（视为北京时间）
    """
    if not date_str:
        raise ValueError("日期字符串不能为空")

    formats = [
        '%Y-%m-%dT%H:%M',
        '%Y-%m-%d %H:%M:%S',
        '%Y-%m-%dT%H:%M:%S',
        '%Y-%m-%d %H:%M',
        '%Y-%m-%d',
    ]

    for fmt in formats:
        try:
            parsed = datetime.strptime(date_str, fmt)
            return parsed.replace(tzinfo=BEIJING)
        except ValueError:
            continue

    raise ValueError(f"无法解析日期字符串: {date_str}")


def get_current_month_range() -> Tuple[datetime, datetime]:
    """
    获取本月的时间区间（北京时间）
    """
    # 先转为北京时间，再取年月
    now = get_now().astimezone(BEIJING)
    year, month = now.year, now.month

    start_date = datetime(year, month, 1, tzinfo=BEIJING)
    if month == 12:
        end_date = datetime(year + 1, 1, 1, tzinfo=BEIJING)
    else:
        end_date = datetime(year, month + 1, 1, tzinfo=BEIJING)

    return start_date, end_date


def get_last_month_range() -> Tuple[datetime, datetime]:
    """
    获取上个月的时间区间（北京时间）
    """
    now = get_now().astimezone(BEIJING)
    if now.month == 1:
        year, month = now.year - 1, 12
    else:
        year, month = now.year, now.month - 1

    start_date = datetime(year, month, 1, tzinfo=BEIJING)
    end_date = datetime(now.year, now.month, 1, tzinfo=BEIJING)

    return start_date, end_date


def get_month_range(year: int, month: int) -> Tuple[datetime, datetime]:
    """
    获取指定年月的时间区间（北京时间）
    """
    if not (1 <= month <= 12):
        raise ValueError("月份必须在 1-12 之间")

    start_date = datetime(year, month, 1, tzinfo=BEIJING)
    if month == 12:
        end_date = datetime(year + 1, 1, 1, tzinfo=BEIJING)
    else:
        end_date = datetime(year, month + 1, 1, tzinfo=BEIJING)

    return start_date, end_date


def get_month_list(start_date: datetime, end_date: datetime) -> List[Tuple[datetime, datetime]]:
    """
    按月切分时间区间 [start, end)，左闭右开
    自动处理时区
    """
    if start_date >= end_date:
        return []

    # 统一转为北京时间处理
    start = start_date.astimezone(BEIJING)
    end = end_date.astimezone(BEIJING)

    result = []
    current = start

    while current < end:
        # 下个月1日0点（北京时间）
        next_month = (current.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                     + relativedelta(months=1))

        seg_end = min(next_month, end)

        if current < seg_end:
            result.append((current, seg_end))

        current = next_month

    return result