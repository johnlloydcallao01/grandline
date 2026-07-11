import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, LMS_PAYOUT_METHOD_OPTIONS, LMS_SPONSOR_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { normalizeAmount } from '@/accounting/utils/amounts'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

type RuleDoc = {
  id: number | string
  instructor?: {
    id?: number | string
    user?: { id?: number | string; firstName?: string | null; lastName?: string | null; email?: string | null } | number | string | null
    specialization?: string | null
  } | number | string | null
  course?: { id?: number | string; title?: string | null; courseCode?: string | null } | number | string | null
  payoutMethod?: string | null
  flatAmount?: number | null
  percentOfRevenue?: number | null
  perEnrollmentAmount?: number | null
  completionBonusAmount?: number | null
  status?: string | null
  notes?: string | null
}

type InstructorDoc = {
  id: number | string
  user?: { id?: number | string; firstName?: string | null; lastName?: string | null; email?: string | null } | number | string | null
  specialization?: string | null
}

type CourseDoc = {
  id: number | string
  title?: string | null
  courseCode?: string | null
  instructor?: unknown
}

type Cell = string | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' }

type RuleRow = {
  id: string
  instructorId: string
  instructorLabel: string
  courseId: string
  courseLabel: string
  payoutMethod: string
  payoutMethodLabel: string
  flatAmount: number
  flatAmountLabel: string
  percentOfRevenue: number
  percentOfRevenueLabel: string
  perEnrollmentAmount: number
  completionBonusAmount: number
  status: string
  statusLabel: string
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red'
  notes: string
  searchableText: string
  cells: Cell[]
}

const METHOD_LABELS = new Map<string, string>(LMS_PAYOUT_METHOD_OPTIONS.map((o) => [o.value, o.label]))
const STATUS_LABELS = new Map<string, string>(LMS_SPONSOR_STATUS_OPTIONS.map((o) => [o.value, o.label]))

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) return fallback
  const p = Number(value)
  return Number.isFinite(p) ? p : fallback
}

const parseListParam = (searchParams: URLSearchParams, key: string): string[] =>
  Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))

const normalizeSearch = (value: unknown) => String(value ?? '').toLowerCase().trim()

const formatCurrency = (value: number | null | undefined) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0))

const getStatusTone = (status: string | null | undefined): 'amber' | 'blue' | 'gray' | 'green' | 'red' => {
  switch (String(status || '')) {
    case 'active': return 'green'
    case 'inactive': return 'gray'
    case 'archived': return 'red'
    default: return 'gray'
  }
}

const buildInstructorLabel = (instructor: RuleDoc['instructor']) => {
  if (!instructor) return '-'
  if (typeof instructor === 'number' || typeof instructor === 'string') return String(instructor)
  const userObj = instructor.user
  if (userObj && typeof userObj === 'object' && 'firstName' in userObj) {
    const firstName = String(userObj.firstName || '')
    const lastName = String(userObj.lastName || '')
    return `${firstName} ${lastName}`.trim() || String(userObj.email || `Instructor ${instructor.id}`)
  }
  if (userObj && typeof userObj === 'object' && 'email' in userObj) {
    return String(userObj.email || `Instructor ${instructor.id}`)
  }
  return String(instructor.specialization || `Instructor ${instructor.id}`)
}

const buildCourseLabel = (course: RuleDoc['course']) => {
  if (!course) return '-'
  if (typeof course === 'number' || typeof course === 'string') return String(course)
  return String(course.title || course.courseCode || `Course ${course.id}`)
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const statuses = parseListParam(searchParams, 'status')
    const payoutMethods = parseListParam(searchParams, 'payoutMethod')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [rules, instructors, courses] = await Promise.all([
      findAllDocs<RuleDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.instructorPayoutRules,
        depth: 2,
        sort: '-createdAt',
      }),
      findAllDocs<InstructorDoc>({
        payload,
        collection: 'instructors',
        depth: 1,
        sort: 'user',
      }),
      findAllDocs<CourseDoc>({
        payload,
        collection: 'courses',
        depth: 0,
        sort: 'title',
      }),
    ])

    const allRows = rules.map<RuleRow>((rule) => {
      const method = String(rule.payoutMethod || '')
      const status = String(rule.status || '')
      const instructorLabel = buildInstructorLabel(rule.instructor)
      const courseLabel = buildCourseLabel(rule.course)
      const flatAmount = normalizeAmount(rule.flatAmount)
      const percentOfRevenue = Number(rule.percentOfRevenue) || 0

      return {
        id: String(rule.id),
        instructorId: String(getRelationshipId(rule.instructor) || ''),
        instructorLabel,
        courseId: String(getRelationshipId(rule.course) || ''),
        courseLabel,
        payoutMethod: method,
        payoutMethodLabel: METHOD_LABELS.get(method) || method || '-',
        flatAmount,
        flatAmountLabel: formatCurrency(flatAmount),
        percentOfRevenue,
        percentOfRevenueLabel: percentOfRevenue > 0 ? `${percentOfRevenue}%` : '0%',
        perEnrollmentAmount: normalizeAmount(rule.perEnrollmentAmount),
        completionBonusAmount: normalizeAmount(rule.completionBonusAmount),
        status,
        statusLabel: STATUS_LABELS.get(status) || 'Unknown',
        statusTone: getStatusTone(status),
        notes: String(rule.notes || ''),
        searchableText: [instructorLabel, courseLabel, method, status, rule.notes].map((v) => normalizeSearch(v)).filter(Boolean).join(' '),
        cells: [
          { text: instructorLabel, emphasis: true },
          courseLabel,
          METHOD_LABELS.get(method) || method || '-',
          { text: formatCurrency(flatAmount), align: 'right' },
          { text: percentOfRevenue > 0 ? `${percentOfRevenue}%` : '0%', align: 'right' },
          { text: STATUS_LABELS.get(status) || 'Unknown', tone: getStatusTone(status) },
        ],
      }
    })

    const normalizedSearch = normalizeSearch(search)
    const filteredRows = allRows.filter((row) => {
      if (normalizedSearch && !row.searchableText.includes(normalizedSearch)) return false
      if (statuses.length > 0 && !statuses.includes(row.status)) return false
      if (payoutMethods.length > 0 && !payoutMethods.includes(row.payoutMethod)) return false
      if (quickFilters.length > 0) {
        const match = quickFilters.some((qf) => {
          if (qf.startsWith('status:')) return row.status === qf.slice(7)
          if (qf === 'flat') return row.payoutMethod === 'flat'
          if (qf === 'revenue_share') return row.payoutMethod === 'revenue_share'
          if (qf === 'per_enrollment') return row.payoutMethod === 'per_enrollment'
          if (qf === 'hybrid') return row.payoutMethod === 'hybrid'
          return false
        })
        if (!match) return false
      }
      return true
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const paginatedRows = filteredRows.slice((page - 1) * limit, page * limit)

    const activeCount = allRows.filter((r) => r.status === 'active').length
    const revenueShareCount = allRows.filter((r) => r.payoutMethod === 'revenue_share').length
    const hybridCount = allRows.filter((r) => r.payoutMethod === 'hybrid').length

    return NextResponse.json({
      section: {
        id: 'instructor-payout-rules',
        label: 'Instructor Payout Rules',
        description: 'Review instructor payout-rule configuration by course, payout method, flat amount, revenue share, enrollment pay, completion bonus, and status.',
        searchPlaceholder: 'Search instructor, course, payout method, flat amount, percent of revenue, or status',
        filters: {
          statuses: LMS_SPONSOR_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
          payoutMethods: LMS_PAYOUT_METHOD_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
          quickFilters: [
            { label: 'Active Rules', value: 'status:active' },
            { label: 'Flat', value: 'flat' },
            { label: 'Revenue Share', value: 'revenue_share' },
            { label: 'Hybrid', value: 'hybrid' },
          ],
        },
        metrics: [
          { id: 'total-rules', label: 'Payout Rules', value: allRows.length, change: 'Rule records controlling instructor cost generation', trend: allRows.length > 0 ? 'up' as const : 'neutral' as const },
          { id: 'active-rules', label: 'Active Rules', value: activeCount, change: 'Rules currently eligible for payout calculation', trend: activeCount > 0 ? 'up' as const : 'neutral' as const },
          { id: 'revenue-share-rules', label: 'Revenue Share Rules', value: revenueShareCount, change: 'Rules using revenue-linked payout logic', trend: revenueShareCount > 0 ? 'neutral' as const : 'down' as const },
          { id: 'hybrid-rules', label: 'Hybrid Rules', value: hybridCount, change: 'Rules combining multiple payout drivers', trend: hybridCount > 0 ? 'up' as const : 'neutral' as const },
        ],
        table: {
          title: 'Instructor Payout Rule Register',
          description: 'Rule configuration aligned to `accounting-instructor-payout-rules`, including method-specific amount fields and rule status.',
          columns: ['Instructor', 'Course', 'Method', { label: 'Flat Amount', align: 'right' }, { label: 'Revenue %', align: 'right' }, 'Status'],
          rows: paginatedRows,
        },
      },
      appliedFilters: {
        search,
        statuses,
        payoutMethods,
        quickFilters,
      },
      pagination: {
        page,
        limit,
        totalDocs,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      },
      totals: {
        totalRows: allRows.length,
        filteredRows: totalDocs,
      },
      referenceData: {
        instructors: instructors.map((inst) => ({
          id: inst.id,
          label: buildInstructorLabel(inst),
        })),
        courses: courses.map((c) => ({
          id: c.id,
          title: c.title || null,
          courseCode: c.courseCode || null,
        })),
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = await request.json()

    if (!body.instructor) throw new Error('Instructor is required.')
    if (!body.course) throw new Error('Course is required.')

    const record = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.instructorPayoutRules,
      overrideAccess: true,
      data: {
        instructor: Number(body.instructor) || 0,
        course: Number(body.course) || 0,
        payoutMethod: String(body.payoutMethod || 'flat'),
        flatAmount: Math.max(0, Number(body.flatAmount) || 0),
        percentOfRevenue: Math.min(100, Math.max(0, Number(body.percentOfRevenue) || 0)),
        perEnrollmentAmount: Math.max(0, Number(body.perEnrollmentAmount) || 0),
        completionBonusAmount: Math.max(0, Number(body.completionBonusAmount) || 0),
        status: String(body.status || 'active'),
        notes: String(body.notes || '').trim() || null,
        createdBy: user.id,
        updatedBy: user.id,
      } as never,
      depth: 0,
    })

    return NextResponse.json({ id: record.id }, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
