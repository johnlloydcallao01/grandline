import { NextRequest, NextResponse } from 'next/server'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'
import {
  buildEntityLinksMetrics,
  buildEntityLinksReferenceData,
  findEntityLinksRegister,
  matchesEntityLinksFilters,
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

    const rows = await findEntityLinksRegister(payload)
    const normalizedQuery = normalizeSearch(search)
    const filteredRows = rows.filter((row) => {
      if (normalizedQuery && !row.searchableText.includes(normalizedQuery)) return false
      return matchesEntityLinksFilters(row, {
        groups,
        statuses,
        quickFilters,
      })
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filteredRows.slice((currentPage - 1) * limit, currentPage * limit)
    const referenceData = buildEntityLinksReferenceData()

    return NextResponse.json({
      rows: paginatedRows,
      metrics: buildEntityLinksMetrics(filteredRows),
      filterOptions: {
        groups: referenceData.groups,
        statuses: referenceData.statuses,
        quickFilters: [
          { label: 'Commercial', value: 'group:commercial' },
          { label: 'Expenses', value: 'group:expenses' },
          { label: 'Banking', value: 'group:banking' },
          { label: 'Journals', value: 'group:journals' },
        ],
      },
      appliedFilters: {
        search,
        groups,
        statuses,
        quickFilters,
      },
      meta: {
        id: 'entity-links',
        label: 'Entity Links',
        description:
          'Review which accounting entity types are currently document-link targets, including invoices, bills, expenses, payments, journal entries, and banking records.',
        searchPlaceholder: 'Search entity type, linked volume, latest entity id, or category usage',
        tableTitle: 'Entity Link Coverage',
        tableDescription:
          'Coverage view of accounting entity types that can be linked to supporting files through `accounting-document-links`.',
        columns: [
          'Entity Type',
          { label: 'Linked Records', align: 'right' },
          'Latest Entity ID',
          'Common Category',
          { label: 'Primary Links', align: 'right' },
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
