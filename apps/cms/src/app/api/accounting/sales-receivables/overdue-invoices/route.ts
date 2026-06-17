import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'
import {
  buildOverdueInvoiceRow,
  buildOverdueMetrics,
  buildOverdueReferenceData,
  isOpenReceivableQueueInvoice,
  matchesSelectedOverdueFilters,
  normalizeSearch,
  parseIntegerParam,
  parseListParam,
  type OverdueInvoiceDoc,
} from './_shared'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const statuses = parseListParam(searchParams, 'status')
    const customerIds = parseListParam(searchParams, 'customerId')
    const agingBuckets = parseListParam(searchParams, 'agingBucket')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [invoiceDocs, referenceData] = await Promise.all([
      findAllDocs<OverdueInvoiceDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
        depth: 1,
        sort: 'dueDate',
      }),
      buildOverdueReferenceData(payload),
    ])

    const allRows = invoiceDocs
      .filter(isOpenReceivableQueueInvoice)
      .map(buildOverdueInvoiceRow)
      .sort((left, right) => {
        if (right.daysOverdue !== left.daysOverdue) return right.daysOverdue - left.daysOverdue
        if (right.balanceDue !== left.balanceDue) return right.balanceDue - left.balanceDue
        return left.customerLabel.localeCompare(right.customerLabel)
      })

    const normalizedSearch = normalizeSearch(search)
    const filteredRows = allRows.filter((row) => {
      if (normalizedSearch && !row.searchableText.includes(normalizedSearch)) return false
      return matchesSelectedOverdueFilters(row, {
        statuses,
        customerIds,
        agingBuckets,
        quickFilters,
      })
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filteredRows.slice((currentPage - 1) * limit, currentPage * limit)
    const availableStatuses = Array.from(
      new Set(allRows.map((row) => row.status).filter(Boolean)),
    )

    return NextResponse.json({
      rows: paginatedRows,
      metrics: buildOverdueMetrics(filteredRows),
      filterOptions: {
        statuses: availableStatuses.map((status) => ({
          label: allRows.find((row) => row.status === status)?.statusLabel || status,
          value: status,
        })),
        customers: referenceData.customers.map((customer) => ({
          label: `${customer.customerCode ? `${customer.customerCode} - ` : ''}${customer.displayName || `Customer ${customer.id}`}`,
          value: String(customer.id),
        })),
        agingBuckets: [
          { label: 'Due Today', value: 'due_today' },
          { label: '1-30 Days', value: '1_30' },
          { label: '31-60 Days', value: '31_60' },
          { label: '61-90 Days', value: '61_90' },
          { label: 'Over 90 Days', value: 'over_90' },
        ],
        quickFilters: [
          { label: 'Overdue', value: 'queue:overdue' },
          { label: 'Due Today', value: 'queue:due_today' },
          { label: 'Partially Paid', value: 'status:partially_paid' },
          { label: 'High Balance', value: 'balance:high' },
        ],
      },
      appliedFilters: {
        search,
        statuses,
        customerIds,
        agingBuckets,
        quickFilters,
      },
      meta: {
        id: 'overdue-invoices',
        label: 'Overdue Invoices',
        description:
          'Track overdue receivables using invoice due dates, remaining balances, and customer visibility for follow-up.',
        searchPlaceholder: 'Search customer, invoice no., due date, balance due, or days overdue',
        tableTitle: 'Overdue Receivable Queue',
        tableDescription:
          'Operational AR queue focused on due-today and overdue invoices, remaining balances, and customer follow-up priority.',
        columns: [
          'Customer',
          'Invoice No.',
          'Due Date',
          { label: 'Balance Due', align: 'right' },
          { label: 'Days Overdue', align: 'right' },
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
      referenceData,
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
