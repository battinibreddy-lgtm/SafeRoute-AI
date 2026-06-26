# SafeRoute AI Project Plan

## Project Title

SafeRoute AI - AI-Powered Road Safety and Route Risk Analysis Platform

## Project Overview

SafeRoute AI is a road safety platform that helps users understand route risk before they travel. The system combines accident blackspot data, machine learning risk prediction, interactive maps, real route analysis, and AI-generated safety insights.

The platform is designed for drivers, traffic authorities, and urban planners who need clear information about accident-prone locations and safer travel decisions.

---

## Problem Statement

Most route planning applications optimize for time, distance, and traffic. They rarely explain whether a route passes through accident-prone locations or how risky a road segment may be.

SafeRoute AI addresses this gap by predicting road risk, showing accident blackspots on a map, and generating safety guidance for selected routes.

---

## Objectives

1. Display accident blackspots on an interactive map.
2. Predict accident risk scores using machine learning.
3. Analyze route safety between a start and destination.
4. Generate practical AI safety insights for a route.
5. Provide a dashboard for route and safety information.
6. Support multilingual user experience for wider accessibility.
7. Expose backend services through FastAPI REST endpoints.

---

## Target Users

### Drivers

Drivers can check route risk, nearby blackspots, and safety suggestions before starting a trip.

### Traffic Authorities

Traffic departments can identify high-risk areas and prioritize safety interventions.

### Urban Planners

Urban planners can use blackspot and risk information to support road design and infrastructure decisions.

### Researchers and Students

The project can be used as a practical AI, geospatial, and full-stack engineering case study.

---

## Scope

### In Scope

- Interactive map interface
- Start and destination route analysis
- Accident blackspot visualization
- Risk prediction API
- Route risk scoring
- Nearest blackspot lookup
- AI-generated route safety insight
- Multilingual frontend support
- SQLite-backed accident and blackspot data
- Local and production deployment setup

### Out of Scope

- Real-time traffic camera integration
- Live police or emergency service feeds
- Native mobile application
- Turn-by-turn navigation
- Official safety certification for road authorities

---

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js, React, TypeScript |
| Mapping | Leaflet, OpenStreetMap, OSRM routing |
| Backend | FastAPI, Python |
| Machine Learning | Scikit-learn, XGBoost, Joblib |
| Database | SQLite |
| AI Insight | Offline fallback, Ollama, OpenAI-compatible APIs, Google ADK agent |
| Testing | Pytest, frontend test setup |
| Deployment | Vercel for frontend, Render/Docker for backend |

---

## System Architecture

```text
User
  |
  v
Next.js Frontend
  |
  |-- Interactive map
  |-- Route input
  |-- Dashboard
  |-- Language selection
  |
  v
FastAPI Backend
  |
  |-- Blackspot API
  |-- Prediction API
  |-- Safest route API
  |-- Nearest blackspot API
  |-- AI route insight API
  |-- Agent chat API
  |
  +-- SQLite Database
  |
  +-- ML Model
  |
  +-- External Routing and Geocoding Services
```

---

## Project Modules

### Frontend Module

The frontend provides the user interface for route planning and safety analysis.

Key responsibilities:

- Accept start and destination locations.
- Geocode user-entered places.
- Display route geometry on a Leaflet map.
- Show risk score, estimated distance, and travel time.
- Display AI safety insight.
- Support English, Hindi, and Telugu content.

Main files and folders:

- `frontend/app/page.tsx`
- `frontend/app/dashboard/page.tsx`
- `frontend/components/MapView.tsx`
- `frontend/components/LeafletMap.tsx`
- `frontend/i18n/`
- `frontend/messages/`

### Backend Module

The backend exposes APIs for prediction, routing, blackspots, AI insights, and agent interaction.

Key responsibilities:

- Serve REST APIs using FastAPI.
- Read accident blackspot data from SQLite.
- Load and use the trained ML model.
- Calculate route risk scores.
- Call OSRM for route geometry with fallback behavior.
- Generate AI safety summaries using configured providers or offline fallback.

Main files and folders:

- `backend/app/main.py`
- `backend/app/api/`
- `backend/app/models/`
- `backend/app/services/`
- `backend/app/database/`
- `backend/app/agents/`

### Machine Learning Module

The ML module trains and stores a risk prediction model.

Key responsibilities:

- Prepare accident location and road-risk features.
- Train an XGBoost or Scikit-learn model.
- Save the trained model as `model.pkl`.
- Return risk scores for backend prediction requests.

Main files and folders:

- `backend/ml/train.py`
- `backend/ml/model.pkl`
- `backend/app/services/predictor.py`
- `backend/app/services/encoder.py`

### Database Module

The database stores accident records and blackspot information.

Primary entities:

- `accidents`: accident history and location data.
- `blackspots`: high-risk areas with risk score and accident count.

Main files and folders:

- `backend/app/database/`
- `backend/app/models/accident.py`
- `backend/app/models/blackspot.py`
- `backend/seed.py`

### AI Agent Module

The AI module provides safety reasoning and conversational support.

Key responsibilities:

- Generate concise route safety insights.
- Support offline fallback insights.
- Allow provider configuration for Ollama or OpenAI-compatible APIs.
- Provide Google ADK-based agent chat with route-risk and blackspot tools.

Main files and folders:

- `backend/app/agents/`
- `backend/app/api/agent.py`
- `backend/app/main.py`

---

## API Plan

### Health Check

```http
GET /health
```

Purpose:

Check whether the backend service is running.

Expected response:

```json
{
  "status": "ok"
}
```

### Blackspots

```http
GET /blackspots
```

Purpose:

Return accident blackspot locations with risk score and accident count.

### Risk Prediction

```http
POST /predict
```

Purpose:

Predict accident risk for a given latitude and longitude.

Sample input:

```json
{
  "latitude": 17.385,
  "longitude": 78.4867
}
```

### Safest Route

```http
POST /safest-route
```

Purpose:

Return route path, distance, estimated travel time, and route risk score.

Sample input:

```json
{
  "start_lat": 17.385,
  "start_lon": 78.4867,
  "end_lat": 17.444,
  "end_lon": 78.377
}
```

### Nearest Blackspot

```http
GET /nearest-blackspot?lat=17.385&lon=78.4867
```

Purpose:

Find the nearest known accident blackspot for a given location.

### AI Route Insight

```http
POST /ai/route-insight
```

Purpose:

Generate a concise safety explanation for a route using offline logic or a configured AI provider.

### AI Settings

```http
GET /ai/settings
```

Purpose:

Return supported AI provider settings for the frontend.

### Agent Chat

```http
POST /ai/agent/chat
```

Purpose:

Provide conversational route-risk assistance using the Google ADK safety agent.

---

## Data Model

### Accident

| Field | Description |
| --- | --- |
| `id` | Unique accident record identifier |
| `latitude` | Accident latitude |
| `longitude` | Accident longitude |
| `severity` | Accident severity level |
| `weather` | Weather condition |
| `road_type` | Road category |
| `time_of_day` | Time period |

### Blackspot

| Field | Description |
| --- | --- |
| `id` | Unique blackspot identifier |
| `name` | Location or area name |
| `latitude` | Blackspot latitude |
| `longitude` | Blackspot longitude |
| `risk_score` | Risk score from 0 to 100 |
| `accident_count` | Number of recorded accidents |

### Prediction Result

| Field | Description |
| --- | --- |
| `risk_score` | Numeric risk score |
| `risk_level` | Low, medium, or high risk category |
| `reasons` | Explanation for the score when available |

---

## Machine Learning Plan

### Input Features

- Latitude
- Longitude
- Weather condition
- Road type
- Time of day
- Accident density or historical blackspot indicators

### Output

- Risk score between 0 and 100
- Risk level classification

### Model Approach

1. Collect or seed accident and blackspot data.
2. Clean missing and inconsistent values.
3. Encode categorical features.
4. Train an XGBoost or Scikit-learn model.
5. Evaluate prediction quality.
6. Save the model as `backend/ml/model.pkl`.
7. Load the model in the FastAPI backend.
8. Use fallback risk logic when the model file is unavailable.

---

## UI Plan

### Home Route Planner

Features:

- Start location input
- Destination input
- Route analysis button
- Interactive map
- Route path display
- Risk score result
- Distance and estimated time
- AI-generated safety insight
- AI provider configuration

### Dashboard

Features:

- Project title and safety summary
- Quick action buttons
- Language switcher
- Future area for high-risk rankings and analytics

### Map Experience

Features:

- Route polyline
- Start marker
- Destination marker
- Blackspot markers
- Risk status display

---

## Development Phases

### Phase 1 - Planning and Requirements

Deliverables:

- Project specification
- Problem statement
- Functional requirements
- Non-functional requirements
- Data model
- Technical research
- Implementation plan

Status:

Completed in `specs/001-saferoute-ai/`.

### Phase 2 - Backend Foundation

Deliverables:

- FastAPI application setup
- CORS configuration
- Health endpoint
- SQLite connection
- SQLAlchemy models
- Seed data support

Status:

In progress / implemented.

### Phase 3 - Machine Learning

Deliverables:

- Training script
- Feature encoding
- Saved model file
- Risk prediction service
- Fallback prediction behavior

Status:

In progress / implemented.

### Phase 4 - Route Safety APIs

Deliverables:

- Blackspot endpoint
- Prediction endpoint
- Nearest blackspot endpoint
- Safest route endpoint
- Route geometry using OSRM
- Fallback route behavior

Status:

In progress / implemented.

### Phase 5 - Frontend Application

Deliverables:

- Next.js application
- Leaflet map integration
- Route input form
- API integration
- Risk result display
- Dashboard page
- Multilingual text support

Status:

In progress / implemented.

### Phase 6 - AI Safety Insight

Deliverables:

- Offline AI safety summary fallback
- Ollama provider support
- OpenAI-compatible provider support
- Google ADK safety agent endpoint
- Session-based conversational support

Status:

In progress / implemented.

### Phase 7 - Testing and Validation

Deliverables:

- Backend unit tests
- API response validation
- Frontend message tests
- Manual route analysis testing
- Model loading validation
- Deployment smoke tests

Status:

Planned / partially implemented.

### Phase 8 - Deployment

Deliverables:

- Frontend deployment on Vercel
- Backend deployment on Render or Docker
- Environment variable configuration
- CORS production configuration
- Production smoke testing

Status:

Planned / partially implemented.

### Phase 9 - Documentation and Final Review

Deliverables:

- README
- User manual
- Deployment guide
- Security notes
- Project plan
- Final validation checklist

Status:

In progress.

---

## Functional Requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-1 | Show blackspots on an interactive map | High |
| FR-2 | Predict risk score for a location | High |
| FR-3 | Analyze route risk between two places | High |
| FR-4 | Show route path, distance, and estimated time | High |
| FR-5 | Generate AI safety insight | Medium |
| FR-6 | Support multiple languages | Medium |
| FR-7 | Provide dashboard interface | Medium |
| FR-8 | Expose REST APIs with JSON responses | High |

---

## Non-Functional Requirements

| Category | Requirement |
| --- | --- |
| Performance | API responses should complete within 2 seconds for common requests when external services are available. |
| Reliability | Backend should provide fallback behavior for missing ML model or routing failures. |
| Usability | Interface should be simple enough for non-technical users. |
| Maintainability | Code should remain modular across frontend, backend, ML, database, and agent layers. |
| Security | API keys should be provided through environment variables or request headers and should not be committed. |
| Portability | The app should run locally and support cloud deployment. |

---

## Testing Plan

### Backend Testing

- Verify `/health` returns service status.
- Verify `/blackspots` returns valid blackspot records.
- Verify `/predict` returns a risk score and risk level.
- Verify `/safest-route` returns route path and risk score.
- Verify AI insight endpoint returns fallback when no provider is configured.

### Frontend Testing

- Verify page loads successfully.
- Verify language messages render correctly.
- Verify route form handles missing inputs.
- Verify API results are displayed to the user.
- Verify map renders markers and route paths.

### Integration Testing

- Start backend and frontend locally.
- Analyze a route from start to destination.
- Confirm route, distance, risk score, and insight appear.
- Confirm CORS allows frontend-backend communication.

---

## Deployment Plan

### Frontend

Platform:

- Vercel

Steps:

1. Install frontend dependencies.
2. Configure backend API base URL.
3. Build the Next.js app.
4. Deploy to Vercel.
5. Verify production route analysis flow.

### Backend

Platform:

- Render or Docker-compatible hosting

Steps:

1. Install Python dependencies.
2. Configure `SQLITE_DB_PATH`, `MODEL_PATH`, and `CORS_ORIGINS`.
3. Configure AI provider variables if needed.
4. Start FastAPI using Uvicorn.
5. Verify `/health`, `/blackspots`, `/predict`, and `/safest-route`.

---

## Risks and Mitigation

| Risk | Impact | Mitigation |
| --- | --- | --- |
| ML model file missing | Predictions may fail | Use backend fallback risk response. |
| External routing service unavailable | Route geometry may fail | Use straight-line fallback route. |
| Limited accident dataset | Model accuracy may be low | Use seeded data for demo and expand dataset over time. |
| API key missing | AI provider calls fail | Use offline insight fallback. |
| CORS misconfiguration | Frontend cannot call backend | Configure `CORS_ORIGINS` for local and production URLs. |
| SQLite limitations | Not ideal for large concurrent usage | Keep SQLite for demo; migrate later if scale increases. |

---

## Success Metrics

- User can enter start and destination locations.
- Route appears on the map.
- Risk score is generated for the selected route.
- Blackspots are available through the backend.
- AI safety insight is shown with offline fallback support.
- Backend APIs return valid JSON responses.
- Frontend runs locally and can connect to the backend.
- Deployment documentation is sufficient to run the project in production.

---

## Future Enhancements

- Use larger real-world accident datasets.
- Add route alternatives ranked by safety.
- Add weather and traffic-based real-time risk adjustment.
- Improve dashboard analytics with charts and filters.
- Add user accounts for saved routes.
- Add administrative tools for blackspot management.
- Migrate from SQLite to PostgreSQL/PostGIS for geospatial scale.
- Add automated end-to-end tests.

---

## Final Deliverables

- Working Next.js frontend
- Working FastAPI backend
- SQLite accident and blackspot storage
- ML risk prediction model
- Interactive Leaflet map
- Route risk analysis
- AI safety insight endpoint
- Project documentation
- Deployment-ready configuration
