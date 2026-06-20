# SafeRoute AI

SafeRoute AI is an accident-risk-aware route planning system that helps users identify safer travel routes using machine learning, accident blackspots, and route risk analysis.

## Features

* Interactive map using Leaflet
* Accident blackspot visualization
* Route risk prediction
* Safe route analysis
* Start and destination route markers
* AI-based risk scoring
* Google ADK safety agent with tools, sessions, and conversation memory
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

Set `GOOGLE_API_KEY` in the environment to enable the ADK agent. Optionally set
`ADK_MODEL` to override the default `gemini-2.5-flash` model.

### Agent API

The agent uses its route-risk and nearest-blackspot tools through Google ADK's
reasoning loop. Reuse both `user_id` and the returned `session_id` for a
multi-turn conversation:

```bash
curl -X POST http://localhost:8000/ai/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Assess a route with risk score 72", "user_id":"demo"}'
```

Sessions and recalled conversations are held in process memory. Deployments
that need durable or multi-instance memory should configure a persistent ADK
session and memory service.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Live Link:https://safe-route-ai-mu.vercel.app

Frontend: http://localhost:3000

Backend: http://localhost:8000
