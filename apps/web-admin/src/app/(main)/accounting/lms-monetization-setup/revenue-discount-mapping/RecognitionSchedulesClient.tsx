'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  createSchedule,
  deleteSchedule,
  getScheduleDetail,
  getSchedules,
  updateSchedule,
  type ScheduleCell,
  type ScheduleDetail,
  type ScheduleMetric,
  type ScheduleMutationInput,
  type ScheduleRegisterResponse,
} from './actions-recognition-schedules';

type ScheduleFilterState = { statuses: string[]; recognitionMethods: string[] };
type ScheduleFormState = {
  invoice: string;
  enrollmentBillingLink: string;
  recognitionMethod: string;
  startDate: string;
  endDate: string;
  totalDeferredAmount: string;
  recognizedAmount: string;
  status: string;
  notes: string;
};
type ScheduleActionTarget = {
  id: string;
  label: string;
};

const MUTABLE_STATUSES = new Set(['draft', 'scheduled', 'partially_recognized']);

const STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Partially Recognized', value: 'partially_recognized' },
  { label: 'Recognized', value: 'recognized' },
  { label: 'Cancelled', value: 'cancelled' },
];

const RECOGNITION_METHOD_OPTIONS = [
  { label: 'On Activation', value: 'on_activation' },
  { label: 'Straight Line', value: 'straight_line' },
  { label: 'Completion Based', value: 'completion_based' },
  { label: 'Certificate Based', value: 'certificate_based' },
  { label: 'Manual', value: 'manual' },
];

const METRIC_TONES: Record<string, string> = {
  up: 'bg-green-50 text-green-700 ring-green-200',
  down: 'bg-red-50 text-red-700 ring-red-200',
  neutral: 'bg-gray-50 text-gray-700 ring-gray-200',
};

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  if (variant === 'ghost') return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
}

function getMetricTone(trend: string): string {
  return METRIC_TONES[trend] || METRIC_TONES.neutral;
}

function escapeCsvValue(value: string | number | boolean | null | undefined) {
  const stringValue = String(value ?? '');
  return /[",\n]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
}

function toggleFilterValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
}

function toDateInputValue(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

function SlideOver({ isOpen, onClose, title, description, children, width = 'max-w-4xl' }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  width?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
      return undefined;
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
        className={`flex h-full w-full ${width} flex-col bg-white shadow-xl transition-all duration-300 ease-in-out ${animate ? 'translate-x-0' : 'translate-x-full'}`}
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

function Input({ value, onChange, placeholder, type = 'text', required, disabled }: {
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
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500"
    />
  );
}

function Select({ value, onChange, options, disabled }: {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}

function TextArea({ value, onChange, rows = 3 }: {
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

function MetricCard({ label, value, change, trend = 'neutral' }: {
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
          <FileText className="h-5 w-5" />
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

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="mt-4 h-8 w-20 animate-pulse rounded bg-gray-100" />
            <div className="mt-4 h-5 w-28 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
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
                  <td colSpan={7} className="px-4 py-3">
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

function renderCell(cell: ScheduleCell, index: number) {
  if (typeof cell === 'string') {
    return <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{cell}</td>;
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
    <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${cell.emphasis ? 'font-semibold text-gray-900' : 'text-gray-600'} ${alignClass}`}>
      {cell.text}
    </td>
  );
}

export function RecognitionSchedulesClient() {
  const [data, setData] = useState<ScheduleRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ScheduleFilterState>({ statuses: [], recognitionMethods: [] });
  const [draftFilters, setDraftFilters] = useState<ScheduleFilterState>({ statuses: [], recognitionMethods: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const [viewDetail, setViewDetail] = useState<ScheduleDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);

  const [formState, setFormState] = useState<ScheduleFormState>({
    invoice: '',
    enrollmentBillingLink: '',
    recognitionMethod: 'on_activation',
    startDate: '',
    endDate: '',
    totalDeferredAmount: '',
    recognizedAmount: '',
    status: 'draft',
    notes: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ScheduleActionTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSchedules = useCallback(async ({
    search, page: nextPage, nextFilters, nextQuickFilters,
  }: {
    search: string;
    page: number;
    nextFilters: ScheduleFilterState;
    nextQuickFilters: string[];
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getSchedules({
        search,
        page: nextPage,
        statuses: nextFilters.statuses,
        recognitionMethods: nextFilters.recognitionMethods,
        quickFilters: nextQuickFilters,
      });
      setData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load recognition schedules.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSchedules({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  }, [currentPage, fetchSchedules, filters, quickFilters, submittedSearch]);

  const filterCount = filters.statuses.length + filters.recognitionMethods.length;

  const handleToggleQuickFilter = (value: string) => {
    setQuickFilters((prev) => toggleFilterValue(prev, value));
    setCurrentPage(1);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput);
    setCurrentPage(1);
  };

  const handleView = async (id: string) => {
    setIsViewOpen(true);
    setIsViewLoading(true);
    setViewDetail(null);
    try {
      const detail = await getScheduleDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load schedule detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleRefresh = () => {
    void fetchSchedules({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  };

  const handleExport = () => {
    const rows = data?.rows || [];
    if (!rows.length) return;

    const headers = ['Invoice', 'Billing Link', 'Recognition Method', 'Deferred', 'Recognized', 'Remaining', 'Status'];
    const csvRows = rows.map((row) => [
      row.invoiceNumber,
      row.enrollmentBillingLinkLabel,
      row.recognitionMethodLabel,
      row.totalDeferredLabel,
      row.recognizedLabel,
      row.remainingLabel,
      row.statusLabel,
    ]);

    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'revenue-recognition-schedules.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const invoiceOptions = useMemo(() => [
    { label: 'Select an invoice', value: '' },
    ...(data?.referenceData?.invoices || []).map((inv) => ({
      label: `${inv.invoiceNumber}${inv.memo ? ` - ${inv.memo}` : ''}`,
      value: String(inv.id),
    })),
  ], [data?.referenceData?.invoices]);

  const billingLinkOptions = useMemo(() => [
    { label: 'Select a billing link', value: '' },
    ...(data?.referenceData?.enrollmentBillingLinks || []).map((ebl) => ({
      label: `${ebl.sourceReference}${ebl.enrollmentId ? ` (Enrollment #${ebl.enrollmentId})` : ''}`,
      value: String(ebl.id),
    })),
  ], [data?.referenceData?.enrollmentBillingLinks]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormError(null);
    setFormState({
      invoice: '',
      enrollmentBillingLink: '',
      recognitionMethod: 'on_activation',
      startDate: '',
      endDate: '',
      totalDeferredAmount: '',
      recognizedAmount: '',
      status: 'draft',
      notes: '',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = async (id: string) => {
    setEditingId(id);
    setFormError(null);
    setIsFormOpen(true);
    setIsViewLoading(true);
    try {
      const detail = await getScheduleDetail(id);
      setFormState({
        invoice: detail.invoiceId,
        enrollmentBillingLink: detail.enrollmentBillingLinkId,
        recognitionMethod: detail.recognitionMethod,
        startDate: toDateInputValue(detail.startDate),
        endDate: toDateInputValue(detail.endDate),
        totalDeferredAmount: String(detail.totalDeferredAmount),
        recognizedAmount: String(detail.recognizedAmount),
        status: detail.status,
        notes: detail.notes,
      });
    } catch (detailError) {
      setFormError(detailError instanceof Error ? detailError.message : 'Unable to load schedule detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      const totalDeferred = Number(formState.totalDeferredAmount) || 0;
      const recognized = Number(formState.recognizedAmount) || 0;
      const payload: ScheduleMutationInput = {
        invoice: formState.invoice || undefined,
        enrollmentBillingLink: formState.enrollmentBillingLink || undefined,
        recognitionMethod: formState.recognitionMethod,
        startDate: formState.startDate || null,
        endDate: formState.endDate || null,
        totalDeferredAmount: totalDeferred,
        recognizedAmount: recognized,
        remainingDeferredAmount: Math.max(0, totalDeferred - recognized),
        status: formState.status,
        notes: formState.notes.trim() || undefined,
      };

      if (editingId) {
        await updateSchedule(editingId, payload);
      } else {
        await createSchedule(payload);
      }
      setIsFormOpen(false);
      handleRefresh();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Unable to save recognition schedule.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteSchedule(deleteTarget.id);
      setDeleteTarget(null);
      handleRefresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete recognition schedule.');
    } finally {
      setIsDeleting(false);
    }
  };

  const rows = data?.rows || [];
  const referenceData = data?.referenceData;
  const filterOptions = data?.filterOptions;

  return (
    <div className="space-y-4">
      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleOpenCreate}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
            <Plus className="h-4 w-4" />
            New Schedule
          </button>
          <button type="button" onClick={handleRefresh}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" />
            Refresh Schedules
          </button>
        </div>
        <button type="button" onClick={handleExport} disabled={!rows.length}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${getActionClasses('secondary')}`}>
          <Download className="h-4 w-4" />
          Download View
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {(data?.metrics || []).map((metric) => (
          <div key={metric.id}><MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} /></div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="relative flex-1" style={{ minWidth: 200, maxWidth: 320 }}>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={data?.meta?.searchPlaceholder || 'Search...'}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </form>
        <button type="button" onClick={() => {
          if (!isFilterPanelOpen) setDraftFilters({ ...filters });
          setIsFilterPanelOpen((prev) => !prev);
        }}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isFilterPanelOpen ? 'border border-blue-600 bg-blue-50 text-blue-700' : `border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}`}>
          <Filter className="h-4 w-4" />
          Filters
          {filterCount > 0 ? (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{filterCount}</span>
          ) : null}
        </button>

        {(data?.filterOptions?.quickFilters || []).map((qf) => {
          const selected = quickFilters.includes(qf.value);
          return (
            <button
              key={qf.value}
              type="button"
              onClick={() => handleToggleQuickFilter(qf.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'
              }`}
            >
              {qf.label}
            </button>
          );
        })}
      </div>

      {isFilterPanelOpen ? (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</p>
              <div className="flex flex-wrap gap-2">
                {(filterOptions?.statuses || []).map((option) => {
                  const selected = draftFilters.statuses.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDraftFilters((prev) => ({ ...prev, statuses: toggleFilterValue(prev.statuses, option.value) }))}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Recognition Method</p>
              <div className="flex flex-wrap gap-2">
                {(filterOptions?.recognitionMethods || []).map((option) => {
                  const selected = draftFilters.recognitionMethods.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDraftFilters((prev) => ({ ...prev, recognitionMethods: toggleFilterValue(prev.recognitionMethods, option.value) }))}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-3">
              <button type="button" onClick={() => {
                setDraftFilters({ statuses: [], recognitionMethods: [] });
                setFilters({ statuses: [], recognitionMethods: [] });
                setCurrentPage(1);
                setIsFilterPanelOpen(false);
              }}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                Clear
              </button>
              <button type="button" onClick={() => {
                setFilters({ ...draftFilters });
                setCurrentPage(1);
                setIsFilterPanelOpen(false);
              }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isLoading ? <LoadingSkeleton /> : (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {(data?.meta?.columns || []).map((col) => (
                    <th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{col}</th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={(data?.meta?.columns?.length || 6) + 1} className="px-4 py-8 text-center text-sm text-gray-500">
                      No recognition schedules found.
                    </td>
                  </tr>
                ) : rows.map((row) => {
                  const isMutable = MUTABLE_STATUSES.has(row.status);
                  return (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {renderCell({ text: row.invoiceNumber, emphasis: true }, 0)}
                      {renderCell(row.enrollmentBillingLinkLabel, 1)}
                      {renderCell(row.recognitionMethodLabel, 2)}
                      {renderCell({ text: row.totalDeferredLabel, align: 'right' }, 3)}
                      {renderCell({ text: row.recognizedLabel, align: 'right' }, 4)}
                      {renderCell({ text: row.remainingLabel, align: 'right' }, 5)}
                      {renderCell({ text: row.statusLabel, tone: row.statusTone as ScheduleCell extends { tone: infer T } ? T : never }, 6)}
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => handleView(row.id)}
                            className={`inline-flex items-center gap-1 rounded-lg p-2 text-sm font-medium transition-colors ${getActionClasses('ghost')}`}
                            title="View">
                            <Eye className="h-4 w-4" />
                          </button>
                          {isMutable ? (
                            <button type="button" onClick={() => handleOpenEdit(row.id)}
                              className={`inline-flex items-center gap-1 rounded-lg p-2 text-sm font-medium transition-colors ${getActionClasses('ghost')}`}
                              title="Edit">
                              <Edit className="h-4 w-4" />
                            </button>
                          ) : null}
                          {isMutable ? (
                            <button type="button" onClick={() => setDeleteTarget({ id: row.id, label: `Schedule ${row.invoiceNumber}` })}
                              className={`inline-flex items-center gap-1 rounded-lg p-2 text-sm font-medium transition-colors ${getActionClasses('ghost')}`}
                              title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {data?.pagination && data.pagination.totalPages > 1 ? (
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
              <p className="text-sm text-gray-600">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">
                  Previous
                </button>
                <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Recognition Schedule Detail" width="max-w-3xl">
        {isViewLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-gray-500">Loading...</div>
        ) : viewDetail ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-500">Invoice</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{viewDetail.invoiceNumber}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-500">Billing Link</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{viewDetail.enrollmentBillingLinkLabel}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-500">Recognition Method</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{viewDetail.recognitionMethodLabel}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-500">Status</p>
                <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                  viewDetail.statusTone === 'green' ? 'bg-green-50 text-green-700 ring-green-200' :
                  viewDetail.statusTone === 'amber' ? 'bg-amber-50 text-amber-700 ring-amber-200' :
                  viewDetail.statusTone === 'blue' ? 'bg-blue-50 text-blue-700 ring-blue-200' :
                  'bg-gray-100 text-gray-700 ring-gray-200'
                }`}>{viewDetail.statusLabel}</span>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-500">Start Date</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{viewDetail.startDate ? new Date(viewDetail.startDate).toLocaleDateString() : '-'}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-500">End Date</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{viewDetail.endDate ? new Date(viewDetail.endDate).toLocaleDateString() : '-'}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-500">Total Deferred</p>
                <p className="mt-1 text-lg font-bold text-gray-900">{viewDetail.totalDeferredLabel}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-500">Recognized</p>
                <p className="mt-1 text-lg font-bold text-green-700">{viewDetail.recognizedLabel}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-500">Remaining Deferred</p>
                <p className="mt-1 text-lg font-bold text-amber-700">{viewDetail.remainingLabel}</p>
              </div>
            </div>
            {viewDetail.notes ? (
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-500">Notes</p>
                <p className="mt-1 text-sm text-gray-700">{viewDetail.notes}</p>
              </div>
            ) : null}
            {viewDetail.lastRecognitionAt ? (
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-500">Last Recognition At</p>
                <p className="mt-1 text-sm text-gray-700">{new Date(viewDetail.lastRecognitionAt).toLocaleString()}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </SlideOver>

      <SlideOver isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}
        title={editingId ? 'Edit Recognition Schedule' : 'New Recognition Schedule'}
        description={editingId ? 'Update schedule details.' : 'Create a new revenue recognition schedule.'}>
        {isViewLoading && editingId ? (
          <div className="flex items-center justify-center py-12 text-sm text-gray-500">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {formError ? (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {formError}
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Invoice" required>
                <Select value={formState.invoice} onChange={(value) => setFormState((prev) => ({ ...prev, invoice: value }))} options={invoiceOptions} />
              </FormField>
              <FormField label="Enrollment Billing Link" required>
                <Select value={formState.enrollmentBillingLink} onChange={(value) => setFormState((prev) => ({ ...prev, enrollmentBillingLink: value }))} options={billingLinkOptions} />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Recognition Method" required>
                <Select value={formState.recognitionMethod} onChange={(value) => setFormState((prev) => ({ ...prev, recognitionMethod: value }))} options={RECOGNITION_METHOD_OPTIONS} />
              </FormField>
              <FormField label="Status" required>
                <Select value={formState.status} onChange={(value) => setFormState((prev) => ({ ...prev, status: value }))} options={STATUS_OPTIONS} />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Start Date" required>
                <Input type="date" value={formState.startDate} onChange={(value) => setFormState((prev) => ({ ...prev, startDate: value }))} />
              </FormField>
              <FormField label="End Date" required>
                <Input type="date" value={formState.endDate} onChange={(value) => setFormState((prev) => ({ ...prev, endDate: value }))} />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Total Deferred Amount (PHP)" required>
                <Input type="number" value={formState.totalDeferredAmount} onChange={(value) => setFormState((prev) => ({ ...prev, totalDeferredAmount: value }))} placeholder="0.00" />
              </FormField>
              <FormField label="Recognized Amount (PHP)">
                <Input type="number" value={formState.recognizedAmount} onChange={(value) => setFormState((prev) => ({ ...prev, recognizedAmount: value }))} placeholder="0.00" />
              </FormField>
            </div>

            <FormField label="Notes">
              <TextArea value={formState.notes} onChange={(value) => setFormState((prev) => ({ ...prev, notes: value }))} />
            </FormField>

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
              <button type="button" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting || !formState.invoice || !formState.enrollmentBillingLink}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                {isSubmitting ? 'Saving...' : editingId ? 'Update Schedule' : 'Create Schedule'}
              </button>
            </div>
          </form>
        )}
      </SlideOver>

      <SlideOver isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}
        title="Delete Recognition Schedule" description="This action cannot be undone." width="max-w-lg">
        <div className="space-y-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Delete {deleteTarget?.label}?</p>
            <p className="mt-1">Only draft, scheduled, or partially recognized schedules can be deleted.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setDeleteTarget(null)} disabled={isDeleting}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleting}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {isDeleting ? 'Deleting...' : 'Delete Schedule'}
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
