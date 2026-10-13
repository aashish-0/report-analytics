import { Nango } from '@nangohq/node';
import { NextResponse } from 'next/server';

export async function GET() {
    const nango = new Nango({ secretKey: process.env.NANGO_SECRET_KEY! });

    // The connection ID created during the Nango authorization step
    const connectionId = '0bfdbe41-922d-438d-9413-712d797f7dd1';

    // Replace with your actual GA4 Property ID from Step 1
    const propertyId = '213025502';  // Need to replace with your actual GA4 Property ID

    // try {
    //     const response = await nango.post({
    //         // 1. Revert the endpoint back to just the relative path
    //         endpoint: `/v1beta/properties/${propertyId}:runReport`,
    //         providerConfigKey: 'google-analytics',
    //         connectionId: connectionId,

    //         // 2. Add this specific property to route to the correct GA4 server
    //         baseUrlOverride: 'https://analyticsdata.googleapis.com',

    //         data: {
    //             dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    //             metrics: [
    //                 { name: 'activeUsers' },
    //                 { name: 'sessions' },
    //                 { name: 'screenPageViews' }
    //             ],
    //             dimensions: [{ name: 'sessionSource' }],
    //         },
    //     });

    //     return NextResponse.json({
    //         success: true,
    //         data: response.data,
    //     });
    // } 
    try {
        // EXPANDED MOCK DATA FOR COMPREHENSIVE UI TESTING
        const mockGa4Response = {
            dimensionHeaders: [
                { name: "sessionSourceMedium" },
                { name: "defaultChannelGroup" },
                { name: "deviceCategory" },
                { name: "country" }
            ],
            metricHeaders: [
                { name: "activeUsers", type: "TYPE_INTEGER" },
                { name: "sessions", type: "TYPE_INTEGER" },
                { name: "screenPageViews", type: "TYPE_INTEGER" },
                { name: "engagementRate", type: "TYPE_FLOAT" },
                { name: "bounceRate", type: "TYPE_FLOAT" },
                { name: "averageSessionDuration", type: "TYPE_FLOAT" }, // in seconds
                { name: "conversions", type: "TYPE_INTEGER" },
                { name: "totalRevenue", type: "TYPE_CURRENCY" }
            ],
            rows: [
                {
                    dimensionValues: [
                        { value: "google / cpc" },
                        { value: "Paid Search" },
                        { value: "mobile" },
                        { value: "United States" }
                    ],
                    metricValues: [
                        { value: "4250" }, // activeUsers
                        { value: "5120" }, // sessions
                        { value: "12450" }, // screenPageViews
                        { value: "0.65" }, // engagementRate (65%)
                        { value: "0.35" }, // bounceRate (35%)
                        { value: "145.5" }, // averageSessionDuration (145 seconds)
                        { value: "142" }, // conversions
                        { value: "12450.50" } // totalRevenue
                    ]
                },
                {
                    dimensionValues: [
                        { value: "google / organic" },
                        { value: "Organic Search" },
                        { value: "desktop" },
                        { value: "United States" }
                    ],
                    metricValues: [
                        { value: "8500" },
                        { value: "9200" },
                        { value: "25600" },
                        { value: "0.72" },
                        { value: "0.28" },
                        { value: "210.2" },
                        { value: "315" },
                        { value: "28500.00" }
                    ]
                },
                {
                    dimensionValues: [
                        { value: "facebook.com / referral" },
                        { value: "Organic Social" },
                        { value: "mobile" },
                        { value: "India" }
                    ],
                    metricValues: [
                        { value: "1240" },
                        { value: "1350" },
                        { value: "2100" },
                        { value: "0.45" },
                        { value: "0.55" },
                        { value: "65.4" },
                        { value: "12" },
                        { value: "450.00" }
                    ]
                },
                {
                    dimensionValues: [
                        { value: "(direct) / (none)" },
                        { value: "Direct" },
                        { value: "desktop" },
                        { value: "United Kingdom" }
                    ],
                    metricValues: [
                        { value: "3100" },
                        { value: "3400" },
                        { value: "9800" },
                        { value: "0.68" },
                        { value: "0.32" },
                        { value: "185.0" },
                        { value: "88" },
                        { value: "6200.75" }
                    ]
                }
            ],
            rowCount: 4,
            metadata: {
                currencyCode: "USD",
                timeZone: "America/Los_Angeles"
            }
        };

        return NextResponse.json({ success: true, data: mockGa4Response });

    } catch (error: any) {
        console.error('Google API error:', error?.response?.data || error.message);
        return NextResponse.json(
            { success: false, error: error?.response?.data || error.message },
            { status: 500 }
        );
    }
}