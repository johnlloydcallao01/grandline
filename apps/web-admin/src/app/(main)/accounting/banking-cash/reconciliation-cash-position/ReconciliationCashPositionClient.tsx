'use client';

import React, { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowDownRight, ArrowUpRight, Download, Filter, Landmark, Search, Wallet } from 'lucide-react';
import { ReconciliationsPanel } from './ReconciliationsPanel';
import type { ReconciliationCell, ReconciliationMetric } from './actions';

type TabId = 'reconciliations' | 'cash-flow';

type StaticMetric = {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

type StaticTab = {
  id: 'cash-flow';
  label: string;
  description: string;
  searchPlaceholder: string;
  quickFilters: string[];
  actions: Array<{
    label: string;
    variant: 'primary' | 'secondary' | 'ghost';
  }>;
  metrics: StaticMetric[];
  tableTitle: string;
  tableDescription: string;
  columns: Array<string | { label: string; align: 'left' | 'right' | 'center' }>;
  rows: Array<{ id: string; cells: ReconciliationCell[] }>;
};

const LIVE_TAB = {
  id: 'reconciliations' as const,
  label: 'Reconciliations',
};

const STATIC_TABS: StaticTab[] = [
  {
    id: 'cash-flow',
    label: 'Cash Flow',
    description: 'Review cash position, movement, forecast, and account-level liquidity trends.',
    searchPlaceholder: 'Search account, horizon, forecast bucket, or treasury note',
    quickFilters: ['Today', 'This Week', 'This Month', 'By Account'],
    actions: [
      { label: 'Refresh Forecast', variant: 'secondary' },
      { label: 'Export Cash View', variant: 'ghost' },
      { label: 'Record Treasury Note', variant: 'primary' },
    ],
    metrics: [
      { label: 'Available Cash', value: 'PHP 8.42M', change: '+PHP 310k vs yesterday', trend: 'up' },
      { label: '7-Day Outflows', value: 'PHP 4.13M', change: 'Payroll and vendor heavy', trend: 'down' },
      { label: 'Forecasted Closing Cash', value: 'PHP 6.98M', change: 'After planned settlements', trend: 'neutral' },
      { label: 'Lowest Account Buffer', value: 'PHP 280k', change: 'UnionBank Payroll', trend: 'down' },
    ],
    tableTitle: 'Cash Position By Account',
    tableDescription: 'Monitor available balances, expected inflows, and planned outflows across treasury accounts.',
    columns: [
      'Account',
      { label: 'Current Balance', align: 'right' },
      { label: 'Expected Inflows', align: 'right' },
      { label: 'Planned Outflows', align: 'right' },
      { label: 'Projected Close', align: 'right' },
      'Risk',
    ],
    rows: [
      {
        id: 'cf-1',
        cells: [
          { text: 'BDO Operations', emphasis: true },
          { text: 'PHP 3.26M', emphasis: true, align: 'right' },
          { text: 'PHP 540k', align: 'right' },
          { text: 'PHP 1.12M', align: 'right' },
          { text: 'PHP 2.68M', emphasis: true, align: 'right' },
          { text: 'Low Risk', tone: 'green' },
        ],
      },
      {
        id: 'cf-2',
        cells: [
          { text: 'UnionBank Payroll', emphasis: true },
          { text: 'PHP 780k', emphasis: true, align: 'right' },
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP 500k', align: 'right' },
          { text: 'PHP 280k', emphasis: true, align: 'right' },
          { text: 'Watch', tone: 'amber' },
        ],
      },
      {
        id: 'cf-3',
        cells: [
          { text: 'Metrobank Main', emphasis: true },
          { text: 'PHP 2.94M', emphasis: true, align: 'right' },
          { text: 'PHP 1.24M', align: 'right' },
          { text: 'PHP 1.45M', align: 'right' },
          { text: 'PHP 2.73M', emphasis: true, align: 'right' },
          { text: 'Healthy', tone: 'green' },
        ],
      },
      {
        id: 'cf-4',
        cells: [
          { text: 'RCBC Reserve', emphasis: true },
          { text: 'PHP 1.44M', emphasis: true, align: 'right' },
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP 1.44M', emphasis: true, align: 'right' },
          { text: 'Reserve', tone: 'blue' },
        ],
      },
    ],
  },
];

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  if (variant === 'ghost') return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
}

function getMetricTone(trend: ReconciliationMetric['trend'] | StaticMetric['trend']) {
  if (trend === 'down') return 'text-red-600 bg-red-50';
  if (trend === 'neutral') return 'text-gray-600 bg-gray-100';
  return 'text-green-600 bg-green-50';
}

function MetricCard({
  label,
  value,
  change,
  trend = 'neutral',
}: {
  label: string;
  value: string | number;
  change: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
  const TrendIcon = trend === 'down' ? ArrowDownRight : ArrowUpRight;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="rounded-lg bg-gray-100 p-3 text-gray-600">
          <Wallet className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${getMetricTone(trend)}`}>
          <TrendIcon className="h-3.5 w-3.5" />
          {change}
        </span>
      </div>
    </div>
  );
}

function renderCell(cell: ReconciliationCell, index: number) {
  if (typeof cell === 'string') {
    return (
      <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
        {cell}
      </td>
    );
  }

  const alignClass = cell.align === 'right' ? 'text-right' : cell.align === 'center' ? 'text-center' : 'text-left';
  if (cell.tone) {
    const toneMap: Record<string, string> = {
      amber: 'bg-amber-50 text-amber-700 ring-amber-200',
      green: 'bg-green-50 text-green-700 ring-green-200',
      gray: 'bg-gray-100 text-gray-700 ring-gray-200',
      blue: 'bg-blue-50 text-blue-700 ring-blue-200',
      red: 'bg-red-50 text-red-700 ring-red-200',
    };

    return (
      <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${alignClass}`}>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${toneMap[cell.tone] || toneMap.gray}`}>
          {cell.text}
        </span>
      </td>
    );
  }

  return (
    <td
      key={index}
      className={`whitespace-nowrap px-4 py-3 text-sm ${cell.emphasis ? 'font-semibold text-gray-900' : 'text-gray-600'} ${alignClass}`}
    >
      {cell.text}
    </td>
  );
}

function StaticTabPanel({ tab }: { tab: StaticTab }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">{tab.label}</h2>
          <p className="text-sm text-gray-600">{tab.description}</p>
          <p className="text-sm text-gray-500">{tab.rows.length} sample rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tab.actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses(action.variant)}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {tab.metrics.map((metric) => (
          <div key={metric.label}>
            <MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 max-w-xl flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={tab.searchPlaceholder}
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
            {tab.quickFilters.map((filter, index) => (
              <button
                key={filter}
                type="button"
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${index === 0 ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900">{tab.tableTitle}</h3>
              <p className="mt-1 text-sm text-gray-600">{tab.tableDescription}</p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Export View
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {tab.columns.map((column) => {
                      const label = typeof column === 'string' ? column : column.label;
                      const align = typeof column === 'string' ? 'left' : column.align;
                      return (
                        <th
                          key={label}
                          className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${align === 'right' ? 'text-right' : 'text-left'}`}
                        >
                          {label}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {tab.rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.cells.map((cell, index) => renderCell(cell, index))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReconciliationCashPositionClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = rawTab === 'cash-flow' ? 'cash-flow' : 'reconciliations';
  const currentStaticTab = useMemo(
    () => STATIC_TABS.find((tab) => tab.id === activeTab),
    [activeTab],
  );

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Operations / Banking & Cash</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reconciliation & Cash Position</h1>
              <p className="mt-1 max-w-3xl text-sm text-gray-600">
                Monitor bank reconciliations and overall cash position so finance teams can keep balances aligned and liquidity visible.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {[LIVE_TAB, ...STATIC_TABS].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id as TabId)}
                className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'reconciliations' ? <ReconciliationsPanel /> : currentStaticTab ? <StaticTabPanel tab={currentStaticTab} /> : null}
      </div>
    </div>
  );
}
