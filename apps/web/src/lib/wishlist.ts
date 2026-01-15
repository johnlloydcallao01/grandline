import type { Course } from '@/types/course';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }

  const token = localStorage.getItem('grandline_auth_token');
  if (!token) {
    return {};
  }

  return {
    Authorization: `users JWT ${token}`,
  };
}

function getCachedUserId(): string | number | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = localStorage.getItem('grandline_auth_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { id?: string | number } | null;
    const id = parsed && parsed.id;
    if (id === undefined || id === null) return null;
    return id;
  } catch {
    return null;
  }
}

type WishlistDoc = {
  id: string | number;
  user: string | number | { id: string | number };
  course: string | number | { id: string | number } | Course;
};

type WishlistResponse = {
  docs: WishlistDoc[];
  totalDocs: number;
};

export async function fetchWishlist(): Promise<Course[]> {
  if (typeof window === 'undefined') {
    return [];
  }

  const userId = getCachedUserId();
  if (!userId) {
    return [];
  }

  const params = new URLSearchParams();
  params.set('userId', String(userId));

  const res = await fetch(`/api/wishlists?${params.toString()}`, {
    method: 'GET',
  });

  if (!res.ok) {
    return [];
  }

  const json = (await res.json()) as WishlistResponse;
  const docs = Array.isArray(json.docs) ? json.docs : [];

  const courses: Course[] = [];
  for (const d of docs) {
    const c = d.course as any;
    if (!c || typeof c !== 'object') continue;
    const id = String(c.id || '');
    const title = typeof c.title === 'string' ? c.title : '';
    const status = c.status === 'published' || c.status === 'draft' ? c.status : 'published';
    if (!id || !title) continue;

    const course: Course = {
      id,
      title,
      excerpt: typeof c.excerpt === 'string' ? c.excerpt : '',
      status,
      thumbnail: (c.thumbnail ?? null) as Course['thumbnail'],
      bannerImage: (c.bannerImage ?? null) as Course['bannerImage'],
      estimatedDuration: c.estimatedDuration ?? null,
      estimatedDurationUnit:
        c.estimatedDurationUnit && typeof c.estimatedDurationUnit === 'string'
          ? c.estimatedDurationUnit
          : null,
      updatedAt: c.updatedAt ?? null,
      courseMaterials: (c.courseMaterials ?? null) as Course['courseMaterials'],
      description: c.description,
      descriptionBlocks: (c.descriptionBlocks ?? null) as Course['descriptionBlocks'],
      isFeatured: c.isFeatured ?? false,
    };

    courses.push(course);
  }

  return courses;
}

export async function isCourseWishlisted(courseId: string | number): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  };

  const params = new URLSearchParams();
  params.set('where[course][equals]', String(courseId));
  params.set('limit', '1');
  params.set('depth', '0');

  const res = await fetch(`${API_BASE_URL}/wishlists?${params.toString()}`, {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    return false;
  }

  const json = (await res.json()) as WishlistResponse;
  return Array.isArray(json.docs) && json.docs.length > 0;
}

export async function toggleWishlist(courseId: string | number): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }

  const userId = getCachedUserId();
  if (!userId) {
    return false;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  };

  const lookupParams = new URLSearchParams();
  lookupParams.set('where[course][equals]', String(courseId));
  lookupParams.set('limit', '1');
  lookupParams.set('depth', '0');

  const existingRes = await fetch(
    `${API_BASE_URL}/wishlists?${lookupParams.toString()}`,
    {
      method: 'GET',
      headers,
      credentials: 'include',
    }
  );

  if (existingRes.ok) {
    const json = (await existingRes.json()) as WishlistResponse;
    const first = Array.isArray(json.docs) && json.docs.length > 0 ? json.docs[0] : null;
    if (first && first.id) {
      const deleteRes = await fetch(`${API_BASE_URL}/wishlists/${first.id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });
      if (deleteRes.ok) {
        return false;
      }
    }
  }

  const createRes = await fetch(`${API_BASE_URL}/wishlists`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({
      user: userId,
      course: courseId,
    }),
  });

  if (!createRes.ok) {
    return false;
  }

  return true;
}
