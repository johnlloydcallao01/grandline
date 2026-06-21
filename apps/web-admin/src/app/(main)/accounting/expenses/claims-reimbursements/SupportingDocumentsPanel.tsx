'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Edit,
  ExternalLink,
  Eye,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import { MediaUploader } from '@/components/cms/MediaUploader';
import {
  createExpenseSupportingDocument,
  deleteExpenseSupportingDocument,
  getExpenseSupportingDocumentDetail,
  getExpenseSupportingDocuments,
  updateExpenseSupportingDocument,
  type ApprovalCell,
  type ApprovalMetric,
  type ExpenseSupportingDocumentDetail,
  type ExpenseSupportingDocumentsResponse,
  type SupportingDocumentMutationInput,
} from './actions';

type TabDefinition = {
  id: string;
  label: string;
  description: string;
  searchPlaceholder: string;
  columns: string[];
  tableTitle: string;
  tableDescription: string;
};

type DocumentFilterState = {
  categories: string[];
  states: string[];
  expenseStatuses: string[];
};

type DocumentFormState = {
  entityId: string;
  media: string;
  documentCategory: string;
  documentDate: string;
  isPrimary: boolean;
  notes: string;
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

function getMetricTone(trend: ApprovalMetric['trend']) {
  if (trend === 'down') return 'text-red-600 bg-red-50';
  if (trend === 'neutral') return 'text-gray-600 bg-gray-100';
  return 'text-green-600 bg-green-50';
}

function escapeCsvValue(value: string | number | boolean | null | undefined) {
  const stringValue = String(value ?? '');
  return /[",\n]/.test(stringValue)
    ? `"${stringValue.replace(/"/g, '""')}"`
    : stringValue;
}

function toggleFilterValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
}

function formatFileSize(bytes: number) {
  if (!bytes) return '0 Bytes';
  const units = ['Bytes', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / 1024 ** exponent;
  return `${size.toFixed(exponent === 0 ? 0 : 2)} ${units[exponent]}`;
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
        className={`flex w-full max-w-2xl flex-col bg-white shadow-xl transition-all duration-300 ease-in-out ${animate ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description ? <p className="mt-0.5 text-sm text-gray-500">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
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

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
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
  rows = 4,
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

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: 7 }).map((_, index) => (
                  <th key={index} className="px-4 py-3">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan={8} className="px-4 py-3">
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
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${getMetricTone(trend)}`}
        >
          <TrendIcon className="h-3.5 w-3.5" />
          {change}
        </span>
      </div>
    </div>
  );
}

function renderCell(cell: ApprovalCell, index: number) {
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
      green: 'bg-green-50 text-green-700 ring-green-200',
      gray: 'bg-gray-100 text-gray-700 ring-gray-200',
      blue: 'bg-blue-50 text-blue-700 ring-blue-200',
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

export function SupportingDocumentsPanel({ tab }: { tab: TabDefinition }) {
  const router = useRouter();
  const [data, setData] = useState<ExpenseSupportingDocumentsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<DocumentFilterState>({
    categories: [],
    states: [],
    expenseStatuses: [],
  });
  const [draftFilters, setDraftFilters] = useState<DocumentFilterState>({
    categories: [],
    states: [],
    expenseStatuses: [],
  });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const [viewDetail, setViewDetail] = useState<ExpenseSupportingDocumentDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState<DocumentFormState>({
    entityId: '',
    media: '',
    documentCategory: 'expense_receipt',
    documentDate: '',
    isPrimary: false,
    notes: '',
  });

  const [editId, setEditId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editForm, setEditForm] = useState<DocumentFormState>({
    entityId: '',
    media: '',
    documentCategory: 'expense_receipt',
    documentDate: '',
    isPrimary: false,
    notes: '',
  });

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);

  const filterCount =
    filters.categories.length + filters.states.length + filters.expenseStatuses.length;

  const fetchRegister = useCallback(
    async ({
      search,
      page,
      nextFilters,
      nextQuickFilters,
    }: {
      search: string;
      page: number;
      nextFilters: DocumentFilterState;
      nextQuickFilters: string[];
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getExpenseSupportingDocuments({
          search,
          page,
          categories: nextFilters.categories,
          states: nextFilters.states,
          expenseStatuses: nextFilters.expenseStatuses,
          quickFilters: nextQuickFilters,
        });
        setData(response);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load supporting documents.');
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

    const headers = ['Link Ref', 'Expense', 'File', 'Category', 'Document Date', 'Uploaded By', 'State'];
    const csvRows = rows.map((row) => [
      row.linkReference,
      row.expenseLabel,
      row.mediaLabel,
      row.documentCategoryLabel,
      row.documentDateLabel,
      row.uploadedByLabel,
      row.stateLabel,
    ]);
    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'expense-supporting-documents.csv';
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
      setViewDetail(await getExpenseSupportingDocumentDetail(id));
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load document detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setCreateError(null);
    setCreateForm({
      entityId: data?.referenceData.expenses[0]?.id || '',
      media: '',
      documentCategory: data?.referenceData.categories.find((option) => option.value === 'expense_receipt')?.value || data?.referenceData.categories[0]?.value || 'expense_receipt',
      documentDate: '',
      isPrimary: false,
      notes: '',
    });
    setIsCreateOpen(true);
  };

  const toMutationInput = (form: DocumentFormState): SupportingDocumentMutationInput => ({
    entityId: form.entityId,
    media: form.media,
    documentCategory: form.documentCategory,
    documentDate: form.documentDate || null,
    isPrimary: form.isPrimary,
    notes: form.notes || null,
  });

  const handleCreateSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsCreateSubmitting(true);
    setCreateError(null);
    try {
      await createExpenseSupportingDocument(toMutationInput(createForm));
      setIsCreateOpen(false);
      handleRefresh();
    } catch (submissionError) {
      setCreateError(
        submissionError instanceof Error ? submissionError.message : 'Unable to create supporting document.',
      );
    } finally {
      setIsCreateSubmitting(false);
    }
  };

  const handleOpenEdit = async (id: string) => {
    setEditId(id);
    setIsEditOpen(true);
    setIsViewLoading(true);
    setEditError(null);
    try {
      const detail = await getExpenseSupportingDocumentDetail(id);
      setEditForm({
        entityId: detail.expenseId,
        media: detail.media?.id || '',
        documentCategory: detail.documentCategory,
        documentDate: detail.documentDate || '',
        isPrimary: detail.isPrimary,
        notes: detail.notes || '',
      });
    } catch (detailError) {
      setEditError(detailError instanceof Error ? detailError.message : 'Unable to load document detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editId) return;
    setIsEditSubmitting(true);
    setEditError(null);
    try {
      await updateExpenseSupportingDocument(editId, toMutationInput(editForm));
      setIsEditOpen(false);
      handleRefresh();
    } catch (submissionError) {
      setEditError(
        submissionError instanceof Error ? submissionError.message : 'Unable to update supporting document.',
      );
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleteSubmitting(true);
    setDeleteError(null);
    try {
      await deleteExpenseSupportingDocument(deleteTarget.id);
      setDeleteTarget(null);
      handleRefresh();
    } catch (submissionError) {
      setDeleteError(
        submissionError instanceof Error ? submissionError.message : 'Unable to delete supporting document.',
      );
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  const expenseOptions = [{ label: 'Select an expense', value: '' }].concat(
    (data?.referenceData.expenses || []).map((expense) => ({
      label: expense.label,
      value: expense.id,
    })),
  );
  const categoryOptions = [{ label: 'Select a category', value: '' }].concat(
    data?.referenceData.categories || [],
  );
  const editableDocumentIds = useMemo(
    () => new Set(data?.flags.editableDocumentIds || []),
    [data?.flags.editableDocumentIds],
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
          <button
            type="button"
            onClick={handleOpenCreate}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}
          >
            <Plus className="h-4 w-4" />
            Create Supporting Document
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Register
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={!data?.rows.length}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export Documents
          </button>
        </div>
      </div>

      {data?.metrics?.length ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {data.metrics.map((metric) => (
            <div key={metric.id}>
              <MetricCard
                label={metric.label}
                value={metric.value}
                change={metric.change}
                trend={metric.trend}
              />
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
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"
              >
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
              {filterCount > 0 ? (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                  {filterCount}
                </span>
              ) : null}
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
                  <p className="mt-1 text-sm text-gray-600">
                    Select as many filter values as needed. All checked filters widen the result set using OR logic.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDraftFilters({ categories: [], states: [], expenseStatuses: [] });
                      setFilters({ categories: [], states: [], expenseStatuses: [] });
                      setCurrentPage(1);
                      setIsFilterPanelOpen(false);
                    }}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFilterPanelOpen(false)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
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
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Category</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.categories || []).map((option) => {
                      const selected = draftFilters.categories.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setDraftFilters((previous) => ({
                              ...previous,
                              categories: toggleFilterValue(previous.categories, option.value),
                            }))
                          }
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">State</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.states || []).map((option) => {
                      const selected = draftFilters.states.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setDraftFilters((previous) => ({
                              ...previous,
                              states: toggleFilterValue(previous.states, option.value),
                            }))
                          }
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Expense Status</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.expenseStatuses || []).map((option) => {
                      const selected = draftFilters.expenseStatuses.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setDraftFilters((previous) => ({
                              ...previous,
                              expenseStatuses: toggleFilterValue(previous.expenseStatuses, option.value),
                            }))
                          }
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}
                        >
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

          {error ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
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
                          return (
                            <th
                              key={label}
                              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                            >
                              {label}
                            </th>
                          );
                        })}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {(data?.rows || []).length > 0 ? (
                        (data?.rows || []).map((row) => {
                          const isEditable = editableDocumentIds.has(row.id);
                          return (
                            <tr key={row.id} className="hover:bg-gray-50">
                              {row.cells.map((cell, index) => renderCell(cell, index))}
                              <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleView(row.id)}
                                    className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                    title="View detail"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(row.id)}
                                    disabled={!isEditable}
                                    className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                                    title={isEditable ? 'Edit document link' : 'This document cannot be edited'}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteTarget({ id: row.id, label: row.linkReference })}
                                    disabled={!isEditable}
                                    className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                                    title={isEditable ? 'Delete document link' : 'This document cannot be deleted'}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={tab.columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">
                            No supporting documents found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {data?.pagination && data.pagination.totalPages > 1 ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Page {data.pagination.page} of {data.pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!data.pagination.hasPrevPage}
                      onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={!data.pagination.hasNextPage}
                      onClick={() => setCurrentPage((previous) => previous + 1)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <SlideOver
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Supporting Document Detail"
        description="Review the linked file, expense reference, document state, and attachment notes."
      >
        <div className="space-y-6">
          {isViewLoading ? (
            <LoadingSkeleton />
          ) : viewDetail ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['Link Reference', viewDetail.linkReference],
                  ['Expense', viewDetail.expenseLabel],
                  ['Expense Status', viewDetail.expenseStatusLabel],
                  ['Category', viewDetail.documentCategoryLabel],
                  ['Document Date', viewDetail.documentDateLabel],
                  ['Uploaded By', viewDetail.uploadedByLabel],
                  ['State', viewDetail.stateLabel],
                  ['Created At', viewDetail.createdAtLabel],
                  ['Updated At', viewDetail.updatedAtLabel],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Linked File</h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Uploaded media associated with this supporting document link.
                    </p>
                  </div>
                  {viewDetail.media?.url ? (
                    <a
                      href={viewDetail.media.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open File
                    </a>
                  ) : null}
                </div>
                {viewDetail.media ? (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">File Name</p>
                      <p className="mt-2 text-sm font-medium text-gray-900">{viewDetail.media.filename || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Mime Type</p>
                      <p className="mt-2 text-sm font-medium text-gray-900">{viewDetail.media.mimeType || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">File Size</p>
                      <p className="mt-2 text-sm font-medium text-gray-900">{formatFileSize(viewDetail.media.filesize)}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Alt Text</p>
                      <p className="mt-2 text-sm font-medium text-gray-900">{viewDetail.media.alt || '-'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">No media detail is available.</p>
                )}
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Linked Expense Snapshot</h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Current header values on the linked expense record.
                    </p>
                  </div>
                  {viewDetail.expenseSnapshot ? (
                    <button
                      type="button"
                      onClick={() => router.push('/accounting/expenses/expense-operations?tab=expenses')}
                      className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Open Expense Operations
                    </button>
                  ) : null}
                </div>
                {viewDetail.expenseSnapshot ? (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {[
                      ['Expense No.', viewDetail.expenseSnapshot.expenseNumber],
                      ['Vendor', viewDetail.expenseSnapshot.vendorLabel || '-'],
                      ['Status', viewDetail.expenseSnapshot.statusLabel],
                      ['Total', viewDetail.expenseSnapshot.totalLabel],
                      ['Tax Code', viewDetail.expenseSnapshot.taxCodeLabel || '-'],
                      ['Payment Method', viewDetail.expenseSnapshot.paymentMethodLabel],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                        <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">Linked expense could not be loaded.</p>
                )}
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900">Notes</h4>
                <p className="mt-2 text-sm text-gray-700">{viewDetail.notes || '-'}</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">No document detail available.</p>
          )}
        </div>
      </SlideOver>

      <SlideOver
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Supporting Document"
        description="Attach a real support file to an expense record using the accounting document-link collection."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-6">
          {createError ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {createError}
            </div>
          ) : null}
          <FormField label="Expense" required>
            <Select
              value={createForm.entityId}
              onChange={(value) => setCreateForm((previous) => ({ ...previous, entityId: value }))}
              options={expenseOptions}
            />
          </FormField>
          <FormField label="Document Category" required>
            <Select
              value={createForm.documentCategory}
              onChange={(value) =>
                setCreateForm((previous) => ({ ...previous, documentCategory: value }))
              }
              options={categoryOptions}
            />
          </FormField>
          <FormField label="Attachment" required>
            <MediaUploader
              value={createForm.media}
              onChange={(value) =>
                setCreateForm((previous) => ({ ...previous, media: String(value || '') }))
              }
              accept=""
              maxSize={20}
            />
          </FormField>
          <FormField label="Document Date">
            <input
              type="date"
              value={createForm.documentDate}
              onChange={(event) =>
                setCreateForm((previous) => ({ ...previous, documentDate: event.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </FormField>
          <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <input
              type="checkbox"
              checked={createForm.isPrimary}
              onChange={(event) =>
                setCreateForm((previous) => ({ ...previous, isPrimary: event.target.checked }))
              }
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">Mark as primary</p>
              <p className="mt-1 text-sm text-gray-600">
                Use this when the uploaded file is the main supporting document for the expense.
              </p>
            </div>
          </label>
          <FormField label="Notes">
            <TextArea
              value={createForm.notes}
              onChange={(value) => setCreateForm((previous) => ({ ...previous, notes: value }))}
            />
          </FormField>
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              disabled={isCreateSubmitting}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isCreateSubmitting ||
                !createForm.entityId ||
                !createForm.media ||
                !createForm.documentCategory
              }
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}
            >
              {isCreateSubmitting ? 'Creating...' : 'Create Supporting Document'}
            </button>
          </div>
        </form>
      </SlideOver>

      <SlideOver
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Supporting Document"
        description="Update the linked file metadata, category, and expense association."
      >
        <form onSubmit={handleEditSubmit} className="space-y-6">
          {isViewLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              {editError ? (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {editError}
                </div>
              ) : null}
              <FormField label="Expense" required>
                <Select
                  value={editForm.entityId}
                  onChange={(value) => setEditForm((previous) => ({ ...previous, entityId: value }))}
                  options={expenseOptions}
                />
              </FormField>
              <FormField label="Document Category" required>
                <Select
                  value={editForm.documentCategory}
                  onChange={(value) =>
                    setEditForm((previous) => ({ ...previous, documentCategory: value }))
                  }
                  options={categoryOptions}
                />
              </FormField>
              <FormField label="Attachment" required>
                <MediaUploader
                  value={editForm.media}
                  onChange={(value) => setEditForm((previous) => ({ ...previous, media: String(value || '') }))}
                  accept=""
                  maxSize={20}
                />
              </FormField>
              <FormField label="Document Date">
                <input
                  type="date"
                  value={editForm.documentDate}
                  onChange={(event) =>
                    setEditForm((previous) => ({ ...previous, documentDate: event.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </FormField>
              <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <input
                  type="checkbox"
                  checked={editForm.isPrimary}
                  onChange={(event) =>
                    setEditForm((previous) => ({ ...previous, isPrimary: event.target.checked }))
                  }
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Mark as primary</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Use this when the uploaded file is the main supporting document for the expense.
                  </p>
                </div>
              </label>
              <FormField label="Notes">
                <TextArea
                  value={editForm.notes}
                  onChange={(value) => setEditForm((previous) => ({ ...previous, notes: value }))}
                />
              </FormField>
              <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isEditSubmitting}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isEditSubmitting || !editForm.entityId || !editForm.media || !editForm.documentCategory
                  }
                  className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}
                >
                  {isEditSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </>
          )}
        </form>
      </SlideOver>

      <SlideOver
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Supporting Document"
        description="Remove this expense document link permanently."
      >
        <div className="space-y-6">
          {deleteError ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {deleteError}
            </div>
          ) : null}
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Are you sure?</p>
            <p className="mt-1">
              This action cannot be undone. Supporting document link{' '}
              <span className="font-semibold">{deleteTarget?.label}</span> will be permanently removed.
            </p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleteSubmitting}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleteSubmitting}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleteSubmitting ? 'Deleting...' : 'Delete Supporting Document'}
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
