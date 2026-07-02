import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, ACCOUNTING_PROJECT_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { normalizeAmount, roundCurrency } from '@/accounting/utils/amounts'
import { AccountingTimeTrackingService } from '@/accounting/services/time/AccountingTimeTrackingService'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) return fallback; const p = Number(value); return Number.isFinite(p) ? p : fallback
}

const parseListParam = (searchParams: URLSearchParams, key: string): string[] =>
  Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))

const normalizeText = (value?: string | null) => String(value || '').trim().toLowerCase()
const formatCurrency = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = normalizeText(searchParams.get('search'))
    const statuses = parseListParam(searchParams, 'status')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [allProjects, allInvoices, allExpenses, allPayrollEntries, allTimeEntries, allBudgets] = await Promise.all([
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.projects, depth: 1 }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.invoices, depth: 0 }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.expenses, depth: 0 }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.payrollEntries, depth: 0 }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.timeEntries, depth: 0 }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.budgets, depth: 0 }),
    ])

    const rows = allProjects.map((project) => {
      const pid = String(project.id)

      const pInvoices = allInvoices.filter((i) => String(i.project || '') === pid && ['posted', 'partially_paid', 'paid'].includes(i.status))
      const pExpenses = allExpenses.filter((e) => String(e.project || '') === pid && e.status === 'posted')
      const pPayroll = allPayrollEntries.filter((pe) => String(pe.project || '') === pid && ['approved', 'posted'].includes(pe.status))
      const pTime = allTimeEntries.filter((te) => String(te.project || '') === pid && ['approved', 'posted'].includes(te.status))
      const pBudgets = allBudgets.filter((b) => String(b.project || '') === pid)

      const revenue = roundCurrency(pInvoices.reduce((s, i) => s + normalizeAmount(i.total), 0))
      const expenseCost = roundCurrency(pExpenses.reduce((s, e) => s + normalizeAmount(e.total), 0))
      const payrollCost = roundCurrency(pPayroll.reduce((s, pe) => s + normalizeAmount(pe.netAmount), 0))

      const timeSummary = pTime.reduce((s, te) => {
        const f = AccountingTimeTrackingService.getEntryFinancials(te)
        return { hours: s.hours + f.decimalHours, cost: s.cost + f.costAmount }
      }, { hours: 0, cost: 0 })

      const budgetAmount = roundCurrency(pBudgets.reduce((s, b) => s + normalizeAmount(b.budgetAmount), 0) + normalizeAmount(project.budgetAmount || 0))
      const totalCost = roundCurrency(expenseCost + payrollCost + timeSummary.cost)
      const grossProfit = roundCurrency(revenue - totalCost)
      const grossMarginPercent = revenue > 0 ? roundCurrency((grossProfit / revenue) * 100) : 0
      const profitable = grossProfit >= 0
      const varianceStatus = profitable ? 'Profitable' : 'Negative Margin'
      const status = project.status || 'draft'
      const statusLabel = ACCOUNTING_PROJECT_STATUS_OPTIONS.find((o) => o.value === status)?.label || status

      return {
        id: `proj-${project.id}`,
        projectId: project.id,
        projectCode: project.projectCode || '-',
        projectName: project.name || '-',
        status,
        statusLabel,
        revenue,
        totalCost,
        grossProfit,
        grossMarginPercent,
        profitable,
        varianceStatus,
        budgetAmount,
        searchableText: normalizeText([project.projectCode, project.name, statusLabel, formatCurrency(revenue), formatCurrency(totalCost), varianceStatus].join(' ')),
        cells: [
          { text: project.projectCode || '-', emphasis: true },
          project.name || '-',
          { text: formatCurrency(revenue), align: 'right' },
          { text: formatCurrency(totalCost), align: 'right' },
          { text: formatCurrency(grossProfit), align: 'right' },
          { text: varianceStatus, tone: profitable ? 'green' : 'amber' },
        ],
      }
    })

    let filtered = rows
    if (search) { filtered = filtered.filter((r) => r.searchableText.includes(search)) }
    if (statuses.length > 0) { filtered = filtered.filter((r) => statuses.includes(r.status)) }
    if (quickFilters.length > 0) {
      filtered = filtered.filter((r) => quickFilters.some((qf) => {
        const [prefix, value] = qf.split(':')
        if (prefix === 'status') return r.status === value
        if (prefix === 'margin') return value === 'positive' ? r.profitable : !r.profitable
        return false
      }))
    }

    const totalDocs = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filtered.slice((currentPage - 1) * limit, currentPage * limit)

    const allRevenue = rows.reduce((s, r) => s + r.revenue, 0)
    const allCost = rows.reduce((s, r) => s + r.totalCost, 0)
    const allProfit = rows.reduce((s, r) => s + r.grossProfit, 0)

    return NextResponse.json({
      section: {
        id: 'project-profitability',
        label: 'Project Profitability',
        description: 'Review project profitability output using project revenue, expenses, payroll cost, time cost, and gross margin.',
        searchPlaceholder: 'Search project code, project name, status, revenue, cost, or margin',
        filters: {
          statuses: ACCOUNTING_PROJECT_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
          quickFilters: [
            { label: 'Active', value: 'status:active' },
            { label: 'Positive Margin', value: 'margin:positive' },
            { label: 'Negative Margin', value: 'margin:negative' },
          ],
        },
        metrics: [
          { id: 'projects-in-scope', label: 'Projects In Scope', value: rows.length, change: 'Projects with profitability data available', trend: 'up' as const },
          { id: 'revenue', label: 'Revenue', value: formatCurrency(allRevenue), change: 'Posted invoice revenue linked to projects', trend: 'up' as const },
          { id: 'total-cost', label: 'Total Cost', value: formatCurrency(allCost), change: 'Expense, payroll, and time cost combined', trend: 'up' as const },
          { id: 'gross-profit', label: 'Gross Profit', value: formatCurrency(allProfit), change: 'Profitability service output', trend: 'neutral' as const },
        ],
        table: {
          title: 'Project Profitability Analysis',
          description: 'Profitability view aligned to project, invoice, expense, payroll-entry, time-entry, and budget support in apps/cms.',
          columns: ['Project Code', 'Project Name', 'Revenue', 'Total Cost', 'Gross Profit', 'Status'],
          rows: paginatedRows,
        },
      },
      appliedFilters: { search, statuses, quickFilters },
      pagination: { page: currentPage, limit, totalDocs, totalPages, hasPrevPage: currentPage > 1, hasNextPage: currentPage < totalPages },
      totals: { totalRows: rows.length, filteredRows: totalDocs, totalRevenue: allRevenue, totalCost: allCost, totalGrossProfit: allProfit },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
