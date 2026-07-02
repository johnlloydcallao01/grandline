import { NextRequest, NextResponse } from 'next/server'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) return fallback; const p = Number(value); return Number.isFinite(p) ? p : fallback
}

const parseListParam = (searchParams: URLSearchParams, key: string): string[] =>
  Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))

const normalizeText = (value?: string | null) => String(value || '').trim().toLowerCase()

type CatalogEntry = {
  reportName: string
  source: 'route' | 'service'
  scope: string
  path: string
  primaryData: string
  status: string
  statusTone: string
  searchableText: string
}

const CATALOG: CatalogEntry[] = [
  { reportName: 'Dashboard Summary', source: 'route', scope: 'overview', path: '/api/accounting/reports/dashboard', primaryData: 'invoices, bills, payments, bank accounts', status: 'Exposed', statusTone: 'green', searchableText: '' },
  { reportName: 'Invoice Register', source: 'route', scope: 'register', path: '/api/accounting/reports/invoice-register', primaryData: 'invoices', status: 'Exposed', statusTone: 'green', searchableText: '' },
  { reportName: 'Bill Register', source: 'route', scope: 'register', path: '/api/accounting/reports/bill-register', primaryData: 'bills', status: 'Exposed', statusTone: 'green', searchableText: '' },
  { reportName: 'Payments Received Register', source: 'route', scope: 'register', path: '/api/accounting/reports/payments-received-register', primaryData: 'payments received', status: 'Exposed', statusTone: 'green', searchableText: '' },
  { reportName: 'Payments Made Register', source: 'route', scope: 'register', path: '/api/accounting/reports/payments-made-register', primaryData: 'payments made', status: 'Exposed', statusTone: 'green', searchableText: '' },
  { reportName: 'Expense Register', source: 'route', scope: 'register', path: '/api/accounting/reports/expense-register', primaryData: 'expenses', status: 'Exposed', statusTone: 'green', searchableText: '' },
  { reportName: 'AR Aging', source: 'route', scope: 'aging', path: '/api/accounting/reports/ar-aging', primaryData: 'invoices', status: 'Exposed', statusTone: 'green', searchableText: '' },
  { reportName: 'AP Aging', source: 'route', scope: 'aging', path: '/api/accounting/reports/ap-aging', primaryData: 'bills', status: 'Exposed', statusTone: 'green', searchableText: '' },
  { reportName: 'Cash Activity', source: 'route', scope: 'snapshot', path: '/api/accounting/reports/cash-activity', primaryData: 'payments, deposits, transfers', status: 'Exposed', statusTone: 'green', searchableText: '' },
  { reportName: 'Tax Summary', source: 'route', scope: 'snapshot', path: '/api/accounting/reports/tax-summary', primaryData: 'invoice lines, bill lines, expenses', status: 'Exposed', statusTone: 'green', searchableText: '' },
  { reportName: 'Tax Export History', source: 'route', scope: 'history', path: '/api/accounting/reports/tax-export-history', primaryData: 'tax export records', status: 'Exposed', statusTone: 'green', searchableText: '' },
  { reportName: 'Asset Register', source: 'route', scope: 'register', path: '/api/accounting/reports/asset-register', primaryData: 'fixed assets', status: 'Exposed', statusTone: 'green', searchableText: '' },
  { reportName: 'Trial Balance', source: 'route', scope: 'ledger', path: '/api/accounting/trial-balance', primaryData: 'journal entry lines', status: 'Exposed', statusTone: 'green', searchableText: '' },
  { reportName: 'General Ledger', source: 'route', scope: 'ledger', path: '/api/accounting/general-ledger', primaryData: 'journal entry lines', status: 'Exposed', statusTone: 'green', searchableText: '' },
  { reportName: 'Journal Register', source: 'route', scope: 'register', path: '/api/accounting/journal-register', primaryData: 'journal entries', status: 'Exposed', statusTone: 'green', searchableText: '' },
  { reportName: 'Budget vs Actual', source: 'route', scope: 'analytics', path: '/api/accounting/budget-vs-actual', primaryData: 'budgets, journal lines', status: 'Exposed', statusTone: 'green', searchableText: '' },
  { reportName: 'Project Profitability', source: 'route', scope: 'analytics', path: '/api/accounting/project-profitability', primaryData: 'projects, invoices, expenses', status: 'Exposed', statusTone: 'green', searchableText: '' },
  { reportName: 'Sales Reports', source: 'route', scope: 'analytics', path: '/api/accounting/sales-reports', primaryData: 'invoices, payments received', status: 'Exposed', statusTone: 'green', searchableText: '' },
  { reportName: 'Purchase Reports', source: 'route', scope: 'analytics', path: '/api/accounting/purchase-reports', primaryData: 'bills, payments made', status: 'Exposed', statusTone: 'green', searchableText: '' },
  { reportName: 'Expense Reports', source: 'route', scope: 'analytics', path: '/api/accounting/expense-reports', primaryData: 'expenses', status: 'Exposed', statusTone: 'green', searchableText: '' },
  { reportName: 'Cash, Tax & Aging', source: 'route', scope: 'snapshot', path: '/api/accounting/cash-tax-aging', primaryData: 'cash, tax, AR/AP aging', status: 'Exposed', statusTone: 'green', searchableText: '' },
  { reportName: 'Dashboard Summary (Rich)', source: 'route', scope: 'overview', path: '/api/accounting/dashboard-summary', primaryData: 'dashboard register', status: 'Exposed', statusTone: 'green', searchableText: '' },
  { reportName: 'Asset Register (Rich)', source: 'route', scope: 'register', path: '/api/accounting/asset-register', primaryData: 'fixed assets register', status: 'Exposed', statusTone: 'green', searchableText: '' },
  { reportName: 'Tax Code Governance', source: 'route', scope: 'compliance', path: '/api/accounting/compliance-controls/tax-code-governance', primaryData: 'tax codes', status: 'Exposed', statusTone: 'green', searchableText: '' },
  { reportName: 'Tax Audit History', source: 'route', scope: 'compliance', path: '/api/accounting/compliance-controls/tax-audit-history', primaryData: 'audit records', status: 'Exposed', statusTone: 'green', searchableText: '' },
  { reportName: 'Accounts Receivable Aging (Rich)', source: 'route', scope: 'aging', path: '/api/accounting/sales-receivables/accounts-receivable-aging', primaryData: 'invoices', status: 'Exposed', statusTone: 'green', searchableText: '' },
  { reportName: 'Overdue Invoices', source: 'route', scope: 'aging', path: '/api/accounting/sales-receivables/overdue-invoices', primaryData: 'invoices', status: 'Exposed', statusTone: 'green', searchableText: '' },
  { reportName: 'Payments Received (CRUD)', source: 'route', scope: 'register', path: '/api/accounting/sales-receivables/payments-received', primaryData: 'payments received', status: 'Exposed', statusTone: 'green', searchableText: '' },
  { reportName: 'Customer Balances', source: 'route', scope: 'register', path: '/api/accounting/sales-receivables/customer-balances', primaryData: 'customers, invoices', status: 'Exposed', statusTone: 'green', searchableText: '' },
  { reportName: 'Official Receipts', source: 'route', scope: 'register', path: '/api/accounting/sales-receivables/official-receipts', primaryData: 'receipts', status: 'Exposed', statusTone: 'green', searchableText: '' },

  { reportName: 'Sales Report Service', source: 'service', scope: 'register', path: 'AccountingSalesReportService', primaryData: 'invoices, payments received', status: 'Service Ready', statusTone: 'blue', searchableText: '' },
  { reportName: 'Expense Report Service', source: 'service', scope: 'register', path: 'AccountingExpenseReportService', primaryData: 'bills, payments made, expenses', status: 'Service Ready', statusTone: 'blue', searchableText: '' },
  { reportName: 'Cash Report Service', source: 'service', scope: 'snapshot', path: 'AccountingCashReportService', primaryData: 'payments, deposits, transfers', status: 'Service Ready', statusTone: 'blue', searchableText: '' },
  { reportName: 'Tax Report Service', source: 'service', scope: 'snapshot', path: 'AccountingTaxReportService', primaryData: 'invoice lines, bill lines, expenses', status: 'Service Ready', statusTone: 'blue', searchableText: '' },
  { reportName: 'Aging Report Service', source: 'service', scope: 'aging', path: 'AccountingAgingReportService', primaryData: 'invoices, bills', status: 'Service Ready', statusTone: 'blue', searchableText: '' },
  { reportName: 'Dashboard Service', source: 'service', scope: 'overview', path: 'AccountingDashboardService', primaryData: 'invoices, bills, payments, bank accounts', status: 'Service Ready', statusTone: 'blue', searchableText: '' },
  { reportName: 'Ledger Report Service', source: 'service', scope: 'ledger', path: 'AccountingLedgerReportService', primaryData: 'journal entry lines', status: 'Service Ready', statusTone: 'blue', searchableText: '' },
  { reportName: 'Trial Balance Service', source: 'service', scope: 'ledger', path: 'AccountingTrialBalanceService', primaryData: 'journal entry lines', status: 'Service Ready', statusTone: 'blue', searchableText: '' },
  { reportName: 'Budget Variance Service', source: 'service', scope: 'analytics', path: 'AccountingBudgetVarianceService', primaryData: 'budgets, journal lines', status: 'Service Ready', statusTone: 'blue', searchableText: '' },
  { reportName: 'Project Profitability Service', source: 'service', scope: 'analytics', path: 'AccountingProjectProfitabilityService', primaryData: 'projects, invoices, expenses', status: 'Service Ready', statusTone: 'blue', searchableText: '' },
  { reportName: 'Asset Register Service', source: 'service', scope: 'register', path: 'AccountingAssetRegisterService', primaryData: 'fixed assets', status: 'Service Ready', statusTone: 'blue', searchableText: '' },
  { reportName: 'Tax Code Governance Service', source: 'service', scope: 'compliance', path: 'AccountingTaxCodeGovernanceService', primaryData: 'tax codes', status: 'Service Ready', statusTone: 'blue', searchableText: '' },
  { reportName: 'Tax Audit History Service', source: 'service', scope: 'compliance', path: 'AccountingTaxAuditHistoryService', primaryData: 'audit records', status: 'Service Ready', statusTone: 'blue', searchableText: '' },
  { reportName: 'Tax Export History Service', source: 'service', scope: 'history', path: 'AccountingTaxExportHistoryService', primaryData: 'tax export records', status: 'Service Ready', statusTone: 'blue', searchableText: '' },
  { reportName: 'LMS Dashboard Service', source: 'service', scope: 'analytics', path: 'AccountingLmsDashboardService', primaryData: 'enrollments, revenue', status: 'Service Ready', statusTone: 'blue', searchableText: '' },
  { reportName: 'Payroll Posting Report Service', source: 'service', scope: 'register', path: 'AccountingPayrollPostingReportService', primaryData: 'payroll entries', status: 'Service Ready', statusTone: 'blue', searchableText: '' },
  { reportName: 'Entity History Service', source: 'service', scope: 'history', path: 'AccountingEntityHistoryService', primaryData: 'audit records', status: 'Service Ready', statusTone: 'blue', searchableText: '' },
  { reportName: 'Before/After History Service', source: 'service', scope: 'history', path: 'AccountingBeforeAfterHistoryService', primaryData: 'audit snapshots', status: 'Service Ready', statusTone: 'blue', searchableText: '' },
  { reportName: 'Finance Audit Log Service', source: 'service', scope: 'history', path: 'AccountingFinanceAuditLogService', primaryData: 'audit logs', status: 'Service Ready', statusTone: 'blue', searchableText: '' },
  { reportName: 'Export Activity Service', source: 'service', scope: 'history', path: 'AccountingExportActivityService', primaryData: 'export records', status: 'Service Ready', statusTone: 'blue', searchableText: '' },
]

CATALOG.forEach((e) => {
  e.searchableText = normalizeText([e.reportName, e.source, e.scope, e.path, e.primaryData, e.status].join(' '))
})

export async function GET(request: NextRequest) {
  try {
    await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = normalizeText(searchParams.get('search'))
    const sources = parseListParam(searchParams, 'source')
    const scopes = parseListParam(searchParams, 'scope')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    let filtered = CATALOG
    if (search) { filtered = filtered.filter((e) => e.searchableText.includes(search)) }
    if (sources.length > 0) { filtered = filtered.filter((e) => sources.includes(e.source)) }
    if (scopes.length > 0) { filtered = filtered.filter((e) => scopes.includes(e.scope)) }
    if (quickFilters.length > 0) {
      filtered = filtered.filter((e) => quickFilters.some((qf) => {
        const [prefix, value] = qf.split(':')
        if (prefix === 'source') return e.source === value
        if (prefix === 'scope') return e.scope === value
        return false
      }))
    }

    const totalDocs = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filtered.slice((currentPage - 1) * limit, currentPage * limit)

    const routeCount = CATALOG.filter((e) => e.source === 'route').length
    const serviceCount = CATALOG.filter((e) => e.source === 'service').length
    const registerCount = CATALOG.filter((e) => e.scope === 'register').length
    const analyticsCount = CATALOG.filter((e) => e.scope === 'analytics' || e.scope === 'ledger').length

    return NextResponse.json({
      section: {
        id: 'report-catalog',
        label: 'Report Catalog',
        description: 'Review the report set currently exposed through accounting report endpoints and supporting report services.',
        searchPlaceholder: 'Search report name, endpoint, data source, or output type',
        filters: {
          sources: [
            { label: 'Exposed Endpoints', value: 'route' },
            { label: 'Services', value: 'service' },
          ],
          scopes: [
            { label: 'Register', value: 'register' },
            { label: 'Ledger', value: 'ledger' },
            { label: 'Snapshot', value: 'snapshot' },
            { label: 'Analytics', value: 'analytics' },
            { label: 'Aging', value: 'aging' },
            { label: 'Overview', value: 'overview' },
            { label: 'Compliance', value: 'compliance' },
            { label: 'History', value: 'history' },
          ],
          quickFilters: [
            { label: 'Exposed Endpoints', value: 'source:route' },
            { label: 'Service Ready', value: 'source:service' },
            { label: 'Registers', value: 'scope:register' },
            { label: 'Analytics', value: 'scope:analytics' },
          ],
        },
        metrics: [
          { id: 'exposed-routes', label: 'Exposed Routes', value: routeCount, change: 'HTTP endpoints across accounting reports', trend: 'up' as const },
          { id: 'register-reports', label: 'Registers', value: registerCount, change: 'Invoice, bill, expense, payment, and asset registers', trend: 'up' as const },
          { id: 'analytics-reports', label: 'Analytics & Ledger', value: analyticsCount, change: 'Dashboard, tax, budget, and ledger reports', trend: 'up' as const },
          { id: 'service-reports', label: 'Services', value: serviceCount, change: 'Report service classes ready for use', trend: 'up' as const },
        ],
        table: {
          title: 'Accounting Report Catalog',
          description: 'Catalog view aligned to the current report endpoints plus trial balance, general ledger, and profitability service support.',
          columns: ['Report Name', 'Backend Source', 'Output Scope', 'Route / Service', 'Primary Data', 'Status'],
          rows: paginatedRows.map((e) => ({
            id: `cat-${e.reportName.toLowerCase().replace(/\s+/g, '-')}`,
            reportName: e.reportName,
            source: e.source,
            sourceLabel: e.source === 'route' ? 'Route' : 'Service',
            scope: e.scope,
            path: e.path,
            primaryData: e.primaryData,
            status: e.status,
            statusTone: e.statusTone,
            searchableText: e.searchableText,
            cells: [
              { text: e.reportName, emphasis: true },
              e.source === 'route' ? 'Route' : 'Service',
              e.scope.charAt(0).toUpperCase() + e.scope.slice(1),
              e.path,
              e.primaryData,
              { text: e.status, tone: e.statusTone },
            ],
          })),
        },
      },
      appliedFilters: { search, sources, scopes, quickFilters },
      pagination: { page: currentPage, limit, totalDocs, totalPages, hasPrevPage: currentPage > 1, hasNextPage: currentPage < totalPages },
      totals: { totalRows: CATALOG.length, filteredRows: totalDocs, routeCount, serviceCount },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
