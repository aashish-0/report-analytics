import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { nango, getOwnedClient, getConnectionId } from '@/lib/nango';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    if (!clientId) {
        return NextResponse.json({ error: 'Missing clientId parameter' }, { status: 400 });
    }

    const authSession = await auth.api.getSession({ headers: request.headers });
    if (!authSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const client = await getOwnedClient(clientId, authSession.user.id);
    if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Use the stored Nango connection instead of treating clientId as connectionId
    const connectionId = await getConnectionId(clientId, 'facebook');
    if (!connectionId) {
        return NextResponse.json({ success: false, error: 'not_connected' }, { status: 404 });
    }

    const adAccountId = 'act_2008620313135209'; // TODO: store per client

    try {
        const response = await nango.get({
            endpoint: `https://graph.facebook.com/v18.0/${adAccountId}/campaigns?fields=name,status,insights{spend,impressions,clicks,cpm,cpc,ctr,reach}`,
            providerConfigKey: 'facebook',
            connectionId,
        });
        return NextResponse.json({ success: true, campaigns: response.data?.data || [] });
    } catch (error: any) {
        const msg = error?.response?.data?.error?.message || error.message || '';
        const notConnected = error.response?.status === 404 || msg.includes('Failed to get connection');
        return NextResponse.json(
            { success: false, error: notConnected ? 'not_connected' : msg },
            { status: notConnected ? 404 : 500 },
        );
    }
}