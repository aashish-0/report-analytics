import { NextResponse } from 'next/server';
import { saveConnection, isAllowedIntegration } from '@/lib/nango';

/**
 * POST /api/nango/webhook
 * Receives Nango webhooks (set this URL in Nango -> Environment Settings -> Webhooks).
 * Locally it needs a public tunnel (ngrok / cloudflared).
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();

    if (payload.type === 'auth' && payload.operation === 'creation' && payload.success) {
      const clientId = payload.endUser?.endUserId;
      const integrationId = payload.providerConfigKey;
      const connectionId = payload.connectionId;

      if (clientId && connectionId && isAllowedIntegration(integrationId)) {
        await saveConnection(clientId, integrationId, connectionId);
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}