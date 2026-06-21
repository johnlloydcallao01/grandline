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
    // #region debug-point A:finance-audit-log-entry
    void import('node:fs/promises').then(async (fs) => { let u = 'http://127.0.0.1:7777/event', s = 'accounting-500-errors'; try { const e = await fs.readFile('.dbg/accounting-500-errors.env', 'utf8'); u = e.match(/DEBUG_SERVER_URL=(.+)/)?.[1] || u; s = e.match(/DEBUG_SESSION_ID=(.+)/)?.[1] || s } catch { return undefined } return fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: s, runId: 'pre-fix', hypothesisId: 'A', location: 'finance-audit-log/route.ts', msg: '[DEBUG] finance-audit-log GET entry', data: { search: searchParams.get('search') || '', actionTypes: parseListParam(searchParams, 'actionType'), entityTypes: parseListParam(searchParams, 'entityType'), quickFilters: parseListParam(searchParams, 'quickFilter'), page: parseIntegerParam(searchParams.get('page'), 1), limit: parseIntegerParam(searchParams.get('limit'), 10) }, ts: Date.now() }) }).catch(() => undefined) })
    // #endregion

    const result = await AccountingFinanceAuditLogService.getFinanceAuditLog(payload, {
      search: searchParams.get('search') || '',
      actionTypes: parseListParam(searchParams, 'actionType'),
      entityTypes: parseListParam(searchParams, 'entityType'),
      quickFilters: parseListParam(searchParams, 'quickFilter'),
      page: parseIntegerParam(searchParams.get('page'), 1),
      limit: parseIntegerParam(searchParams.get('limit'), 10),
    })
    // #region debug-point B:finance-audit-log-success
    void import('node:fs/promises').then(async (fs) => { let u = 'http://127.0.0.1:7777/event', s = 'accounting-500-errors'; try { const e = await fs.readFile('.dbg/accounting-500-errors.env', 'utf8'); u = e.match(/DEBUG_SERVER_URL=(.+)/)?.[1] || u; s = e.match(/DEBUG_SESSION_ID=(.+)/)?.[1] || s } catch { return undefined } return fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: s, runId: 'pre-fix', hypothesisId: 'B', location: 'finance-audit-log/route.ts', msg: '[DEBUG] finance-audit-log GET success', data: { rowCount: result.rows.length, totalRows: result.totals.totalRows, filteredRows: result.totals.filteredRows }, ts: Date.now() }) }).catch(() => undefined) })
    // #endregion

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
    // #region debug-point C:finance-audit-log-error
    void import('node:fs/promises').then(async (fs) => { let u = 'http://127.0.0.1:7777/event', s = 'accounting-500-errors'; try { const e = await fs.readFile('.dbg/accounting-500-errors.env', 'utf8'); u = e.match(/DEBUG_SERVER_URL=(.+)/)?.[1] || u; s = e.match(/DEBUG_SESSION_ID=(.+)/)?.[1] || s } catch { return undefined } const candidate = error as { name?: string; message?: string; stack?: string; cause?: unknown }; return fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: s, runId: 'pre-fix', hypothesisId: 'C', location: 'finance-audit-log/route.ts', msg: '[DEBUG] finance-audit-log GET error', data: { name: candidate?.name || null, message: candidate?.message || String(error), stack: candidate?.stack || null, cause: candidate?.cause ? String(candidate.cause) : null }, ts: Date.now() }) }).catch(() => undefined) })
    // #endregion
    return handleAccountingApiError(error)
  }
}
