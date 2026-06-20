import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.agents.runtime import run_agent

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai/agent", tags=["agent"])


class AgentChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    user_id: str = Field(default="anonymous", min_length=1, max_length=128)
    session_id: str | None = Field(default=None, min_length=1, max_length=128)


class AgentChatResponse(BaseModel):
    answer: str
    session_id: str
    agent: str = "saferoute_agent"


@router.post("/chat", response_model=AgentChatResponse)
async def agent_chat(data: AgentChatRequest):
    try:
        answer, session_id = await run_agent(
            message=data.message,
            user_id=data.user_id,
            session_id=data.session_id,
        )
    except Exception as exc:
        logger.exception("SafeRoute ADK agent failed")
        raise HTTPException(
            status_code=503,
            detail="SafeRoute agent is unavailable. Check the ADK model credentials.",
        ) from exc

    return AgentChatResponse(answer=answer, session_id=session_id)
