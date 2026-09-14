from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import AppException
from app.db.base import Base
from app.db.session import engine

# Setup structured logging
logging.basicConfig(
    level=logging.INFO,
    format='{"time": "%(asctime)s", "level": "%(levelname)s", "name": "%(name)s", "message": "%(message)s"}'
)
logger = logging.getLogger("sicp")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown hooks."""
    logger.info("Starting up SICP Backend...")
    # Initialize tables for development
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database schema initialized.")
    yield
    logger.info("Shutting down SICP Backend...")
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Configuration
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# Standard SICP Error Handlers
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    """Standardized handler for custom application exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details
            }
        },
        headers=exc.headers
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Standardized handler for FastAPI / Pydantic validation errors."""
    errors = []
    for err in exc.errors():
        field = ".".join(str(loc) for loc in err["loc"] if loc not in ("body",))
        errors.append({"field": field or "body", "message": err["msg"]})

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "The submitted payload failed validation",
                "details": {"validation_errors": errors}
            }
        }
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Catch-all handler for unexpected internal exceptions."""
    logger.error(f"Unhandled exception on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "SERVER_ERROR",
                "message": "An internal server error occurred",
                "details": {}
            }
        }
    )


# Health Check
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for container orchestrators."""
    return {"status": "healthy", "service": "sicp-backend", "version": settings.VERSION}


# Include V1 Routers
app.include_router(api_router, prefix=settings.API_V1_STR)
