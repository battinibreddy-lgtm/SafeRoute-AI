"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useI18n } from "../i18n/provider";

const MapView = dynamic(() => import("../components/MapView"), {
  ssr: false,
});

export default function Home() {
  const { t, setLocale } = useI18n();

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 🌍 Geocoding (OpenStreetMap)
  const geocodeLocation = async (place: string) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${place}`
    );

    const data = await res.json();

    if (!data || data.length === 0) {
      throw new Error("Location not found");
    }

    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
    };
  };

  // 🚀 Route Analyzer
  const handleAnalyze = async () => {
    try {
      if (!start || !end) {
        alert(t("location_error"));
        return;
      }

      setLoading(true);

      const startCoord = await geocodeLocation(start);
      const endCoord = await geocodeLocation(end);

      const res = await fetch("http://127.0.0.1:8000/safest-route", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_lat: startCoord.lat,
          start_lon: startCoord.lon,
          end_lat: endCoord.lat,
          end_lon: endCoord.lon,
        }),
      });

      const data = await res.json();

      console.log("ROUTE RESPONSE:", data);

   setResult({
  risk_score: data.risk_score,
  distance_km: data.distance_km,
  path: data.path,
  status:
    data.risk_score < 20
      ? t("safe")
      : data.risk_score < 50
      ? t("moderate")
      : t("dangerous"),
});
    } catch (err) {
      console.log("Route error:", err);
      alert(t("route_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* 🗺 MAP SIDE */}
      <div style={{ flex: 1 }}>
        <MapView
          route={result?.path || []}
          startName={start}
          endName={end}
        />
      </div>

      {/* 📊 RIGHT PANEL */}
      <div
        style={{
          width: "40%",
          padding: "20px",
          borderLeft: "2px solid #eee",
          background: "#fafafa",
          overflowY: "auto",
        }}
      >
        <h2>{t("planner")}</h2>

        {/* 🌐 Language Selector */}
        <div style={{ marginBottom: "15px" }}>
          <select
            onChange={(e) =>
              setLocale(e.target.value as "en" | "hi" | "te")
            }
            style={{
              padding: "8px",
              width: "100%",
            }}
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="te">తెలుగు</option>
          </select>
        </div>

        {/* FROM */}
        <input
          placeholder={t("from_placeholder")}
          value={start}
          onChange={(e) => setStart(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
          }}
        />

        {/* TO */}
        <input
          placeholder={t("to_placeholder")}
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
          }}
        />

        {/* BUTTON */}
        <button
          onClick={handleAnalyze}
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            background: loading ? "gray" : "black",
            color: "white",
            cursor: "pointer",
          }}
        >
          {loading ? t("analyzing") : t("find_route")}
        </button>

        {/* RESULT PANEL */}
        {result && (
          <div style={{ marginTop: "20px" }}>
            <h3>{t("route_analysis")}</h3>

            <p>
              <b>{t("risk_score")}:</b>{" "}
              {typeof result.risk_score === "number"
                ? result.risk_score.toFixed(2)
                : result.risk_score}
            </p>

            <p>
              <b>{t("status")}:</b> {result.status}
            </p>

            <p>
  <b>{t("route_points")}:</b> {result.path?.length || 0}
</p>

<p>
  <b>{t("distance")}:</b> {result.distance_km} km
</p>

<hr />

<h4>{t("ai_insight")}</h4>

            <p>{t("insight_text")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
