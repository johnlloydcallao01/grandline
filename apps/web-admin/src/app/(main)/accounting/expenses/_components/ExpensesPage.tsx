'use client';

import { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Briefcase,
  Download,
  FileText,
  Filter,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Upload,
  Wallet,
} from '@/components/ui/IconWrapper';

type ExpensesAction = {
  label: string;
  icon?: 'plus' | 'upload' | 'download' | 'refresh';
  variant?: 'primary' | 'secondary' | 'ghost';
};

type ExpensesMetric = {
  label: string;
  value: string;
  change: string;
  trend?: 'up' | 'down' | 'neutral';
};

type ExpensesBadgeTone = 'gray' | 'blue' | 'green' | 'amber' | 'red';

type ExpensesTableCell =
  | string
  | {
      text: string;
      tone?: ExpensesBadgeTone;
      emphasis?: boolean;
      align?: 'left' | 'right' | 'center';
    };

type ExpensesTableRow = {
  id: string;
  cells: ExpensesTableCell[];
};

type ExpensesPanelItem = {
  label: string;
  value: string;
  tone?: ExpensesBadgeTone;
};

type ExpensesPanel = {
  title: string;
  subtitle?: string;
  items: ExpensesPanelItem[];
};

export type ExpensesTab = {
  id: string;
  label: string;
  description: string;
  searchPlaceholder: string;
  filters: string[];
  metrics: ExpensesMetric[];
  actions: ExpensesAction[];
  tableTitle: string;
  tableDescription: string;
  columns: string[];
  rows: ExpensesTableRow[];
  sidePanels: ExpensesPanel[];
  footerPanels?: ExpensesPanel[];
};

type ExpensesPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  tabs: ExpensesTab[];
  headerActions?: ExpensesAction[];
};

function getActionIcon(icon?: ExpensesAction['icon']) {
  switch (icon) {
    case 'plus':
      return Plus;
    case 'upload':
      return Upload;
    case 'download':
      return Download;
    case 'refresh':
      return RefreshCw;
    default:
      return null;
  }
}

function getActionClasses(variant: ExpensesAction['variant'] = 'secondary') {
  if (variant === 'primary') {
    return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  }
  if (variant === 'ghost') {
    return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  }
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
}

function getBadgeClasses(tone: ExpensesBadgeTone = 'gray') {
  switch (tone) {
    case 'blue':
      return 'bg-blue-50 text-blue-700 ring-blue-200';
    case 'green':
      return 'bg-green-50 text-green-700 ring-green-200';
    case 'amber':
      return 'bg-amber-50 text-amber-700 ring-amber-200';
    case 'red':
      return 'bg-red-50 text-red-700 ring-red-200';
    default:
      return 'bg-gray-100 text-gray-700 ring-gray-200';
  }
}

function renderCell(cell: ExpensesTableCell, index: number) {
  if (typeof cell === 'string') {
    return (
      <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
        {cell}
      </td>
    );
  }

  const alignClass = cell.align === 'right' ? 'text-right' : cell.align === 'center' ? 'text-center' : 'text-left';

  if (cell.tone) {
    return (
      <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${alignClass}`}>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getBadgeClasses(cell.tone)}`}>
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

function MetricCard({ metric }: { metric: ExpensesMetric }) {
  const TrendIcon = metric.trend === 'down' ? ArrowDownRight : ArrowUpRight;
  const toneClass =
    metric.trend === 'down'
      ? 'text-red-600 bg-red-50'
      : metric.trend === 'neutral'
        ? 'text-gray-600 bg-gray-100'
        : 'text-green-600 bg-green-50';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{metric.label}</p>
          <p className="mt-3 text-2xl font-bold text-gray-900">{metric.value}</p>
        </div>
        <div className="rounded-lg bg-gray-100 p-3 text-gray-600">
          <Wallet className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${toneClass}`}>
          <TrendIcon className="h-3.5 w-3.5" />
          {metric.change}
        </span>
      </div>
    </div>
  );
}

function PanelCard({ panel }: { panel: ExpensesPanel }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-900">{panel.title}</h3>
        {panel.subtitle ? <p className="mt-1 text-xs text-gray-500">{panel.subtitle}</p> : null}
      </div>
      <div className="space-y-3 p-5">
        {panel.items.map((item) => (
          <div key={`${panel.title}-${item.label}`} className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              <p className="mt-1 text-sm text-gray-600">{item.value}</p>
            </div>
            {item.tone ? (
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getBadgeClasses(item.tone)}`}>
                {item.tone === 'green'
                  ? 'Healthy'
                  : item.tone === 'amber'
                    ? 'Attention'
                    : item.tone === 'red'
                      ? 'Blocked'
                      : item.tone === 'blue'
                        ? 'Active'
                        : 'Tracked'}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function ExpensesPage({ eyebrow, title, description, tabs, headerActions }: ExpensesPageProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? '');
  const selectedTab = useMemo(() => tabs.find((tab) => tab.id === activeTab) ?? tabs[0], [activeTab, tabs]);

  if (!selectedTab) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">{eyebrow}</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="mt-1 max-w-3xl text-sm text-gray-600">{description}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {(headerActions ?? []).map((action) => {
            const Icon = getActionIcon(action.icon);
            return (
              <button
                key={`header-${action.label}`}
                type="button"
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses(action.variant)}`}
              >
                {Icon ? <Icon className="h-4 w-4" /> : null}
                {action.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = selectedTab.id === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
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

        <div className="space-y-6 p-6">
          <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{selectedTab.label}</h2>
              <p className="mt-1 text-sm text-gray-600">{selectedTab.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {selectedTab.actions.map((action) => {
                const Icon = getActionIcon(action.icon);
                return (
                  <button
                    key={`${selectedTab.id}-${action.label}`}
                    type="button"
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses(action.variant)}`}
                  >
                    {Icon ? <Icon className="h-4 w-4" /> : null}
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
            {selectedTab.metrics.map((metric) => (
              <MetricCard key={`${selectedTab.id}-${metric.label}`} metric={metric} />
            ))}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative min-w-0 flex-1 max-w-xl">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={selectedTab.searchPlaceholder}
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
                {selectedTab.filters.map((filter, index) => (
                  <button
                    key={`${selectedTab.id}-${filter}`}
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

            <div
              className={`grid grid-cols-1 gap-6 p-5 ${
                selectedTab.sidePanels.length
                  ? 'xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.9fr)]'
                  : ''
              }`}
            >
              <section className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{selectedTab.tableTitle}</h3>
                    <p className="mt-1 text-sm text-gray-600">{selectedTab.tableDescription}</p>
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
                          {selectedTab.columns.map((column) => (
                            <th
                              key={`${selectedTab.id}-${column}`}
                              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                            >
                              {column}
                            </th>
                          ))}
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {selectedTab.rows.map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50">
                            {row.cells.map((cell, index) => renderCell(cell, index))}
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                              >
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
              </section>

              {selectedTab.sidePanels.length ? (
                <div className="space-y-4">
                  {selectedTab.sidePanels.map((panel) => (
                    <PanelCard key={`${selectedTab.id}-${panel.title}`} panel={panel} />
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {selectedTab.footerPanels?.length ? (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {selectedTab.footerPanels.map((panel) => (
                <PanelCard key={`${selectedTab.id}-footer-${panel.title}`} panel={panel} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
