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
  Filter,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import {
  createRegisterItem,
  deleteRegisterItem,
  getAssetRegister,
  getRegisterItem,
  updateRegisterItem,
  type RegisterCell,
  type RegisterDetail,
  type RegisterMetric,
  type RegisterMutationInput,
  type RegisterResponse,
} from './actions-asset-register';

const CATEGORY_OPTIONS = [
  { label: 'Equipment', value: 'equipment' },
  { label: 'Furniture', value: 'furniture' },
  { label: 'IT Infrastructure', value: 'it_infrastructure' },
  { label: 'Vehicle', value: 'vehicle' },
  { label: 'Leasehold Improvement', value: 'leasehold_improvement' },
  { label: 'Other', value: 'other' },
];

const METHOD_OPTIONS = [
  { label: 'Straight Line', value: 'straight_line' },
  { label: 'Manual', value: 'manual' },
];

const STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Active', value: 'active' },
  { label: 'Fully Depreciated', value: 'fully_depreciated' },
  { label: 'Disposed', value: 'disposed' },
  { label: 'Written Off', value: 'written_off' },
];

const META = {
  searchPlaceholder: 'Search asset code, asset name, category, branch, department, location, or status',
  columns: ['Asset Code', 'Asset Name', 'Category', 'Acquisition Cost', 'Accumulated Depn.', 'Net Book Value', 'Status'],
  tableTitle: 'Asset Register Report',
  tableDescription: 'Fixed-asset register with acquisition cost, accumulated depreciation, and net book value computed from the depreciation-entry posting records.',
};

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  if (variant === 'ghost') return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
}

function getMetricTone(trend: RegisterMetric['trend']) {
  if (trend === 'down') return 'text-red-600 bg-red-50';
  if (trend === 'neutral') return 'text-gray-600 bg-gray-100';
  return 'text-green-600 bg-green-50';
}

function escapeCsvValue(value: string | number | boolean | null | undefined) {
  const normalized = String(value ?? '');
  return /[",\n]/.test(normalized) ? `"${normalized.replace(/"/g, '""')}"` : normalized;
}

function toggleFilterValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function fmt(n: number) { return `PHP ${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }

function toDateInput(value: string | null | undefined) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

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
      <div className={`flex w-full max-w-3xl flex-col bg-white shadow-xl transition-all duration-300 ease-in-out ${animate ? 'translate-x-0' : 'translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description ? <p className="mt-0.5 text-sm text-gray-500">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

function MetricCard({ label, value, change, trend = 'neutral' }: { label: string; value: string | number; change: string; trend?: 'up' | 'down' | 'neutral' }) {
  const TrendIcon = trend === 'down' ? ArrowDownRight : ArrowUpRight;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="rounded-lg bg-gray-100 p-3 text-gray-600">
          <Wallet className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${getMetricTone(trend)}`}>
          <TrendIcon className="h-3.5 w-3.5" />
          {change}
        </span>
      </div>
    </div>
  );
}

function LoadingSkeleton({ columnCount = 7 }: { columnCount?: number }) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: columnCount + 1 }).map((_, i) => (
                  <th key={i} className="px-4 py-3">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={columnCount + 1} className="px-4 py-3">
                    <div className="h-6 animate-pulse rounded bg-gray-100" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function renderCell(cell: RegisterCell, index: number) {
  if (typeof cell === 'string') {
    return <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{cell}</td>;
  }
  const alignClass = cell.align === 'right' ? 'text-right' : cell.align === 'center' ? 'text-center' : 'text-left';
  if (cell.tone) {
    const toneMap: Record<string, string> = {
      amber: 'bg-amber-50 text-amber-700 ring-amber-200',
      green: 'bg-green-50 text-green-700 ring-green-200',
      gray: 'bg-gray-100 text-gray-700 ring-gray-200',
      blue: 'bg-blue-50 text-blue-700 ring-blue-200',
      red: 'bg-red-50 text-red-700 ring-red-200',
    };
    return (
      <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${alignClass}`}>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${toneMap[cell.tone] || toneMap.gray}`}>
          {cell.text}
        </span>
      </td>
    );
  }
  return (
    <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${cell.emphasis ? 'font-semibold text-gray-900' : 'text-gray-600'} ${alignClass}`}>
      {cell.text}
    </td>
  );
}

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', required, disabled }: { value: string; onChange?: (value: string) => void; placeholder?: string; type?: string; required?: boolean; disabled?: boolean }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: Array<{ label: string; value: string }> }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    >
      {options.length > 0 && options[0].value !== '' ? <option value="" className="text-gray-900">Select...</option> : null}
      {options.map((option) => (
        <option key={option.value} value={option.value} className="text-gray-900 bg-white">{option.label}</option>
      ))}
    </select>
  );
}

function TextArea({ value, onChange, rows = 3 }: { value: string; onChange: (value: string) => void; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={rows}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    />
  );
}

type FormState = {
  assetCode: string;
  name: string;
  assetCategory: string;
  purchaseDate: string;
  inServiceDate: string;
  cost: string;
  salvageValue: string;
  usefulLifeMonths: string;
  depreciationMethod: string;
  expenseAccount: string;
  assetAccount: string;
  accumulatedDepreciationAccount: string;
  branch: string;
  department: string;
  location: string;
  status: string;
  notes: string;
};

function createEmptyForm(): FormState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    assetCode: '',
    name: '',
    assetCategory: 'equipment',
    purchaseDate: today,
    inServiceDate: '',
    cost: '0',
    salvageValue: '0',
    usefulLifeMonths: '60',
    depreciationMethod: 'straight_line',
    expenseAccount: '',
    assetAccount: '',
    accumulatedDepreciationAccount: '',
    branch: '',
    department: '',
    location: '',
    status: 'draft',
    notes: '',
  };
}

function buildFormFromDetail(d: RegisterDetail): FormState {
  const extractId = (val: unknown): string => {
    if (!val) return '';
    if (typeof val === 'object') return String((val as Record<string, unknown>).id ?? '');
    return String(val);
  };
  return {
    assetCode: String((d as Record<string, unknown>).assetCode || ''),
    name: String((d as Record<string, unknown>).name || ''),
    assetCategory: String((d as Record<string, unknown>).assetCategory || 'equipment'),
    purchaseDate: toDateInput(String((d as Record<string, unknown>).purchaseDate || '')),
    inServiceDate: toDateInput(String((d as Record<string, unknown>).inServiceDate || '')),
    cost: String(Number((d as Record<string, unknown>).cost || 0)),
    salvageValue: String(Number((d as Record<string, unknown>).salvageValue || 0)),
    usefulLifeMonths: String(Number((d as Record<string, unknown>).usefulLifeMonths || 60)),
    depreciationMethod: String((d as Record<string, unknown>).depreciationMethod || 'straight_line'),
    expenseAccount: extractId((d as Record<string, unknown>).expenseAccount),
    assetAccount: extractId((d as Record<string, unknown>).assetAccount),
    accumulatedDepreciationAccount: extractId((d as Record<string, unknown>).accumulatedDepreciationAccount),
    branch: extractId((d as Record<string, unknown>).branch),
    department: extractId((d as Record<string, unknown>).department),
    location: extractId((d as Record<string, unknown>).location),
    status: String((d as Record<string, unknown>).status || 'draft'),
    notes: String((d as Record<string, unknown>).notes || ''),
  };
}

function toMutationInput(f: FormState): RegisterMutationInput {
  return {
    assetCode: f.assetCode.trim() || null,
    name: f.name.trim(),
    assetCategory: f.assetCategory,
    purchaseDate: f.purchaseDate,
    inServiceDate: f.inServiceDate || null,
    cost: Number(f.cost || 0),
    salvageValue: Number(f.salvageValue || 0),
    usefulLifeMonths: Number(f.usefulLifeMonths || 60),
    depreciationMethod: f.depreciationMethod,
    expenseAccount: f.expenseAccount || null,
    assetAccount: f.assetAccount || null,
    accumulatedDepreciationAccount: f.accumulatedDepreciationAccount || null,
    branch: f.branch || null,
    department: f.department || null,
    location: f.location || null,
    status: f.status,
    notes: f.notes.trim() || null,
  };
}

function renderForm(
  formState: FormState,
  setFormState: React.Dispatch<React.SetStateAction<FormState>>,
  submitLabel: string,
  isSubmitting: boolean,
  onCancel: () => void,
  errorMessage: string | null,
  onSubmit?: (event: React.FormEvent) => void,
  refData?: RegisterResponse['referenceData'],
) {
  const acctOpts = [{ label: 'Select an account', value: '' }].concat(
    (refData?.chartAccounts || []).map((a) => ({ label: `${a.code} - ${a.name}`, value: a.id })),
  );
  const branchOpts = [{ label: 'No branch', value: '' }].concat(
    (refData?.branches || []).map((b) => ({ label: `${b.branchCode} - ${b.name}`, value: b.id })),
  );
  const deptOpts = [{ label: 'No department', value: '' }].concat(
    (refData?.departments || []).map((d) => ({ label: `${d.code} - ${d.name}`, value: d.id })),
  );
  const locOpts = [{ label: 'No location', value: '' }].concat(
    (refData?.locations || []).map((l) => ({ label: `${l.code} - ${l.name}`, value: l.id })),
  );

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {errorMessage ? (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Asset Code">
          <Input value={formState.assetCode} onChange={(value) => setFormState((prev) => ({ ...prev, assetCode: value }))} placeholder="Leave blank to auto-generate" />
        </FormField>
        <FormField label="Asset Name" required>
          <Input value={formState.name} onChange={(value) => setFormState((prev) => ({ ...prev, name: value }))} required />
        </FormField>
        <FormField label="Category" required>
          <Select value={formState.assetCategory} onChange={(value) => setFormState((prev) => ({ ...prev, assetCategory: value }))} options={CATEGORY_OPTIONS} />
        </FormField>
        <FormField label="Depreciation Method" required>
          <Select value={formState.depreciationMethod} onChange={(value) => setFormState((prev) => ({ ...prev, depreciationMethod: value }))} options={METHOD_OPTIONS} />
        </FormField>
        <FormField label="Purchase Date" required>
          <Input type="date" value={formState.purchaseDate} onChange={(value) => setFormState((prev) => ({ ...prev, purchaseDate: value }))} required />
        </FormField>
        <FormField label="In-Service Date">
          <Input type="date" value={formState.inServiceDate} onChange={(value) => setFormState((prev) => ({ ...prev, inServiceDate: value }))} />
        </FormField>
        <FormField label="Cost (PHP)" required>
          <Input type="number" value={formState.cost} onChange={(value) => setFormState((prev) => ({ ...prev, cost: value }))} required />
        </FormField>
        <FormField label="Salvage Value (PHP)">
          <Input type="number" value={formState.salvageValue} onChange={(value) => setFormState((prev) => ({ ...prev, salvageValue: value }))} />
        </FormField>
        <FormField label="Useful Life (Months)" required>
          <Input type="number" value={formState.usefulLifeMonths} onChange={(value) => setFormState((prev) => ({ ...prev, usefulLifeMonths: value }))} required />
        </FormField>
        <FormField label="Status">
          <Select value={formState.status} onChange={(value) => setFormState((prev) => ({ ...prev, status: value }))} options={STATUS_OPTIONS} />
        </FormField>
        <FormField label="Asset Account" required>
          <Select value={formState.assetAccount} onChange={(value) => setFormState((prev) => ({ ...prev, assetAccount: value }))} options={acctOpts} />
        </FormField>
        <FormField label="Expense Account" required>
          <Select value={formState.expenseAccount} onChange={(value) => setFormState((prev) => ({ ...prev, expenseAccount: value }))} options={acctOpts} />
        </FormField>
        <FormField label="Accum. Depr. Account" required>
          <Select value={formState.accumulatedDepreciationAccount} onChange={(value) => setFormState((prev) => ({ ...prev, accumulatedDepreciationAccount: value }))} options={acctOpts} />
        </FormField>
        <FormField label="Branch">
          <Select value={formState.branch} onChange={(value) => setFormState((prev) => ({ ...prev, branch: value }))} options={branchOpts} />
        </FormField>
        <FormField label="Department">
          <Select value={formState.department} onChange={(value) => setFormState((prev) => ({ ...prev, department: value }))} options={deptOpts} />
        </FormField>
        <FormField label="Location">
          <Select value={formState.location} onChange={(value) => setFormState((prev) => ({ ...prev, location: value }))} options={locOpts} />
        </FormField>
      </div>

      <FormField label="Notes">
        <TextArea value={formState.notes} onChange={(value) => setFormState((prev) => ({ ...prev, notes: value }))} />
      </FormField>

      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>
          {isSubmitting ? `${submitLabel}...` : submitLabel}
        </button>
      </div>
    </form>
  );
}

type FilterState = { statuses: string[]; categories: string[] };

export default function AssetRegisterReportClient() {
  const [data, setData] = useState<RegisterResponse | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({ statuses: [], categories: [] });
  const [draftFilters, setDraftFilters] = useState<FilterState>({ statuses: [], categories: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const [viewDetail, setViewDetail] = useState<RegisterDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);

  const [createForm, setCreateForm] = useState<FormState>(createEmptyForm());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(createEmptyForm());
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLabel, setDeleteLabel] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filterCount = filters.statuses.length + filters.categories.length;

  const fetchData = useCallback(async (search: string, page: number, nextFilters: FilterState, nextQuickFilters: string[]) => {
    setIsLoading(true);
    setErrorState(null);
    try {
      const response = await getAssetRegister({
        search,
        page,
        statuses: nextFilters.statuses,
        categories: nextFilters.categories,
        quickFilters: nextQuickFilters,
      });
      setData(response);
    } catch (fetchError) {
      setErrorState(fetchError instanceof Error ? fetchError.message : 'Unable to load asset register.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData(submittedSearch, currentPage, filters, quickFilters);
  }, [currentPage, fetchData, filters, quickFilters, submittedSearch]);

  const handleRefresh = () => { void fetchData(submittedSearch, currentPage, filters, quickFilters); };
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput);
    setCurrentPage(1);
    void fetchData(searchInput, 1, filters, quickFilters);
  };
  const handleToggleQuickFilter = (value: string) => {
    setQuickFilters((previous) => toggleFilterValue(previous, value));
    setCurrentPage(1);
  };

  const handleExport = () => {
    const rows = data?.rows || [];
    if (!rows.length) return;
    const headers = META.columns;
    const csvRows = rows.map((row) => [row.assetCode, row.name, row.categoryLabel, row.costLabel, row.accumulatedDepreciationLabel, row.netBookValueLabel, row.statusLabel]);
    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'asset-register-report.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleView = async (id: string) => {
    setIsViewOpen(true);
    setIsViewLoading(true);
    setViewDetail(null);
    try {
      setViewDetail(await getRegisterItem(id));
    } catch {
      // handled silently
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setCreateForm(createEmptyForm());
    setCreateError(null);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsCreateSubmitting(true);
    setCreateError(null);
    try {
      await createRegisterItem(toMutationInput(createForm));
      setIsCreateOpen(false);
      handleRefresh();
    } catch (submissionError) {
      setCreateError(submissionError instanceof Error ? submissionError.message : 'Unable to create asset register entry.');
    } finally {
      setIsCreateSubmitting(false);
    }
  };

  const handleOpenEdit = async (id: string) => {
    setEditId(id);
    setEditError(null);
    setIsEditOpen(true);
    setIsEditLoading(true);
    try {
      const detail = await getRegisterItem(id);
      setEditForm(buildFormFromDetail(detail));
    } catch (detailError) {
      setEditError(detailError instanceof Error ? detailError.message : 'Unable to load asset detail.');
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editId) return;
    setIsEditSubmitting(true);
    setEditError(null);
    try {
      await updateRegisterItem(editId, toMutationInput(editForm));
      setIsEditOpen(false);
      setEditId(null);
      handleRefresh();
    } catch (submissionError) {
      setEditError(submissionError instanceof Error ? submissionError.message : 'Unable to update asset register entry.');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleOpenDelete = (id: string, label: string) => {
    setDeleteId(id);
    setDeleteLabel(label);
    setDeleteError(null);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleteSubmitting(true);
    setDeleteError(null);
    try {
      await deleteRegisterItem(deleteId);
      setIsDeleteOpen(false);
      setDeleteId(null);
      setDeleteLabel('');
      handleRefresh();
    } catch (deletionError) {
      setDeleteError(deletionError instanceof Error ? deletionError.message : 'Unable to delete asset register entry.');
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  const currentRows = data?.rows || [];
  const rData = data?.referenceData;
  const cols = META.columns;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">Asset Register Report</h2>
          <p className="text-sm text-gray-600">{META.tableDescription}</p>
          <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
            <Plus className="h-4 w-4" />
            New Asset
          </button>
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button type="button" onClick={handleExport} disabled={!currentRows.length} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {data?.metrics?.length ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {data.metrics.map((metric) => (
            <div key={metric.id}><MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} /></div>
          ))}
        </div>
      ) : null}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <form onSubmit={handleSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={META.searchPlaceholder}
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700">
                <Search className="h-4 w-4" />
                Search
              </button>
            </form>
            <button
              type="button"
              onClick={() => {
                if (!isFilterPanelOpen) setDraftFilters({ ...filters });
                setIsFilterPanelOpen((previous) => !previous);
              }}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isFilterPanelOpen || filterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {filterCount > 0 ? <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{filterCount}</span> : null}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(data?.filterOptions.quickFilters || []).map((filter) => (
              <button key={filter.value} type="button" onClick={() => handleToggleQuickFilter(filter.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${quickFilters.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 p-5">
          {isFilterPanelOpen ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Filters</h4>
                  <p className="mt-1 text-sm text-gray-600">Select as many values as needed. All checked filters widen the result set using OR logic.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => { setDraftFilters({ statuses: [], categories: [] }); setFilters({ statuses: [], categories: [] }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    Clear all
                  </button>
                  <button type="button" onClick={() => setIsFilterPanelOpen(false)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="button" onClick={() => { setFilters({ ...draftFilters }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
                    Apply Filters
                  </button>
                </div>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</p>
                  <div className="flex flex-wrap gap-2">
                    {(data?.filterOptions.statuses || []).map((option) => {
                      const isSelected = draftFilters.statuses.includes(option.value);
                      return (
                        <button key={option.value} type="button" onClick={() => setDraftFilters((prev) => ({ ...prev, statuses: toggleFilterValue(prev.statuses, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Category</p>
                  <div className="flex flex-wrap gap-2">
                    {(data?.filterOptions.categories || []).map((option) => {
                      const isSelected = draftFilters.categories.includes(option.value);
                      return (
                        <button key={option.value} type="button" onClick={() => setDraftFilters((prev) => ({ ...prev, categories: toggleFilterValue(prev.categories, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {isLoading ? (
            <LoadingSkeleton columnCount={cols.length} />
          ) : errorState ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorState}
            </div>
          ) : currentRows.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-500">No asset register records found.</p>
              <p className="mt-1 text-xs text-gray-400">Try adjusting your search or filters, or create a new asset.</p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {cols.map((col) => (
                          <th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{col}</th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {currentRows.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          {row.cells.map((cell, index) => renderCell(cell, index))}
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button type="button" onClick={() => handleView(row.id)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600" title="View">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button type="button" onClick={() => handleOpenEdit(row.id)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600" title="Edit">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button type="button" onClick={() => handleOpenDelete(row.id, `${row.assetCode} - ${row.name}`)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600" title="Delete">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Page {data?.pagination.page ?? 1} of {data?.pagination.totalPages ?? 1}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
                    disabled={!data?.pagination.hasPrevPage}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((previous) => Math.min(data?.pagination.totalPages ?? 1, previous + 1))}
                    disabled={!data?.pagination.hasNextPage}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Asset Register Detail" description="Full asset register record including costs, accumulated depreciation, net book value, accounts, and dimensions.">
        {isViewLoading ? (
          <LoadingSkeleton />
        ) : viewDetail ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['Asset Code', String((viewDetail as Record<string, unknown>).assetCode || '-')],
                ['Asset Name', String((viewDetail as Record<string, unknown>).name || '-')],
                ['Category', (() => {
                  const cat = String((viewDetail as Record<string, unknown>).assetCategory || '');
                  const found = CATEGORY_OPTIONS.find((o) => o.value === cat);
                  return found ? found.label : cat || '-';
                })()],
                ['Status', (() => {
                  const st = String((viewDetail as Record<string, unknown>).status || '');
                  const found = STATUS_OPTIONS.find((o) => o.value === st);
                  return found ? found.label : st || '-';
                })()],
                ['Purchase Date', (viewDetail as Record<string, unknown>).purchaseDate ? String((viewDetail as Record<string, unknown>).purchaseDate).slice(0, 10) : '-'],
                ['In-Service Date', (viewDetail as Record<string, unknown>).inServiceDate ? String((viewDetail as Record<string, unknown>).inServiceDate).slice(0, 10) : '-'],
                ['Cost', fmt(Number((viewDetail as Record<string, unknown>).cost || 0))],
                ['Salvage Value', fmt(Number((viewDetail as Record<string, unknown>).salvageValue || 0))],
                ['Useful Life', `${(viewDetail as Record<string, unknown>).usefulLifeMonths || '-'} months`],
                ['Depreciation Method', (() => {
                  const method = String((viewDetail as Record<string, unknown>).depreciationMethod || '');
                  const found = METHOD_OPTIONS.find((o) => o.value === method);
                  return found ? found.label : method || '-';
                })()],
                ['Expense Account', (() => {
                  const acct = (viewDetail as Record<string, unknown>).expenseAccount as Record<string, unknown> | undefined;
                  return acct ? `${acct.code ?? ''} - ${acct.name ?? ''}` : '-';
                })()],
                ['Asset Account', (() => {
                  const acct = (viewDetail as Record<string, unknown>).assetAccount as Record<string, unknown> | undefined;
                  return acct ? `${acct.code ?? ''} - ${acct.name ?? ''}` : '-';
                })()],
                ['Accum. Depr. Account', (() => {
                  const acct = (viewDetail as Record<string, unknown>).accumulatedDepreciationAccount as Record<string, unknown> | undefined;
                  return acct ? `${acct.code ?? ''} - ${acct.name ?? ''}` : '-';
                })()],
                ['Branch', (() => {
                  const br = (viewDetail as Record<string, unknown>).branch as Record<string, unknown> | undefined;
                  return br ? `${br.branchCode ?? ''} - ${br.name ?? ''}` : '-';
                })()],
                ['Department', (() => {
                  const dept = (viewDetail as Record<string, unknown>).department as Record<string, unknown> | undefined;
                  return dept ? `${dept.code ?? ''} - ${dept.name ?? ''}` : '-';
                })()],
                ['Location', (() => {
                  const loc = (viewDetail as Record<string, unknown>).location as Record<string, unknown> | undefined;
                  return loc ? `${loc.code ?? ''} - ${loc.name ?? ''}` : '-';
                })()],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                  <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
                </div>
              ))}
            </div>

            {(viewDetail as Record<string, unknown>).notes ? (
              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Notes</p>
                <p className="mt-2 text-sm text-gray-700">{(viewDetail as Record<string, unknown>).notes as string}</p>
              </div>
            ) : null}
          </>
        ) : null}
      </SlideOver>

      <SlideOver isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="New Asset" description="Create a new fixed-asset record. All required fields must be completed.">
        {renderForm(createForm, setCreateForm, 'Create Asset', isCreateSubmitting, () => setIsCreateOpen(false), createError, handleCreateSubmit, rData)}
      </SlideOver>

      <SlideOver isOpen={isEditOpen} onClose={() => { if (!isEditSubmitting) { setIsEditOpen(false); setEditId(null); } }} title="Edit Asset" description="Update the fixed-asset record fields.">
        {isEditLoading ? <LoadingSkeleton /> : renderForm(editForm, setEditForm, 'Save Changes', isEditSubmitting, () => { setIsEditOpen(false); setEditId(null); }, editError, handleEditSubmit, rData)}
      </SlideOver>

      <SlideOver isOpen={isDeleteOpen} onClose={() => { if (!isDeleteSubmitting) { setIsDeleteOpen(false); setDeleteId(null); setDeleteLabel(''); } }} title="Delete Asset" description="Remove this asset record if it has no blocking dependencies (depreciation entries or disposal records).">
        <div className="space-y-4">
          {deleteError ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {deleteError}
            </div>
          ) : null}
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <span className="font-semibold text-gray-900">{deleteLabel}</span>? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => { setIsDeleteOpen(false); setDeleteId(null); setDeleteLabel(''); }} disabled={isDeleteSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleteSubmitting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50">
              {isDeleteSubmitting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
