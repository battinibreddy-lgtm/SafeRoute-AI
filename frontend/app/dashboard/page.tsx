"use client";

import { useI18n } from "../../i18n/provider";

export default function Dashboard() {
  const { t, setLocale } = useI18n();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      <p className="mt-2 text-gray-600">{t("subtitle")}</p>

      {/* Controls */}
      <div className="mt-6 space-x-3">
        <button className="px-4 py-2 bg-blue-500 text-white rounded">
          {t("start")}
        </button>

        <button className="px-4 py-2 bg-green-500 text-white rounded">
          {t("predict")}
        </button>

        <button className="px-4 py-2 bg-gray-700 text-white rounded">
          {t("map")}
        </button>
      </div>

      {/* Language switcher */}
      <div className="mt-6">
        <select
          onChange={(e) => setLocale(e.target.value as any)}
          className="border p-2 rounded"
        >
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="te">తెలుగు</option>
        </select>
      </div>
    </div>
  );
}
