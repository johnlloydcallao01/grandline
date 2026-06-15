'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
  getBeforeAfterHistory,
  getEntityHistory,
  type BeforeAfterHistoryResponse,
  type BeforeAfterHistoryRow,
  type EntityHistoryResponse,
  type EntityHistoryRow,
  type HistoryMetric,
} from './actions';

type TabId = 'entity-history' | 'before-after-history';
type EntityFilterState = { actionTypes: string[]; entityTypes: string[] };
type SnapshotFilterState = { actionTypes: string[]; snapshotTypes: string[] };
type TableCell = string | { text: string; tone?: string; emphasis?: boolean; align?: string };

const STATIC_TABS = [
  {
    id: 'entity-history' as TabId,
    label: 'Entity History',
    description: 'Review audit-log history by accounting entity using entity type, entity id, actor, action, and event time.',
    searchPlaceholder: 'Search entity type, entity id, action, user, or source field',
    columns: ['Performed At', 'Entity Type', 'Entity ID', 'Action', 'Performed By', 'Source Field'],
  },
  {
    id: 'before-after-history' as TabId,
    label: 'Before / After History',
    description: 'Inspect before-data and after-data snapshots stored in the finance audit trail for sensitive record changes.',
    searchPlaceholder: 'Search entity id, changed field, actor, reason, or snapshot key',
    columns: ['Performed At', 'Entity ID', 'Action', 'Before Data', 'After Data', 'Reason'],
  },
];


function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  if (variant === 'ghost') return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
}

function getMetricTone(trend: HistoryMetric['trend']) {
  if (trend === 'down') return 'text-red-600 bg-red-50';
  if (trend === 'neutral') return 'text-gray-600 bg-gray-100';
  return 'text-green-600 bg-green-50';
}

function escapeCsvValue(value: string | number | boolean | null | undefined) {
  const stringValue = String(value ?? '');
  return /[",\n]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
}

function toggleFilterValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function formatJsonValue(value: unknown) {
  try {
    return JSON.stringify(value ?? null, null, 2);
  } catch {
    return String(value ?? '');
  }
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
      return;
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
        className={`flex w-full max-w-lg flex-col bg-white shadow-xl transition-all duration-300 ease-in-out ${animate ? 'translate-x-0' : 'translate-x-full'}`}
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
    document.body
  );
}

function MetricCard({ label, value, change, trend = 'neutral' }: { label: string; value: string | number; change: string; trend?: HistoryMetric['trend'] }) {
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

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
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

function renderCell(cell: TableCell, index: number) {
  if (typeof cell === 'string') {
    return (
      <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
        {cell}
      </td>
    );
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

export function RecordHistoryClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = STATIC_TABS.find((tab) => tab.id === rawTab)?.id || 'entity-history';
  const currentTab = STATIC_TABS.find((tab) => tab.id === activeTab)!;

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const [entityData, setEntityData] = useState<EntityHistoryResponse | null>(null);
  const [snapshotData, setSnapshotData] = useState<BeforeAfterHistoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<EntityFilterState>({ actionTypes: [], entityTypes: [] });
  const [entityQuickFilters, setEntityQuickFilters] = useState<string[]>([]);
  const [draftFilters, setDraftFilters] = useState<EntityFilterState>({ actionTypes: [], entityTypes: [] });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [viewDetail, setViewDetail] = useState<EntityHistoryRow | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [snapshotSearchInput, setSnapshotSearchInput] = useState('');
  const [snapshotSubmittedSearch, setSnapshotSubmittedSearch] = useState('');
  const [snapshotCurrentPage, setSnapshotCurrentPage] = useState(1);
  const [snapshotFilters, setSnapshotFilters] = useState<SnapshotFilterState>({ actionTypes: [], snapshotTypes: [] });
  const [snapshotQuickFilters, setSnapshotQuickFilters] = useState<string[]>([]);
  const [snapshotDraftFilters, setSnapshotDraftFilters] = useState<SnapshotFilterState>({ actionTypes: [], snapshotTypes: [] });
  const [isSnapshotFilterPanelOpen, setIsSnapshotFilterPanelOpen] = useState(false);
  const [snapshotViewDetail, setSnapshotViewDetail] = useState<BeforeAfterHistoryRow | null>(null);
  const [isSnapshotViewOpen, setIsSnapshotViewOpen] = useState(false);

  const filterCount = filters.actionTypes.length + filters.entityTypes.length;
  const snapshotFilterCount = snapshotFilters.actionTypes.length + snapshotFilters.snapshotTypes.length;

  const fetchEntityData = useCallback(async ({
    search,
    page,
    nextFilters,
    nextQuickFilters,
  }: {
    search: string;
    page: number;
    nextFilters: EntityFilterState;
    nextQuickFilters: string[];
  }) => {
    if (activeTab !== 'entity-history') return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await getEntityHistory({
        search,
        page,
        actionTypes: nextFilters.actionTypes,
        entityTypes: nextFilters.entityTypes,
        quickFilters: nextQuickFilters,
      });
      setEntityData(result);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load entity history.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  const fetchSnapshotData = useCallback(async ({
    search,
    page,
    nextFilters,
    nextQuickFilters,
  }: {
    search: string;
    page: number;
    nextFilters: SnapshotFilterState;
    nextQuickFilters: string[];
  }) => {
    if (activeTab !== 'before-after-history') return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await getBeforeAfterHistory({
        search,
        page,
        actionTypes: nextFilters.actionTypes,
        snapshotTypes: nextFilters.snapshotTypes,
        quickFilters: nextQuickFilters,
      });
      setSnapshotData(result);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load before / after history.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'entity-history') {
      void fetchEntityData({
        search: submittedSearch,
        page: currentPage,
        nextFilters: filters,
        nextQuickFilters: entityQuickFilters,
      });
    }
  }, [activeTab, currentPage, entityQuickFilters, fetchEntityData, filters, submittedSearch]);

  useEffect(() => {
    if (activeTab === 'before-after-history') {
      void fetchSnapshotData({
        search: snapshotSubmittedSearch,
        page: snapshotCurrentPage,
        nextFilters: snapshotFilters,
        nextQuickFilters: snapshotQuickFilters,
      });
    }
  }, [activeTab, fetchSnapshotData, snapshotCurrentPage, snapshotFilters, snapshotQuickFilters, snapshotSubmittedSearch]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput);
    void fetchEntityData({
      search: searchInput,
      page: 1,
      nextFilters: filters,
      nextQuickFilters: entityQuickFilters,
    });
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    void fetchEntityData({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: entityQuickFilters,
    });
  };

  const handleSnapshotSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSnapshotSubmittedSearch(snapshotSearchInput);
    void fetchSnapshotData({
      search: snapshotSearchInput,
      page: 1,
      nextFilters: snapshotFilters,
      nextQuickFilters: snapshotQuickFilters,
    });
    setSnapshotCurrentPage(1);
  };

  const handleSnapshotRefresh = () => {
    void fetchSnapshotData({
      search: snapshotSubmittedSearch,
      page: snapshotCurrentPage,
      nextFilters: snapshotFilters,
      nextQuickFilters: snapshotQuickFilters,
    });
  };

  const handleToggleQuickFilter = (value: string) => {
    setEntityQuickFilters((previous) => toggleFilterValue(previous, value));
    setCurrentPage(1);
  };

  const handleToggleSnapshotQuickFilter = (value: string) => {
    setSnapshotQuickFilters((previous) => toggleFilterValue(previous, value));
    setSnapshotCurrentPage(1);
  };

  const handleExport = () => {
    const rows = entityData?.section.table.rows;
    if (!rows?.length) return;

    const headers = ['Performed At', 'Entity Type', 'Entity ID', 'Action', 'Performed By', 'Source Field', 'Reason', 'Metadata Summary'];
    const csvRows = rows.map((row) => [
      row.performedAtLabel,
      row.entityTypeLabel,
      row.entityId,
      row.actionLabel,
      row.performedBy,
      row.sourceFieldSummary,
      row.reason,
      row.metadataSummary,
    ]);
    const csvContent = [headers.map((header) => escapeCsvValue(header)), ...csvRows.map((row) => row.map((cell) => escapeCsvValue(cell)))]
      .map((row) => row.join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'entity-history.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSnapshotExport = () => {
    const rows = snapshotData?.section.table.rows;
    if (!rows?.length) return;

    const headers = ['Performed At', 'Entity ID', 'Action', 'Before Data', 'After Data', 'Reason', 'Snapshot Type', 'Changed Field Count'];
    const csvRows = rows.map((row) => [
      row.performedAtLabel,
      row.entityId,
      row.actionLabel,
      row.beforeSummary,
      row.afterSummary,
      row.reason,
      row.snapshotTypeLabel,
      row.changedFieldCount,
    ]);
    const csvContent = [headers.map((header) => escapeCsvValue(header)), ...csvRows.map((row) => row.map((cell) => escapeCsvValue(cell)))]
      .map((row) => row.join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'before-after-history.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Core / Audit & History</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Record History</h1>
          <p className="mt-1 text-base text-gray-600">
            Inspect entity activity and before/after snapshots to understand how finance records changed over time.
          </p>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {STATIC_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
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
        {activeTab === 'entity-history' ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-gray-900">{currentTab.label}</h2>
                <p className="text-sm text-gray-600">{currentTab.description}</p>
                <p className="text-sm text-gray-500">{entityData?.totals.filteredRows ?? 0} matching rows</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
                  <RefreshCw className="h-4 w-4" />
                  Refresh History
                </button>
              </div>
            </div>

            {entityData?.section.metrics?.length ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
                {entityData.section.metrics.map((metric) => (
                  <div key={metric.id}>
                    <MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} />
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
                        placeholder={currentTab.searchPlaceholder}
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
                    {filterCount > 0 ? (
                      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                        {filterCount}
                      </span>
                    ) : null}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(entityData?.section.filters.quickFilters || []).map((filter) => {
                    return (
                      <button
                        key={filter.value}
                        type="button"
                        onClick={() => handleToggleQuickFilter(filter.value)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${entityQuickFilters.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4 p-5">
                {isFilterPanelOpen ? (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Filters</h4>
                        <p className="mt-1 text-sm text-gray-600">Select as many filter values as needed, then apply them in one step.</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDraftFilters({ actionTypes: [], entityTypes: [] });
                            setFilters({ actionTypes: [], entityTypes: [] });
                            setCurrentPage(1);
                            setIsFilterPanelOpen(false);
                          }}
                          className="text-sm font-medium text-gray-500 hover:text-gray-700"
                        >
                          Clear all
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDraftFilters({ ...filters });
                            setIsFilterPanelOpen(false);
                          }}
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

                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                      <div>
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Action Type</h5>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(entityData?.section.filters.actionTypes || []).map((option) => {
                            const isSelected = draftFilters.actionTypes.includes(option.value);
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => setDraftFilters((previous) => ({ ...previous, actionTypes: toggleFilterValue(previous.actionTypes, option.value) }))}
                                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Entity Type</h5>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(entityData?.section.filters.entityTypes || []).map((option) => {
                            const isSelected = draftFilters.entityTypes.includes(option.value);
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => setDraftFilters((previous) => ({ ...previous, entityTypes: toggleFilterValue(previous.entityTypes, option.value) }))}
                                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}
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
                    <h3 className="text-base font-semibold text-gray-900">{entityData?.section.table.title || 'Entity Activity History'}</h3>
                    <p className="text-sm text-gray-600">{entityData?.section.table.description || 'Entity-oriented audit history showing who changed which accounting record and when.'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span>{entityData?.totals.filteredRows ?? 0} matching rows</span>
                    <button
                      type="button"
                      onClick={handleExport}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!(entityData?.section.table.rows.length)}
                    >
                      <Download className="h-4 w-4" />
                      Download View
                    </button>
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
                              {currentTab.columns.map((column) => (
                                <th key={column} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                  {column}
                                </th>
                              ))}
                              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {(entityData?.section.table.rows || []).length > 0 ? (
                              (entityData?.section.table.rows || []).map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50">
                                  {row.cells.map((cell, index) => renderCell(cell, index))}
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setViewDetail(row);
                                          setIsViewOpen(true);
                                        }}
                                        className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
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
                                <td colSpan={currentTab.columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">
                                  No entity-history rows found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {entityData?.pagination && entityData.pagination.totalPages > 1 ? (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">Page {entityData.pagination.page} of {entityData.pagination.totalPages}</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={!entityData.pagination.hasPrevPage}
                            onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <button
                            type="button"
                            disabled={!entityData.pagination.hasNextPage}
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
              title="Entity History Detail"
              description="Review the selected entity history event, including metadata and payload snapshots."
            >
              <div className="space-y-6">
                {viewDetail ? (
                  <>
                    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                      <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Performed At</span><span className="text-sm font-medium text-gray-900">{viewDetail.performedAtLabel}</span></div>
                      <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Entity Type</span><span className="text-sm font-medium text-gray-900">{viewDetail.entityTypeLabel}</span></div>
                      <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Entity ID</span><span className="text-sm font-medium text-gray-900">{viewDetail.entityId}</span></div>
                      <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Action</span><span className="text-sm font-medium text-gray-900">{viewDetail.actionLabel}</span></div>
                      <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Performed By</span><span className="text-sm font-medium text-gray-900">{viewDetail.performedBy}</span></div>
                      <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Source Field</span><span className="text-sm font-medium text-gray-900">{viewDetail.sourceFieldSummary}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-500">Reason</span><span className="text-right text-sm font-medium text-gray-900">{viewDetail.reason || '-'}</span></div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Metadata</h4>
                        <pre className="mt-2 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-700">{formatJsonValue(viewDetail.metadata)}</pre>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Before Data</h4>
                        <pre className="mt-2 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-700">{formatJsonValue(viewDetail.beforeData)}</pre>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">After Data</h4>
                        <pre className="mt-2 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-700">{formatJsonValue(viewDetail.afterData)}</pre>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No details available.</p>
                )}
                <div className="flex justify-end pt-4">
                  <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                    Close
                  </button>
                </div>
              </div>
            </SlideOver>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-gray-900">{currentTab.label}</h2>
                <p className="text-sm text-gray-600">{currentTab.description}</p>
                <p className="text-sm text-gray-500">{snapshotData?.totals.filteredRows ?? 0} matching rows</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={handleSnapshotRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
                  <RefreshCw className="h-4 w-4" />
                  Refresh Snapshots
                </button>
              </div>
            </div>

            {snapshotData?.section.metrics?.length ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
                {snapshotData.section.metrics.map((metric) => (
                  <div key={metric.id}>
                    <MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} />
                  </div>
                ))}
              </div>
            ) : null}

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                  <form onSubmit={handleSnapshotSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
                    <div className="relative min-w-0 flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder={currentTab.searchPlaceholder}
                        value={snapshotSearchInput}
                        onChange={(event) => setSnapshotSearchInput(event.target.value)}
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
                      if (!isSnapshotFilterPanelOpen) setSnapshotDraftFilters({ ...snapshotFilters });
                      setIsSnapshotFilterPanelOpen((previous) => !previous);
                    }}
                    className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isSnapshotFilterPanelOpen || snapshotFilterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {snapshotFilterCount > 0 ? (
                      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                        {snapshotFilterCount}
                      </span>
                    ) : null}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(snapshotData?.section.filters.quickFilters || []).map((filter) => {
                    return (
                      <button
                        key={filter.value}
                        type="button"
                        onClick={() => handleToggleSnapshotQuickFilter(filter.value)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${snapshotQuickFilters.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4 p-5">
                {isSnapshotFilterPanelOpen ? (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Filters</h4>
                        <p className="mt-1 text-sm text-gray-600">Select as many filter values as needed, then apply them in one step.</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSnapshotDraftFilters({ actionTypes: [], snapshotTypes: [] });
                            setSnapshotFilters({ actionTypes: [], snapshotTypes: [] });
                            setSnapshotCurrentPage(1);
                            setIsSnapshotFilterPanelOpen(false);
                          }}
                          className="text-sm font-medium text-gray-500 hover:text-gray-700"
                        >
                          Clear all
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSnapshotDraftFilters({ ...snapshotFilters });
                            setIsSnapshotFilterPanelOpen(false);
                          }}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSnapshotFilters({ ...snapshotDraftFilters });
                            setSnapshotCurrentPage(1);
                            setIsSnapshotFilterPanelOpen(false);
                          }}
                          className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                      <div>
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Action Type</h5>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(snapshotData?.section.filters.actionTypes || []).map((option) => {
                            const isSelected = snapshotDraftFilters.actionTypes.includes(option.value);
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => setSnapshotDraftFilters((previous) => ({ ...previous, actionTypes: toggleFilterValue(previous.actionTypes, option.value) }))}
                                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Snapshot Type</h5>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(snapshotData?.section.filters.snapshotTypes || []).map((option) => {
                            const isSelected = snapshotDraftFilters.snapshotTypes.includes(option.value);
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => setSnapshotDraftFilters((previous) => ({ ...previous, snapshotTypes: toggleFilterValue(previous.snapshotTypes, option.value) }))}
                                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}
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
                    <h3 className="text-base font-semibold text-gray-900">{snapshotData?.section.table.title || 'Before / After Snapshot History'}</h3>
                    <p className="text-sm text-gray-600">{snapshotData?.section.table.description || 'History of audit-log entries that preserve prior and resulting data for finance record changes.'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span>{snapshotData?.totals.filteredRows ?? 0} matching rows</span>
                    <button type="button" onClick={handleSnapshotExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!(snapshotData?.section.table.rows.length)}>
                      <Download className="h-4 w-4" />
                      Download View
                    </button>
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
                              {currentTab.columns.map((column) => (
                                <th key={column} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                  {column}
                                </th>
                              ))}
                              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {(snapshotData?.section.table.rows || []).length > 0 ? (
                              (snapshotData?.section.table.rows || []).map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50">
                                  {row.cells.map((cell, index) => renderCell(cell, index))}
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSnapshotViewDetail(row);
                                          setIsSnapshotViewOpen(true);
                                        }}
                                        className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
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
                                <td colSpan={currentTab.columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">
                                  No snapshot rows found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {snapshotData?.pagination && snapshotData.pagination.totalPages > 1 ? (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">Page {snapshotData.pagination.page} of {snapshotData.pagination.totalPages}</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={!snapshotData.pagination.hasPrevPage}
                            onClick={() => setSnapshotCurrentPage((previous) => Math.max(1, previous - 1))}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <button
                            type="button"
                            disabled={!snapshotData.pagination.hasNextPage}
                            onClick={() => setSnapshotCurrentPage((previous) => previous + 1)}
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
              isOpen={isSnapshotViewOpen}
              onClose={() => setIsSnapshotViewOpen(false)}
              title="Before / After Detail"
              description="Review the selected snapshot event, including before and after payloads."
            >
              <div className="space-y-6">
                {snapshotViewDetail ? (
                  <>
                    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                      <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Performed At</span><span className="text-sm font-medium text-gray-900">{snapshotViewDetail.performedAtLabel}</span></div>
                      <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Entity Type</span><span className="text-sm font-medium text-gray-900">{snapshotViewDetail.entityType || '-'}</span></div>
                      <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Entity ID</span><span className="text-sm font-medium text-gray-900">{snapshotViewDetail.entityId}</span></div>
                      <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Action</span><span className="text-sm font-medium text-gray-900">{snapshotViewDetail.actionLabel}</span></div>
                      <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Performed By</span><span className="text-sm font-medium text-gray-900">{snapshotViewDetail.performedBy}</span></div>
                      <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Snapshot Type</span><span className="text-sm font-medium text-gray-900">{snapshotViewDetail.snapshotTypeLabel}</span></div>
                      <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Changed Fields</span><span className="text-sm font-medium text-gray-900">{snapshotViewDetail.changedFieldCount}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-500">Reason</span><span className="text-right text-sm font-medium text-gray-900">{snapshotViewDetail.reason || '-'}</span></div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Metadata</h4>
                        <pre className="mt-2 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-700">{formatJsonValue(snapshotViewDetail.metadata)}</pre>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Before Data</h4>
                        <pre className="mt-2 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-700">{formatJsonValue(snapshotViewDetail.beforeData)}</pre>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">After Data</h4>
                        <pre className="mt-2 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-700">{formatJsonValue(snapshotViewDetail.afterData)}</pre>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No details available.</p>
                )}
                <div className="flex justify-end pt-4">
                  <button type="button" onClick={() => setIsSnapshotViewOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                    Close
                  </button>
                </div>
              </div>
            </SlideOver>
          </div>
        )}
      </div>
    </div>
  );
}
