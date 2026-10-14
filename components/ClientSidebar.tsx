"use client";
import { useReportStore } from "@/store/useReportStore";

// Mock data until we query the Neon DB
const MOCK_CLIENTS = [
  { id: "1", name: "Acme Dental" },
  // { id: "2", name: "Summit Real Estate" },
];

export function ClientSidebar() {
  const { selectedClient, setClient } = useReportStore();

  return (
    <div className="flex flex-col h-full p-4">
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
        Active Clients
      </h2>
      <ul className="space-y-2">
        {MOCK_CLIENTS.map((client) => (
          <li key={client.id}>
            <button
              onClick={() => setClient(client.id)}
              className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                selectedClient === client.id
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
              aria-current={selectedClient === client.id ? "page" : undefined}
            >
              {client.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}