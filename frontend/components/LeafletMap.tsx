"use client";

import { useEffect, useState } from "react";
import { useI18n } from "../i18n/provider";
import "leaflet/dist/leaflet.css";
import { Polyline } from "react-leaflet";
import { API_BASE_URL } from "../src/lib/api";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";

const LeafletMapContainer = MapContainer as any;
const LeafletTileLayer = TileLayer as any;
const LeafletMarker = Marker as any;
const LeafletPopup = Popup as any;
const LeafletPolyline = Polyline as any;

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
    click(e: { latlng: { lat: number; lng: number } }) {
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

  const translateRiskLevel = (level: string) => {
    const normalized = level.toLowerCase();

    if (normalized.includes("low")) return t("safe");
    if (normalized.includes("medium")) return t("moderate");
    if (normalized.includes("high")) return t("dangerous");

    return level;
  };

  const translateReason = (reason: string) => {
    const reasonMap: Record<string, string> = {
      "Fallback mode active": "reason_fallback_mode_active",
      "Low accident density": "reason_low_accident_density",
      "Stable traffic": "reason_stable_traffic",
      "Moderate risk zone": "reason_moderate_risk_zone",
      "Some congestion": "reason_some_congestion",
      "Frequent accidents": "reason_frequent_accidents",
      "Dangerous junction": "reason_dangerous_junction",
    };

    const key = reasonMap[reason];
    return key ? t(key) : reason;
  };

  // -----------------------------
  // LOAD BLACKSPOTS
  // -----------------------------
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/blackspots`);
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
      const res = await fetch(`${API_BASE_URL}/predict`, {
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
    <LeafletMapContainer
      center={[17.385, 78.486]}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      {/* AUTO FIT ROUTE */}
      <RouteFit route={route} />

      {/* TILE LAYER */}
      <LeafletTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* MAP CLICK AI */}
      <MapClickHandler onClick={handleMapClick} />

      {/* BLACKSPOTS */}
      {spots.map((spot) => (
        <LeafletMarker
          key={spot.id}
          position={[
            Number(spot.latitude),
            Number(spot.longitude),
          ]}
          icon={getRiskIcon("MEDIUM")}
        >
          <LeafletPopup>
            <b>{spot.name}</b>
            <br />
            {t("risk_score")}: {spot.risk_score}
            <br />
            {t("accidents")}: {spot.accident_count}
          </LeafletPopup>
        </LeafletMarker>
      ))}

      {/* AI RISK MARKER */}
      {selectedRisk && (
        <LeafletMarker
          position={[
            selectedRisk.latlng.lat,
            selectedRisk.latlng.lng,
          ]}
          icon={getRiskIcon(selectedRisk.risk_level)}
        >
          <LeafletPopup>
            <b>{t("ai_risk_analysis")}</b>
            <br />
            {t("score")}: {selectedRisk.risk_score}
            <br />
            {t("level")}: {translateRiskLevel(selectedRisk.risk_level)}

            <hr />

            <b>{t("reasons")}:</b>

            <ul>
              {selectedRisk.reasons?.map(
                (reason: string, index: number) => (
                  <li key={index}>{translateReason(reason)}</li>
                )
              )}
            </ul>
          </LeafletPopup>
        </LeafletMarker>
      )}

      {/* START MARKER */}
      {route.length > 0 && (
        <LeafletMarker
          position={[
            Number(route[0].lat),
            Number(route[0].lon),
          ]}
          icon={getRouteIcon("🟢")}
        >
          <LeafletPopup>
            <b>{t("start")} (A)</b>
            <br />
            {startName || t("starting_point")}
          </LeafletPopup>
        </LeafletMarker>
      )}

      {/* DESTINATION MARKER */}
      {route.length > 0 && (
        <LeafletMarker
          position={[
            Number(route[route.length - 1].lat),
            Number(route[route.length - 1].lon),
          ]}
          icon={getRouteIcon("🔴")}
        >
          <LeafletPopup>
            <b>{t("destination")} (B)</b>
            <br />
            {endName || t("destination")}
          </LeafletPopup>
        </LeafletMarker>
      )}

      {/* ROUTE LINE */}
      {route.length > 0 && (
        <LeafletPolyline
          positions={route.map((p: any) => [
            Number(p.lat),
            Number(p.lon),
          ])}
          color="blue"
          weight={6}
        />
      )}
    </LeafletMapContainer>
  );
}
