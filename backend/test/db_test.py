import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
        
# 导入 User 和 Base
from ..models.user import User, Base
from ..db.session import async_engine as engine

# 异步创建 user 表的函数
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await engine.dispose()

# 创建 user 表
if __name__ == "__main__":
    print("正在创建 user 表...")
    asyncio.run(create_tables())
    print("user 表创建完成。")