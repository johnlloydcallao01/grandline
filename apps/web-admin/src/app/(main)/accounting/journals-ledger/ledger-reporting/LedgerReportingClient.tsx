'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { AlertCircle, Download, FileText, Filter, RefreshCw, Search } from '@/components/ui/IconWrapper';
import {
  getGeneralLedgerRegister,
  getTrialBalanceRegister,
  getJournalRegister,
  type GeneralLedgerRegisterResponse,
  type GeneralLedgerRegisterRow,
  type TrialBalanceRegisterResponse,
  type TrialBalanceRegisterRow,
  type JournalRegisterResponse,
  type JournalRegisterRow,
} from './actions';

// --- Shared Components ---
const MetricCard = ({ label, value, change, trend }: { label: string; value: string | number; change: string; trend: 'up' | 'down' | 'neutral' }) => (
  <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between"><p className="text-sm font-medium text-gray-600">{label}</p></div>
    <div className="flex items-baseline gap-3"><h3 className="text-2xl font-bold text-gray-900">{value}</h3></div>
    <div className="flex items-center gap-2"><span className={`text-xs ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>{change}</span></div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
  </div>
);

const escapeCsvValue = (val: string | number | null | undefined): string => {
  if (val == null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) return `"${str.replace(/"/g, '""')}"`;
  return str;
};

const renderCell = (cell: any, index: number) => {
  if (typeof cell === 'string') return <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{cell}</td>;
  const { text, emphasis, tone, align } = cell;
  let alignClass = 'text-left'; if (align === 'right') alignClass = 'text-right'; else if (align === 'center') alignClass = 'text-center';
  let content = <span className={`${emphasis ? 'font-medium text-gray-900' : 'text-gray-600'}`}>{text}</span>;
  if (tone) {
    const toneClasses: Record<string, string> = { green: 'bg-green-50 text-green-700 ring-green-600/20', amber: 'bg-amber-50 text-amber-700 ring-amber-600/20', red: 'bg-red-50 text-red-700 ring-red-600/20', blue: 'bg-blue-50 text-blue-700 ring-blue-600/20', gray: 'bg-gray-50 text-gray-700 ring-gray-600/20' };
    content = <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${toneClasses[tone] || toneClasses.gray}`}>{text}</span>;
  }
  return <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${alignClass}`}>{content}</td>;
};

const toggleFilterValue = (current: string[], value: string) => current.includes(value) ? current.filter((v) => v !== value) : [...current, value];

type TabId = 'general-ledger' | 'trial-balance' | 'journal-register';
type GlFilterState = { statuses: string[] };
type TbFilterState = { statuses: string[] };
type JrFilterState = { statuses: string[] };

const STATIC_TABS = [
  { id: 'general-ledger' as TabId, label: 'General Ledger', description: 'Browse posted and reversed journal-line activity by account with posting dates, descriptions, and running balances.', searchPlaceholder: 'Search account code, account name, or entry no.', columns: ['Posting Date', 'Entry No.', 'Account', 'Debit', 'Credit', 'Running Balance'] },
  { id: 'trial-balance' as TabId, label: 'Trial Balance', description: 'Review trial-balance totals by account using posted and reversed journals across a period or date range.', searchPlaceholder: 'Search account code, account name, account type, debit, or credit', columns: ['Account Code', 'Account Name', 'Type', 'Total Debit', 'Total Credit', 'Closing Balance'] },
  { id: 'journal-register' as TabId, label: 'Journal Register', description: 'Review posted and reversed journal headers as a reporting-oriented register built from journal entry records.', searchPlaceholder: 'Search entry no., source type, posting date, memo, or status', columns: ['Entry No.', 'Posting Date', 'Source Type', 'Reference No.', 'Total Debit', 'Status'] },
];

export default function LedgerReportingClient({ initialData }: { initialData: GeneralLedgerRegisterResponse | null }) {
  const router = useRouter(); const pathname = usePathname(); const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = (STATIC_TABS.find((t) => t.id === rawTab)?.id) || 'general-ledger';
  const currentTab = STATIC_TABS.find((t) => t.id === activeTab)!;

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId); router.push(`${pathname}?${params.toString()}`);
  };

  const getActionClasses = (variant: 'primary' | 'secondary' | 'ghost') => {
    if (variant === 'primary') return 'bg-blue-600 text-white hover:bg-blue-700';
    if (variant === 'secondary') return 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50';
    return 'text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  };

  // --- General Ledger state ---
  const [glData, setGlData] = useState<GeneralLedgerRegisterResponse | null>(initialData);
  const [glError, setGlError] = useState<string | null>(null);
  const [glIsLoading, setGlIsLoading] = useState(false);
  const [glSearchInput, setGlSearchInput] = useState('');
  const [glSubmittedSearch, setGlSubmittedSearch] = useState('');
  const [glCurrentPage, setGlCurrentPage] = useState(1);
  const [glFilters, setGlFilters] = useState<GlFilterState>({ statuses: [] });
  const [glQuickFilters, setGlQuickFilters] = useState<string[]>(initialData?.appliedFilters.quickFilters || []);
  const [glDraftFilters, setGlDraftFilters] = useState<GlFilterState>({ statuses: [] });
  const [glIsFilterPanelOpen, setGlIsFilterPanelOpen] = useState(false);
  const glFilterCount = glFilters.statuses.length;

  // --- Trial Balance state ---
  const [tbData, setTbData] = useState<TrialBalanceRegisterResponse | null>(null);
  const [tbError, setTbError] = useState<string | null>(null);
  const [tbIsLoading, setTbIsLoading] = useState(false);
  const [tbSearchInput, setTbSearchInput] = useState('');
  const [tbSubmittedSearch, setTbSubmittedSearch] = useState('');
  const [tbCurrentPage, setTbCurrentPage] = useState(1);
  const [tbFilters, setTbFilters] = useState<TbFilterState>({ statuses: [] });
  const [tbQuickFilters, setTbQuickFilters] = useState<string[]>([]);
  const [tbDraftFilters, setTbDraftFilters] = useState<TbFilterState>({ statuses: [] });
  const [tbIsFilterPanelOpen, setTbIsFilterPanelOpen] = useState(false);
  const tbFilterCount = tbFilters.statuses.length;

  // --- Journal Register state ---
  const [jrData, setJrData] = useState<JournalRegisterResponse | null>(null);
  const [jrError, setJrError] = useState<string | null>(null);
  const [jrIsLoading, setJrIsLoading] = useState(false);
  const [jrSearchInput, setJrSearchInput] = useState('');
  const [jrSubmittedSearch, setJrSubmittedSearch] = useState('');
  const [jrCurrentPage, setJrCurrentPage] = useState(1);
  const [jrFilters, setJrFilters] = useState<JrFilterState>({ statuses: [] });
  const [jrQuickFilters, setJrQuickFilters] = useState<string[]>([]);
  const [jrDraftFilters, setJrDraftFilters] = useState<JrFilterState>({ statuses: [] });
  const [jrIsFilterPanelOpen, setJrIsFilterPanelOpen] = useState(false);
  const jrFilterCount = jrFilters.statuses.length;

  const fetchGlData = useCallback(async ({ search, page, filters: f, nextQuickFilters }: { search: string; page: number; filters: GlFilterState; nextQuickFilters: string[] }) => {
    if (activeTab !== 'general-ledger') return; setGlIsLoading(true); setGlError(null);
    try { const r = await getGeneralLedgerRegister({ search, page, statuses: f.statuses, quickFilters: nextQuickFilters }); setGlData(r); } catch (err) { setGlError(err instanceof Error ? err.message : 'Unable to load general ledger.'); } finally { setGlIsLoading(false); }
  }, [activeTab]);

  useEffect(() => { if (activeTab !== 'general-ledger') return; void fetchGlData({ search: glSubmittedSearch, page: glCurrentPage, filters: glFilters, nextQuickFilters: glQuickFilters }); }, [activeTab, glFilters, glCurrentPage, glSubmittedSearch, glQuickFilters, fetchGlData]);

  const handleGlSearch = (e: React.FormEvent) => { e.preventDefault(); setGlSubmittedSearch(glSearchInput); fetchGlData({ search: glSearchInput, page: 1, filters: glFilters, nextQuickFilters: glQuickFilters }); };
  const handleGlRefresh = () => { fetchGlData({ search: glSubmittedSearch, page: glCurrentPage, filters: glFilters, nextQuickFilters: glQuickFilters }); };

  const handleGlToggleQuickFilter = (value: string) => {
    setGlQuickFilters((previous) => toggleFilterValue(previous, value)); setGlCurrentPage(1);
  };

  const handleGlExport = () => { const rows = glData?.section.table.rows as GeneralLedgerRegisterRow[] | undefined; if (!rows?.length) return;
    const headers = ['Posting Date', 'Entry No.', 'Account', 'Debit', 'Credit', 'Running Balance', 'Status'];
    const csvRows = rows.map((r) => [r.postingDate ?? '-', r.entryNumber ?? '-', r.account ?? '-', r.debit ?? '0', r.credit ?? '0', r.runningBalance ?? '0', r.status ?? '-']);
    const csvContent = [headers.map((h) => escapeCsvValue(h)), ...csvRows.map((r) => r.map((c) => escapeCsvValue(c)))].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'general-ledger.csv'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const fetchTbData = useCallback(async ({ search, page, filters: f, nextQuickFilters }: { search: string; page: number; filters: TbFilterState; nextQuickFilters: string[] }) => {
    if (activeTab !== 'trial-balance') return; setTbIsLoading(true); setTbError(null);
    try { const r = await getTrialBalanceRegister({ search, page, statuses: f.statuses, quickFilters: nextQuickFilters }); setTbData(r); } catch (err) { setTbError(err instanceof Error ? err.message : 'Unable to load trial balance.'); } finally { setTbIsLoading(false); }
  }, [activeTab]);

  useEffect(() => { if (activeTab !== 'trial-balance') return; void fetchTbData({ search: tbSubmittedSearch, page: tbCurrentPage, filters: tbFilters, nextQuickFilters: tbQuickFilters }); }, [activeTab, tbFilters, tbCurrentPage, tbSubmittedSearch, tbQuickFilters, fetchTbData]);

  const handleTbSearch = (e: React.FormEvent) => { e.preventDefault(); setTbSubmittedSearch(tbSearchInput); fetchTbData({ search: tbSearchInput, page: 1, filters: tbFilters, nextQuickFilters: tbQuickFilters }); };
  const handleTbRefresh = () => { fetchTbData({ search: tbSubmittedSearch, page: tbCurrentPage, filters: tbFilters, nextQuickFilters: tbQuickFilters }); };

  const handleTbToggleQuickFilter = (value: string) => {
    setTbQuickFilters((previous) => toggleFilterValue(previous, value)); setTbCurrentPage(1);
  };

  const handleTbExport = () => { const rows = tbData?.section.table.rows as TrialBalanceRegisterRow[] | undefined; if (!rows?.length) return;
    const headers = ['Account Code', 'Account Name', 'Type', 'Total Debit', 'Total Credit', 'Closing Balance'];
    const csvRows = rows.map((r) => [r.accountCode ?? '-', r.accountName ?? '-', r.accountType ?? '-', r.totalDebit ?? '0', r.totalCredit ?? '0', r.closingBalance ?? '0']);
    const csvContent = [headers.map((h) => escapeCsvValue(h)), ...csvRows.map((r) => r.map((c) => escapeCsvValue(c)))].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'trial-balance.csv'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const fetchJrData = useCallback(async ({ search, page, filters: f, nextQuickFilters }: { search: string; page: number; filters: JrFilterState; nextQuickFilters: string[] }) => {
    if (activeTab !== 'journal-register') return; setJrIsLoading(true); setJrError(null);
    try { const r = await getJournalRegister({ search, page, statuses: f.statuses, quickFilters: nextQuickFilters }); setJrData(r); } catch (err) { setJrError(err instanceof Error ? err.message : 'Unable to load journal register.'); } finally { setJrIsLoading(false); }
  }, [activeTab]);

  useEffect(() => { if (activeTab !== 'journal-register') return; void fetchJrData({ search: jrSubmittedSearch, page: jrCurrentPage, filters: jrFilters, nextQuickFilters: jrQuickFilters }); }, [activeTab, jrFilters, jrCurrentPage, jrSubmittedSearch, jrQuickFilters, fetchJrData]);

  const handleJrSearch = (e: React.FormEvent) => { e.preventDefault(); setJrSubmittedSearch(jrSearchInput); fetchJrData({ search: jrSearchInput, page: 1, filters: jrFilters, nextQuickFilters: jrQuickFilters }); };
  const handleJrRefresh = () => { fetchJrData({ search: jrSubmittedSearch, page: jrCurrentPage, filters: jrFilters, nextQuickFilters: jrQuickFilters }); };

  const handleJrToggleQuickFilter = (value: string) => {
    setJrQuickFilters((previous) => toggleFilterValue(previous, value)); setJrCurrentPage(1);
  };

  const handleJrExport = () => { const rows = jrData?.section.table.rows as JournalRegisterRow[] | undefined; if (!rows?.length) return;
    const headers = ['Entry No.', 'Posting Date', 'Source Type', 'Reference No.', 'Total Debit', 'Status'];
    const csvRows = rows.map((r) => [r.entryNumber ?? '-', r.postingDate ?? '-', r.sourceType ?? '-', r.referenceNumber ?? '-', r.totalDebit ?? '0', r.status ?? '-']);
    const csvContent = [headers.map((h) => escapeCsvValue(h)), ...csvRows.map((r) => r.map((c) => escapeCsvValue(c)))].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'journal-register.csv'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Core / Journals &amp; Ledger</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700"><FileText className="h-6 w-6" /></div>
            <div><h1 className="text-2xl font-bold text-gray-900">Ledger &amp; Reporting</h1><p className="mt-1 max-w-3xl text-sm text-gray-600">Browse general-ledger output, validate the trial balance, and review posted journal registers from accounting data.</p></div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {STATIC_TABS.map((tab) => (<button key={tab.id} type="button" onClick={() => handleTabChange(tab.id)} className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>{tab.label}</button>))}
          </nav>
        </div>
        <div className="space-y-6 p-6">
          {activeTab === 'general-ledger' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold text-gray-900">General Ledger</h2>
                  <p className="text-sm text-gray-600">{currentTab.description}</p>
                  <p className="text-sm text-gray-500">{glData?.totals.filteredEntries ?? 0} matching rows</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={handleGlRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}><RefreshCw className="h-4 w-4" /> Refresh Ledger</button>
                </div>
              </div>

              {glData?.section.metrics && glData.section.metrics.length > 0 ? (<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{glData.section.metrics.map((m) => (<div key={m.id}><MetricCard label={m.label} value={m.value} change={m.change} trend={m.trend} /></div>))}</div>) : null}

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                    <form onSubmit={handleGlSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
                      <div className="relative min-w-0 flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder={currentTab.searchPlaceholder} value={glSearchInput} onChange={(e) => setGlSearchInput(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                      </div>
                      <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700">
                        <Search className="h-4 w-4" /> Search
                      </button>
                    </form>
                    <button type="button" onClick={() => { if (!glIsFilterPanelOpen) setGlDraftFilters({ ...glFilters }); setGlIsFilterPanelOpen((p) => !p); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${glIsFilterPanelOpen || glFilterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}><Filter className="h-4 w-4" /> Filters{glFilterCount > 0 && <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{glFilterCount}</span>}</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(() => { const qf = glData?.section?.filters?.quickFilters; if (qf && qf.length > 0) return qf.map((f) => { const isActive = glQuickFilters.includes(f.value); return <button key={f.value} type="button" onClick={() => handleGlToggleQuickFilter(f.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{f.label}</button>; }); return null; })()}
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  {glIsFilterPanelOpen && (<div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><h4 className="text-sm font-semibold text-gray-900">Filters</h4><p className="mt-1 text-sm text-gray-600">Select as many filter values as needed, then apply them in one step.</p></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => { setGlDraftFilters({ statuses: [] }); setGlFilters({ statuses: [] }); setGlCurrentPage(1); setGlIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Clear all</button><button type="button" onClick={() => { setGlFilters({ ...glDraftFilters }); setGlCurrentPage(1); setGlIsFilterPanelOpen(false); }} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button><button type="button" onClick={() => { setGlFilters({ ...glDraftFilters }); setGlCurrentPage(1); setGlIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button></div></div><div className="mt-4 flex flex-wrap gap-2">{glData?.section?.filters?.statuses?.map((opt) => { const isSelected = glDraftFilters.statuses.includes(opt.value); return <button key={opt.value} type="button" onClick={() => setGlDraftFilters((p) => ({ ...p, statuses: toggleFilterValue(p.statuses, opt.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{opt.label}</button>; })}</div></div>)}

                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <h3 className="text-base font-semibold text-gray-900">General Ledger View</h3>
                      <p className="text-sm text-gray-600">General-ledger rows derived from posted and reversed journal lines with account and running-balance context.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span>{glData?.totals.filteredEntries ?? 0} matching rows</span>
                      <button type="button" onClick={handleGlExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!(glData?.section.table.rows.length)}><Download className="h-4 w-4" /> Download View</button>
                    </div>
                  </div>

                  {glError && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{glError}</div>}
                  {glIsLoading ? <LoadingSkeleton /> : (<>
                    <div className="overflow-hidden rounded-xl border border-gray-200"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{currentTab.columns.map((col) => {
                      const isNumberColumn = col === 'Debit' || col === 'Credit' || col === 'Running Balance';
                      return (<th key={col} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${isNumberColumn ? 'text-right' : 'text-left'}`}>{col}</th>);
                    })}</tr></thead><tbody className="divide-y divide-gray-200 bg-white">{(glData?.section.table.rows ?? []).length > 0 ? (glData?.section.table.rows ?? []).map((row) => (<tr key={row.id} className="hover:bg-gray-50">{row.cells.map((cell, index) => renderCell(cell, index))}</tr>)) : (<tr><td colSpan={currentTab.columns.length} className="px-4 py-10 text-center text-sm text-gray-500">No ledger entries found.</td></tr>)}</tbody></table></div></div>
                    {glData?.pagination && glData.pagination.totalPages > 1 && (<div className="flex items-center justify-between"><p className="text-sm text-gray-600">Page {glData.pagination.page} of {glData.pagination.totalPages}</p><div className="flex gap-2"><button type="button" disabled={!glData.pagination.hasPrevPage} onClick={() => setGlCurrentPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button><button type="button" disabled={!glData.pagination.hasNextPage} onClick={() => setGlCurrentPage((p) => p + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button></div></div>)}
                  </>)}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trial-balance' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold text-gray-900">Trial Balance</h2>
                  <p className="text-sm text-gray-600">{currentTab.description}</p>
                  <p className="text-sm text-gray-500">{tbData?.totals.filteredEntries ?? 0} matching accounts</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={handleTbRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}><RefreshCw className="h-4 w-4" /> Refresh Trial Balance</button>
                </div>
              </div>

              {tbData?.section.metrics && tbData.section.metrics.length > 0 ? (<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{tbData.section.metrics.map((m) => (<div key={m.id}><MetricCard label={m.label} value={m.value} change={m.change} trend={m.trend} /></div>))}</div>) : null}

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                    <form onSubmit={handleTbSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
                      <div className="relative min-w-0 flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder={currentTab.searchPlaceholder} value={tbSearchInput} onChange={(e) => setTbSearchInput(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                      </div>
                      <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700">
                        <Search className="h-4 w-4" /> Search
                      </button>
                    </form>
                    <button type="button" onClick={() => { if (!tbIsFilterPanelOpen) setTbDraftFilters({ ...tbFilters }); setTbIsFilterPanelOpen((p) => !p); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${tbIsFilterPanelOpen || tbFilterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}><Filter className="h-4 w-4" /> Filters{tbFilterCount > 0 && <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{tbFilterCount}</span>}</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(() => { const qf = tbData?.section?.filters?.quickFilters; if (qf && qf.length > 0) return qf.map((f) => { const isActive = tbQuickFilters.includes(f.value); return <button key={f.value} type="button" onClick={() => handleTbToggleQuickFilter(f.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{f.label}</button>; }); return null; })()}
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  {tbIsFilterPanelOpen && (<div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><h4 className="text-sm font-semibold text-gray-900">Filters</h4><p className="mt-1 text-sm text-gray-600">Select as many filter values as needed, then apply them in one step.</p></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => { setTbDraftFilters({ statuses: [] }); setTbFilters({ statuses: [] }); setTbCurrentPage(1); setTbIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Clear all</button><button type="button" onClick={() => { setTbFilters({ ...tbDraftFilters }); setTbCurrentPage(1); setTbIsFilterPanelOpen(false); }} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button><button type="button" onClick={() => { setTbFilters({ ...tbDraftFilters }); setTbCurrentPage(1); setTbIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button></div></div><div className="mt-4 flex flex-wrap gap-2">{tbData?.section?.filters?.statuses?.map((opt) => { const isSelected = tbDraftFilters.statuses.includes(opt.value); return <button key={opt.value} type="button" onClick={() => setTbDraftFilters((p) => ({ ...p, statuses: toggleFilterValue(p.statuses, opt.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{opt.label}</button>; })}</div></div>)}

                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <h3 className="text-base font-semibold text-gray-900">Trial Balance View</h3>
                      <p className="text-sm text-gray-600">Trial-balance rows by account code and type with total debit, total credit, and closing balance.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span>{tbData?.totals.filteredEntries ?? 0} matching accounts</span>
                      <button type="button" onClick={handleTbExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!(tbData?.section.table.rows.length)}><Download className="h-4 w-4" /> Download View</button>
                    </div>
                  </div>

                  {tbError && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{tbError}</div>}
                  {tbIsLoading ? <LoadingSkeleton /> : (<>
                    <div className="overflow-hidden rounded-xl border border-gray-200"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{currentTab.columns.map((col) => {
                      const isNumberColumn = col === 'Total Debit' || col === 'Total Credit' || col === 'Closing Balance';
                      return (<th key={col} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${isNumberColumn ? 'text-right' : 'text-left'}`}>{col}</th>);
                    })}</tr></thead><tbody className="divide-y divide-gray-200 bg-white">{(tbData?.section.table.rows ?? []).length > 0 ? (tbData?.section.table.rows ?? []).map((row) => (<tr key={row.id} className="hover:bg-gray-50">{row.cells.map((cell, index) => renderCell(cell, index))}</tr>)) : (<tr><td colSpan={currentTab.columns.length} className="px-4 py-10 text-center text-sm text-gray-500">No trial balance accounts found.</td></tr>)}</tbody></table></div></div>
                    {tbData?.pagination && tbData.pagination.totalPages > 1 && (<div className="flex items-center justify-between"><p className="text-sm text-gray-600">Page {tbData.pagination.page} of {tbData.pagination.totalPages}</p><div className="flex gap-2"><button type="button" disabled={!tbData.pagination.hasPrevPage} onClick={() => setTbCurrentPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button><button type="button" disabled={!tbData.pagination.hasNextPage} onClick={() => setTbCurrentPage((p) => p + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button></div></div>)}
                  </>)}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'journal-register' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold text-gray-900">Journal Register</h2>
                  <p className="text-sm text-gray-600">{currentTab.description}</p>
                  <p className="text-sm text-gray-500">{jrData?.totals.filteredEntries ?? 0} matching entries</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={handleJrRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}><RefreshCw className="h-4 w-4" /> Refresh Register</button>
                </div>
              </div>

              {jrData?.section.metrics && jrData.section.metrics.length > 0 ? (<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{jrData.section.metrics.map((m) => (<div key={m.id}><MetricCard label={m.label} value={m.value} change={m.change} trend={m.trend} /></div>))}</div>) : null}

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                    <form onSubmit={handleJrSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
                      <div className="relative min-w-0 flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder={currentTab.searchPlaceholder} value={jrSearchInput} onChange={(e) => setJrSearchInput(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                      </div>
                      <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700">
                        <Search className="h-4 w-4" /> Search
                      </button>
                    </form>
                    <button type="button" onClick={() => { if (!jrIsFilterPanelOpen) setJrDraftFilters({ ...jrFilters }); setJrIsFilterPanelOpen((p) => !p); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${jrIsFilterPanelOpen || jrFilterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}><Filter className="h-4 w-4" /> Filters{jrFilterCount > 0 && <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{jrFilterCount}</span>}</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(() => { const qf = jrData?.section?.filters?.quickFilters; if (qf && qf.length > 0) return qf.map((f) => { const isActive = jrQuickFilters.includes(f.value); return <button key={f.value} type="button" onClick={() => handleJrToggleQuickFilter(f.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{f.label}</button>; }); return null; })()}
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  {jrIsFilterPanelOpen && (<div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><h4 className="text-sm font-semibold text-gray-900">Filters</h4><p className="mt-1 text-sm text-gray-600">Select as many filter values as needed, then apply them in one step.</p></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => { setJrDraftFilters({ statuses: [] }); setJrFilters({ statuses: [] }); setJrCurrentPage(1); setJrIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Clear all</button><button type="button" onClick={() => { setJrFilters({ ...jrDraftFilters }); setJrCurrentPage(1); setJrIsFilterPanelOpen(false); }} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button><button type="button" onClick={() => { setJrFilters({ ...jrDraftFilters }); setJrCurrentPage(1); setJrIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button></div></div><div className="mt-4 flex flex-wrap gap-2">{jrData?.section?.filters?.statuses?.map((opt) => { const isSelected = jrDraftFilters.statuses.includes(opt.value); return <button key={opt.value} type="button" onClick={() => setJrDraftFilters((p) => ({ ...p, statuses: toggleFilterValue(p.statuses, opt.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{opt.label}</button>; })}</div></div>)}

                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <h3 className="text-base font-semibold text-gray-900">Journal Register View</h3>
                      <p className="text-sm text-gray-600">Journal entry headers showing basic meta, source reference, and aggregated total debit.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span>{jrData?.totals.filteredEntries ?? 0} matching entries</span>
                      <button type="button" onClick={handleJrExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!(jrData?.section.table.rows.length)}><Download className="h-4 w-4" /> Download View</button>
                    </div>
                  </div>

                  {jrError && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{jrError}</div>}
                  {jrIsLoading ? <LoadingSkeleton /> : (<>
                    <div className="overflow-hidden rounded-xl border border-gray-200"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{currentTab.columns.map((col) => {
                      const isNumberColumn = col === 'Total Debit';
                      return (<th key={col} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${isNumberColumn ? 'text-right' : 'text-left'}`}>{col}</th>);
                    })}</tr></thead><tbody className="divide-y divide-gray-200 bg-white">{(jrData?.section.table.rows ?? []).length > 0 ? (jrData?.section.table.rows ?? []).map((row) => (<tr key={row.id} className="hover:bg-gray-50">{row.cells.map((cell, index) => renderCell(cell, index))}</tr>)) : (<tr><td colSpan={currentTab.columns.length} className="px-4 py-10 text-center text-sm text-gray-500">No journal register entries found.</td></tr>)}</tbody></table></div></div>
                    {jrData?.pagination && jrData.pagination.totalPages > 1 && (<div className="flex items-center justify-between"><p className="text-sm text-gray-600">Page {jrData.pagination.page} of {jrData.pagination.totalPages}</p><div className="flex gap-2"><button type="button" disabled={!jrData.pagination.hasPrevPage} onClick={() => setJrCurrentPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button><button type="button" disabled={!jrData.pagination.hasNextPage} onClick={() => setJrCurrentPage((p) => p + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button></div></div>)}
                  </>)}
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'general-ledger' && activeTab !== 'trial-balance' && activeTab !== 'journal-register' && (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500"><p className="font-semibold text-gray-900">{currentTab.label}</p><p className="mt-1 text-gray-600">{currentTab.description}</p><p className="mt-4 text-gray-400">This tab is under development.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
