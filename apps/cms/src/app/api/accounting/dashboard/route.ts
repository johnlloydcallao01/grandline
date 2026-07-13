import { NextRequest, NextResponse } from 'next/server'
import { getDashboard } from '@/accounting/queries/getDashboard'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

export type DashboardKpiMetric = {
  id: string
  label: string
  value: string
  numericValue: number
  trend: 'up' | 'down' | 'neutral'
  change: string
}

export type RecentTransactionRow = {
  id: string
  documentNumber: string
  documentDate: string
  partyName: string
  total: number
  totalFormatted: string
  status: string
  statusLabel: string
  statusTone: 'green' | 'amber' | 'blue' | 'gray'
  type: string
  typeLabel: string
}

export type SystemHealthItem = {
  id: string
  label: string
  value: string
  sub: string
  status: 'healthy' | 'warning' | 'critical' | 'neutral'
  linkTo?: string
}

export type AgingBucketsChartData = {
  current: number
  bucket1to30: number
  bucket31to60: number
  bucket61to90: number
  bucketOver90: number
}

export type DashboardChartData = {
  arAgingBuckets: AgingBucketsChartData
  apAgingBuckets: AgingBucketsChartData
}

export type DashboardResponse = {
  kpis: DashboardKpiMetric[]
  recentInvoices: RecentTransactionRow[]
  recentBills: RecentTransactionRow[]
  recentPayments: RecentTransactionRow[]
  systemHealth: SystemHealthItem[]
  chartData: DashboardChartData
  lastUpdated: string
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-CA')
}

function statusMeta(status: string | null | undefined): { label: string; tone: 'green' | 'amber' | 'blue' | 'gray' } {
  const s = (status || '').toLowerCase().replace(/\s+/g, '_')
  if (s === 'posted' || s === 'paid' || s === 'active' || s === 'open') {
    return { label: status || 'Posted', tone: 'green' }
  }
  if (s === 'partially_paid' || s === 'pending' || s === 'soft_locked') {
    return { label: status || 'Partially Paid', tone: 'amber' }
  }
  if (s === 'draft' || s === 'closed') {
    return { label: status || 'Draft', tone: 'gray' }
  }
  return { label: status || '-', tone: 'blue' }
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)

    const [dashboard, currenciesResult, paymentTermsResult, bankAccountsResult, taxCodesResult, fyResult, userResult] =
      await Promise.all([
        getDashboard(payload),
        payload.find({
          collection: ACCOUNTING_COLLECTION_SLUGS.currencies,
          depth: 0,
          limit: 200,
          overrideAccess: true,
        }),
        payload.find({
          collection: ACCOUNTING_COLLECTION_SLUGS.paymentTerms,
          depth: 0,
          limit: 200,
          overrideAccess: true,
        }),
        payload.find({
          collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts,
          depth: 0,
          limit: 0,
          overrideAccess: true,
        }),
        payload.find({
          collection: ACCOUNTING_COLLECTION_SLUGS.taxCodes,
          depth: 0,
          limit: 0,
          overrideAccess: true,
        }),
        payload.find({
          collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears,
          depth: 0,
          limit: 50,
          sort: '-startDate',
          overrideAccess: true,
        }),
        payload.find({
          collection: 'users',
          depth: 0,
          limit: 0,
          overrideAccess: true,
        }),
      ])

    const currencies = (currenciesResult?.docs ?? []) as unknown as Record<string, unknown>[]
    const paymentTerms = (paymentTermsResult?.docs ?? []) as unknown as Record<string, unknown>[]
    const activeCurrencies = currencies.filter((c) => c.isActive).length
    const activePaymentTerms = paymentTerms.filter((p) => p.isActive).length

    const openFy = (fyResult?.docs ?? []).find(
      (fy) => fy.status === 'open',
    ) as unknown as Record<string, unknown> | undefined

    const baseCurrency = currencies.find((c: Record<string, unknown>) => c.isBaseCurrency)

    const s = dashboard.summary
    const totalOverdue = s.overdueInvoiceCount + s.overdueBillCount
    const workingCapital = s.totalReceivables - s.totalPayables + s.totalCashAndBank

    const kpis: DashboardKpiMetric[] = [
      {
        id: 'receivables',
        label: 'Receivables',
        value: formatCurrency(s.totalReceivables),
        numericValue: s.totalReceivables,
        trend: s.totalReceivables > 0 ? 'up' : 'neutral',
        change: 'Total outstanding customer invoices',
      },
      {
        id: 'payables',
        label: 'Payables',
        value: formatCurrency(s.totalPayables),
        numericValue: s.totalPayables,
        trend: s.totalPayables > 0 ? 'up' : 'neutral',
        change: 'Total outstanding vendor bills',
      },
      {
        id: 'cash-bank',
        label: 'Cash & Bank',
        value: formatCurrency(s.totalCashAndBank),
        numericValue: s.totalCashAndBank,
        trend: 'neutral',
        change: 'Total active bank account balances',
      },
      {
        id: 'working-capital',
        label: 'Working Capital',
        value: formatCurrency(workingCapital),
        numericValue: workingCapital,
        trend: workingCapital > 0 ? 'up' : 'down',
        change: 'Receivables − Payables + Cash',
      },
      {
        id: 'overdue',
        label: 'Overdue Items',
        value: String(totalOverdue),
        numericValue: totalOverdue,
        trend: totalOverdue > 0 ? 'down' : 'neutral',
        change: `${s.overdueInvoiceCount} invoices, ${s.overdueBillCount} bills past due`,
      },
      {
        id: 'base-currency',
        label: 'Base Currency',
        value: baseCurrency ? (baseCurrency.code as string) : '—',
        numericValue: 0,
        trend: baseCurrency ? 'neutral' : 'down',
        change: baseCurrency ? (baseCurrency.name as string) : 'Not configured',
      },
    ]

    const mapRecentRow = (
      row: { documentNumber?: string | null; documentDate?: string | null; partyName?: string | null; total: number; status?: string | null },
      id: string,
      type: string,
      typeLabel: string,
    ): RecentTransactionRow => {
      const sm = statusMeta(row.status)
      return {
        id,
        documentNumber: row.documentNumber || '-',
        documentDate: formatDate(row.documentDate),
        partyName: row.partyName || '-',
        total: row.total,
        totalFormatted: formatCurrency(row.total),
        status: row.status || '-',
        statusLabel: sm.label,
        statusTone: sm.tone,
        type,
        typeLabel,
      }
    }

    const recentInvoices = dashboard.recentInvoices.slice(0, 5).map((inv) =>
      mapRecentRow(inv, `inv-${inv.documentId}`, 'invoice', 'Invoice'),
    )
    const recentBills = dashboard.recentBills.slice(0, 5).map((bill) =>
      mapRecentRow(bill, `bill-${bill.documentId}`, 'bill', 'Bill'),
    )
    const recentPayments = dashboard.recentPayments.slice(0, 5).map((pmt) =>
      mapRecentRow(pmt, `pmt-${pmt.documentId}`, pmt.entityType === 'payment_received' ? 'payment_received' : 'payment_made', pmt.entityType === 'payment_received' ? 'Payment Received' : 'Payment Made'),
    )

    const currentPeriodSub = openFy
      ? `${openFy.code as string} — ${(openFy.name as string) || ''}`
      : 'No open fiscal year'

    const systemHealth: SystemHealthItem[] = [
      {
        id: 'period-status',
        label: 'Current Period',
        value: openFy ? `Open — ${openFy.code as string}` : 'No open FY',
        sub: currentPeriodSub,
        status: openFy ? 'healthy' : 'critical',
        linkTo: '/accounting/setup-controls/close-approval-controls',
      },
      {
        id: 'currencies',
        label: 'Currencies',
        value: `${activeCurrencies} active`,
        sub: `${currencies.length} total · ${baseCurrency ? (baseCurrency.code as string) + ' base' : 'no base'}`,
        status: baseCurrency ? 'healthy' : 'warning',
        linkTo: '/accounting/setup-controls/financial-reference-setup',
      },
      {
        id: 'payment-terms',
        label: 'Payment Terms',
        value: `${activePaymentTerms} active`,
        sub: `${paymentTerms.length} total configured`,
        status: activePaymentTerms > 0 ? 'healthy' : 'warning',
        linkTo: '/accounting/setup-controls/financial-reference-setup',
      },
      {
        id: 'bank-accounts',
        label: 'Bank Accounts',
        value: String((bankAccountsResult?.totalDocs ?? 0)),
        sub: 'Active bank and cash accounts',
        status: (bankAccountsResult?.totalDocs ?? 0) > 0 ? 'healthy' : 'warning',
        linkTo: '/accounting/master-records/business-parties',
      },
      {
        id: 'tax-codes',
        label: 'Tax Codes',
        value: String((taxCodesResult?.totalDocs ?? 0)),
        sub: 'Configured tax codes',
        status: (taxCodesResult?.totalDocs ?? 0) > 0 ? 'healthy' : 'warning',
        linkTo: '/accounting/master-records/core-accounting-masters',
      },
      {
        id: 'users',
        label: 'System Users',
        value: String((userResult?.totalDocs ?? 0)),
        sub: 'With accounting access',
        status: (userResult?.totalDocs ?? 0) > 0 ? 'healthy' : 'neutral',
        linkTo: '/accounting/setup-controls/access-permissions',
      },
    ]

    const response: DashboardResponse = {
      kpis,
      recentInvoices,
      recentBills,
      recentPayments,
      systemHealth,
      chartData: {
        arAgingBuckets: s.arAgingBuckets,
        apAgingBuckets: s.apAgingBuckets,
      },
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
