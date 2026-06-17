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
  getAccountsPayableAging,
  getAccountsPayableAgingBillDetail,
  type AccountsPayableAgingRegisterResponse,
  type ApMonitoringCell,
  type ApMonitoringMetric,
} from './actions';
import { DueDateQueuePanel } from './DueDateQueuePanel';
import type { BillDetail } from '../purchase-documents/actions';

type TabId = 'accounts-payable-aging' | 'due-date-queue';
type AgingFilterState = { statuses: string[]; vendorIds: string[]; agingBuckets: string[] };

const TABS = [
  {
    id: 'accounts-payable-aging' as TabId,
    label: 'Accounts Payable Aging',
    description: 'Review accounts payable aging using balance due, due dates, and days-overdue buckets from open bills.',
    searchPlaceholder: 'Search vendor, bill no., due date, balance, or aging bucket',
    columns: ['Vendor', 'Bill No.', 'Due Date', 'Balance Due', 'Days Overdue', 'Aging Bucket'],
    tableTitle: 'AP Aging Detail',
    tableDescription: 'Bill-level payable aging using due dates, remaining balances, and days-overdue calculations.',
  },
  {
    id: 'due-date-queue' as TabId,
    label: 'Due Date Queue',
    description: 'Track open bills by due date, remaining balance, and settlement status for daily AP review.',
    searchPlaceholder: 'Search bill no., vendor, due date, balance due, or status',
    columns: ['Bill No.', 'Vendor', 'Bill Date', 'Due Date', 'Balance Due', 'Status'],
    tableTitle: 'Open Bill Due Queue',
    tableDescription: 'Daily payable queue focused on due dates, balance due, and current document status.',
  },
];

function getActionClasses(v: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (v === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  if (v === 'ghost') return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
}

function getMetricTone(t: ApMonitoringMetric['trend']) {
  if (t === 'down') return 'text-red-600 bg-red-50';
  if (t === 'neutral') return 'text-gray-600 bg-gray-100';
  return 'text-green-600 bg-green-50';
}

function escapeCsvValue(v: string | number | boolean | null | undefined) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toggleFilterValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
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
        className={`flex w-full max-w-5xl flex-col bg-white shadow-xl transition-all duration-300 ease-in-out ${animate ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
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
                {Array.from({ length: columnCount + 1 }).map((_, i) => (
                  <th key={i} className="px-4 py-3"><div className="h-4 w-24 animate-pulse rounded bg-gray-200" /></th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={columnCount + 1} className="px-4 py-3"><div className="h-6 animate-pulse rounded bg-gray-100" /></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function renderCell(cell: ApMonitoringCell, index: number) {
  if (typeof cell === 'string') {
    return <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{cell}</td>;
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
    return <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${alignClass}`}><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${toneMap[cell.tone] || toneMap.gray}`}>{cell.text}</span></td>;
  }
  return <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${cell.emphasis ? 'font-semibold text-gray-900' : 'text-gray-600'} ${alignClass}`}>{cell.text}</td>;
}

function AccountsPayableAgingPanel({ tab }: { tab: (typeof TABS)[number] }) {
  const [data, setData] = useState<AccountsPayableAgingRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<AgingFilterState>({ statuses: [], vendorIds: [], agingBuckets: [] });
  const [draftFilters, setDraftFilters] = useState<AgingFilterState>({ statuses: [], vendorIds: [], agingBuckets: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [viewDetail, setViewDetail] = useState<BillDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);

  const filterCount = filters.statuses.length + filters.vendorIds.length + filters.agingBuckets.length;

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
      const response = await getAccountsPayableAging({
        search,
        page,
        statuses: nextFilters.statuses,
        vendorIds: nextFilters.vendorIds,
        agingBuckets: nextFilters.agingBuckets,
        quickFilters: nextQuickFilters,
      });
      setData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load accounts payable aging.');
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
    void fetchRegister({ search: searchInput, page: 1, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleRefresh = () => {
    void fetchRegister({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleExport = () => {
    const rows = data?.rows || [];
    if (!rows.length) return;
    const headers = ['Vendor', 'Bill No.', 'Due Date', 'Balance Due', 'Days Overdue', 'Aging Bucket', 'Status'];
    const csvRows = rows.map((row) => [row.vendorLabel, row.billNumber, row.dueDateLabel, row.balanceDueLabel, row.daysOverdueLabel, row.agingBucketLabel, row.statusLabel]);
    const csvContent = [headers, ...csvRows].map((row) => row.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'accounts-payable-aging.csv';
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
      const detail = await getAccountsPayableAgingBillDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load bill detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const currentRows = data?.rows || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">{data?.meta.label || tab.label}</h2>
          <p className="text-sm text-gray-600">{data?.meta.description || tab.description}</p>
          <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" />
            Refresh Aging
          </button>
          <button type="button" onClick={handleExport} disabled={!currentRows.length} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
            <Download className="h-4 w-4" />
            Download View
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
                  <p className="mt-1 text-sm text-gray-600">Select as many values as needed. All checked filters widen the result set using OR logic.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDraftFilters({ statuses: [], vendorIds: [], agingBuckets: [] });
                      setFilters({ statuses: [], vendorIds: [], agingBuckets: [] });
                      setCurrentPage(1);
                      setIsFilterPanelOpen(false);
                    }}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </button>
                  <button type="button" onClick={() => setIsFilterPanelOpen(false)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
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
                          onClick={() => setDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, option.value) }))}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Vendor</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.vendors || []).map((option) => {
                      const selected = draftFilters.vendorIds.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setDraftFilters((previous) => ({ ...previous, vendorIds: toggleFilterValue(previous.vendorIds, option.value) }))}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Aging Bucket</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.agingBuckets || []).map((option) => {
                      const selected = draftFilters.agingBuckets.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setDraftFilters((previous) => ({ ...previous, agingBuckets: toggleFilterValue(previous.agingBuckets, option.value) }))}
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
                        {tab.columns.map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Balance Due' || column === 'Days Overdue' ? 'text-right' : 'text-left'}`}>
                            {column}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {currentRows.length > 0 ? (
                        currentRows.map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50">
                            {row.cells.map((cell, index) => renderCell(cell, index))}
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button type="button" disabled className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40" title="Edit bill is unavailable because aging rows are already posted or partially paid">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button type="button" disabled className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40" title="Delete bill is unavailable because aging rows are already posted or partially paid">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={tab.columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">
                            No accounts payable aging rows found.
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

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Bill Detail" description="Review bill header values, lines, totals, and dependency status from the AP aging view.">
        <div className="space-y-6">
          {isViewLoading ? (
            <LoadingSkeleton />
          ) : viewDetail ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['Bill No.', viewDetail.billNumber],
                  ['Vendor', viewDetail.vendorLabel || '-'],
                  ['Bill Date', viewDetail.billDateLabel],
                  ['Posting Date', viewDetail.postingDateLabel],
                  ['Due Date', viewDetail.dueDateLabel],
                  ['Status', viewDetail.statusLabel],
                  ['Posting Status', viewDetail.postingStatusLabel],
                  ['Reference No.', viewDetail.referenceNumber || '-'],
                  ['Payable Override', viewDetail.payableAccountOverrideLabel || '-'],
                  ['Posted Journal', viewDetail.postedJournalEntryId || '-'],
                  ['Vendor Currency', viewDetail.vendorCurrency || '-'],
                  ['Vendor Terms', viewDetail.vendorPaymentTerms || '-'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {[
                  ['Subtotal', viewDetail.subtotalLabel],
                  ['Tax Total', viewDetail.taxTotalLabel],
                  ['Total', viewDetail.totalLabel],
                  ['Balance Due', viewDetail.balanceDueLabel],
                  ['Exchange Rate', String(viewDetail.exchangeRate || 1)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-2 text-sm font-semibold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Line Items</h4>
                    <p className="mt-1 text-sm text-gray-600">Expense or asset allocations recorded against this bill.</p>
                  </div>
                  <div className="text-sm text-gray-500">{viewDetail.usageSummary.lineItemCount} line(s)</div>
                </div>
                <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {['Line', 'Description', 'Account', 'Tax Code', 'Total'].map((column) => (
                            <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Total' ? 'text-right' : 'text-left'}`}>
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {viewDetail.lineItems.length > 0 ? (
                          viewDetail.lineItems.map((line) => (
                            <tr key={line.id}>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{line.lineNumber}</td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{line.description}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{line.accountLabel}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{line.taxCodeLabel || '-'}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-gray-900">{line.lineTotalLabel}</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">No line items found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </SlideOver>
    </div>
  );
}

export function ApMonitoringClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = TABS.find((tab) => tab.id === rawTab)?.id || 'accounts-payable-aging';
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
          <p className="text-sm font-medium text-blue-600">Operations / Purchases & Payables</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">AP Monitoring</h1>
          <p className="mt-1 text-base text-gray-600">
            Monitor payable aging and open-bill due dates so AP exposure and settlement timing stay visible.
          </p>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
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

      {activeTab === 'accounts-payable-aging' ? (
        <AccountsPayableAgingPanel tab={currentTab} />
      ) : (
        <DueDateQueuePanel tab={currentTab} />
      )}
    </div>
  );
}
