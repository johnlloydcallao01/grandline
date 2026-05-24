'use server';

import 'server-only';

import { getServerUser } from '@/app/actions/auth';
import type { Course } from '@/types/course';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';

type WishlistState = {
  items: Course[];
  courseIds: string[];
  totalDocs: number;
};

async function getWishlistStateForUser(
  userId: string | number
): Promise<WishlistState> {
  const params = new URLSearchParams();
  params.set('userId', String(userId));
  params.set('limit', '100');

  try {
    const res = await fetch(`${API_BASE_URL}/lms/wishlist?${params.toString()}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!res.ok) {
      return {
        items: [],
        courseIds: [],
        totalDocs: 0,
      };
    }

    const json = (await res.json()) as Partial<WishlistState>;
    const items = Array.isArray(json.items) ? json.items : [];
    const courseIds = Array.isArray(json.courseIds)
      ? json.courseIds.map((id) => String(id))
      : [];

    return {
      items,
      courseIds,
      totalDocs:
        typeof json.totalDocs === 'number' && !Number.isNaN(json.totalDocs)
          ? json.totalDocs
          : items.length,
    };
  } catch {
    return {
      items: [],
      courseIds: [],
      totalDocs: 0,
    };
  }
}

export async function getWishlistState(): Promise<WishlistState> {
  const user = await getServerUser();
  if (!user?.id) {
    return {
      items: [],
      courseIds: [],
      totalDocs: 0,
    };
  }

  return getWishlistStateForUser(user.id);
}

export async function fetchWishlist(): Promise<Course[]> {
  const data = await getWishlistState();
  return data.items;
}

export async function isCourseWishlisted(courseId: string | number): Promise<boolean> {
  const data = await getWishlistState();
  return data.courseIds.includes(String(courseId));
}

export async function toggleWishlist(courseId: string | number): Promise<boolean> {
  const user = await getServerUser();
  if (!user?.id) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/lms/wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      body: JSON.stringify({
        userId: user.id,
        courseId,
      }),
    });

    if (!res.ok) {
      return false;
    }

    const json = (await res.json()) as { wishlisted?: boolean };

    return Boolean(json.wishlisted);
  } catch {
    return false;
  }
}
export async function getWishlistCourseIdsForUser(
  userId: string | number
): Promise<string[]> {
  const data = await getWishlistStateForUser(userId);
  return data.courseIds;
}
