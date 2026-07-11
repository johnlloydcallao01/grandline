import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, LMS_REFUND_STATUS_OPTIONS, LMS_REFUND_TYPE_OPTIONS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { normalizeAmount } from '@/accounting/utils/amounts'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

type RefundDoc = {
  id: number | string
  refundNumber?: string | null
  enrollmentBillingLink?: { id?: number | string; sourceReference?: string | null } | number | string | null
  invoice?: { id?: number | string; invoiceNumber?: string | null } | number | string | null
  paymentReceived?: { id?: number | string } | number | string | null
  creditNote?: { id?: number | string; creditNoteNumber?: string | null } | number | string | null
  refundDate?: string | null
  refundReason?: string | null
  refundType?: string | null
  requestedAmount?: number | null
  approvedAmount?: number | null
  currency?: string | null
  status?: string | null
  processedBy?: { id?: number | string; name?: string | null; email?: string | null } | number | string | null
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
}

type Cell = string | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' }

type RefundRow = {
  id: string
  refundNumber: string
  enrollmentBillingLinkId: string
  enrollmentBillingLinkLabel: string
  invoiceId: string
  invoiceLabel: string
  paymentReceivedId: string
  creditNoteId: string
  creditNoteLabel: string
  refundType: string
  refundTypeLabel: string
  requestedAmount: number
  requestedAmountLabel: string
  approvedAmount: number
  approvedAmountLabel: string
  status: string
  statusLabel: string
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red'
  notes: string
  searchableText: string
  cells: Cell[]
}

const STATUS_LABELS = new Map<string, string>(LMS_REFUND_STATUS_OPTIONS.map((o) => [o.value, o.label]))
const TYPE_LABELS = new Map<string, string>(LMS_REFUND_TYPE_OPTIONS.map((o) => [o.value, o.label]))

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
    case 'draft': return 'blue'
    case 'requested': return 'amber'
    case 'approved': return 'amber'
    case 'processed': return 'green'
    case 'rejected': return 'red'
    case 'voided': return 'red'
    default: return 'gray'
  }
}

const buildInvoiceLabel = (inv: RefundDoc['invoice']) => {
  if (!inv) return '-'
  if (typeof inv === 'number' || typeof inv === 'string') return String(inv)
  return String(inv.invoiceNumber || `Invoice ${inv.id || ''}`)
}

const buildBillingLinkLabel = (link: RefundDoc['enrollmentBillingLink']) => {
  if (!link) return '-'
  if (typeof link === 'number' || typeof link === 'string') return String(link)
  return String(link.sourceReference || `Link ${link.id || ''}`)
}

const buildCreditNoteLabel = (cn: RefundDoc['creditNote']) => {
  if (!cn) return null
  if (typeof cn === 'number' || typeof cn === 'string') return String(cn)
  return cn.creditNoteNumber || `CN #${cn.id || ''}`
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const statuses = parseListParam(searchParams, 'status')
    const refundTypes = parseListParam(searchParams, 'refundType')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [refunds, invoices, billingLinks] = await Promise.all([
      findAllDocs<RefundDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.refunds,
        depth: 2,
        sort: '-refundDate',
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

    const allRows = refunds.map<RefundRow>((refund) => {
      const rType = String(refund.refundType || '')
      const status = String(refund.status || '')
      const linkId = String(getRelationshipId(refund.enrollmentBillingLink) || '')
      const linkLabel = buildBillingLinkLabel(refund.enrollmentBillingLink)
      const invoiceLabel = buildInvoiceLabel(refund.invoice)
      const invoiceId = String(getRelationshipId(refund.invoice) || '')
      const creditNoteId = String(getRelationshipId(refund.creditNote) || '')
      const creditNoteLabel = buildCreditNoteLabel(refund.creditNote)
      const requestedAmount = normalizeAmount(refund.requestedAmount)
      const approvedAmount = normalizeAmount(refund.approvedAmount)

      return {
        id: String(refund.id),
        refundNumber: String(refund.refundNumber || ''),
        enrollmentBillingLinkId: linkId,
        enrollmentBillingLinkLabel: linkLabel,
        invoiceId,
        invoiceLabel,
        paymentReceivedId: String(getRelationshipId(refund.paymentReceived) || ''),
        creditNoteId,
        creditNoteLabel: creditNoteLabel || '-',
        refundType: rType,
        refundTypeLabel: TYPE_LABELS.get(rType) || rType || '-',
        requestedAmount,
        requestedAmountLabel: formatCurrency(requestedAmount),
        approvedAmount,
        approvedAmountLabel: formatCurrency(approvedAmount),
        status,
        statusLabel: STATUS_LABELS.get(status) || 'Unknown',
        statusTone: getStatusTone(status),
        notes: String(refund.notes || ''),
        searchableText: [refund.refundNumber, linkLabel, invoiceLabel, rType, status, refund.notes].map((v) => normalizeSearch(v)).filter(Boolean).join(' '),
        cells: [
          { text: String(refund.refundNumber || ''), emphasis: true },
          linkLabel,
          invoiceLabel,
          { text: formatCurrency(approvedAmount || requestedAmount), align: 'right' },
          creditNoteLabel || '-',
          { text: STATUS_LABELS.get(status) || 'Unknown', tone: getStatusTone(status) },
        ],
      }
    })

    const normalizedSearch = normalizeSearch(search)
    const filteredRows = allRows.filter((row) => {
      if (normalizedSearch && !row.searchableText.includes(normalizedSearch)) return false
      if (statuses.length > 0 && !statuses.includes(row.status)) return false
      if (refundTypes.length > 0 && !refundTypes.includes(row.refundType)) return false
      if (quickFilters.length > 0) {
        const match = quickFilters.some((qf) => {
          if (qf.startsWith('status:')) return row.status === qf.slice(7)
          if (qf === 'has_credit_note') return row.creditNoteId !== ''
          return false
        })
        if (!match) return false
      }
      return true
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const paginatedRows = filteredRows.slice((page - 1) * limit, page * limit)

    const processedCount = allRows.filter((r) => r.status === 'processed').length
    const totalApprovedAmount = allRows.reduce((s, r) => s + r.approvedAmount, 0)
    const withCreditNoteCount = allRows.filter((r) => r.creditNoteId !== '').length

    return NextResponse.json({
      section: {
        id: 'refunds-credit-notes',
        label: 'Refunds & Credit Notes',
        description: 'LMS refund workflow records linked to invoices, payments, and credit notes generated when refunds are processed.',
        searchPlaceholder: 'Search refund number, billing link, invoice, amount, refund status, or credit note',
        filters: {
          statuses: LMS_REFUND_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
          refundTypes: LMS_REFUND_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
          quickFilters: [
            { label: 'Draft', value: 'status:draft' },
            { label: 'Requested', value: 'status:requested' },
            { label: 'Approved', value: 'status:approved' },
            { label: 'Processed', value: 'status:processed' },
            { label: 'With Credit Note', value: 'has_credit_note' },
          ],
        },
        metrics: [
          { id: 'total-refunds', label: 'Refunds', value: allRows.length, change: 'LMS refund workflow records in the register', trend: allRows.length > 0 ? 'up' as const : 'neutral' as const },
          { id: 'processed-refunds', label: 'Processed Refunds', value: processedCount, change: 'Refunds already converted into posted credit notes', trend: processedCount > 0 ? 'up' as const : 'neutral' as const },
          { id: 'approved-amount', label: 'Approved Amount', value: formatCurrency(totalApprovedAmount), change: 'Refund amount approved across current records', trend: totalApprovedAmount > 0 ? 'up' as const : 'neutral' as const },
          { id: 'with-credit-note', label: 'With Credit Note', value: withCreditNoteCount, change: 'Refunds already linked to generated credit notes', trend: withCreditNoteCount > 0 ? 'up' as const : 'neutral' as const },
        ],
        table: {
          title: 'Refund And Credit Note Register',
          description: 'Refund records aligned to accounting-refunds, with the refund status and linked credit-note outcome from the LMS refund processing flow.',
          columns: ['Refund Number', 'Billing Link', 'Invoice', 'Approved Amount', 'Credit Note', 'Status'],
          rows: paginatedRows,
        },
      },
      appliedFilters: {
        search,
        statuses,
        refundTypes,
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

    if (!body.refundType) throw new Error('Refund type is required.')
    if (body.requestedAmount === undefined || body.requestedAmount === null || Number(body.requestedAmount) < 0) {
      throw new Error('A valid non-negative requested amount is required.')
    }

    const record = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.refunds,
      overrideAccess: true,
      data: {
        enrollmentBillingLink: body.enrollmentBillingLink ? Number(body.enrollmentBillingLink) : undefined,
        invoice: body.invoice ? Number(body.invoice) : undefined,
        paymentReceived: body.paymentReceived ? Number(body.paymentReceived) : undefined,
        refundDate: body.refundDate || new Date().toISOString(),
        refundReason: String(body.refundReason || '').trim() || null,
        refundType: String(body.refundType || 'partial'),
        requestedAmount: Math.max(0, Number(body.requestedAmount) || 0),
        approvedAmount: body.approvedAmount !== undefined ? Math.max(0, Number(body.approvedAmount) || 0) : undefined,
        currency: String(body.currency || 'PHP'),
        status: String(body.status || 'draft'),
        processedBy: body.processedBy ? Number(body.processedBy) : undefined,
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
