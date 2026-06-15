import { NextRequest, NextResponse } from 'next/server'
import { AccountingFinanceAuditLogService } from '@/accounting/services/reports/AccountingFinanceAuditLogService'
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

    const result = await AccountingFinanceAuditLogService.getFinanceAuditLog(payload, {
      search: searchParams.get('search') || '',
      actionTypes: parseListParam(searchParams, 'actionType'),
      entityTypes: parseListParam(searchParams, 'entityType'),
      quickFilters: parseListParam(searchParams, 'quickFilter'),
      page: parseIntegerParam(searchParams.get('page'), 1),
      limit: parseIntegerParam(searchParams.get('limit'), 10),
    })

    return NextResponse.json({
      section: {
        id: 'finance-audit-log',
        label: 'Finance Audit Log',
        description:
          'Review finance audit events captured with entity type, entity id, action type, performer, timestamps, and payload visibility.',
        searchPlaceholder: 'Search entity type, entity id, action, user, reason, or metadata',
        filters: result.filterOptions,
        metrics: result.metrics.map((metric, index) => ({ id: `finance-audit-metric-${index}`, ...metric })),
        table: {
          title: 'Finance Audit Trail',
          description:
            'Dedicated finance audit-log entries with entity references, action history, performers, timestamps, and audit context.',
          columns: ['Performed At', 'Entity Type', 'Entity ID', 'Action', 'Performed By', 'Reason'],
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
