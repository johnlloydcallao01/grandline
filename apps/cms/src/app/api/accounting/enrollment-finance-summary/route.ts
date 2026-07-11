import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

type Cell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' }

type BillingLinkDoc = {
  id: number | string
  enrollment?: { id?: number | string; student?: unknown; course?: unknown } | number | string | null
  course?: { id?: number | string; title?: string | null; courseCode?: string | null } | number | string | null
  customer?: { id?: number | string; customerCode?: string | null; displayName?: string | null } | number | string | null
  sourceReference?: string | null
  billingStatus?: string | null
  listPriceSnapshot?: number | null
  salePriceSnapshot?: number | null
  couponDiscountSnapshot?: number | null
  scholarshipDiscountSnapshot?: number | null
  corporateCoverageSnapshot?: number | null
  adjustmentsNetSnapshot?: number | null
  finalChargeSnapshot?: number | null
  recognizedRevenueSnapshot?: number | null
}

type PaymentAllocationDoc = {
  id: number | string
  enrollmentBillingLink?: { id?: number | string } | number | string | null
  allocatedAmount?: number | null
}

type FinanceSummaryRow = {
  id: string
  enrollmentLabel: string
  salePrice: number
  salePriceLabel: string
  discountsTotal: number
  discountsTotalLabel: string
  corporateCoverage: number
  corporateCoverageLabel: string
  amountPaid: number
  amountPaidLabel: string
  balanceDue: number
  balanceDueLabel: string
  billingStatus: string
  billingStatusLabel: string
  billingStatusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red'
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

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const statuses = parseListParam(searchParams, 'status')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [links, paymentAllocations] = await Promise.all([
      findAllDocs<BillingLinkDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
        depth: 2,
        sort: '-linkedAt',
      }),
      findAllDocs<PaymentAllocationDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.paymentAllocations,
        depth: 0,
      }),
    ])

    const paidByLinkId = new Map<string, number>()
    for (const pa of paymentAllocations) {
      const linkId = String(getRelationshipId(pa.enrollmentBillingLink) || '')
      if (!linkId) continue
      const current = paidByLinkId.get(linkId) || 0
      paidByLinkId.set(linkId, current + Number(pa.allocatedAmount || 0))
    }

    let grossSalePrice = 0
    let grossDiscounts = 0
    let grossPaid = 0
    let grossBalance = 0

    const allRows = links.map<FinanceSummaryRow>((doc) => {
      const billingStatus = String(doc.billingStatus || 'not_started')
      const salePrice = Number(doc.salePriceSnapshot || 0)
      const discounts = Number(doc.couponDiscountSnapshot || 0) + Number(doc.scholarshipDiscountSnapshot || 0)
      const corpCoverage = Number(doc.corporateCoverageSnapshot || 0)
      const finalCharge = Number(doc.finalChargeSnapshot || 0)
      const amountPaid = paidByLinkId.get(String(doc.id)) || 0
      const balanceDue = Math.max(0, finalCharge - amountPaid)
      const enrollmentLabel = String(doc.sourceReference || `BL-${doc.id}`)

      grossSalePrice += salePrice
      grossDiscounts += discounts
      grossPaid += amountPaid
      grossBalance += balanceDue

      return {
        id: String(doc.id),
        enrollmentLabel,
        salePrice,
        salePriceLabel: formatCurrency(salePrice),
        discountsTotal: discounts,
        discountsTotalLabel: formatCurrency(discounts),
        corporateCoverage: corpCoverage,
        corporateCoverageLabel: formatCurrency(corpCoverage),
        amountPaid,
        amountPaidLabel: formatCurrency(amountPaid),
        balanceDue,
        balanceDueLabel: formatCurrency(balanceDue),
        billingStatus,
        billingStatusLabel: titleCase(billingStatus),
        billingStatusTone: getStatusTone(billingStatus),
        cells: [
          { text: enrollmentLabel, emphasis: true },
          { text: formatCurrency(salePrice), align: 'right' },
          { text: formatCurrency(discounts), align: 'right' },
          { text: formatCurrency(corpCoverage), align: 'right' },
          { text: formatCurrency(amountPaid), align: 'right' },
          { text: formatCurrency(balanceDue), align: 'right' },
        ],
      }
    })

    const allStatuses = Array.from(new Set(links.map((d) => String(d.billingStatus || 'not_started'))))

    const normalizedSearch = normalizeSearch(search)
    const filteredRows = allRows.filter((row) => {
      if (normalizedSearch) {
        const searchText = `${row.enrollmentLabel} ${row.salePrice} ${row.discountsTotal} ${row.corporateCoverage} ${row.amountPaid} ${row.balanceDue} ${row.billingStatus}`.toLowerCase()
        if (!searchText.includes(normalizedSearch)) return false
      }
      if (statuses.length > 0 && !statuses.includes(row.billingStatus)) return false
      if (quickFilters.length > 0) {
        const withDiscounts = quickFilters.includes('with_discounts') && row.discountsTotal > 0
        const withCorporate = quickFilters.includes('with_corporate') && row.corporateCoverage > 0
        const outstanding = quickFilters.includes('outstanding') && row.balanceDue > 0
        if (!withDiscounts && !withCorporate && !outstanding) return false
      }
      return true
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const paginatedRows = filteredRows.slice((page - 1) * limit, page * limit)

    return NextResponse.json({
      section: {
        id: 'enrollment-finance-summary',
        label: 'Enrollment Finance Summary',
        description: 'Review LMS billing summaries built from list price, sale price, coupon discount, scholarship discount, corporate coverage, adjustments, paid amount, and balance due.',
        searchPlaceholder: 'Search enrollment, customer, sale price, discounts, corporate coverage, paid amount, or balance due',
        filters: {
          statuses: allStatuses.map((s) => ({ label: titleCase(s), value: s })),
          quickFilters: [
            { label: 'With Discounts', value: 'with_discounts' },
            { label: 'With Corporate', value: 'with_corporate' },
            { label: 'Outstanding', value: 'outstanding' },
          ],
        },
        metrics: [
          { id: 'fs-1', label: 'Gross Sale Price', value: formatCurrency(grossSalePrice), change: 'Sale-price total before billing adjustments and settlement', trend: 'up' as const },
          { id: 'fs-2', label: 'Discount Coverage', value: formatCurrency(grossDiscounts), change: 'Coupons, scholarships, and corporate coverage applied', trend: 'up' as const },
          { id: 'fs-3', label: 'Allocated Payments', value: formatCurrency(grossPaid), change: 'Amount already allocated back to LMS billing links', trend: 'up' as const },
          { id: 'fs-4', label: 'Open Balance', value: formatCurrency(grossBalance), change: 'Current remaining balance due across active links', trend: 'neutral' as const },
        ],
        table: {
          title: 'Enrollment Finance Summary Register',
          description: 'Summary view aligned to the finance calculation using the charge breakdown and balance logic derived from linked records.',
          columns: ['Enrollment', 'Sale Price', 'Discounts', 'Corporate', 'Paid', 'Balance Due'],
          rows: paginatedRows,
        },
      },
      appliedFilters: { search, statuses, quickFilters },
      pagination: { page, limit, totalDocs, totalPages, hasPrevPage: page > 1, hasNextPage: page < totalPages },
      totals: { totalRows: allRows.length, filteredRows: totalDocs },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
