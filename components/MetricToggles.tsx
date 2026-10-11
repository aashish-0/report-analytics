"use client";
import { useEffect, useState } from "react";
import { useReportStore } from "@/store/useReportStore";
import { DEFAULT_METRIC_SETTINGS, METRICS, type MetricKey, type MetricSettings } from "@/lib/reports/metrics";

export function MetricToggles() {
  const { selectedClient } = useReportStore();
  const [settings, setSettings] = useState<MetricSettings>(DEFAULT_METRIC_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedClient) return;
    let cancelled = false;
    fetch(`/api/clients/${selectedClient}/settings`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((s) => {
        if (cancelled) return;
        setSettings(s);
        setError("");
      })
      .catch(() => !cancelled && setError("Couldn't load metric settings."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [selectedClient]);

  const toggle = async (key: MetricKey) => {
    const previous = settings;
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next); // optimistic
    setError("");
    const res = await fetch(`/api/clients/${selectedClient}/settings`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(next),
    });
    if (!res.ok) {
      setSettings(previous);
      setError("Couldn't save your change. Try again.");
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-1">Report Metrics</h3>
      <p className="text-sm text-slate-500 mb-4">Only ticked metrics appear in the PDF. Changes save automatically.</p>
      {error && <p role="alert" className="text-sm text-red-600 mb-3">{error}</p>}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${loading ? "opacity-50" : ""}`}>
        {METRICS.map((metric) => (
          <label
            key={metric.key}
            className="flex items-center space-x-3 cursor-pointer p-3 border rounded hover:bg-slate-50 transition"
          >
            <input
              type="checkbox"
              checked={settings[metric.key]}
              disabled={loading}
              onChange={() => toggle(metric.key)}
              className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span className="text-slate-800">{metric.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
