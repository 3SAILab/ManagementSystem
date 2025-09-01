# utils/date_utils.py
from datetime import datetime, date, timedelta
from typing import Tuple, Optional,List
from datetime import timezone
from dateutil.relativedelta import relativedelta

def get_now() -> datetime:
    """
    获取当前时间
    
    返回：
        datetime: 当前时间
    """
    return datetime.now(timezone.utc)

def to_datetime(date_str: str) -> datetime:
    """
    将字符串转换为datetime对象
    支持多种日期格式：
    - '2025-08-13T10:23' (前端 datetime-local 格式)
    - '2025-08-13 10:23:00' (标准格式)
    - '2025-08-13T10:23:00' (ISO 格式)
    """
    if not date_str:
        raise ValueError("日期字符串不能为空")
    
    # 定义支持的日期格式
    date_formats = [
        '%Y-%m-%dT%H:%M',      # 2025-08-13T10:23 (前端 datetime-local 格式)
        '%Y-%m-%d %H:%M:%S',   # 2025-08-13 10:23:00 (标准格式)
        '%Y-%m-%dT%H:%M:%S',   # 2025-08-13T10:23:00 (ISO 格式)
        '%Y-%m-%d %H:%M',      # 2025-08-13 10:23 (简化格式)
        '%Y-%m-%d',            # 2025-08-13 (仅日期)
    ]
    
    # 尝试每种格式
    for fmt in date_formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    
    # 如果所有格式都失败，抛出错误
    raise ValueError(f"无法解析日期字符串: {date_str}。支持的格式: {', '.join(date_formats)}")

def get_current_month_range() -> Tuple[datetime, datetime]:
    """
    获取本月的时间区间
    
    返回：
        Tuple[datetime, datetime]: (本月开始时间, 本月结束时间)
        使用左闭右开区间 [start, end)
    """
    now = get_now()
    start_date = datetime(now.year, now.month, 1)
    
    # 计算下个月第一天
    if now.month == 12:
        end_date = datetime(now.year + 1, 1, 1)
    else:
        end_date = datetime(now.year, now.month + 1, 1)
    
    return start_date, end_date


def get_last_month_range() -> Tuple[datetime, datetime]:
    """
    获取上个月的时间区间
    
    返回：
        Tuple[datetime, datetime]: (上月开始时间, 上个月结束时间)
        使用左闭右开区间 [start, end)
    """
    now = get_now()
    
    # 计算上个月
    if now.month == 1:
        last_month = 12
        last_year = now.year - 1
    else:
        last_month = now.month - 1
        last_year = now.year
    
    start_date = datetime(last_year, last_month, 1)
    end_date = datetime(now.year, now.month, 1)
    
    return start_date, end_date


def get_current_quarter_range() -> Tuple[datetime, datetime]:
    """
    获取本季度的时间区间
    
    返回：
        Tuple[datetime, datetime]: (本季度开始时间, 本季度结束时间)
        使用左闭右开区间 [start, end)
    """
    now = get_now()
    quarter = (now.month - 1) // 3 + 1
    start_month = (quarter - 1) * 3 + 1
    
    start_date = datetime(now.year, start_month, 1)
    
    # 计算下个季度开始时间
    if quarter == 4:
        end_date = datetime(now.year + 1, 1, 1)
    else:
        end_date = datetime(now.year, start_month + 3, 1)
    
    return start_date, end_date


def get_last_quarter_range() -> Tuple[datetime, datetime]:
    """
    获取上季度的时间区间
    
    返回：
        Tuple[datetime, datetime]: (上季度开始时间, 上季度结束时间)
        使用左闭右开区间 [start, end)
    """
    now = get_now()
    quarter = (now.month - 1) // 3 + 1
    
    if quarter == 1:
        last_quarter = 4
        last_year = now.year - 1
    else:
        last_quarter = quarter - 1
        last_year = now.year
    
    start_month = (last_quarter - 1) * 3 + 1
    start_date = datetime(last_year, start_month, 1)
    
    if last_quarter == 4:
        end_date = datetime(last_year + 1, 1, 1)
    else:
        end_date = datetime(last_year, start_month + 3, 1)
    
    return start_date, end_date


def get_current_year_range() -> Tuple[datetime, datetime]:
    """
    获取本年的时间区间
    
    返回：
        Tuple[datetime, datetime]: (本年开始时间, 本年结束时间)
        使用左闭右开区间 [start, end)
    """
    now = get_now()
    start_date = datetime(now.year, 1, 1)
    end_date = datetime(now.year + 1, 1, 1)
    
    return start_date, end_date


def get_last_year_range() -> Tuple[datetime, datetime]:
    """
    获取上年的时间区间
    
    返回：
        Tuple[datetime, datetime]: (上年开始时间, 上年结束时间)
        使用左闭右开区间 [start, end)
    """
    now = get_now()
    start_date = datetime(now.year - 1, 1, 1)
    end_date = datetime(now.year, 1, 1)
    
    return start_date, end_date


def get_current_week_range() -> Tuple[datetime, datetime]:
    """
    获取本周的时间区间（周一到周日）
    
    返回：
        Tuple[datetime, datetime]: (本周开始时间, 本周结束时间)
        使用左闭右开区间 [start, end)
    """
    now = get_now()
    # 获取本周一
    days_since_monday = now.weekday()
    monday = now - timedelta(days=days_since_monday)
    start_date = datetime(monday.year, monday.month, monday.day)
    
    # 下周一
    end_date = start_date + timedelta(days=7)
    
    return start_date, end_date


def get_last_week_range() -> Tuple[datetime, datetime]:
    """
    获取上周的时间区间（周一到周日）
    
    返回：
        Tuple[datetime, datetime]: (上周开始时间, 上周结束时间)
        使用左闭右开区间 [start, end)
    """
    now = get_now()
    # 获取本周一
    days_since_monday = now.weekday()
    monday = now - timedelta(days=days_since_monday)
    
    # 上周一
    last_monday = monday - timedelta(days=7)
    start_date = datetime(last_monday.year, last_monday.month, last_monday.day)
    
    # 本周一
    end_date = datetime(monday.year, monday.month, monday.day)
    
    return start_date, end_date


def get_custom_date_range(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    days: Optional[int] = None
) -> Tuple[datetime, datetime]:
    """
    获取自定义时间区间
    
    参数：
        start_date: 开始日期（可选）
        end_date: 结束日期（可选）
        days: 天数（可选，如果指定则从今天往前推days天）
    
    返回：
        Tuple[datetime, datetime]: (开始时间, 结束时间)
        使用左闭右开区间 [start, end)
    """
    now = get_now()
    
    if days is not None:
        # 从今天往前推days天
        end_date = datetime(now.year, now.month, now.day)
        start_date = end_date - timedelta(days=days)
    else:
        if start_date is None:
            start_date = datetime(now.year, now.month, 1)  # 默认本月开始
        
        if end_date is None:
            # 默认到明天
            end_date = datetime(now.year, now.month, now.day) + timedelta(days=1)
        else:
            end_date = datetime(end_date.year, end_date.month, end_date.day)
        
        start_date = datetime(start_date.year, start_date.month, start_date.day)
    
    return start_date, end_date


def get_month_range(year: int, month: int) -> Tuple[datetime, datetime]:
    """
    获取指定年月的时间区间
    
    参数：
        year: 年份
        month: 月份
    
    返回：
        Tuple[datetime, datetime]: (开始时间, 结束时间)
        使用左闭右开区间 [start, end)
    """
    start_date = datetime(year, month, 1)
    
    if month == 12:
        end_date = datetime(year + 1, 1, 1)
    else:
        end_date = datetime(year, month + 1, 1)
    
    return start_date, end_date


def get_quarter_range(year: int, quarter: int) -> Tuple[datetime, datetime]:
    """
    获取指定年季度的时间区间
    
    参数：
        year: 年份
        quarter: 季度 (1-4)
    
    返回：
        Tuple[datetime, datetime]: (开始时间, 结束时间)
        使用左闭右开区间 [start, end)
    """
    if not 1 <= quarter <= 4:
        raise ValueError("季度必须在1-4之间")
    
    start_month = (quarter - 1) * 3 + 1
    start_date = datetime(year, start_month, 1)
    
    if quarter == 4:
        end_date = datetime(year + 1, 1, 1)
    else:
        end_date = datetime(year, start_month + 3, 1)
    
    return start_date, end_date


def format_date_range(start_date: datetime, end_date: datetime) -> str:
    """
    格式化时间区间为可读字符串
    
    参数：
        start_date: 开始时间
        end_date: 结束时间
    
    返回：
        str: 格式化的时间区间字符串
    """
    if start_date.date() == end_date.date():
        return f"{start_date.strftime('%Y年%m月%d日')}"
    else:
        return f"{start_date.strftime('%Y年%m月%d日')} - {end_date.strftime('%Y年%m月%d日')}"


def get_days_between(start_date: datetime, end_date: datetime) -> int:
    """
    计算两个日期之间的天数
    
    参数：
        start_date: 开始时间
        end_date: 结束时间
    
    返回：
        int: 天数
    """
    return (end_date.date() - start_date.date()).days


def is_same_month(date1: datetime, date2: datetime) -> bool:
    """
    判断两个日期是否在同一个月
    
    参数：
        date1: 日期1
        date2: 日期2
    
    返回：
        bool: 是否同月
    """
    return date1.year == date2.year and date1.month == date2.month


def is_same_quarter(date1: datetime, date2: datetime) -> bool:
    """
    判断两个日期是否在同一个季度
    
    参数：
        date1: 日期1
        date2: 日期2
    
    返回：
        bool: 是否同季度
    """
    quarter1 = (date1.month - 1) // 3 + 1
    quarter2 = (date2.month - 1) // 3 + 1
    return date1.year == date2.year and quarter1 == quarter2

def get_month_list(start_date: datetime, end_date: datetime) -> List[Tuple[datetime, datetime]]:
    """
    将 [start_date, end_date) 按月切分，不跨月，每段为连续的时间区间。
    使用左闭右开区间 [start, end)

    示例：
        start=2025-03-15, end=2025-05-10
        返回：
            [
                (2025-03-15, 2025-04-01),
                (2025-04-01, 2025-05-01),
                (2025-05-01, 2025-05-10)
            ]
    """
    if start_date >= end_date:
        return []

    result = []
    current = start_date

    while current < end_date:
        # 获取 current 所在月的下个月1日（作为当前段的理论结束）
        next_month = (current.replace(day=1, hour=0, minute=0, second=0, microsecond=0) 
                     + relativedelta(months=1))

        # 当前段的结束位置：取 min(next_month, end_date)
        seg_end = min(next_month, end_date)

        # 只有当 current < seg_end 时才添加
        if current < seg_end:
            result.append((current, seg_end))

        # 下一段从 next_month 开始（即使 seg_end 提前截断，也跳到下月1日）
        current = next_month

    return result