import { NextRequest, NextResponse } from 'next/server'
import { AccountingPeriodsRegisterService } from '@/accounting/services/periods/AccountingPeriodsRegisterService'
import type { AccountingPeriodStatus } from '@/accounting/types/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '@/app/api/accounting/_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) {
    return fallback
  }

  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

const parseListParam = <T extends string>(searchParams: URLSearchParams, key: string): T[] => {
  const values = searchParams
    .getAll(key)
    .flatMap((value) => String(value || '').split(','))
    .map((value) => value.trim())
    .filter(Boolean)

  return Array.from(new Set(values)) as T[]
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const result = await AccountingPeriodsRegisterService.getPeriodsRegister(payload, {
      search: searchParams.get('search') || '',
      statuses: parseListParam<AccountingPeriodStatus>(searchParams, 'status'),
      fiscalYearId: searchParams.get('fiscalYearId') || '',
      quickFilters: parseListParam(searchParams, 'quickFilter'),
      page: parseIntegerParam(searchParams.get('page'), 1),
      limit: parseIntegerParam(searchParams.get('limit'), 10),
    })

    return NextResponse.json({
      section: {
        id: 'accounting-periods',
        label: 'Accounting Periods',
        description:
          'Maintain accounting periods under each fiscal year, including date ranges, status, lock dates, and close information.',
        searchPlaceholder: 'Search period label, fiscal year, status, or date range',
        filters: result.filterOptions,
        metrics: result.metrics,
        table: {
          title: 'Period Register',
          description:
            'Period records showing label, fiscal year, date range, status, and lock information.',
          columns: ['Label', 'Period #', 'Fiscal Year', 'Date Range', 'Status', 'Locked From'],
          rows: result.rows.map((row) => ({
            id: row.id,
            label: row.label,
            periodNumber: row.periodNumber,
            fiscalYearId: row.fiscalYearId,
            fiscalYearCode: row.fiscalYearCode,
            fiscalYearName: row.fiscalYearName,
            startDate: row.startDate,
            endDate: row.endDate,
            dateRange: row.dateRange,
            status: row.status,
            statusLabel: row.statusLabel,
            lockedFromDate: row.lockedFromDate,
            closedAt: row.closedAt,
            closedByName: row.closedByName,
            notes: row.notes,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            cells: [
              row.label,
              row.periodNumber?.toString() ?? '-',
              row.fiscalYearCode,
              row.dateRange,
              row.statusLabel,
              row.lockedFromDate || '-',
            ],
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
