import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * @swagger
 * /api/meta/mock:
 *   get:
 *     summary: Fetch Meta Ads Mock Data
 *     description: Returns the comprehensive list of Meta ad metrics.
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit the number of returned keys (optional)
 *     responses:
 *       200:
 *         description: Successful response with Meta data
 *       400:
 *         description: Invalid query parameters
 *       404:
 *         description: Data file not found on the server
 *       500:
 *         description: Internal server error
 */
export async function GET(request: Request) {
    try {
        // 1. Parameter Validation
        const { searchParams } = new URL(request.url);
        const limitParam = searchParams.get('limit');

        if (limitParam !== null && isNaN(Number(limitParam))) {
            return NextResponse.json(
                { success: false, error: 'Bad Request: "limit" must be a valid number.' },
                { status: 400 }
            );
        }

        // 2. Safe Path Resolution
        const filePath = path.join(process.cwd(), 'data', 'meta_all_metrics.json');
        let fileContents: string;

        // 3. Graceful File System Error Handling
        try {
            fileContents = await fs.readFile(filePath, 'utf8');
        } catch (fsError: any) {
            if (fsError.code === 'ENOENT') {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'File Not Found: Ensure data/meta_all_metrics.json exists in the root directory.'
                    },
                    { status: 404 }
                );
            }
            throw fsError; // Pass to global catch for 500
        }

        // 4. Safe JSON Parsing
        let data;
        try {
            data = JSON.parse(fileContents);
        } catch (parseError) {
            return NextResponse.json(
                { success: false, error: 'Data Corruption: The JSON file is malformed.' },
                { status: 500 }
            );
        }

        // 5. Apply Business Logic
        let responseData = data;
        if (limitParam) {
            const limitNum = parseInt(limitParam, 10);
            responseData = Object.fromEntries(Object.entries(data).slice(0, limitNum));
        }

        return NextResponse.json(
            { success: true, count: Object.keys(responseData).length, data: responseData },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('[API_ERROR_META_MOCK]:', error.message);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}