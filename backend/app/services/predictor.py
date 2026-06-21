# Pickle is limited to the repository-controlled model below.
import pickle  # nosec B403
import numpy as np

from app.services.encoder import encode_features

MODEL_PATH = "ml/model.pkl"
model = None


def load_model():
    global model
    if model is None:
        with open(MODEL_PATH, "rb") as f:
            # MODEL_PATH is fixed and cannot be supplied by a user.
            model = pickle.load(f)  # nosec B301
    return model


def predict_risk(data):
    model = load_model()

    encoded = encode_features(data)

    features = np.array(
        [
            [
                encoded["latitude"],
                encoded["longitude"],
                encoded["severity"],
                encoded["weather"],
                encoded["road_type"],
                encoded["time_of_day"],
            ]
        ]
    )

    prediction = model.predict(features)[0]

    return float(prediction)
