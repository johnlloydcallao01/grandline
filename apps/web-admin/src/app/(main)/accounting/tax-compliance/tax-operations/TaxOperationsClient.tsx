'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  AlertCircle, ArrowDownRight, ArrowUpRight, Download, Edit, Eye, Filter, Plus, RefreshCw, Search, Trash2, Wallet, X,
} from '@/components/ui/IconWrapper';
import {
  getTaxCodesRegister,
  getTaxCodeDetail,
  createTaxCode,
  updateTaxCode,
  deleteTaxCode,
  getTaxUsageRegister,
  type TaxCodesRegisterResponse,
  type TaxCodeRegisterRow,
  type TaxCodeMetric,
  type TaxCodeDetail,
  type TaxUsageRegisterResponse,
} from './actions';

type TabId = 'tax-codes' | 'tax-usage';
type TaxCodeFilterState = { scopes: string[]; calculationMethods: string[]; statuses: string[] };

const STATIC_TABS = [
  { id: 'tax-codes' as TabId, label: 'Tax Codes', description: 'Manage tax-code master data with scope, rate, calculation method, linked accounts, and active status.', searchPlaceholder: 'Search tax code, name, scope, rate, method, or account', columns: ['Code', 'Name', 'Scope', 'Rate', 'Method', 'Status'] },
  { id: 'tax-usage' as TabId, label: 'Tax Usage', description: 'Review where tax codes are used across invoice lines, bill lines, expenses, and journal entry lines.', searchPlaceholder: 'Search tax code, source document, entity type, amount, or account', columns: ['Source Type', 'Document', 'Tax Code', 'Tax Scope', 'Taxable Amount', 'Tax Amount'] },
];

function getActionClasses(v: 'primary' | 'secondary' | 'ghost' = 'secondary') { if (v === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700'; if (v === 'ghost') return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'; return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'; }
function getMetricTone(t: TaxCodeMetric['trend']) { if (t === 'down') return 'text-red-600 bg-red-50'; if (t === 'neutral') return 'text-gray-600 bg-gray-100'; return 'text-green-600 bg-green-50'; }
function escapeCsvValue(v: string | number | boolean | null | undefined) { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }
function toggleFilterValue(values: string[], value: string) { return values.includes(value) ? values.filter((v) => v !== value) : [...values, value]; }

function SlideOver({ isOpen, onClose, title, description, children }: { isOpen: boolean; onClose: () => void; title: string; description?: string; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false); const [animate, setAnimate] = useState(false);
  useEffect(() => { if (isOpen) { setMounted(true); requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true))); } else { setAnimate(false); const timer = setTimeout(() => setMounted(false), 300); return () => clearTimeout(timer); } }, [isOpen]);
  if (!mounted) return null;
  return createPortal(<div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ease-in-out ${animate ? 'bg-black/50' : 'bg-transparent'}`} onClick={onClose}>
    <div className={`flex w-full max-w-lg flex-col bg-white shadow-xl transition-all duration-300 ease-in-out ${animate ? 'translate-x-0' : 'translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
      <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
        <div><h3 className="text-lg font-semibold text-gray-900">{title}</h3>{description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}</div>
        <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X className="h-5 w-5" /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
    </div>
  </div>, document.body);
}

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) { return <div className="space-y-1.5"><label className="block text-sm font-medium text-gray-700">{label}{required && <span className="ml-0.5 text-red-500">*</span>}</label>{children}</div>; }
function Input({ value, onChange, placeholder, type = 'text', required }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean }) { return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />; }
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: Array<{ label: string; value: string }> }) { return <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>; }
function TextArea({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) { return <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />; }

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

function getRelationshipValue(value: TaxCodeDetail['purchaseAccount'] | TaxCodeDetail['salesAccount']) {
  if (!value) return '';
  if (typeof value === 'object' && 'id' in value && value.id !== undefined && value.id !== null) return String(value.id);
  return String(value);
}

type Props = { initialData: TaxCodesRegisterResponse | null };

export default function TaxOperationsClient({ initialData }: Props) {
  const router = useRouter(); const pathname = usePathname(); const searchParams = useSearchParams();
  const hasConsumedInitialTaxCodeData = useRef(false);
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = (STATIC_TABS.find((t) => t.id === rawTab)?.id) || 'tax-codes';
  const currentTab = STATIC_TABS.find((t) => t.id === activeTab)!;

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  // --- Tax Codes state ---
  const [tcData, setTcData] = useState<TaxCodesRegisterResponse | null>(initialData);
  const [tcError, setTcError] = useState<string | null>(null);
  const [tcIsLoading, setTcIsLoading] = useState(!initialData);
  const [tcSearchInput, setTcSearchInput] = useState('');
  const [tcSubmittedSearch, setTcSubmittedSearch] = useState('');
  const [tcCurrentPage, setTcCurrentPage] = useState(initialData?.pagination.page || 1);
  const [tcFilters, setTcFilters] = useState<TaxCodeFilterState>({ scopes: initialData?.appliedFilters.scopes || [], calculationMethods: initialData?.appliedFilters.calculationMethods || [], statuses: initialData?.appliedFilters.statuses || [] });
  const [tcQuickFilters, setTcQuickFilters] = useState<string[]>(initialData?.appliedFilters.quickFilters || []);
  const [tcDraftFilters, setTcDraftFilters] = useState<TaxCodeFilterState>({ scopes: initialData?.appliedFilters.scopes || [], calculationMethods: initialData?.appliedFilters.calculationMethods || [], statuses: initialData?.appliedFilters.statuses || [] });
  const [tcIsFilterPanelOpen, setTcIsFilterPanelOpen] = useState(false);
  const tcFilterCount = tcFilters.scopes.length + tcFilters.calculationMethods.length + tcFilters.statuses.length;

  const fetchTcData = useCallback(async ({ search, page, filters: f, nextQuickFilters }: { search: string; page: number; filters: TaxCodeFilterState; nextQuickFilters: string[] }) => {
    if (activeTab !== 'tax-codes') return; setTcIsLoading(true); setTcError(null);
    try { const r = await getTaxCodesRegister({ search, page, scopes: f.scopes, calculationMethods: f.calculationMethods, statuses: f.statuses, quickFilters: nextQuickFilters }); setTcData(r); } catch (err) { setTcError(err instanceof Error ? err.message : 'Unable to load tax codes.'); } finally { setTcIsLoading(false); }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'tax-codes') return;
    if (initialData && !hasConsumedInitialTaxCodeData.current) {
      hasConsumedInitialTaxCodeData.current = true;
      return;
    }
    void fetchTcData({ search: tcSubmittedSearch, page: tcCurrentPage, filters: tcFilters, nextQuickFilters: tcQuickFilters });
  }, [activeTab, tcFilters, tcCurrentPage, tcSubmittedSearch, tcQuickFilters, fetchTcData, initialData]);

  // --- Tax Usage state ---
  type TaxUsageFilterState = { sourceTypes: string[] };
  const [tuData, setTuData] = useState<TaxUsageRegisterResponse | null>(null);
  const [tuError, setTuError] = useState<string | null>(null);
  const [tuIsLoading, setTuIsLoading] = useState(false);
  const [tuSearchInput, setTuSearchInput] = useState('');
  const [tuSubmittedSearch, setTuSubmittedSearch] = useState('');
  const [tuCurrentPage, setTuCurrentPage] = useState(1);
  const [tuFilters, setTuFilters] = useState<TaxUsageFilterState>({ sourceTypes: [] });
  const [tuQuickFilters, setTuQuickFilters] = useState<string[]>([]);
  const [tuDraftFilters, setTuDraftFilters] = useState<TaxUsageFilterState>({ sourceTypes: [] });
  const [tuIsFilterPanelOpen, setTuIsFilterPanelOpen] = useState(false);
  const tuFilterCount = tuFilters.sourceTypes.length;

  const fetchTuData = useCallback(async ({ search, page, filters: f, nextQuickFilters }: { search: string; page: number; filters: TaxUsageFilterState; nextQuickFilters: string[] }) => {
    if (activeTab !== 'tax-usage') return; setTuIsLoading(true); setTuError(null);
    try { const r = await getTaxUsageRegister({ search, page, sourceTypes: f.sourceTypes, quickFilters: nextQuickFilters }); setTuData(r); } catch (err) { setTuError(err instanceof Error ? err.message : 'Unable to load tax usage.'); } finally { setTuIsLoading(false); }
  }, [activeTab]);

  useEffect(() => { if (activeTab === 'tax-usage') void fetchTuData({ search: tuSubmittedSearch, page: tuCurrentPage, filters: tuFilters, nextQuickFilters: tuQuickFilters }); }, [activeTab, tuFilters, tuCurrentPage, tuSubmittedSearch, tuQuickFilters, fetchTuData]);

  const handleTuSearch = (e: React.FormEvent) => { e.preventDefault(); setTuSubmittedSearch(tuSearchInput); fetchTuData({ search: tuSearchInput, page: 1, filters: tuFilters, nextQuickFilters: tuQuickFilters }); };
  const handleTuRefresh = () => { fetchTuData({ search: tuSubmittedSearch, page: tuCurrentPage, filters: tuFilters, nextQuickFilters: tuQuickFilters }); };

  const handleTuToggleQuickFilter = (value: string) => {
    setTuQuickFilters((previous) => toggleFilterValue(previous, value));
    setTuCurrentPage(1);
  };

  const handleTuExport = () => {
    const rows = tuData?.section.table.rows; if (!rows?.length) return;
    const headers = ['Source Type', 'Document No.', 'Tax Code', 'Tax Scope', 'Taxable Amount', 'Tax Amount'];
    const csvRows = rows.map((r) => [r.sourceType, r.document ?? '-', r.taxCode ?? '-', r.taxScope ?? '-', r.taxableAmount, r.taxAmount]);
    const csvContent = [headers.map((h) => escapeCsvValue(h)), ...csvRows.map((r) => r.map((c) => escapeCsvValue(c)))].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'tax-usage.csv'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const handleTcSearch = (e: React.FormEvent) => { e.preventDefault(); setTcSubmittedSearch(tcSearchInput); fetchTcData({ search: tcSearchInput, page: 1, filters: tcFilters, nextQuickFilters: tcQuickFilters }); };
  const handleTcRefresh = () => { fetchTcData({ search: tcSubmittedSearch, page: tcCurrentPage, filters: tcFilters, nextQuickFilters: tcQuickFilters }); };

  const handleTcToggleQuickFilter = (value: string) => {
    setTcQuickFilters((previous) => toggleFilterValue(previous, value));
    setTcCurrentPage(1);
  };

  const handleTcExport = () => {
    const rows = tcData?.section.table.rows as TaxCodeRegisterRow[] | undefined; if (!rows?.length) return;
    const headers = ['Code', 'Name', 'Scope', 'Rate', 'Method', 'Status'];
    const csvRows = rows.map((r) => [r.code ?? '-', r.name ?? '-', r.scopeLabel ?? '-', r.rateDisplay ?? '-', r.calculationMethodLabel ?? '-', r.isActiveLabel ?? '-']);
    const csvContent = [headers.map((h) => escapeCsvValue(h)), ...csvRows.map((r) => r.map((c) => escapeCsvValue(c)))].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'tax-codes.csv'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [createErr, setCreateErr] = useState<string | null>(null);

  const [formState, setFormState] = useState({
    code: '', name: '', scope: 'both', rate: '0', calculationMethod: 'exclusive', purchaseAccount: '', salesAccount: '', isActive: true, description: ''
  });

  const [viewDetail, setViewDetail] = useState<TaxCodeDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);

  const [editDetailId, setEditDetailId] = useState<string | number | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editErr, setEditErr] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [deleteCode, setDeleteCode] = useState<string>('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setCreateErr(null); setIsCreateSubmitting(true);
    try {
      await createTaxCode({
        code: formState.code, name: formState.name, scope: formState.scope,
        rate: Number(formState.rate), calculationMethod: formState.calculationMethod,
        purchaseAccount: formState.purchaseAccount || null, salesAccount: formState.salesAccount || null,
        isActive: formState.isActive, description: formState.description
      });
      setIsCreateOpen(false); setFormState({ code: '', name: '', scope: 'both', rate: '0', calculationMethod: 'exclusive', purchaseAccount: '', salesAccount: '', isActive: true, description: '' });
      handleTcRefresh();
    } catch (err) {
      setCreateErr(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsCreateSubmitting(false);
    }
  };

  const handleView = async (id: string | number) => {
    setIsViewOpen(true); setIsViewLoading(true); setViewDetail(null);
    try { const d = await getTaxCodeDetail(id); setViewDetail(d); } catch (e) { console.error(e); } finally { setIsViewLoading(false); }
  };

  const handleOpenEdit = async (id: string | number) => {
    setIsEditOpen(true); setEditErr(null); setEditDetailId(id); setIsViewLoading(true); setViewDetail(null);
    try {
      const d = await getTaxCodeDetail(id); setViewDetail(d);
      setFormState({
        code: d.code || '',
        name: d.name || '',
        scope: d.scope || 'both',
        rate: String(d.rate || 0),
        calculationMethod: d.calculationMethod || 'exclusive',
        purchaseAccount: getRelationshipValue(d.purchaseAccount),
        salesAccount: getRelationshipValue(d.salesAccount),
        isActive: d.isActive,
        description: d.description || '',
      });
    } catch (e) { setEditErr(e instanceof Error ? e.message : 'Unable to load details.'); } finally { setIsViewLoading(false); }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editDetailId) return; setEditErr(null); setIsEditSubmitting(true);
    try {
      await updateTaxCode(editDetailId, {
        code: formState.code, name: formState.name, scope: formState.scope,
        rate: Number(formState.rate), calculationMethod: formState.calculationMethod,
        purchaseAccount: formState.purchaseAccount || null, salesAccount: formState.salesAccount || null,
        isActive: formState.isActive, description: formState.description
      });
      setIsEditOpen(false); handleTcRefresh();
    } catch (err) { setEditErr(err instanceof Error ? err.message : 'An error occurred'); } finally { setIsEditSubmitting(false); }
  };

  const handleOpenDelete = (id: string | number, code: string) => { setDeleteId(id); setDeleteCode(code); setIsDeleteOpen(true); setDeleteErr(null); };
  const handleCloseDelete = () => { setIsDeleteOpen(false); setDeleteId(null); setDeleteCode(''); };
  const handleConfirmDelete = async () => {
    if (!deleteId) return; setIsDeleteSubmitting(true); setDeleteErr(null);
    try { await deleteTaxCode(deleteId); setIsDeleteOpen(false); handleTcRefresh(); } catch (err) { setDeleteErr(err instanceof Error ? err.message : 'Unable to delete.'); } finally { setIsDeleteSubmitting(false); }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Core / Tax Compliance</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Tax & Operations</h1>
          <p className="mt-1 text-base text-gray-600">Manage tax-code master records and track tax-code usage across accounting documents.</p>
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
        {activeTab === 'tax-codes' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-gray-900">{currentTab.label}</h2>
                <p className="text-sm text-gray-600">{currentTab.description}</p>
                <p className="text-sm text-gray-500">{tcData?.totals.filteredCodes ?? 0} matching codes</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={handleTcRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}><RefreshCw className="h-4 w-4" /> Refresh Codes</button>
                <button type="button" onClick={() => setIsCreateOpen(true)} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}><Plus className="h-4 w-4" /> Create Tax Code</button>
              </div>
            </div>

            {tcData?.section.metrics && tcData.section.metrics.length > 0 ? (<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{tcData.section.metrics.map((m) => (<div key={m.id}><MetricCard label={m.label} value={m.value} change={m.change} trend={m.trend} /></div>))}</div>) : null}

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                  <form onSubmit={handleTcSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
                    <div className="relative min-w-0 flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input type="text" placeholder={currentTab.searchPlaceholder} value={tcSearchInput} onChange={(e) => setTcSearchInput(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    </div>
                    <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"><Search className="h-4 w-4" /> Search</button>
                  </form>
                  <button type="button" onClick={() => { if (!tcIsFilterPanelOpen) setTcDraftFilters({ ...tcFilters }); setTcIsFilterPanelOpen((p) => !p); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${tcIsFilterPanelOpen || tcFilterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}><Filter className="h-4 w-4" /> Filters{tcFilterCount > 0 && <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{tcFilterCount}</span>}</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(() => { const qf = tcData?.section?.filters?.quickFilters; if (qf && qf.length > 0) return qf.map((f) => { const isActive = tcQuickFilters.includes(f.value); return <button key={f.value} type="button" onClick={() => handleTcToggleQuickFilter(f.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{f.label}</button>; }); return null; })()}
                </div>
              </div>

              <div className="space-y-4 p-5">
                {tcIsFilterPanelOpen && (<div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><h4 className="text-sm font-semibold text-gray-900">Filters</h4><p className="mt-1 text-sm text-gray-600">Select as many filter values as needed, then apply them in one step.</p></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => { setTcDraftFilters({ scopes: [], calculationMethods: [], statuses: [] }); setTcFilters({ scopes: [], calculationMethods: [], statuses: [] }); setTcCurrentPage(1); setTcIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Clear all</button><button type="button" onClick={() => { setTcFilters({ ...tcDraftFilters }); setTcCurrentPage(1); setTcIsFilterPanelOpen(false); }} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button><button type="button" onClick={() => { setTcFilters({ ...tcDraftFilters }); setTcCurrentPage(1); setTcIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button></div></div>
                  <div className="mt-6 grid gap-6 md:grid-cols-3">
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</h5>
                      <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => setTcDraftFilters((p) => ({ ...p, statuses: toggleFilterValue(p.statuses, 'active') }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${tcDraftFilters.statuses.includes('active') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>Active</button><button type="button" onClick={() => setTcDraftFilters((p) => ({ ...p, statuses: toggleFilterValue(p.statuses, 'inactive') }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${tcDraftFilters.statuses.includes('inactive') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>Inactive</button></div>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Tax Scope</h5>
                      <div className="mt-3 flex flex-wrap gap-2">{tcData?.section?.filters?.scopes?.map((opt) => { const isSelected = tcDraftFilters.scopes.includes(opt.value); return <button key={opt.value} type="button" onClick={() => setTcDraftFilters((p) => ({ ...p, scopes: toggleFilterValue(p.scopes, opt.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{opt.label}</button>; })}</div>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Calculation Method</h5>
                      <div className="mt-3 flex flex-wrap gap-2">{tcData?.section?.filters?.calculationMethods?.map((opt) => { const isSelected = tcDraftFilters.calculationMethods.includes(opt.value); return <button key={opt.value} type="button" onClick={() => setTcDraftFilters((p) => ({ ...p, calculationMethods: toggleFilterValue(p.calculationMethods, opt.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{opt.label}</button>; })}</div>
                    </div>
                  </div>
                </div>)}

                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold text-gray-900">Tax Code Register</h3>
                    <p className="text-sm text-gray-600">Tax-code master records using code, scope, rate, calculation method, and active flags from the collection.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span>{tcData?.totals.filteredCodes ?? 0} matching codes</span>
                    <button type="button" onClick={handleTcExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!(tcData?.section.table.rows.length)}><Download className="h-4 w-4" /> Download View</button>
                  </div>
                </div>

                {tcError && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{tcError}</div>}
                {tcIsLoading ? <LoadingSkeleton /> : (<>
                  <div className="overflow-hidden rounded-xl border border-gray-200"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{currentTab.columns.map((col) => {
                    const isNumberColumn = col === 'Rate';
                    return (<th key={col} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${isNumberColumn ? 'text-right' : 'text-left'}`}>{col}</th>);
                  })}<th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th></tr></thead><tbody className="divide-y divide-gray-200 bg-white">{(tcData?.section.table.rows ?? []).length > 0 ? (tcData?.section.table.rows ?? []).map((row) => (<tr key={row.id} className="hover:bg-gray-50">{row.cells.map((cell, index) => renderCell(cell, index))}<td className="px-4 py-3 text-right"><div className="flex justify-end gap-2"><button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail"><Eye className="h-4 w-4" /></button><button type="button" onClick={() => handleOpenEdit(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="Edit"><Edit className="h-4 w-4" /></button><button type="button" onClick={() => { handleOpenDelete(row.id, row.code || 'Tax Code'); }} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700" title="Delete"><Trash2 className="h-4 w-4" /></button></div></td></tr>)) : (<tr><td colSpan={currentTab.columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">No tax codes found.</td></tr>)}</tbody></table></div></div>
                  {tcData?.pagination && tcData.pagination.totalPages > 1 && (<div className="flex items-center justify-between"><p className="text-sm text-gray-600">Page {tcData.pagination.page} of {tcData.pagination.totalPages}</p><div className="flex gap-2"><button type="button" disabled={!tcData.pagination.hasPrevPage} onClick={() => setTcCurrentPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button><button type="button" disabled={!tcData.pagination.hasNextPage} onClick={() => setTcCurrentPage((p) => p + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button></div></div>)}
                </>)}
              </div>
            </div>

            <SlideOver isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Tax Code" description="Add a new tax code master record to the system.">
              <form onSubmit={handleCreateSubmit} className="space-y-6">
                {createErr && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{createErr}</div>}
                <div className="space-y-4">
                  <FormField label="Tax Code" required><Input value={formState.code} onChange={(v) => setFormState({ ...formState, code: v })} placeholder="e.g. VAT12" required /></FormField>
                  <FormField label="Tax Name" required><Input value={formState.name} onChange={(v) => setFormState({ ...formState, name: v })} placeholder="e.g. Standard VAT 12%" required /></FormField>
                  <FormField label="Scope" required>
                    <Select value={formState.scope} onChange={(v) => setFormState({ ...formState, scope: v })} options={[{ label: 'Both (Sales & Purchase)', value: 'both' }, { label: 'Sales Only', value: 'sales' }, { label: 'Purchase Only', value: 'purchase' }]} />
                  </FormField>
                  <FormField label="Rate (%)" required><Input type="number" value={formState.rate} onChange={(v) => setFormState({ ...formState, rate: v })} placeholder="0" required /></FormField>
                  <FormField label="Calculation Method" required>
                    <Select value={formState.calculationMethod} onChange={(v) => setFormState({ ...formState, calculationMethod: v })} options={[{ label: 'Exclusive', value: 'exclusive' }, { label: 'Inclusive', value: 'inclusive' }, { label: 'Zero Rated', value: 'zero_rated' }, { label: 'Exempt', value: 'exempt' }]} />
                  </FormField>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Purchase Account</span>
                    <select
                      value={formState.purchaseAccount}
                      onChange={(event) => setFormState({ ...formState, purchaseAccount: event.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Select a value</option>
                      {(tcData?.referenceData.chartAccounts || []).map((account) => (
                        <option key={String(account.id)} value={String(account.id)}>
                          {account.code ? `${account.code} - ` : ''}{account.name || 'Unnamed account'}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Sales Account</span>
                    <select
                      value={formState.salesAccount}
                      onChange={(event) => setFormState({ ...formState, salesAccount: event.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Select a value</option>
                      {(tcData?.referenceData.chartAccounts || []).map((account) => (
                        <option key={String(account.id)} value={String(account.id)}>
                          {account.code ? `${account.code} - ` : ''}{account.name || 'Unnamed account'}
                        </option>
                      ))}
                    </select>
                  </label>
                  <FormField label="Status" required>
                    <Select value={formState.isActive ? 'true' : 'false'} onChange={(v) => setFormState({ ...formState, isActive: v === 'true' })} options={[{ label: 'Active', value: 'true' }, { label: 'Inactive', value: 'false' }]} />
                  </FormField>
                  <FormField label="Description"><TextArea value={formState.description} onChange={(v) => setFormState({ ...formState, description: v })} rows={3} /></FormField>
                </div>
                <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
                  <button type="button" onClick={() => setIsCreateOpen(false)} disabled={isCreateSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">Cancel</button>
                  <button type="submit" disabled={isCreateSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>{isCreateSubmitting ? 'Saving...' : 'Save Tax Code'}</button>
                </div>
              </form>
            </SlideOver>

            <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Tax Code Detail" description="View full details and usage summary of the tax code.">
              <div className="space-y-6">
                {isViewLoading ? <LoadingSkeleton /> : viewDetail ? (
                  <div className="space-y-6">
                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                      <div className="flex justify-between border-b border-gray-100 pb-3">
                        <span className="text-sm text-gray-500">Tax Code</span>
                        <span className="text-sm font-medium text-gray-900">{viewDetail.code}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-3">
                        <span className="text-sm text-gray-500">Tax Name</span>
                        <span className="text-sm font-medium text-gray-900">{viewDetail.name}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-3">
                        <span className="text-sm text-gray-500">Scope</span>
                        <span className="text-sm font-medium text-gray-900">{viewDetail.scope}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-3">
                        <span className="text-sm text-gray-500">Rate</span>
                        <span className="text-sm font-medium text-gray-900">{viewDetail.rate}%</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-3">
                        <span className="text-sm text-gray-500">Method</span>
                        <span className="text-sm font-medium text-gray-900">{viewDetail.calculationMethod}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-3">
                        <span className="text-sm text-gray-500">Status</span>
                        <span className="text-sm font-medium text-gray-900">{viewDetail.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Description</span>
                        <span className="text-sm font-medium text-gray-900">{viewDetail.description || '-'}</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                      <h4 className="text-sm font-semibold text-gray-900">Usage Summary</h4>
                      <div className="flex justify-between border-b border-gray-100 pb-3">
                        <span className="text-sm text-gray-500">Expenses</span>
                        <span className="text-sm font-medium text-gray-900">{viewDetail.usageSummary.expenseCount}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-3">
                        <span className="text-sm text-gray-500">Bill Lines</span>
                        <span className="text-sm font-medium text-gray-900">{viewDetail.usageSummary.billLineItemCount}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-3">
                        <span className="text-sm text-gray-500">Invoice Lines</span>
                        <span className="text-sm font-medium text-gray-900">{viewDetail.usageSummary.invoiceLineItemCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Journal Lines</span>
                        <span className="text-sm font-medium text-gray-900">{viewDetail.usageSummary.journalEntryLineCount}</span>
                      </div>
                    </div>
                  </div>
                ) : <p className="text-sm text-gray-500">No details available.</p>}
                <div className="flex justify-end pt-4"><button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Close</button></div>
              </div>
            </SlideOver>

            <SlideOver isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Tax Code" description="Modify the tax code details.">
              <form onSubmit={handleEditSubmit} className="space-y-6">
                {isViewLoading ? <LoadingSkeleton /> : (
                  <>
                    {editErr && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{editErr}</div>}
                    <div className="space-y-4">
                      <FormField label="Tax Code" required><Input value={formState.code} onChange={(v) => setFormState({ ...formState, code: v })} placeholder="e.g. VAT12" required /></FormField>
                      <FormField label="Tax Name" required><Input value={formState.name} onChange={(v) => setFormState({ ...formState, name: v })} placeholder="e.g. Standard VAT 12%" required /></FormField>
                      <FormField label="Scope" required>
                        <Select value={formState.scope} onChange={(v) => setFormState({ ...formState, scope: v })} options={[{ label: 'Both (Sales & Purchase)', value: 'both' }, { label: 'Sales Only', value: 'sales' }, { label: 'Purchase Only', value: 'purchase' }]} />
                      </FormField>
                      <FormField label="Rate (%)" required><Input type="number" value={formState.rate} onChange={(v) => setFormState({ ...formState, rate: v })} placeholder="0" required /></FormField>
                      <FormField label="Calculation Method" required>
                        <Select value={formState.calculationMethod} onChange={(v) => setFormState({ ...formState, calculationMethod: v })} options={[{ label: 'Exclusive', value: 'exclusive' }, { label: 'Inclusive', value: 'inclusive' }, { label: 'Zero Rated', value: 'zero_rated' }, { label: 'Exempt', value: 'exempt' }]} />
                      </FormField>
                      <label className="space-y-2 text-sm text-gray-700">
                        <span className="font-medium">Purchase Account</span>
                        <select
                          value={formState.purchaseAccount}
                          onChange={(event) => setFormState({ ...formState, purchaseAccount: event.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                          <option value="">Select a value</option>
                          {(tcData?.referenceData.chartAccounts || []).map((account) => (
                            <option key={String(account.id)} value={String(account.id)}>
                              {account.code ? `${account.code} - ` : ''}{account.name || 'Unnamed account'}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-2 text-sm text-gray-700">
                        <span className="font-medium">Sales Account</span>
                        <select
                          value={formState.salesAccount}
                          onChange={(event) => setFormState({ ...formState, salesAccount: event.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                          <option value="">Select a value</option>
                          {(tcData?.referenceData.chartAccounts || []).map((account) => (
                            <option key={String(account.id)} value={String(account.id)}>
                              {account.code ? `${account.code} - ` : ''}{account.name || 'Unnamed account'}
                            </option>
                          ))}
                        </select>
                      </label>
                      <FormField label="Status" required>
                        <Select value={formState.isActive ? 'true' : 'false'} onChange={(v) => setFormState({ ...formState, isActive: v === 'true' })} options={[{ label: 'Active', value: 'true' }, { label: 'Inactive', value: 'false' }]} />
                      </FormField>
                      <FormField label="Description"><TextArea value={formState.description} onChange={(v) => setFormState({ ...formState, description: v })} rows={3} /></FormField>
                    </div>
                    <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
                      <button type="button" onClick={() => setIsEditOpen(false)} disabled={isEditSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">Cancel</button>
                      <button type="submit" disabled={isEditSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>{isEditSubmitting ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                  </>
                )}
              </form>
            </SlideOver>

            <SlideOver isOpen={isDeleteOpen} onClose={handleCloseDelete} title="Delete Tax Code" description="Remove this tax code permanently.">
              <div className="space-y-6">
                {deleteErr && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{deleteErr}</div>}
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><p className="font-medium">Are you sure?</p><p className="mt-1">This action cannot be undone. Tax code "{deleteCode}" will be permanently removed.</p></div>
                <div className="flex justify-end gap-3 border-t border-gray-200 pt-4"><button type="button" onClick={handleCloseDelete} disabled={isDeleteSubmitting} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">Cancel</button><button type="button" onClick={handleConfirmDelete} disabled={isDeleteSubmitting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">{isDeleteSubmitting ? 'Deleting...' : 'Delete Tax Code'}</button></div>
              </div>
            </SlideOver>
          </div>
        )}

        {activeTab === 'tax-usage' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-gray-900">{currentTab.label}</h2>
                <p className="text-sm text-gray-600">{currentTab.description}</p>
                <p className="text-sm text-gray-500">{tuData?.totals.filteredUsages ?? 0} matching usages</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={handleTuRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}><RefreshCw className="h-4 w-4" /> Refresh Usages</button>
              </div>
            </div>

            {tuData?.section.metrics && tuData.section.metrics.length > 0 ? (<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{tuData.section.metrics.map((m) => (<div key={m.id}><MetricCard label={m.label} value={m.value} change={m.change} trend={m.trend} /></div>))}</div>) : null}

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                  <form onSubmit={handleTuSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
                    <div className="relative min-w-0 flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input type="text" placeholder={currentTab.searchPlaceholder} value={tuSearchInput} onChange={(e) => setTuSearchInput(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    </div>
                    <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"><Search className="h-4 w-4" /> Search</button>
                  </form>
                  <button type="button" onClick={() => { if (!tuIsFilterPanelOpen) setTuDraftFilters({ ...tuFilters }); setTuIsFilterPanelOpen((p) => !p); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${tuIsFilterPanelOpen || tuFilterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}><Filter className="h-4 w-4" /> Filters{tuFilterCount > 0 && <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{tuFilterCount}</span>}</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(() => { const qf = tuData?.section?.filters?.quickFilters; if (qf && qf.length > 0) return qf.map((f) => { const isActive = tuQuickFilters.includes(f.value); return <button key={f.value} type="button" onClick={() => handleTuToggleQuickFilter(f.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{f.label}</button>; }); return null; })()}
                </div>
              </div>

              <div className="space-y-4 p-5">
                {tuIsFilterPanelOpen && (<div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><h4 className="text-sm font-semibold text-gray-900">Filters</h4><p className="mt-1 text-sm text-gray-600">Select as many filter values as needed, then apply them in one step.</p></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => { setTuDraftFilters({ sourceTypes: [] }); setTuFilters({ sourceTypes: [] }); setTuCurrentPage(1); setTuIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Clear all</button><button type="button" onClick={() => { setTuFilters({ ...tuDraftFilters }); setTuCurrentPage(1); setTuIsFilterPanelOpen(false); }} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button><button type="button" onClick={() => { setTuFilters({ ...tuDraftFilters }); setTuCurrentPage(1); setTuIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button></div></div>
                  <div className="mt-6 grid gap-6 md:grid-cols-1">
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Source Type</h5>
                      <div className="mt-3 flex flex-wrap gap-2">{tuData?.section?.filters?.sourceTypes?.map((opt) => { const isSelected = tuDraftFilters.sourceTypes.includes(opt.value); return <button key={opt.value} type="button" onClick={() => setTuDraftFilters((p) => ({ ...p, sourceTypes: toggleFilterValue(p.sourceTypes, opt.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{opt.label}</button>; })}</div>
                    </div>
                  </div>
                </div>)}

                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold text-gray-900">Tax Usage Register</h3>
                    <p className="text-sm text-gray-600">A read-only register showing tax applied across various accounting documents.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span>{tuData?.totals.filteredUsages ?? 0} matching usages</span>
                    <button type="button" onClick={handleTuExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!(tuData?.section.table.rows.length)}><Download className="h-4 w-4" /> Download View</button>
                  </div>
                </div>

                {tuError && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{tuError}</div>}
                {tuIsLoading ? <LoadingSkeleton /> : (<>
                  <div className="overflow-hidden rounded-xl border border-gray-200"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{currentTab.columns.map((col) => {
                    const isNumberColumn = col === 'Taxable Amount' || col === 'Tax Amount';
                    return (<th key={col} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${isNumberColumn ? 'text-right' : 'text-left'}`}>{col}</th>);
                  })}</tr></thead><tbody className="divide-y divide-gray-200 bg-white">{(tuData?.section.table.rows ?? []).length > 0 ? (tuData?.section.table.rows ?? []).map((row) => (<tr key={row.id} className="hover:bg-gray-50">{row.cells.map((cell, index) => renderCell(cell, index))}</tr>)) : (<tr><td colSpan={currentTab.columns.length} className="px-4 py-10 text-center text-sm text-gray-500">No tax usages found.</td></tr>)}</tbody></table></div></div>
                  {tuData?.pagination && tuData.pagination.totalPages > 1 && (<div className="flex items-center justify-between"><p className="text-sm text-gray-600">Page {tuData.pagination.page} of {tuData.pagination.totalPages}</p><div className="flex gap-2"><button type="button" disabled={!tuData.pagination.hasPrevPage} onClick={() => setTuCurrentPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button><button type="button" disabled={!tuData.pagination.hasNextPage} onClick={() => setTuCurrentPage((p) => p + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button></div></div>)}
                </>)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
