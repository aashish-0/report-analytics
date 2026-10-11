export type MetricKey = "total_spend" | "cpa" | "roas" | "link_clicks" | "impressions";

export type MetricFormat = "currency" | "ratio" | "number";

export interface MetricDef {
  key: MetricKey;
  label: string;
  description: string;
  format: MetricFormat;
  /** true = increase is good, false = decrease is good, null = neutral */
  higherIsBetter: boolean | null;
}

export const METRICS: MetricDef[] = [
  { key: "total_spend", label: "Total Ad Spend", description: "Total amount spent across all campaigns.", format: "currency", higherIsBetter: null },
  { key: "cpa", label: "Cost Per Acquisition (CPA)", description: "Average cost for each conversion.", format: "currency", higherIsBetter: false },
  { key: "roas", label: "Return on Ad Spend (ROAS)", description: "Revenue generated per dollar spent.", format: "ratio", higherIsBetter: true },
  { key: "link_clicks", label: "Total Link Clicks", description: "Clicks on links in your ads.", format: "number", higherIsBetter: true },
  { key: "impressions", label: "Total Impressions", description: "Number of times your ads were shown.", format: "number", higherIsBetter: true },
];

export type MetricSettings = Record<MetricKey, boolean>;

export const DEFAULT_METRIC_SETTINGS: MetricSettings = {
  total_spend: true,
  cpa: true,
  roas: true,
  link_clicks: false,
  impressions: false,
};

/** Returns only the metrics ticked for a client, in display order. */
export function selectedMetrics(settings: Partial<MetricSettings> | null | undefined): MetricDef[] {
  const s = { ...DEFAULT_METRIC_SETTINGS, ...(settings ?? {}) };
  return METRICS.filter((m) => s[m.key] === true);
}

export function formatMetric(value: number, format: MetricFormat): string {
  if (format === "currency")
    return "$" + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (format === "ratio") return value.toFixed(2) + "x";
  return Math.round(value).toLocaleString("en-US");
}

/** Percent change from previous to current, or null when previous is 0. */
export function percentChange(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

export function periodLabel(period: string): string {
  const [y = 1970, m = 1] = period.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

export function previousPeriod(period: string): string {
  const [y = 1970, m = 1] = period.split("-").map(Number);
  const py = m === 1 ? y - 1 : y;
  const pm = m === 1 ? 12 : m - 1;
  return `${py}-${String(pm).padStart(2, "0")}`;
}
