from fastapi import APIRouter
from app.services.predictor import predict_risk
from app.models.predict import PredictRequest

router = APIRouter()


@router.post("/predict")
def predict(data: PredictRequest):
    risk = predict_risk(data.model_dump())

    return {
        "risk_score": round(risk, 2),
        "risk_level": ("High" if risk > 70 else "Medium" if risk > 40 else "Low"),
    }
