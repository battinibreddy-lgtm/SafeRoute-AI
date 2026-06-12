import pandas as pd
import sqlite3
import joblib

from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

# -----------------------------
# Load data from SQLite
# -----------------------------
conn = sqlite3.connect("saferoute.db")
accidents = pd.read_sql_query("SELECT * FROM accidents", conn)
conn.close()

# -----------------------------
# Basic validation
# -----------------------------
if accidents.empty:
    raise ValueError("No data found in accidents table")

required_cols = {"latitude", "longitude", "severity"}
if not required_cols.issubset(accidents.columns):
    raise ValueError(
        f"Missing required columns: {required_cols - set(accidents.columns)}"
    )

# -----------------------------
# Feature Engineering
# -----------------------------
X = accidents[["latitude", "longitude"]]
y = accidents["severity"] * 20  # simple risk proxy

# -----------------------------
# Train/Test Split (FIXED)
# -----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# -----------------------------
# Model
# -----------------------------
model = XGBRegressor(
    n_estimators=200,
    learning_rate=0.1,
    max_depth=5,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
)

# -----------------------------
# Train
# -----------------------------
model.fit(X_train, y_train)

# -----------------------------
# Evaluate
# -----------------------------
preds = model.predict(X_test)
mae = mean_absolute_error(y_test, preds)

# -----------------------------
# Save model
# -----------------------------
joblib.dump(model, "ml/model.pkl")

# -----------------------------
# Logs (FIXED ruff issue)
# -----------------------------
print("✅ Model trained successfully!")
print(f"📊 Mean Absolute Error (MAE): {mae:.4f}")
