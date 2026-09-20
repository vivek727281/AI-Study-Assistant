import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.database import Base, engine
from app.routers import auth, upload, summary, qa, quiz, flashcards, history, download, health

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("study_assistant")

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered Study Assistant API - Summaries, Q&A, Quizzes, Flashcards using local Llama 3.2",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Global Exception Handlers ----------
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "detail": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"success": False, "detail": "Validation error", "errors": exc.errors()},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"success": False, "detail": "Internal server error. Please try again later."},
    )


# ---------- Routers ----------
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(summary.router)
app.include_router(qa.router)
app.include_router(quiz.router)
app.include_router(flashcards.router)
app.include_router(history.router)
app.include_router(download.router)


@app.get("/")
def root():
    return {
        "message": f"{settings.APP_NAME} API is running",
        "docs": "/docs",
        "health": "/api/health",
    }
