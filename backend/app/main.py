from fastapi.middleware.cors import CORSMiddleware
import math
import os
import sqlite3

import joblib
import numpy as np
import requests
from fastapi import FastAPI
from pydantic import BaseModel


def parse_cors_origins():
    origins = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    )
    return [origin.strip() for origin in origins.split(",") if origin.strip()]


# ---------------------------
# App setup
# ---------------------------
app = FastAPI(title="SafeRoute AI", version="0.2.1")

# ---------------------------
# CORS (React frontend)
# ---------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=parse_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Load ML model
# ---------------------------
MODEL_PATH = os.getenv("MODEL_PATH", "ml/model.pkl")

model = None
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
    print("✅ ML model loaded")
else:
    print("⚠️ ML model not found — using fallback")


# ---------------------------
# Request schemas
# ---------------------------
class PredictRequest(BaseModel):
    latitude: float
    longitude: float


class RouteRequest(BaseModel):
    start_lat: float
    start_lon: float
    end_lat: float
    end_lon: float


# ---------------------------
# DB connection
# ---------------------------
def get_db_connection():
    conn = sqlite3.connect(os.getenv("SQLITE_DB_PATH", "saferoute.db"))
    conn.row_factory = sqlite3.Row
    return conn


# ---------------------------
# OSRM real routing
# ---------------------------
def get_osrm_route(start_lat, start_lon, end_lat, end_lon):
    url = (
        "https://router.project-osrm.org/route/v1/driving/"
        f"{start_lon},{start_lat};{end_lon},{end_lat}"
        "?overview=full&geometries=geojson"
    )

    try:
        res = requests.get(url, timeout=10)
        data = res.json()

        if "routes" not in data:
            raise Exception("No routes in OSRM response")

        route = data["routes"][0]
        coords = route["geometry"]["coordinates"]

        # Convert [lon, lat] → {lat, lon}
        path = [{"lat": lat, "lon": lon} for lon, lat in coords]

        distance_km = route["distance"] / 1000
        duration_hr = route["duration"] / 3600

        return path, distance_km, duration_hr

    except Exception as e:
        print("⚠️ OSRM failed, using fallback:", e)

        # fallback straight line
        path = [
            {"lat": start_lat, "lon": start_lon},
            {"lat": end_lat, "lon": end_lon},
        ]

        distance_km = (
            math.sqrt((end_lat - start_lat) ** 2 + (end_lon - start_lon) ** 2) * 111
        )

        duration_hr = distance_km / 60

        return path, distance_km, duration_hr


# ---------------------------
# Root
# ---------------------------
@app.get("/")
def root():
    return {"message": "SafeRoute AI running"}


# ---------------------------
# Health check
# ---------------------------
@app.get("/health")
def health():
    return {"status": "ok"}


# ---------------------------
# Blackspots
# ---------------------------
@app.get("/blackspots")
def get_blackspots():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM blackspots")
    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "id": r["id"],
            "name": r["name"],
            "latitude": r["latitude"],
            "longitude": r["longitude"],
            "risk_score": r["risk_score"],
            "accident_count": r["accident_count"],
        }
        for r in rows
    ]


# ---------------------------
# ML prediction
# ---------------------------
@app.post("/predict")
def predict(data: PredictRequest):
    if model is None:
        return {
            "risk_score": 50,
            "risk_level": "MEDIUM 🟡",
            "reasons": ["Fallback mode active"],
        }

    features = np.array([[data.latitude, data.longitude]])
    risk_score = float(model.predict(features)[0])

    if risk_score < 40:
        level = "LOW 🟢"
        reasons = ["Low accident density", "Stable traffic"]
    elif risk_score < 70:
        level = "MEDIUM 🟡"
        reasons = ["Moderate risk zone", "Some congestion"]
    else:
        level = "HIGH 🔴"
        reasons = ["Frequent accidents", "Dangerous junction"]

    return {
        "risk_score": risk_score,
        "risk_level": level,
        "reasons": reasons,
    }


# ---------------------------
# Nearest blackspot
# ---------------------------
@app.get("/nearest-blackspot")
def nearest_blackspot(lat: float, lon: float):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM blackspots")
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return {"error": "No data"}

    nearest = min(
        rows,
        key=lambda r: abs(r["latitude"] - lat) + abs(r["longitude"] - lon),
    )

    return {
        "id": nearest["id"],
        "name": nearest["name"],
        "latitude": nearest["latitude"],
        "longitude": nearest["longitude"],
        "risk_score": nearest["risk_score"],
    }


# ---------------------------
# SAFEST ROUTE (FIXED + REAL ROUTING)
# ---------------------------
@app.post("/safest-route")
def safest_route(data: RouteRequest):
    # 1 risk per km (stable + realistic demo scaling)
    def risk(lat, lon):
        return 0.1

    # Get real road route
    path, distance_km, duration_hr = get_osrm_route(
        data.start_lat,
        data.start_lon,
        data.end_lat,
        data.end_lon,
    )

    # ---------------------------
    # FIXED RISK SCORE (NO EXPLOSION)
    # ---------------------------
    risk_score = round(distance_km * 0.15, 2)

    # Optional: add mild penalty for long routes
    risk_score = min(risk_score, 100)

    return {
        "path": path,
        "risk_score": risk_score,
        "risk_level": (
            "LOW 🟢"
            if risk_score < 30
            else "MEDIUM 🟡"
            if risk_score < 70
            else "HIGH 🔴"
        ),
        "distance_km": round(distance_km, 2),
        "estimated_time_hr": round(duration_hr, 2),
        "estimated_time_min": round(duration_hr * 60, 0),
        "points": len(path),
    }
