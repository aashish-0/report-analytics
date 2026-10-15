import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
    nango,
    getOwnedClient,
    getConnectionId,
    deleteStoredConnection,
} from '@/lib/nango';

export async function POST(request: Request) {
    try {
        const { integrationId, clientId, checkOnly } = await request.json();
        if (!integrationId || !clientId) {
            return NextResponse.json({ success: false, error: 'Missing params' }, { status: 400 });
        }

        const authSession = await auth.api.getSession({ headers: request.headers });
        if (!authSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const client = await getOwnedClient(clientId, authSession.user.id);
        if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

        // 1. Reuse the stored connection if we have one (DB is the source of truth)
        const connectionId = await getConnectionId(clientId, integrationId);
        if (connectionId) {
            try {
                await nango.getConnection(integrationId, connectionId);
            } catch (err: any) {
                if (err?.response?.status === 404) {
                    // Nango confirms it's gone -> drop stale row, fall through to fresh connect
                    await deleteStoredConnection(clientId, integrationId);
                    return await newSessionOrStatus(clientId, integrationId, checkOnly);
                }
                // Any other error: don't break the flow, just log it and trust the DB row
                console.warn('getConnection check failed (ignored):', err?.response?.status, err?.response?.data || err?.message);
            }
            return NextResponse.json({ success: true, connected: true });
        }

        return await newSessionOrStatus(clientId, integrationId, checkOnly);
    } catch (error: any) {
        console.error('Session API Error:', error?.response?.data || error?.cause || error?.message || error);
        return NextResponse.json(
            { success: false, error: error?.message || 'Failed to create session' },
            { status: 500 },
        );
    }
}

async function newSessionOrStatus(clientId: string, integrationId: string, checkOnly?: boolean) {
    // Status check only (page load): no token
    if (checkOnly) {
        return NextResponse.json({ success: true, connected: false });
    }
    // Short-lived connect session token (this is NOT a connection)
    const sessionResponse = await nango.createConnectSession({
        end_user: { id: clientId },
        allowed_integrations: [integrationId],
    });
    return NextResponse.json({
        success: true,
        connected: false,
        token: sessionResponse.data.token,
    });
}