"use client";
import Nango from '@nangohq/frontend';
import { useReportStore } from "@/store/useReportStore";

export function ConnectMetaAdsButton() {
  const { selectedClient } = useReportStore();

  const handleConnect = async () => {
    if (!selectedClient) {
      alert("Please select a client from the sidebar first.");
      return;
    }

    // Initialize Nango with your public key from the .env file
    const nango = new Nango({ publicKey: process.env.NEXT_PUBLIC_NANGO_KEY! });

    try {
      // We explicitly pass selectedClient to Nango to lock the mapping
      const result = await nango.auth('meta-ads', selectedClient);
      console.log("Successfully connected Meta Ads for client:", result.connectionId);
      // Here you would trigger a UI toast notification
    } catch (error) {
      console.error("Nango connection failed", error);
    }
  };

  return (
    <button 
      onClick={handleConnect} 
      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition"
    >
      Connect Meta Ads
    </button>
  );
}