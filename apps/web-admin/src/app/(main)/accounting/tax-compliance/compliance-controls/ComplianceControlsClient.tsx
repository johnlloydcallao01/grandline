'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Filter, Search, Download, AlertCircle, RefreshCw, ArrowDownRight, ArrowUpRight, Wallet, Plus, Eye, Edit, Trash2, X } from 'lucide-react';
import { getTaxCodeGovernance, getTaxAuditHistory, type TaxCodeGovernanceResponse, type TaxAuditHistoryResponse, type TaxAuditHistoryRow, type GovernanceMetric } from './actions';
import { getTaxCodeDetail, updateTaxCode, deleteTaxCode, type TaxCodeDetail } from '../tax-operations/actions';

type TabId = 'tax-code-governance' | 'tax-audit-history';
type FilterState = { status: string[], mapping: string[] };
type AuditFilterState = { actionTypes: string[], sources: string[] };

const STATIC_TABS = [
  { id: 'tax-code-governance' as TabId, label: 'Tax Code Governance', description: 'Review control fields on tax-code records including scope, rate, method, account mapping, and active state.', searchPlaceholder: 'Search tax code, scope, rate, method, sales account, or purchase account', columns: ['Code', 'Scope', 'Rate', 'Method', 'Account Mapping', 'Status'] },
  { id: 'tax-audit-history' as TabId, label: 'Tax Audit History', description: 'Review audit history for tax-code changes, tax-summary exports, and tax-related finance actions.', searchPlaceholder: 'Search tax code, action, user, reason, or exported report', columns: ['Performed At', 'Entity Type', 'Entity ID', 'Action', 'Performed By', 'Reason'] },
];

function getActionClasses(v: 'primary' | 'secondary' | 'ghost' = 'secondary') { if (v === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700'; if (v === 'ghost') return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'; return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'; }
function getMetricTone(t: GovernanceMetric['trend']) { if (t === 'down') return 'text-red-600 bg-red-50'; if (t === 'neutral') return 'text-gray-600 bg-gray-100'; return 'text-green-600 bg-green-50'; }
function escapeCsvValue(v: string | number | boolean | null | undefined) { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }
function toggleFilterValue(values: string[], value: string) { return values.includes(value) ? values.filter((v) => v !== value) : [...values, value]; }
function formatJsonValue(value: unknown) { try { return JSON.stringify(value ?? null, null, 2); } catch { return String(value ?? ''); } }

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

export function ComplianceControlsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = (STATIC_TABS.find((t) => t.id === rawTab)?.id) || 'tax-code-governance';
  const currentTab = STATIC_TABS.find((t) => t.id === activeTab)!;

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const [data, setData] = useState<TaxCodeGovernanceResponse | null>(null);
  const [auditData, setAuditData] = useState<TaxAuditHistoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({ status: [], mapping: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [draftFilters, setDraftFilters] = useState<FilterState>({ status: [], mapping: [] });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const filterCount = filters.status.length + filters.mapping.length;
  const [auditSearchInput, setAuditSearchInput] = useState('');
  const [auditSubmittedSearch, setAuditSubmittedSearch] = useState('');
  const [auditCurrentPage, setAuditCurrentPage] = useState(1);
  const [auditFilters, setAuditFilters] = useState<AuditFilterState>({ actionTypes: [], sources: [] });
  const [auditQuickFilters, setAuditQuickFilters] = useState<string[]>([]);
  const [auditDraftFilters, setAuditDraftFilters] = useState<AuditFilterState>({ actionTypes: [], sources: [] });
  const [isAuditFilterPanelOpen, setIsAuditFilterPanelOpen] = useState(false);
  const auditFilterCount = auditFilters.actionTypes.length + auditFilters.sources.length;

  const fetchData = useCallback(async ({
    search,
    page,
    filters: f,
    nextQuickFilters,
  }: {
    search: string;
    page: number;
    filters: FilterState;
    nextQuickFilters: string[];
  }) => {
    if (activeTab !== 'tax-code-governance') return;
    setIsLoading(true); setError(null);
    try {
      const r = await getTaxCodeGovernance({ search, page, status: f.status, mapping: f.mapping, quickFilters: nextQuickFilters });
      setData(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load tax code governance.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'tax-code-governance') {
      void fetchData({ search: submittedSearch, page: currentPage, filters, nextQuickFilters: quickFilters });
    }
  }, [activeTab, filters, currentPage, quickFilters, submittedSearch, fetchData]);

  const fetchAuditData = useCallback(async ({
    search,
    page,
    filters: f,
    nextQuickFilters,
  }: {
    search: string;
    page: number;
    filters: AuditFilterState;
    nextQuickFilters: string[];
  }) => {
    if (activeTab !== 'tax-audit-history') return;
    setIsLoading(true); setError(null);
    try {
      const r = await getTaxAuditHistory({
        search,
        page,
        actionTypes: f.actionTypes,
        sources: f.sources,
        quickFilters: nextQuickFilters,
      });
      setAuditData(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load tax audit history.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'tax-audit-history') {
      void fetchAuditData({
        search: auditSubmittedSearch,
        page: auditCurrentPage,
        filters: auditFilters,
        nextQuickFilters: auditQuickFilters,
      });
    }
  }, [activeTab, auditFilters, auditCurrentPage, auditQuickFilters, auditSubmittedSearch, fetchAuditData]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSubmittedSearch(searchInput); fetchData({ search: searchInput, page: 1, filters, nextQuickFilters: quickFilters }); };
  const handleRefresh = () => { fetchData({ search: submittedSearch, page: currentPage, filters, nextQuickFilters: quickFilters }); };
  const handleAuditSearch = (e: React.FormEvent) => { e.preventDefault(); setAuditSubmittedSearch(auditSearchInput); fetchAuditData({ search: auditSearchInput, page: 1, filters: auditFilters, nextQuickFilters: auditQuickFilters }); };
  const handleAuditRefresh = () => { fetchAuditData({ search: auditSubmittedSearch, page: auditCurrentPage, filters: auditFilters, nextQuickFilters: auditQuickFilters }); };

  const handleToggleQuickFilter = (value: string) => {
    setQuickFilters((previous) => toggleFilterValue(previous, value));
    setCurrentPage(1);
  };

  const handleExport = () => {
    const rows = data?.section.table.rows; if (!rows?.length) return;
    const headers = ['Code', 'Scope', 'Rate', 'Method', 'Account Mapping', 'Status'];
    const csvRows = rows.map((r) => [r.code ?? '-', r.scopeLabel ?? '-', r.rateDisplay ?? '-', r.methodLabel ?? '-', r.accountMapping, r.statusLabel]);
    const csvContent = [headers.map((h) => escapeCsvValue(h)), ...csvRows.map((r) => r.map((c) => escapeCsvValue(c)))].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'tax-code-governance.csv'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const handleToggleAuditQuickFilter = (value: string) => {
    setAuditQuickFilters((previous) => toggleFilterValue(previous, value));
    setAuditCurrentPage(1);
  };

  const handleAuditExport = () => {
    const rows = auditData?.section.table.rows; if (!rows?.length) return;
    const headers = ['Performed At', 'Entity Type', 'Entity ID', 'Action', 'Performed By', 'Reason', 'Source', 'Metadata Summary'];
    const csvRows = rows.map((r) => [r.performedAtLabel, r.entityTypeLabel, r.entityId, r.actionLabel, r.performedBy, r.reason, r.sourceLabel, r.metadataSummary]);
    const csvContent = [headers.map((h) => escapeCsvValue(h)), ...csvRows.map((r) => r.map((c) => escapeCsvValue(c)))].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'tax-audit-history.csv'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [createErr, setCreateErr] = useState<string | null>(null);

  const handleOpenCreateTaxCode = () => {
    setFormState({ code: '', name: '', scope: 'both', rate: '0', calculationMethod: 'exclusive', purchaseAccount: '', salesAccount: '', isActive: true, description: '' });
    setCreateErr(null);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setCreateErr(null); setIsCreateSubmitting(true);
    try {
      const { createTaxCode } = await import('../tax-operations/actions');
      await createTaxCode({
        code: formState.code, name: formState.name, scope: formState.scope,
        rate: Number(formState.rate), calculationMethod: formState.calculationMethod,
        purchaseAccount: formState.purchaseAccount || null, salesAccount: formState.salesAccount || null,
        isActive: formState.isActive, description: formState.description
      });
      setIsCreateOpen(false); handleRefresh();
    } catch (err) { setCreateErr(err instanceof Error ? err.message : 'An error occurred'); } finally { setIsCreateSubmitting(false); }
  };

  const [formState, setFormState] = useState({ code: '', name: '', scope: 'both', rate: '0', calculationMethod: 'exclusive', purchaseAccount: '', salesAccount: '', isActive: true, description: '' });

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
  const [auditViewDetail, setAuditViewDetail] = useState<TaxAuditHistoryRow | null>(null);
  const [isAuditViewOpen, setIsAuditViewOpen] = useState(false);

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
      setIsEditOpen(false); handleRefresh();
    } catch (err) { setEditErr(err instanceof Error ? err.message : 'An error occurred'); } finally { setIsEditSubmitting(false); }
  };

  const handleOpenDelete = (id: string | number, code: string) => { setDeleteId(id); setDeleteCode(code); setIsDeleteOpen(true); setDeleteErr(null); };
  const handleCloseDelete = () => { setIsDeleteOpen(false); setDeleteId(null); setDeleteCode(''); };
  const handleConfirmDelete = async () => {
    if (!deleteId) return; setIsDeleteSubmitting(true); setDeleteErr(null);
    try { await deleteTaxCode(deleteId); setIsDeleteOpen(false); handleRefresh(); } catch (err) { setDeleteErr(err instanceof Error ? err.message : 'Unable to delete.'); } finally { setIsDeleteSubmitting(false); }
  };
  const handleViewAuditDetail = (row: TaxAuditHistoryRow) => { setAuditViewDetail(row); setIsAuditViewOpen(true); };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Core / Tax & Compliance</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Compliance Controls</h1>
          <p className="mt-1 text-base text-gray-600">Review tax-code governance and tax-related audit visibility using the control data and audit support currently available in apps/cms.</p>
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
        {activeTab === 'tax-code-governance' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-gray-900">{currentTab.label}</h2>
                <p className="text-sm text-gray-600">{currentTab.description}</p>
                <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}><RefreshCw className="h-4 w-4" /> Refresh Controls</button>
                <button type="button" onClick={handleOpenCreateTaxCode} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}><Plus className="h-4 w-4" /> Create Tax Code</button>
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
                  {(() => { const qf = data?.section?.filters?.quickFilters; if (qf && qf.length > 0) return qf.map((f) => <button key={f.value} type="button" onClick={() => handleToggleQuickFilter(f.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${quickFilters.includes(f.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{f.label}</button>); return null; })()}
                </div>
              </div>

              <div className="space-y-4 p-5">
                {isFilterPanelOpen && (<div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><h4 className="text-sm font-semibold text-gray-900">Filters</h4><p className="mt-1 text-sm text-gray-600">Select as many filter values as needed, then apply them in one step.</p></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => { setDraftFilters({ status: [], mapping: [] }); setFilters({ status: [], mapping: [] }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Clear all</button><button type="button" onClick={() => { setFilters({ ...draftFilters }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button><button type="button" onClick={() => { setFilters({ ...draftFilters }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button></div></div>
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</h5>
                      <div className="mt-3 flex flex-wrap gap-2">{data?.section?.filters?.status?.map((opt) => { const isSelected = draftFilters.status.includes(opt.value); return <button key={opt.value} type="button" onClick={() => setDraftFilters((p) => ({ ...p, status: toggleFilterValue(p.status, opt.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{opt.label}</button>; })}</div>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Account Mapping</h5>
                      <div className="mt-3 flex flex-wrap gap-2">{data?.section?.filters?.mapping?.map((opt) => { const isSelected = draftFilters.mapping.includes(opt.value); return <button key={opt.value} type="button" onClick={() => setDraftFilters((p) => ({ ...p, mapping: toggleFilterValue(p.mapping, opt.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{opt.label}</button>; })}</div>
                    </div>
                  </div>
                </div>)}

                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold text-gray-900">Tax Code Control Matrix</h3>
                    <p className="text-sm text-gray-600">Control-focused view of tax-code settings and posting-account relationships from the tax-code collection.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span>{data?.totals.filteredRows ?? 0} matching rows</span>
                    <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!(data?.section.table.rows.length)}><Download className="h-4 w-4" /> Download View</button>
                  </div>
                </div>

                {error && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
                {isLoading ? <LoadingSkeleton /> : (<>
                  <div className="overflow-hidden rounded-xl border border-gray-200"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{currentTab.columns.map((col) => {
                    const isNumberColumn = col === 'Rate';
                    return (<th key={col} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${isNumberColumn ? 'text-right' : 'text-left'}`}>{col}</th>);
                  })}<th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th></tr></thead><tbody className="divide-y divide-gray-200 bg-white">{(data?.section.table.rows ?? []).length > 0 ? (data?.section.table.rows ?? []).map((row) => (<tr key={row.id} className="hover:bg-gray-50">{row.cells.map((cell, index) => renderCell(cell, index))}<td className="px-4 py-3 text-right"><div className="flex justify-end gap-2"><button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail"><Eye className="h-4 w-4" /></button><button type="button" onClick={() => handleOpenEdit(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="Edit"><Edit className="h-4 w-4" /></button><button type="button" onClick={() => { handleOpenDelete(row.id, row.code || 'Tax Code'); }} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700" title="Delete"><Trash2 className="h-4 w-4" /></button></div></td></tr>)) : (<tr><td colSpan={currentTab.columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">No report rows found.</td></tr>)}</tbody></table></div></div>
                  {data?.pagination && data.pagination.totalPages > 1 && (<div className="flex items-center justify-between"><p className="text-sm text-gray-600">Page {data.pagination.page} of {data.pagination.totalPages}</p><div className="flex gap-2"><button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button><button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((p) => p + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button></div></div>)}
                </>)}
              </div>
            </div>

            <SlideOver isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Tax Code" description="Create a new tax code in the system.">
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
                  <FormField label="Purchase Account">
                    <Select value={formState.purchaseAccount} onChange={(v) => setFormState({ ...formState, purchaseAccount: v })} options={[{ label: 'Select an account', value: '' }, ...(data?.referenceData.chartAccounts || []).map((account) => ({ label: `${account.code ? `${account.code} - ` : ''}${account.name || 'Unnamed account'}`, value: String(account.id) }))]} />
                  </FormField>
                  <FormField label="Sales Account">
                    <Select value={formState.salesAccount} onChange={(v) => setFormState({ ...formState, salesAccount: v })} options={[{ label: 'Select an account', value: '' }, ...(data?.referenceData.chartAccounts || []).map((account) => ({ label: `${account.code ? `${account.code} - ` : ''}${account.name || 'Unnamed account'}`, value: String(account.id) }))]} />
                  </FormField>
                  <FormField label="Status" required>
                    <Select value={formState.isActive ? 'true' : 'false'} onChange={(v) => setFormState({ ...formState, isActive: v === 'true' })} options={[{ label: 'Active', value: 'true' }, { label: 'Inactive', value: 'false' }]} />
                  </FormField>
                  <FormField label="Description"><TextArea value={formState.description} onChange={(v) => setFormState({ ...formState, description: v })} rows={3} /></FormField>
                </div>
                <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
                  <button type="button" onClick={() => setIsCreateOpen(false)} disabled={isCreateSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">Cancel</button>
                  <button type="submit" disabled={isCreateSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>{isCreateSubmitting ? 'Creating...' : 'Create Tax Code'}</button>
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
                        <span className="text-sm text-gray-500">Purchase Account</span>
                        <span className="text-sm font-medium text-gray-900">{typeof viewDetail.purchaseAccount === 'object' && viewDetail.purchaseAccount !== null ? `${viewDetail.purchaseAccount.code ? `${viewDetail.purchaseAccount.code} - ` : ''}${viewDetail.purchaseAccount.name || 'Unnamed account'}` : viewDetail.purchaseAccount ? String(viewDetail.purchaseAccount) : '-'}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-3">
                        <span className="text-sm text-gray-500">Sales Account</span>
                        <span className="text-sm font-medium text-gray-900">{typeof viewDetail.salesAccount === 'object' && viewDetail.salesAccount !== null ? `${viewDetail.salesAccount.code ? `${viewDetail.salesAccount.code} - ` : ''}${viewDetail.salesAccount.name || 'Unnamed account'}` : viewDetail.salesAccount ? String(viewDetail.salesAccount) : '-'}</span>
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
                      <FormField label="Purchase Account">
                        <Select value={formState.purchaseAccount} onChange={(v) => setFormState({ ...formState, purchaseAccount: v })} options={[{ label: 'Select an account', value: '' }, ...(data?.referenceData.chartAccounts || []).map((account) => ({ label: `${account.code ? `${account.code} - ` : ''}${account.name || 'Unnamed account'}`, value: String(account.id) }))]} />
                      </FormField>
                      <FormField label="Sales Account">
                        <Select value={formState.salesAccount} onChange={(v) => setFormState({ ...formState, salesAccount: v })} options={[{ label: 'Select an account', value: '' }, ...(data?.referenceData.chartAccounts || []).map((account) => ({ label: `${account.code ? `${account.code} - ` : ''}${account.name || 'Unnamed account'}`, value: String(account.id) }))]} />
                      </FormField>
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

        {activeTab === 'tax-audit-history' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-gray-900">{currentTab.label}</h2>
                <p className="text-sm text-gray-600">{currentTab.description}</p>
                <p className="text-sm text-gray-500">{auditData?.totals.filteredRows ?? 0} matching rows</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={handleAuditRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}><RefreshCw className="h-4 w-4" /> Refresh History</button>
              </div>
            </div>

            {auditData?.section.metrics && auditData.section.metrics.length > 0 ? (<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{auditData.section.metrics.map((m) => (<div key={m.id}><MetricCard label={m.label} value={m.value} change={m.change} trend={m.trend} /></div>))}</div>) : null}

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                  <form onSubmit={handleAuditSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
                    <div className="relative min-w-0 flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input type="text" placeholder={currentTab.searchPlaceholder} value={auditSearchInput} onChange={(e) => setAuditSearchInput(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    </div>
                    <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"><Search className="h-4 w-4" /> Search</button>
                  </form>
                  <button type="button" onClick={() => { if (!isAuditFilterPanelOpen) setAuditDraftFilters({ ...auditFilters }); setIsAuditFilterPanelOpen((p) => !p); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isAuditFilterPanelOpen || auditFilterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}><Filter className="h-4 w-4" /> Filters{auditFilterCount > 0 && <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{auditFilterCount}</span>}</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(() => { const qf = auditData?.section?.filters?.quickFilters; if (qf && qf.length > 0) return qf.map((f) => <button key={f.value} type="button" onClick={() => handleToggleAuditQuickFilter(f.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${auditQuickFilters.includes(f.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{f.label}</button>); return null; })()}
                </div>
              </div>

              <div className="space-y-4 p-5">
                {isAuditFilterPanelOpen && (<div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><h4 className="text-sm font-semibold text-gray-900">Filters</h4><p className="mt-1 text-sm text-gray-600">Select as many filter values as needed, then apply them in one step.</p></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => { setAuditDraftFilters({ actionTypes: [], sources: [] }); setAuditFilters({ actionTypes: [], sources: [] }); setAuditCurrentPage(1); setIsAuditFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Clear all</button><button type="button" onClick={() => { setAuditDraftFilters({ ...auditFilters }); setIsAuditFilterPanelOpen(false); }} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button><button type="button" onClick={() => { setAuditFilters({ ...auditDraftFilters }); setAuditCurrentPage(1); setIsAuditFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button></div></div>
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Action Type</h5>
                      <div className="mt-3 flex flex-wrap gap-2">{auditData?.section?.filters?.actionTypes?.map((opt) => { const isSelected = auditDraftFilters.actionTypes.includes(opt.value); return <button key={opt.value} type="button" onClick={() => setAuditDraftFilters((p) => ({ ...p, actionTypes: toggleFilterValue(p.actionTypes, opt.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{opt.label}</button>; })}</div>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Source</h5>
                      <div className="mt-3 flex flex-wrap gap-2">{auditData?.section?.filters?.sources?.map((opt) => { const isSelected = auditDraftFilters.sources.includes(opt.value); return <button key={opt.value} type="button" onClick={() => setAuditDraftFilters((p) => ({ ...p, sources: toggleFilterValue(p.sources, opt.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{opt.label}</button>; })}</div>
                    </div>
                  </div>
                </div>)}

                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold text-gray-900">Tax Audit Trail</h3>
                    <p className="text-sm text-gray-600">Control and export history for tax records, tax-code governance changes, and tax report activity.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span>{auditData?.totals.filteredRows ?? 0} matching rows</span>
                    <button type="button" onClick={handleAuditExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!(auditData?.section.table.rows.length)}><Download className="h-4 w-4" /> Download View</button>
                  </div>
                </div>

                {error && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
                {isLoading ? <LoadingSkeleton /> : (<>
                  <div className="overflow-hidden rounded-xl border border-gray-200"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{currentTab.columns.map((col) => (<th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{col}</th>))}<th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th></tr></thead><tbody className="divide-y divide-gray-200 bg-white">{(auditData?.section.table.rows ?? []).length > 0 ? (auditData?.section.table.rows ?? []).map((row) => (<tr key={row.id} className="hover:bg-gray-50">{row.cells.map((cell, index) => renderCell(cell, index))}<td className="px-4 py-3 text-right"><div className="flex justify-end gap-2"><button type="button" onClick={() => handleViewAuditDetail(row)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail"><Eye className="h-4 w-4" /></button></div></td></tr>)) : (<tr><td colSpan={currentTab.columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">No audit rows found.</td></tr>)}</tbody></table></div></div>
                  {auditData?.pagination && auditData.pagination.totalPages > 1 && (<div className="flex items-center justify-between"><p className="text-sm text-gray-600">Page {auditData.pagination.page} of {auditData.pagination.totalPages}</p><div className="flex gap-2"><button type="button" disabled={!auditData.pagination.hasPrevPage} onClick={() => setAuditCurrentPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button><button type="button" disabled={!auditData.pagination.hasNextPage} onClick={() => setAuditCurrentPage((p) => p + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button></div></div>)}
                </>)}
              </div>
            </div>

            <SlideOver isOpen={isAuditViewOpen} onClose={() => setIsAuditViewOpen(false)} title="Tax Audit Detail" description="Review the selected tax audit event, including source details and payload snapshots.">
              <div className="space-y-6">
                {auditViewDetail ? (
                  <>
                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                      <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Performed At</span><span className="text-sm font-medium text-gray-900">{auditViewDetail.performedAtLabel}</span></div>
                      <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Entity Type</span><span className="text-sm font-medium text-gray-900">{auditViewDetail.entityTypeLabel}</span></div>
                      <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Entity ID</span><span className="text-sm font-medium text-gray-900">{auditViewDetail.entityId}</span></div>
                      <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Action</span><span className="text-sm font-medium text-gray-900">{auditViewDetail.actionLabel}</span></div>
                      <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Performed By</span><span className="text-sm font-medium text-gray-900">{auditViewDetail.performedBy}</span></div>
                      <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Source</span><span className="text-sm font-medium text-gray-900">{auditViewDetail.sourceLabel}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-500">Reason</span><span className="text-right text-sm font-medium text-gray-900">{auditViewDetail.reason || '-'}</span></div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Metadata</h4>
                        <pre className="mt-2 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-700">{formatJsonValue(auditViewDetail.metadata)}</pre>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Before Data</h4>
                        <pre className="mt-2 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-700">{formatJsonValue(auditViewDetail.beforeData)}</pre>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">After Data</h4>
                        <pre className="mt-2 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-700">{formatJsonValue(auditViewDetail.afterData)}</pre>
                      </div>
                    </div>
                  </>
                ) : <p className="text-sm text-gray-500">No details available.</p>}
                <div className="flex justify-end pt-4"><button type="button" onClick={() => setIsAuditViewOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Close</button></div>
              </div>
            </SlideOver>
          </div>
        )}
      </div>
    </div>
  );
}
