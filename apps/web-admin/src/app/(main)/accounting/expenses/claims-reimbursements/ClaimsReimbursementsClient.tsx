'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Download,
  Eye,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Wallet,
  X,
  XCircle,
} from 'lucide-react';
import {
  approveExpenseApprovalRequest,
  createExpenseApprovalRequest,
  getExpenseApprovalRequestDetail,
  getExpenseApprovalRequests,
  rejectExpenseApprovalRequest,
  type ApprovalCell,
  type ApprovalMetric,
  type ExpenseApprovalRequestDetail,
  type ExpenseApprovalRequestsResponse,
} from './actions';
import { SupportingDocumentsPanel } from './SupportingDocumentsPanel';

type TabId = 'approval-requests' | 'supporting-documents';
type ApprovalFilterState = { statuses: string[]; workflowIds: string[]; coverageStates: string[] };
type CreateRequestFormState = { entityId: string; workflowId: string; notes: string };
type DecisionFormState = { notes: string };

function mapApprovalCreationError(message: string) {
  if (message.includes('No active approval workflow exists for expense.')) {
    return 'Cannot create an expense approval request yet. No active approval workflow exists for the `expense` entity type. Create or activate one in Workflow Management first.';
  }
  return message;
}

const TABS = [
  {
    id: 'approval-requests' as TabId,
    label: 'Approval Requests',
    description:
      'Review approval activity tied to expense records and keep the queue moving with clear ownership and decision history.',
    searchPlaceholder: 'Search request id, expense no., workflow, approver, requester, status, or notes',
    columns: ['Request', 'Expense', 'Workflow', 'Current Approver', 'Requested At', 'Status'],
    tableTitle: 'Approval Request Queue',
    tableDescription:
      'Expense-scoped approval register showing workflow, current approver, timing, and request status.',
  },
  {
    id: 'supporting-documents' as TabId,
    label: 'Supporting Documents',
    description:
      'Monitor supporting files linked to expense and accounting records, with clear visibility into categories, dates, and primary references.',
    searchPlaceholder: 'Search entity id, category, uploaded by, note, or document date',
    columns: ['Link Ref', 'Entity Type', 'Entity Id', 'Category', 'Document Date', 'State'],
    tableTitle: 'Document Link Register',
    tableDescription:
      'Document register showing linked files, entity references, document categories, and recent attachment activity.',
  },
];

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
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={rows}
      placeholder={placeholder}
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

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: 6 }).map((_, index) => (
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

function ApprovalRequestsPanel({ tab }: { tab: (typeof TABS)[number] }) {
  const router = useRouter();
  const [data, setData] = useState<ExpenseApprovalRequestsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ApprovalFilterState>({
    statuses: [],
    workflowIds: [],
    coverageStates: [],
  });
  const [draftFilters, setDraftFilters] = useState<ApprovalFilterState>({
    statuses: [],
    workflowIds: [],
    coverageStates: [],
  });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const [viewDetail, setViewDetail] = useState<ExpenseApprovalRequestDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);

  const [createForm, setCreateForm] = useState<CreateRequestFormState>({
    entityId: '',
    workflowId: '',
    notes: '',
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);

  const [decisionTarget, setDecisionTarget] = useState<{ id: string; action: 'approve' | 'reject'; label: string } | null>(null);
  const [decisionForm, setDecisionForm] = useState<DecisionFormState>({ notes: '' });
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [isDecisionSubmitting, setIsDecisionSubmitting] = useState(false);

  const filterCount = filters.statuses.length + filters.workflowIds.length + filters.coverageStates.length;

  const fetchRegister = useCallback(async ({
    search,
    page,
    nextFilters,
    nextQuickFilters,
  }: {
    search: string;
    page: number;
    nextFilters: ApprovalFilterState;
    nextQuickFilters: string[];
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getExpenseApprovalRequests({
        search,
        page,
        statuses: nextFilters.statuses,
        workflowIds: nextFilters.workflowIds,
        coverageStates: nextFilters.coverageStates,
        quickFilters: nextQuickFilters,
      });
      setData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load approval requests.');
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
    const headers = ['Request', 'Expense', 'Workflow', 'Current Approver', 'Requested At', 'Status'];
    const csvRows = rows.map((row) => [
      row.requestCode,
      row.expenseLabel,
      row.workflowLabel,
      row.currentApproverLabel,
      row.requestedAtLabel,
      row.statusLabel,
    ]);
    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'expense-approval-requests.csv';
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
      setViewDetail(await getExpenseApprovalRequestDetail(id));
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load approval request detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setCreateForm({
      entityId: data?.referenceData.expenses[0]?.id || '',
      workflowId: data?.referenceData.workflows[0]?.id || '',
      notes: '',
    });
    setCreateError(null);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsCreateSubmitting(true);
    setCreateError(null);
    try {
      await createExpenseApprovalRequest({
        entityId: createForm.entityId,
        workflowId: createForm.workflowId || null,
        notes: createForm.notes || null,
      });
      setIsCreateOpen(false);
      handleRefresh();
    } catch (submissionError) {
      setCreateError(
        submissionError instanceof Error
          ? mapApprovalCreationError(submissionError.message)
          : 'Unable to request approval.',
      );
    } finally {
      setIsCreateSubmitting(false);
    }
  };

  const handleOpenDecision = (id: string, action: 'approve' | 'reject', label: string) => {
    setDecisionTarget({ id, action, label });
    setDecisionForm({ notes: '' });
    setDecisionError(null);
  };

  const handleDecisionSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!decisionTarget) return;
    setIsDecisionSubmitting(true);
    setDecisionError(null);
    try {
      if (decisionTarget.action === 'approve') {
        await approveExpenseApprovalRequest(decisionTarget.id, decisionForm.notes);
      } else {
        await rejectExpenseApprovalRequest(decisionTarget.id, decisionForm.notes);
      }
      setDecisionTarget(null);
      handleRefresh();
    } catch (submissionError) {
      setDecisionError(
        submissionError instanceof Error ? submissionError.message : 'Unable to update approval request.',
      );
    } finally {
      setIsDecisionSubmitting(false);
    }
  };

  const pendingRequestIds = useMemo(
    () => new Set(data?.flags.pendingRequestIds || []),
    [data?.flags.pendingRequestIds],
  );
  const hasActiveExpenseWorkflow = (data?.referenceData.workflows.length || 0) > 0;

  const expenseOptions = [{ label: 'Select an expense', value: '' }].concat(
    (data?.referenceData.expenses || []).map((expense) => ({
      label: expense.label,
      value: expense.id,
    })),
  );
  const workflowOptions = [{ label: 'Use active default workflow', value: '' }].concat(
    (data?.referenceData.workflows || []).map((workflow) => ({
      label: workflow.label,
      value: workflow.id,
    })),
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
            disabled={!hasActiveExpenseWorkflow}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}
            title={
              hasActiveExpenseWorkflow
                ? 'Create approval request'
                : 'No active expense approval workflow exists yet'
            }
          >
            <Plus className="h-4 w-4" />
            Create Approval Request
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Queue
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={!data?.rows.length}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export Requests
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
                      setDraftFilters({ statuses: [], workflowIds: [], coverageStates: [] });
                      setFilters({ statuses: [], workflowIds: [], coverageStates: [] });
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
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.statuses || []).map((option) => {
                      const selected = draftFilters.statuses.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setDraftFilters((previous) => ({
                              ...previous,
                              statuses: toggleFilterValue(previous.statuses, option.value),
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
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Workflow</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.workflows || []).map((option) => {
                      const selected = draftFilters.workflowIds.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setDraftFilters((previous) => ({
                              ...previous,
                              workflowIds: toggleFilterValue(previous.workflowIds, option.value),
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
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Coverage</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.coverageStates || []).map((option) => {
                      const selected = draftFilters.coverageStates.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setDraftFilters((previous) => ({
                              ...previous,
                              coverageStates: toggleFilterValue(previous.coverageStates, option.value),
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

          {!hasActiveExpenseWorkflow ? (
            <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">Approval request creation is blocked.</p>
                  <p className="mt-1">
                    No active approval workflow exists for the `expense` entity type, so this page cannot submit a new request yet.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => router.push('/accounting/approvals/workflow-management')}
                  className="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-100"
                >
                  Open Workflow Management
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/accounting/setup-controls/close-approval-controls')}
                  className="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-100"
                >
                  Open Approval Controls
                </button>
              </div>
            </div>
          ) : null}

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
                          const isPending = pendingRequestIds.has(row.id);
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
                                    onClick={() => handleOpenDecision(row.id, 'approve', row.requestCode)}
                                    disabled={!isPending}
                                    className="inline-flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    title={isPending ? 'Approve request' : 'Only pending requests can be approved'}
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDecision(row.id, 'reject', row.requestCode)}
                                    disabled={!isPending}
                                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    title={isPending ? 'Reject request' : 'Only pending requests can be rejected'}
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                    Reject
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={tab.columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">
                            No approval requests found.
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
        title="Approval Request Detail"
        description="Review workflow setup, decision trail, requester details, and the linked expense snapshot."
      >
        <div className="space-y-6">
          {isViewLoading ? (
            <LoadingSkeleton />
          ) : viewDetail ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['Request', viewDetail.requestCode],
                  ['Expense', viewDetail.expenseLabel],
                  ['Workflow', viewDetail.workflow.label],
                  ['Requested By', viewDetail.requestedByLabel],
                  ['Current Approver', viewDetail.currentApproverLabel],
                  ['Requested At', viewDetail.requestedAtLabel],
                  ['Resolved At', viewDetail.resolvedAtLabel],
                  ['Status', viewDetail.statusLabel],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900">Resolution Notes</h4>
                <p className="mt-2 text-sm text-gray-700">{viewDetail.resolutionNotes || '-'}</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Approval Trail</h4>
                    <p className="mt-1 text-sm text-gray-600">Decision history captured on the approval request.</p>
                  </div>
                  <div className="text-sm text-gray-500">{viewDetail.usageSummary.trailCount} step(s)</div>
                </div>
                <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {['Step', 'Approver', 'Decision', 'Acted At', 'Notes'].map((column) => (
                            <th
                              key={column}
                              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                            >
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {viewDetail.approvalTrail.length > 0 ? (
                          viewDetail.approvalTrail.map((trailRow) => (
                            <tr key={trailRow.id}>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{trailRow.stepNumber}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{trailRow.approverLabel}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{trailRow.decisionLabel}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{trailRow.actedAtLabel}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{trailRow.notes || '-'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                              No decision trail recorded yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Linked Expense Snapshot</h4>
                    <p className="mt-1 text-sm text-gray-600">Current header values on the linked expense record.</p>
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
                      ['Expense Date', viewDetail.expenseSnapshot.expenseDateLabel],
                      ['Posting Date', viewDetail.expenseSnapshot.postingDateLabel],
                      ['Vendor', viewDetail.expenseSnapshot.vendorLabel || '-'],
                      ['Category', viewDetail.expenseSnapshot.expenseCategory || '-'],
                      ['Payment Method', viewDetail.expenseSnapshot.paymentMethodLabel],
                      ['Expense Status', viewDetail.expenseSnapshot.statusLabel],
                      ['Subtotal', viewDetail.expenseSnapshot.subtotalLabel],
                      ['Tax Total', viewDetail.expenseSnapshot.taxTotalLabel],
                      ['Total', viewDetail.expenseSnapshot.totalLabel],
                      ['Project', viewDetail.expenseSnapshot.projectLabel || '-'],
                      ['Expense Account', viewDetail.expenseSnapshot.expenseAccountLabel || '-'],
                      ['Tax Code', viewDetail.expenseSnapshot.taxCodeLabel || '-'],
                      ['Payment Account', viewDetail.expenseSnapshot.paymentAccountLabel || '-'],
                      ['Bank Account', viewDetail.expenseSnapshot.bankAccountLabel || '-'],
                      ['Posted Journal', viewDetail.expenseSnapshot.postedJournalEntryId || '-'],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                        <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
                      </div>
                    ))}
                    <div className="md:col-span-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Notes</p>
                      <p className="mt-2 text-sm text-gray-700">{viewDetail.expenseSnapshot.notes || '-'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">Linked expense could not be loaded.</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">No detail available.</p>
          )}
        </div>
      </SlideOver>

      <SlideOver
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Approval Request"
        description="Request approval for an expense using the active expense approval workflow."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-6">
          {createError ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {createError}
            </div>
          ) : null}
          {!hasActiveExpenseWorkflow ? (
            <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">No active expense approval workflow exists.</p>
                  <p className="mt-1">
                    Create or activate an approval workflow for the `expense` entity type before trying to submit this form.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => router.push('/accounting/approvals/workflow-management')}
                  className="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-100"
                >
                  Open Workflow Management
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/accounting/setup-controls/close-approval-controls')}
                  className="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-100"
                >
                  Open Approval Controls
                </button>
              </div>
            </div>
          ) : null}
          <FormField label="Expense" required>
            <Select
              value={createForm.entityId}
              onChange={(value) => setCreateForm((previous) => ({ ...previous, entityId: value }))}
              options={expenseOptions}
            />
          </FormField>
          <FormField label="Workflow">
            <Select
              value={createForm.workflowId}
              onChange={(value) => setCreateForm((previous) => ({ ...previous, workflowId: value }))}
              options={workflowOptions}
            />
          </FormField>
          <FormField label="Notes">
            <TextArea
              value={createForm.notes}
              onChange={(value) => setCreateForm((previous) => ({ ...previous, notes: value }))}
              placeholder="Optional submission notes for the approver"
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
              disabled={isCreateSubmitting || !createForm.entityId || !hasActiveExpenseWorkflow}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}
            >
              {isCreateSubmitting ? 'Requesting...' : 'Create Approval Request'}
            </button>
          </div>
        </form>
      </SlideOver>

      <SlideOver
        isOpen={Boolean(decisionTarget)}
        onClose={() => setDecisionTarget(null)}
        title={decisionTarget?.action === 'approve' ? 'Approve Request' : 'Reject Request'}
        description="Add optional notes and complete the approval action for the selected expense request."
      >
        <form onSubmit={handleDecisionSubmit} className="space-y-6">
          {decisionError ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {decisionError}
            </div>
          ) : null}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            {decisionTarget?.action === 'approve'
              ? `Approve ${decisionTarget.label}?`
              : `Reject ${decisionTarget?.label}?`}
          </div>
          <FormField label="Notes">
            <TextArea
              value={decisionForm.notes}
              onChange={(value) => setDecisionForm({ notes: value })}
              placeholder="Optional notes for the decision trail"
            />
          </FormField>
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => setDecisionTarget(null)}
              disabled={isDecisionSubmitting}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDecisionSubmitting}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${decisionTarget?.action === 'approve' ? 'border border-green-600 bg-green-600 hover:border-green-700 hover:bg-green-700' : 'border border-red-600 bg-red-600 hover:border-red-700 hover:bg-red-700'}`}
            >
              {isDecisionSubmitting
                ? decisionTarget?.action === 'approve'
                  ? 'Approving...'
                  : 'Rejecting...'
                : decisionTarget?.action === 'approve'
                  ? 'Approve Request'
                  : 'Reject Request'}
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
}

export function ClaimsReimbursementsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = TABS.find((tab) => tab.id === rawTab)?.id || 'approval-requests';
  const currentTab = TABS.find((tab) => tab.id === activeTab) || TABS[0];

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Operations / Expenses</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Expense Approvals & Documents</h1>
          <p className="mt-1 text-base text-gray-600">
            Manage finance approval activity and supporting-file review in one focused workspace for
            expense operations.
          </p>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {TABS.map((tab) => {
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

      {activeTab === 'approval-requests' ? (
        <ApprovalRequestsPanel tab={currentTab} />
      ) : (
        <SupportingDocumentsPanel tab={currentTab} />
      )}
    </div>
  );
}
