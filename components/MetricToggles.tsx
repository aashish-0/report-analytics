"use client";
import { useReportStore } from "@/store/useReportStore";

const AVAILABLE_METRICS = [
  { id: "totalSpend", label: "Total Ad Spend" },
  { id: "cpa", label: "Cost Per Acquisition (CPA)" },
  { id: "roas", label: "Return on Ad Spend (ROAS)" },
  { id: "clicks", label: "Total Link Clicks" },
  { id: "impressions", label: "Total Impressions" },
];

export function MetricToggles() {
  const { activeMetrics, toggleMetric } = useReportStore();

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Report Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AVAILABLE_METRICS.map((metric) => {
          const isActive = activeMetrics[metric.id];
          return (
            <label 
              key={metric.id} 
              className="flex items-center space-x-3 cursor-pointer p-3 border rounded hover:bg-slate-50 transition"
            >
              <input
                type="checkbox"
                checked={isActive || false}
                onChange={() => toggleMetric(metric.id)}
                className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-slate-800">{metric.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}