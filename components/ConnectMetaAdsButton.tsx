"use client";
import { useState } from 'react';
import Nango from '@nangohq/frontend';
import { useReportStore } from "@/store/useReportStore";

export function ConnectMetaAdsButton() {
  // ✨ NEW: Destructure setClient so we can update the active ID
  const { selectedClient, setClient } = useReportStore();
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = async () => {
    try {
      const res = await fetch('/api/nango/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integrationId: 'facebook',
          endUserId: selectedClient
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(JSON.stringify(data.error));
      }

      const nango = new Nango({ connectSessionToken: data.token });

      // Open the popup and wait for the user to log in
      const result = await nango.auth('facebook');

      console.log("Successfully connected Meta Ads:", result.connectionId);

      // ✨ NEW: Update your app to use Nango's real connection ID instead of "primary-user"
      if (result.connectionId) {
        setClient(result.connectionId);
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
      className={`${isConnected
          ? "bg-green-600 hover:bg-green-700"
          : "bg-blue-600 hover:bg-blue-700"
        } text-white font-medium px-4 py-2 rounded-md transition disabled:opacity-80`}
    >
      {isConnected ? "Meta Ads Connected ✓" : "Connect Meta Ads"}
    </button>
  );
}