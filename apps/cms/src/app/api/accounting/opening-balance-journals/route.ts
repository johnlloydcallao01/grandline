import { NextRequest, NextResponse } from 'next/server'
import { AccountingOpeningBalanceJournalsService } from '@/accounting/services/journals/AccountingOpeningBalanceJournalsService'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) return fallback; const p = Number(value); return Number.isFinite(p) ? p : fallback
}

    const parseListParam = (searchParams: URLSearchParams, key: string): string[] =>
  Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const result = await AccountingOpeningBalanceJournalsService.getRegister(payload, {
      search: searchParams.get('search') || '',
      statuses: parseListParam(searchParams, 'status'),
      balancedFilters: parseListParam(searchParams, 'balancedFilter'),
      quickFilters: parseListParam(searchParams, 'quickFilter'),
      page: parseIntegerParam(searchParams.get('page'), 1), limit: parseIntegerParam(searchParams.get('limit'), 10),
    })
    return NextResponse.json({
      section: {
        id: 'opening-balance-journals', label: 'Opening Balance Journals',
        description: 'Review journal entries created with the opening_balance source type and their locked opening positions.',
        searchPlaceholder: 'Search entry no., source reference, posting date, memo, or status',
        filters: result.filterOptions, metrics: result.metrics,
        table: {
          title: 'Opening Balance Journal View',
          description: 'Opening-balance journal headers using source type, totals, balance validation, and posting status.',
          columns: ['Entry No.', 'Posting Date', 'Source Ref', 'Total Debit', 'Balanced', 'Status'],
          rows: result.rows.map((r) => ({ id: r.id, entryNumber: r.entryNumber, postingDate: r.postingDate, sourceReference: r.sourceReference, memo: r.memo, status: r.status, statusLabel: r.statusLabel, totalDebit: r.totalDebit, isBalanced: r.isBalanced, createdBy: r.createdBy, createdAt: r.createdAt, updatedAt: r.updatedAt, cells: r.cells })),
        },
      },
      appliedFilters: result.appliedFilters, pagination: result.pagination, totals: result.totals,
    })
  } catch (error) { return handleAccountingApiError(error) }
}
