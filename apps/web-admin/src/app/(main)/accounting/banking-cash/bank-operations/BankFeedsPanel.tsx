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
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import {
  createBankFeed,
  deleteBankFeed,
  getBankFeedDetail,
  getBankFeeds,
  syncBankFeeds,
  updateBankFeed,
  type BankFeedDetail,
  type BankFeedMetric,
  type BankFeedMutationInput,
  type BankFeedRegisterResponse,
  type BankFeedRow,
  type BankTransactionCell,
} from './actions';

type BankFeedFilterState = {
  statuses: string[];
  connectors: string[];
  healthStates: string[];
};

type BankFeedFormState = {
  feedReference: string;
  bankAccount: string;
  connectorType: string;
  connectorName: string;
  providerReference: string;
  externalAccountId: string;
  connectionStatus: string;
  healthStatus: string;
  syncFrequency: string;
  lastSyncAt: string;
  lastSuccessfulSyncAt: string;
  lastAttemptedSyncAt: string;
  nextScheduledSyncAt: string;
  lastImportedRowCount: string;
  lastImportedTransactionCount: string;
  feedRuleSetName: string;
  feedRuleCount: string;
  autoPostRuleCount: string;
  manualReviewRuleCount: string;
  lastRuleChangeAt: string;
  syncDelayMinutes: string;
  averageSyncLatencySeconds: string;
  tokenExpiresAt: string;
  needsReconnection: boolean;
  disconnectReason: string;
  lastErrorSummary: string;
  notes: string;
  preservedMetadata: Record<string, unknown> | null;
};

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  if (variant === 'ghost') return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
}

function getMetricTone(trend: BankFeedMetric['trend']) {
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
  return date.toISOString().slice(0, 16);
}

function createEmptyForm(): BankFeedFormState {
  return {
    feedReference: '',
    bankAccount: '',
    connectorType: 'direct_api',
    connectorName: '',
    providerReference: '',
    externalAccountId: '',
    connectionStatus: 'connected',
    healthStatus: 'healthy',
    syncFrequency: 'hourly',
    lastSyncAt: '',
    lastSuccessfulSyncAt: '',
    lastAttemptedSyncAt: '',
    nextScheduledSyncAt: '',
    lastImportedRowCount: '0',
    lastImportedTransactionCount: '0',
    feedRuleSetName: '',
    feedRuleCount: '0',
    autoPostRuleCount: '0',
    manualReviewRuleCount: '0',
    lastRuleChangeAt: '',
    syncDelayMinutes: '0',
    averageSyncLatencySeconds: '0',
    tokenExpiresAt: '',
    needsReconnection: false,
    disconnectReason: '',
    lastErrorSummary: '',
    notes: '',
    preservedMetadata: null,
  };
}

function buildFormFromDetail(detail: BankFeedDetail): BankFeedFormState {
  return {
    feedReference: detail.feedReference || '',
    bankAccount: detail.bankAccountId || '',
    connectorType: detail.connectorType || 'direct_api',
    connectorName: detail.connectorName || '',
    providerReference: detail.providerReference || '',
    externalAccountId: detail.externalAccountId || '',
    connectionStatus: detail.connectionStatus || 'connected',
    healthStatus: detail.healthStatus || 'healthy',
    syncFrequency: detail.syncFrequency || 'hourly',
    lastSyncAt: toDateInputValue(detail.lastSyncAt),
    lastSuccessfulSyncAt: toDateInputValue(detail.lastSuccessfulSyncAt),
    lastAttemptedSyncAt: toDateInputValue(detail.lastAttemptedSyncAt),
    nextScheduledSyncAt: toDateInputValue(detail.nextScheduledSyncAt),
    lastImportedRowCount: String(detail.lastImportedRowCount || 0),
    lastImportedTransactionCount: String(detail.lastImportedTransactionCount || 0),
    feedRuleSetName: detail.feedRuleSetName || '',
    feedRuleCount: String(detail.feedRuleCount || 0),
    autoPostRuleCount: String(detail.autoPostRuleCount || 0),
    manualReviewRuleCount: String(detail.manualReviewRuleCount || 0),
    lastRuleChangeAt: toDateInputValue(detail.lastRuleChangeAt),
    syncDelayMinutes: String(detail.syncDelayMinutes || 0),
    averageSyncLatencySeconds: String(detail.averageSyncLatencySeconds || 0),
    tokenExpiresAt: toDateInputValue(detail.tokenExpiresAt),
    needsReconnection: detail.needsReconnection,
    disconnectReason: detail.disconnectReason || '',
    lastErrorSummary: detail.lastErrorSummary || '',
    notes: detail.notes || '',
    preservedMetadata: detail.metadata || null,
  };
}

function toMutationInput(formState: BankFeedFormState): BankFeedMutationInput {
  return {
    feedReference: formState.feedReference.trim() || null,
    bankAccount: formState.bankAccount,
    connectorType: formState.connectorType,
    connectorName: formState.connectorName.trim(),
    providerReference: formState.providerReference.trim() || null,
    externalAccountId: formState.externalAccountId.trim() || null,
    connectionStatus: formState.connectionStatus,
    healthStatus: formState.healthStatus,
    syncFrequency: formState.syncFrequency,
    lastSyncAt: formState.lastSyncAt || null,
    lastSuccessfulSyncAt: formState.lastSuccessfulSyncAt || null,
    lastAttemptedSyncAt: formState.lastAttemptedSyncAt || null,
    nextScheduledSyncAt: formState.nextScheduledSyncAt || null,
    lastImportedRowCount: Number(formState.lastImportedRowCount || 0),
    lastImportedTransactionCount: Number(formState.lastImportedTransactionCount || 0),
    feedRuleSetName: formState.feedRuleSetName.trim() || null,
    feedRuleCount: Number(formState.feedRuleCount || 0),
    autoPostRuleCount: Number(formState.autoPostRuleCount || 0),
    manualReviewRuleCount: Number(formState.manualReviewRuleCount || 0),
    lastRuleChangeAt: formState.lastRuleChangeAt || null,
    syncDelayMinutes: Number(formState.syncDelayMinutes || 0),
    averageSyncLatencySeconds: Number(formState.averageSyncLatencySeconds || 0),
    tokenExpiresAt: formState.tokenExpiresAt || null,
    needsReconnection: formState.needsReconnection,
    disconnectReason: formState.disconnectReason.trim() || null,
    lastErrorSummary: formState.lastErrorSummary.trim() || null,
    notes: formState.notes.trim() || null,
    metadata: formState.preservedMetadata,
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

export function BankFeedsPanel() {
  const [data, setData] = useState<BankFeedRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<BankFeedFilterState>({ statuses: [], connectors: [], healthStates: [] });
  const [draftFilters, setDraftFilters] = useState<BankFeedFilterState>({ statuses: [], connectors: [], healthStates: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isSyncSubmitting, setIsSyncSubmitting] = useState(false);

  const [viewDetail, setViewDetail] = useState<BankFeedDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);

  const [createForm, setCreateForm] = useState<BankFeedFormState>(createEmptyForm());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<BankFeedFormState>(createEmptyForm());
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<BankFeedRow | null>(null);
  const [deleteDetail, setDeleteDetail] = useState<BankFeedDetail | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filterCount = filters.statuses.length + filters.connectors.length + filters.healthStates.length;

  const fetchData = useCallback(
    async ({
      search,
      page,
      nextFilters,
      nextQuickFilters,
    }: {
      search: string;
      page: number;
      nextFilters: BankFeedFilterState;
      nextQuickFilters: string[];
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getBankFeeds({
          search,
          page,
          statuses: nextFilters.statuses,
          connectors: nextFilters.connectors,
          healthStates: nextFilters.healthStates,
          quickFilters: nextQuickFilters,
        });
        setData(response);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load bank feeds.');
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
    const headers = ['Bank Account', 'Connector', 'Connection Status', 'Health', 'Last Sync', 'Imported Rows', 'Rule Set', 'Disconnect Reason'];
    const csvRows = data.rows.map((row) => [
      row.bankAccountLabel,
      row.connectorName,
      row.connectionStatusLabel,
      row.healthStatusLabel,
      row.lastSyncAtLabel,
      row.lastImportedRowCount,
      row.feedRuleSetName || '-',
      row.disconnectReason || '-',
    ]);
    const csvContent = [headers, ...csvRows].map((row) => row.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bank-feeds.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSyncNow = async (ids: Array<string>) => {
    if (!ids.length) return;
    setIsSyncSubmitting(true);
    setError(null);
    try {
      await syncBankFeeds(ids);
      handleRefresh();
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : 'Unable to sync selected bank feeds.');
    } finally {
      setIsSyncSubmitting(false);
    }
  };

  const handleOpenView = async (id: string) => {
    setIsViewOpen(true);
    setIsViewLoading(true);
    setViewDetail(null);
    try {
      const detail = await getBankFeedDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load bank feed detail.');
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
      await createBankFeed(toMutationInput(createForm));
      setIsCreateOpen(false);
      setCurrentPage(1);
      await fetchData({
        search: submittedSearch,
        page: 1,
        nextFilters: filters,
        nextQuickFilters: quickFilters,
      });
    } catch (submissionError) {
      setCreateError(submissionError instanceof Error ? submissionError.message : 'Unable to create bank feed.');
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
      const detail = await getBankFeedDetail(id);
      setEditForm(buildFormFromDetail(detail));
    } catch (detailError) {
      setEditError(detailError instanceof Error ? detailError.message : 'Unable to load bank feed detail.');
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
      await updateBankFeed(editingId, toMutationInput(editForm));
      setIsEditOpen(false);
      setEditingId(null);
      handleRefresh();
    } catch (submissionError) {
      setEditError(submissionError instanceof Error ? submissionError.message : 'Unable to update bank feed.');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleOpenDelete = async (row: BankFeedRow) => {
    setDeleteTarget(row);
    setDeleteDetail(null);
    setDeleteError(null);
    setIsDeleteOpen(true);
    setIsDeleteLoading(true);
    try {
      const detail = await getBankFeedDetail(row.id);
      setDeleteDetail(detail);
    } catch (detailError) {
      setDeleteError(detailError instanceof Error ? detailError.message : 'Unable to load bank feed detail.');
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleteSubmitting(true);
    setDeleteError(null);
    try {
      await deleteBankFeed(deleteTarget.id);
      setIsDeleteOpen(false);
      setDeleteTarget(null);
      setDeleteDetail(null);
      handleRefresh();
    } catch (deletionError) {
      setDeleteError(deletionError instanceof Error ? deletionError.message : 'Unable to delete bank feed.');
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  const bankAccountOptions = [{ label: 'Select bank account', value: '' }].concat(
    (data?.referenceData.bankAccounts || [])
      .filter((account) => account.isActive)
      .map((account) => ({
        label: `${account.accountName || account.bankName || 'Unnamed bank account'}${account.accountNumberMasked ? ` (${account.accountNumberMasked})` : ''}`,
        value: String(account.id),
      })),
  );

  const connectorTypeOptions = (data?.referenceData.connectorTypes || []).map((option) => ({
    label: option.label,
    value: option.value,
  }));
  const connectionStatusOptions = (data?.referenceData.connectionStatuses || []).map((option) => ({
    label: option.label,
    value: option.value,
  }));
  const healthStatusOptions = (data?.referenceData.healthStatuses || []).map((option) => ({
    label: option.label,
    value: option.value,
  }));
  const syncFrequencyOptions = (data?.referenceData.syncFrequencies || []).map((option) => ({
    label: option.label,
    value: option.value,
  }));

  const liveColumns = data?.meta.columns || ['Bank Account', 'Connector', 'Last Sync', 'Imported Rows', 'Rule Set', 'Health'];
  const syncableIds = new Set(data?.flags.syncableFeedIds || []);

  const renderForm = (
    formState: BankFeedFormState,
    setFormState: React.Dispatch<React.SetStateAction<BankFeedFormState>>,
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
        <FormField label="Feed Reference">
          <Input value={formState.feedReference} onChange={(value) => setFormState((previous) => ({ ...previous, feedReference: value }))} placeholder="Auto-generated when blank" />
        </FormField>
        <FormField label="Bank Account" required>
          <Select value={formState.bankAccount} onChange={(value) => setFormState((previous) => ({ ...previous, bankAccount: value }))} options={bankAccountOptions} required />
        </FormField>
        <FormField label="Connector Type" required>
          <Select value={formState.connectorType} onChange={(value) => setFormState((previous) => ({ ...previous, connectorType: value }))} options={connectorTypeOptions} required />
        </FormField>
        <FormField label="Connector Name" required>
          <Input value={formState.connectorName} onChange={(value) => setFormState((previous) => ({ ...previous, connectorName: value }))} required placeholder="e.g. Direct API via Treasury Hub" />
        </FormField>
        <FormField label="Provider Reference">
          <Input value={formState.providerReference} onChange={(value) => setFormState((previous) => ({ ...previous, providerReference: value }))} placeholder="e.g. PROVIDER-001" />
        </FormField>
        <FormField label="External Account ID">
          <Input value={formState.externalAccountId} onChange={(value) => setFormState((previous) => ({ ...previous, externalAccountId: value }))} placeholder="Provider-side account identifier" />
        </FormField>
        <FormField label="Connection Status" required>
          <Select value={formState.connectionStatus} onChange={(value) => setFormState((previous) => ({ ...previous, connectionStatus: value }))} options={connectionStatusOptions} required />
        </FormField>
        <FormField label="Health Status" required>
          <Select value={formState.healthStatus} onChange={(value) => setFormState((previous) => ({ ...previous, healthStatus: value }))} options={healthStatusOptions} required />
        </FormField>
        <FormField label="Sync Frequency" required>
          <Select value={formState.syncFrequency} onChange={(value) => setFormState((previous) => ({ ...previous, syncFrequency: value }))} options={syncFrequencyOptions} required />
        </FormField>
        <FormField label="Token Expires At">
          <Input type="datetime-local" value={formState.tokenExpiresAt} onChange={(value) => setFormState((previous) => ({ ...previous, tokenExpiresAt: value }))} />
        </FormField>
        <FormField label="Last Imported Rows">
          <Input type="number" value={formState.lastImportedRowCount} onChange={(value) => setFormState((previous) => ({ ...previous, lastImportedRowCount: value }))} />
        </FormField>
        <FormField label="Imported Transactions">
          <Input type="number" value={formState.lastImportedTransactionCount} onChange={(value) => setFormState((previous) => ({ ...previous, lastImportedTransactionCount: value }))} />
        </FormField>
        <FormField label="Feed Rule Set">
          <Input value={formState.feedRuleSetName} onChange={(value) => setFormState((previous) => ({ ...previous, feedRuleSetName: value }))} placeholder="e.g. Collections + Refund Rules" />
        </FormField>
        <FormField label="Feed Rule Count">
          <Input type="number" value={formState.feedRuleCount} onChange={(value) => setFormState((previous) => ({ ...previous, feedRuleCount: value }))} />
        </FormField>
        <FormField label="Auto-post Rules">
          <Input type="number" value={formState.autoPostRuleCount} onChange={(value) => setFormState((previous) => ({ ...previous, autoPostRuleCount: value }))} />
        </FormField>
        <FormField label="Manual Review Rules">
          <Input type="number" value={formState.manualReviewRuleCount} onChange={(value) => setFormState((previous) => ({ ...previous, manualReviewRuleCount: value }))} />
        </FormField>
        <FormField label="Last Rule Change">
          <Input type="datetime-local" value={formState.lastRuleChangeAt} onChange={(value) => setFormState((previous) => ({ ...previous, lastRuleChangeAt: value }))} />
        </FormField>
        <FormField label="Sync Delay Minutes">
          <Input type="number" value={formState.syncDelayMinutes} onChange={(value) => setFormState((previous) => ({ ...previous, syncDelayMinutes: value }))} />
        </FormField>
        <FormField label="Average Sync Latency (Seconds)">
          <Input type="number" value={formState.averageSyncLatencySeconds} onChange={(value) => setFormState((previous) => ({ ...previous, averageSyncLatencySeconds: value }))} />
        </FormField>
        <FormField label="Needs Reconnection">
          <label className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700">
            <input type="checkbox" checked={formState.needsReconnection} onChange={(event) => setFormState((previous) => ({ ...previous, needsReconnection: event.target.checked }))} />
            Mark feed as requiring reconnection
          </label>
        </FormField>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h4 className="text-sm font-semibold text-gray-900">System Sync Timeline</h4>
        <p className="mt-1 text-sm text-gray-600">These operational timestamps stay visible for accountants but are read-only in the slide-over.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <FormField label="Last Sync At">
            <Input type="datetime-local" value={formState.lastSyncAt} onChange={() => undefined} disabled />
          </FormField>
          <FormField label="Last Successful Sync">
            <Input type="datetime-local" value={formState.lastSuccessfulSyncAt} onChange={() => undefined} disabled />
          </FormField>
          <FormField label="Last Attempted Sync">
            <Input type="datetime-local" value={formState.lastAttemptedSyncAt} onChange={() => undefined} disabled />
          </FormField>
          <FormField label="Next Scheduled Sync">
            <Input type="datetime-local" value={formState.nextScheduledSyncAt} onChange={() => undefined} disabled />
          </FormField>
        </div>
      </div>

      <FormField label="Disconnect Reason">
        <TextArea value={formState.disconnectReason} onChange={(value) => setFormState((previous) => ({ ...previous, disconnectReason: value }))} rows={3} />
      </FormField>

      <FormField label="Last Error Summary">
        <TextArea value={formState.lastErrorSummary} onChange={(value) => setFormState((previous) => ({ ...previous, lastErrorSummary: value }))} rows={3} />
      </FormField>

      <FormField label="Notes">
        <TextArea value={formState.notes} onChange={(value) => setFormState((previous) => ({ ...previous, notes: value }))} rows={4} />
      </FormField>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h4 className="text-sm font-semibold text-gray-900">Operational Preview</h4>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Connection</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">{formState.connectionStatus || '-'}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Health</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">{formState.healthStatus || '-'}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Feed Rules</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">{formState.feedRuleCount || '0'}</p>
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
          <h2 className="text-lg font-semibold text-gray-900">{data?.meta.label || 'Bank Feeds'}</h2>
          <p className="text-sm text-gray-600">{data?.meta.description || 'Monitor connected accounts, feed health, sync history, and feed rules.'}</p>
          <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" />
            Refresh Feed Status
          </button>
          <button type="button" onClick={() => void handleSyncNow(data?.flags.syncableFeedIds || [])} disabled={isSyncSubmitting || !(data?.flags.syncableFeedIds.length)} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${getActionClasses('secondary')}`}>
            <RefreshCw className={`h-4 w-4 ${isSyncSubmitting ? 'animate-spin' : ''}`} />
            Sync Now
          </button>
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
            <Plus className="h-4 w-4" />
            Connect Bank Feed
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
                  placeholder={data?.meta.searchPlaceholder || 'Search by bank account, connector, or rule set'}
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
                  <p className="mt-1 text-sm text-gray-600">Select as many filter values as needed. Bank feed filters widen results using OR behavior across all checked options.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => { setDraftFilters({ statuses: [], connectors: [], healthStates: [] }); setFilters({ statuses: [], connectors: [], healthStates: [] }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">
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
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Connection Status</h5>
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
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Connector</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.connectors || []).map((option) => {
                      const isSelected = draftFilters.connectors.includes(option.value);
                      return (
                        <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, connectors: toggleFilterValue(previous.connectors, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Health Status</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.healthStates || []).map((option) => {
                      const isSelected = draftFilters.healthStates.includes(option.value);
                      return (
                        <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, healthStates: toggleFilterValue(previous.healthStates, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>
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
              <h3 className="text-base font-semibold text-gray-900">{data?.meta.tableTitle || 'Connected Feed Accounts'}</h3>
              <p className="text-sm text-gray-600">{data?.meta.tableDescription || 'Operational status of each connected bank feed and the rules attached to it.'}</p>
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
                                <button type="button" onClick={() => void handleSyncNow([row.id])} disabled={!syncableIds.has(row.id) || isSyncSubmitting} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40" title={syncableIds.has(row.id) ? 'Sync now' : 'Disconnected or reconnection-required feeds cannot sync'}>
                                  <RefreshCw className={`h-4 w-4 ${isSyncSubmitting ? 'animate-spin' : ''}`} />
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
                          <td colSpan={liveColumns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">
                            No bank feeds match the current search and filter combination.
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

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Bank Feed Detail" description="Review connector status, sync timing, imported rows, and rule coverage for the selected bank feed.">
        {isViewLoading ? (
          <LoadingSkeleton columnCount={2} />
        ) : viewDetail ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['Feed Reference', viewDetail.feedReference || '-'],
                ['Bank Account', viewDetail.bankAccountLabel],
                ['Bank Account Type', viewDetail.bankAccountType || '-'],
                ['Ledger Account', viewDetail.bankLedgerAccountLabel || '-'],
                ['Connector', viewDetail.connectorName || '-'],
                ['Connector Type', viewDetail.connectorTypeLabel || '-'],
                ['Connection Status', viewDetail.connectionStatusLabel || '-'],
                ['Health Status', viewDetail.healthStatusLabel || '-'],
                ['Sync Frequency', viewDetail.syncFrequencyLabel || '-'],
                ['Provider Reference', viewDetail.providerReference || '-'],
                ['External Account ID', viewDetail.externalAccountId || '-'],
                ['Token Expires At', viewDetail.tokenExpiresAtLabel || '-'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                  <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                ['Last Sync', viewDetail.lastSyncAtLabel],
                ['Last Successful Sync', viewDetail.lastSuccessfulSyncAtLabel],
                ['Next Scheduled Sync', viewDetail.nextScheduledSyncAtLabel],
                ['Imported Rows', String(viewDetail.lastImportedRowCount)],
                ['Imported Transactions', String(viewDetail.lastImportedTransactionCount)],
                ['Feed Rule Count', String(viewDetail.feedRuleCount)],
                ['Auto-post Rules', String(viewDetail.autoPostRuleCount)],
                ['Manual Review Rules', String(viewDetail.manualReviewRuleCount)],
                ['Sync Delay Minutes', String(viewDetail.syncDelayMinutes)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900">Feed Rule Set</h4>
              <p className="mt-2 text-sm text-gray-700">{viewDetail.feedRuleSetName || '-'}</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900">Disconnect Reason</h4>
              <p className="mt-2 text-sm text-gray-700">{viewDetail.disconnectReason || '-'}</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900">Last Error Summary</h4>
              <p className="mt-2 text-sm text-gray-700">{viewDetail.lastErrorSummary || '-'}</p>
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

      <SlideOver isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Connect Bank Feed" description="Create a live bank feed connection record for a specific bank account.">
        {renderForm(createForm, setCreateForm, 'Create Bank Feed', isCreateSubmitting, createError, () => setIsCreateOpen(false), handleCreateSubmit)}
      </SlideOver>

      <SlideOver isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Bank Feed" description="Update connector setup, health status, and accountant-facing feed controls for the selected bank feed.">
        {isEditLoading ? (
          <LoadingSkeleton columnCount={2} />
        ) : (
          renderForm(editForm, setEditForm, 'Save Changes', isEditSubmitting, editError, () => setIsEditOpen(false), handleEditSubmit)
        )}
      </SlideOver>

      <SlideOver isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Bank Feed" description="Delete this connection record only after the feed has been disconnected.">
        <div className="space-y-6">
          {deleteError ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {deleteError}
            </div>
          ) : null}

          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Delete {deleteTarget?.bankAccountLabel || 'this bank feed'}?</p>
            <p className="mt-1">This action cannot be undone.</p>
          </div>

          {isDeleteLoading ? (
            <LoadingSkeleton columnCount={2} />
          ) : deleteDetail ? (
            <div className="space-y-4">
              {!deleteDetail.usageSummary.canDelete ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <p className="font-medium">Delete is blocked.</p>
                  <p className="mt-1">{deleteDetail.usageSummary.deleteBlockedReason || 'Disconnect the bank feed before deleting it.'}</p>
                </div>
              ) : null}
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-sm text-gray-500">Bank Account</span>
                  <span className="text-sm font-medium text-gray-900">{deleteDetail.bankAccountLabel}</span>
                </div>
                <div className="mt-3 flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-sm text-gray-500">Connection Status</span>
                  <span className="text-sm font-medium text-gray-900">{deleteDetail.connectionStatusLabel}</span>
                </div>
                <div className="mt-3 flex justify-between">
                  <span className="text-sm text-gray-500">Last Sync</span>
                  <span className="text-sm font-medium text-gray-900">{deleteDetail.lastSyncAtLabel}</span>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setIsDeleteOpen(false)} disabled={isDeleteSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleteSubmitting || (deleteDetail ? !deleteDetail.usageSummary.canDelete : true)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {isDeleteSubmitting ? 'Deleting...' : 'Delete Bank Feed'}
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
