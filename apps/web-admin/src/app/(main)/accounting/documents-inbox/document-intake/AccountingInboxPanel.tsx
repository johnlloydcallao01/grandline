'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  ExternalLink,
  Eye,
  Filter,
  RefreshCw,
  Search,
  Upload,
  Wallet,
  X,
} from 'lucide-react';
import { MediaUploader } from '@/components/cms/MediaUploader';
import {
  getAccountingInbox,
  getAccountingInboxDetail,
  type AccountingInboxCell,
  type AccountingInboxDetail,
  type AccountingInboxMetric,
  type AccountingInboxRegisterResponse,
} from './actions';

type FilterState = {
  mimeFamilies: string[];
  statuses: string[];
  categories: string[];
};

type AccountingInboxPanelProps = {
  title: string;
  description: string;
  searchPlaceholder: string;
  tableTitle: string;
  tableDescription: string;
  uploadButtonLabel: string;
  exportFileName: string;
  emptyStateMessage: string;
  defaultQuickFilters?: string[];
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

function getMetricTone(trend: AccountingInboxMetric['trend']) {
  if (trend === 'down') return 'text-red-600 bg-red-50';
  if (trend === 'neutral') return 'text-gray-600 bg-gray-100';
  return 'text-green-600 bg-green-50';
}

function escapeCsvValue(value: string | number | boolean | null | undefined) {
  const normalized = String(value ?? '');
  return /[",\n]/.test(normalized) ? `"${normalized.replace(/"/g, '""')}"` : normalized;
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
                <th className="px-4 py-3">
                  <div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-200" />
                </th>
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

function renderCell(cell: AccountingInboxCell, index: number) {
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
      blue: 'bg-blue-50 text-blue-700 ring-blue-200',
      gray: 'bg-gray-100 text-gray-700 ring-gray-200',
      green: 'bg-green-50 text-green-700 ring-green-200',
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

export function AccountingInboxPanel({
  title,
  description,
  searchPlaceholder,
  tableTitle,
  tableDescription,
  uploadButtonLabel,
  exportFileName,
  emptyStateMessage,
  defaultQuickFilters = [],
}: AccountingInboxPanelProps) {
  const [data, setData] = useState<AccountingInboxRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({ mimeFamilies: [], statuses: [], categories: [] });
  const [draftFilters, setDraftFilters] = useState<FilterState>({
    mimeFamilies: [],
    statuses: [],
    categories: [],
  });
  const [quickFilters, setQuickFilters] = useState<string[]>(defaultQuickFilters);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const [detail, setDetail] = useState<AccountingInboxDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadedMediaId, setUploadedMediaId] = useState<string>('');

  useEffect(() => {
    setQuickFilters(defaultQuickFilters);
    setFilters({ mimeFamilies: [], statuses: [], categories: [] });
    setDraftFilters({ mimeFamilies: [], statuses: [], categories: [] });
    setSearchInput('');
    setSubmittedSearch('');
    setCurrentPage(1);
  }, [defaultQuickFilters]);

  const fetchRegister = useCallback(
    async ({
      search,
      page,
      nextFilters,
      nextQuickFilters,
    }: {
      search: string;
      page: number;
      nextFilters: FilterState;
      nextQuickFilters: string[];
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getAccountingInbox({
          search,
          page,
          mimeFamilies: nextFilters.mimeFamilies,
          statuses: nextFilters.statuses,
          categories: nextFilters.categories,
          quickFilters: nextQuickFilters,
        });
        setData(response);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load accounting inbox.');
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

  const filterCount = filters.mimeFamilies.length + filters.statuses.length + filters.categories.length;

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

    const headers = ['File Name', 'File Type', 'Uploaded At', 'Link Count', 'Latest Link', 'Status'];
    const csvRows = rows.map((row) => [
      row.fileName,
      row.mimeFamilyLabel,
      row.uploadedAtLabel,
      row.linkCountLabel,
      row.latestLinkLabel,
      row.statusLabel,
    ]);
    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleViewDetail = async (id: string) => {
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    setDetail(null);
    try {
      setDetail(await getAccountingInboxDetail(id));
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load file detail.');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleOpenUpload = () => {
    setUploadedMediaId('');
    setIsUploadOpen(true);
  };

  const detailEnabledIds = useMemo(
    () => new Set(data?.flags.detailEnabledIds || []),
    [data?.flags.detailEnabledIds],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600">{description}</p>
          <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleOpenUpload}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}
          >
            <Upload className="h-4 w-4" />
            {uploadButtonLabel}
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Inbox
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={!data?.rows.length}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export View
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
                  placeholder={searchPlaceholder}
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
                      setDraftFilters({ mimeFamilies: [], statuses: [], categories: [] });
                      setFilters({ mimeFamilies: [], statuses: [], categories: [] });
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
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">File Type</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.mimeFamilies || []).map((option) => {
                      const selected = draftFilters.mimeFamilies.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setDraftFilters((previous) => ({
                              ...previous,
                              mimeFamilies: toggleFilterValue(previous.mimeFamilies, option.value),
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
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">{tableTitle}</h3>
              <p className="text-sm text-gray-600">{tableDescription}</p>
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
                        {(data?.meta.columns || []).map((column) => {
                          const label = typeof column === 'string' ? column : column.label;
                          const align =
                            typeof column === 'string'
                              ? 'text-left'
                              : column.align === 'right'
                                ? 'text-right'
                                : column.align === 'center'
                                  ? 'text-center'
                                  : 'text-left';
                          return (
                            <th
                              key={label}
                              className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${align}`}
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
                        (data?.rows || []).map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50">
                            {row.cells.map((cell, index) => renderCell(cell, index))}
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleViewDetail(row.id)}
                                  disabled={!detailEnabledIds.has(row.id)}
                                  className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                                  title="View file detail"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                            {emptyStateMessage}
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
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title={uploadButtonLabel}
        description="Upload a real file into the shared media library. It will appear in this inbox immediately after the upload completes."
      >
        <div className="space-y-6">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            Uploads created here enter the accounting inbox first. Link the file from the relevant accounting workspace when you are ready to attach it to a bill, expense, banking record, or other finance document.
          </div>
          <MediaUploader
            value={uploadedMediaId}
            onChange={(value) => setUploadedMediaId(String(value || ''))}
            accept=""
            maxSize={20}
          />
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-gray-900">Upload Status</p>
            <p className="mt-2 text-sm text-gray-600">
              {uploadedMediaId
                ? `Media ${uploadedMediaId} has been uploaded and is ready for review in the inbox.`
                : 'Select a file above to upload it into the accounting inbox.'}
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => setIsUploadOpen(false)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setIsUploadOpen(false);
                handleRefresh();
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${getActionClasses('primary')}`}
            >
              Done
            </button>
          </div>
        </div>
      </SlideOver>

      <SlideOver
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Inbox File Detail"
        description="Review file metadata, current linkage coverage, and the accounting records already connected to this upload."
      >
        <div className="space-y-6">
          {isDetailLoading ? (
            <LoadingSkeleton />
          ) : detail ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['File Name', detail.fileName],
                  ['File Type', detail.mimeTypeLabel || detail.mimeFamilyLabel],
                  ['File Size', detail.fileSizeLabel],
                  ['Uploaded At', detail.uploadedAtLabel],
                  ['Status', detail.statusLabel],
                  ['Link Count', detail.linkCountLabel],
                  ['Latest Link', detail.latestLinkLabel],
                  ['Latest Linked At', detail.latestLinkedAtLabel],
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
                    <h4 className="text-sm font-semibold text-gray-900">File Access</h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Open the uploaded file directly from Cloudinary or the stored media URL.
                    </p>
                  </div>
                  {detail.fileUrl ? (
                    <a
                      href={detail.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open File
                    </a>
                  ) : null}
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Alt Text</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{detail.altText || '-'}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Cloudinary Public ID</p>
                    <p className="mt-2 break-all text-sm font-medium text-gray-900">
                      {detail.cloudinaryPublicId || '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900">Linkage Summary</h4>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Document Categories</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{detail.usageSummary.categorySummary}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Entity Types</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{detail.usageSummary.entityTypeSummary}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Linked Accounting Records</h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Document-link records currently attached to this uploaded file.
                    </p>
                  </div>
                </div>
                {detail.linkedRecords.length > 0 ? (
                  <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {['Link Ref', 'Entity', 'Category', 'Document Date', 'Uploaded By', 'State'].map((column) => (
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
                          {detail.linkedRecords.map((linkedRecord) => (
                            <tr key={linkedRecord.id}>
                              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                                {linkedRecord.linkReference}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                {linkedRecord.entityLabel}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                {linkedRecord.documentCategoryLabel}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                {linkedRecord.documentDateLabel}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                {linkedRecord.uploadedByLabel}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                                    linkedRecord.stateTone === 'green'
                                      ? 'bg-green-50 text-green-700 ring-green-200'
                                      : linkedRecord.stateTone === 'amber'
                                        ? 'bg-amber-50 text-amber-700 ring-amber-200'
                                        : 'bg-blue-50 text-blue-700 ring-blue-200'
                                  }`}
                                >
                                  {linkedRecord.stateLabel}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    This file is currently unlinked. Link it from the relevant accounting workspace when you are ready to attach it to a finance record.
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">No file detail available.</p>
          )}
        </div>
      </SlideOver>
    </div>
  );
}
