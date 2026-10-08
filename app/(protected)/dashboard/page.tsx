"use client";
import { MetricToggles } from "@/components/MetricToggles";
import { ConnectMetaAdsButton } from "@/components/ConnectMetaAdsButton";
import { useReportStore } from "@/store/useReportStore";

export default function DashboardPage() {
  const { selectedClient } = useReportStore();

  // This function definition resolves the ts(2304) error
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
    <div className="max-w-4xl space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Client Configuration</h2>
          <p className="text-slate-500 mt-1">Select the metrics to include in the report.</p>
        </div>
        <ConnectMetaAdsButton />
      </div>

      <MetricToggles />

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