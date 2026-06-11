# SafeRoute AI Data Model

## Overview

This document defines all core entities, database tables, API request models, and API response models used by SafeRoute AI.

---

# Entity: Accident

Represents a historical road accident record.

## Fields

| Field         | Type    | Required | Description                        |
| ------------- | ------- | -------- | ---------------------------------- |
| id            | Integer | Yes      | Unique identifier                  |
| latitude      | Float   | Yes      | Accident latitude                  |
| longitude     | Float   | Yes      | Accident longitude                 |
| severity      | Integer | Yes      | Severity score                     |
| weather       | String  | Yes      | Weather condition                  |
| road_type     | String  | Yes      | Road category                      |
| time_of_day   | String  | Yes      | Morning, Afternoon, Evening, Night |
| accident_date | Date    | No       | Date of accident                   |

---

# Entity: Blackspot

Represents a dangerous road location identified from accident data.

## Fields

| Field          | Type    | Required | Description         |
| -------------- | ------- | -------- | ------------------- |
| id             | Integer | Yes      | Unique identifier   |
| name           | String  | Yes      | Location name       |
| latitude       | Float   | Yes      | Latitude            |
| longitude      | Float   | Yes      | Longitude           |
| risk_score     | Integer | Yes      | Risk score (0-100)  |
| accident_count | Integer | Yes      | Number of accidents |

---

# Entity: Prediction Request

Input provided by a user for risk prediction.

## Fields

| Field       | Type   | Required | Description        |
| ----------- | ------ | -------- | ------------------ |
| latitude    | Float  | Yes      | Location latitude  |
| longitude   | Float  | Yes      | Location longitude |
| weather     | String | Yes      | Weather condition  |
| road_type   | String | Yes      | Road category      |
| time_of_day | String | Yes      | Time period        |

---

# Entity: Prediction Response

Result returned by the prediction API.

## Fields

| Field      | Type    | Required | Description          |
| ---------- | ------- | -------- | -------------------- |
| risk_score | Integer | Yes      | Predicted risk score |
| risk_level | String  | Yes      | Low, Medium, High    |

---

# Database Schema

## accidents

| Column        | Type    |
| ------------- | ------- |
| id            | INTEGER |
| latitude      | REAL    |
| longitude     | REAL    |
| severity      | INTEGER |
| weather       | TEXT    |
| road_type     | TEXT    |
| time_of_day   | TEXT    |
| accident_date | TEXT    |

---

## blackspots

| Column         | Type    |
| -------------- | ------- |
| id             | INTEGER |
| name           | TEXT    |
| latitude       | REAL    |
| longitude      | REAL    |
| risk_score     | INTEGER |
| accident_count | INTEGER |

---

# API Models

## GET /health

Response

```json
{
  "status": "ok"
}
```

---

## GET /blackspots

Response

```json
[
  {
    "id": 1,
    "name": "Main Road / Hill Street",
    "latitude": 17.385,
    "longitude": 78.486,
    "risk_score": 98,
    "accident_count": 42
  }
]
```

---

## POST /predict

Request

```json
{
  "latitude": 17.385,
  "longitude": 78.486,
  "weather": "Rainy",
  "road_type": "Highway",
  "time_of_day": "Night"
}
```

Response

```json
{
  "risk_score": 87,
  "risk_level": "High"
}
```

---

# Relationships

Accident Data
→ Blackspot Identification
→ Machine Learning Model
→ Risk Prediction
→ Dashboard Visualization
