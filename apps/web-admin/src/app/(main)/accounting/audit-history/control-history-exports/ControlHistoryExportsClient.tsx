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
  getPeriodFiscalHistory,
  getReconciliationHistory,
  type AuditMetric,
  type ExportActivityResponse,
  type ExportActivityRow,
  type PeriodFiscalHistoryResponse,
  type PeriodFiscalHistoryRow,
  type ReconciliationHistoryResponse,
  type ReconciliationHistoryRow,
} from './actions';

type TabId = 'period-fiscal-history' | 'reconciliation-history' | 'export-history';
type TableCell = string | { text: string; tone?: string; emphasis?: boolean; align?: string };
type PeriodFilterState = { statuses: string[]; controlTypes: string[]; closeModes: string[] };
type ReconciliationFilterState = { statuses: string[]; bankAccountIds: string[] };
type ExportFilterState = { categories: string[]; entityTypes: string[] };

const STATIC_TABS = [
  {
    id: 'period-fiscal-history' as TabId,
    label: 'Period & Fiscal History',
    description:
      'Review fiscal-year and accounting-period control history using status, close dates, lock dates, and responsible users.',
    searchPlaceholder: 'Search fiscal year, period label, status, close mode, closed by, or lock date',
    columns: ['Control', 'Range', 'Status', 'Locked From', 'Closed At', 'Closed By'],
  },
  {
    id: 'reconciliation-history' as TabId,
    label: 'Reconciliation History',
    description:
      'Track bank reconciliation sessions with statement balances, book balances, differences, status, and completion fields.',
    searchPlaceholder: 'Search bank account, statement end date, status, completed by, or difference',
    columns: ['Session', 'Bank Account', 'Statement End', 'Difference', 'Status', 'Completed By'],
  },
  {
    id: 'export-history' as TabId,
    label: 'Export History',
    description:
      'Review exported actions captured in the finance audit log for outbound accounting reports and snapshots.',
    searchPlaceholder: 'Search exported action, report name, entity type, user, or metadata',
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
  trend?: AuditMetric['trend'];
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

export function ControlHistoryExportsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = STATIC_TABS.find((tab) => tab.id === rawTab)?.id || 'period-fiscal-history';
  const currentTab = STATIC_TABS.find((tab) => tab.id === activeTab)!;

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [periodData, setPeriodData] = useState<PeriodFiscalHistoryResponse | null>(null);
  const [periodSearchInput, setPeriodSearchInput] = useState('');
  const [periodSubmittedSearch, setPeriodSubmittedSearch] = useState('');
  const [periodCurrentPage, setPeriodCurrentPage] = useState(1);
  const [periodFilters, setPeriodFilters] = useState<PeriodFilterState>({ statuses: [], controlTypes: [], closeModes: [] });
  const [periodDraftFilters, setPeriodDraftFilters] = useState<PeriodFilterState>({ statuses: [], controlTypes: [], closeModes: [] });
  const [periodQuickFilters, setPeriodQuickFilters] = useState<string[]>([]);
  const [isPeriodFilterPanelOpen, setIsPeriodFilterPanelOpen] = useState(false);
  const [periodViewDetail, setPeriodViewDetail] = useState<PeriodFiscalHistoryRow | null>(null);
  const [isPeriodViewOpen, setIsPeriodViewOpen] = useState(false);

  const [reconciliationData, setReconciliationData] = useState<ReconciliationHistoryResponse | null>(null);
  const [reconciliationSearchInput, setReconciliationSearchInput] = useState('');
  const [reconciliationSubmittedSearch, setReconciliationSubmittedSearch] = useState('');
  const [reconciliationCurrentPage, setReconciliationCurrentPage] = useState(1);
  const [reconciliationFilters, setReconciliationFilters] = useState<ReconciliationFilterState>({ statuses: [], bankAccountIds: [] });
  const [reconciliationDraftFilters, setReconciliationDraftFilters] = useState<ReconciliationFilterState>({ statuses: [], bankAccountIds: [] });
  const [reconciliationQuickFilters, setReconciliationQuickFilters] = useState<string[]>([]);
  const [isReconciliationFilterPanelOpen, setIsReconciliationFilterPanelOpen] = useState(false);
  const [reconciliationViewDetail, setReconciliationViewDetail] = useState<ReconciliationHistoryRow | null>(null);
  const [isReconciliationViewOpen, setIsReconciliationViewOpen] = useState(false);

  const [exportData, setExportData] = useState<ExportActivityResponse | null>(null);
  const [exportSearchInput, setExportSearchInput] = useState('');
  const [exportSubmittedSearch, setExportSubmittedSearch] = useState('');
  const [exportCurrentPage, setExportCurrentPage] = useState(1);
  const [exportFilters, setExportFilters] = useState<ExportFilterState>({ categories: [], entityTypes: [] });
  const [exportDraftFilters, setExportDraftFilters] = useState<ExportFilterState>({ categories: [], entityTypes: [] });
  const [exportQuickFilters, setExportQuickFilters] = useState<string[]>([]);
  const [isExportFilterPanelOpen, setIsExportFilterPanelOpen] = useState(false);
  const [exportViewDetail, setExportViewDetail] = useState<ExportActivityRow | null>(null);
  const [isExportViewOpen, setIsExportViewOpen] = useState(false);

  const periodFilterCount = periodFilters.statuses.length + periodFilters.controlTypes.length + periodFilters.closeModes.length;
  const reconciliationFilterCount = reconciliationFilters.statuses.length + reconciliationFilters.bankAccountIds.length;
  const exportFilterCount = exportFilters.categories.length + exportFilters.entityTypes.length;

  const fetchPeriodData = useCallback(async ({
    search,
    page,
    nextFilters,
    nextQuickFilters,
  }: {
    search: string;
    page: number;
    nextFilters: PeriodFilterState;
    nextQuickFilters: string[];
  }) => {
    if (activeTab !== 'period-fiscal-history') return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await getPeriodFiscalHistory({
        search,
        page,
        statuses: nextFilters.statuses,
        controlTypes: nextFilters.controlTypes,
        closeModes: nextFilters.closeModes,
        quickFilters: nextQuickFilters,
      });
      setPeriodData(result);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load period and fiscal control history.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  const fetchReconciliationData = useCallback(async ({
    search,
    page,
    nextFilters,
    nextQuickFilters,
  }: {
    search: string;
    page: number;
    nextFilters: ReconciliationFilterState;
    nextQuickFilters: string[];
  }) => {
    if (activeTab !== 'reconciliation-history') return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await getReconciliationHistory({
        search,
        page,
        statuses: nextFilters.statuses,
        bankAccountIds: nextFilters.bankAccountIds,
        quickFilters: nextQuickFilters,
      });
      setReconciliationData(result);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load reconciliation history.');
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
    if (activeTab !== 'export-history') return;
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
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load export history.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'period-fiscal-history') {
      void fetchPeriodData({
        search: periodSubmittedSearch,
        page: periodCurrentPage,
        nextFilters: periodFilters,
        nextQuickFilters: periodQuickFilters,
      });
    }
  }, [activeTab, periodSubmittedSearch, periodCurrentPage, periodFilters, periodQuickFilters, fetchPeriodData]);

  useEffect(() => {
    if (activeTab === 'reconciliation-history') {
      void fetchReconciliationData({
        search: reconciliationSubmittedSearch,
        page: reconciliationCurrentPage,
        nextFilters: reconciliationFilters,
        nextQuickFilters: reconciliationQuickFilters,
      });
    }
  }, [activeTab, reconciliationSubmittedSearch, reconciliationCurrentPage, reconciliationFilters, reconciliationQuickFilters, fetchReconciliationData]);

  useEffect(() => {
    if (activeTab === 'export-history') {
      void fetchExportData({
        search: exportSubmittedSearch,
        page: exportCurrentPage,
        nextFilters: exportFilters,
        nextQuickFilters: exportQuickFilters,
      });
    }
  }, [activeTab, exportSubmittedSearch, exportCurrentPage, exportFilters, exportQuickFilters, fetchExportData]);

  const handlePeriodSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPeriodSubmittedSearch(periodSearchInput);
    setPeriodCurrentPage(1);
    void fetchPeriodData({
      search: periodSearchInput,
      page: 1,
      nextFilters: periodFilters,
      nextQuickFilters: periodQuickFilters,
    });
  };

  const handlePeriodRefresh = () => {
    void fetchPeriodData({
      search: periodSubmittedSearch,
      page: periodCurrentPage,
      nextFilters: periodFilters,
      nextQuickFilters: periodQuickFilters,
    });
  };

  const handleReconciliationSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setReconciliationSubmittedSearch(reconciliationSearchInput);
    setReconciliationCurrentPage(1);
    void fetchReconciliationData({
      search: reconciliationSearchInput,
      page: 1,
      nextFilters: reconciliationFilters,
      nextQuickFilters: reconciliationQuickFilters,
    });
  };

  const handleReconciliationRefresh = () => {
    void fetchReconciliationData({
      search: reconciliationSubmittedSearch,
      page: reconciliationCurrentPage,
      nextFilters: reconciliationFilters,
      nextQuickFilters: reconciliationQuickFilters,
    });
  };

  const handleExportSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setExportSubmittedSearch(exportSearchInput);
    setExportCurrentPage(1);
    void fetchExportData({
      search: exportSearchInput,
      page: 1,
      nextFilters: exportFilters,
      nextQuickFilters: exportQuickFilters,
    });
  };

  const handleExportRefresh = () => {
    void fetchExportData({
      search: exportSubmittedSearch,
      page: exportCurrentPage,
      nextFilters: exportFilters,
      nextQuickFilters: exportQuickFilters,
    });
  };

  const downloadCsv = (filename: string, headers: string[], rows: Array<Array<string | number | boolean | null | undefined>>) => {
    const csvContent = [headers.map((header) => escapeCsvValue(header)), ...rows.map((row) => row.map((cell) => escapeCsvValue(cell)))]
      .map((row) => row.join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePeriodDownload = () => {
    const rows = periodData?.section.table.rows;
    if (!rows?.length) return;
    downloadCsv(
      'period-fiscal-history.csv',
      ['Control', 'Type', 'Fiscal Year', 'Range', 'Status', 'Locked From', 'Closed At', 'Closed By', 'Close Mode'],
      rows.map((row) => [
        row.controlLabel,
        row.controlTypeLabel,
        row.fiscalYearLabel,
        row.rangeLabel,
        row.statusLabel,
        row.lockedFromLabel,
        row.closedAtLabel,
        row.closedBy,
        row.closeModeLabel,
      ]),
    );
  };

  const handleReconciliationDownload = () => {
    const rows = reconciliationData?.section.table.rows;
    if (!rows?.length) return;
    downloadCsv(
      'reconciliation-history.csv',
      ['Session', 'Bank Account', 'Statement Start', 'Statement End', 'Difference', 'Status', 'Completed At', 'Completed By'],
      rows.map((row) => [
        row.sessionLabel,
        row.bankAccountLabel,
        row.statementStartLabel,
        row.statementEndLabel,
        row.differenceLabel,
        row.statusLabel,
        row.completedAtLabel,
        row.completedBy,
      ]),
    );
  };

  const handleExportDownload = () => {
    const rows = exportData?.section.table.rows;
    if (!rows?.length) return;
    downloadCsv(
      'control-export-history.csv',
      ['Performed At', 'Entity Type', 'Entity ID', 'Action', 'Performed By', 'Metadata', 'Category', 'Format'],
      rows.map((row) => [
        row.performedAtLabel,
        row.entityTypeLabel,
        row.entityId,
        row.actionLabel,
        row.performedBy,
        row.metadataSummary,
        row.exportCategoryLabel,
        row.formatLabel,
      ]),
    );
  };

  const renderError = () => error ? (
    <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
      <AlertCircle className="h-4 w-4 shrink-0" />
      {error}
    </div>
  ) : null;

  const renderPagination = (pagination: PeriodFiscalHistoryResponse['pagination'] | ReconciliationHistoryResponse['pagination'] | ExportActivityResponse['pagination'] | undefined, onPrev: () => void, onNext: () => void) => {
    if (!pagination || pagination.totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Page {pagination.page} of {pagination.totalPages}</p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!pagination.hasPrevPage}
            onClick={onPrev}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={!pagination.hasNextPage}
            onClick={onNext}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Core / Audit & History</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Control History & Exports</h1>
          <p className="mt-1 text-base text-gray-600">
            Review period and fiscal controls, reconciliation history, and export activity using current accounting records and audit events.
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
        {activeTab === 'period-fiscal-history' ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-gray-900">{currentTab.label}</h2>
                <p className="text-sm text-gray-600">{currentTab.description}</p>
                <p className="text-sm text-gray-500">{periodData?.totals.filteredRows ?? 0} matching rows</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={handlePeriodRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
                  <RefreshCw className="h-4 w-4" />
                  Refresh History
                </button>
              </div>
            </div>

            {periodData?.section.metrics?.length ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
                {periodData.section.metrics.map((metric) => (
                  <div key={metric.id}>
                    <MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} />
                  </div>
                ))}
              </div>
            ) : null}

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                  <form onSubmit={handlePeriodSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
                    <div className="relative min-w-0 flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder={currentTab.searchPlaceholder}
                        value={periodSearchInput}
                        onChange={(event) => setPeriodSearchInput(event.target.value)}
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
                      if (!isPeriodFilterPanelOpen) setPeriodDraftFilters({ ...periodFilters });
                      setIsPeriodFilterPanelOpen((previous) => !previous);
                    }}
                    className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isPeriodFilterPanelOpen || periodFilterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {periodFilterCount > 0 ? (
                      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                        {periodFilterCount}
                      </span>
                    ) : null}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(periodData?.section.filters.quickFilters || []).map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => {
                        setPeriodQuickFilters((previous) => toggleFilterValue(previous, filter.value));
                        setPeriodCurrentPage(1);
                      }}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${periodQuickFilters.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 p-5">
                {isPeriodFilterPanelOpen ? (
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
                            setPeriodDraftFilters({ statuses: [], controlTypes: [], closeModes: [] });
                            setPeriodFilters({ statuses: [], controlTypes: [], closeModes: [] });
                            setPeriodCurrentPage(1);
                            setIsPeriodFilterPanelOpen(false);
                          }}
                          className="text-sm font-medium text-gray-500 hover:text-gray-700"
                        >
                          Clear all
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPeriodDraftFilters({ ...periodFilters });
                            setIsPeriodFilterPanelOpen(false);
                          }}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPeriodFilters({ ...periodDraftFilters });
                            setPeriodCurrentPage(1);
                            setIsPeriodFilterPanelOpen(false);
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
                          {(periodData?.section.filters.statuses || []).map((option) => {
                            const isSelected = periodDraftFilters.statuses.includes(option.value);
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => setPeriodDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, option.value) }))}
                                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Control Type</h5>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(periodData?.section.filters.controlTypes || []).map((option) => {
                            const isSelected = periodDraftFilters.controlTypes.includes(option.value);
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => setPeriodDraftFilters((previous) => ({ ...previous, controlTypes: toggleFilterValue(previous.controlTypes, option.value) }))}
                                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Close Mode</h5>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(periodData?.section.filters.closeModes || []).map((option) => {
                            const isSelected = periodDraftFilters.closeModes.includes(option.value);
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => setPeriodDraftFilters((previous) => ({ ...previous, closeModes: toggleFilterValue(previous.closeModes, option.value) }))}
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
                    <h3 className="text-base font-semibold text-gray-900">{periodData?.section.table.title || 'Period & Fiscal Control History'}</h3>
                    <p className="text-sm text-gray-600">{periodData?.section.table.description || 'Control history for fiscal years and accounting periods.'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span>{periodData?.totals.filteredRows ?? 0} matching rows</span>
                    <button
                      type="button"
                      onClick={handlePeriodDownload}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!(periodData?.section.table.rows.length)}
                    >
                      <Download className="h-4 w-4" />
                      Download View
                    </button>
                  </div>
                </div>

                {renderError()}

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
                            {(periodData?.section.table.rows || []).length > 0 ? (
                              (periodData?.section.table.rows || []).map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50">
                                  {row.cells.map((cell, index) => renderCell(cell, index))}
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setPeriodViewDetail(row);
                                          setIsPeriodViewOpen(true);
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
                                  No control history rows found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {renderPagination(periodData?.pagination, () => setPeriodCurrentPage((previous) => Math.max(1, previous - 1)), () => setPeriodCurrentPage((previous) => previous + 1))}
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === 'reconciliation-history' ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-gray-900">{currentTab.label}</h2>
                <p className="text-sm text-gray-600">{currentTab.description}</p>
                <p className="text-sm text-gray-500">{reconciliationData?.totals.filteredRows ?? 0} matching rows</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={handleReconciliationRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
                  <RefreshCw className="h-4 w-4" />
                  Refresh Sessions
                </button>
              </div>
            </div>

            {reconciliationData?.section.metrics?.length ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
                {reconciliationData.section.metrics.map((metric) => (
                  <div key={metric.id}>
                    <MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} />
                  </div>
                ))}
              </div>
            ) : null}

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                  <form onSubmit={handleReconciliationSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
                    <div className="relative min-w-0 flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder={currentTab.searchPlaceholder}
                        value={reconciliationSearchInput}
                        onChange={(event) => setReconciliationSearchInput(event.target.value)}
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
                      if (!isReconciliationFilterPanelOpen) setReconciliationDraftFilters({ ...reconciliationFilters });
                      setIsReconciliationFilterPanelOpen((previous) => !previous);
                    }}
                    className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isReconciliationFilterPanelOpen || reconciliationFilterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {reconciliationFilterCount > 0 ? (
                      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                        {reconciliationFilterCount}
                      </span>
                    ) : null}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(reconciliationData?.section.filters.quickFilters || []).map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => {
                        setReconciliationQuickFilters((previous) => toggleFilterValue(previous, filter.value));
                        setReconciliationCurrentPage(1);
                      }}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${reconciliationQuickFilters.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 p-5">
                {isReconciliationFilterPanelOpen ? (
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
                            setReconciliationDraftFilters({ statuses: [], bankAccountIds: [] });
                            setReconciliationFilters({ statuses: [], bankAccountIds: [] });
                            setReconciliationCurrentPage(1);
                            setIsReconciliationFilterPanelOpen(false);
                          }}
                          className="text-sm font-medium text-gray-500 hover:text-gray-700"
                        >
                          Clear all
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setReconciliationDraftFilters({ ...reconciliationFilters });
                            setIsReconciliationFilterPanelOpen(false);
                          }}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setReconciliationFilters({ ...reconciliationDraftFilters });
                            setReconciliationCurrentPage(1);
                            setIsReconciliationFilterPanelOpen(false);
                          }}
                          className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                      <div>
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</h5>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(reconciliationData?.section.filters.statuses || []).map((option) => {
                            const isSelected = reconciliationDraftFilters.statuses.includes(option.value);
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => setReconciliationDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, option.value) }))}
                                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Bank Account</h5>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(reconciliationData?.section.filters.bankAccounts || []).map((option) => {
                            const isSelected = reconciliationDraftFilters.bankAccountIds.includes(option.value);
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => setReconciliationDraftFilters((previous) => ({ ...previous, bankAccountIds: toggleFilterValue(previous.bankAccountIds, option.value) }))}
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
                    <h3 className="text-base font-semibold text-gray-900">{reconciliationData?.section.table.title || 'Bank Reconciliation History'}</h3>
                    <p className="text-sm text-gray-600">{reconciliationData?.section.table.description || 'Reconciliation history and completion visibility.'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span>{reconciliationData?.totals.filteredRows ?? 0} matching rows</span>
                    <button
                      type="button"
                      onClick={handleReconciliationDownload}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!(reconciliationData?.section.table.rows.length)}
                    >
                      <Download className="h-4 w-4" />
                      Download View
                    </button>
                  </div>
                </div>

                {renderError()}

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
                                <th
                                  key={column}
                                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Difference' ? 'text-right' : 'text-left'}`}
                                >
                                  {column}
                                </th>
                              ))}
                              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {(reconciliationData?.section.table.rows || []).length > 0 ? (
                              (reconciliationData?.section.table.rows || []).map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50">
                                  {row.cells.map((cell, index) => renderCell(cell, index))}
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setReconciliationViewDetail(row);
                                          setIsReconciliationViewOpen(true);
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
                                  No reconciliation rows found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {renderPagination(reconciliationData?.pagination, () => setReconciliationCurrentPage((previous) => Math.max(1, previous - 1)), () => setReconciliationCurrentPage((previous) => previous + 1))}
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === 'export-history' ? (
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
                  {(exportData?.section.filters.quickFilters || []).map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => {
                        setExportQuickFilters((previous) => toggleFilterValue(previous, filter.value));
                        setExportCurrentPage(1);
                      }}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${exportQuickFilters.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {filter.label}
                    </button>
                  ))}
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
                    <h3 className="text-base font-semibold text-gray-900">Control Export History</h3>
                    <p className="text-sm text-gray-600">Export history based on finance audit-log entries marked as exported.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span>{exportData?.totals.filteredRows ?? 0} matching rows</span>
                    <button
                      type="button"
                      onClick={handleExportDownload}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!(exportData?.section.table.rows.length)}
                    >
                      <Download className="h-4 w-4" />
                      Download View
                    </button>
                  </div>
                </div>

                {renderError()}

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

                    {renderPagination(exportData?.pagination, () => setExportCurrentPage((previous) => Math.max(1, previous - 1)), () => setExportCurrentPage((previous) => previous + 1))}
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <SlideOver
        isOpen={isPeriodViewOpen}
        onClose={() => setIsPeriodViewOpen(false)}
        title="Period & Fiscal Detail"
        description="Review the selected fiscal-year or accounting-period control history record."
      >
        <div className="space-y-6">
          {periodViewDetail ? (
            <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Control</span><span className="text-sm font-medium text-gray-900">{periodViewDetail.controlLabel}</span></div>
              <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Type</span><span className="text-sm font-medium text-gray-900">{periodViewDetail.controlTypeLabel}</span></div>
              <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Fiscal Year</span><span className="text-sm font-medium text-gray-900">{periodViewDetail.fiscalYearLabel || '-'}</span></div>
              <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Range</span><span className="text-sm font-medium text-gray-900">{periodViewDetail.rangeLabel}</span></div>
              <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Status</span><span className="text-sm font-medium text-gray-900">{periodViewDetail.statusLabel}</span></div>
              <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Locked From</span><span className="text-sm font-medium text-gray-900">{periodViewDetail.lockedFromLabel}</span></div>
              <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Closed At</span><span className="text-sm font-medium text-gray-900">{periodViewDetail.closedAtLabel}</span></div>
              <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Closed By</span><span className="text-sm font-medium text-gray-900">{periodViewDetail.closedBy}</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-500">Close Mode</span><span className="text-right text-sm font-medium text-gray-900">{periodViewDetail.closeModeLabel}</span></div>
              {periodViewDetail.notes ? <div className="border-t border-gray-100 pt-3"><p className="text-sm text-gray-500">Notes</p><p className="mt-1 text-sm text-gray-900">{periodViewDetail.notes}</p></div> : null}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No details available.</p>
          )}
          <div className="flex justify-end pt-4">
            <button type="button" onClick={() => setIsPeriodViewOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
              Close
            </button>
          </div>
        </div>
      </SlideOver>

      <SlideOver
        isOpen={isReconciliationViewOpen}
        onClose={() => setIsReconciliationViewOpen(false)}
        title="Reconciliation Detail"
        description="Review the selected reconciliation session history and completion fields."
      >
        <div className="space-y-6">
          {reconciliationViewDetail ? (
            <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Session</span><span className="text-sm font-medium text-gray-900">{reconciliationViewDetail.sessionLabel}</span></div>
              <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Bank Account</span><span className="text-sm font-medium text-gray-900">{reconciliationViewDetail.bankAccountLabel}</span></div>
              <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Statement Start</span><span className="text-sm font-medium text-gray-900">{reconciliationViewDetail.statementStartLabel}</span></div>
              <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Statement End</span><span className="text-sm font-medium text-gray-900">{reconciliationViewDetail.statementEndLabel}</span></div>
              <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Difference</span><span className="text-sm font-medium text-gray-900">{reconciliationViewDetail.differenceLabel}</span></div>
              <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Status</span><span className="text-sm font-medium text-gray-900">{reconciliationViewDetail.statusLabel}</span></div>
              <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Completed At</span><span className="text-sm font-medium text-gray-900">{reconciliationViewDetail.completedAtLabel}</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-500">Completed By</span><span className="text-right text-sm font-medium text-gray-900">{reconciliationViewDetail.completedBy}</span></div>
              {reconciliationViewDetail.notes ? <div className="border-t border-gray-100 pt-3"><p className="text-sm text-gray-500">Notes</p><p className="mt-1 text-sm text-gray-900">{reconciliationViewDetail.notes}</p></div> : null}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No details available.</p>
          )}
          <div className="flex justify-end pt-4">
            <button type="button" onClick={() => setIsReconciliationViewOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
              Close
            </button>
          </div>
        </div>
      </SlideOver>

      <SlideOver
        isOpen={isExportViewOpen}
        onClose={() => setIsExportViewOpen(false)}
        title="Export History Detail"
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
  );
}
