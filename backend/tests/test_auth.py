"""Unit and API integration test suite for authentication endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_new_user_success(async_client: AsyncClient):
    """Verify customer registration returns 201 with created user details."""
    payload = {
        "email": "fresh.user@example.com",
        "password": "StrongPassword123",
        "full_name": "Fresh Test User",
    }
    response = await async_client.post("/auth/register", json=payload)
    assert response.status_code == 201

    data = response.json()
    assert data["email"] == "fresh.user@example.com"
    assert data["full_name"] == "Fresh Test User"
    assert data["is_admin"] is False
    assert "id" in data
    assert "hashed_password" not in data


@pytest.mark.asyncio
async def test_register_duplicate_email_conflict(async_client: AsyncClient):
    """Verify registering an existing email returns 409 Conflict."""
    payload = {
        "email": "customer@example.com",
        "password": "SecurePassword123",
        "full_name": "Duplicate User",
    }
    response = await async_client.post("/auth/register", json=payload)
    assert response.status_code == 409

    data = response.json()
    assert data["code"] == "EMAIL_EXISTS"
    assert "already registered" in data["error"]


@pytest.mark.asyncio
async def test_register_invalid_email_format(async_client: AsyncClient):
    """Verify malformed email addresses are rejected with 422."""
    payload = {
        "email": "invalid-email-no-at-sign",
        "password": "SecurePassword123",
        "full_name": "Invalid Email User",
    }
    response = await async_client.post("/auth/register", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_register_short_password_rejected(async_client: AsyncClient):
    """Verify passwords shorter than 8 characters are rejected with 422."""
    payload = {
        "email": "short.pwd@example.com",
        "password": "short",
        "full_name": "Short Password User",
    }
    response = await async_client.post("/auth/register", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_success(async_client: AsyncClient):
    """Verify valid credentials return 200 OK with signed JWT token."""
    payload = {
        "email": "customer@example.com",
        "password": "SecurePassword123",
    }
    response = await async_client.post("/auth/login", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["expires_in"] == 86400
    assert data["user"]["email"] == "customer@example.com"
    assert data["user"]["full_name"] == "Priyanshu Sharma"
    assert data["user"]["is_admin"] is False


@pytest.mark.asyncio
async def test_login_invalid_password(async_client: AsyncClient):
    """Verify incorrect password returns 401 Unauthorized."""
    payload = {
        "email": "customer@example.com",
        "password": "WrongPassword999",
    }
    response = await async_client.post("/auth/login", json=payload)
    assert response.status_code == 401

    data = response.json()
    assert data["code"] == "INVALID_CREDENTIALS"


@pytest.mark.asyncio
async def test_login_non_existent_email(async_client: AsyncClient):
    """Verify non-existent user login returns 401 Unauthorized."""
    payload = {
        "email": "unknown.entity@example.com",
        "password": "SecurePassword123",
    }
    response = await async_client.post("/auth/login", json=payload)
    assert response.status_code == 401

    data = response.json()
    assert data["code"] == "INVALID_CREDENTIALS"


@pytest.mark.asyncio
async def test_get_current_user_profile_me_success(
    async_client: AsyncClient
):
    """Verify GET /auth/me returns profile when bearer token is provided."""
    # First login to obtain bearer token
    login_res = await async_client.post(
        "/auth/login",
        json={
            "email": "customer@example.com",
            "password": "SecurePassword123",
        },
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    # Request /auth/me with Bearer token
    headers = {"Authorization": f"Bearer {token}"}
    me_res = await async_client.get("/auth/me", headers=headers)
    assert me_res.status_code == 200

    data = me_res.json()
    assert data["email"] == "customer@example.com"
    assert data["full_name"] == "Priyanshu Sharma"
    assert data["is_admin"] is False


@pytest.mark.asyncio
async def test_get_current_user_profile_missing_token(
    async_client: AsyncClient
):
    """Verify GET /auth/me returns 401 when Authorization header is omitted."""
    response = await async_client.get("/auth/me")
    assert response.status_code == 401

    data = response.json()
    assert data["code"] == "UNAUTHORIZED"


@pytest.mark.asyncio
async def test_get_current_user_profile_invalid_token(
    async_client: AsyncClient
):
    """Verify GET /auth/me returns 401 when token is malformed."""
    headers = {"Authorization": "Bearer malformed_jwt_token_gibberish"}
    response = await async_client.get("/auth/me", headers=headers)
    assert response.status_code == 401

    data = response.json()
    assert data["code"] == "UNAUTHORIZED"
