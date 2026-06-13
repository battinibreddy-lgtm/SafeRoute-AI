"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useI18n } from "../i18n/provider";
import { API_BASE_URL } from "../src/lib/api";

const MapView = dynamic(() => import("../components/MapView"), {
  ssr: false,
});

type AISettings = {
  provider: "offline" | "ollama" | "openai" | "openai-compatible";
  baseUrl: string;
  model: string;
  apiKey: string;
};

type RouteResult = {
  risk_score: number;
  distance_km: number;
  estimated_time_hr?: number;
  estimated_time_min?: number;
  path: Array<{ lat: number; lon: number }>;
  startName: string;
  endName: string;
  aiInsight: string;
  aiProvider: string;
  aiFallback: boolean;
  aiLocale: string;
};

const defaultAISettings: AISettings = {
  provider: "offline",
  baseUrl: "",
  model: "",
  apiKey: "",
};

export default function Home() {
  const { locale, t, setLocale } = useI18n();

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [result, setResult] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiSettings, setAISettings] =
    useState<AISettings>(defaultAISettings);
  const [showAISettings, setShowAISettings] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const saved = window.localStorage.getItem("saferoute-ai-settings");
      if (saved) {
        try {
          setAISettings({ ...defaultAISettings, ...JSON.parse(saved) });
        } catch {
          setAISettings(defaultAISettings);
        }
        return;
      }

      fetch(`${API_BASE_URL}/ai/settings`)
        .then((res) => res.json())
        .then((data) => {
          setAISettings({
            provider: data.provider || "offline",
            baseUrl: data.base_url || "",
            model: data.model || "",
            apiKey: "",
          });
        })
        .catch(() => {
          setAISettings(defaultAISettings);
        });
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const updateAISettings = (settings: AISettings) => {
    setAISettings(settings);
    window.localStorage.setItem(
      "saferoute-ai-settings",
      JSON.stringify(settings)
    );
  };

  const aiHeaders = () => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-AI-Provider": aiSettings.provider,
    };

    if (aiSettings.baseUrl) headers["X-AI-Base-URL"] = aiSettings.baseUrl;
    if (aiSettings.model) headers["X-AI-Model"] = aiSettings.model;
    if (aiSettings.apiKey) headers["X-AI-API-Key"] = aiSettings.apiKey;

    return headers;
  };

  const getRiskStatusKey = (riskScore: number) => {
    if (riskScore < 20) return "safe";
    if (riskScore < 50) return "moderate";
    return "dangerous";
  };

  const fetchRouteInsight = async (route: {
    startName: string;
    endName: string;
    risk_score: number;
    distance_km: number;
    estimated_time_min?: number;
  }) => {
    const status = t(getRiskStatusKey(route.risk_score));
    const insightRes = await fetch(`${API_BASE_URL}/ai/route-insight`, {
      method: "POST",
      headers: aiHeaders(),
      body: JSON.stringify({
        start: route.startName,
        end: route.endName,
        risk_score: route.risk_score,
        risk_level: status,
        locale,
        distance_km: route.distance_km,
        estimated_time_min: route.estimated_time_min,
      }),
    });

    return insightRes.json();
  };

  useEffect(() => {
    if (!result || result.aiLocale === locale) return;

    let cancelled = false;

    fetchRouteInsight(result)
      .then((insightData) => {
        if (cancelled) return;
        setResult((current) => {
          if (!current) return current;
          return {
            ...current,
            aiInsight: insightData.insight || t("insight_text"),
            aiProvider: insightData.provider || aiSettings.provider,
            aiFallback: Boolean(insightData.fallback),
            aiLocale: locale,
          };
        });
      })
      .catch(() => {
        if (cancelled) return;
        setResult((current) => {
          if (!current) return current;
          return {
            ...current,
            aiInsight: t("insight_text"),
            aiProvider: aiSettings.provider,
            aiFallback: true,
            aiLocale: locale,
          };
        });
      });

    return () => {
      cancelled = true;
    };
  }, [locale, result, aiSettings.provider, t]);

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

      const res = await fetch(`${API_BASE_URL}/safest-route`, {
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

      const routeResult = {
        startName: start,
        endName: end,
        risk_score: data.risk_score,
        distance_km: data.distance_km,
        estimated_time_min: data.estimated_time_min,
      };
      const insightData = await fetchRouteInsight(routeResult);

      setResult({
        risk_score: data.risk_score,
        distance_km: data.distance_km,
        estimated_time_hr: data.estimated_time_hr,
        estimated_time_min: data.estimated_time_min,
        path: data.path,
        startName: start,
        endName: end,
        aiInsight: insightData.insight || t("insight_text"),
        aiProvider: insightData.provider || aiSettings.provider,
        aiFallback: Boolean(insightData.fallback),
        aiLocale: locale,
      });
    } catch (err) {
      console.log("Route error:", err);
      alert(t("route_failed"));
    } finally {
      setLoading(false);
    }
  };

  // ⏱ Time formatter (FIXED)
  const formatTime = (hours?: number) => {
    if (hours === undefined || hours === null) return "N/A";

    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    return `${h} ${t("time_hour")} ${m} ${t("time_minute")}`;
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

        {/* 🌍 Language */}
        <div style={{ marginBottom: "15px" }}>
          <select
            onChange={(e) =>
              setLocale(e.target.value as "en" | "hi" | "te")
            }
            style={{ padding: "8px", width: "100%" }}
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="te">తెలుగు</option>
          </select>
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "6px",
            padding: "12px",
            marginBottom: "15px",
            background: "white",
          }}
        >
          <button
            type="button"
            onClick={() => setShowAISettings(!showAISettings)}
            style={{
              width: "100%",
              padding: "8px",
              background: "#f3f4f6",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {t("ai_settings")} · {aiSettings.provider}
          </button>

          {showAISettings && (
            <div style={{ marginTop: "12px" }}>
              <label style={{ display: "block", marginBottom: "6px" }}>
                {t("ai_provider")}
              </label>
              <select
                value={aiSettings.provider}
                onChange={(e) =>
                  updateAISettings({
                    ...aiSettings,
                    provider: e.target.value as AISettings["provider"],
                  })
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "10px",
                }}
              >
                <option value="offline">{t("ai_offline")}</option>
                <option value="ollama">{t("ai_ollama")}</option>
                <option value="openai">{t("ai_byok")}</option>
                <option value="openai-compatible">
                  {t("ai_openai_compatible")}
                </option>
              </select>

              <input
                placeholder={t("ai_base_url")}
                value={aiSettings.baseUrl}
                onChange={(e) =>
                  updateAISettings({
                    ...aiSettings,
                    baseUrl: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "10px",
                }}
              />

              <input
                placeholder={t("ai_model")}
                value={aiSettings.model}
                onChange={(e) =>
                  updateAISettings({
                    ...aiSettings,
                    model: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "10px",
                }}
              />

              <input
                placeholder={t("ai_byok_credential")}
                type="password"
                value={aiSettings.apiKey}
                onChange={(e) =>
                  updateAISettings({
                    ...aiSettings,
                    apiKey: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  padding: "8px",
                }}
              />
            </div>
          )}
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

        {/* RESULT */}
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
              <b>{t("status")}:</b>{" "}
              {t(getRiskStatusKey(result.risk_score))}
            </p>

            <p>
              <b>{t("route_points")}:</b> {result.path?.length || 0}
            </p>

            <p>
              <b>{t("distance")}:</b> {result.distance_km} km
            </p>

            {/* ⏱ FIXED TIME DISPLAY */}
            {result.estimated_time_hr !== undefined && (
              <p>
                <b>⏱ {t("estimated_time")}:</b>{" "}
                {formatTime(result.estimated_time_hr)}
              </p>
            )}

            <hr />

            <h4>{t("ai_insight")}</h4>
            <p>{result.aiInsight}</p>
            <p style={{ color: "#666", fontSize: "13px" }}>
              {t("ai_provider")}: {result.aiProvider}
              {result.aiFallback ? ` · ${t("ai_fallback")}` : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
