# SafeRoute AI Quick Start Guide

## Prerequisites

Install:

* Git
* Python 3.12+
* Node.js 22+
* npm
* VS Code

Verify installation:

```bash
git --version
python3 --version
node --version
npm --version
```

---

# Clone Project

```bash
git clone <repository-url>
cd saferoute-ai
```

---

# Backend Setup

## Create Virtual Environment

```bash
cd backend

python3 -m venv venv
```

## Activate Virtual Environment

Linux:

```bash
source venv/bin/activate
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Run Backend

```bash
uvicorn app.main:app --reload
```

Backend URL:

```text
http://localhost:8000
```

Swagger Documentation:

```text
http://localhost:8000/docs
```

---

# Frontend Setup

```bash
cd frontend
npm install
```

Run Frontend:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

---

# Database

SQLite database file:

```text
backend/saferoute.db
```

No additional setup required.

---

# Machine Learning

Train model:

```bash
cd backend

python ml/train.py
```

Generated file:

```text
backend/ml/model.pkl
```

---

# API Endpoints

Health Check:

```http
GET /health
```

Blackspots:

```http
GET /blackspots
```

Prediction:

```http
POST /predict
```

---

# Expected Startup Verification

Health endpoint should return:

```json
{
  "status": "ok"
}
```

Frontend should load:

```text
SafeRoute AI Dashboard
```

Map should display:

* Blackspot markers
* Risk information

---

# Troubleshooting

## Backend Not Starting

Verify:

```bash
pip install -r requirements.txt
```

## Frontend Not Starting

Verify:

```bash
npm install
```

## Database Errors

Verify:

```bash
backend/saferoute.db
```

exists.

---

# Development Workflow

1. Start Backend
2. Start Frontend
3. Train ML Model
4. Test APIs
5. Verify Dashboard
