import { notFound } from "next/navigation";
import { ConnectMetaAdsButton } from "@/components/ConnectMetaAdsButton";
import { GenerateMonthlyReportButton } from "@/components/GenerateMonthlyReportButton";
import { MetricToggles } from "@/components/MetricToggles";
import { PerformanceCharts } from "@/components/PerformanceCharts";
import { findClientBySlug } from "@/lib/report-data";

export default async function ClientDashboardPage({
    params,
}: {
    params: Promise<{ clientSlug: string }>;
}) {
    const { clientSlug } = await params;
    const client = findClientBySlug(clientSlug);

    if (!client) notFound();

    return (
        <section className="max-w-5xl space-y-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium uppercase tracking-wider text-emerald-700">{client.industry}</p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-900">{client.name}</h2>
                    <p className="mt-1 text-slate-500">Client performance and report settings</p>
                </div>
                <ConnectMetaAdsButton clientId={client.id} />
            </div>

            <PerformanceCharts series={client.monthly} channels={client.channelSpend} />
            <MetricToggles />
            <div className="flex justify-end border-t border-slate-200 pt-6">
                <GenerateMonthlyReportButton />
            </div>
        </section>
    );
}