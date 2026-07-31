'use server';

import { cookies } from 'next/headers';

const CMS_API = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.PAYLOAD_API_KEY;

function headers(): Record<string, string> {
  return {
    Authorization: `users API-Key ${API_KEY}`,
    'Content-Type': 'application/json',
  };
}

export interface InstructorStats {
  totalCourses: number;
  activeCourses: number;
  totalStudents: number;
  activeEnrollments: number;
  completedEnrollments: number;
  pendingGrading: number;
  averageProgress: number;
  averageGrade: number;
  completionRate: number;
  totalAssessments: number;
  totalAssignments: number;
  unreadFeedbacks: number;
  recentSubmissions: number;
  totalCertificates: number;
}

export interface CourseStat {
  id: string;
  title: string;
  courseCode: string;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  averageGrade: number;
  averageProgress: number;
  pendingGrading: number;
}

export interface MonthlyTrend {
  month: string;
  count: number;
}

export interface GradeBucket {
  range: string;
  count: number;
  label: string;
}

export interface StatusBucket {
  status: string;
  count: number;
}

export interface RecentActivity {
  id: string;
  type: 'submission' | 'enrollment' | 'completion';
  message: string;
  courseTitle: string;
  timestamp: string;
}

export interface Announcement {
  id: string;
  title: string;
  pinned: boolean;
  createdAt: string;
  courseId: string;
  courseTitle: string;
}

export interface PendingSubmission {
  id: string;
  traineeName: string;
  assignmentTitle: string;
  courseTitle: string;
  status: string;
  submittedAt: string;
  score: number | null;
}

export interface InstructorDashboardData {
  instructor: {
    id: string;
    specialization: string;
    yearsExperience?: number;
    coursesCount: number;
  };
  stats: InstructorStats;
  courseStats: CourseStat[];
  courseTrends: {
    monthlyEnrollments: MonthlyTrend[];
    monthlyCompletions: MonthlyTrend[];
  };
  gradeDistribution: GradeBucket[];
  statusDistribution: StatusBucket[];
  recentActivity: RecentActivity[];
  announcements: Announcement[];
  pendingSubmissions: PendingSubmission[];
}

export async function getInstructorDashboardData(): Promise<InstructorDashboardData> {
  if (!CMS_API) throw new Error('Missing NEXT_PUBLIC_API_URL');

  const cookieStore = await cookies();
  const token = cookieStore.get('grandline-instructor-token')?.value;

  if (!token) throw new Error('Not authenticated');

  // Get current user from the token
  const meRes = await fetch(`${CMS_API}/users/me`, {
    headers: {
      Authorization: `JWT ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!meRes.ok) throw new Error('Failed to get current user');

  const meData = await meRes.json();
  const userId = meData?.user?.id || meData?.id;

  if (!userId) throw new Error('Could not determine user ID');

  const res = await fetch(`${CMS_API}/dashboard/instructor-summary?userId=${userId}`, {
    headers: headers(),
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || `Failed to fetch instructor dashboard: ${res.statusText}`);
  }

  const result = await res.json();
  return result.data;
}
