"use client";

import { useEffect, useState } from "react";
import { getBlackspots } from "@/lib/api";

export default function Dashboard() {
  const [spots, setSpots] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getBlackspots();
      setSpots(Array.isArray(data) ? data : data.blackspots || []);
    };

    fetchData();
  }, []);

  const topDangerous = [...spots]
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 5);

  const avgRisk =
    spots.reduce((sum, s) => sum + s.risk_score, 0) / (spots.length || 1);

  return (
    <div style={{ padding: 20 }}>
      <h1>🚦 SafeRoute AI Dashboard</h1>

      <h2>📊 Overview</h2>
      <p>Total Blackspots: {spots.length}</p>
      <p>Average Risk: {avgRisk.toFixed(2)}</p>

      <h2>🔥 Top Dangerous Areas</h2>
      <ul>
        {topDangerous.map((s) => (
          <li key={s.id}>
            {s.name} — Risk: {s.risk_score}
          </li>
        ))}
      </ul>
    </div>
  );
}
