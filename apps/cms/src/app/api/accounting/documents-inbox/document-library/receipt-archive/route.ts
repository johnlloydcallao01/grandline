import { NextRequest, NextResponse } from 'next/server'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'
import {
  buildReceiptArchiveMetrics,
  buildReceiptArchiveReferenceData,
  findReceiptArchiveRegister,
  matchesReceiptArchiveFilters,
  normalizeSearch,
  parseIntegerParam,
  parseListParam,
} from './_shared'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const categories = parseListParam(searchParams, 'category')
    const entityTypes = parseListParam(searchParams, 'entityType')
    const statuses = parseListParam(searchParams, 'status')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const rows = await findReceiptArchiveRegister(payload)
    const normalizedQuery = normalizeSearch(search)
    const filteredRows = rows.filter((row) => {
      if (normalizedQuery && !row.searchableText.includes(normalizedQuery)) return false
      return matchesReceiptArchiveFilters(row, {
        categories,
        entityTypes,
        statuses,
        quickFilters,
      })
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filteredRows.slice((currentPage - 1) * limit, currentPage * limit)
    const referenceData = buildReceiptArchiveReferenceData(rows)

    return NextResponse.json({
      rows: paginatedRows,
      metrics: buildReceiptArchiveMetrics(filteredRows),
      filterOptions: {
        categories: referenceData.categories,
        entityTypes: referenceData.entityTypes,
        statuses: referenceData.statuses,
        quickFilters: [
          { label: 'Receipt', value: 'category:receipt' },
          { label: 'Expense Receipt', value: 'category:expense_receipt' },
          { label: 'Proof Of Payment', value: 'category:proof_of_payment' },
          { label: 'Primary', value: 'status:primary' },
        ],
      },
      appliedFilters: {
        search,
        categories,
        entityTypes,
        statuses,
        quickFilters,
      },
      meta: {
        id: 'receipt-archive',
        label: 'Receipt Archive',
        description:
          'Review receipt-oriented supporting documents using linked categories such as receipt, expense receipt, and proof of payment.',
        searchPlaceholder: 'Search receipt file, entity id, category, uploader, or document date',
        tableTitle: 'Receipt Archive',
        tableDescription:
          'Document-link register filtered to receipt-like accounting document categories with real file and linkage metadata.',
        columns: ['File Name', 'Document Category', 'Entity Type', 'Entity ID', 'Document Date', 'Status'],
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
        totalRows: rows.length,
        filteredRows: totalDocs,
      },
      referenceData,
      flags: {
        detailEnabledIds: filteredRows.map((row) => row.id),
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
