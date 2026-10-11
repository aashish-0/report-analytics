import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clients } from "@/lib/schema";
import { getOwnedClient, getUser, notFound, unauthorized } from "@/lib/session";

// Simulated Meta Ads connection, used when Nango isn't configured.
// The real flow marks the client connected from the Nango webhook instead.
export async function POST(request: Request, ctx: RouteContext<"/api/clients/[id]/connect">) {
  const user = await getUser(request);
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  if (!(await getOwnedClient(id, user.id))) return notFound();
  const [row] = await db.update(clients).set({ metaAdsConnected: true }).where(eq(clients.id, id)).returning();
  return Response.json(row);
}
