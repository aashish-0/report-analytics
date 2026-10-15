import { create } from 'zustand';

interface ReportState {
    selectedClient: string; // Removed the | null
    activeMetrics: Record<string, boolean>;
    setClient: (clientId: string) => void;
    toggleMetric: (metricId: string) => void;
}

export const useReportStore = create<ReportState>((set) => ({
    // Initialize with a default ID so the dashboard is instantly active
    selectedClient: '',
    activeMetrics: {
        spend: true,
        impressions: true,
        cpm: true,
        cpc:true,
        ctr: true,
        reach: false,
        totalSpend: true,
        cpa: true,
        roas: true,
        clicks: false,
        frequency: false,
    },
    setClient: (clientId) => set({ selectedClient: clientId }),
    toggleMetric: (metricId) =>
        set((state) => ({
            activeMetrics: {
                ...state.activeMetrics,
                [metricId]: !state.activeMetrics[metricId],
            },
        })),
}));