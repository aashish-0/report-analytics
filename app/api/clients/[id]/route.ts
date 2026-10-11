import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clients } from "@/lib/schema";
import { getOwnedClient, getUser, notFound, unauthorized } from "@/lib/session";

export async function PATCH(request: Request, ctx: RouteContext<"/api/clients/[id]">) {
  const user = await getUser(request);
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  if (!(await getOwnedClient(id, user.id))) return notFound();
  const { name } = await request.json();
  const trimmed = typeof name === "string" ? name.trim() : "";
  if (!trimmed || trimmed.length > 100) {
    return Response.json({ error: "Name must be 1-100 characters." }, { status: 400 });
  }
  const [row] = await db.update(clients).set({ name: trimmed }).where(eq(clients.id, id)).returning();
  return Response.json(row);
}

export async function DELETE(request: Request, ctx: RouteContext<"/api/clients/[id]">) {
  const user = await getUser(request);
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  if (!(await getOwnedClient(id, user.id))) return notFound();
  await db.delete(clients).where(eq(clients.id, id)); // settings + reports cascade
  return Response.json({ ok: true });
}
