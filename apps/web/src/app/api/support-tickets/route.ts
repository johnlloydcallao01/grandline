import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') || '10';
    const page = searchParams.get('page') || '1';

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';
    const cookieStore = await cookies();
    const payloadToken = cookieStore.get('grandline-web-token')?.value;

    if (!payloadToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const params = new URLSearchParams();
    if (status && status !== 'all') {
      params.set('status', status);
    }
    params.set('limit', limit);
    params.set('page', page);

    const res = await fetch(`${apiUrl}/lms/support-tickets?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${payloadToken}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, category, priority, message } = body;

    if (!subject || !category || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';
    const cookieStore = await cookies();
    const payloadToken = cookieStore.get('grandline-web-token')?.value;

    if (!payloadToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const ticketRes = await fetch(`${apiUrl}/lms/support-tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${payloadToken}`,
      },
      body: JSON.stringify({
        subject,
        category,
        priority: priority || 'medium',
        message,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!ticketRes.ok) {
      const errorText = await ticketRes.text();
      console.error('Failed to create ticket:', ticketRes.status, errorText);
      try {
        const errorJson = JSON.parse(errorText);
        return NextResponse.json({ error: 'Failed to create ticket', details: errorJson }, { status: ticketRes.status });
      } catch {
        return NextResponse.json({ error: 'Failed to create ticket', details: errorText }, { status: ticketRes.status });
      }
    }

    const ticket = await ticketRes.json();
    return NextResponse.json(ticket, { status: ticketRes.status });
  } catch (error: any) {
    console.error('Error creating support ticket:', error);
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
    }
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
