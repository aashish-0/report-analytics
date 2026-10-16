"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Nango from "@nangohq/frontend";

export type ConnectStatus = "checking" | "disconnected" | "connecting" | "connected";

const CHANGED_EVENT = "integration:changed";

async function api<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init);
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.success === false) {
        throw new Error(data?.error || `Request failed (${res.status})`);
    }
    return data as T;
}

/**
 * Connect flow for one client + one integration:
 *   click -> 1) check existing connection  -> reuse it if found
 *            2) otherwise open Nango Connect UI
 *            3) only then request a session token
 *            4) on success, save the connection
 *
 * The Connect UI is an iframe, so it is never blocked by the browser
 * (the old nango.auth() popup was blocked because it ran after an `await`).
 */
export function useIntegrationConnect(clientId: string | null | undefined, integrationId: string) {
    const [status, setStatus] = useState<ConnectStatus>("checking");
    const [error, setError] = useState<string | null>(null);
    const latestClient = useRef(clientId);
    latestClient.current = clientId;

    const check = useCallback(async () => {
        return api<{ connected: boolean }>(
            `/api/nango/connection?clientId=${encodeURIComponent(clientId!)}&integrationId=${integrationId}`,
        );
    }, [clientId, integrationId]);

    // Status on load / client switch (does NOT create a session)
    useEffect(() => {
        setError(null);
        if (!clientId) {
            setStatus("disconnected");
            return;
        }
        let cancelled = false;
        setStatus("checking");
        check()
            .then((d) => !cancelled && setStatus(d.connected ? "connected" : "disconnected"))
            .catch(() => !cancelled && setStatus("disconnected"));
        return () => {
            cancelled = true;
        };
    }, [clientId, check]);

    // Keep every component showing the same client in sync (modal <-> dashboard button)
    useEffect(() => {
        const onChanged = (e: Event) => {
            const d = (e as CustomEvent).detail;
            if (d?.clientId === clientId && d?.integrationId === integrationId) setStatus("connected");
        };
        window.addEventListener(CHANGED_EVENT, onChanged);
        return () => window.removeEventListener(CHANGED_EVENT, onChanged);
    }, [clientId, integrationId]);

    const markConnected = useCallback(() => {
        setStatus("connected");
        window.dispatchEvent(new CustomEvent(CHANGED_EVENT, { detail: { clientId, integrationId } }));
        if (integrationId === "facebook") window.dispatchEvent(new Event("refreshMetaAds"));
    }, [clientId, integrationId]);

    const connect = useCallback(async () => {
        if (!clientId) return;
        setError(null);

        try {
            // 1. Existing connection? reuse it.
            setStatus("checking");
            const existing = await check();
            if (existing.connected) {
                markConnected();
                return;
            }

            // 2. None -> open Connect UI now, 3. then fetch the session token for it
            setStatus("connecting");
            let saving = false;

            const nango = new Nango();
            const ui = nango.openConnectUI({
                onEvent: async (event: any) => {
                    if (event.type === "connect") {
                        saving = true;
                        try {
                            await api("/api/nango/connection", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    clientId: latestClient.current,
                                    integrationId,
                                    connectionId: event.payload?.connectionId,
                                }),
                            });
                            markConnected();
                        } catch (e: any) {
                            setError(e.message || "Connected, but saving failed");
                            setStatus("disconnected");
                        }
                    } else if (event.type === "close" && !saving) {
                        setStatus("disconnected"); // user closed without finishing
                    }
                },
            });

            try {
                const { token } = await api<{ token: string }>("/api/nango/session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ clientId, integrationId }),
                });
                ui.setSessionToken(token);
            } catch (e) {
                ui.close();
                throw e;
            }
        } catch (e: any) {
            console.error("Connect failed:", e);
            setError(e.message || "Could not start connection");
            setStatus("disconnected");
        }
    }, [clientId, integrationId, check, markConnected]);

    return { status, error, connect };
}