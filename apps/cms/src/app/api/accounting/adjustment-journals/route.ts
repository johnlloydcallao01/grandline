import { NextRequest, NextResponse } from 'next/server'
import { AccountingAdjustmentJournalsService } from '@/accounting/services/journals/AccountingAdjustmentJournalsService'
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
    const result = await AccountingAdjustmentJournalsService.getRegister(payload, {
      search: searchParams.get('search') || '',
      statuses: parseListParam(searchParams, 'status'),
      balancedFilters: parseListParam(searchParams, 'balancedFilter'),
      quickFilters: parseListParam(searchParams, 'quickFilter'),
      page: parseIntegerParam(searchParams.get('page'), 1), limit: parseIntegerParam(searchParams.get('limit'), 10),
    })
    return NextResponse.json({
      section: {
        id: 'adjustment-journals', label: 'Adjustment Entries',
        description: 'Manage adjustment journals that refine balances while preserving source references.',
        searchPlaceholder: 'Search entry no., reference no., memo, posting date, or approver',
        filters: result.filterOptions, metrics: result.metrics,
        table: {
          title: 'Adjustment Journal View',
          description: 'Adjustment journal headers using reference numbers, totals, and posting status.',
          columns: ['Entry No.', 'Posting Date', 'Reference No.', 'Memo', 'Total Debit', 'Balanced', 'Status'],
          rows: result.rows.map((r) => ({ id: r.id, entryNumber: r.entryNumber, postingDate: r.postingDate, referenceNumber: r.referenceNumber, memo: r.memo, status: r.status, statusLabel: r.statusLabel, totalDebit: r.totalDebit, isBalanced: r.isBalanced, createdBy: r.createdBy, createdAt: r.createdAt, updatedAt: r.updatedAt, cells: r.cells })),
        },
      },
      appliedFilters: result.appliedFilters, pagination: result.pagination, totals: result.totals,
    })
  } catch (error) { return handleAccountingApiError(error) }
}
