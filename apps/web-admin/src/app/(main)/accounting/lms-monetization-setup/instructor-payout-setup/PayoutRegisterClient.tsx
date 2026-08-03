'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import {
  createPayout,
  deletePayout,
  getPayoutDetail,
  getPayouts,
  postPayoutAction,
  updatePayout,
  type PayoutRegisterCell,
  type PayoutRegisterDetail,
  type PayoutRegisterMetric,
  type PayoutRegisterMutationInput,
  type PayoutRegisterResponse,
  type PayoutRegisterRow,
} from './actions-instructor-payouts';

type PayoutFilterState = { statuses: string[] };
type PayoutFormState = {
  instructor: string;
  course: string;
  periodStart: string;
  periodEnd: string;
  sourceReference: string;
  calculatedAmount: string;
  approvedAmount: string;
  status: string;
  notes: string;
};
type PayoutActionTarget = {
  id: string;
  label: string;
  action: 'calculate' | 'approve' | 'pay' | 'void';
};

const MUTABLE_STATUSES = new Set(['draft', 'calculated', 'approved']);

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 dark:border-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800';
  if (variant === 'ghost') return 'border border-transparent bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-300';
  return 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800';
}

function getMetricTone(trend: PayoutRegisterMetric['trend']) {
  if (trend === 'down') return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30';
  if (trend === 'neutral') return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
  return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30';
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

function createEmptyPayoutForm(): PayoutFormState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    instructor: '',
    course: '',
    periodStart: today,
    periodEnd: today,
    sourceReference: '',
    calculatedAmount: '0',
    approvedAmount: '',
    status: 'draft',
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
      <div className={`flex h-full w-full ${width} flex-col bg-white dark:bg-[var(--card-background)] shadow-xl transition-all duration-300 ease-in-out ${animate ? 'translate-x-0' : 'translate-x-full'}`} onClick={(event) => event.stopPropagation()}>
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
      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 disabled:bg-gray-50 disabled:text-gray-500"
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
      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 disabled:bg-gray-50 disabled:text-gray-500"
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
      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50"
    />
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
          <div key={index} className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-5 shadow-sm">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-4 h-8 w-20 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
            <div className="mt-4 h-5 w-28 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[var(--card-border)]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                {Array.from({ length: 7 }).map((_, index) => (
                  <th key={index} className="px-4 py-3">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-[var(--card-background)]">
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan={7} className="px-4 py-3">
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

function renderCell(cell: PayoutRegisterCell, index: number) {
  if (typeof cell === 'string') {
    return <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{cell}</td>;
  }

  const alignClass = cell.align === 'right' ? 'text-right' : cell.align === 'center' ? 'text-center' : 'text-left';
  if (cell.tone) {
    const toneMap: Record<string, string> = {
      amber: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:ring-amber-800',
      blue: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-800',
      gray: 'bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700',
      green: 'bg-green-50 text-green-700 ring-green-200 dark:bg-green-950/30 dark:text-green-400 dark:ring-green-800',
      red: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/30 dark:text-red-400 dark:ring-red-800',
    };
    return (
      <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${alignClass}`}>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${toneMap[cell.tone] || toneMap.gray}`}>{cell.text}</span>
      </td>
    );
  }

  return <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${cell.emphasis ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'} ${alignClass}`}>{cell.text}</td>;
}

export function PayoutRegisterClient() {
  const [data, setData] = useState<PayoutRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<PayoutFilterState>({ statuses: [] });
  const [draftFilters, setDraftFilters] = useState<PayoutFilterState>({ statuses: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [viewDetail, setViewDetail] = useState<PayoutRegisterDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [formState, setFormState] = useState<PayoutFormState>(createEmptyPayoutForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionTarget, setActionTarget] = useState<PayoutActionTarget | null>(null);
  const [isActioning, setIsActioning] = useState(false);

  const filterCount = filters.statuses.length;

  const fetchRegister = useCallback(async ({
    search,
    page,
    nextFilters,
    nextQuickFilters,
  }: {
    search: string;
    page: number;
    nextFilters: PayoutFilterState;
    nextQuickFilters: string[];
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getPayouts({
        search,
        page,
        statuses: nextFilters.statuses,
        quickFilters: nextQuickFilters,
      });
      setData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load payout register.');
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

  const referenceData = data?.referenceData;

  const instructorOptions = useMemo(
    () => [
      { label: 'Select an instructor', value: '' },
      ...(referenceData?.instructors || []).map((inst) => ({
        label: inst.label || `Instructor ${inst.id}`,
        value: String(inst.id),
      })),
    ],
    [referenceData?.instructors],
  );

  const courseOptions = useMemo(
    () => [
      { label: 'Select a course', value: '' },
      ...(referenceData?.courses || []).map((c) => ({
        label: c.title || c.courseCode || `Course ${c.id}`,
        value: String(c.id),
      })),
    ],
    [referenceData?.courses],
  );

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput);
    setCurrentPage(1);
    void fetchRegister({ search: searchInput, page: 1, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleRefresh = () => {
    void fetchRegister({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleExport = () => {
    const rows = data?.section.table.rows || [];
    if (!rows.length) return;
    const headers = ['Instructor', 'Course', 'Period', 'Calculated Amount', 'Approved Amount', 'Status'];
    const csvRows = rows.map((row) => [
      row.instructorLabel,
      row.courseLabel,
      row.periodLabel,
      row.calculatedAmountLabel,
      row.approvedAmountLabel,
      row.statusLabel,
    ]);
    const csvContent = [headers, ...csvRows].map((row) => row.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'instructor-payout-register.csv';
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
    setFormState(createEmptyPayoutForm());
    setIsFormOpen(true);
  };

  const handleView = async (id: string) => {
    setIsViewOpen(true);
    setIsViewLoading(true);
    setViewDetail(null);
    try {
      const detail = await getPayoutDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load payout detail.');
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
      const detail = await getPayoutDetail(id);
      setFormState({
        instructor: detail.instructorId,
        course: detail.courseId,
        periodStart: toDateInputValue(detail.periodStart),
        periodEnd: toDateInputValue(detail.periodEnd),
        sourceReference: detail.sourceReference,
        calculatedAmount: String(detail.calculatedAmount || 0),
        approvedAmount: detail.approvedAmount ? String(detail.approvedAmount) : '',
        status: detail.status,
        notes: detail.notes || '',
      });
    } catch (detailError) {
      setFormError(detailError instanceof Error ? detailError.message : 'Unable to load payout detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const normalizeFormPayload = (): PayoutRegisterMutationInput => ({
    instructor: formState.instructor,
    course: formState.course,
    periodStart: formState.periodStart,
    periodEnd: formState.periodEnd,
    sourceReference: formState.sourceReference.trim() || undefined,
    calculatedAmount: Number(formState.calculatedAmount || 0),
    approvedAmount: formState.approvedAmount ? Number(formState.approvedAmount) : undefined,
    status: formState.status || 'draft',
    notes: formState.notes.trim() || null,
  });

  const refreshCurrentView = async () => {
    await fetchRegister({
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
      const payload = normalizeFormPayload();
      if (editingId) {
        await updatePayout(editingId, payload);
      } else {
        await createPayout(payload);
      }
      setIsFormOpen(false);
      await refreshCurrentView();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Unable to save payout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deletePayout(deleteTarget.id);
      setDeleteTarget(null);
      await refreshCurrentView();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete payout.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!actionTarget) return;
    setIsActioning(true);
    setError(null);
    try {
      await postPayoutAction(actionTarget.id, actionTarget.action);
      setActionTarget(null);
      await refreshCurrentView();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : `Unable to ${actionTarget.action} payout.`);
    } finally {
      setIsActioning(false);
    }
  };

  const getRowActions = (row: PayoutRegisterRow) => {
    const isMutable = MUTABLE_STATUSES.has(row.status);
    const availableActions: { action: PayoutActionTarget['action']; label: string; icon: typeof Send }[] = [];
    if (row.status === 'draft') availableActions.push({ action: 'calculate', label: 'Calculate', icon: Send });
    if (row.status === 'calculated') availableActions.push({ action: 'approve', label: 'Approve', icon: CheckCircle2 });
    if (row.status === 'approved') {
      availableActions.push({ action: 'pay', label: 'Pay', icon: Send });
      availableActions.push({ action: 'void', label: 'Void', icon: XCircle });
    }
    return { isMutable, availableActions };
  };

  const actionDialogConfig = useMemo(() => {
    if (!actionTarget) return null;
    const configs: Record<string, { title: string; description: string; icon: typeof AlertCircle; confirmLabel: string; iconBg: string; iconColor: string; confirmBg: string }> = {
      calculate: {
        title: 'Calculate Payout',
        description: `Are you sure you want to calculate the payout for ${actionTarget.label}? This will mark it as calculated and move it forward in the workflow.`,
        icon: AlertCircle,
        iconBg: 'bg-blue-100 dark:bg-blue-950/30',
        iconColor: 'text-blue-600 dark:text-blue-400',
        confirmBg: 'bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800',
        confirmLabel: 'Calculate',
      },
      approve: {
        title: 'Approve Payout',
        description: `Are you sure you want to approve the payout for ${actionTarget.label}? This will set the approved amount equal to the calculated amount and advance it to approved status.`,
        icon: AlertCircle,
        iconBg: 'bg-blue-100 dark:bg-blue-950/30',
        iconColor: 'text-blue-600 dark:text-blue-400',
        confirmBg: 'bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800',
        confirmLabel: 'Approve',
      },
      pay: {
        title: 'Pay Payout',
        description: `Are you sure you want to mark the payout for ${actionTarget.label} as paid? This action cannot be undone.`,
        icon: AlertCircle,
        iconBg: 'bg-blue-100 dark:bg-blue-950/30',
        iconColor: 'text-blue-600 dark:text-blue-400',
        confirmBg: 'bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800',
        confirmLabel: 'Mark as Paid',
      },
      void: {
        title: 'Void Payout',
        description: `Are you sure you want to void the payout for ${actionTarget.label}? This action cannot be undone.`,
        icon: AlertCircle,
        iconBg: 'bg-red-100 dark:bg-red-950/30',
        iconColor: 'text-red-600 dark:text-red-400',
        confirmBg: 'bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800',
        confirmLabel: 'Void Payout',
      },
    };
    return configs[actionTarget.action];
  }, [actionTarget]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{data?.section.label || 'Payout Register'}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{data?.section.description || 'Review generated instructor payout obligations by instructor, course, period, calculated amount, approved amount, and payout status.'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
            <Plus className="h-4 w-4" />
            Create Payout
          </button>
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" />
            Refresh Register
          </button>
          <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50" disabled={!data?.section.table.rows.length}>
            <Download className="h-4 w-4" />
            Export View
          </button>
        </div>
      </div>

      {data?.section.metrics?.length ? <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{data.section.metrics.map((metric) => <div key={metric.id}><MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} /></div>)}</div> : null}

      <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-800 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <form onSubmit={handleSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input type="text" placeholder={data?.section.searchPlaceholder || 'Search instructor, course, source reference, period, calculated amount, or payout status'} value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50" />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 dark:border-blue-700 bg-blue-600 dark:bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800">
                <Search className="h-4 w-4" />
                Search
              </button>
            </form>
            <button type="button" onClick={() => { if (!isFilterPanelOpen) setDraftFilters({ ...filters }); setIsFilterPanelOpen((previous) => !previous); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isFilterPanelOpen || filterCount > 0 ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <Filter className="h-4 w-4" />
              Filters
              {filterCount > 0 ? <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-700 px-1.5 py-0.5 text-[11px] font-semibold text-white">{filterCount}</span> : null}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(data?.section.filters.quickFilters || []).map((filter) => (
              <button key={filter.value} type="button" onClick={() => handleToggleQuickFilter(filter.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${quickFilters.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
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
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Select as many values as needed per group, then apply the filtered view.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => { setDraftFilters({ statuses: [] }); setFilters({ statuses: [] }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">Clear all</button>
                  <button type="button" onClick={() => setIsFilterPanelOpen(false)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                  <button type="button" onClick={() => { setFilters({ ...draftFilters }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 dark:border-blue-700 bg-blue-600 dark:bg-blue-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-800">Apply Filters</button>
                </div>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.section.filters.statuses || []).map((option) => {
                      const selected = draftFilters.statuses.includes(option.value);
                      return <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{option.label}</button>;
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{data?.section.table.title || 'Instructor Payout Register'}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{data?.section.table.description || 'Payout register aligned to accounting-instructor-payouts, including calculation period, calculated amount, approved amount, and payout status.'}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span>{data?.totals.filteredRows ?? 0} matching rows</span>
            </div>
          </div>

          {error ? <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div> : null}

          {isLoading ? <LoadingSkeleton /> : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[var(--card-border)]">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        {['Instructor', 'Course', 'Period', { label: 'Calculated Amount', align: 'right' }, { label: 'Approved Amount', align: 'right' }, 'Status'].map((column) => {
                          const key = typeof column === 'string' ? column : column.label;
                          const alignClass = typeof column === 'string' ? 'text-left' : column.align === 'right' ? 'text-right' : 'text-left';
                          return <th key={key} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${alignClass}`}>{key}</th>;
                        })}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-[var(--card-background)]">
                      {(data?.section.table.rows || []).length > 0 ? (data?.section.table.rows || []).map((row) => {
                        const { isMutable, availableActions } = getRowActions(row);
                        const canDelete = row.status !== 'paid' && row.status !== 'voided';
                        return (
                          <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            {row.cells.map((cell, index) => renderCell(cell, index))}
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300" title="View detail">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => handleOpenEdit(row.id)} disabled={!isMutable} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 disabled:cursor-not-allowed disabled:opacity-40" title={isMutable ? 'Edit payout' : 'Cannot edit paid or voided payouts'}>
                                  <Edit className="h-4 w-4" />
                                </button>
                                {availableActions.map((available) => {
                                  const Icon = available.icon;
                                  const actionColor = available.action === 'void' ? 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300' : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-700 dark:hover:text-blue-300';
                                  return (
                                    <button key={available.action} type="button" onClick={() => setActionTarget({ id: row.id, label: row.instructorLabel, action: available.action })} className={`inline-flex items-center gap-1 rounded-lg p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${actionColor}`} title={available.label}>
                                      <Icon className="h-4 w-4" />
                                    </button>
                                  );
                                })}
                                <button type="button" onClick={() => setDeleteTarget({ id: row.id, label: row.instructorLabel })} disabled={!canDelete} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40" title={canDelete ? 'Delete payout' : 'Cannot delete paid or voided payouts'}>
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No payout rows found.</td>
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
                    <button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">Previous</button>
                    <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">Next</button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Payout Detail" description="Review payout header values, instructor, course, period, amounts, and timestamps.">
        <div className="space-y-6">
          {isViewLoading ? <LoadingSkeleton /> : viewDetail ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['Instructor', viewDetail.instructorLabel],
                  ['Course', viewDetail.courseLabel],
                  ['Period', viewDetail.periodLabel],
                  ['Source Reference', viewDetail.sourceReference],
                  ['Source Type', viewDetail.sourceType],
                  ['Status', viewDetail.statusLabel],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Calculated Amount', viewDetail.calculatedAmountLabel],
                  ['Approved Amount', viewDetail.approvedAmountLabel],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">{value}</p>
                  </div>
                ))}
              </div>

              {viewDetail.notes ? (
                <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Notes</p>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{viewDetail.notes}</p>
                </div>
              ) : null}

              <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-4 text-sm text-gray-700 dark:text-gray-300">
                <p className="font-medium text-gray-900 dark:text-gray-100">Timestamps</p>
                <p className="mt-2">Created: {viewDetail.createdAt ? new Date(viewDetail.createdAt).toLocaleString() : '-'}</p>
                <p>Updated: {viewDetail.updatedAt ? new Date(viewDetail.updatedAt).toLocaleString() : '-'}</p>
              </div>
            </>
          ) : <p className="text-sm text-gray-500 dark:text-gray-400">No details available.</p>}
          <div className="flex justify-end pt-4">
            <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">Close</button>
          </div>
        </div>
      </SlideOver>

      <SlideOver isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingId ? 'Edit Payout' : 'Create Payout'} description="Select instructor, course, period, and amounts. Fields marked with * are required.">
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError ? <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400"><AlertCircle className="h-4 w-4 shrink-0" />{formError}</div> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Instructor" required>
              <Select value={formState.instructor} onChange={(value) => setFormState((previous) => ({ ...previous, instructor: value }))} options={instructorOptions} />
            </FormField>
            <FormField label="Course" required>
              <Select value={formState.course} onChange={(value) => setFormState((previous) => ({ ...previous, course: value }))} options={courseOptions} />
            </FormField>
            <FormField label="Period Start" required>
              <Input type="date" value={formState.periodStart} onChange={(value) => setFormState((previous) => ({ ...previous, periodStart: value }))} required />
            </FormField>
            <FormField label="Period End" required>
              <Input type="date" value={formState.periodEnd} onChange={(value) => setFormState((previous) => ({ ...previous, periodEnd: value }))} required />
            </FormField>
            <FormField label="Source Reference">
              <Input value={formState.sourceReference} onChange={(value) => setFormState((previous) => ({ ...previous, sourceReference: value }))} placeholder="Auto-generated if left blank" />
            </FormField>
            <FormField label="Calculated Amount (PHP)" required>
              <Input type="number" value={formState.calculatedAmount} onChange={(value) => setFormState((previous) => ({ ...previous, calculatedAmount: value }))} required />
            </FormField>
            <FormField label="Approved Amount (PHP)">
              <Input type="number" value={formState.approvedAmount} onChange={(value) => setFormState((previous) => ({ ...previous, approvedAmount: value }))} placeholder="Set during approval" />
            </FormField>
            <FormField label="Status" required>
              <Select value={formState.status} onChange={(value) => setFormState((previous) => ({ ...previous, status: value }))} options={[
                { label: 'Draft', value: 'draft' },
                { label: 'Calculated', value: 'calculated' },
                { label: 'Approved', value: 'approved' },
              ]} />
            </FormField>
          </div>

          <FormField label="Notes">
            <TextArea value={formState.notes} onChange={(value) => setFormState((previous) => ({ ...previous, notes: value }))} rows={3} />
          </FormField>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-800 pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} disabled={isSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>
              {isSubmitting ? `${editingId ? 'Saving...' : 'Creating...'}` : editingId ? 'Save Changes' : 'Create Payout'}
            </button>
          </div>
        </form>
      </SlideOver>

      {actionTarget && actionDialogConfig ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setActionTarget(null)}>
          <div className="mx-4 w-full max-w-md rounded-xl bg-white dark:bg-[var(--card-background)] p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2 ${actionDialogConfig.iconBg}`}>
                <actionDialogConfig.icon className={`h-5 w-5 ${actionDialogConfig.iconColor}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{actionDialogConfig.title}</h3>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{actionDialogConfig.description}</p>
            {isActioning ? <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Processing...</p> : null}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setActionTarget(null)} disabled={isActioning} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">Cancel</button>
              <button type="button" onClick={handleConfirmAction} disabled={isActioning} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${actionDialogConfig.confirmBg}`}>{actionDialogConfig.confirmLabel}</button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteTarget(null)}>
          <div className="mx-4 w-full max-w-md rounded-xl bg-white dark:bg-[var(--card-background)] p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-100 dark:bg-red-950/30 p-2 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Delete Payout</h3>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete the payout for <strong>{deleteTarget.label}</strong>? This action cannot be undone.
            </p>
            {isDeleting ? <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Deleting...</p> : null}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">Cancel</button>
              <button type="button" onClick={handleConfirmDelete} disabled={isDeleting} className="rounded-lg bg-red-600 dark:bg-red-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:hover:bg-red-800 disabled:opacity-50">Delete</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
