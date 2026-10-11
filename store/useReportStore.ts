import { create } from 'zustand';

export interface Client {
    id: string;
    name: string;
    metaAdsConnected: boolean;
}

interface ReportState {
    clients: Client[];
    clientsLoaded: boolean;
    selectedClient: string | null;
    setClient: (clientId: string | null) => void;
    loadClients: () => Promise<void>;
}

export const useReportStore = create<ReportState>((set) => ({
    clients: [],
    clientsLoaded: false,
    selectedClient: null,
    setClient: (clientId) => set({ selectedClient: clientId }),
    loadClients: async () => {
        const res = await fetch('/api/clients');
        if (!res.ok) return;
        const clients: Client[] = await res.json();
        set((state) => ({
            clients,
            clientsLoaded: true,
            // drop the selection if that client no longer exists
            selectedClient: clients.some((c) => c.id === state.selectedClient) ? state.selectedClient : null,
        }));
    },
}));
