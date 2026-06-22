'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
  createTransfer,
  deleteTransfer,
  getTransferDetail,
  getTransfers,
  postTransfer,
  updateTransfer,
  type TransferCell,
  type TransferDetail,
  type TransferMetric,
  type TransferMutationInput,
  type TransferRegisterResponse,
  type TransferRow,
} from './actions';

type TransferFilterState = {
  statuses: string[];
  bankAccounts: string[];
  coverageStates: string[];
};

type TransferFormState = {
  transferNumber: string;
  transferDate: string;
  fromBankAccount: string;
  toBankAccount: string;
  amount: string;
  notes: string;
};

const LIVE_TAB = {
  id: 'transfers-undeposited',
  label: 'Transfers & Undeposited Funds',
  description: 'Review internal transfers and movements that involve undeposited-funds accounts using live transfer records.',
  searchPlaceholder: 'Search transfer no., from account, to account, note, or prepared by',
} as const;

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  if (variant === 'ghost') return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
}

function getMetricTone(trend: TransferMetric['trend']) {
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

function createEmptyForm(): TransferFormState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    transferNumber: '',
    transferDate: today,
    fromBankAccount: '',
    toBankAccount: '',
    amount: '0',
    notes: '',
  };
}

function buildFormFromDetail(detail: TransferDetail): TransferFormState {
  return {
    transferNumber: detail.transferNumber || '',
    transferDate: toDateInputValue(detail.transferDate),
    fromBankAccount: detail.fromBankAccountId || '',
    toBankAccount: detail.toBankAccountId || '',
    amount: String(detail.amount || 0),
    notes: detail.notes || '',
  };
}

function toMutationInput(formState: TransferFormState): TransferMutationInput {
  return {
    transferNumber: formState.transferNumber.trim() || null,
    transferDate: formState.transferDate,
    fromBankAccount: formState.fromBankAccount,
    toBankAccount: formState.toBankAccount,
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

function renderCell(cell: TransferCell, index: number) {
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

export function TransfersUndepositedPanel() {
  const [data, setData] = useState<TransferRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<TransferFilterState>({ statuses: [], bankAccounts: [], coverageStates: [] });
  const [draftFilters, setDraftFilters] = useState<TransferFilterState>({ statuses: [], bankAccounts: [], coverageStates: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const [viewDetail, setViewDetail] = useState<TransferDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);

  const [createForm, setCreateForm] = useState<TransferFormState>(createEmptyForm());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<TransferFormState>(createEmptyForm());
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<TransferRow | null>(null);
  const [deleteDetail, setDeleteDetail] = useState<TransferDetail | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [postTarget, setPostTarget] = useState<TransferDetail | null>(null);
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
      nextFilters: TransferFilterState;
      nextQuickFilters: string[];
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getTransfers({
          search,
          page,
          statuses: nextFilters.statuses,
          bankAccounts: nextFilters.bankAccounts,
          coverageStates: nextFilters.coverageStates,
          quickFilters: nextQuickFilters,
        });
        setData(response);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load transfers.');
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
    const headers = ['Transfer No.', 'Transfer Date', 'From Account', 'To Account', 'Amount', 'Status', 'Journal', 'Prepared By'];
    const csvRows = data.rows.map((row) => [
      row.transferNumber,
      row.transferDateLabel,
      row.fromBankAccountLabel,
      row.toBankAccountLabel,
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
    link.download = 'cash-movement-transfers-undeposited.csv';
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
      const detail = await getTransferDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load transfer detail.');
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
      await createTransfer(toMutationInput(createForm));
      setIsCreateOpen(false);
      setCurrentPage(1);
      await fetchRegister({ search: submittedSearch, page: 1, nextFilters: filters, nextQuickFilters: quickFilters });
    } catch (submissionError) {
      setCreateError(submissionError instanceof Error ? submissionError.message : 'Unable to create transfer.');
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
      const detail = await getTransferDetail(id);
      setEditForm(buildFormFromDetail(detail));
    } catch (detailError) {
      setEditError(detailError instanceof Error ? detailError.message : 'Unable to load transfer detail.');
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
      await updateTransfer(editingId, toMutationInput(editForm));
      setIsEditOpen(false);
      setEditingId(null);
      handleRefresh();
    } catch (submissionError) {
      setEditError(submissionError instanceof Error ? submissionError.message : 'Unable to update transfer.');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleOpenDelete = async (row: TransferRow) => {
    setDeleteTarget(row);
    setDeleteDetail(null);
    setDeleteError(null);
    setIsDeleteOpen(true);
    setIsDeleteLoading(true);
    try {
      const detail = await getTransferDetail(row.id);
      setDeleteDetail(detail);
    } catch (detailError) {
      setDeleteError(detailError instanceof Error ? detailError.message : 'Unable to load transfer detail.');
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleteSubmitting(true);
    setDeleteError(null);
    try {
      await deleteTransfer(deleteTarget.id);
      setIsDeleteOpen(false);
      setDeleteTarget(null);
      setDeleteDetail(null);
      handleRefresh();
    } catch (deletionError) {
      setDeleteError(deletionError instanceof Error ? deletionError.message : 'Unable to delete transfer.');
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  const handleOpenPost = async (row: TransferRow) => {
    setPostError(null);
    setIsPostOpen(true);
    try {
      const detail = await getTransferDetail(row.id);
      setPostTarget(detail);
    } catch (detailError) {
      setPostError(detailError instanceof Error ? detailError.message : 'Unable to load transfer detail.');
    }
  };

  const handleConfirmPost = async () => {
    if (!postTarget) return;
    setIsPostSubmitting(true);
    setPostError(null);
    try {
      await postTransfer(postTarget.id);
      setIsPostOpen(false);
      setPostTarget(null);
      handleRefresh();
    } catch (postingError) {
      setPostError(postingError instanceof Error ? postingError.message : 'Unable to post transfer.');
    } finally {
      setIsPostSubmitting(false);
    }
  };

  const bankAccountOptions = [{ label: 'Select account', value: '' }].concat(
    (data?.referenceData.bankAccounts || []).map((account) => ({
      label: `${account.accountName || account.bankName || 'Unnamed account'}${account.accountNumberMasked ? ` (${account.accountNumberMasked})` : ''} - ${account.accountTypeLabel || account.accountType || 'Unknown'}`,
      value: String(account.id),
    })),
  );

  const renderForm = (
    formState: TransferFormState,
    setFormState: React.Dispatch<React.SetStateAction<TransferFormState>>,
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
        <FormField label="Transfer No.">
          <Input value={formState.transferNumber} onChange={(value) => setFormState((previous) => ({ ...previous, transferNumber: value }))} placeholder="Auto-generated when blank" />
        </FormField>
        <FormField label="Transfer Date" required>
          <Input type="date" value={formState.transferDate} onChange={(value) => setFormState((previous) => ({ ...previous, transferDate: value }))} required />
        </FormField>
        <FormField label="From Account" required>
          <Select value={formState.fromBankAccount} onChange={(value) => setFormState((previous) => ({ ...previous, fromBankAccount: value }))} options={bankAccountOptions} required />
        </FormField>
        <FormField label="To Account" required>
          <Select value={formState.toBankAccount} onChange={(value) => setFormState((previous) => ({ ...previous, toBankAccount: value }))} options={bankAccountOptions} required />
        </FormField>
        <FormField label="Transfer Amount" required>
          <Input type="number" value={formState.amount} onChange={(value) => setFormState((previous) => ({ ...previous, amount: value }))} required />
        </FormField>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h4 className="text-sm font-semibold text-gray-900">Posting Guidance</h4>
        <p className="mt-1 text-sm text-gray-600">Draft transfers can be reviewed and edited here, then posted later from the table using the dedicated Post action.</p>
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
          <h2 className="text-lg font-semibold text-gray-900">{data?.meta.label || LIVE_TAB.label}</h2>
          <p className="text-sm text-gray-600">{data?.meta.description || LIVE_TAB.description}</p>
          <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" />
            Refresh Transfers
          </button>
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
            <Plus className="h-4 w-4" />
            Create Transfer
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
                  <p className="mt-1 text-sm text-gray-600">Select as many filter values as needed. Transfer filters widen results using OR behavior across all checked options.</p>
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
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Accounts</h5>
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
              <h3 className="text-base font-semibold text-gray-900">{data?.meta.tableTitle || 'Transfer Register'}</h3>
              <p className="text-sm text-gray-600">{data?.meta.tableDescription || 'Live register of cash transfers and undeposited-funds movements.'}</p>
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
                        {(data?.meta.columns || ['Transfer No.', 'Transfer Date', 'From Account', 'To Account', { label: 'Transfer Amount', align: 'right' }, 'Status']).map((column) => {
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
                                <button type="button" onClick={() => handleOpenPost(row)} disabled={!row.isDraft} className="inline-flex items-center gap-1 rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40" title={row.isDraft ? 'Post transfer' : 'Only draft transfers can be posted'}>
                                  <SendHorizonal className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => handleOpenEdit(row.id)} disabled={!row.isDraft} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40" title={row.isDraft ? 'Edit' : 'Only draft transfers can be edited'}>
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => handleOpenDelete(row)} disabled={!row.isDraft} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40" title={row.isDraft ? 'Delete' : 'Only draft transfers can be deleted'}>
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                            No transfer rows match the current search and filter combination.
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

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Transfer Detail" description="Review origin, destination, journal linkage, and undeposited-funds involvement for the selected transfer.">
        {isViewLoading ? (
          <LoadingSkeleton columnCount={2} />
        ) : viewDetail ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['Transfer No.', viewDetail.transferNumber || '-'],
                ['Transfer Date', viewDetail.transferDateLabel],
                ['From Account', viewDetail.fromBankAccountLabel],
                ['From Ledger Account', viewDetail.fromLedgerAccountLabel || '-'],
                ['To Account', viewDetail.toBankAccountLabel],
                ['To Ledger Account', viewDetail.toLedgerAccountLabel || '-'],
                ['Amount', viewDetail.amountLabel],
                ['Status', viewDetail.statusLabel],
                ['Journal Link', viewDetail.postedJournalEntryLabel],
                ['Prepared By', viewDetail.preparedByLabel],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                  <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className={`rounded-xl border p-4 shadow-sm ${viewDetail.involvesUndepositedFunds ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Undeposited Funds</p>
                <p className="mt-2 text-sm font-medium text-gray-900">{viewDetail.involvesUndepositedFunds ? 'This transfer involves an undeposited-funds account.' : 'This transfer does not involve an undeposited-funds account.'}</p>
              </div>
              <div className={`rounded-xl border p-4 shadow-sm ${viewDetail.isBankToBank ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Transfer Shape</p>
                <p className="mt-2 text-sm font-medium text-gray-900">{viewDetail.isBankToBank ? 'Bank-to-bank transfer' : 'Mixed account-type transfer'}</p>
              </div>
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

      <SlideOver isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Transfer" description="Create a draft transfer using the real accounting transfer collection.">
        {renderForm(createForm, setCreateForm, 'Create Transfer', isCreateSubmitting, createError, () => setIsCreateOpen(false), handleCreateSubmit)}
      </SlideOver>

      <SlideOver isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Transfer" description="Update a draft transfer before it is posted into journals.">
        {isEditLoading ? (
          <LoadingSkeleton columnCount={2} />
        ) : (
          renderForm(editForm, setEditForm, 'Save Changes', isEditSubmitting, editError, () => setIsEditOpen(false), handleEditSubmit)
        )}
      </SlideOver>

      <SlideOver isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Transfer" description="Delete this draft transfer only if it has not been posted.">
        <div className="space-y-6">
          {deleteError ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {deleteError}
            </div>
          ) : null}

          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Delete {deleteTarget?.transferNumber || 'this transfer'}?</p>
            <p className="mt-1">This action cannot be undone.</p>
          </div>

          {isDeleteLoading ? (
            <LoadingSkeleton columnCount={2} />
          ) : deleteDetail && !deleteDetail.usageSummary.canDelete ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-medium">Delete is blocked.</p>
              <p className="mt-1">{deleteDetail.usageSummary.deleteBlockedReason || 'Posted or voided transfers cannot be deleted.'}</p>
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setIsDeleteOpen(false)} disabled={isDeleteSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleteSubmitting || (deleteDetail ? !deleteDetail.usageSummary.canDelete : true)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {isDeleteSubmitting ? 'Deleting...' : 'Delete Transfer'}
            </button>
          </div>
        </div>
      </SlideOver>

      <SlideOver isOpen={isPostOpen} onClose={() => setIsPostOpen(false)} title="Post Transfer" description="Post this draft transfer into journals using the existing accounting banking service.">
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
                  <p className="mt-1">{postTarget.usageSummary.postBlockedReason || 'This transfer cannot be posted yet.'}</p>
                </div>
              ) : null}

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-sm text-gray-500">Transfer No.</span>
                  <span className="text-sm font-medium text-gray-900">{postTarget.transferNumber}</span>
                </div>
                <div className="mt-3 flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-sm text-gray-500">From Account</span>
                  <span className="text-sm font-medium text-gray-900">{postTarget.fromBankAccountLabel}</span>
                </div>
                <div className="mt-3 flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-sm text-gray-500">To Account</span>
                  <span className="text-sm font-medium text-gray-900">{postTarget.toBankAccountLabel}</span>
                </div>
                <div className="mt-3 flex justify-between">
                  <span className="text-sm text-gray-500">Amount</span>
                  <span className="text-sm font-medium text-gray-900">{postTarget.amountLabel}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">Loading transfer detail...</p>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setIsPostOpen(false)} disabled={isPostSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={handleConfirmPost} disabled={isPostSubmitting || !postTarget?.usageSummary.canPost} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {isPostSubmitting ? 'Posting...' : 'Post Transfer'}
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
