import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'
import {
  buildAccountsPayableAgingMetrics,
  buildAccountsPayableAgingReferenceData,
  buildAccountsPayableAgingRow,
  isOpenAccountsPayableAgingBill,
  matchesSelectedAccountsPayableAgingFilters,
  normalizeSearch,
  parseIntegerParam,
  parseListParam,
  type PayableAgingBillDoc,
} from './_shared'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const statuses = parseListParam(searchParams, 'status')
    const vendorIds = parseListParam(searchParams, 'vendorId')
    const agingBuckets = parseListParam(searchParams, 'agingBucket')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [billDocs, referenceData] = await Promise.all([
      findAllDocs<PayableAgingBillDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.bills,
        depth: 1,
        sort: 'dueDate',
      }),
      buildAccountsPayableAgingReferenceData(payload),
    ])

    const allRows = billDocs
      .filter(isOpenAccountsPayableAgingBill)
      .map(buildAccountsPayableAgingRow)
      .sort((left, right) => {
        if (right.daysOverdue !== left.daysOverdue) return right.daysOverdue - left.daysOverdue
        if (right.balanceDue !== left.balanceDue) return right.balanceDue - left.balanceDue
        return left.vendorLabel.localeCompare(right.vendorLabel)
      })

    const normalizedQuery = normalizeSearch(search)
    const filteredRows = allRows.filter((row) => {
      if (normalizedQuery && !row.searchableText.includes(normalizedQuery)) return false
      return matchesSelectedAccountsPayableAgingFilters(row, {
        statuses,
        vendorIds,
        agingBuckets,
        quickFilters,
      })
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filteredRows.slice((currentPage - 1) * limit, currentPage * limit)
    const availableStatuses = Array.from(new Set(allRows.map((row) => row.status).filter(Boolean)))

    return NextResponse.json({
      rows: paginatedRows,
      metrics: buildAccountsPayableAgingMetrics(filteredRows),
      filterOptions: {
        statuses: availableStatuses.map((status) => ({
          label: allRows.find((row) => row.status === status)?.statusLabel || status,
          value: status,
        })),
        vendors: referenceData.vendors.map((vendor) => ({
          label: `${vendor.vendorCode ? `${vendor.vendorCode} - ` : ''}${vendor.displayName || `Vendor ${vendor.id}`}`,
          value: String(vendor.id),
        })),
        agingBuckets: [
          { label: 'Current', value: 'current' },
          { label: '1-30 Days', value: '1_30' },
          { label: '31-60 Days', value: '31_60' },
          { label: '61-90 Days', value: '61_90' },
          { label: 'Over 90 Days', value: 'over_90' },
        ],
        quickFilters: [
          { label: 'Current', value: 'aging:current' },
          { label: '1-30 Days', value: 'aging:1_30' },
          { label: '31-60 Days', value: 'aging:31_60' },
          { label: 'Over 90 Days', value: 'aging:over_90' },
          { label: 'Partially Paid', value: 'status:partially_paid' },
          { label: 'High Balance', value: 'balance:high' },
        ],
      },
      appliedFilters: {
        search,
        statuses,
        vendorIds,
        agingBuckets,
        quickFilters,
      },
      meta: {
        id: 'accounts-payable-aging',
        label: 'Accounts Payable Aging',
        description:
          'Review accounts payable aging using balance due, due dates, and days-overdue buckets from open bills.',
        searchPlaceholder: 'Search vendor, bill no., due date, balance, or aging bucket',
        tableTitle: 'AP Aging Detail',
        tableDescription:
          'Bill-level payable aging using due dates, remaining balances, and days-overdue calculations.',
        columns: [
          'Vendor',
          'Bill No.',
          'Due Date',
          { label: 'Balance Due', align: 'right' },
          { label: 'Days Overdue', align: 'right' },
          'Aging Bucket',
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
