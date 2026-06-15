import { NextRequest, NextResponse } from 'next/server'
import { AccountingEntityHistoryService } from '@/accounting/services/reports/AccountingEntityHistoryService'
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

    const result = await AccountingEntityHistoryService.getEntityHistory(payload, {
      search: searchParams.get('search') || '',
      actionTypes: parseListParam(searchParams, 'actionType'),
      entityTypes: parseListParam(searchParams, 'entityType'),
      quickFilters: parseListParam(searchParams, 'quickFilter'),
      page: parseIntegerParam(searchParams.get('page'), 1),
      limit: parseIntegerParam(searchParams.get('limit'), 10),
    })

    return NextResponse.json({
      section: {
        id: 'entity-history',
        label: 'Entity History',
        description:
          'Review audit-log history by accounting entity using entity type, entity id, actor, action, and event time.',
        searchPlaceholder: 'Search entity type, entity id, action, user, or source field',
        filters: result.filterOptions,
        metrics: result.metrics.map((metric, index) => ({ id: `entity-history-metric-${index}`, ...metric })),
        table: {
          title: 'Entity Activity History',
          description: 'Entity-oriented audit history showing who changed which accounting record and when.',
          columns: ['Performed At', 'Entity Type', 'Entity ID', 'Action', 'Performed By', 'Source Field'],
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
