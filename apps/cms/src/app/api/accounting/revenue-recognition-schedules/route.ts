import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, LMS_RECOGNITION_METHOD_OPTIONS, LMS_RECOGNITION_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { normalizeAmount } from '@/accounting/utils/amounts'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

type ScheduleDoc = {
  id: number | string
  invoice?: { id?: number | string; invoiceNumber?: string | null } | number | string | null
  enrollmentBillingLink?: { id?: number | string; sourceReference?: string | null; finalChargeSnapshot?: number | null } | number | string | null
  recognitionMethod?: string | null
  startDate?: string | null
  endDate?: string | null
  totalDeferredAmount?: number | null
  recognizedAmount?: number | null
  remainingDeferredAmount?: number | null
  status?: string | null
  scheduleData?: unknown
  lastRecognitionAt?: string | null
  notes?: string | null
}

type InvoiceDoc = {
  id: number | string
  invoiceNumber?: string | null
  status?: string | null
  total?: number | null
  balanceDue?: number | null
  customer?: { id?: number | string; customerCode?: string | null; displayName?: string | null } | number | string | null
}

type EnrollmentBillingLinkDoc = {
  id: number | string
  sourceReference?: string | null
  finalChargeSnapshot?: number | null
  course?: { id?: number | string; title?: string | null; courseCode?: string | null } | number | string | null
  invoice?: { id?: number | string; invoiceNumber?: string | null } | number | string | null
}

type Cell = string | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' }

type ScheduleRow = {
  id: string
  invoiceId: string
  invoiceNumber: string
  enrollmentBillingLinkId: string
  enrollmentBillingLinkLabel: string
  recognitionMethod: string
  recognitionMethodLabel: string
  startDate: string | null
  startDateLabel: string
  endDate: string | null
  endDateLabel: string
  totalDeferredAmount: number
  totalDeferredLabel: string
  recognizedAmount: number
  recognizedLabel: string
  remainingDeferredAmount: number
  remainingDeferredLabel: string
  status: string
  statusLabel: string
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red'
  notes: string
  searchableText: string
  cells: Cell[]
}

const METHOD_LABELS = new Map<string, string>(LMS_RECOGNITION_METHOD_OPTIONS.map((o) => [o.value, o.label]))
const STATUS_LABELS = new Map<string, string>(LMS_RECOGNITION_STATUS_OPTIONS.map((o) => [o.value, o.label]))

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) return fallback
  const p = Number(value)
  return Number.isFinite(p) ? p : fallback
}

const parseListParam = (searchParams: URLSearchParams, key: string): string[] =>
  Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))

const normalizeSearch = (value: unknown) => String(value ?? '').toLowerCase().trim()

const formatDate = (value: string | null | undefined) => {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
}

const formatCurrency = (value: number | null | undefined) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0))

const getStatusTone = (status: string | null | undefined): 'amber' | 'blue' | 'gray' | 'green' | 'red' => {
  switch (String(status || '')) {
    case 'draft': return 'blue'
    case 'scheduled': return 'amber'
    case 'partially_recognized': return 'amber'
    case 'recognized': return 'green'
    case 'cancelled': return 'red'
    default: return 'gray'
  }
}

const buildInvoiceLabel = (invoice: ScheduleDoc['invoice']) => {
  if (!invoice) return '-'
  if (typeof invoice === 'number' || typeof invoice === 'string') return String(invoice)
  return String(invoice.invoiceNumber || `Invoice ${invoice.id || ''}`)
}

const buildBillingLinkLabel = (link: ScheduleDoc['enrollmentBillingLink']) => {
  if (!link) return '-'
  if (typeof link === 'number' || typeof link === 'string') return String(link)
  return String(link.sourceReference || `Link ${link.id || ''}`)
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const statuses = parseListParam(searchParams, 'status')
    const methods = parseListParam(searchParams, 'recognitionMethod')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [schedules, invoices, billingLinks] = await Promise.all([
      findAllDocs<ScheduleDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.revenueRecognitionSchedules,
        depth: 2,
        sort: '-createdAt',
      }),
      findAllDocs<InvoiceDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
        depth: 1,
        sort: '-invoiceDate',
      }),
      findAllDocs<EnrollmentBillingLinkDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
        depth: 1,
        sort: '-linkedAt',
      }),
    ])

    const allRows = schedules.map<ScheduleRow>((schedule) => {
      const method = String(schedule.recognitionMethod || '')
      const status = String(schedule.status || '')
      const invoiceId = String(getRelationshipId(schedule.invoice) || '')
      const linkId = String(getRelationshipId(schedule.enrollmentBillingLink) || '')
      const invoiceLabel = buildInvoiceLabel(schedule.invoice)
      const linkLabel = buildBillingLinkLabel(schedule.enrollmentBillingLink)
      const totalDeferred = normalizeAmount(schedule.totalDeferredAmount)
      const recognized = normalizeAmount(schedule.recognizedAmount)
      const remaining = normalizeAmount(schedule.remainingDeferredAmount)

      return {
        id: String(schedule.id),
        invoiceId,
        invoiceNumber: invoiceLabel,
        enrollmentBillingLinkId: linkId,
        enrollmentBillingLinkLabel: linkLabel,
        recognitionMethod: method,
        recognitionMethodLabel: METHOD_LABELS.get(method) || method || '-',
        startDate: schedule.startDate || null,
        startDateLabel: formatDate(schedule.startDate),
        endDate: schedule.endDate || null,
        endDateLabel: formatDate(schedule.endDate),
        totalDeferredAmount: totalDeferred,
        totalDeferredLabel: formatCurrency(totalDeferred),
        recognizedAmount: recognized,
        recognizedLabel: formatCurrency(recognized),
        remainingDeferredAmount: remaining,
        remainingDeferredLabel: formatCurrency(remaining),
        status,
        statusLabel: STATUS_LABELS.get(status) || 'Unknown',
        statusTone: getStatusTone(status),
        notes: String(schedule.notes || ''),
        searchableText: [invoiceLabel, linkLabel, method, status, schedule.notes].map((v) => normalizeSearch(v)).filter(Boolean).join(' '),
        cells: [
          { text: invoiceLabel, emphasis: true },
          linkLabel,
          METHOD_LABELS.get(method) || method || '-',
          formatDate(schedule.startDate),
          formatDate(schedule.endDate),
          { text: formatCurrency(totalDeferred), align: 'right' },
          { text: formatCurrency(remaining), align: 'right' },
          { text: STATUS_LABELS.get(status) || 'Unknown', tone: getStatusTone(status) },
        ],
      }
    })

    const normalizedSearch = normalizeSearch(search)
    const filteredRows = allRows.filter((row) => {
      if (normalizedSearch && !row.searchableText.includes(normalizedSearch)) return false
      if (statuses.length > 0 && !statuses.includes(row.status)) return false
      if (methods.length > 0 && !methods.includes(row.recognitionMethod)) return false
      if (quickFilters.length > 0) {
        const match = quickFilters.some((qf) => {
          if (qf.startsWith('status:')) return row.status === qf.slice(7)
          if (qf === 'has_remaining') return row.remainingDeferredAmount > 0
          if (qf === 'fully_recognized') return row.status === 'recognized'
          return false
        })
        if (!match) return false
      }
      return true
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const paginatedRows = filteredRows.slice((page - 1) * limit, page * limit)

    const draftCount = allRows.filter((r) => r.status === 'draft').length
    const scheduledCount = allRows.filter((r) => r.status === 'scheduled').length
    const totalRemaining = allRows.reduce((s, r) => s + r.remainingDeferredAmount, 0)

    return NextResponse.json({
      section: {
        id: 'recognition-schedules',
        label: 'Recognition Schedules',
        description: 'Deferred revenue recognition schedules aligned to invoices and enrollment billing links used in LMS finance reporting.',
        searchPlaceholder: 'Search invoice, billing link, method, status, or amount',
        filters: {
          statuses: LMS_RECOGNITION_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
          recognitionMethods: LMS_RECOGNITION_METHOD_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
          quickFilters: [
            { label: 'Fully Recognized', value: 'status:recognized' },
            { label: 'Partially Recognized', value: 'status:partially_recognized' },
            { label: 'Scheduled', value: 'status:scheduled' },
            { label: 'Draft', value: 'status:draft' },
          ],
        },
        metrics: [
          { id: 'total-schedules', label: 'Total Schedules', value: allRows.length, change: 'Recognition schedule records in the system', trend: allRows.length > 0 ? 'up' as const : 'neutral' as const },
          { id: 'draft-schedules', label: 'Draft Schedules', value: draftCount, change: 'Not yet active or recognized', trend: draftCount > 0 ? 'neutral' as const : 'down' as const },
          { id: 'scheduled-schedules', label: 'Scheduled', value: scheduledCount, change: 'Awaiting scheduled recognition', trend: scheduledCount > 0 ? 'neutral' as const : 'down' as const },
          { id: 'remaining-deferred', label: 'Remaining Deferred', value: formatCurrency(totalRemaining), change: 'Total remaining deferred revenue', trend: totalRemaining > 0 ? 'up' as const : 'neutral' as const },
        ],
        table: {
          title: 'Recognition Schedule Register',
          description: 'Deferred revenue recognition schedules tied to enrollment monetization.',
          columns: ['Invoice', 'Billing Link', 'Method', 'Start Date', 'End Date', { label: 'Total Deferred', align: 'right' }, { label: 'Remaining', align: 'right' }, 'Status'],
          rows: paginatedRows,
        },
      },
      appliedFilters: {
        search,
        statuses,
        recognitionMethods: methods,
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
        invoices: invoices
          .filter((inv) => String(inv.status || '') !== 'voided')
          .map((inv) => ({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber || null,
            status: String(inv.status || ''),
            total: normalizeAmount(inv.total),
            balanceDue: normalizeAmount(inv.balanceDue),
          })),
        enrollmentBillingLinks: billingLinks.map((link) => ({
          id: link.id,
          sourceReference: link.sourceReference || null,
          finalChargeSnapshot: normalizeAmount(link.finalChargeSnapshot),
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

    if (!body.invoice) throw new Error('Invoice is required.')
    if (!body.enrollmentBillingLink) throw new Error('Enrollment billing link is required.')
    if (!body.startDate) throw new Error('Start date is required.')
    if (!body.endDate) throw new Error('End date is required.')
    if (new Date(body.startDate).getTime() > new Date(body.endDate).getTime()) {
      throw new Error('Start date cannot be after end date.')
    }

    const record = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.revenueRecognitionSchedules,
      overrideAccess: true,
      data: {
        invoice: Number(body.invoice) || 0,
        enrollmentBillingLink: Number(body.enrollmentBillingLink) || 0,
        recognitionMethod: String(body.recognitionMethod || 'on_activation'),
        startDate: body.startDate,
        endDate: body.endDate,
        totalDeferredAmount: Math.max(0, Number(body.totalDeferredAmount) || 0),
        recognizedAmount: Math.max(0, Number(body.recognizedAmount) || 0),
        remainingDeferredAmount: Math.max(0, Number(body.remainingDeferredAmount) || 0),
        status: String(body.status || 'draft'),
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
