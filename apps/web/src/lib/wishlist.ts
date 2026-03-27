import type { Course } from '@/types/course';
import { isCourseWishlisted as serverIsWishlisted, toggleWishlist as serverToggleWishlist } from '@/server/wishlist';

function getCachedUserId(): string | number | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = localStorage.getItem('grandline_auth_user_trainee');
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
  return serverIsWishlisted(courseId);
}

export async function toggleWishlist(courseId: string | number): Promise<boolean> {
  return serverToggleWishlist(courseId);
}
