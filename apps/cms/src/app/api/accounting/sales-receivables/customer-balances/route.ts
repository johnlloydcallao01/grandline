import { NextRequest, NextResponse } from 'next/server'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_PARTY_STATUS_OPTIONS,
  CUSTOMER_TYPE_OPTIONS,
} from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'
import {
  buildCustomerBalanceMetrics,
  buildCustomerBalanceRow,
  buildPaymentTermsLabel,
  matchesSelectedCustomerBalanceFilters,
  normalizeSearch,
  parseIntegerParam,
  parseListParam,
  type CustomerBalanceCustomerDoc,
  type CustomerBalanceInvoiceDoc,
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

    const [customerDocs, invoiceDocs, paymentTermDocs, currencyDocs] = await Promise.all([
      findAllDocs<CustomerBalanceCustomerDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.customers,
        depth: 1,
        sort: 'displayName',
      }),
      findAllDocs<CustomerBalanceInvoiceDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
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

    const invoicesByCustomerId = new Map<string, CustomerBalanceInvoiceDoc[]>()
    for (const invoice of invoiceDocs) {
      const customerId = String(
        (typeof invoice.customer === 'object' && invoice.customer ? invoice.customer.id : invoice.customer) || '',
      )
      if (!customerId) continue
      const bucket = invoicesByCustomerId.get(customerId) || []
      bucket.push(invoice)
      invoicesByCustomerId.set(customerId, bucket)
    }

    const allRows = customerDocs
      .map((customer) => buildCustomerBalanceRow(customer, invoicesByCustomerId.get(String(customer.id)) || []))
      .sort((left, right) => {
        const byName = left.customerLabel.localeCompare(right.customerLabel)
        if (byName !== 0) return byName
        return left.customerCode.localeCompare(right.customerCode)
      })

    const normalizedSearch = normalizeSearch(search)
    const filteredRows = allRows.filter((row) => {
      if (normalizedSearch && !row.searchableText.includes(normalizedSearch)) return false
      return matchesSelectedCustomerBalanceFilters(row, {
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
      metrics: buildCustomerBalanceMetrics(filteredRows),
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
          { label: 'Over Credit Limit', value: 'over_credit_limit' },
          { label: 'Overdue', value: 'overdue' },
          { label: 'Due This Week', value: 'due_this_week' },
        ],
        quickFilters: [
          { label: 'Active', value: 'status:active' },
          { label: 'On Hold', value: 'status:on_hold' },
          { label: 'With Open Balance', value: 'balance:with_open_balance' },
          { label: 'Over Credit Limit', value: 'balance:over_credit_limit' },
          { label: 'Overdue', value: 'balance:overdue' },
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
        id: 'customer-balances',
        label: 'Customer Balances',
        description:
          'Monitor customer master records, credit terms, credit limits, and open receivable balances derived from invoices.',
        searchPlaceholder: 'Search customer, customer code, payment terms, credit limit, or balance',
        tableTitle: 'Customer Balance View',
        tableDescription:
          'Customer-level open balance view aligned with customer master records, payment terms, and credit limits.',
        columns: [
          'Customer',
          'Customer Code',
          'Payment Terms',
          { label: 'Credit Limit', align: 'right' },
          { label: 'Balance Due', align: 'right' },
          'Status',
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
        customerTypes: CUSTOMER_TYPE_OPTIONS.map((option) => ({
          value: option.value,
          label: option.value === 'company' ? 'Corporate' : option.label,
        })),
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
