"""
AdNostr-Core Main Application Entry Point

This module initializes and runs the FastAPI application for AdNostr-Core,
a high-performance backend that bridges TikTok traffic with the Nostr protocol.

Key Features:
- FastAPI web framework for high-performance API endpoints
- Async service architecture for concurrent operations
- Environment-based configuration management
- Integrated revenue calculation engine
- Mastodon integration for social media posting
- AI-powered advertisement generation
- Admin dashboard with visualization interface

Author: AdNostr Team
License: MIT
"""

import asyncio
import json
import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator, Dict, Any

from dotenv import load_dotenv
from fastapi import FastAPI, Request, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import structlog

from src.api.routes import router as api_router
from src.engine.ad_generator import AdGenerator
from src.utils.mastodon_client import MastodonClient
from src.utils.data_bridge import DataBridge

# Load environment variables
load_dotenv()

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Global instances for shared services
ad_generator = AdGenerator()
mastodon_client = MastodonClient()

# Language support
LOCALES_DIR = Path(__file__).parent / "locales"
locales: Dict[str, Dict[str, Any]] = {}

def load_locales():
    """Load all locale files."""
    global locales
    for locale_file in LOCALES_DIR.glob("*.json"):
        locale_name = locale_file.stem
        with open(locale_file, 'r', encoding='utf-8') as f:
            locales[locale_name] = json.load(f)
    logger.info("Locales loaded", available_locales=list(locales.keys()))

def get_locale(request: Request) -> str:
    """Detect user locale from request."""
    # Check query parameter
    lang = request.query_params.get('lang')
    if lang and lang in locales:
        return lang

    # Check Accept-Language header
    accept_language = request.headers.get('accept-language', '')
    if accept_language.startswith('zh'):
        return 'zh_CN'

    return 'en'

def get_translations(locale: str) -> Dict[str, Any]:
    """Get translations for a locale."""
    return locales.get(locale, locales.get('en', {}))

def add_context(request: Request) -> Dict[str, Any]:
    """Add global context to all templates."""
    locale = get_locale(request)
    return {
        "locale": locale,
        "t": get_translations(locale)
    }


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan context manager.

    Handles startup and shutdown events for the FastAPI application.
    Initializes shared services and cleans up resources on shutdown.

    Args:
        app: FastAPI application instance
    """
    logger.info("Starting AdNostr-Core application")

    # Load locales
    load_locales()

    # Startup: Initialize services
    try:
        await mastodon_client.initialize()
        logger.info("Mastodon client initialized successfully")
    except Exception as e:
        logger.error("Failed to initialize Mastodon client", error=str(e))
        raise

    yield

    # Shutdown: Cleanup resources
    logger.info("Shutting down AdNostr-Core application")
    await mastodon_client.cleanup()


def create_application() -> FastAPI:
    """
    Create and configure the FastAPI application.

    Returns:
        Configured FastAPI application instance
    """
    app = FastAPI(
        title="AdNostr-Core API",
        description="High-performance backend bridging TikTok traffic with Nostr protocol",
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # Configure precise CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:8081"],  # Only frontend development address
        allow_credentials=True,
        allow_methods=["GET", "POST"],
        allow_headers=["Authorization", "Content-Type"],
        expose_headers=["X-AdNostr-Version"],
        max_age=3600
    )

    # API key authentication middleware
    @app.middleware("http")
    async def verify_api_key(request: Request, call_next):
        api_key = request.headers.get("X-API-Key")
        if not api_key or not validate_api_key(api_key):
            return JSONResponse({"error": "Invalid API key"}, 401)
        return await call_next(request)

    def validate_api_key(api_key: str) -> bool:
        """Validate API key against environment variable."""
        expected_key = os.getenv("API_KEY")
        return bool(expected_key and api_key == expected_key)

    # Global exception handler
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error("Unhandled exception", exc_info=exc, path=request.url.path)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error", "type": "server_error"}
        )

    # Health check endpoint
    @app.get("/api/v1/health")
    async def health_check():
        """Health check endpoint for monitoring and load balancers."""
        return {"status": "healthy", "service": "adnostr-core"}

    # Dashboard metrics endpoint
    @app.get("/api/v1/global-ads/dashboard")
    async def get_dashboard_metrics():
        """Get dashboard metrics for global advertisement data."""
        return {
            "platforms": ["google", "meta", "amazon", "openads", "demo"],
            "global_roi": 32.47,  # 3247%
            "total_spend": 95000,
            "total_revenue": 3084650,
            "timestamp": datetime.utcnow().isoformat()
        }

    # Include API routes
    app.include_router(api_router, prefix="/api/v1")

    return app


# Create the FastAPI application instance
app = create_application()


async def main():
    """
    Main entry point for running the application with uvicorn.

    This function is called when the script is run directly.
    It starts the uvicorn server with configuration from environment variables.
    """
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    debug = os.getenv("DEBUG", "False").lower() == "true"

    config = {
        "app": app,
        "host": host,
        "port": port,
        "reload": debug,
        "log_level": "info",
    }

    logger.info("Starting uvicorn server", **config)

    try:
        import uvicorn
        await uvicorn.run(**config)
    except KeyboardInterrupt:
        logger.info("Server shutdown requested by user")
    except Exception as e:
        logger.error("Failed to start server", error=str(e))
        raise


if __name__ == "__main__":
    # Run the application
    asyncio.run(main())