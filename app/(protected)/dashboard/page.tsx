"use client";
import { PerformanceCharts } from "@/components/PerformanceCharts";
import { getOverviewChannels, getOverviewSeries } from "@/lib/report-data";

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wider text-emerald-700">All clients</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Performance overview</h2>
      </div>
      <PerformanceCharts series={getOverviewSeries()} channels={getOverviewChannels()} />
    </section>
  );
}