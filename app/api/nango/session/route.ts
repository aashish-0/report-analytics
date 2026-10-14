import { NextResponse } from 'next/server';
import { Nango } from '@nangohq/node';

export async function POST(request: Request) {
    try {
        const { integrationId, endUserId } = await request.json();

        const nango = new Nango({ secretKey: process.env.NANGO_SECRET_KEY! });

        // Strictly match Nango's v2 Connect Session schema
        const sessionPayload: any = {
            end_user: {
                id: endUserId // Nango automatically uses this ("primary-user") as the connection_id
            },
            allowed_integrations: [integrationId] // Just the string, e.g., ["facebook"]
        };

        const sessionResponse = await nango.createConnectSession(sessionPayload);

        // Extract the token exactly where TypeScript says it is
        const token = sessionResponse.data.token;

        return NextResponse.json({ success: true, token });

    } catch (error: any) {
        const errorData = error.response?.data || error.message || error;
        console.error("Session API Error Details:", JSON.stringify(errorData, null, 2));

        return NextResponse.json(
            { success: false, error: errorData },
            { status: 500 }
        );
    }
}