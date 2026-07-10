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
  createCourseFeeProfile,
  deleteCourseFeeProfile,
  getCourseFeeProfileDetail,
  getFeeComponents,
  updateCourseFeeProfile,
  type CoursePricingCell,
  type CoursePricingMutationInput,
  type CoursePricingMetric,
  type FeeComponentRow,
  type FeeComponentsResponse,
} from './actions-course-pricing';

type FeeComponentsFilterState = { recognitionMethods: string[] };
type FeeComponentsFormState = {
  course: string;
  certificateFee: string;
  retakeFee: string;
  reassessmentFee: string;
  renewalFee: string;
  latePaymentFee: string;
  manualAdjustmentAllowed: boolean;
  defaultRecognitionMethod: string;
  instructorExpenseAccount: string;
  notes: string;
};
type FeeComponentsActionTarget = {
  id: string;
  name: string;
};

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  if (variant === 'ghost') return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
}

function getMetricTone(trend: CoursePricingMetric['trend']) {
  if (trend === 'down') return 'text-red-600 bg-red-50';
  if (trend === 'neutral') return 'text-gray-600 bg-gray-100';
  return 'text-green-600 bg-green-50';
}

function escapeCsvValue(value: string | number | boolean | null | undefined) {
  const stringValue = String(value ?? '');
  return /[",\n]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
}

function toggleFilterValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function createEmptyForm(): FeeComponentsFormState {
  return {
    course: '',
    certificateFee: '0',
    retakeFee: '0',
    reassessmentFee: '0',
    renewalFee: '0',
    latePaymentFee: '0',
    manualAdjustmentAllowed: true,
    defaultRecognitionMethod: 'on_activation',
    instructorExpenseAccount: '',
    notes: '',
  };
}

function SlideOver({
  isOpen,
  onClose,
  title,
  description,
  children,
  width = 'max-w-4xl',
}: {
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
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ease-in-out ${animate ? 'bg-black/50' : 'bg-transparent'}`} onClick={onClose}>
      <div className={`flex h-full w-full ${width} flex-col bg-white shadow-xl transition-all duration-300 ease-in-out ${animate ? 'translate-x-0' : 'translate-x-full'}`} onClick={(event) => event.stopPropagation()}>
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
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500"
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
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
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

function MetricCard({ label, value, change, trend = 'neutral' }: { label: string; value: string | number; change: string; trend?: 'up' | 'down' | 'neutral' }) {
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

function renderCell(cell: CoursePricingCell, index: number) {
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
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${toneMap[cell.tone] || toneMap.gray}`}>{cell.text}</span>
      </td>
    );
  }

  return <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${cell.emphasis ? 'font-semibold text-gray-900' : 'text-gray-600'} ${alignClass}`}>{cell.text}</td>;
}

export function FeeComponentsClient() {
  const [data, setData] = useState<FeeComponentsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FeeComponentsFilterState>({ recognitionMethods: [] });
  const [draftFilters, setDraftFilters] = useState<FeeComponentsFilterState>({ recognitionMethods: [] });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [viewDetail, setViewDetail] = useState<FeeComponentRow | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [formState, setFormState] = useState<FeeComponentsFormState>(createEmptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeeComponentsActionTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filterCount = filters.recognitionMethods.length;

  const referenceData = data?.referenceData;

  const courseOptions = useMemo(
    () => [
      { label: 'Select a course', value: '' },
      ...(referenceData?.courses || []).map((c) => ({
        label: c.name ? (c.courseCode ? `${c.courseCode} - ${c.name}` : c.name) : 'Unnamed course',
        value: String(c.id),
      })),
    ],
    [referenceData?.courses],
  );

  const accountOptions = useMemo(
    () => [
      { label: 'Select an account', value: '' },
      ...(referenceData?.chartAccounts || []).map((acct) => ({
        label: acct.code ? `${acct.code} - ${acct.name}` : acct.name || 'Unnamed account',
        value: String(acct.id),
      })),
    ],
    [referenceData?.chartAccounts],
  );

  const recognitionMethodOptions = useMemo(() => [
    { label: 'On Activation', value: 'on_activation' },
    { label: 'Straight Line', value: 'straight_line' },
    { label: 'Completion Based', value: 'completion_based' },
    { label: 'Certificate Based', value: 'certificate_based' },
    { label: 'Manual', value: 'manual' },
  ], []);

  const fetchFeeComponents = useCallback(async ({
    search,
    page,
    nextFilters,
  }: {
    search: string;
    page: number;
    nextFilters: FeeComponentsFilterState;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getFeeComponents({
        search,
        page,
        recognitionMethods: nextFilters.recognitionMethods,
      });
      setData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load fee components.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchFeeComponents({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
    });
  }, [currentPage, fetchFeeComponents, filters, submittedSearch]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput);
    setCurrentPage(1);
    void fetchFeeComponents({ search: searchInput, page: 1, nextFilters: filters });
  };

  const handleRefresh = () => {
    void fetchFeeComponents({ search: submittedSearch, page: currentPage, nextFilters: filters });
  };

  const handleExport = () => {
    const rows = data?.section.table.rows || [];
    if (!rows.length) return;
    const headers = ['Course', 'Certificate Fee', 'Retake Fee', 'Reassessment Fee', 'Renewal Fee', 'Late Payment Fee', 'Instructor Expense', 'Recognition Method', 'Manual Adjustment'];
    const csvRows = rows.map((row) => [
      row.courseName,
      formatCurrency(row.certificateFee),
      formatCurrency(row.retakeFee),
      formatCurrency(row.reassessmentFee),
      formatCurrency(row.renewalFee),
      formatCurrency(row.latePaymentFee),
      row.instructorExpenseAccountLabel,
      row.defaultRecognitionMethodLabel,
      row.manualAdjustmentLabel,
    ]);
    const csvContent = [headers, ...csvRows].map((row) => row.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fee-components.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormError(null);
    setFormState(createEmptyForm());
    setIsFormOpen(true);
  };

  const handleView = (row: FeeComponentRow) => {
    setViewDetail(row);
    setIsViewOpen(true);
  };

  const handleOpenEdit = async (id: string) => {
    setEditingId(id);
    setFormError(null);
    setIsFormOpen(true);
    try {
      const detail = await getCourseFeeProfileDetail(id);
      setFormState({
        course: detail.course,
        certificateFee: String(detail.certificateFee || 0),
        retakeFee: String(detail.retakeFee || 0),
        reassessmentFee: String(detail.reassessmentFee || 0),
        renewalFee: String(detail.renewalFee || 0),
        latePaymentFee: String(detail.latePaymentFee || 0),
        manualAdjustmentAllowed: detail.manualAdjustmentAllowed,
        defaultRecognitionMethod: detail.defaultRecognitionMethod,
        instructorExpenseAccount: detail.instructorExpenseAccount,
        notes: detail.notes || '',
      });
    } catch (detailError) {
      setFormError(detailError instanceof Error ? detailError.message : 'Unable to load fee component detail.');
    }
  };

  const normalizeFormPayload = (): CoursePricingMutationInput => ({
    course: formState.course,
    certificateFee: Number(formState.certificateFee || 0),
    retakeFee: Number(formState.retakeFee || 0),
    reassessmentFee: Number(formState.reassessmentFee || 0),
    renewalFee: Number(formState.renewalFee || 0),
    latePaymentFee: Number(formState.latePaymentFee || 0),
    manualAdjustmentAllowed: formState.manualAdjustmentAllowed,
    defaultRecognitionMethod: formState.defaultRecognitionMethod,
    instructorExpenseAccount: formState.instructorExpenseAccount || undefined,
    notes: formState.notes.trim() || undefined,
  });

  const refreshCurrentView = async () => {
    await fetchFeeComponents({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      const payload = normalizeFormPayload();
      if (editingId) {
        await updateCourseFeeProfile(editingId, payload);
      } else {
        await createCourseFeeProfile(payload);
      }
      setIsFormOpen(false);
      await refreshCurrentView();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Unable to save fee component.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteCourseFeeProfile(deleteTarget.id);
      setDeleteTarget(null);
      await refreshCurrentView();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete fee component.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">{data?.section.label || 'Fee Components & Recognition'}</h2>
          <p className="text-sm text-gray-600">{data?.section.description || 'Fee component values and recognition defaults for each course.'}</p>
          <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
            <Plus className="h-4 w-4" />
            New Fee Component
          </button>
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" />
            Refresh Components
          </button>
          <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!data?.section.table.rows.length}>
            <Download className="h-4 w-4" />
            Download View
          </button>
        </div>
      </div>

      {data?.section.metrics?.length ? <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{data.section.metrics.map((metric) => <div key={metric.id}><MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} /></div>)}</div> : null}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <form onSubmit={handleSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder={data?.section.searchPlaceholder || 'Search course, fee amount, recognition method, or instructor expense account'} value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700">
                <Search className="h-4 w-4" />
                Search
              </button>
            </form>
            <button type="button" onClick={() => { if (!isFilterPanelOpen) setDraftFilters({ ...filters }); setIsFilterPanelOpen((previous) => !previous); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isFilterPanelOpen || filterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}>
              <Filter className="h-4 w-4" />
              Filters
              {filterCount > 0 ? <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{filterCount}</span> : null}
            </button>
          </div>
        </div>

        <div className="space-y-4 p-5">
          {isFilterPanelOpen ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Filters</h4>
                  <p className="mt-1 text-sm text-gray-600">Select as many values as needed per group, then apply the filtered view.</p>
                </div>
        <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => { setDraftFilters({ recognitionMethods: [] }); setFilters({ recognitionMethods: [] }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Clear all</button>
                  <button type="button" onClick={() => setIsFilterPanelOpen(false)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="button" onClick={() => { setFilters({ ...draftFilters }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button>
                </div>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Recognition Method</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.section.filters.recognitionMethods || []).map((option) => {
                      const selected = draftFilters.recognitionMethods.includes(option.value);
                      return <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, recognitionMethods: toggleFilterValue(previous.recognitionMethods, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{option.label}</button>;
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">{data?.section.table.title || 'Fee Components Register'}</h3>
              <p className="text-sm text-gray-600">{data?.section.table.description || 'Fee component values and recognition defaults drawn from accounting-course-fee-profiles, including certificate, retake, renewal, late fees, and instructor expense mapping.'}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span>{data?.totals.filteredRows ?? 0} matching rows</span>
            </div>
          </div>

          {error ? <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div> : null}

          {isLoading ? <LoadingSkeleton /> : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Course', 'Certificate Fee', 'Retake Fee', 'Reassessment Fee', 'Renewal Fee', 'Late Payment Fee', 'Instructor Expense', 'Recognition Method', 'Manual Adjustment'].map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${['Certificate Fee', 'Retake Fee', 'Reassessment Fee', 'Renewal Fee', 'Late Payment Fee'].includes(column) ? 'text-right' : 'text-left'}`}>{column}</th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {(data?.section.table.rows || []).length > 0 ? (data?.section.table.rows || []).map((row) => {
                        const cells: CoursePricingCell[] = [
                          { text: row.courseName, emphasis: true },
                          { text: formatCurrency(row.certificateFee), align: 'right' },
                          { text: formatCurrency(row.retakeFee), align: 'right' },
                          { text: formatCurrency(row.reassessmentFee), align: 'right' },
                          { text: formatCurrency(row.renewalFee), align: 'right' },
                          { text: formatCurrency(row.latePaymentFee), align: 'right' },
                          row.instructorExpenseAccountLabel,
                          { text: row.defaultRecognitionMethodLabel, tone: row.defaultRecognitionMethodTone as 'amber' | 'blue' | 'gray' | 'green' | 'red' },
                          { text: row.manualAdjustmentLabel, tone: row.manualAdjustmentTone as 'amber' | 'green' },
                        ];
                        return (
                          <tr key={row.id} className="hover:bg-gray-50">
                            {cells.map((cell, index) => renderCell(cell, index))}
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => handleView(row)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => handleOpenEdit(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="Edit fee component">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => setDeleteTarget({ id: row.id, name: row.courseName })} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700" title="Delete fee component">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={10} className="px-4 py-10 text-center text-sm text-gray-500">No fee component rows found.</td>
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
                    <button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button>
                    <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Fee Component Detail" description="Review fee component values for this course, including certificate, retake, renewal, late fees, recognition method, and instructor expense mapping.">
        <div className="space-y-6">
          {viewDetail ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['Course', viewDetail.courseName || '-'],
                  ['Recognition Method', viewDetail.defaultRecognitionMethodLabel],
                  ['Manual Adjustment Allowed', viewDetail.manualAdjustmentAllowed ? 'Yes' : 'No'],
                  ['Certificate Fee', formatCurrency(viewDetail.certificateFee)],
                  ['Retake Fee', formatCurrency(viewDetail.retakeFee)],
                  ['Reassessment Fee', formatCurrency(viewDetail.reassessmentFee)],
                  ['Renewal Fee', formatCurrency(viewDetail.renewalFee)],
                  ['Late Payment Fee', formatCurrency(viewDetail.latePaymentFee)],
                  ['Instructor Expense Account', viewDetail.instructorExpenseAccountLabel || '-'],
                  ['Notes', viewDetail.notes || '-'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-sm text-gray-500">No details available.</p>}
          <div className="flex justify-end pt-4">
            <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Close</button>
          </div>
        </div>
      </SlideOver>

      <SlideOver isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingId ? 'Edit Fee Component' : 'New Fee Component'} description="Configure course fee amounts, recognition method, and instructor expense mapping for this course.">
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError ? <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{formError}</div> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Course" required>
              <Select value={formState.course} onChange={(value) => setFormState((previous) => ({ ...previous, course: value }))} options={courseOptions} />
            </FormField>
            <FormField label="Recognition Method" required>
              <Select value={formState.defaultRecognitionMethod} onChange={(value) => setFormState((previous) => ({ ...previous, defaultRecognitionMethod: value }))} options={recognitionMethodOptions} />
            </FormField>
            <FormField label="Certificate Fee">
              <Input type="number" value={formState.certificateFee} onChange={(value) => setFormState((previous) => ({ ...previous, certificateFee: value }))} />
            </FormField>
            <FormField label="Retake Fee">
              <Input type="number" value={formState.retakeFee} onChange={(value) => setFormState((previous) => ({ ...previous, retakeFee: value }))} />
            </FormField>
            <FormField label="Reassessment Fee">
              <Input type="number" value={formState.reassessmentFee} onChange={(value) => setFormState((previous) => ({ ...previous, reassessmentFee: value }))} />
            </FormField>
            <FormField label="Renewal Fee">
              <Input type="number" value={formState.renewalFee} onChange={(value) => setFormState((previous) => ({ ...previous, renewalFee: value }))} />
            </FormField>
            <FormField label="Late Payment Fee">
              <Input type="number" value={formState.latePaymentFee} onChange={(value) => setFormState((previous) => ({ ...previous, latePaymentFee: value }))} />
            </FormField>
            <FormField label="Instructor Expense Account">
              <Select value={formState.instructorExpenseAccount} onChange={(value) => setFormState((previous) => ({ ...previous, instructorExpenseAccount: value }))} options={accountOptions} />
            </FormField>
            <FormField label="Manual Adjustment Allowed">
              <Checkbox label="Allow manual billing adjustments" checked={formState.manualAdjustmentAllowed} onChange={(checked) => setFormState((previous) => ({ ...previous, manualAdjustmentAllowed: checked }))} />
            </FormField>
          </div>
          <FormField label="Notes">
            <TextArea value={formState.notes} onChange={(value) => setFormState((previous) => ({ ...previous, notes: value }))} rows={3} />
          </FormField>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} disabled={isSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>{isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Fee Component'}</button>
          </div>
        </form>
      </SlideOver>

      <SlideOver isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete Fee Component" description="Delete this fee component profile." width="max-w-lg">
        <div className="space-y-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Delete fee component for {deleteTarget?.name}?</p>
            <p className="mt-1">This will remove the fee profile and all associated fee and account mappings. This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">{isDeleting ? 'Deleting...' : 'Delete Fee Component'}</button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
