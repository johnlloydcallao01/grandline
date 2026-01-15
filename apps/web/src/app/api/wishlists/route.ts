import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';
    const apiKey = process.env.PAYLOAD_API_KEY || '';

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '';

    if (!userId || !apiKey) {
      return NextResponse.json({ docs: [], totalDocs: 0 }, { status: 200 });
    }

    const params = new URLSearchParams();
    params.set('where[user][equals]', String(userId));
    params.set('sort', '-createdAt');
    params.set('limit', '100');
    params.set('depth', '2');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `users API-Key ${apiKey}`,
      PAYLOAD_API_KEY: apiKey,
    };

    const res = await fetch(`${apiUrl}/wishlists?${params.toString()}`, {
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ docs: [], totalDocs: 0 }, { status: res.status });
    }

    const json = await res.json();
    return NextResponse.json(json);
  } catch {
    return NextResponse.json({ docs: [], totalDocs: 0 }, { status: 200 });
  }
}

