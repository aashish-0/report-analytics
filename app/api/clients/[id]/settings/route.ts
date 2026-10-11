import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { reportSettings } from "@/lib/schema";
import { DEFAULT_METRIC_SETTINGS, METRICS, type MetricSettings } from "@/lib/reports/metrics";
import { getOwnedClient, getUser, notFound, unauthorized } from "@/lib/session";

export async function GET(request: Request, ctx: RouteContext<"/api/clients/[id]/settings">) {
  const user = await getUser(request);
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  if (!(await getOwnedClient(id, user.id))) return notFound();
  const [row] = await db.select().from(reportSettings).where(eq(reportSettings.clientId, id));
  const settings: MetricSettings = row
    ? {
        total_spend: row.totalSpend,
        cpa: row.cpa,
        roas: row.roas,
        link_clicks: row.linkClicks,
        impressions: row.impressions,
      }
    : DEFAULT_METRIC_SETTINGS;
  return Response.json(settings);
}

export async function PUT(request: Request, ctx: RouteContext<"/api/clients/[id]/settings">) {
  const user = await getUser(request);
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  if (!(await getOwnedClient(id, user.id))) return notFound();
  const body = await request.json();
  for (const m of METRICS) {
    if (typeof body[m.key] !== "boolean") {
      return Response.json({ error: `Invalid value for ${m.key}` }, { status: 400 });
    }
  }
  const values = {
    totalSpend: body.total_spend,
    cpa: body.cpa,
    roas: body.roas,
    linkClicks: body.link_clicks,
    impressions: body.impressions,
    updatedAt: new Date(),
  };
  await db
    .insert(reportSettings)
    .values({ clientId: id, ...values })
    .onConflictDoUpdate({ target: reportSettings.clientId, set: values });
  return Response.json({ ok: true });
}
