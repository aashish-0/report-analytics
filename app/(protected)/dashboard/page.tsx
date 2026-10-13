"use client";
import { useState } from "react";
import { MetricToggles } from "@/components/MetricToggles";
import { ConnectMetaAdsButton } from "@/components/ConnectMetaAdsButton";
import { useReportStore } from "@/store/useReportStore";
import MetaDashboard from "@/components/MetaDashboard";

export default function DashboardPage() {
  const { selectedClient } = useReportStore();
  const [showCharts, setShowCharts] = useState(false);

  const handleGenerate = async () => {
    alert("Triggering headless browser to generate PDF...");
  };

  if (!selectedClient) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        <p>Select a client from the sidebar to configure their report.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8 pb-12">
      {/* Header section with connection triggers */}
      <div className="flex justify-between items-start border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Client Configuration</h2>
          <p className="text-slate-500 mt-1">Select metrics and preview live connected ad channels.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCharts(!showCharts)}
            className="bg-slate-800 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-slate-900 transition shadow"
          >
            {showCharts ? "Hide Visual Analytics" : "View Graphical Analytics"}
          </button>
          <ConnectMetaAdsButton />
        </div>
      </div>

      {/* Conditionally expand the graphical view when toggled */}
      {showCharts && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Meta Ads Visual Performance Payload</h3>
          <MetaDashboard />
        </div>
      )}

      {/* Existing Metric Toggles */}
      <MetricToggles />

      {/* Footer Generation Action */}
      <div className="flex justify-end border-t border-slate-200 pt-6">
        <button
          onClick={handleGenerate}
          className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition shadow"
        >
          Generate Monthly Report
        </button>
      </div>
    </div>
  );
}