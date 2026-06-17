import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, DOCUMENT_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'
import {
  buildBillDetailMetrics,
  buildBillDetailRegisterRow,
  buildBillsReferenceData,
  matchesSelectedBillDetailFilters,
  normalizeSearch,
  parseIntegerParam,
  parseListParam,
  type BillDoc,
  type BillLineDoc,
} from '../bills/_shared'

type DocumentLinkDoc = {
  id: number | string
  entityType?: string | null
  entityId?: string | null
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const statuses = parseListParam(searchParams, 'status')
    const vendorIds = parseListParam(searchParams, 'vendorId')
    const coverageStates = parseListParam(searchParams, 'coverage')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [billDocs, billLineDocs, documentLinks, referenceData] = await Promise.all([
      findAllDocs<BillDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.bills,
        depth: 1,
        sort: '-updatedAt',
      }),
      findAllDocs<BillLineDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.billLineItems,
        depth: 1,
        sort: 'lineNumber',
      }),
      findAllDocs<DocumentLinkDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.documentLinks,
        depth: 0,
        where: {
          entityType: {
            equals: 'bill',
          },
        },
      }),
      buildBillsReferenceData(payload),
    ])

    const linesByBillId = new Map<string, BillLineDoc[]>()
    for (const line of billLineDocs) {
      const billId = String(getRelationshipId(line.bill) || '')
      if (!billId) continue
      const existing = linesByBillId.get(billId) || []
      existing.push(line)
      linesByBillId.set(billId, existing)
    }

    const documentCountByBillId = new Map<string, number>()
    for (const documentLink of documentLinks) {
      const billId = String(documentLink.entityId || '')
      if (!billId) continue
      documentCountByBillId.set(billId, (documentCountByBillId.get(billId) || 0) + 1)
    }

    const rows = billDocs.map((bill) =>
      buildBillDetailRegisterRow({
        bill,
        lineItems: linesByBillId.get(String(bill.id)) || [],
        documentCount: documentCountByBillId.get(String(bill.id)) || 0,
      }),
    )

    const filteredRows = rows.filter((row) => {
      const normalizedQuery = normalizeSearch(search)
      if (normalizedQuery && !row.searchableText.includes(normalizedQuery)) return false
      return matchesSelectedBillDetailFilters(row, {
        statuses,
        vendorIds,
        coverageStates,
        quickFilters,
      })
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filteredRows.slice((currentPage - 1) * limit, currentPage * limit)

    return NextResponse.json({
      rows: paginatedRows,
      metrics: buildBillDetailMetrics(filteredRows),
      filterOptions: {
        statuses: DOCUMENT_STATUS_OPTIONS.map((option) => ({ label: option.label, value: option.value })),
        vendors: referenceData.vendors.map((vendor) => ({
          label: `${vendor.vendorCode ? `${vendor.vendorCode} - ` : ''}${vendor.displayName || `Vendor ${vendor.id}`}`,
          value: String(vendor.id),
        })),
        coverageStates: [
          { label: 'With Lines', value: 'with_lines' },
          { label: 'With Tax', value: 'with_tax' },
          { label: 'With Documents', value: 'with_documents' },
          { label: 'Journal Linked', value: 'journal_linked' },
        ],
        quickFilters: [
          { label: 'With Lines', value: 'coverage:with_lines' },
          { label: 'With Tax', value: 'coverage:with_tax' },
          { label: 'With Documents', value: 'coverage:with_documents' },
          { label: 'Journal Linked', value: 'coverage:journal_linked' },
          { label: 'Draft', value: 'status:draft' },
          { label: 'Posted', value: 'status:posted' },
        ],
      },
      appliedFilters: {
        search,
        statuses,
        vendorIds,
        coverageStates,
        quickFilters,
      },
      meta: {
        id: 'bill-detail',
        label: 'Bill Detail',
        description:
          'Inspect bill headers, normalized line items, tax totals, linked documents, and journal references.',
        searchPlaceholder: 'Search bill no., vendor, line description, tax code, or journal ref',
        tableTitle: 'Bill Detail Coverage',
        tableDescription:
          'Detail-oriented view of line totals, tax totals, document support, and journal linkage for posted and draft bills.',
        columns: [
          'Bill No.',
          'Vendor',
          'Line Items',
          { label: 'Tax Total', align: 'right' },
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
        totalRows: rows.length,
        filteredRows: totalDocs,
      },
      referenceData,
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
