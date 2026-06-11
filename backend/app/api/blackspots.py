from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.blackspot import Blackspot

router = APIRouter()

@router.get("/blackspots")
def get_blackspots(db: Session = Depends(get_db)):
    data = db.query(Blackspot).all()

    return [
        {
            "id": b.id,
            "name": b.name,
            "latitude": b.latitude,
            "longitude": b.longitude,
            "risk_score": b.risk_score,
            "accident_count": b.accident_count
        }
        for b in data
    ]
