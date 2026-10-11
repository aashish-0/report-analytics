"use client";
import { useState } from "react";
import { MetricToggles } from "@/components/MetricToggles";
import { ConnectMetaAdsButton } from "@/components/ConnectMetaAdsButton";
import { ReportHistory } from "@/components/ReportHistory";
import { useReportStore } from "@/store/useReportStore";

function lastMonth() {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function DashboardPage() {
  const { selectedClient, clients } = useReportStore();
  const client = clients.find((c) => c.id === selectedClient);
  const [period, setPeriod] = useState(lastMonth());
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [historyKey, setHistoryKey] = useState(0);

  if (!client) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        <p>Select a client from the sidebar to configure their report.</p>
      </div>
    );
  }

  const handleGenerate = async () => {
    setGenerating(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/clients/${client.id}/reports`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ period }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Report generation failed");
      setMessage({ ok: true, text: `Report for ${body.label} generated.` });
      setHistoryKey((k) => k + 1);
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "Report generation failed" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{client.name}</h2>
          <p className="text-slate-500 mt-1">Select the metrics to include in the report.</p>
        </div>
        <ConnectMetaAdsButton />
      </div>

      <MetricToggles key={client.id} />

      <div className="border-t border-slate-200 pt-6 space-y-3">
        <div className="flex items-end justify-end gap-4">
          <div>
            <label htmlFor="period" className="block text-sm font-medium text-slate-700">Reporting month</label>
            <input
              id="period"
              type="month"
              value={period}
              max={new Date().toISOString().slice(0, 7)}
              onChange={(e) => setPeriod(e.target.value)}
              className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating || !client.metaAdsConnected || !period}
            className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? "Generating…" : "Generate Monthly Report"}
          </button>
        </div>
        {!client.metaAdsConnected && (
          <p className="text-sm text-slate-500 text-right">Connect Meta Ads first so there&apos;s data to report on.</p>
        )}
        {message && (
          <p role="status" className={`text-sm text-right ${message.ok ? "text-emerald-700" : "text-red-600"}`}>
            {message.text}
          </p>
        )}
      </div>

      <ReportHistory clientId={client.id} refreshKey={historyKey} />
    </div>
  );
}
