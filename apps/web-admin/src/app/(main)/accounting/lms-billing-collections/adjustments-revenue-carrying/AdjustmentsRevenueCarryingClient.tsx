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
  FileText,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  createBillingAdjustment,
  createRefund,
  createRevenueSchedule,
  deleteBillingAdjustment,
  deleteRefund,
  deleteRevenueSchedule,
  getBillingAdjustmentDetail,
  getBillingAdjustments,
  getCertificateCharges,
  getRefundDetail,
  getRefunds,
  getRevenueScheduleDetail,
  getRevenueSchedules,
  updateBillingAdjustment,
  updateRefund,
  updateRevenueSchedule,
  type BillingAdjustmentDetail,
  type BillingAdjustmentMutationInput,
  type BillingAdjustmentsResponse,
  type Cell,
  type CertificateChargesResponse,
  type Metric,
  type RefundDetail,
  type RefundMutationInput,
  type RefundsResponse,
  type RevenueScheduleDetail,
  type RevenueScheduleMutationInput,
  type RevenueSchedulesResponse,
} from './actions';

type TabId = 'billing-adjustments' | 'refunds-credit-notes' | 'deferred-revenue-schedules' | 'certificate-charges';

type BillingAdjustmentFilterState = { adjustmentTypes: string[]; directions: string[] };
type RefundFilterState = { statuses: string[]; refundTypes: string[] };
type RevenueScheduleFilterState = { statuses: string[]; recognitionMethods: string[] };

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  if (variant === 'ghost') return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
}

function getMetricTone(trend: Metric['trend']) {
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

function toDateInputValue(value: string | null | undefined) {
  if (!value) return '';
  return value.slice(0, 10);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

const LMS_ADJUSTMENT_TYPE_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'Manual Discount', value: 'manual_discount' },
  { label: 'Manual Surcharge', value: 'manual_surcharge' },
  { label: 'Late Fee', value: 'late_fee' },
  { label: 'Certificate Fee', value: 'certificate_fee' },
  { label: 'Retake Fee', value: 'retake_fee' },
  { label: 'Reassessment Fee', value: 'reassessment_fee' },
  { label: 'Renewal Fee', value: 'renewal_fee' },
];

const LMS_ADJUSTMENT_DIRECTION_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'Increase', value: 'increase' },
  { label: 'Decrease', value: 'decrease' },
];

const LMS_REFUND_STATUS_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'Draft', value: 'draft' },
  { label: 'Requested', value: 'requested' },
  { label: 'Approved', value: 'approved' },
  { label: 'Processed', value: 'processed' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Voided', value: 'voided' },
];

const LMS_REFUND_TYPE_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'Full', value: 'full' },
  { label: 'Partial', value: 'partial' },
  { label: 'Credit Only', value: 'credit_only' },
];

const LMS_RECOGNITION_METHOD_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'On Activation', value: 'on_activation' },
  { label: 'Straight Line', value: 'straight_line' },
  { label: 'Completion Based', value: 'completion_based' },
  { label: 'Certificate Based', value: 'certificate_based' },
  { label: 'Manual', value: 'manual' },
];

const LMS_RECOGNITION_STATUS_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'Draft', value: 'draft' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Partially Recognized', value: 'partially_recognized' },
  { label: 'Recognized', value: 'recognized' },
  { label: 'Cancelled', value: 'cancelled' },
];

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

function renderCell(cell: Cell, index: number) {
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

// === Billing Adjustments Tab ===

function BillingAdjustmentsTab() {
  const [data, setData] = useState<BillingAdjustmentsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<BillingAdjustmentFilterState>({ adjustmentTypes: [], directions: [] });
  const [draftFilters, setDraftFilters] = useState<BillingAdjustmentFilterState>({ adjustmentTypes: [], directions: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [viewDetail, setViewDetail] = useState<BillingAdjustmentDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [formState, setFormState] = useState<BillingAdjustmentMutationInput>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filterCount = filters.adjustmentTypes.length + filters.directions.length;

  const fetchData = useCallback(async ({
    search, page, nextFilters, nextQuickFilters,
  }: {
    search: string; page: number; nextFilters: BillingAdjustmentFilterState; nextQuickFilters: string[];
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getBillingAdjustments({
        search, page,
        adjustmentTypes: nextFilters.adjustmentTypes,
        directions: nextFilters.directions,
        quickFilters: nextQuickFilters,
      });
      setData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load billing adjustments.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  }, [currentPage, fetchData, filters, quickFilters, submittedSearch]);

  const referenceData = data?.referenceData;

  const billingLinkOptions = useMemo(
    () => [
      { label: 'Select a billing link', value: '' },
      ...(referenceData?.enrollmentBillingLinks || []).map((link) => ({
        label: link.sourceReference || `Link #${link.id}`,
        value: String(link.id),
      })),
    ],
    [referenceData?.enrollmentBillingLinks],
  );

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput);
    setCurrentPage(1);
    void fetchData({ search: searchInput, page: 1, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleRefresh = () => {
    void fetchData({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleExport = () => {
    const rows = data?.section.table.rows || [];
    if (!rows.length) return;
    const headers = ['Billing Link', 'Adjustment Type', 'Direction', 'Amount', 'Approved By', 'Applied At'];
    const csvRows = rows.map((row) => [
      row.enrollmentBillingLinkLabel,
      row.adjustmentTypeLabel,
      row.directionLabel,
      row.amountLabel,
      row.approvedByLabel,
      row.appliedAtLabel,
    ]);
    const csvContent = [headers, ...csvRows].map((r) => r.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'billing-adjustments.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleToggleQuickFilter = (value: string) => {
    setQuickFilters((previous) => toggleFilterValue(previous, value));
    setCurrentPage(1);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormError(null);
    setFormState({
      amount: 0,
      direction: 'increase',
      adjustmentType: '',
      reason: '',
      notes: '',
      appliedAt: new Date().toISOString().slice(0, 10),
    });
    setIsFormOpen(true);
  };

  const handleView = async (id: string) => {
    setIsViewOpen(true);
    setIsViewLoading(true);
    setViewDetail(null);
    try {
      const detail = await getBillingAdjustmentDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load billing adjustment detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleOpenEdit = async (id: string) => {
    setEditingId(id);
    setFormError(null);
    setIsFormOpen(true);
    setIsViewLoading(true);
    try {
      const detail = await getBillingAdjustmentDetail(id);
      setFormState({
        enrollmentBillingLink: Number(detail.enrollmentBillingLinkId) || undefined,
        adjustmentType: detail.adjustmentType,
        reason: detail.reason || null,
        amount: detail.amount,
        direction: detail.direction || 'increase',
        approvedBy: detail.approvedById ? Number(detail.approvedById) : null,
        appliedAt: detail.appliedAt,
        notes: detail.notes || null,
      });
    } catch (detailError) {
      setFormError(detailError instanceof Error ? detailError.message : 'Unable to load billing adjustment detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const refreshCurrentView = async () => {
    await fetchData({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (editingId) {
        await updateBillingAdjustment(editingId, formState);
      } else {
        await createBillingAdjustment(formState);
      }
      setIsFormOpen(false);
      await refreshCurrentView();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Unable to save billing adjustment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteBillingAdjustment(deleteTarget.id);
      setDeleteTarget(null);
      await refreshCurrentView();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete billing adjustment.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">{data?.section.label || 'Billing Adjustments'}</h2>
          <p className="text-sm text-gray-600">{data?.section.description || 'Manual LMS billing adjustments applied to enrollment billing links.'}</p>
          <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
            <Plus className="h-4 w-4" /> New Adjustment
          </button>
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!data?.section.table.rows.length}>
            <Download className="h-4 w-4" /> Export
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
                <input type="text" placeholder={data?.section.searchPlaceholder || 'Search billing link, adjustment type, direction, amount, or applied date'} value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700">
                <Search className="h-4 w-4" /> Search
              </button>
            </form>
            <button type="button" onClick={() => { if (!isFilterPanelOpen) setDraftFilters({ ...filters }); setIsFilterPanelOpen((previous) => !previous); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isFilterPanelOpen || filterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}>
              <Filter className="h-4 w-4" /> Filters
              {filterCount > 0 ? <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{filterCount}</span> : null}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(data?.section.filters.quickFilters || []).map((filter) => (
              <button key={filter.value} type="button" onClick={() => handleToggleQuickFilter(filter.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${quickFilters.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
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
                  <p className="mt-1 text-sm text-gray-600">Select as many values as needed per group, then apply the filtered view.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => { setDraftFilters({ adjustmentTypes: [], directions: [] }); setFilters({ adjustmentTypes: [], directions: [] }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Clear all</button>
                  <button type="button" onClick={() => setIsFilterPanelOpen(false)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="button" onClick={() => { setFilters({ ...draftFilters }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button>
                </div>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Adjustment Type</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.section.filters.adjustmentTypes || []).map((option) => {
                      const selected = draftFilters.adjustmentTypes.includes(option.value);
                      return <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, adjustmentTypes: toggleFilterValue(previous.adjustmentTypes, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{option.label}</button>;
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Direction</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.section.filters.directions || []).map((option) => {
                      const selected = draftFilters.directions.includes(option.value);
                      return <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, directions: toggleFilterValue(previous.directions, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{option.label}</button>;
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">{data?.section.table.title || 'Billing Adjustment Register'}</h3>
              <p className="text-sm text-gray-600">{data?.section.table.description || 'Adjustment records aligned to accounting-billing-adjustments.'}</p>
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
                        {['Billing Link', 'Adjustment Type', 'Direction', 'Amount', 'Approved By', 'Applied At'].map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Amount' ? 'text-right' : 'text-left'}`}>{column}</th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {(data?.section.table.rows || []).length > 0 ? (data?.section.table.rows || []).map((row) => (
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
                              <button type="button" onClick={() => setDeleteTarget({ id: row.id, label: row.enrollmentBillingLinkLabel })} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700" title="Delete">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">No billing adjustment rows found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {data?.pagination && data.pagination.totalPages > 1 ? (
                <div className="flex items-center justify-between">
                  <button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button>
                  <span className="text-sm text-gray-600">Page {data.pagination.page} of {data.pagination.totalPages}</span>
                  <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* View Detail SlideOver */}
      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Billing Adjustment Detail" width="max-w-lg">
        {isViewLoading ? <LoadingSkeleton /> : viewDetail ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Billing Link"><Input value={viewDetail.enrollmentBillingLinkLabel} disabled onChange={() => {}} /></FormField>
              <FormField label="Adjustment Type"><Input value={viewDetail.adjustmentTypeLabel} disabled onChange={() => {}} /></FormField>
              <FormField label="Reason"><Input value={viewDetail.reason || '-'} disabled onChange={() => {}} /></FormField>
              <FormField label="Amount"><Input value={viewDetail.amountLabel} disabled onChange={() => {}} /></FormField>
              <FormField label="Direction"><Input value={viewDetail.directionLabel} disabled onChange={() => {}} /></FormField>
              <FormField label="Approved By"><Input value={viewDetail.approvedByLabel} disabled onChange={() => {}} /></FormField>
              <FormField label="Applied At"><Input value={viewDetail.appliedAtLabel} disabled onChange={() => {}} /></FormField>
              <FormField label="Notes"><Input value={viewDetail.notes || '-'} disabled onChange={() => {}} /></FormField>
            </div>
            <div className="flex justify-end border-t border-gray-200 pt-4">
              <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Close</button>
            </div>
          </div>
        ) : null}
      </SlideOver>

      {/* Create/Edit Form SlideOver */}
      <SlideOver
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? 'Edit Billing Adjustment' : 'New Billing Adjustment'}
        description={editingId ? 'Update the billing adjustment record.' : 'Create a new manual LMS billing adjustment.'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError ? <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{formError}</div> : null}

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Billing Link" required>
              <Select
                value={String(formState.enrollmentBillingLink || '')}
                onChange={(value) => setFormState((previous) => ({ ...previous, enrollmentBillingLink: value ? Number(value) : undefined }))}
                options={billingLinkOptions}
              />
            </FormField>
            <FormField label="Adjustment Type" required>
              <Select
                value={formState.adjustmentType || ''}
                onChange={(value) => setFormState((previous) => ({ ...previous, adjustmentType: value }))}
                options={[{ label: 'Select type', value: '' }, ...LMS_ADJUSTMENT_TYPE_OPTIONS]}
              />
            </FormField>
            <FormField label="Amount" required>
              <Input
                type="number"
                value={String(formState.amount ?? '')}
                onChange={(value) => setFormState((previous) => ({ ...previous, amount: Number(value) || 0 }))}
                placeholder="0.00"
              />
            </FormField>
            <FormField label="Direction" required>
              <Select
                value={formState.direction || 'increase'}
                onChange={(value) => setFormState((previous) => ({ ...previous, direction: value }))}
                options={LMS_ADJUSTMENT_DIRECTION_OPTIONS}
              />
            </FormField>
            <FormField label="Reason">
              <Input
                value={formState.reason || ''}
                onChange={(value) => setFormState((previous) => ({ ...previous, reason: value }))}
                placeholder="Reason for adjustment"
              />
            </FormField>
            <FormField label="Applied At">
              <Input
                type="date"
                value={toDateInputValue(formState.appliedAt || null)}
                onChange={(value) => setFormState((previous) => ({ ...previous, appliedAt: value }))}
              />
            </FormField>
            <FormField label="Notes">
              <TextArea
                value={formState.notes || ''}
                onChange={(value) => setFormState((previous) => ({ ...previous, notes: value }))}
                rows={2}
              />
            </FormField>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} disabled={isSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>
              {isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Adjustment'}
            </button>
          </div>
        </form>
      </SlideOver>

      {/* Delete Confirmation */}
      <SlideOver isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete Billing Adjustment" width="max-w-lg">
        <div className="space-y-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Delete billing adjustment for {deleteTarget?.label}?</p>
            <p className="mt-1">This action cannot be undone. The adjustment record will be permanently removed.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {isDeleting ? 'Deleting...' : 'Delete Adjustment'}
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}

// === Refunds & Credit Notes Tab ===

function RefundsTab() {
  const [data, setData] = useState<RefundsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<RefundFilterState>({ statuses: [], refundTypes: [] });
  const [draftFilters, setDraftFilters] = useState<RefundFilterState>({ statuses: [], refundTypes: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [viewDetail, setViewDetail] = useState<RefundDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [formState, setFormState] = useState<RefundMutationInput>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filterCount = filters.statuses.length + filters.refundTypes.length;

  const fetchData = useCallback(async ({
    search, page, nextFilters, nextQuickFilters,
  }: {
    search: string; page: number; nextFilters: RefundFilterState; nextQuickFilters: string[];
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getRefunds({
        search, page,
        statuses: nextFilters.statuses,
        refundTypes: nextFilters.refundTypes,
        quickFilters: nextQuickFilters,
      });
      setData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load refunds.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  }, [currentPage, fetchData, filters, quickFilters, submittedSearch]);

  const referenceData = data?.referenceData;

  const billingLinkOptions = useMemo(
    () => [
      { label: 'Select a billing link', value: '' },
      ...(referenceData?.enrollmentBillingLinks || []).map((link) => ({
        label: link.sourceReference || `Link #${link.id}`,
        value: String(link.id),
      })),
    ],
    [referenceData?.enrollmentBillingLinks],
  );

  const invoiceOptions = useMemo(
    () => [
      { label: 'Select an invoice', value: '' },
      ...(referenceData?.invoices || []).map((inv) => ({
        label: `${inv.invoiceNumber || `Invoice ${inv.id}`} • ${formatCurrency(inv.balanceDue)}`,
        value: String(inv.id),
      })),
    ],
    [referenceData?.invoices],
  );

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput);
    setCurrentPage(1);
    void fetchData({ search: searchInput, page: 1, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleRefresh = () => {
    void fetchData({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleExport = () => {
    const rows = data?.section.table.rows || [];
    if (!rows.length) return;
    const headers = ['Refund Number', 'Billing Link', 'Invoice', 'Approved Amount', 'Credit Note', 'Status'];
    const csvRows = rows.map((row) => [
      row.refundNumber,
      row.enrollmentBillingLinkLabel,
      row.invoiceLabel,
      row.approvedAmountLabel,
      row.creditNoteLabel,
      row.statusLabel,
    ]);
    const csvContent = [headers, ...csvRows].map((r) => r.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'refunds-credit-notes.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleToggleQuickFilter = (value: string) => {
    setQuickFilters((previous) => toggleFilterValue(previous, value));
    setCurrentPage(1);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormError(null);
    setFormState({
      refundType: 'partial',
      requestedAmount: 0,
      approvedAmount: null,
      currency: 'PHP',
      status: 'draft',
      refundReason: '',
      notes: '',
      refundDate: new Date().toISOString().slice(0, 10),
    });
    setIsFormOpen(true);
  };

  const handleView = async (id: string) => {
    setIsViewOpen(true);
    setIsViewLoading(true);
    setViewDetail(null);
    try {
      const detail = await getRefundDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load refund detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleOpenEdit = async (id: string) => {
    setEditingId(id);
    setFormError(null);
    setIsFormOpen(true);
    setIsViewLoading(true);
    try {
      const detail = await getRefundDetail(id);
      setFormState({
        enrollmentBillingLink: detail.enrollmentBillingLinkId ? Number(detail.enrollmentBillingLinkId) : undefined,
        invoice: detail.invoiceId ? Number(detail.invoiceId) : undefined,
        refundDate: detail.refundDate,
        refundReason: detail.refundReason || null,
        refundType: detail.refundType || 'partial',
        requestedAmount: detail.requestedAmount,
        approvedAmount: detail.approvedAmount,
        currency: detail.currency || 'PHP',
        status: detail.status || 'draft',
        notes: detail.notes || null,
      });
    } catch (detailError) {
      setFormError(detailError instanceof Error ? detailError.message : 'Unable to load refund detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const refreshCurrentView = async () => {
    await fetchData({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (editingId) {
        await updateRefund(editingId, formState);
      } else {
        await createRefund(formState);
      }
      setIsFormOpen(false);
      await refreshCurrentView();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Unable to save refund.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteRefund(deleteTarget.id);
      setDeleteTarget(null);
      await refreshCurrentView();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete refund.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">{data?.section.label || 'Refunds & Credit Notes'}</h2>
          <p className="text-sm text-gray-600">{data?.section.description || 'LMS refund workflow records linked to invoices, payments, and credit notes.'}</p>
          <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
            <Plus className="h-4 w-4" /> New Refund
          </button>
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!data?.section.table.rows.length}>
            <Download className="h-4 w-4" /> Export
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
                <input type="text" placeholder={data?.section.searchPlaceholder || 'Search refund number, billing link, invoice, or status'} value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700">
                <Search className="h-4 w-4" /> Search
              </button>
            </form>
            <button type="button" onClick={() => { if (!isFilterPanelOpen) setDraftFilters({ ...filters }); setIsFilterPanelOpen((previous) => !previous); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isFilterPanelOpen || filterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}>
              <Filter className="h-4 w-4" /> Filters
              {filterCount > 0 ? <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{filterCount}</span> : null}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(data?.section.filters.quickFilters || []).map((filter) => (
              <button key={filter.value} type="button" onClick={() => handleToggleQuickFilter(filter.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${quickFilters.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
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
                  <p className="mt-1 text-sm text-gray-600">Select as many values as needed per group, then apply the filtered view.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => { setDraftFilters({ statuses: [], refundTypes: [] }); setFilters({ statuses: [], refundTypes: [] }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Clear all</button>
                  <button type="button" onClick={() => setIsFilterPanelOpen(false)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="button" onClick={() => { setFilters({ ...draftFilters }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button>
                </div>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.section.filters.statuses || LMS_REFUND_STATUS_OPTIONS).map((option) => {
                      const optValue = typeof option === 'string' ? option : option.value;
                      const optLabel = typeof option === 'string' ? option : option.label;
                      const selected = draftFilters.statuses.includes(optValue);
                      return <button key={optValue} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, optValue) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{optLabel}</button>;
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Refund Type</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.section.filters.refundTypes || LMS_REFUND_TYPE_OPTIONS).map((option) => {
                      const optValue = typeof option === 'string' ? option : option.value;
                      const optLabel = typeof option === 'string' ? option : option.label;
                      const selected = draftFilters.refundTypes.includes(optValue);
                      return <button key={optValue} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, refundTypes: toggleFilterValue(previous.refundTypes, optValue) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{optLabel}</button>;
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">{data?.section.table.title || 'Refund And Credit Note Register'}</h3>
              <p className="text-sm text-gray-600">{data?.section.table.description || 'Refund records aligned to accounting-refunds.'}</p>
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
                        {['Refund Number', 'Billing Link', 'Invoice', 'Approved Amount', 'Credit Note', 'Status'].map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Approved Amount' ? 'text-right' : 'text-left'}`}>{column}</th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {(data?.section.table.rows || []).length > 0 ? (data?.section.table.rows || []).map((row) => (
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
                              <button type="button" onClick={() => setDeleteTarget({ id: row.id, label: row.refundNumber })} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700" title="Delete">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">No refund rows found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {data?.pagination && data.pagination.totalPages > 1 ? (
                <div className="flex items-center justify-between">
                  <button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button>
                  <span className="text-sm text-gray-600">Page {data.pagination.page} of {data.pagination.totalPages}</span>
                  <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* View Detail SlideOver */}
      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Refund Detail" width="max-w-lg">
        {isViewLoading ? <LoadingSkeleton /> : viewDetail ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Refund Number"><Input value={viewDetail.refundNumber} disabled onChange={() => {}} /></FormField>
              <FormField label="Billing Link"><Input value={viewDetail.enrollmentBillingLinkLabel} disabled onChange={() => {}} /></FormField>
              <FormField label="Invoice"><Input value={viewDetail.invoiceLabel} disabled onChange={() => {}} /></FormField>
              <FormField label="Refund Date"><Input value={viewDetail.refundDateLabel} disabled onChange={() => {}} /></FormField>
              <FormField label="Refund Type"><Input value={viewDetail.refundTypeLabel} disabled onChange={() => {}} /></FormField>
              <FormField label="Requested Amount"><Input value={viewDetail.requestedAmountLabel} disabled onChange={() => {}} /></FormField>
              <FormField label="Approved Amount"><Input value={viewDetail.approvedAmountLabel} disabled onChange={() => {}} /></FormField>
              <FormField label="Status"><Input value={viewDetail.statusLabel} disabled onChange={() => {}} /></FormField>
              <FormField label="Refund Reason"><Input value={viewDetail.refundReason || '-'} disabled onChange={() => {}} /></FormField>
              <FormField label="Credit Note"><Input value={viewDetail.creditNoteLabel || '-'} disabled onChange={() => {}} /></FormField>
              <FormField label="Notes"><Input value={viewDetail.notes || '-'} disabled onChange={() => {}} /></FormField>
            </div>
            <div className="flex justify-end border-t border-gray-200 pt-4">
              <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Close</button>
            </div>
          </div>
        ) : null}
      </SlideOver>

      {/* Create/Edit Form SlideOver */}
      <SlideOver
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? 'Edit Refund' : 'New Refund'}
        description={editingId ? 'Update the refund record.' : 'Create a new LMS refund record.'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError ? <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{formError}</div> : null}

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Billing Link">
              <Select
                value={String(formState.enrollmentBillingLink || '')}
                onChange={(value) => setFormState((previous) => ({ ...previous, enrollmentBillingLink: value ? Number(value) : undefined }))}
                options={billingLinkOptions}
              />
            </FormField>
            <FormField label="Invoice">
              <Select
                value={String(formState.invoice || '')}
                onChange={(value) => setFormState((previous) => ({ ...previous, invoice: value ? Number(value) : undefined }))}
                options={invoiceOptions}
              />
            </FormField>
            <FormField label="Refund Type" required>
              <Select
                value={formState.refundType || 'partial'}
                onChange={(value) => setFormState((previous) => ({ ...previous, refundType: value }))}
                options={LMS_REFUND_TYPE_OPTIONS}
              />
            </FormField>
            <FormField label="Status" required>
              <Select
                value={formState.status || 'draft'}
                onChange={(value) => setFormState((previous) => ({ ...previous, status: value }))}
                options={LMS_REFUND_STATUS_OPTIONS}
              />
            </FormField>
            <FormField label="Requested Amount" required>
              <Input
                type="number"
                value={String(formState.requestedAmount ?? '')}
                onChange={(value) => setFormState((previous) => ({ ...previous, requestedAmount: Number(value) || 0 }))}
                placeholder="0.00"
              />
            </FormField>
            <FormField label="Approved Amount">
              <Input
                type="number"
                value={formState.approvedAmount != null ? String(formState.approvedAmount) : ''}
                onChange={(value) => setFormState((previous) => ({ ...previous, approvedAmount: value ? Number(value) : null }))}
                placeholder="0.00"
              />
            </FormField>
            <FormField label="Refund Date">
              <Input
                type="date"
                value={toDateInputValue(formState.refundDate || null)}
                onChange={(value) => setFormState((previous) => ({ ...previous, refundDate: value }))}
              />
            </FormField>
            <FormField label="Currency">
              <Input
                value={formState.currency || 'PHP'}
                onChange={(value) => setFormState((previous) => ({ ...previous, currency: value }))}
                placeholder="PHP"
              />
            </FormField>
            <FormField label="Refund Reason">
              <Input
                value={formState.refundReason || ''}
                onChange={(value) => setFormState((previous) => ({ ...previous, refundReason: value }))}
                placeholder="Reason for refund"
              />
            </FormField>
            <FormField label="Notes">
              <TextArea
                value={formState.notes || ''}
                onChange={(value) => setFormState((previous) => ({ ...previous, notes: value }))}
                rows={2}
              />
            </FormField>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} disabled={isSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>
              {isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Refund'}
            </button>
          </div>
        </form>
      </SlideOver>

      {/* Delete Confirmation */}
      <SlideOver isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete Refund" width="max-w-lg">
        <div className="space-y-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Delete refund {deleteTarget?.label}?</p>
            <p className="mt-1">This action cannot be undone. The refund record will be permanently removed.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {isDeleting ? 'Deleting...' : 'Delete Refund'}
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}

// === Deferred Revenue Schedules Tab ===

function RevenueSchedulesTab() {
  const [data, setData] = useState<RevenueSchedulesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<RevenueScheduleFilterState>({ statuses: [], recognitionMethods: [] });
  const [draftFilters, setDraftFilters] = useState<RevenueScheduleFilterState>({ statuses: [], recognitionMethods: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [viewDetail, setViewDetail] = useState<RevenueScheduleDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [formState, setFormState] = useState<RevenueScheduleMutationInput>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filterCount = filters.statuses.length + filters.recognitionMethods.length;

  const fetchData = useCallback(async ({
    search, page, nextFilters, nextQuickFilters,
  }: {
    search: string; page: number; nextFilters: RevenueScheduleFilterState; nextQuickFilters: string[];
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getRevenueSchedules({
        search, page,
        statuses: nextFilters.statuses,
        recognitionMethods: nextFilters.recognitionMethods,
        quickFilters: nextQuickFilters,
      });
      setData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load revenue schedules.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  }, [currentPage, fetchData, filters, quickFilters, submittedSearch]);

  const referenceData = data?.referenceData;

  const billingLinkOptions = useMemo(
    () => [
      { label: 'Select a billing link', value: '' },
      ...(referenceData?.enrollmentBillingLinks || []).map((link) => ({
        label: link.sourceReference || `Link #${link.id}`,
        value: String(link.id),
      })),
    ],
    [referenceData?.enrollmentBillingLinks],
  );

  const invoiceOptions = useMemo(
    () => [
      { label: 'Select an invoice', value: '' },
      ...(referenceData?.invoices || []).map((inv) => ({
        label: `${inv.invoiceNumber || `Invoice ${inv.id}`} • ${formatCurrency(inv.total)}`,
        value: String(inv.id),
      })),
    ],
    [referenceData?.invoices],
  );

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput);
    setCurrentPage(1);
    void fetchData({ search: searchInput, page: 1, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleRefresh = () => {
    void fetchData({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleExport = () => {
    const rows = data?.section.table.rows || [];
    if (!rows.length) return;
    const headers = ['Invoice', 'Billing Link', 'Method', 'Start Date', 'End Date', 'Total Deferred', 'Remaining', 'Status'];
    const csvRows = rows.map((row) => [
      row.invoiceNumber,
      row.enrollmentBillingLinkLabel,
      row.recognitionMethodLabel,
      row.startDateLabel,
      row.endDateLabel,
      row.totalDeferredLabel,
      row.remainingDeferredLabel,
      row.statusLabel,
    ]);
    const csvContent = [headers, ...csvRows].map((r) => r.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'deferred-revenue-schedules.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleToggleQuickFilter = (value: string) => {
    setQuickFilters((previous) => toggleFilterValue(previous, value));
    setCurrentPage(1);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormError(null);
    setFormState({
      recognitionMethod: 'on_activation',
      totalDeferredAmount: 0,
      recognizedAmount: 0,
      remainingDeferredAmount: 0,
      status: 'draft',
      startDate: '',
      endDate: '',
      notes: '',
    });
    setIsFormOpen(true);
  };

  const handleView = async (id: string) => {
    setIsViewOpen(true);
    setIsViewLoading(true);
    setViewDetail(null);
    try {
      const detail = await getRevenueScheduleDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load revenue schedule detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleOpenEdit = async (id: string) => {
    setEditingId(id);
    setFormError(null);
    setIsFormOpen(true);
    setIsViewLoading(true);
    try {
      const detail = await getRevenueScheduleDetail(id);
      setFormState({
        invoice: detail.invoiceId ? Number(detail.invoiceId) : undefined,
        enrollmentBillingLink: detail.enrollmentBillingLinkId ? Number(detail.enrollmentBillingLinkId) : undefined,
        recognitionMethod: detail.recognitionMethod || 'on_activation',
        startDate: detail.startDate,
        endDate: detail.endDate,
        totalDeferredAmount: detail.totalDeferredAmount,
        recognizedAmount: detail.recognizedAmount,
        remainingDeferredAmount: detail.remainingDeferredAmount,
        status: detail.status || 'draft',
        notes: detail.notes || null,
      });
    } catch (detailError) {
      setFormError(detailError instanceof Error ? detailError.message : 'Unable to load revenue schedule detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const refreshCurrentView = async () => {
    await fetchData({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (editingId) {
        await updateRevenueSchedule(editingId, formState);
      } else {
        await createRevenueSchedule(formState);
      }
      setIsFormOpen(false);
      await refreshCurrentView();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Unable to save revenue schedule.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteRevenueSchedule(deleteTarget.id);
      setDeleteTarget(null);
      await refreshCurrentView();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete revenue schedule.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">{data?.section.label || 'Deferred Revenue Schedules'}</h2>
          <p className="text-sm text-gray-600">{data?.section.description || 'Deferred revenue recognition schedules tied to LMS invoices and billing links.'}</p>
          <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
            <Plus className="h-4 w-4" /> New Schedule
          </button>
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!data?.section.table.rows.length}>
            <Download className="h-4 w-4" /> Export
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
                <input type="text" placeholder={data?.section.searchPlaceholder || 'Search invoice, billing link, method, status, or amount'} value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700">
                <Search className="h-4 w-4" /> Search
              </button>
            </form>
            <button type="button" onClick={() => { if (!isFilterPanelOpen) setDraftFilters({ ...filters }); setIsFilterPanelOpen((previous) => !previous); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isFilterPanelOpen || filterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}>
              <Filter className="h-4 w-4" /> Filters
              {filterCount > 0 ? <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{filterCount}</span> : null}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(data?.section.filters.quickFilters || []).map((filter) => (
              <button key={filter.value} type="button" onClick={() => handleToggleQuickFilter(filter.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${quickFilters.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
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
                  <p className="mt-1 text-sm text-gray-600">Select as many values as needed per group, then apply the filtered view.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => { setDraftFilters({ statuses: [], recognitionMethods: [] }); setFilters({ statuses: [], recognitionMethods: [] }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Clear all</button>
                  <button type="button" onClick={() => setIsFilterPanelOpen(false)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="button" onClick={() => { setFilters({ ...draftFilters }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button>
                </div>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.section.filters.statuses || LMS_RECOGNITION_STATUS_OPTIONS).map((option) => {
                      const optValue = typeof option === 'string' ? option : option.value;
                      const optLabel = typeof option === 'string' ? option : option.label;
                      const selected = draftFilters.statuses.includes(optValue);
                      return <button key={optValue} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, optValue) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{optLabel}</button>;
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Recognition Method</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.section.filters.recognitionMethods || LMS_RECOGNITION_METHOD_OPTIONS).map((option) => {
                      const optValue = typeof option === 'string' ? option : option.value;
                      const optLabel = typeof option === 'string' ? option : option.label;
                      const selected = draftFilters.recognitionMethods.includes(optValue);
                      return <button key={optValue} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, recognitionMethods: toggleFilterValue(previous.recognitionMethods, optValue) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{optLabel}</button>;
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">{data?.section.table.title || 'Deferred Revenue Schedule Register'}</h3>
              <p className="text-sm text-gray-600">{data?.section.table.description || 'Schedule records aligned to revenue-recognition-schedules.'}</p>
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
                        {['Invoice', 'Billing Link', 'Recognition Method', 'Start Date', 'End Date', 'Total Deferred', 'Remaining', 'Status'].map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Total Deferred' || column === 'Remaining' ? 'text-right' : 'text-left'}`}>{column}</th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {(data?.section.table.rows || []).length > 0 ? (data?.section.table.rows || []).map((row) => (
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
                              <button type="button" onClick={() => setDeleteTarget({ id: row.id, label: `${row.invoiceNumber} — ${row.enrollmentBillingLinkLabel}` })} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700" title="Delete">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-500">No revenue schedule rows found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {data?.pagination && data.pagination.totalPages > 1 ? (
                <div className="flex items-center justify-between">
                  <button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button>
                  <span className="text-sm text-gray-600">Page {data.pagination.page} of {data.pagination.totalPages}</span>
                  <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* View Detail SlideOver */}
      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Revenue Schedule Detail" width="max-w-lg">
        {isViewLoading ? <LoadingSkeleton /> : viewDetail ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Invoice"><Input value={viewDetail.invoiceNumber} disabled onChange={() => {}} /></FormField>
              <FormField label="Billing Link"><Input value={viewDetail.enrollmentBillingLinkLabel} disabled onChange={() => {}} /></FormField>
              <FormField label="Recognition Method"><Input value={viewDetail.recognitionMethodLabel} disabled onChange={() => {}} /></FormField>
              <FormField label="Start Date"><Input value={viewDetail.startDateLabel} disabled onChange={() => {}} /></FormField>
              <FormField label="End Date"><Input value={viewDetail.endDateLabel} disabled onChange={() => {}} /></FormField>
              <FormField label="Total Deferred"><Input value={viewDetail.totalDeferredLabel} disabled onChange={() => {}} /></FormField>
              <FormField label="Recognized"><Input value={viewDetail.recognizedLabel} disabled onChange={() => {}} /></FormField>
              <FormField label="Remaining"><Input value={viewDetail.remainingDeferredLabel} disabled onChange={() => {}} /></FormField>
              <FormField label="Status"><Input value={viewDetail.statusLabel} disabled onChange={() => {}} /></FormField>
              <FormField label="Notes"><Input value={viewDetail.notes || '-'} disabled onChange={() => {}} /></FormField>
            </div>
            <div className="flex justify-end border-t border-gray-200 pt-4">
              <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Close</button>
            </div>
          </div>
        ) : null}
      </SlideOver>

      {/* Create/Edit Form SlideOver */}
      <SlideOver
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? 'Edit Revenue Schedule' : 'New Revenue Schedule'}
        description={editingId ? 'Update the revenue recognition schedule.' : 'Create a new deferred revenue recognition schedule.'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError ? <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{formError}</div> : null}

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Invoice" required>
              <Select
                value={String(formState.invoice || '')}
                onChange={(value) => setFormState((previous) => ({ ...previous, invoice: value ? Number(value) : undefined }))}
                options={invoiceOptions}
              />
            </FormField>
            <FormField label="Billing Link" required>
              <Select
                value={String(formState.enrollmentBillingLink || '')}
                onChange={(value) => setFormState((previous) => ({ ...previous, enrollmentBillingLink: value ? Number(value) : undefined }))}
                options={billingLinkOptions}
              />
            </FormField>
            <FormField label="Recognition Method" required>
              <Select
                value={formState.recognitionMethod || 'on_activation'}
                onChange={(value) => setFormState((previous) => ({ ...previous, recognitionMethod: value }))}
                options={LMS_RECOGNITION_METHOD_OPTIONS}
              />
            </FormField>
            <FormField label="Status" required>
              <Select
                value={formState.status || 'draft'}
                onChange={(value) => setFormState((previous) => ({ ...previous, status: value }))}
                options={LMS_RECOGNITION_STATUS_OPTIONS}
              />
            </FormField>
            <FormField label="Start Date" required>
              <Input
                type="date"
                value={toDateInputValue(formState.startDate || null)}
                onChange={(value) => setFormState((previous) => ({ ...previous, startDate: value }))}
              />
            </FormField>
            <FormField label="End Date" required>
              <Input
                type="date"
                value={toDateInputValue(formState.endDate || null)}
                onChange={(value) => setFormState((previous) => ({ ...previous, endDate: value }))}
              />
            </FormField>
            <FormField label="Total Deferred Amount">
              <Input
                type="number"
                value={String(formState.totalDeferredAmount ?? '')}
                onChange={(value) => setFormState((previous) => ({ ...previous, totalDeferredAmount: Number(value) || 0 }))}
                placeholder="0.00"
              />
            </FormField>
            <FormField label="Recognized Amount">
              <Input
                type="number"
                value={String(formState.recognizedAmount ?? '')}
                onChange={(value) => setFormState((previous) => ({ ...previous, recognizedAmount: Number(value) || 0 }))}
                placeholder="0.00"
              />
            </FormField>
            <FormField label="Remaining Deferred Amount">
              <Input
                type="number"
                value={String(formState.remainingDeferredAmount ?? '')}
                onChange={(value) => setFormState((previous) => ({ ...previous, remainingDeferredAmount: Number(value) || 0 }))}
                placeholder="0.00"
              />
            </FormField>
            <FormField label="Notes">
              <TextArea
                value={formState.notes || ''}
                onChange={(value) => setFormState((previous) => ({ ...previous, notes: value }))}
                rows={2}
              />
            </FormField>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} disabled={isSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>
              {isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Schedule'}
            </button>
          </div>
        </form>
      </SlideOver>

      {/* Delete Confirmation */}
      <SlideOver isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete Revenue Schedule" width="max-w-lg">
        <div className="space-y-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Delete revenue schedule for {deleteTarget?.label}?</p>
            <p className="mt-1">This action cannot be undone. The schedule record will be permanently removed.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {isDeleting ? 'Deleting...' : 'Delete Schedule'}
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}

// === Certificate Charges Tab ===

function CertificateChargesTab() {
  const [data, setData] = useState<CertificateChargesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [filters, setFilters] = useState<BillingAdjustmentFilterState>({ adjustmentTypes: [], directions: [] });
  const [draftFilters, setDraftFilters] = useState<BillingAdjustmentFilterState>({ adjustmentTypes: [], directions: [] });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [viewDetail, setViewDetail] = useState<BillingAdjustmentDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [formState, setFormState] = useState<BillingAdjustmentMutationInput>({
    adjustmentType: 'certificate_fee',
    amount: 0,
    direction: 'increase',
    reason: '',
    notes: '',
    appliedAt: new Date().toISOString().slice(0, 10),
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filterCount = filters.adjustmentTypes.length + filters.directions.length;

  const fetchData = useCallback(async ({
    search, page, nextFilters, nextQuickFilters,
  }: {
    search: string; page: number; nextFilters: BillingAdjustmentFilterState; nextQuickFilters: string[];
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getCertificateCharges({
        search, page,
        adjustmentTypes: nextFilters.adjustmentTypes,
        directions: nextFilters.directions,
        quickFilters: nextQuickFilters,
      });
      if (response?.section?.table?.rows) {
        response.section.table.rows = response.section.table.rows.map((row) => ({
          ...row,
          cells: [
            row.cells[0],
            row.cells[1],
            row.reason || '-',
            row.cells[3],
            row.cells[4],
            row.cells[5],
          ],
        })) as typeof response.section.table.rows;
        response.section.table.columns = ['Billing Link', 'Adjustment Type', 'Reason', 'Amount', 'Approved By', 'Applied At'];
      }
      setData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load certificate charges.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  }, [currentPage, fetchData, filters, quickFilters, submittedSearch]);

  const referenceData = data?.referenceData;

  const billingLinkOptions = useMemo(
    () => [
      { label: 'Select a billing link', value: '' },
      ...(referenceData?.enrollmentBillingLinks || []).map((link) => ({
        label: link.sourceReference || `Link #${link.id}`,
        value: String(link.id),
      })),
    ],
    [referenceData?.enrollmentBillingLinks],
  );

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput);
    setCurrentPage(1);
    void fetchData({ search: searchInput, page: 1, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleRefresh = () => {
    void fetchData({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleExport = () => {
    const rows = data?.section.table.rows || [];
    if (!rows.length) return;
    const headers = ['Billing Link', 'Adjustment Type', 'Reason', 'Amount', 'Approved By', 'Applied At'];
    const csvRows = rows.map((row) => [
      row.enrollmentBillingLinkLabel,
      row.adjustmentTypeLabel,
      row.reason || '',
      row.amountLabel,
      row.approvedByLabel,
      row.appliedAtLabel,
    ]);
    const csvContent = [headers, ...csvRows].map((r) => r.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'certificate-charges.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleToggleQuickFilter = (value: string) => {
    setQuickFilters((previous) => toggleFilterValue(previous, value));
    setCurrentPage(1);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormError(null);
    setFormState({
      adjustmentType: 'certificate_fee',
      amount: 0,
      direction: 'increase',
      reason: '',
      notes: '',
      appliedAt: new Date().toISOString().slice(0, 10),
    });
    setIsFormOpen(true);
  };

  const handleView = async (id: string) => {
    setIsViewOpen(true);
    setIsViewLoading(true);
    setViewDetail(null);
    try {
      const detail = await getBillingAdjustmentDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load certificate charge detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleOpenEdit = async (id: string) => {
    setEditingId(id);
    setFormError(null);
    setIsFormOpen(true);
    setIsViewLoading(true);
    try {
      const detail = await getBillingAdjustmentDetail(id);
      setFormState({
        enrollmentBillingLink: Number(detail.enrollmentBillingLinkId) || undefined,
        adjustmentType: 'certificate_fee',
        reason: detail.reason || null,
        amount: detail.amount,
        direction: detail.direction || 'increase',
        approvedBy: detail.approvedById ? Number(detail.approvedById) : null,
        appliedAt: detail.appliedAt,
        notes: detail.notes || null,
      });
    } catch (detailError) {
      setFormError(detailError instanceof Error ? detailError.message : 'Unable to load certificate charge detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const refreshCurrentView = async () => {
    await fetchData({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (editingId) {
        await updateBillingAdjustment(editingId, formState);
      } else {
        await createBillingAdjustment(formState);
      }
      setIsFormOpen(false);
      await refreshCurrentView();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Unable to save certificate charge.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteBillingAdjustment(deleteTarget.id);
      setDeleteTarget(null);
      await refreshCurrentView();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete certificate charge.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">{data?.section.label || 'Certificate Charges'}</h2>
          <p className="text-sm text-gray-600">{data?.section.description || 'Review certificate fee charges created through LMS certificate monetization.'}</p>
          <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
            <Plus className="h-4 w-4" /> New Charge
          </button>
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!data?.section.table.rows.length}>
            <Download className="h-4 w-4" /> Export
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
                <input type="text" placeholder={data?.section.searchPlaceholder || 'Search billing link, certificate fee, amount, or applied date'} value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700">
                <Search className="h-4 w-4" /> Search
              </button>
            </form>
            <button type="button" onClick={() => { if (!isFilterPanelOpen) setDraftFilters({ ...filters }); setIsFilterPanelOpen((previous) => !previous); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isFilterPanelOpen || filterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}>
              <Filter className="h-4 w-4" /> Filters
              {filterCount > 0 ? <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{filterCount}</span> : null}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(data?.section.filters.quickFilters || []).map((filter) => (
              <button key={filter.value} type="button" onClick={() => handleToggleQuickFilter(filter.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${quickFilters.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
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
                  <p className="mt-1 text-sm text-gray-600">Select as many values as needed per group, then apply the filtered view.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => { setDraftFilters({ adjustmentTypes: [], directions: [] }); setFilters({ adjustmentTypes: [], directions: [] }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Clear all</button>
                  <button type="button" onClick={() => setIsFilterPanelOpen(false)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="button" onClick={() => { setFilters({ ...draftFilters }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button>
                </div>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Adjustment Type</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.section.filters.adjustmentTypes || LMS_ADJUSTMENT_TYPE_OPTIONS).map((option) => {
                      const optValue = typeof option === 'string' ? option : option.value;
                      const optLabel = typeof option === 'string' ? option : option.label;
                      const selected = draftFilters.adjustmentTypes.includes(optValue);
                      return <button key={optValue} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, adjustmentTypes: toggleFilterValue(previous.adjustmentTypes, optValue) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{optLabel}</button>;
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Direction</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.section.filters.directions || LMS_ADJUSTMENT_DIRECTION_OPTIONS).map((option) => {
                      const optValue = typeof option === 'string' ? option : option.value;
                      const optLabel = typeof option === 'string' ? option : option.label;
                      const selected = draftFilters.directions.includes(optValue);
                      return <button key={optValue} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, directions: toggleFilterValue(previous.directions, optValue) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{optLabel}</button>;
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">{data?.section.table.title || 'Certificate Charge Register'}</h3>
              <p className="text-sm text-gray-600">{data?.section.table.description || 'Certificate-charge view grounded in certificate monetization records.'}</p>
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
                        {['Billing Link', 'Adjustment Type', 'Reason', 'Amount', 'Approved By', 'Applied At'].map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Amount' ? 'text-right' : 'text-left'}`}>{column}</th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {(data?.section.table.rows || []).length > 0 ? (data?.section.table.rows || []).map((row) => (
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
                              <button type="button" onClick={() => setDeleteTarget({ id: row.id, label: row.enrollmentBillingLinkLabel })} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700" title="Delete">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">No certificate charge rows found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {data?.pagination && data.pagination.totalPages > 1 ? (
                <div className="flex items-center justify-between">
                  <button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button>
                  <span className="text-sm text-gray-600">Page {data.pagination.page} of {data.pagination.totalPages}</span>
                  <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Certificate Charge Detail" width="max-w-lg">
        {isViewLoading ? <LoadingSkeleton /> : viewDetail ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Billing Link"><Input value={viewDetail.enrollmentBillingLinkLabel} disabled onChange={() => {}} /></FormField>
              <FormField label="Adjustment Type"><Input value={viewDetail.adjustmentTypeLabel} disabled onChange={() => {}} /></FormField>
              <FormField label="Reason"><Input value={viewDetail.reason || '-'} disabled onChange={() => {}} /></FormField>
              <FormField label="Amount"><Input value={viewDetail.amountLabel} disabled onChange={() => {}} /></FormField>
              <FormField label="Direction"><Input value={viewDetail.directionLabel} disabled onChange={() => {}} /></FormField>
              <FormField label="Approved By"><Input value={viewDetail.approvedByLabel} disabled onChange={() => {}} /></FormField>
              <FormField label="Applied At"><Input value={viewDetail.appliedAtLabel} disabled onChange={() => {}} /></FormField>
              <FormField label="Notes"><Input value={viewDetail.notes || '-'} disabled onChange={() => {}} /></FormField>
            </div>
            <div className="flex justify-end border-t border-gray-200 pt-4">
              <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Close</button>
            </div>
          </div>
        ) : null}
      </SlideOver>

      <SlideOver
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? 'Edit Certificate Charge' : 'New Certificate Charge'}
        description={editingId ? 'Update the certificate charge record.' : 'Create a new certificate fee charge on an enrollment billing link.'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError ? <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{formError}</div> : null}

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Billing Link" required>
              <Select
                value={String(formState.enrollmentBillingLink || '')}
                onChange={(value) => setFormState((previous) => ({ ...previous, enrollmentBillingLink: value ? Number(value) : undefined }))}
                options={billingLinkOptions}
              />
            </FormField>
            <FormField label="Amount" required>
              <Input
                type="number"
                value={String(formState.amount ?? '')}
                onChange={(value) => setFormState((previous) => ({ ...previous, amount: Number(value) || 0 }))}
                placeholder="0.00"
              />
            </FormField>
            <FormField label="Reason">
              <Input
                value={formState.reason || ''}
                onChange={(value) => setFormState((previous) => ({ ...previous, reason: value }))}
                placeholder="Reason for certificate charge"
              />
            </FormField>
            <FormField label="Applied At">
              <Input
                type="date"
                value={toDateInputValue(formState.appliedAt || null)}
                onChange={(value) => setFormState((previous) => ({ ...previous, appliedAt: value }))}
              />
            </FormField>
            <FormField label="Notes">
              <TextArea
                value={formState.notes || ''}
                onChange={(value) => setFormState((previous) => ({ ...previous, notes: value }))}
                rows={2}
              />
            </FormField>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} disabled={isSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>
              {isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Charge'}
            </button>
          </div>
        </form>
      </SlideOver>

      <SlideOver isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete Certificate Charge" width="max-w-lg">
        <div className="space-y-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Delete certificate charge for {deleteTarget?.label}?</p>
            <p className="mt-1">This action cannot be undone. The charge record will be permanently removed.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {isDeleting ? 'Deleting...' : 'Delete Charge'}
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}

// === Main Component ===

export function AdjustmentsRevenueCarryingClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = (['billing-adjustments', 'refunds-credit-notes', 'deferred-revenue-schedules', 'certificate-charges'] as TabId[]).find((id) => id === rawTab) || 'billing-adjustments';

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">LMS Finance / LMS Billing & Collections</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Adjustments & Revenue Carrying</h1>
          <p className="mt-1 text-base text-gray-600">Review LMS billing adjustments, refund outcomes, deferred revenue schedules, and certificate-linked billing charges carried into accounting.</p>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {[
            { id: 'billing-adjustments' as TabId, label: 'Billing Adjustments' },
            { id: 'refunds-credit-notes' as TabId, label: 'Refunds & Credit Notes' },
            { id: 'deferred-revenue-schedules' as TabId, label: 'Deferred Revenue Schedules' },
            { id: 'certificate-charges' as TabId, label: 'Certificate Charges' },
          ].map((tab) => {
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

      <div className="mt-6">
        {activeTab === 'refunds-credit-notes' ? <RefundsTab /> : activeTab === 'deferred-revenue-schedules' ? <RevenueSchedulesTab /> : activeTab === 'certificate-charges' ? <CertificateChargesTab /> : <BillingAdjustmentsTab />}
      </div>
    </div>
  );
}
