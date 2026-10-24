"""Pydantic schemas for application health check endpoint."""

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Schema for health status and system metadata response."""

    status: str = Field(
        ...,
        description="Overall service status (e.g. ok)",
    )
    app_env: str = Field(
        ...,
        description="Current deployment environment",
    )
    version: str = Field(
        ...,
        description="Application semantic version",
    )
    database: str = Field(
        ...,
        description="Database readiness status (connected or disconnected)",
    )
