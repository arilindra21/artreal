import json
from typing import List, Optional

import httpx
from fastapi import APIRouter, Depends, status, HTTPException, Header
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import get_db
from app.core.config import settings, set_current_api_key
from app.schemas import (
    ChatMessage,
    ChatRequest,
    ChatResponse,
    ChatSession,
    ChatSessionCreate,
    ChatSessionWithMessages,
)
from app.services import ChatService

router = APIRouter()


def get_api_key(x_api_key: Optional[str] = Header(None)) -> str:
    """
    Get API key from header or fallback to default from settings.
    User-provided keys take precedence for unlimited usage.
    """
    if x_api_key and x_api_key.startswith("AIza"):
        return x_api_key
    # Fallback to demo key from settings
    return settings.GEMINI_API_KEY or ""


# Prompt improvement models
class PromptImproveRequest(BaseModel):
    prompt: str
    style: Optional[str] = "detailed"
    instruction: Optional[str] = "Improve this prompt"

    model_config = {"extra": "ignore"}  # Pydantic v2 style


class PromptImproveResponse(BaseModel):
    improved_prompt: str
    original_prompt: str


# Gemini Flash for prompt improvement (fast and cheap)
GEMINI_FLASH_MODEL = "gemini-2.0-flash"


@router.get("/prompt/improve/test")
async def test_improve_prompt():
    """Test endpoint to verify route is working"""
    return {"status": "ok", "message": "Improve prompt endpoint is working"}


@router.post("/prompt/improve", response_model=PromptImproveResponse)
async def improve_prompt(request: PromptImproveRequest, api_key: str = Depends(get_api_key)):
    """
    Improve a user prompt using Gemini Flash (fast model)

    This endpoint:
    - Takes a user's prompt and improvement style
    - Sends to Gemini Flash for AI enhancement
    - Returns the improved prompt
    - Supports custom API key via X-API-Key header
    """
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"[PromptImprove] Received request - prompt: {request.prompt[:50]}..., style: {request.style}")

    # Validate prompt is not empty
    if not request.prompt or not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    # Validate API key is available
    if not api_key:
        raise HTTPException(status_code=400, detail="No API key configured. Please set up your Gemini API key.")

    url = f"{settings.GEMINI_API_BASE_URL}chat/completions"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    # Build system prompt based on style
    style_instructions = {
        "detailed": """You are a prompt improvement expert. Your job is to take a user's prompt and make it more detailed and specific.
Add specific requirements like:
- Responsive design (mobile, tablet, desktop)
- Modern UI with smooth animations
- Clean component structure
- Proper TypeScript types
- Tailwind CSS for styling""",

        "technical": """You are a prompt improvement expert. Your job is to add technical specifications and best practices.
Add technical requirements like:
- Use React functional components with hooks
- Implement proper state management
- Add error handling and loading states
- Follow React best practices
- Use TypeScript for type safety""",

        "ui-focused": """You are a prompt improvement expert. Your job is to focus on UI/UX design aspects.
Add UI/UX requirements like:
- Modern, clean design aesthetic
- Consistent color scheme and typography
- Smooth hover/click animations
- Intuitive navigation and layout
- Accessible design (WCAG compliant)""",

        "structured": """You are a prompt improvement expert. Your job is to break down the request into clear sections.
Add structural requirements like:
- Header/Navigation component
- Main content area with sections
- Reusable UI components
- Footer if applicable
- Organized file structure"""
    }

    system_prompt = style_instructions.get(request.style, style_instructions["detailed"])

    payload = {
        "model": GEMINI_FLASH_MODEL,
        "messages": [
            {
                "role": "system",
                "content": f"""{system_prompt}

IMPORTANT: Return ONLY the improved prompt text. Do not include any explanation or commentary.
Keep the original intent but make it more comprehensive and actionable for an AI code generator."""
            },
            {
                "role": "user",
                "content": f"Improve this prompt:\n\n{request.prompt}"
            }
        ],
        "temperature": 0.7,
        "max_tokens": 1000
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload, timeout=30.0)

            if response.status_code != 200:
                raise HTTPException(status_code=500, detail="Failed to improve prompt")

            data = response.json()

            if "choices" in data and len(data["choices"]) > 0:
                improved = data["choices"][0]["message"]["content"].strip()
                return PromptImproveResponse(
                    improved_prompt=improved,
                    original_prompt=request.prompt
                )
            else:
                raise HTTPException(status_code=500, detail="No response from AI")

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Request timed out")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{project_id}/stream")
async def send_chat_message_stream(
    project_id: int,
    chat_request: ChatRequest,
    db: Session = Depends(get_db),
    api_key: str = Depends(get_api_key)
):
    """
    Send a chat message and stream AI response with real-time agent interactions

    This endpoint uses Server-Sent Events (SSE) to stream:
    - Agent thoughts and decisions
    - Tool calls and their arguments
    - Tool execution results
    - Final response with code changes

    Supports custom API key via X-API-Key header for unlimited usage.
    """
    # Set the API key in context for downstream services
    if api_key:
        set_current_api_key(api_key)

    async def event_generator():
        import asyncio
        from datetime import datetime as dt

        last_heartbeat = dt.now()

        try:
            async for event in ChatService.process_chat_message_stream(db, project_id, chat_request):
                # Send keep-alive comment if it's been more than 15 seconds since last event
                now = dt.now()
                if (now - last_heartbeat).total_seconds() > 15:
                    # Send SSE comment to keep connection alive (starts with :)
                    yield ": keep-alive\n\n"
                    last_heartbeat = now

                # Format as SSE event
                yield f"data: {json.dumps(event)}\n\n"

                # Update heartbeat time after sending event
                last_heartbeat = dt.now()

                # Small delay to prevent overwhelming the client
                await asyncio.sleep(0.01)

        except Exception as e:
            # Send error event
            error_event = {"type": "error", "data": {"message": str(e)}}
            yield f"data: {json.dumps(error_event)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        },
    )


@router.post("/{project_id}", response_model=ChatResponse)
async def send_chat_message(project_id: int, chat_request: ChatRequest, db: Session = Depends(get_db)):
    """
    Send a chat message and get AI response (non-streaming, backward compatible)

    This endpoint:
    - Creates a new session if session_id is not provided
    - Saves the user message
    - Generates AI response using AutoGen agents
    - Updates project files based on AI response
    - Returns the assistant's message and code changes
    """
    return await ChatService.process_chat_message(db, project_id, chat_request)


@router.post("/{project_id}/sessions", response_model=ChatSession, status_code=status.HTTP_201_CREATED)
def create_chat_session(project_id: int, session_data: ChatSessionCreate, db: Session = Depends(get_db)):
    """Create a new chat session"""
    return ChatService.create_session(db, session_data)


@router.get("/{project_id}/sessions", response_model=List[ChatSession])
def get_chat_sessions(project_id: int, db: Session = Depends(get_db)):
    """Get all chat sessions for a project"""
    return ChatService.get_sessions(db, project_id)


@router.get("/{project_id}/sessions/{session_id}", response_model=ChatSessionWithMessages)
def get_chat_session(project_id: int, session_id: int, db: Session = Depends(get_db)):
    """Get a specific chat session with all messages"""
    from app.schemas.chat import ChatMessage as ChatMessageSchema

    session = ChatService.get_session(db, session_id, project_id)
    db_messages = ChatService.get_messages(db, session_id)

    # Parse agent_interactions from message_metadata for each message
    messages = [ChatMessageSchema.from_db_message(msg) for msg in db_messages]

    return {
        "id": session.id,
        "project_id": session.project_id,
        "title": session.title,
        "created_at": session.created_at,
        "updated_at": session.updated_at,
        "messages": messages,
    }


@router.get("/{project_id}/sessions/{session_id}/messages", response_model=List[ChatMessage])
def get_session_messages(project_id: int, session_id: int, limit: int = 100, db: Session = Depends(get_db)):
    """Get messages for a chat session"""
    # Verify session belongs to project
    ChatService.get_session(db, session_id, project_id)
    return ChatService.get_messages(db, session_id, limit)


@router.get("/{project_id}/sessions/{session_id}/reconnect")
async def reconnect_to_session(
    project_id: int, session_id: int, since_message_id: int = 0, db: Session = Depends(get_db)
):
    """
    Reconnect to a session and get any new messages since the last known message

    This endpoint helps recover from interrupted streams:
    - Returns messages created after since_message_id
    - Includes partial/ongoing AI responses
    - Allows frontend to catch up after refresh/disconnection
    """
    from app.schemas.chat import ChatMessage as ChatMessageSchema

    # Verify session belongs to project
    session = ChatService.get_session(db, session_id, project_id)

    # Get all messages after the specified message_id
    all_messages = ChatService.get_messages(db, session_id, limit=1000)

    # Filter messages that come after since_message_id
    new_messages = [msg for msg in all_messages if msg.id > since_message_id]

    # Parse agent_interactions from message_metadata
    messages = [ChatMessageSchema.from_db_message(msg) for msg in new_messages]

    return {
        "session_id": session_id,
        "project_id": project_id,
        "new_messages": messages,
        "total_messages": len(all_messages),
        "has_more": len(new_messages) > 0,
    }


@router.delete("/{project_id}/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat_session(project_id: int, session_id: int, db: Session = Depends(get_db)):
    """Delete a chat session"""
    ChatService.delete_session(db, session_id, project_id)
    return None
