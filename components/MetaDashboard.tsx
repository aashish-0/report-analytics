"use client";
import { useEffect, useState } from 'react';
import { useReportStore } from "@/store/useReportStore";

// Removed the 'campaignData' prop since the component fetches its own data
export function MetaDashboard() {
    // 1. Moved the activeMetrics hook to the TOP LEVEL of the component
    const { selectedClient, activeMetrics } = useReportStore();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchLiveMetrics() {
            if (!selectedClient) return;

            setLoading(true);
            setError('');

            try {
                const res = await fetch(`/api/meta/campaigns?clientId=${selectedClient}`);

                const contentType = res.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("Server returned an invalid non-JSON response.");
                }

                const data = await res.json();

                if (data.success) {
                    setCampaigns(data.campaigns || []);
                } else if (data.error === 'not_connected') {
                    setError('not_connected');
                } else {
                    setError(data.error);
                }
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Failed to load campaign data');
                setCampaigns([]);
            } finally {
                setLoading(false);
            }
        }

        fetchLiveMetrics();
        window.addEventListener('refreshMetaAds', fetchLiveMetrics);
        return () => {
            window.removeEventListener('refreshMetaAds', fetchLiveMetrics);
        };
    }, [selectedClient]);

    // 2. Moved the formatValue helper outside the loop and added the Link Clicks logic into it
    const formatValue = (key: string, metrics: any) => {
        if (key === 'clicks') {
            const linkClicksAction = metrics.actions?.find((a: any) => a.action_type === 'link_click');
            return linkClicksAction ? linkClicksAction.value : '0';
        }

        const value = metrics[key];
        if (!value) return "0";
        if (key === 'spend' || key === 'cpm' || key === 'cpc') return `$${Number(value).toFixed(2)}`;
        if (key === 'ctr') return `${Number(value).toFixed(2)}%`;
        return Number(value).toLocaleString();
    };

    if (loading) return <div className="p-4 text-slate-500">Loading live Meta metrics...</div>;

    if (error === 'not_connected') {
        return (
            <div className="p-8 text-center bg-white border border-dashed border-slate-300 rounded-lg">
                <p className="text-slate-600 font-medium">No Meta account connected for this client.</p>
                <p className="text-sm text-slate-500 mt-1">Please click "Connect Meta Ads" above to authorize Facebook and view live analytics.</p>
            </div>
        );
    }

    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

    if (!campaigns.length) return <div className="p-4 text-slate-500">No active campaigns found. (If you just created one, it may take a moment to appear).</div>;

    return (
        <div className="space-y-4">
            {campaigns.map((campaign) => {
                const metrics = campaign.insights?.data?.[0] || {
                    spend: '0.00',
                    impressions: '0',
                    cpm: '0.00'
                };

                return (
                    <div key={campaign.id} className="p-4 border rounded-lg bg-white shadow-sm">
                        <h3 className="font-bold text-lg">{campaign.name}</h3>
                        <p className="text-xs uppercase tracking-wide font-semibold mt-1 mb-4">
                            Status: <span className={campaign.status === 'ACTIVE' ? 'text-green-600' : 'text-amber-500'}>{campaign.status}</span>
                        </p>

                        {/* 3. Render only the dynamically selected metrics, removed duplicate hardcoded blocks */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            {Object.keys(activeMetrics)
                                .filter((key) => activeMetrics[key])
                                .map((metricKey) => (
                                    <div key={metricKey} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                        <p className="text-sm text-slate-500 capitalize mb-1">
                                            {metricKey === 'clicks' ? 'Link Clicks' : metricKey.replace('_', ' ')}
                                        </p>
                                        <p className="text-2xl font-semibold text-slate-900">
                                            {/* 4. Pass the entire metrics object to the helper to correctly parse nested values */}
                                            {formatValue(metricKey, metrics)}
                                        </p>
                                    </div>
                                ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}