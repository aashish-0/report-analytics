"use client";
import { useReportStore } from "@/store/useReportStore";
import { useIntegrationConnect } from "@/hooks/UseIntegrationConnect";

export function ConnectMetaAdsButton() {
  const { selectedClient } = useReportStore(); // the app's client id, never Nango's connectionId
  const { status, error, connect } = useIntegrationConnect(selectedClient, "facebook");

  const connected = status === "connected";
  const busy = status === "checking" || status === "connecting";

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={connect}
        disabled={!selectedClient || connected || busy}
        className={`${connected ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"
          } text-white font-medium px-4 py-2 rounded-md transition disabled:opacity-70`}
      >
        {connected
          ? "Meta Ads Connected ✓"
          : status === "connecting"
            ? "Connecting..."
            : status === "checking"
              ? "Checking..."
              : "Connect Meta Ads"}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}