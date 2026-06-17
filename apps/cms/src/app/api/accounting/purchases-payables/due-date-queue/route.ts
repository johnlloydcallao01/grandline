import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'
import {
  buildBillsReferenceData,
  buildDueDateQueueMetrics,
  buildDueDateQueueRow,
  isOpenDueDateQueueBill,
  matchesSelectedDueDateQueueFilters,
  type BillDoc,
} from './_shared'
import {
  normalizeSearch,
  parseIntegerParam,
  parseListParam,
} from '../bills/_shared'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const statuses = parseListParam(searchParams, 'status')
    const vendorIds = parseListParam(searchParams, 'vendorId')
    const dueStates = parseListParam(searchParams, 'dueState')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [billDocs, referenceData] = await Promise.all([
      findAllDocs<BillDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.bills,
        depth: 1,
        sort: 'dueDate',
      }),
      buildBillsReferenceData(payload),
    ])

    const allRows = billDocs
      .filter(isOpenDueDateQueueBill)
      .map(buildDueDateQueueRow)
      .sort((left, right) => {
        if (left.daysUntilDue !== right.daysUntilDue) return left.daysUntilDue - right.daysUntilDue
        if (right.balanceDue !== left.balanceDue) return right.balanceDue - left.balanceDue
        return left.vendorLabel.localeCompare(right.vendorLabel)
      })

    const normalizedQuery = normalizeSearch(search)
    const filteredRows = allRows.filter((row) => {
      if (normalizedQuery && !row.searchableText.includes(normalizedQuery)) return false
      return matchesSelectedDueDateQueueFilters(row, {
        statuses,
        vendorIds,
        dueStates,
        quickFilters,
      })
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filteredRows.slice((currentPage - 1) * limit, currentPage * limit)

    return NextResponse.json({
      rows: paginatedRows,
      metrics: buildDueDateQueueMetrics(filteredRows),
      filterOptions: {
        statuses: Array.from(new Set(allRows.map((row) => row.status)))
          .filter(Boolean)
          .map((status) => ({
            label: allRows.find((row) => row.status === status)?.statusLabel || status,
            value: status,
          })),
        vendors: referenceData.vendors.map((vendor) => ({
          label: `${vendor.vendorCode ? `${vendor.vendorCode} - ` : ''}${vendor.displayName || `Vendor ${vendor.id}`}`,
          value: String(vendor.id),
        })),
        dueStates: [
          { label: 'Due Today', value: 'due_today' },
          { label: 'Due This Week', value: 'due_this_week' },
          { label: 'Overdue', value: 'overdue' },
          { label: 'Due Later', value: 'due_later' },
        ],
        quickFilters: [
          { label: 'Due Today', value: 'due:due_today' },
          { label: 'Due This Week', value: 'due:due_this_week' },
          { label: 'Overdue', value: 'due:overdue' },
          { label: 'Partially Paid', value: 'status:partially_paid' },
          { label: 'Approved Unposted', value: 'queue:approved_unposted' },
        ],
      },
      appliedFilters: {
        search,
        statuses,
        vendorIds,
        dueStates,
        quickFilters,
      },
      meta: {
        id: 'due-date-queue',
        label: 'Due Date Queue',
        description:
          'Track open bills by due date, remaining balance, and settlement status for daily AP review.',
        searchPlaceholder: 'Search bill no., vendor, due date, balance due, or status',
        tableTitle: 'Open Bill Due Queue',
        tableDescription:
          'Daily payable queue focused on due dates, balance due, and current document status.',
        columns: [
          'Bill No.',
          'Vendor',
          'Bill Date',
          'Due Date',
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
      referenceData,
      flags: {
        mutableBillIds: allRows.filter((row) => row.isMutable).map((row) => row.id),
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
