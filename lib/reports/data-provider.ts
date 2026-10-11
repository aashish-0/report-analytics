import type { MetricKey } from "./metrics";

export type MonthlyMetrics = Record<MetricKey, number>;

/**
 * Source of ad-performance numbers. v1 uses realistic mock data; swap in a
 * Meta Marketing API implementation by returning it from getAdDataProvider().
 */
export interface AdDataProvider {
  getMonthlyMetrics(args: { clientId: string; period: string }): Promise<MonthlyMetrics>;
}

function seeded(seedStr: string) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

export const mockAdDataProvider: AdDataProvider = {
  async getMonthlyMetrics({ clientId, period }) {
    const base = seeded(clientId);
    const month = seeded(clientId + period);
    const baseSpend = 1500 + base() * 4500;
    const spend = baseSpend * (0.85 + month() * 0.3);
    const cpc = 0.6 + base() * 1.4;
    const linkClicks = Math.round((spend / cpc) * (0.9 + month() * 0.2));
    const ctr = 0.008 + base() * 0.012;
    const impressions = Math.round(linkClicks / ctr);
    const convRate = 0.03 + base() * 0.05;
    const conversions = Math.max(1, Math.round(linkClicks * convRate * (0.85 + month() * 0.3)));
    const revenue = spend * (2 + base() * 3) * (0.85 + month() * 0.3);
    return {
      total_spend: Math.round(spend * 100) / 100,
      cpa: Math.round((spend / conversions) * 100) / 100,
      roas: Math.round((revenue / spend) * 100) / 100,
      link_clicks: linkClicks,
      impressions,
    };
  },
};

export function getAdDataProvider(): AdDataProvider {
  return mockAdDataProvider;
}
