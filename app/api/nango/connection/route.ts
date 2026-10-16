import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
    nango,
    getOwnedClient,
    isAllowedIntegration,
    resolveConnection,
    saveConnection,
} from '@/lib/nango';

/**
 * GET /api/nango/connection?clientId=...&integrationId=...
 * Is there already a usable connection for this client + integration?
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get('clientId');
        const integrationId = searchParams.get('integrationId');
        if (!clientId || !isAllowedIntegration(integrationId)) {
            return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
        }

        const authSession = await auth.api.getSession({ headers: request.headers });
        if (!authSession) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const client = await getOwnedClient(clientId, authSession.user.id);
        if (!client) return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });

        const { connected } = await resolveConnection(clientId, integrationId);
        return NextResponse.json({ success: true, connected });
    } catch (error: any) {
        console.error('Connection status error:', error?.message || error);
        return NextResponse.json({ success: false, error: 'Failed to check connection' }, { status: 500 });
    }
}

/**
 * POST /api/nango/connection
 * Persist the connection right after the Connect UI reports success.
 * (The Nango webhook does the same; both are idempotent upserts.)
 */
export async function POST(request: Request) {
    try {
        const { clientId, integrationId, connectionId } = await request.json();
        if (!clientId || !connectionId || !isAllowedIntegration(integrationId)) {
            return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
        }

        const authSession = await auth.api.getSession({ headers: request.headers });
        if (!authSession) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const client = await getOwnedClient(clientId, authSession.user.id);
        if (!client) return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });

        // Reject only if Nango definitively says this connection doesn't exist
        try {
            await nango.getConnection(integrationId, connectionId);
        } catch (err: any) {
            if (err?.response?.status === 404) {
                return NextResponse.json({ success: false, error: 'Connection not found' }, { status: 400 });
            }
            console.warn('getConnection verification skipped:', err?.response?.status, err?.message);
        }

        await saveConnection(clientId, integrationId, connectionId);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Save connection error:', error?.cause || error?.message || error);
        return NextResponse.json({ success: false, error: 'Failed to save connection' }, { status: 500 });
    }
}