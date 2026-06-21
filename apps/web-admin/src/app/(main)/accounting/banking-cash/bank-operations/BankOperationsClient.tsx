'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Edit,
  Eye,
  Filter,
  Landmark,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  Wallet,
  X,
} from 'lucide-react';
import {
  createBankTransaction,
  deleteBankTransaction,
  getBankTransactionDetail,
  getBankTransactions,
  updateBankTransaction,
  type BankTransactionCell,
  type BankTransactionDetail,
  type BankTransactionMetric,
  type BankTransactionMutationInput,
  type BankTransactionRegisterResponse,
  type BankTransactionRow,
} from './actions';
import { StatementImportsPanel } from './StatementImportsPanel';

type TabId = 'bank-transactions' | 'statement-imports' | 'bank-feeds';

type BankTransactionFilterState = {
  statuses: string[];
  directions: string[];
  coverageStates: string[];
};

type BankTransactionFormState = {
  bankAccount: string;
  transactionDate: string;
  valueDate: string;
  description: string;
  referenceNumber: string;
  amountIn: string;
  amountOut: string;
  runningBalance: string;
  matchStatus: string;
  matchedEntityType: string;
  matchedEntityId: string;
  notes: string;
  preservedMetadata: Record<string, unknown> | null;
};

type StaticMetric = {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

type StaticTab = {
  id: Exclude<TabId, 'bank-transactions'>;
  label: string;
  description: string;
  searchPlaceholder: string;
  quickFilters: string[];
  actions: Array<{
    label: string;
    icon: 'upload' | 'download' | 'refresh' | 'plus';
    variant: 'primary' | 'secondary' | 'ghost';
  }>;
  metrics: StaticMetric[];
  tableTitle: string;
  tableDescription: string;
  columns: string[];
  rows: Array<{ id: string; cells: BankTransactionCell[] }>;
};

const LIVE_TAB = {
  id: 'bank-transactions' as const,
  label: 'Bank Transactions',
  description: 'Review bank transaction intake and matching status across imported and manually entered records.',
  searchPlaceholder: 'Search by reference, counterparty, amount, or memo',
  columns: ['Date', 'Bank Account', 'Reference', 'Counterparty', 'Amount', 'Status'],
};

const STATIC_TABS: StaticTab[] = [
  {
    id: 'statement-imports',
    label: 'Statement Imports',
    description: 'Manage statement import queue, file history, parsing errors, and import outcomes.',
    searchPlaceholder: 'Search by filename, account, uploader, or import batch',
    quickFilters: ['Queued', 'Imported', 'Parsing Errors', 'Requires Re-upload'],
    actions: [
      { label: 'Upload File', icon: 'upload', variant: 'primary' },
      { label: 'Download Template', icon: 'download', variant: 'secondary' },
      { label: 'Retry Failed Imports', icon: 'refresh', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Files In Queue', value: '9', change: '3 waiting validation', trend: 'neutral' },
      { label: 'Imported Today', value: '14', change: '2,481 lines parsed', trend: 'up' },
      { label: 'Failed Imports', value: '3', change: '1 critical format issue', trend: 'down' },
      { label: 'Oldest Pending File', value: '42 min', change: 'Uploaded 08:18 AM', trend: 'neutral' },
    ],
    tableTitle: 'Statement Import Batches',
    tableDescription: 'Track every uploaded bank statement, parse outcome, and finance follow-up action.',
    columns: ['Uploaded', 'Filename', 'Bank Account', 'Lines', 'Uploaded By', 'Import Status'],
    rows: [
      {
        id: 'imp-1',
        cells: [
          '08:18 AM',
          { text: 'BDO-main-2026-05-31.csv', emphasis: true },
          'BDO Operations',
          '241',
          'finance.ops@grandline',
          { text: 'Queued', tone: 'blue' },
        ],
      },
      {
        id: 'imp-2',
        cells: [
          '07:42 AM',
          { text: 'ub-payroll-2026-05-31.xlsx', emphasis: true },
          'UnionBank Payroll',
          '86',
          'treasury@grandline',
          { text: 'Imported', tone: 'green' },
        ],
      },
      {
        id: 'imp-3',
        cells: [
          'Yesterday',
          { text: 'metrobank-main-2026-05-30.csv', emphasis: true },
          'Metrobank Main',
          '311',
          'finance.lead@grandline',
          { text: 'Parse Error', tone: 'red' },
        ],
      },
      {
        id: 'imp-4',
        cells: [
          'Yesterday',
          { text: 'bdo-daily-2026-05-30.csv', emphasis: true },
          'BDO Operations',
          '227',
          'finance.ops@grandline',
          { text: 'Needs Re-upload', tone: 'amber' },
        ],
      },
    ],
  },
  {
    id: 'bank-feeds',
    label: 'Bank Feeds',
    description: 'Monitor connected accounts, feed health, sync history, and feed rules.',
    searchPlaceholder: 'Search by bank account, connector, sync token, or rule',
    quickFilters: ['Healthy Feeds', 'Sync Delays', 'Rule Changes', 'Disconnected'],
    actions: [
      { label: 'Connect Bank Feed', icon: 'plus', variant: 'primary' },
      { label: 'Sync Now', icon: 'refresh', variant: 'secondary' },
      { label: 'Export Feed Log', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Connected Accounts', value: '6', change: '5 healthy / 1 delayed', trend: 'up' },
      { label: 'Last Sync Success', value: '09:26 AM', change: '4 min average latency', trend: 'up' },
      { label: 'Feed Rules Active', value: '18', change: '3 auto-classify rules edited', trend: 'neutral' },
      { label: 'Disconnected Feeds', value: '1', change: 'Payroll account token expired', trend: 'down' },
    ],
    tableTitle: 'Connected Feed Accounts',
    tableDescription: 'Operational status of each connected bank feed and the rules attached to it.',
    columns: ['Bank Account', 'Connector', 'Last Sync', 'Imported Rows', 'Rule Set', 'Health'],
    rows: [
      {
        id: 'feed-1',
        cells: [
          { text: 'BDO Operations', emphasis: true },
          'Plaid via Treasury Hub',
          '09:26 AM',
          '127',
          'Collections + Refund Rules',
          { text: 'Healthy', tone: 'green' },
        ],
      },
      {
        id: 'feed-2',
        cells: [
          { text: 'Metrobank Main', emphasis: true },
          'CSV Bridge',
          '09:02 AM',
          '91',
          'Manual Review Fallback',
          { text: 'Healthy', tone: 'green' },
        ],
      },
      {
        id: 'feed-3',
        cells: [
          { text: 'UnionBank Payroll', emphasis: true },
          'Direct API',
          'Yesterday 05:11 PM',
          '0',
          'Payroll Settlement Rules',
          { text: 'Token Expired', tone: 'red' },
        ],
      },
      {
        id: 'feed-4',
        cells: [
          { text: 'RCBC Reserve', emphasis: true },
          'Direct API',
          '08:55 AM',
          '14',
          'Treasury Transfer Rules',
          { text: 'Sync Delay', tone: 'amber' },
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

function getMetricTone(trend: BankTransactionMetric['trend'] | StaticMetric['trend']) {
  if (trend === 'down') return 'text-red-600 bg-red-50';
  if (trend === 'neutral') return 'text-gray-600 bg-gray-100';
  return 'text-green-600 bg-green-50';
}

function escapeCsvValue(value: string | number | boolean | null | undefined) {
  const normalized = String(value ?? '');
  return /[",\n]/.test(normalized) ? `"${normalized.replace(/"/g, '""')}"` : normalized;
}

function toggleFilterValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function getMetadataNote(value: Record<string, unknown> | null | undefined) {
  if (!value || typeof value.manualNote !== 'string') return '';
  return value.manualNote.trim();
}

function toDateInputValue(value: string | null | undefined) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function createEmptyForm(): BankTransactionFormState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    bankAccount: '',
    transactionDate: today,
    valueDate: '',
    description: '',
    referenceNumber: '',
    amountIn: '0',
    amountOut: '0',
    runningBalance: '',
    matchStatus: 'unmatched',
    matchedEntityType: '',
    matchedEntityId: '',
    notes: '',
    preservedMetadata: null,
  };
}

function buildFormFromDetail(detail: BankTransactionDetail): BankTransactionFormState {
  return {
    bankAccount: detail.bankAccountId || '',
    transactionDate: toDateInputValue(detail.transactionDate),
    valueDate: toDateInputValue(detail.valueDate),
    description: detail.description || '',
    referenceNumber: detail.referenceNumber || '',
    amountIn: String(detail.amountIn || 0),
    amountOut: String(detail.amountOut || 0),
    runningBalance: detail.runningBalance || detail.runningBalance === 0 ? String(detail.runningBalance) : '',
    matchStatus: detail.matchStatus || 'unmatched',
    matchedEntityType: detail.matchedEntityType || '',
    matchedEntityId: detail.matchedEntityId || '',
    notes: getMetadataNote(detail.metadata),
    preservedMetadata: detail.metadata || null,
  };
}

function toMutationInput(formState: BankTransactionFormState): BankTransactionMutationInput {
  const trimmedNote = formState.notes.trim();
  const metadata = { ...(formState.preservedMetadata || {}) } as Record<string, unknown>;
  if (trimmedNote) {
    metadata.manualNote = trimmedNote;
  } else {
    delete metadata.manualNote;
  }

  const normalizedMetadata = Object.keys(metadata).length > 0 ? metadata : null;

  return {
    bankAccount: formState.bankAccount,
    transactionDate: formState.transactionDate,
    valueDate: formState.valueDate || null,
    description: formState.description.trim(),
    referenceNumber: formState.referenceNumber.trim() || null,
    amountIn: Number(formState.amountIn || 0),
    amountOut: Number(formState.amountOut || 0),
    runningBalance: formState.runningBalance === '' ? null : Number(formState.runningBalance),
    matchStatus: formState.matchStatus,
    matchedEntityType: formState.matchedEntityType || null,
    matchedEntityId: formState.matchedEntityId.trim() || null,
    metadata: normalizedMetadata,
  };
}

function SlideOver({
  isOpen,
  onClose,
  title,
  description,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
      return;
    }

    setAnimate(false);
    const timer = setTimeout(() => setMounted(false), 300);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ease-in-out ${animate ? 'bg-black/50' : 'bg-transparent'}`}
      onClick={onClose}
    >
      <div
        className={`flex w-full max-w-2xl flex-col bg-white shadow-xl transition-all duration-300 ease-in-out ${animate ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description ? <p className="mt-0.5 text-sm text-gray-500">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

function FormField({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
    />
  );
}

function Select({
  value,
  onChange,
  options,
  required,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required={required}
      disabled={disabled}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function TextArea({
  value,
  onChange,
  rows = 3,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={rows}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    />
  );
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

function LoadingSkeleton({ columnCount = 6 }: { columnCount?: number }) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: columnCount }).map((_, index) => (
                  <th key={index} className="px-4 py-3">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan={columnCount} className="px-4 py-3">
                    <div className="h-6 animate-pulse rounded bg-gray-100" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function renderCell(cell: BankTransactionCell, index: number) {
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

function getStaticActionIcon(icon: StaticTab['actions'][number]['icon']) {
  if (icon === 'upload') return Upload;
  if (icon === 'download') return Download;
  if (icon === 'plus') return Plus;
  return RefreshCw;
}

function StaticTabPanel({ tab }: { tab: StaticTab }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">{tab.label}</h2>
          <p className="text-sm text-gray-600">{tab.description}</p>
          <p className="text-sm text-gray-500">{tab.rows.length} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tab.actions.map((action) => {
            const Icon = getStaticActionIcon(action.icon);
            return (
              <button
                key={`${tab.id}-${action.label}`}
                type="button"
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses(action.variant)}`}
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {tab.metrics.map((metric) => (
          <div key={`${tab.id}-${metric.label}`}>
            <MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1 max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={tab.searchPlaceholder}
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tab.quickFilters.map((filter, index) => (
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
            <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export View
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {tab.columns.map((column) => (
                      <th key={`${tab.id}-${column}`} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        {column}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {tab.rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.cells.map((cell, index) => renderCell(cell, index))}
                      <td className="px-4 py-3 text-right">
                        <button type="button" className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
                          View
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

function BankTransactionsPanel() {
  const [data, setData] = useState<BankTransactionRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<BankTransactionFilterState>({ statuses: [], directions: [], coverageStates: [] });
  const [draftFilters, setDraftFilters] = useState<BankTransactionFilterState>({ statuses: [], directions: [], coverageStates: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const [viewDetail, setViewDetail] = useState<BankTransactionDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);

  const [createForm, setCreateForm] = useState<BankTransactionFormState>(createEmptyForm());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<BankTransactionFormState>(createEmptyForm());
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<BankTransactionRow | null>(null);
  const [deleteDetail, setDeleteDetail] = useState<BankTransactionDetail | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filterCount = filters.statuses.length + filters.directions.length + filters.coverageStates.length;

  const fetchData = useCallback(
    async ({
      search,
      page,
      nextFilters,
      nextQuickFilters,
    }: {
      search: string;
      page: number;
      nextFilters: BankTransactionFilterState;
      nextQuickFilters: string[];
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getBankTransactions({
          search,
          page,
          statuses: nextFilters.statuses,
          directions: nextFilters.directions,
          coverageStates: nextFilters.coverageStates,
          quickFilters: nextQuickFilters,
        });
        setData(response);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load bank transactions.');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchData({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  }, [currentPage, fetchData, filters, quickFilters, submittedSearch]);

  const handleRefresh = () => {
    void fetchData({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput);
    setCurrentPage(1);
    void fetchData({
      search: searchInput,
      page: 1,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  };

  const handleToggleQuickFilter = (value: string) => {
    setQuickFilters((previous) => toggleFilterValue(previous, value));
    setCurrentPage(1);
  };

  const handleExport = () => {
    if (!data?.rows.length) return;
    const headers = ['Date', 'Bank Account', 'Reference', 'Counterparty', 'Amount', 'Status', 'Direction', 'Matched Entity'];
    const csvRows = data.rows.map((row) => [
      row.transactionDateLabel,
      row.bankAccountLabel,
      row.referenceNumber || '-',
      row.description || '-',
      row.netAmountLabel,
      row.matchStatusLabel,
      row.directionLabel,
      row.hasMatchLink ? `${row.matchedEntityTypeLabel || row.matchedEntityType} ${row.matchedEntityId}` : '-',
    ]);
    const csvContent = [headers, ...csvRows].map((row) => row.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bank-transactions.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenView = async (id: string) => {
    setIsViewOpen(true);
    setIsViewLoading(true);
    setViewDetail(null);
    try {
      const detail = await getBankTransactionDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load transaction detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setCreateForm(createEmptyForm());
    setCreateError(null);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreateError(null);
    setIsCreateSubmitting(true);
    try {
      await createBankTransaction(toMutationInput(createForm));
      setIsCreateOpen(false);
      setCurrentPage(1);
      await fetchData({
        search: submittedSearch,
        page: 1,
        nextFilters: filters,
        nextQuickFilters: quickFilters,
      });
    } catch (submissionError) {
      setCreateError(submissionError instanceof Error ? submissionError.message : 'Unable to create bank transaction.');
    } finally {
      setIsCreateSubmitting(false);
    }
  };

  const handleOpenEdit = async (id: string) => {
    setEditingId(id);
    setEditError(null);
    setIsEditOpen(true);
    setIsEditLoading(true);
    try {
      const detail = await getBankTransactionDetail(id);
      setEditForm(buildFormFromDetail(detail));
    } catch (detailError) {
      setEditError(detailError instanceof Error ? detailError.message : 'Unable to load transaction detail.');
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingId) return;
    setEditError(null);
    setIsEditSubmitting(true);
    try {
      await updateBankTransaction(editingId, toMutationInput(editForm));
      setIsEditOpen(false);
      setEditingId(null);
      handleRefresh();
    } catch (submissionError) {
      setEditError(submissionError instanceof Error ? submissionError.message : 'Unable to update bank transaction.');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleOpenDelete = async (row: BankTransactionRow) => {
    setDeleteTarget(row);
    setDeleteDetail(null);
    setDeleteError(null);
    setIsDeleteOpen(true);
    setIsDeleteLoading(true);
    try {
      const detail = await getBankTransactionDetail(row.id);
      setDeleteDetail(detail);
    } catch (detailError) {
      setDeleteError(detailError instanceof Error ? detailError.message : 'Unable to load transaction detail.');
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleteSubmitting(true);
    setDeleteError(null);
    try {
      await deleteBankTransaction(deleteTarget.id);
      setIsDeleteOpen(false);
      setDeleteTarget(null);
      setDeleteDetail(null);
      handleRefresh();
    } catch (deletionError) {
      setDeleteError(deletionError instanceof Error ? deletionError.message : 'Unable to delete bank transaction.');
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  const bankAccountOptions = [{ label: 'Select bank account', value: '' }].concat(
    (data?.referenceData.bankAccounts || [])
      .filter((account) => account.isActive)
      .map((account) => ({
        label: `${account.accountName || 'Unnamed bank account'}${account.accountNumberMasked ? ` (${account.accountNumberMasked})` : ''}`,
        value: String(account.id),
      })),
  );

  const matchedEntityTypeOptions = [{ label: 'No matched entity', value: '' }].concat(
    (data?.referenceData.matchedEntityTypes || []).map((entityType) => ({
      label: entityType.label,
      value: entityType.value,
    })),
  );

  const liveColumns = data?.meta.columns || LIVE_TAB.columns;
  const mutableIds = new Set(data?.flags.mutableTransactionIds || []);

  const renderForm = (
    formState: BankTransactionFormState,
    setFormState: React.Dispatch<React.SetStateAction<BankTransactionFormState>>,
    submitLabel: string,
    isSubmitting: boolean,
    errorMessage: string | null,
    onCancel: () => void,
    onSubmit: (event: React.FormEvent) => void,
  ) => (
    <form onSubmit={onSubmit} className="space-y-6">
      {errorMessage ? (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Bank Account" required>
          <Select
            value={formState.bankAccount}
            onChange={(value) => setFormState((previous) => ({ ...previous, bankAccount: value }))}
            options={bankAccountOptions}
            required
          />
        </FormField>
        <FormField label="Match Status" required>
          <Select
            value={formState.matchStatus}
            onChange={(value) => setFormState((previous) => ({ ...previous, matchStatus: value }))}
            options={(data?.filterOptions.statuses || []).map((status) => ({ label: status.label, value: status.value }))}
            required
          />
        </FormField>
        <FormField label="Transaction Date" required>
          <Input type="date" value={formState.transactionDate} onChange={(value) => setFormState((previous) => ({ ...previous, transactionDate: value }))} required />
        </FormField>
        <FormField label="Value Date">
          <Input type="date" value={formState.valueDate} onChange={(value) => setFormState((previous) => ({ ...previous, valueDate: value }))} />
        </FormField>
        <FormField label="Reference Number">
          <Input value={formState.referenceNumber} onChange={(value) => setFormState((previous) => ({ ...previous, referenceNumber: value }))} placeholder="e.g. BNK-240531-019" />
        </FormField>
        <FormField label="Matched Entity Type">
          <Select
            value={formState.matchedEntityType}
            onChange={(value) => setFormState((previous) => ({ ...previous, matchedEntityType: value }))}
            options={matchedEntityTypeOptions}
          />
        </FormField>
        <FormField label="Amount In" required>
          <Input type="number" value={formState.amountIn} onChange={(value) => setFormState((previous) => ({ ...previous, amountIn: value }))} required />
        </FormField>
        <FormField label="Amount Out" required>
          <Input type="number" value={formState.amountOut} onChange={(value) => setFormState((previous) => ({ ...previous, amountOut: value }))} required />
        </FormField>
        <FormField label="Running Balance">
          <Input type="number" value={formState.runningBalance} onChange={(value) => setFormState((previous) => ({ ...previous, runningBalance: value }))} />
        </FormField>
        <FormField label="Matched Entity ID">
          <Input value={formState.matchedEntityId} onChange={(value) => setFormState((previous) => ({ ...previous, matchedEntityId: value }))} placeholder="Enter linked record ID" />
        </FormField>
      </div>

      <FormField label="Counterparty / Description" required>
        <Input value={formState.description} onChange={(value) => setFormState((previous) => ({ ...previous, description: value }))} required />
      </FormField>

      <FormField label="Notes / Memo">
        <TextArea value={formState.notes} onChange={(value) => setFormState((previous) => ({ ...previous, notes: value }))} rows={4} />
      </FormField>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h4 className="text-sm font-semibold text-gray-900">Movement Preview</h4>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Net Movement</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">{Number(formState.amountIn || 0) - Number(formState.amountOut || 0)}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Entity Link</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">{formState.matchedEntityType && formState.matchedEntityId ? 'Ready' : 'Not Linked'}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Running Balance</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">{formState.runningBalance || '-'}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>
          {isSubmitting ? `${submitLabel}...` : submitLabel}
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">{data?.meta.label || LIVE_TAB.label}</h2>
          <p className="text-sm text-gray-600">{data?.meta.description || LIVE_TAB.description}</p>
          <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" />
            Refresh Feed
          </button>
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
            <Plus className="h-4 w-4" />
            Create Manual Transaction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {(data?.metrics || []).map((metric) => (
          <div key={metric.id}>
            <MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <form onSubmit={handleSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={data?.meta.searchPlaceholder || LIVE_TAB.searchPlaceholder}
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700">
                <Search className="h-4 w-4" />
                Search
              </button>
            </form>
            <button
              type="button"
              onClick={() => {
                if (!isFilterPanelOpen) setDraftFilters({ ...filters });
                setIsFilterPanelOpen((previous) => !previous);
              }}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isFilterPanelOpen || filterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {filterCount > 0 ? <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{filterCount}</span> : null}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(data?.filterOptions.quickFilters || []).map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => handleToggleQuickFilter(filter.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${quickFilters.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 p-5">
          {isFilterPanelOpen ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Filters</h4>
                  <p className="mt-1 text-sm text-gray-600">Select as many filter values as needed. Bank transaction filters widen results using OR behavior across all checked options.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => { setDraftFilters({ statuses: [], directions: [], coverageStates: [] }); setFilters({ statuses: [], directions: [], coverageStates: [] }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    Clear all
                  </button>
                  <button type="button" onClick={() => setIsFilterPanelOpen(false)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="button" onClick={() => { setFilters({ ...draftFilters }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
                    Apply Filters
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-3">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.statuses || []).map((option) => {
                      const isSelected = draftFilters.statuses.includes(option.value);
                      return (
                        <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Direction</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.directions || []).map((option) => {
                      const isSelected = draftFilters.directions.includes(option.value);
                      return (
                        <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, directions: toggleFilterValue(previous.directions, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Coverage</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.coverageStates || []).map((option) => {
                      const isSelected = draftFilters.coverageStates.includes(option.value);
                      return (
                        <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, coverageStates: toggleFilterValue(previous.coverageStates, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">{data?.meta.tableTitle || 'Incoming Transaction Queue'}</h3>
              <p className="text-sm text-gray-600">{data?.meta.tableDescription || 'Operational queue for bank transactions waiting to be matched, reviewed, or maintained.'}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span>{data?.totals.filteredRows ?? 0} matching rows</span>
              <button type="button" onClick={handleExport} disabled={!(data?.rows.length)} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
                <Download className="h-4 w-4" />
                Export View
              </button>
            </div>
          </div>

          {error ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <LoadingSkeleton columnCount={liveColumns.length + 1} />
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {liveColumns.map((column) => {
                          const columnLabel = typeof column === 'string' ? column : column.label;
                          const align = typeof column === 'string' ? 'left' : column.align;
                          return (
                            <th key={columnLabel} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${align === 'right' ? 'text-right' : 'text-left'}`}>
                              {columnLabel}
                            </th>
                          );
                        })}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {(data?.rows || []).length > 0 ? (
                        (data?.rows || []).map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50">
                            {row.cells.map((cell, index) => renderCell(cell, index))}
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => handleOpenView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => handleOpenEdit(row.id)} disabled={!mutableIds.has(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40" title={mutableIds.has(row.id) ? 'Edit' : 'Matched transactions cannot be edited directly'}>
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => handleOpenDelete(row)} disabled={!mutableIds.has(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40" title={mutableIds.has(row.id) ? 'Delete' : 'Matched transactions cannot be deleted directly'}>
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={liveColumns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">
                            No bank transactions match the current search and filter combination.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {data?.pagination && data.pagination.totalPages > 1 ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Page {data.pagination.page} of {data.pagination.totalPages}</p>
                  <div className="flex gap-2">
                    <button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">
                      Previous
                    </button>
                    <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Bank Transaction Detail" description="Review the selected bank transaction including bank account mapping, movement, and match status.">
        {isViewLoading ? (
          <LoadingSkeleton columnCount={2} />
        ) : viewDetail ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['Bank Account', viewDetail.bankAccountLabel],
                ['Bank Account Type', viewDetail.bankAccountType || '-'],
                ['Ledger Account', viewDetail.bankLedgerAccountLabel || '-'],
                ['Transaction Date', viewDetail.transactionDateLabel],
                ['Value Date', viewDetail.valueDateLabel],
                ['Reference Number', viewDetail.referenceNumber || '-'],
                ['Direction', viewDetail.directionLabel],
                ['Match Status', viewDetail.matchStatusLabel],
                ['Matched Entity Type', viewDetail.matchedEntityTypeLabel || '-'],
                ['Matched Entity ID', viewDetail.matchedEntityId || '-'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                  <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                ['Amount In', viewDetail.amountInLabel],
                ['Amount Out', viewDetail.amountOutLabel],
                ['Net Movement', viewDetail.netAmountLabel],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900">Counterparty / Description</h4>
              <p className="mt-2 text-sm text-gray-700">{viewDetail.description || '-'}</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900">Notes / Memo</h4>
              <p className="mt-2 text-sm text-gray-700">{getMetadataNote(viewDetail.metadata) || '-'}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No detail available.</p>
        )}
      </SlideOver>

      <SlideOver isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Manual Transaction" description="Create a manual bank transaction entry using the current banking-cash register contract.">
        {renderForm(createForm, setCreateForm, 'Create Transaction', isCreateSubmitting, createError, () => setIsCreateOpen(false), handleCreateSubmit)}
      </SlideOver>

      <SlideOver isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Bank Transaction" description="Update the selected bank transaction before it becomes a locked matched item.">
        {isEditLoading ? (
          <LoadingSkeleton columnCount={2} />
        ) : (
          renderForm(editForm, setEditForm, 'Save Changes', isEditSubmitting, editError, () => setIsEditOpen(false), handleEditSubmit)
        )}
      </SlideOver>

      <SlideOver isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Bank Transaction" description="Delete this bank transaction only when it is not already linked to another accounting entity.">
        <div className="space-y-6">
          {deleteError ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {deleteError}
            </div>
          ) : null}

          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Delete {deleteTarget?.referenceNumber || deleteTarget?.description || 'this transaction'}?</p>
            <p className="mt-1">This action cannot be undone.</p>
          </div>

          {isDeleteLoading ? (
            <LoadingSkeleton columnCount={2} />
          ) : deleteDetail ? (
            <div className="space-y-4">
              {!deleteDetail.usageSummary.canDelete ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <p className="font-medium">Delete is blocked.</p>
                  <p className="mt-1">This transaction is already linked to a matched accounting entity.</p>
                </div>
              ) : null}
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-sm text-gray-500">Bank Account</span>
                  <span className="text-sm font-medium text-gray-900">{deleteDetail.bankAccountLabel}</span>
                </div>
                <div className="mt-3 flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-sm text-gray-500">Transaction Date</span>
                  <span className="text-sm font-medium text-gray-900">{deleteDetail.transactionDateLabel}</span>
                </div>
                <div className="mt-3 flex justify-between">
                  <span className="text-sm text-gray-500">Net Movement</span>
                  <span className="text-sm font-medium text-gray-900">{deleteDetail.netAmountLabel}</span>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setIsDeleteOpen(false)} disabled={isDeleteSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleteSubmitting || (deleteDetail ? !deleteDetail.usageSummary.canDelete : true)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {isDeleteSubmitting ? 'Deleting...' : 'Delete Transaction'}
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}

export function BankOperationsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId =
    rawTab === 'statement-imports' || rawTab === 'bank-feeds' || rawTab === 'bank-transactions'
      ? rawTab
      : 'bank-transactions';

  const tabs = useMemo(
    () => [
      { id: LIVE_TAB.id, label: LIVE_TAB.label },
      ...STATIC_TABS.map((tab) => ({ id: tab.id, label: tab.label })),
    ],
    [],
  );

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const currentStaticTab = STATIC_TABS.find((tab) => tab.id === activeTab);

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
              <h1 className="text-2xl font-bold text-gray-900">Bank Operations</h1>
              <p className="mt-1 max-w-3xl text-sm text-gray-600">Manage bank transaction intake, statement imports, and connected bank feeds in one operations workspace.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => {
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
        {activeTab === 'bank-transactions' ? (
          <BankTransactionsPanel />
        ) : activeTab === 'statement-imports' ? (
          <StatementImportsPanel />
        ) : currentStaticTab ? (
          <StaticTabPanel tab={currentStaticTab} />
        ) : null}
      </div>
    </div>
  );
}
