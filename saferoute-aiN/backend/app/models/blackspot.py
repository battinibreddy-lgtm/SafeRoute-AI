from sqlalchemy import Column, Integer, Float, String
from app.database.database import Base

class Blackspot(Base):
    __tablename__ = "blackspots"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    risk_score = Column(Integer)
    accident_count = Column(Integer)
