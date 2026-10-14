"use client";
import { useState } from "react";
import { ConnectMetaAdsButton } from "@/components/ConnectMetaAdsButton";
import { MetaDashboard } from "@/components/MetaDashboard";
import { MetricToggles } from "@/components/MetricToggles";
import { useReportStore } from "@/store/useReportStore";

export default function DashboardPage() {
  const [showCharts, setShowCharts] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { selectedClient } = useReportStore();

  const handleGenerate = async () => {
    if (!selectedClient) {
      alert("Please connect a Meta Ads account before generating a report.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`/api/reports/generate?clientId=${selectedClient}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to generate report");
      }

      // Convert response stream to a downloadable Blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Meta_Ads_Report_${selectedClient}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong while generating the PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-8 pb-12">
      <div className="flex justify-between items-start border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Reporting Configuration</h2>
          <p className="text-slate-500 mt-1">Connect ad channels to preview live metrics.</p>
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

      {showCharts && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Meta Ads Visual Performance Payload</h3>
          <MetaDashboard />
        </div>
      )}

      <MetricToggles />

      <div className="flex justify-end border-t border-slate-200 pt-6">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? "Generating Report..." : "Generate Monthly Report"}
        </button>
      </div>
    </div>
  );
}