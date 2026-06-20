from uuid import uuid4

from google.adk.memory import InMemoryMemoryService
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from app.agents.saferoute_agent import root_agent

APP_NAME = "saferoute_ai"

session_service = InMemorySessionService()
memory_service = InMemoryMemoryService()
runner = Runner(
    app_name=APP_NAME,
    agent=root_agent,
    session_service=session_service,
    memory_service=memory_service,
)


async def run_agent(
    message: str,
    user_id: str,
    session_id: str | None = None,
) -> tuple[str, str]:
    """Run one ADK reasoning loop and persist the resulting conversation."""
    active_session_id = session_id or str(uuid4())
    session = await session_service.get_session(
        app_name=APP_NAME,
        user_id=user_id,
        session_id=active_session_id,
    )
    if session is None:
        await session_service.create_session(
            app_name=APP_NAME,
            user_id=user_id,
            session_id=active_session_id,
        )

    content = types.Content(role="user", parts=[types.Part(text=message)])
    answer_parts: list[str] = []
    async for event in runner.run_async(
        user_id=user_id,
        session_id=active_session_id,
        new_message=content,
    ):
        if event.is_final_response() and event.content and event.content.parts:
            answer_parts.extend(
                part.text for part in event.content.parts if part.text is not None
            )

    completed_session = await session_service.get_session(
        app_name=APP_NAME,
        user_id=user_id,
        session_id=active_session_id,
    )
    if completed_session is not None:
        await memory_service.add_session_to_memory(completed_session)

    answer = "".join(answer_parts).strip()
    if not answer:
        raise RuntimeError("The SafeRoute agent returned no response")
    return answer, active_session_id
