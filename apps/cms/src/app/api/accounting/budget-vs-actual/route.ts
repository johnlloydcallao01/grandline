import { NextRequest, NextResponse } from 'next/server'
import { AccountingBudgetService } from '@/accounting/services/budgets/AccountingBudgetService'
import { ACCOUNTING_COLLECTION_SLUGS, ACCOUNTING_BUDGET_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { normalizeAmount, roundCurrency } from '@/accounting/utils/amounts'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) return fallback; const p = Number(value); return Number.isFinite(p) ? p : fallback
}

const parseListParam = (searchParams: URLSearchParams, key: string): string[] =>
  Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))

const normalizeText = (value?: string | null) => String(value || '').trim().toLowerCase()
const formatCurrency = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)

const STATUS_TONE_MAP: Record<string, string> = { draft: 'gray', approved: 'green', locked: 'blue', archived: 'amber' }

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = normalizeText(searchParams.get('search'))
    const statuses = parseListParam(searchParams, 'status')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [allBudgets, allJournalLines] = await Promise.all([
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.budgets, depth: 1 }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.journalEntryLines, depth: 2 }),
    ])

    const getNaturalSigned = (line: any) => {
      const nb = String(line?.account?.normalBalance || 'debit')
      const d = normalizeAmount(line?.debit)
      const c = normalizeAmount(line?.credit)
      return nb === 'credit' ? roundCurrency(c - d) : roundCurrency(d - c)
    }

    const budgetRows = await Promise.all(
      allBudgets.map(async (budget) => {
        const budgetLines = await AccountingBudgetService.getBudgetLines(payload, budget.id)
        const fiscalYearId = getRelationshipId(budget.fiscalYear)
        let totalPlanned = 0
        let totalActual = 0

        for (const line of budgetLines) {
          const accountId = getRelationshipId(line.account)
          const periodId = getRelationshipId(line.period)
          totalPlanned += normalizeAmount(line.plannedAmount)

          totalActual += roundCurrency(
            allJournalLines.reduce((sum, jl) => {
              const jlAccountId = getRelationshipId(jl.account)
              const je = jl.journalEntry
              const jeFiscalYearId = getRelationshipId(je?.fiscalYear)
              const jePeriodId = getRelationshipId(je?.period)
              const posted = String(je?.status || '') === 'posted'

              if (!posted || String(jlAccountId || '') !== String(accountId || '')) return sum
              if (fiscalYearId && String(jeFiscalYearId || '') !== String(fiscalYearId)) return sum
              if (periodId && String(jePeriodId || '') !== String(periodId)) return sum
              return roundCurrency(sum + getNaturalSigned(jl))
            }, 0),
          )
        }

        const variance = roundCurrency(totalActual - totalPlanned)
        const scope = budget.budgetType || 'annual'
        const scopeLabel = String(scope).charAt(0).toUpperCase() + String(scope).slice(1).replace('_', ' ')
        const status = budget.status || 'draft'
        const statusLabel = ACCOUNTING_BUDGET_STATUS_OPTIONS.find((o) => o.value === status)?.label || status
        const overBudget = variance < 0
        const varianceStatus = overBudget ? 'Over Budget' : totalActual === 0 ? 'No Activity' : 'Within Budget'
        const varianceTone = overBudget ? 'amber' : totalActual === 0 ? 'gray' : 'green'

        return {
          id: `budget-${budget.id}`,
          budgetId: budget.id,
          budgetCode: budget.budgetCode || '-',
          budgetName: budget.name || '-',
          scope: scopeLabel,
          budgetAmount: totalPlanned,
          actualAmount: totalActual,
          varianceAmount: variance,
          status,
          statusLabel,
          statusTone: STATUS_TONE_MAP[status] || 'gray',
          varianceStatus,
          varianceTone,
          searchableText: normalizeText([budget.budgetCode, budget.name, scopeLabel, statusLabel, formatCurrency(totalPlanned), formatCurrency(totalActual)].join(' ')),
          cells: [
            { text: budget.budgetCode || '-', emphasis: true },
            scopeLabel,
            { text: formatCurrency(totalPlanned), align: 'right' },
            { text: formatCurrency(totalActual), align: 'right' },
            { text: formatCurrency(variance), align: 'right' },
            { text: varianceStatus, tone: varianceTone },
          ],
        }
      }),
    )

    let filtered = budgetRows
    if (search) { filtered = filtered.filter((r) => r.searchableText.includes(search)) }
    if (statuses.length > 0) { filtered = filtered.filter((r) => statuses.includes(r.status)) }
    if (quickFilters.length > 0) {
      filtered = filtered.filter((r) => quickFilters.some((qf) => {
        const [prefix, value] = qf.split(':')
        if (prefix === 'status') return r.status === value
        if (prefix === 'variance') return value === 'negative' ? r.varianceAmount < 0 : r.varianceAmount >= 0
        return false
      }))
    }

    const totalDocs = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filtered.slice((currentPage - 1) * limit, currentPage * limit)

    const allPlanned = budgetRows.reduce((s, r) => s + r.budgetAmount, 0)
    const allActual = budgetRows.reduce((s, r) => s + r.actualAmount, 0)
    const allVariance = budgetRows.reduce((s, r) => s + r.varianceAmount, 0)

    return NextResponse.json({
      section: {
        id: 'budget-vs-actual',
        label: 'Budget vs Actual',
        description: 'Review budget-variance output backed by accounting budgets and the budget-variance service.',
        searchPlaceholder: 'Search budget code, branch, department, project, budget amount, or variance',
        filters: {
          statuses: ACCOUNTING_BUDGET_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
          quickFilters: [
            { label: 'Approved', value: 'status:approved' },
            { label: 'Within Budget', value: 'variance:positive' },
            { label: 'Over Budget', value: 'variance:negative' },
          ],
        },
        metrics: [
          { id: 'budgets-in-scope', label: 'Budgets In Scope', value: budgetRows.length, change: 'Budget records available for variance review', trend: 'up' as const },
          { id: 'budget-amount', label: 'Budget Amount', value: formatCurrency(allPlanned), change: 'Configured budget amount across selected budgets', trend: 'up' as const },
          { id: 'actual-spend', label: 'Actual Spend', value: formatCurrency(allActual), change: 'Actuals measured by variance service', trend: 'up' as const },
          { id: 'variance', label: 'Variance', value: formatCurrency(allVariance), change: 'Remaining amount against active budgets', trend: allVariance >= 0 ? 'neutral' as const : 'down' as const },
        ],
        table: {
          title: 'Budget vs Actual Analysis',
          description: 'Budget variance view aligned to accounting budgets and the budget-variance service in apps/cms.',
          columns: ['Budget Code', 'Scope', 'Budget Amount', 'Actual Amount', 'Variance', 'Status'],
          rows: paginatedRows,
        },
      },
      appliedFilters: { search, statuses, quickFilters },
      pagination: { page: currentPage, limit, totalDocs, totalPages, hasPrevPage: currentPage > 1, hasNextPage: currentPage < totalPages },
      totals: { totalRows: budgetRows.length, filteredRows: totalDocs, totalPlanned: allPlanned, totalActual: allActual, totalVariance: allVariance },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
