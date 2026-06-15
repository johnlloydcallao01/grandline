'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Filter, Search, Download, AlertCircle, RefreshCw, ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';
import { getTaxSummaryReport, getTaxExportHistory, type TaxSummaryReportResponse, type TaxExportHistoryResponse, type TaxSummaryMetric } from './actions';

type TabId = 'tax-summary-report' | 'tax-export-history';
type SummaryFilterState = { scopes: string[]; calculationMethods: string[] };
type ExportFilterState = { categories: string[]; entityTypes: string[] };

const STATIC_TABS = [
  { id: 'tax-summary-report' as TabId, label: 'Tax Summary Report', description: 'Review backend-generated tax summary rows aggregated from posted invoices, posted bills, and posted expenses.', searchPlaceholder: 'Search tax code, tax scope, or method', columns: ['Tax Code', 'Tax Name', 'Scope', 'Method', 'Taxable Amount', 'Tax Amount'] },
  { id: 'tax-export-history' as TabId, label: 'Tax Export History', description: 'Review export actions in audit history for tax summary downloads and tax-related outbound report activity.', searchPlaceholder: 'Search entity type, action, user, report, or export metadata', columns: ['Entity Type', 'Action', 'Performed By', 'Performed At'] },
];

function getActionClasses(v: 'primary' | 'secondary' | 'ghost' = 'secondary') { if (v === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700'; if (v === 'ghost') return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'; return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'; }
function getMetricTone(t: TaxSummaryMetric['trend']) { if (t === 'down') return 'text-red-600 bg-red-50'; if (t === 'neutral') return 'text-gray-600 bg-gray-100'; return 'text-green-600 bg-green-50'; }
function escapeCsvValue(v: string | number | boolean | null | undefined) { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }
function toggleFilterValue(values: string[], value: string) { return values.includes(value) ? values.filter((v) => v !== value) : [...values, value]; }

function MetricCard({ label, value, change, trend = 'neutral' }: { label: string; value: string | number; change: string; trend?: 'up' | 'down' | 'neutral' }) {
  const TrendIcon = trend === 'down' ? ArrowDownRight : ArrowUpRight;
  return <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-gray-500">{label}</p><p className="mt-3 text-2xl font-bold text-gray-900">{value}</p></div><div className="rounded-lg bg-gray-100 p-3 text-gray-600"><Wallet className="h-5 w-5" /></div></div><div className="mt-4 flex items-center gap-2"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${trend ? getMetricTone(trend) : 'text-gray-600 bg-gray-100'}`}><TrendIcon className="h-3.5 w-3.5" />{change}</span></div></div>;
}

function LoadingSkeleton() {
  return <div className="space-y-4"><div className="overflow-hidden rounded-xl border border-gray-200"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{Array.from({ length: 6 }).map((_, i) => <th key={i} className="px-4 py-3"><div className="h-4 w-24 animate-pulse rounded bg-gray-200" /></th>)}</tr></thead><tbody className="divide-y divide-gray-200 bg-white">{Array.from({ length: 5 }).map((_, i) => (<tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-6 animate-pulse rounded bg-gray-100" /></td></tr>))}</tbody></table></div></div></div>;
}

function renderCell(cell: string | { text: string; tone?: string; emphasis?: boolean; align?: string }, index: number) {
  if (typeof cell === 'string') return <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{cell}</td>;
  const alignClass = cell.align === 'right' ? 'text-right' : cell.align === 'center' ? 'text-center' : 'text-left';
  if (cell.tone) { const toneMap: Record<string, string> = { amber: 'bg-amber-50 text-amber-700 ring-amber-200', green: 'bg-green-50 text-green-700 ring-green-200', gray: 'bg-gray-100 text-gray-700 ring-gray-200', blue: 'bg-blue-50 text-blue-700 ring-blue-200' }; return <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${alignClass}`}><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${toneMap[cell.tone] || toneMap.gray}`}>{cell.text}</span></td>; }
  return <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${cell.emphasis ? 'font-semibold text-gray-900' : 'text-gray-600'} ${alignClass}`}>{cell.text}</td>;
}

export function TaxReportingFilingClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = (STATIC_TABS.find((t) => t.id === rawTab)?.id) || 'tax-summary-report';
  const currentTab = STATIC_TABS.find((t) => t.id === activeTab)!;

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  // --- Tax Summary Report state ---
  const [data, setData] = useState<TaxSummaryReportResponse | null>(null);
  const [exportData, setExportData] = useState<TaxExportHistoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SummaryFilterState>({ scopes: [], calculationMethods: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [draftFilters, setDraftFilters] = useState<SummaryFilterState>({ scopes: [], calculationMethods: [] });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const filterCount = filters.scopes.length + filters.calculationMethods.length;

  const [exportSearchInput, setExportSearchInput] = useState('');
  const [exportSubmittedSearch, setExportSubmittedSearch] = useState('');
  const [exportCurrentPage, setExportCurrentPage] = useState(1);
  const [exportFilters, setExportFilters] = useState<ExportFilterState>({ categories: [], entityTypes: [] });
  const [exportQuickFilters, setExportQuickFilters] = useState<string[]>([]);
  const [exportDraftFilters, setExportDraftFilters] = useState<ExportFilterState>({ categories: [], entityTypes: [] });
  const [isExportFilterPanelOpen, setIsExportFilterPanelOpen] = useState(false);
  const exportFilterCount = exportFilters.categories.length + exportFilters.entityTypes.length;

  const fetchData = useCallback(async ({
    search,
    page,
    nextFilters,
    nextQuickFilters,
  }: {
    search: string;
    page: number;
    nextFilters: SummaryFilterState;
    nextQuickFilters: string[];
  }) => {
    if (activeTab !== 'tax-summary-report') return;
    setIsLoading(true); setError(null);
    try {
      const r = await getTaxSummaryReport({
        search,
        page,
        scopes: nextFilters.scopes,
        calculationMethods: nextFilters.calculationMethods,
        quickFilters: nextQuickFilters,
      });
      setData(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load tax summary report.');
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
    if (activeTab !== 'tax-export-history') return;
    setIsLoading(true); setError(null);
    try {
      const r = await getTaxExportHistory({
        search,
        page,
        categories: nextFilters.categories,
        entityTypes: nextFilters.entityTypes,
        quickFilters: nextQuickFilters,
      });
      setExportData(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load tax export history.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'tax-summary-report') {
      void fetchData({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
    }
  }, [activeTab, currentPage, fetchData, filters, quickFilters, submittedSearch]);

  useEffect(() => {
    if (activeTab === 'tax-export-history') {
      void fetchExportData({
        search: exportSubmittedSearch,
        page: exportCurrentPage,
        nextFilters: exportFilters,
        nextQuickFilters: exportQuickFilters,
      });
    }
  }, [activeTab, exportCurrentPage, exportFilters, exportQuickFilters, exportSubmittedSearch, fetchExportData]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSubmittedSearch(searchInput); setCurrentPage(1); void fetchData({ search: searchInput, page: 1, nextFilters: filters, nextQuickFilters: quickFilters }); };
  const handleRefresh = () => { void fetchData({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters }); };
  const handleToggleQuickFilter = (value: string) => { setQuickFilters((previous) => toggleFilterValue(previous, value)); setCurrentPage(1); };

  const handleExport = () => {
    const rows = data?.section.table.rows; if (!rows?.length) return;
    const headers = ['Tax Code', 'Tax Name', 'Scope', 'Method', 'Taxable Amount', 'Tax Amount', 'Source Document Count'];
    const csvRows = rows.map((r) => [r.taxCode ?? '-', r.taxName ?? '-', r.taxScope ?? '-', r.calculationMethod ?? '-', r.taxableAmount, r.taxAmount, r.sourceDocumentCount]);
    const csvContent = [headers.map((h) => escapeCsvValue(h)), ...csvRows.map((r) => r.map((c) => escapeCsvValue(c)))].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'tax-summary-report.csv'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const handleExportSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setExportSubmittedSearch(exportSearchInput);
    setExportCurrentPage(1);
    void fetchExportData({ search: exportSearchInput, page: 1, nextFilters: exportFilters, nextQuickFilters: exportQuickFilters });
  };

  const handleExportRefresh = () => {
    void fetchExportData({
      search: exportSubmittedSearch,
      page: exportCurrentPage,
      nextFilters: exportFilters,
      nextQuickFilters: exportQuickFilters,
    });
  };

  const handleToggleExportQuickFilter = (value: string) => {
    setExportQuickFilters((previous) => toggleFilterValue(previous, value));
    setExportCurrentPage(1);
  };

  const handleExportHistoryDownload = () => {
    const rows = exportData?.section.table.rows; if (!rows?.length) return;
    const headers = ['Entity Type', 'Action', 'Performed By', 'Performed At', 'Category', 'Format', 'Reason'];
    const csvRows = rows.map((r) => [r.entityTypeLabel, r.actionLabel, r.performedBy, r.performedAt, r.exportCategoryLabel, r.formatLabel, r.reason]);
    const csvContent = [headers.map((h) => escapeCsvValue(h)), ...csvRows.map((r) => r.map((c) => escapeCsvValue(c)))].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'tax-export-history.csv'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Core / Tax Compliance</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Tax Reporting & Filing</h1>
          <p className="mt-1 text-base text-gray-600">Review backend tax summary reporting and tax-related export activity supported by current apps/cms tax capabilities.</p>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {STATIC_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>{tab.label}</button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'tax-summary-report' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-gray-900">{currentTab.label}</h2>
                <p className="text-sm text-gray-600">{currentTab.description}</p>
                <p className="text-sm text-gray-500">{data?.pagination.totalDocs ?? 0} matching rows</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}><RefreshCw className="h-4 w-4" /> Refresh Report</button>
              </div>
            </div>

            {data?.section.metrics && data.section.metrics.length > 0 ? (<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{data.section.metrics.map((m) => (<div key={m.id}><MetricCard label={m.label} value={m.value} change={m.change} trend={m.trend} /></div>))}</div>) : null}

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                  <form onSubmit={handleSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
                    <div className="relative min-w-0 flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input type="text" placeholder={currentTab.searchPlaceholder} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    </div>
                    <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"><Search className="h-4 w-4" /> Search</button>
                  </form>
                  <button type="button" onClick={() => { if (!isFilterPanelOpen) setDraftFilters({ ...filters }); setIsFilterPanelOpen((p) => !p); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isFilterPanelOpen || filterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}><Filter className="h-4 w-4" /> Filters{filterCount > 0 && <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{filterCount}</span>}</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(data?.section.filters.quickFilters || []).map((filter) => (
                    <button key={filter.value} type="button" onClick={() => handleToggleQuickFilter(filter.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${quickFilters.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{filter.label}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 p-5">
                {isFilterPanelOpen && (<div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><h4 className="text-sm font-semibold text-gray-900">Filters</h4><p className="mt-1 text-sm text-gray-600">Select as many filter values as needed, then apply them in one step.</p></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => { setDraftFilters({ scopes: [], calculationMethods: [] }); setFilters({ scopes: [], calculationMethods: [] }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Clear all</button><button type="button" onClick={() => { setFilters({ ...draftFilters }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button><button type="button" onClick={() => { setFilters({ ...draftFilters }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button></div></div>
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Tax Scope</h5>
                      <div className="mt-3 flex flex-wrap gap-2">{data?.section?.filters?.scopes?.map((opt) => { const isSelected = draftFilters.scopes.includes(opt.value); return <button key={opt.value} type="button" onClick={() => setDraftFilters((p) => ({ ...p, scopes: toggleFilterValue(p.scopes, opt.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{opt.label}</button>; })}</div>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Calculation Method</h5>
                      <div className="mt-3 flex flex-wrap gap-2">{data?.section?.filters?.calculationMethods?.map((opt) => { const isSelected = draftFilters.calculationMethods.includes(opt.value); return <button key={opt.value} type="button" onClick={() => setDraftFilters((p) => ({ ...p, calculationMethods: toggleFilterValue(p.calculationMethods, opt.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{opt.label}</button>; })}</div>
                    </div>
                  </div>
                </div>)}

                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold text-gray-900">Backend Tax Summary Report</h3>
                    <p className="text-sm text-gray-600">Report rows from the tax-summary API grouped by tax code, scope, and calculation method.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span>{data?.totals.totalRows ?? 0} matching rows</span>
                    <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!(data?.section.table.rows.length)}><Download className="h-4 w-4" /> Download View</button>
                  </div>
                </div>

                {error && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
                {isLoading ? <LoadingSkeleton /> : (<>
                  <div className="overflow-hidden rounded-xl border border-gray-200"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{currentTab.columns.map((col) => {
                    const isNumberColumn = col === 'Taxable Amount' || col === 'Tax Amount';
                    return (<th key={col} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${isNumberColumn ? 'text-right' : 'text-left'}`}>{col}</th>);
                  })}</tr></thead><tbody className="divide-y divide-gray-200 bg-white">{(data?.section.table.rows ?? []).length > 0 ? (data?.section.table.rows ?? []).map((row) => (<tr key={row.id} className="hover:bg-gray-50">{row.cells.map((cell, index) => renderCell(cell, index))}</tr>)) : (<tr><td colSpan={currentTab.columns.length} className="px-4 py-10 text-center text-sm text-gray-500">No report rows found.</td></tr>)}</tbody></table></div></div>
                  {data?.pagination && data.pagination.totalPages > 1 && (<div className="flex items-center justify-between"><p className="text-sm text-gray-600">Page {data.pagination.page} of {data.pagination.totalPages}</p><div className="flex gap-2"><button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button><button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((p) => p + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button></div></div>)}
                </>)}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tax-export-history' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-gray-900">{currentTab.label}</h2>
                <p className="text-sm text-gray-600">{currentTab.description}</p>
                <p className="text-sm text-gray-500">{exportData?.totals.filteredRows ?? 0} matching rows</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={handleExportRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}><RefreshCw className="h-4 w-4" /> Refresh Report</button>
              </div>
            </div>

            {exportData?.section.metrics && exportData.section.metrics.length > 0 ? (<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{exportData.section.metrics.map((m, index) => (<div key={m.id || `${m.label}-${index}`}><MetricCard label={m.label} value={m.value} change={m.change} trend={m.trend} /></div>))}</div>) : null}

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                  <form onSubmit={handleExportSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
                    <div className="relative min-w-0 flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input type="text" placeholder={currentTab.searchPlaceholder} value={exportSearchInput} onChange={(e) => setExportSearchInput(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    </div>
                    <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"><Search className="h-4 w-4" /> Search</button>
                  </form>
                  <button type="button" onClick={() => { if (!isExportFilterPanelOpen) setExportDraftFilters({ ...exportFilters }); setIsExportFilterPanelOpen((p) => !p); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isExportFilterPanelOpen || exportFilterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}><Filter className="h-4 w-4" /> Filters{exportFilterCount > 0 && <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{exportFilterCount}</span>}</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(exportData?.section.filters.quickFilters || []).map((filter) => (
                    <button key={filter.value} type="button" onClick={() => handleToggleExportQuickFilter(filter.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${exportQuickFilters.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{filter.label}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 p-5">
                {isExportFilterPanelOpen && (<div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><h4 className="text-sm font-semibold text-gray-900">Filters</h4><p className="mt-1 text-sm text-gray-600">Select as many filter values as needed, then apply them in one step.</p></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => { setExportDraftFilters({ categories: [], entityTypes: [] }); setExportFilters({ categories: [], entityTypes: [] }); setExportCurrentPage(1); setIsExportFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Clear all</button><button type="button" onClick={() => { setExportDraftFilters({ ...exportFilters }); setIsExportFilterPanelOpen(false); }} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button><button type="button" onClick={() => { setExportFilters({ ...exportDraftFilters }); setExportCurrentPage(1); setIsExportFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button></div></div>
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Export Category</h5>
                      <div className="mt-3 flex flex-wrap gap-2">{exportData?.section.filters.categories?.map((opt) => { const isSelected = exportDraftFilters.categories.includes(opt.value); return <button key={opt.value} type="button" onClick={() => setExportDraftFilters((p) => ({ ...p, categories: toggleFilterValue(p.categories, opt.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{opt.label}</button>; })}</div>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Entity Type</h5>
                      <div className="mt-3 flex flex-wrap gap-2">{exportData?.section.filters.entityTypes?.map((opt) => { const isSelected = exportDraftFilters.entityTypes.includes(opt.value); return <button key={opt.value} type="button" onClick={() => setExportDraftFilters((p) => ({ ...p, entityTypes: toggleFilterValue(p.entityTypes, opt.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{opt.label}</button>; })}</div>
                    </div>
                  </div>
                </div>)}

                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold text-gray-900">Export History</h3>
                    <p className="text-sm text-gray-600">Audit logs of tax-related exports.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span>{exportData?.totals.filteredRows ?? 0} matching rows</span>
                    <button type="button" onClick={handleExportHistoryDownload} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!(exportData?.section.table.rows.length)}><Download className="h-4 w-4" /> Download View</button>
                  </div>
                </div>

                {error && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
                {isLoading ? <LoadingSkeleton /> : (<>
                  <div className="overflow-hidden rounded-xl border border-gray-200"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{currentTab.columns.map((col) => {
                    return (<th key={col} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 text-left`}>{col}</th>);
                  })}</tr></thead><tbody className="divide-y divide-gray-200 bg-white">{(exportData?.section.table.rows ?? []).length > 0 ? (exportData?.section.table.rows ?? []).map((row) => (<tr key={row.id} className="hover:bg-gray-50">{row.cells.map((cell, index) => renderCell(cell, index))}</tr>)) : (<tr><td colSpan={currentTab.columns.length} className="px-4 py-10 text-center text-sm text-gray-500">No report rows found.</td></tr>)}</tbody></table></div></div>
                  {exportData?.pagination && exportData.pagination.totalPages > 1 && (<div className="flex items-center justify-between"><p className="text-sm text-gray-600">Page {exportData.pagination.page} of {exportData.pagination.totalPages}</p><div className="flex gap-2"><button type="button" disabled={!exportData.pagination.hasPrevPage} onClick={() => setExportCurrentPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button><button type="button" disabled={!exportData.pagination.hasNextPage} onClick={() => setExportCurrentPage((p) => p + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button></div></div>)}
                </>)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
