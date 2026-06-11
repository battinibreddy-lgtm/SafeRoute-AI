from pydantic import BaseModel


class PredictRequest(BaseModel):
    latitude: float
    longitude: float
    severity: int
    weather: str
    road_type: str
    time_of_day: str
