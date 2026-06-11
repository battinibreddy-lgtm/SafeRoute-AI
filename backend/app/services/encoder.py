def encode_features(data: dict):
    weather_map = {"Clear": 0, "Rainy": 1, "Fog": 2, "Storm": 3}

    road_map = {"Highway": 0, "City": 1, "Rural": 2}

    time_map = {"Morning": 0, "Afternoon": 1, "Evening": 2, "Night": 3}

    return {
        "latitude": data["latitude"],
        "longitude": data["longitude"],
        "severity": data["severity"],
        "weather": weather_map.get(data["weather"], 0),
        "road_type": road_map.get(data["road_type"], 0),
        "time_of_day": time_map.get(data["time_of_day"], 0),
    }
