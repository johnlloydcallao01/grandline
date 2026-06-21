'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Edit,
  ExternalLink,
  Eye,
  Filter,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  Wallet,
  X,
} from 'lucide-react';
import { MediaUploader } from '@/components/cms/MediaUploader';
import {
  createStatementImport,
  deleteStatementImport,
  getStatementImportDetail,
  getStatementImports,
  retryStatementImports,
  updateStatementImport,
  type BankTransactionCell,
  type StatementImportDetail,
  type StatementImportMetric,
  type StatementImportMutationInput,
  type StatementImportRegisterResponse,
  type StatementImportRow,
} from './actions';

type StatementImportFilterState = {
  statuses: string[];
  bankAccounts: string[];
  coverageStates: string[];
};

type StatementImportFormState = {
  importBatchNumber: string;
  bankAccount: string;
  statementFile: string;
  statementDateFrom: string;
  statementDateTo: string;
  sourceFormat: string;
  importStatus: string;
  totalLines: string;
  importedLines: string;
  failedLines: string;
  duplicateLines: string;
  importedTransactionCount: string;
  parseErrorSummary: string;
  notes: string;
  preservedMetadata: Record<string, unknown> | null;
};

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  if (variant === 'ghost') return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
}

function getMetricTone(trend: StatementImportMetric['trend']) {
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

function formatFileSize(value: number | null | undefined) {
  const size = Number(value || 0);
  if (!Number.isFinite(size) || size <= 0) return '0 Bytes';
  if (size < 1024) return `${size} Bytes`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function createEmptyForm(): StatementImportFormState {
  return {
    importBatchNumber: '',
    bankAccount: '',
    statementFile: '',
    statementDateFrom: '',
    statementDateTo: '',
    sourceFormat: 'csv',
    importStatus: 'queued',
    totalLines: '0',
    importedLines: '0',
    failedLines: '0',
    duplicateLines: '0',
    importedTransactionCount: '0',
    parseErrorSummary: '',
    notes: '',
    preservedMetadata: null,
  };
}

function buildFormFromDetail(detail: StatementImportDetail): StatementImportFormState {
  return {
    importBatchNumber: detail.importBatchNumber || '',
    bankAccount: detail.bankAccountId || '',
    statementFile: detail.statementFile?.id || detail.statementFileId || '',
    statementDateFrom: detail.statementDateFrom ? detail.statementDateFrom.slice(0, 10) : '',
    statementDateTo: detail.statementDateTo ? detail.statementDateTo.slice(0, 10) : '',
    sourceFormat: detail.sourceFormat || 'csv',
    importStatus: detail.importStatus || 'queued',
    totalLines: String(detail.totalLines || 0),
    importedLines: String(detail.importedLines || 0),
    failedLines: String(detail.failedLines || 0),
    duplicateLines: String(detail.duplicateLines || 0),
    importedTransactionCount: String(detail.importedTransactionCount || 0),
    parseErrorSummary: detail.parseErrorSummary || '',
    notes: detail.notes || '',
    preservedMetadata: detail.metadata || null,
  };
}

function toMutationInput(formState: StatementImportFormState): StatementImportMutationInput {
  return {
    importBatchNumber: formState.importBatchNumber.trim() || null,
    bankAccount: formState.bankAccount,
    statementFile: formState.statementFile,
    statementDateFrom: formState.statementDateFrom || null,
    statementDateTo: formState.statementDateTo || null,
    sourceFormat: formState.sourceFormat,
    importStatus: formState.importStatus,
    totalLines: Number(formState.totalLines || 0),
    importedLines: Number(formState.importedLines || 0),
    failedLines: Number(formState.failedLines || 0),
    duplicateLines: Number(formState.duplicateLines || 0),
    importedTransactionCount: Number(formState.importedTransactionCount || 0),
    parseErrorSummary: formState.parseErrorSummary.trim() || null,
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

function downloadTemplate() {
  const headers = ['transaction_date', 'description', 'reference_number', 'amount_in', 'amount_out', 'value_date', 'running_balance'];
  const sample = ['2026-06-01', 'Statement line sample', 'REF-001', '1500.00', '0.00', '2026-06-01', '25000.00'];
  const csv = [headers, sample].map((row) => row.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'bank-statement-import-template.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function StatementImportsPanel() {
  const [data, setData] = useState<StatementImportRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<StatementImportFilterState>({ statuses: [], bankAccounts: [], coverageStates: [] });
  const [draftFilters, setDraftFilters] = useState<StatementImportFilterState>({ statuses: [], bankAccounts: [], coverageStates: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isRetrySubmitting, setIsRetrySubmitting] = useState(false);

  const [viewDetail, setViewDetail] = useState<StatementImportDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);

  const [createForm, setCreateForm] = useState<StatementImportFormState>(createEmptyForm());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<StatementImportFormState>(createEmptyForm());
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<StatementImportRow | null>(null);
  const [deleteDetail, setDeleteDetail] = useState<StatementImportDetail | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filterCount = filters.statuses.length + filters.bankAccounts.length + filters.coverageStates.length;

  const fetchData = useCallback(
    async ({
      search,
      page,
      nextFilters,
      nextQuickFilters,
    }: {
      search: string;
      page: number;
      nextFilters: StatementImportFilterState;
      nextQuickFilters: string[];
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getStatementImports({
          search,
          page,
          statuses: nextFilters.statuses,
          bankAccounts: nextFilters.bankAccounts,
          coverageStates: nextFilters.coverageStates,
          quickFilters: nextQuickFilters,
        });
        setData(response);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load statement imports.');
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
    const headers = ['Uploaded', 'Batch', 'Filename', 'Bank Account', 'Status', 'Source Format', 'Total Lines', 'Imported Lines', 'Failed Lines', 'Uploaded By'];
    const csvRows = data.rows.map((row) => [
      row.uploadedAtLabel,
      row.importBatchNumber,
      row.statementFilename,
      row.bankAccountLabel,
      row.importStatusLabel,
      row.sourceFormatLabel,
      row.totalLines,
      row.importedLines,
      row.failedLines,
      row.uploadedByLabel,
    ]);
    const csvContent = [headers, ...csvRows].map((row) => row.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'statement-imports.csv';
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
      const detail = await getStatementImportDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load statement import detail.');
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
      await createStatementImport(toMutationInput(createForm));
      setIsCreateOpen(false);
      setCurrentPage(1);
      await fetchData({
        search: submittedSearch,
        page: 1,
        nextFilters: filters,
        nextQuickFilters: quickFilters,
      });
    } catch (submissionError) {
      setCreateError(submissionError instanceof Error ? submissionError.message : 'Unable to create statement import.');
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
      const detail = await getStatementImportDetail(id);
      setEditForm(buildFormFromDetail(detail));
    } catch (detailError) {
      setEditError(detailError instanceof Error ? detailError.message : 'Unable to load statement import detail.');
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
      await updateStatementImport(editingId, toMutationInput(editForm));
      setIsEditOpen(false);
      setEditingId(null);
      handleRefresh();
    } catch (submissionError) {
      setEditError(submissionError instanceof Error ? submissionError.message : 'Unable to update statement import.');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleOpenDelete = async (row: StatementImportRow) => {
    setDeleteTarget(row);
    setDeleteDetail(null);
    setDeleteError(null);
    setIsDeleteOpen(true);
    setIsDeleteLoading(true);
    try {
      const detail = await getStatementImportDetail(row.id);
      setDeleteDetail(detail);
    } catch (detailError) {
      setDeleteError(detailError instanceof Error ? detailError.message : 'Unable to load statement import detail.');
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleteSubmitting(true);
    setDeleteError(null);
    try {
      await deleteStatementImport(deleteTarget.id);
      setIsDeleteOpen(false);
      setDeleteTarget(null);
      setDeleteDetail(null);
      handleRefresh();
    } catch (deletionError) {
      setDeleteError(deletionError instanceof Error ? deletionError.message : 'Unable to delete statement import.');
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  const handleRetryFailed = async () => {
    const retryIds = data?.flags.retryableImportIds || [];
    if (!retryIds.length) return;
    setIsRetrySubmitting(true);
    setError(null);
    try {
      await retryStatementImports(retryIds);
      handleRefresh();
    } catch (retryError) {
      setError(retryError instanceof Error ? retryError.message : 'Unable to retry failed imports.');
    } finally {
      setIsRetrySubmitting(false);
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

  const sourceFormatOptions = (data?.referenceData.sourceFormats || []).map((option) => ({
    label: option.label,
    value: option.value,
  }));

  const importStatusOptions = (data?.referenceData.importStatuses || []).map((option) => ({
    label: option.label,
    value: option.value,
  }));

  const renderForm = (
    formState: StatementImportFormState,
    setFormState: React.Dispatch<React.SetStateAction<StatementImportFormState>>,
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
        <FormField label="Import Batch Number">
          <Input
            value={formState.importBatchNumber}
            onChange={(value) => setFormState((previous) => ({ ...previous, importBatchNumber: value }))}
            placeholder="Auto-generated on save"
            disabled
          />
        </FormField>
        <FormField label="Import Status" required>
          <Select
            value={formState.importStatus}
            onChange={(value) => setFormState((previous) => ({ ...previous, importStatus: value }))}
            options={importStatusOptions}
            required
          />
        </FormField>
        <FormField label="Bank Account" required>
          <Select
            value={formState.bankAccount}
            onChange={(value) => setFormState((previous) => ({ ...previous, bankAccount: value }))}
            options={bankAccountOptions}
            required
          />
        </FormField>
        <FormField label="Source Format" required>
          <Select
            value={formState.sourceFormat}
            onChange={(value) => setFormState((previous) => ({ ...previous, sourceFormat: value }))}
            options={sourceFormatOptions}
            required
          />
        </FormField>
        <FormField label="Statement Period Start">
          <Input type="date" value={formState.statementDateFrom} onChange={(value) => setFormState((previous) => ({ ...previous, statementDateFrom: value }))} />
        </FormField>
        <FormField label="Statement Period End">
          <Input type="date" value={formState.statementDateTo} onChange={(value) => setFormState((previous) => ({ ...previous, statementDateTo: value }))} />
        </FormField>
        <FormField label="Total Lines" required>
          <Input type="number" value={formState.totalLines} onChange={(value) => setFormState((previous) => ({ ...previous, totalLines: value }))} required />
        </FormField>
        <FormField label="Imported Lines" required>
          <Input type="number" value={formState.importedLines} onChange={(value) => setFormState((previous) => ({ ...previous, importedLines: value }))} required />
        </FormField>
        <FormField label="Failed Lines" required>
          <Input type="number" value={formState.failedLines} onChange={(value) => setFormState((previous) => ({ ...previous, failedLines: value }))} required />
        </FormField>
        <FormField label="Duplicate Lines" required>
          <Input type="number" value={formState.duplicateLines} onChange={(value) => setFormState((previous) => ({ ...previous, duplicateLines: value }))} required />
        </FormField>
        <FormField label="Imported Transactions" required>
          <Input type="number" value={formState.importedTransactionCount} onChange={(value) => setFormState((previous) => ({ ...previous, importedTransactionCount: value }))} required />
        </FormField>
      </div>

      <FormField label="Statement File" required>
        <MediaUploader
          value={formState.statementFile}
          onChange={(value) => setFormState((previous) => ({ ...previous, statementFile: String(value || '') }))}
          accept=".csv,.xlsx,.xls,.ofx,.pdf,text/csv,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        />
      </FormField>

      <FormField label="Parse Error Summary">
        <TextArea value={formState.parseErrorSummary} onChange={(value) => setFormState((previous) => ({ ...previous, parseErrorSummary: value }))} rows={3} />
      </FormField>

      <FormField label="Notes / Follow-up">
        <TextArea value={formState.notes} onChange={(value) => setFormState((previous) => ({ ...previous, notes: value }))} rows={4} />
      </FormField>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h4 className="text-sm font-semibold text-gray-900">Import Summary</h4>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Processed Lines</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">
              {Number(formState.importedLines || 0) + Number(formState.failedLines || 0) + Number(formState.duplicateLines || 0)}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Open Issues</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">{Number(formState.failedLines || 0) + Number(formState.duplicateLines || 0)}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Imported Transactions</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">{formState.importedTransactionCount || '0'}</p>
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

  const tableColumns = data?.meta.columns || ['Uploaded', 'Filename', 'Bank Account', 'Lines', 'Uploaded By', 'Import Status'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">{data?.meta.label || 'Statement Imports'}</h2>
          <p className="text-sm text-gray-600">{data?.meta.description || 'Manage uploaded bank statement batches and follow-up actions.'}</p>
          <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" />
            Refresh Imports
          </button>
          <button type="button" onClick={downloadTemplate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <Download className="h-4 w-4" />
            Download Template
          </button>
          <button type="button" onClick={handleRetryFailed} disabled={isRetrySubmitting || !(data?.flags.retryableImportIds.length)} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${getActionClasses('ghost')}`}>
            <RefreshCw className="h-4 w-4" />
            Retry Failed Imports
          </button>
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
            <Upload className="h-4 w-4" />
            Upload Statement File
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
                  placeholder={data?.meta.searchPlaceholder || 'Search statement imports'}
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
                  <p className="mt-1 text-sm text-gray-600">Select as many filters as needed. Statement import filters widen results using OR behavior across all checked options.</p>
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
              <h3 className="text-base font-semibold text-gray-900">{data?.meta.tableTitle || 'Statement Import Batches'}</h3>
              <p className="text-sm text-gray-600">{data?.meta.tableDescription || 'Track each uploaded statement file and import follow-up result.'}</p>
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
            <LoadingSkeleton columnCount={tableColumns.length + 1} />
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {tableColumns.map((column) => {
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
                          <td colSpan={tableColumns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">
                            No statement imports match the current search and filter combination.
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

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Statement Import Detail" description="Review the uploaded statement file, import status, line counts, and finance follow-up notes.">
        {isViewLoading ? (
          <LoadingSkeleton columnCount={2} />
        ) : viewDetail ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['Import Batch', viewDetail.importBatchNumber],
                ['Bank Account', viewDetail.bankAccountLabel],
                ['Bank Account Type', viewDetail.bankAccountType || '-'],
                ['Ledger Account', viewDetail.bankLedgerAccountLabel || '-'],
                ['Status', viewDetail.importStatusLabel],
                ['Source Format', viewDetail.sourceFormatLabel],
                ['Statement Period', viewDetail.statementDateRangeLabel],
                ['Uploaded At', viewDetail.uploadedAtLabel],
                ['Uploaded By', viewDetail.uploadedByLabel],
                ['Imported At', viewDetail.importedAtLabel],
                ['Imported By', viewDetail.importedByLabel],
                ['Currency', viewDetail.currency || 'PHP'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                  <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              {[
                ['Total Lines', viewDetail.totalLines],
                ['Imported Lines', viewDetail.importedLines],
                ['Failed Lines', viewDetail.failedLines],
                ['Duplicate Lines', viewDetail.duplicateLines],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Statement File</h4>
                  <p className="mt-1 text-sm text-gray-600">Uploaded media attached to this statement import batch.</p>
                </div>
                {viewDetail.statementFile?.url ? (
                  <a href={viewDetail.statementFile.url} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open File
                  </a>
                ) : null}
              </div>
              {viewDetail.statementFile ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">File Name</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{viewDetail.statementFile.filename || '-'}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Mime Type</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{viewDetail.statementFile.mimeType || '-'}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">File Size</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{formatFileSize(viewDetail.statementFile.filesize)}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Alt Text</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{viewDetail.statementFile.alt || '-'}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">No statement file detail is available.</p>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900">Parse Error Summary</h4>
              <p className="mt-2 text-sm text-gray-700">{viewDetail.parseErrorSummary || '-'}</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900">Notes / Follow-up</h4>
              <p className="mt-2 text-sm text-gray-700">{viewDetail.notes || '-'}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No detail available.</p>
        )}
      </SlideOver>

      <SlideOver isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Upload Statement Import" description="Create a bank statement import batch using a real uploaded file from the media library.">
        {renderForm(createForm, setCreateForm, 'Create Import Batch', isCreateSubmitting, createError, () => setIsCreateOpen(false), handleCreateSubmit)}
      </SlideOver>

      <SlideOver isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Statement Import" description="Update the selected statement import batch and its operational follow-up details.">
        {isEditLoading ? (
          <LoadingSkeleton columnCount={2} />
        ) : (
          renderForm(editForm, setEditForm, 'Save Changes', isEditSubmitting, editError, () => setIsEditOpen(false), handleEditSubmit)
        )}
      </SlideOver>

      <SlideOver isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Statement Import" description="Delete this statement import batch record permanently.">
        <div className="space-y-6">
          {deleteError ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {deleteError}
            </div>
          ) : null}

          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Delete {deleteTarget?.importBatchNumber || deleteTarget?.statementFilename || 'this statement import'}?</p>
            <p className="mt-1">This action cannot be undone.</p>
          </div>

          {isDeleteLoading ? (
            <LoadingSkeleton columnCount={2} />
          ) : deleteDetail ? (
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-500">Bank Account</span>
                <span className="text-sm font-medium text-gray-900">{deleteDetail.bankAccountLabel}</span>
              </div>
              <div className="mt-3 flex justify-between border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-500">Statement File</span>
                <span className="text-sm font-medium text-gray-900">{deleteDetail.statementFilename}</span>
              </div>
              <div className="mt-3 flex justify-between">
                <span className="text-sm text-gray-500">Import Status</span>
                <span className="text-sm font-medium text-gray-900">{deleteDetail.importStatusLabel}</span>
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setIsDeleteOpen(false)} disabled={isDeleteSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleteSubmitting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {isDeleteSubmitting ? 'Deleting...' : 'Delete Import Batch'}
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
