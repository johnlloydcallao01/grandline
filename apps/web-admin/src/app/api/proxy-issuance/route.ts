import { NextRequest, NextResponse } from 'next/server';

// This is a proxy route to the PayloadCMS streaming endpoint
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { enrollmentId } = body;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const apiKey = process.env.PAYLOAD_API_KEY;

        if (!apiUrl || !apiKey) {
            return NextResponse.json({ error: 'Missing API configuration' }, { status: 500 });
        }

        // Call the PayloadCMS endpoint
        const response = await fetch(`${apiUrl}/generate-certificate`, {
            method: 'POST',
            headers: {
                'Authorization': `users API-Key ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ enrollmentId }),
        });

        if (!response.body) {
            return NextResponse.json({ error: 'No response body from server' }, { status: 500 });
        }

        // Proxy the stream back to the client
        return new Response(response.body, {
            headers: {
                'Content-Type': 'application/x-ndjson',
                'Transfer-Encoding': 'chunked',
            },
        });

    } catch (error: any) {
        console.error('Proxy Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
