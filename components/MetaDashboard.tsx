'use client';

import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

export default function MetaDashboard() {
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [allKeys, setAllKeys] = useState<string[]>([]);
    const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
    const [metricData, setMetricData] = useState<Record<string, any> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetch('/api/meta/mock')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    const keys = Object.keys(data.data);
                    setAllKeys(keys);
                    setSelectedMetrics(keys);
                }
            })
            .catch(err => console.error("Failed to load schema keys", err));
    }, []);

    const handleConnectAndFetch = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/meta/filter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ metrics: selectedMetrics.length > 0 ? selectedMetrics : allKeys })
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to sync Meta Ads data.');
            }

            setMetricData(result.data);
            setIsConnected(true);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateFilteredMetrics = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/meta/filter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ metrics: selectedMetrics })
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to update metrics.');
            }

            setMetricData(result.data);
            setIsModalOpen(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetMetrics = () => {
        setSelectedMetrics(allKeys);
        setSearchQuery('');
    };

    const toggleMetric = (key: string) => {
        setSelectedMetrics(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    // Helper to group keys into intelligent sections
    const getMetricsByCategory = (category: 'financial' | 'engagement' | 'video' | 'attribution' | 'other') => {
        if (!metricData) return {};
        const keys = Object.keys(metricData);

        return keys.reduce((acc: Record<string, any>, key) => {
            const lower = key.toLowerCase();
            if (category === 'financial' && (lower.includes('spend') || lower.includes('cpc') || lower.includes('cpm') || lower.includes('ctr') || lower.includes('cost'))) {
                acc[key] = metricData[key];
            } else if (category === 'engagement' && (lower.includes('click') || lower.includes('impression') || lower.includes('reach') || lower.includes('engagement') || lower.includes('lead') || lower.includes('purchase'))) {
                if (!lower.includes('video') && !lower.includes('cost_per')) acc[key] = metricData[key];
            } else if (category === 'video' && lower.includes('video')) {
                acc[key] = metricData[key];
            } else if (category === 'attribution' && (lower.includes('1d') || lower.includes('7d') || lower.includes('28d') || lower.includes('action'))) {
                acc[key] = metricData[key];
            } else if (category === 'other') {
                const isMatched = Object.keys(getMetricsByCategory('financial')).includes(key) ||
                    Object.keys(getMetricsByCategory('engagement')).includes(key) ||
                    Object.keys(getMetricsByCategory('video')).includes(key) ||
                    Object.keys(getMetricsByCategory('attribution')).includes(key);
                if (!isMatched) acc[key] = metricData[key];
            }
            return acc;
        }, {});
    };

    const filteredKeys = allKeys.filter(k => k.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8 font-sans">
            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-200 p-6 rounded-2xl shadow-sm gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Meta Ads Performance Hub</h1>
                    <p className="text-slate-500 text-sm mt-1">Enterprise multi-section analytics engine categorized for deep visibility.</p>
                </div>

                {!isConnected ? (
                    <button
                        onClick={handleConnectAndFetch}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        {loading ? 'Connecting Account...' : 'Connect Meta Ads'}
                    </button>
                ) : (
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                        >
                            Filter Metrics ({selectedMetrics.length})
                        </button>
                        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-200 text-sm font-semibold">
                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            Connected & Synced
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium">
                    {error}
                </div>
            )}

            {/* Categorized Sections View */}
            {isConnected && metricData && (
                <div className="space-y-8">

                    {/* Section 1: Financial & Efficiency Metrics */}
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="w-3 h-3 bg-blue-600 rounded-full"></span> Financial & Cost Efficiency
                            </h3>
                            <p className="text-xs text-slate-500">Ad spend, cost-per-click, CPM, and core budgetary pacing metrics.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(getMetricsByCategory('financial')).map(([key, val]) => (
                                <div key={key} className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                                    <p className="text-xs font-semibold text-slate-500 uppercase truncate">{key.replace(/_/g, ' ')}</p>
                                    <p className="text-xl font-bold text-slate-900 mt-1 truncate">{String(val)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 2: Engagement & Reach Delivery */}
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="w-3 h-3 bg-indigo-600 rounded-full"></span> Delivery, Reach & Engagement
                            </h3>
                            <p className="text-xs text-slate-500">Impressions, unique reach, frequency, clicks, and conversions.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(getMetricsByCategory('engagement')).map(([key, val]) => (
                                <div key={key} className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                                    <p className="text-xs font-semibold text-slate-500 uppercase truncate">{key.replace(/_/g, ' ')}</p>
                                    <p className="text-xl font-bold text-slate-900 mt-1 truncate">{String(val)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 3: Video Performance */}
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="w-3 h-3 bg-amber-500 rounded-full"></span> Video Interaction & Watch Time
                            </h3>
                            <p className="text-xs text-slate-500">Video quartile views, plays, and engagement milestones.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(getMetricsByCategory('video')).map(([key, val]) => (
                                <div key={key} className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                                    <p className="text-xs font-semibold text-slate-500 uppercase truncate">{key.replace(/_/g, ' ')}</p>
                                    <p className="text-xl font-bold text-slate-900 mt-1 truncate">{String(val)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 4: Attribution Windows & Actions */}
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="w-3 h-3 bg-emerald-600 rounded-full"></span> Attribution Windows & Custom Actions
                            </h3>
                            <p className="text-xs text-slate-500">1-day, 7-day, and 28-day conversion breakdowns.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(getMetricsByCategory('attribution')).map(([key, val]) => (
                                <div key={key} className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                                    <p className="text-xs font-semibold text-slate-500 uppercase truncate">{key.replace(/_/g, ' ')}</p>
                                    <div className="text-sm font-bold text-slate-900 mt-1 overflow-x-auto">
                                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            )}

            {/* Interactive Filter Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Configure Report Metrics</h3>
                                <p className="text-slate-500 text-xs mt-0.5">Select specific data points to render across dashboard sections.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 cursor-pointer">✕</button>
                        </div>

                        <div className="p-4 border-b border-slate-100 bg-white flex items-center gap-3">
                            <input
                                type="text"
                                placeholder="Search metrics..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button onClick={handleResetMetrics} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 cursor-pointer">
                                Select All / Reset
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {filteredKeys.map(key => (
                                <label
                                    key={key}
                                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${selectedMetrics.includes(key) ? 'border-blue-500 bg-blue-50/40 text-blue-900' : 'border-slate-200 bg-white text-slate-700'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedMetrics.includes(key)}
                                        onChange={() => toggleMetric(key)}
                                        className="rounded text-blue-600 w-4 h-4 cursor-pointer"
                                    />
                                    <span className="truncate" title={key}>{key}</span>
                                </label>
                            ))}
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                            <span className="text-xs text-slate-500 font-medium">{selectedMetrics.length} of {allKeys.length} selected</span>
                            <div className="flex gap-3">
                                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-100 cursor-pointer">Cancel</button>
                                <button onClick={handleUpdateFilteredMetrics} disabled={loading || selectedMetrics.length === 0} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-semibold shadow-md cursor-pointer disabled:opacity-50">
                                    {loading ? 'Updating...' : 'Update Meta Metrics'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}