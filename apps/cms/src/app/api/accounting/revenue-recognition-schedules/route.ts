import { NextRequest, NextResponse } from 'next/server'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  LMS_RECOGNITION_METHOD_OPTIONS,
  LMS_RECOGNITION_STATUS_OPTIONS,
} from '@/accounting/constants/accounting'
import { AccountingApiError, handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseListParam = (sp: URLSearchParams, key: string): string[] =>
  Array.from(new Set(sp.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))

const normalizeText = (v?: string | null) => String(v || '').trim().toLowerCase()

const STATUS_TONE: Record<string, string> = {
  draft: 'amber',
  scheduled: 'blue',
  partially_recognized: 'amber',
  recognized: 'green',
  cancelled: 'gray',
}

const METHOD_LABEL: Record<string, string> = {
  on_activation: 'On Activation',
  straight_line: 'Straight Line',
  completion_based: 'Completion Based',
  certificate_based: 'Certificate Based',
  manual: 'Manual',
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const sp = new URL(request.url).searchParams
    const search = normalizeText(sp.get('search'))
    const statuses = parseListParam(sp, 'status')
    const methods = parseListParam(sp, 'recognitionMethod')
    const quickFilters = parseListParam(sp, 'quickFilter')
    const page = Math.max(1, Number(sp.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, Number(sp.get('limit')) || 10))

    const allDocs = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.revenueRecognitionSchedules,
      depth: 2,
      limit: 10000,
      sort: '-createdAt',
      overrideAccess: true,
    })

    const rows = allDocs.docs.map((doc) => {
      const d = doc as unknown as Record<string, unknown>
      const inv = d.invoice as unknown as Record<string, unknown> | undefined
      const ebl = d.enrollmentBillingLink as unknown as Record<string, unknown> | undefined
      const eblEnrollment = ebl?.enrollment as unknown as Record<string, unknown> | undefined
      const status = String(d.status || 'draft')
      const method = String(d.recognitionMethod || 'on_activation')
      const totalDeferred = Number(d.totalDeferredAmount) || 0
      const recognized = Number(d.recognizedAmount) || 0
      const remaining = Number(d.remainingDeferredAmount) || 0
      return {
        id: String(d.id),
        invoiceId: String(inv?.id ?? ''),
        invoiceNumber: inv?.invoiceNumber ? String(inv.invoiceNumber) : inv ? `Invoice #${inv.id}` : '-',
        enrollmentBillingLinkId: String(ebl?.id ?? ''),
        enrollmentBillingLinkLabel: ebl?.sourceReference ? String(ebl.sourceReference) : ebl ? `Billing Link #${ebl.id}` : '-',
        enrollmentId: String(eblEnrollment?.id ?? ''),
        recognitionMethod: method,
        recognitionMethodLabel: METHOD_LABEL[method] || method || '-',
        startDate: d.startDate ? String(d.startDate) : null,
        endDate: d.endDate ? String(d.endDate) : null,
        totalDeferredAmount: totalDeferred,
        totalDeferredLabel: `PHP ${totalDeferred.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        recognizedAmount: recognized,
        recognizedLabel: `PHP ${recognized.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        remainingDeferredAmount: remaining,
        remainingLabel: `PHP ${remaining.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        status,
        statusLabel: String(LMS_RECOGNITION_STATUS_OPTIONS.find((o) => o.value === status)?.label || status || 'Draft'),
        statusTone: STATUS_TONE[status] || 'gray',
        lastRecognitionAt: d.lastRecognitionAt ? String(d.lastRecognitionAt) : null,
        notes: String(d.notes || ''),
      }
    })

    let filtered = rows
    if (search) {
      filtered = filtered.filter((r) =>
        [r.invoiceNumber, r.enrollmentBillingLinkLabel, r.recognitionMethodLabel, r.statusLabel, String(r.totalDeferredAmount), String(r.recognizedAmount), String(r.remainingDeferredAmount)]
          .map((v) => normalizeText(v))
          .some((v) => v.includes(search)),
      )
    }
    if (statuses.length > 0) {
      filtered = filtered.filter((r) => statuses.includes(r.status))
    }
    if (methods.length > 0) {
      filtered = filtered.filter((r) => methods.includes(r.recognitionMethod))
    }
    if (quickFilters.length > 0) {
      filtered = filtered.filter((r) =>
        quickFilters.some((qf) => {
          if (qf === 'fully-recognized') return r.status === 'recognized'
          if (qf === 'partially-recognized') return r.status === 'partially_recognized'
          if (qf === 'scheduled') return r.status === 'scheduled'
          if (qf === 'draft') return r.status === 'draft'
          return false
        }),
      )
    }

    const totalDocs = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filtered.slice((currentPage - 1) * limit, currentPage * limit)

    const draftCount = rows.filter((r) => r.status === 'draft').length
    const recognizedCount = rows.filter((r) => r.status === 'recognized').length
    const totalRecognized = rows.reduce((sum, r) => sum + r.recognizedAmount, 0)
    const totalRemaining = rows.reduce((sum, r) => sum + r.remainingDeferredAmount, 0)

    const [invoices, billingLinks] = await Promise.all([
      payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.invoices, depth: 0, limit: 500, sort: '-createdAt', overrideAccess: true }),
      payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks, depth: 1, limit: 500, sort: '-createdAt', overrideAccess: true }),
    ])

    return NextResponse.json({
      rows: paginatedRows,
      metrics: [
        { id: 'total-schedules', label: 'Recognition Schedules', value: rows.length, change: 'Deferred revenue schedules tied to LMS billing links', trend: rows.length > 0 ? 'up' as const : 'neutral' as const },
        { id: 'draft-schedules', label: 'Draft Schedules', value: draftCount, change: 'Schedules pending recognition run or posting', trend: draftCount > 0 ? 'neutral' as const : 'down' as const },
        { id: 'recognized-amount', label: 'Recognized Amount', value: `PHP ${totalRecognized.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, change: 'Amount already recognized from deferred schedules', trend: recognizedCount > 0 ? 'up' as const : 'neutral' as const },
        { id: 'remaining-deferred', label: 'Remaining Deferred', value: `PHP ${totalRemaining.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, change: 'Revenue still deferred across active schedules', trend: totalRemaining > 0 ? 'neutral' as const : 'down' as const },
      ],
      filterOptions: {
        statuses: LMS_RECOGNITION_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
        recognitionMethods: LMS_RECOGNITION_METHOD_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
        quickFilters: [
          { label: 'Fully Recognized', value: 'fully-recognized' },
          { label: 'Partially Recognized', value: 'partially-recognized' },
          { label: 'Scheduled', value: 'scheduled' },
          { label: 'Draft', value: 'draft' },
        ],
      },
      meta: {
        searchPlaceholder: 'Search invoice, billing link, method, status, or amount',
        columns: ['Invoice', 'Billing Link', 'Recognition Method', 'Deferred', 'Recognized', 'Remaining', 'Status'],
        tableTitle: 'Revenue Recognition Schedules',
        tableDescription: 'Deferred revenue and recognition schedules linked to enrollment billing and posted invoices.',
      },
      pagination: { page: currentPage, limit, totalDocs, totalPages, hasPrevPage: currentPage > 1, hasNextPage: currentPage < totalPages },
      totals: { totalRows: rows.length, filteredRows: totalDocs },
      referenceData: {
        invoices: invoices.docs.map((d) => {
          const r = d as unknown as Record<string, unknown>
          return { id: String(r.id), invoiceNumber: String(r.invoiceNumber || ''), memo: String(r.memo || '') }
        }),
        enrollmentBillingLinks: billingLinks.docs.map((d) => {
          const r = d as unknown as Record<string, unknown>
          const enr = r.enrollment as unknown as Record<string, unknown> | undefined
          return { id: String(r.id), sourceReference: String(r.sourceReference || ''), enrollmentId: String(enr?.id ?? '') }
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

    const invoiceId = toId(body.invoice)
    if (!invoiceId) throw new AccountingApiError('Invoice is required.', 400)

    const billingLinkId = toId(body.enrollmentBillingLink)
    if (!billingLinkId) throw new AccountingApiError('Enrollment billing link is required.', 400)

    const startsAt = body.startDate || undefined
    const endsAt = body.endDate || undefined
    if (startsAt && endsAt && new Date(startsAt).getTime() > new Date(endsAt).getTime()) {
      throw new AccountingApiError('Start date cannot be after end date.', 400)
    }

    const totalDeferred = Math.max(0, Number(body.totalDeferredAmount) || 0)
    const recognized = Math.max(0, Number(body.recognizedAmount) || 0)

    const data: Record<string, unknown> = {
      invoice: invoiceId,
      enrollmentBillingLink: billingLinkId,
      recognitionMethod: String(body.recognitionMethod || 'on_activation'),
      startDate: startsAt,
      endDate: endsAt,
      totalDeferredAmount: totalDeferred,
      recognizedAmount: recognized,
      remainingDeferredAmount: Math.max(0, totalDeferred - recognized),
      status: String(body.status || 'draft'),
      createdBy: user.id,
      updatedBy: user.id,
    }

    if (body.notes) data.notes = String(body.notes).trim()
    if (body.scheduleData) data.scheduleData = body.scheduleData

    const record = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.revenueRecognitionSchedules,
      overrideAccess: true,
      data: data as never,
      depth: 2,
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
