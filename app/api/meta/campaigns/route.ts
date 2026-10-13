import { Nango } from '@nangohq/node';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const nango = new Nango({ secretKey: process.env.NANGO_SECRET_KEY! });
    const connectionId = '78cec321-c908-4a72-b4c9-61467a27105d';
    const adAccountId = 'act_2008620313135209#'; // Replace with a real Ad Account ID from your Business Portfolio

    try {
        const response = await nango.get({
            endpoint: `/v22.0/${adAccountId}/insights?fields=campaign_name,spend,impressions,cpm,actions&date_preset=last_30d`,
            providerConfigKey: 'facebook',
            connectionId: connectionId,
        });

        return NextResponse.json({ success: true, raw_meta_response: response.data });
    } catch (error: any) {
        console.error('Meta API error:', error?.response?.data || error.message);
        // This will now print the exact Meta/Nango error to your screen
        return NextResponse.json(
            {
                success: false,
                error: error?.response?.data || error.message || 'Unknown error occurred'
            },
            { status: 500 }
        );
    }
}