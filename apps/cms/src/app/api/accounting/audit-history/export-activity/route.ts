import { NextRequest, NextResponse } from 'next/server'
import { AccountingExportActivityService } from '@/accounting/services/reports/AccountingExportActivityService'
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

    const result = await AccountingExportActivityService.getExportActivity(payload, {
      search: searchParams.get('search') || '',
      categories: parseListParam(searchParams, 'category'),
      entityTypes: parseListParam(searchParams, 'entityType'),
      quickFilters: parseListParam(searchParams, 'quickFilter'),
      page: parseIntegerParam(searchParams.get('page'), 1),
      limit: parseIntegerParam(searchParams.get('limit'), 10),
    })

    return NextResponse.json({
      section: {
        id: 'export-activity',
        label: 'Export Activity',
        description:
          'Review export actions captured in the finance audit log for report generation and outbound accounting extracts.',
        searchPlaceholder: 'Search exported action, entity type, user, report, or metadata',
        filters: result.filterOptions,
        metrics: result.metrics.map((metric, index) => ({ id: `export-activity-metric-${index}`, ...metric })),
        table: {
          title: 'Export Audit Events',
          description:
            'Audit-log entries for exported actions so outbound accounting data access remains visible across finance workflows.',
          columns: ['Performed At', 'Entity Type', 'Entity ID', 'Action', 'Performed By', 'Metadata'],
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
