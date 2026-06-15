import { NextRequest, NextResponse } from 'next/server'
import { AccountingReversalJournalsService } from '@/accounting/services/journals/AccountingReversalJournalsService'
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
    const result = await AccountingReversalJournalsService.getRegister(payload, {
      search: searchParams.get('search') || '',
      statuses: parseListParam(searchParams, 'status'),
      quickFilters: parseListParam(searchParams, 'quickFilter'),
      page: parseIntegerParam(searchParams.get('page'), 1), limit: parseIntegerParam(searchParams.get('limit'), 10),
    })
    return NextResponse.json({
      section: {
        id: 'reversal-entries', label: 'Reversal Entries',
        description: 'Reverse posted journal entries while preserving the original journal link.',
        searchPlaceholder: 'Search reversal entry, original entry, posting date, reversed by, or memo',
        filters: result.filterOptions, metrics: result.metrics,
        table: {
          title: 'Reversal Journal View',
          description: 'Reversal journal headers using original entries, totals, and posting status.',
          columns: ['Reversal Entry', 'Original Entry', 'Posting Date', 'Memo', 'Reversed By', 'Status'],
          rows: result.rows.map((r) => ({ id: r.id, entryNumber: r.entryNumber, originalEntry: r.originalEntry, postingDate: r.postingDate, memo: r.memo, status: r.status, statusLabel: r.statusLabel, isBalanced: r.isBalanced, createdBy: r.createdBy, createdAt: r.createdAt, updatedAt: r.updatedAt, cells: r.cells })),
        },
      },
      appliedFilters: result.appliedFilters, pagination: result.pagination, totals: result.totals,
    })
  } catch (error) { return handleAccountingApiError(error) }
}
