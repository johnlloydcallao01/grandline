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
  Send,
  Trash2,
  X,
} from 'lucide-react';
import {
  createPayrollRun,
  deletePayrollRun,
  getPayrollPostingReport,
  getPayrollRunDetail,
  getPayrollRunReferenceData,
  postPayrollRun,
  updatePayrollRun,
  type PayrollPostingReportCell,
  type PayrollPostingReportMetric,
  type PayrollPostingReportResponse,
  type PayrollPostingReportRow,
  type PayrollRunDetail,
  type PayrollRunMutationInput,
  type PayrollRunReferenceData,
} from './actions';

type TabId = 'payroll-posting-report';
type PayrollPostingReportFilterState = { statuses: string[]; postingStates: string[] };
type PayrollRunFormState = {
  payrollCode: string;
  periodStart: string;
  periodEnd: string;
  paymentDate: string;
  status: 'draft' | 'review' | 'approved';
  branch: string;
  department: string;
  notes: string;
};
type PayrollRunActionTarget = {
  id: string;
  payrollCode: string;
};

const STATIC_TABS: Array<{
  id: TabId;
  label: string;
  description: string;
  searchPlaceholder: string;
  columns: string[];
  metrics: PayrollPostingReportMetric[];
  rows: Array<{ id: string; cells: PayrollPostingReportCell[] }>;
  tableTitle: string;
  tableDescription: string;
}> = [
  {
    id: 'payroll-posting-report',
    label: 'Payroll Posting Report',
    description:
      'Review payroll posting summaries by run using gross amount, deduction amount, net amount, entry count, payment date, status, and posted journal entry.',
    searchPlaceholder: 'Search payroll code, payment date, posting state, status, entry count, or journal',
    columns: ['Payroll Code', 'Payment Date', 'Gross Amount', 'Deduction Amount', 'Net Amount', 'Status', 'Entries', 'Posted Journal', 'Posting State'],
    metrics: [],
    rows: [],
    tableTitle: 'Payroll Posting Report',
    tableDescription:
      'Run-level payroll posting report showing gross payroll expense, deductions, net payable, entry count, approval status, and posted journal linkage.',
  },
];

const MUTABLE_STATUSES = new Set(['draft', 'review', 'approved']);
const STATUS_OPTIONS: Array<{ label: string; value: PayrollRunFormState['status'] }> = [
  { label: 'Draft', value: 'draft' },
  { label: 'Review', value: 'review' },
  { label: 'Approved', value: 'approved' },
];

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  if (variant === 'ghost') return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
}

function getMetricTone(trend: PayrollPostingReportMetric['trend']) {
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

function createEmptyForm(): PayrollRunFormState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    payrollCode: '',
    periodStart: today,
    periodEnd: today,
    paymentDate: today,
    status: 'draft',
    branch: '',
    department: '',
    notes: '',
  };
}

function getRelationshipId(value: unknown) {
  if (typeof value === 'number' || typeof value === 'string') return String(value);
  if (value && typeof value === 'object' && 'id' in value) return String((value as { id?: string | number }).id ?? '');
  return '';
}

function buildName(value: unknown) {
  if (!value || typeof value !== 'object') return '';
  const record = value as Record<string, unknown>;
  const fullName = [record.firstName, record.lastName].filter(Boolean).join(' ').trim();
  return String(record.displayName || record.name || record.title || fullName || record.email || record.username || record.code || record.id || '');
}

function buildPersonName(entry: Record<string, unknown>) {
  const userName = buildName(entry.user);
  if (userName) return userName;
  const instructor = entry.instructor as Record<string, unknown> | undefined;
  const instructorUserName = buildName(instructor?.user);
  if (instructorUserName) return instructorUserName;
  return buildName(entry.instructor) || String(entry.employeeName || entry.employeeCode || entry.person || '-');
}

function buildFormFromDetail(detail: PayrollRunDetail): PayrollRunFormState {
  return {
    payrollCode: String(detail.payrollCode || ''),
    periodStart: toDateInputValue(detail.periodStart),
    periodEnd: toDateInputValue(detail.periodEnd),
    paymentDate: toDateInputValue(detail.paymentDate),
    status: ['draft', 'review', 'approved'].includes(String(detail.status))
      ? (String(detail.status) as PayrollRunFormState['status'])
      : 'draft',
    branch: getRelationshipId(detail.branch),
    department: getRelationshipId(detail.department),
    notes: String(detail.notes || ''),
  };
}

function toMutationInput(formState: PayrollRunFormState): PayrollRunMutationInput {
  return {
    payrollCode: formState.payrollCode.trim() || null,
    periodStart: formState.periodStart,
    periodEnd: formState.periodEnd,
    paymentDate: formState.paymentDate,
    status: formState.status,
    branch: formState.branch || null,
    department: formState.department || null,
    notes: formState.notes.trim() || null,
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

function LoadingSkeleton({ columnCount = 9 }: { columnCount?: number }) {
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
                {Array.from({ length: columnCount + 1 }).map((_, index) => (
                  <th key={index} className="px-4 py-3">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan={columnCount + 1} className="px-4 py-3">
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

function renderCell(cell: PayrollPostingReportCell, index: number) {
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

function PayrollReportingClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = (STATIC_TABS.find((tab) => tab.id === rawTab)?.id) || 'payroll-posting-report';
  const currentTab = STATIC_TABS.find((tab) => tab.id === activeTab) || STATIC_TABS[0];

  const [reportData, setReportData] = useState<PayrollPostingReportResponse | null>(null);
  const [referenceData, setReferenceData] = useState<PayrollRunReferenceData>({ branches: [], departments: [] });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<PayrollPostingReportFilterState>({ statuses: [], postingStates: [] });
  const [draftFilters, setDraftFilters] = useState<PayrollPostingReportFilterState>({ statuses: [], postingStates: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [viewDetail, setViewDetail] = useState<PayrollRunDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [formState, setFormState] = useState<PayrollRunFormState>(createEmptyForm());
  const [editingPayrollRunId, setEditingPayrollRunId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PayrollRunActionTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [postTarget, setPostTarget] = useState<PayrollRunActionTarget | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const filterCount = filters.statuses.length + filters.postingStates.length;
  const branchOptions = useMemo(
    () => [{ label: 'No branch', value: '' }, ...referenceData.branches.map((branch) => ({ label: `${branch.branchCode ? `${branch.branchCode} - ` : ''}${branch.name}`.trim(), value: branch.id }))],
    [referenceData.branches],
  );
  const departmentOptions = useMemo(
    () => [{ label: 'No department', value: '' }, ...referenceData.departments.map((department) => ({ label: `${department.code ? `${department.code} - ` : ''}${department.name}`.trim(), value: department.id }))],
    [referenceData.departments],
  );

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const fetchReport = useCallback(async ({
    search,
    page,
    nextFilters,
    nextQuickFilters,
  }: {
    search: string;
    page: number;
    nextFilters: PayrollPostingReportFilterState;
    nextQuickFilters: string[];
  }) => {
    if (activeTab !== 'payroll-posting-report') return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getPayrollPostingReport({
        search,
        page,
        statuses: nextFilters.statuses,
        postingStates: nextFilters.postingStates,
        quickFilters: nextQuickFilters,
      });
      setReportData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load payroll posting report.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'payroll-posting-report') {
      void fetchReport({
        search: submittedSearch,
        page: currentPage,
        nextFilters: filters,
        nextQuickFilters: quickFilters,
      });
    }
  }, [activeTab, currentPage, fetchReport, filters, quickFilters, submittedSearch]);

  useEffect(() => {
    let cancelled = false;
    const loadReferenceData = async () => {
      try {
        const response = await getPayrollRunReferenceData();
        if (!cancelled) setReferenceData(response);
      } catch (referenceError) {
        if (!cancelled) setError(referenceError instanceof Error ? referenceError.message : 'Unable to load payroll reference data.');
      }
    };
    void loadReferenceData();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRefresh = () => {
    void fetchReport({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput.trim());
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setFilters({ ...draftFilters });
    setCurrentPage(1);
    setIsFilterPanelOpen(false);
  };

  const handleClearFilters = () => {
    const emptyFilters = { statuses: [], postingStates: [] };
    setDraftFilters(emptyFilters);
    setFilters(emptyFilters);
    setCurrentPage(1);
    setIsFilterPanelOpen(false);
  };

  const handleToggleQuickFilter = (value: string) => {
    setQuickFilters((previous) => toggleFilterValue(previous, value));
    setCurrentPage(1);
  };

  const handleExportCsv = () => {
    if (!reportData) return;
    const headers = reportData.meta.columns;
    const rows = reportData.rows.map((row) => [
      row.payrollCode,
      row.paymentDate || '',
      row.grossAmountLabel,
      row.deductionAmountLabel,
      row.netAmountLabel,
      row.statusLabel,
      String(row.entryCount),
      row.postedJournalEntryId || '',
      row.postingStateLabel,
    ].map(escapeCsvValue).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payroll-posting-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenCreate = () => {
    setFormState(createEmptyForm());
    setEditingPayrollRunId(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = async (id: string) => {
    setEditingPayrollRunId(id);
    setFormState(createEmptyForm());
    setFormError(null);
    setIsFormOpen(true);
    try {
      const detail = await getPayrollRunDetail(id);
      setFormState(buildFormFromDetail(detail));
    } catch (detailError) {
      setFormError(detailError instanceof Error ? detailError.message : 'Unable to load payroll run.');
    }
  };

  const handleView = async (id: string) => {
    setIsViewOpen(true);
    setIsViewLoading(true);
    setViewDetail(null);
    try {
      const detail = await getPayrollRunDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load payroll run detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      const payload = toMutationInput(formState);
      if (editingPayrollRunId) {
        await updatePayrollRun(editingPayrollRunId, payload);
      } else {
        await createPayrollRun(payload);
      }
      setIsFormOpen(false);
      await fetchReport({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Unable to save payroll run.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deletePayrollRun(deleteTarget.id);
      setDeleteTarget(null);
      await fetchReport({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete payroll run.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmPost = async () => {
    if (!postTarget) return;
    setIsPosting(true);
    setError(null);
    try {
      await postPayrollRun(postTarget.id);
      setPostTarget(null);
      await fetchReport({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
    } catch (postError) {
      setError(postError instanceof Error ? postError.message : 'Unable to post payroll run.');
    } finally {
      setIsPosting(false);
    }
  };

  const renderRunActions = (row: PayrollPostingReportRow) => {
    const isMutable = MUTABLE_STATUSES.has(row.status);
    const canPost = row.postingState === 'ready_to_post';

    return (
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail">
            <Eye className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => handleOpenEdit(row.id)} disabled={!isMutable} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40" title="Edit payroll run">
            <Edit className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setPostTarget({ id: row.id, payrollCode: row.payrollCode })} disabled={!canPost} className="inline-flex items-center gap-1 rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40" title={canPost ? 'Post payroll run' : 'Payroll run must be approved with entries before posting'}>
            <Send className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setDeleteTarget({ id: row.id, payrollCode: row.payrollCode })} disabled={!isMutable} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40" title="Delete payroll run">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    );
  };

  const renderPayrollRunForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError ? <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{formError}</div> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Payroll Code">
          <Input value={formState.payrollCode} onChange={(value) => setFormState((previous) => ({ ...previous, payrollCode: value }))} placeholder="Leave blank to auto-generate" />
        </FormField>
        <FormField label="Status" required>
          <Select value={formState.status} onChange={(value) => setFormState((previous) => ({ ...previous, status: value as PayrollRunFormState['status'] }))} options={STATUS_OPTIONS} />
        </FormField>
        <FormField label="Period Start" required>
          <Input type="date" value={formState.periodStart} onChange={(value) => setFormState((previous) => ({ ...previous, periodStart: value }))} required />
        </FormField>
        <FormField label="Period End" required>
          <Input type="date" value={formState.periodEnd} onChange={(value) => setFormState((previous) => ({ ...previous, periodEnd: value }))} required />
        </FormField>
        <FormField label="Payment Date" required>
          <Input type="date" value={formState.paymentDate} onChange={(value) => setFormState((previous) => ({ ...previous, paymentDate: value }))} required />
        </FormField>
        <FormField label="Branch">
          <Select value={formState.branch} onChange={(value) => setFormState((previous) => ({ ...previous, branch: value }))} options={branchOptions} />
        </FormField>
        <FormField label="Department">
          <Select value={formState.department} onChange={(value) => setFormState((previous) => ({ ...previous, department: value }))} options={departmentOptions} />
        </FormField>
      </div>
      <FormField label="Notes">
        <TextArea value={formState.notes} onChange={(value) => setFormState((previous) => ({ ...previous, notes: value }))} rows={4} />
      </FormField>
      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
        <button type="button" onClick={() => setIsFormOpen(false)} disabled={isSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">Cancel</button>
        <button type="submit" disabled={isSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>{isSubmitting ? 'Saving...' : editingPayrollRunId ? 'Save Changes' : 'Create Payroll Run'}</button>
      </div>
    </form>
  );

  const entries = (viewDetail?.entries || []) as Array<Record<string, unknown>>;
  const detailGrossAmount = entries.reduce((sum, entry) => sum + Number(entry.grossAmount || 0), 0);
  const detailDeductionAmount = entries.reduce((sum, entry) => sum + Number(entry.deductionAmount || 0), 0);
  const detailNetAmount = entries.reduce((sum, entry) => sum + Number(entry.netAmount || 0), 0);
  const postedJournalEntry = viewDetail?.postedJournalEntry as Record<string, unknown> | string | number | undefined;
  const postedJournalEntryLabel = typeof postedJournalEntry === 'object' && postedJournalEntry !== null
    ? String(postedJournalEntry.entryNumber || postedJournalEntry.id || '-')
    : postedJournalEntry
      ? String(postedJournalEntry)
      : '-';

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Advanced Finance / Payroll & Contractor Finance</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Payroll Reporting</h1>
          <p className="mt-1 text-base text-gray-600">Review payroll posting summaries, run status, deduction rollups, net payable totals, and journal linkage before and after General Ledger posting.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" />
            Refresh Workspace
          </button>
          <button type="button" onClick={handleExportCsv} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('ghost')}`}>
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {STATIC_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} type="button" onClick={() => handleTabChange(tab.id)} className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError(null)} className="rounded-lg p-1 text-red-500 hover:bg-red-100"><X className="h-4 w-4" /></button>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">{currentTab.label}</h2>
          <p className="text-sm text-gray-600">{currentTab.description}</p>
          <p className="text-sm text-gray-500">{reportData?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
            <Plus className="h-4 w-4" />
            Create Payroll Run
          </button>
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" />
            Refresh Report
          </button>
        </div>
      </div>

      {isLoading && !reportData ? <LoadingSkeleton /> : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
            {(reportData?.metrics || currentTab.metrics).map((metric) => (
              <div key={metric.id}><MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} /></div>
            ))}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                <form onSubmit={handleSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder={reportData?.meta.searchPlaceholder || currentTab.searchPlaceholder} value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
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
              <div className="flex flex-wrap gap-2">
                {(reportData?.filterOptions.quickFilters || []).map((filter) => (
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
                      <p className="mt-1 text-sm text-gray-600">Select statuses and posting states to narrow the report.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" onClick={handleClearFilters} className="text-sm font-medium text-gray-500 hover:text-gray-700">Clear all</button>
                      <button type="button" onClick={() => setIsFilterPanelOpen(false)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                      <button type="button" onClick={handleApplyFilters} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</h5>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(reportData?.filterOptions.statuses || []).map((option) => {
                          const selected = draftFilters.statuses.includes(option.value);
                          return <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{option.label}</button>;
                        })}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Posting State</h5>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(reportData?.filterOptions.postingStates || []).map((option) => {
                          const selected = draftFilters.postingStates.includes(option.value);
                          return <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, postingStates: toggleFilterValue(previous.postingStates, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{option.label}</button>;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-gray-900">{reportData?.meta.tableTitle || currentTab.tableTitle}</h3>
                  <p className="text-sm text-gray-600">{reportData?.meta.tableDescription || currentTab.tableDescription}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <span>{reportData?.totals.filteredRows ?? 0} matching rows</span>
                </div>
              </div>

              {isLoading ? (
                <LoadingSkeleton columnCount={(reportData?.meta.columns || currentTab.columns).length} />
              ) : (
                <>
                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {(reportData?.meta.columns || currentTab.columns).map((column) => (
                              <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${['Gross Amount', 'Deduction Amount', 'Net Amount'].includes(column) ? 'text-right' : 'text-left'}`}>{column}</th>
                            ))}
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {(reportData?.rows || []).length > 0 ? (
                            (reportData?.rows || []).map((row) => (
                              <tr key={row.id} className="hover:bg-gray-50">
                                {row.cells.map((cell, index) => renderCell(cell, index))}
                                {renderRunActions(row)}
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={(reportData?.meta.columns || currentTab.columns).length + 1} className="px-4 py-10 text-center text-sm text-gray-500">
                                No payroll posting report rows found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {reportData?.pagination && reportData.pagination.totalPages > 1 ? (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Page {reportData.pagination.page} of {reportData.pagination.totalPages}</p>
                      <div className="flex gap-2">
                        <button type="button" disabled={!reportData.pagination.hasPrevPage} onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">
                          Previous
                        </button>
                        <button type="button" disabled={!reportData.pagination.hasNextPage} onClick={() => setCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">
                          Next
                        </button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </>
      )}

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Payroll Posting Report Detail" description="Review run dates, status, journal linkage, and person-level payroll entries.">
        <div className="space-y-6">
          {isViewLoading ? <LoadingSkeleton /> : viewDetail ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['Payroll Code', viewDetail.payrollCode || '-'],
                  ['Period Start', toDateInputValue(viewDetail.periodStart) || '-'],
                  ['Period End', toDateInputValue(viewDetail.periodEnd) || '-'],
                  ['Payment Date', toDateInputValue(viewDetail.paymentDate) || '-'],
                  ['Status', viewDetail.status || '-'],
                  ['Branch', buildName(viewDetail.branch) || '-'],
                  ['Department', buildName(viewDetail.department) || '-'],
                  ['Posted Journal', postedJournalEntryLabel],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{String(value)}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Entry Count', String(entries.length)],
                  ['Gross Amount', reportData?.rows.find((row) => row.id === String(viewDetail.id))?.grossAmountLabel || new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(detailGrossAmount)],
                  ['Deduction Amount', reportData?.rows.find((row) => row.id === String(viewDetail.id))?.deductionAmountLabel || new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(detailDeductionAmount)],
                  ['Net Amount', reportData?.rows.find((row) => row.id === String(viewDetail.id))?.netAmountLabel || new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(detailNetAmount)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-2 text-sm font-semibold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-5 py-4">
                  <h4 className="text-sm font-semibold text-gray-900">Payroll Entries</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Person', 'Entry Type', 'Gross Amount', 'Deduction Amount', 'Net Amount', 'Expense Account', 'Payable Account', 'Status'].map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${['Gross Amount', 'Deduction Amount', 'Net Amount'].includes(column) ? 'text-right' : 'text-left'}`}>{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {entries.length > 0 ? entries.map((entry) => (
                        <tr key={String(entry.id)}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{buildPersonName(entry)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{String(entry.entryType || '-')}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-600">{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(entry.grossAmount || 0))}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-600">{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(entry.deductionAmount || 0))}</td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(entry.netAmount || 0))}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{buildName(entry.expenseAccount) || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{buildName(entry.payableAccount) || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{String(entry.status || '-')}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">No payroll entries linked to this run.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900">Notes</h4>
                <p className="mt-2 text-sm text-gray-700">{viewDetail.notes || '-'}</p>
              </div>
            </>
          ) : <p className="text-sm text-gray-500">No details available.</p>}
          <div className="flex justify-end pt-4">
            <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Close</button>
          </div>
        </div>
      </SlideOver>

      <SlideOver isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingPayrollRunId ? 'Edit Payroll Run' : 'Create Payroll Run'} description="Maintain payroll run dates, approval status, and reporting dimensions before General Ledger posting.">
        {renderPayrollRunForm()}
      </SlideOver>

      <SlideOver isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete Payroll Run" description="Delete this mutable payroll run after dependency validation completes." width="max-w-lg">
        <div className="space-y-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Delete payroll run {deleteTarget?.payrollCode}?</p>
            <p className="mt-1">Draft, review, and approved payroll runs can be deleted only when they do not have payroll entries or posted dependents.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">{isDeleting ? 'Deleting...' : 'Delete Payroll Run'}</button>
          </div>
        </div>
      </SlideOver>

      <SlideOver isOpen={Boolean(postTarget)} onClose={() => setPostTarget(null)} title="Post Payroll Run" description="Posting creates the journal entry and locks direct edits on the payroll run." width="max-w-lg">
        <div className="space-y-6">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
            <p className="font-medium">Post payroll run {postTarget?.payrollCode}?</p>
            <p className="mt-1">Make sure gross pay, deductions, net payable, and expense/payable account mappings are complete before posting.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setPostTarget(null)} disabled={isPosting} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleConfirmPost} disabled={isPosting} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">{isPosting ? 'Posting...' : 'Post Payroll Run'}</button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}

export default PayrollReportingClient;
