from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import numpy as np
import joblib
import os
import math

# ---------------------------
# App setup
# ---------------------------
app = FastAPI(title="SafeRoute AI", version="0.1.0")

# ---------------------------
# CORS (React frontend)
# ---------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Load ML model (XGBoost)
# ---------------------------
MODEL_PATH = "ml/model.pkl"

model = None
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
    print("✅ Model loaded successfully")
else:
    print("⚠️ Model not found, using fallback logic")


# ---------------------------
# Request schema
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
# DB helper
# ---------------------------
def get_db_connection():
    conn = sqlite3.connect("saferoute.db")
    conn.row_factory = sqlite3.Row
    return conn


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
# Blackspots API
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
            "id": row["id"],
            "name": row["name"],
            "latitude": row["latitude"],
            "longitude": row["longitude"],
            "risk_score": row["risk_score"],
            "accident_count": row["accident_count"],
        }
        for row in rows
    ]


# ---------------------------
# ML Prediction endpoint
# ---------------------------
@app.post("/predict")
def predict(data: PredictRequest):
    global model

    if model is None:
        raise RuntimeError("ML model is not loaded")

    lat = data.latitude
    lon = data.longitude

    features = np.array([[lat, lon]])
    risk_score = float(model.predict(features)[0])

    if risk_score < 40:
        level = "LOW 🟢"
        reasons = [
            "Low accident density nearby",
            "Stable road conditions",
            "Normal traffic flow",
        ]
    elif risk_score < 70:
        level = "MEDIUM 🟡"
        reasons = [
            "Moderate accident history",
            "Occasional congestion",
            "Some risky intersections nearby",
        ]
    else:
        level = "HIGH 🔴"
        reasons = [
            "Frequent accidents recorded",
            "High traffic density zone",
            "Dangerous road geometry or junction",
        ]

    return {
        "risk_score": risk_score,
        "risk_level": level,
        "reasons": reasons,
        "latitude": lat,
        "longitude": lon,
    }


# ---------------------------
# Nearest blackspot (optional)
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
        key=lambda row: abs(row["latitude"] - lat) + abs(row["longitude"] - lon),
    )

    return {
        "id": nearest["id"],
        "name": nearest["name"],
        "latitude": nearest["latitude"],
        "longitude": nearest["longitude"],
        "risk_score": nearest["risk_score"],
        "accident_count": nearest["accident_count"],
    }


# ---------------------------
# SAFEST ROUTE (UPDATED)
# ---------------------------
@app.post("/safest-route")
def safest_route(data: RouteRequest):
    def risk(lat, lon):
        return 1

    # Simple MVP route
    path = [
        {"lat": data.start_lat, "lon": data.start_lon},
        {
            "lat": (data.start_lat + data.end_lat) / 2,
            "lon": (data.start_lon + data.end_lon) / 2,
        },
        {"lat": data.end_lat, "lon": data.end_lon},
    ]

    risk_score = sum(risk(p["lat"], p["lon"]) for p in path)

    # ---------------------------
    # Distance calculation (KM)
    # ---------------------------
    total_distance: float = 0.0

    for i in range(len(path) - 1):
        lat1 = path[i]["lat"]
        lon1 = path[i]["lon"]
        lat2 = path[i + 1]["lat"]
        lon2 = path[i + 1]["lon"]

        distance = math.sqrt((lat2 - lat1) ** 2 + (lon2 - lon1) ** 2) * 111
        total_distance += distance

    # ---------------------------
    # Estimated travel time
    # ---------------------------
    AVERAGE_SPEED_KMPH = 60.0
    estimated_time_hr = total_distance / AVERAGE_SPEED_KMPH

    return {
        "path": path,
        "risk_score": risk_score,
        "distance_km": round(total_distance, 2),
        "estimated_time_hr": round(estimated_time_hr, 2),
    }
