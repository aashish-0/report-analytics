import { create } from 'zustand';

interface ReportState {
    selectedClient: string | null;
    activeMetrics: Record<string, boolean>;
    setClient: (clientId: string) => void;
    toggleMetric: (metricId: string) => void;
}

export const useReportStore = create<ReportState>((set) => ({
    selectedClient: null,
    activeMetrics: {
        totalSpend: true,
        cpa: true,
        roas: true,
        clicks: false, // Defaulting secondary metrics to false
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