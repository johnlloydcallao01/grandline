import { NextRequest, NextResponse } from 'next/server'
import { AccountingJournalEntriesRegisterService } from '@/accounting/services/journals/AccountingJournalEntriesRegisterService'
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

    const result = await AccountingJournalEntriesRegisterService.getJournalEntriesRegister(payload, {
      search: searchParams.get('search') || '',
      statuses: parseListParam(searchParams, 'status'),
      sourceTypes: parseListParam(searchParams, 'sourceType'),
      isUnbalanced: searchParams.get('isUnbalanced') === 'true',
      quickFilters: parseListParam(searchParams, 'quickFilter'),
      page: parseIntegerParam(searchParams.get('page'), 1),
      limit: parseIntegerParam(searchParams.get('limit'), 10),
    })

    return NextResponse.json({
      section: {
        id: 'journal-entries',
        label: 'Journal Entries',
        description: 'Manage journal entry headers with entry numbers, dates, source type, status, and balancing totals.',
        searchPlaceholder: 'Search entry no., source ref, memo, or status',
        filters: result.filterOptions,
        metrics: result.metrics,
        table: {
          title: 'Journal Entry Register',
          description: 'Journal header register using entry number, posting date, source type, totals, and status.',
          columns: ['Entry No.', 'Posting Date', 'Source Type', 'Memo', 'Total Debit', 'Total Credit', 'Balanced', 'Status'],
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
            postingStatus: row.postingStatus,
            postingStatusLabel: row.postingStatusLabel,
            totalDebit: row.totalDebit,
            totalCredit: row.totalCredit,
            isBalanced: row.isBalanced,
            fiscalYearId: row.fiscalYearId,
            fiscalYearCode: row.fiscalYearCode,
            periodId: row.periodId,
            periodLabel: row.periodLabel,
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

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = await request.json()

    const record = await payload.create({
      collection: 'accounting-journal-entries',
      overrideAccess: true,
      data: {
        ...body,
        createdBy: user.id,
        updatedBy: user.id,
      },
      depth: 1,
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
