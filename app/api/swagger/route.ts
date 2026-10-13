import { createSwaggerSpec } from 'next-swagger-doc';
import { NextResponse } from 'next/server';

export async function GET() {
    const spec = createSwaggerSpec({
        apiFolder: 'app/api',
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'Unified Marketing Dashboard API',
                version: '1.0.0',
                description: 'API endpoints for fetching Meta and Google metrics.',
            },
        },
    });
    return NextResponse.json(spec);
}