'use server';

import { cookies } from 'next/headers';

export async function getAnnouncements() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const apiKey = process.env.PAYLOAD_API_KEY || 'db6c3436-72f8-47d0-855a-30112b7e9214';

  const cookieStore = await cookies();
  const token = cookieStore.get('grandline-web-token')?.value;

  if (!token && !apiKey) {
    console.error("[ACTION] Missing token and API key");
    return [];
  }

  try {
    // 1. Fetch user to get their trainee ID
    const userRes = await fetch(`${apiUrl}/users/me`, {
      headers: token ? { Authorization: `JWT ${token}` } : { Authorization: `users API-Key ${apiKey}` },
      cache: 'no-store',
    });
    
    let userId;
    if (userRes.ok) {
      const userData = await userRes.json();
      userId = userData.user?.id;
    }

    if (!userId) {
      return [];
    }

    // 2. Fetch trainee profile
    const traineeRes = await fetch(`${apiUrl}/trainees?where[user][equals]=${userId}&limit=1`, {
      headers: { Authorization: `users API-Key ${apiKey}` },
      cache: 'no-store',
    });

    let traineeId;
    if (traineeRes.ok) {
      const traineeData = await traineeRes.json();
      traineeId = traineeData.docs?.[0]?.id;
    }

    if (!traineeId) {
      return [];
    }

    // 3. Fetch active enrollments
    const enrollmentsRes = await fetch(
      `${apiUrl}/course-enrollments?where[student][equals]=${traineeId}&where[status][equals]=active&limit=100`,
      {
        headers: { Authorization: `users API-Key ${apiKey}` },
        cache: 'no-store',
      }
    );

    let courseIds: string[] = [];
    if (enrollmentsRes.ok) {
      const enrollmentsData = await enrollmentsRes.json();
      const enrollments = enrollmentsData.docs || [];
      courseIds = enrollments.map((e: any) => {
        if (typeof e.course === 'object' && e.course !== null) return e.course.id;
        return e.course;
      }).filter(Boolean);
    }

    // 4. Fetch announcements (global ones without a course + course-specific ones)
    // Actually, looking at the schema, 'course' is required. So we only fetch announcements for their enrolled courses.
    if (courseIds.length === 0) {
      return [];
    }

    const courseQueryString = courseIds.map((id, index) => `where[or][${index}][course][equals]=${id}`).join('&');

    const announcementsRes = await fetch(
      `${apiUrl}/announcements?${courseQueryString}&depth=1&limit=50&sort=-createdAt`,
      {
        headers: { Authorization: `users API-Key ${apiKey}` },
        cache: 'no-store',
      }
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
