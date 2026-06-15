import { NextRequest, NextResponse } from 'next/server'
import { AccountingTaxAuditHistoryService } from '@/accounting/services/reports/AccountingTaxAuditHistoryService'
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

    const result = await AccountingTaxAuditHistoryService.getAuditHistory(payload, {
      search: searchParams.get('search') || '',
      actionTypes: parseListParam(searchParams, 'actionType'),
      sources: parseListParam(searchParams, 'source'),
      quickFilters: parseListParam(searchParams, 'quickFilter'),
      page: parseIntegerParam(searchParams.get('page'), 1),
      limit: parseIntegerParam(searchParams.get('limit'), 10),
    })

    return NextResponse.json({
      section: {
        id: 'tax-audit-history',
        label: 'Tax Audit History',
        description: 'Review audit history for tax-code changes, tax-summary exports, and tax-related compliance activity.',
        searchPlaceholder: 'Search tax code, action, user, reason, or exported report',
        filters: result.filterOptions,
        metrics: result.metrics.map((metric, index) => ({ id: `tax-audit-metric-${index}`, ...metric })),
        table: {
          title: 'Tax Audit Trail',
          description: 'Chronological tax-governance history from tax-code records and tax export audit entries.',
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
