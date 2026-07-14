'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, ArrowDownRight, ArrowUpRight, Download, Edit, Eye, Filter, Plus, RefreshCw, Search, Trash2, Wallet, X } from 'lucide-react';
import {
  getWorkflowDirectory,
  getWorkflowDetail,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  type WorkflowDirectoryResponse,
  type WorkflowDetail,
  type WdMetric,
} from './actions';

type FilterState = { entityTypes: string[]; activeStates: string[] };
type StepFormItem = { label: string; approverUserId: string; approverRole: string };

function getActionClasses(v: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (v === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  if (v === 'ghost') return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
}
function getMetricTone(t: WdMetric['trend']) { if (t === 'down') return 'text-red-600 bg-red-50'; if (t === 'neutral') return 'text-gray-600 bg-gray-100'; return 'text-green-600 bg-green-50'; }
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
      <div className={`flex w-full max-w-lg flex-col bg-white shadow-xl transition-all duration-300 ease-in-out ${animate ? 'translate-x-0' : 'translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
          <div><h3 className="text-lg font-semibold text-gray-900">{title}</h3>{description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}</div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return <div className="space-y-1.5"><label className="block text-sm font-medium text-gray-700">{label}{required && <span className="ml-0.5 text-red-500">*</span>}</label>{children}</div>;
}
function Input({ value, onChange, placeholder, type = 'text', required }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean }) {
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />;
}
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: Array<{ label: string; value: string }> }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
}
function TextArea({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />;
}

function MetricCard({ label, value, change, trend = 'neutral' }: { label: string; value: string | number; change: string; trend?: 'up' | 'down' | 'neutral' }) {
  const TrendIcon = trend === 'down' ? ArrowDownRight : ArrowUpRight;
  return <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-gray-500">{label}</p><p className="mt-3 text-2xl font-bold text-gray-900">{value}</p></div><div className="rounded-lg bg-gray-100 p-3 text-gray-600"><Wallet className="h-5 w-5" /></div></div><div className="mt-4 flex items-center gap-2"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${getMetricTone(trend)}`}><TrendIcon className="h-3.5 w-3.5" />{change}</span></div></div>;
}

function LoadingSkeleton() {
  return <div className="space-y-4"><div className="overflow-hidden rounded-xl border border-gray-200"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{Array.from({ length: 6 }).map((_, i) => <th key={i} className="px-4 py-3"><div className="h-4 w-24 animate-pulse rounded bg-gray-200" /></th>)}</tr></thead><tbody className="divide-y divide-gray-200 bg-white">{Array.from({ length: 5 }).map((_, i) => (<tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-6 animate-pulse rounded bg-gray-100" /></td></tr>))}</tbody></table></div></div></div>;
}

function renderCell(cell: string | { text: string; tone?: string; emphasis?: boolean; align?: string }, index: number) {
  if (typeof cell === 'string') return <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{cell}</td>;
  const alignClass = cell.align === 'right' ? 'text-right' : cell.align === 'center' ? 'text-center' : 'text-left';
  if (cell.tone) {
    const toneMap: Record<string, string> = { amber: 'bg-amber-50 text-amber-700 ring-amber-200', green: 'bg-green-50 text-green-700 ring-green-200', gray: 'bg-gray-100 text-gray-700 ring-gray-200', blue: 'bg-blue-50 text-blue-700 ring-blue-200', red: 'bg-red-50 text-red-700 ring-red-200' };
    return <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${alignClass}`}><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${toneMap[cell.tone] || toneMap.gray}`}>{cell.text}</span></td>;
  }
  return <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${cell.emphasis ? 'font-semibold text-gray-900' : 'text-gray-600'} ${alignClass}`}>{cell.text}</td>;
}

export function WorkflowDirectoryClient() {
  const [data, setData] = useState<WorkflowDirectoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({ entityTypes: [], activeStates: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [draftFilters, setDraftFilters] = useState<FilterState>({ entityTypes: [], activeStates: [] });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const filterCount = filters.entityTypes.length + filters.activeStates.length;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [createErr, setCreateErr] = useState<string | null>(null);
  const [formState, setFormState] = useState({ workflowCode: '', name: '', entityType: '', isActive: true, notes: '' });
  const [formSteps, setFormSteps] = useState<StepFormItem[]>([{ label: '', approverUserId: '', approverRole: '' }]);

  const [viewDetail, setViewDetail] = useState<WorkflowDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);

  const [editDetailId, setEditDetailId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editErr, setEditErr] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteCode, setDeleteCode] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);

  const fetchData = useCallback(async ({ search, page, nextFilters, nextQuickFilters }: { search: string; page: number; nextFilters: FilterState; nextQuickFilters: string[] }) => {
    setIsLoading(true); setError(null);
    try {
      const r = await getWorkflowDirectory({ search, page, entityTypes: nextFilters.entityTypes, activeStates: nextFilters.activeStates, quickFilters: nextQuickFilters });
      setData(r);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load workflow directory.'); } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { void fetchData({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters }); }, [filters, currentPage, quickFilters, submittedSearch, fetchData]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSubmittedSearch(searchInput); setCurrentPage(1); fetchData({ search: searchInput, page: 1, nextFilters: filters, nextQuickFilters: quickFilters }); };
  const handleRefresh = () => { fetchData({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters }); };
  const handleToggleQuickFilter = (value: string) => { setQuickFilters((prev) => toggleFilterValue(prev, value)); setCurrentPage(1); };
  const handleExport = () => {
    const rows = data?.section.table.rows; if (!rows?.length) return;
    const headers = ['Workflow Code', 'Name', 'Entity Type', 'Active', 'Step Count', 'Notes'];
    const csvRows = rows.map((r) => [r.workflowCode || '-', r.name || '-', r.entityTypeLabel, r.activeLabel, String(r.stepCount), r.notes || '-']);
    const csvContent = [headers.map((h) => escapeCsvValue(h)), ...csvRows.map((r) => r.map((c) => escapeCsvValue(c)))].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'workflow-directory.csv'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const handleOpenCreate = () => {
    setFormState({ workflowCode: '', name: '', entityType: '', isActive: true, notes: '' });
    setFormSteps([{ label: '', approverUserId: '', approverRole: '' }]);
    setCreateErr(null);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setCreateErr(null); setIsCreateSubmitting(true);
    try {
      await createWorkflow({
        workflowCode: formState.workflowCode,
        name: formState.name,
        entityType: formState.entityType,
        isActive: formState.isActive,
        steps: formSteps.filter((s) => s.label || s.approverUserId || s.approverRole),
        notes: formState.notes,
      });
      setIsCreateOpen(false); handleRefresh();
    } catch (err) { setCreateErr(err instanceof Error ? err.message : 'An error occurred'); } finally { setIsCreateSubmitting(false); }
  };

  const handleView = async (id: string) => {
    setIsViewOpen(true); setIsViewLoading(true); setViewDetail(null);
    try { const d = await getWorkflowDetail(id); setViewDetail(d); } catch (e) { console.error(e); } finally { setIsViewLoading(false); }
  };

  const handleOpenEdit = async (id: string) => {
    setIsEditOpen(true); setEditErr(null); setEditDetailId(id); setIsViewLoading(true); setViewDetail(null);
    try {
      const d = await getWorkflowDetail(id); setViewDetail(d);
      setFormState({
        workflowCode: d.workflowCode || '',
        name: d.name || '',
        entityType: d.entityType || '',
        isActive: d.isActive,
        notes: d.notes || '',
      });
      setFormSteps(d.steps.length > 0 ? d.steps.map((s) => ({ label: s.label, approverUserId: s.approverUser?.id || '', approverRole: s.approverRole })) : [{ label: '', approverUserId: '', approverRole: '' }]);
    } catch (e) { setEditErr(e instanceof Error ? e.message : 'Unable to load details.'); } finally { setIsViewLoading(false); }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editDetailId) return; setEditErr(null); setIsEditSubmitting(true);
    try {
      await updateWorkflow(editDetailId, {
        workflowCode: formState.workflowCode,
        name: formState.name,
        entityType: formState.entityType,
        isActive: formState.isActive,
        steps: formSteps.filter((s) => s.label || s.approverUserId || s.approverRole),
        notes: formState.notes,
      });
      setIsEditOpen(false); handleRefresh();
    } catch (err) { setEditErr(err instanceof Error ? err.message : 'An error occurred'); } finally { setIsEditSubmitting(false); }
  };

  const handleOpenDelete = (id: string, code: string) => { setDeleteId(id); setDeleteCode(code); setIsDeleteOpen(true); setDeleteErr(null); };
  const handleCloseDelete = () => { setIsDeleteOpen(false); setDeleteId(null); setDeleteCode(''); };
  const handleConfirmDelete = async () => {
    if (!deleteId) return; setIsDeleteSubmitting(true); setDeleteErr(null);
    try { await deleteWorkflow(deleteId); setIsDeleteOpen(false); handleRefresh(); } catch (err) { setDeleteErr(err instanceof Error ? err.message : 'Unable to delete.'); } finally { setIsDeleteSubmitting(false); }
  };

  const userOptions = data?.referenceData?.users || [];
  const entityTypeOptions = data?.referenceData?.entityTypes || [];

  const addStep = () => setFormSteps((prev) => [...prev, { label: '', approverUserId: '', approverRole: '' }]);
  const removeStep = (index: number) => setFormSteps((prev) => prev.filter((_, i) => i !== index));
  const updateStep = (index: number, field: keyof StepFormItem, value: string) => setFormSteps((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));

  const renderStepForm = () => (
    <div className="space-y-3">
      {formSteps.map((step, index) => (
        <div key={index} className="rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Step {index + 1}</span>
            {formSteps.length > 1 && <button type="button" onClick={() => removeStep(index)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>}
          </div>
          <FormField label="Step Label"><Input value={step.label} onChange={(v) => updateStep(index, 'label', v)} placeholder="e.g. Initial Review" /></FormField>
          <FormField label="Approver User">
            <Select value={step.approverUserId} onChange={(v) => updateStep(index, 'approverUserId', v)} options={[{ label: 'Select a user', value: '' }, ...userOptions.map((u) => ({ label: `${u.label}${u.email ? ` (${u.email})` : ''}`, value: u.id }))]} />
          </FormField>
          <FormField label="Approver Role"><Input value={step.approverRole} onChange={(v) => updateStep(index, 'approverRole', v)} placeholder="e.g. Accounting Manager" /></FormField>
        </div>
      ))}
      <button type="button" onClick={addStep} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><Plus className="h-4 w-4" /> Add Step</button>
    </div>
  );

  return (
    <div className="space-y-6 p-[10px]">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">Workflow Directory</h2>
          <p className="text-sm text-gray-600">Review reusable approval workflow definitions by workflow code, name, entity type, active state, and step count.</p>
          <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}><RefreshCw className="h-4 w-4" /> Refresh Workflows</button>
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}><Plus className="h-4 w-4" /> New Workflow</button>
        </div>
      </div>

      {data?.section.metrics && data.section.metrics.length > 0 ? (<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{data.section.metrics.map((m) => (<div key={m.id}><MetricCard label={m.label} value={m.value} change={m.change} trend={m.trend} /></div>))}</div>) : null}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <form onSubmit={handleSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder={data?.section.searchPlaceholder || 'Search workflow code, name, entity type, or notes'} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"><Search className="h-4 w-4" /> Search</button>
            </form>
            <button type="button" onClick={() => { if (!isFilterPanelOpen) setDraftFilters({ ...filters }); setIsFilterPanelOpen((p) => !p); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isFilterPanelOpen || filterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}><Filter className="h-4 w-4" /> Filters{filterCount > 0 && <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{filterCount}</span>}</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(() => { const qf = data?.section?.filters?.quickFilters; if (qf && qf.length > 0) return qf.map((f) => <button key={f.value} type="button" onClick={() => handleToggleQuickFilter(f.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${quickFilters.includes(f.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{f.label}</button>); return null; })()}
          </div>
        </div>

        <div className="space-y-4 p-[10px] sm:p-5">
          {isFilterPanelOpen && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div><h4 className="text-sm font-semibold text-gray-900">Filters</h4><p className="mt-1 text-sm text-gray-600">Select as many filter values as needed, then apply them in one step.</p></div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => { setDraftFilters({ entityTypes: [], activeStates: [] }); setFilters({ entityTypes: [], activeStates: [] }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Clear all</button>
                  <button type="button" onClick={() => { setDraftFilters({ ...filters }); setIsFilterPanelOpen(false); }} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="button" onClick={() => { setFilters({ ...draftFilters }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button>
                </div>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Entity Type</h5>
                  <div className="mt-3 flex flex-wrap gap-2">{(data?.section?.filters?.entityTypes || []).map((opt) => { const isSelected = draftFilters.entityTypes.includes(opt.value); return <button key={opt.value} type="button" onClick={() => setDraftFilters((p) => ({ ...p, entityTypes: toggleFilterValue(p.entityTypes, opt.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{opt.label}</button>; })}</div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Active State</h5>
                  <div className="mt-3 flex flex-wrap gap-2">{(data?.section?.filters?.activeStates || []).map((opt) => { const isSelected = draftFilters.activeStates.includes(opt.value); return <button key={opt.value} type="button" onClick={() => setDraftFilters((p) => ({ ...p, activeStates: toggleFilterValue(p.activeStates, opt.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{opt.label}</button>; })}</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">Approval Workflow Directory</h3>
              <p className="text-sm text-gray-600">Workflow register aligned to approvalWorkflows, showing workflow code, entity type, active state, and configured step count.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span>{data?.totals.filteredRows ?? 0} matching rows</span>
              <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!(data?.section.table.rows.length)}><Download className="h-4 w-4" /> Download View</button>
            </div>
          </div>

          {error && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
          {isLoading ? <LoadingSkeleton /> : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Workflow Code</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Entity Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Active</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Step Count</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Notes</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {(data?.section.table.rows ?? []).length > 0 ? (data?.section.table.rows ?? []).map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          {row.cells.map((cell, index) => renderCell(cell, index))}
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => handleView(row.workflowId)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail"><Eye className="h-4 w-4" /></button>
                              <button type="button" onClick={() => handleOpenEdit(row.workflowId)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="Edit"><Edit className="h-4 w-4" /></button>
                              <button type="button" onClick={() => handleOpenDelete(row.workflowId, row.workflowCode || 'Workflow')} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700" title="Delete"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      )) : (<tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">No workflow records found.</td></tr>)}
                    </tbody>
                  </table>
                </div>
              </div>
              {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Page {data.pagination.page} of {data.pagination.totalPages}</p>
                  <div className="flex gap-2">
                    <button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button>
                    <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((p) => p + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <SlideOver isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Workflow" description="Create a new approval workflow definition.">
        <form onSubmit={handleCreateSubmit} className="space-y-6">
          {createErr && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{createErr}</div>}
          <div className="space-y-4">
            <FormField label="Workflow Code" required><Input value={formState.workflowCode} onChange={(v) => setFormState({ ...formState, workflowCode: v })} placeholder="e.g. WF-INV-001" required /></FormField>
            <FormField label="Workflow Name" required><Input value={formState.name} onChange={(v) => setFormState({ ...formState, name: v })} placeholder="e.g. Invoice Revenue Review" required /></FormField>
            <FormField label="Entity Type" required>
              <Select value={formState.entityType} onChange={(v) => setFormState({ ...formState, entityType: v })} options={[{ label: 'Select an entity type', value: '' }, ...entityTypeOptions.map((o) => ({ label: o.label, value: o.value }))]} />
            </FormField>
            <FormField label="Status" required>
              <Select value={formState.isActive ? 'true' : 'false'} onChange={(v) => setFormState({ ...formState, isActive: v === 'true' })} options={[{ label: 'Active', value: 'true' }, { label: 'Inactive', value: 'false' }]} />
            </FormField>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Approval Steps</h4>
              <p className="mt-1 text-sm text-gray-600">Define the approval chain. Step numbers are assigned automatically.</p>
              <div className="mt-4">{renderStepForm()}</div>
            </div>
            <FormField label="Notes"><TextArea value={formState.notes} onChange={(v) => setFormState({ ...formState, notes: v })} rows={3} /></FormField>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setIsCreateOpen(false)} disabled={isCreateSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isCreateSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>{isCreateSubmitting ? 'Creating...' : 'Create Workflow'}</button>
          </div>
        </form>
      </SlideOver>

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Workflow Detail" description="View full workflow definition and step configuration.">
        <div className="space-y-6">
          {isViewLoading ? <LoadingSkeleton /> : viewDetail ? (
            <div className="space-y-6">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Workflow Code</span><span className="text-sm font-medium text-gray-900">{viewDetail.workflowCode}</span></div>
                <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Name</span><span className="text-sm font-medium text-gray-900">{viewDetail.name}</span></div>
                <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Entity Type</span><span className="text-sm font-medium text-gray-900">{viewDetail.entityType}</span></div>
                <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Active</span><span className="text-sm font-medium text-gray-900">{viewDetail.isActive ? 'Yes' : 'No'}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">Notes</span><span className="text-right text-sm font-medium text-gray-900">{viewDetail.notes || '-'}</span></div>
              </div>
              {viewDetail.steps.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900">Approval Steps ({viewDetail.steps.length})</h4>
                  {viewDetail.steps.map((step, i) => (
                    <div key={i} className="rounded-lg border border-gray-200 p-4 space-y-2">
                      <div className="flex justify-between"><span className="text-sm text-gray-500">Step {step.stepNumber}</span><span className="text-sm font-medium text-gray-900">{step.label || '-'}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-500">Approver</span><span className="text-sm font-medium text-gray-900">{step.approverUser?.label || '-'}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-500">Role</span><span className="text-sm font-medium text-gray-900">{step.approverRole || '-'}</span></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : <p className="text-sm text-gray-500">No details available.</p>}
          <div className="flex justify-end pt-4"><button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Close</button></div>
        </div>
      </SlideOver>

      <SlideOver isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Workflow" description="Modify the approval workflow definition.">
        <form onSubmit={handleEditSubmit} className="space-y-6">
          {isViewLoading ? <LoadingSkeleton /> : (
            <>
              {editErr && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{editErr}</div>}
              <div className="space-y-4">
                <FormField label="Workflow Code" required><Input value={formState.workflowCode} onChange={(v) => setFormState({ ...formState, workflowCode: v })} placeholder="e.g. WF-INV-001" required /></FormField>
                <FormField label="Workflow Name" required><Input value={formState.name} onChange={(v) => setFormState({ ...formState, name: v })} placeholder="e.g. Invoice Revenue Review" required /></FormField>
                <FormField label="Entity Type" required>
                  <Select value={formState.entityType} onChange={(v) => setFormState({ ...formState, entityType: v })} options={[{ label: 'Select an entity type', value: '' }, ...entityTypeOptions.map((o) => ({ label: o.label, value: o.value }))]} />
                </FormField>
                <FormField label="Status" required>
                  <Select value={formState.isActive ? 'true' : 'false'} onChange={(v) => setFormState({ ...formState, isActive: v === 'true' })} options={[{ label: 'Active', value: 'true' }, { label: 'Inactive', value: 'false' }]} />
                </FormField>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Approval Steps</h4>
                  <p className="mt-1 text-sm text-gray-600">Define the approval chain. Step numbers are assigned automatically.</p>
                  <div className="mt-4">{renderStepForm()}</div>
                </div>
                <FormField label="Notes"><TextArea value={formState.notes} onChange={(v) => setFormState({ ...formState, notes: v })} rows={3} /></FormField>
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
                <button type="button" onClick={() => setIsEditOpen(false)} disabled={isEditSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isEditSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>{isEditSubmitting ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </>
          )}
        </form>
      </SlideOver>

      <SlideOver isOpen={isDeleteOpen} onClose={handleCloseDelete} title="Delete Workflow" description="Remove this approval workflow permanently.">
        <div className="space-y-6">
          {deleteErr && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{deleteErr}</div>}
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><p className="font-medium">Are you sure?</p><p className="mt-1">This action cannot be undone. Workflow "{deleteCode}" will be permanently removed. If existing approval requests reference this workflow, deletion will be blocked.</p></div>
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={handleCloseDelete} disabled={isDeleteSubmitting} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleteSubmitting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">{isDeleteSubmitting ? 'Deleting...' : 'Delete Workflow'}</button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
