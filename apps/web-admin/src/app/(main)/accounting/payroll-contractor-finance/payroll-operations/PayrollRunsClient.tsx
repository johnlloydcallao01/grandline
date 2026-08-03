'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  createPayrollRun,
  deletePayrollRun,
  getPayrollRunDetail,
  getPayrollRuns,
  postPayrollRun,
  updatePayrollRun,
  type PayrollRunCell,
  type PayrollRunDetail,
  type PayrollRunMetric,
  type PayrollRunMutationInput,
  type PayrollRunsResponse,
} from './actions-payroll-runs';

type FormState = {
  payrollCode: string;
  periodStart: string;
  periodEnd: string;
  paymentDate: string;
  status: string;
  branch: string;
  department: string;
  notes: string;
};

const STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Review', value: 'review' },
  { label: 'Approved', value: 'approved' },
  { label: 'Posted', value: 'posted' },
];

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 dark:border-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800';
  if (variant === 'ghost') return 'border border-transparent bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-300';
  return 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800';
}

function getMetricTone(trend: PayrollRunMetric['trend']) {
  if (trend === 'down') return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30';
  if (trend === 'neutral') return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
  return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30';
}

function escapeCsvValue(v: string) {
  return /[,"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

function toggleFilterValue(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

const fmt = (n: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(n);

function toDateInput(d: string | null | undefined) {
  if (!d) return '';
  const v = String(d).slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  return '';
}

function SlideOver({
  isOpen,
  onClose,
  title,
  description,
  children,
  width = 'max-w-3xl',
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  width?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
      return undefined;
    }
    setAnimate(false);
    const timer = setTimeout(() => setMounted(false), 300);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ease-in-out ${animate ? 'bg-black/50' : 'bg-transparent'}`} onClick={onClose}>
      <div className={`flex h-full w-full ${width} flex-col bg-white dark:bg-[var(--card-background)] shadow-xl transition-all duration-300 ease-in-out ${animate ? 'translate-x-0' : 'translate-x-full'}`} onClick={(event) => event.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            {description ? <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

function MetricCard({ metric }: { metric: PayrollRunMetric }) {
  const TrendIcon = metric.trend === 'down' ? ArrowDownRight : ArrowUpRight;
  const toneClass = getMetricTone(metric.trend);
  return (
    <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{metric.label}</p>
          <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100">{metric.value}</p>
        </div>
        <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-3 text-gray-600 dark:text-gray-400">
          <FileText className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${toneClass}`}>
          <TrendIcon className="h-3.5 w-3.5" />
          {metric.change}
        </span>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 p-6 animate-pulse">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 rounded-xl bg-gray-100 dark:bg-gray-800" />)}
      </div>
      <div className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800 w-1/3" />
      <div className="h-80 rounded-xl bg-gray-100 dark:bg-gray-800" />
    </div>
  );
}

function renderCell(cell: PayrollRunCell, index: number) {
  if (typeof cell === 'string') {
    return <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{cell}</td>;
  }
  const alignClass = cell.align === 'right' ? 'text-right' : cell.align === 'center' ? 'text-center' : 'text-left';
  if (cell.tone) {
    const toneClasses: Record<string, string> = {
      green: 'bg-green-50 text-green-700 ring-green-200 dark:bg-green-950/30 dark:text-green-400 dark:ring-green-800',
      blue: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-800',
      amber: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:ring-amber-800',
      red: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/30 dark:text-red-400 dark:ring-red-800',
      gray: 'bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700',
    };
    return (
      <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${alignClass}`}>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${toneClasses[cell.tone] || toneClasses.gray}`}>
          {cell.text}
        </span>
      </td>
    );
  }
  return (
    <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${cell.emphasis ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'} ${alignClass}`}>
      {cell.text}
    </td>
  );
}

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}{required ? <span className="ml-0.5 text-red-500">*</span> : null}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', required }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean }) {
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 placeholder:text-gray-400" />;
}

function Select({ value, onChange, options, required }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[]; required?: boolean; placeholder?: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} required={required} className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50">
      <option value="">-- Select --</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function TextArea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 placeholder:text-gray-400" />;
}

const META = {
  searchPlaceholder: 'Search payroll code, branch, department, or status',
  columns: ['Payroll Code', 'Period Start', 'Period End', 'Payment Date', 'Status', 'Posted Journal'],
  tableTitle: 'Payroll Run Register',
  tableDescription: 'Run records aligned to the payroll-runs collection with period, payment date, status, and posted journal linkage.',
};

const createEmptyForm = (): FormState => ({
  payrollCode: '',
  periodStart: '',
  periodEnd: '',
  paymentDate: '',
  status: 'draft',
  branch: '',
  department: '',
  notes: '',
});

function buildFormFromDetail(detail: PayrollRunDetail): FormState {
  return {
    payrollCode: String(detail.payrollCode || ''),
    periodStart: toDateInput(detail.periodStart as string | null | undefined),
    periodEnd: toDateInput(detail.periodEnd as string | null | undefined),
    paymentDate: toDateInput(detail.paymentDate as string | null | undefined),
    status: String(detail.status || 'draft'),
    branch: detail.branch ? String((detail.branch as Record<string, unknown>).id || detail.branch) : '',
    department: detail.department ? String((detail.department as Record<string, unknown>).id || detail.department) : '',
    notes: String(detail.notes || ''),
  };
}

function toMutationInput(form: FormState): PayrollRunMutationInput {
  return {
    payrollCode: form.payrollCode || undefined,
    periodStart: form.periodStart,
    periodEnd: form. periodEnd,
    paymentDate: form.paymentDate,
    status: form.status,
    branch: form.branch || null,
    department: form.department || null,
    notes: form.notes || null,
  };
}

function renderForm(
  form: FormState,
  setForm: React.Dispatch<React.SetStateAction<FormState>>,
  referenceData: PayrollRunsResponse['referenceData'],
) {
  const set = (k: keyof FormState) => (v: string) => setForm((prev) => ({ ...prev, [k]: v }));
  return (
    <div className="space-y-4">
      <FormField label="Payroll Code">
        <Input value={form.payrollCode} onChange={set('payrollCode')} placeholder="Auto-generated if empty" />
      </FormField>
      <FormField label="Period Start" required>
        <Input type="date" value={form.periodStart} onChange={set('periodStart')} required />
      </FormField>
      <FormField label="Period End" required>
        <Input type="date" value={form.periodEnd} onChange={set('periodEnd')} required />
      </FormField>
      <FormField label="Payment Date" required>
        <Input type="date" value={form.paymentDate} onChange={set('paymentDate')} required />
      </FormField>
      <FormField label="Status">
        <Select value={form.status} onChange={set('status')} options={STATUS_OPTIONS} />
      </FormField>
      <FormField label="Branch">
        <Select value={form.branch} onChange={set('branch')} options={referenceData.branches.map((b) => ({ label: b.name, value: b.id }))} />
      </FormField>
      <FormField label="Department">
        <Select value={form.department} onChange={set('department')} options={referenceData.departments.map((d) => ({ label: d.name, value: d.id }))} />
      </FormField>
      <FormField label="Notes">
        <TextArea value={form.notes} onChange={set('notes')} placeholder="Optional notes" />
      </FormField>
    </div>
  );
}

function renderDetail(detail: PayrollRunDetail, _referenceData: PayrollRunsResponse['referenceData']) {
  const d = detail as Record<string, unknown>;
  const branch = d.branch as Record<string, unknown> | undefined;
  const department = d.department as Record<string, unknown> | undefined;
  const je = d.postedJournalEntry as Record<string, unknown> | undefined;
  const entries = d.entries as Record<string, unknown>[] | undefined;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><p className="text-xs font-medium text-gray-500 dark:text-gray-400">Payroll Code</p><p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-gray-100">{String(d.payrollCode || '-')}</p></div>
        <div><p className="text-xs font-medium text-gray-500 dark:text-gray-400">Status</p><p className="mt-0.5 text-sm text-gray-900 dark:text-gray-100">{String(d.status || '-')}</p></div>
        <div><p className="text-xs font-medium text-gray-500 dark:text-gray-400">Period Start</p><p className="mt-0.5 text-sm text-gray-900 dark:text-gray-100">{d.periodStart ? String(d.periodStart).slice(0, 10) : '-'}</p></div>
        <div><p className="text-xs font-medium text-gray-500 dark:text-gray-400">Period End</p><p className="mt-0.5 text-sm text-gray-900 dark:text-gray-100">{d.periodEnd ? String(d.periodEnd).slice(0, 10) : '-'}</p></div>
        <div><p className="text-xs font-medium text-gray-500 dark:text-gray-400">Payment Date</p><p className="mt-0.5 text-sm text-gray-900 dark:text-gray-100">{d.paymentDate ? String(d.paymentDate).slice(0, 10) : '-'}</p></div>
        <div><p className="text-xs font-medium text-gray-500 dark:text-gray-400">Branch</p><p className="mt-0.5 text-sm text-gray-900 dark:text-gray-100">{branch ? String(branch.name || '') : '-'}</p></div>
        <div><p className="text-xs font-medium text-gray-500 dark:text-gray-400">Department</p><p className="mt-0.5 text-sm text-gray-900 dark:text-gray-100">{department ? String(department.name || '') : '-'}</p></div>
        <div><p className="text-xs font-medium text-gray-500 dark:text-gray-400">Posted Journal</p><p className="mt-0.5 text-sm text-gray-900 dark:text-gray-100">{je ? String(je.entryNumber || je.id || '') : '-'}</p></div>
      </div>
      <div><p className="text-xs font-medium text-gray-500 dark:text-gray-400">Notes</p><p className="mt-0.5 text-sm text-gray-900 dark:text-gray-100">{d.notes ? String(d.notes) : '-'}</p></div>
      {entries && entries.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payroll Entries ({entries.length})</p>
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-[var(--card-border)]">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-500 dark:text-gray-400">Employee</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-500 dark:text-gray-400">Gross</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-500 dark:text-gray-400">Net</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-500 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {entries.map((e: Record<string, unknown>) => (
                  <tr key={String(e.id)} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{String(e.employeeName || e.employeeCode || '')}</td>
                    <td className="px-3 py-2 text-right text-gray-900 dark:text-gray-100">{fmt(Number(e.grossAmount) || 0)}</td>
                    <td className="px-3 py-2 text-right text-gray-900 dark:text-gray-100">{fmt(Number(e.netAmount) || 0)}</td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{String(e.status || '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

type PanelMode = 'closed' | 'create' | 'edit' | 'view';

export default function PayrollRunsClient() {
  const [data, setData] = useState<PayrollRunsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<PayrollRunDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [form, setForm] = useState<FormState>(createEmptyForm());
  const [panelMode, setPanelMode] = useState<PanelMode>('closed');
  const [panelTitle, setPanelTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [postingId, setPostingId] = useState<string | null>(null);
  const fetchData = useCallback(async (query?: { search?: string; page?: number; statuses?: string[]; quickFilters?: string[] }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPayrollRuns(query || { search, page, quickFilters });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payroll runs.');
    } finally {
      setLoading(false);
    }
  }, [search, page, quickFilters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleQuickFilter = useCallback((value: string) => {
    setQuickFilters((prev) => toggleFilterValue(prev, value));
    setPage(1);
  }, []);

  const openCreate = useCallback(() => {
    setForm(createEmptyForm());
    setDetail(null);
    setDetailLoading(false);
    setPanelTitle('New Payroll Run');
    setPanelMode('create');
  }, []);

  const openEdit = useCallback(async (id: string) => {
    setDetail(null);
    setDetailLoading(true);
    setPanelTitle('Edit Payroll Run');
    setPanelMode('edit');
    try {
      const detail = await getPayrollRunDetail(id);
      setDetail(detail);
      setForm(buildFormFromDetail(detail));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payroll run.');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const openView = useCallback(async (id: string) => {
    setDetail(null);
    setDetailLoading(true);
    setPanelTitle('Payroll Run Detail');
    setPanelMode('view');
    try {
      const detail = await getPayrollRunDetail(id);
      setDetail(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payroll run detail.');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const closePanel = useCallback(() => {
    setPanelMode('closed');
    setDetail(null);
    setDetailLoading(false);
  }, []);

  const handleSave = useCallback(async () => {
    if (!data) return;
    setSaving(true);
    try {
      if (panelMode === 'create') {
        await createPayrollRun(toMutationInput(form));
      } else if (panelMode === 'edit' && detail) {
        await updatePayrollRun(String(detail.id), toMutationInput(form));
      }
      closePanel();
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save payroll run.');
    } finally {
      setSaving(false);
    }
  }, [panelMode, form, detail, data, fetchData, closePanel]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this payroll run?')) return;
    try {
      await deletePayrollRun(id);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete payroll run.');
    }
  }, [fetchData]);

  const handlePost = useCallback(async (id: string) => {
    setPostingId(id);
    try {
      await postPayrollRun(id);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post payroll run.');
    } finally {
      setPostingId(null);
    }
  }, [fetchData]);

  const handleExportCsv = useCallback(() => {
    if (!data) return;
    const headers = META.columns;
    const rows = data.rows.map((r) => [
      r.payrollCode,
      r.periodStart || '',
      r.periodEnd || '',
      r.paymentDate || '',
      r.statusLabel,
      r.journalRef || '',
    ].map(escapeCsvValue).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `payroll-runs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }, [data]);

  if (!data && loading) return <LoadingSkeleton />;

  const quickFilterOptions = data?.filterOptions.quickFilters || [];

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
          <button type="button" onClick={() => setError(null)} className="ml-auto text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {(data?.metrics || []).map((metric) => (
          <div key={metric.id}><MetricCard metric={metric} /></div>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Payroll Runs</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{META.tableDescription}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={openCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
            <Plus className="h-4 w-4" /> New Payroll Run
          </button>
          <button type="button" onClick={() => fetchData()} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button type="button" onClick={handleExportCsv} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('ghost')}`}>
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-800 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1 max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder={META.searchPlaceholder}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Quick Filters</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickFilterOptions.map((qf) => {
              const selected = quickFilters.includes(qf.value);
              return (
                <button
                  key={qf.value}
                  type="button"
                  onClick={() => handleQuickFilter(qf.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    selected ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {qf.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 p-[10px] sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{META.tableTitle}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{META.tableDescription}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span>{data?.totals.filteredRows ?? 0} matching rows</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[var(--card-border)]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    {META.columns.map((col) => (
                      <th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{col}</th>
                    ))}
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[var(--card-background)]">
                  {data?.rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      {row.cells.map((cell, index) => renderCell(cell, index))}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" onClick={() => openView(row.id)} className="rounded-lg p-1.5 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300" title="View">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => openEdit(row.id)} className="rounded-lg p-1.5 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400" title="Edit">
                            <Edit className="h-4 w-4" />
                          </button>
                          {row.status === 'approved' && (
                            <button type="button" onClick={() => handlePost(row.id)} disabled={postingId === row.id} className="rounded-lg p-1.5 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-green-600 dark:hover:text-green-400 disabled:opacity-50" title="Post">
                              {postingId === row.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                            </button>
                          )}
                          {row.status !== 'posted' && (
                            <button type="button" onClick={() => handleDelete(row.id)} className="rounded-lg p-1.5 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-600 dark:hover:text-red-400" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!data || data.rows.length === 0) && (
                    <tr>
                      <td colSpan={META.columns.length + 1} className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                        No payroll runs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.totalDocs} total)
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!data.pagination.hasPrevPage}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={!data.pagination.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <SlideOver isOpen={panelMode === 'create' || panelMode === 'edit'} onClose={closePanel} title={panelTitle} description="Configure payroll run details including period, payment date, branch, and department.">
        {detailLoading ? <LoadingSkeleton /> : data && renderForm(form, setForm, data.referenceData)}
        <div className="mt-6 flex items-center gap-3 border-t border-gray-200 dark:border-gray-800 pt-4">
          <button type="button" onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 dark:bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={closePanel} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            Cancel
          </button>
        </div>
      </SlideOver>

      <SlideOver isOpen={panelMode === 'view'} onClose={closePanel} title={panelTitle} description="Full payroll run record including period, status, and posted journal linkage.">
        {detailLoading ? <LoadingSkeleton /> : detail && data && renderDetail(detail, data.referenceData)}
        <div className="mt-6 flex items-center gap-3 border-t border-gray-200 dark:border-gray-800 pt-4">
          <button type="button" onClick={closePanel} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            Close
          </button>
        </div>
      </SlideOver>
    </div>
  );
}
