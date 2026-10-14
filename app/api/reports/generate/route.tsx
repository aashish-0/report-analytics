import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { renderToStream, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import React from 'react';
import { db } from '@/lib/db';
import { reportTemplates } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

const styles = StyleSheet.create({
    page: { padding: 40, backgroundColor: '#f8fafc' },
    title: { fontSize: 24, marginBottom: 20, color: '#0f172a', fontWeight: 'bold' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    card: { padding: 15, border: '1pt solid #e2e8f0', borderRadius: 4, width: '45%', backgroundColor: 'white' },
    label: { fontSize: 10, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 },
    value: { fontSize: 18, color: '#0f172a', fontWeight: 'bold' }
});

const ReportDocument = ({ metrics, metaData }: { metrics: string[], metaData: any }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.title}>Automated Meta Ads Report</Text>
            {metaData.campaigns?.map((campaign: any, index: number) => {
                const insights = campaign.insights?.data?.[0] || {};
                return (
                    <View key={index} style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 14, marginBottom: 10 }}>Campaign: {campaign.name}</Text>
                        <View style={styles.grid}>
                            {metrics.map(metricKey => {
                                let val = insights[metricKey] || '0';
                                if (['spend', 'cpm', 'cpc'].includes(metricKey)) val = `$${Number(val).toFixed(2)}`;
                                return (
                                    <View key={metricKey} style={styles.card}>
                                        <Text style={styles.label}>{metricKey.replace('_', ' ')}</Text>
                                        <Text style={styles.value}>{val}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                );
            })}
        </Page>
    </Document>
);

export async function GET(request: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) return new Response("Unauthorized", { status: 401 });

        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get('clientId');
        if (!clientId) throw new Error("Missing client ID");

        const templateRecord = await db.select()
            .from(reportTemplates)
            .where(eq(reportTemplates.clientId, clientId))
            .limit(1);

        if (!templateRecord.length) throw new Error("No report template saved.");

        const activeMetricsMap = templateRecord[0].metrics as Record<string, boolean>;
        const metricsToRender = Object.keys(activeMetricsMap).filter(key => activeMetricsMap[key]);

        const metaRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || process.env.BETTER_AUTH_URL}/api/meta/campaigns?clientId=${clientId}`);
        const metaData = await metaRes.json();

        const stream = await renderToStream(<ReportDocument metrics={metricsToRender} metaData={metaData} />);

        return new Response(stream as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Report_${clientId}.pdf"`,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}