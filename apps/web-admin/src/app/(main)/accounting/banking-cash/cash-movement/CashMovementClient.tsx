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
  SendHorizonal,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import {
  createDeposit,
  deleteDeposit,
  getDepositDetail,
  getDeposits,
  postDeposit,
  updateDeposit,
  type DepositCell,
  type DepositDetail,
  type DepositMetric,
  type DepositMutationInput,
  type DepositRegisterResponse,
  type DepositRow,
} from './actions';
import { TransfersUndepositedPanel } from './TransfersUndepositedPanel';
import { BouncedPaymentsPanel } from './BouncedPaymentsPanel';

type TabId = 'deposits' | 'transfers-undeposited' | 'bounced-payments';

type DepositFilterState = {
  statuses: string[];
  bankAccounts: string[];
  coverageStates: string[];
};

type DepositFormState = {
  depositNumber: string;
  depositDate: string;
  bankAccount: string;
  sourceAccount: string;
  amount: string;
  notes: string;
};

type StaticMetric = {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

type StaticTab = {
  id: Exclude<TabId, 'deposits'>;
  label: string;
  description: string;
  searchPlaceholder: string;
  quickFilters: string[];
  actions: Array<{
    label: string;
    icon: 'plus' | 'download' | 'refresh';
    variant: 'primary' | 'secondary' | 'ghost';
  }>;
  metrics: StaticMetric[];
  tableTitle: string;
  tableDescription: string;
  columns: string[];
  rows: Array<{ id: string; cells: DepositCell[] }>;
};

const LIVE_TAB = {
  id: 'deposits' as const,
  label: 'Deposits',
  description: 'Track deposit drafts, posted batches, journal linkage, and source-account coverage using live deposit records.',
  searchPlaceholder: 'Search deposit batch, bank account, source account, note, or prepared by',
};

const STATIC_TABS: StaticTab[] = [
  {
    id: 'transfers-undeposited',
    label: 'Transfers & Undeposited Funds',
    description: 'Monitor internal transfers and cash still waiting to be deposited.',
    searchPlaceholder: 'Search transfer id, source account, receipt batch, or destination account',
    quickFilters: ['Transfers Pending', 'Undeposited Receipts', 'Internal Moves', 'Exceptions'],
    actions: [
      { label: 'Create Transfer', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Balances', icon: 'refresh', variant: 'secondary' },
      { label: 'Download Cash Staging', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Pending Transfers', value: '5', change: '2 awaiting approval', trend: 'neutral' },
      { label: 'Undeposited Funds', value: 'PHP 412,700', change: '26 receipts not batched', trend: 'up' },
      { label: 'Internal Cash Moves Today', value: 'PHP 920,000', change: 'Across 4 bank hops', trend: 'up' },
      { label: 'Staging Exceptions', value: '3', change: '1 deposit batch overdue', trend: 'down' },
    ],
    tableTitle: 'Cash Movement Queue',
    tableDescription: 'Combined view of transfers, staged receipts, and undeposited amounts that still need action.',
    columns: ['Movement', 'Source', 'Destination / Batch', 'Owner', 'Amount', 'Status'],
    rows: [
      {
        id: 'mov-1',
        cells: [
          { text: 'TRF-2026-0531-04', emphasis: true },
          'RCBC Reserve',
          'BDO Operations',
          'Treasury Team',
          { text: 'PHP 250,000', emphasis: true, align: 'right' },
          { text: 'Pending Approval', tone: 'amber' },
        ],
      },
      {
        id: 'mov-2',
        cells: [
          { text: 'Undeposited Batch UDF-118', emphasis: true },
          'Cashier Receipts',
          'Awaiting Deposit Group',
          'Front Desk',
          { text: 'PHP 68,200', emphasis: true, align: 'right' },
          { text: 'Needs Batch', tone: 'blue' },
        ],
      },
      {
        id: 'mov-3',
        cells: [
          { text: 'TRF-2026-0530-11', emphasis: true },
          'Metrobank Main',
          'UnionBank Payroll',
          'Treasury Team',
          { text: 'PHP 430,000', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'mov-4',
        cells: [
          { text: 'Undeposited Batch UDF-104', emphasis: true },
          'Collections Desk',
          'Stale Since Yesterday',
          'Cashier Lead',
          { text: 'PHP 17,500', emphasis: true, align: 'right' },
          { text: 'Overdue', tone: 'red' },
        ],
      },
    ],
  },
  {
    id: 'bounced-payments',
    label: 'Bounced Payments',
    description: 'Track failed incoming payments, reversals, charges, and resolution progress.',
    searchPlaceholder: 'Search case id, invoice no., payer, or reversal reference',
    quickFilters: ['Open Cases', 'Awaiting Reversal', 'Charges Applied', 'Resolved'],
    actions: [
      { label: 'Create Bounce Case', icon: 'plus', variant: 'primary' },
      { label: 'Post Reversal', icon: 'refresh', variant: 'secondary' },
      { label: 'Export Case Log', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Open Bounce Cases', value: '6', change: '2 require same-day reversal', trend: 'down' },
      { label: 'Bank Charges', value: 'PHP 3,250', change: 'Month to date', trend: 'up' },
      { label: 'Recovery Rate', value: '71%', change: 'Recovered within 14 days', trend: 'up' },
      { label: 'Customer Follow-ups', value: '4', change: 'Pending collections outreach', trend: 'neutral' },
    ],
    tableTitle: 'Bounced Payment Caseboard',
    tableDescription: 'Track every failed payment from bank notification to reversal, charge posting, and recovery handling.',
    columns: ['Case ID', 'Customer', 'Original Receipt', 'Bounce Reason', 'Exposure', 'Case Status'],
    rows: [
      {
        id: 'bpc-1',
        cells: [
          { text: 'BNC-2026-042', emphasis: true },
          'Harbor Training Ltd.',
          'RCT-2026-1183',
          'Insufficient funds',
          { text: 'PHP 24,500', emphasis: true, align: 'right' },
          { text: 'Awaiting Reversal', tone: 'red' },
        ],
      },
      {
        id: 'bpc-2',
        cells: [
          { text: 'BNC-2026-041', emphasis: true },
          'Blue Anchor Marine',
          'RCT-2026-1179',
          'Account closed',
          { text: 'PHP 12,000', emphasis: true, align: 'right' },
          { text: 'Collections Follow-up', tone: 'amber' },
        ],
      },
      {
        id: 'bpc-3',
        cells: [
          { text: 'BNC-2026-039', emphasis: true },
          'SM Shipping Corp.',
          'RCT-2026-1164',
          'Payment recalled',
          { text: 'PHP 86,500', emphasis: true, align: 'right' },
          { text: 'Resolved', tone: 'green' },
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

function getMetricTone(trend: DepositMetric['trend'] | StaticMetric['trend']) {
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

function toDateInputValue(value: string | null | undefined) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function createEmptyForm(): DepositFormState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    depositNumber: '',
    depositDate: today,
    bankAccount: '',
    sourceAccount: '',
    amount: '0',
    notes: '',
  };
}

function buildFormFromDetail(detail: DepositDetail): DepositFormState {
  return {
    depositNumber: detail.depositNumber || '',
    depositDate: toDateInputValue(detail.depositDate),
    bankAccount: detail.bankAccountId || '',
    sourceAccount: detail.sourceAccountId || '',
    amount: String(detail.amount || 0),
    notes: detail.notes || '',
  };
}

function toMutationInput(formState: DepositFormState): DepositMutationInput {
  return {
    depositNumber: formState.depositNumber.trim() || null,
    depositDate: formState.depositDate,
    bankAccount: formState.bankAccount,
    sourceAccount: formState.sourceAccount,
    amount: Number(formState.amount || 0),
    notes: formState.notes.trim() || null,
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

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
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

function TextArea({ value, onChange, rows = 3 }: { value: string; onChange: (value: string) => void; rows?: number }) {
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

function renderCell(cell: DepositCell, index: number) {
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
            <button key={action.label} type="button" className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses(action.variant)}`}>
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
              <input type="text" placeholder={tab.searchPlaceholder} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </div>
            <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tab.quickFilters.map((filter, index) => (
              <button key={filter} type="button" className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${index === 0 ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
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
                      <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Amount' || column === 'Exposure' ? 'text-right' : 'text-left'}`}>
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
                        <button type="button" className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
                          <Eye className="h-4 w-4" />
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

function DepositsPanel() {
  const [data, setData] = useState<DepositRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<DepositFilterState>({ statuses: [], bankAccounts: [], coverageStates: [] });
  const [draftFilters, setDraftFilters] = useState<DepositFilterState>({ statuses: [], bankAccounts: [], coverageStates: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const [viewDetail, setViewDetail] = useState<DepositDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);

  const [createForm, setCreateForm] = useState<DepositFormState>(createEmptyForm());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<DepositFormState>(createEmptyForm());
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<DepositRow | null>(null);
  const [deleteDetail, setDeleteDetail] = useState<DepositDetail | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [postTarget, setPostTarget] = useState<DepositDetail | null>(null);
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [isPostSubmitting, setIsPostSubmitting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const filterCount = filters.statuses.length + filters.bankAccounts.length + filters.coverageStates.length;

  const fetchRegister = useCallback(
    async ({
      search,
      page,
      nextFilters,
      nextQuickFilters,
    }: {
      search: string;
      page: number;
      nextFilters: DepositFilterState;
      nextQuickFilters: string[];
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getDeposits({
          search,
          page,
          statuses: nextFilters.statuses,
          bankAccounts: nextFilters.bankAccounts,
          coverageStates: nextFilters.coverageStates,
          quickFilters: nextQuickFilters,
        });
        setData(response);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load deposits.');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchRegister({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  }, [currentPage, fetchRegister, filters, quickFilters, submittedSearch]);

  const handleRefresh = () => {
    void fetchRegister({
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
    void fetchRegister({
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
    const headers = ['Batch No.', 'Deposit Date', 'Bank Account', 'Source Account', 'Amount', 'Status', 'Journal', 'Prepared By'];
    const csvRows = data.rows.map((row) => [
      row.depositNumber,
      row.depositDateLabel,
      row.bankAccountLabel,
      row.sourceAccountLabel,
      row.amountLabel,
      row.statusLabel,
      row.postedJournalEntryLabel,
      row.preparedByLabel,
    ]);
    const csvContent = [headers, ...csvRows].map((row) => row.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cash-movement-deposits.csv';
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
      const detail = await getDepositDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load deposit detail.');
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
      await createDeposit(toMutationInput(createForm));
      setIsCreateOpen(false);
      setCurrentPage(1);
      await fetchRegister({ search: submittedSearch, page: 1, nextFilters: filters, nextQuickFilters: quickFilters });
    } catch (submissionError) {
      setCreateError(submissionError instanceof Error ? submissionError.message : 'Unable to create deposit.');
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
      const detail = await getDepositDetail(id);
      setEditForm(buildFormFromDetail(detail));
    } catch (detailError) {
      setEditError(detailError instanceof Error ? detailError.message : 'Unable to load deposit detail.');
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
      await updateDeposit(editingId, toMutationInput(editForm));
      setIsEditOpen(false);
      setEditingId(null);
      handleRefresh();
    } catch (submissionError) {
      setEditError(submissionError instanceof Error ? submissionError.message : 'Unable to update deposit.');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleOpenDelete = async (row: DepositRow) => {
    setDeleteTarget(row);
    setDeleteDetail(null);
    setDeleteError(null);
    setIsDeleteOpen(true);
    setIsDeleteLoading(true);
    try {
      const detail = await getDepositDetail(row.id);
      setDeleteDetail(detail);
    } catch (detailError) {
      setDeleteError(detailError instanceof Error ? detailError.message : 'Unable to load deposit detail.');
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleteSubmitting(true);
    setDeleteError(null);
    try {
      await deleteDeposit(deleteTarget.id);
      setIsDeleteOpen(false);
      setDeleteTarget(null);
      setDeleteDetail(null);
      handleRefresh();
    } catch (deletionError) {
      setDeleteError(deletionError instanceof Error ? deletionError.message : 'Unable to delete deposit.');
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  const handleOpenPost = async (row: DepositRow) => {
    setPostError(null);
    setIsPostOpen(true);
    try {
      const detail = await getDepositDetail(row.id);
      setPostTarget(detail);
    } catch (detailError) {
      setPostError(detailError instanceof Error ? detailError.message : 'Unable to load deposit detail.');
    }
  };

  const handleConfirmPost = async () => {
    if (!postTarget) return;
    setIsPostSubmitting(true);
    setPostError(null);
    try {
      await postDeposit(postTarget.id);
      setIsPostOpen(false);
      setPostTarget(null);
      handleRefresh();
    } catch (postingError) {
      setPostError(postingError instanceof Error ? postingError.message : 'Unable to post deposit.');
    } finally {
      setIsPostSubmitting(false);
    }
  };

  const bankAccountOptions = [{ label: 'Select bank account', value: '' }].concat(
    (data?.referenceData.bankAccounts || []).map((account) => ({
      label: `${account.accountName || account.bankName || 'Unnamed bank account'}${account.accountNumberMasked ? ` (${account.accountNumberMasked})` : ''}`,
      value: String(account.id),
    })),
  );

  const sourceAccountOptions = [{ label: 'Select source account', value: '' }].concat(
    (data?.referenceData.sourceAccounts || []).map((account) => ({
      label: `${account.code ? `${account.code} - ` : ''}${account.name || `Account ${account.id}`}`,
      value: String(account.id),
    })),
  );

  const renderForm = (
    formState: DepositFormState,
    setFormState: React.Dispatch<React.SetStateAction<DepositFormState>>,
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
        <FormField label="Deposit Batch No.">
          <Input value={formState.depositNumber} onChange={(value) => setFormState((previous) => ({ ...previous, depositNumber: value }))} placeholder="Auto-generated when blank" />
        </FormField>
        <FormField label="Deposit Date" required>
          <Input type="date" value={formState.depositDate} onChange={(value) => setFormState((previous) => ({ ...previous, depositDate: value }))} required />
        </FormField>
        <FormField label="Bank Account" required>
          <Select value={formState.bankAccount} onChange={(value) => setFormState((previous) => ({ ...previous, bankAccount: value }))} options={bankAccountOptions} required />
        </FormField>
        <FormField label="Source Account" required>
          <Select value={formState.sourceAccount} onChange={(value) => setFormState((previous) => ({ ...previous, sourceAccount: value }))} options={sourceAccountOptions} required />
        </FormField>
        <FormField label="Batch Amount" required>
          <Input type="number" value={formState.amount} onChange={(value) => setFormState((previous) => ({ ...previous, amount: value }))} required />
        </FormField>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h4 className="text-sm font-semibold text-gray-900">Posting Guidance</h4>
        <p className="mt-1 text-sm text-gray-600">Draft deposits can be reviewed and edited here, then posted later from the table using the dedicated Post action.</p>
      </div>

      <FormField label="Notes">
        <TextArea value={formState.notes} onChange={(value) => setFormState((previous) => ({ ...previous, notes: value }))} rows={4} />
      </FormField>

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
          <h2 className="text-lg font-semibold text-gray-900">{data?.meta.label || 'Deposits'}</h2>
          <p className="text-sm text-gray-600">{data?.meta.description || LIVE_TAB.description}</p>
          <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" />
            Refresh Deposits
          </button>
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
            <Plus className="h-4 w-4" />
            New Deposit Batch
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
                  <p className="mt-1 text-sm text-gray-600">Select as many filter values as needed. Deposits filters widen results using OR behavior across all checked options.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => { setDraftFilters({ statuses: [], bankAccounts: [], coverageStates: [] }); setFilters({ statuses: [], bankAccounts: [], coverageStates: [] }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">
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
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Bank Account</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.bankAccounts || []).map((option) => {
                      const isSelected = draftFilters.bankAccounts.includes(option.value);
                      return (
                        <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, bankAccounts: toggleFilterValue(previous.bankAccounts, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>
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
              <h3 className="text-base font-semibold text-gray-900">{data?.meta.tableTitle || 'Deposit Register'}</h3>
              <p className="text-sm text-gray-600">{data?.meta.tableDescription || 'Live register of deposit records and their posting progress.'}</p>
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
            <LoadingSkeleton columnCount={(data?.meta.columns || []).length + 1 || 7} />
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {(data?.meta.columns || ['Batch No.', 'Deposit Date', 'Bank Account', 'Source Account', { label: 'Batch Amount', align: 'right' }, 'Status']).map((column) => {
                          const label = typeof column === 'string' ? column : column.label;
                          const align = typeof column === 'string' ? 'left' : column.align;
                          return (
                            <th key={label} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${align === 'right' ? 'text-right' : 'text-left'}`}>
                              {label}
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
                                <button type="button" onClick={() => handleOpenPost(row)} disabled={!row.isDraft} className="inline-flex items-center gap-1 rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40" title={row.isDraft ? 'Post deposit' : 'Only draft deposits can be posted'}>
                                  <SendHorizonal className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => handleOpenEdit(row.id)} disabled={!row.isDraft} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40" title={row.isDraft ? 'Edit' : 'Only draft deposits can be edited'}>
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => handleOpenDelete(row)} disabled={!row.isDraft} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40" title={row.isDraft ? 'Delete' : 'Only draft deposits can be deleted'}>
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                            No deposit rows match the current search and filter combination.
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

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Deposit Detail" description="Review posting state, journal linkage, bank destination, and source clearing account for the selected deposit batch.">
        {isViewLoading ? (
          <LoadingSkeleton columnCount={2} />
        ) : viewDetail ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['Deposit Batch No.', viewDetail.depositNumber || '-'],
                ['Deposit Date', viewDetail.depositDateLabel],
                ['Bank Account', viewDetail.bankAccountLabel],
                ['Bank Ledger Account', viewDetail.bankLedgerAccountLabel || '-'],
                ['Source Account', viewDetail.sourceAccountLabel],
                ['Amount', viewDetail.amountLabel],
                ['Status', viewDetail.statusLabel],
                ['Journal Link', viewDetail.postedJournalEntryLabel],
                ['Prepared By', viewDetail.preparedByLabel],
                ['Updated By', viewDetail.updatedByLabel],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                  <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900">Notes</h4>
              <p className="mt-2 text-sm text-gray-700">{viewDetail.notes || '-'}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No detail available.</p>
        )}
      </SlideOver>

      <SlideOver isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="New Deposit Batch" description="Create a draft deposit record using the real deposit collection in the accounting backend.">
        {renderForm(createForm, setCreateForm, 'Create Deposit', isCreateSubmitting, createError, () => setIsCreateOpen(false), handleCreateSubmit)}
      </SlideOver>

      <SlideOver isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Deposit Batch" description="Update a draft deposit before it is posted into journals.">
        {isEditLoading ? (
          <LoadingSkeleton columnCount={2} />
        ) : (
          renderForm(editForm, setEditForm, 'Save Changes', isEditSubmitting, editError, () => setIsEditOpen(false), handleEditSubmit)
        )}
      </SlideOver>

      <SlideOver isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Deposit Batch" description="Delete this draft deposit record only if it has not been posted.">
        <div className="space-y-6">
          {deleteError ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {deleteError}
            </div>
          ) : null}

          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Delete {deleteTarget?.depositNumber || 'this deposit batch'}?</p>
            <p className="mt-1">This action cannot be undone.</p>
          </div>

          {isDeleteLoading ? (
            <LoadingSkeleton columnCount={2} />
          ) : deleteDetail ? (
            <div className="space-y-4">
              {!deleteDetail.usageSummary.canDelete ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <p className="font-medium">Delete is blocked.</p>
                  <p className="mt-1">{deleteDetail.usageSummary.deleteBlockedReason || 'Posted or voided deposits cannot be deleted.'}</p>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setIsDeleteOpen(false)} disabled={isDeleteSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleteSubmitting || (deleteDetail ? !deleteDetail.usageSummary.canDelete : true)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {isDeleteSubmitting ? 'Deleting...' : 'Delete Deposit'}
            </button>
          </div>
        </div>
      </SlideOver>

      <SlideOver isOpen={isPostOpen} onClose={() => setIsPostOpen(false)} title="Post Deposit Batch" description="Post this draft deposit into journals using the existing accounting banking service.">
        <div className="space-y-6">
          {postError ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {postError}
            </div>
          ) : null}

          {postTarget ? (
            <>
              {!postTarget.usageSummary.canPost ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <p className="font-medium">Post is blocked.</p>
                  <p className="mt-1">{postTarget.usageSummary.postBlockedReason || 'This deposit cannot be posted yet.'}</p>
                </div>
              ) : null}

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-sm text-gray-500">Deposit Batch</span>
                  <span className="text-sm font-medium text-gray-900">{postTarget.depositNumber}</span>
                </div>
                <div className="mt-3 flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-sm text-gray-500">Bank Account</span>
                  <span className="text-sm font-medium text-gray-900">{postTarget.bankAccountLabel}</span>
                </div>
                <div className="mt-3 flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-sm text-gray-500">Source Account</span>
                  <span className="text-sm font-medium text-gray-900">{postTarget.sourceAccountLabel}</span>
                </div>
                <div className="mt-3 flex justify-between">
                  <span className="text-sm text-gray-500">Amount</span>
                  <span className="text-sm font-medium text-gray-900">{postTarget.amountLabel}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">Loading deposit detail...</p>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setIsPostOpen(false)} disabled={isPostSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={handleConfirmPost} disabled={isPostSubmitting || !postTarget?.usageSummary.canPost} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {isPostSubmitting ? 'Posting...' : 'Post Deposit'}
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}

export function CashMovementClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = (rawTab === 'transfers-undeposited' || rawTab === 'bounced-payments' ? rawTab : 'deposits');
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
              <h1 className="text-2xl font-bold text-gray-900">Cash Movement</h1>
              <p className="mt-1 max-w-3xl text-sm text-gray-600">Manage deposits, internal transfers, undeposited funds, and bounced payment exceptions in one cash-movement workspace.</p>
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
        {activeTab === 'deposits' ? (
          <DepositsPanel />
        ) : activeTab === 'transfers-undeposited' ? (
          <TransfersUndepositedPanel />
        ) : activeTab === 'bounced-payments' ? (
          <BouncedPaymentsPanel />
        ) : currentStaticTab ? (
          <StaticTabPanel tab={currentStaticTab} />
        ) : null}
      </div>
    </div>
  );
}
