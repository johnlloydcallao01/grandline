import { NextRequest, NextResponse } from 'next/server';

type RecentlyViewedDoc = {
  id: string | number;
  user: string | number | { id: string | number };
  course: any;
  viewedAt?: string | null;
  viewCount?: number | null;
};

type RecentlyViewedResponse = {
  docs: RecentlyViewedDoc[];
  totalDocs: number;
};

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
    params.set('sort', '-viewedAt');
    params.set('limit', '10');
    params.set('depth', '2');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `users API-Key ${apiKey}`,
      PAYLOAD_API_KEY: apiKey,
    };

    const res = await fetch(
      `${apiUrl}/recently-viewed-courses?${params.toString()}`,
      {
        headers,
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { docs: [], totalDocs: 0 },
        { status: res.status }
      );
    }

    const json = (await res.json()) as RecentlyViewedResponse;
    return NextResponse.json(json);
  } catch {
    return NextResponse.json({ docs: [], totalDocs: 0 }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';
    const apiKey = process.env.PAYLOAD_API_KEY || '';

    if (!apiKey) {
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    const body = (await request.json()) as {
      userId?: string | number;
      courseId?: string | number;
    };

    const userId = body.userId;
    const courseId = body.courseId;

    if (!userId || !courseId) {
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `users API-Key ${apiKey}`,
      PAYLOAD_API_KEY: apiKey,
    };

    const lookupParams = new URLSearchParams();
    lookupParams.set('where[user][equals]', String(userId));
    lookupParams.set('where[course][equals]', String(courseId));
    lookupParams.set('limit', '1');
    lookupParams.set('depth', '0');

    const existingRes = await fetch(
      `${apiUrl}/recently-viewed-courses?${lookupParams.toString()}`,
      {
        method: 'GET',
        headers,
        cache: 'no-store',
      }
    );

    if (existingRes.ok) {
      const json = (await existingRes.json()) as RecentlyViewedResponse;
      const first =
        Array.isArray(json.docs) && json.docs.length > 0 ? json.docs[0] : null;
      if (first && first.id) {
        const currentCount =
          typeof first.viewCount === 'number' && !Number.isNaN(first.viewCount)
            ? first.viewCount
            : 0;
        await fetch(
          `${apiUrl}/recently-viewed-courses/${first.id}`,
          {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
              viewCount: currentCount + 1,
              viewedAt: new Date().toISOString(),
            }),
          }
        );
        return NextResponse.json({ ok: true }, { status: 200 });
      }
    }

    await fetch(`${apiUrl}/recently-viewed-courses`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        user: userId,
        course: courseId,
        viewedAt: new Date().toISOString(),
        viewCount: 1,
      }),
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
