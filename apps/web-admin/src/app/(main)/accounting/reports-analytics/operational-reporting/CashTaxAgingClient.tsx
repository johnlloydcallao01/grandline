'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, ArrowDownRight, ArrowUpRight, Download, Eye, Filter, RefreshCw, Search, Wallet, X } from 'lucide-react';
import { getCashTaxAging, type CashTaxAgingResponse, type CashTaxAgingRow, type CtaMetric } from './actions';

function getActionClasses(v: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (v === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  if (v === 'ghost') return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
}
function getMetricTone(t: CtaMetric['trend']) { if (t === 'down') return 'text-red-600 bg-red-50'; if (t === 'neutral') return 'text-gray-600 bg-gray-100'; return 'text-green-600 bg-green-50'; }
function escapeCsvValue(v: string | number | boolean | null | undefined) { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }
function toggleFilterValue(values: string[], value: string) { return values.includes(value) ? values.filter((v) => v !== value) : [...values, value]; }
function formatCurrency(value: number | null | undefined) { if (value == null || !Number.isFinite(value)) return '-'; return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value); }

function SlideOver({ isOpen, onClose, title, description, children }: { isOpen: boolean; onClose: () => void; title: string; description?: string; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false); const [animate, setAnimate] = useState(false);
  useEffect(() => { if (isOpen) { setMounted(true); requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true))); } else { setAnimate(false); const timer = setTimeout(() => setMounted(false), 300); return () => clearTimeout(timer); } }, [isOpen]);
  if (!mounted) return null;
  return createPortal(<div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ease-in-out ${animate ? 'bg-black/50' : 'bg-transparent'}`} onClick={onClose}><div className={`flex w-full max-w-lg flex-col bg-white shadow-xl transition-all duration-300 ease-in-out ${animate ? 'translate-x-0' : 'translate-x-full'}`} onClick={(e) => e.stopPropagation()}><div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4"><div><h3 className="text-lg font-semibold text-gray-900">{title}</h3>{description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}</div><button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X className="h-5 w-5" /></button></div><div className="flex-1 overflow-y-auto px-6 py-4">{children}</div></div></div>, document.body);
}

function MetricCard({ label, value, change, trend = 'neutral' }: { label: string; value: string | number; change: string; trend?: 'up' | 'down' | 'neutral' }) {
  const TrendIcon = trend === 'down' ? ArrowDownRight : ArrowUpRight;
  return <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-gray-500">{label}</p><p className="mt-3 text-2xl font-bold text-gray-900">{value}</p></div><div className="rounded-lg bg-gray-100 p-3 text-gray-600"><Wallet className="h-5 w-5" /></div></div><div className="mt-4 flex items-center gap-2"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${getMetricTone(trend)}`}><TrendIcon className="h-3.5 w-3.5" />{change}</span></div></div>;
}

function LoadingSkeleton() { return <div className="space-y-4"><div className="overflow-hidden rounded-xl border border-gray-200"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{Array.from({ length: 6 }).map((_, i) => <th key={i} className="px-4 py-3"><div className="h-4 w-24 animate-pulse rounded bg-gray-200" /></th>)}</tr></thead><tbody className="divide-y divide-gray-200 bg-white">{Array.from({ length: 5 }).map((_, i) => (<tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-6 animate-pulse rounded bg-gray-100" /></td></tr>))}</tbody></table></div></div></div>; }

function renderCell(cell: string | { text: string; tone?: string; emphasis?: boolean; align?: string }, index: number) {
  if (typeof cell === 'string') return <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{cell}</td>;
  const alignClass = cell.align === 'right' ? 'text-right' : cell.align === 'center' ? 'text-center' : 'text-left';
  if (cell.tone) { const toneMap: Record<string, string> = { amber: 'bg-amber-50 text-amber-700 ring-amber-200', green: 'bg-green-50 text-green-700 ring-green-200', gray: 'bg-gray-100 text-gray-700 ring-gray-200', blue: 'bg-blue-50 text-blue-700 ring-blue-200', red: 'bg-red-50 text-red-700 ring-red-200' }; return <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${alignClass}`}><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${toneMap[cell.tone] || toneMap.gray}`}>{cell.text}</span></td>; }
  return <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${cell.emphasis ? 'font-semibold text-gray-900' : 'text-gray-600'} ${alignClass}`}>{cell.text}</td>;
}

export function CashTaxAgingClient() {
  const [data, setData] = useState<CashTaxAgingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<string[]>([]);
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [draftFilters, setDraftFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const filterCount = filters.length;
  const [viewRow, setViewRow] = useState<CashTaxAgingRow | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const fetchData = useCallback(async ({ search, page, nextFilters, nextQuickFilters }: { search: string; page: number; nextFilters: string[]; nextQuickFilters: string[] }) => {
    setIsLoading(true); setError(null);
    try { const r = await getCashTaxAging({ search, page, types: nextFilters, quickFilters: nextQuickFilters }); setData(r); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to load cash, tax & aging data.'); } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { void fetchData({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters }); }, [filters, currentPage, quickFilters, submittedSearch, fetchData]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSubmittedSearch(searchInput); setCurrentPage(1); fetchData({ search: searchInput, page: 1, nextFilters: filters, nextQuickFilters: quickFilters }); };
  const handleRefresh = () => { fetchData({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters }); };
  const handleToggleQuickFilter = (value: string) => { setQuickFilters((previous) => toggleFilterValue(previous, value)); setCurrentPage(1); };

  const handleExport = () => {
    const rows = data?.section.table.rows; if (!rows?.length) return;
    const headers = ['Report Type', 'Reference', 'Party / Account', 'Bucket / Scope', 'Amount', 'Status'];
    const csvRows = rows.map((r) => [r.reportTypeLabel, r.reference, r.partyName, r.bucketLabel, formatCurrency(r.amount), r.statusLabel]);
    const csvContent = [headers.map((h) => escapeCsvValue(h)), ...csvRows.map((r) => r.map((c) => escapeCsvValue(c)))].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'cash-tax-aging.csv'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const handleViewRow = (row: CashTaxAgingRow) => { setViewRow(row); setIsViewOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">Cash, Tax & Aging</h2>
          <p className="text-sm text-gray-600">Review cash activity, tax summary, and AR/AP aging outputs backed by exposed report endpoints and report services.</p>
          <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}><RefreshCw className="h-4 w-4" /> Refresh Reports</button>
          <button type="button" onClick={handleExport} disabled={!(data?.section.table.rows.length)} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${getActionClasses('secondary')}`}><Download className="h-4 w-4" /> Download View</button>
        </div>
      </div>

      {data?.section.metrics && data.section.metrics.length > 0 ? (<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{data.section.metrics.map((m) => (<div key={m.id}><MetricCard label={m.label} value={m.value} change={m.change} trend={m.trend} /></div>))}</div>) : null}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <form onSubmit={handleSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
              <div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search bank account, tax code, customer, vendor, aging bucket, or amount" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"><Search className="h-4 w-4" /> Search</button>
            </form>
            <button type="button" onClick={() => { if (!isFilterPanelOpen) setDraftFilters([...filters]); setIsFilterPanelOpen((p) => !p); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isFilterPanelOpen || filterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}><Filter className="h-4 w-4" /> Filters{filterCount > 0 && <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{filterCount}</span>}</button>
          </div>
          <div className="flex flex-wrap gap-2">{(() => { const qf = data?.section?.filters?.quickFilters; if (qf && qf.length > 0) return qf.map((f) => <button key={f.value} type="button" onClick={() => handleToggleQuickFilter(f.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${quickFilters.includes(f.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{f.label}</button>); return null; })()}</div>
        </div>

        <div className="space-y-4 p-5">
          {isFilterPanelOpen && (<div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><h4 className="text-sm font-semibold text-gray-900">Filters</h4><p className="mt-1 text-sm text-gray-600">Select as many filter values as needed, then apply them in one step.</p></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => { setDraftFilters([]); setFilters([]); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Clear all</button><button type="button" onClick={() => { setDraftFilters([...filters]); setIsFilterPanelOpen(false); }} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button><button type="button" onClick={() => { setFilters([...draftFilters]); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button></div></div><div className="mt-6"><h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Report Type</h5><div className="mt-3 flex flex-wrap gap-2">{(data?.section?.filters?.types || []).map((opt) => { const isSelected = draftFilters.includes(opt.value); return <button key={opt.value} type="button" onClick={() => setDraftFilters((p) => toggleFilterValue(p, opt.value))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{opt.label}</button>; })}</div></div></div>)}

          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div className="space-y-2"><h3 className="text-base font-semibold text-gray-900">Cash / Tax / Aging Snapshot</h3><p className="text-sm text-gray-600">Mixed operational report snapshot aligned to cash-activity, tax-summary, and aging-report support in apps/cms.</p></div><div className="flex flex-wrap items-center gap-3 text-sm text-gray-500"><span>{data?.totals.filteredRows ?? 0} matching rows</span></div></div>

          {error && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
          {isLoading ? <LoadingSkeleton /> : (<>
            <div className="overflow-hidden rounded-xl border border-gray-200"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Report Type</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Reference</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Party / Account</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Bucket / Scope</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Amount</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th></tr></thead><tbody className="divide-y divide-gray-200 bg-white">{(data?.section.table.rows ?? []).length > 0 ? (data?.section.table.rows ?? []).map((row) => (<tr key={row.id} className="hover:bg-gray-50">{row.cells.map((cell, index) => renderCell(cell, index))}<td className="px-4 py-3 text-right"><div className="flex justify-end gap-2"><button type="button" onClick={() => handleViewRow(row)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail"><Eye className="h-4 w-4" /></button></div></td></tr>)) : (<tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">No rows found.</td></tr>)}</tbody></table></div></div>
            {data?.pagination && data.pagination.totalPages > 1 && (<div className="flex items-center justify-between"><p className="text-sm text-gray-600">Page {data.pagination.page} of {data.pagination.totalPages}</p><div className="flex gap-2"><button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button><button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((p) => p + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button></div></div>)}
          </>)}
        </div>
      </div>

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Report Detail" description="View operational report details.">
        <div className="space-y-6">{viewRow ? (<div className="space-y-4"><div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4"><div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Report Type</span><span className="text-sm font-medium text-gray-900">{viewRow.reportTypeLabel}</span></div><div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Reference</span><span className="text-sm font-medium text-gray-900">{viewRow.reference}</span></div><div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Party / Account</span><span className="text-sm font-medium text-gray-900">{viewRow.partyName}</span></div><div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Bucket / Scope</span><span className="text-sm font-medium text-gray-900">{viewRow.bucketLabel}</span></div><div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Amount</span><span className="text-sm font-medium text-gray-900">{formatCurrency(viewRow.amount)}</span></div><div className="flex justify-between"><span className="text-sm text-gray-500">Status</span><span className="text-sm font-medium text-gray-900">{viewRow.statusLabel}</span></div></div></div>) : <p className="text-sm text-gray-500">No details available.</p>}<div className="flex justify-end pt-4"><button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Close</button></div></div>
      </SlideOver>
    </div>
  );
}
