'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Download, FileText, MoreHorizontal, RefreshCw } from 'lucide-react';
import { AllFilesPanel } from './AllFilesPanel';
import { ReceiptArchivePanel } from './ReceiptArchivePanel';
import { LinkedDocumentsPanel } from './LinkedDocumentsPanel';

type StaticMetric = {
  label: string;
  value: string;
  change: string;
  trend?: 'up' | 'down' | 'neutral';
};

type StaticCell =
  | string
  | {
      text: string;
      tone?: 'gray' | 'blue' | 'green' | 'amber' | 'red';
      emphasis?: boolean;
      align?: 'left' | 'right' | 'center';
    };

type StaticRow = {
  id: string;
  cells: StaticCell[];
};

type TabConfig = {
  id: 'all-files' | 'receipt-archive' | 'linked-documents';
  label: string;
  description: string;
  searchPlaceholder: string;
  filters: string[];
  metrics: StaticMetric[];
  tableTitle: string;
  tableDescription: string;
  columns: string[];
  rows: StaticRow[];
};

const TABS: TabConfig[] = [
  {
    id: 'all-files',
    label: 'All Files',
    description:
      'Browse the full accounting document inventory across uploaded files and linked records stored through media and accounting document links.',
    searchPlaceholder: 'Search file name, mime type, category, entity type, entity reference, or note',
    filters: ['All Files', 'Linked', 'Primary', 'Recent'],
    metrics: [],
    tableTitle: 'Document Library',
    tableDescription:
      'Unified file register combining upload metadata from media with accounting linkage coverage where available.',
    columns: ['File Name', 'File Type', 'Uploaded At', 'Link Count', 'Latest Link', 'Status'],
    rows: [],
  },
  {
    id: 'receipt-archive',
    label: 'Receipt Archive',
    description:
      'Review receipt-oriented supporting documents using document categories such as receipt, expense receipt, and proof of payment.',
    searchPlaceholder: 'Search receipt file, entity id, category, uploader, or document date',
    filters: ['Receipt', 'Expense Receipt', 'Proof Of Payment', 'Primary'],
    metrics: [
      { label: 'Receipt Records', value: '46', change: 'Linked records under receipt-oriented categories', trend: 'up' },
      { label: 'Expense Receipts', value: '18', change: 'Expense-specific receipt documents', trend: 'neutral' },
      { label: 'Proof Of Payment', value: '11', change: 'Payment-supporting document links', trend: 'neutral' },
      { label: 'Primary Receipts', value: '29', change: 'Receipt links marked as primary', trend: 'up' },
    ],
    tableTitle: 'Receipt Archive',
    tableDescription:
      'Document-link view filtered to receipt-like categories already modeled by the accounting document-link collection.',
    columns: ['File Name', 'Document Category', 'Entity Type', 'Entity ID', 'Document Date', 'Status'],
    rows: [
      {
        id: 'receipt-1',
        cells: [
          { text: 'grab-receipt-exp-1162.png', emphasis: true },
          'expense_receipt',
          'expense',
          'EXP-2026-1162',
          '2026-05-30',
          { text: 'Primary', tone: 'green' },
        ],
      },
      {
        id: 'receipt-2',
        cells: [
          { text: 'payment-slip-pm-2026-081.pdf', emphasis: true },
          'proof_of_payment',
          'payment_made',
          'PM-2026-081',
          '2026-05-30',
          { text: 'Linked', tone: 'blue' },
        ],
      },
      {
        id: 'receipt-3',
        cells: [
          { text: 'receipt-rct-2026-1184.pdf', emphasis: true },
          'receipt',
          'receipt',
          'RCT-2026-1184',
          '2026-05-31',
          { text: 'Primary', tone: 'green' },
        ],
      },
      {
        id: 'receipt-4',
        cells: [
          { text: 'office-depot-proof.pdf', emphasis: true },
          'proof_of_payment',
          'bill',
          'BILL-2026-1184',
          '2026-05-31',
          { text: 'Linked', tone: 'blue' },
        ],
      },
    ],
  },
  {
    id: 'linked-documents',
    label: 'Linked Documents',
    description:
      'Review accounting document links by entity type, entity id, category, document date, and primary-document flag.',
    searchPlaceholder: 'Search entity type, entity id, category, notes, or uploader',
    filters: ['Invoices', 'Bills', 'Expenses', 'Banking'],
    metrics: [
      { label: 'Linked Documents', value: '88', change: 'Accounting document-link records in scope', trend: 'up' },
      { label: 'Invoice / Bill Links', value: '39', change: 'Commercial transaction attachments', trend: 'up' },
      { label: 'Expense / Banking Links', value: '27', change: 'Expense and banking support files', trend: 'neutral' },
      { label: 'With Notes', value: '31', change: 'Linked records carrying document notes', trend: 'neutral' },
    ],
    tableTitle: 'Linked Document Register',
    tableDescription:
      'Link-centric register built directly from accounting-document-links using entity type, entity id, and category metadata.',
    columns: ['File Name', 'Entity Type', 'Entity ID', 'Category', 'Is Primary', 'Status'],
    rows: [
      {
        id: 'linked-1',
        cells: [
          { text: 'office-depot-bill-1184.jpg', emphasis: true },
          'bill',
          'BILL-2026-1184',
          'bill',
          { text: 'Yes', tone: 'green' },
          { text: 'Linked', tone: 'blue' },
        ],
      },
      {
        id: 'linked-2',
        cells: [
          { text: 'bdo-statement-may-2026.pdf', emphasis: true },
          'bank_reconciliation',
          'REC-2026-05-BDO',
          'bank_statement',
          { text: 'Yes', tone: 'green' },
          { text: 'Linked', tone: 'blue' },
        ],
      },
      {
        id: 'linked-3',
        cells: [
          { text: 'vat-support-pack-q2.zip', emphasis: true },
          'journal_entry',
          'JE-2026-0908',
          'tax',
          { text: 'No', tone: 'gray' },
          { text: 'Linked', tone: 'blue' },
        ],
      },
      {
        id: 'linked-4',
        cells: [
          { text: 'receipt-rct-2026-1184.pdf', emphasis: true },
          'receipt',
          'RCT-2026-1184',
          'receipt',
          { text: 'Yes', tone: 'green' },
          { text: 'Linked', tone: 'blue' },
        ],
      },
    ],
  },
];

function getMetricTone(trend: StaticMetric['trend']) {
  if (trend === 'down') return 'text-red-600 bg-red-50';
  if (trend === 'neutral') return 'text-gray-600 bg-gray-100';
  return 'text-green-600 bg-green-50';
}

function renderStaticCell(cell: StaticCell, index: number) {
  if (typeof cell === 'string') {
    return (
      <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
        {cell}
      </td>
    );
  }

  const alignClass =
    cell.align === 'right' ? 'text-right' : cell.align === 'center' ? 'text-center' : 'text-left';
  if (cell.tone) {
    const toneMap: Record<string, string> = {
      amber: 'bg-amber-50 text-amber-700 ring-amber-200',
      blue: 'bg-blue-50 text-blue-700 ring-blue-200',
      gray: 'bg-gray-100 text-gray-700 ring-gray-200',
      green: 'bg-green-50 text-green-700 ring-green-200',
      red: 'bg-red-50 text-red-700 ring-red-200',
    };
    return (
      <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${alignClass}`}>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${toneMap[cell.tone] || toneMap.gray}`}
        >
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

function MetricCard({ metric }: { metric: StaticMetric }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{metric.label}</p>
          <p className="mt-3 text-2xl font-bold text-gray-900">{metric.value}</p>
        </div>
        <div className="rounded-lg bg-gray-100 p-3 text-gray-600">
          <FileText className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getMetricTone(metric.trend)}`}>
          {metric.change}
        </span>
      </div>
    </div>
  );
}

function StaticTabPanel({ tab }: { tab: TabConfig }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">{tab.label}</h2>
          <p className="text-sm text-gray-600">{tab.description}</p>
          <p className="text-sm text-gray-500">{tab.rows.length} sample rows</p>
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
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export View
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {tab.metrics.map((metric) => (
          <div key={`${tab.id}-${metric.label}`}>
            <MetricCard metric={metric} />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 max-w-xl flex-1">
              <input
                type="text"
                placeholder={tab.searchPlaceholder}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Filters
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tab.filters.map((filter, index) => (
              <button
                key={`${tab.id}-${filter}`}
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
            <span className="text-sm text-gray-500">{tab.rows.length} matching rows</span>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {tab.columns.map((column) => (
                      <th
                        key={`${tab.id}-${column}`}
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
                  {tab.rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.cells.map((cell, index) => renderStaticCell(cell, index))}
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
        </div>
      </div>
    </div>
  );
}

export function DocumentLibraryClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabConfig['id'] = TABS.find((tab) => tab.id === rawTab)?.id || 'all-files';
  const currentTab = TABS.find((tab) => tab.id === activeTab) || TABS[0];

  const handleTabChange = (tabId: TabConfig['id']) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Operations / Documents & Inbox</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Document Library</h1>
              <p className="mt-1 max-w-3xl text-sm text-gray-600">
                Browse accounting-supporting files and document links across invoices, bills, expenses,
                receipts, and banking records.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'all-files' ? (
          <AllFilesPanel
            title={currentTab.label}
            description={currentTab.description}
            searchPlaceholder={currentTab.searchPlaceholder}
            tableTitle={currentTab.tableTitle}
            tableDescription={currentTab.tableDescription}
            exportFileName="document-library-all-files.csv"
            emptyStateMessage="No library files match the current search and filter combination."
            defaultQuickFilters={['scope:all']}
          />
        ) : activeTab === 'receipt-archive' ? (
          <ReceiptArchivePanel
            title={currentTab.label}
            description={currentTab.description}
            searchPlaceholder={currentTab.searchPlaceholder}
            tableTitle={currentTab.tableTitle}
            tableDescription={currentTab.tableDescription}
            exportFileName="document-library-receipt-archive.csv"
            emptyStateMessage="No receipt archive records match the current search and filter combination."
            defaultQuickFilters={[]}
          />
        ) : activeTab === 'linked-documents' ? (
          <LinkedDocumentsPanel
            title={currentTab.label}
            description={currentTab.description}
            searchPlaceholder={currentTab.searchPlaceholder}
            tableTitle={currentTab.tableTitle}
            tableDescription={currentTab.tableDescription}
            exportFileName="document-library-linked-documents.csv"
            emptyStateMessage="No linked documents match the current search and filter combination."
            defaultQuickFilters={[]}
          />
        ) : (
          <StaticTabPanel tab={currentTab} />
        )}
      </div>
    </div>
  );
}
