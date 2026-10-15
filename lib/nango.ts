import { Nango } from '@nangohq/node';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { clients, clientConnections } from '@/lib/schema';

export const nango = new Nango({ secretKey: process.env.NANGO_SECRET_KEY! });

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

export async function deleteStoredConnection(clientId: string, integrationId: string) {
    await db.delete(clientConnections).where(
        and(
            eq(clientConnections.clientId, clientId),
            eq(clientConnections.integrationId, integrationId),
        ),
    );
}