import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: ticketId } = await context.params;
    
    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';
    
    // Auth strategy: Prefer user token (cookie), fallback to API Key
    const cookieStore = await cookies();
    const payloadToken = cookieStore.get('grandline-web-token')?.value;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (payloadToken) {
      headers['Authorization'] = `JWT ${payloadToken}`;
    } else if (process.env.PAYLOAD_API_KEY) {
      headers['Authorization'] = `users API-Key ${process.env.PAYLOAD_API_KEY}`;
    } else {
       return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(`${apiUrl}/support-tickets/${ticketId}`, {
      headers,
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      console.error(`Failed to fetch ticket: ${res.status} ${errorText}`);
      return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
