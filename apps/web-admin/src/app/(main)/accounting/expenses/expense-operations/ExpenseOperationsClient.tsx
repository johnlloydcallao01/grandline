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
  Plus,
  RefreshCw,
  Search,
  SendHorizonal,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import {
  createExpense,
  deleteExpense,
  getExpenseDetail,
  getExpenseDetailRegister,
  getExpenses,
  postExpense,
  updateExpense,
  type ExpenseCell,
  type ExpenseDetail,
  type ExpenseDetailRegisterResponse,
  type ExpenseMetric,
  type ExpenseMutationInput,
  type ExpensesRegisterResponse,
} from './actions';

type TabId = 'expenses' | 'expense-detail';
type ExpenseFilterState = { statuses: string[]; paymentMethods: string[]; taxStates: string[] };
type ExpenseDetailFilterState = { statuses: string[]; vendorIds: string[]; coverageStates: string[] };

type ExpenseFormState = {
  expenseNumber: string;
  expenseDate: string;
  postingDate: string;
  vendor: string;
  expenseCategory: string;
  paymentMethod: 'cash' | 'bank' | 'card' | 'other';
  currency: string;
  subtotal: string;
  project: string;
  expenseAccount: string;
  taxCode: string;
  paymentAccount: string;
  bankAccount: string;
  notes: string;
};

type ErrorBannerState = {
  message: string;
  actionLabel?: string;
  actionHref?: string;
};

const TABS = [
  {
    id: 'expenses' as TabId,
    label: 'Expenses',
    description:
      'Manage direct expense records from initial entry through posting with clear register visibility and document follow-up.',
    searchPlaceholder: 'Search expense no., vendor, memo, category, or payment method',
    columns: ['Expense No.', 'Date', 'Vendor', 'Category', 'Amount', 'Status'],
    tableTitle: 'Expense Register',
    tableDescription:
      'Live operating list of direct expense records prioritized for review, posting, and documentation follow-up.',
  },
  {
    id: 'expense-detail' as TabId,
    label: 'Expense Detail',
    description:
      'Inspect expense headers, tax coding, support document coverage, and journal linkage using live expense records.',
    searchPlaceholder: 'Search expense no., vendor, tax code, document note, or journal ref',
    columns: ['Expense No.', 'Vendor', 'Tax Code', 'Documents', 'Journal Linked', 'Status'],
    tableTitle: 'Expense Detail Coverage',
    tableDescription:
      'Detail-oriented view of tax mapping, support documents, and posting references for each expense record.',
  },
];

const STATIC_EXPENSE_DETAIL = {
  metrics: [
    { id: 'expense-amount', label: 'Expense Amount', value: 'PHP 18,420', change: 'Stored on the expense record', trend: 'neutral' as const },
    { id: 'linked-documents', label: 'Linked Documents', value: '3 files', change: 'Via accounting document links', trend: 'up' as const },
    { id: 'tax-total', label: 'Tax Total', value: 'PHP 1,973', change: 'Derived from the selected tax code', trend: 'up' as const },
    { id: 'posted-journal', label: 'Posted Journal', value: 'JE-2026-00411', change: 'Available after posting', trend: 'up' as const },
  ],
  rows: [
    {
      id: 'det-1',
      cells: [
        { text: 'Header', emphasis: true },
        'Training travel for Iloilo site visit',
        'Expense Record',
        '09:02 AM',
        { text: 'Draft', tone: 'blue' },
        { text: 'Normal', tone: 'blue' },
      ] as ExpenseCell[],
    },
    {
      id: 'det-2',
      cells: [
        { text: 'Documents', emphasis: true },
        'Airfare invoice, hotel invoice, taxi receipt',
        'Supporting Files',
        '09:10 AM',
        { text: 'Linked', tone: 'green' },
        { text: 'Medium', tone: 'amber' },
      ] as ExpenseCell[],
    },
    {
      id: 'det-3',
      cells: [
        { text: 'Tax Breakdown', emphasis: true },
        'VAT split across airfare and hotel',
        'Tax Mapping',
        '09:14 AM',
        { text: 'Mapped', tone: 'green' },
        { text: 'Medium', tone: 'amber' },
      ] as ExpenseCell[],
    },
    {
      id: 'det-4',
      cells: [
        { text: 'Journal Link', emphasis: true },
        'Posted journal entry reference',
        'Journal Reference',
        '09:12 AM',
        { text: 'Available After Post', tone: 'blue' },
        { text: 'Normal', tone: 'blue' },
      ] as ExpenseCell[],
    },
  ],
};

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') {
    return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  }
  if (variant === 'ghost') {
    return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  }
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
}

function getMetricTone(trend: ExpenseMetric['trend']) {
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

function formatCurrency(value: number | null | undefined, currency = 'PHP') {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function roundCurrency(value: number) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function toDateInputValue(value: string | null | undefined) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function createEmptyForm(): ExpenseFormState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    expenseNumber: '',
    expenseDate: today,
    postingDate: today,
    vendor: '',
    expenseCategory: '',
    paymentMethod: 'bank',
    currency: 'PHP',
    subtotal: '0',
    project: '',
    expenseAccount: '',
    taxCode: '',
    paymentAccount: '',
    bankAccount: '',
    notes: '',
  };
}

function buildFormFromDetail(detail: ExpenseDetail): ExpenseFormState {
  return {
    expenseNumber: detail.expenseNumber || '',
    expenseDate: toDateInputValue(detail.expenseDate),
    postingDate: toDateInputValue(detail.postingDate),
    vendor: detail.vendorId || '',
    expenseCategory: detail.expenseCategory || '',
    paymentMethod: ['cash', 'bank', 'card', 'other'].includes(detail.paymentMethod)
      ? (detail.paymentMethod as ExpenseFormState['paymentMethod'])
      : 'bank',
    currency: detail.currency || 'PHP',
    subtotal: String(detail.subtotal || 0),
    project: detail.projectId || '',
    expenseAccount: detail.expenseAccountId || '',
    taxCode: detail.taxCodeId || '',
    paymentAccount: detail.paymentAccountId || '',
    bankAccount: detail.bankAccountId || '',
    notes: detail.notes || '',
  };
}

function calculateExpensePreview(
  formState: ExpenseFormState,
  taxCodes: ExpensesRegisterResponse['referenceData']['taxCodes'],
) {
  const subtotal = roundCurrency(Number(formState.subtotal || 0));
  const taxCode = taxCodes.find((item) => String(item.id) === formState.taxCode);
  const rate = Number(taxCode?.rate || 0);
  const calculationMethod = taxCode?.calculationMethod || 'exclusive';
  const taxTotal =
    rate <= 0 || subtotal <= 0
      ? 0
      : calculationMethod === 'inclusive'
        ? roundCurrency(subtotal - subtotal / (1 + rate / 100))
        : roundCurrency(subtotal * (rate / 100));
  const total = calculationMethod === 'inclusive' ? subtotal : roundCurrency(subtotal + taxTotal);

  return {
    subtotal,
    taxTotal,
    total,
  };
}

function toMutationInput(formState: ExpenseFormState): ExpenseMutationInput {
  return {
    expenseNumber: formState.expenseNumber.trim() || null,
    expenseDate: formState.expenseDate,
    postingDate: formState.postingDate,
    vendor: formState.vendor || null,
    expenseCategory: formState.expenseCategory.trim() || null,
    paymentMethod: formState.paymentMethod,
    currency: formState.currency.trim() || 'PHP',
    subtotal: Number(formState.subtotal || 0),
    project: formState.project || null,
    expenseAccount: formState.expenseAccount,
    taxCode: formState.taxCode || null,
    paymentAccount: formState.paymentAccount || null,
    bankAccount: formState.bankAccount || null,
    notes: formState.notes.trim() || null,
  };
}

function mapExpenseErrorState(message: string): ErrorBannerState {
  if (message.includes('defaultInputTaxAccount')) {
    return {
      message:
        'This expense cannot post yet. Add a purchase account to its tax code or configure the default input tax account in Accounting Settings.',
      actionLabel: 'Open Tax Operations',
      actionHref: '/accounting/tax-compliance/tax-operations',
    };
  }

  if (message.includes('Journal entry totals must be balanced before posting.')) {
    return {
      message:
        'This expense cannot post because the generated journal entry is out of balance. Use Edit on the expense to review the subtotal, tax code, expense account, and payment or bank account. If those values already look correct, inspect the related journal setup in Posting & Corrections.',
      actionLabel: 'Open Posting & Corrections',
      actionHref: '/accounting/journals-ledger/posting-corrections?tab=adjustment-entries',
    };
  }

  return { message };
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
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange ? (event) => onChange(event.target.value) : undefined}
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
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
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
    } else {
      setAnimate(false);
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ease-in-out ${animate ? 'bg-black/50' : 'bg-transparent'}`}
      onClick={onClose}
    >
      <div
        className={`flex h-full w-full max-w-5xl flex-col bg-white shadow-xl transition-all duration-300 ease-in-out ${animate ? 'translate-x-0' : 'translate-x-full'}`}
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
                {Array.from({ length: columnCount + 1 }).map((_, i) => (
                  <th key={i} className="px-4 py-3">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={columnCount + 1} className="px-4 py-3">
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

function renderCell(cell: ExpenseCell, index: number) {
  if (typeof cell === 'string') {
    return <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{cell}</td>;
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
    <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${cell.emphasis ? 'font-semibold text-gray-900' : 'text-gray-600'} ${alignClass}`}>
      {cell.text}
    </td>
  );
}

function StaticTabPanel({ tab }: { tab: (typeof TABS)[number] }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">{tab.label}</h2>
          <p className="text-sm text-gray-600">{tab.description}</p>
          <p className="text-sm text-gray-500">{STATIC_EXPENSE_DETAIL.rows.length} visible rows</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {STATIC_EXPENSE_DETAIL.metrics.map((metric) => (
          <div key={metric.id}><MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} /></div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="space-y-4 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">{tab.tableTitle}</h3>
              <p className="text-sm text-gray-600">{tab.tableDescription}</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {tab.columns.map((column) => (
                      <th key={column} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{column}</th>
                    ))}
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {STATIC_EXPENSE_DETAIL.rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.cells.map((cell, index) => renderCell(cell, index))}
                      <td className="px-4 py-3 text-right"><span className="text-sm text-gray-400">Static</span></td>
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

function ExpensesPanel({ tab }: { tab: (typeof TABS)[number] }) {
  const router = useRouter();
  const [data, setData] = useState<ExpensesRegisterResponse | null>(null);
  const [errorState, setErrorState] = useState<ErrorBannerState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ExpenseFilterState>({ statuses: [], paymentMethods: [], taxStates: [] });
  const [draftFilters, setDraftFilters] = useState<ExpenseFilterState>({ statuses: [], paymentMethods: [], taxStates: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const [viewDetail, setViewDetail] = useState<ExpenseDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);

  const [createForm, setCreateForm] = useState<ExpenseFormState>(createEmptyForm());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ExpenseFormState>(createEmptyForm());
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLabel, setDeleteLabel] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [postingId, setPostingId] = useState<string | null>(null);

  const filterCount = filters.statuses.length + filters.paymentMethods.length + filters.taxStates.length;

  const fetchRegister = useCallback(async ({
    search,
    page,
    nextFilters,
    nextQuickFilters,
  }: {
    search: string;
    page: number;
    nextFilters: ExpenseFilterState;
    nextQuickFilters: string[];
  }) => {
    setIsLoading(true);
    setErrorState(null);
    try {
      const response = await getExpenses({
        search,
        page,
        statuses: nextFilters.statuses,
        paymentMethods: nextFilters.paymentMethods,
        taxStates: nextFilters.taxStates,
        quickFilters: nextQuickFilters,
      });
      setData(response);
    } catch (fetchError) {
      setErrorState({
        message: fetchError instanceof Error ? fetchError.message : 'Unable to load expenses.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    const rows = data?.rows || [];
    if (!rows.length) return;
    const headers = ['Expense No.', 'Date', 'Vendor', 'Category', 'Payment Method', 'Amount', 'Status'];
    const csvRows = rows.map((row) => [
      row.expenseNumber,
      row.expenseDateLabel,
      row.vendorLabel,
      row.expenseCategory,
      row.paymentMethodLabel,
      row.totalLabel,
      row.statusLabel,
    ]);
    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'expense-register.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleView = async (id: string) => {
    setIsViewOpen(true);
    setIsViewLoading(true);
    setViewDetail(null);
    try {
      const detail = await getExpenseDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setErrorState({
        message: detailError instanceof Error ? detailError.message : 'Unable to load expense detail.',
      });
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
    setIsCreateSubmitting(true);
    setCreateError(null);
    try {
      await createExpense(toMutationInput(createForm));
      setIsCreateOpen(false);
      handleRefresh();
    } catch (submissionError) {
      setCreateError(submissionError instanceof Error ? submissionError.message : 'Unable to create expense.');
    } finally {
      setIsCreateSubmitting(false);
    }
  };

  const handleOpenEdit = async (id: string) => {
    setEditId(id);
    setEditError(null);
    setIsEditOpen(true);
    setIsEditLoading(true);
    try {
      const detail = await getExpenseDetail(id);
      setEditForm(buildFormFromDetail(detail));
    } catch (detailError) {
      setEditError(detailError instanceof Error ? detailError.message : 'Unable to load expense detail.');
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editId) return;
    setIsEditSubmitting(true);
    setEditError(null);
    try {
      await updateExpense(editId, toMutationInput(editForm));
      setIsEditOpen(false);
      setEditId(null);
      handleRefresh();
    } catch (submissionError) {
      setEditError(submissionError instanceof Error ? submissionError.message : 'Unable to update expense.');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleOpenDelete = (id: string, label: string) => {
    setDeleteId(id);
    setDeleteLabel(label);
    setDeleteError(null);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleteSubmitting(true);
    setDeleteError(null);
    try {
      await deleteExpense(deleteId);
      setIsDeleteOpen(false);
      setDeleteId(null);
      setDeleteLabel('');
      handleRefresh();
    } catch (deletionError) {
      setDeleteError(deletionError instanceof Error ? deletionError.message : 'Unable to delete expense.');
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  const handlePost = async (id: string) => {
    setPostingId(id);
    setErrorState(null);
    try {
      await postExpense(id);
      handleRefresh();
    } catch (postingError) {
      const message = postingError instanceof Error ? postingError.message : 'Unable to post expense.';
      setErrorState(mapExpenseErrorState(message));
    } finally {
      setPostingId(null);
    }
  };

  const referenceData = data?.referenceData;
  const createPreview = useMemo(
    () => calculateExpensePreview(createForm, referenceData?.taxCodes || []),
    [createForm, referenceData?.taxCodes],
  );
  const editPreview = useMemo(
    () => calculateExpensePreview(editForm, referenceData?.taxCodes || []),
    [editForm, referenceData?.taxCodes],
  );
  const mutableExpenseIds = useMemo(() => new Set(data?.flags.mutableExpenseIds || []), [data?.flags.mutableExpenseIds]);
  const postableExpenseIds = useMemo(() => new Set(data?.flags.postableExpenseIds || []), [data?.flags.postableExpenseIds]);
  const currentRows = data?.rows || [];
  const blockedPostingEntries = useMemo(
    () => Object.entries(data?.flags.postBlockedByExpenseId || {}),
    [data?.flags.postBlockedByExpenseId],
  );

  const vendorOptions = [{ label: 'Select a vendor', value: '' }].concat(
    (referenceData?.vendors || []).map((vendor) => ({
      label: `${vendor.vendorCode ? `${vendor.vendorCode} - ` : ''}${vendor.displayName || `Vendor ${vendor.id}`}`,
      value: String(vendor.id),
    })),
  );
  const projectOptions = [{ label: 'No project', value: '' }].concat(
    (referenceData?.projects || []).map((project) => ({
      label: `${project.projectCode ? `${project.projectCode} - ` : ''}${project.name || `Project ${project.id}`}`,
      value: String(project.id),
    })),
  );
  const accountOptions = [{ label: 'Select an account', value: '' }].concat(
    (referenceData?.chartAccounts || []).map((account) => ({
      label: `${account.code ? `${account.code} - ` : ''}${account.name || 'Unnamed account'}`,
      value: String(account.id),
    })),
  );
  const taxCodeOptions = [{ label: 'No tax code', value: '' }].concat(
    (referenceData?.taxCodes || []).map((taxCode) => ({
      label: `${taxCode.code ? `${taxCode.code} - ` : ''}${taxCode.name || 'Unnamed tax code'}`,
      value: String(taxCode.id),
    })),
  );
  const bankAccountOptions = [{ label: 'No bank account', value: '' }].concat(
    (referenceData?.bankAccounts || []).map((bankAccount) => ({
      label: `${bankAccount.accountName || 'Unnamed bank account'}${bankAccount.accountNumberMasked ? ` (${bankAccount.accountNumberMasked})` : ''}`,
      value: String(bankAccount.id),
    })),
  );

  const renderExpenseForm = (
    formState: ExpenseFormState,
    setFormState: React.Dispatch<React.SetStateAction<ExpenseFormState>>,
    preview: { subtotal: number; taxTotal: number; total: number },
    submitLabel: string,
    isSubmitting: boolean,
    onCancel: () => void,
    errorMessage: string | null,
    onSubmit?: (event: React.FormEvent) => void,
  ) => (
    <form onSubmit={onSubmit} className="space-y-6">
      {errorMessage ? (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Expense Number">
          <Input value={formState.expenseNumber} onChange={(value) => setFormState((previous) => ({ ...previous, expenseNumber: value }))} placeholder="Leave blank to auto-generate" />
        </FormField>
        <FormField label="Vendor">
          <Select value={formState.vendor} onChange={(value) => setFormState((previous) => ({ ...previous, vendor: value }))} options={vendorOptions} />
        </FormField>
        <FormField label="Expense Date" required>
          <Input type="date" value={formState.expenseDate} onChange={(value) => setFormState((previous) => ({ ...previous, expenseDate: value }))} required />
        </FormField>
        <FormField label="Posting Date" required>
          <Input type="date" value={formState.postingDate} onChange={(value) => setFormState((previous) => ({ ...previous, postingDate: value }))} required />
        </FormField>
        <FormField label="Category">
          <Input value={formState.expenseCategory} onChange={(value) => setFormState((previous) => ({ ...previous, expenseCategory: value }))} placeholder="e.g. Travel, Utilities, Supplies" />
        </FormField>
        <FormField label="Payment Method" required>
          <Select
            value={formState.paymentMethod}
            onChange={(value) =>
              setFormState((previous) => ({
                ...previous,
                paymentMethod: ['cash', 'bank', 'card', 'other'].includes(value)
                  ? (value as ExpenseFormState['paymentMethod'])
                  : 'bank',
              }))
            }
            options={[
              { label: 'Cash', value: 'cash' },
              { label: 'Bank', value: 'bank' },
              { label: 'Card', value: 'card' },
              { label: 'Other', value: 'other' },
            ]}
          />
        </FormField>
        <FormField label="Currency" required>
          <Input value={formState.currency} onChange={(value) => setFormState((previous) => ({ ...previous, currency: value }))} required />
        </FormField>
        <FormField label="Subtotal" required>
          <Input type="number" value={formState.subtotal} onChange={(value) => setFormState((previous) => ({ ...previous, subtotal: value }))} required />
        </FormField>
        <FormField label="Project">
          <Select value={formState.project} onChange={(value) => setFormState((previous) => ({ ...previous, project: value }))} options={projectOptions} />
        </FormField>
        <FormField label="Expense Account" required>
          <Select value={formState.expenseAccount} onChange={(value) => setFormState((previous) => ({ ...previous, expenseAccount: value }))} options={accountOptions} />
        </FormField>
        <FormField label="Tax Code">
          <Select value={formState.taxCode} onChange={(value) => setFormState((previous) => ({ ...previous, taxCode: value }))} options={taxCodeOptions} />
        </FormField>
        <FormField label="Payment Account">
          <Select value={formState.paymentAccount} onChange={(value) => setFormState((previous) => ({ ...previous, paymentAccount: value }))} options={accountOptions} />
        </FormField>
        <FormField label="Bank Account">
          <Select value={formState.bankAccount} onChange={(value) => setFormState((previous) => ({ ...previous, bankAccount: value }))} options={bankAccountOptions} />
        </FormField>
      </div>

      <FormField label="Notes">
        <TextArea value={formState.notes} onChange={(value) => setFormState((previous) => ({ ...previous, notes: value }))} rows={3} />
      </FormField>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Subtotal', formatCurrency(preview.subtotal, formState.currency || 'PHP')],
          ['Tax Total', formatCurrency(preview.taxTotal, formState.currency || 'PHP')],
          ['Total', formatCurrency(preview.total, formState.currency || 'PHP')],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">{value}</p>
          </div>
        ))}
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
          <h2 className="text-lg font-semibold text-gray-900">{data?.meta.label || tab.label}</h2>
          <p className="text-sm text-gray-600">{data?.meta.description || tab.description}</p>
          <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
            <Plus className="h-4 w-4" />
            Create Expense
          </button>
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" />
            Refresh Register
          </button>
          <button type="button" onClick={handleExport} disabled={!currentRows.length} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
            <Download className="h-4 w-4" />
            Export Expense Register
          </button>
        </div>
      </div>

      {data?.metrics?.length ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {data.metrics.map((metric) => (
            <div key={metric.id}><MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} /></div>
          ))}
        </div>
      ) : null}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <form onSubmit={handleSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={data?.meta.searchPlaceholder || tab.searchPlaceholder}
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
                  <p className="mt-1 text-sm text-gray-600">Select as many values as needed. All checked filters widen the result set using OR logic.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => { setDraftFilters({ statuses: [], paymentMethods: [], taxStates: [] }); setFilters({ statuses: [], paymentMethods: [], taxStates: [] }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">
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
                      const selected = draftFilters.statuses.includes(option.value);
                      return (
                        <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Payment Method</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.paymentMethods || []).map((option) => {
                      const selected = draftFilters.paymentMethods.includes(option.value);
                      return (
                        <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, paymentMethods: toggleFilterValue(previous.paymentMethods, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Tax State</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.taxStates || []).map((option) => {
                      const selected = draftFilters.taxStates.includes(option.value);
                      return (
                        <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, taxStates: toggleFilterValue(previous.taxStates, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>
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
              <h3 className="text-base font-semibold text-gray-900">{data?.meta.tableTitle || tab.tableTitle}</h3>
              <p className="text-sm text-gray-600">{data?.meta.tableDescription || tab.tableDescription}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span>{data?.totals.filteredRows ?? 0} matching rows</span>
            </div>
          </div>

          {blockedPostingEntries.length > 0 ? (
            <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">Some draft expenses are not post-ready.</p>
                  <p className="mt-1">
                    {blockedPostingEntries.length} draft expense(s) cannot post yet. Open the record and fix the blocker shown on the disabled Post action.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => router.push('/accounting/tax-compliance/tax-operations')}
                className="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-100"
              >
                Open Tax Operations
              </button>
            </div>
          ) : null}

          {errorState ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <span>{errorState.message}</span>
                {errorState.actionHref && errorState.actionLabel ? (
                  <button
                    type="button"
                    onClick={() => router.push(errorState.actionHref!)}
                    className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                  >
                    {errorState.actionLabel}
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {tab.columns.map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Amount' ? 'text-right' : 'text-left'}`}>
                            {column}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {currentRows.length > 0 ? (
                        currentRows.map((row) => {
                          const isMutable = mutableExpenseIds.has(row.id);
                          const canPost = postableExpenseIds.has(row.id);
                          const postBlockers = data?.flags.postBlockedByExpenseId[row.id] || [];
                          const postTitle = !isMutable
                            ? 'Only draft expenses can be posted'
                            : canPost
                              ? 'Post expense'
                              : postBlockers[0] || 'This expense is not ready to post';
                          return (
                            <tr key={row.id} className="hover:bg-gray-50">
                              {row.cells.map((cell, index) => renderCell(cell, index))}
                              <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail">
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button type="button" onClick={() => handleOpenEdit(row.id)} disabled={!isMutable} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40" title={isMutable ? 'Edit' : 'Only draft expenses can be edited'}>
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button type="button" onClick={() => handleOpenDelete(row.id, row.expenseNumber)} disabled={!isMutable} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40" title={isMutable ? 'Delete' : 'Only draft expenses can be deleted'}>
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                  <button type="button" onClick={() => handlePost(row.id)} disabled={!isMutable || !canPost || postingId === row.id} className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40" title={postTitle}>
                                    <SendHorizonal className="h-3.5 w-3.5" />
                                    {postingId === row.id ? 'Posting...' : 'Post'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={tab.columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">
                            No expense rows found.
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

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Expense Detail" description="Review header values, tax treatment, payment mapping, documents, and journal linkage for the selected expense.">
        <div className="space-y-6">
          {isViewLoading ? (
            <LoadingSkeleton />
          ) : viewDetail ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['Expense No.', viewDetail.expenseNumber],
                  ['Vendor', viewDetail.vendorLabel || '-'],
                  ['Expense Date', viewDetail.expenseDateLabel],
                  ['Posting Date', viewDetail.postingDateLabel],
                  ['Category', viewDetail.expenseCategory || '-'],
                  ['Payment Method', viewDetail.paymentMethodLabel],
                  ['Status', viewDetail.statusLabel],
                  ['Project', viewDetail.projectLabel || '-'],
                  ['Expense Account', viewDetail.expenseAccountLabel || '-'],
                  ['Tax Code', viewDetail.taxCodeLabel || '-'],
                  ['Payment Account', viewDetail.paymentAccountLabel || '-'],
                  ['Bank Account', viewDetail.bankAccountLabel || '-'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Subtotal', viewDetail.subtotalLabel],
                  ['Tax Total', viewDetail.taxTotalLabel],
                  ['Total', viewDetail.totalLabel],
                  ['Posted Journal', viewDetail.postedJournalEntryId || '-'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-2 text-sm font-semibold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900">Notes</h4>
                <p className="mt-2 text-sm text-gray-700">{viewDetail.notes || '-'}</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Supporting Documents</h4>
                    <p className="mt-1 text-sm text-gray-600">Document links currently attached to this expense.</p>
                  </div>
                  <div className="text-sm text-gray-500">{viewDetail.usageSummary.documentCount} linked document(s)</div>
                </div>
                <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {['Category', 'Document Date', 'Primary', 'Notes'].map((column) => (
                            <th key={column} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{column}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {viewDetail.documentLinks.length > 0 ? (
                          viewDetail.documentLinks.map((documentLink) => (
                            <tr key={documentLink.id}>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{documentLink.documentCategoryLabel || '-'}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{documentLink.documentDateLabel}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{documentLink.isPrimary ? 'Yes' : 'No'}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{documentLink.notes || '-'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">No linked documents found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </SlideOver>

      <SlideOver isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Expense" description="Create a direct expense record before posting it into the general ledger.">
        {renderExpenseForm(createForm, setCreateForm, createPreview, 'Create Expense', isCreateSubmitting, () => setIsCreateOpen(false), createError, handleCreateSubmit)}
      </SlideOver>

      <SlideOver isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Expense" description="Update the draft expense header and accounting mappings before posting.">
        {isEditLoading ? (
          <LoadingSkeleton />
        ) : (
          renderExpenseForm(editForm, setEditForm, editPreview, 'Save Changes', isEditSubmitting, () => setIsEditOpen(false), editError, handleEditSubmit)
        )}
      </SlideOver>

      <SlideOver isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Expense" description="Remove this draft expense if it has no blocking dependencies.">
        <div className="space-y-6">
          {deleteError ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {deleteError}
            </div>
          ) : null}
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Delete {deleteLabel}?</p>
            <p className="mt-1">This action cannot be undone. Dependency checks run before removal.</p>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setIsDeleteOpen(false)} disabled={isDeleteSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleteSubmitting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {isDeleteSubmitting ? 'Deleting...' : 'Delete Expense'}
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}

function ExpenseDetailPanel({ tab }: { tab: (typeof TABS)[number] }) {
  const router = useRouter();
  const [data, setData] = useState<ExpenseDetailRegisterResponse | null>(null);
  const [errorState, setErrorState] = useState<ErrorBannerState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ExpenseDetailFilterState>({
    statuses: [],
    vendorIds: [],
    coverageStates: [],
  });
  const [draftFilters, setDraftFilters] = useState<ExpenseDetailFilterState>({
    statuses: [],
    vendorIds: [],
    coverageStates: [],
  });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const [viewDetail, setViewDetail] = useState<ExpenseDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);

  const [createForm, setCreateForm] = useState<ExpenseFormState>(createEmptyForm());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ExpenseFormState>(createEmptyForm());
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLabel, setDeleteLabel] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [postingId, setPostingId] = useState<string | null>(null);

  const filterCount = filters.statuses.length + filters.vendorIds.length + filters.coverageStates.length;

  const fetchRegister = useCallback(async ({
    search,
    page,
    nextFilters,
    nextQuickFilters,
  }: {
    search: string;
    page: number;
    nextFilters: ExpenseDetailFilterState;
    nextQuickFilters: string[];
  }) => {
    setIsLoading(true);
    setErrorState(null);
    try {
      const response = await getExpenseDetailRegister({
        search,
        page,
        statuses: nextFilters.statuses,
        vendorIds: nextFilters.vendorIds,
        coverageStates: nextFilters.coverageStates,
        quickFilters: nextQuickFilters,
      });
      setData(response);
    } catch (fetchError) {
      setErrorState({
        message: fetchError instanceof Error ? fetchError.message : 'Unable to load expense detail.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    const rows = data?.rows || [];
    if (!rows.length) return;
    const headers = ['Expense No.', 'Vendor', 'Tax Code', 'Documents', 'Journal Linked', 'Status'];
    const csvRows = rows.map((row) => [
      row.expenseNumber,
      row.vendorLabel,
      row.taxCodeLabel || '-',
      row.documentCount,
      row.hasJournalLink ? 'Yes' : 'No',
      row.statusLabel,
    ]);
    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'expense-detail.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleView = async (id: string) => {
    setIsViewOpen(true);
    setIsViewLoading(true);
    setViewDetail(null);
    try {
      const detail = await getExpenseDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setErrorState({
        message: detailError instanceof Error ? detailError.message : 'Unable to load expense detail.',
      });
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
    setIsCreateSubmitting(true);
    setCreateError(null);
    try {
      await createExpense(toMutationInput(createForm));
      setIsCreateOpen(false);
      handleRefresh();
    } catch (submissionError) {
      setCreateError(submissionError instanceof Error ? submissionError.message : 'Unable to create expense.');
    } finally {
      setIsCreateSubmitting(false);
    }
  };

  const handleOpenEdit = async (id: string) => {
    setEditId(id);
    setEditError(null);
    setIsEditOpen(true);
    setIsEditLoading(true);
    try {
      const detail = await getExpenseDetail(id);
      setEditForm(buildFormFromDetail(detail));
    } catch (detailError) {
      setEditError(detailError instanceof Error ? detailError.message : 'Unable to load expense detail.');
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editId) return;
    setIsEditSubmitting(true);
    setEditError(null);
    try {
      await updateExpense(editId, toMutationInput(editForm));
      setIsEditOpen(false);
      setEditId(null);
      handleRefresh();
    } catch (submissionError) {
      setEditError(submissionError instanceof Error ? submissionError.message : 'Unable to update expense.');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleOpenDelete = (id: string, label: string) => {
    setDeleteId(id);
    setDeleteLabel(label);
    setDeleteError(null);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleteSubmitting(true);
    setDeleteError(null);
    try {
      await deleteExpense(deleteId);
      setIsDeleteOpen(false);
      setDeleteId(null);
      setDeleteLabel('');
      handleRefresh();
    } catch (deletionError) {
      setDeleteError(deletionError instanceof Error ? deletionError.message : 'Unable to delete expense.');
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  const handlePost = async (id: string) => {
    setPostingId(id);
    setErrorState(null);
    try {
      await postExpense(id);
      handleRefresh();
    } catch (postingError) {
      const message = postingError instanceof Error ? postingError.message : 'Unable to post expense.';
      setErrorState(mapExpenseErrorState(message));
    } finally {
      setPostingId(null);
    }
  };

  const referenceData = data?.referenceData;
  const createPreview = useMemo(
    () => calculateExpensePreview(createForm, referenceData?.taxCodes || []),
    [createForm, referenceData?.taxCodes],
  );
  const editPreview = useMemo(
    () => calculateExpensePreview(editForm, referenceData?.taxCodes || []),
    [editForm, referenceData?.taxCodes],
  );
  const mutableExpenseIds = useMemo(
    () => new Set(data?.flags.mutableExpenseIds || []),
    [data?.flags.mutableExpenseIds],
  );
  const postableExpenseIds = useMemo(
    () => new Set(data?.flags.postableExpenseIds || []),
    [data?.flags.postableExpenseIds],
  );
  const currentRows = data?.rows || [];
  const blockedPostingEntries = useMemo(
    () => Object.entries(data?.flags.postBlockedByExpenseId || {}),
    [data?.flags.postBlockedByExpenseId],
  );

  const vendorOptions = [{ label: 'Select a vendor', value: '' }].concat(
    (referenceData?.vendors || []).map((vendor) => ({
      label: `${vendor.vendorCode ? `${vendor.vendorCode} - ` : ''}${vendor.displayName || `Vendor ${vendor.id}`}`,
      value: String(vendor.id),
    })),
  );
  const projectOptions = [{ label: 'No project', value: '' }].concat(
    (referenceData?.projects || []).map((project) => ({
      label: `${project.projectCode ? `${project.projectCode} - ` : ''}${project.name || `Project ${project.id}`}`,
      value: String(project.id),
    })),
  );
  const accountOptions = [{ label: 'Select an account', value: '' }].concat(
    (referenceData?.chartAccounts || []).map((account) => ({
      label: `${account.code ? `${account.code} - ` : ''}${account.name || 'Unnamed account'}`,
      value: String(account.id),
    })),
  );
  const taxCodeOptions = [{ label: 'No tax code', value: '' }].concat(
    (referenceData?.taxCodes || []).map((taxCode) => ({
      label: `${taxCode.code ? `${taxCode.code} - ` : ''}${taxCode.name || 'Unnamed tax code'}`,
      value: String(taxCode.id),
    })),
  );
  const bankAccountOptions = [{ label: 'No bank account', value: '' }].concat(
    (referenceData?.bankAccounts || []).map((bankAccount) => ({
      label: `${bankAccount.accountName || 'Unnamed bank account'}${bankAccount.accountNumberMasked ? ` (${bankAccount.accountNumberMasked})` : ''}`,
      value: String(bankAccount.id),
    })),
  );

  const renderExpenseForm = (
    formState: ExpenseFormState,
    setFormState: React.Dispatch<React.SetStateAction<ExpenseFormState>>,
    preview: { subtotal: number; taxTotal: number; total: number },
    submitLabel: string,
    isSubmitting: boolean,
    onCancel: () => void,
    errorMessage: string | null,
    onSubmit?: (event: React.FormEvent) => void,
  ) => (
    <form onSubmit={onSubmit} className="space-y-6">
      {errorMessage ? (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Expense Number">
          <Input value={formState.expenseNumber} onChange={(value) => setFormState((previous) => ({ ...previous, expenseNumber: value }))} placeholder="Leave blank to auto-generate" />
        </FormField>
        <FormField label="Vendor">
          <Select value={formState.vendor} onChange={(value) => setFormState((previous) => ({ ...previous, vendor: value }))} options={vendorOptions} />
        </FormField>
        <FormField label="Expense Date" required>
          <Input type="date" value={formState.expenseDate} onChange={(value) => setFormState((previous) => ({ ...previous, expenseDate: value }))} required />
        </FormField>
        <FormField label="Posting Date" required>
          <Input type="date" value={formState.postingDate} onChange={(value) => setFormState((previous) => ({ ...previous, postingDate: value }))} required />
        </FormField>
        <FormField label="Category">
          <Input value={formState.expenseCategory} onChange={(value) => setFormState((previous) => ({ ...previous, expenseCategory: value }))} placeholder="e.g. Travel, Utilities, Supplies" />
        </FormField>
        <FormField label="Payment Method" required>
          <Select
            value={formState.paymentMethod}
            onChange={(value) =>
              setFormState((previous) => ({
                ...previous,
                paymentMethod: ['cash', 'bank', 'card', 'other'].includes(value)
                  ? (value as ExpenseFormState['paymentMethod'])
                  : 'bank',
              }))
            }
            options={[
              { label: 'Cash', value: 'cash' },
              { label: 'Bank', value: 'bank' },
              { label: 'Card', value: 'card' },
              { label: 'Other', value: 'other' },
            ]}
          />
        </FormField>
        <FormField label="Currency" required>
          <Input value={formState.currency} onChange={(value) => setFormState((previous) => ({ ...previous, currency: value }))} required />
        </FormField>
        <FormField label="Subtotal" required>
          <Input type="number" value={formState.subtotal} onChange={(value) => setFormState((previous) => ({ ...previous, subtotal: value }))} required />
        </FormField>
        <FormField label="Project">
          <Select value={formState.project} onChange={(value) => setFormState((previous) => ({ ...previous, project: value }))} options={projectOptions} />
        </FormField>
        <FormField label="Expense Account" required>
          <Select value={formState.expenseAccount} onChange={(value) => setFormState((previous) => ({ ...previous, expenseAccount: value }))} options={accountOptions} />
        </FormField>
        <FormField label="Tax Code">
          <Select value={formState.taxCode} onChange={(value) => setFormState((previous) => ({ ...previous, taxCode: value }))} options={taxCodeOptions} />
        </FormField>
        <FormField label="Payment Account">
          <Select value={formState.paymentAccount} onChange={(value) => setFormState((previous) => ({ ...previous, paymentAccount: value }))} options={accountOptions} />
        </FormField>
        <FormField label="Bank Account">
          <Select value={formState.bankAccount} onChange={(value) => setFormState((previous) => ({ ...previous, bankAccount: value }))} options={bankAccountOptions} />
        </FormField>
      </div>

      <FormField label="Notes">
        <TextArea value={formState.notes} onChange={(value) => setFormState((previous) => ({ ...previous, notes: value }))} rows={3} />
      </FormField>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Subtotal', formatCurrency(preview.subtotal, formState.currency || 'PHP')],
          ['Tax Total', formatCurrency(preview.taxTotal, formState.currency || 'PHP')],
          ['Total', formatCurrency(preview.total, formState.currency || 'PHP')],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">{value}</p>
          </div>
        ))}
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
          <h2 className="text-lg font-semibold text-gray-900">{data?.meta.label || tab.label}</h2>
          <p className="text-sm text-gray-600">{data?.meta.description || tab.description}</p>
          <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
            <Plus className="h-4 w-4" />
            Create Expense
          </button>
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" />
            Refresh Detail
          </button>
          <button type="button" onClick={handleExport} disabled={!currentRows.length} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
            <Download className="h-4 w-4" />
            Export View
          </button>
        </div>
      </div>

      {data?.metrics?.length ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {data.metrics.map((metric) => (
            <div key={metric.id}><MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} /></div>
          ))}
        </div>
      ) : null}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <form onSubmit={handleSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={data?.meta.searchPlaceholder || tab.searchPlaceholder}
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
                  <p className="mt-1 text-sm text-gray-600">Select as many values as needed. All checked filters widen the result set using OR logic.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => { setDraftFilters({ statuses: [], vendorIds: [], coverageStates: [] }); setFilters({ statuses: [], vendorIds: [], coverageStates: [] }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">
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
                      const selected = draftFilters.statuses.includes(option.value);
                      return (
                        <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Vendor</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.vendors || []).map((option) => {
                      const selected = draftFilters.vendorIds.includes(option.value);
                      return (
                        <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, vendorIds: toggleFilterValue(previous.vendorIds, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>
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
                      const selected = draftFilters.coverageStates.includes(option.value);
                      return (
                        <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, coverageStates: toggleFilterValue(previous.coverageStates, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>
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
              <h3 className="text-base font-semibold text-gray-900">{data?.meta.tableTitle || tab.tableTitle}</h3>
              <p className="text-sm text-gray-600">{data?.meta.tableDescription || tab.tableDescription}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span>{data?.totals.filteredRows ?? 0} matching rows</span>
            </div>
          </div>

          {blockedPostingEntries.length > 0 ? (
            <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">Some draft expenses are not post-ready.</p>
                  <p className="mt-1">
                    {blockedPostingEntries.length} draft expense(s) cannot post yet. Open the record and fix the blocker shown on the disabled Post action.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => router.push('/accounting/tax-compliance/tax-operations')}
                className="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-100"
              >
                Open Tax Operations
              </button>
            </div>
          ) : null}

          {errorState ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <span>{errorState.message}</span>
                {errorState.actionHref && errorState.actionLabel ? (
                  <button
                    type="button"
                    onClick={() => router.push(errorState.actionHref!)}
                    className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                  >
                    {errorState.actionLabel}
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {(data?.meta.columns || tab.columns).map((column) => {
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
                      {currentRows.length > 0 ? (
                        currentRows.map((row) => {
                          const isMutable = mutableExpenseIds.has(row.id);
                          const canPost = postableExpenseIds.has(row.id);
                          const postBlockers = data?.flags.postBlockedByExpenseId[row.id] || [];
                          const postTitle = !isMutable
                            ? 'Only draft expenses can be posted'
                            : canPost
                              ? 'Post expense'
                              : postBlockers[0] || 'This expense is not ready to post';
                          return (
                            <tr key={row.id} className="hover:bg-gray-50">
                              {row.cells.map((cell, index) => renderCell(cell, index))}
                              <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail">
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button type="button" onClick={() => handleOpenEdit(row.id)} disabled={!isMutable} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40" title={isMutable ? 'Edit' : 'Only draft expenses can be edited'}>
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button type="button" onClick={() => handleOpenDelete(row.id, row.expenseNumber)} disabled={!isMutable} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40" title={isMutable ? 'Delete' : 'Only draft expenses can be deleted'}>
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                  <button type="button" onClick={() => handlePost(row.id)} disabled={!isMutable || !canPost || postingId === row.id} className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40" title={postTitle}>
                                    <SendHorizonal className="h-3.5 w-3.5" />
                                    {postingId === row.id ? 'Posting...' : 'Post'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={tab.columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">
                            No expense detail rows found.
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

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Expense Detail" description="Review header values, tax treatment, payment mapping, documents, and journal linkage for the selected expense.">
        <div className="space-y-6">
          {isViewLoading ? (
            <LoadingSkeleton />
          ) : viewDetail ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['Expense No.', viewDetail.expenseNumber],
                  ['Vendor', viewDetail.vendorLabel || '-'],
                  ['Expense Date', viewDetail.expenseDateLabel],
                  ['Posting Date', viewDetail.postingDateLabel],
                  ['Category', viewDetail.expenseCategory || '-'],
                  ['Payment Method', viewDetail.paymentMethodLabel],
                  ['Status', viewDetail.statusLabel],
                  ['Project', viewDetail.projectLabel || '-'],
                  ['Expense Account', viewDetail.expenseAccountLabel || '-'],
                  ['Tax Code', viewDetail.taxCodeLabel || '-'],
                  ['Payment Account', viewDetail.paymentAccountLabel || '-'],
                  ['Bank Account', viewDetail.bankAccountLabel || '-'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Subtotal', viewDetail.subtotalLabel],
                  ['Tax Total', viewDetail.taxTotalLabel],
                  ['Total', viewDetail.totalLabel],
                  ['Posted Journal', viewDetail.postedJournalEntryId || '-'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-2 text-sm font-semibold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900">Notes</h4>
                <p className="mt-2 text-sm text-gray-700">{viewDetail.notes || '-'}</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Supporting Documents</h4>
                    <p className="mt-1 text-sm text-gray-600">Document links currently attached to this expense.</p>
                  </div>
                  <div className="text-sm text-gray-500">{viewDetail.usageSummary.documentCount} linked document(s)</div>
                </div>
                <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {['Category', 'Document Date', 'Primary', 'Notes'].map((column) => (
                            <th key={column} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{column}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {viewDetail.documentLinks.length > 0 ? (
                          viewDetail.documentLinks.map((documentLink) => (
                            <tr key={documentLink.id}>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{documentLink.documentCategoryLabel || '-'}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{documentLink.documentDateLabel}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{documentLink.isPrimary ? 'Yes' : 'No'}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{documentLink.notes || '-'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">No linked documents found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-medium text-gray-900">Dependencies</p>
                <p className="mt-2">Support Documents: {viewDetail.usageSummary.documentCount}</p>
                <p>Journal Linked: {viewDetail.usageSummary.hasJournalLink ? 'Yes' : 'No'}</p>
                <p>Has Blocking Dependents: {viewDetail.usageSummary.hasDependents ? 'Yes' : 'No'}</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">No details available.</p>
          )}
        </div>
      </SlideOver>

      <SlideOver isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Expense" description="Create a direct expense record before posting it into the general ledger.">
        {renderExpenseForm(createForm, setCreateForm, createPreview, 'Create Expense', isCreateSubmitting, () => setIsCreateOpen(false), createError, handleCreateSubmit)}
      </SlideOver>

      <SlideOver isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Expense" description="Update the draft expense header and accounting mappings before posting.">
        {isEditLoading ? (
          <LoadingSkeleton />
        ) : (
          renderExpenseForm(editForm, setEditForm, editPreview, 'Save Changes', isEditSubmitting, () => setIsEditOpen(false), editError, handleEditSubmit)
        )}
      </SlideOver>

      <SlideOver isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Expense" description="Remove this draft expense if it has no blocking dependencies.">
        <div className="space-y-6">
          {deleteError ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {deleteError}
            </div>
          ) : null}
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Delete {deleteLabel}?</p>
            <p className="mt-1">This action cannot be undone. Dependency checks run before removal.</p>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setIsDeleteOpen(false)} disabled={isDeleteSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleteSubmitting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {isDeleteSubmitting ? 'Deleting...' : 'Delete Expense'}
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}

export function ExpenseOperationsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = TABS.find((tab) => tab.id === rawTab)?.id || 'expenses';
  const currentTab = TABS.find((tab) => tab.id === activeTab) || TABS[0];

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Operations / Expenses</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Expense Operations</h1>
          <p className="mt-1 text-base text-gray-600">
            Manage direct expenses with clear control over register activity, document coverage, tax handling, and posting follow-up.
          </p>
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

      {activeTab === 'expenses' ? (
        <ExpensesPanel tab={currentTab} />
      ) : activeTab === 'expense-detail' ? (
        <ExpenseDetailPanel tab={currentTab} />
      ) : (
        <StaticTabPanel tab={currentTab} />
      )}
    </div>
  );
}
