import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { clients } from '@/lib/schema';

export async function GET(request: Request) {
    const s = await auth.api.getSession({ headers: request.headers });
    if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const list = await db.query.clients.findMany({ where: eq(clients.userId, s.user.id) });
    return NextResponse.json({ success: true, clients: list });
}

export async function POST(request: Request) {
    const s = await auth.api.getSession({ headers: request.headers });
    if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });

    const [created] = await db
        .insert(clients)
        .values({ id: crypto.randomUUID(), name: name.trim(), userId: s.user.id })
        .returning();

    return NextResponse.json({ success: true, client: created });
}