import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { reportSettings, reports } from "@/lib/schema";
import { getAdDataProvider } from "@/lib/reports/data-provider";
import { formatMetric, percentChange, periodLabel, previousPeriod, selectedMetrics } from "@/lib/reports/metrics";
import { getOwnedClient, getUser, notFound, unauthorized } from "@/lib/session";

export async function GET(request: Request, ctx: RouteContext<"/api/clients/[id]/reports">) {
  const user = await getUser(request);
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  if (!(await getOwnedClient(id, user.id))) return notFound();
  const rows = await db
    .select({ id: reports.id, period: reports.period, createdAt: reports.createdAt })
    .from(reports)
    .where(eq(reports.clientId, id))
    .orderBy(desc(reports.createdAt));
  return Response.json(rows);
}

export async function POST(request: Request, ctx: RouteContext<"/api/clients/[id]/reports">) {
  const user = await getUser(request);
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const client = await getOwnedClient(id, user.id);
  if (!client) return notFound();

  const { period } = await request.json();
  if (typeof period !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) {
    return Response.json({ error: "Choose a valid reporting month." }, { status: 400 });
  }
  if (!client.metaAdsConnected) {
    return Response.json({ error: "Connect Meta Ads before generating a report." }, { status: 400 });
  }

  const [row] = await db.select().from(reportSettings).where(eq(reportSettings.clientId, id));
  const metrics = selectedMetrics(
    row && {
      total_spend: row.totalSpend,
      cpa: row.cpa,
      roas: row.roas,
      link_clicks: row.linkClicks,
      impressions: row.impressions,
    },
  );
  if (metrics.length === 0) {
    return Response.json({ error: "Select at least one metric." }, { status: 400 });
  }

  const provider = getAdDataProvider();
  const [cur, prev] = await Promise.all([
    provider.getMonthlyMetrics({ clientId: id, period }),
    provider.getMonthlyMetrics({ clientId: id, period: previousPeriod(period) }),
  ]);
  const cards = metrics.map((m) => {
    const change = percentChange(cur[m.key], prev[m.key]);
    const good = change === null || m.higherIsBetter === null || change === 0 ? null : change > 0 === m.higherIsBetter;
    return { label: m.label, value: formatMetric(cur[m.key], m.format), change, good };
  });

  const [created] = await db
    .insert(reports)
    .values({ id: crypto.randomUUID(), clientId: id, period, agencyName: user.name, clientName: client.name, cards })
    .returning({ id: reports.id });
  return Response.json({ id: created.id, label: periodLabel(period) }, { status: 201 });
}
