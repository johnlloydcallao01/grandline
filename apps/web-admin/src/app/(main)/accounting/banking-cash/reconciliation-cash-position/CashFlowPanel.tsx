'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Eye,
  Filter,
  RefreshCw,
  Search,
  Wallet,
  X,
} from 'lucide-react';
import {
  getCashFlow,
  getCashFlowDetail,
  type CashFlowCell,
  type CashFlowDetail,
  type CashFlowMetric,
  type CashFlowRegisterResponse,
} from './actions';

type FilterState = {
  accountTypes: string[];
  liquidityStates: string[];
  reconciliationStates: string[];
};

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') return 'border border-blue-600 dark:border-blue-700 bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 hover:border-blue-700';
   if (variant === 'ghost') return 'border border-transparent bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-300';
  return 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800';
}

function getMetricTone(trend: CashFlowMetric['trend']) {
  if (trend === 'down') return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30';
  if (trend === 'neutral') return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
  return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/30';
}

function toggleFilterValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function escapeCsvValue(value: string | number | boolean | null | undefined) {
  const normalized = String(value ?? '');
  return /[",\n]/.test(normalized) ? `"${normalized.replace(/"/g, '""')}"` : normalized;
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
  const [mounted, setMounted] = useState(isOpen);
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
        className={`flex h-full w-full ${width} flex-col bg-white dark:bg-[var(--card-background)] shadow-xl transition-all duration-300 ease-in-out ${animate ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            {description ? <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300"
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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-5 shadow-sm">
            <div className="h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-4 h-8 w-32 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
            <div className="mt-4 h-5 w-44 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[var(--card-border)]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                {Array.from({ length: 7 }).map((_, index) => (
                  <th key={index} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[var(--card-background)]">
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
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

function renderCell(cell: CashFlowCell, index: number) {
  if (typeof cell === 'string') {
    return (
      <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
        {cell}
      </td>
    );
  }

  const alignClass = cell.align === 'right' ? 'text-right' : cell.align === 'center' ? 'text-center' : 'text-left';
  if (cell.tone) {
    const toneMap: Record<string, string> = {
      amber: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:ring-amber-800',
      green: 'bg-green-50 text-green-700 ring-green-200 dark:bg-green-950/30 dark:text-green-400 dark:ring-green-800',
      gray: 'bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700',
      blue: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-800',
      red: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/30 dark:text-red-400 dark:ring-red-800',
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
    <td
      key={index}
      className={`whitespace-nowrap px-4 py-3 text-sm ${cell.emphasis ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'} ${alignClass}`}
    >
      {cell.text}
    </td>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
}

export function CashFlowPanel() {
  const [data, setData] = useState<CashFlowRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    accountTypes: [],
    liquidityStates: [],
    reconciliationStates: [],
  });
  const [draftFilters, setDraftFilters] = useState<FilterState>({
    accountTypes: [],
    liquidityStates: [],
    reconciliationStates: [],
  });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [viewDetail, setViewDetail] = useState<CashFlowDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);

  const filterCount = filters.accountTypes.length + filters.liquidityStates.length + filters.reconciliationStates.length;

  const fetchData = useCallback(
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
        const response = await getCashFlow({
          search,
          page,
          accountTypes: nextFilters.accountTypes,
          liquidityStates: nextFilters.liquidityStates,
          reconciliationStates: nextFilters.reconciliationStates,
          quickFilters: nextQuickFilters,
        });
        setData(response);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load cash-flow data.');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchData({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  }, [currentPage, fetchData, filters, quickFilters, submittedSearch]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    void fetchData({
      search: submittedSearch,
      page: currentPage,
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

    const headers = ['Account', 'Current Balance', '30-Day Inflows', '30-Day Outflows', '30-Day Net', '7-Day Projected Close', 'Risk', 'Reconciliation', 'Latest Variance'];
    const csvRows = rows.map((row) => [
      row.bankAccountLabel,
      row.currentBalanceLabel,
      row.rollingInflow30Label,
      row.rollingOutflow30Label,
      row.netMovement30Label,
      row.projectedClosingBalanceLabel,
      row.liquidityStateLabel,
      row.reconciliationStateLabel,
      row.latestReconciliationDifferenceLabel,
    ]);
    const csvContent = [headers.map((header) => escapeCsvValue(header)), ...csvRows.map((row) => row.map((cell) => escapeCsvValue(cell)))]
      .map((row) => row.join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cash-flow-view.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenView = async (id: string) => {
    setIsViewOpen(true);
    setIsViewLoading(true);
    setViewDetail(null);
    setViewError(null);
    try {
      const detail = await getCashFlowDetail(id);
      setViewDetail(detail);
    } catch (requestError) {
      setViewError(requestError instanceof Error ? requestError.message : 'Unable to load cash-flow detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const tableColumns = useMemo(
    () => data?.meta.columns || [
      'Account',
      { label: 'Current Balance', align: 'right' },
      { label: '30-Day Inflows', align: 'right' },
      { label: '30-Day Outflows', align: 'right' },
      { label: '7-Day Projected Close', align: 'right' },
      'Risk',
    ],
    [data?.meta.columns],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{data?.meta.label || 'Cash Flow'}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {data?.meta.description || 'Monitor current balances, rolling movement, and short-horizon liquidity projections.'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Cash Flow
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

      <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-[var(--card-border)] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <form onSubmit={handleSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={data?.meta.searchPlaceholder || 'Search liquidity account or reconciliation posture'}
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50"
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
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isFilterPanelOpen || filterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
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
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${quickFilters.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 p-5">
          {isFilterPanelOpen ? (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-background)] p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Filters</h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Select any combination of filter values to widen the visible cash-flow set.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const cleared = { accountTypes: [], liquidityStates: [], reconciliationStates: [] };
                      setDraftFilters(cleared);
                      setFilters(cleared);
                      setQuickFilters([]);
                      setCurrentPage(1);
                      setIsFilterPanelOpen(false);
                    }}
                    className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    Clear all
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDraftFilters({ ...filters });
                      setIsFilterPanelOpen(false);
                    }}
                    className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
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
                    className="rounded-lg border border-blue-600 dark:border-blue-700 bg-blue-600 dark:bg-blue-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-800"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-3">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Account Type</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.accountTypes || []).map((option) => {
                      const isSelected = draftFilters.accountTypes.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setDraftFilters((previous) => ({ ...previous, accountTypes: toggleFilterValue(previous.accountTypes, option.value) }))}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Liquidity</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.liquidityStates || []).map((option) => {
                      const isSelected = draftFilters.liquidityStates.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setDraftFilters((previous) => ({ ...previous, liquidityStates: toggleFilterValue(previous.liquidityStates, option.value) }))}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Reconciliation</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.reconciliationStates || []).map((option) => {
                      const isSelected = draftFilters.reconciliationStates.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setDraftFilters((previous) => ({ ...previous, reconciliationStates: toggleFilterValue(previous.reconciliationStates, option.value) }))}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
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
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{data?.meta.tableTitle || 'Cash Position By Account'}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {data?.meta.tableDescription || 'Live liquidity view derived from current balances and recent posted cash movement.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span>{data?.totals.filteredRows ?? 0} matching rows</span>
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!(data?.rows.length)}
              >
                <Download className="h-4 w-4" />
                Export View
              </button>
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
                        {tableColumns.map((column) => {
                          const label = typeof column === 'string' ? column : column.label;
                          const align = typeof column === 'string' ? 'left' : column.align;
                          return (
                            <th
                              key={label}
                              className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${align === 'right' ? 'text-right' : 'text-left'}`}
                            >
                              {label}
                            </th>
                          );
                        })}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[var(--card-background)]">
                      {(data?.rows || []).length > 0 ? (
                        (data?.rows || []).map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            {row.cells.map((cell, index) => renderCell(cell, index))}
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenView(row.id)}
                                  className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200"
                                  title="View detail"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={tableColumns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                            No cash-flow rows match the current search and filter combination.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {data?.pagination && data.pagination.totalPages > 1 ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Page {data.pagination.page} of {data.pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!data.pagination.hasPrevPage}
                      onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
                      className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={!data.pagination.hasNextPage}
                      onClick={() => setCurrentPage((previous) => previous + 1)}
                      className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
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
        title={viewDetail?.bankAccountLabel || 'Cash Flow Detail'}
        description="Review the account balance, rolling movement, short-horizon projection, and recent liquidity activity."
      >
        <div className="space-y-6">
          {viewError ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {viewError}
            </div>
          ) : null}

          {isViewLoading ? (
            <LoadingSkeleton />
          ) : viewDetail ? (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <SummaryItem label="Account" value={viewDetail.bankAccountLabel} />
                <SummaryItem label="Type" value={viewDetail.accountTypeLabel || '-'} />
                <SummaryItem label="Ledger Account" value={viewDetail.ledgerAccountLabel || '-'} />
                <SummaryItem label="Current Balance" value={viewDetail.summary.currentBalanceLabel} />
                <SummaryItem label="30-Day Net Movement" value={viewDetail.summary.netMovement30Label} />
                <SummaryItem label="7-Day Projected Close" value={viewDetail.summary.projectedClosingBalanceLabel} />
                <SummaryItem label="Average Daily Inflow" value={viewDetail.summary.averageDailyInflow30Label} />
                <SummaryItem label="Average Daily Outflow" value={viewDetail.summary.averageDailyOutflow30Label} />
                <SummaryItem label="Liquidity State" value={viewDetail.liquidityStateLabel} />
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Account Context</h4>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-[var(--card-border)] pb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Bank</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{viewDetail.bankName || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-[var(--card-border)] pb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Account No.</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{viewDetail.accountNumberMasked || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-[var(--card-border)] pb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Branch</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{viewDetail.branchName || '-'}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-[var(--card-border)] pb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">30-Day Inflows</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{viewDetail.summary.rollingInflow30Label}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-[var(--card-border)] pb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">30-Day Outflows</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{viewDetail.summary.rollingOutflow30Label}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-[var(--card-border)] pb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Projected 7-Day Net</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{viewDetail.summary.projectedNet7Label}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Latest Reconciliation</h4>
                {viewDetail.latestReconciliation ? (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <SummaryItem label="Session" value={viewDetail.latestReconciliation.sessionLabel} />
                    <SummaryItem label="Status" value={viewDetail.latestReconciliation.statusLabel} />
                    <SummaryItem label="Statement Period" value={viewDetail.latestReconciliation.statementPeriodLabel} />
                    <SummaryItem label="Variance" value={viewDetail.latestReconciliation.differenceLabel} />
                    <SummaryItem label="Matched Items" value={String(viewDetail.latestReconciliation.matchedTransactionCount)} />
                    <SummaryItem label="Unmatched Items" value={String(viewDetail.latestReconciliation.unmatchedTransactionCount)} />
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">No reconciliation session is currently available for this account.</p>
                )}
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] shadow-sm">
                <div className="border-b border-gray-200 dark:border-[var(--card-border)] px-5 py-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent Cash Activity</h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Latest posted cash movement contributing to the rolling cash-flow profile.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        {['Date', 'Document', 'Source', 'Direction', 'Amount', 'Status'].map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${column === 'Amount' ? 'text-right' : 'text-left'}`}>
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[var(--card-background)]">
                      {viewDetail.recentActivities.length ? (
                        viewDetail.recentActivities.map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            {row.cells.map((cell, index) => renderCell(cell, index))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            No posted cash activity is available for this account yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] shadow-sm">
                <div className="border-b border-gray-200 dark:border-[var(--card-border)] px-5 py-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent Bank Transactions</h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Latest statement-side items associated with this account.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        {['Date', 'Reference', 'Description', 'Amount', 'Running Balance', 'Match Status'].map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${column === 'Amount' || column === 'Running Balance' ? 'text-right' : 'text-left'}`}>
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[var(--card-background)]">
                      {viewDetail.recentBankTransactions.length ? (
                        viewDetail.recentBankTransactions.map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            {row.cells.map((cell, index) => renderCell(cell, index))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            No bank transactions are currently available for this account.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No details available.</p>
          )}
        </div>
      </SlideOver>
    </div>
  );
}
