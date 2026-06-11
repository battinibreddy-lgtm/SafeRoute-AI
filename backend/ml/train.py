import pandas as pd
import sqlite3
import joblib
import numpy as np

from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split

# -----------------------------
# Load data from SQLite
# -----------------------------
conn = sqlite3.connect("saferoute.db")

accidents = pd.read_sql_query("SELECT * FROM accidents", conn)

conn.close()

# -----------------------------
# Feature Engineering
# -----------------------------
# Using latitude + longitude as base features (you can expand later)
X = accidents[["latitude", "longitude"]]

# Target: risk score proxy
y = accidents["severity"] * 20

# -----------------------------
# Train/Test Split
# -----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# -----------------------------
# XGBoost Model
# -----------------------------
model = XGBRegressor(
    n_estimators=200,
    learning_rate=0.1,
    max_depth=5,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42
)

# -----------------------------
# Train model
# -----------------------------
model.fit(X_train, y_train)

# -----------------------------
# Save model
# -----------------------------
joblib.dump(model, "ml/model.pkl")

print("✅ XGBoost model trained and saved successfully!")