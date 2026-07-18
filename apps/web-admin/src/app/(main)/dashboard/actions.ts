'use server'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

function headers(): Record<string, string> {
  return {
    Authorization: `users API-Key ${API_KEY}`,
    'Content-Type': 'application/json',
  }
}

export interface DashboardOverview {
  totalCourses: number
  totalEnrollments: number
  totalStudents: number
  totalInstructors: number
  activeEnrollments: number
  completedEnrollments: number
  completionRate: number
  totalCertificates: number
  totalAssessments: number
}

export interface MonthlyTrend {
  month: string
  count: number
}

export interface CategoryDistribution {
  name: string
  count: number
  percentage: number
}

export interface RecentEnrollment {
  id: string
  traineeName: string
  courseTitle: string
  enrolledAt: string
  status: string
  progressPercentage: number
}

export interface PopularCourse {
  id: string
  title: string
  enrollmentCount: number
  completionRate: number
}

export interface RecentActivity {
  id: string
  type: 'enrollment' | 'completion'
  message: string
  timestamp: string
}

export interface DashboardData {
  overview: DashboardOverview
  trends: {
    monthlyEnrollments: MonthlyTrend[]
    monthlyCompletions: MonthlyTrend[]
  }
  categoryDistribution: CategoryDistribution[]
  recentEnrollments: RecentEnrollment[]
  popularCourses: PopularCourse[]
  recentActivity: RecentActivity[]
}

export async function getDashboardData(): Promise<DashboardData> {
  if (!CMS_API) throw new Error('Missing NEXT_PUBLIC_API_URL')

  const res = await fetch(`${CMS_API}/lms/analytics/dashboard`, {
    headers: headers(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch dashboard data: ${res.statusText}`)
  }

  const data: DashboardData = await res.json()
  return data
}
