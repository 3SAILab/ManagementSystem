import redis
import time
from backend.config import settings
from typing import Tuple

class RateLimiter:
    def __init__(self):
        redis_params = {
            "host": settings.REDIS_HOST,
            "port": settings.REDIS_PORT,
            "db": settings.VERIFY_CODE_DB,
            "decode_responses": True
        }
        
        if settings.REDIS_PASSWORD:
            redis_params["password"] = settings.REDIS_PASSWORD
            
        self.redis_client = redis.Redis(**redis_params)
    
    def is_allowed(self, identifier: str, limit: int = 5, window: int = 300) -> Tuple[bool, int]:
        """
        检查是否允许发送验证码（频率限制）
        """
        key = f"rate_limit:{identifier}"
        
        try:
            # 使用Redis的滑动窗口算法
            now = time.time()
            pipeline = self.redis_client.pipeline()
            pipeline.zadd(key, {str(now): now})
            pipeline.zremrangebyscore(key, 0, now - window)
            pipeline.zcard(key)
            pipeline.expire(key, window)
            
            results = pipeline.execute()
            current_requests = results[2]
            
            if current_requests <= limit:
                return True, limit - current_requests
            else:
                return False, 0
                
        except Exception as e:
            # Redis连接失败时，允许请求通过（避免服务中断）
            print(f"Rate limiter error: {e}")
            return True, limit