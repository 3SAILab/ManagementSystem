import os
from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from pathlib import Path

class Settings(BaseSettings):

    # 美工绩效薪资
    ART_PERFORMANCE_SALARY: float = float(os.getenv("ART_PERFORMANCE_SALARY", "0"))
    # 渲染绩效薪资
    RENDER_PERFORMANCE_SALARY: float = float(os.getenv("RENDER_PERFORMANCE_SALARY", "0"))
    # 数据库配置
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # QQ邮箱配置
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "smtp.qq.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    EMAIL_USERNAME: str = os.getenv("EMAIL_USERNAME", "") # 确保 .env 文件中有 EMAIL_USERNAME
    EMAIL_PASSWORD: str = os.getenv("EMAIL_PASSWORD", "")  # QQ邮箱授权码
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "")
    
    # Redis配置
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    VERIFY_CODE_DB: int = int(os.getenv("VERIFY_CODE_DB", "0"))
    REDIS_PASSWORD: str = os.getenv("REDIS_PASSWORD", "")
    
    # 应用配置
    CODE_EXPIRE_MINUTES: int = int(os.getenv("CODE_EXPIRE_MINUTES", "10"))
    CODE_LENGTH: int = int(os.getenv("CODE_LENGTH", "6"))
    
    # 前端地址
    CORS_ORIGINS: list[str] = []
    # Pydantic V2 配置方式
    model_config = ConfigDict(
        env_file = Path(__file__).parent / '.env',         # 指定环境变量文件
        env_file_encoding='utf-8', # 指定 .env 文件编码
        extra='ignore'             # 忽略 .env 中未定义的变量
    )

# 实例化配置对象
settings = Settings()