import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { nango, getOwnedClient, getConnectionId } from '@/lib/nango';

export async function POST(request: Request) {
    const { clientId, propertyId, reportRequest } = await request.json();
    if (!clientId || !propertyId || !reportRequest) {
        return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }

    const authSession = await auth.api.getSession({ headers: request.headers });
    if (!authSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const client = await getOwnedClient(clientId, authSession.user.id);
    if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const connectionId = await getConnectionId(clientId, 'google-analytics');
    if (!connectionId) return NextResponse.json({ error: 'not_connected' }, { status: 400 });

    try {
        const res = await nango.proxy({
            providerConfigKey: 'google-analytics',
            connectionId,
            method: 'POST',
            endpoint: `/v1beta/properties/${propertyId}:runReport`,
            baseUrlOverride: 'https://analyticsdata.googleapis.com', // GA4 Data API host (as in your earlier code)
            data: reportRequest,
        });
        return NextResponse.json({ success: true, data: res.data });
    } catch (error: any) {
        const status = error.response?.status;
        if (status === 401) {
            return NextResponse.json({ error: 'needs_reconnect' }, { status: 401 }); // expired/revoked token
        }
        if (status === 403) {
            return NextResponse.json({ error: 'no_property_access' }, { status: 403 }); // account lacks access to this property
        }
        console.error(error.response?.data || error.message);
        return NextResponse.json({ error: 'fetch_failed' }, { status: 500 });
    }
}