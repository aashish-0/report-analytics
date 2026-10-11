"use client";
import { useState } from "react";
import Nango from '@nangohq/frontend';
import { useReportStore } from "@/store/useReportStore";

export function ConnectMetaAdsButton() {
  const { selectedClient, clients, loadClients } = useReportStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const connected = clients.find((c) => c.id === selectedClient)?.metaAdsConnected;

  const handleConnect = async () => {
    if (!selectedClient) return;
    setBusy(true);
    setError("");
    try {
      const publicKey = process.env.NEXT_PUBLIC_NANGO_KEY;
      if (publicKey) {
        // Real flow: Nango runs the OAuth, then its webhook marks the client connected
        const nango = new Nango({ publicKey });
        await nango.auth('meta-ads', selectedClient);
      } else {
        // No Nango key configured: simulate the connection for local development
        const res = await fetch(`/api/clients/${selectedClient}/connect`, { method: "POST" });
        if (!res.ok) throw new Error((await res.json()).error || "Couldn't connect Meta Ads");
      }
      await loadClients();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't connect Meta Ads");
    } finally {
      setBusy(false);
    }
  };

  if (connected) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
        Meta Ads connected
      </span>
    );
  }

  return (
    <div className="text-right">
      <button
        onClick={handleConnect}
        disabled={busy}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-md transition"
      >
        {busy ? "Connecting…" : "Connect Meta Ads"}
      </button>
      {error && <p role="alert" className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
