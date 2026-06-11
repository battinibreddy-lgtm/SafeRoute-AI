"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const MapView = dynamic(() => import("../components/MapView"), {
  ssr: false,
});

export default function Home() {
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

  // 🚀 Route Analyzer (MAIN FUNCTION)
  const handleAnalyze = async () => {
    try {
      if (!start || !end) {
        alert("Please enter both From and To locations");
        return;
      }

      setLoading(true);

      // Convert text → coordinates
      const startCoord = await geocodeLocation(start);
      const endCoord = await geocodeLocation(end);

      // Call backend safest route API
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
        path: data.path,
        status:
          data.risk_score < 20
            ? "SAFE 🟢"
            : data.risk_score < 50
            ? "MODERATE 🟡"
            : "DANGEROUS 🔴",
      });
    } catch (err) {
      console.log("Route error:", err);
      alert("Failed to find route or location not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* 🗺 MAP SIDE (UNCHANGED) */}
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
        <h2>SafeRoute AI Planner</h2>

        {/* FROM */}
        <input
          placeholder="From location (e.g. Hyderabad)"
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
          placeholder="To location (e.g. Vijayawada)"
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
          {loading ? "Analyzing Route..." : "Find Safest Route"}
        </button>

        {/* RESULT PANEL */}
        {result && (
          <div style={{ marginTop: "20px" }}>
            <h3>Route Analysis</h3>

            <p>
              <b>Risk Score:</b>{" "}
              {typeof result.risk_score === "number"
                ? result.risk_score.toFixed(2)
                : result.risk_score}
            </p>

            <p>
              <b>Status:</b> {result.status}
            </p>

            <p>
              <b>Route Points:</b> {result.path?.length || 0}
            </p>

            <hr />

            <h4>AI Insight</h4>
            <p>
              This route is evaluated using accident history, blackspots, and ML
              risk prediction model.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
