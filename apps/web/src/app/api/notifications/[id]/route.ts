import { NextRequest, NextResponse } from 'next/server';

// PATCH - Mark notification as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';
    const apiKey = process.env.PAYLOAD_API_KEY || '';

    if (!id || !apiKey) {
      return NextResponse.json({ error: 'Missing id or API key' }, { status: 400 });
    }

    const body = await request.json();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `users API-Key ${apiKey}`,
      PAYLOAD_API_KEY: apiKey,
    };

    const res = await fetch(`${apiUrl}/user-notifications/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to update' }, { status: res.status });
    }

    const json = await res.json();
    return NextResponse.json(json);
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// DELETE - Delete notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';
    const apiKey = process.env.PAYLOAD_API_KEY || '';

    if (!id || !apiKey) {
      return NextResponse.json({ error: 'Missing id or API key' }, { status: 400 });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `users API-Key ${apiKey}`,
      PAYLOAD_API_KEY: apiKey,
    };

    const res = await fetch(`${apiUrl}/user-notifications/${id}`, {
      method: 'DELETE',
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to delete' }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
