'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, ArrowDownRight, ArrowUpRight, Download, Edit, Eye, Filter, Plus, RefreshCw, Search, Trash2, Wallet, X } from 'lucide-react';
import {
  getWorkflowSteps,
  createWorkflowStep,
  updateWorkflowStep,
  deleteWorkflowStep,
  type WorkflowStepsResponse,
  type WorkflowStepRow,
  type WdMetric,
} from './actions';

type FilterState = { entityTypes: string[] };
type StepFormState = { workflowId: string; label: string; approverUserId: string; approverRole: string };

function getActionClasses(v: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (v === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 dark:border-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800';
  if (v === 'ghost') return 'border border-transparent bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-300';
  return 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800';
}
function getMetricTone(t: WdMetric['trend']) { if (t === 'down') return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30'; if (t === 'neutral') return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'; return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30'; }
function escapeCsvValue(v: string | number | boolean | null | undefined) { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }
function toggleFilterValue(values: string[], value: string) { return values.includes(value) ? values.filter((v) => v !== value) : [...values, value]; }

function SlideOver({ isOpen, onClose, title, description, children }: { isOpen: boolean; onClose: () => void; title: string; description?: string; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    if (isOpen) { setMounted(true); requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true))); }
    else { setAnimate(false); const timer = setTimeout(() => setMounted(false), 300); return () => clearTimeout(timer); }
  }, [isOpen]);
  if (!mounted) return null;
  return createPortal(
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ease-in-out ${animate ? 'bg-black/50' : 'bg-transparent'}`} onClick={onClose}>
      <div className={`flex w-full max-w-lg flex-col bg-white dark:bg-[var(--card-background)] shadow-xl transition-all duration-300 ease-in-out ${animate ? 'translate-x-0' : 'translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4">
          <div><h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>{description && <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{description}</p>}</div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return <div className="space-y-1.5"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}{required && <span className="ml-0.5 text-red-500">*</span>}</label>{children}</div>;
}
function Input({ value, onChange, placeholder, required }: { value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50" />;
}
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: Array<{ label: string; value: string }> }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50">{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
}

function MetricCard({ label, value, change, trend = 'neutral' }: { label: string; value: string | number; change: string; trend?: 'up' | 'down' | 'neutral' }) {
  const TrendIcon = trend === 'down' ? ArrowDownRight : ArrowUpRight;
  return <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p><p className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p></div><div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-3 text-gray-600 dark:text-gray-400"><Wallet className="h-5 w-5" /></div></div><div className="mt-4 flex items-center gap-2"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${getMetricTone(trend)}`}><TrendIcon className="h-3.5 w-3.5" />{change}</span></div></div>;
}

function LoadingSkeleton() {
  return <div className="space-y-4"><div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[var(--card-border)]"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800"><thead className="bg-gray-50 dark:bg-gray-800/50"><tr>{Array.from({ length: 6 }).map((_, i) => <th key={i} className="px-4 py-3"><div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" /></th>)}</tr></thead><tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-[var(--card-background)]">{Array.from({ length: 5 }).map((_, i) => (<tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-6 animate-pulse rounded bg-gray-100 dark:bg-gray-800" /></td></tr>))}</tbody></table></div></div></div>;
}

function renderCell(cell: string | { text: string; tone?: string; emphasis?: boolean; align?: string }, index: number) {
  if (typeof cell === 'string') return <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{cell}</td>;
  const alignClass = cell.align === 'right' ? 'text-right' : cell.align === 'center' ? 'text-center' : 'text-left';
  if (cell.tone) {
    const toneMap: Record<string, string> = { amber: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:ring-amber-800', green: 'bg-green-50 text-green-700 ring-green-200 dark:bg-green-950/30 dark:text-green-400 dark:ring-green-800', gray: 'bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700', blue: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-800', red: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/30 dark:text-red-400 dark:ring-red-800' };
    return <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${alignClass}`}><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${toneMap[cell.tone] || toneMap.gray}`}>{cell.text}</span></td>;
  }
  return <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${cell.emphasis ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'} ${alignClass}`}>{cell.text}</td>;
}

export function WorkflowStepsClient() {
  const [data, setData] = useState<WorkflowStepsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({ entityTypes: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [draftFilters, setDraftFilters] = useState<FilterState>({ entityTypes: [] });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const filterCount = filters.entityTypes.length;

  const [viewRow, setViewRow] = useState<WorkflowStepRow | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [createErr, setCreateErr] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<StepFormState>({ workflowId: '', label: '', approverUserId: '', approverRole: '' });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editErr, setEditErr] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<StepFormState>({ workflowId: '', label: '', approverUserId: '', approverRole: '' });
  const [editStepNumber, setEditStepNumber] = useState<number | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);
  const [deleteRow, setDeleteRow] = useState<WorkflowStepRow | null>(null);

  const fetchData = useCallback(async ({ search, page, nextFilters, nextQuickFilters }: { search: string; page: number; nextFilters: FilterState; nextQuickFilters: string[] }) => {
    setIsLoading(true); setError(null);
    try {
      const r = await getWorkflowSteps({ search, page, entityTypes: nextFilters.entityTypes, quickFilters: nextQuickFilters });
      setData(r);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load workflow steps.'); } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { void fetchData({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters }); }, [filters, currentPage, quickFilters, submittedSearch, fetchData]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSubmittedSearch(searchInput); setCurrentPage(1); fetchData({ search: searchInput, page: 1, nextFilters: filters, nextQuickFilters: quickFilters }); };
  const handleRefresh = () => { fetchData({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters }); };
  const handleToggleQuickFilter = (value: string) => { setQuickFilters((prev) => toggleFilterValue(prev, value)); setCurrentPage(1); };
  const handleExport = () => {
    const rows = data?.section.table.rows; if (!rows?.length) return;
    const headers = ['Workflow Code', 'Entity Type', 'Step', 'Label', 'Approver User', 'Approver Role'];
    const csvRows = rows.map((r) => [r.workflowCode || '-', r.entityTypeLabel, String(r.stepNumber), r.label || '-', r.approverUserName, r.approverRole || '-']);
    const csvContent = [headers.map((h) => escapeCsvValue(h)), ...csvRows.map((r) => r.map((c) => escapeCsvValue(c)))].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'workflow-steps.csv'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const handleViewRow = (row: WorkflowStepRow) => { setViewRow(row); setIsViewOpen(true); };

  const handleOpenCreate = () => {
    setCreateForm({ workflowId: '', label: '', approverUserId: '', approverRole: '' });
    setCreateErr(null);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setCreateErr(null); setIsCreateSubmitting(true);
    try {
      await createWorkflowStep(createForm.workflowId, { label: createForm.label, approverUserId: createForm.approverUserId, approverRole: createForm.approverRole });
      setIsCreateOpen(false); handleRefresh();
    } catch (err) { setCreateErr(err instanceof Error ? err.message : 'An error occurred'); } finally { setIsCreateSubmitting(false); }
  };

  const handleOpenEdit = (row: WorkflowStepRow) => {
    setEditForm({ workflowId: row.workflowId, label: row.label, approverUserId: row.approverUserId, approverRole: row.approverRole });
    setEditStepNumber(row.stepNumber);
    setEditErr(null);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (editStepNumber === null) return; setEditErr(null); setIsEditSubmitting(true);
    try {
      await updateWorkflowStep(editForm.workflowId, editStepNumber, { label: editForm.label, approverUserId: editForm.approverUserId, approverRole: editForm.approverRole });
      setIsEditOpen(false); handleRefresh();
    } catch (err) { setEditErr(err instanceof Error ? err.message : 'An error occurred'); } finally { setIsEditSubmitting(false); }
  };

  const handleOpenDelete = (row: WorkflowStepRow) => { setDeleteRow(row); setDeleteErr(null); setIsDeleteOpen(true); };
  const handleCloseDelete = () => { setIsDeleteOpen(false); setDeleteRow(null); };
  const handleConfirmDelete = async () => {
    if (!deleteRow) return; setIsDeleteSubmitting(true); setDeleteErr(null);
    try { await deleteWorkflowStep(deleteRow.workflowId, deleteRow.stepNumber); setIsDeleteOpen(false); handleRefresh(); } catch (err) { setDeleteErr(err instanceof Error ? err.message : 'Unable to delete step.'); } finally { setIsDeleteSubmitting(false); }
  };

  const userOptions = data?.referenceData?.users || [];
  const workflowOptions = data?.referenceData?.workflows || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Workflow Steps</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Review per-step configuration using step number, step label, approver user, and approver role captured inside workflow step arrays.</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}><RefreshCw className="h-4 w-4" /> Refresh Steps</button>
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}><Plus className="h-4 w-4" /> Add Step</button>
        </div>
      </div>

      {data?.section.metrics && data.section.metrics.length > 0 ? (<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{data.section.metrics.map((m) => (<div key={m.id}><MetricCard label={m.label} value={m.value} change={m.change} trend={m.trend} /></div>))}</div>) : null}

      <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-800 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <form onSubmit={handleSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input type="text" placeholder={data?.section.searchPlaceholder || 'Search workflow code, entity type, step number, approver, or label'} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50" />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 dark:border-blue-700 bg-blue-600 dark:bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800"><Search className="h-4 w-4" /> Search</button>
            </form>
            <button type="button" onClick={() => { if (!isFilterPanelOpen) setDraftFilters({ ...filters }); setIsFilterPanelOpen((p) => !p); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isFilterPanelOpen || filterCount > 0 ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}><Filter className="h-4 w-4" /> Filters{filterCount > 0 && <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-700 px-1.5 py-0.5 text-[11px] font-semibold text-white">{filterCount}</span>}</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(() => { const qf = data?.section?.filters?.quickFilters; if (qf && qf.length > 0) return qf.map((f) => <button key={f.value} type="button" onClick={() => handleToggleQuickFilter(f.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${quickFilters.includes(f.value) ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-200 dark:ring-blue-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{f.label}</button>); return null; })()}
          </div>
        </div>

        <div className="space-y-4 p-[10px] sm:p-5">
          {isFilterPanelOpen && (
            <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div><h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Filters</h4><p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Select as many filter values as needed, then apply them in one step.</p></div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => { setDraftFilters({ entityTypes: [] }); setFilters({ entityTypes: [] }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">Clear all</button>
                  <button type="button" onClick={() => { setDraftFilters({ ...filters }); setIsFilterPanelOpen(false); }} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                  <button type="button" onClick={() => { setFilters({ ...draftFilters }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 dark:border-blue-700 bg-blue-600 dark:bg-blue-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-800">Apply Filters</button>
                </div>
              </div>
              <div className="mt-6">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Entity Type</h5>
                <div className="mt-3 flex flex-wrap gap-2">{(data?.section?.filters?.entityTypes || []).map((opt) => { const isSelected = draftFilters.entityTypes.includes(opt.value); return <button key={opt.value} type="button" onClick={() => setDraftFilters((p) => ({ ...p, entityTypes: toggleFilterValue(p.entityTypes, opt.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{opt.label}</button>; })}</div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Workflow Step Register</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Step-level approval configuration aligned to the steps array in approval workflows, including assignee user and role fields.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span>{data?.totals.filteredRows ?? 0} matching rows</span>
              <button type="button" onClick={handleExport} disabled={!(data?.section.table.rows.length)} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"><Download className="h-4 w-4" /> Download View</button>
            </div>
          </div>

          {error && <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
          {isLoading ? <LoadingSkeleton /> : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[var(--card-border)]">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Workflow Code</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Entity Type</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Step</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Label</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Approver User</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Approver Role</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-[var(--card-background)]">
                      {(data?.section.table.rows ?? []).length > 0 ? (data?.section.table.rows ?? []).map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          {row.cells.map((cell, index) => renderCell(cell, index))}
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => handleViewRow(row)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300" title="View detail"><Eye className="h-4 w-4" /></button>
                              <button type="button" onClick={() => handleOpenEdit(row)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300" title="Edit"><Edit className="h-4 w-4" /></button>
                              <button type="button" onClick={() => handleOpenDelete(row)} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300" title="Delete"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      )) : (<tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No step records found.</td></tr>)}
                    </tbody>
                  </table>
                </div>
              </div>
              {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Page {data.pagination.page} of {data.pagination.totalPages}</p>
                  <div className="flex gap-2">
                    <button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">Previous</button>
                    <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((p) => p + 1)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <SlideOver isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add Workflow Step" description="Add a new approval step to an existing workflow.">
        <form onSubmit={handleCreateSubmit} className="space-y-6">
          {createErr && <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400"><AlertCircle className="h-4 w-4 shrink-0" />{createErr}</div>}
          <div className="space-y-4">
            <FormField label="Workflow" required>
              <Select value={createForm.workflowId} onChange={(v) => setCreateForm({ ...createForm, workflowId: v })} options={[{ label: 'Select a workflow', value: '' }, ...workflowOptions.map((w) => ({ label: `${w.workflowCode} - ${w.name} (${w.entityTypeLabel})`, value: w.id }))]} />
            </FormField>
            <FormField label="Step Label" required><Input value={createForm.label} onChange={(v) => setCreateForm({ ...createForm, label: v })} placeholder="e.g. Initial Review" required /></FormField>
            <FormField label="Approver User">
              <Select value={createForm.approverUserId} onChange={(v) => setCreateForm({ ...createForm, approverUserId: v })} options={[{ label: 'Select a user', value: '' }, ...userOptions.map((u) => ({ label: `${u.label}${u.email ? ` (${u.email})` : ''}`, value: u.id }))]} />
            </FormField>
            <FormField label="Approver Role"><Input value={createForm.approverRole} onChange={(v) => setCreateForm({ ...createForm, approverRole: v })} placeholder="e.g. Accounting Manager" /></FormField>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-800 pt-4">
            <button type="button" onClick={() => setIsCreateOpen(false)} disabled={isCreateSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isCreateSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>{isCreateSubmitting ? 'Adding...' : 'Add Step'}</button>
          </div>
        </form>
      </SlideOver>

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Step Detail" description="View the approval step configuration and parent workflow.">
        <div className="space-y-6">
          {viewRow ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-5 shadow-sm space-y-4">
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-3"><span className="text-sm text-gray-500 dark:text-gray-400">Workflow Code</span><span className="text-sm font-medium text-gray-900 dark:text-gray-100">{viewRow.workflowCode || '-'}</span></div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-3"><span className="text-sm text-gray-500 dark:text-gray-400">Workflow Name</span><span className="text-sm font-medium text-gray-900 dark:text-gray-100">{viewRow.workflowName || '-'}</span></div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-3"><span className="text-sm text-gray-500 dark:text-gray-400">Entity Type</span><span className="text-sm font-medium text-gray-900 dark:text-gray-100">{viewRow.entityTypeLabel}</span></div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-3"><span className="text-sm text-gray-500 dark:text-gray-400">Step Number</span><span className="text-sm font-medium text-gray-900 dark:text-gray-100">{viewRow.stepNumber}</span></div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-3"><span className="text-sm text-gray-500 dark:text-gray-400">Step Label</span><span className="text-sm font-medium text-gray-900 dark:text-gray-100">{viewRow.label || '-'}</span></div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-3"><span className="text-sm text-gray-500 dark:text-gray-400">Approver User</span><span className="text-sm font-medium text-gray-900 dark:text-gray-100">{viewRow.approverUserName}</span></div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-3"><span className="text-sm text-gray-500 dark:text-gray-400">Approver Role</span><span className="text-sm font-medium text-gray-900 dark:text-gray-100">{viewRow.approverRole || '-'}</span></div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-3"><span className="text-sm text-gray-500 dark:text-gray-400">Workflow Active</span><span className="text-sm font-medium text-gray-900 dark:text-gray-100">{viewRow.workflowIsActive ? 'Yes' : 'No'}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500 dark:text-gray-400">Final Step</span><span className="text-sm font-medium text-gray-900 dark:text-gray-100">{viewRow.isFinalStep ? 'Yes' : 'No'}</span></div>
              </div>
            </div>
          ) : <p className="text-sm text-gray-500 dark:text-gray-400">No details available.</p>}
          <div className="flex justify-end pt-4"><button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">Close</button></div>
        </div>
      </SlideOver>

      <SlideOver isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Step" description="Modify the approval step configuration.">
        <form onSubmit={handleEditSubmit} className="space-y-6">
          {editErr && <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400"><AlertCircle className="h-4 w-4 shrink-0" />{editErr}</div>}
          <div className="space-y-4">
            <FormField label="Step Label" required><Input value={editForm.label} onChange={(v) => setEditForm({ ...editForm, label: v })} placeholder="e.g. Initial Review" required /></FormField>
            <FormField label="Approver User">
              <Select value={editForm.approverUserId} onChange={(v) => setEditForm({ ...editForm, approverUserId: v })} options={[{ label: 'Select a user', value: '' }, ...userOptions.map((u) => ({ label: `${u.label}${u.email ? ` (${u.email})` : ''}`, value: u.id }))]} />
            </FormField>
            <FormField label="Approver Role"><Input value={editForm.approverRole} onChange={(v) => setEditForm({ ...editForm, approverRole: v })} placeholder="e.g. Accounting Manager" /></FormField>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-800 pt-4">
            <button type="button" onClick={() => setIsEditOpen(false)} disabled={isEditSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isEditSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>{isEditSubmitting ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </SlideOver>

      <SlideOver isOpen={isDeleteOpen} onClose={handleCloseDelete} title="Delete Step" description="Remove this approval step from the workflow.">
        <div className="space-y-6">
          {deleteErr && <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400"><AlertCircle className="h-4 w-4 shrink-0" />{deleteErr}</div>}
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-700 dark:text-red-400"><p className="font-medium">Are you sure?</p><p className="mt-1">This action cannot be undone. Step {deleteRow?.stepNumber} ({deleteRow?.label || 'Unlabeled'}) will be permanently removed from workflow {deleteRow?.workflowCode || '-'}. The remaining steps will be renumbered.</p></div>
          <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-800 pt-4">
            <button type="button" onClick={handleCloseDelete} disabled={isDeleteSubmitting} className="rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleteSubmitting} className="rounded-lg bg-red-600 dark:bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:hover:bg-red-800 disabled:opacity-50">{isDeleteSubmitting ? 'Deleting...' : 'Delete Step'}</button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
