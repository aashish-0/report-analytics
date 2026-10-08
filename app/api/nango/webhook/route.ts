import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clients } from '@/lib/schema'; // We still need to generate this schema
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    // Nango fires a specific event upon a successful OAuth connection
    if (payload.operation === 'creation' && payload.provider === 'meta-ads') {
      const internalClientId = payload.connectionId; 
      
      // Update our database to unlock the Meta Ads metrics for this client
      await db.update(clients)
        .set({ metaAdsConnected: true })
        .where(eq(clients.id, internalClientId));

      return NextResponse.json({ status: 'success' }, { status: 200 });
    }

    return NextResponse.json({ status: 'ignored' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}