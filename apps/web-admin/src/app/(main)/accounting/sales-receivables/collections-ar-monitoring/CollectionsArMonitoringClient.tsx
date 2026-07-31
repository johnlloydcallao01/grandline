'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Edit,
  Eye,
  Filter,
  RefreshCw,
  Search,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import {
  getAccountsReceivableAging,
  getOverdueInvoiceDetail,
  getOverdueInvoices,
  type AgingInvoiceRegisterResponse,
  type CollectionsCell,
  type CollectionsMetric,
  type OverdueInvoiceRegisterResponse,
} from './actions';

type TabId = 'overdue-invoices' | 'accounts-receivable-aging';
type OverdueFilterState = { statuses: string[]; customerIds: string[]; agingBuckets: string[] };
type AgingFilterState = { statuses: string[]; customerIds: string[]; agingBuckets: string[] };

type InvoiceDetail = Awaited<ReturnType<typeof getOverdueInvoiceDetail>>;

const TABS = [
  {
    id: 'overdue-invoices' as TabId,
    label: 'Overdue Invoices',
    description:
      'Track overdue receivables using invoice due dates, remaining balances, and customer visibility for follow-up.',
    searchPlaceholder: 'Search customer, invoice no., due date, balance due, or days overdue',
    columns: ['Customer', 'Invoice No.', 'Due Date', 'Balance Due', 'Days Overdue', 'Status'],
    tableTitle: 'Overdue Receivable Queue',
    tableDescription:
      'Operational AR queue focused on overdue invoices, remaining balances, and customer follow-up priority.',
  },
  {
    id: 'accounts-receivable-aging' as TabId,
    label: 'Accounts Receivable Aging',
    description:
      'Review accounts receivable aging using balance due, due dates, and days-overdue buckets from open invoices.',
    searchPlaceholder: 'Search customer, invoice no., due date, balance, or aging bucket',
    columns: ['Customer', 'Invoice No.', 'Due Date', 'Balance Due', 'Days Overdue', 'Aging Bucket'],
    tableTitle: 'AR Aging Detail',
    tableDescription:
      'Invoice-level receivable aging using due dates, remaining balances, and days-overdue calculations.',
  },
];


function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') {
    return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 dark:bg-blue-700 dark:border-blue-700';
  }
  if (variant === 'ghost') {
    return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300';
  }
  return 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800';
}

function getMetricTone(trend: CollectionsMetric['trend']) {
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

function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
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
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ease-in-out ${animate ? 'bg-black/50' : 'bg-transparent'}`} onClick={onClose}>
      <div className={`flex w-full max-w-4xl flex-col bg-white dark:bg-[var(--card-background)] shadow-xl transition-all duration-300 ease-in-out ${animate ? 'translate-x-0' : 'translate-x-full'}`} onClick={(event) => event.stopPropagation()}>
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

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[var(--card-border)] dark:border-[var(--card-border)]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                {Array.from({ length: 6 }).map((_, index) => (
                  <th key={index} className="px-4 py-3">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  </th>
                ))}
                <th className="px-4 py-3">
                  <div className="ml-auto h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[var(--card-background)]">
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan={7} className="px-4 py-3">
                    <div className="h-6 animate-pulse rounded bg-gray-100 dark:bg-gray-700" />
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

function renderCell(cell: CollectionsCell, index: number) {
  if (typeof cell === 'string') {
    return (
      <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-400">
        {cell}
      </td>
    );
  }

  const alignClass = cell.align === 'right' ? 'text-right' : cell.align === 'center' ? 'text-center' : 'text-left';
  if (cell.tone) {
    const toneMap: Record<string, string> = {
      amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 ring-amber-200 dark:ring-amber-800',
      blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 ring-blue-200 dark:ring-blue-800',
      gray: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 ring-gray-200 dark:ring-gray-700',
      green: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 ring-green-200 dark:ring-green-800',
      red: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 ring-red-200 dark:ring-red-800',
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

function OverdueInvoicesPanel({ tab }: { tab: (typeof TABS)[number] }) {
  const [data, setData] = useState<OverdueInvoiceRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<OverdueFilterState>({ statuses: [], customerIds: [], agingBuckets: [] });
  const [draftFilters, setDraftFilters] = useState<OverdueFilterState>({ statuses: [], customerIds: [], agingBuckets: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [viewDetail, setViewDetail] = useState<InvoiceDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);

  const filterCount = filters.statuses.length + filters.customerIds.length + filters.agingBuckets.length;

  const fetchRegister = useCallback(async ({
    search,
    page,
    nextFilters,
    nextQuickFilters,
  }: {
    search: string;
    page: number;
    nextFilters: OverdueFilterState;
    nextQuickFilters: string[];
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getOverdueInvoices({
        search,
        page,
        statuses: nextFilters.statuses,
        customerIds: nextFilters.customerIds,
        agingBuckets: nextFilters.agingBuckets,
        quickFilters: nextQuickFilters,
      });
      setData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load overdue invoices.');
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

  const handleRefresh = () => {
    void fetchRegister({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  };

  const handleExport = () => {
    const rows = data?.rows || [];
    if (!rows.length) return;

    const headers = ['Customer', 'Invoice No.', 'Due Date', 'Balance Due', 'Days Overdue', 'Aging Bucket', 'Status'];
    const csvRows = rows.map((row) => [
      row.customerLabel,
      row.invoiceNumber,
      row.dueDateLabel,
      row.balanceDueLabel,
      row.daysOverdueLabel,
      row.agingBucketLabel,
      row.statusLabel,
    ]);
    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'collections-overdue-invoices.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleToggleQuickFilter = (value: string) => {
    setQuickFilters((previous) => toggleFilterValue(previous, value));
    setCurrentPage(1);
  };

  const handleView = async (id: string) => {
    setIsViewOpen(true);
    setIsViewLoading(true);
    setViewDetail(null);
    try {
      const detail = await getOverdueInvoiceDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load invoice detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const currentRows = data?.rows || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{data?.meta.label || tab.label}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{data?.meta.description || tab.description}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" />
            Refresh Queue
          </button>
          <button type="button" onClick={handleExport} disabled={!currentRows.length} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50">
            <Download className="h-4 w-4" />
            Download View
          </button>
        </div>
      </div>

      {data?.metrics?.length ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {data.metrics.map((metric) => (
            <div key={metric.id}>
              <MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} />
            </div>
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
                  placeholder={data?.meta.searchPlaceholder || tab.searchPlaceholder}
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:border-blue-600 dark:focus:ring-blue-900/50"
                />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 dark:bg-blue-700 dark:border-blue-700">
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
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isFilterPanelOpen || filterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-[var(--card-background)] dark:text-gray-300 dark:hover:bg-gray-800'}`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {filterCount > 0 ? <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-700 px-1.5 py-0.5 text-[11px] font-semibold text-white">{filterCount}</span> : null}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(data?.filterOptions.quickFilters || []).map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => handleToggleQuickFilter(filter.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${quickFilters.includes(filter.value) ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-200 dark:ring-blue-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
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
                  <button
                    type="button"
                    onClick={() => {
                      setDraftFilters({ statuses: [], customerIds: [], agingBuckets: [] });
                      setFilters({ statuses: [], customerIds: [], agingBuckets: [] });
                      setCurrentPage(1);
                      setIsFilterPanelOpen(false);
                    }}
                    className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Clear all
                  </button>
                  <button type="button" onClick={() => setIsFilterPanelOpen(false)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters({ ...draftFilters });
                      setCurrentPage(1);
                      setIsFilterPanelOpen(false);
                    }}
                    className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-700"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-3">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.statuses || []).map((option) => {
                      const selected = draftFilters.statuses.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, option.value) }))}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Customer</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.customers || []).map((option) => {
                      const selected = draftFilters.customerIds.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setDraftFilters((previous) => ({ ...previous, customerIds: toggleFilterValue(previous.customerIds, option.value) }))}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Aging Bucket</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.agingBuckets || []).map((option) => {
                      const selected = draftFilters.agingBuckets.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setDraftFilters((previous) => ({ ...previous, agingBuckets: toggleFilterValue(previous.agingBuckets, option.value) }))}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
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
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{data?.meta.tableTitle || tab.tableTitle}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{data?.meta.tableDescription || tab.tableDescription}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span className="text-sm text-gray-500 dark:text-gray-400">{data?.totals.filteredRows ?? 0} matching rows</span>
            </div>
          </div>

          {error ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[var(--card-border)]">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        {tab.columns.map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${column === 'Balance Due' || column === 'Days Overdue' ? 'text-right' : 'text-left'}`}>
                            {column}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[var(--card-background)]">
                      {currentRows.length > 0 ? (
                        currentRows.map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            {row.cells.map((cell, index) => renderCell(cell, index))}
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300" title="View detail">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button type="button" disabled className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 disabled:cursor-not-allowed disabled:opacity-40" title="Edit invoice is unavailable because overdue queue rows are already posted or partially paid">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button type="button" disabled className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40" title="Delete invoice is unavailable because overdue queue rows are already posted or partially paid">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={tab.columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                            No overdue invoice rows found.
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
                    <button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">
                      Previous
                    </button>
                    <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Invoice Detail" description="Review invoice header values, lines, totals, and dependency status from the overdue receivables queue.">
        <div className="space-y-6">
          {isViewLoading ? (
            <LoadingSkeleton />
          ) : viewDetail ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['Invoice No.', viewDetail.invoiceNumber],
                  ['Customer', viewDetail.customerLabel || '-'],
                  ['Invoice Date', viewDetail.invoiceDateLabel],
                  ['Posting Date', viewDetail.postingDateLabel],
                  ['Due Date', viewDetail.dueDateLabel],
                  ['Status', viewDetail.statusLabel],
                  ['Posting Status', viewDetail.postingStatusLabel],
                  ['Reference No.', viewDetail.referenceNumber || '-'],
                  ['Source Type', viewDetail.sourceType || '-'],
                  ['Source Reference', viewDetail.sourceReference || '-'],
                  ['Receivable Override', viewDetail.receivableAccountOverrideLabel || '-'],
                  ['Posted Journal', viewDetail.postedJournalEntryId || '-'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {[
                  ['Subtotal', viewDetail.subtotalLabel],
                  ['Tax Total', viewDetail.taxTotalLabel],
                  ['Discount Total', viewDetail.discountTotalLabel],
                  ['Total', viewDetail.totalLabel],
                  ['Balance Due', viewDetail.balanceDueLabel],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-800 dark:text-amber-400">
                Overdue queue rows come from posted or partially paid invoices, so edit and delete stay unavailable here for audit consistency.
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] shadow-sm">
                <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Invoice Lines</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        {['Line', 'Description', 'Income Account', 'Tax Code', 'Qty', 'Unit Price', 'Line Total'].map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${column === 'Qty' || column === 'Unit Price' || column === 'Line Total' ? 'text-right' : 'text-left'}`}>
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[var(--card-background)]">
                      {viewDetail.lineItems.length > 0 ? viewDetail.lineItems.map((line) => (
                        <tr key={line.id}>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{line.lineNumber}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{line.description}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{line.incomeAccountLabel || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{line.taxCodeLabel || '-'}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">{line.quantity}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">{formatCurrency(line.unitPrice)}</td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">{line.lineTotalLabel}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No invoice lines found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] shadow-sm">
                <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Support Documents</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        {['Category', 'Document Date', 'Primary', 'Notes'].map((column) => (
                          <th key={column} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[var(--card-background)]">
                      {viewDetail.documentLinks.length > 0 ? viewDetail.documentLinks.map((documentLink) => (
                        <tr key={documentLink.id}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{documentLink.documentCategoryLabel || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{documentLink.documentDateLabel}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{documentLink.isPrimary ? 'Yes' : 'No'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{documentLink.notes || '-'}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No support documents linked.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-4 text-sm text-gray-700 dark:text-gray-300">
                <p className="font-medium text-gray-900 dark:text-gray-100">Dependencies</p>
                <p className="mt-2">Line Items: {viewDetail.usageSummary.lineItemCount}</p>
                <p>Applied Payments: {viewDetail.usageSummary.appliedPaymentsCount}</p>
                <p>Applied Credit Notes: {viewDetail.usageSummary.appliedCreditNotesCount}</p>
                <p>Support Documents: {viewDetail.usageSummary.documentCount}</p>
                <p>Has Blocking Dependents: {viewDetail.usageSummary.hasDependents ? 'Yes' : 'No'}</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No details available.</p>
          )}

          <div className="flex justify-end pt-4">
            <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 dark:bg-[var(--card-background)] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800">
              Close
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}

function AccountsReceivableAgingPanel({ tab }: { tab: (typeof TABS)[number] }) {
  const [data, setData] = useState<AgingInvoiceRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<AgingFilterState>({ statuses: [], customerIds: [], agingBuckets: [] });
  const [draftFilters, setDraftFilters] = useState<AgingFilterState>({ statuses: [], customerIds: [], agingBuckets: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [viewDetail, setViewDetail] = useState<InvoiceDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);

  const filterCount = filters.statuses.length + filters.customerIds.length + filters.agingBuckets.length;

  const fetchRegister = useCallback(async ({
    search,
    page,
    nextFilters,
    nextQuickFilters,
  }: {
    search: string;
    page: number;
    nextFilters: AgingFilterState;
    nextQuickFilters: string[];
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAccountsReceivableAging({
        search,
        page,
        statuses: nextFilters.statuses,
        customerIds: nextFilters.customerIds,
        agingBuckets: nextFilters.agingBuckets,
        quickFilters: nextQuickFilters,
      });
      setData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load accounts receivable aging.');
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

  const handleRefresh = () => {
    void fetchRegister({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  };

  const handleExport = () => {
    const rows = data?.rows || [];
    if (!rows.length) return;

    const headers = ['Customer', 'Invoice No.', 'Due Date', 'Balance Due', 'Days Overdue', 'Aging Bucket', 'Status'];
    const csvRows = rows.map((row) => [
      row.customerLabel,
      row.invoiceNumber,
      row.dueDateLabel,
      row.balanceDueLabel,
      row.daysOverdueLabel,
      row.agingBucketLabel,
      row.statusLabel,
    ]);
    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'collections-ar-aging.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleToggleQuickFilter = (value: string) => {
    setQuickFilters((previous) => toggleFilterValue(previous, value));
    setCurrentPage(1);
  };

  const handleView = async (id: string) => {
    setIsViewOpen(true);
    setIsViewLoading(true);
    setViewDetail(null);
    try {
      const detail = await getOverdueInvoiceDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load invoice detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const currentRows = data?.rows || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{data?.meta.label || tab.label}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{data?.meta.description || tab.description}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" />
            Refresh Aging
          </button>
          <button type="button" onClick={handleExport} disabled={!currentRows.length} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50">
            <Download className="h-4 w-4" />
            Download View
          </button>
        </div>
      </div>

      {data?.metrics?.length ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {data.metrics.map((metric) => (
            <div key={metric.id}>
              <MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} />
            </div>
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
                  placeholder={data?.meta.searchPlaceholder || tab.searchPlaceholder}
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:border-blue-600 dark:focus:ring-blue-900/50"
                />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 dark:bg-blue-700 dark:border-blue-700">
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
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isFilterPanelOpen || filterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-[var(--card-background)] dark:text-gray-300 dark:hover:bg-gray-800'}`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {filterCount > 0 ? <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-700 px-1.5 py-0.5 text-[11px] font-semibold text-white">{filterCount}</span> : null}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(data?.filterOptions.quickFilters || []).map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => handleToggleQuickFilter(filter.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${quickFilters.includes(filter.value) ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-200 dark:ring-blue-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
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
                  <button
                    type="button"
                    onClick={() => {
                      setDraftFilters({ statuses: [], customerIds: [], agingBuckets: [] });
                      setFilters({ statuses: [], customerIds: [], agingBuckets: [] });
                      setCurrentPage(1);
                      setIsFilterPanelOpen(false);
                    }}
                    className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Clear all
                  </button>
                  <button type="button" onClick={() => setIsFilterPanelOpen(false)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters({ ...draftFilters });
                      setCurrentPage(1);
                      setIsFilterPanelOpen(false);
                    }}
                    className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-700"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-3">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.statuses || []).map((option) => {
                      const selected = draftFilters.statuses.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, option.value) }))}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Customer</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.customers || []).map((option) => {
                      const selected = draftFilters.customerIds.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setDraftFilters((previous) => ({ ...previous, customerIds: toggleFilterValue(previous.customerIds, option.value) }))}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Aging Bucket</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.agingBuckets || []).map((option) => {
                      const selected = draftFilters.agingBuckets.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setDraftFilters((previous) => ({ ...previous, agingBuckets: toggleFilterValue(previous.agingBuckets, option.value) }))}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
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
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{data?.meta.tableTitle || tab.tableTitle}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{data?.meta.tableDescription || tab.tableDescription}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span className="text-sm text-gray-500 dark:text-gray-400">{data?.totals.filteredRows ?? 0} matching rows</span>
            </div>
          </div>

          {error ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[var(--card-border)]">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        {tab.columns.map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${column === 'Balance Due' || column === 'Days Overdue' ? 'text-right' : 'text-left'}`}>
                            {column}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[var(--card-background)]">
                      {currentRows.length > 0 ? (
                        currentRows.map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            {row.cells.map((cell, index) => renderCell(cell, index))}
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300" title="View detail">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button type="button" disabled className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 disabled:cursor-not-allowed disabled:opacity-40" title="Edit invoice is unavailable because aging rows are already posted or partially paid">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button type="button" disabled className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40" title="Delete invoice is unavailable because aging rows are already posted or partially paid">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={tab.columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                            No accounts receivable aging rows found.
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
                    <button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">
                      Previous
                    </button>
                    <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Invoice Detail" description="Review invoice header values, lines, totals, and dependency status from the AR aging view.">
        <div className="space-y-6">
          {isViewLoading ? (
            <LoadingSkeleton />
          ) : viewDetail ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['Invoice No.', viewDetail.invoiceNumber],
                  ['Customer', viewDetail.customerLabel || '-'],
                  ['Invoice Date', viewDetail.invoiceDateLabel],
                  ['Posting Date', viewDetail.postingDateLabel],
                  ['Due Date', viewDetail.dueDateLabel],
                  ['Status', viewDetail.statusLabel],
                  ['Posting Status', viewDetail.postingStatusLabel],
                  ['Reference No.', viewDetail.referenceNumber || '-'],
                  ['Source Type', viewDetail.sourceType || '-'],
                  ['Source Reference', viewDetail.sourceReference || '-'],
                  ['Receivable Override', viewDetail.receivableAccountOverrideLabel || '-'],
                  ['Posted Journal', viewDetail.postedJournalEntryId || '-'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {[
                  ['Subtotal', viewDetail.subtotalLabel],
                  ['Tax Total', viewDetail.taxTotalLabel],
                  ['Discount Total', viewDetail.discountTotalLabel],
                  ['Total', viewDetail.totalLabel],
                  ['Balance Due', viewDetail.balanceDueLabel],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-800 dark:text-amber-400">
                Aging rows come from posted or partially paid invoices, so edit and delete stay unavailable here for audit consistency.
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No details available.</p>
          )}

          <div className="flex justify-end pt-4">
            <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 dark:bg-[var(--card-background)] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800">
              Close
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}

export function CollectionsArMonitoringClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = TABS.find((tab) => tab.id === rawTab)?.id || 'overdue-invoices';
  const currentTab = TABS.find((tab) => tab.id === activeTab) || TABS[0];

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6 p-[10px]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Operations / Sales & Receivables</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">Collections & AR Monitoring</h1>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-400">Monitor overdue receivables and AR aging so customer balances and collection priorities stay visible.</p>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} type="button" onClick={() => handleTabChange(tab.id)} className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${isActive ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'}`}>
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === 'overdue-invoices' ? (
        <OverdueInvoicesPanel tab={currentTab} />
      ) : activeTab === 'accounts-receivable-aging' ? (
        <AccountsReceivableAgingPanel tab={currentTab} />
      ) : null}
    </div>
  );
}
