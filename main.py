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
import logging
import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import structlog

from src.api.routes import router as api_router
from src.engine.ad_generator import AdGenerator
from src.utils.mastodon_client import MastodonClient

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

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "https://demo.adnostr.org",
            "http://localhost:3000",  # Development
            "http://localhost:5173",  # Vite dev server
        ],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

    # Mount static files
    app.mount("/static", StaticFiles(directory="static"), name="static")

    # Configure Jinja2 templates
    templates = Jinja2Templates(directory="templates")

    # Global exception handler
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error("Unhandled exception", exc_info=exc, path=request.url.path)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error", "type": "server_error"}
        )

    # Health check endpoint
    @app.get("/health")
    async def health_check():
        """Health check endpoint for monitoring and load balancers."""
        return {"status": "healthy", "service": "adnostr-core"}

    # Admin dashboard endpoint
    @app.get("/", response_class=HTMLResponse)
    async def admin_dashboard(request: Request):
        """Serve the admin dashboard with Matrix-style UI."""
        return templates.TemplateResponse("dashboard.html", {"request": request})

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