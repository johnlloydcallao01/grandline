import { NextRequest, NextResponse } from 'next/server'
import { AccountingBeforeAfterHistoryService } from '@/accounting/services/reports/AccountingBeforeAfterHistoryService'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) return fallback
  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

const parseListParam = (searchParams: URLSearchParams, key: string): string[] =>
  Array.from(
    new Set(
      searchParams
        .getAll(key)
        .flatMap((value) => String(value || '').split(','))
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  )

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const result = await AccountingBeforeAfterHistoryService.getBeforeAfterHistory(payload, {
      search: searchParams.get('search') || '',
      actionTypes: parseListParam(searchParams, 'actionType'),
      snapshotTypes: parseListParam(searchParams, 'snapshotType'),
      quickFilters: parseListParam(searchParams, 'quickFilter'),
      page: parseIntegerParam(searchParams.get('page'), 1),
      limit: parseIntegerParam(searchParams.get('limit'), 10),
    })

    return NextResponse.json({
      section: {
        id: 'before-after-history',
        label: 'Before / After History',
        description:
          'Inspect before-data and after-data snapshots stored in the finance audit trail for sensitive record changes.',
        searchPlaceholder: 'Search entity id, changed field, actor, reason, or snapshot key',
        filters: result.filterOptions,
        metrics: result.metrics.map((metric, index) => ({ id: `before-after-metric-${index}`, ...metric })),
        table: {
          title: 'Before / After Snapshot History',
          description: 'History of audit-log entries that preserve prior and resulting data for finance record changes.',
          columns: ['Performed At', 'Entity ID', 'Action', 'Before Data', 'After Data', 'Reason'],
          rows: result.rows,
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
