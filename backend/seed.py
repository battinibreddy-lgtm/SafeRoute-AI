from app.database.database import SessionLocal, engine, Base
from app.models.accident import Accident
from app.models.blackspot import Blackspot

Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Sample accidents
accidents = [
    Accident(latitude=17.385, longitude=78.486, severity=4, weather="Rainy", road_type="Highway", time_of_day="Night"),
    Accident(latitude=17.390, longitude=78.490, severity=3, weather="Clear", road_type="City", time_of_day="Morning"),
    Accident(latitude=17.400, longitude=78.500, severity=5, weather="Fog", road_type="Highway", time_of_day="Night"),
]

for a in accidents:
    db.add(a)

# Sample blackspots
blackspots = [
    Blackspot(name="Main Road Junction", latitude=17.385, longitude=78.486, risk_score=95, accident_count=12),
    Blackspot(name="Old Town Crossing", latitude=17.400, longitude=78.500, risk_score=88, accident_count=8),
]

for b in blackspots:
    db.add(b)

db.commit()
db.close()

print("Database seeded successfully")
