import { NextRequest, NextResponse } from 'next/server'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'
import {
  buildAccountingInboxMetrics,
  buildAccountingInboxReferenceData,
  buildAccountingInboxRegister,
  matchesAccountingInboxFilters,
  normalizeSearch,
  parseIntegerParam,
  parseListParam,
} from './_shared'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const mimeFamilies = parseListParam(searchParams, 'mimeFamily')
    const statuses = parseListParam(searchParams, 'status')
    const categories = parseListParam(searchParams, 'category')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const { rows } = await buildAccountingInboxRegister(payload)
    const normalizedQuery = normalizeSearch(search)
    const filteredRows = rows.filter((row) => {
      if (normalizedQuery && !row.searchableText.includes(normalizedQuery)) return false
      return matchesAccountingInboxFilters(row, {
        mimeFamilies,
        statuses,
        categories,
        quickFilters,
      })
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filteredRows.slice((currentPage - 1) * limit, currentPage * limit)

    return NextResponse.json({
      rows: paginatedRows,
      metrics: buildAccountingInboxMetrics(filteredRows),
      filterOptions: {
        mimeFamilies: [
          { label: 'PDF', value: 'pdf' },
          { label: 'Images', value: 'image' },
          { label: 'Spreadsheets', value: 'spreadsheet' },
          { label: 'Documents', value: 'document' },
          { label: 'Archives', value: 'archive' },
          { label: 'Other', value: 'other' },
        ],
        statuses: [
          { label: 'Ready To Link', value: 'ready_to_link' },
          { label: 'Linked', value: 'linked' },
          { label: 'Multi-linked', value: 'multi_linked' },
          { label: 'Primary Linked', value: 'primary_linked' },
        ],
        categories: buildAccountingInboxReferenceData(rows).categories,
        quickFilters: [
          { label: 'Recent Uploads', value: 'recent:7d' },
          { label: 'PDF', value: 'fileType:pdf' },
          { label: 'Images', value: 'fileType:image' },
          { label: 'Ready To Link', value: 'status:ready_to_link' },
          { label: 'Linked', value: 'status:linked' },
          { label: 'Multi-linked', value: 'status:multi_linked' },
          { label: 'Primary Linked', value: 'status:primary' },
        ],
      },
      appliedFilters: {
        search,
        mimeFamilies,
        statuses,
        categories,
        quickFilters,
      },
      meta: {
        id: 'accounting-inbox',
        label: 'Accounting Inbox',
        description:
          'Review uploaded files entering accounting from the shared media library and monitor whether each file is already linked to a finance record.',
        searchPlaceholder: 'Search file name, mime type, category, entity type, entity reference, or note',
        tableTitle: 'Accounting Inbox',
        tableDescription:
          'Live media register enriched with accounting document-link coverage so finance can see what is linked, primary, or still waiting for linkage.',
        columns: [
          'File Name',
          'File Type',
          'Uploaded At',
          { label: 'Link Count', align: 'right' },
          'Latest Link',
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
      referenceData: buildAccountingInboxReferenceData(rows),
      flags: {
        detailEnabledIds: filteredRows.map((row) => row.id),
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
