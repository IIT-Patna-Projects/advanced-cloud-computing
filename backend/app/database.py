"""Database module providing async SQLAlchemy engine, sessions, and base model.

Configured with aiomysql driver for non-blocking asynchronous execution
in FastAPI route handlers.
"""

import asyncio
from typing import AsyncGenerator
from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import declarative_base

from app.config import get_settings

settings = get_settings()

async_engine: AsyncEngine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    pool_pre_ping=True,
)

AsyncSessionLocal: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)

Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that yields an asynchronous database session.

    Yields:
        AsyncSession: Active SQLAlchemy async session.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def check_database_connection(timeout: float = 2.0) -> bool:
    """Probe the MySQL database to determine availability and readiness.

    Args:
        timeout: Maximum seconds to wait before declaring probe failure.

    Returns:
        bool: True if database responded to ping, False otherwise.
    """
    async def _ping() -> bool:
        async with async_engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            return result.scalar() == 1

    try:
        return await asyncio.wait_for(_ping(), timeout=timeout)
    except Exception:
        return False
