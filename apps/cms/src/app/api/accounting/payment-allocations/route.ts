import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, LMS_ALLOCATION_TYPE_OPTIONS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { AccountingApiError, handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

type Cell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' }

type PaymentAllocationRow = {
  id: string
  paymentLabel: string
  invoiceLabel: string
  billingLinkLabel: string
  allocationDateLabel: string
  allocatedAmount: number
  allocatedAmountLabel: string
  allocationType: string
  allocationTypeLabel: string
  allocationTypeTone: 'amber' | 'blue' | 'gray' | 'green' | 'red'
  cells: Cell[]
}

type PaymentAllocationDoc = {
  id: number | string
  paymentReceived?: { id?: number | string; receiptNumber?: string | null } | number | string | null
  invoice?: { id?: number | string; invoiceNumber?: string | null } | number | string | null
  enrollmentBillingLink?: { id?: number | string; sourceReference?: string | null } | number | string | null
  allocationDate?: string | null
  allocatedAmount?: number | null
  allocationType?: string | null
  notes?: string | null
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

const titleCase = (value: string | null | undefined) =>
  String(value || '').split('_').join(' ').replace(/\b\w/g, (c) => c.toUpperCase())

const getAllocationTone = (value: string): 'amber' | 'blue' | 'gray' | 'green' | 'red' => {
  switch (value) {
    case 'installment_payment': return 'amber'
    case 'deposit_application': return 'blue'
    case 'refund_reversal': return 'red'
    default: return 'gray'
  }
}

const formatDate = (value: string | null | undefined) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

const buildLabel = (val: unknown, labelField: string) => {
  if (!val || typeof val !== 'object') return '-'
  const obj = val as Record<string, unknown>
  return String(obj[labelField] || obj.id || '-')
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const allocationTypes = parseListParam(searchParams, 'allocationType')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [docs, payments, billingLinks, invoicesList] = await Promise.all([
      findAllDocs<PaymentAllocationDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.paymentAllocations,
        depth: 2,
        sort: '-allocationDate',
      }),
      findAllDocs<{ id: number | string; receiptNumber?: string | null }>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
        depth: 0,
        sort: '-createdAt',
      }),
      findAllDocs<{ id: number | string; sourceReference?: string | null }>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
        depth: 0,
        sort: '-linkedAt',
      }),
      findAllDocs<{ id: number | string; invoiceNumber?: string | null }>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
        depth: 0,
        sort: '-createdAt',
      }),
    ])

    let totalAllocated = 0
    let installmentCount = 0

    const allRows = docs.map<PaymentAllocationRow>((doc) => {
      const allocType = String(doc.allocationType || 'invoice_settlement')

      const paymentLabel = buildLabel(doc.paymentReceived, 'receiptNumber')
      const invoiceLabel = buildLabel(doc.invoice, 'invoiceNumber')
      const billingLinkLabel = buildLabel(doc.enrollmentBillingLink, 'sourceReference')
      const allocatedAmount = Number(doc.allocatedAmount || 0)
      totalAllocated += allocatedAmount
      if (allocType === 'installment_payment') installmentCount++

      return {
        id: String(doc.id),
        paymentLabel: paymentLabel || '-',
        invoiceLabel: invoiceLabel || '-',
        billingLinkLabel: billingLinkLabel || '-',
        allocationDateLabel: formatDate(doc.allocationDate),
        allocatedAmount,
        allocatedAmountLabel: formatCurrency(allocatedAmount),
        allocationType: allocType,
        allocationTypeLabel: titleCase(allocType),
        allocationTypeTone: getAllocationTone(allocType),
        cells: [
          { text: paymentLabel || '-', emphasis: true },
          invoiceLabel || '-',
          billingLinkLabel || '-',
          formatDate(doc.allocationDate),
          { text: formatCurrency(allocatedAmount), align: 'right' },
          { text: titleCase(allocType), tone: getAllocationTone(allocType) },
        ],
      }
    })

    const normalizedSearch = normalizeSearch(search)
    const filteredRows = allRows.filter((row) => {
      if (normalizedSearch) {
        const searchText = `${row.paymentLabel} ${row.invoiceLabel} ${row.billingLinkLabel} ${row.allocationTypeLabel} ${row.allocatedAmount}`.toLowerCase()
        if (!searchText.includes(normalizedSearch)) return false
      }
      if (allocationTypes.length > 0 && !allocationTypes.includes(row.allocationType)) return false
      if (quickFilters.length > 0) {
        const match = quickFilters.some((qf) => {
          const [group, value] = qf.split(':')
          if (group === 'allocationType') return row.allocationType === value
          return false
        })
        if (!match) return false
      }
      return true
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const paginatedRows = filteredRows.slice((page - 1) * limit, page * limit)

    return NextResponse.json({
      section: {
        id: 'payment-allocations',
        label: 'Payment Allocations',
        description: 'Review LMS payment allocations created from payment applications, including invoice settlement and installment-payment allocation types.',
        searchPlaceholder: 'Search payment, invoice, billing link, allocation type, allocation date, or allocated amount',
        filters: {
          allocationTypes: LMS_ALLOCATION_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
          quickFilters: LMS_ALLOCATION_TYPE_OPTIONS.map((o) => ({ label: o.label, value: `allocationType:${o.value}` })),
        },
        metrics: [
          { id: 'pa-1', label: 'Allocations', value: allRows.length, change: 'Normalized LMS payment-allocation records', trend: 'up' as const },
          { id: 'pa-2', label: 'Installment Allocations', value: installmentCount, change: 'Allocations created as installment payment flows', trend: 'up' as const },
          { id: 'pa-3', label: 'Allocated Amount', value: formatCurrency(totalAllocated), change: 'Amount tied back to invoices and billing links', trend: 'up' as const },
          { id: 'pa-4', label: 'Average Allocation', value: formatCurrency(allRows.length ? totalAllocated / allRows.length : 0), change: 'Average allocation size in the current register', trend: 'neutral' as const },
        ],
        table: {
          title: 'Payment Allocation Register',
          description: 'Allocation records aligned to accounting-payment-allocations, including the payment, invoice, billing link, amount, and allocation type.',
          columns: ['Payment', 'Invoice', 'Billing Link', 'Allocation Date', 'Allocated Amount', 'Type'],
          rows: paginatedRows,
        },
      },
      appliedFilters: { search, allocationTypes, quickFilters },
      pagination: { page, limit, totalDocs, totalPages, hasPrevPage: page > 1, hasNextPage: page < totalPages },
      totals: { totalRows: allRows.length, filteredRows: totalDocs },
      referenceData: {
        payments: payments.map((p) => ({ id: String(p.id), label: p.receiptNumber || `Payment ${p.id}` })),
        billingLinks: billingLinks.map((bl) => ({ id: String(bl.id), label: bl.sourceReference || `BL-${bl.id}` })),
        invoices: invoicesList.map((inv) => ({ id: String(inv.id), label: inv.invoiceNumber || `Invoice ${inv.id}` })),
        allocationTypes: LMS_ALLOCATION_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
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

    if (!body.paymentReceived) throw new AccountingApiError('Payment received is required.', 400)
    if (!body.allocatedAmount) throw new AccountingApiError('Allocated amount is required.', 400)

    const record = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentAllocations,
      overrideAccess: true,
      data: {
        paymentReceived: Number(body.paymentReceived) || 0,
        invoice: body.invoice ? Number(body.invoice) || 0 : null,
        enrollmentBillingLink: body.enrollmentBillingLink ? Number(body.enrollmentBillingLink) || 0 : null,
        allocationDate: String(body.allocationDate || new Date().toISOString()),
        allocatedAmount: Math.max(0.01, Number(body.allocatedAmount) || 0),
        allocationType: String(body.allocationType || 'invoice_settlement'),
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
