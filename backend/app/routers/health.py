import requests
from fastapi import APIRouter
from app.config import settings

router = APIRouter(prefix="/api/health", tags=["Health"])


@router.get("")
def health_check():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "environment": settings.ENV,
        "ai_provider": "OpenAI",
        "model": settings.OPENAI_MODEL,
    }
