import { NextRequest, NextResponse } from 'next/server'
import {
  ACCOUNTING_COLLECTION_SLUGS,
} from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { AccountingApiError, handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

type BillingLinkDoc = {
  id: number | string
  enrollment?: { id?: number | string } | number | string | null
  course?: {
    id?: number | string
    title?: string | null
    courseCode?: string | null
  } | number | string | null
  trainee?: {
    id?: number | string
    user?: { id?: number | string; firstName?: string | null; lastName?: string | null; email?: string | null } | number | string | null
  } | number | string | null
  user?: { id?: number | string; firstName?: string | null; lastName?: string | null; email?: string | null } | number | string | null
  invoice?: { id?: number | string; invoiceNumber?: string | null } | number | string | null
  customer?: { id?: number | string; customerCode?: string | null; displayName?: string | null } | number | string | null
  sourceReference?: string | null
  sourceType?: string | null
  billingStatus?: string | null
  listPriceSnapshot?: number | null
  salePriceSnapshot?: number | null
  couponDiscountSnapshot?: number | null
  scholarshipDiscountSnapshot?: number | null
  corporateCoverageSnapshot?: number | null
  adjustmentsNetSnapshot?: number | null
  finalChargeSnapshot?: number | null
  recognizedRevenueSnapshot?: number | null
  currency?: string | null
  linkedAt?: string | null
  notes?: string | null
}

type Cell = string | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' }

type BillingLinkRow = {
  id: string
  sourceReference: string
  courseId: string
  courseLabel: string
  customerLabel: string
  invoiceLabel: string
  billingStatus: string
  billingStatusLabel: string
  billingStatusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red'
  finalCharge: number
  finalChargeLabel: string
  cells: Cell[]
}

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
    case 'paid': return 'green'
    case 'invoiced': case 'drafted': return 'blue'
    case 'partially_paid': case 'pending': case 'not_started': return 'amber'
    case 'cancelled': case 'refunded': case 'dropped': case 'failed': return 'red'
    default: return 'gray'
  }
}

const titleCase = (value: string | null | undefined) =>
  String(value || '').split('_').join(' ').replace(/\b\w/g, (c) => c.toUpperCase())

const matchesQuickFilter = (row: BillingLinkRow, quickFilter: string): boolean => {
  const [group, value] = quickFilter.split(':')
  if (group === 'status') return row.billingStatus === value
  return false
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const statuses = parseListParam(searchParams, 'status')
    const courseIds = parseListParam(searchParams, 'courseId')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [links, coursesLookup, enrollments, traineesList, invoices, customers] = await Promise.all([
      findAllDocs<BillingLinkDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
        depth: 2,
        sort: '-linkedAt',
      }),
      findAllDocs<{ id: number | string; title?: string | null; courseCode?: string | null }>({
        payload,
        collection: 'courses',
        depth: 0,
        sort: 'title',
      }),
      findAllDocs<{
        id: number | string
        displayTitle?: string | null
        student?: {
          id?: number | string
          srn?: string | null
          user?: { id?: number | string; firstName?: string | null; lastName?: string | null; email?: string | null } | number | string | null
        } | number | string | null
        course?: { id?: number | string; title?: string | null; courseCode?: string | null } | number | string | null
      }>({
        payload,
        collection: 'course-enrollments',
        depth: 2,
        sort: '-createdAt',
      }),
      findAllDocs<{ id: number | string; srn?: string | null; user?: unknown }>({
        payload,
        collection: 'trainees',
        depth: 0,
        sort: 'srn',
      }),
      findAllDocs<{ id: number | string; invoiceNumber?: string | null }>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
        depth: 0,
        sort: '-createdAt',
      }),
      findAllDocs<{ id: number | string; customerCode?: string | null; displayName?: string | null }>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.customers,
        depth: 0,
        sort: 'customerCode',
      }),
    ])
    const coursesById = new Map<string, { id: string; title: string }>()
    for (const c of coursesLookup) {
      const id = String(c.id)
      const title = c.title || c.courseCode || `Course ${id}`
      coursesById.set(id, { id, title })
    }

    let grossFinalCharge = 0
    let invoicedCount = 0
    let pendingCount = 0
    const allCoursesMap = new Map<string, string>()

    const allRows = links.map<BillingLinkRow>((doc) => {
      const billingStatus = String(doc.billingStatus || 'not_started')
      const courseId = String(getRelationshipId(doc.course) || '')
      const courseInfo = coursesById.get(courseId)
      const courseLabel = courseInfo?.title || (() => {
        const c = doc.course
        if (!c) return '-'
        if (typeof c === 'number' || typeof c === 'string') return String(c)
        return String(c.title || c.courseCode || `Course ${c.id}`)
      })()
      if (courseId) allCoursesMap.set(courseId, courseLabel)
      const invoiceLabel = (() => {
        const inv = doc.invoice
        if (!inv) return '-'
        if (typeof inv === 'number' || typeof inv === 'string') return String(inv)
        return String(inv.invoiceNumber || `Invoice ${inv.id}`)
      })()
      const customerLabel = (() => {
        const cust = doc.customer
        if (!cust) return '-'
        if (typeof cust === 'number' || typeof cust === 'string') return String(cust)
        const code = cust.customerCode || ''
        const name = cust.displayName || ''
        return `${code} ${name}`.trim() || '-'
      })()
      const sourceRef = String(doc.sourceReference || `BL-${doc.id}`)
      const finalCharge = Number(doc.finalChargeSnapshot || 0)
      grossFinalCharge += finalCharge
      if (billingStatus === 'invoiced') invoicedCount++
      if (billingStatus === 'pending') pendingCount++

      return {
        id: String(doc.id),
        sourceReference: sourceRef,
        courseId,
        courseLabel,
        customerLabel,
        invoiceLabel,
        billingStatus,
        billingStatusLabel: titleCase(billingStatus),
        billingStatusTone: getStatusTone(billingStatus),
        finalCharge,
        finalChargeLabel: formatCurrency(finalCharge),
        cells: [
          { text: sourceRef, emphasis: true },
          courseLabel,
          customerLabel,
          invoiceLabel,
          { text: titleCase(billingStatus), tone: getStatusTone(billingStatus) },
          { text: formatCurrency(finalCharge), align: 'right' },
        ],
      }
    })

    const normalizedSearch = normalizeSearch(search)
    const filteredRows = allRows.filter((row) => {
      if (normalizedSearch) {
        const searchText = `${row.sourceReference} ${row.courseLabel} ${row.customerLabel} ${row.invoiceLabel} ${row.billingStatus} ${row.finalCharge}`.toLowerCase()
        if (!searchText.includes(normalizedSearch)) return false
      }
      if (statuses.length > 0 && !statuses.includes(row.billingStatus)) return false
      if (courseIds.length > 0 && !courseIds.includes(row.courseId)) return false
      if (quickFilters.length > 0) {
        const match = quickFilters.some((qf) => matchesQuickFilter(row, qf))
        if (!match) return false
      }
      return true
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const paginatedRows = filteredRows.slice((page - 1) * limit, page * limit)

    const allStatuses = Array.from(new Set(links.map((d) => String(d.billingStatus || 'not_started'))))

    return NextResponse.json({
      section: {
        id: 'enrollment-billing-links',
        label: 'Enrollment Billing Links',
        description: 'Review bridge records that connect LMS enrollments to customers, invoices, billing status, and the final finance snapshots carried into accounting.',
        searchPlaceholder: 'Search enrollment, source reference, customer, invoice, billing status, or final charge',
        filters: {
          statuses: allStatuses.map((s) => ({ label: titleCase(s), value: s })),
          courses: Array.from(allCoursesMap.entries()).map(([id, label]) => ({ label, value: id })),
          quickFilters: [
            { label: 'Not Started', value: 'status:not_started' },
            { label: 'Invoiced', value: 'status:invoiced' },
            { label: 'Paid', value: 'status:paid' },
          ],
        },
        metrics: [
          { id: 'bl-1', label: 'Billing Links', value: allRows.length, change: 'Enrollment bridge records synced into accounting', trend: 'up' as const },
          { id: 'bl-2', label: 'Invoiced Links', value: invoicedCount, change: 'Enrollments already carrying invoice relationships', trend: 'up' as const },
          { id: 'bl-3', label: 'Pending Billing', value: pendingCount, change: 'Enrollments not yet fully invoiced or settled', trend: 'neutral' as const },
          { id: 'bl-4', label: 'Final Charge Value', value: formatCurrency(grossFinalCharge), change: 'Current final charge snapshot across LMS enrollments', trend: 'up' as const },
        ],
        table: {
          title: 'Enrollment Billing Link Register',
          description: 'Bridge records aligned to accounting-enrollment-billing-links, including invoice, customer, billing status, and final charge snapshot.',
          columns: ['Source Ref', 'Course', 'Customer', 'Invoice', 'Billing Status', { label: 'Final Charge', align: 'right' }],
          rows: paginatedRows,
        },
      },
      appliedFilters: {
        search,
        statuses,
        courseIds,
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
        statuses: allStatuses.map((s) => ({ label: titleCase(s), value: s })),
        courses: Array.from(allCoursesMap.entries()).map(([id, title]) => ({ id, title })),
        enrollments: enrollments.map((e) => {
          const courseId = (() => {
            const c = e.course
            if (!c) return ''
            if (typeof c === 'number' || typeof c === 'string') return String(c)
            return String(c.id ?? '')
          })()
          const courseName = (() => {
            const c = e.course
            if (!c) return 'Unknown Course'
            if (typeof c === 'number' || typeof c === 'string') return `Course ${c}`
            return c.title || c.courseCode || `Course ${c.id}`
          })()
          const traineeId = (() => {
            const s = e.student
            if (!s) return ''
            if (typeof s === 'number' || typeof s === 'string') return String(s)
            return String(s.id ?? '')
          })()
          const studentName = (() => {
            const s = e.student
            if (!s) return 'Unknown Student'
            if (typeof s === 'number' || typeof s === 'string') return `Trainee ${s}`
            const user = s.user
            if (user && typeof user === 'object') {
              const parts = [user.firstName, user.lastName].filter(Boolean)
              if (parts.length) return parts.join(' ') + (s.srn ? ` (${s.srn})` : '')
            }
            return s.srn || `Trainee ${s.id}`
          })()
          return { id: String(e.id), label: `${studentName} - ${courseName}`, courseId, traineeId }
        }),
        trainees: traineesList.map((t) => ({ id: String(t.id), label: t.srn || `Trainee ${t.id}` })),
        invoices: invoices.map((inv) => ({ id: String(inv.id), label: inv.invoiceNumber || `Invoice ${inv.id}` })),
        customers: customers.map((c) => ({ id: String(c.id), label: [c.customerCode, c.displayName].filter(Boolean).join(' - ') || `Customer ${c.id}` })),
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

    if (!body.enrollment) throw new Error('Enrollment is required.')
    if (!body.sourceReference) throw new Error('Source reference is required.')

    const enrollmentId = Number(body.enrollment) || 0
    const enrollment = await payload.findByID({
      collection: 'course-enrollments',
      id: enrollmentId,
      depth: 1,
      overrideAccess: true,
    }) as unknown as { course?: { id?: number | string } | number | string | null; student?: { id?: number | string } | number | string | null } | undefined

    if (!enrollment) throw new Error('Enrollment not found.')

    const duplicate = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
      where: { enrollment: { equals: enrollmentId } },
      depth: 0,
      limit: 1,
      overrideAccess: true,
    })
    if (duplicate.docs.length > 0) {
      throw new AccountingApiError('This enrollment already has a billing link. Each enrollment can have only one billing link.', 409)
    }

    const courseId = (() => {
      const c = enrollment.course
      if (!c) return 0
      if (typeof c === 'number' || typeof c === 'string') return Number(c) || 0
      return Number(c.id) || 0
    })()
    const traineeId = (() => {
      const s = enrollment.student
      if (!s) return 0
      if (typeof s === 'number' || typeof s === 'string') return Number(s) || 0
      return Number(s.id) || 0
    })()

    const record = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
      overrideAccess: true,
      data: {
        enrollment: enrollmentId,
        course: courseId,
        trainee: traineeId,
        user: body.user ? Number(body.user) || 0 : undefined,
        invoice: body.invoice ? Number(body.invoice) || 0 : undefined,
        customer: body.customer ? Number(body.customer) || 0 : undefined,
        billingStatus: String(body.billingStatus || 'not_started'),
        sourceType: String(body.sourceType || 'enrollment'),
        sourceReference: String(body.sourceReference || '').trim(),
        listPriceSnapshot: Math.max(0, Number(body.listPriceSnapshot) || 0),
        salePriceSnapshot: Math.max(0, Number(body.salePriceSnapshot) || 0),
        couponDiscountSnapshot: Math.max(0, Number(body.couponDiscountSnapshot) || 0),
        scholarshipDiscountSnapshot: Math.max(0, Number(body.scholarshipDiscountSnapshot) || 0),
        corporateCoverageSnapshot: Math.max(0, Number(body.corporateCoverageSnapshot) || 0),
        adjustmentsNetSnapshot: Number(body.adjustmentsNetSnapshot) || 0,
        finalChargeSnapshot: Math.max(0, Number(body.finalChargeSnapshot) || 0),
        recognizedRevenueSnapshot: Math.max(0, Number(body.recognizedRevenueSnapshot) || 0),
        currency: String(body.currency || 'PHP'),
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
