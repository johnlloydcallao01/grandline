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
    const result = await AccountingLedgerReportService.getJournalRegister(payload, {
      search: searchParams.get('search') || '',
      statuses: parseListParam(searchParams, 'status'),
      quickFilters: parseListParam(searchParams, 'quickFilter'),
      page: parseIntegerParam(searchParams.get('page'), 1), limit: parseIntegerParam(searchParams.get('limit'), 10),
    })
    return NextResponse.json({
      section: {
        id: 'journal-register', label: 'Journal Register',
        description: 'Review posted and reversed journal headers as a reporting-oriented register built from journal entry records.',
        searchPlaceholder: 'Search entry no., source type, reference no., or status',
        filters: result.filterOptions, metrics: result.metrics,
        table: {
          title: 'Journal Register View',
          description: 'Journal entry headers showing basic meta, source reference, and aggregated total debit.',
          columns: ['Entry No.', 'Posting Date', 'Source Type', 'Reference No.', 'Total Debit', 'Status'],
          rows: result.rows.map((r) => ({ id: r.id, entryNumber: r.entryNumber, postingDate: r.postingDate, sourceType: r.sourceType, referenceNumber: r.referenceNumber, totalDebit: r.totalDebit, status: r.status, cells: r.cells })),
        },
      },
      appliedFilters: result.appliedFilters, pagination: result.pagination, totals: result.totals,
    })
  } catch (error) { return handleAccountingApiError(error) }
}
