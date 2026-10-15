import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { clientConnections } from '@/lib/schema';
import { nango, getOwnedClient } from '@/lib/nango';

// Called by the frontend right after nango.auth() succeeds.
// The webhook stays the source of truth; this closes the race / local-dev gap.
export async function POST(request: Request) {
  try {
    const { integrationId, clientId, connectionId } = await request.json();

    const authSession = await auth.api.getSession({ headers: request.headers });
    if (!authSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const client = await getOwnedClient(clientId, authSession.user.id);
    if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Confirm the connection really exists in Nango and belongs to this client
    const conn: any = await nango.getConnection(integrationId, connectionId);
    const owner = conn?.end_user?.id ?? conn?.endUser?.endUserId;
    if (owner && owner !== clientId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.insert(clientConnections)
      .values({ clientId, integrationId, connectionId })
      .onConflictDoUpdate({
        target: [clientConnections.clientId, clientConnections.integrationId],
        set: { connectionId },
      });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Save connection error:', error.response?.data || error.message);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}