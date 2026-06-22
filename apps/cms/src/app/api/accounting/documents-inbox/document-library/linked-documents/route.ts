import { NextRequest, NextResponse } from 'next/server'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'
import {
  buildLinkedDocumentsMetrics,
  buildLinkedDocumentsReferenceData,
  findLinkedDocumentsRegister,
  matchesLinkedDocumentsFilters,
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

    const rows = await findLinkedDocumentsRegister(payload)
    const normalizedQuery = normalizeSearch(search)
    const filteredRows = rows.filter((row) => {
      if (normalizedQuery && !row.searchableText.includes(normalizedQuery)) return false
      return matchesLinkedDocumentsFilters(row, {
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
    const referenceData = buildLinkedDocumentsReferenceData(rows)

    return NextResponse.json({
      rows: paginatedRows,
      metrics: buildLinkedDocumentsMetrics(filteredRows),
      filterOptions: {
        categories: referenceData.categories,
        entityTypes: referenceData.entityTypes,
        statuses: referenceData.statuses,
        quickFilters: [
          { label: 'Invoices', value: 'group:invoices' },
          { label: 'Bills', value: 'group:bills' },
          { label: 'Expenses', value: 'group:expenses' },
          { label: 'Banking', value: 'group:banking' },
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
        id: 'linked-documents',
        label: 'Linked Documents',
        description:
          'Review accounting document links by entity type, entity id, category, document date, and primary-document flag.',
        searchPlaceholder: 'Search entity type, entity id, category, notes, or uploader',
        tableTitle: 'Linked Document Register',
        tableDescription:
          'Link-centric register built directly from accounting document links using entity type, entity id, and category metadata.',
        columns: ['File Name', 'Entity Type', 'Entity ID', 'Category', 'Is Primary', 'Status'],
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
