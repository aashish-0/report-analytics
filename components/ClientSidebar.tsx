"use client";
import { useEffect, useState } from "react";
import { useReportStore } from "@/store/useReportStore";

type Client = { id: string; name: string };

export function ClientSidebar() {
  const { selectedClient, setClient } = useReportStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);

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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || adding) return;
    setAdding(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed");
      setClients((prev) => [...prev, data.client]);
      setClient(data.client.id);
      setName("");
    } catch (err) {
      console.error(err);
      alert("Could not add client.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
        Active Clients
      </h2>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : (
        <>
          {clients.length === 0 && (
            <p className="text-sm text-slate-500 mb-3">No clients yet. Add your first one below.</p>
          )}
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

          <form onSubmit={handleAdd} className="mt-4 flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New client name"
              className="flex-1 min-w-0 border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={adding || !name.trim()}
              className="bg-indigo-600 text-white px-3 py-2 rounded-md text-sm disabled:opacity-50"
            >
              {adding ? "..." : "Add"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}