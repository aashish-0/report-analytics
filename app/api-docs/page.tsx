'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

// Dynamically import SwaggerUI to prevent SSR issues with Next.js
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocs() {
    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', padding: '2rem' }}>
            <SwaggerUI url="/api/swagger" />
        </div>
    );
}