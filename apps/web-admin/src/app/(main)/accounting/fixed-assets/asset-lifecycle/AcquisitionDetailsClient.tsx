'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
  Wallet,
  X,
} from 'lucide-react';
import {
  createAcquisition,
  deleteAcquisition,
  getAcquisitionDetail,
  getAcquisitionDetails,
  updateAcquisition,
  type AcquisitionCell,
  type AcquisitionDetail,
  type AcquisitionMetric,
  type AcquisitionMutationInput,
  type AcquisitionsResponse,
} from './actions';
import DisposalWriteOffsClient from './DisposalWriteOffsClient';

type TabId = 'acquisition-details' | 'asset-disposal-write-offs';
type FilterState = { statuses: string[]; categories: string[] };

type FormState = {
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
  assetCode: string;
};

const ACQ_TAB: TabId = 'acquisition-details';
const DISP_TAB: TabId = 'asset-disposal-write-offs';

const ACQ_TAB_CONFIG = {
  id: ACQ_TAB,
  label: 'Acquisition Details',
  description:
    'Review acquisition-related fields stored directly on the fixed-asset record, including purchase date, in-service date, cost, salvage value, useful life, and supporting document.',
  searchPlaceholder: 'Search asset code, name, category, or status...',
  columns: ['Asset', 'Purchase Date', 'In Service', 'Cost', 'Useful Life', 'Status'],
  tableTitle: 'Asset Acquisition Register',
  tableDescription:
    'Acquisition view grounded in the purchase, service, cost, useful-life, and status fields stored on the fixed-assets collection.',
};



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

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  if (variant === 'ghost') return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
}

function getMetricTone(trend: AcquisitionMetric['trend']) {
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

function LoadingSkeleton({ columnCount = 6 }: { columnCount?: number }) {
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

function renderCell(cell: AcquisitionCell, index: number) {
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

function createEmptyForm(): FormState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    name: '', assetCategory: 'equipment', purchaseDate: today, inServiceDate: '',
    cost: '0', salvageValue: '0', usefulLifeMonths: '60', depreciationMethod: 'straight_line',
    expenseAccount: '', assetAccount: '', accumulatedDepreciationAccount: '',
    branch: '', department: '', location: '', status: 'draft', notes: '', assetCode: '',
  };
}

function buildFormFromDetail(d: AcquisitionDetail): FormState {
  return {
    name: String(d.name || ''),
    assetCategory: String((d as Record<string, unknown>).assetCategory || 'equipment'),
    purchaseDate: toDateInput(String((d as Record<string, unknown>).purchaseDate || '')),
    inServiceDate: toDateInput(String((d as Record<string, unknown>).inServiceDate || '')),
    cost: String(Number((d as Record<string, unknown>).cost || 0)),
    salvageValue: String(Number((d as Record<string, unknown>).salvageValue ?? 0)),
    usefulLifeMonths: String(Number((d as Record<string, unknown>).usefulLifeMonths || 60)),
    depreciationMethod: String((d as Record<string, unknown>).depreciationMethod || 'straight_line'),
    expenseAccount: String((d as Record<string, unknown>).expenseAccount && typeof (d as Record<string, unknown>).expenseAccount === 'object' ? ((d as Record<string, unknown>).expenseAccount as Record<string, unknown>).id ?? (d as Record<string, unknown>).expenseAccount : (d as Record<string, unknown>).expenseAccount ?? ''),
    assetAccount: String((d as Record<string, unknown>).assetAccount && typeof (d as Record<string, unknown>).assetAccount === 'object' ? ((d as Record<string, unknown>).assetAccount as Record<string, unknown>).id ?? (d as Record<string, unknown>).assetAccount : (d as Record<string, unknown>).assetAccount ?? ''),
    accumulatedDepreciationAccount: String((d as Record<string, unknown>).accumulatedDepreciationAccount && typeof (d as Record<string, unknown>).accumulatedDepreciationAccount === 'object' ? ((d as Record<string, unknown>).accumulatedDepreciationAccount as Record<string, unknown>).id ?? (d as Record<string, unknown>).accumulatedDepreciationAccount : (d as Record<string, unknown>).accumulatedDepreciationAccount ?? ''),
    branch: String((d as Record<string, unknown>).branch && typeof (d as Record<string, unknown>).branch === 'object' ? ((d as Record<string, unknown>).branch as Record<string, unknown>).id ?? (d as Record<string, unknown>).branch : (d as Record<string, unknown>).branch ?? ''),
    department: String((d as Record<string, unknown>).department && typeof (d as Record<string, unknown>).department === 'object' ? ((d as Record<string, unknown>).department as Record<string, unknown>).id ?? (d as Record<string, unknown>).department : (d as Record<string, unknown>).department ?? ''),
    location: String((d as Record<string, unknown>).location && typeof (d as Record<string, unknown>).location === 'object' ? ((d as Record<string, unknown>).location as Record<string, unknown>).id ?? (d as Record<string, unknown>).location : (d as Record<string, unknown>).location ?? ''),
    status: String((d as Record<string, unknown>).status || 'draft'),
    notes: String((d as Record<string, unknown>).notes || ''),
    assetCode: String((d as Record<string, unknown>).assetCode || ''),
  };
}

function toMutationInput(f: FormState): AcquisitionMutationInput {
  return {
    name: f.name.trim(),
    assetCategory: f.assetCategory,
    purchaseDate: f.purchaseDate,
    inServiceDate: f.inServiceDate || null,
    cost: Number(f.cost || 0),
    salvageValue: Number(f.salvageValue ?? 0),
    usefulLifeMonths: Number(f.usefulLifeMonths || 60),
    depreciationMethod: f.depreciationMethod,
    expenseAccount: f.expenseAccount,
    assetAccount: f.assetAccount,
    accumulatedDepreciationAccount: f.accumulatedDepreciationAccount,
    branch: f.branch || null,
    department: f.department || null,
    location: f.location || null,
    status: f.status,
    notes: f.notes.trim() || null,
    assetCode: f.assetCode.trim() || null,
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
  refData?: AcquisitionsResponse['referenceData'],
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

export default function AcquisitionDetailsClient() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTabFromUrl = searchParams.get('tab') as TabId | null;
  const [activeTab, setActiveTabState] = useState<TabId>(activeTabFromUrl || ACQ_TAB);

  const setActiveTab = useCallback((tabId: TabId) => {
    setActiveTabState(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (activeTabFromUrl && activeTabFromUrl !== activeTab) {
      setActiveTabState(activeTabFromUrl);
    }
  }, [activeTabFromUrl, activeTab]);

  const [data, setData] = useState<AcquisitionsResponse | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({ statuses: [], categories: [] });
  const [draftFilters, setDraftFilters] = useState<FilterState>({ statuses: [], categories: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const [viewDetail, setViewDetail] = useState<AcquisitionDetail | null>(null);
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
      const response = await getAcquisitionDetails({
        search,
        page,
        statuses: nextFilters.statuses,
        categories: nextFilters.categories,
        quickFilters: nextQuickFilters,
      });
      setData(response);
    } catch (fetchError) {
      setErrorState(fetchError instanceof Error ? fetchError.message : 'Unable to load acquisition details.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === ACQ_TAB) {
      void fetchData(submittedSearch, currentPage, filters, quickFilters);
    }
  }, [activeTab, currentPage, fetchData, filters, quickFilters, submittedSearch]);

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
    const headers = ['Asset', 'Purchase Date', 'In Service', 'Cost', 'Useful Life', 'Status'];
    const csvRows = rows.map((row) => [row.assetCode ? `${row.assetCode} - ${row.name}` : row.name, row.purchaseDate || '', row.inServiceDate || '', row.costLabel, row.usefulLifeLabel, row.statusLabel]);
    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'acquisition-details.csv';
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
      setViewDetail(await getAcquisitionDetail(id));
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
      await createAcquisition(toMutationInput(createForm));
      setIsCreateOpen(false);
      handleRefresh();
    } catch (submissionError) {
      setCreateError(submissionError instanceof Error ? submissionError.message : 'Unable to create acquisition.');
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
      const detail = await getAcquisitionDetail(id);
      setEditForm(buildFormFromDetail(detail));
    } catch (detailError) {
      setEditError(detailError instanceof Error ? detailError.message : 'Unable to load acquisition.');
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
      await updateAcquisition(editId, toMutationInput(editForm));
      setIsEditOpen(false);
      setEditId(null);
      handleRefresh();
    } catch (submissionError) {
      setEditError(submissionError instanceof Error ? submissionError.message : 'Unable to update acquisition.');
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
      await deleteAcquisition(deleteId);
      setIsDeleteOpen(false);
      setDeleteId(null);
      setDeleteLabel('');
      handleRefresh();
    } catch (deletionError) {
      setDeleteError(deletionError instanceof Error ? deletionError.message : 'Unable to delete acquisition.');
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  const currentRows = data?.rows || [];
  const rData = data?.referenceData;
  const cols = ACQ_TAB_CONFIG.columns;

  return (
    <div className="space-y-6 p-[10px]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Advanced Finance / Fixed Assets</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Asset Lifecycle</h1>
              <p className="mt-1 max-w-3xl text-sm text-gray-600">
                Review acquisition details held on the asset record and disposal or write-off records that close the asset lifecycle.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab(ACQ_TAB)}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
              activeTab === ACQ_TAB
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Acquisition Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(DISP_TAB)}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
              activeTab === DISP_TAB
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Asset Disposal & Write-Offs
          </button>
        </nav>
      </div>

      {activeTab === DISP_TAB ? (
        <DisposalWriteOffsClient />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-gray-900">{ACQ_TAB_CONFIG.label}</h2>
              <p className="text-sm text-gray-600">{ACQ_TAB_CONFIG.description}</p>
              <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
                <Plus className="h-4 w-4" />
                New Acquisition
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
                      placeholder={ACQ_TAB_CONFIG.searchPlaceholder}
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

            <div className="space-y-4 p-[10px] sm:p-5">
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
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</h5>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(data?.filterOptions.statuses || []).map((option) => {
                          const selected = draftFilters.statuses.includes(option.value);
                          return (
                            <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Category</h5>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(data?.filterOptions.categories || []).map((option) => {
                          const selected = draftFilters.categories.includes(option.value);
                          return (
                            <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, categories: toggleFilterValue(previous.categories, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-gray-900">{ACQ_TAB_CONFIG.tableTitle}</h3>
                  <p className="text-sm text-gray-600">{ACQ_TAB_CONFIG.tableDescription}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <span>{data?.totals.filteredRows ?? 0} matching rows</span>
                </div>
              </div>

              {errorState ? (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {errorState}
                </div>
              ) : null}

              {isLoading ? (
                <LoadingSkeleton columnCount={cols.length} />
              ) : (
                <>
                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {cols.map((column: string) => (
                              <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Cost' ? 'text-right' : 'text-left'}`}>
                                {column}
                              </th>
                            ))}
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {currentRows.length > 0 ? (
                            currentRows.map((row) => (
                              <tr key={row.id} className="hover:bg-gray-50">
                                {row.cells.map((cell, index) => renderCell(cell, index))}
                                <td className="px-4 py-3 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail">
                                      <Eye className="h-4 w-4" />
                                    </button>
                                    <button type="button" onClick={() => handleOpenEdit(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="Edit">
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button type="button" onClick={() => handleOpenDelete(row.id, `${row.assetCode} - ${row.name}`)} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700" title="Delete">
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={cols.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">
                                No acquisitions found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {data?.pagination && data.pagination.totalPages > 1 ? (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Page {data.pagination.page} of {data.pagination.totalPages}</p>
                      <div className="flex gap-2">
                        <button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">
                          Previous
                        </button>
                        <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((prev) => prev + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">
                          Next
                        </button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>

          <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Acquisition Detail" description="Full acquisition record including asset details, accounts, and dimensions.">
            <div className="space-y-6">
              {isViewLoading ? (
                <LoadingSkeleton />
              ) : viewDetail ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      ['Asset Code', String((viewDetail as Record<string, unknown>).assetCode || '-')],
                      ['Name', String((viewDetail as Record<string, unknown>).name || '-')],
                      ['Category', String((viewDetail as Record<string, unknown>).assetCategory || '-')],
                      ['Status', String((viewDetail as Record<string, unknown>).status || '-')],
                      ['Purchase Date', (viewDetail as Record<string, unknown>).purchaseDate ? String((viewDetail as Record<string, unknown>).purchaseDate).slice(0, 10) : '-'],
                      ['In-Service Date', (viewDetail as Record<string, unknown>).inServiceDate ? String((viewDetail as Record<string, unknown>).inServiceDate).slice(0, 10) : '-'],
                      ['Cost', fmt(Number((viewDetail as Record<string, unknown>).cost || 0))],
                      ['Salvage Value', fmt(Number((viewDetail as Record<string, unknown>).salvageValue ?? 0))],
                      ['Useful Life', `${Number((viewDetail as Record<string, unknown>).usefulLifeMonths || 0)} months`],
                      ['Depreciation Method', String((viewDetail as Record<string, unknown>).depreciationMethod || '-')],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                        <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <h4 className="text-sm font-semibold text-blue-800">Account Mapping</h4>
                    <div className="mt-3 space-y-2 text-sm">
                      {['Asset Account', 'Expense Account', 'Accum. Depr. Account'].map((lbl) => {
                        const key = lbl === 'Asset Account' ? 'assetAccount' : lbl === 'Expense Account' ? 'expenseAccount' : 'accumulatedDepreciationAccount';
                        const rel = (viewDetail as Record<string, unknown>)[key] as Record<string, unknown> | undefined;
                        const label = rel?.name || rel?.code || String(rel || '-');
                        return (
                          <div key={lbl} className="flex justify-between">
                            <span className="text-blue-700">{lbl}</span>
                            <span className="font-medium text-blue-900">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-900">Dimensions</h4>
                    <div className="mt-3 space-y-2 text-sm">
                      {['branch', 'department', 'location'].map((key) => {
                        const rel = (viewDetail as Record<string, unknown>)[key] as Record<string, unknown> | undefined;
                        const label = rel?.name || rel?.code || '-';
                        return (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-500">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                            <span className="font-medium text-gray-900">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-900">Notes</h4>
                    <p className="mt-2 text-sm text-gray-700">{String((viewDetail as Record<string, unknown>).notes || '-')}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">No details available.</p>
              )}
            </div>
          </SlideOver>

          <SlideOver isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="New Acquisition" description="Create a fixed-asset acquisition record. All required fields must be completed.">
            {renderForm(createForm, setCreateForm, 'Create Acquisition', isCreateSubmitting, () => setIsCreateOpen(false), createError, handleCreateSubmit, rData)}
          </SlideOver>

          <SlideOver isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Acquisition" description="Update the acquisition record fields.">
            {isEditLoading ? <LoadingSkeleton /> : renderForm(editForm, setEditForm, 'Save Changes', isEditSubmitting, () => setIsEditOpen(false), editError, handleEditSubmit, rData)}
          </SlideOver>

          <SlideOver isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Acquisition" description="Remove this acquisition record if it has no blocking dependencies.">
            <div className="space-y-6">
              {deleteError ? (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {deleteError}
                </div>
              ) : null}
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <p className="font-medium">Delete {deleteLabel}?</p>
                <p className="mt-1">This action cannot be undone. Dependency checks run before removal.</p>
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
                <button type="button" onClick={() => setIsDeleteOpen(false)} disabled={isDeleteSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">
                  Cancel
                </button>
                <button type="button" onClick={handleConfirmDelete} disabled={isDeleteSubmitting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                  {isDeleteSubmitting ? 'Deleting...' : 'Delete Acquisition'}
                </button>
              </div>
            </div>
          </SlideOver>
        </div>
      )}
    </div>
  );
}
