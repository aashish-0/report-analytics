import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { nango, getOwnedClient, isAllowedIntegration } from '@/lib/nango';

/**
 * POST /api/nango/session
 * Single purpose: issue a short-lived Nango Connect session token for a client.
 * It does NOT check or save connections (see /api/nango/connection) and it is
 * only called when the user actually clicks "Connect" and no connection exists.
 */
export async function POST(request: Request) {
    try {
        const { clientId, integrationId } = await request.json();
        if (!clientId || !isAllowedIntegration(integrationId)) {
            return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
        }

        const authSession = await auth.api.getSession({ headers: request.headers });
        if (!authSession) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const client = await getOwnedClient(clientId, authSession.user.id);
        if (!client) return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });

        const session = await nango.createConnectSession({
            end_user: { id: clientId },
            allowed_integrations: [integrationId],
        });

        return NextResponse.json({ success: true, token: session.data.token });
    } catch (error: any) {
        console.error('Connect session error:', error?.response?.data || error?.message || error);
        return NextResponse.json({ success: false, error: 'Failed to create connect session' }, { status: 500 });
    }
}