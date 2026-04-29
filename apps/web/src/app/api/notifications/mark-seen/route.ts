import { NextRequest, NextResponse } from 'next/server';

// POST - Mark all unseen notifications as seen (bell click)
export async function POST(request: NextRequest) {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';
    const apiKey = process.env.PAYLOAD_API_KEY || '';

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 400 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `users API-Key ${apiKey}`,
      PAYLOAD_API_KEY: apiKey,
    };

    // First, find all unseen notifications for this user
    const findRes = await fetch(
      `${apiUrl}/user-notifications?where[user][equals]=${userId}&where[seenAt][exists]=false&limit=100`,
      {
        method: 'GET',
        headers,
        cache: 'no-store',
      }
    );

    if (!findRes.ok) {
      return NextResponse.json(
        { error: 'Failed to find notifications' },
        { status: findRes.status }
      );
    }

    const findData = await findRes.json();
    const unseenNotifications = findData.docs || [];

    // Mark each one as seen
    const now = new Date().toISOString();
    await Promise.all(
      unseenNotifications.map((n: any) =>
        fetch(`${apiUrl}/user-notifications/${n.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ seenAt: now }),
          cache: 'no-store',
        })
      )
    );

    return NextResponse.json({
      success: true,
      markedAsSeen: unseenNotifications.length,
    });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
