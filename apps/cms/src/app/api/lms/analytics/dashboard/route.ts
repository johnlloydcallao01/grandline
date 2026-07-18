import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cachedPayloadFind } from '@/utils/redis-cache'

interface MonthlyBucket {
  month: string
  count: number
}

function buildTrendMap(docs: any[], dateField: string): MonthlyBucket[] {
  const map = new Map<string, number>()
  for (const doc of docs) {
    const raw = doc[dateField]
    if (!raw) continue
    const key = raw.slice(0, 7)
    map.set(key, (map.get(key) || 0) + 1)
  }
  return Array.from(map.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

function getTraineeName(trainee: any): string {
  if (!trainee) return 'Unknown'
  const user = trainee.user
  if (typeof user === 'object' && user) {
    const first = user.firstName || ''
    const last = user.lastName || ''
    if (first || last) return `${first} ${last}`.trim()
    return user.email || 'Unknown'
  }
  return `Trainee #${trainee.id}`
}

function getCourseTitle(course: any): string {
  if (!course) return 'Unknown'
  if (typeof course === 'object') return course.title || `Course #${course.id}`
  return `Course #${course}`
}

export async function GET(_request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    const [
      coursesResult,
      allEnrollmentsResult,
      studentsResult,
      instructorsResult,
      activeEnrollmentsResult,
      completedEnrollmentsResult,
      certificatesResult,
      assessmentsResult,
      recentEnrollmentsResult,
      allEnrollmentsForTrends,
    ] = await Promise.all([
      cachedPayloadFind(payload, { collection: 'courses', limit: 0, depth: 0 }),
      cachedPayloadFind(payload, { collection: 'course-enrollments', limit: 0, depth: 0 }),
      cachedPayloadFind(payload, { collection: 'trainees', limit: 0, depth: 0 }),
      cachedPayloadFind(payload, { collection: 'instructors', limit: 0, depth: 0 }),
      cachedPayloadFind(payload, {
        collection: 'course-enrollments',
        where: { status: { equals: 'active' } },
        limit: 0,
        depth: 0,
      }),
      cachedPayloadFind(payload, {
        collection: 'course-enrollments',
        where: { status: { equals: 'completed' } },
        limit: 0,
        depth: 0,
      }),
      cachedPayloadFind(payload, { collection: 'certificates', limit: 0, depth: 0 }),
      cachedPayloadFind(payload, { collection: 'assessment-submissions', limit: 0, depth: 0 }),
      cachedPayloadFind(payload, {
        collection: 'course-enrollments',
        sort: '-enrolledAt',
        limit: 10,
        depth: 2,
      }),
      cachedPayloadFind(payload, {
        collection: 'course-enrollments',
        limit: 1000,
        depth: 0,
        sort: '-enrolledAt',
      }),
    ])

    const courseCategoryMap = new Map<string, number>()
    const courseEnrollmentCount = new Map<string, { count: number; completed: number; title: string }>()

    if (coursesResult.docs?.length) {
      for (const course of coursesResult.docs) {
        const cats = course.category
        if (Array.isArray(cats)) {
          for (const cat of cats) {
            const name = typeof cat === 'object' && cat ? (cat.name || cat.title || `Category #${cat.id}`) : `Category #${cat}`
            courseCategoryMap.set(name, (courseCategoryMap.get(name) || 0) + 1)
          }
        }
        courseEnrollmentCount.set(String(course.id), { count: 0, completed: 0, title: course.title || `Course #${course.id}` })
      }
    }

    if (allEnrollmentsForTrends.docs?.length) {
      for (const enrollment of allEnrollmentsForTrends.docs) {
        const courseId = typeof enrollment.course === 'object' ? String(enrollment.course?.id) : String(enrollment.course || '')
        const entry = courseEnrollmentCount.get(courseId)
        if (entry) {
          entry.count++
          if (enrollment.status === 'completed') entry.completed++
        }
      }
    }

    const popularCourses = Array.from(courseEnrollmentCount.entries())
      .map(([id, data]) => ({
        id,
        title: data.title,
        enrollmentCount: data.count,
        completionRate: data.count > 0 ? Math.round((data.completed / data.count) * 100) : 0,
      }))
      .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
      .slice(0, 5)

    const categoryDistribution = Array.from(courseCategoryMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: coursesResult.totalDocs > 0 ? Math.round((count / coursesResult.totalDocs) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)

    const monthlyEnrollments = buildTrendMap(allEnrollmentsForTrends.docs || [], 'enrolledAt')
    const monthlyCompletions = buildTrendMap(allEnrollmentsResult.docs || [], 'completedAt')

    const recentEnrollments = (recentEnrollmentsResult.docs || []).map((enrollment: any) => ({
      id: enrollment.id,
      traineeName: getTraineeName(enrollment.student),
      courseTitle: getCourseTitle(enrollment.course),
      enrolledAt: enrollment.enrolledAt || enrollment.createdAt,
      status: enrollment.status,
      progressPercentage: enrollment.progressPercentage || 0,
    }))

    const completionRate = allEnrollmentsResult.totalDocs > 0
      ? Math.round((completedEnrollmentsResult.totalDocs / allEnrollmentsResult.totalDocs) * 100)
      : 0

    const totalAssessments = assessmentsResult.totalDocs || 0
    const totalCertificates = certificatesResult.totalDocs || 0

    const recentActivity = [
      ...(recentEnrollmentsResult.docs || []).slice(0, 5).map((e: any) => ({
        id: `enroll-${e.id}`,
        type: 'enrollment' as const,
        message: `${getTraineeName(e.student)} enrolled in ${getCourseTitle(e.course)}`,
        timestamp: e.enrolledAt || e.createdAt,
      })),
      ...(certificatesResult.docs || []).slice(0, 3).map((c: any) => ({
        id: `cert-${c.id}`,
        type: 'completion' as const,
        message: `Certificate issued to ${getTraineeName(c.trainee)} for ${getCourseTitle(c.course)}`,
        timestamp: c.createdAt,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)

    const dashboardData = {
      overview: {
        totalCourses: coursesResult.totalDocs,
        totalEnrollments: allEnrollmentsResult.totalDocs,
        totalStudents: studentsResult.totalDocs,
        totalInstructors: instructorsResult.totalDocs,
        activeEnrollments: activeEnrollmentsResult.totalDocs,
        completedEnrollments: completedEnrollmentsResult.totalDocs,
        completionRate,
        totalCertificates,
        totalAssessments,
      },
      trends: {
        monthlyEnrollments,
        monthlyCompletions,
      },
      categoryDistribution,
      recentEnrollments,
      popularCourses,
      recentActivity,
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
