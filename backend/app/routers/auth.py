"""FastAPI router for user authentication and identity endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends, Header
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.auth import (
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
)
from app.services.auth_service import (
    AuthService,
    decode_access_token,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=201,
    summary="Register a new customer account",
    responses={
        201: {"description": "Customer account created successfully."},
        400: {"description": "Malformed request or validation error."},
        409: {
            "description": "Conflict: email address already registered.",
            "content": {
                "application/json": {
                    "example": {
                        "error": "Email already registered",
                        "code": "EMAIL_EXISTS",
                        "status": 409,
                        "details": [],
                    }
                }
            },
        },
    },
)
async def register(
    payload: UserRegister,
    db: AsyncSession = Depends(get_db),
):
    """Create a new user account with bcrypt password hashing.

    Args:
        payload: Validated customer registration details.
        db: Database session dependency.

    Returns:
        JSONResponse: 201 Created on success, or 409 Conflict if email exists.
    """
    user = await AuthService.register_user(session=db, payload=payload)
    if user is None:
        return JSONResponse(
            status_code=409,
            content={
                "error": "Email already registered",
                "code": "EMAIL_EXISTS",
                "status": 409,
                "details": [],
            },
        )
    return JSONResponse(
        status_code=201,
        content=user.model_dump(mode="json"),
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate user and issue JWT session token",
    responses={
        200: {"description": "Authentication successful; JWT token issued."},
        401: {
            "description": "Invalid credentials provided.",
            "content": {
                "application/json": {
                    "example": {
                        "error": "Invalid email or password",
                        "code": "INVALID_CREDENTIALS",
                        "status": 401,
                        "details": [],
                    }
                }
            },
        },
    },
)
async def login(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    """Verify user credentials and return a stateless JWT access token.

    Args:
        credentials: Login payload containing email and password.
        db: Database session dependency.

    Returns:
        TokenResponse: Access token and customer profile on success.
        JSONResponse: 401 error payload if credentials do not match.
    """
    auth_result = await AuthService.authenticate_user(
        session=db, credentials=credentials
    )
    if auth_result is None:
        return JSONResponse(
            status_code=401,
            content={
                "error": "Invalid email or password",
                "code": "INVALID_CREDENTIALS",
                "status": 401,
                "details": [],
            },
        )

    user, token = auth_result
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=86400,
        user=user,
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Retrieve current authenticated customer profile",
    responses={
        200: {"description": "Current authenticated user profile."},
        401: {
            "description": "Missing, invalid, or expired session token.",
            "content": {
                "application/json": {
                    "example": {
                        "error": "Invalid or expired session token",
                        "code": "UNAUTHORIZED",
                        "status": 401,
                        "details": [],
                    }
                }
            },
        },
    },
)
async def get_current_user_profile(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve profile data for the active Bearer token session.

    Args:
        authorization: HTTP Authorization header containing Bearer token.
        db: Database session dependency.

    Returns:
        UserResponse: Authenticated customer account details.
        JSONResponse: 401 error payload if session token is missing or invalid.
    """
    if not authorization or not authorization.startswith("Bearer "):
        return JSONResponse(
            status_code=401,
            content={
                "error": "Invalid or expired session token",
                "code": "UNAUTHORIZED",
                "status": 401,
                "details": [],
            },
        )

    token = authorization[7:].strip()
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return JSONResponse(
            status_code=401,
            content={
                "error": "Invalid or expired session token",
                "code": "UNAUTHORIZED",
                "status": 401,
                "details": [],
            },
        )

    try:
        user_id = int(payload["sub"])
    except (ValueError, TypeError):
        return JSONResponse(
            status_code=401,
            content={
                "error": "Invalid or expired session token",
                "code": "UNAUTHORIZED",
                "status": 401,
                "details": [],
            },
        )

    user = await AuthService.get_user_by_id(session=db, user_id=user_id)
    if user is None:
        return JSONResponse(
            status_code=401,
            content={
                "error": "Invalid or expired session token",
                "code": "UNAUTHORIZED",
                "status": 401,
                "details": [],
            },
        )

    return user
