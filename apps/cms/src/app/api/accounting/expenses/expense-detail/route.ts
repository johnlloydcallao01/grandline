import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, SIMPLE_POSTING_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { AccountingCommercialService } from '@/accounting/services/AccountingCommercialService'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'
import {
  buildExpenseDetailMetrics,
  buildExpenseDetailRegisterRow,
  buildExpensePostingFlags,
  buildExpenseReferenceData,
  buildExpenseRow,
  matchesSelectedExpenseDetailFilters,
  normalizeSearch,
  parseIntegerParam,
  parseListParam,
  type ExpenseDoc,
} from '../_shared'

type DocumentLinkDoc = {
  id: number | string
  entityType?: string | null
  entityId?: string | null
  documentCategory?: string | null
  notes?: string | null
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

    const [expenseDocs, documentLinks, referenceData, settings] = await Promise.all([
      findAllDocs<ExpenseDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.expenses,
        depth: 2,
        sort: '-updatedAt',
      }),
      findAllDocs<DocumentLinkDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.documentLinks,
        depth: 0,
        where: {
          entityType: {
            equals: 'expense',
          },
        },
        sort: '-createdAt',
      }),
      buildExpenseReferenceData(payload),
      AccountingCommercialService.getSettings(payload),
    ])

    const documentLinksByExpenseId = new Map<string, DocumentLinkDoc[]>()
    for (const documentLink of documentLinks) {
      const expenseId = String(documentLink.entityId || '')
      if (!expenseId) continue
      const existing = documentLinksByExpenseId.get(expenseId) || []
      existing.push(documentLink)
      documentLinksByExpenseId.set(expenseId, existing)
    }

    const baseRows = expenseDocs.map((expense) => buildExpenseRow(expense))
    const rows = expenseDocs.map((expense) =>
      buildExpenseDetailRegisterRow({
        expense,
        documentLinks: documentLinksByExpenseId.get(String(expense.id)) || [],
      }),
    )
    const flags = buildExpensePostingFlags({
      rows: baseRows,
      taxCodes: referenceData.taxCodes,
      hasDefaultInputTaxAccount: Boolean(getRelationshipId(settings?.defaultInputTaxAccount)),
    })
    const normalizedQuery = normalizeSearch(search)
    const filteredRows = rows.filter((row) => {
      if (normalizedQuery && !row.searchableText.includes(normalizedQuery)) return false
      return matchesSelectedExpenseDetailFilters(row, {
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
      metrics: buildExpenseDetailMetrics(filteredRows),
      filterOptions: {
        statuses: SIMPLE_POSTING_STATUS_OPTIONS.map((option) => ({
          label: option.label,
          value: option.value,
        })),
        vendors: referenceData.vendors.map((vendor) => ({
          label: `${vendor.vendorCode ? `${vendor.vendorCode} - ` : ''}${vendor.displayName || `Vendor ${vendor.id}`}`,
          value: String(vendor.id),
        })),
        coverageStates: [
          { label: 'With Tax Code', value: 'with_tax' },
          { label: 'With Documents', value: 'with_documents' },
          { label: 'Journal Linked', value: 'journal_linked' },
        ],
        quickFilters: [
          { label: 'Draft', value: 'status:draft' },
          { label: 'Posted', value: 'status:posted' },
          { label: 'With Tax Code', value: 'coverage:with_tax' },
          { label: 'With Documents', value: 'coverage:with_documents' },
          { label: 'Journal Linked', value: 'coverage:journal_linked' },
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
        id: 'expense-detail',
        label: 'Expense Detail',
        description:
          'Inspect expense headers, tax coding, support document coverage, and journal linkage using live expense records.',
        searchPlaceholder: 'Search expense no., vendor, tax code, document note, or journal ref',
        tableTitle: 'Expense Detail Coverage',
        tableDescription:
          'Detail-oriented view of tax mapping, support documents, and posting references for each expense record.',
        columns: ['Expense No.', 'Vendor', 'Tax Code', 'Documents', 'Journal Linked', 'Status'],
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
      flags,
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
