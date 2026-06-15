import { NextRequest, NextResponse } from 'next/server'
import { AccountingTaxUsageRegisterService } from '@/accounting/services/tax-codes/AccountingTaxUsageRegisterService'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) return fallback; const p = Number(value); return Number.isFinite(p) ? p : fallback
}

const parseListParam = (searchParams: URLSearchParams, key: string): string[] =>
  Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    
    const result = await AccountingTaxUsageRegisterService.getTaxUsageRegister(payload, {
      search: searchParams.get('search') || '',
      sourceTypes: parseListParam(searchParams, 'sourceType'),
      quickFilters: parseListParam(searchParams, 'quickFilter'),
      page: parseIntegerParam(searchParams.get('page'), 1),
      limit: parseIntegerParam(searchParams.get('limit'), 10),
    })
    
    return NextResponse.json({
      section: {
        id: 'tax-usage',
        label: 'Tax Usage',
        description: 'Review usages of tax codes across invoices, bills, expenses, and journals in a read-only reporting register.',
        searchPlaceholder: 'Search document no., tax code, scope, or source type',
        filters: result.filterOptions,
        metrics: result.metrics,
        table: {
          title: 'Tax Usage Register View',
          description: 'A read-only register showing tax applied across various accounting documents.',
          columns: ['Source Type', 'Document No.', 'Tax Code', 'Tax Scope', { label: 'Taxable Amount', align: 'right' }, { label: 'Tax Amount', align: 'right' }],
          rows: result.rows.map((r) => ({
            id: r.id,
            sourceType: r.sourceType,
            document: r.document,
            taxCode: r.taxCode,
            taxScope: r.taxScope,
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
