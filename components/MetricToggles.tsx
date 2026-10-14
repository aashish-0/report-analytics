"use client";
import { useState } from 'react';
import { useReportStore } from "@/store/useReportStore";

const formatLabel = (key: string) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

export function MetricToggles() {
    const { selectedClient, activeMetrics, toggleMetric } = useReportStore();
    const [isSaving, setIsSaving] = useState(false);

    const saveConfiguration = async () => {
        if (!selectedClient) return alert("Please select a client first.");
        setIsSaving(true);

        try {
            const res = await fetch('/api/templates/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId: selectedClient, metrics: activeMetrics })
            });
            if (!res.ok) throw new Error("Failed to save");
            alert("Report configuration saved!");
        } catch (error) {
            console.error(error);
            alert("Error saving configuration.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Display Metrics</h3>
                <button onClick={saveConfiguration} disabled={isSaving} className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-800 disabled:opacity-50">
                    {isSaving ? "Saving..." : "Save Configuration"}
                </button>
            </div>
            <div className="flex flex-wrap gap-3">
                {Object.entries(activeMetrics).map(([key, isActive]) => (
                    <button key={key} onClick={() => toggleMetric(key)} className={`px-4 py-2 rounded-full text-sm font-medium transition ${isActive ? "bg-indigo-100 text-indigo-700 border border-indigo-200" : "bg-slate-50 text-slate-600 border border-slate-200"}`}>
                        {formatLabel(key)} {isActive && "✓"}
                    </button>
                ))}
            </div>
        </div>
    );
}