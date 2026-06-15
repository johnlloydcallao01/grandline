'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle, ArrowDownRight, ArrowUpRight, Download, Edit, Eye, FileText, Filter, Plus, RefreshCw, Search, Trash2, Wallet, X,
} from '@/components/ui/IconWrapper';
import {
  getOpeningBalRegister,
  getAdjustmentEntriesRegister,
  getReversalEntriesRegister,
  createJournalEntry,
  getJournalEntryDetail,
  updateJournalEntry,
  deleteJournalEntry,
  type OpeningBalRegisterResponse,
  type OpeningBalRegisterRow,
  type OpeningBalMetric,
  type AdjustmentRegisterResponse,
  type AdjustmentRegisterRow,
  type ReversalRegisterResponse,
  type ReversalRegisterRow,
  type JournalEntryDetail,
} from './actions';

type TabId = 'opening-balance-journals' | 'adjustment-entries' | 'reversal-entries';
type ObFilterState = { statuses: string[]; balancedFilters: string[] };
type AdjFilterState = { statuses: string[]; balancedFilters: string[] };
type RevFilterState = { statuses: string[] };
type FormState = { entryDate: string; postingDate: string; sourceType: string; sourceReference: string; memo: string; referenceNumber: string; status: string; notes: string };

const initialForm: FormState = { entryDate: new Date().toISOString().slice(0, 10), postingDate: new Date().toISOString().slice(0, 10), sourceType: 'opening_balance', sourceReference: '', memo: '', referenceNumber: '', status: 'draft', notes: '' };

const STATIC_TABS: Array<{ id: TabId; label: string; description: string; searchPlaceholder: string; columns: string[] }> = [
  { id: 'opening-balance-journals', label: 'Opening Balance Journals', description: 'Review journal entries created with the opening_balance source type and their locked opening positions.', searchPlaceholder: 'Search entry no., source reference, posting date, memo, or status', columns: ['Entry No.', 'Posting Date', 'Source Ref', 'Total Debit', 'Balanced', 'Status'] },
  { id: 'adjustment-entries', label: 'Adjustment Entries', description: 'Manage adjustment journals that refine balances while preserving source references.', searchPlaceholder: 'Search entry no., reference no., memo, posting date, or approver', columns: ['Entry No.', 'Posting Date', 'Reference No.', 'Memo', 'Total Debit', 'Balanced', 'Status'] },
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
  return <div className="space-y-4"><div className="overflow-hidden rounded-xl border border-gray-200"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{Array.from({ length: 5 }).map((_, i) => <th key={i} className="px-4 py-3"><div className="h-4 w-24 animate-pulse rounded bg-gray-200" /></th>)}</tr></thead><tbody className="divide-y divide-gray-200 bg-white">{Array.from({ length: 5 }).map((_, i) => (<tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-6 animate-pulse rounded bg-gray-100" /></td></tr>))}</tbody></table></div></div></div>;
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

  // --- Opening Balance state ---
  const [obData, setObData] = useState<OpeningBalRegisterResponse | null>(initialData);
  const [obError, setObError] = useState<string | null>(null);
  const [obIsLoading, setObIsLoading] = useState(!initialData);
  const [obSearchInput, setObSearchInput] = useState('');
  const [obSubmittedSearch, setObSubmittedSearch] = useState('');
  const [obCurrentPage, setObCurrentPage] = useState(initialData?.pagination.page || 1);
  const [obFilters, setObFilters] = useState<ObFilterState>({ statuses: initialData?.appliedFilters.statuses || [], balancedFilters: initialData?.appliedFilters.balancedFilters || [] });
  const [obQuickFilters, setObQuickFilters] = useState<string[]>(initialData?.appliedFilters.quickFilters || []);
  const [obDraftFilters, setObDraftFilters] = useState<ObFilterState>({ statuses: initialData?.appliedFilters.statuses || [], balancedFilters: initialData?.appliedFilters.balancedFilters || [] });
  const [obIsFilterPanelOpen, setObIsFilterPanelOpen] = useState(false);
  const obFilterCount = obFilters.statuses.length + obFilters.balancedFilters.length;

  // --- Adjustment Entries state ---
  const [adjData, setAdjData] = useState<AdjustmentRegisterResponse | null>(null);
  const [adjError, setAdjError] = useState<string | null>(null);
  const [adjIsLoading, setAdjIsLoading] = useState(false);
  const [adjSearchInput, setAdjSearchInput] = useState('');
  const [adjSubmittedSearch, setAdjSubmittedSearch] = useState('');
  const [adjCurrentPage, setAdjCurrentPage] = useState(1);
  const [adjFilters, setAdjFilters] = useState<AdjFilterState>({ statuses: [], balancedFilters: [] });
  const [adjQuickFilters, setAdjQuickFilters] = useState<string[]>([]);
  const [adjDraftFilters, setAdjDraftFilters] = useState<AdjFilterState>({ statuses: [], balancedFilters: [] });
  const [adjIsFilterPanelOpen, setAdjIsFilterPanelOpen] = useState(false);
  const adjFilterCount = adjFilters.statuses.length + adjFilters.balancedFilters.length;

  // --- Reversal Entries state ---
  const [revData, setRevData] = useState<ReversalRegisterResponse | null>(null);
  const [revError, setRevError] = useState<string | null>(null);
  const [revIsLoading, setRevIsLoading] = useState(false);
  const [revSearchInput, setRevSearchInput] = useState('');
  const [revSubmittedSearch, setRevSubmittedSearch] = useState('');
  const [revCurrentPage, setRevCurrentPage] = useState(1);
  const [revFilters, setRevFilters] = useState<RevFilterState>({ statuses: [] });
  const [revQuickFilters, setRevQuickFilters] = useState<string[]>([]);
  const [revDraftFilters, setRevDraftFilters] = useState<RevFilterState>({ statuses: [] });
  const [revIsFilterPanelOpen, setRevIsFilterPanelOpen] = useState(false);
  const revFilterCount = revFilters.statuses.length;

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

  // --- Opening Balance fetch ---
  const fetchObData = useCallback(async ({ search, page, filters: f, nextQuickFilters }: { search: string; page: number; filters: ObFilterState; nextQuickFilters: string[] }) => {
    if (activeTab !== 'opening-balance-journals') return; setObIsLoading(true); setObError(null);
    try { const r = await getOpeningBalRegister({ search, page, statuses: f.statuses, balancedFilters: f.balancedFilters, quickFilters: nextQuickFilters }); setObData(r); } catch (err) { setObError(err instanceof Error ? err.message : 'Unable to load opening balance journals.'); } finally { setObIsLoading(false); }
  }, [activeTab]);

  useEffect(() => { if (activeTab !== 'opening-balance-journals') return; void fetchObData({ search: obSubmittedSearch, page: obCurrentPage, filters: obFilters, nextQuickFilters: obQuickFilters }); }, [activeTab, obFilters, obCurrentPage, obSubmittedSearch, obQuickFilters, fetchObData]);

  const handleObSearch = (e: React.FormEvent) => { e.preventDefault(); setObSubmittedSearch(obSearchInput); fetchObData({ search: obSearchInput, page: 1, filters: obFilters, nextQuickFilters: obQuickFilters }); };
  const handleObRefresh = () => { fetchObData({ search: obSubmittedSearch, page: obCurrentPage, filters: obFilters, nextQuickFilters: obQuickFilters }); };

  const handleObToggleQuickFilter = (value: string) => {
    setObQuickFilters((previous) => toggleFilterValue(previous, value)); setObCurrentPage(1);
  };

  // --- Adjustment Entries fetch ---
  const fetchAdjData = useCallback(async ({ search, page, filters: f, nextQuickFilters }: { search: string; page: number; filters: AdjFilterState; nextQuickFilters: string[] }) => {
    if (activeTab !== 'adjustment-entries') return; setAdjIsLoading(true); setAdjError(null);
    try { const r = await getAdjustmentEntriesRegister({ search, page, statuses: f.statuses, balancedFilters: f.balancedFilters, quickFilters: nextQuickFilters }); setAdjData(r); } catch (err) { setAdjError(err instanceof Error ? err.message : 'Unable to load adjustment entries.'); } finally { setAdjIsLoading(false); }
  }, [activeTab]);

  useEffect(() => { if (activeTab !== 'adjustment-entries') return; void fetchAdjData({ search: adjSubmittedSearch, page: adjCurrentPage, filters: adjFilters, nextQuickFilters: adjQuickFilters }); }, [activeTab, adjFilters, adjCurrentPage, adjSubmittedSearch, adjQuickFilters, fetchAdjData]);

  const handleAdjSearch = (e: React.FormEvent) => { e.preventDefault(); setAdjSubmittedSearch(adjSearchInput); fetchAdjData({ search: adjSearchInput, page: 1, filters: adjFilters, nextQuickFilters: adjQuickFilters }); };
  const handleAdjRefresh = () => { fetchAdjData({ search: adjSubmittedSearch, page: adjCurrentPage, filters: adjFilters, nextQuickFilters: adjQuickFilters }); };

  const handleAdjToggleQuickFilter = (value: string) => {
    setAdjQuickFilters((previous) => toggleFilterValue(previous, value)); setAdjCurrentPage(1);
  };

  // --- Reversal Entries fetch ---
  const fetchRevData = useCallback(async ({ search, page, filters: f, nextQuickFilters }: { search: string; page: number; filters: RevFilterState; nextQuickFilters: string[] }) => {
    if (activeTab !== 'reversal-entries') return; setRevIsLoading(true); setRevError(null);
    try { const r = await getReversalEntriesRegister({ search, page, statuses: f.statuses, quickFilters: nextQuickFilters }); setRevData(r); } catch (err) { setRevError(err instanceof Error ? err.message : 'Unable to load reversal entries.'); } finally { setRevIsLoading(false); }
  }, [activeTab]);

  useEffect(() => { if (activeTab !== 'reversal-entries') return; void fetchRevData({ search: revSubmittedSearch, page: revCurrentPage, filters: revFilters, nextQuickFilters: revQuickFilters }); }, [activeTab, revFilters, revCurrentPage, revSubmittedSearch, revQuickFilters, fetchRevData]);

  const handleRevSearch = (e: React.FormEvent) => { e.preventDefault(); setRevSubmittedSearch(revSearchInput); fetchRevData({ search: revSearchInput, page: 1, filters: revFilters, nextQuickFilters: revQuickFilters }); };
  const handleRevRefresh = () => { fetchRevData({ search: revSubmittedSearch, page: revCurrentPage, filters: revFilters, nextQuickFilters: revQuickFilters }); };

  const handleRevToggleQuickFilter = (value: string) => {
    setRevQuickFilters((previous) => toggleFilterValue(previous, value)); setRevCurrentPage(1);
  };

  // --- Create ---
  const handleOpenCreate = () => {
    const defaultSourceType = activeTab === 'adjustment-entries' ? 'adjustment' : activeTab === 'reversal-entries' ? 'reversal' : 'opening_balance';
    setCreateForm({ ...initialForm, sourceType: defaultSourceType }); setCreateErr(null); setIsCreateSubmitting(false); setIsCreateOpen(true);
  };
  const handleCloseCreate = () => { setIsCreateOpen(false); setCreateErr(null); };
    const handleCreateSubmit = async (e: React.FormEvent) => { e.preventDefault(); setIsCreateSubmitting(true); setCreateErr(null); try { await createJournalEntry({ entryDate: createForm.entryDate, postingDate: createForm.postingDate, sourceType: createForm.sourceType, sourceReference: createForm.sourceReference || null, memo: createForm.memo || null, referenceNumber: createForm.referenceNumber || null, status: createForm.status, notes: createForm.notes || null }); handleCloseCreate(); if (activeTab === 'adjustment-entries') { setAdjCurrentPage(1); fetchAdjData({ search: adjSubmittedSearch, page: 1, filters: adjFilters, nextQuickFilters: adjQuickFilters }); } else if (activeTab === 'reversal-entries') { setRevCurrentPage(1); fetchRevData({ search: revSubmittedSearch, page: 1, filters: revFilters, nextQuickFilters: revQuickFilters }); } else { setObCurrentPage(1); fetchObData({ search: obSubmittedSearch, page: 1, filters: obFilters, nextQuickFilters: obQuickFilters }); } } catch (err) { setCreateErr(err instanceof Error ? err.message : 'Unable to create journal entry.'); setIsCreateSubmitting(false); } };

  // --- View detail ---
  const handleView = async (id: number | string) => { setSelectedEntry(null); setIsDetailLoading(true); setDetailErr(null); try { setSelectedEntry(await getJournalEntryDetail(id)); } catch (err) { setDetailErr(err instanceof Error ? err.message : 'Unable to load detail.'); } finally { setIsDetailLoading(false); } };
  const handleCloseDetail = () => { setSelectedEntry(null); setDetailErr(null); };

  // --- Edit ---
  const handleOpenEdit = async (id: number | string) => { handleCloseDetail(); setEditingId(id); setEditForm(initialForm); setEditErr(null); setIsEditSubmitting(false); setIsEditOpen(true); try { const d = await getJournalEntryDetail(id); setEditForm({ entryDate: (d.entryDate || '').slice(0, 10), postingDate: (d.postingDate || '').slice(0, 10), sourceType: d.sourceType || 'opening_balance', sourceReference: d.sourceReference || '', memo: d.memo || '', referenceNumber: d.referenceNumber || '', status: d.status || 'draft', notes: d.notes || '' }); setEditingTotals({ totalDebit: d.totalDebit ?? null, totalCredit: d.totalCredit ?? null, isBalanced: d.isBalanced ?? null }); } catch (err) { setEditErr(err instanceof Error ? err.message : 'Unable to load for editing.'); } };
  const handleCloseEdit = () => { setIsEditOpen(false); setEditingId(null); setEditErr(null); };
  const handleEditSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (editingId === null) return; setIsEditSubmitting(true); setEditErr(null); try { await updateJournalEntry(editingId, { entryDate: editForm.entryDate, postingDate: editForm.postingDate, sourceType: editForm.sourceType, sourceReference: editForm.sourceReference || null, memo: editForm.memo || null, referenceNumber: editForm.referenceNumber || null, status: editForm.status, notes: editForm.notes || null }); handleCloseEdit(); if (activeTab === 'adjustment-entries') { fetchAdjData({ search: adjSubmittedSearch, page: adjCurrentPage, filters: adjFilters, nextQuickFilters: adjQuickFilters }); } else if (activeTab === 'reversal-entries') { fetchRevData({ search: revSubmittedSearch, page: revCurrentPage, filters: revFilters, nextQuickFilters: revQuickFilters }); } else { fetchObData({ search: obSubmittedSearch, page: obCurrentPage, filters: obFilters, nextQuickFilters: obQuickFilters }); } } catch (err) { setEditErr(err instanceof Error ? err.message : 'Unable to update.'); setIsEditSubmitting(false); } };

  // --- Delete ---
  const handleOpenDelete = async (id: number | string, entryNumber: string) => { setDeletingId(id); setDeletingEntryNumber(entryNumber); setDeleteErr(null); setDeleteBlockers([]); setIsDeleteSubmitting(false); setIsDeleteOpen(true); try { const r = await deleteJournalEntry(id); setDeleteBlockers(r.blockers || []); } catch (err) { setDeleteErr(err instanceof Error ? err.message : 'Unable to check dependencies.'); } };
  const handleCloseDelete = () => { setIsDeleteOpen(false); setDeletingId(null); setDeletingEntryNumber(''); setDeleteErr(null); setDeleteBlockers([]); setIsDeleteSubmitting(false); };
  const handleConfirmDelete = async () => { if (deletingId === null) return; setIsDeleteSubmitting(true); setDeleteErr(null); try { const r = await deleteJournalEntry(deletingId); if (r.blockers && r.blockers.length > 0) { setDeleteErr('Cannot delete: dependencies exist.'); setIsDeleteSubmitting(false); return; } handleCloseDelete(); if (activeTab === 'adjustment-entries') { fetchAdjData({ search: adjSubmittedSearch, page: adjCurrentPage, filters: adjFilters, nextQuickFilters: adjQuickFilters }); } else if (activeTab === 'reversal-entries') { fetchRevData({ search: revSubmittedSearch, page: revCurrentPage, filters: revFilters, nextQuickFilters: revQuickFilters }); } else { fetchObData({ search: obSubmittedSearch, page: obCurrentPage, filters: obFilters, nextQuickFilters: obQuickFilters }); } } catch (err) { setDeleteErr(err instanceof Error ? err.message : 'Unable to delete.'); setIsDeleteSubmitting(false); } };

  // --- CSV Export ---
  const handleObExport = () => { const rows = obData?.section.table.rows as OpeningBalRegisterRow[] | undefined; if (!rows?.length) return;
    const headers = ['Entry No.', 'Posting Date', 'Source Ref', 'Total Debit', 'Balanced', 'Status'];
    const csvRows = rows.map((r) => [r.entryNumber ?? '-', r.postingDate ?? '-', r.sourceReference ?? '-', r.totalDebit != null ? `PHP ${Number(r.totalDebit).toLocaleString()}` : '-', r.isBalanced ? 'Yes' : 'No', r.statusLabel ?? '-']);
    const csvContent = [headers.map((h) => escapeCsvValue(h)), ...csvRows.map((r) => r.map((c) => escapeCsvValue(c)))].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'opening-balance-journals.csv'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const handleAdjExport = () => { const rows = adjData?.section.table.rows as AdjustmentRegisterRow[] | undefined; if (!rows?.length) return;
    const headers = ['Entry No.', 'Posting Date', 'Reference No.', 'Memo', 'Total Debit', 'Balanced', 'Status'];
    const csvRows = rows.map((r) => [r.entryNumber ?? '-', r.postingDate ?? '-', r.referenceNumber ?? '-', r.memo ?? '-', r.totalDebit != null ? `PHP ${Number(r.totalDebit).toLocaleString()}` : '-', r.isBalanced ? 'Yes' : 'No', r.statusLabel ?? '-']);
    const csvContent = [headers.map((h) => escapeCsvValue(h)), ...csvRows.map((r) => r.map((c) => escapeCsvValue(c)))].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'adjustment-entries.csv'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const handleRevExport = () => { const rows = revData?.section.table.rows as ReversalRegisterRow[] | undefined; if (!rows?.length) return;
    const headers = ['Reversal Entry', 'Original Entry', 'Posting Date', 'Memo', 'Reversed By', 'Status'];
    const csvRows = rows.map((r) => [r.entryNumber ?? '-', r.originalEntry ?? '-', r.postingDate ?? '-', r.memo ?? '-', r.createdBy ?? '-', r.statusLabel ?? '-']);
    const csvContent = [headers.map((h) => escapeCsvValue(h)), ...csvRows.map((r) => r.map((c) => escapeCsvValue(c)))].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'reversal-entries.csv'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const currentTab = STATIC_TABS.find((t) => t.id === activeTab) || STATIC_TABS[0];

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
          {activeTab === 'opening-balance-journals' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold text-gray-900">Opening Balance Journals</h2>
                  <p className="text-sm text-gray-600">{currentTab.description}</p>
                  <p className="text-sm text-gray-500">{obData?.totals.filteredEntries ?? 0} matching entries</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}><Plus className="h-4 w-4" /> Create Opening Journal</button>
                  <button type="button" onClick={handleObRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}><RefreshCw className="h-4 w-4" /> Refresh</button>
                </div>
              </div>

              {obData?.section.metrics && obData.section.metrics.length > 0 ? (<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{obData.section.metrics.map((m) => (<div key={m.id}><MetricCard label={m.label} value={m.value} change={m.change} trend={m.trend} /></div>))}</div>) : null}

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                    <form onSubmit={handleObSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
                      <div className="relative min-w-0 flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder={currentTab.searchPlaceholder} value={obSearchInput} onChange={(e) => setObSearchInput(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                      </div>
                      <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700">
                        <Search className="h-4 w-4" /> Search
                      </button>
                    </form>
                    <button type="button" onClick={() => { if (!obIsFilterPanelOpen) setObDraftFilters({ ...obFilters }); setObIsFilterPanelOpen((p) => !p); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${obIsFilterPanelOpen || obFilterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}><Filter className="h-4 w-4" /> Filters{obFilterCount > 0 && <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{obFilterCount}</span>}</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(() => { const qf = obData?.section?.filters?.quickFilters; if (qf && qf.length > 0) return qf.map((f) => { const isActive = obQuickFilters.includes(f.value); return <button key={f.value} type="button" onClick={() => handleObToggleQuickFilter(f.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{f.label}</button>; }); return null; })()}
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  {obIsFilterPanelOpen && (<div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><h4 className="text-sm font-semibold text-gray-900">Filters</h4><p className="mt-1 text-sm text-gray-600">Select as many filter values as needed, then apply them in one step.</p></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => { setObDraftFilters({ statuses: [], balancedFilters: [] }); setObFilters({ statuses: [], balancedFilters: [] }); setObCurrentPage(1); setObIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Clear all</button><button type="button" onClick={() => { setObFilters({ ...obDraftFilters }); setObCurrentPage(1); setObIsFilterPanelOpen(false); }} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button><button type="button" onClick={() => { setObFilters({ ...obDraftFilters }); setObCurrentPage(1); setObIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button></div></div><div className="mt-4 flex flex-wrap gap-2">{obData?.section?.filters?.statuses?.map((opt) => { const isSelected = obDraftFilters.statuses.includes(opt.value); return <button key={opt.value} type="button" onClick={() => setObDraftFilters((p) => ({ ...p, statuses: toggleFilterValue(p.statuses, opt.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{opt.label}</button>; })}</div></div>)}

                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <h3 className="text-base font-semibold text-gray-900">Opening Balance Journal View</h3>
                      <p className="text-sm text-gray-600">Opening-balance journal headers using source type, totals, balance validation, and posting status.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span>{obData?.totals.filteredEntries ?? 0} matching entries</span>
                      <button type="button" onClick={handleObExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!(obData?.section.table.rows.length)}><Download className="h-4 w-4" /> Export View</button>
                    </div>
                  </div>

                  {obError && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{obError}</div>}
                  {obIsLoading ? <LoadingSkeleton /> : (<>
                    <div className="overflow-hidden rounded-xl border border-gray-200"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{currentTab.columns.map((col) => (<th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{col}</th>))}<th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th></tr></thead><tbody className="divide-y divide-gray-200 bg-white">{(obData?.section.table.rows ?? []).length > 0 ? (obData?.section.table.rows ?? []).map((row) => (<tr key={row.id} className="hover:bg-gray-50">{row.cells.map((cell, index) => renderCell(cell, index))}<td className="px-4 py-3 text-right"><div className="flex justify-end gap-2"><button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail"><Eye className="h-4 w-4" /></button><button type="button" onClick={() => handleOpenEdit(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="Edit"><Edit className="h-4 w-4" /></button><button type="button" onClick={() => { const r = row as OpeningBalRegisterRow; handleOpenDelete(row.id, r.entryNumber || 'Journal Entry'); }} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700" title="Delete"><Trash2 className="h-4 w-4" /></button></div></td></tr>)) : (<tr><td colSpan={currentTab.columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">No opening balance journals found.</td></tr>)}</tbody></table></div></div>
                    {obData?.pagination && obData.pagination.totalPages > 1 && (<div className="flex items-center justify-between"><p className="text-sm text-gray-600">Page {obData.pagination.page} of {obData.pagination.totalPages}</p><div className="flex gap-2"><button type="button" disabled={!obData.pagination.hasPrevPage} onClick={() => setObCurrentPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button><button type="button" disabled={!obData.pagination.hasNextPage} onClick={() => setObCurrentPage((p) => p + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button></div></div>)}
                  </>)}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'adjustment-entries' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold text-gray-900">Adjustment Entries</h2>
                  <p className="text-sm text-gray-600">{currentTab.description}</p>
                  <p className="text-sm text-gray-500">{adjData?.totals.filteredEntries ?? 0} matching entries</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}><Plus className="h-4 w-4" /> Create Adjustment Entry</button>
                  <button type="button" onClick={handleAdjRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}><RefreshCw className="h-4 w-4" /> Refresh</button>
                </div>
              </div>

              {adjData?.section.metrics && adjData.section.metrics.length > 0 ? (<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{adjData.section.metrics.map((m) => (<div key={m.id}><MetricCard label={m.label} value={m.value} change={m.change} trend={m.trend} /></div>))}</div>) : null}

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                    <form onSubmit={handleAdjSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
                      <div className="relative min-w-0 flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder={currentTab.searchPlaceholder} value={adjSearchInput} onChange={(e) => setAdjSearchInput(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                      </div>
                      <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700">
                        <Search className="h-4 w-4" /> Search
                      </button>
                    </form>
                    <button type="button" onClick={() => { if (!adjIsFilterPanelOpen) setAdjDraftFilters({ ...adjFilters }); setAdjIsFilterPanelOpen((p) => !p); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${adjIsFilterPanelOpen || adjFilterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}><Filter className="h-4 w-4" /> Filters{adjFilterCount > 0 && <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{adjFilterCount}</span>}</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(() => { const qf = adjData?.section?.filters?.quickFilters; if (qf && qf.length > 0) return qf.map((f) => { const isActive = adjQuickFilters.includes(f.value); return <button key={f.value} type="button" onClick={() => handleAdjToggleQuickFilter(f.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{f.label}</button>; }); return null; })()}
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  {adjIsFilterPanelOpen && (<div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><h4 className="text-sm font-semibold text-gray-900">Filters</h4><p className="mt-1 text-sm text-gray-600">Select as many filter values as needed, then apply them in one step.</p></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => { setAdjDraftFilters({ statuses: [], balancedFilters: [] }); setAdjFilters({ statuses: [], balancedFilters: [] }); setAdjCurrentPage(1); setAdjIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Clear all</button><button type="button" onClick={() => { setAdjFilters({ ...adjDraftFilters }); setAdjCurrentPage(1); setAdjIsFilterPanelOpen(false); }} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button><button type="button" onClick={() => { setAdjFilters({ ...adjDraftFilters }); setAdjCurrentPage(1); setAdjIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button></div></div><div className="mt-4 flex flex-wrap gap-2">{adjData?.section?.filters?.statuses?.map((opt) => { const isSelected = adjDraftFilters.statuses.includes(opt.value); return <button key={opt.value} type="button" onClick={() => setAdjDraftFilters((p) => ({ ...p, statuses: toggleFilterValue(p.statuses, opt.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{opt.label}</button>; })}</div></div>)}

                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <h3 className="text-base font-semibold text-gray-900">Adjustment Journal View</h3>
                      <p className="text-sm text-gray-600">Adjustment journal headers using reference numbers, totals, and posting status.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span>{adjData?.totals.filteredEntries ?? 0} matching entries</span>
                      <button type="button" onClick={handleAdjExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!(adjData?.section.table.rows.length)}><Download className="h-4 w-4" /> Export View</button>
                    </div>
                  </div>

                  {adjError && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{adjError}</div>}
                  {adjIsLoading ? <LoadingSkeleton /> : (<>
                    <div className="overflow-hidden rounded-xl border border-gray-200"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{currentTab.columns.map((col) => (<th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{col}</th>))}<th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th></tr></thead><tbody className="divide-y divide-gray-200 bg-white">{(adjData?.section.table.rows ?? []).length > 0 ? (adjData?.section.table.rows ?? []).map((row) => (<tr key={row.id} className="hover:bg-gray-50">{row.cells.map((cell, index) => renderCell(cell, index))}<td className="px-4 py-3 text-right"><div className="flex justify-end gap-2"><button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail"><Eye className="h-4 w-4" /></button><button type="button" onClick={() => handleOpenEdit(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="Edit"><Edit className="h-4 w-4" /></button><button type="button" onClick={() => { const r = row as AdjustmentRegisterRow; handleOpenDelete(row.id, r.entryNumber || 'Journal Entry'); }} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700" title="Delete"><Trash2 className="h-4 w-4" /></button></div></td></tr>)) : (<tr><td colSpan={currentTab.columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">No adjustment entries found.</td></tr>)}</tbody></table></div></div>
                    {adjData?.pagination && adjData.pagination.totalPages > 1 && (<div className="flex items-center justify-between"><p className="text-sm text-gray-600">Page {adjData.pagination.page} of {adjData.pagination.totalPages}</p><div className="flex gap-2"><button type="button" disabled={!adjData.pagination.hasPrevPage} onClick={() => setAdjCurrentPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button><button type="button" disabled={!adjData.pagination.hasNextPage} onClick={() => setAdjCurrentPage((p) => p + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button></div></div>)}
                  </>)}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reversal-entries' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold text-gray-900">Reversal Entries</h2>
                  <p className="text-sm text-gray-600">{currentTab.description}</p>
                  <p className="text-sm text-gray-500">{revData?.totals.filteredEntries ?? 0} matching entries</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}><Plus className="h-4 w-4" /> Create Reversal Entry</button>
                  <button type="button" onClick={handleRevRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}><RefreshCw className="h-4 w-4" /> Refresh</button>
                </div>
              </div>

              {revData?.section.metrics && revData.section.metrics.length > 0 ? (<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{revData.section.metrics.map((m) => (<div key={m.id}><MetricCard label={m.label} value={m.value} change={m.change} trend={m.trend} /></div>))}</div>) : null}

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                    <form onSubmit={handleRevSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
                      <div className="relative min-w-0 flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder={currentTab.searchPlaceholder} value={revSearchInput} onChange={(e) => setRevSearchInput(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                      </div>
                      <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700">
                        <Search className="h-4 w-4" /> Search
                      </button>
                    </form>
                    <button type="button" onClick={() => { if (!revIsFilterPanelOpen) setRevDraftFilters({ ...revFilters }); setRevIsFilterPanelOpen((p) => !p); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${revIsFilterPanelOpen || revFilterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}><Filter className="h-4 w-4" /> Filters{revFilterCount > 0 && <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{revFilterCount}</span>}</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(() => { const qf = revData?.section?.filters?.quickFilters; if (qf && qf.length > 0) return qf.map((f) => { const isActive = revQuickFilters.includes(f.value); return <button key={f.value} type="button" onClick={() => handleRevToggleQuickFilter(f.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{f.label}</button>; }); return null; })()}
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  {revIsFilterPanelOpen && (<div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><h4 className="text-sm font-semibold text-gray-900">Filters</h4><p className="mt-1 text-sm text-gray-600">Select as many filter values as needed, then apply them in one step.</p></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => { setRevDraftFilters({ statuses: [] }); setRevFilters({ statuses: [] }); setRevCurrentPage(1); setRevIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Clear all</button><button type="button" onClick={() => { setRevFilters({ ...revDraftFilters }); setRevCurrentPage(1); setRevIsFilterPanelOpen(false); }} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button><button type="button" onClick={() => { setRevFilters({ ...revDraftFilters }); setRevCurrentPage(1); setRevIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button></div></div><div className="mt-4 flex flex-wrap gap-2">{revData?.section?.filters?.statuses?.map((opt) => { const isSelected = revDraftFilters.statuses.includes(opt.value); return <button key={opt.value} type="button" onClick={() => setRevDraftFilters((p) => ({ ...p, statuses: toggleFilterValue(p.statuses, opt.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{opt.label}</button>; })}</div></div>)}

                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <h3 className="text-base font-semibold text-gray-900">Reversal Journal View</h3>
                      <p className="text-sm text-gray-600">Reversal journal headers using original entries, totals, and posting status.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span>{revData?.totals.filteredEntries ?? 0} matching entries</span>
                      <button type="button" onClick={handleRevExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!(revData?.section.table.rows.length)}><Download className="h-4 w-4" /> Export View</button>
                    </div>
                  </div>

                  {revError && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{revError}</div>}
                  {revIsLoading ? <LoadingSkeleton /> : (<>
                    <div className="overflow-hidden rounded-xl border border-gray-200"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{currentTab.columns.map((col) => (<th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{col}</th>))}<th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th></tr></thead><tbody className="divide-y divide-gray-200 bg-white">{(revData?.section.table.rows ?? []).length > 0 ? (revData?.section.table.rows ?? []).map((row) => (<tr key={row.id} className="hover:bg-gray-50">{row.cells.map((cell, index) => renderCell(cell, index))}<td className="px-4 py-3 text-right"><div className="flex justify-end gap-2"><button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail"><Eye className="h-4 w-4" /></button><button type="button" onClick={() => handleOpenEdit(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="Edit"><Edit className="h-4 w-4" /></button><button type="button" onClick={() => { const r = row as ReversalRegisterRow; handleOpenDelete(row.id, r.entryNumber || 'Journal Entry'); }} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700" title="Delete"><Trash2 className="h-4 w-4" /></button></div></td></tr>)) : (<tr><td colSpan={currentTab.columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">No reversal entries found.</td></tr>)}</tbody></table></div></div>
                    {revData?.pagination && revData.pagination.totalPages > 1 && (<div className="flex items-center justify-between"><p className="text-sm text-gray-600">Page {revData.pagination.page} of {revData.pagination.totalPages}</p><div className="flex gap-2"><button type="button" disabled={!revData.pagination.hasPrevPage} onClick={() => setRevCurrentPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button><button type="button" disabled={!revData.pagination.hasNextPage} onClick={() => setRevCurrentPage((p) => p + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button></div></div>)}
                  </>)}
                </div>
              </div>
            </div>
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
          {selectedEntry.referenceNumber && <div><span className="font-medium text-gray-500">Reference No.:</span><span className="ml-2 text-gray-900">{selectedEntry.referenceNumber}</span></div>}
          {selectedEntry.memo && <div><span className="font-medium text-gray-500">Memo:</span><span className="ml-2 text-gray-900">{selectedEntry.memo}</span></div>}
          <div><span className="font-medium text-gray-500">Status:</span><span className={`ml-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusBadgeClasses(selectedEntry.status)}`}>{selectedEntry.status || '-'}</span></div>
          <div><span className="font-medium text-gray-500">Posting Status:</span><span className={`ml-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusBadgeClasses(selectedEntry.postingStatus)}`}>{selectedEntry.postingStatus || '-'}</span></div>
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
      <SlideOver isOpen={isCreateOpen} onClose={handleCloseCreate} title={activeTab === 'adjustment-entries' ? 'Create Adjustment Entry' : activeTab === 'reversal-entries' ? 'Create Reversal Entry' : 'Create Opening Balance Journal'}>
        {createErr && <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{createErr}</div>}
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <FormField label="Entry Date" required><Input type="date" value={createForm.entryDate} onChange={(v) => setCreateForm((p) => ({ ...p, entryDate: v }))} required /></FormField>
          <FormField label="Posting Date" required><Input type="date" value={createForm.postingDate} onChange={(v) => setCreateForm((p) => ({ ...p, postingDate: v }))} required /></FormField>
          <FormField label="Source Type"><Select value={createForm.sourceType} onChange={(v) => setCreateForm((p) => ({ ...p, sourceType: v }))} options={[{ label: 'Opening Balance', value: 'opening_balance' }, { label: 'Manual', value: 'manual' }, { label: 'Adjustment', value: 'adjustment' }, { label: 'Reversal', value: 'reversal' }]} /></FormField>
          <FormField label="Source Reference"><Input value={createForm.sourceReference} onChange={(v) => setCreateForm((p) => ({ ...p, sourceReference: v }))} placeholder="e.g. ADJ-2026-001" /></FormField>
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
          <FormField label="Source Type"><Select value={editForm.sourceType} onChange={(v) => setEditForm((p) => ({ ...p, sourceType: v }))} options={[{ label: 'Opening Balance', value: 'opening_balance' }, { label: 'Manual', value: 'manual' }, { label: 'Adjustment', value: 'adjustment' }, { label: 'Reversal', value: 'reversal' }]} /></FormField>
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
      <SlideOver isOpen={isDeleteOpen} onClose={handleCloseDelete} title="Delete Journal Entry" description={`Remove "${deletingEntryNumber}" from the ${activeTab === 'adjustment-entries' ? 'Adjustment Entries' : activeTab === 'reversal-entries' ? 'Reversal Entries' : 'Opening Balance Journals'} list.`}>
        {deleteErr && <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{deleteErr}</div>}
        {deleteBlockers.length > 0 ? (<div className="space-y-3"><div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><p className="font-medium">Cannot delete this journal entry</p><p className="mt-1">This journal entry cannot be deleted because the following dependencies exist:</p><ul className="mt-2 list-inside list-disc space-y-1">{deleteBlockers.map((b, i) => <li key={i}>{b}</li>)}</ul><p className="mt-2">Remove all dependencies before attempting to delete this journal entry.</p></div><div className="flex justify-end"><button type="button" onClick={handleCloseDelete} className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200">Close</button></div></div>) : (<div className="space-y-3"><div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><p className="font-medium">Are you sure?</p><p className="mt-1">This action cannot be undone. The journal entry &ldquo;{deletingEntryNumber}&rdquo; will be permanently removed.</p></div><div className="flex justify-end gap-3"><button type="button" onClick={handleCloseDelete} disabled={isDeleteSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50">Cancel</button><button type="button" onClick={handleConfirmDelete} disabled={isDeleteSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50">{isDeleteSubmitting ? 'Deleting...' : 'Delete Entry'}</button></div></div>)}
      </SlideOver>
    </div>
  );
}
