"""Pydantic schemas for authentication and user accounts."""

from datetime import datetime
import re
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class UserRegister(BaseModel):
    """Payload schema for new user registration."""

    email: str = Field(
        ...,
        description="Valid customer email address",
        examples=["customer@example.com"],
    )
    password: str = Field(
        ...,
        min_length=8,
        description="Account password with at least 8 characters",
        examples=["SecurePassword123"],
    )
    full_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Full customer name",
        examples=["Priyanshu Sharma"],
    )

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, value: str) -> str:
        """Validate and normalize email address format."""
        email_clean = value.strip().lower()
        pattern = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
        if not re.match(pattern, email_clean):
            raise ValueError("Invalid email format")
        return email_clean

    @field_validator("password")
    @classmethod
    def validate_password_length(cls, value: str) -> str:
        """Enforce minimum 8 character password constraint."""
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return value


class UserLogin(BaseModel):
    """Payload schema for user authentication."""

    email: str = Field(
        ...,
        description="Registered customer email address",
        examples=["customer@example.com"],
    )
    password: str = Field(
        ...,
        description="Plain text account password",
        examples=["SecurePassword123"],
    )

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        """Normalize email address to lowercase."""
        return value.strip().lower()


class UserResponse(BaseModel):
    """Response schema representing a registered user account."""

    id: int = Field(..., description="Unique user identifier")
    email: str = Field(..., description="Customer email address")
    full_name: str = Field(..., description="Full customer name")
    is_admin: bool = Field(
        default=False, description="Administrator privilege status"
    )
    created_at: Optional[datetime] = Field(
        default=None, description="Account creation timestamp"
    )

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """Response schema containing JWT access token and user profile."""

    access_token: str = Field(
        ..., description="Stateless JWT bearer authentication token"
    )
    token_type: str = Field(
        default="bearer", description="Token authentication scheme"
    )
    expires_in: int = Field(
        default=86400, description="Token validity period in seconds"
    )
    user: UserResponse = Field(
        ..., description="Authenticated user account details"
    )
