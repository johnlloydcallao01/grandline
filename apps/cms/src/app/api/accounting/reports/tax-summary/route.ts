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
    // #region debug-point A:tax-summary-entry
    void import('node:fs/promises').then(async (fs) => { let u = 'http://127.0.0.1:7777/event', s = 'accounting-500-errors'; try { const e = await fs.readFile('.dbg/accounting-500-errors.env', 'utf8'); u = e.match(/DEBUG_SERVER_URL=(.+)/)?.[1] || u; s = e.match(/DEBUG_SESSION_ID=(.+)/)?.[1] || s } catch { return undefined } return fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: s, runId: 'pre-fix', hypothesisId: 'A', location: 'tax-summary/route.ts', msg: '[DEBUG] tax-summary GET entry', data: { search: searchParams.get('search') || '', scopes: parseListParam(searchParams, 'scope'), calculationMethods: parseListParam(searchParams, 'calculationMethod'), quickFilters: parseListParam(searchParams, 'quickFilter'), page: parseIntegerParam(searchParams.get('page'), 1), limit: parseIntegerParam(searchParams.get('limit'), 10) }, ts: Date.now() }) }).catch(() => undefined) })
    // #endregion

    const result = await AccountingTaxReportService.getTaxSummary(payload, {
      search: searchParams.get('search') || '',
      scopes: parseListParam(searchParams, 'scope'),
      calculationMethods: parseListParam(searchParams, 'calculationMethod'),
      quickFilters: parseListParam(searchParams, 'quickFilter'),
      page: parseIntegerParam(searchParams.get('page'), 1),
      limit: parseIntegerParam(searchParams.get('limit'), 10),
    })
    // #region debug-point B:tax-summary-success
    void import('node:fs/promises').then(async (fs) => { let u = 'http://127.0.0.1:7777/event', s = 'accounting-500-errors'; try { const e = await fs.readFile('.dbg/accounting-500-errors.env', 'utf8'); u = e.match(/DEBUG_SERVER_URL=(.+)/)?.[1] || u; s = e.match(/DEBUG_SESSION_ID=(.+)/)?.[1] || s } catch { return undefined } return fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: s, runId: 'pre-fix', hypothesisId: 'B', location: 'tax-summary/route.ts', msg: '[DEBUG] tax-summary GET success', data: { rowCount: result.rows.length, totalRows: result.totals.totalRows, totalTaxable: result.totals.totalTaxable, totalTax: result.totals.totalTax }, ts: Date.now() }) }).catch(() => undefined) })
    // #endregion

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
    // #region debug-point C:tax-summary-error
    void import('node:fs/promises').then(async (fs) => { let u = 'http://127.0.0.1:7777/event', s = 'accounting-500-errors'; try { const e = await fs.readFile('.dbg/accounting-500-errors.env', 'utf8'); u = e.match(/DEBUG_SERVER_URL=(.+)/)?.[1] || u; s = e.match(/DEBUG_SESSION_ID=(.+)/)?.[1] || s } catch { return undefined } const candidate = error as { name?: string; message?: string; stack?: string; cause?: unknown }; return fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: s, runId: 'pre-fix', hypothesisId: 'C', location: 'tax-summary/route.ts', msg: '[DEBUG] tax-summary GET error', data: { name: candidate?.name || null, message: candidate?.message || String(error), stack: candidate?.stack || null, cause: candidate?.cause ? String(candidate.cause) : null }, ts: Date.now() }) }).catch(() => undefined) })
    // #endregion
    return handleAccountingApiError(error)
  }
}
