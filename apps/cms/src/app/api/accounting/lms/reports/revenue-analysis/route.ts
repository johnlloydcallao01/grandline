import { NextRequest, NextResponse } from 'next/server'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { normalizeAmount, roundCurrency } from '@/accounting/utils/amounts'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'

type RevenueByCourseRow = {
  id: string
  courseTitle: string
  linkedEnrollments: number
  averageCharge: number
  averageChargeLabel: string
  billedRevenue: number
  billedRevenueLabel: string
  rank: number
  billingLinkCount: number
}

type RevenueByInstructorRow = {
  id: string
  instructorName: string
  linkedCourses: number
  linkedEnrollments: number
  billedRevenue: number
  billedRevenueLabel: string
  revenueShare: number
  revenueShareLabel: string
}

type RevenueByEnrollmentTypeRow = {
  id: string
  enrollmentType: string
  linkedEnrollments: number
  averageCharge: number
  averageChargeLabel: string
  billedRevenue: number
  billedRevenueLabel: string
  share: number
  shareLabel: string
}

type RevenueAnalysisResponse = {
  tab: string
  metrics: Array<{ id: string; label: string; value: string; change: string; trend: 'up' | 'down' | 'neutral' }>
  rows: RevenueByCourseRow[] | RevenueByInstructorRow[] | RevenueByEnrollmentTypeRow[]
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean }
  totals: { totalRows: number; filteredRows: number }
}

function getInstructorName(course: unknown): string {
  if (!course || typeof course !== 'object') return 'Unknown'
  const c = course as Record<string, unknown>
  const instructor = c.instructor
  if (!instructor || typeof instructor !== 'object') return `Instructor #${getRelationshipId(instructor) || '?'}`
  const inst = instructor as Record<string, unknown>
  const user = inst.user
  if (user && typeof user === 'object') {
    const u = user as Record<string, unknown>
    const parts = [u.firstName, u.lastName].filter(Boolean)
    if (parts.length > 0) return parts.join(' ')
  }
  return `${inst.id || '?'}`
}

function getCourseTitle(course: unknown): string {
  if (!course || typeof course !== 'object') return 'Unknown Course'
  const c = course as Record<string, unknown>
  return (c.title as string) || `Course #${c.id || '?'}`
}

function searchMatches(text: string, search: string): boolean {
  if (!search) return true
  return text.toLowerCase().includes(search.toLowerCase())
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const tab = searchParams.get('tab') || 'revenue-by-course'
    const search = searchParams.get('search') || ''
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 10))

    const links = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
      depth: 3,
    })

    if (tab === 'revenue-by-course') {
      const courseMap = new Map<string, { courseTitle: string; enrollments: Set<string>; billedRevenue: number }>()
      for (const link of links) {
        const courseId = String(getRelationshipId(link.course) || link.id)
        const entry = courseMap.get(courseId) || { courseTitle: getCourseTitle(link.course), enrollments: new Set(), billedRevenue: 0 }
        entry.courseTitle = getCourseTitle(link.course)
        entry.enrollments.add(String(getRelationshipId(link.enrollment) || link.id))
        entry.billedRevenue = roundCurrency(entry.billedRevenue + normalizeAmount(link.finalChargeSnapshot))
        courseMap.set(courseId, entry)
      }

      let allRows: RevenueByCourseRow[] = Array.from(courseMap.entries())
        .map(([courseId, data]) => ({
          id: courseId,
          courseTitle: data.courseTitle,
          linkedEnrollments: data.enrollments.size,
          averageCharge: data.enrollments.size > 0 ? roundCurrency(data.billedRevenue / data.enrollments.size) : 0,
          averageChargeLabel: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(
            data.enrollments.size > 0 ? roundCurrency(data.billedRevenue / data.enrollments.size) : 0,
          ),
          billedRevenue: data.billedRevenue,
          billedRevenueLabel: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(data.billedRevenue),
          rank: 0,
          billingLinkCount: links.filter((l) => String(getRelationshipId(l.course)) === courseId).length,
        }))
        .sort((a, b) => b.billedRevenue - a.billedRevenue)
        .map((row, i) => ({ ...row, rank: i + 1 }))

      if (search) {
        allRows = allRows.filter((r) => searchMatches(r.courseTitle, search))
      }

      const totalDocs = allRows.length
      const totalPages = Math.ceil(totalDocs / limit)
      const offset = (page - 1) * limit
      const pagedRows = allRows.slice(offset, offset + limit)

      const totalBilledRevenue = allRows.reduce((s, r) => s + r.billedRevenue, 0)

      return NextResponse.json({
        tab,
        metrics: [
          { id: 'total-revenue', label: 'Total Billed Revenue', value: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(totalBilledRevenue), change: 'Across all enrollment billing links', trend: 'up' as const },
          { id: 'course-count', label: 'Courses With Revenue', value: String(allRows.length), change: 'Courses contributing to billed revenue', trend: 'up' as const },
          { id: 'top-course', label: 'Top Course Revenue', value: allRows[0]?.billedRevenueLabel || 'PHP 0.00', change: allRows[0]?.courseTitle || 'N/A', trend: 'up' as const },
          { id: 'total-links', label: 'Billing Links Count', value: String(links.length), change: 'Total enrollment billing links processed', trend: 'neutral' as const },
        ],
        rows: pagedRows,
        pagination: { page, limit, totalDocs, totalPages, hasPrevPage: page > 1, hasNextPage: page < totalPages },
        totals: { totalRows: allRows.length, filteredRows: pagedRows.length },
      } as RevenueAnalysisResponse)
    }

    if (tab === 'revenue-by-instructor') {
      const instructorMap = new Map<string, { instructorName: string; courses: Set<string>; enrollments: Set<string>; billedRevenue: number }>()
      for (const link of links) {
        const course = typeof link.course === 'object' ? link.course : null
        const instructorId = String(getRelationshipId(course?.instructor) || 'unknown')
        const entry = instructorMap.get(instructorId) || { instructorName: getInstructorName(course), courses: new Set(), enrollments: new Set(), billedRevenue: 0 }
        entry.instructorName = getInstructorName(course)
        if (course) entry.courses.add(String(course.id || instructorId))
        entry.enrollments.add(String(getRelationshipId(link.enrollment) || link.id))
        entry.billedRevenue = roundCurrency(entry.billedRevenue + normalizeAmount(link.finalChargeSnapshot))
        instructorMap.set(instructorId, entry)
      }

      const totalRevenue = Array.from(instructorMap.values()).reduce((s, e) => s + e.billedRevenue, 0)

      let allRows: RevenueByInstructorRow[] = Array.from(instructorMap.entries())
        .map(([instructorId, data]) => ({
          id: instructorId,
          instructorName: data.instructorName,
          linkedCourses: data.courses.size,
          linkedEnrollments: data.enrollments.size,
          billedRevenue: data.billedRevenue,
          billedRevenueLabel: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(data.billedRevenue),
          revenueShare: totalRevenue > 0 ? roundCurrency((data.billedRevenue / totalRevenue) * 100) : 0,
          revenueShareLabel: totalRevenue > 0 ? `${((data.billedRevenue / totalRevenue) * 100).toFixed(1)}%` : '0%',
        }))
        .sort((a, b) => b.billedRevenue - a.billedRevenue)

      if (search) {
        allRows = allRows.filter((r) => searchMatches(r.instructorName, search))
      }

      const totalDocs = allRows.length
      const totalPages = Math.ceil(totalDocs / limit)
      const offset = (page - 1) * limit
      const pagedRows = allRows.slice(offset, offset + limit)

      return NextResponse.json({
        tab,
        metrics: [
          { id: 'total-revenue', label: 'Total Billed Revenue', value: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(totalRevenue), change: 'Across all instructor buckets', trend: 'up' as const },
          { id: 'instructor-count', label: 'Instructors In View', value: String(allRows.length), change: 'Instructor rows contributing to LMS billed revenue', trend: 'up' as const },
          { id: 'top-instructor', label: 'Top Instructor Revenue', value: allRows[0]?.billedRevenueLabel || 'PHP 0.00', change: allRows[0]?.instructorName || 'N/A', trend: 'up' as const },
          { id: 'avg-instructor', label: 'Average Instructor Revenue', value: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(allRows.length > 0 ? totalRevenue / allRows.length : 0), change: 'Average billed revenue per instructor row', trend: 'neutral' as const },
        ],
        rows: pagedRows,
        pagination: { page, limit, totalDocs, totalPages, hasPrevPage: page > 1, hasNextPage: page < totalPages },
        totals: { totalRows: allRows.length, filteredRows: pagedRows.length },
      } as RevenueAnalysisResponse)
    }

    if (tab === 'revenue-by-enrollment-type') {
      const enrollmentTypeMap = new Map<string, { enrollments: Set<string>; billedRevenue: number }>()
      for (const link of links) {
        const enrollment = typeof link.enrollment === 'object' ? link.enrollment : null
        const enrollmentType = String(enrollment?.enrollmentType || 'unknown').toLowerCase()
        const entry = enrollmentTypeMap.get(enrollmentType) || { enrollments: new Set(), billedRevenue: 0 }
        entry.enrollments.add(String(getRelationshipId(link.enrollment) || link.id))
        entry.billedRevenue = roundCurrency(entry.billedRevenue + normalizeAmount(link.finalChargeSnapshot))
        enrollmentTypeMap.set(enrollmentType, entry)
      }

      const totalRevenue = Array.from(enrollmentTypeMap.values()).reduce((s, e) => s + e.billedRevenue, 0)

      let allRows: RevenueByEnrollmentTypeRow[] = Array.from(enrollmentTypeMap.entries())
        .map(([enrollmentType, data]) => ({
          id: enrollmentType,
          enrollmentType,
          linkedEnrollments: data.enrollments.size,
          averageCharge: data.enrollments.size > 0 ? roundCurrency(data.billedRevenue / data.enrollments.size) : 0,
          averageChargeLabel: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(
            data.enrollments.size > 0 ? roundCurrency(data.billedRevenue / data.enrollments.size) : 0,
          ),
          billedRevenue: data.billedRevenue,
          billedRevenueLabel: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(data.billedRevenue),
          share: totalRevenue > 0 ? roundCurrency((data.billedRevenue / totalRevenue) * 100) : 0,
          shareLabel: totalRevenue > 0 ? `${((data.billedRevenue / totalRevenue) * 100).toFixed(1)}%` : '0%',
        }))
        .sort((a, b) => b.billedRevenue - a.billedRevenue)

      if (search) {
        allRows = allRows.filter((r) => searchMatches(r.enrollmentType, search))
      }

      const totalDocs = allRows.length
      const totalPages = Math.ceil(totalDocs / limit)
      const offset = (page - 1) * limit
      const pagedRows = allRows.slice(offset, offset + limit)

      return NextResponse.json({
        tab,
        metrics: [
          { id: 'total-revenue', label: 'Total Billed Revenue', value: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(totalRevenue), change: 'Across all enrollment type buckets', trend: 'up' as const },
          { id: 'type-count', label: 'Enrollment Types', value: String(allRows.length), change: 'Distinct enrollment-type buckets', trend: 'neutral' as const },
          { id: 'top-type', label: 'Top Type Revenue', value: allRows[0]?.billedRevenueLabel || 'PHP 0.00', change: allRows[0]?.enrollmentType || 'N/A', trend: 'up' as const },
          { id: 'largest-bucket', label: 'Largest Type Bucket', value: allRows[0]?.billedRevenueLabel || 'PHP 0.00', change: allRows[0]?.enrollmentType || 'N/A', trend: 'up' as const },
        ],
        rows: pagedRows,
        pagination: { page, limit, totalDocs, totalPages, hasPrevPage: page > 1, hasNextPage: page < totalPages },
        totals: { totalRows: allRows.length, filteredRows: pagedRows.length },
      } as RevenueAnalysisResponse)
    }

    return NextResponse.json({ error: `Unknown tab: ${tab}` }, { status: 400 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
