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
    const result = await AccountingLedgerReportService.getTrialBalanceRegister(payload, {
      search: searchParams.get('search') || '',
      statuses: parseListParam(searchParams, 'status'),
      quickFilters: parseListParam(searchParams, 'quickFilter'),
      page: parseIntegerParam(searchParams.get('page'), 1), limit: parseIntegerParam(searchParams.get('limit'), 10),
    })
    return NextResponse.json({
      section: {
        id: 'trial-balance', label: 'Trial Balance',
        description: 'Review trial-balance totals by account using posted and reversed journals across a period or date range.',
        searchPlaceholder: 'Search account code, account name, or account type',
        filters: result.filterOptions, metrics: result.metrics,
        table: {
          title: 'Trial Balance View',
          description: 'Trial-balance rows by account code and type with total debit, total credit, and closing balance.',
          columns: ['Account Code', 'Account Name', 'Type', 'Total Debit', 'Total Credit', 'Closing Balance'],
          rows: result.rows.map((r) => ({ id: r.id, accountCode: r.accountCode, accountName: r.accountName, accountType: r.accountType, totalDebit: r.totalDebit, totalCredit: r.totalCredit, closingBalance: r.closingBalance, cells: r.cells })),
        },
      },
      appliedFilters: result.appliedFilters, pagination: result.pagination, totals: result.totals,
    })
  } catch (error) { return handleAccountingApiError(error) }
}
