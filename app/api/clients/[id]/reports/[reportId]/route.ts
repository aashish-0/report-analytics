import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { reports } from "@/lib/schema";
import { buildReportPdf } from "@/lib/reports/pdf";
import { periodLabel } from "@/lib/reports/metrics";
import { getOwnedClient, getUser, notFound, unauthorized } from "@/lib/session";

// Renders the saved snapshot to a PDF on download
export async function GET(request: Request, ctx: RouteContext<"/api/clients/[id]/reports/[reportId]">) {
  const user = await getUser(request);
  if (!user) return unauthorized();
  const { id, reportId } = await ctx.params;
  if (!(await getOwnedClient(id, user.id))) return notFound();
  const [r] = await db.select().from(reports).where(and(eq(reports.id, reportId), eq(reports.clientId, id)));
  if (!r) return Response.json({ error: "Report not found" }, { status: 404 });

  const pdf = await buildReportPdf({
    agencyName: r.agencyName,
    clientName: r.clientName,
    periodLabel: periodLabel(r.period),
    cards: r.cards,
  });
  return new Response(Buffer.from(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="report-${r.period}.pdf"`,
    },
  });
}
