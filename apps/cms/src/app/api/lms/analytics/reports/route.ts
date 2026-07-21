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

function bucketGrade(grade: number): string {
  if (grade >= 90) return '90-100%'
  if (grade >= 80) return '80-89%'
  if (grade >= 70) return '70-79%'
  if (grade >= 60) return '60-69%'
  if (grade >= 50) return '50-59%'
  return '0-49%'
}

function bucketScore(score: number): string {
  if (score >= 90) return '90-100%'
  if (score >= 80) return '80-89%'
  if (score >= 70) return '70-79%'
  if (score >= 60) return '60-69%'
  if (score >= 50) return '50-59%'
  return '0-49%'
}

export async function GET(_request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    const [
      coursesResult,
      enrollmentsResult,
      traineesResult,
      instructorsResult,
      certificatesResult,
      assessmentsResult,
      assessmentSubmissionsResult,
      assignmentSubmissionsResult,
    ] = await Promise.all([
      cachedPayloadFind(payload, { collection: 'courses', limit: 0, depth: 0 }),
      cachedPayloadFind(payload, {
        collection: 'course-enrollments',
        limit: 2000,
        depth: 0,
        sort: '-enrolledAt',
      }),
      cachedPayloadFind(payload, { collection: 'trainees', limit: 0, depth: 0 }),
      cachedPayloadFind(payload, { collection: 'instructors', limit: 0, depth: 0 }),
      cachedPayloadFind(payload, {
        collection: 'certificates',
        limit: 2000,
        depth: 0,
        sort: '-issueDate',
      }),
      cachedPayloadFind(payload, { collection: 'assessments', limit: 0, depth: 0 }),
      cachedPayloadFind(payload, {
        collection: 'assessment-submissions',
        limit: 2000,
        depth: 0,
        sort: '-completedAt',
      }),
      cachedPayloadFind(payload, { collection: 'assignment-submissions', limit: 0, depth: 0 }),
    ])

    const courses = coursesResult.docs || []
    const enrollments = enrollmentsResult.docs || []
    const certificates = certificatesResult.docs || []
    const assessmentSubmissions = assessmentSubmissionsResult.docs || []

    const courseMap = new Map<string, string>()
    for (const c of courses) {
      courseMap.set(String(c.id), c.title || `Course #${c.id}`)
    }

    const activeCount = enrollments.filter((e: any) => e.status === 'active').length
    const completedCount = enrollments.filter((e: any) => e.status === 'completed').length
    const droppedCount = enrollments.filter((e: any) => e.status === 'dropped').length

    const grades = enrollments
      .map((e: any) => (e.finalGrade ?? e.currentGrade) as number | undefined)
      .filter((g: any): g is number => typeof g === 'number' && !isNaN(g))
    const avgGrade = grades.length > 0
      ? Math.round(grades.reduce((a: number, b: number) => a + b, 0) / grades.length)
      : 0

    const progressValues = enrollments
      .map((e: any) => e.progressPercentage as number | undefined)
      .filter((p: any): p is number => typeof p === 'number' && !isNaN(p))
    const avgProgress = progressValues.length > 0
      ? Math.round(progressValues.reduce((a: number, b: number) => a + b, 0) / progressValues.length)
      : 0

    const totalAssignments = assignmentSubmissionsResult.totalDocs || 0
    const completionRate = enrollments.length > 0
      ? Math.round((completedCount / enrollments.length) * 100)
      : 0

    const statusDistribution = [
      { status: 'active', count: activeCount },
      { status: 'completed', count: completedCount },
      { status: 'dropped', count: droppedCount },
      { status: 'suspended', count: enrollments.filter((e: any) => e.status === 'suspended').length },
      { status: 'pending', count: enrollments.filter((e: any) => e.status === 'pending').length },
      { status: 'expired', count: enrollments.filter((e: any) => e.status === 'expired').length },
    ].filter(s => s.count > 0)

    const gradeBuckets = new Map<string, number>()
    for (const g of grades) {
      const bucket = bucketGrade(g)
      gradeBuckets.set(bucket, (gradeBuckets.get(bucket) || 0) + 1)
    }
    const gradeDistribution = Array.from(gradeBuckets.entries())
      .map(([range, count]) => ({ range, count }))
      .sort((a, b) => a.range.localeCompare(b.range))

    const enrollmentTypeBuckets = new Map<string, number>()
    for (const e of enrollments) {
      const t = e.enrollmentType || 'unknown'
      enrollmentTypeBuckets.set(t, (enrollmentTypeBuckets.get(t) || 0) + 1)
    }
    const enrollmentTypeDistribution = Array.from(enrollmentTypeBuckets.entries())
      .map(([type, count]) => ({ type, count }))

    const now = new Date()
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const newTraineesThisMonth = enrollments.filter((e: any) => {
      const enrolledAt = e.enrolledAt || e.createdAt
      return enrolledAt && enrolledAt.slice(0, 7) === thisMonth
    }).length

    const uniqueActiveTrainees = new Set(
      enrollments.filter((e: any) => e.status === 'active').map((e: any) => String(e.student))
    )
    const activeTrainees = uniqueActiveTrainees.size

    const courseStatusBuckets = new Map<string, number>()
    for (const c of courses) {
      const s = c.status || 'unknown'
      courseStatusBuckets.set(s, (courseStatusBuckets.get(s) || 0) + 1)
    }
    const courseStatusDistribution = Array.from(courseStatusBuckets.entries())
      .map(([status, count]) => ({ status, count }))

    const courseCategoryMap = new Map<string, number>()
    for (const course of courses) {
      const cats = course.category
      if (Array.isArray(cats)) {
        for (const cat of cats) {
          const name = typeof cat === 'object' && cat
            ? (cat.name || cat.title || `Category #${cat.id}`)
            : `Category #${cat}`
          courseCategoryMap.set(name, (courseCategoryMap.get(name) || 0) + 1)
        }
      }
    }
    const categoryDistribution = Array.from(courseCategoryMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: courses.length > 0 ? Math.round((count / courses.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)

    const difficultyBuckets = new Map<string, number>()
    for (const c of courses) {
      const d = c.difficultyLevel || 'standard'
      difficultyBuckets.set(d, (difficultyBuckets.get(d) || 0) + 1)
    }
    const difficultyDistribution = Array.from(difficultyBuckets.entries())
      .map(([level, count]) => ({ level, count }))

    const courseEnrollmentCount = new Map<string, {
      count: number
      completed: number
      grades: number[]
    }>()
    for (const c of courses) {
      courseEnrollmentCount.set(String(c.id), { count: 0, completed: 0, grades: [] })
    }
    for (const enrollment of enrollments) {
      const courseId = typeof enrollment.course === 'object'
        ? String(enrollment.course?.id)
        : String(enrollment.course || '')
      let entry = courseEnrollmentCount.get(courseId)
      if (!entry) {
        entry = { count: 0, completed: 0, grades: [] }
        courseEnrollmentCount.set(courseId, entry)
      }
      entry.count++
      if (enrollment.status === 'completed') entry.completed++
      const grade = (enrollment.finalGrade ?? enrollment.currentGrade) as number | undefined
      if (typeof grade === 'number' && !isNaN(grade)) {
        entry.grades.push(grade)
      }
    }
    const topCourses = Array.from(courseEnrollmentCount.entries())
      .map(([id, data]) => ({
        id,
        title: courseMap.get(id) || `Course #${id}`,
        enrollmentCount: data.count,
        completionRate: data.count > 0
          ? Math.round((data.completed / data.count) * 100)
          : 0,
        avgGrade: data.grades.length > 0
          ? Math.round(data.grades.reduce((a, b) => a + b, 0) / data.grades.length)
          : 0,
        status: courses.find((c: any) => String(c.id) === id)?.status || 'unknown',
      }))
      .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
      .slice(0, 10)

    const avgCompletionRate = topCourses.length > 0
      ? Math.round(topCourses.reduce((a, c) => a + c.completionRate, 0) / topCourses.length)
      : 0
    const avgEnrollmentPerCourse = courses.length > 0
      ? Math.round(enrollments.length / courses.length)
      : 0

    const totalAssessmentsCount = assessmentsResult.totalDocs || 0
    const gradedSubmissions = assessmentSubmissions.filter(
      (s: any) => s.status === 'graded' || s.status === 'submitted'
    )
    const passedCount = gradedSubmissions.filter((s: any) => {
      const score = s.score ?? 0
      const passingScore = s.passingScoreSnapshot ?? 0
      return score >= passingScore
    }).length
    const failedCount = gradedSubmissions.length - passedCount

    const passRate = gradedSubmissions.length > 0
      ? Math.round((passedCount / gradedSubmissions.length) * 100)
      : 0

    const scores = gradedSubmissions
      .map((s: any) => s.score as number | undefined)
      .filter((s: any): s is number => typeof s === 'number' && !isNaN(s))
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
      : 0

    const scoreBuckets = new Map<string, number>()
    for (const s of scores) {
      const bucket = bucketScore(s)
      scoreBuckets.set(bucket, (scoreBuckets.get(bucket) || 0) + 1)
    }
    const scoreDistribution = Array.from(scoreBuckets.entries())
      .map(([range, count]) => ({ range, count }))
      .sort((a, b) => a.range.localeCompare(b.range))

    const monthlySubmissions = buildTrendMap(assessmentSubmissions, 'createdAt')

    const attemptNumbers = gradedSubmissions
      .map((s: any) => s.attemptNumber as number | undefined)
      .filter((a: any): a is number => typeof a === 'number' && !isNaN(a))
    const avgAttempts = attemptNumbers.length > 0
      ? Math.round((attemptNumbers.reduce((a: number, b: number) => a + b, 0) / attemptNumbers.length) * 10) / 10
      : 0

    const certActiveCount = certificates.filter((c: any) => c.status === 'active').length
    const certRevokedCount = certificates.filter((c: any) => c.status === 'revoked').length
    const certExpiredCount = certificates.filter((c: any) => c.status === 'expired' || c.status === 'expired').length

    const certificateDates = certificates
      .map((c: any) => c.issueDate)
      .filter((d: any): d is string => !!d)
      .sort()

    const certCourseCount = new Map<string, number>()
    for (const cert of certificates) {
      const courseId = typeof cert.course === 'object'
        ? String(cert.course?.id)
        : String(cert.course || '')
      certCourseCount.set(courseId, (certCourseCount.get(courseId) || 0) + 1)
    }
    const topCertCourses = Array.from(certCourseCount.entries())
      .map(([id, count]) => ({
        title: courseMap.get(id) || `Course #${id}`,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const certComplianceRate = completedCount > 0
      ? Math.round((certificates.length / completedCount) * 100)
      : 0

    return NextResponse.json({
      overview: {
        totalCourses: courses.length,
        totalEnrollments: enrollments.length,
        totalStudents: traineesResult.totalDocs || 0,
        totalInstructors: instructorsResult.totalDocs || 0,
        activeEnrollments: activeCount,
        completedEnrollments: completedCount,
        droppedEnrollments: droppedCount,
        completionRate,
        totalCertificates: certificates.length,
        totalAssessments: totalAssessmentsCount,
        totalAssignments,
        avgGrade,
        avgProgress,
      },
      learners: {
        totalTrainees: traineesResult.totalDocs || 0,
        enrollmentStatusDistribution: statusDistribution,
        gradeDistribution,
        enrollmentTypeDistribution,
        newTraineesThisMonth,
        activeTrainees,
      },
      courses: {
        totalCourses: courses.length,
        courseStatusDistribution,
        categoryDistribution,
        topCourses,
        avgCompletionRate,
        avgEnrollmentPerCourse,
        difficultyDistribution,
      },
      assessments: {
        totalSubmissions: assessmentSubmissions.length,
        totalAssessments: totalAssessmentsCount,
        passRate,
        avgScore,
        passFailDistribution: [
          { status: 'passed', count: passedCount },
          { status: 'failed', count: failedCount },
        ].filter(s => s.count > 0),
        scoreDistribution,
        monthlySubmissions,
        avgAttempts,
      },
      certifications: {
        totalCertificates: certificates.length,
        activeCertificates: certActiveCount,
        revokedCertificates: certRevokedCount,
        expiredCertificates: certExpiredCount,
        certificateDates,
        topCourses: topCertCourses,
        certComplianceRate,
      },
    })
  } catch (error) {
    console.error('Error fetching reports data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
