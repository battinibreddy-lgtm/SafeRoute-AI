from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    severity: float = Field(..., ge=0)


class PredictResponse(BaseModel):
    risk_score: float = Field(..., ge=0, le=100)
    risk_level: str
