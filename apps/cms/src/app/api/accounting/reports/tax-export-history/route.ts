import { NextRequest, NextResponse } from 'next/server'
import { AccountingTaxExportHistoryService } from '@/accounting/services/reports/AccountingTaxExportHistoryService'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) return fallback; const p = Number(value); return Number.isFinite(p) ? p : fallback
}

const parseListParam = (searchParams: URLSearchParams, key: string): string[] =>
  Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const result = await AccountingTaxExportHistoryService.getExportHistory(payload, {
      search: searchParams.get('search') || '',
      categories: parseListParam(searchParams, 'category'),
      entityTypes: parseListParam(searchParams, 'entityType'),
      quickFilters: parseListParam(searchParams, 'quickFilter'),
      page: parseIntegerParam(searchParams.get('page'), 1),
      limit: parseIntegerParam(searchParams.get('limit'), 10),
    })

    return NextResponse.json({
      section: {
        id: 'tax-export-history',
        label: 'Tax Export History',
        description: 'Review export actions in audit history for tax summary downloads and tax-related outbound report activity.',
        searchPlaceholder: 'Search entity type, action, user, report, or export metadata',
        filters: result.filterOptions,
        metrics: result.metrics,
        table: {
          title: 'Export History',
          description: 'Audit logs of tax-related exports.',
          columns: ['Entity Type', 'Action', 'Performed By', 'Performed At'],
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
