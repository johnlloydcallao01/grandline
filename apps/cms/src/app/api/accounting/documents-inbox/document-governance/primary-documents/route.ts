import { NextRequest, NextResponse } from 'next/server'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'
import {
  buildPrimaryDocumentMetrics,
  buildPrimaryDocumentReferenceData,
  findPrimaryDocumentsRegister,
  matchesPrimaryDocumentFilters,
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
    const categories = parseListParam(searchParams, 'category')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const rows = await findPrimaryDocumentsRegister(payload)
    const normalizedQuery = normalizeSearch(search)
    const filteredRows = rows.filter((row) => {
      if (normalizedQuery && !row.searchableText.includes(normalizedQuery)) return false
      return matchesPrimaryDocumentFilters(row, {
        groups,
        categories,
        quickFilters,
      })
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filteredRows.slice((currentPage - 1) * limit, currentPage * limit)
    const referenceData = buildPrimaryDocumentReferenceData()

    return NextResponse.json({
      rows: paginatedRows,
      metrics: buildPrimaryDocumentMetrics(filteredRows),
      filterOptions: {
        groups: referenceData.groups,
        categories: referenceData.categories,
        quickFilters: [
          { label: 'Primary', value: 'group:commercial' },
          { label: 'Invoices', value: 'entity:invoice' },
          { label: 'Bills', value: 'entity:bill' },
          { label: 'Expenses', value: 'entity:expense' },
        ],
      },
      appliedFilters: {
        search,
        groups,
        categories,
        quickFilters,
      },
      meta: {
        id: 'primary-documents',
        label: 'Primary Documents',
        description:
          'Review document links marked as primary so finance can identify the main supporting file attached to a transaction or accounting entity.',
        searchPlaceholder: 'Search entity id, file name, category, uploaded by, or primary-link note',
        tableTitle: 'Primary Document Register',
        tableDescription:
          'Primary-document review based on the `isPrimary` flag already present in the accounting document-link collection.',
        columns: [
          'File Name',
          'Entity Type',
          'Entity ID',
          'Category',
          'Uploaded By',
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
