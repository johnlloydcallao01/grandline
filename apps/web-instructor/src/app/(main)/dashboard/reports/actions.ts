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

export interface MonthlyTrend {
  month: string;
  count: number;
}

export interface OverviewData {
  totalCourses: number;
  totalEnrollments: number;
  totalStudents: number;
  totalInstructors: number;
  activeEnrollments: number;
  completedEnrollments: number;
  droppedEnrollments: number;
  completionRate: number;
  totalCertificates: number;
  totalAssessments: number;
  totalAssignments: number;
  avgGrade: number;
  avgProgress: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface RangeCount {
  range: string;
  count: number;
}

export interface TypeCount {
  type: string;
  count: number;
}

export interface CategoryDistribution {
  name: string;
  count: number;
  percentage: number;
}

export interface TopCourse {
  id: string;
  title: string;
  enrollmentCount: number;
  completionRate: number;
  avgGrade: number;
  status: string;
}

export interface DifficultyCount {
  level: string;
  count: number;
}

export interface PassFailCount {
  status: string;
  count: number;
}

export interface TopCertCourse {
  title: string;
  count: number;
}

export interface LearnersData {
  totalTrainees: number;
  enrollmentStatusDistribution: StatusCount[];
  gradeDistribution: RangeCount[];
  enrollmentTypeDistribution: TypeCount[];
  newTraineesThisMonth: number;
  activeTrainees: number;
}

export interface CoursesData {
  totalCourses: number;
  courseStatusDistribution: StatusCount[];
  categoryDistribution: CategoryDistribution[];
  topCourses: TopCourse[];
  avgCompletionRate: number;
  avgEnrollmentPerCourse: number;
  difficultyDistribution: DifficultyCount[];
}

export interface AssessmentsData {
  totalSubmissions: number;
  totalAssessments: number;
  passRate: number;
  avgScore: number;
  passFailDistribution: PassFailCount[];
  scoreDistribution: RangeCount[];
  monthlySubmissions: MonthlyTrend[];
  avgAttempts: number;
}

export interface CertificationsData {
  totalCertificates: number;
  activeCertificates: number;
  revokedCertificates: number;
  expiredCertificates: number;
  certificateDates: string[];
  topCourses: TopCertCourse[];
  certComplianceRate: number;
}

export interface ReportsData {
  overview: OverviewData;
  learners: LearnersData;
  courses: CoursesData;
  assessments: AssessmentsData;
  certifications: CertificationsData;
}

export async function getInstructorReportsData(): Promise<ReportsData> {
  if (!CMS_API) throw new Error('Missing NEXT_PUBLIC_API_URL');

  const cookieStore = await cookies();
  const token = cookieStore.get('grandline-instructor-token')?.value;

  if (!token) throw new Error('Not authenticated');

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

  const res = await fetch(`${CMS_API}/reports/instructor-summary?userId=${userId}`, {
    headers: headers(),
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || `Failed to fetch instructor reports: ${res.statusText}`);
  }

  const result = await res.json();
  return result.data;
}
