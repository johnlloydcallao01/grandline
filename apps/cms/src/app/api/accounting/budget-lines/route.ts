import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => { if (!value) return fallback; const p = Number(value); return Number.isFinite(p) ? p : fallback }
const parseListParam = (searchParams: URLSearchParams, key: string): string[] => Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))
const normalizeText = (value?: string | null) => String(value || '').trim().toLowerCase()
const formatCurrency = (v: number | null | undefined) => { const n = v ?? 0; return `PHP ${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }
function getRelationLabel(rel: unknown): string { if (!rel) return '-'; if (typeof rel === 'object' && rel !== null) { const r = rel as Record<string, any>; return r.displayName || r.name || r.title || r.code || r.budgetCode || String(r.id || '') } return String(rel) }

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = normalizeText(searchParams.get('search'))
    const budgetIds = parseListParam(searchParams, 'budgetId')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [lineDocs, budgetDocs, accountDocs, periodDocs] = await Promise.all([
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.budgetLines, depth: 2, sort: '-createdAt' }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.budgets, depth: 0 }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts, depth: 0 }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.periods, depth: 0 }),
    ])

    const budgets = budgetDocs.map((b) => ({ id: String(b.id), label: `${b.budgetCode ? `${b.budgetCode} - ` : ''}${b.name || ''}`.trim() || `Budget ${b.id}` }))
    const accounts = accountDocs.filter((a: any) => a.isActive !== false).map((a) => ({ id: String(a.id), label: `${a.code ? `${a.code} - ` : ''}${a.name || ''}`.trim() || `Account ${a.id}`, code: a.code || '', name: a.name || '', normalBalance: a.normalBalance || 'debit' }))
    const periods = periodDocs.map((p) => ({ id: String(p.id), label: `P${p.periodNumber || ''} - ${p.name || p.code || ''}`, periodNumber: p.periodNumber || 0 }))

    const rows = lineDocs.map((doc) => {
      const budgetLabel = getRelationLabel(doc.budget)
      const accountLabel = getRelationLabel(doc.account)
      const accountCode = doc.account !== null && typeof doc.account === 'object' ? ((doc.account as any).code || '') : ''
      const accountName = doc.account !== null && typeof doc.account === 'object' ? ((doc.account as any).name || '') : ''
      const normalBalance = doc.account !== null && typeof doc.account === 'object' ? ((doc.account as any).normalBalance || 'debit') : 'debit'
      const lineType = normalBalance === 'credit' ? 'Revenue' : 'Expense'
      const periodLabel = getRelationLabel(doc.period)
      const plannedAmount = typeof doc.plannedAmount === 'number' ? doc.plannedAmount : 0

      return {
        id: String(doc.id), budgetId: doc.budget !== null && typeof doc.budget === 'object' ? String((doc.budget as any).id || '') : String(doc.budget || ''),
        budgetLabel, accountId: doc.account !== null && typeof doc.account === 'object' ? String((doc.account as any).id || '') : String(doc.account || ''),
        accountLabel, accountCode, accountName, lineType, normalBalance,
        periodId: doc.period !== null && typeof doc.period === 'object' ? String((doc.period as any).id || '') : String(doc.period || ''),
        periodLabel, plannedAmount, plannedAmountLabel: formatCurrency(plannedAmount),
        notes: doc.notes || '',
        searchableText: normalizeText([budgetLabel, accountCode, accountName, periodLabel, lineType, doc.notes].join(' ')),
        cells: [
          budgetLabel, accountCode, accountName, periodLabel,
          { text: formatCurrency(plannedAmount), align: 'right' },
          lineType,
        ],
      }
    })

    let filtered = rows
    if (search) { filtered = filtered.filter((r) => r.searchableText.includes(search)) }
    if (budgetIds.length > 0) { filtered = filtered.filter((r) => budgetIds.includes(r.budgetId)) }
    if (quickFilters.length > 0) { filtered = filtered.filter((r) => quickFilters.some((q) => { if (q === 'revenue') return r.lineType === 'Revenue'; if (q === 'expense') return r.lineType === 'Expense'; return false })) }

    const totalDocs = filtered.length; const tp = Math.max(1, Math.ceil(totalDocs / limit)); const cp = Math.min(page, tp); const pr = filtered.slice((cp - 1) * limit, cp * limit)
    const totalPlanned = rows.reduce((s, r) => s + r.plannedAmount, 0); const revenueCount = rows.filter((r) => r.lineType === 'Revenue').length

    return NextResponse.json({
      section: { id: 'budget-lines', label: 'Budget Lines', description: 'Review line-level planned values per budget using account, period, and planned amount.', searchPlaceholder: 'Search budget, account code, account name, period, or planned amount',
        filters: { quickFilters: [{ label: 'Revenue', value: 'revenue' }, { label: 'Expense', value: 'expense' }] },
        metrics: [
          { id: 'lines', label: 'Budget Lines', value: rows.length, change: 'Line-level planned entries across budgets', trend: 'up' as const },
          { id: 'planned', label: 'Total Planned', value: formatCurrency(totalPlanned), change: 'Aggregate planned amounts', trend: 'neutral' as const },
          { id: 'revenue', label: 'Revenue Lines', value: revenueCount, change: 'Lines mapped to revenue accounts', trend: 'up' as const },
          { id: 'expense', label: 'Expense Lines', value: rows.length - revenueCount, change: 'Lines mapped to expense accounts', trend: 'up' as const },
        ],
        table: { title: 'Budget Line Register', description: 'Line-level planned values aligned to accounting-budget-lines.', columns: ['Budget', 'Account Code', 'Account Name', 'Period', 'Planned Amount', 'Line Type'], rows: pr },
      },
      appliedFilters: { search, budgetIds, quickFilters },
      pagination: { page: cp, limit, totalDocs, totalPages: tp, hasPrevPage: cp > 1, hasNextPage: cp < tp },
      totals: { totalRows: rows.length, filteredRows: totalDocs, totalPlanned, revenueCount },
      referenceData: { budgets, accounts, periods },
    })
  } catch (e) { return handleAccountingApiError(e) }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = await request.json()
    if (!body?.budgetId || !body?.accountId) { return NextResponse.json({ error: 'Budget and account are required.' }, { status: 400 }) }
    const data = { budget: Number(body.budgetId), account: Number(body.accountId), plannedAmount: Number(body.plannedAmount) || 0, notes: body.notes || undefined, createdBy: user.id, updatedBy: user.id } as never
    if (body.periodId) { const n = Number(body.periodId); if (Number.isFinite(n)) (data as any).period = n }
    const created = await payload.create({ collection: ACCOUNTING_COLLECTION_SLUGS.budgetLines, depth: 2, overrideAccess: true, data })
    return NextResponse.json({ id: created.id, line: created }, { status: 201 })
  } catch (e) { return handleAccountingApiError(e) }
}
