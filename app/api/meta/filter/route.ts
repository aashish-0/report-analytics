import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * @swagger
 * /api/meta/filter:
 *   post:
 *     summary: Filter Meta Ads Metrics
 *     description: Accepts an array of metric keys and returns only those values from the mock dataset.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               metrics:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["spend", "impressions", "clicks"]
 *     responses:
 *       200:
 *         description: Filtered metrics successfully returned
 *       400:
 *         description: Invalid request body or metrics array
 *       404:
 *         description: Data file not found
 *       500:
 *         description: Internal server error
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { metrics } = body;

        if (!Array.isArray(metrics)) {
            return NextResponse.json(
                { success: false, error: 'Bad Request: "metrics" must be an array of strings.' },
                { status: 400 }
            );
        }

        const filePath = path.join(process.cwd(), 'data', 'meta_all_metrics.json');
        let fileContents: string;

        try {
            fileContents = await fs.readFile(filePath, 'utf8');
        } catch (fsError: any) {
            if (fsError.code === 'ENOENT') {
                return NextResponse.json(
                    { success: false, error: 'File Not Found: data/meta_all_metrics.json missing.' },
                    { status: 404 }
                );
            }
            throw fsError;
        }

        const allData = JSON.parse(fileContents);

        // Filter the object to only include keys requested in the array
        const filteredData: Record<string, any> = {};
        for (const key of metrics) {
            if (allData[key] !== undefined) {
                filteredData[key] = allData[key];
            }
        }

        return NextResponse.json(
            {
                success: true,
                count: Object.keys(filteredData).length,
                data: filteredData
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('[API_ERROR_META_FILTER]:', error.message);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}