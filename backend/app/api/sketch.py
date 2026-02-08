import logging
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

# Use Gemini Flash for fast and cheap element detail generation
GEMINI_FLASH_MODEL = "gemini-2.0-flash"


class ElementDetailsRequest(BaseModel):
    element_type: str
    element_label: str
    user_prompt: str
    existing_details: Optional[str] = ""

    model_config = {"extra": "ignore"}


class ElementDetailsResponse(BaseModel):
    details: str
    element_type: str
    element_label: str


@router.post("/element/details", response_model=ElementDetailsResponse)
async def generate_element_details(request: ElementDetailsRequest):
    """
    Generate AI-powered details for a sketch element.

    This endpoint uses Gemini Flash to generate rich descriptions
    for sketch elements based on user prompts and element context.
    """
    logger.info(f"[SketchElement] Generating details for {request.element_type}: {request.element_label}")

    if not request.user_prompt.strip():
        raise HTTPException(status_code=400, detail="User prompt cannot be empty")

    url = f"{settings.GEMINI_API_BASE_URL}chat/completions"

    headers = {
        "Authorization": f"Bearer {settings.GEMINI_API_KEY}",
        "Content-Type": "application/json",
    }

    # Build context-aware system prompt
    system_prompt = f"""You are an expert UI/UX designer helping to describe UI elements for code generation.

The user is designing a sketch/wireframe and wants to add detailed specifications for a specific element.

Element Type: {request.element_type}
Element Label: {request.element_label}
{f'Current Details: {request.existing_details}' if request.existing_details else ''}

Your task is to generate a clear, concise description of this UI element that can be used by an AI code generator.

Guidelines:
- Be specific about visual appearance (colors, sizes, spacing)
- Mention interactive behaviors (hover effects, animations, click actions)
- Include content structure (what text, icons, or images should be included)
- Consider accessibility and responsiveness
- Keep the description focused and actionable (2-4 sentences)
- Use modern UI/UX terminology

IMPORTANT: Return ONLY the element description. No explanations, no markdown, no bullet points unless specifically requested."""

    payload = {
        "model": GEMINI_FLASH_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Generate details for this element based on: {request.user_prompt}"}
        ],
        "temperature": 0.7,
        "max_tokens": 500
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload, timeout=30.0)

            logger.info(f"[SketchElement] API response status: {response.status_code}")

            if response.status_code != 200:
                error_text = response.text
                logger.error(f"[SketchElement] API error: {error_text}")
                raise HTTPException(status_code=500, detail="Failed to generate element details")

            data = response.json()

            if "choices" in data and len(data["choices"]) > 0:
                details = data["choices"][0]["message"]["content"].strip()
                return ElementDetailsResponse(
                    details=details,
                    element_type=request.element_type,
                    element_label=request.element_label
                )
            else:
                raise HTTPException(status_code=500, detail="No response from AI")

    except httpx.TimeoutException:
        logger.error("[SketchElement] Request timed out")
        raise HTTPException(status_code=504, detail="Request timed out")
    except Exception as e:
        logger.error(f"[SketchElement] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
