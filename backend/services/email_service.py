import redis
import random
import string
from datetime import datetime, timedelta
from backend.config import settings
from backend.utils.email_sender import EmailSender
from backend.utils.rate_limiter import RateLimiter
from fastapi import BackgroundTasks
import logging

logger = logging.getLogger(__name__)

class EmailVerificationService:
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
        self.email_sender = EmailSender()
        self.rate_limiter = RateLimiter()
    
    def generate_code(self, length: int = None) -> str:
        """生成验证码"""
        code_length = length or settings.CODE_LENGTH
        return ''.join(random.choices(string.digits, k=code_length))
    
    def store_code(self, email: str, code: str, purpose: str = "general", expire_minutes: int = None) -> bool:
        """存储验证码到Redis"""
        expire_time = expire_minutes or settings.CODE_EXPIRE_MINUTES
        key = f"email_code:{purpose}:{email}"
        
        try:
            # 存储验证码和过期时间
            pipeline = self.redis_client.pipeline()
            pipeline.setex(key, expire_time * 60, code)
            pipeline.setex(f"{key}:expires_at", expire_time * 60, 
                          (datetime.now() + timedelta(minutes=expire_time)).isoformat())
            results = pipeline.execute()
            
            return all(results)
        except Exception as e:
            print(f"存储验证码失败: {e}")
            return False
    
    def verify_code(self, email: str, code: str, purpose: str = "general") -> dict:
        """验证验证码"""
        key = f"email_code:{purpose}:{email}"
        
        try:
            stored_code = self.redis_client.get(key)
            
            if not stored_code:
                return {
                    "success": False,
                    "verified": False,
                    "message": "验证码已过期或不存在"
                }
            
            if stored_code != code:
                return {
                    "success": False,
                    "verified": False,
                    "message": "验证码错误"
                }
            
            # 获取过期时间
            expires_at_str = self.redis_client.get(f"{key}:expires_at")
            expires_at = datetime.fromisoformat(expires_at_str) if expires_at_str else None
            
            # 验证成功后删除验证码
            self.redis_client.delete(key, f"{key}:expires_at")
            
            return {
                "success": True,
                "verified": True,
                "message": "验证码验证成功",
                "expires_at": expires_at
            }
        except Exception as e:
            print(f"验证验证码失败: {e}")
            return {
                "success": False,
                "verified": False,
                "message": "系统错误"
            }
    
    def send_verification_code(self, email: str, background_tasks: BackgroundTasks, purpose: str = "general") -> dict:
        """发送验证码 (前置处理在主线程，邮件发送在后台任务)"""
        try:
            # 1. 频率限制检查 (必须在主线程完成)
            allowed, remaining = self.rate_limiter.is_allowed(f"email:{email}", limit=3, window=300)
            if not allowed:
                logger.warning(f"发送验证码频率限制: {email}")
                return {
                    "success": False,
                    "message": "发送验证码过于频繁，请稍后再试"
                }
            
            # 2. 生成验证码 (快速操作)
            code = self.generate_code()
            # 3. 存储验证码 (关键：必须在主线程完成并确认成功)
            #    这是决定用户能否使用该验证码的关键步骤，必须成功。
            store_success = self.store_code(email, code, purpose)
            if not store_success:
                 logger.error(f"存储验证码到Redis失败: {email}")
                 # 在这个阶段失败，应该返回错误给用户
                 return {
                     "success": False,
                     "message": "系统内部错误，无法处理请求"
                 }

            # 4. 如果前置处理（频率检查、生成、存储）都成功了：
            #    a. 将耗时的邮件发送任务添加到后台
            #    b. 立即返回成功响应给用户
            logger.info(f"验证码前置处理成功: {email}, 准备后台发送邮件")
            
            # 将邮件发送任务添加到后台任务队列
            # 注意：传递的是方法本身和所需参数
            background_tasks.add_task(
                self.email_sender.send_verification_code, # 方法
                email,   # 参数1
                code,    # 参数2 (由前置步骤生成)
                purpose  # 参数3
            )
            logger.debug(f"已将后台邮件任务加入队列: {email}")

            # 5. 立即返回成功响应，不等待邮件发送结果
            #    消息可以提示用户“已发送”或更准确的“已处理，请查收”
            return {
                "success": True,
                "message": "如果该邮箱已注册，验证码已发送，请查收邮箱。", # 或 "验证码处理中，请查收邮箱。"
                "data": {
                    "remaining_attempts": remaining
                }
            }
            
        except Exception as e:
            logger.error(f"发送验证码处理异常: {email}, 错误: {e}", exc_info=True)
            # 内部错误，返回通用信息
            return {
                "success": False,
                "message": "系统内部错误"
            }


    def get_code_info(self, email: str, purpose: str = "general") -> dict:
        """获取验证码信息（调试用）"""
        try:
            key = f"email_code:{purpose}:{email}"
            stored_code = self.redis_client.get(key)
            expires_at_str = self.redis_client.get(f"{key}:expires_at")
            
            if not stored_code:
                return {
                    "exists": False,
                    "message": "验证码不存在或已过期"
                }
            
            expires_at = datetime.fromisoformat(expires_at_str) if expires_at_str else None
            
            return {
                "exists": True,
                "expires_at": expires_at,
                "message": "验证码有效"
            }
        except Exception as e:
            print(f"获取验证码信息异常: {e}")
            return {
                "exists": False,
                "message": "系统错误"
            }