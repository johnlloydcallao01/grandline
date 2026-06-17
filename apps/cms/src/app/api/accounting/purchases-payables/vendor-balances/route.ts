import { NextRequest, NextResponse } from 'next/server'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_PARTY_STATUS_OPTIONS,
} from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'
import {
  buildPaymentTermsLabel,
  buildVendorBalanceMetrics,
  buildVendorBalanceRow,
  matchesSelectedVendorBalanceFilters,
  normalizeSearch,
  parseIntegerParam,
  parseListParam,
  type VendorBalanceBillDoc,
  type VendorBalanceVendorDoc,
} from './_shared'

type PaymentTermDoc = {
  id: number | string
  code?: string | null
  name?: string | null
  dueInDays?: number | null
  isActive?: boolean | null
}

type CurrencyDoc = {
  id: number | string
  code?: string | null
  name?: string | null
  isActive?: boolean | null
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const statuses = parseListParam(searchParams, 'status')
    const paymentTermIds = parseListParam(searchParams, 'paymentTermId')
    const balanceStates = parseListParam(searchParams, 'balanceState')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [vendorDocs, billDocs, paymentTermDocs, currencyDocs] = await Promise.all([
      findAllDocs<VendorBalanceVendorDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.vendors,
        depth: 1,
        sort: 'displayName',
      }),
      findAllDocs<VendorBalanceBillDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.bills,
        depth: 0,
        sort: '-dueDate',
      }),
      findAllDocs<PaymentTermDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.paymentTerms,
        depth: 0,
        sort: 'dueInDays',
      }),
      findAllDocs<CurrencyDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.currencies,
        depth: 0,
        sort: 'code',
      }),
    ])

    const billsByVendorId = new Map<string, VendorBalanceBillDoc[]>()
    for (const bill of billDocs) {
      const vendorId = String(
        (typeof bill.vendor === 'object' && bill.vendor ? bill.vendor.id : bill.vendor) || '',
      )
      if (!vendorId) continue
      const bucket = billsByVendorId.get(vendorId) || []
      bucket.push(bill)
      billsByVendorId.set(vendorId, bucket)
    }

    const allRows = vendorDocs
      .map((vendor) => buildVendorBalanceRow(vendor, billsByVendorId.get(String(vendor.id)) || []))
      .sort((left, right) => {
        const byName = left.vendorLabel.localeCompare(right.vendorLabel)
        if (byName !== 0) return byName
        return left.vendorCode.localeCompare(right.vendorCode)
      })

    const normalizedQuery = normalizeSearch(search)
    const filteredRows = allRows.filter((row) => {
      if (normalizedQuery && !row.searchableText.includes(normalizedQuery)) return false
      return matchesSelectedVendorBalanceFilters(row, {
        statuses,
        paymentTermIds,
        balanceStates,
        quickFilters,
      })
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filteredRows.slice((currentPage - 1) * limit, currentPage * limit)

    return NextResponse.json({
      rows: paginatedRows,
      metrics: buildVendorBalanceMetrics(filteredRows),
      filterOptions: {
        statuses: ACCOUNTING_PARTY_STATUS_OPTIONS.map((option) => ({
          label: option.label,
          value: option.value,
        })),
        paymentTerms: paymentTermDocs
          .filter((paymentTerm) => paymentTerm.isActive !== false)
          .map((paymentTerm) => ({
            label: buildPaymentTermsLabel(paymentTerm),
            value: String(paymentTerm.id),
          })),
        balanceStates: [
          { label: 'With Open Balance', value: 'with_open_balance' },
          { label: 'Overdue', value: 'overdue' },
          { label: 'Due This Week', value: 'due_this_week' },
          { label: 'High Balance', value: 'high_balance' },
        ],
        quickFilters: [
          { label: 'Active', value: 'status:active' },
          { label: 'On Hold', value: 'status:on_hold' },
          { label: 'With Open Balance', value: 'balance:with_open_balance' },
          { label: 'Overdue', value: 'balance:overdue' },
          { label: 'High Balance', value: 'balance:high_balance' },
        ],
      },
      appliedFilters: {
        search,
        statuses,
        paymentTermIds,
        balanceStates,
        quickFilters,
      },
      meta: {
        id: 'vendor-balances',
        label: 'Vendor Balances',
        description:
          'Monitor vendor master records, payment terms, and open payable balances derived from posted bills.',
        searchPlaceholder: 'Search vendor, vendor code, payment terms, open balance, or oldest due date',
        tableTitle: 'Vendor Balance View',
        tableDescription:
          'Vendor-level open balance view aligned with vendor master records and accounts payable aging logic.',
        columns: [
          'Vendor',
          'Vendor Code',
          'Payment Terms',
          'Open Bills',
          { label: 'Balance Due', align: 'right' },
          'Vendor Status',
        ],
      },
      pagination: {
        page: currentPage,
        limit,
        totalDocs,
        totalPages,
        hasPrevPage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
      },
      totals: {
        totalRows: allRows.length,
        filteredRows: totalDocs,
      },
      referenceData: {
        currencies: currencyDocs
          .filter((currency) => currency.isActive !== false)
          .map((currency) => ({
            id: currency.id,
            code: currency.code || null,
            name: currency.name || null,
          })),
        paymentTerms: paymentTermDocs
          .filter((paymentTerm) => paymentTerm.isActive !== false)
          .map((paymentTerm) => ({
            id: paymentTerm.id,
            code: paymentTerm.code || null,
            name: paymentTerm.name || null,
            dueInDays: Number(paymentTerm.dueInDays || 0),
            label: buildPaymentTermsLabel(paymentTerm),
          })),
        vendorTypes: [
          { value: 'supplier', label: 'Supplier' },
          { value: 'contractor', label: 'Service Provider' },
          { value: 'utility', label: 'Utility' },
        ],
        statuses: ACCOUNTING_PARTY_STATUS_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
        })),
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
