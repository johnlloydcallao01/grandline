import { NextRequest, NextResponse } from 'next/server'
import { AccountingLedgerReportService } from '@/accounting/services/reports/AccountingLedgerReportService'
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
    const result = await AccountingLedgerReportService.getRegister(payload, {
      search: searchParams.get('search') || '',
      statuses: parseListParam(searchParams, 'status'),
      quickFilters: parseListParam(searchParams, 'quickFilter'),
      page: parseIntegerParam(searchParams.get('page'), 1), limit: parseIntegerParam(searchParams.get('limit'), 10),
    })
    return NextResponse.json({
      section: {
        id: 'general-ledger', label: 'General Ledger',
        description: 'Browse posted and reversed journal-line activity by account with posting dates, descriptions, and running balances.',
        searchPlaceholder: 'Search account code, account name, or entry no.',
        filters: result.filterOptions, metrics: result.metrics,
        table: {
          title: 'General Ledger View',
          description: 'General-ledger rows derived from posted and reversed journal lines with account and running-balance context.',
          columns: ['Posting Date', 'Entry No.', 'Account', 'Debit', 'Credit', 'Running Balance'],
          rows: result.rows.map((r) => ({ id: r.id, postingDate: r.postingDate, entryNumber: r.entryNumber, account: r.account, debit: r.debit, credit: r.credit, runningBalance: r.runningBalance, status: r.status, cells: r.cells })),
        },
      },
      appliedFilters: result.appliedFilters, pagination: result.pagination, totals: result.totals,
    })
  } catch (error) { return handleAccountingApiError(error) }
}
