import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clients } from "@/lib/schema";
import { getUser, unauthorized } from "@/lib/session";

export async function GET(request: Request) {
  const user = await getUser(request);
  if (!user) return unauthorized();
  const rows = await db.select().from(clients).where(eq(clients.userId, user.id)).orderBy(asc(clients.createdAt));
  return Response.json(rows);
}

export async function POST(request: Request) {
  const user = await getUser(request);
  if (!user) return unauthorized();
  const { name } = await request.json();
  const trimmed = typeof name === "string" ? name.trim() : "";
  if (!trimmed || trimmed.length > 100) {
    return Response.json({ error: "Name must be 1-100 characters." }, { status: 400 });
  }
  const [row] = await db
    .insert(clients)
    .values({ id: crypto.randomUUID(), name: trimmed, userId: user.id })
    .returning();
  return Response.json(row, { status: 201 });
}
