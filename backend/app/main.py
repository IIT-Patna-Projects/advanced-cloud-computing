"""FastAPI application entrypoint for ShopScale backend service."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers.health import router as health_router

settings = get_settings()

app = FastAPI(
    title="ShopScale API",
    description=(
        "Decoupled e-commerce backend built to study cloud auto-scaling, "
        "containerization, and resilience patterns on AWS."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Enable CORS for development environments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.debug else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
