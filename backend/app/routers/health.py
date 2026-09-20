import requests
from fastapi import APIRouter
from app.config import settings

router = APIRouter(prefix="/api/health", tags=["Health"])


@router.get("")
def health_check():
    ollama_status = "unreachable"
    try:
        resp = requests.get(f"{settings.OLLAMA_BASE_URL}/api/tags", timeout=3)
        if resp.status_code == 200:
            models_available = [m["name"] for m in resp.json().get("models", [])]
            ollama_status = "connected" if models_available else "connected (no models pulled)"
    except Exception:
        pass

    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "environment": settings.ENV,
        "ollama": ollama_status,
        "model": settings.OLLAMA_MODEL,
    }
