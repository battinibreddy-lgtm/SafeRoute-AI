# SafeRoute AI

SafeRoute AI is an accident-risk-aware route planning system that helps users identify safer travel routes using machine learning, accident blackspots, and route risk analysis.

## Features

* Interactive map using Leaflet
* Accident blackspot visualization
* Route risk prediction
* Safe route analysis
* Start and destination route markers
* AI-based risk scoring
* FastAPI backend
* Next.js frontend
* SQLite database support

## Tech Stack

### Frontend

* Next.js
* React
* Leaflet

### Backend

* FastAPI
* Python

### Machine Learning

* Scikit-learn
* XGBoost

### Database

* SQLite

## Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Live Link:https://safe-route-ai-mu.vercel.app

Frontend: http://localhost:3000

Backend: http://localhost:8000
