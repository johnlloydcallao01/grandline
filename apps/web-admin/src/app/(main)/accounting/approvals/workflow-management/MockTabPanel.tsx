'use client';

import React from 'react';
import { ArrowDownRight, ArrowUpRight, Download, Wallet } from 'lucide-react';

type MockMetric = { label: string; value: string; change: string; trend?: 'up' | 'down' | 'neutral' };
type MockBadgeTone = 'gray' | 'blue' | 'green' | 'amber' | 'red';
type MockTableCell = string | { text: string; tone?: MockBadgeTone; emphasis?: boolean; align?: 'left' | 'right' | 'center' };
type MockTableRow = { id: string; cells: MockTableCell[] };

export type MockTab = {
  id: string;
  label: string;
  description: string;
  searchPlaceholder: string;
  filters: string[];
  metrics: MockMetric[];
  tableTitle: string;
  tableDescription: string;
  columns: string[];
  rows: MockTableRow[];
};

function getMetricTone(t: MockMetric['trend']) { if (t === 'down') return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30'; if (t === 'neutral') return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'; return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30'; }
function getBadgeClasses(tone: MockBadgeTone = 'gray') { switch (tone) { case 'blue': return 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-800'; case 'green': return 'bg-green-50 text-green-700 ring-green-200 dark:bg-green-950/30 dark:text-green-400 dark:ring-green-800'; case 'amber': return 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:ring-amber-800'; case 'red': return 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/30 dark:text-red-400 dark:ring-red-800'; default: return 'bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700'; } }

function renderCell(cell: MockTableCell, index: number) {
  if (typeof cell === 'string') return <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{cell}</td>;
  const alignClass = cell.align === 'right' ? 'text-right' : cell.align === 'center' ? 'text-center' : 'text-left';
  if (cell.tone) return <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${alignClass}`}><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getBadgeClasses(cell.tone)}`}>{cell.text}</span></td>;
  return <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${cell.emphasis ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'} ${alignClass}`}>{cell.text}</td>;
}

export function MockTabPanel({ tab }: { tab: MockTab }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{tab.label}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{tab.description}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{tab.rows.length} rows</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {tab.metrics.map((metric) => {
          const TrendIcon = metric.trend === 'down' ? ArrowDownRight : ArrowUpRight;
          return <div key={metric.label} className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-gray-500 dark:text-gray-400">{metric.label}</p><p className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100">{metric.value}</p></div><div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-3 text-gray-600 dark:text-gray-400"><Wallet className="h-5 w-5" /></div></div><div className="mt-4 flex items-center gap-2"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${metric.trend ? getMetricTone(metric.trend) : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'}`}><TrendIcon className="h-3.5 w-3.5" />{metric.change}</span></div></div>;
        })}
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-800 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1 max-w-xl">
              <input type="text" placeholder={tab.searchPlaceholder} disabled className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 py-2.5 px-4 text-sm text-gray-400 dark:text-gray-500 outline-none" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {tab.filters.map((filter) => <button key={filter} type="button" disabled className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">{filter}</button>)}
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{tab.tableTitle}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{tab.tableDescription}</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span>{tab.rows.length} rows</span>
              <button type="button" disabled className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-2 text-sm font-medium text-gray-400 dark:text-gray-500 disabled:opacity-50"><Download className="h-4 w-4" /> Export View</button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[var(--card-border)]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    {tab.columns.map((col) => <th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{col}</th>)}
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-[var(--card-background)]">
                  {tab.rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      {row.cells.map((cell, index) => renderCell(cell, index))}
                      <td className="px-4 py-3 text-right"><span className="text-sm text-gray-400 dark:text-gray-500">View</span></td>
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
