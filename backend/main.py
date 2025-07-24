from datetime import datetime, timezone
import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
import uvicorn
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

from backend.api.api import api_router
# 导入异步引擎和 Base
from backend.db.session import Base, async_engine 
# 导入服务
from backend.services.employee_service import EmployeeService
# 导入模型
from backend.models.department import Department
from backend.models.position import Position
from backend.models.employee import Employee
from backend.models.client import Client
from backend.models.client_activity_log import ClientActivityLog
from backend.models.contract import Contract
from backend.models.ticket import Ticket
from backend.models.sub_task import SubTask
from backend.models.progress_log import ProgressLog


# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


async def init_db():
    async with async_engine.begin() as conn:
        logger.info("开始初始化数据库...")

        # 插入部门（存在就跳过）
        dept_stmt = insert(Department).values(name="人事行政部")
        dept_skip_stmt = dept_stmt.on_conflict_do_nothing(
            index_elements=[Department.name]  # 主键冲突检测
        )
        dept_result = await conn.execute(dept_skip_stmt)
        logger.info(f"部门插入完成，受影响行数: {dept_result.rowcount}")

        # 插入职位（存在就跳过）
        dept_id = await conn.scalar(select(Department.id).where(Department.name == "人事行政部"))
        pos_stmt = insert(Position).values(name="HRBP", department_id=dept_id)
        pos_skip_stmt = pos_stmt.on_conflict_do_nothing(
            index_elements=[Position.name]
        )
        pos_result = await conn.execute(pos_skip_stmt)
        logger.info(f"职位插入完成，受影响行数: {pos_result.rowcount}")

        # 插入员工（email 唯一冲突时跳过）
        pos_id = await conn.scalar(select(Position.id).where(Position.name == "HRBP"))
        password_hash = EmployeeService.get_password_hash("123456qwerty")

        emp_stmt = insert(Employee).values(
            name="admin",
            email="admin@example.com",
            password_hash=password_hash,
            role="admin",
            department_id=dept_id,
            position_id=pos_id,
            hire_date=datetime.now(timezone.utc),
            status="active",
            base_salary=10000,
            is_probation=True,

        )

        emp_update_stmt = emp_stmt.on_conflict_do_update(
            index_elements=[Employee.email],  # 冲突字段为 email
            set_={
                "password_hash": password_hash,
            }
        )

        emp_result = await conn.execute(emp_update_stmt)
        logger.info(f"员工插入完成，受影响行数: {emp_result.rowcount}")
        logger.info("账号: admin@example.com, 密码: 123456qwerty")
        logger.info("数据库初始化完成")


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
    # 添加初始数据（仅限开发环境）
    await init_db()

    # 这是应用运行的时间点
    yield

    # 在应用关闭时执行
    print("应用关闭，正在断开数据库连接...")
    await async_engine.dispose()
    print("数据库连接已关闭。")


# 2. 将 Lifespan 管理器传递给 FastAPI
app = FastAPI(lifespan=lifespan)

origins =[
    "http://192.168.10.36:5174", #react 前端地址
    "http://localhost:5174"
]

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 允许所有来源
    allow_credentials=True,  # 允许携带凭证（如 Cookie）
    allow_methods=["*"],  # 允许所有 HTTP 方法
    allow_headers=["*"],  # 允许所有请求头
)

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    # 业务/校验错误（400、401、404、422…）在这里统一格式化输出
    logger.warning(f"[{request.method} {request.url}] {exc.status_code} — {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"code": exc.status_code, "message": exc.detail},
    )

@app.exception_handler(Exception)
async def all_exception_handler(request: Request, exc: Exception):
    # 未捕获的异常（500）在这里统一日志＋友好提示
    logger.error(f"[{request.method} {request.url}] 未处理异常", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={"code": 500, "message": "服务器内部错误，请稍后再试"},
    )



# 包含你的 API 路由
app.include_router(api_router)

# 启动命令
if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="localhost", port=8000, reload=True)