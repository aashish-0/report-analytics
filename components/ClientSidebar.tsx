"use client";
import { useEffect, useState } from "react";
import { useReportStore } from "@/store/useReportStore";
import { AddClientModal, type Client } from "@/components/AddClientModal";

export function ClientSidebar() {
  const { selectedClient, setClient } = useReportStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Load this user's clients; select the first one if nothing valid is selected
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/clients");
        const data = await res.json();
        const list: Client[] = data.clients ?? [];
        setClients(list);
        if (list.length && !list.some((c) => c.id === selectedClient)) {
          setClient(list[0].id);
        }
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreated = (client: Client) => {
    setClients((prev) => [...prev, client]);
    setClient(client.id);
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Clients</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-700"
        >
          + Add
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : clients.length === 0 ? (
        <p className="text-sm text-slate-500">No clients yet. Click "+ Add" to create your first one.</p>
      ) : (
        <ul className="space-y-2">
          {clients.map((client) => (
            <li key={client.id}>
              <button
                onClick={() => setClient(client.id)}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${selectedClient === client.id
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
      )}

      <AddClientModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}