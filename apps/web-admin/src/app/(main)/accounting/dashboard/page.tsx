'use client';

import { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Filter,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Wallet,
} from '@/components/ui/IconWrapper';

type TabId = 'overview' | 'recent-sales' | 'recent-purchases' | 'reporting-snapshot';

const tabs: Array<{ id: TabId; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'recent-sales', label: 'Recent Sales' },
  { id: 'recent-purchases', label: 'Recent Purchases' },
  { id: 'reporting-snapshot', label: 'Reporting Snapshot' },
];

const overviewStats = [
  {
    label: 'Total Receivables',
    value: 'PHP 4.28M',
    note: 'Aggregated from AR aging rows',
    change: 'Aging-based balance due total',
    trend: 'up',
  },
  {
    label: 'Total Payables',
    value: 'PHP 2.14M',
    note: 'Aggregated from AP aging rows',
    change: 'Outstanding vendor balances',
    trend: 'up',
  },
  {
    label: 'Overdue Invoices',
    value: '18',
    note: 'Receivables with positive days overdue',
    change: 'From AR aging buckets',
    trend: 'down',
  },
  {
    label: 'Cash & Bank',
    value: 'PHP 6.73M',
    note: 'Calculated from active bank account balances',
    change: 'Book closing balance total',
    trend: 'up',
  },
] as const;

const dashboardBreakdown = [
  { label: 'Overdue Bills', value: '9', note: 'Payables with positive days overdue' },
  { label: 'Recent Invoices', value: '10', note: 'Latest invoice register rows' },
  { label: 'Recent Bills', value: '10', note: 'Latest bill register rows' },
  { label: 'Recent Payments', value: '10', note: 'Latest receipt and disbursement rows' },
] as const;

const recentInvoices = [
  ['INV-2026-1452', '2026-05-31', 'Grandline Corporate', 'PHP 214,600', 'Posted'],
  ['INV-2026-1449', '2026-05-31', 'Blue Anchor Marine', 'PHP 188,240', 'Partially Paid'],
  ['INV-2026-1443', '2026-05-30', 'Harbor Training Ltd.', 'PHP 96,800', 'Posted'],
  ['INV-2026-1438', '2026-05-30', 'SM Shipping Corp.', 'PHP 142,500', 'Paid'],
] as const;

const recentBills = [
  ['BILL-2026-1184', '2026-05-31', 'Office Depot', 'PHP 12,880', 'Posted'],
  ['BILL-2026-1181', '2026-05-31', 'City Water', 'PHP 6,240', 'Partially Paid'],
  ['BILL-2026-1173', '2026-05-30', 'Cebu Pacific', 'PHP 18,420', 'Posted'],
  ['BILL-2026-1168', '2026-05-30', 'Grab', 'PHP 1,450', 'Paid'],
] as const;

const recentPayments = [
  ['Payment Received', 'RCT-2026-1184', 'Grandline Corporate', 'PHP 214,600', '2026-05-31'],
  ['Payment Received', 'RCT-2026-1181', 'Blue Anchor Marine', 'PHP 88,240', '2026-05-31'],
  ['Payment Made', 'PM-2026-083', 'Office Depot', 'PHP 12,880', '2026-05-31'],
  ['Payment Made', 'PM-2026-081', 'City Water', 'PHP 6,240', '2026-05-30'],
] as const;

const reportingMetrics = [
  { label: 'Trial Balance Accounts', value: '63', note: 'Accounts with debit or credit movement' },
  { label: 'Tax Summary Codes', value: '9', note: 'Distinct tax-code rows in summary' },
  { label: 'AR Aging Rows', value: '18', note: 'Customer balances in aging output' },
  { label: 'AP Aging Rows', value: '9', note: 'Vendor balances in aging output' },
] as const;

const trialBalanceRows = [
  ['1100', 'Accounts Receivable', 'Asset', 'PHP 1,428,880', 'PHP 214,600', 'PHP 1,214,280'],
  ['2100', 'Accrued Liabilities', 'Liability', 'PHP 68,500', 'PHP 612,400', 'PHP 543,900'],
  ['4100', 'Service Revenue', 'Income', 'PHP 0', 'PHP 4,286,300', 'PHP 4,286,300'],
  ['5200', 'Utilities Expense', 'Expense', 'PHP 684,110', 'PHP 0', 'PHP 684,110'],
] as const;

const taxSummaryRows = [
  ['VAT12', 'Standard VAT 12%', 'both', 'exclusive', 'PHP 5,936,999', 'PHP 712,440'],
  ['NONVAT', 'Non-VAT Sale', 'sales', 'exclusive', 'PHP 584,000', 'PHP 0'],
  ['EWTP2', 'Expanded Withholding 2%', 'purchase', 'exclusive', 'PHP 322,000', 'PHP 6,440'],
  ['ZRATED', 'Zero Rated', 'both', 'exclusive', 'PHP 118,500', 'PHP 0'],
] as const;

const agingRows = [
  ['Receivables', 'Grandline Corporate', 'INV-2026-1452', 'PHP 214,600', '0', 'Current'],
  ['Receivables', 'Blue Anchor Marine', 'INV-2026-1449', 'PHP 188,240', '16', '1-30'],
  ['Payables', 'Office Depot', 'BILL-2026-1184', 'PHP 12,880', '0', 'Current'],
  ['Payables', 'City Water', 'BILL-2026-1181', 'PHP 6,240', '9', '1-30'],
] as const;

function getStatusTone(status: string): string {
  if (status === 'Posted' || status === 'Paid' || status === 'Current') return 'green';
  if (status === 'Partially Paid' || status === '1-30') return 'amber';
  return 'blue';
}

function MetricCard({
  label,
  value,
  note,
  change,
  trend,
}: {
  label: string;
  value: string;
  note: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
  const TrendIcon = trend === 'down' ? ArrowDownRight : ArrowUpRight;
  const toneClass =
    trend === 'down'
      ? 'text-red-600 bg-red-50'
      : trend === 'neutral'
        ? 'text-gray-600 bg-gray-100'
        : 'text-green-600 bg-green-50';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
          <p className="mt-2 text-xs text-gray-500">{note}</p>
        </div>
        <div className="rounded-lg bg-gray-100 p-3 text-gray-600">
          <Wallet className="h-5 w-5" />
        </div>
      </div>
      {change ? (
        <div className="mt-4">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${toneClass}`}>
            <TrendIcon className="h-3.5 w-3.5" />
            {change}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

export default function AccountingDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const activeTabLabel = useMemo(
    () => tabs.find((tab) => tab.id === activeTab)?.label ?? 'Overview',
    [activeTab]
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Accounting / Dashboard</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Accounting Dashboard</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">
            Central overview for receivables, payables, cash and bank balances, recent invoice and bill activity,
            recent payments, and supported accounting reports.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Dashboard
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-transparent px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <Download className="h-4 w-4" />
            Download View
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{activeTabLabel}</h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Summary values and recent rows aligned to the accounting dashboard report plus supported report services.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                      Open Dashboard Report
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh Summary
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {overviewStats.map((metric) => (
                  <div key={metric.label}>
                    <MetricCard {...metric} />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <SectionCard title="Dashboard Summary" subtitle="High-level outputs from the dashboard report service">
                  <div className="space-y-4">
                    {dashboardBreakdown.map((item) => (
                      <div key={item.label} className="rounded-lg border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">{item.label}</p>
                        <p className="mt-1 text-base font-semibold text-gray-900">{item.value}</p>
                        <p className="mt-1 text-sm text-gray-600">{item.note}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="Recent Invoice Register" subtitle="Latest invoice rows from the supported sales register">
                  <div className="space-y-4">
                    {recentInvoices.slice(0, 3).map((row) => (
                      <div key={row[0]} className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{row[0]}</p>
                            <p className="mt-1 text-sm text-gray-600">{row[2]}</p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                            getStatusTone(row[4]) === 'green'
                              ? 'bg-green-50 text-green-700 ring-green-200'
                              : getStatusTone(row[4]) === 'amber'
                                ? 'bg-amber-50 text-amber-700 ring-amber-200'
                                : 'bg-blue-50 text-blue-700 ring-blue-200'
                          }`}>
                            {row[4]}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                          <span>{row[1]}</span>
                          <span>{row[3]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="Recent Payment Activity" subtitle="Latest payment-received and payment-made rows">
                  <div className="space-y-3">
                    {recentPayments.slice(0, 3).map((row) => (
                      <button
                        key={row[1]}
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{row[1]}</p>
                          <p className="mt-1 text-sm text-gray-600">{row[0]} / {row[2]}</p>
                        </div>
                        <span className="text-sm text-gray-500">{row[3]}</span>
                      </button>
                    ))}
                  </div>
                </SectionCard>
              </div>
            </div>
          )}

          {(activeTab === 'recent-sales' || activeTab === 'recent-purchases' || activeTab === 'reporting-snapshot') && (
            <div className="space-y-6">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{activeTabLabel}</h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Report-aligned rows and summaries built only from accounting dashboard and reporting services that exist in `apps/cms`.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh View
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-transparent px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    >
                      <Download className="h-4 w-4" />
                      Export View
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative min-w-0 flex-1 max-w-xl">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder={
                          activeTab === 'recent-sales'
                            ? 'Search invoice no., customer, date, or status'
                            : activeTab === 'recent-purchases'
                              ? 'Search bill no., vendor, date, or status'
                              : 'Search report type, account, tax code, or aging row'
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <Filter className="h-4 w-4" />
                      Filters
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(activeTab === 'recent-sales'
                      ? ['Posted', 'Partially Paid', 'Paid', 'Recent']
                      : activeTab === 'recent-purchases'
                        ? ['Posted', 'Partially Paid', 'Paid', 'Recent']
                        : ['Trial Balance', 'Tax Summary', 'AR Aging', 'AP Aging']
                    ).map((filter, index) => (
                      <button
                        key={filter}
                        type="button"
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          index === 0
                            ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {activeTab === 'recent-sales' && (
                  <div className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">Recent Sales Register</h3>
                        <p className="mt-1 text-sm text-gray-600">Recent invoice and payment activity supported by the dashboard and sales reporting services.</p>
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-gray-200">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {['Invoice No.', 'Date', 'Customer', 'Total', 'Status', 'Actions'].map((column) => (
                                <th key={column} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                  {column}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {recentInvoices.map((row) => (
                              <tr key={row[0]} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900">{row[0]}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{row[1]}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{row[2]}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-right text-gray-900">{row[3]}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm">
                                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                                    getStatusTone(row[4]) === 'green'
                                      ? 'bg-green-50 text-green-700 ring-green-200'
                                      : 'bg-amber-50 text-amber-700 ring-amber-200'
                                  }`}>
                                    {row[4]}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button type="button" className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
                                    View
                                    <MoreHorizontal className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'recent-purchases' && (
                  <div className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">Recent Purchase Register</h3>
                        <p className="mt-1 text-sm text-gray-600">Recent bill and disbursement activity supported by the dashboard and expense reporting services.</p>
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-gray-200">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {['Bill No.', 'Date', 'Vendor', 'Total', 'Status', 'Actions'].map((column) => (
                                <th key={column} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                  {column}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {recentBills.map((row) => (
                              <tr key={row[0]} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900">{row[0]}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{row[1]}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{row[2]}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-right text-gray-900">{row[3]}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm">
                                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                                    getStatusTone(row[4]) === 'green'
                                      ? 'bg-green-50 text-green-700 ring-green-200'
                                      : 'bg-amber-50 text-amber-700 ring-amber-200'
                                  }`}>
                                    {row[4]}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button type="button" className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
                                    View
                                    <MoreHorizontal className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reporting-snapshot' && (
                  <div className="space-y-6 p-5">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
                      {reportingMetrics.map((item) => (
                        <div key={item.label}>
                          <MetricCard
                            label={item.label}
                            value={item.value}
                            note={item.note}
                            change="Supported by reporting services"
                            trend="up"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                      <SectionCard title="Trial Balance" subtitle="Rows supported by the trial-balance service">
                        <div className="space-y-3">
                          {trialBalanceRows.slice(0, 3).map((row) => (
                            <div key={row[0]} className="rounded-lg border border-gray-200 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{row[0]} {row[1]}</p>
                                  <p className="mt-1 text-sm text-gray-600">{row[2]}</p>
                                </div>
                                <span className="text-sm text-gray-500">{row[5]}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </SectionCard>

                      <SectionCard title="Tax Summary" subtitle="Rows supported by the tax-summary service">
                        <div className="space-y-3">
                          {taxSummaryRows.slice(0, 3).map((row) => (
                            <div key={row[0]} className="rounded-lg border border-gray-200 p-4">
                              <p className="text-sm font-semibold text-gray-900">{row[0]} / {row[1]}</p>
                              <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                                <span>{row[2]}</span>
                                <span>{row[5]}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </SectionCard>

                      <SectionCard title="Aging Snapshot" subtitle="Rows supported by AR and AP aging services">
                        <div className="space-y-3">
                          {agingRows.map((row) => (
                            <div key={`${row[0]}-${row[2]}`} className="rounded-lg border border-gray-200 p-4">
                              <p className="text-sm font-semibold text-gray-900">{row[2]} / {row[1]}</p>
                              <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                                <span>{row[0]}</span>
                                <span>{row[3]}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </SectionCard>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
