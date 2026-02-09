import logging
import os
import sys
import io
import traceback

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Configure basic logging FIRST before any imports that might fail
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
    force=True,
)
logger = logging.getLogger(__name__)

logger.info("🚀 Starting ArtReal Backend...")
logger.info(f"📍 Working directory: {os.getcwd()}")
logger.info(f"📍 PORT env: {os.environ.get('PORT', 'not set')}")

# Set UTF-8 encoding for Windows console (for child processes)
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', line_buffering=True, errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', line_buffering=True, errors='replace')

# Import settings first (lightweight)
try:
    from app.core.config import settings
    logger.info(f"✅ Settings loaded (DEBUG={settings.DEBUG})")
except Exception as e:
    logger.error(f"❌ Failed to load settings: {e}")
    logger.error(traceback.format_exc())
    raise

# Create FastAPI app EARLY - before heavy imports
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    redirect_slashes=False,
)

# Configure CORS - Allow all origins for Cloud Run + Vercel deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Root endpoint - available immediately
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to ArtReal API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }

# Health check - available immediately
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

logger.info("✅ Basic FastAPI app created, now importing API modules...")

# Now import heavier modules
try:
    from app.db import init_db
    logger.info("✅ Database module imported")
except Exception as e:
    logger.error(f"❌ Failed to import database module: {e}")
    logger.error(traceback.format_exc())
    raise

try:
    from app.api import api_router
    logger.info("✅ API router imported")
except Exception as e:
    logger.error(f"❌ Failed to import API router: {e}")
    logger.error(traceback.format_exc())
    raise

# Include API routes
app.include_router(api_router, prefix=settings.API_V1_PREFIX)
logger.info(f"✅ API routes included at {settings.API_V1_PREFIX}")

# Set specific loggers
logging.getLogger("app.services.chat_service").setLevel(logging.DEBUG)
logging.getLogger("app.agents").setLevel(logging.DEBUG)
logging.getLogger("autogen").setLevel(logging.INFO)

# Events
@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    try:
        logger.info("📦 Initializing database...")
        init_db()
        logger.info("✅ Database initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize database: {e}")
        logger.error(traceback.format_exc())
        # Don't raise - let the app start anyway

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    try:
        from app.agents import shutdown_orchestrators
        await shutdown_orchestrators()
    except Exception as e:
        logger.error(f"❌ Error during shutdown: {e}")

logger.info("✅ FastAPI app ready to serve requests")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )
