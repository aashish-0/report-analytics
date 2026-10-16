"use client";
import { useState } from "react";
import { useIntegrationConnect } from "@/hooks/UseIntegrationConnect";

export type Client = { id: string; name: string };

type Props = {
    open: boolean;
    onClose: () => void;
    onCreated: (client: Client) => void; // called as soon as the client exists
};

export function AddClientModal({ open, onClose, onCreated }: Props) {
    const [name, setName] = useState("");
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [created, setCreated] = useState<Client | null>(null);

    // Only used in step 2 (created is null in step 1 -> hook stays idle)
    const { status, error: connectError, connect } = useIntegrationConnect(created?.id, "facebook");

    if (!open) return null;

    const close = () => {
        setName("");
        setCreated(null);
        setCreateError(null);
        onClose();
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || creating) return;
        setCreating(true);
        setCreateError(null);
        try {
            const res = await fetch("/api/clients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || "Could not create client");
            setCreated(data.client); // move to step 2. No session is created here.
            onCreated(data.client);
        } catch (err: any) {
            setCreateError(err.message);
        } finally {
            setCreating(false);
        }
    };

    const connected = status === "connected";
    const busy = status === "checking" || status === "connecting";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div role="dialog" aria-modal="true" aria-labelledby="add-client-title"
                className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                {!created ? (
                    <form onSubmit={handleCreate}>
                        <h2 id="add-client-title" className="text-lg font-semibold text-slate-900">Add client</h2>
                        <p className="mt-1 text-sm text-slate-500">Create a client, then connect their ad accounts.</p>

                        <label htmlFor="client-name" className="mt-5 block text-sm font-medium text-slate-700">
                            Client name
                        </label>
                        <input
                            id="client-name"
                            autoFocus
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Acme Dental"
                            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        />
                        {createError && <p className="mt-2 text-sm text-red-600">{createError}</p>}

                        <div className="mt-6 flex justify-end gap-2">
                            <button type="button" onClick={close}
                                className="rounded-md px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">
                                Cancel
                            </button>
                            <button type="submit" disabled={creating || !name.trim()}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
                                {creating ? "Creating..." : "Create client"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div>
                        <h2 id="add-client-title" className="text-lg font-semibold text-slate-900">
                            Connect {created.name}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Client created. Link their Meta Ads account now, or do it later from the dashboard.
                        </p>

                        <div className="mt-5 flex items-center justify-between rounded-lg border border-slate-200 p-4">
                            <div>
                                <p className="text-sm font-medium text-slate-900">Meta Ads</p>
                                <p className="text-xs text-slate-500">
                                    {connected ? "Connected" : "Not connected"}
                                </p>
                            </div>
                            <button
                                onClick={connect}
                                disabled={connected || busy}
                                className={`${connected ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"
                                    } rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-70`}
                            >
                                {connected ? "Connected ✓" : status === "connecting" ? "Connecting..." :
                                    status === "checking" ? "Checking..." : "Connect with Meta"}
                            </button>
                        </div>
                        {connectError && <p className="mt-2 text-sm text-red-600">{connectError}</p>}

                        <div className="mt-6 flex justify-end">
                            <button onClick={close}
                                className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900">
                                {connected ? "Done" : "Skip for now"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}