from datetime import datetime, timezone
import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
import uvicorn
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.api.api import api_router
# 导入异步引擎和 Base
from backend.db.session import Base, async_engine 
# 导入服务
from backend.services.employee_service import EmployeeService
# 导入模型
from backend.models.department import Department
from backend.models.position import Position
from backend.models.employee import Employee

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
        logger.info(f"人事行政部插入完成，受影响行数: {dept_result.rowcount}")

        # 插入营销管理部门（存在就跳过）
        marketing_dept_stmt = insert(Department).values(name="营销管理部")
        marketing_dept_skip_stmt = marketing_dept_stmt.on_conflict_do_nothing(
            index_elements=[Department.name]
        )
        marketing_dept_result = await conn.execute(marketing_dept_skip_stmt)
        logger.info(f"营销管理部插入完成，受影响行数: {marketing_dept_result.rowcount}")

        # 插入职位（存在就跳过）
        dept_id = await conn.scalar(select(Department.id).where(Department.name == "人事行政部"))
        pos_stmt = insert(Position).values(name="人事专员", department_id=dept_id)
        pos_skip_stmt = pos_stmt.on_conflict_do_nothing(
            index_elements=[Position.name]
        )
        pos_result = await conn.execute(pos_skip_stmt)
        logger.info(f"人事专员职位插入完成，受影响行数: {pos_result.rowcount}")

        # 插入生产部（存在就跳过）
        production_dept_stmt = insert(Department).values(name="生产部")
        production_dept_skip_stmt = production_dept_stmt.on_conflict_do_nothing(
            index_elements=[Department.name]
        )
        production_dept_result = await conn.execute(production_dept_skip_stmt)
        logger.info(f"生产部插入完成，受影响行数: {production_dept_result.rowcount}")

        # 插入营销职位（存在就跳过）
        marketing_dept_id = await conn.scalar(select(Department.id).where(Department.name == "营销管理部"))
        marketing_pos_stmt = insert(Position).values(name="销售专员", department_id=marketing_dept_id)
        marketing_pos_skip_stmt = marketing_pos_stmt.on_conflict_do_nothing(
            index_elements=[Position.name]
        )
        marketing_pos_result = await conn.execute(marketing_pos_skip_stmt)
        logger.info(f"销售专员职位插入完成，受影响行数: {marketing_pos_result.rowcount}")

        # 插入销售经理职位（存在就跳过）
        sales_manager_pos_stmt = insert(Position).values(name="销售经理", department_id=marketing_dept_id)
        sales_manager_pos_skip_stmt = sales_manager_pos_stmt.on_conflict_do_nothing(
            index_elements=[Position.name]
        )
        sales_manager_pos_result = await conn.execute(sales_manager_pos_skip_stmt)
        logger.info(f"销售经理职位插入完成，受影响行数: {sales_manager_pos_result.rowcount}")

        # 获取生产部ID并插入生产部职位
        production_dept_id = await conn.scalar(select(Department.id).where(Department.name == "生产部"))
        
        # 插入美工职位（存在就跳过）
        art_pos_stmt = insert(Position).values(name="美工", department_id=production_dept_id)
        art_pos_skip_stmt = art_pos_stmt.on_conflict_do_nothing(
            index_elements=[Position.name]
        )
        art_pos_result = await conn.execute(art_pos_skip_stmt)
        logger.info(f"美工职位插入完成，受影响行数: {art_pos_result.rowcount}")
        
        # 插入渲染职位（存在就跳过）
        render_pos_stmt = insert(Position).values(name="渲染", department_id=production_dept_id)
        render_pos_skip_stmt = render_pos_stmt.on_conflict_do_nothing(
            index_elements=[Position.name]
        )
        render_pos_result = await conn.execute(render_pos_skip_stmt)
        logger.info(f"渲染职位插入完成，受影响行数: {render_pos_result.rowcount}")

        # 插入员工（email 唯一冲突时跳过）
        pos_id = await conn.scalar(select(Position.id).where(Position.name == "人事专员"))
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
        logger.info(f"管理员插入完成，受影响行数: {emp_result.rowcount}")
        logger.info("管理员账号: admin@example.com, 密码: 123456qwerty")

        # 插入营销部门员工（email 唯一冲突时跳过）
        sales_pos_id = await conn.scalar(select(Position.id).where(Position.name == "销售专员"))
        sales_emp_stmt = insert(Employee).values(
            name="销售张三",
            email="sales@example.com",
            password_hash=password_hash,
            role="employee",
            department_id=marketing_dept_id,
            position_id=sales_pos_id,
            hire_date=datetime.now(timezone.utc),
            status="active",
            base_salary=8000,
            is_probation=False,
        )

        sales_emp_update_stmt = sales_emp_stmt.on_conflict_do_update(
            index_elements=[Employee.email],  # 冲突字段为 email
            set_={
                "password_hash": password_hash,
                "position_id": sales_pos_id,  # 更新职位
            }
        )

        sales_emp_result = await conn.execute(sales_emp_update_stmt)
        logger.info(f"销售员工插入完成，受影响行数: {sales_emp_result.rowcount}")
        logger.info("销售账号: sales@example.com, 密码: 123456qwerty")
        
        # 插入销售经理（email 唯一冲突时跳过）  
        sales_manager_pos_id = await conn.scalar(select(Position.id).where(Position.name == "销售经理"))
        manager_emp_stmt = insert(Employee).values(
            name="经理李四",
            email="manager@example.com", 
            password_hash=password_hash,
            role="manager",
            department_id=marketing_dept_id,
            position_id=sales_manager_pos_id,
            hire_date=datetime.now(timezone.utc),
            status="active",
            base_salary=12000,
            is_probation=False,
        )

        manager_emp_update_stmt = manager_emp_stmt.on_conflict_do_update(
            index_elements=[Employee.email],  # 冲突字段为 email
            set_={
                "password_hash": password_hash,
                "position_id": sales_manager_pos_id,  # 更新职位
            }
        )

        manager_emp_result = await conn.execute(manager_emp_update_stmt)
        logger.info(f"销售经理插入完成，受影响行数: {manager_emp_result.rowcount}")
        logger.info("经理账号: manager@example.com, 密码: 123456qwerty")
        
        # 获取生产部ID
        production_dept_id = await conn.scalar(select(Department.id).where(Department.name == "生产部"))
        
        # 插入美工员工（email 唯一冲突时跳过）
        art_pos_id = await conn.scalar(select(Position.id).where(Position.name == "美工"))
        art_emp_stmt = insert(Employee).values(
            name="美工小王",
            email="art@example.com",
            password_hash=password_hash,
            role="employee",
            department_id=production_dept_id,
            position_id=art_pos_id,
            hire_date=datetime.now(timezone.utc),
            status="active",
            base_salary=7000,
            is_probation=False,
        )
        
        art_emp_update_stmt = art_emp_stmt.on_conflict_do_update(
            index_elements=[Employee.email],
            set_={
                "password_hash": password_hash,
                "position_id": art_pos_id,
            }
        )
        
        art_emp_result = await conn.execute(art_emp_update_stmt)
        logger.info(f"美工员工插入完成，受影响行数: {art_emp_result.rowcount}")
        logger.info("美工账号: art@example.com, 密码: 123456qwerty")
        
        # 插入渲染员工（email 唯一冲突时跳过）
        render_pos_id = await conn.scalar(select(Position.id).where(Position.name == "渲染"))
        render_emp_stmt = insert(Employee).values(
            name="渲染小李",
            email="render@example.com",
            password_hash=password_hash,
            role="employee",
            department_id=production_dept_id,
            position_id=render_pos_id,
            hire_date=datetime.now(timezone.utc),
            status="active",
            base_salary=7500,
            is_probation=False,
        )
        
        render_emp_update_stmt = render_emp_stmt.on_conflict_do_update(
            index_elements=[Employee.email],
            set_={
                "password_hash": password_hash,
                "position_id": render_pos_id,
            }
        )
        
        render_emp_result = await conn.execute(render_emp_update_stmt)
        logger.info(f"渲染员工插入完成，受影响行数: {render_emp_result.rowcount}")
        logger.info("渲染账号: render@example.com, 密码: 123456qwerty")
        
        # 插入美工主管（email 唯一冲突时跳过）
        art_manager_emp_stmt = insert(Employee).values(
            name="美工主管张总",
            email="art-manager@example.com",
            password_hash=password_hash,
            role="manager",
            department_id=production_dept_id,
            position_id=art_pos_id,
            hire_date=datetime.now(timezone.utc),
            status="active",
            base_salary=12000,
            is_probation=False,
        )
        
        art_manager_emp_update_stmt = art_manager_emp_stmt.on_conflict_do_update(
            index_elements=[Employee.email],
            set_={
                "password_hash": password_hash,
                "position_id": art_pos_id,
            }
        )
        
        art_manager_emp_result = await conn.execute(art_manager_emp_update_stmt)
        logger.info(f"美工主管插入完成，受影响行数: {art_manager_emp_result.rowcount}")
        logger.info("美工主管账号: art-manager@example.com, 密码: 123456qwerty")
        
        logger.info("数据库初始化完成")


# 1. 创建 Lifespan 上下文管理器
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     # 在应用启动时执行
#     logger.info("应用启动，开始初始化数据库...")
#     async with async_engine.begin() as conn:
#         # 每次启动时清空数据库（仅限开发！）
#         #await conn.run_sync(Base.metadata.drop_all)
#         # 创建所有模型
#         await conn.run_sync(Base.metadata.create_all)
#     logger.info("数据库表结构创建完成。")
#     # 添加初始数据（仅限开发环境）
#     await init_db()
#
#     # 这是应用运行的时间点
#     yield
#
#     # 在应用关闭时执行
#     logger.info("应用关闭，正在断开数据库连接...")
#     await async_engine.dispose()
#     logger.info("数据库连接已关闭。")


# 2. 将 Lifespan 管理器传递给 FastAPI
#app = FastAPI(lifespan=lifespan)
app = FastAPI()
origins = settings.CORS_ORIGINS

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 允许的来源
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
    # 排除 HTTPException，避免重复处理
    if isinstance(exc, HTTPException):
        raise exc
    logger.error(f"[{request.method} {request.url}] 未处理异常", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={"code": 500, "message": "服务器内部错误，请稍后再试"},
    )



# 包含你的 API 路由
app.include_router(api_router)

# 启动命令
if __name__ == "__main__":
    uvicorn.run("backend.main:app", reload=True)