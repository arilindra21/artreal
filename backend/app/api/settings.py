"""
Settings API endpoints for managing application configuration.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import os
import logging

from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


# Available Gemini models
AVAILABLE_MODELS = [
    # Gemini 3 Series (Latest)
    {
        "id": "gemini-3-pro-preview",
        "name": "Gemini 3 Pro",
        "description": "Most intelligent model for complex agentic workflows and coding",
        "context_window": "1M tokens",
        "category": "latest",
    },
    {
        "id": "gemini-3-flash-preview",
        "name": "Gemini 3 Flash",
        "description": "Fast multimodal understanding with strong coding capabilities",
        "context_window": "1M tokens",
        "category": "latest",
    },
    # Gemini 2.5 Series (Stable)
    {
        "id": "gemini-2.5-pro",
        "name": "Gemini 2.5 Pro",
        "description": "High-capability model for complex reasoning and coding",
        "context_window": "1M tokens",
        "category": "stable",
    },
    {
        "id": "gemini-2.5-flash",
        "name": "Gemini 2.5 Flash",
        "description": "Balance of intelligence and speed with controllable thinking",
        "context_window": "1M tokens",
        "category": "stable",
    },
    {
        "id": "gemini-2.5-flash-lite",
        "name": "Gemini 2.5 Flash Lite",
        "description": "Cost-effective for high-throughput tasks",
        "context_window": "1M tokens",
        "category": "stable",
    },
    # Gemini 2.0 Series (Legacy)
    {
        "id": "gemini-2.0-flash",
        "name": "Gemini 2.0 Flash",
        "description": "General-purpose multimodal model (deprecated March 2026)",
        "context_window": "1M tokens",
        "category": "legacy",
    },
]

# In-memory storage for current model (in production, use database or config file)
_current_model = os.getenv("GEMINI_MODEL", "gemini-3-flash-preview")


class ModelUpdateRequest(BaseModel):
    model: str


class ModelResponse(BaseModel):
    model: str


class ModelsListResponse(BaseModel):
    models: list
    current: str


@router.get("/model", response_model=ModelResponse)
async def get_current_model():
    """Get the currently selected AI model."""
    global _current_model
    return {"model": _current_model}


@router.post("/model", response_model=ModelResponse)
async def set_model(request: ModelUpdateRequest):
    """Set the AI model to use for code generation."""
    global _current_model

    # Validate model exists in available models
    model_ids = [m["id"] for m in AVAILABLE_MODELS]
    if request.model not in model_ids:
        # Allow any model ID (for future compatibility)
        pass

    old_model = _current_model
    _current_model = request.model

    # Also update the settings object (for agents to use)
    settings.GEMINI_MODEL = request.model

    # Clear orchestrator cache so new model is used on next request
    if old_model != request.model:
        try:
            from app.agents import shutdown_orchestrators
            import asyncio
            # Run shutdown in background to not block the response
            asyncio.create_task(shutdown_orchestrators())
            logger.info(f"Model changed from {old_model} to {request.model}, orchestrators will be recreated")
        except Exception as e:
            logger.warning(f"Failed to clear orchestrators: {e}")

    return {"model": _current_model}


@router.get("/models", response_model=ModelsListResponse)
async def list_models():
    """List all available AI models."""
    global _current_model
    return {
        "models": AVAILABLE_MODELS,
        "current": _current_model,
    }


def get_current_model() -> str:
    """Helper function to get current model from other modules."""
    global _current_model
    return _current_model
