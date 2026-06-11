'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle, ArrowDownRight, ArrowUpRight, Download, Edit, Eye, FileText, Filter, Plus, RefreshCw, Search, Trash2, Wallet, X,
} from '@/components/ui/IconWrapper';
import {
  getOpeningBalRegister,
  createJournalEntry,
  getJournalEntryDetail,
  updateJournalEntry,
  deleteJournalEntry,
  type OpeningBalRegisterResponse,
  type OpeningBalRegisterRow,
  type OpeningBalMetric,
  type JournalEntryDetail,
} from './actions';

type TabId = 'opening-balance-journals' | 'adjustment-entries' | 'reversal-entries';
type FilterState = { statuses: string[]; balancedFilters: string[] };
type FormState = { entryDate: string; postingDate: string; sourceType: string; sourceReference: string; memo: string; referenceNumber: string; status: string; notes: string };

const initialForm: FormState = { entryDate: new Date().toISOString().slice(0, 10), postingDate: new Date().toISOString().slice(0, 10), sourceType: 'opening_balance', sourceReference: '', memo: '', referenceNumber: '', status: 'draft', notes: '' };

const STATIC_TABS: Array<{ id: TabId; label: string; description: string; searchPlaceholder: string; columns: string[] }> = [
  { id: 'opening-balance-journals', label: 'Opening Balance Journals', description: 'Review journal entries created with the opening_balance source type and their locked opening positions.', searchPlaceholder: 'Search entry no., source reference, posting date, memo, or status', columns: ['Entry No.', 'Posting Date', 'Source Ref', 'Total Debit', 'Balanced', 'Status'] },
  { id: 'adjustment-entries', label: 'Adjustment Entries', description: 'Manage adjustment journals that refine balances while preserving source references.', searchPlaceholder: 'Search entry no., reference no., memo, posting date, or approver', columns: ['Entry No.', 'Posting Date', 'Reference No.', 'Memo', 'Total Debit', 'Status'] },
  { id: 'reversal-entries', label: 'Reversal Entries', description: 'Reverse posted journal entries while preserving the original journal link.', searchPlaceholder: 'Search reversal entry, original entry, posting date, reversed by, or memo', columns: ['Reversal Entry', 'Original Entry', 'Posting Date', 'Memo', 'Reversed By', 'Status'] },
];

function getActionClasses(v: 'primary' | 'secondary' | 'ghost' = 'secondary') { if (v === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700'; if (v === 'ghost') return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'; return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'; }
function getMetricTone(t: OpeningBalMetric['trend']) { if (t === 'down') return 'text-red-600 bg-red-50'; if (t === 'neutral') return 'text-gray-600 bg-gray-100'; return 'text-green-600 bg-green-50'; }
function escapeCsvValue(v: string | number | boolean | null | undefined) { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }
function toggleFilterValue(values: string[], value: string) { return values.includes(value) ? values.filter((v) => v !== value) : [...values, value]; }
function formatDateTime(v?: string | null) { if (!v) return '-'; try { return new Date(v).toLocaleString(); } catch { return v; } }
function formatUser(u: unknown): string { if (!u) return '-'; if (typeof u === 'object' && u !== null) { const r = u as Record<string, unknown>; const p = [String(r.firstName || '').trim(), String(r.middleName || '').trim(), String(r.lastName || '').trim()].filter(Boolean); return p.length > 0 ? p.join(' ') : String(r.id); } return String(u); }

function getStatusBadgeClasses(status?: string | null) {
  switch (String(status || '').toLowerCase()) { case 'draft': case 'amber': return 'bg-amber-50 text-amber-700 ring-amber-200'; case 'posted': case 'green': return 'bg-green-50 text-green-700 ring-green-200'; default: return 'bg-gray-100 text-gray-700 ring-gray-200'; }
}

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
  return <div className="space-y-6"><div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => (<div key={i} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><div className="h-4 w-24 animate-pulse rounded bg-gray-200" /><div className="mt-4 h-8 w-20 animate-pulse rounded bg-gray-200" /><div className="mt-4 h-6 w-40 animate-pulse rounded-full bg-gray-200" /></div>))}</div><div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="h-10 w-full max-w-xl animate-pulse rounded-lg bg-gray-200" /><div className="flex gap-2">{Array.from({ length: 3 }).map((_, i) => (<div key={i} className="h-8 w-28 animate-pulse rounded-full bg-gray-200" />))}</div></div><div className="mt-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => (<div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />))}</div></div></div>;
}

function renderCell(cell: string | { text: string; tone?: string; emphasis?: boolean; align?: string }, index: number) {
  if (typeof cell === 'string') return <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{cell}</td>;
  const alignClass = cell.align === 'right' ? 'text-right' : cell.align === 'center' ? 'text-center' : 'text-left';
  if (cell.tone) { const toneMap: Record<string, string> = { amber: 'bg-amber-50 text-amber-700 ring-amber-200', green: 'bg-green-50 text-green-700 ring-green-200', gray: 'bg-gray-100 text-gray-700 ring-gray-200', blue: 'bg-blue-50 text-blue-700 ring-blue-200' }; return <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${alignClass}`}><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${toneMap[cell.tone] || toneMap.gray}`}>{cell.text}</span></td>; }
  return <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${cell.emphasis ? 'font-semibold text-gray-900' : 'text-gray-600'} ${alignClass}`}>{cell.text}</td>;
}

type Props = { initialData: OpeningBalRegisterResponse | null };

export default function PostingCorrectionsClient({ initialData }: Props) {
  const router = useRouter(); const pathname = usePathname(); const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>((searchParams.get('tab') as TabId) || 'opening-balance-journals');
  const [data, setData] = useState<OpeningBalRegisterResponse | null>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(initialData?.pagination.page || 1);
  const [filters, setFilters] = useState<FilterState>({ statuses: initialData?.appliedFilters.statuses || [], balancedFilters: initialData?.appliedFilters.balancedFilters || [] });
  const [draftFilters, setDraftFilters] = useState<FilterState>({ statuses: initialData?.appliedFilters.statuses || [], balancedFilters: initialData?.appliedFilters.balancedFilters || [] });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const filterCount = filters.statuses.length + filters.balancedFilters.length;

  // --- Create state ---
  const [isCreateOpen, setIsCreateOpen] = useState(false); const [isCreateSubmitting, setIsCreateSubmitting] = useState(false); const [createErr, setCreateErr] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<FormState>(initialForm);

  // --- Detail state ---
  const [selectedEntry, setSelectedEntry] = useState<JournalEntryDetail | null>(null); const [isDetailLoading, setIsDetailLoading] = useState(false); const [detailErr, setDetailErr] = useState<string | null>(null);

  // --- Edit state ---
  const [isEditOpen, setIsEditOpen] = useState(false); const [isEditSubmitting, setIsEditSubmitting] = useState(false); const [editErr, setEditErr] = useState<string | null>(null); const [editingId, setEditingId] = useState<number | string | null>(null); const [editForm, setEditForm] = useState<FormState>(initialForm);
  const [editingTotals, setEditingTotals] = useState<{ totalDebit: number | null; totalCredit: number | null; isBalanced: boolean | null }>({ totalDebit: null, totalCredit: null, isBalanced: null });

  // --- Delete state ---
  const [isDeleteOpen, setIsDeleteOpen] = useState(false); const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false); const [deleteErr, setDeleteErr] = useState<string | null>(null); const [deletingId, setDeletingId] = useState<number | string | null>(null); const [deletingEntryNumber, setDeletingEntryNumber] = useState(''); const [deleteBlockers, setDeleteBlockers] = useState<string[]>([]);

  useEffect(() => { const raw = searchParams.get('tab') as TabId | null; const nextTab: TabId = raw === 'adjustment-entries' || raw === 'reversal-entries' ? raw : 'opening-balance-journals'; setActiveTab((p) => (p === nextTab ? p : nextTab)); }, [searchParams]);
  const handleTabChange = (tab: TabId) => { const params = new URLSearchParams(searchParams.toString()); params.set('tab', tab); router.replace(`${pathname}?${params.toString()}`); };

  const fetchData = useCallback(async ({ search, page, filters: f }: { search: string; page: number; filters: FilterState }) => {
    if (activeTab !== 'opening-balance-journals') return; setIsLoading(true); setError(null);
    try { const r = await getOpeningBalRegister({ search, page, statuses: f.statuses, balancedFilters: f.balancedFilters }); setData(r); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load opening balance journals.'); } finally { setIsLoading(false); }
  }, [activeTab]);

  useEffect(() => { if (activeTab !== 'opening-balance-journals') return; void fetchData({ search: submittedSearch, page: currentPage, filters }); }, [activeTab, filters, currentPage, submittedSearch, fetchData]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSubmittedSearch(searchInput); fetchData({ search: searchInput, page: 1, filters }); };
  const handleRefresh = () => { fetchData({ search: submittedSearch, page: currentPage, filters }); };

  const handleToggleQuickFilter = (value: string) => {
    if (value.startsWith('status:')) { const status = value.replace('status:', ''); const ns = toggleFilterValue(filters.statuses, status); setFilters((p) => ({ ...p, statuses: ns })); setDraftFilters((p) => ({ ...p, statuses: ns })); setCurrentPage(1); }
    else if (value === 'balanced:true') { const nv = toggleFilterValue(filters.balancedFilters, 'balanced'); setFilters((p) => ({ ...p, balancedFilters: nv })); setDraftFilters((p) => ({ ...p, balancedFilters: nv })); setCurrentPage(1); }
    else if (value === 'balanced:false') { const nv = toggleFilterValue(filters.balancedFilters, 'unbalanced'); setFilters((p) => ({ ...p, balancedFilters: nv })); setDraftFilters((p) => ({ ...p, balancedFilters: nv })); setCurrentPage(1); }
  };

  // --- Create ---
  const handleOpenCreate = () => { setCreateForm({ ...initialForm, sourceType: 'opening_balance' }); setCreateErr(null); setIsCreateSubmitting(false); setIsCreateOpen(true); };
  const handleCloseCreate = () => { setIsCreateOpen(false); setCreateErr(null); };
  const handleCreateSubmit = async (e: React.FormEvent) => { e.preventDefault(); setIsCreateSubmitting(true); setCreateErr(null); try { await createJournalEntry({ entryDate: createForm.entryDate, postingDate: createForm.postingDate, sourceType: createForm.sourceType, sourceReference: createForm.sourceReference || null, memo: createForm.memo || null, referenceNumber: createForm.referenceNumber || null, status: createForm.status, notes: createForm.notes || null }); handleCloseCreate(); setCurrentPage(1); fetchData({ search: submittedSearch, page: 1, filters }); } catch (err) { setCreateErr(err instanceof Error ? err.message : 'Unable to create journal entry.'); setIsCreateSubmitting(false); } };

  // --- View detail ---
  const handleView = async (id: number | string) => { setSelectedEntry(null); setIsDetailLoading(true); setDetailErr(null); try { setSelectedEntry(await getJournalEntryDetail(id)); } catch (err) { setDetailErr(err instanceof Error ? err.message : 'Unable to load detail.'); } finally { setIsDetailLoading(false); } };
  const handleCloseDetail = () => { setSelectedEntry(null); setDetailErr(null); };

  // --- Edit ---
  const handleOpenEdit = async (id: number | string) => { handleCloseDetail(); setEditingId(id); setEditForm(initialForm); setEditErr(null); setIsEditSubmitting(false); setIsEditOpen(true); try { const d = await getJournalEntryDetail(id); setEditForm({ entryDate: (d.entryDate || '').slice(0, 10), postingDate: (d.postingDate || '').slice(0, 10), sourceType: d.sourceType || 'opening_balance', sourceReference: d.sourceReference || '', memo: d.memo || '', referenceNumber: d.referenceNumber || '', status: d.status || 'draft', notes: d.notes || '' }); setEditingTotals({ totalDebit: d.totalDebit ?? null, totalCredit: d.totalCredit ?? null, isBalanced: d.isBalanced ?? null }); } catch (err) { setEditErr(err instanceof Error ? err.message : 'Unable to load for editing.'); } };
  const handleCloseEdit = () => { setIsEditOpen(false); setEditingId(null); setEditErr(null); };
  const handleEditSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (editingId === null) return; setIsEditSubmitting(true); setEditErr(null); try { await updateJournalEntry(editingId, { entryDate: editForm.entryDate, postingDate: editForm.postingDate, sourceType: editForm.sourceType, sourceReference: editForm.sourceReference || null, memo: editForm.memo || null, referenceNumber: editForm.referenceNumber || null, status: editForm.status, notes: editForm.notes || null }); handleCloseEdit(); fetchData({ search: submittedSearch, page: currentPage, filters }); } catch (err) { setEditErr(err instanceof Error ? err.message : 'Unable to update.'); setIsEditSubmitting(false); } };

  // --- Delete ---
  const handleOpenDelete = async (id: number | string, entryNumber: string) => { setDeletingId(id); setDeletingEntryNumber(entryNumber); setDeleteErr(null); setDeleteBlockers([]); setIsDeleteSubmitting(false); setIsDeleteOpen(true); try { const r = await deleteJournalEntry(id); setDeleteBlockers(r.blockers || []); } catch (err) { setDeleteErr(err instanceof Error ? err.message : 'Unable to check dependencies.'); } };
  const handleCloseDelete = () => { setIsDeleteOpen(false); setDeletingId(null); setDeletingEntryNumber(''); setDeleteErr(null); setDeleteBlockers([]); setIsDeleteSubmitting(false); };
  const handleConfirmDelete = async () => { if (deletingId === null) return; setIsDeleteSubmitting(true); setDeleteErr(null); try { const r = await deleteJournalEntry(deletingId); if (r.blockers && r.blockers.length > 0) { setDeleteErr('Cannot delete: dependencies exist.'); setIsDeleteSubmitting(false); return; } handleCloseDelete(); fetchData({ search: submittedSearch, page: currentPage, filters }); } catch (err) { setDeleteErr(err instanceof Error ? err.message : 'Unable to delete.'); setIsDeleteSubmitting(false); } };

  // --- CSV Export ---
  const handleExport = () => { const rows = data?.section.table.rows as OpeningBalRegisterRow[] | undefined; if (!rows?.length) return;
    const headers = ['Entry No.', 'Posting Date', 'Source Ref', 'Total Debit', 'Balanced', 'Status'];
    const csvRows = rows.map((r) => [r.entryNumber ?? '-', r.postingDate ?? '-', r.sourceReference ?? '-', r.totalDebit != null ? `PHP ${Number(r.totalDebit).toLocaleString()}` : '-', r.isBalanced ? 'Yes' : 'No', r.statusLabel ?? '-']);
    const csvContent = [headers.map((h) => escapeCsvValue(h)), ...csvRows.map((r) => r.map((c) => escapeCsvValue(c)))].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'opening-balance-journals.csv'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const currentTab = STATIC_TABS.find((t) => t.id === activeTab) || STATIC_TABS[0];
  const isActiveTab = activeTab === 'opening-balance-journals';

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Core / Journals &amp; Ledger</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700"><FileText className="h-6 w-6" /></div>
            <div><h1 className="text-2xl font-bold text-gray-900">Posting &amp; Corrections</h1><p className="mt-1 max-w-3xl text-sm text-gray-600">Handle opening-balance journals, adjustment entries, and reversals using the correction paths supported by the backend.</p></div>
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
          {!isActiveTab ? (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500"><p className="font-semibold text-gray-900">{currentTab.label}</p><p className="mt-1 text-gray-600">{currentTab.description}</p><p className="mt-4 text-gray-400">This tab is under development.</p></div>
          ) : (
            <>
              <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold text-gray-900">Opening Balance Journals</h2>
                  <p className="text-sm text-gray-600">{currentTab.description}</p>
                  <p className="text-sm text-gray-500">{data?.totals.filteredEntries ?? 0} matching entries</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}><Plus className="h-4 w-4" /> Create Opening Journal</button>
                  <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}><RefreshCw className="h-4 w-4" /> Refresh</button>
                </div>
              </div>

              {data?.section.metrics && data.section.metrics.length > 0 ? (<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{data.section.metrics.map((m) => (<div key={m.id}><MetricCard label={m.label} value={m.value} change={m.change} trend={m.trend} /></div>))}</div>) : null}

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">Opening Balance Journal View</h3>
                      <p className="mt-1 text-sm text-gray-600">Opening-balance journal headers using source type, totals, balance validation, and posting status.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span>{data?.totals.filteredEntries ?? 0} matching entries</span>
                      <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!(data?.section.table.rows.length)}><Download className="h-4 w-4" /> Export View</button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 border-b border-gray-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                      <form onSubmit={handleSearch} className="relative min-w-0 flex-1 max-w-xl">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input type="text" placeholder={currentTab.searchPlaceholder} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    </form>
                    <button type="button" onClick={() => { if (!isFilterPanelOpen) setDraftFilters({ ...filters }); setIsFilterPanelOpen((p) => !p); }} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"><Filter className="h-4 w-4" /> Filters{filterCount > 0 && <span className="inline-flex items-center justify-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">{filterCount}</span>}</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(() => { const qf = data?.section?.filters?.quickFilters; if (qf && qf.length > 0) return qf.map((f) => { let isActive = false; if (f.value.startsWith('status:')) isActive = filters.statuses.includes(f.value.replace('status:', '')); else if (f.value === 'balanced:true') isActive = filters.balancedFilters.includes('balanced'); else if (f.value === 'balanced:false') isActive = filters.balancedFilters.includes('unbalanced'); return <button key={f.value} type="button" onClick={() => handleToggleQuickFilter(f.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{f.label}</button>; }); return null; })()}
                  </div>
                </div>

                {isFilterPanelOpen && (<div className="border-b border-gray-200 bg-gray-50 px-5 py-4"><div className="flex items-center justify-between"><h4 className="text-sm font-semibold text-gray-900">Filters</h4><div className="flex gap-2">                        <button type="button" onClick={() => { setDraftFilters({ statuses: [], balancedFilters: [] }); setFilters({ statuses: [], balancedFilters: [] }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm text-gray-500 hover:text-gray-700">Reset</button><button type="button" onClick={() => { setFilters({ ...draftFilters }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="rounded-lg bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700">Apply</button></div></div><div className="mt-3 flex flex-wrap gap-2">{data?.section?.filters?.statuses?.map((opt) => { const isSelected = draftFilters.statuses.includes(opt.value); return <button key={opt.value} type="button" onClick={() => setDraftFilters((p) => ({ ...p, statuses: toggleFilterValue(p.statuses, opt.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{opt.label}</button>; })}</div></div>)}

                <div className="space-y-4 p-5">
                  {error && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
                  {isLoading ? <LoadingSkeleton /> : (<>
                    <div className="overflow-hidden rounded-xl border border-gray-200"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{currentTab.columns.map((col) => (<th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{col}</th>))}<th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th></tr></thead><tbody className="divide-y divide-gray-200 bg-white">{(data?.section.table.rows ?? []).length > 0 ? (data?.section.table.rows ?? []).map((row) => (<tr key={row.id} className="hover:bg-gray-50">{row.cells.map((cell, index) => renderCell(cell, index))}<td className="px-4 py-3 text-right"><div className="flex justify-end gap-2"><button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail"><Eye className="h-4 w-4" /></button><button type="button" onClick={() => handleOpenEdit(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="Edit"><Edit className="h-4 w-4" /></button><button type="button" onClick={() => { const r = row as OpeningBalRegisterRow; handleOpenDelete(row.id, r.entryNumber || 'Journal Entry'); }} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700" title="Delete"><Trash2 className="h-4 w-4" /></button></div></td></tr>)) : (<tr><td colSpan={currentTab.columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">No opening balance journals found.</td></tr>)}</tbody></table></div></div>
                    {data?.pagination && data.pagination.totalPages > 1 && (<div className="flex items-center justify-between"><p className="text-sm text-gray-600">Page {data.pagination.page} of {data.pagination.totalPages}</p><div className="flex gap-2"><button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button><button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((p) => p + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button></div></div>)}
                  </>)}
                </div>
              </div>
            </div>
            </>
          )}
        </div>
      </div>

      {/* Detail SlideOver */}
      <SlideOver isOpen={selectedEntry !== null} onClose={handleCloseDetail} title={selectedEntry?.entryNumber || 'Journal Entry Detail'}>
        {detailErr && <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{detailErr}</div>}
        {isDetailLoading ? <p className="text-sm text-gray-500">Loading...</p> : selectedEntry ? (<div className="space-y-4 text-sm">
          <div><span className="font-medium text-gray-500">Entry No.:</span><span className="ml-2 text-gray-900">{selectedEntry.entryNumber || '-'}</span></div>
          <div><span className="font-medium text-gray-500">Entry Date:</span><span className="ml-2 text-gray-900">{formatDateTime(selectedEntry.entryDate)}</span></div>
          <div><span className="font-medium text-gray-500">Posting Date:</span><span className="ml-2 text-gray-900">{formatDateTime(selectedEntry.postingDate)}</span></div>
          <div><span className="font-medium text-gray-500">Source Type:</span><span className="ml-2 text-gray-900">{selectedEntry.sourceType || '-'}</span></div>
          {selectedEntry.sourceReference && <div><span className="font-medium text-gray-500">Source Ref:</span><span className="ml-2 text-gray-900">{selectedEntry.sourceReference}</span></div>}
          {selectedEntry.memo && <div><span className="font-medium text-gray-500">Memo:</span><span className="ml-2 text-gray-900">{selectedEntry.memo}</span></div>}
          <div><span className="font-medium text-gray-500">Status:</span><span className={`ml-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusBadgeClasses(selectedEntry.status)}`}>{selectedEntry.status || '-'}</span></div>
          <div><span className="font-medium text-gray-500">Total Debit:</span><span className="ml-2 text-gray-900">{selectedEntry.totalDebit != null ? `PHP ${Number(selectedEntry.totalDebit).toLocaleString()}` : '-'}</span></div>
          <div><span className="font-medium text-gray-500">Total Credit:</span><span className="ml-2 text-gray-900">{selectedEntry.totalCredit != null ? `PHP ${Number(selectedEntry.totalCredit).toLocaleString()}` : '-'}</span></div>
          <div><span className="font-medium text-gray-500">Balanced:</span><span className="ml-2 text-gray-900">{selectedEntry.isBalanced ? 'Yes' : 'No'}</span></div>
          {selectedEntry.notes && <div><span className="font-medium text-gray-500">Notes:</span><span className="ml-2 text-gray-900">{selectedEntry.notes}</span></div>}
          <div><span className="font-medium text-gray-500">Created:</span><span className="ml-2 text-gray-900">{formatDateTime(selectedEntry.createdAt)}</span></div>
          <div><span className="font-medium text-gray-500">Updated:</span><span className="ml-2 text-gray-900">{formatDateTime(selectedEntry.updatedAt)}</span></div>
          <div><span className="font-medium text-gray-500">Created By:</span><span className="ml-2 text-gray-900">{formatUser(selectedEntry.createdBy)}</span></div>
          <div><span className="font-medium text-gray-500">Updated By:</span><span className="ml-2 text-gray-900">{formatUser(selectedEntry.updatedBy)}</span></div>
          <div className="flex gap-2 pt-4"><button type="button" onClick={() => { const id = selectedEntry.id; handleCloseDetail(); handleOpenEdit(id); }} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><Edit className="h-4 w-4" /> Edit</button><button type="button" onClick={handleCloseDetail} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Close</button></div>
        </div>) : null}
      </SlideOver>

      {/* Create SlideOver */}
      <SlideOver isOpen={isCreateOpen} onClose={handleCloseCreate} title="Create Opening Balance Journal">
        {createErr && <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{createErr}</div>}
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <FormField label="Entry Date" required><Input type="date" value={createForm.entryDate} onChange={(v) => setCreateForm((p) => ({ ...p, entryDate: v }))} required /></FormField>
          <FormField label="Posting Date" required><Input type="date" value={createForm.postingDate} onChange={(v) => setCreateForm((p) => ({ ...p, postingDate: v }))} required /></FormField>
          <FormField label="Source Type"><Select value={createForm.sourceType} onChange={(v) => setCreateForm((p) => ({ ...p, sourceType: v }))} options={[{ label: 'Opening Balance', value: 'opening_balance' }, { label: 'Manual', value: 'manual' }, { label: 'Adjustment', value: 'adjustment' }]} /></FormField>
          <FormField label="Source Reference"><Input value={createForm.sourceReference} onChange={(v) => setCreateForm((p) => ({ ...p, sourceReference: v }))} placeholder="e.g. OPENING-2026" /></FormField>
          <FormField label="Memo"><TextArea value={createForm.memo} onChange={(v) => setCreateForm((p) => ({ ...p, memo: v }))} /></FormField>
          <FormField label="Reference Number"><Input value={createForm.referenceNumber} onChange={(v) => setCreateForm((p) => ({ ...p, referenceNumber: v }))} placeholder="Optional" /></FormField>
          <FormField label="Status"><Select value={createForm.status} onChange={(v) => setCreateForm((p) => ({ ...p, status: v }))} options={[{ label: 'Draft', value: 'draft' }, { label: 'Posted', value: 'posted' }]} /></FormField>
          <FormField label="Notes"><TextArea value={createForm.notes} onChange={(v) => setCreateForm((p) => ({ ...p, notes: v }))} /></FormField>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={handleCloseCreate} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button><button type="submit" disabled={isCreateSubmitting} className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">{isCreateSubmitting ? 'Creating...' : 'Create'}</button></div>
        </form>
      </SlideOver>

      {/* Edit SlideOver */}
      <SlideOver isOpen={isEditOpen} onClose={handleCloseEdit} title="Edit Journal Entry">
        {editErr && <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{editErr}</div>}
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <FormField label="Entry Date" required><Input type="date" value={editForm.entryDate} onChange={(v) => setEditForm((p) => ({ ...p, entryDate: v }))} required /></FormField>
          <FormField label="Posting Date" required><Input type="date" value={editForm.postingDate} onChange={(v) => setEditForm((p) => ({ ...p, postingDate: v }))} required /></FormField>
          <FormField label="Source Type"><Select value={editForm.sourceType} onChange={(v) => setEditForm((p) => ({ ...p, sourceType: v }))} options={[{ label: 'Opening Balance', value: 'opening_balance' }, { label: 'Manual', value: 'manual' }, { label: 'Adjustment', value: 'adjustment' }]} /></FormField>
          <FormField label="Source Reference"><Input value={editForm.sourceReference} onChange={(v) => setEditForm((p) => ({ ...p, sourceReference: v }))} placeholder="e.g. OPENING-2026" /></FormField>
          <FormField label="Memo"><TextArea value={editForm.memo} onChange={(v) => setEditForm((p) => ({ ...p, memo: v }))} /></FormField>
          <FormField label="Reference Number"><Input value={editForm.referenceNumber} onChange={(v) => setEditForm((p) => ({ ...p, referenceNumber: v }))} placeholder="Optional" /></FormField>
          <div className="grid grid-cols-2 gap-4"><FormField label="Total Debit"><div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">{editingTotals.totalDebit != null ? `PHP ${Number(editingTotals.totalDebit).toLocaleString()}` : 'PHP 0'}</div></FormField><FormField label="Total Credit"><div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">{editingTotals.totalCredit != null ? `PHP ${Number(editingTotals.totalCredit).toLocaleString()}` : 'PHP 0'}</div></FormField></div>
          <FormField label="Balanced"><div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">{editingTotals.isBalanced ? 'Yes' : 'No'}</div></FormField>
          <FormField label="Status"><Select value={editForm.status} onChange={(v) => setEditForm((p) => ({ ...p, status: v }))} options={[{ label: 'Draft', value: 'draft' }, { label: 'Posted', value: 'posted' }]} /></FormField>
          <FormField label="Notes"><TextArea value={editForm.notes} onChange={(v) => setEditForm((p) => ({ ...p, notes: v }))} /></FormField>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={handleCloseEdit} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button><button type="submit" disabled={isEditSubmitting} className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">{isEditSubmitting ? 'Saving...' : 'Save'}</button></div>
        </form>
      </SlideOver>

      {/* Delete SlideOver */}
      <SlideOver isOpen={isDeleteOpen} onClose={handleCloseDelete} title="Delete Journal Entry" description={`Remove "${deletingEntryNumber}" from the Opening Balance Journals list.`}>
        {deleteErr && <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{deleteErr}</div>}
        {deleteBlockers.length > 0 ? (<div className="space-y-3"><div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><p className="font-medium">Cannot delete this journal entry</p><p className="mt-1">This journal entry cannot be deleted because the following dependencies exist:</p><ul className="mt-2 list-inside list-disc space-y-1">{deleteBlockers.map((b, i) => <li key={i}>{b}</li>)}</ul><p className="mt-2">Remove all dependencies before attempting to delete this journal entry.</p></div><div className="flex justify-end"><button type="button" onClick={handleCloseDelete} className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200">Close</button></div></div>) : (<div className="space-y-3"><div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><p className="font-medium">Are you sure?</p><p className="mt-1">This action cannot be undone. The journal entry &ldquo;{deletingEntryNumber}&rdquo; will be permanently removed.</p></div><div className="flex justify-end gap-3"><button type="button" onClick={handleCloseDelete} disabled={isDeleteSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50">Cancel</button><button type="button" onClick={handleConfirmDelete} disabled={isDeleteSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50">{isDeleteSubmitting ? 'Deleting...' : 'Delete Entry'}</button></div></div>)}
      </SlideOver>
    </div>
  );
}
