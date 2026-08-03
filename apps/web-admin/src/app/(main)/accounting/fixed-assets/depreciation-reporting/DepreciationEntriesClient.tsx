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
  createDepreciationEntry,
  deleteDepreciationEntry,
  getDepreciationEntries,
  getDepreciationEntry,
  postDepreciationEntry,
  updateDepreciationEntry,
  type EntryCell,
  type EntryDetail,
  type EntryMetric,
  type EntryMutationInput,
  type EntriesResponse,
} from './actions-depreciation-entries';

const STATUS_OPTIONS = [
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Posted', value: 'posted' },
  { label: 'Reversed', value: 'reversed' },
];

const META = {
  searchPlaceholder: 'Search asset, period, depreciation date, amount, posted journal, or status',
  columns: ['Asset', 'Period', 'Depreciation Date', 'Amount', 'Posted Journal', 'Status'],
  tableTitle: 'Depreciation Entry Register',
  tableDescription: 'Entry rows aligned to the depreciation-entry collection and the depreciation-post route that creates the supporting journal entry.',
};

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 dark:border-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800';
  if (variant === 'ghost') return 'border border-transparent bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-300';
  return 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800';
}

function getMetricTone(trend: EntryMetric['trend']) {
  if (trend === 'down') return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30';
  if (trend === 'neutral') return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
  return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30';
}

function escapeCsvValue(value: string | number | boolean | null | undefined) {
  const normalized = String(value ?? '');
  return /[",\n]/.test(normalized) ? `"${normalized.replace(/"/g, '""')}"` : normalized;
}

function toggleFilterValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function fmt(n: number) { return `PHP ${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }

function toDateInput(value: string | null | undefined) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

function SlideOver({ isOpen, onClose, title, description, children }: { isOpen: boolean; onClose: () => void; title: string; description?: string; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    if (isOpen) { setMounted(true); requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true))); }
    else { setAnimate(false); const timer = setTimeout(() => setMounted(false), 300); return () => clearTimeout(timer); }
  }, [isOpen]);
  if (!mounted) return null;
  return createPortal(
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ease-in-out ${animate ? 'bg-black/50' : 'bg-transparent'}`} onClick={onClose}>
      <div className={`flex w-full max-w-3xl flex-col bg-white dark:bg-[var(--card-background)] shadow-xl transition-all duration-300 ease-in-out ${animate ? 'translate-x-0' : 'translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            {description ? <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

function MetricCard({ label, value, change, trend = 'neutral' }: { label: string; value: string | number; change: string; trend?: 'up' | 'down' | 'neutral' }) {
  const TrendIcon = trend === 'down' ? ArrowDownRight : ArrowUpRight;
  return (
    <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
        <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-3 text-gray-600 dark:text-gray-400">
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
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[var(--card-border)]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                {Array.from({ length: columnCount + 1 }).map((_, i) => (
                  <th key={i} className="px-4 py-3">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-[var(--card-background)]">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={columnCount + 1} className="px-4 py-3">
                    <div className="h-6 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
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

function renderCell(cell: EntryCell, index: number) {
  if (typeof cell === 'string') {
    return <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{cell}</td>;
  }
  const alignClass = cell.align === 'right' ? 'text-right' : cell.align === 'center' ? 'text-center' : 'text-left';
  if (cell.tone) {
    const toneMap: Record<string, string> = {
      amber: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:ring-amber-800',
      green: 'bg-green-50 text-green-700 ring-green-200 dark:bg-green-950/30 dark:text-green-400 dark:ring-green-800',
      gray: 'bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700',
      blue: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-800',
      red: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/30 dark:text-red-400 dark:ring-red-800',
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
    <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${cell.emphasis ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'} ${alignClass}`}>
      {cell.text}
    </td>
  );
}

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', required, disabled }: { value: string; onChange?: (value: string) => void; placeholder?: string; type?: string; required?: boolean; disabled?: boolean }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: Array<{ label: string; value: string }> }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50"
    >
      {options.length > 0 && options[0].value !== '' ? <option value="" className="text-gray-900 dark:text-gray-100">Select...</option> : null}
      {options.map((option) => (
        <option key={option.value} value={option.value} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]">{option.label}</option>
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
      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50"
    />
  );
}

type FormState = {
  fixedAsset: string;
  fiscalYear: string;
  period: string;
  depreciationDate: string;
  amount: string;
  status: string;
  notes: string;
};

function createEmptyForm(): FormState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    fixedAsset: '',
    fiscalYear: '',
    period: '',
    depreciationDate: today,
    amount: '0',
    status: 'scheduled',
    notes: '',
  };
}

function buildFormFromDetail(d: EntryDetail): FormState {
  const extractId = (val: unknown): string => {
    if (!val) return '';
    if (typeof val === 'object') return String((val as Record<string, unknown>).id ?? '');
    return String(val);
  };
  return {
    fixedAsset: extractId((d as Record<string, unknown>).fixedAsset),
    fiscalYear: extractId((d as Record<string, unknown>).fiscalYear),
    period: extractId((d as Record<string, unknown>).period),
    depreciationDate: toDateInput(String((d as Record<string, unknown>).depreciationDate || '')),
    amount: String(Number((d as Record<string, unknown>).amount || 0)),
    status: String((d as Record<string, unknown>).status || 'scheduled'),
    notes: String((d as Record<string, unknown>).notes || ''),
  };
}

function toMutationInput(f: FormState): EntryMutationInput {
  return {
    fixedAsset: f.fixedAsset,
    fiscalYear: f.fiscalYear || null,
    period: f.period || null,
    depreciationDate: f.depreciationDate,
    amount: Number(f.amount || 0),
    status: f.status,
    notes: f.notes.trim() || null,
  };
}

function renderForm(
  formState: FormState,
  setFormState: React.Dispatch<React.SetStateAction<FormState>>,
  submitLabel: string,
  isSubmitting: boolean,
  onCancel: () => void,
  errorMessage: string | null,
  onSubmit?: (event: React.FormEvent) => void,
  refData?: EntriesResponse['referenceData'],
) {
  const faOpts = [{ label: 'Select a fixed asset', value: '' }].concat(
    (refData?.fixedAssets || []).map((a) => ({ label: `${a.assetCode} - ${a.name}`, value: a.id })),
  );
  const fyOpts = [{ label: 'Select a fiscal year', value: '' }].concat(
    (refData?.fiscalYears || []).map((fy) => ({ label: fy.name, value: fy.id })),
  );
  const periodOpts = [{ label: 'No period', value: '' }].concat(
    (refData?.periods || []).map((p) => ({ label: p.name, value: p.id })),
  );

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {errorMessage ? (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Fixed Asset" required>
          <Select value={formState.fixedAsset} onChange={(value) => setFormState((prev) => ({ ...prev, fixedAsset: value }))} options={faOpts} />
        </FormField>
        <FormField label="Status">
          <Select value={formState.status} onChange={(value) => setFormState((prev) => ({ ...prev, status: value }))} options={STATUS_OPTIONS} />
        </FormField>
        <FormField label="Fiscal Year" required>
          <Select value={formState.fiscalYear} onChange={(value) => setFormState((prev) => ({ ...prev, fiscalYear: value }))} options={fyOpts} />
        </FormField>
        <FormField label="Depreciation Date" required>
          <Input type="date" value={formState.depreciationDate} onChange={(value) => setFormState((prev) => ({ ...prev, depreciationDate: value }))} required />
        </FormField>
        <FormField label="Period">
          <Select value={formState.period} onChange={(value) => setFormState((prev) => ({ ...prev, period: value }))} options={periodOpts} />
        </FormField>
        <FormField label="Amount (PHP)" required>
          <Input type="number" value={formState.amount} onChange={(value) => setFormState((prev) => ({ ...prev, amount: value }))} required />
        </FormField>
      </div>

      <FormField label="Notes">
        <TextArea value={formState.notes} onChange={(value) => setFormState((prev) => ({ ...prev, notes: value }))} />
      </FormField>

      <div className="flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-800 pt-4">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>
          {isSubmitting ? `${submitLabel}...` : submitLabel}
        </button>
      </div>
    </form>
  );
}

type FilterState = { statuses: string[] };

export default function DepreciationEntriesClient() {
  const [data, setData] = useState<EntriesResponse | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({ statuses: [] });
  const [draftFilters, setDraftFilters] = useState<FilterState>({ statuses: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const [viewDetail, setViewDetail] = useState<EntryDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);

  const [createForm, setCreateForm] = useState<FormState>(createEmptyForm());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(createEmptyForm());
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLabel, setDeleteLabel] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [postId, setPostId] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const filterCount = filters.statuses.length;

  const fetchData = useCallback(async (search: string, page: number, nextFilters: FilterState, nextQuickFilters: string[]) => {
    setIsLoading(true);
    setErrorState(null);
    try {
      const response = await getDepreciationEntries({
        search,
        page,
        statuses: nextFilters.statuses,
        quickFilters: nextQuickFilters,
      });
      setData(response);
    } catch (fetchError) {
      setErrorState(fetchError instanceof Error ? fetchError.message : 'Unable to load depreciation entries.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData(submittedSearch, currentPage, filters, quickFilters);
  }, [currentPage, fetchData, filters, quickFilters, submittedSearch]);

  const handleRefresh = () => { void fetchData(submittedSearch, currentPage, filters, quickFilters); };
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput);
    setCurrentPage(1);
    void fetchData(searchInput, 1, filters, quickFilters);
  };
  const handleToggleQuickFilter = (value: string) => {
    setQuickFilters((previous) => toggleFilterValue(previous, value));
    setCurrentPage(1);
  };

  const handleExport = () => {
    const rows = data?.rows || [];
    if (!rows.length) return;
    const headers = META.columns;
    const csvRows = rows.map((row) => [row.assetLabel, row.periodLabel, row.depreciationDate || '', row.amountLabel, row.journalRef || '-', row.statusLabel]);
    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'depreciation-entries.csv';
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
      setViewDetail(await getDepreciationEntry(id));
    } catch {
      // handled silently
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
      await createDepreciationEntry(toMutationInput(createForm));
      setIsCreateOpen(false);
      handleRefresh();
    } catch (submissionError) {
      setCreateError(submissionError instanceof Error ? submissionError.message : 'Unable to create depreciation entry.');
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
      const detail = await getDepreciationEntry(id);
      setEditForm(buildFormFromDetail(detail));
    } catch (detailError) {
      setEditError(detailError instanceof Error ? detailError.message : 'Unable to load depreciation entry.');
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
      await updateDepreciationEntry(editId, toMutationInput(editForm));
      setIsEditOpen(false);
      setEditId(null);
      handleRefresh();
    } catch (submissionError) {
      setEditError(submissionError instanceof Error ? submissionError.message : 'Unable to update depreciation entry.');
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
      await deleteDepreciationEntry(deleteId);
      setIsDeleteOpen(false);
      setDeleteId(null);
      setDeleteLabel('');
      handleRefresh();
    } catch (deletionError) {
      setDeleteError(deletionError instanceof Error ? deletionError.message : 'Unable to delete depreciation entry.');
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  const handlePost = async (id: string) => {
    setPostId(id);
    setIsPosting(true);
    try {
      await postDepreciationEntry(id);
      handleRefresh();
    } catch (postError) {
      setErrorState(postError instanceof Error ? postError.message : 'Unable to post depreciation entry.');
    } finally {
      setPostId(null);
      setIsPosting(false);
    }
  };

  const currentRows = data?.rows || [];
  const rData = data?.referenceData;
  const cols = META.columns;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Depreciation Entries</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{META.tableDescription}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
            <Plus className="h-4 w-4" />
            New Entry
          </button>
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button type="button" onClick={handleExport} disabled={!currentRows.length} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50">
            <Download className="h-4 w-4" />
            Export
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

      <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-800 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <form onSubmit={handleSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder={META.searchPlaceholder}
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50"
                />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 dark:border-blue-700 bg-blue-600 dark:bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800">
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
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isFilterPanelOpen || filterCount > 0 ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {filterCount > 0 ? <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-700 px-1.5 py-0.5 text-[11px] font-semibold text-white">{filterCount}</span> : null}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(data?.filterOptions.quickFilters || []).map((filter) => (
              <button key={filter.value} type="button" onClick={() => handleToggleQuickFilter(filter.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${quickFilters.includes(filter.value) ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-200 dark:ring-blue-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 p-[10px] sm:p-5">
          {isFilterPanelOpen ? (
            <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Filters</h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Select as many values as needed. All checked filters widen the result set using OR logic.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => { setDraftFilters({ statuses: [] }); setFilters({ statuses: [] }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                    Clear all
                  </button>
                  <button type="button" onClick={() => setIsFilterPanelOpen(false)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                    Cancel
                  </button>
                  <button type="button" onClick={() => { setFilters({ ...draftFilters }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 dark:border-blue-700 bg-blue-600 dark:bg-blue-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-800">
                    Apply Filters
                  </button>
                </div>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.statuses || []).map((option) => {
                      const selected = draftFilters.statuses.includes(option.value);
                      return (
                        <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
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
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{META.tableTitle}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{META.tableDescription}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span>{data?.totals.filteredRows ?? 0} matching rows</span>
            </div>
          </div>

          {errorState ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorState}
            </div>
          ) : null}

          {isLoading ? (
            <LoadingSkeleton columnCount={cols.length} />
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[var(--card-border)]">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        {cols.map((column: string) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${column === 'Amount' ? 'text-right' : 'text-left'}`}>
                            {column}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-[var(--card-background)]">
                      {currentRows.length > 0 ? (
                        currentRows.map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            {row.cells.map((cell, index) => renderCell(cell, index))}
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300" title="View detail">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => handleOpenEdit(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300" title="Edit">
                                  <Edit className="h-4 w-4" />
                                </button>
                                {row.status === 'scheduled' ? (
                                  <button type="button" onClick={() => handlePost(row.id)} disabled={isPosting && postId === row.id} className="inline-flex items-center gap-1 rounded-lg p-2 text-blue-500 dark:text-blue-400 transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50" title="Post entry">
                                    <SendHorizonal className="h-4 w-4" />
                                  </button>
                                ) : null}
                                <button type="button" onClick={() => handleOpenDelete(row.id, row.assetLabel)} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300" title="Delete">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={cols.length + 1} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                            No depreciation entries found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {data?.pagination && data.pagination.totalPages > 1 ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Page {data.pagination.page} of {data.pagination.totalPages}</p>
                  <div className="flex gap-2">
                    <button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">
                      Previous
                    </button>
                    <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((prev) => prev + 1)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Depreciation Entry Detail" description="Full depreciation entry including asset, period, amount, posted journal, and status.">
        <div className="space-y-6">
          {isViewLoading ? (
            <LoadingSkeleton />
          ) : viewDetail ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['Fixed Asset', (() => {
                    const fa = (viewDetail as Record<string, unknown>).fixedAsset as Record<string, unknown> | undefined;
                    return fa ? [fa.assetCode, fa.name].filter(Boolean).join(' - ') : '-';
                  })()],
                  ['Fiscal Year', (() => {
                    const fy = (viewDetail as Record<string, unknown>).fiscalYear as Record<string, unknown> | undefined;
                    return fy?.name ? String(fy.name) : '-';
                  })()],
                  ['Period', (() => {
                    const per = (viewDetail as Record<string, unknown>).period as Record<string, unknown> | undefined;
                    return per?.label ? String(per.label) : per?.name ? String(per.name) : '-';
                  })()],
                  ['Depreciation Date', (viewDetail as Record<string, unknown>).depreciationDate ? String((viewDetail as Record<string, unknown>).depreciationDate).slice(0, 10) : '-'],
                  ['Amount', fmt(Number((viewDetail as Record<string, unknown>).amount || 0))],
                  ['Status', String((viewDetail as Record<string, unknown>).status || '-')],
                  ['Posted Journal', (() => {
                    const je = (viewDetail as Record<string, unknown>).postedJournalEntry as Record<string, unknown> | undefined;
                    return je?.entryNumber ? String(je.entryNumber) : '-';
                  })()],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notes</h4>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{String((viewDetail as Record<string, unknown>).notes || '-')}</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No details available.</p>
          )}
        </div>
      </SlideOver>

      <SlideOver isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="New Depreciation Entry" description="Create a depreciation entry. All required fields must be completed.">
        {renderForm(createForm, setCreateForm, 'Create Entry', isCreateSubmitting, () => setIsCreateOpen(false), createError, handleCreateSubmit, rData)}
      </SlideOver>

      <SlideOver isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Depreciation Entry" description="Update the depreciation entry fields.">
        {isEditLoading ? <LoadingSkeleton /> : renderForm(editForm, setEditForm, 'Save Changes', isEditSubmitting, () => setIsEditOpen(false), editError, handleEditSubmit, rData)}
      </SlideOver>

      <SlideOver isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Depreciation Entry" description="Remove this depreciation entry.">
        <div className="space-y-6">
          {deleteError ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {deleteError}
            </div>
          ) : null}
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-700 dark:text-red-400">
            <p className="font-medium">Delete entry for {deleteLabel}?</p>
            <p className="mt-1">This action cannot be undone.</p>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-800 pt-4">
            <button type="button" onClick={() => setIsDeleteOpen(false)} disabled={isDeleteSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleteSubmitting} className="rounded-lg bg-red-600 dark:bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:hover:bg-red-800 disabled:opacity-50">
              {isDeleteSubmitting ? 'Deleting...' : 'Delete Entry'}
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
