import { NextRequest, NextResponse } from 'next/server'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'
import {
  buildDocumentCategoryMetrics,
  buildDocumentCategoryReferenceData,
  findDocumentCategoriesRegister,
  matchesDocumentCategoryFilters,
  normalizeSearch,
  parseIntegerParam,
  parseListParam,
} from './_shared'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const groups = parseListParam(searchParams, 'group')
    const statuses = parseListParam(searchParams, 'status')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const rows = await findDocumentCategoriesRegister(payload)
    const normalizedQuery = normalizeSearch(search)
    const filteredRows = rows.filter((row) => {
      if (normalizedQuery && !row.searchableText.includes(normalizedQuery)) return false
      return matchesDocumentCategoryFilters(row, {
        groups,
        statuses,
        quickFilters,
      })
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filteredRows.slice((currentPage - 1) * limit, currentPage * limit)
    const referenceData = buildDocumentCategoryReferenceData()

    return NextResponse.json({
      rows: paginatedRows,
      metrics: buildDocumentCategoryMetrics(filteredRows),
      filterOptions: {
        groups: referenceData.groups,
        statuses: referenceData.statuses,
        quickFilters: [
          { label: 'Commercial', value: 'group:commercial' },
          { label: 'Receipts', value: 'group:receipts' },
          { label: 'Banking', value: 'group:banking' },
          { label: 'Tax', value: 'group:tax' },
        ],
      },
      appliedFilters: {
        search,
        groups,
        statuses,
        quickFilters,
      },
      meta: {
        id: 'document-categories',
        label: 'Document Categories',
        description:
          'Review the supported accounting document categories enforced by the document-link collection such as invoice, bill, receipt, bank statement, tax, and contract.',
        searchPlaceholder: 'Search category, common usage, linked volume, or primary usage',
        tableTitle: 'Document Category Register',
        tableDescription:
          'Governance view of the document categories actually defined by the accounting document-link collection.',
        columns: [
          'Category',
          'Typical Use',
          { label: 'Linked Records', align: 'right' },
          'Primary Usage',
          'Notes',
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
