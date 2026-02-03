'use server';

import 'server-only';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';

type WishlistDoc = {
  course: string | number | { id?: string | number } | null;
};

type WishlistResponse = {
  docs: WishlistDoc[];
};

export async function getWishlistCourseIdsForUser(
  userId: string | number
): Promise<string[]> {
  const apiKey = process.env.PAYLOAD_API_KEY || '';
  if (!apiKey) {
    return [];
  }

  const params = new URLSearchParams();
  params.set('where[user][equals]', String(userId));
  params.set('sort', '-createdAt');
  params.set('limit', '100');
  params.set('depth', '1');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `users API-Key ${apiKey}`,
    PAYLOAD_API_KEY: apiKey,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/wishlists?${params.toString()}`, {
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      return [];
    }

    const json = (await res.json()) as WishlistResponse;
    const docs = Array.isArray(json.docs) ? json.docs : [];

    const ids: string[] = [];
    for (const d of docs) {
      const c = d.course as any;
      if (!c) continue;
      const id =
        typeof c === 'object' && c !== null && 'id' in c ? c.id : c;
      if (id === null || id === undefined) continue;
      ids.push(String(id));
    }

    return ids;
  } catch {
    return [];
  }
}

