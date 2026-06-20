import asyncio
import sqlite3
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parents[1] / "backend"))

from app.agents.saferoute_agent import assess_route_risk, find_nearest_blackspot
from app.api.agent import AgentChatRequest, agent_chat


def test_assess_route_risk_returns_structured_guidance():
    result = assess_route_risk(82.4, distance_km=12.5, estimated_time_min=28)

    assert result["risk_level"] == "high"
    assert result["risk_score"] == 82.4
    assert "Check an alternate route" in result["precautions"]


def test_find_nearest_blackspot_uses_local_database(tmp_path, monkeypatch):
    db_path = tmp_path / "saferoute.db"
    with sqlite3.connect(db_path) as connection:
        connection.execute(
            "CREATE TABLE blackspots ("
            "id INTEGER, name TEXT, latitude REAL, longitude REAL, "
            "risk_score INTEGER, accident_count INTEGER)"
        )
        connection.executemany(
            "INSERT INTO blackspots VALUES (?, ?, ?, ?, ?, ?)",
            [
                (1, "Near Junction", 17.400, 78.490, 80, 12),
                (2, "Far Junction", 18.000, 79.000, 65, 7),
            ],
        )
    monkeypatch.setenv("SQLITE_DB_PATH", str(db_path))

    result = find_nearest_blackspot(17.401, 78.491)

    assert result["status"] == "ok"
    assert result["name"] == "Near Junction"
    assert result["distance_km"] < 1


def test_agent_chat_endpoint_returns_session(monkeypatch):
    async def fake_run_agent(message, user_id, session_id=None):
        assert message == "Assess risk score 75"
        assert user_id == "demo-user"
        return "This route has high risk.", session_id or "new-session"

    monkeypatch.setattr("app.api.agent.run_agent", fake_run_agent)
    response = asyncio.run(
        agent_chat(
            AgentChatRequest(
                message="Assess risk score 75",
                user_id="demo-user",
            )
        )
    )

    assert response.model_dump() == {
        "answer": "This route has high risk.",
        "session_id": "new-session",
        "agent": "saferoute_agent",
    }


@pytest.mark.parametrize("score, level", [(-10, "low"), (120, "high")])
def test_assess_route_risk_clamps_out_of_range_scores(score, level):
    result = assess_route_risk(score)

    assert result["risk_level"] == level
    assert 0 <= result["risk_score"] <= 100
