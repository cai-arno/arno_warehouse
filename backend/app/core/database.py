"""数据库连接"""
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

from app.core.config import settings
from app.core.id_generator import init_counter

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=20,
    max_overflow=10,
)

async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


async def init_db() -> None:
    """初始化数据库"""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    await init_counters()


async def init_counters() -> None:
    """从数据库初始化 ID 计数器（避免重启后 ID 冲突）"""
    tables = ["users", "scripts", "videos", "materials", "templates", "publish_records"]
    try:
        async with async_session() as session:
            for table in tables:
                result = await session.execute(text(f'SELECT MAX(id) FROM {table}'))
                max_id = result.scalar()
                if max_id:
                    # 从字符串 ID 中提取序号，如 SCRI00000002 -> 2
                    try:
                        seq_num = int(max_id[-8:], 16)
                        init_counter(table, seq_num)
                    except ValueError:
                        pass
    except Exception:
        pass  # 忽略初始化错误


async def get_session() -> AsyncSession:
    """获取数据库会话"""
    async with async_session() as session:
        yield session
