import { NextResponse } from 'next/server';
import { Nango } from '@nangohq/node';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { clients, clientConnections } from '@/lib/schema';
import { auth } from '@/lib/auth';

const nango = new Nango({ secretKey: process.env.NANGO_SECRET_KEY! });

export async function POST(request: Request) {
    const { clientId, propertyId, reportRequest } = await request.json();

    const authSession = await auth.api.getSession({ headers: request.headers });
    if (!authSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // ownership check
    const [client] = await db.select().from(clients)
        .where(and(eq(clients.id, clientId), eq(clients.userId, authSession.user.id)))
        .limit(1);
    if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const [conn] = await db.select().from(clientConnections)
        .where(and(
            eq(clientConnections.clientId, clientId),
            eq(clientConnections.integrationId, 'google-analytics'),
        ))
        .limit(1);
    if (!conn) return NextResponse.json({ error: 'not_connected' }, { status: 400 });

    try {
        const res = await nango.proxy({
            providerConfigKey: 'google-analytics',
            connectionId: conn.connectionId,
            method: 'POST',
            endpoint: `/v1beta/properties/${propertyId}:runReport`,
            data: reportRequest,
        });
        return NextResponse.json({ success: true, data: res.data });
    } catch (error: any) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
            // tells the frontend to trigger a reconnect
            return NextResponse.json({ error: 'needs_reconnect' }, { status: 401 });
        }
        console.error(error.response?.data || error.message);
        return NextResponse.json({ error: 'fetch_failed' }, { status: 500 });
    }
}