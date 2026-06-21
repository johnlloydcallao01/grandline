'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Briefcase,
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
  createBankAccount,
  createExpense,
  deleteBankAccount,
  getBankAccountDetail,
  getPettyCashAccounts,
  deleteExpense,
  getExpenseDetail,
  getPettyCashExpenses,
  postExpense,
  updateBankAccount,
  type BankAccountDetail,
  type CreateBankAccountInput,
  updateExpense,
  type ExpenseDetail,
  type ExpenseMutationInput,
  type ExpenseMetric,
  type PettyCashAccountRegisterResponse,
  type PettyCashAccountRow,
  type PettyCashCell,
  type PettyCashRegisterResponse,
  type UpdateBankAccountInput,
} from './actions';

type TabId = 'cash-expenses' | 'cash-accounts';

type PettyCashFilterState = {
  statuses: string[];
  taxStates: string[];
  coverageStates: string[];
};

type PettyCashFormState = {
  expenseNumber: string;
  expenseDate: string;
  postingDate: string;
  vendor: string;
  expenseCategory: string;
  currency: string;
  subtotal: string;
  project: string;
  expenseAccount: string;
  taxCode: string;
  cashAccount: string;
  notes: string;
};

type CashAccountFilterState = {
  statuses: string[];
  accountTypes: string[];
  coverageStates: string[];
};

type CashAccountFormState = {
  accountName: string;
  accountNumberMasked: string;
  bankName: string;
  branchName: string;
  accountType: 'cash_on_hand' | 'undeposited_funds';
  currencyReference: string;
  ledgerAccount: string;
  isDefaultReceiptAccount: boolean;
  isDefaultDisbursementAccount: boolean;
  isActive: boolean;
  notes: string;
};

type ErrorBannerState = {
  message: string;
  actionLabel?: string;
  actionHref?: string;
};

const TABS = [
  {
    id: 'cash-expenses' as TabId,
    label: 'Cash Expenses',
    description:
      'Review cash-paid expense activity with fast visibility into vendors, categories, funding accounts, and current posting status.',
    searchPlaceholder: 'Search expense no., vendor, cash account, memo, or category',
    columns: ['Expense No.', 'Vendor', 'Category', 'Cash Account', 'Amount', 'Status'],
    tableTitle: 'Cash Expense Register',
    tableDescription:
      'Cash-funded expense activity organized for daily monitoring, follow-up, and posting review.',
  },
  {
    id: 'cash-accounts' as TabId,
    label: 'Cash Accounts',
    description:
      'Review cash-style accounts used in day-to-day disbursement and receipt handling, including cash on hand and undeposited funds.',
    searchPlaceholder: 'Search account name, bank name, account type, currency, or note',
    columns: ['Account', 'Type', 'Ledger Account', 'Currency', 'Defaults', 'Status'],
    tableTitle: 'Cash Account Directory',
    tableDescription:
      'Cash-account directory used by finance teams when selecting source and destination accounts for cash activity.',
  },
];

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

function createEmptyForm(): PettyCashFormState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    expenseNumber: '',
    expenseDate: today,
    postingDate: today,
    vendor: '',
    expenseCategory: '',
    currency: 'PHP',
    subtotal: '0',
    project: '',
    expenseAccount: '',
    taxCode: '',
    cashAccount: '',
    notes: '',
  };
}

function createEmptyCashAccountForm(): CashAccountFormState {
  return {
    accountName: '',
    accountNumberMasked: '',
    bankName: '',
    branchName: '',
    accountType: 'cash_on_hand',
    currencyReference: '',
    ledgerAccount: '',
    isDefaultReceiptAccount: false,
    isDefaultDisbursementAccount: false,
    isActive: true,
    notes: '',
  };
}

function buildCashAccountFormFromDetail(detail: BankAccountDetail): CashAccountFormState {
  return {
    accountName: detail.accountName || '',
    accountNumberMasked: detail.accountNumberMasked || '',
    bankName: detail.bankName || '',
    branchName: detail.branchName || '',
    accountType:
      detail.accountType === 'undeposited_funds' ? 'undeposited_funds' : 'cash_on_hand',
    currencyReference: detail.currencyReference?.id ? String(detail.currencyReference.id) : '',
    ledgerAccount: detail.ledgerAccount?.id ? String(detail.ledgerAccount.id) : '',
    isDefaultReceiptAccount: detail.isDefaultReceiptAccount === true,
    isDefaultDisbursementAccount: detail.isDefaultDisbursementAccount === true,
    isActive: detail.isActive !== false,
    notes: detail.notes || '',
  };
}

function buildFormFromDetail(detail: ExpenseDetail): PettyCashFormState {
  return {
    expenseNumber: detail.expenseNumber || '',
    expenseDate: toDateInputValue(detail.expenseDate),
    postingDate: toDateInputValue(detail.postingDate),
    vendor: detail.vendorId || '',
    expenseCategory: detail.expenseCategory || '',
    currency: detail.currency || 'PHP',
    subtotal: String(detail.subtotal || 0),
    project: detail.projectId || '',
    expenseAccount: detail.expenseAccountId || '',
    taxCode: detail.taxCodeId || '',
    cashAccount: detail.bankAccountId || '',
    notes: detail.notes || '',
  };
}

function toCashAccountMutationInput(
  formState: CashAccountFormState,
): CreateBankAccountInput & UpdateBankAccountInput {
  return {
    accountName: formState.accountName,
    accountNumberMasked: formState.accountNumberMasked || null,
    bankName: formState.bankName || null,
    branchName: formState.branchName || null,
    accountType: formState.accountType,
    currencyReference: formState.currencyReference,
    ledgerAccount: formState.ledgerAccount,
    isDefaultReceiptAccount: formState.isDefaultReceiptAccount,
    isDefaultDisbursementAccount: formState.isDefaultDisbursementAccount,
    isActive: formState.isActive,
    notes: formState.notes || null,
  };
}

function calculateExpensePreview(
  formState: PettyCashFormState,
  taxCodes: PettyCashRegisterResponse['referenceData']['taxCodes'],
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

function toMutationInput(formState: PettyCashFormState): ExpenseMutationInput {
  return {
    expenseNumber: formState.expenseNumber.trim() || null,
    expenseDate: formState.expenseDate,
    postingDate: formState.postingDate,
    vendor: formState.vendor || null,
    expenseCategory: formState.expenseCategory.trim() || null,
    paymentMethod: 'cash',
    currency: formState.currency.trim() || 'PHP',
    subtotal: Number(formState.subtotal || 0),
    project: formState.project || null,
    expenseAccount: formState.expenseAccount,
    taxCode: formState.taxCode || null,
    paymentAccount: null,
    bankAccount: formState.cashAccount || null,
    notes: formState.notes.trim() || null,
  };
}

function mapExpenseErrorState(message: string): ErrorBannerState {
  if (message.includes('defaultInputTaxAccount')) {
    return {
      message:
        'This cash expense cannot post yet. Add a purchase account to its tax code or configure the default input tax account in Accounting Settings.',
      actionLabel: 'Open Tax Operations',
      actionHref: '/accounting/tax-compliance/tax-operations',
    };
  }

  if (message.includes('Journal entry totals must be balanced before posting.')) {
    return {
      message:
        'This cash expense cannot post because the generated journal entry is out of balance. Review the subtotal, tax code, expense account, and cash account, then retry posting.',
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
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  required?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required={required}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

function renderCell(cell: PettyCashCell, index: number) {
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
      blue: 'bg-blue-50 text-blue-700 ring-blue-200',
      gray: 'bg-gray-100 text-gray-700 ring-gray-200',
      green: 'bg-green-50 text-green-700 ring-green-200',
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

function CashAccountsPanel({ tab }: { tab: (typeof TABS)[number] }) {
  const [data, setData] = useState<PettyCashAccountRegisterResponse | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<CashAccountFilterState>({
    statuses: [],
    accountTypes: [],
    coverageStates: [],
  });
  const [draftFilters, setDraftFilters] = useState<CashAccountFilterState>({
    statuses: [],
    accountTypes: [],
    coverageStates: [],
  });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const [selectedAccount, setSelectedAccount] = useState<BankAccountDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);

  const [createForm, setCreateForm] = useState<CashAccountFormState>(createEmptyCashAccountForm());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CashAccountFormState>(createEmptyCashAccountForm());
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);
  const [deletingAccountLabel, setDeletingAccountLabel] = useState('');
  const [deleteBlockers, setDeleteBlockers] = useState<string[]>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filterCount = filters.statuses.length + filters.accountTypes.length + filters.coverageStates.length;

  const fetchRegister = useCallback(
    async ({
      search,
      page,
      nextFilters,
      nextQuickFilters,
    }: {
      search: string;
      page: number;
      nextFilters: CashAccountFilterState;
      nextQuickFilters: string[];
    }) => {
      setIsLoading(true);
      setErrorState(null);
      try {
        const response = await getPettyCashAccounts({
          search,
          page,
          statuses: nextFilters.statuses,
          accountTypes: nextFilters.accountTypes,
          coverageStates: nextFilters.coverageStates,
          quickFilters: nextQuickFilters,
        });
        setData(response);
      } catch (fetchError) {
        setErrorState(fetchError instanceof Error ? fetchError.message : 'Unable to load cash accounts.');
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
    const rows = data?.rows || [];
    if (!rows.length) return;
    const headers = ['Account', 'Type', 'Ledger Account', 'Currency', 'Defaults', 'Status'];
    const rowMetadata = new Map((data?.rowMetadata || []).map((row) => [row.id, row]));
    const csvRows = rows.map((row) => [
      row.accountName,
      row.accountTypeLabel,
      row.ledgerAccountDisplay,
      row.currency,
      rowMetadata.get(row.id)?.defaultsLabel || 'None',
      row.statusLabel,
    ]);
    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cash-accounts.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleView = async (id: string) => {
    setIsViewOpen(true);
    setIsViewLoading(true);
    setSelectedAccount(null);
    try {
      const detail = await getBankAccountDetail(id);
      setSelectedAccount(detail);
    } catch (detailError) {
      setErrorState(detailError instanceof Error ? detailError.message : 'Unable to load cash account detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setCreateForm(createEmptyCashAccountForm());
    setCreateError(null);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreateError(null);
    setIsCreateSubmitting(true);
    try {
      await createBankAccount(toCashAccountMutationInput(createForm));
      setIsCreateOpen(false);
      setCurrentPage(1);
      await fetchRegister({
        search: submittedSearch,
        page: 1,
        nextFilters: filters,
        nextQuickFilters: quickFilters,
      });
    } catch (submissionError) {
      setCreateError(submissionError instanceof Error ? submissionError.message : 'Unable to create cash account.');
    } finally {
      setIsCreateSubmitting(false);
    }
  };

  const handleOpenEdit = async (id: string) => {
    setEditingAccountId(id);
    setEditError(null);
    setIsEditLoading(true);
    setIsEditOpen(true);
    try {
      const detail = await getBankAccountDetail(id);
      setEditForm(buildCashAccountFormFromDetail(detail));
    } catch (detailError) {
      setEditError(detailError instanceof Error ? detailError.message : 'Unable to load cash account detail.');
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingAccountId) return;
    setEditError(null);
    setIsEditSubmitting(true);
    try {
      await updateBankAccount(editingAccountId, toCashAccountMutationInput(editForm));
      setIsEditOpen(false);
      setEditingAccountId(null);
      handleRefresh();
    } catch (submissionError) {
      setEditError(submissionError instanceof Error ? submissionError.message : 'Unable to update cash account.');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleOpenDelete = async (row: PettyCashAccountRow) => {
    setDeletingAccountId(row.id);
    setDeletingAccountLabel(row.accountName);
    setDeleteBlockers([]);
    setDeleteError(null);
    setIsDeleteSubmitting(false);
    setIsDeleteOpen(true);
    try {
      const detail = await getBankAccountDetail(row.id);
      const blockers: string[] = [];
      if ((detail.usageSummary?.bankTransactionCount || 0) > 0) blockers.push(`Referenced by ${detail.usageSummary?.bankTransactionCount} bank transaction(s)`);
      if ((detail.usageSummary?.bankReconciliationCount || 0) > 0) blockers.push(`Referenced by ${detail.usageSummary?.bankReconciliationCount} bank reconciliation(s)`);
      if ((detail.usageSummary?.paymentMadeCount || 0) > 0) blockers.push(`Referenced by ${detail.usageSummary?.paymentMadeCount} payment(s) made`);
      if ((detail.usageSummary?.paymentReceivedCount || 0) > 0) blockers.push(`Referenced by ${detail.usageSummary?.paymentReceivedCount} payment(s) received`);
      if ((detail.usageSummary?.depositCount || 0) > 0) blockers.push(`Referenced by ${detail.usageSummary?.depositCount} deposit(s)`);
      setDeleteBlockers(blockers);
    } catch (detailError) {
      setDeleteError(detailError instanceof Error ? detailError.message : 'Unable to check cash account dependencies.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingAccountId) return;
    setIsDeleteSubmitting(true);
    setDeleteError(null);
    try {
      await deleteBankAccount(deletingAccountId);
      setIsDeleteOpen(false);
      setDeletingAccountId(null);
      setDeletingAccountLabel('');
      setDeleteBlockers([]);
      handleRefresh();
    } catch (deletionError) {
      setDeleteError(deletionError instanceof Error ? deletionError.message : 'Unable to delete cash account.');
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  const currencyOptions = [{ label: 'Select currency', value: '' }].concat(
    (data?.referenceData.currencies || []).map((currency) => ({
      label: `${currency.code ? `${currency.code} - ` : ''}${currency.name || 'Unnamed currency'}`,
      value: currency.id,
    })),
  );
  const ledgerAccountOptions = [{ label: 'Select ledger account', value: '' }].concat(
    (data?.referenceData.ledgerAccounts || []).map((ledgerAccount) => ({
      label: `${ledgerAccount.code ? `${ledgerAccount.code} - ` : ''}${ledgerAccount.name || 'Unnamed account'}`,
      value: ledgerAccount.id,
    })),
  );
  const accountTypeOptions = (data?.filterOptions.accountTypes || [
    { label: 'Cash On Hand', value: 'cash_on_hand' },
    { label: 'Undeposited Funds', value: 'undeposited_funds' },
  ]).map((option) => ({
    label: option.label,
    value: option.value,
  }));

  const renderCashAccountForm = (
    formState: CashAccountFormState,
    setFormState: React.Dispatch<React.SetStateAction<CashAccountFormState>>,
    submitLabel: string,
    isSubmitting: boolean,
    errorMessage: string | null,
    onCancel: () => void,
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
        <FormField label="Account Name" required>
          <Input value={formState.accountName} onChange={(value) => setFormState((previous) => ({ ...previous, accountName: value }))} required />
        </FormField>
        <FormField label="Account Type" required>
          <Select value={formState.accountType} onChange={(value) => setFormState((previous) => ({ ...previous, accountType: value as CashAccountFormState['accountType'] }))} options={accountTypeOptions} required />
        </FormField>
        <FormField label="Masked Account Number">
          <Input value={formState.accountNumberMasked} onChange={(value) => setFormState((previous) => ({ ...previous, accountNumberMasked: value }))} />
        </FormField>
        <FormField label="Bank Name">
          <Input value={formState.bankName} onChange={(value) => setFormState((previous) => ({ ...previous, bankName: value }))} />
        </FormField>
        <FormField label="Branch Name">
          <Input value={formState.branchName} onChange={(value) => setFormState((previous) => ({ ...previous, branchName: value }))} />
        </FormField>
        <FormField label="Currency" required>
          <Select value={formState.currencyReference} onChange={(value) => setFormState((previous) => ({ ...previous, currencyReference: value }))} options={currencyOptions} required />
        </FormField>
        <FormField label="Ledger Account" required>
          <Select value={formState.ledgerAccount} onChange={(value) => setFormState((previous) => ({ ...previous, ledgerAccount: value }))} options={ledgerAccountOptions} required />
        </FormField>
        <FormField label="Status" required>
          <Select value={formState.isActive ? 'true' : 'false'} onChange={(value) => setFormState((previous) => ({ ...previous, isActive: value === 'true' }))} options={[{ label: 'Active', value: 'true' }, { label: 'Inactive', value: 'false' }]} required />
        </FormField>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700">
          <input type="checkbox" checked={formState.isDefaultDisbursementAccount} onChange={(event) => setFormState((previous) => ({ ...previous, isDefaultDisbursementAccount: event.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <span>Default disbursement account</span>
        </label>
        <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700">
          <input type="checkbox" checked={formState.isDefaultReceiptAccount} onChange={(event) => setFormState((previous) => ({ ...previous, isDefaultReceiptAccount: event.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <span>Default receipt account</span>
        </label>
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
          <h2 className="text-lg font-semibold text-gray-900">{data?.meta.label || tab.label}</h2>
          <p className="text-sm text-gray-600">{data?.meta.description || tab.description}</p>
          <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
            <Plus className="h-4 w-4" />
            Create Cash Account
          </button>
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" />
            Refresh Accounts
          </button>
          <button type="button" onClick={handleExport} disabled={!(data?.rows.length)} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('ghost')} disabled:cursor-not-allowed disabled:opacity-50`}>
            <Download className="h-4 w-4" />
            Export Accounts
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {(data?.metrics || []).map((metric) => (
          <div key={metric.label}>
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
                  <p className="mt-1 text-sm text-gray-600">Select as many values as needed. Checked cash-account filters widen the result set using OR logic inside petty cash only.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => { setDraftFilters({ statuses: [], accountTypes: [], coverageStates: [] }); setFilters({ statuses: [], accountTypes: [], coverageStates: [] }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">
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
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Account Type</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.accountTypes || []).map((option) => {
                      const selected = draftFilters.accountTypes.includes(option.value);
                      return (
                        <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, accountTypes: toggleFilterValue(previous.accountTypes, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>
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
              <span>{data?.summary.ledgerMappedCount ?? 0} ledger-mapped</span>
            </div>
          </div>

          {errorState ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorState}
            </div>
          ) : null}

          {isLoading ? (
            <LoadingSkeleton columnCount={tab.columns.length + 1} />
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {tab.columns.map((column) => (
                          <th key={column} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                            {column}
                          </th>
                        ))}
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
                                <button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => handleOpenEdit(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="Edit">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => handleOpenDelete(row)} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700" title="Delete">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={tab.columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">
                            No cash accounts match the current search and filter combination.
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

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Cash Account Detail" description="Review the selected petty cash account including defaults, ledger mapping, and dependency usage.">
        <div className="space-y-6">
          {isViewLoading ? (
            <LoadingSkeleton />
          ) : selectedAccount ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['Account Name', selectedAccount.accountName || '-'],
                  ['Account Type', selectedAccount.accountType || '-'],
                  ['Masked Number', selectedAccount.accountNumberMasked || '-'],
                  ['Bank Name', selectedAccount.bankName || '-'],
                  ['Branch Name', selectedAccount.branchName || '-'],
                  ['Currency', selectedAccount.currencyReference ? `${selectedAccount.currencyReference.code ? `${selectedAccount.currencyReference.code} - ` : ''}${selectedAccount.currencyReference.name || ''}` : '-'],
                  ['Ledger Account', selectedAccount.ledgerAccount ? `${selectedAccount.ledgerAccount.code ? `${selectedAccount.ledgerAccount.code} - ` : ''}${selectedAccount.ledgerAccount.name || ''}` : '-'],
                  ['Status', selectedAccount.isActive === false ? 'Inactive' : 'Active'],
                  ['Default Receipt', selectedAccount.isDefaultReceiptAccount ? 'Yes' : 'No'],
                  ['Default Disbursement', selectedAccount.isDefaultDisbursementAccount ? 'Yes' : 'No'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  ['Bank Transactions', String(selectedAccount.usageSummary?.bankTransactionCount || 0)],
                  ['Reconciliations', String(selectedAccount.usageSummary?.bankReconciliationCount || 0)],
                  ['Payments / Deposits', String((selectedAccount.usageSummary?.paymentMadeCount || 0) + (selectedAccount.usageSummary?.paymentReceivedCount || 0) + (selectedAccount.usageSummary?.depositCount || 0))],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-2 text-sm font-semibold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900">Notes</h4>
                <p className="mt-2 text-sm text-gray-700">{selectedAccount.notes || '-'}</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">No details available.</p>
          )}
        </div>
      </SlideOver>

      <SlideOver isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Cash Account" description="Create a cash on hand or undeposited funds account for petty cash workflows.">
        {renderCashAccountForm(createForm, setCreateForm, 'Create Cash Account', isCreateSubmitting, createError, () => setIsCreateOpen(false), handleCreateSubmit)}
      </SlideOver>

      <SlideOver isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Cash Account" description="Update the petty cash account mapping, defaults, and current status.">
        {isEditLoading ? (
          <LoadingSkeleton />
        ) : (
          renderCashAccountForm(editForm, setEditForm, 'Save Changes', isEditSubmitting, editError, () => setIsEditOpen(false), handleEditSubmit)
        )}
      </SlideOver>

      <SlideOver isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Cash Account" description="Delete this petty cash account only if no dependent records still reference it.">
        <div className="space-y-6">
          {deleteError ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {deleteError}
            </div>
          ) : null}
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Delete {deletingAccountLabel}?</p>
            <p className="mt-1">This action cannot be undone. Dependency checks run before removal.</p>
          </div>
          {deleteBlockers.length > 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-medium">Delete is currently blocked by:</p>
              <ul className="mt-2 list-disc pl-5">
                {deleteBlockers.map((blocker) => (
                  <li key={blocker}>{blocker}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setIsDeleteOpen(false)} disabled={isDeleteSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleteSubmitting || deleteBlockers.length > 0} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {isDeleteSubmitting ? 'Deleting...' : 'Delete Cash Account'}
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}

function CashExpensesPanel({ tab }: { tab: (typeof TABS)[number] }) {
  const router = useRouter();
  const [data, setData] = useState<PettyCashRegisterResponse | null>(null);
  const [errorState, setErrorState] = useState<ErrorBannerState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<PettyCashFilterState>({ statuses: [], taxStates: [], coverageStates: [] });
  const [draftFilters, setDraftFilters] = useState<PettyCashFilterState>({ statuses: [], taxStates: [], coverageStates: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const [viewDetail, setViewDetail] = useState<ExpenseDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);

  const [createForm, setCreateForm] = useState<PettyCashFormState>(createEmptyForm());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<PettyCashFormState>(createEmptyForm());
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

  const filterCount = filters.statuses.length + filters.taxStates.length + filters.coverageStates.length;

  const fetchRegister = useCallback(
    async ({
      search,
      page,
      nextFilters,
      nextQuickFilters,
    }: {
      search: string;
      page: number;
      nextFilters: PettyCashFilterState;
      nextQuickFilters: string[];
    }) => {
      setIsLoading(true);
      setErrorState(null);
      try {
        const response = await getPettyCashExpenses({
          search,
          page,
          statuses: nextFilters.statuses,
          taxStates: nextFilters.taxStates,
          coverageStates: nextFilters.coverageStates,
          quickFilters: nextQuickFilters,
        });
        setData(response);
      } catch (fetchError) {
        setErrorState({
          message: fetchError instanceof Error ? fetchError.message : 'Unable to load petty cash expenses.',
        });
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
    const rows = data?.rows || [];
    if (!rows.length) return;
    const headers = ['Expense No.', 'Vendor', 'Category', 'Cash Account', 'Amount', 'Status', 'Documents'];
    const rowMetadataById = new Map((data?.rowMetadata || []).map((item) => [item.id, item]));
    const csvRows = rows.map((row) => [
      row.expenseNumber,
      row.vendorLabel,
      row.expenseCategory,
      row.cashAccountLabel,
      row.totalLabel,
      row.statusLabel,
      rowMetadataById.get(row.id)?.documentCount ?? row.documentCount,
    ]);
    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cash-expenses.csv';
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
        message: detailError instanceof Error ? detailError.message : 'Unable to load cash expense detail.',
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
      setCreateError(submissionError instanceof Error ? submissionError.message : 'Unable to create cash expense.');
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
      setEditError(detailError instanceof Error ? detailError.message : 'Unable to load cash expense detail.');
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
      setEditError(submissionError instanceof Error ? submissionError.message : 'Unable to update cash expense.');
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
      setDeleteError(deletionError instanceof Error ? deletionError.message : 'Unable to delete cash expense.');
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
      const message = postingError instanceof Error ? postingError.message : 'Unable to post cash expense.';
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
  const rowMetadataById = useMemo(
    () => new Map((data?.rowMetadata || []).map((item) => [item.id, item])),
    [data?.rowMetadata],
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
  const cashAccountOptions = [{ label: 'Select a cash account', value: '' }].concat(
    (referenceData?.bankAccounts || []).map((bankAccount) => ({
      label: `${bankAccount.accountName || 'Unnamed cash account'}${bankAccount.accountNumberMasked ? ` (${bankAccount.accountNumberMasked})` : ''}`,
      value: String(bankAccount.id),
    })),
  );

  const renderExpenseForm = (
    formState: PettyCashFormState,
    setFormState: React.Dispatch<React.SetStateAction<PettyCashFormState>>,
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
          <Input
            value={formState.expenseNumber}
            onChange={(value) => setFormState((previous) => ({ ...previous, expenseNumber: value }))}
            placeholder="Leave blank to auto-generate"
          />
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
          <Input
            value={formState.expenseCategory}
            onChange={(value) => setFormState((previous) => ({ ...previous, expenseCategory: value }))}
            placeholder="e.g. Office Supplies, Travel, Pantry"
          />
        </FormField>
        <FormField label="Payment Method">
          <Input value="Cash" onChange={() => undefined} disabled />
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
          <Select value={formState.expenseAccount} onChange={(value) => setFormState((previous) => ({ ...previous, expenseAccount: value }))} options={accountOptions} required />
        </FormField>
        <FormField label="Tax Code">
          <Select value={formState.taxCode} onChange={(value) => setFormState((previous) => ({ ...previous, taxCode: value }))} options={taxCodeOptions} />
        </FormField>
        <FormField label="Cash Account" required>
          <Select value={formState.cashAccount} onChange={(value) => setFormState((previous) => ({ ...previous, cashAccount: value }))} options={cashAccountOptions} required />
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
            Create Cash Expense
          </button>
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" />
            Refresh Cash View
          </button>
          <button type="button" onClick={handleExport} disabled={!currentRows.length} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
            <Download className="h-4 w-4" />
            Export Cash Expenses
          </button>
        </div>
      </div>

      {data?.metrics?.length ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {data.metrics.map((metric) => (
            <div key={metric.id}>
              <MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} />
            </div>
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
                  <p className="mt-1 text-sm text-gray-600">Select as many values as needed. All checked filters widen the result set using OR logic inside petty cash only.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDraftFilters({ statuses: [], taxStates: [], coverageStates: [] });
                      setFilters({ statuses: [], taxStates: [], coverageStates: [] });
                      setCurrentPage(1);
                      setIsFilterPanelOpen(false);
                    }}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </button>
                  <button type="button" onClick={() => setIsFilterPanelOpen(false)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters({ ...draftFilters });
                      setCurrentPage(1);
                      setIsFilterPanelOpen(false);
                    }}
                    className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                  >
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
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Tax Coverage</h5>
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
              <span>{data?.summary.totalDocuments ?? 0} linked documents</span>
            </div>
          </div>

          {blockedPostingEntries.length > 0 ? (
            <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">Some draft cash expenses are not post-ready.</p>
                  <p className="mt-1">
                    {blockedPostingEntries.length} draft cash expense(s) cannot post yet. Open the record and fix the blocker shown on the disabled Post action.
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
            <LoadingSkeleton columnCount={tab.columns.length + 1} />
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {tab.columns.map((column) => {
                          const isAmountColumn = column === 'Amount';
                          return (
                            <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${isAmountColumn ? 'text-right' : 'text-left'}`}>
                              {column}
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
                            ? 'Only draft cash expenses can be posted'
                            : canPost
                              ? 'Post cash expense'
                              : postBlockers[0] || 'This cash expense is not ready to post';
                          const metadata = rowMetadataById.get(row.id);

                          return (
                            <tr key={row.id} className="hover:bg-gray-50">
                              {row.cells.map((cell, index) => renderCell(cell, index))}
                              <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title={`View detail${metadata?.documentCount ? ` (${metadata.documentCount} document${metadata.documentCount === 1 ? '' : 's'})` : ''}`}>
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button type="button" onClick={() => handleOpenEdit(row.id)} disabled={!isMutable} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40" title={isMutable ? 'Edit' : 'Only draft cash expenses can be edited'}>
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button type="button" onClick={() => handleOpenDelete(row.id, row.expenseNumber)} disabled={!isMutable} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40" title={isMutable ? 'Delete' : 'Only draft cash expenses can be deleted'}>
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
                            No petty cash expense rows found.
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

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Cash Expense Detail" description="Review header values, tax treatment, cash funding account, documents, and journal linkage for the selected cash expense.">
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
                  ['Cash Account', viewDetail.bankAccountLabel || viewDetail.paymentAccountLabel || '-'],
                  ['Posted Journal', viewDetail.postedJournalEntryId || '-'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  ['Subtotal', viewDetail.subtotalLabel],
                  ['Tax Total', viewDetail.taxTotalLabel],
                  ['Total', viewDetail.totalLabel],
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
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Supporting Documents</h4>
                    <p className="mt-1 text-sm text-gray-600">Document links currently attached to this cash expense.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-500">{viewDetail.usageSummary.documentCount} linked document(s)</div>
                    <button
                      type="button"
                      onClick={() => router.push('/accounting/expenses/claims-reimbursements?tab=supporting-documents')}
                      className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Open Supporting Documents
                    </button>
                  </div>
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
          ) : (
            <p className="text-sm text-gray-500">No details available.</p>
          )}
        </div>
      </SlideOver>

      <SlideOver isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Cash Expense" description="Create a petty cash expense record before posting it into the general ledger.">
        {renderExpenseForm(createForm, setCreateForm, createPreview, 'Create Cash Expense', isCreateSubmitting, () => setIsCreateOpen(false), createError, handleCreateSubmit)}
      </SlideOver>

      <SlideOver isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Cash Expense" description="Update the draft cash expense header and accounting mappings before posting.">
        {isEditLoading ? (
          <LoadingSkeleton />
        ) : (
          renderExpenseForm(editForm, setEditForm, editPreview, 'Save Changes', isEditSubmitting, () => setIsEditOpen(false), editError, handleEditSubmit)
        )}
      </SlideOver>

      <SlideOver isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Cash Expense" description="Remove this draft cash expense if it has no blocking dependencies.">
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
              {isDeleteSubmitting ? 'Deleting...' : 'Delete Cash Expense'}
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}

export function PettyCashClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = TABS.find((tab) => tab.id === rawTab)?.id || 'cash-expenses';
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
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cash Expense Monitoring</h1>
              <p className="mt-1 max-w-3xl text-sm text-gray-600">
                Monitor cash-paid spending and keep the existing cash-account directory available in one practical workspace for finance operations.
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

      {activeTab === 'cash-expenses' ? <CashExpensesPanel tab={currentTab} /> : <CashAccountsPanel tab={currentTab} />}
    </div>
  );
}
