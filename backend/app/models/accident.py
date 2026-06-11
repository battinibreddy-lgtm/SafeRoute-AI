from sqlalchemy import Column, Integer, Float, String
from app.database.database import Base

class Accident(Base):
    __tablename__ = "accidents"

    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    severity = Column(Integer)
    weather = Column(String)
    road_type = Column(String)
    time_of_day = Column(String)
