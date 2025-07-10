from fastapi import FastAPI
import uvicorn
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

from backend.api.api import api_router
# 导入异步引擎和 Base
from backend.db.session import Base, async_engine 
import backend.models.department  # 确保加载 Department 模型
import backend.models.position    # 确保加载 Position 模型
import backend.models.employee    # 确保加载 Employee 模型

# 1. 创建 Lifespan 上下文管理器
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 在应用启动时执行
    print("应用启动，开始初始化数据库...")
    async with async_engine.begin() as conn:
        # 每次启动时清空数据库（仅限开发！）
        #await conn.run_sync(Base.metadata.drop_all)
        # 创建所有模型
        await conn.run_sync(Base.metadata.create_all)
    print("数据库初始化完成。")

    # 这是应用运行的时间点
    yield

    # 在应用关闭时执行
    print("应用关闭，正在断开数据库连接...")
    await async_engine.dispose()
    print("数据库连接已关闭。")


# 2. 将 Lifespan 管理器传递给 FastAPI
app = FastAPI(lifespan=lifespan)


# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,  # 允许携带凭证（如 Cookie）
    allow_methods=["*"],  # 允许所有 HTTP 方法
    allow_headers=["*"],  # 允许所有请求头
)


# 包含你的 API 路由
app.include_router(api_router)

# 启动命令
if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="localhost", port=8000, reload=True)