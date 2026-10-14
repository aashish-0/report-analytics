import { Nango } from '@nangohq/node';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
        return NextResponse.json({ error: 'Missing clientId parameter' }, { status: 400 });
    }

    const nango = new Nango({ secretKey: process.env.NANGO_SECRET_KEY! });
    const adAccountId = 'act_2008620313135209';

    try {
        const response = await nango.get({
            endpoint: `https://graph.facebook.com/v18.0/${adAccountId}/campaigns?fields=name,status,insights{spend,impressions,clicks,cpm,cpc,ctr,reach}`,
            providerConfigKey: 'facebook',
            connectionId: clientId,
        });

        const campaigns = response.data?.data || [];
        return NextResponse.json({ success: true, campaigns });
    } catch (error: any) {
        const errorMessage = error?.response?.data?.error?.message || error.message || '';

        // ✨ NEW: Catching Nango's exact "Failed to get connection" wording
        const isNotConnected = errorMessage.includes('Connection not found') ||
            errorMessage.includes('Failed to get connection') ||
            error.response?.status === 404;

        return NextResponse.json(
            {
                success: false,
                error: isNotConnected ? 'not_connected' : errorMessage
            },
            { status: isNotConnected ? 404 : 500 }
        );
    }
}