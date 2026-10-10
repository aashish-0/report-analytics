import type { MonthlyReportPoint } from "@/lib/report-data";

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
}

function makeLinePath(values: number[], width: number, height: number) {
    const max = Math.max(...values) * 1.12;
    return values
        .map((value, index) => {
            const x = (index / (values.length - 1)) * width;
            const y = height - (value / max) * height;
            return `${index === 0 ? "M" : "L"}${x},${y}`;
        })
        .join(" ");
}

function TrendChart({ series }: { series: MonthlyReportPoint[] }) {
    const width = 600;
    const height = 210;
    const spendPath = makeLinePath(series.map((point) => point.spend), width, height);
    const revenuePath = makeLinePath(series.map((point) => point.revenue), width, height);

    return (
        <section className="min-w-0 border-y border-slate-200 py-5" aria-labelledby="trend-title">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h3 id="trend-title" className="font-semibold text-slate-900">Spend and revenue</h3>
                    <p className="mt-1 text-sm text-slate-500">Monthly performance</p>
                </div>
                <div className="flex gap-5 text-sm">
                    <span className="flex items-center gap-2 text-slate-600"><i className="h-2.5 w-2.5 rounded-full bg-emerald-600" />Revenue</span>
                    <span className="flex items-center gap-2 text-slate-600"><i className="h-2.5 w-2.5 rounded-full bg-indigo-600" />Spend</span>
                </div>
            </div>
            <svg className="mt-6 block w-full overflow-visible" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Monthly ad spend and attributed revenue trend">
                {[0.25, 0.5, 0.75, 1].map((fraction) => (
                    <line key={fraction} x1="0" x2={width} y1={height * fraction} y2={height * fraction} stroke="#e2e8f0" strokeDasharray="4 6" />
                ))}
                <path d={revenuePath} fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d={spendPath} fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="mt-3 grid grid-cols-6 text-xs text-slate-500">
                {series.map((point) => <span className="text-center" key={point.month}>{point.month}</span>)}
            </div>
        </section>
    );
}

function ChannelChart({ channels }: { channels: { channel: string; amount: number }[] }) {
    const max = Math.max(...channels.map((item) => item.amount));

    return (
        <section className="max-w-2xl border-y border-slate-200 py-5" aria-labelledby="channel-title">
            <div>
                <h3 id="channel-title" className="font-semibold text-slate-900">Spend by channel</h3>
                <p className="mt-1 text-sm text-slate-500">Current reporting period</p>
            </div>
            <div className="mt-6 space-y-5">
                {channels.map((item, index) => (
                    <div key={item.channel} className="grid grid-cols-[5rem_minmax(0,1fr)_5rem] items-center gap-3 text-sm">
                        <span className="text-slate-600">{item.channel}</span>
                        <div className="h-3 bg-slate-100">
                            <div className={`h-full ${index === 0 ? "bg-indigo-600" : index === 1 ? "bg-emerald-600" : "bg-amber-500"}`} style={{ width: `${(item.amount / max) * 100}%` }} />
                        </div>
                        <span className="text-right font-medium tabular-nums text-slate-800">{formatCurrency(item.amount)}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

export function PerformanceCharts({
    series,
    channels,
}: {
    series: MonthlyReportPoint[];
    channels: { channel: string; amount: number }[];
}) {
    return (
        <div className="space-y-7">
            <TrendChart series={series} />
            <ChannelChart channels={channels} />
        </div>
    );
}