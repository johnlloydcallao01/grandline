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

import { cookies } from 'next/headers';

export async function isCourseWishlisted(courseId: string | number): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('payload-token')?.value;

  if (!token) return false;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `JWT ${token}`,
  };

  const params = new URLSearchParams();
  params.set('where[course][equals]', String(courseId));
  params.set('limit', '1');
  params.set('depth', '0');

  try {
    const res = await fetch(`${API_BASE_URL}/wishlists?${params.toString()}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!res.ok) return false;

    const json = (await res.json()) as WishlistResponse;
    return Array.isArray(json.docs) && json.docs.length > 0;
  } catch {
    return false;
  }
}

export async function toggleWishlist(courseId: string | number): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('payload-token')?.value;

  if (!token) return false;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `JWT ${token}`,
  };

  // First get the user to know their ID
  let userId: string | number | null = null;
  try {
    const meRes = await fetch(`${API_BASE_URL}/users/me`, { headers, cache: 'no-store' });
    if (meRes.ok) {
      const meData = await meRes.json();
      userId = meData.user?.id;
    }
  } catch (_err) {
    // Return null on failure (implicitly handled below)
  }

  if (!userId) return false;

  const lookupParams = new URLSearchParams();
  lookupParams.set('where[course][equals]', String(courseId));
  lookupParams.set('where[user][equals]', String(userId));
  lookupParams.set('limit', '1');
  lookupParams.set('depth', '0');

  try {
    const existingRes = await fetch(`${API_BASE_URL}/wishlists?${lookupParams.toString()}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (existingRes.ok) {
      const json = (await existingRes.json()) as WishlistResponse;
      const first = Array.isArray(json.docs) && json.docs.length > 0 ? json.docs[0] : null;
      if (first && 'id' in first) {
        const deleteRes = await fetch(`${API_BASE_URL}/wishlists/${(first as any).id}`, {
          method: 'DELETE',
          headers,
        });
        if (deleteRes.ok) return false;
      }
    }

    const createRes = await fetch(`${API_BASE_URL}/wishlists`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        user: userId,
        course: courseId,
      }),
    });

    return createRes.ok;
  } catch {
    return false;
  }
}
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

