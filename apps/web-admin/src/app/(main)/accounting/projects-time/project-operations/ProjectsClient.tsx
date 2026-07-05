'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, ArrowDownRight, ArrowUpRight, Download, Edit, Eye, Filter, Plus, RefreshCw, Search, Trash2, Wallet, X } from 'lucide-react';
import { getProjects, getProjectDetail, createProject, updateProject, deleteProject, type ProjectsResponse, type ProjectDetail, type PmMetric } from './actions';

type FilterState = { statuses: string[]; projectTypes: string[] };
type ProjectFormState = { projectCode: string; name: string; status: string; projectType: string; customerId: string; managerUserId: string; courseId: string; startDate: string; endDate: string; branchId: string; departmentId: string; locationId: string; budgetAmount: string; notes: string };

function getActionClasses(v: 'primary' | 'secondary' | 'ghost' = 'secondary') { if (v === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700'; if (v === 'ghost') return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'; return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'; }
function getMetricTone(t: PmMetric['trend']) { if (t === 'down') return 'text-red-600 bg-red-50'; if (t === 'neutral') return 'text-gray-600 bg-gray-100'; return 'text-green-600 bg-green-50'; }
function escapeCsvValue(v: string | number | boolean | null | undefined) { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }
function toggleFilterValue(values: string[], value: string) { return values.includes(value) ? values.filter((v) => v !== value) : [...values, value]; }

function SlideOver({ isOpen, onClose, title, description, children }: { isOpen: boolean; onClose: () => void; title: string; description?: string; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false); const [animate, setAnimate] = useState(false);
  useEffect(() => { if (isOpen) { setMounted(true); requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true))); } else { setAnimate(false); const timer = setTimeout(() => setMounted(false), 300); return () => clearTimeout(timer); } }, [isOpen]);
  if (!mounted) return null;
  return createPortal(<div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ease-in-out ${animate ? 'bg-black/50' : 'bg-transparent'}`} onClick={onClose}><div className={`flex w-full max-w-lg flex-col bg-white shadow-xl transition-all duration-300 ease-in-out ${animate ? 'translate-x-0' : 'translate-x-full'}`} onClick={(e) => e.stopPropagation()}><div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4"><div><h3 className="text-lg font-semibold text-gray-900">{title}</h3>{description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}</div><button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X className="h-5 w-5" /></button></div><div className="flex-1 overflow-y-auto px-6 py-4">{children}</div></div></div>, document.body);
}

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) { return <div className="space-y-1.5"><label className="block text-sm font-medium text-gray-700">{label}{required && <span className="ml-0.5 text-red-500">*</span>}</label>{children}</div>; }
function Input({ value, onChange, placeholder, type = 'text', required }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean }) { return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />; }
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: Array<{ label: string; value: string }> }) { return <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>; }
function TextArea({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) { return <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />; }

function MetricCard({ label, value, change, trend = 'neutral' }: { label: string; value: string | number; change: string; trend?: 'up' | 'down' | 'neutral' }) { const TrendIcon = trend === 'down' ? ArrowDownRight : ArrowUpRight; return <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-gray-500">{label}</p><p className="mt-3 text-2xl font-bold text-gray-900">{value}</p></div><div className="rounded-lg bg-gray-100 p-3 text-gray-600"><Wallet className="h-5 w-5" /></div></div><div className="mt-4 flex items-center gap-2"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${getMetricTone(trend)}`}><TrendIcon className="h-3.5 w-3.5" />{change}</span></div></div>; }

function LoadingSkeleton() { return <div className="space-y-4"><div className="overflow-hidden rounded-xl border border-gray-200"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{Array.from({ length: 6 }).map((_, i) => <th key={i} className="px-4 py-3"><div className="h-4 w-24 animate-pulse rounded bg-gray-200" /></th>)}</tr></thead><tbody className="divide-y divide-gray-200 bg-white">{Array.from({ length: 5 }).map((_, i) => (<tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-6 animate-pulse rounded bg-gray-100" /></td></tr>))}</tbody></table></div></div></div>; }

function renderCell(cell: string | { text: string; tone?: string; emphasis?: boolean; align?: string }, index: number) {
  if (typeof cell === 'string') return <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{cell}</td>;
  const alignClass = cell.align === 'right' ? 'text-right' : cell.align === 'center' ? 'text-center' : 'text-left';
  if (cell.tone) { const toneMap: Record<string, string> = { amber: 'bg-amber-50 text-amber-700 ring-amber-200', green: 'bg-green-50 text-green-700 ring-green-200', gray: 'bg-gray-100 text-gray-700 ring-gray-200', blue: 'bg-blue-50 text-blue-700 ring-blue-200', red: 'bg-red-50 text-red-700 ring-red-200' }; return <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${alignClass}`}><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${toneMap[cell.tone] || toneMap.gray}`}>{cell.text}</span></td>; }
  return <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${cell.emphasis ? 'font-semibold text-gray-900' : 'text-gray-600'} ${alignClass}`}>{cell.text}</td>;
}

function makeEmptyForm(): ProjectFormState { return { projectCode: '', name: '', status: 'draft', projectType: 'internal', customerId: '', managerUserId: '', courseId: '', startDate: '', endDate: '', branchId: '', departmentId: '', locationId: '', budgetAmount: '0', notes: '' }; }

function buildForm(d: ProjectDetail): ProjectFormState { return { projectCode: d.projectCode || '', name: d.name || '', status: d.status || 'draft', projectType: d.projectType || 'internal', customerId: d.customerId || '', managerUserId: d.managerUserId || '', courseId: d.courseId || '', startDate: d.startDate ? d.startDate.slice(0, 10) : '', endDate: d.endDate ? d.endDate.slice(0, 10) : '', branchId: d.branchId || '', departmentId: d.departmentId || '', locationId: d.locationId || '', budgetAmount: String(d.budgetAmount || 0), notes: d.notes || '' }; }

function FormSection({ title, children }: { title: string; children: React.ReactNode }) { return <div className="space-y-3"><h4 className="text-sm font-semibold text-gray-900">{title}</h4>{children}</div>; }

export function ProjectsClient() {
  const [data, setData] = useState<ProjectsResponse | null>(null);
  const [error, setError] = useState<string | null>(null); const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(''); const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({ statuses: [], projectTypes: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [draftFilters, setDraftFilters] = useState<FilterState>({ statuses: [], projectTypes: [] });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const filterCount = filters.statuses.length + filters.projectTypes.length;

  const [isCreateOpen, setIsCreateOpen] = useState(false); const [isCreateSubmitting, setIsCreateSubmitting] = useState(false); const [createErr, setCreateErr] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectFormState>(makeEmptyForm());

  const [viewDetail, setViewDetail] = useState<ProjectDetail | null>(null); const [isViewOpen, setIsViewOpen] = useState(false); const [isViewLoading, setIsViewLoading] = useState(false);

  const [editId, setEditId] = useState<string | null>(null); const [isEditOpen, setIsEditOpen] = useState(false); const [isEditSubmitting, setIsEditSubmitting] = useState(false); const [editErr, setEditErr] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null); const [deleteCode, setDeleteCode] = useState(''); const [isDeleteOpen, setIsDeleteOpen] = useState(false); const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false); const [deleteErr, setDeleteErr] = useState<string | null>(null);

  const fetchData = useCallback(async ({ search, page, nextFilters, nextQuickFilters }: { search: string; page: number; nextFilters: FilterState; nextQuickFilters: string[] }) => { setIsLoading(true); setError(null); try { const r = await getProjects({ search, page, statuses: nextFilters.statuses, projectTypes: nextFilters.projectTypes, quickFilters: nextQuickFilters }); setData(r); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load projects.'); } finally { setIsLoading(false); } }, []);
  useEffect(() => { void fetchData({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters }); }, [filters, currentPage, quickFilters, submittedSearch, fetchData]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSubmittedSearch(searchInput); setCurrentPage(1); fetchData({ search: searchInput, page: 1, nextFilters: filters, nextQuickFilters: quickFilters }); };
  const handleRefresh = () => { fetchData({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters }); };
  const handleToggleQuickFilter = (v: string) => { setQuickFilters((p) => toggleFilterValue(p, v)); setCurrentPage(1); };
  const handleExport = () => { const rows = data?.section.table.rows; if (!rows?.length) return; const headers = ['Project Code', 'Name', 'Customer', 'Manager', 'Type', 'Status']; const csvRows = rows.map((r) => [r.projectCode, r.name, r.customerLabel, r.managerLabel, r.projectTypeLabel, r.statusLabel]); const c = [headers.map(escapeCsvValue), ...csvRows.map((r) => r.map(escapeCsvValue))].map((r) => r.join(',')).join('\n'); const b = new Blob([c], { type: 'text/csv;charset=utf-8;' }); const u = URL.createObjectURL(b); const l = document.createElement('a'); l.href = u; l.download = 'projects.csv'; document.body.appendChild(l); l.click(); document.body.removeChild(l); URL.revokeObjectURL(u); };

  const handleOpenCreate = () => { setForm(makeEmptyForm()); setCreateErr(null); setIsCreateOpen(true); };
  const handleCreateSubmit = async (e: React.FormEvent) => { e.preventDefault(); setCreateErr(null); setIsCreateSubmitting(true); try { await createProject({ projectCode: form.projectCode || undefined, name: form.name, status: form.status, projectType: form.projectType, customerId: form.customerId || undefined, managerUserId: form.managerUserId || undefined, courseId: form.courseId || undefined, startDate: form.startDate || undefined, endDate: form.endDate || undefined, branchId: form.branchId || undefined, departmentId: form.departmentId || undefined, locationId: form.locationId || undefined, budgetAmount: Number(form.budgetAmount) || undefined, notes: form.notes || undefined }); setIsCreateOpen(false); handleRefresh(); } catch (err) { setCreateErr(err instanceof Error ? err.message : 'An error occurred'); } finally { setIsCreateSubmitting(false); } };

  const handleView = async (id: string) => { setIsViewOpen(true); setIsViewLoading(true); setViewDetail(null); try { setViewDetail(await getProjectDetail(id)); } catch (e) { console.error(e); } finally { setIsViewLoading(false); } };
  const handleOpenEdit = async (id: string) => { setIsEditOpen(true); setEditErr(null); setEditId(id); setIsViewLoading(true); setViewDetail(null); try { const d = await getProjectDetail(id); setViewDetail(d); setForm(buildForm(d)); } catch (e) { setEditErr(e instanceof Error ? e.message : 'Unable to load details.'); } finally { setIsViewLoading(false); } };
  const handleEditSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!editId) return; setEditErr(null); setIsEditSubmitting(true); try { await updateProject(editId, { projectCode: form.projectCode || undefined, name: form.name, status: form.status, projectType: form.projectType, customerId: form.customerId || undefined, managerUserId: form.managerUserId || undefined, courseId: form.courseId || undefined, startDate: form.startDate || undefined, endDate: form.endDate || undefined, branchId: form.branchId || undefined, departmentId: form.departmentId || undefined, locationId: form.locationId || undefined, budgetAmount: Number(form.budgetAmount) || undefined, notes: form.notes || undefined }); setIsEditOpen(false); handleRefresh(); } catch (err) { setEditErr(err instanceof Error ? err.message : 'An error occurred'); } finally { setIsEditSubmitting(false); } };

  const handleOpenDelete = (id: string, code: string) => { setDeleteId(id); setDeleteCode(code); setIsDeleteOpen(true); setDeleteErr(null); };
  const handleCloseDelete = () => { setIsDeleteOpen(false); setDeleteId(null); setDeleteCode(''); };
  const handleConfirmDelete = async () => { if (!deleteId) return; setIsDeleteSubmitting(true); setDeleteErr(null); try { await deleteProject(deleteId); setIsDeleteOpen(false); handleRefresh(); } catch (err) { setDeleteErr(err instanceof Error ? err.message : 'Unable to delete.'); } finally { setIsDeleteSubmitting(false); } };

  const rd = data?.referenceData;
  const custOpts = [{ label: 'None', value: '' }, ...(rd?.customers || []).map((c) => ({ label: `${c.code ? `${c.code} - ` : ''}${c.label}`, value: c.id }))];
  const userOpts = [{ label: 'None', value: '' }, ...(rd?.users || []).map((u) => ({ label: u.label, value: u.id }))];
  const courseOpts = [{ label: 'None', value: '' }, ...(rd?.courses || []).map((c) => ({ label: c.label, value: c.id }))];
  const branchOpts = [{ label: 'None', value: '' }, ...(rd?.branches || []).map((b) => ({ label: b.label, value: b.id }))];
  const deptOpts = [{ label: 'None', value: '' }, ...(rd?.departments || []).map((d) => ({ label: d.label, value: d.id }))];
  const locOpts = [{ label: 'None', value: '' }, ...(rd?.locations || []).map((l) => ({ label: l.label, value: l.id }))];
  const statusOpts = rd?.statusOptions || [];
  const typeOpts = rd?.typeOptions || [];

  const renderForm = () => (<>
    <FormSection title="Basic Information">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Project Code"><Input value={form.projectCode} onChange={(v) => setForm({ ...form, projectCode: v })} placeholder="Auto-generated if empty" /></FormField>
        <FormField label="Status" required><Select value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={statusOpts} /></FormField>
      </div>
      <FormField label="Name" required><Input value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Project name" required /></FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Project Type" required><Select value={form.projectType} onChange={(v) => setForm({ ...form, projectType: v })} options={typeOpts} /></FormField>
        <FormField label="Course"><Select value={form.courseId} onChange={(v) => setForm({ ...form, courseId: v })} options={courseOpts} /></FormField>
      </div>
    </FormSection>
    <FormSection title="Relationships">
      <FormField label="Customer"><Select value={form.customerId} onChange={(v) => setForm({ ...form, customerId: v })} options={custOpts} /></FormField>
      <FormField label="Manager"><Select value={form.managerUserId} onChange={(v) => setForm({ ...form, managerUserId: v })} options={userOpts} /></FormField>
    </FormSection>
    <FormSection title="Dates">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Start Date"><Input type="date" value={form.startDate} onChange={(v) => setForm({ ...form, startDate: v })} /></FormField>
        <FormField label="End Date"><Input type="date" value={form.endDate} onChange={(v) => setForm({ ...form, endDate: v })} /></FormField>
      </div>
    </FormSection>
    <FormSection title="Dimensions">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Branch"><Select value={form.branchId} onChange={(v) => setForm({ ...form, branchId: v })} options={branchOpts} /></FormField>
        <FormField label="Department"><Select value={form.departmentId} onChange={(v) => setForm({ ...form, departmentId: v })} options={deptOpts} /></FormField>
      </div>
      <FormField label="Location"><Select value={form.locationId} onChange={(v) => setForm({ ...form, locationId: v })} options={locOpts} /></FormField>
    </FormSection>
    <FormSection title="Finance">
      <FormField label="Budget Amount (PHP)"><Input type="number" value={form.budgetAmount} onChange={(v) => setForm({ ...form, budgetAmount: v })} placeholder="0" /></FormField>
    </FormSection>
    <FormField label="Notes"><TextArea value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} rows={3} /></FormField>
  </>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1"><h2 className="text-lg font-semibold text-gray-900">Projects</h2><p className="text-sm text-gray-600">Review project finance overlays using project code, status, customer, manager, project type, linked course, dimensions, and budget amount.</p><p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p></div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}><RefreshCw className="h-4 w-4" /> Refresh Projects</button>
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}><Plus className="h-4 w-4" /> New Project</button>
        </div>
      </div>

      {data?.section.metrics && data.section.metrics.length > 0 ? (<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{data.section.metrics.map((m) => (<div key={m.id}><MetricCard label={m.label} value={m.value} change={m.change} trend={m.trend} /></div>))}</div>) : null}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <form onSubmit={handleSearch} className="flex min-w-0 max-w-xl flex-1 gap-3"><div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input type="text" placeholder={data?.section.searchPlaceholder || 'Search projects'} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div><button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"><Search className="h-4 w-4" /> Search</button></form>
            <button type="button" onClick={() => { if (!isFilterPanelOpen) setDraftFilters({ ...filters }); setIsFilterPanelOpen((p) => !p); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isFilterPanelOpen || filterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}><Filter className="h-4 w-4" /> Filters{filterCount > 0 && <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{filterCount}</span>}</button>
          </div>
          <div className="flex flex-wrap gap-2">{(() => { const qf = data?.section?.filters?.quickFilters; if (qf && qf.length > 0) return qf.map((f) => <button key={f.value} type="button" onClick={() => handleToggleQuickFilter(f.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${quickFilters.includes(f.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{f.label}</button>); return null; })()}</div>
        </div>

        <div className="space-y-4 p-5">
          {isFilterPanelOpen && (<div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><h4 className="text-sm font-semibold text-gray-900">Filters</h4><p className="mt-1 text-sm text-gray-600">Select as many filter values as needed, then apply them in one step.</p></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => { setDraftFilters({ statuses: [], projectTypes: [] }); setFilters({ statuses: [], projectTypes: [] }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Clear all</button><button type="button" onClick={() => { setDraftFilters({ ...filters }); setIsFilterPanelOpen(false); }} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button><button type="button" onClick={() => { setFilters({ ...draftFilters }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button></div></div><div className="mt-6 grid gap-6 md:grid-cols-2"><div><h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</h5><div className="mt-3 flex flex-wrap gap-2">{(data?.section?.filters?.statuses || []).map((opt) => { const s = draftFilters.statuses.includes(opt.value); return <button key={opt.value} type="button" onClick={() => setDraftFilters((p) => ({ ...p, statuses: toggleFilterValue(p.statuses, opt.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${s ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{opt.label}</button>; })}</div></div><div><h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Project Type</h5><div className="mt-3 flex flex-wrap gap-2">{(data?.section?.filters?.projectTypes || []).map((opt) => { const s = draftFilters.projectTypes.includes(opt.value); return <button key={opt.value} type="button" onClick={() => setDraftFilters((p) => ({ ...p, projectTypes: toggleFilterValue(p.projectTypes, opt.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${s ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{opt.label}</button>; })}</div></div></div></div>)}

          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div className="space-y-2"><h3 className="text-base font-semibold text-gray-900">Project Register</h3><p className="text-sm text-gray-600">Project records aligned to accounting-projects, including customer, manager, project type, course relationship, and budget amount.</p></div><div className="flex flex-wrap items-center gap-3 text-sm text-gray-500"><span>{data?.totals.filteredRows ?? 0} matching rows</span><button type="button" onClick={handleExport} disabled={!(data?.section.table.rows.length)} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"><Download className="h-4 w-4" /> Download View</button></div></div>

          {error && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
          {isLoading ? <LoadingSkeleton /> : (<>
            <div className="overflow-hidden rounded-xl border border-gray-200"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Project Code</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Name</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Customer</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Manager</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Type</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th></tr></thead><tbody className="divide-y divide-gray-200 bg-white">{(data?.section.table.rows ?? []).length > 0 ? (data?.section.table.rows ?? []).map((row) => (<tr key={row.id} className="hover:bg-gray-50">{row.cells.map((cell, index) => renderCell(cell, index))}<td className="px-4 py-3 text-right"><div className="flex justify-end gap-2"><button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail"><Eye className="h-4 w-4" /></button><button type="button" onClick={() => handleOpenEdit(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="Edit"><Edit className="h-4 w-4" /></button><button type="button" onClick={() => handleOpenDelete(row.id, row.projectCode || 'Project')} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700" title="Delete"><Trash2 className="h-4 w-4" /></button></div></td></tr>)) : (<tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">No project records found.</td></tr>)}</tbody></table></div></div>
            {data?.pagination && data.pagination.totalPages > 1 && (<div className="flex items-center justify-between"><p className="text-sm text-gray-600">Page {data.pagination.page} of {data.pagination.totalPages}</p><div className="flex gap-2"><button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button><button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((p) => p + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button></div></div>)}
          </>)}
        </div>
      </div>

      <SlideOver isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="New Project" description="Create a new project overlay record for finance tracking.">
        <form onSubmit={handleCreateSubmit} className="space-y-6">{createErr && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{createErr}</div>}{renderForm()}<div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4"><button type="button" onClick={() => setIsCreateOpen(false)} disabled={isCreateSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">Cancel</button><button type="submit" disabled={isCreateSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>{isCreateSubmitting ? 'Creating...' : 'Create Project'}</button></div></form>
      </SlideOver>

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Project Detail" description="View full project record including dimensions and relationships.">
        <div className="space-y-6">{isViewLoading ? <LoadingSkeleton /> : viewDetail ? (<div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex justify-between border-b pb-3"><span className="text-sm text-gray-500">Project Code</span><span className="text-sm font-medium text-gray-900">{viewDetail.projectCode}</span></div>
            <div className="flex justify-between border-b pb-3"><span className="text-sm text-gray-500">Name</span><span className="text-sm font-medium text-gray-900">{viewDetail.name}</span></div>
            <div className="flex justify-between border-b pb-3"><span className="text-sm text-gray-500">Status</span><span className="text-sm font-medium text-gray-900">{viewDetail.status}</span></div>
            <div className="flex justify-between border-b pb-3"><span className="text-sm text-gray-500">Project Type</span><span className="text-sm font-medium text-gray-900">{viewDetail.projectType}</span></div>
            <div className="flex justify-between border-b pb-3"><span className="text-sm text-gray-500">Customer</span><span className="text-sm font-medium text-gray-900">{viewDetail.customerLabel}</span></div>
            <div className="flex justify-between border-b pb-3"><span className="text-sm text-gray-500">Manager</span><span className="text-sm font-medium text-gray-900">{viewDetail.managerLabel}</span></div>
            <div className="flex justify-between border-b pb-3"><span className="text-sm text-gray-500">Course</span><span className="text-sm font-medium text-gray-900">{viewDetail.courseLabel}</span></div>
            <div className="flex justify-between border-b pb-3"><span className="text-sm text-gray-500">Start Date</span><span className="text-sm font-medium text-gray-900">{viewDetail.startDateLabel}</span></div>
            <div className="flex justify-between border-b pb-3"><span className="text-sm text-gray-500">End Date</span><span className="text-sm font-medium text-gray-900">{viewDetail.endDateLabel}</span></div>
            <div className="flex justify-between border-b pb-3"><span className="text-sm text-gray-500">Branch</span><span className="text-sm font-medium text-gray-900">{viewDetail.branchLabel}</span></div>
            <div className="flex justify-between border-b pb-3"><span className="text-sm text-gray-500">Department</span><span className="text-sm font-medium text-gray-900">{viewDetail.departmentLabel}</span></div>
            <div className="flex justify-between border-b pb-3"><span className="text-sm text-gray-500">Location</span><span className="text-sm font-medium text-gray-900">{viewDetail.locationLabel}</span></div>
            <div className="flex justify-between border-b pb-3"><span className="text-sm text-gray-500">Budget Amount</span><span className="text-sm font-medium text-gray-900">PHP {viewDetail.budgetAmount?.toLocaleString?.('en-PH', { minimumFractionDigits: 2 }) ?? '0.00'}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">Notes</span><span className="text-right text-sm font-medium text-gray-900">{viewDetail.notes || '-'}</span></div>
          </div>
        </div>) : <p className="text-sm text-gray-500">No details available.</p>}<div className="flex justify-end pt-4"><button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Close</button></div></div>
      </SlideOver>

      <SlideOver isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Project" description="Modify the project overlay record.">
        <form onSubmit={handleEditSubmit} className="space-y-6">{isViewLoading ? <LoadingSkeleton /> : <>{editErr && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{editErr}</div>}{renderForm()}<div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4"><button type="button" onClick={() => setIsEditOpen(false)} disabled={isEditSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">Cancel</button><button type="submit" disabled={isEditSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>{isEditSubmitting ? 'Saving...' : 'Save Changes'}</button></div></>}</form>
      </SlideOver>

      <SlideOver isOpen={isDeleteOpen} onClose={handleCloseDelete} title="Delete Project" description="Remove this project permanently.">
        <div className="space-y-6">{deleteErr && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{deleteErr}</div>}<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><p className="font-medium">Are you sure?</p><p className="mt-1">Project &quot;{deleteCode}&quot; will be permanently removed. If project tasks, invoices, or expenses reference this project, deletion will be blocked.</p></div><div className="flex justify-end gap-3 border-t border-gray-200 pt-4"><button type="button" onClick={handleCloseDelete} disabled={isDeleteSubmitting} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">Cancel</button><button type="button" onClick={handleConfirmDelete} disabled={isDeleteSubmitting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">{isDeleteSubmitting ? 'Deleting...' : 'Delete Project'}</button></div></div>
      </SlideOver>
    </div>
  );
}
