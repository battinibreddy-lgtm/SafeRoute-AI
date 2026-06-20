import math
import os
import sqlite3
from pathlib import Path

from google.adk.agents import Agent
from google.adk.tools.preload_memory_tool import PreloadMemoryTool


def assess_route_risk(
    risk_score: float,
    distance_km: float | None = None,
    estimated_time_min: float | None = None,
) -> dict:
    """Classify a SafeRoute ML risk score and return actionable route guidance.

    Args:
        risk_score: Route risk score from 0 (lowest risk) to 100 (highest risk).
        distance_km: Optional route distance in kilometres.
        estimated_time_min: Optional estimated journey time in minutes.

    Returns:
        A structured risk assessment with its level and safety precautions.
    """
    score = min(max(float(risk_score), 0.0), 100.0)
    if score < 30:
        level = "low"
        precautions = ["Stay alert near junctions", "Monitor changing traffic"]
    elif score < 70:
        level = "medium"
        precautions = ["Reduce speed near junctions", "Avoid distractions"]
    else:
        level = "high"
        precautions = [
            "Check an alternate route",
            "Travel during lower-traffic hours when possible",
        ]

    return {
        "risk_score": round(score, 2),
        "risk_level": level,
        "distance_km": distance_km,
        "estimated_time_min": estimated_time_min,
        "precautions": precautions,
    }


def find_nearest_blackspot(latitude: float, longitude: float) -> dict:
    """Find the accident blackspot nearest to a geographic coordinate.

    Args:
        latitude: Latitude in decimal degrees.
        longitude: Longitude in decimal degrees.

    Returns:
        The nearest known blackspot and approximate distance, or an unavailable
        status when the local database has no blackspot data.
    """
    db_path = Path(os.getenv("SQLITE_DB_PATH", "saferoute.db"))
    if not db_path.exists():
        return {"status": "unavailable", "reason": "Blackspot database not found"}

    try:
        with sqlite3.connect(db_path) as connection:
            connection.row_factory = sqlite3.Row
            rows = connection.execute(
                "SELECT id, name, latitude, longitude, risk_score, accident_count "
                "FROM blackspots"
            ).fetchall()
    except sqlite3.Error:
        return {"status": "unavailable", "reason": "Blackspot data unavailable"}

    if not rows:
        return {"status": "unavailable", "reason": "No blackspots recorded"}

    def distance_km(row: sqlite3.Row) -> float:
        lat_km = (row["latitude"] - latitude) * 111.0
        lon_scale = math.cos(math.radians(latitude))
        lon_km = (row["longitude"] - longitude) * 111.0 * lon_scale
        return math.hypot(lat_km, lon_km)

    nearest = min(rows, key=distance_km)
    return {
        "status": "ok",
        "id": nearest["id"],
        "name": nearest["name"],
        "latitude": nearest["latitude"],
        "longitude": nearest["longitude"],
        "risk_score": nearest["risk_score"],
        "accident_count": nearest["accident_count"],
        "distance_km": round(distance_km(nearest), 2),
    }


root_agent = Agent(
    name="saferoute_agent",
    model=os.getenv("ADK_MODEL", "gemini-2.5-flash"),
    description="An agent for route risk analysis and practical road safety advice.",
    instruction="""
You are SafeRoute AI, a road-safety assistant. Help users understand route risk
without overstating certainty. Use assess_route_risk whenever a risk score is
provided. Use find_nearest_blackspot when the user supplies coordinates and asks
about nearby danger areas. Use recalled conversation context only for the same
user. Keep answers concise, explain that scores are decision support rather than
a guarantee of safety, and never invent live road, traffic, or blackspot data.
Respond in the language requested by the user.
""",
    tools=[PreloadMemoryTool(), assess_route_risk, find_nearest_blackspot],
)
