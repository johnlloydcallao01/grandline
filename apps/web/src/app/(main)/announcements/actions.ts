'use server';

import { getServerUser } from '@/app/actions/auth';

export async function getAnnouncements() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  try {
    const user = await getServerUser();
    const userId = user?.id;

    if (!userId) {
      return [];
    }

    const announcementsRes = await fetch(
      `${apiUrl}/lms/announcements?userId=${userId}&limit=50`,
      { cache: 'no-store' }
    );

    if (!announcementsRes.ok) {
      console.error("[ACTION] Failed to fetch announcements", announcementsRes.status);
      return [];
    }

    const data = await announcementsRes.json();
    return data.docs || [];

  } catch (error) {
    console.error("[ACTION] Error fetching announcements:", error);
    return [];
  }
}
