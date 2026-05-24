'use server';

import { getServerUser } from '@/app/actions/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';

export async function fetchPortalCourses() {
  const user = await getServerUser();

  if (!user?.id) {
    return [];
  }

  const params = new URLSearchParams({
    userId: String(user.id),
    limit: '100',
  });

  try {
    const res = await fetch(`${API_BASE_URL}/lms/my-courses?${params.toString()}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Failed to fetch portal courses:', res.status, await res.text());
      return [];
    }

    const data = await res.json();
    return Array.isArray(data.docs) ? data.docs : [];
  } catch (error) {
    console.error('Error fetching portal courses:', error);
    return [];
  }
}
