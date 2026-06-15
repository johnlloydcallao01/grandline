import { NextRequest, NextResponse } from 'next/server'
import { AccountingTaxReportService } from '@/accounting/services/reports/AccountingTaxReportService'
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

    const result = await AccountingTaxReportService.getTaxSummary(payload, {
      search: searchParams.get('search') || '',
      scopes: parseListParam(searchParams, 'scope'),
      calculationMethods: parseListParam(searchParams, 'calculationMethod'),
      quickFilters: parseListParam(searchParams, 'quickFilter'),
      page: parseIntegerParam(searchParams.get('page'), 1),
      limit: parseIntegerParam(searchParams.get('limit'), 10),
    })

    return NextResponse.json({
      section: {
        id: 'tax-summary-report',
        label: 'Tax Summary Report',
        description: 'Review backend-generated tax summary rows aggregated from posted invoices, posted bills, and posted expenses.',
        searchPlaceholder: 'Search tax code, tax scope, or method',
        filters: result.filterOptions,
        metrics: result.metrics,
        table: {
          title: 'Backend Tax Summary Report',
          description: 'Report rows from the tax-summary API grouped by tax code, scope, and calculation method.',
          columns: ['Tax Code', 'Tax Name', 'Scope', 'Method', { label: 'Taxable Amount', align: 'right' }, { label: 'Tax Amount', align: 'right' }],
          rows: result.rows.map((r) => ({
            id: r.id,
            taxCode: r.taxCode,
            taxName: r.taxName,
            taxScope: r.taxScope,
            calculationMethod: r.calculationMethod,
            taxableAmount: r.taxableAmount,
            taxAmount: r.taxAmount,
            cells: r.cells,
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
