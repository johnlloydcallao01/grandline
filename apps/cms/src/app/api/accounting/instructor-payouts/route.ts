import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, LMS_PAYOUT_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { AccountingApiError, handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const fmt = (n: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(n)

const parseListParam = (sp: URLSearchParams, key: string): string[] =>
  Array.from(new Set(sp.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))

const normalizeText = (v?: string | null) => String(v || '').trim().toLowerCase()

const statusLabelMap = new Map<string, string>(LMS_PAYOUT_STATUS_OPTIONS.map((o) => [o.value, o.label]))

function getStatusTone(status: string): string {
  if (status === 'paid') return 'green'
  if (status === 'approved') return 'blue'
  if (status === 'calculated') return 'amber'
  if (status === 'voided') return 'red'
  return 'gray'
}

function getInstructorDisplayName(instructor: Record<string, unknown> | undefined): string {
  if (!instructor) return '-'
  const user = instructor.user as Record<string, unknown> | undefined
  if (user) {
    const first = String(user.firstName || '').trim()
    const last = String(user.lastName || '').trim()
    if (first || last) return `${first} ${last}`.trim()
    if (user.email) return String(user.email)
  }
  if (instructor.contactEmail) return String(instructor.contactEmail)
  return `Instructor #${instructor.id}`
}

function getCourseDisplayName(course: Record<string, unknown> | undefined): string {
  if (!course) return '-'
  if (course.title) return String(course.title)
  if (course.courseCode) return String(course.courseCode)
  return `Course #${course.id}`
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const sp = new URL(request.url).searchParams
    const search = normalizeText(sp.get('search'))
    const statuses = parseListParam(sp, 'status')
    const quickFilters = parseListParam(sp, 'quickFilter')
    const page = Math.max(1, Number(sp.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, Number(sp.get('limit')) || 10))

    const allDocs = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.instructorPayouts,
      depth: 2,
      limit: 10000,
      sort: '-periodStart',
      overrideAccess: true,
    })

    const rows = allDocs.docs.map((doc) => {
      const d = doc as unknown as Record<string, unknown>
      const st = String(d.status || '')
      const instructor = d.instructor as unknown as Record<string, unknown> | undefined
      const course = d.course as unknown as Record<string, unknown> | undefined
      const ca = Number(d.calculatedAmount) || 0
      const aa = Number(d.approvedAmount) || 0
      const instructorName = getInstructorDisplayName(instructor)
      const courseName = getCourseDisplayName(course)
      return {
        id: String(d.id),
        instructorName,
        instructorId: String(instructor?.id ?? ''),
        courseName,
        courseId: String(course?.id ?? ''),
        periodStart: d.periodStart ? String(d.periodStart).slice(0, 10) : null,
        periodEnd: d.periodEnd ? String(d.periodEnd).slice(0, 10) : null,
        sourceReference: String(d.sourceReference || ''),
        calculatedAmount: ca,
        calculatedAmountLabel: fmt(ca),
        approvedAmount: aa,
        approvedAmountLabel: fmt(aa),
        status: st,
        statusLabel: statusLabelMap.get(st) || st || '-',
        statusTone: getStatusTone(st),
        cells: [
          { text: instructorName, emphasis: true },
          courseName,
          d.periodStart && d.periodEnd ? `${String(d.periodStart).slice(0, 10)} to ${String(d.periodEnd).slice(0, 10)}` : '-',
          { text: fmt(ca), align: 'right' },
          { text: fmt(aa), align: 'right' },
          { text: statusLabelMap.get(st) || st || '-', tone: getStatusTone(st) },
        ],
      }
    })

    let filtered = rows
    if (search) {
      filtered = filtered.filter((r) =>
        [r.instructorName, r.courseName, r.sourceReference, r.statusLabel, String(r.calculatedAmount), String(r.approvedAmount)]
          .map((v) => normalizeText(v))
          .some((v) => v.includes(search)),
      )
    }
    if (statuses.length > 0) {
      filtered = filtered.filter((r) => statuses.includes(r.status))
    }
    if (quickFilters.length > 0) {
      const allQf = ['status:draft', 'status:calculated', 'status:approved', 'status:paid']
      const selectedSet = new Set(quickFilters)
      const allSelected = allQf.every((v) => selectedSet.has(v))
      if (!allSelected) {
        filtered = filtered.filter((r) =>
          quickFilters.some((qf) => {
            const [prefix, value] = qf.split(':')
            if (prefix === 'status') return r.status === value
            return false
          }),
        )
      }
    }

    const totalDocs = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filtered.slice((currentPage - 1) * limit, currentPage * limit)

    const totalPayouts = rows.length
    const approvedTotal = rows.filter((r) => r.status === 'approved').reduce((s, r) => s + r.approvedAmount, 0)
    const draftCount = rows.filter((r) => r.status === 'draft').length
    const uniqueCourses = new Set(rows.map((r) => r.courseName)).size

    const [instructorRefs, courseRefs] = await Promise.all([
      payload.find({ collection: 'instructors', depth: 2, limit: 500, sort: '-createdAt', overrideAccess: true }),
      payload.find({ collection: 'courses', depth: 0, limit: 500, sort: '-createdAt', overrideAccess: true }),
    ])

    return NextResponse.json({
      rows: paginatedRows,
      metrics: [
        { id: 'payout-rows', label: 'Payout Rows', value: totalPayouts, change: 'Instructor payout obligations tracked from LMS activity', trend: 'up' as const },
        { id: 'approved-amount', label: 'Approved Amount', value: fmt(approvedTotal), change: 'Current approved payout value across visible rows', trend: approvedTotal > 0 ? 'up' as const : 'neutral' as const },
        { id: 'draft-payouts', label: 'Draft Payouts', value: draftCount, change: 'Rows still waiting for payout review or approval', trend: draftCount > 0 ? 'neutral' as const : 'down' as const },
        { id: 'courses-covered', label: 'Courses Covered', value: uniqueCourses, change: 'Courses represented in payout obligations', trend: 'up' as const },
      ],
      filterOptions: {
        statuses: LMS_PAYOUT_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
        quickFilters: [
          { label: 'Draft', value: 'status:draft' },
          { label: 'Calculated', value: 'status:calculated' },
          { label: 'Approved', value: 'status:approved' },
          { label: 'Paid', value: 'status:paid' },
        ],
      },
      meta: {
        searchPlaceholder: 'Search instructor, course, source reference, or status',
        columns: ['Instructor', 'Course', 'Period', 'Calculated Amount', 'Approved Amount', 'Status'],
        tableTitle: 'Instructor Payout Register',
        tableDescription: 'Payout rows aligned to accounting-instructor-payouts, the contractor-adjacent payout surface in the backend.',
      },
      pagination: { page: currentPage, limit, totalDocs, totalPages, hasPrevPage: currentPage > 1, hasNextPage: currentPage < totalPages },
      totals: { totalRows: totalPayouts, filteredRows: totalDocs },
      referenceData: {
        instructors: instructorRefs.docs.map((d) => {
          const r = d as unknown as Record<string, unknown>
          const user = r.user as Record<string, unknown> | undefined
          let name = ''
          if (user) {
            const first = String(user.firstName || '').trim()
            const last = String(user.lastName || '').trim()
            name = first || last ? `${first} ${last}`.trim() : String(user.email || '')
          }
          return { id: String(r.id), name }
        }),
        courses: courseRefs.docs.map((d) => {
          const r = d as unknown as Record<string, unknown>
          return { id: String(r.id), name: String(r.title || r.courseCode || '') }
        }),
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

    const toId = (v: unknown): number | null => {
      if (v === null || v === undefined) return null
      const n = Number(v)
      return Number.isFinite(n) && n > 0 ? n : null
    }

    const instructorId = toId(body.instructor)
    if (!instructorId) throw new AccountingApiError('Instructor is required.', 400)
    const courseId = toId(body.course)
    if (!courseId) throw new AccountingApiError('Course is required.', 400)
    if (!body.periodStart) throw new AccountingApiError('Period start is required.', 400)
    if (!body.periodEnd) throw new AccountingApiError('Period end is required.', 400)

    const data: Record<string, unknown> = {
      instructor: instructorId,
      course: courseId,
      periodStart: String(body.periodStart),
      periodEnd: String(body.periodEnd),
      sourceType: String(body.sourceType || 'course_activity'),
      sourceReference: String(body.sourceReference || `PAYOUT-${Date.now()}`),
      calculatedAmount: Math.max(0, Number(body.calculatedAmount) || 0),
      status: String(body.status || 'draft'),
      createdBy: user.id,
      updatedBy: user.id,
    }

    if (body.approvedAmount !== undefined && body.approvedAmount !== null && body.approvedAmount !== '') {
      data.approvedAmount = Math.max(0, Number(body.approvedAmount))
    }
    if (body.notes) data.notes = String(body.notes).trim()

    const record = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.instructorPayouts,
      overrideAccess: true,
      data: data as never,
      depth: 2,
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
