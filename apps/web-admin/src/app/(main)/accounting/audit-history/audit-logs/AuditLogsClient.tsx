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
  getExportActivity,
  getFinanceAuditLog,
  type AuditMetric,
  type ExportActivityResponse,
  type ExportActivityRow,
  type FinanceAuditLogResponse,
  type FinanceAuditLogRow,
} from './actions';

type TabId = 'finance-audit-log' | 'export-activity';
type FinanceFilterState = { actionTypes: string[]; entityTypes: string[] };
type ExportFilterState = { categories: string[]; entityTypes: string[] };
type TableCell = string | { text: string; tone?: string; emphasis?: boolean; align?: string };

const STATIC_TABS = [
  {
    id: 'finance-audit-log' as TabId,
    label: 'Finance Audit Log',
    description:
      'Review finance audit events captured with entity type, entity id, action type, performer, timestamps, and audit payloads.',
    searchPlaceholder: 'Search entity type, entity id, action, user, or reason',
    columns: ['Performed At', 'Entity Type', 'Entity ID', 'Action', 'Performed By', 'Reason'],
  },
  {
    id: 'export-activity' as TabId,
    label: 'Export Activity',
    description:
      'Review export actions captured in the finance audit log for report generation and outbound accounting extracts.',
    searchPlaceholder: 'Search exported action, entity type, user, report, or metadata',
    columns: ['Performed At', 'Entity Type', 'Entity ID', 'Action', 'Performed By', 'Metadata'],
  },
];

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  if (variant === 'ghost') return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
}

function getMetricTone(trend: AuditMetric['trend']) {
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

function MetricCard({ label, value, change, trend = 'neutral' }: { label: string; value: string | number; change: string; trend?: AuditMetric['trend'] }) {
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

export function AuditLogsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = STATIC_TABS.find((tab) => tab.id === rawTab)?.id || 'finance-audit-log';
  const currentTab = STATIC_TABS.find((tab) => tab.id === activeTab)!;

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const [data, setData] = useState<FinanceAuditLogResponse | null>(null);
  const [exportData, setExportData] = useState<ExportActivityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FinanceFilterState>({ actionTypes: [], entityTypes: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [draftFilters, setDraftFilters] = useState<FinanceFilterState>({ actionTypes: [], entityTypes: [] });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [viewDetail, setViewDetail] = useState<FinanceAuditLogRow | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [exportSearchInput, setExportSearchInput] = useState('');
  const [exportSubmittedSearch, setExportSubmittedSearch] = useState('');
  const [exportCurrentPage, setExportCurrentPage] = useState(1);
  const [exportFilters, setExportFilters] = useState<ExportFilterState>({ categories: [], entityTypes: [] });
  const [exportQuickFilters, setExportQuickFilters] = useState<string[]>([]);
  const [exportDraftFilters, setExportDraftFilters] = useState<ExportFilterState>({ categories: [], entityTypes: [] });
  const [isExportFilterPanelOpen, setIsExportFilterPanelOpen] = useState(false);
  const [exportViewDetail, setExportViewDetail] = useState<ExportActivityRow | null>(null);
  const [isExportViewOpen, setIsExportViewOpen] = useState(false);

  const filterCount = filters.actionTypes.length + filters.entityTypes.length;
  const exportFilterCount = exportFilters.categories.length + exportFilters.entityTypes.length;

  const fetchData = useCallback(async ({
    search,
    page,
    nextFilters,
    nextQuickFilters,
  }: {
    search: string;
    page: number;
    nextFilters: FinanceFilterState;
    nextQuickFilters: string[];
  }) => {
    if (activeTab !== 'finance-audit-log') return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await getFinanceAuditLog({
        search,
        page,
        actionTypes: nextFilters.actionTypes,
        entityTypes: nextFilters.entityTypes,
        quickFilters: nextQuickFilters,
      });
      setData(result);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load finance audit log.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  const fetchExportData = useCallback(async ({
    search,
    page,
    nextFilters,
    nextQuickFilters,
  }: {
    search: string;
    page: number;
    nextFilters: ExportFilterState;
    nextQuickFilters: string[];
  }) => {
    if (activeTab !== 'export-activity') return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await getExportActivity({
        search,
        page,
        categories: nextFilters.categories,
        entityTypes: nextFilters.entityTypes,
        quickFilters: nextQuickFilters,
      });
      setExportData(result);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load export activity.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'finance-audit-log') {
      void fetchData({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
    }
  }, [activeTab, currentPage, fetchData, filters, quickFilters, submittedSearch]);

  useEffect(() => {
    if (activeTab === 'export-activity') {
      void fetchExportData({
        search: exportSubmittedSearch,
        page: exportCurrentPage,
        nextFilters: exportFilters,
        nextQuickFilters: exportQuickFilters,
      });
    }
  }, [activeTab, exportCurrentPage, exportFilters, exportQuickFilters, exportSubmittedSearch, fetchExportData]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput);
    void fetchData({ search: searchInput, page: 1, nextFilters: filters, nextQuickFilters: quickFilters });
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    void fetchData({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleExportSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setExportSubmittedSearch(exportSearchInput);
    void fetchExportData({
      search: exportSearchInput,
      page: 1,
      nextFilters: exportFilters,
      nextQuickFilters: exportQuickFilters,
    });
    setExportCurrentPage(1);
  };

  const handleExportRefresh = () => {
    void fetchExportData({
      search: exportSubmittedSearch,
      page: exportCurrentPage,
      nextFilters: exportFilters,
      nextQuickFilters: exportQuickFilters,
    });
  };

  const handleToggleQuickFilter = (value: string) => {
    setQuickFilters((previous) => toggleFilterValue(previous, value));
    setCurrentPage(1);
  };

  const handleToggleExportQuickFilter = (value: string) => {
    setExportQuickFilters((previous) => toggleFilterValue(previous, value));
    setExportCurrentPage(1);
  };

  const handleExport = () => {
    const rows = data?.section.table.rows;
    if (!rows?.length) return;

    const headers = ['Performed At', 'Entity Type', 'Entity ID', 'Action', 'Performed By', 'Reason', 'Metadata Summary'];
    const csvRows = rows.map((row) => [
      row.performedAtLabel,
      row.entityTypeLabel,
      row.entityId,
      row.actionLabel,
      row.performedBy,
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
    link.download = 'finance-audit-log.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportActivityDownload = () => {
    const rows = exportData?.section.table.rows;
    if (!rows?.length) return;

    const headers = ['Performed At', 'Entity Type', 'Entity ID', 'Action', 'Performed By', 'Metadata', 'Category', 'Format'];
    const csvRows = rows.map((row) => [
      row.performedAtLabel,
      row.entityTypeLabel,
      row.entityId,
      row.actionLabel,
      row.performedBy,
      row.metadataSummary,
      row.exportCategoryLabel,
      row.formatLabel,
    ]);
    const csvContent = [headers.map((header) => escapeCsvValue(header)), ...csvRows.map((row) => row.map((cell) => escapeCsvValue(cell)))]
      .map((row) => row.join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'export-activity.csv';
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
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="mt-1 text-base text-gray-600">
            Review finance audit events and export activity for traceability, control evidence, and outbound data visibility.
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
        {activeTab === 'finance-audit-log' ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-gray-900">{currentTab.label}</h2>
                <p className="text-sm text-gray-600">{currentTab.description}</p>
                <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
                  <RefreshCw className="h-4 w-4" />
                  Refresh Audit Log
                </button>
              </div>
            </div>

            {data?.section.metrics?.length ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
                {data.section.metrics.map((metric) => (
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
                  {(data?.section.filters.quickFilters || []).map((filter) => {
                    return (
                      <button
                        key={filter.value}
                        type="button"
                        onClick={() => handleToggleQuickFilter(filter.value)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${quickFilters.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
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
                          {(data?.section.filters.actionTypes || []).map((option) => {
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
                          {(data?.section.filters.entityTypes || []).map((option) => {
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
                    <h3 className="text-base font-semibold text-gray-900">Finance Audit Trail</h3>
                    <p className="text-sm text-gray-600">Audit visibility across finance entities, performers, control actions, reasons, and payload context.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span>{data?.totals.filteredRows ?? 0} matching rows</span>
                    <button
                      type="button"
                      onClick={handleExport}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!(data?.section.table.rows.length)}
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
                            {(data?.section.table.rows || []).length > 0 ? (
                              (data?.section.table.rows || []).map((row) => (
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
                                  No audit rows found.
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
              title="Finance Audit Detail"
              description="Review the selected finance audit event, including metadata and payload snapshots."
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
                <p className="text-sm text-gray-500">{exportData?.totals.filteredRows ?? 0} matching rows</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={handleExportRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
                  <RefreshCw className="h-4 w-4" />
                  Refresh Exports
                </button>
              </div>
            </div>

            {exportData?.section.metrics?.length ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
                {exportData.section.metrics.map((metric) => (
                  <div key={metric.id}>
                    <MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} />
                  </div>
                ))}
              </div>
            ) : null}

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                  <form onSubmit={handleExportSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
                    <div className="relative min-w-0 flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder={currentTab.searchPlaceholder}
                        value={exportSearchInput}
                        onChange={(event) => setExportSearchInput(event.target.value)}
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
                      if (!isExportFilterPanelOpen) setExportDraftFilters({ ...exportFilters });
                      setIsExportFilterPanelOpen((previous) => !previous);
                    }}
                    className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isExportFilterPanelOpen || exportFilterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {exportFilterCount > 0 ? (
                      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                        {exportFilterCount}
                      </span>
                    ) : null}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(exportData?.section.filters.quickFilters || []).map((filter) => {
                    return (
                      <button
                        key={filter.value}
                        type="button"
                        onClick={() => handleToggleExportQuickFilter(filter.value)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${exportQuickFilters.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4 p-5">
                {isExportFilterPanelOpen ? (
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
                            setExportDraftFilters({ categories: [], entityTypes: [] });
                            setExportFilters({ categories: [], entityTypes: [] });
                            setExportCurrentPage(1);
                            setIsExportFilterPanelOpen(false);
                          }}
                          className="text-sm font-medium text-gray-500 hover:text-gray-700"
                        >
                          Clear all
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setExportDraftFilters({ ...exportFilters });
                            setIsExportFilterPanelOpen(false);
                          }}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setExportFilters({ ...exportDraftFilters });
                            setExportCurrentPage(1);
                            setIsExportFilterPanelOpen(false);
                          }}
                          className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                      <div>
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Category</h5>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(exportData?.section.filters.categories || []).map((option) => {
                            const isSelected = exportDraftFilters.categories.includes(option.value);
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => setExportDraftFilters((previous) => ({ ...previous, categories: toggleFilterValue(previous.categories, option.value) }))}
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
                          {(exportData?.section.filters.entityTypes || []).map((option) => {
                            const isSelected = exportDraftFilters.entityTypes.includes(option.value);
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => setExportDraftFilters((previous) => ({ ...previous, entityTypes: toggleFilterValue(previous.entityTypes, option.value) }))}
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
                    <h3 className="text-base font-semibold text-gray-900">{exportData?.section.table.title || 'Export Audit Events'}</h3>
                    <p className="text-sm text-gray-600">{exportData?.section.table.description || 'Audit-log entries for exported actions so outbound accounting data access remains visible.'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span>{exportData?.totals.filteredRows ?? 0} matching rows</span>
                    <button type="button" onClick={handleExportActivityDownload} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!(exportData?.section.table.rows.length)}>
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
                            {(exportData?.section.table.rows || []).length > 0 ? (
                              (exportData?.section.table.rows || []).map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50">
                                  {row.cells.map((cell, index) => renderCell(cell, index))}
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setExportViewDetail(row);
                                          setIsExportViewOpen(true);
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
                                  No export rows found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {exportData?.pagination && exportData.pagination.totalPages > 1 ? (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">Page {exportData.pagination.page} of {exportData.pagination.totalPages}</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={!exportData.pagination.hasPrevPage}
                            onClick={() => setExportCurrentPage((previous) => Math.max(1, previous - 1))}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <button
                            type="button"
                            disabled={!exportData.pagination.hasNextPage}
                            onClick={() => setExportCurrentPage((previous) => previous + 1)}
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
              isOpen={isExportViewOpen}
              onClose={() => setIsExportViewOpen(false)}
              title="Export Activity Detail"
              description="Review the selected export event, including category, format, and payload snapshots."
            >
              <div className="space-y-6">
                {exportViewDetail ? (
                  <>
                    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                      <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Performed At</span><span className="text-sm font-medium text-gray-900">{exportViewDetail.performedAtLabel}</span></div>
                      <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Entity Type</span><span className="text-sm font-medium text-gray-900">{exportViewDetail.entityTypeLabel}</span></div>
                      <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Entity ID</span><span className="text-sm font-medium text-gray-900">{exportViewDetail.entityId}</span></div>
                      <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Action</span><span className="text-sm font-medium text-gray-900">{exportViewDetail.actionLabel}</span></div>
                      <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Performed By</span><span className="text-sm font-medium text-gray-900">{exportViewDetail.performedBy}</span></div>
                      <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Category</span><span className="text-sm font-medium text-gray-900">{exportViewDetail.exportCategoryLabel}</span></div>
                      <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Format</span><span className="text-sm font-medium text-gray-900">{exportViewDetail.formatLabel}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-500">Reason</span><span className="text-right text-sm font-medium text-gray-900">{exportViewDetail.reason || '-'}</span></div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Metadata</h4>
                        <pre className="mt-2 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-700">{formatJsonValue(exportViewDetail.metadata)}</pre>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Before Data</h4>
                        <pre className="mt-2 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-700">{formatJsonValue(exportViewDetail.beforeData)}</pre>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">After Data</h4>
                        <pre className="mt-2 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-700">{formatJsonValue(exportViewDetail.afterData)}</pre>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No details available.</p>
                )}
                <div className="flex justify-end pt-4">
                  <button type="button" onClick={() => setIsExportViewOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
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
