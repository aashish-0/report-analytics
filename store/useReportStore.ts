import { create } from 'zustand';

interface ReportState {
    activeMetrics: Record<string, boolean>;
    toggleMetric: (metricId: string) => void;
}

export const useReportStore = create<ReportState>((set) => ({
    activeMetrics: {
        totalSpend: true,
        cpa: true,
        roas: true,
        clicks: false, // Defaulting secondary metrics to false
    },
    toggleMetric: (metricId) =>
        set((state) => ({
            activeMetrics: {
                ...state.activeMetrics,
                [metricId]: !state.activeMetrics[metricId],
            },
        })),
}));