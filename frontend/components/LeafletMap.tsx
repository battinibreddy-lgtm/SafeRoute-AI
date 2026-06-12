"use client";

import { useEffect, useState } from "react";
import { useI18n } from "../i18n/provider";
import "leaflet/dist/leaflet.css";
import { Polyline } from "react-leaflet";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";

// -----------------------------
// BLACKSPOT / AI ICON
// -----------------------------
const getRiskIcon = (level: string) => {
  if (typeof window === "undefined") return null;

  const L = require("leaflet");

  return new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

// -----------------------------
// ROUTE ICONS
// -----------------------------
const getRouteIcon = (emoji: string) => {
  if (typeof window === "undefined") return null;

  const L = require("leaflet");

  return new L.DivIcon({
    html: `
      <div style="
        font-size:28px;
        text-align:center;
      ">
        ${emoji}
      </div>
    `,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

// -----------------------------
// MAP CLICK HANDLER
// -----------------------------
function MapClickHandler({ onClick }: any) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });

  return null;
}

// -----------------------------
// AUTO FIT ROUTE
// -----------------------------
function RouteFit({ route }: any) {
  const map = useMap();

  useEffect(() => {
    if (!route || route.length === 0) return;

    const bounds = route.map((p: any) => [
      Number(p.lat),
      Number(p.lon),
    ]);

    map.fitBounds(bounds, {
      padding: [50, 50],
    });
  }, [route, map]);

  return null;
}

// -----------------------------
// MAIN COMPONENT
// -----------------------------
export default function LeafletMap({
  route = [],
  startName,
  endName,
}: any) {
  const { t } = useI18n();

  const [spots, setSpots] = useState<any[]>([]);
  const [selectedRisk, setSelectedRisk] = useState<any>(null);

  // -----------------------------
  // LOAD BLACKSPOTS
  // -----------------------------
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/blackspots");
        const data = await res.json();

        setSpots(Array.isArray(data) ? data : data.blackspots || []);
      } catch (err) {
        console.log("Error loading blackspots:", err);
      }
    };

    load();
  }, []);

  // -----------------------------
  // AI PREDICTION
  // -----------------------------
  const handleMapClick = async (latlng: any) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: latlng.lat,
          longitude: latlng.lng,
        }),
      });

      const data = await res.json();

      setSelectedRisk({
        risk_score: data.risk_score,
        risk_level: data.risk_level,
        reasons: data.reasons,
        latlng,
      });
    } catch (err) {
      console.log("Prediction error:", err);
    }
  };

  return (
    <MapContainer
      center={[17.385, 78.486]}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      {/* AUTO FIT ROUTE */}
      <RouteFit route={route} />

      {/* TILE LAYER */}
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* MAP CLICK AI */}
      <MapClickHandler onClick={handleMapClick} />

      {/* BLACKSPOTS */}
      {spots.map((spot) => (
        <Marker
          key={spot.id}
          position={[
            Number(spot.latitude),
            Number(spot.longitude),
          ]}
          icon={getRiskIcon("MEDIUM")}
        >
          <Popup>
            <b>{spot.name}</b>
            <br />
            {t("risk_score")}: {spot.risk_score}
            <br />
            {t("accidents")}: {spot.accident_count}
          </Popup>
        </Marker>
      ))}

      {/* AI RISK MARKER */}
      {selectedRisk && (
        <Marker
          position={[
            selectedRisk.latlng.lat,
            selectedRisk.latlng.lng,
          ]}
          icon={getRiskIcon(selectedRisk.risk_level)}
        >
          <Popup>
            <b>{t("ai_risk_analysis")}</b>
            <br />
            {t("score")}: {selectedRisk.risk_score}
            <br />
            {t("level")}: {selectedRisk.risk_level}

            <hr />

            <b>{t("reasons")}:</b>

            <ul>
              {selectedRisk.reasons?.map(
                (reason: string, index: number) => (
                  <li key={index}>{reason}</li>
                )
              )}
            </ul>
          </Popup>
        </Marker>
      )}

      {/* START MARKER */}
      {route.length > 0 && (
        <Marker
          position={[
            Number(route[0].lat),
            Number(route[0].lon),
          ]}
          icon={getRouteIcon("🟢")}
        >
          <Popup>
            <b>{t("start")} (A)</b>
            <br />
            {startName || t("starting_point")}
          </Popup>
        </Marker>
      )}

      {/* DESTINATION MARKER */}
      {route.length > 0 && (
        <Marker
          position={[
            Number(route[route.length - 1].lat),
            Number(route[route.length - 1].lon),
          ]}
          icon={getRouteIcon("🔴")}
        >
          <Popup>
            <b>{t("destination")} (B)</b>
            <br />
            {endName || t("destination")}
          </Popup>
        </Marker>
      )}

      {/* ROUTE LINE */}
      {route.length > 0 && (
        <Polyline
          positions={route.map((p: any) => [
            Number(p.lat),
            Number(p.lon),
          ])}
          color="blue"
          weight={6}
        />
      )}
    </MapContainer>
  );
}
