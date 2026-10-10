export interface MonthlyReportPoint {
    month: string;
    spend: number;
    revenue: number;
}

export interface ReportClient {
    id: string;
    slug: string;
    name: string;
    industry: string;
    monthly: MonthlyReportPoint[];
    channelSpend: { channel: string; amount: number }[];
}

export const CLIENTS: ReportClient[] = [
    {
        id: "1",
        slug: "acme-dental",
        name: "Acme Dental",
        industry: "Healthcare",
        monthly: [
            { month: "Jan", spend: 3200, revenue: 8400 },
            { month: "Feb", spend: 3500, revenue: 9200 },
            { month: "Mar", spend: 3300, revenue: 8900 },
            { month: "Apr", spend: 3900, revenue: 10800 },
            { month: "May", spend: 4200, revenue: 11900 },
            { month: "Jun", spend: 4600, revenue: 13200 },
        ],
        channelSpend: [
            { channel: "Meta", amount: 4600 },
            { channel: "Search", amount: 3100 },
            { channel: "Email", amount: 1400 },
        ],
    },
    {
        id: "2",
        slug: "summit-real-estate",
        name: "Summit Real Estate",
        industry: "Real estate",
        monthly: [
            { month: "Jan", spend: 5100, revenue: 14300 },
            { month: "Feb", spend: 4900, revenue: 13900 },
            { month: "Mar", spend: 5600, revenue: 15800 },
            { month: "Apr", spend: 5900, revenue: 17100 },
            { month: "May", spend: 6200, revenue: 18000 },
            { month: "Jun", spend: 6800, revenue: 19700 },
        ],
        channelSpend: [
            { channel: "Meta", amount: 6800 },
            { channel: "Search", amount: 4200 },
            { channel: "Email", amount: 1900 },
        ],
    },
];

export function findClientBySlug(slug: string) {
    return CLIENTS.find((client) => client.slug === slug);
}

export function getOverviewSeries(): MonthlyReportPoint[] {
    return CLIENTS[0].monthly.map((point, index) => ({
        month: point.month,
        spend: CLIENTS.reduce((total, client) => total + client.monthly[index].spend, 0),
        revenue: CLIENTS.reduce((total, client) => total + client.monthly[index].revenue, 0),
    }));
}

export function getOverviewChannels() {
    return CLIENTS[0].channelSpend.map(({ channel }, index) => ({
        channel,
        amount: CLIENTS.reduce((total, client) => total + client.channelSpend[index].amount, 0),
    }));
}