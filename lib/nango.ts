import { Nango } from '@nangohq/node';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { clients, clientConnections } from '@/lib/schema';

export const nango = new Nango({ secretKey: process.env.NANGO_SECRET_KEY! });

// Only integrations your app actually supports (must match the Integration IDs in Nango)
export const ALLOWED_INTEGRATIONS = ['facebook', 'google-analytics'] as const;
export function isAllowedIntegration(id: unknown): id is (typeof ALLOWED_INTEGRATIONS)[number] {
    return typeof id === 'string' && (ALLOWED_INTEGRATIONS as readonly string[]).includes(id);
}

/** Returns the client only if it belongs to this user. */
export async function getOwnedClient(clientId: string, userId: string) {
    return db.query.clients.findFirst({
        where: and(eq(clients.id, clientId), eq(clients.userId, userId)),
    });
}

/** The stored Nango connectionId for (client, integration), or null. */
export async function getConnectionId(clientId: string, integrationId: string) {
    const row = await db.query.clientConnections.findFirst({
        where: and(
            eq(clientConnections.clientId, clientId),
            eq(clientConnections.integrationId, integrationId),
        ),
    });
    return row?.connectionId ?? null;
}

/** Insert or update the (client, integration) -> connectionId mapping. */
export async function saveConnection(clientId: string, integrationId: string, connectionId: string) {
    await db
        .insert(clientConnections)
        .values({ clientId, integrationId, connectionId })
        .onConflictDoUpdate({
            target: [clientConnections.clientId, clientConnections.integrationId],
            set: { connectionId },
        });

    if (integrationId === 'facebook') {
        await db.update(clients).set({ metaAdsConnected: true }).where(eq(clients.id, clientId));
    }
}

export async function deleteStoredConnection(clientId: string, integrationId: string) {
    await db.delete(clientConnections).where(
        and(
            eq(clientConnections.clientId, clientId),
            eq(clientConnections.integrationId, integrationId),
        ),
    );
    if (integrationId === 'facebook') {
        await db.update(clients).set({ metaAdsConnected: false }).where(eq(clients.id, clientId));
    }
}

/**
 * Best-effort recovery: if our DB has no row but Nango already has a connection
 * for this client (e.g. the save/webhook failed earlier), find it so we reuse it
 * instead of creating a second one. Never throws.
 */
async function findConnectionInNango(clientId: string, integrationId: string): Promise<string | null> {
    try {
        const res: any = await nango.listConnections();
        const list: any[] = res?.connections ?? [];
        const match = list.find((c) => {
            if (c.provider_config_key !== integrationId) return false;
            const owners = [
                c.end_user?.endUserId,
                c.end_user?.end_user_id,
                c.end_user?.id,
                c.endUser?.endUserId,
                c.tags?.end_user_id,
            ];
            return owners.includes(clientId);
        });
        return match?.connection_id ?? null;
    } catch (err: any) {
        console.warn('listConnections lookup skipped:', err?.response?.data || err?.message);
        return null;
    }
}

/**
 * Single place that answers: "does this client already have a usable connection?"
 *  1. DB row -> verify it still exists in Nango (404 => stale, delete it)
 *  2. no DB row -> look in Nango by end user and adopt it
 *  3. otherwise -> not connected
 */
export async function resolveConnection(
    clientId: string,
    integrationId: string,
): Promise<{ connected: boolean; connectionId?: string }> {
    const stored = await getConnectionId(clientId, integrationId);

    if (stored) {
        try {
            await nango.getConnection(integrationId, stored);
            return { connected: true, connectionId: stored };
        } catch (err: any) {
            if (err?.response?.status === 404) {
                await deleteStoredConnection(clientId, integrationId); // stale
            } else {
                // Nango hiccup: don't force the user to reconnect, trust our record
                console.warn('getConnection check failed (trusting DB):', err?.response?.status, err?.message);
                return { connected: true, connectionId: stored };
            }
        }
    }

    const found = await findConnectionInNango(clientId, integrationId);
    if (found) {
        await saveConnection(clientId, integrationId, found);
        return { connected: true, connectionId: found };
    }

    return { connected: false };
}