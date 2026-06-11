import { NextRequest, NextResponse } from 'next/server'
import { AccountingJournalSourceTypesRegisterService } from '@/accounting/services/journals/AccountingJournalSourceTypesRegisterService'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) return fallback
  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

const parseListParam = (searchParams: URLSearchParams, key: string): string[] => {
  return Array.from(new Set(
    searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean),
  ))
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const result = await AccountingJournalSourceTypesRegisterService.getSourceTypesRegister(payload, {
      search: searchParams.get('search') || '',
      sourceTypes: parseListParam(searchParams, 'sourceType'),
      statuses: parseListParam(searchParams, 'status'),
      page: parseIntegerParam(searchParams.get('page'), 1),
      limit: parseIntegerParam(searchParams.get('limit'), 10),
    })

    return NextResponse.json({
      section: {
        id: 'journal-source-types',
        label: 'Journal Source Types',
        description: 'Review journal records by source type such as manual, opening balance, adjustment, reversal, and system.',
        searchPlaceholder: 'Search source type, entry no., source reference, memo, or user',
        filters: result.filterOptions,
        metrics: result.metrics,
        table: {
          title: 'Source-Type Journal View',
          description: 'Journal inventory grouped around the supported sourceType values.',
          columns: ['Entry No.', 'Source Type', 'Source Ref', 'Posting Date', 'Posted By', 'Status'],
          rows: result.rows.map((row) => ({
            id: row.id,
            entryNumber: row.entryNumber,
            entryDate: row.entryDate,
            postingDate: row.postingDate,
            sourceType: row.sourceType,
            sourceTypeLabel: row.sourceTypeLabel,
            sourceReference: row.sourceReference,
            memo: row.memo,
            referenceNumber: row.referenceNumber,
            status: row.status,
            statusLabel: row.statusLabel,
            totalDebit: row.totalDebit,
            totalCredit: row.totalCredit,
            createdBy: row.createdBy,
            updatedBy: row.updatedBy,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            cells: row.cells,
          })),
        },
      },
      appliedFilters: result.appliedFilters,
      pagination: result.pagination,
      totals: result.totals,
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
