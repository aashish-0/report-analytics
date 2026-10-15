"use client";
import { useEffect, useState } from 'react';
import Nango from '@nangohq/frontend';
import { useReportStore } from "@/store/useReportStore";

const INTEGRATION = 'facebook';

async function requestSession(clientId: string, checkOnly = false) {
  const res = await fetch('/api/nango/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ integrationId: INTEGRATION, clientId, checkOnly }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(JSON.stringify(data.error));
  return data as { connected: boolean; token?: string };
}

export function ConnectMetaAdsButton() {
  const { selectedClient } = useReportStore(); // app's client id, never Nango's connectionId
  const [isConnected, setIsConnected] = useState(false);

  // On load / client switch: status check only (no session token created)
  useEffect(() => {
    if (!selectedClient) {
      setIsConnected(false);
      return;
    }
    requestSession(selectedClient, true)
      .then((d) => setIsConnected(d.connected))
      .catch(() => setIsConnected(false));
  }, [selectedClient]);

  const handleConnect = async () => {
    if (!selectedClient) return alert("Select or add a client first.");
    try {
      const data = await requestSession(selectedClient);

      if (data.connected) { // reused existing connection, no popup
        setIsConnected(true);
        window.dispatchEvent(new Event('refreshMetaAds'));
        return;
      }

      const nango = new Nango({ connectSessionToken: data.token! });
      const result = await nango.auth(INTEGRATION);

      // Save right away (webhook also does this; both are upserts)
      const save = await fetch('/api/nango/connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integrationId: INTEGRATION,
          clientId: selectedClient,
          connectionId: result.connectionId,
        }),
      });
      if (!save.ok) {
        // Not fatal if the webhook saves it, but log so it's visible
        console.error('Saving connection failed:', await save.text());
      }

      setIsConnected(true);
      window.dispatchEvent(new Event('refreshMetaAds'));
    } catch (error) {
      console.error("Nango connection failed", error);
      alert("Failed to connect Meta account.");
    }
  };

  return (
    <button
      onClick={handleConnect}
      disabled={isConnected}
      className={`${isConnected ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
        } text-white font-medium px-4 py-2 rounded-md transition disabled:opacity-80`}
    >
      {isConnected ? "Meta Ads Connected ✓" : "Connect Meta Ads"}
    </button>
  );
}