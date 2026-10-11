import { auth } from "./auth";
import { db } from "./db";
import { clients } from "./schema";
import { and, eq } from "drizzle-orm";

export async function getUser(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user ?? null;
}

// Returns the client only if it belongs to this user
export async function getOwnedClient(clientId: string, userId: string) {
  const [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, clientId), eq(clients.userId, userId)));
  return client ?? null;
}

export const unauthorized = () => Response.json({ error: "Unauthorized" }, { status: 401 });
export const notFound = () => Response.json({ error: "Client not found" }, { status: 404 });
