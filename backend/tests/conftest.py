"""Pytest fixtures for backend test suite."""

import os
import sys
from typing import AsyncGenerator
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

# Ensure backend directory is in sys.path
backend_dir = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")
)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app  # noqa: E402


@pytest_asyncio.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """Yield an async HTTP test client configured with ASGI transport.

    Yields:
        AsyncClient: HTTPX async client bound to FastAPI application.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport, base_url="http://test"
    ) as client:
        yield client
