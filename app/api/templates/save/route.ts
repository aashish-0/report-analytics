import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { reportTemplates } from '@/lib/schema';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        // Authenticate the request via Better Auth
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userId = session.user.id;
        const { clientId, metrics } = await request.json();

        // Save or update the metrics in Neon using Drizzle
        const template = await db.insert(reportTemplates)
            .values({
                id: crypto.randomUUID(),
                userId,
                clientId,
                metrics
            })
            .onConflictDoUpdate({
                target: reportTemplates.clientId,
                set: { metrics, updatedAt: new Date() },
            })
            .returning();

        return NextResponse.json({ success: true, template: template[0] });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}