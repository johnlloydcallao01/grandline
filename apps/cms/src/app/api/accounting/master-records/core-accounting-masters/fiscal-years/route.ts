import { NextRequest, NextResponse } from 'next/server'
import { AccountingFiscalYearsRegisterService } from '@/accounting/services/fiscal-years/AccountingFiscalYearsRegisterService'
import type { AccountingFiscalYearCloseMode, AccountingFiscalYearStatus } from '@/accounting/types/accounting'
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

    const result = await AccountingFiscalYearsRegisterService.getFiscalYearsRegister(payload, {
      search: searchParams.get('search') || '',
      statuses: parseListParam<AccountingFiscalYearStatus>(searchParams, 'status'),
      closeModes: parseListParam<AccountingFiscalYearCloseMode>(searchParams, 'closeMode'),
      quickFilters: parseListParam(searchParams, 'quickFilter'),
      page: parseIntegerParam(searchParams.get('page'), 1),
      limit: parseIntegerParam(searchParams.get('limit'), 10),
    })

    return NextResponse.json({
      section: {
        id: 'fiscal-years',
        label: 'Fiscal Years',
        description:
          'Maintain fiscal-year codes, date ranges, close mode, lock date, close status, and responsible users.',
        searchPlaceholder: 'Search fiscal year code, name, status, close mode, or date range',
        filters: result.filterOptions,
        metrics: result.metrics,
        table: {
          title: 'Fiscal Year Register',
          description:
            'Fiscal-year records showing code, range, status, close mode, and close information.',
          columns: ['Code', 'Name', 'Date Range', 'Close Mode', 'Locked From', 'Status'],
          rows: result.rows.map((row) => ({
            id: row.id,
            code: row.code,
            name: row.name,
            startDate: row.startDate,
            endDate: row.endDate,
            dateRange: row.dateRange,
            status: row.status,
            statusLabel: row.statusLabel,
            closeMode: row.closeMode,
            closeModeLabel: row.closeModeLabel,
            lockedFromDate: row.lockedFromDate,
            closedAt: row.closedAt,
            closedByName: row.closedByName,
            periodCount: row.periodCount,
            notes: row.notes,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            cells: [
              row.code,
              row.name,
              row.dateRange,
              row.closeModeLabel,
              row.lockedFromDate || '-',
              row.statusLabel,
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
