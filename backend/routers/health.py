"""Health and readiness endpoints."""

from fastapi import APIRouter

from backend.config import APP_NAME, APP_VERSION

router = APIRouter(tags=["health"])


@router.get("/api/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "app": APP_NAME,
        "version": APP_VERSION,
    }
