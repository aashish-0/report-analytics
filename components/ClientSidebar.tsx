"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Logo } from "@/components/Logo";
import { useReportStore, type Client } from "@/store/useReportStore";

type Dialog = { mode: "create" } | { mode: "rename"; client: Client } | { mode: "delete"; client: Client } | null;

export function ClientSidebar() {
  const { clients, clientsLoaded, selectedClient, setClient, loadClients } = useReportStore();
  const { data: session } = authClient.useSession();
  const [dialog, setDialog] = useState<Dialog>(null);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const logout = async () => {
    await authClient.signOut();
    window.location.href = "/sign-in";
  };

  return (
    <div className="flex flex-col h-full p-4">
      <Link href="/dashboard" aria-label="Dashboard home" className="block px-1 pb-4 mb-4 border-b border-slate-200">
        <Logo />
      </Link>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Clients</h2>
        <button
          onClick={() => setDialog({ mode: "create" })}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          aria-label="Add client"
        >
          + Add
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!clientsLoaded ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : clients.length === 0 ? (
          <p className="text-sm text-slate-500">No clients yet. Add your first one.</p>
        ) : (
          <ul className="space-y-2">
            {clients.map((client) => (
              <li key={client.id} className="group flex items-center">
                <button
                  onClick={() => setClient(client.id)}
                  className={`flex-1 text-left px-4 py-2 rounded-md transition-colors truncate ${
                    selectedClient === client.id
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                  aria-current={selectedClient === client.id ? "page" : undefined}
                >
                  {client.name}
                </button>
                <div className="hidden group-hover:flex pl-1 text-xs">
                  <button
                    onClick={() => setDialog({ mode: "rename", client })}
                    className="px-1 text-slate-400 hover:text-slate-700"
                    aria-label={`Rename ${client.name}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDialog({ mode: "delete", client })}
                    className="px-1 text-slate-400 hover:text-red-600"
                    aria-label={`Delete ${client.name}`}
                  >
                    Del
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-slate-200 pt-3 mt-3">
        <p className="truncate text-sm font-medium text-slate-800">{session?.user.name}</p>
        <p className="truncate text-xs text-slate-500 mb-2">{session?.user.email}</p>
        <button onClick={logout} className="text-sm text-slate-600 hover:text-slate-900">
          Log out
        </button>
      </div>

      {dialog && <ClientDialog dialog={dialog} onClose={() => setDialog(null)} />}
    </div>
  );
}

function ClientDialog({ dialog, onClose }: { dialog: NonNullable<Dialog>; onClose: () => void }) {
  const { loadClients, setClient } = useReportStore();
  const [name, setName] = useState(dialog.mode === "rename" ? dialog.client.name : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      let res: Response;
      if (dialog.mode === "create") {
        res = await fetch("/api/clients", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name }),
        });
      } else if (dialog.mode === "rename") {
        res = await fetch(`/api/clients/${dialog.client.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name }),
        });
      } else {
        res = await fetch(`/api/clients/${dialog.client.id}`, { method: "DELETE" });
      }
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Something went wrong.");
      await loadClients();
      if (dialog.mode === "create") setClient(body.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
      <form onSubmit={submit} className="bg-white rounded-lg shadow-md w-96 p-6">
        {dialog.mode === "delete" ? (
          <>
            <h3 className="text-lg font-semibold text-slate-900">Delete {dialog.client.name}?</h3>
            <p className="text-sm text-slate-600 mt-2">
              This removes the client, its report settings and all generated reports. This can&apos;t be undone.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-slate-900">
              {dialog.mode === "create" ? "Add client" : "Rename client"}
            </h3>
            <label className="block text-sm font-medium text-slate-700 mt-4">Client name</label>
            <input
              autoFocus
              value={name}
              maxLength={100}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bright Smile Dental"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </>
        )}
        {error && <p role="alert" className="text-sm text-red-600 mt-3">{error}</p>}
        <div className="flex justify-end gap-2 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className={`px-4 py-2 text-sm text-white rounded-md disabled:opacity-50 ${
              dialog.mode === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {dialog.mode === "delete" ? "Delete" : dialog.mode === "create" ? "Add client" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
