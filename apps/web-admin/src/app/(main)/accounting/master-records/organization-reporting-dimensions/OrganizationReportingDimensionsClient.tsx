'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
} from '@/components/ui/IconWrapper';
import {
  getBranchesRegister,
  getBranchDetail,
  createBranch,
  updateBranch,
  deleteBranch,
  getDepartmentsRegister,
  getDepartmentDetail,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getLocationsRegister,
  getLocationDetail,
  createLocation,
  updateLocation,
  deleteLocation,
  type BranchRegisterRow,
  type BranchesRegisterResponse,
  type BranchDetail,
  type DepartmentRegisterRow,
  type DepartmentsRegisterResponse,
  type DepartmentDetail,
  type LocationRegisterRow,
  type LocationsRegisterResponse,
  type LocationDetail,
  type OrgDimensionMetric,
  type UserRef,
} from './actions';

type StaticBadgeTone = 'gray' | 'blue' | 'green' | 'amber' | 'red';
type StaticTableCell =
  | string
  | { text: string; tone?: StaticBadgeTone; emphasis?: boolean; align?: 'left' | 'right' | 'center' };

export type StaticOrgDimensionTab = {
  id: string;
  label: string;
  description: string;
  searchPlaceholder: string;
  filters: string[];
  metrics: Array<{ label: string; value: string; change: string; trend?: 'up' | 'down' | 'neutral' }>;
  actions: Array<{ label: string; icon?: 'plus' | 'download' | 'refresh'; variant?: 'primary' | 'secondary' | 'ghost' }>;
  tableTitle: string;
  tableDescription: string;
  columns: string[];
  rows: Array<{ id: string; cells: StaticTableCell[] }>;
};

type OrgDimensionTab = 'branches' | 'departments' | 'locations';
type BranchFilterState = { statuses: string[]; addressFilter?: string };
type DepartmentFilterState = { statuses: string[]; branchIds: (number | string)[]; branchFilters: string[] };
type LocationFilterState = DepartmentFilterState;

type BranchFormState = { branchCode: string; name: string; status: string; address: string; notes: string };
type DepartmentFormState = { departmentCode: string; name: string; status: string; branch: string; notes: string };
type LocationFormState = { locationCode: string; name: string; status: string; branch: string; notes: string };

type OrgDimensionClientProps = {
  staticTabs: StaticOrgDimensionTab[];
  initialBranchesData: BranchesRegisterResponse | null;
  initialDepartmentsData: DepartmentsRegisterResponse | null;
  initialLocationsData: LocationsRegisterResponse | null;
  initialTab: OrgDimensionTab;
};

const ACCOUNTING_DIMENSION_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Archived', value: 'archived' },
];

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  if (variant === 'ghost') return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
}

function getMetricTone(trend: OrgDimensionMetric['trend']) {
  if (trend === 'down') return 'text-red-600 bg-red-50';
  if (trend === 'neutral') return 'text-gray-600 bg-gray-100';
  return 'text-green-600 bg-green-50';
}

function getStatusBadgeClasses(status?: string | null) {
  switch (String(status || '').toLowerCase()) {
    case 'active': case 'green': return 'bg-green-50 text-green-700 ring-green-200';
    case 'inactive': case 'amber': return 'bg-amber-50 text-amber-700 ring-amber-200';
    case 'archived': case 'gray': return 'bg-gray-100 text-gray-700 ring-gray-200';
    default: return 'bg-gray-100 text-gray-700 ring-gray-200';
  }
}

function escapeCsvValue(value: string | number | boolean | null | undefined) {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function formatDateTime(value?: string | null) {
  if (!value) return '-';
  try { return new Date(value).toLocaleString(); } catch { return value; }
}

function formatUser(user: UserRef | number | string | null | undefined): string {
  if (!user) return '-';
  if (typeof user === 'object') {
    const parts = [(user.firstName || '').trim(), (user.middleName || '').trim(), (user.lastName || '').trim()].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : String(user.id);
  }
  return String(user);
}

function toggleFilterValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}

const initialBranchForm: BranchFormState = {
  branchCode: '', name: '', status: 'active', address: '', notes: '',
};

const initialDepartmentForm: DepartmentFormState = {
  departmentCode: '', name: '', status: 'active', branch: '', notes: '',
};

const initialLocationForm: LocationFormState = {
  locationCode: '', name: '', status: 'active', branch: '', notes: '',
};

function mapBranchDetailToForm(detail: BranchDetail): BranchFormState {
  return {
    branchCode: detail.branchCode || '',
    name: detail.name || '',
    status: detail.status || 'active',
    address: detail.address || '',
    notes: detail.notes || '',
  };
}

function mapDepartmentDetailToForm(detail: DepartmentDetail): DepartmentFormState {
  const branchId = typeof detail.branch === 'object' && detail.branch ? String(detail.branch.id) : String(detail.branch ?? '');
  return {
    departmentCode: detail.departmentCode || '',
    name: detail.name || '',
    status: detail.status || 'active',
    branch: branchId,
    notes: detail.notes || '',
  };
}

function mapLocationDetailToForm(detail: LocationDetail): LocationFormState {
  const branchId = typeof detail.branch === 'object' && detail.branch ? String(detail.branch.id) : String(detail.branch ?? '');
  return {
    locationCode: detail.locationCode || '',
    name: detail.name || '',
    status: detail.status || 'active',
    branch: branchId,
    notes: detail.notes || '',
  };
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
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${trend ? getMetricTone(trend) : 'text-gray-600 bg-gray-100'}`}>
          <TrendIcon className="h-3.5 w-3.5" />
          {change}
        </span>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="mt-4 h-8 w-20 animate-pulse rounded bg-gray-200" />
            <div className="mt-4 h-6 w-40 animate-pulse rounded-full bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="h-10 w-full max-w-xl animate-pulse rounded-lg bg-gray-200" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-8 w-28 animate-pulse rounded-full bg-gray-200" />
            ))}
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  );
}

function renderCell(cell: StaticTableCell, index: number) {
  if (typeof cell === 'string') {
    return <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{cell}</td>;
  }
  const alignClass = cell.align === 'right' ? 'text-right' : cell.align === 'center' ? 'text-center' : 'text-left';
  if (cell.tone) {
    return (
      <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${alignClass}`}>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusBadgeClasses(cell.tone)}`}>
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


function SlideOver({ isOpen, onClose, title, description, children }: { isOpen: boolean; onClose: () => void; title: string; description?: string; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    } else {
      setAnimate(false);
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  if (!mounted) return null;
  return createPortal(
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ease-in-out ${animate ? 'bg-black/50' : 'bg-transparent'}`} onClick={onClose}>
      <div className={`flex w-full max-w-lg flex-col bg-white shadow-xl transition-all duration-300 ease-in-out ${animate ? 'translate-x-0' : 'translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
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

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', required }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean }) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: Array<{ label: string; value: string }> }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
      {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  );
}

function TextArea({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
  );
}

export function OrganizationReportingDimensionsClient({
  staticTabs,
  initialBranchesData,
  initialDepartmentsData,
  initialLocationsData,
  initialTab,
}: OrgDimensionClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<OrgDimensionTab>(initialTab);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // --- Branches state ---
  const [branchData, setBranchData] = useState<BranchesRegisterResponse | null>(initialBranchesData);
  const [branchError, setBranchError] = useState<string | null>(null);
  const [isBranchLoading, setIsBranchLoading] = useState(false);
  const [branchSearchInput, setBranchSearchInput] = useState(initialBranchesData?.appliedFilters.search || '');
  const [branchSubmittedSearch, setBranchSubmittedSearch] = useState(initialBranchesData?.appliedFilters.search || '');
  const [branchCurrentPage, setBranchCurrentPage] = useState(initialBranchesData?.pagination.page || 1);
  const [draftBranchFilters, setDraftBranchFilters] = useState<BranchFilterState>({ statuses: initialBranchesData?.appliedFilters.statuses || [], addressFilter: initialBranchesData?.appliedFilters.addressFilter || '' });
  const [appliedBranchFilters, setAppliedBranchFilters] = useState<BranchFilterState>({ statuses: initialBranchesData?.appliedFilters.statuses || [], addressFilter: initialBranchesData?.appliedFilters.addressFilter || '' });
  const initialBranchFetchRef = useRef(false);

  const [isBranchCreateOpen, setIsBranchCreateOpen] = useState(false);
  const [isBranchCreateSubmitting, setIsBranchCreateSubmitting] = useState(false);
  const [branchCreateError, setBranchCreateError] = useState<string | null>(null);
  const [branchCreateForm, setBranchCreateForm] = useState<BranchFormState>(initialBranchForm);

  const [isBranchEditOpen, setIsBranchEditOpen] = useState(false);
  const [isBranchEditSubmitting, setIsBranchEditSubmitting] = useState(false);
  const [branchEditError, setBranchEditError] = useState<string | null>(null);
  const [editingBranchId, setEditingBranchId] = useState<number | string | null>(null);
  const [branchEditForm, setBranchEditForm] = useState<BranchFormState>(initialBranchForm);

  const [selectedBranchId, setSelectedBranchId] = useState<number | string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<BranchDetail | null>(null);
  const [isBranchDetailLoading, setIsBranchDetailLoading] = useState(false);
  const [branchDetailError, setBranchDetailError] = useState<string | null>(null);

  const [isBranchDeleteOpen, setIsBranchDeleteOpen] = useState(false);
  const [deletingBranchId, setDeletingBranchId] = useState<number | string | null>(null);
  const [deletingBranchName, setDeletingBranchName] = useState('');
  const [isBranchDeleteSubmitting, setIsBranchDeleteSubmitting] = useState(false);
  const [branchDeleteError, setBranchDeleteError] = useState<string | null>(null);
  const [branchDeleteBlockers, setBranchDeleteBlockers] = useState<string[]>([]);

  // --- Departments state ---
  const [deptData, setDeptData] = useState<DepartmentsRegisterResponse | null>(initialDepartmentsData);
  const [deptError, setDeptError] = useState<string | null>(null);
  const [isDeptLoading, setIsDeptLoading] = useState(false);
  const [deptSearchInput, setDeptSearchInput] = useState(initialDepartmentsData?.appliedFilters.search || '');
  const [deptSubmittedSearch, setDeptSubmittedSearch] = useState(initialDepartmentsData?.appliedFilters.search || '');
  const [deptCurrentPage, setDeptCurrentPage] = useState(initialDepartmentsData?.pagination.page || 1);
  const [draftDeptFilters, setDraftDeptFilters] = useState<DepartmentFilterState>({ statuses: initialDepartmentsData?.appliedFilters.statuses || [], branchIds: initialDepartmentsData?.appliedFilters.branchIds || [], branchFilters: initialDepartmentsData?.appliedFilters.branchFilters || [] });
  const [appliedDeptFilters, setAppliedDeptFilters] = useState<DepartmentFilterState>({ statuses: initialDepartmentsData?.appliedFilters.statuses || [], branchIds: initialDepartmentsData?.appliedFilters.branchIds || [], branchFilters: initialDepartmentsData?.appliedFilters.branchFilters || [] });
  const initialDeptFetchRef = useRef(false);

  const [isDeptCreateOpen, setIsDeptCreateOpen] = useState(false);
  const [isDeptCreateSubmitting, setIsDeptCreateSubmitting] = useState(false);
  const [deptCreateError, setDeptCreateError] = useState<string | null>(null);
  const [deptCreateForm, setDeptCreateForm] = useState<DepartmentFormState>(initialDepartmentForm);

  const [isDeptEditOpen, setIsDeptEditOpen] = useState(false);
  const [isDeptEditSubmitting, setIsDeptEditSubmitting] = useState(false);
  const [deptEditError, setDeptEditError] = useState<string | null>(null);
  const [editingDeptId, setEditingDeptId] = useState<number | string | null>(null);
  const [deptEditForm, setDeptEditForm] = useState<DepartmentFormState>(initialDepartmentForm);

  const [selectedDeptId, setSelectedDeptId] = useState<number | string | null>(null);
  const [selectedDept, setSelectedDept] = useState<DepartmentDetail | null>(null);
  const [isDeptDetailLoading, setIsDeptDetailLoading] = useState(false);
  const [deptDetailError, setDeptDetailError] = useState<string | null>(null);

  const [isDeptDeleteOpen, setIsDeptDeleteOpen] = useState(false);
  const [deletingDeptId, setDeletingDeptId] = useState<number | string | null>(null);
  const [deletingDeptName, setDeletingDeptName] = useState('');
  const [isDeptDeleteSubmitting, setIsDeptDeleteSubmitting] = useState(false);
  const [deptDeleteError, setDeptDeleteError] = useState<string | null>(null);
  const [deptDeleteBlockers, setDeptDeleteBlockers] = useState<string[]>([]);

  // --- Locations state ---
  const [locData, setLocData] = useState<LocationsRegisterResponse | null>(initialLocationsData);
  const [locError, setLocError] = useState<string | null>(null);
  const [isLocLoading, setIsLocLoading] = useState(false);
  const [locSearchInput, setLocSearchInput] = useState(initialLocationsData?.appliedFilters.search || '');
  const [locSubmittedSearch, setLocSubmittedSearch] = useState(initialLocationsData?.appliedFilters.search || '');
  const [locCurrentPage, setLocCurrentPage] = useState(initialLocationsData?.pagination.page || 1);
  const [draftLocFilters, setDraftLocFilters] = useState<LocationFilterState>({ statuses: initialLocationsData?.appliedFilters.statuses || [], branchIds: initialLocationsData?.appliedFilters.branchIds || [], branchFilters: initialLocationsData?.appliedFilters.branchFilters || [] });
  const [appliedLocFilters, setAppliedLocFilters] = useState<LocationFilterState>({ statuses: initialLocationsData?.appliedFilters.statuses || [], branchIds: initialLocationsData?.appliedFilters.branchIds || [], branchFilters: initialLocationsData?.appliedFilters.branchFilters || [] });
  const initialLocFetchRef = useRef(false);

  const [isLocCreateOpen, setIsLocCreateOpen] = useState(false);
  const [isLocCreateSubmitting, setIsLocCreateSubmitting] = useState(false);
  const [locCreateError, setLocCreateError] = useState<string | null>(null);
  const [locCreateForm, setLocCreateForm] = useState<LocationFormState>(initialLocationForm);

  const [isLocEditOpen, setIsLocEditOpen] = useState(false);
  const [isLocEditSubmitting, setIsLocEditSubmitting] = useState(false);
  const [locEditError, setLocEditError] = useState<string | null>(null);
  const [editingLocId, setEditingLocId] = useState<number | string | null>(null);
  const [locEditForm, setLocEditForm] = useState<LocationFormState>(initialLocationForm);

  const [selectedLocId, setSelectedLocId] = useState<number | string | null>(null);
  const [selectedLoc, setSelectedLoc] = useState<LocationDetail | null>(null);
  const [isLocDetailLoading, setIsLocDetailLoading] = useState(false);
  const [locDetailError, setLocDetailError] = useState<string | null>(null);

  const [isLocDeleteOpen, setIsLocDeleteOpen] = useState(false);
  const [deletingLocId, setDeletingLocId] = useState<number | string | null>(null);
  const [deletingLocName, setDeletingLocName] = useState('');
  const [isLocDeleteSubmitting, setIsLocDeleteSubmitting] = useState(false);
  const [locDeleteError, setLocDeleteError] = useState<string | null>(null);
  const [locDeleteBlockers, setLocDeleteBlockers] = useState<string[]>([]);

  // --- URL tab sync ---
  useEffect(() => {
    const raw = searchParams.get('tab');
    const nextTab = raw === 'departments' || raw === 'locations' ? (raw as OrgDimensionTab) : 'branches';
    setActiveTab((previous) => (previous === nextTab ? previous : nextTab));
  }, [searchParams]);

  // --- Derived data ---
  const branchSection = branchData?.section ?? staticTabs[0];
  const deptSection = deptData?.section ?? staticTabs[1];
  const locSection = locData?.section ?? staticTabs[2];
  const branchFilterCount = appliedBranchFilters.statuses.length + (appliedBranchFilters.addressFilter ? 1 : 0);
  const deptFilterCount = appliedDeptFilters.statuses.length + appliedDeptFilters.branchIds.length + appliedDeptFilters.branchFilters.length;
  const locFilterCount = appliedLocFilters.statuses.length + appliedLocFilters.branchIds.length + appliedLocFilters.branchFilters.length;

  const currentSection = activeTab === 'branches' ? branchSection : activeTab === 'departments' ? deptSection : locSection;
  const currentMetrics = activeTab === 'branches' ? branchData?.section.metrics : activeTab === 'departments' ? deptData?.section.metrics : locData?.section.metrics;
  const currentRows = activeTab === 'branches' ? (branchData?.section.table.rows ?? []) : activeTab === 'departments' ? (deptData?.section.table.rows ?? []) : (locData?.section.table.rows ?? []);
  const currentPagination = activeTab === 'branches' ? branchData?.pagination : activeTab === 'departments' ? deptData?.pagination : locData?.pagination;
  const currentError = branchError || deptError || locError;
  const isLoading = isBranchLoading || isDeptLoading || isLocLoading;
  const columns = staticTabs.find((t) => t.id === activeTab)?.columns ?? [];
  const currentTotal = activeTab === 'branches' ? branchData?.totals.filteredBranches : activeTab === 'departments' ? deptData?.totals.filteredDepartments : locData?.totals.filteredLocations;

  // --- Fetch functions ---
  const fetchBranches = useCallback(async ({ search, page, filters }: { search: string; page: number; filters: BranchFilterState }) => {
    setIsBranchLoading(true);
    setBranchError(null);
    try {
      const data = await getBranchesRegister({ search, page, statuses: filters.statuses, addressFilter: filters.addressFilter });
      setBranchData(data);
    } catch (err) {
      setBranchError(err instanceof Error ? err.message : 'Unable to load branches.');
    } finally {
      setIsBranchLoading(false);
    }
  }, []);

  const fetchDepartments = useCallback(async ({ search, page, filters }: { search: string; page: number; filters: DepartmentFilterState }) => {
    setIsDeptLoading(true);
    setDeptError(null);
    try {
      const data = await getDepartmentsRegister({ search, page, statuses: filters.statuses, branchIds: filters.branchIds, branchFilters: filters.branchFilters });
      setDeptData(data);
    } catch (err) {
      setDeptError(err instanceof Error ? err.message : 'Unable to load departments.');
    } finally {
      setIsDeptLoading(false);
    }
  }, []);

  const fetchLocations = useCallback(async ({ search, page, filters }: { search: string; page: number; filters: LocationFilterState }) => {
    setIsLocLoading(true);
    setLocError(null);
    try {
      const data = await getLocationsRegister({ search, page, statuses: filters.statuses, branchIds: filters.branchIds, branchFilters: filters.branchFilters });
      setLocData(data);
    } catch (err) {
      setLocError(err instanceof Error ? err.message : 'Unable to load locations.');
    } finally {
      setIsLocLoading(false);
    }
  }, []);

  // --- Initial fetch skip effects ---
  useEffect(() => {
    if (activeTab !== 'branches') return;
    if (!initialBranchFetchRef.current && initialBranchesData) { initialBranchFetchRef.current = true; return; }
    void fetchBranches({ search: branchSubmittedSearch, page: branchCurrentPage, filters: appliedBranchFilters });
  }, [activeTab, appliedBranchFilters, branchCurrentPage, branchSubmittedSearch, fetchBranches, initialBranchesData]);

  useEffect(() => {
    if (activeTab !== 'departments') return;
    if (!initialDeptFetchRef.current && initialDepartmentsData) { initialDeptFetchRef.current = true; return; }
    void fetchDepartments({ search: deptSubmittedSearch, page: deptCurrentPage, filters: appliedDeptFilters });
  }, [activeTab, appliedDeptFilters, deptCurrentPage, deptSubmittedSearch, fetchDepartments, initialDepartmentsData]);

  useEffect(() => {
    if (activeTab !== 'locations') return;
    if (!initialLocFetchRef.current && initialLocationsData) { initialLocFetchRef.current = true; return; }
    void fetchLocations({ search: locSubmittedSearch, page: locCurrentPage, filters: appliedLocFilters });
  }, [activeTab, appliedLocFilters, locCurrentPage, locSubmittedSearch, fetchLocations, initialLocationsData]);

  // --- Tab change ---
  const handleTabChange = (tabId: OrgDimensionTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // --- Search submit ---
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (activeTab === 'branches') { setBranchCurrentPage(1); setBranchSubmittedSearch(branchSearchInput.trim()); }
    else if (activeTab === 'departments') { setDeptCurrentPage(1); setDeptSubmittedSearch(deptSearchInput.trim()); }
    else { setLocCurrentPage(1); setLocSubmittedSearch(locSearchInput.trim()); }
  };

  // --- Filter apply/reset ---
  const handleApplyFilters = () => {
    if (activeTab === 'branches') {
      if (JSON.stringify(draftBranchFilters) !== JSON.stringify(appliedBranchFilters)) {
        setBranchCurrentPage(1);
        setAppliedBranchFilters({ ...draftBranchFilters });
      }
    } else if (activeTab === 'departments') {
      if (JSON.stringify(draftDeptFilters) !== JSON.stringify(appliedDeptFilters)) {
        setDeptCurrentPage(1);
        setAppliedDeptFilters({ ...draftDeptFilters });
      }
    } else {
      if (JSON.stringify(draftLocFilters) !== JSON.stringify(appliedLocFilters)) {
        setLocCurrentPage(1);
        setAppliedLocFilters({ ...draftLocFilters });
      }
    }
    setIsFilterPanelOpen(false);
  };

  const handleResetFilters = () => {
    if (activeTab === 'branches') {
      const reset: BranchFilterState = { statuses: [], addressFilter: '' };
      setDraftBranchFilters(reset);
      setAppliedBranchFilters(reset);
      setBranchCurrentPage(1);
    } else if (activeTab === 'departments') {
      const reset: DepartmentFilterState = { statuses: [], branchIds: [], branchFilters: [] };
      setDraftDeptFilters(reset);
      setAppliedDeptFilters(reset);
      setDeptCurrentPage(1);
    } else {
      const reset: LocationFilterState = { statuses: [], branchIds: [], branchFilters: [] };
      setDraftLocFilters(reset);
      setAppliedLocFilters(reset);
      setLocCurrentPage(1);
    }
    setIsFilterPanelOpen(false);
  };

  const handleToggleQuickFilter = (value: string) => {
    if (activeTab === 'branches') {
      if (value.startsWith('status:')) {
        const status = value.replace('status:', '');
        const newStatuses = toggleFilterValue(appliedBranchFilters.statuses, status);
        setAppliedBranchFilters((prev) => ({ ...prev, statuses: newStatuses }));
        setDraftBranchFilters((prev) => ({ ...prev, statuses: newStatuses }));
        setBranchCurrentPage(1);
      } else if (value === 'hasAddress') {
        const newVal = appliedBranchFilters.addressFilter === 'hasAddress' ? '' : 'hasAddress';
        setAppliedBranchFilters((prev) => ({ ...prev, addressFilter: newVal }));
        setDraftBranchFilters((prev) => ({ ...prev, addressFilter: newVal }));
        setBranchCurrentPage(1);
      }
    } else if (activeTab === 'departments') {
      if (value.startsWith('status:')) {
        const status = value.replace('status:', '');
        const newStatuses = toggleFilterValue(appliedDeptFilters.statuses, status);
        setAppliedDeptFilters((prev) => ({ ...prev, statuses: newStatuses }));
        setDraftDeptFilters((prev) => ({ ...prev, statuses: newStatuses }));
        setDeptCurrentPage(1);
      } else if (value === 'byBranch' || value === 'withoutBranch') {
        const newBranchFilters = toggleFilterValue(appliedDeptFilters.branchFilters, value);
        setAppliedDeptFilters((prev) => ({ ...prev, branchFilters: newBranchFilters }));
        setDraftDeptFilters((prev) => ({ ...prev, branchFilters: newBranchFilters }));
        setDeptCurrentPage(1);
      }
    } else {
      if (value.startsWith('status:')) {
        const status = value.replace('status:', '');
        const newStatuses = toggleFilterValue(appliedLocFilters.statuses, status);
        setAppliedLocFilters((prev) => ({ ...prev, statuses: newStatuses }));
        setDraftLocFilters((prev) => ({ ...prev, statuses: newStatuses }));
        setLocCurrentPage(1);
      } else if (value === 'byBranch' || value === 'withoutBranch') {
        const newBranchFilters = toggleFilterValue(appliedLocFilters.branchFilters, value);
        setAppliedLocFilters((prev) => ({ ...prev, branchFilters: newBranchFilters }));
        setDraftLocFilters((prev) => ({ ...prev, branchFilters: newBranchFilters }));
        setLocCurrentPage(1);
      }
    }
  };

  // --- Refresh ---
  const handleRefresh = () => {
    if (activeTab === 'branches') void fetchBranches({ search: branchSubmittedSearch, page: branchCurrentPage, filters: appliedBranchFilters });
    else if (activeTab === 'departments') void fetchDepartments({ search: deptSubmittedSearch, page: deptCurrentPage, filters: appliedDeptFilters });
    else void fetchLocations({ search: locSubmittedSearch, page: locCurrentPage, filters: appliedLocFilters });
  };

  // --- Export CSV ---
  const handleExport = () => {
    let rows: StaticTableCell[][];
    let filename: string;
    let headers: string[];

    if (activeTab === 'branches') {
      headers = ['Branch Code', 'Name', 'Address', 'Created By', 'Updated By', 'Status'];
      rows = (branchData?.section.table.rows ?? []).map((r) => [
        (r as BranchRegisterRow).branchCode ?? '-', r.name ?? '-',
        (r as BranchRegisterRow).address ?? '-', r.createdBy ?? '-',
        r.updatedBy ?? '-', r.statusLabel ?? '-',
      ]);
      filename = 'branch-register.csv';
    } else if (activeTab === 'departments') {
      headers = ['Department Code', 'Name', 'Branch', 'Created By', 'Updated By', 'Status'];
      rows = (deptData?.section.table.rows ?? []).map((r) => [
        (r as DepartmentRegisterRow).departmentCode ?? '-', r.name ?? '-',
        (r as DepartmentRegisterRow).branchCode ?? (r as DepartmentRegisterRow).branchName ?? '-',
        r.createdBy ?? '-', r.updatedBy ?? '-', r.statusLabel ?? '-',
      ]);
      filename = 'department-register.csv';
    } else {
      headers = ['Location Code', 'Name', 'Branch', 'Created By', 'Updated By', 'Status'];
      rows = (locData?.section.table.rows ?? []).map((r) => {
        const row = r as LocationRegisterRow;
        return [row.locationCode ?? '-', row.name ?? '-', row.branchCode ?? row.branchName ?? '-',
          row.createdBy ?? '-', row.updatedBy ?? '-', row.statusLabel ?? '-'];
      });
      filename = 'location-register.csv';
    }

    if (!rows.length) return;
    const csvContent = [
      headers.map((h) => escapeCsvValue(h)),
      ...rows.map((r) => r.map((c) => escapeCsvValue(typeof c === 'string' ? c : c.text))),
    ].map((r) => r.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- View detail ---
  const handleView = async (id: number | string) => {
    if (activeTab === 'branches') {
      setSelectedBranchId(id); setSelectedBranch(null); setBranchDetailError(null); setIsBranchDetailLoading(true);
      try { setSelectedBranch(await getBranchDetail(id)); } catch (err) { setBranchDetailError(err instanceof Error ? err.message : 'Unable to load branch.'); } finally { setIsBranchDetailLoading(false); }
    } else if (activeTab === 'departments') {
      setSelectedDeptId(id); setSelectedDept(null); setDeptDetailError(null); setIsDeptDetailLoading(true);
      try { setSelectedDept(await getDepartmentDetail(id)); } catch (err) { setDeptDetailError(err instanceof Error ? err.message : 'Unable to load department.'); } finally { setIsDeptDetailLoading(false); }
    } else {
      setSelectedLocId(id); setSelectedLoc(null); setLocDetailError(null); setIsLocDetailLoading(true);
      try { setSelectedLoc(await getLocationDetail(id)); } catch (err) { setLocDetailError(err instanceof Error ? err.message : 'Unable to load location.'); } finally { setIsLocDetailLoading(false); }
    }
  };

  const handleCloseDetail = () => {
    [setSelectedBranchId, setSelectedDeptId, setSelectedLocId].forEach((fn) => fn(null));
    [setSelectedBranch, setSelectedDept, setSelectedLoc].forEach((fn) => fn(null));
    [setBranchDetailError, setDeptDetailError, setLocDetailError].forEach((fn) => fn(null));
    [setIsBranchDetailLoading, setIsDeptDetailLoading, setIsLocDetailLoading].forEach((fn) => fn(false));
  };

  // --- Delete ---
  const handleOpenDelete = async (id: number | string, name: string) => {
    if (activeTab === 'branches') {
      setBranchDeleteError(null); setBranchDeleteBlockers([]); setDeletingBranchId(id); setDeletingBranchName(name);
      setIsBranchDeleteSubmitting(false); setIsBranchDeleteOpen(true);
    } else if (activeTab === 'departments') {
      setDeptDeleteError(null); setDeptDeleteBlockers([]); setDeletingDeptId(id); setDeletingDeptName(name);
      setIsDeptDeleteSubmitting(false); setIsDeptDeleteOpen(true);
    } else {
      setLocDeleteError(null); setLocDeleteBlockers([]); setDeletingLocId(id); setDeletingLocName(name);
      setIsLocDeleteSubmitting(false); setIsLocDeleteOpen(true);
    }
  };

  const handleCloseDelete = () => {
    setIsBranchDeleteOpen(false); setDeletingBranchId(null); setDeletingBranchName(''); setIsBranchDeleteSubmitting(false); setBranchDeleteError(null); setBranchDeleteBlockers([]);
    setIsDeptDeleteOpen(false); setDeletingDeptId(null); setDeletingDeptName(''); setIsDeptDeleteSubmitting(false); setDeptDeleteError(null); setDeptDeleteBlockers([]);
    setIsLocDeleteOpen(false); setDeletingLocId(null); setDeletingLocName(''); setIsLocDeleteSubmitting(false); setLocDeleteError(null); setLocDeleteBlockers([]);
  };

  const handleConfirmDelete = async () => {
    if (activeTab === 'branches' && deletingBranchId !== null) {
      setIsBranchDeleteSubmitting(true); setBranchDeleteError(null);
      try {
        await deleteBranch(deletingBranchId); handleCloseDelete();
        void fetchBranches({ search: branchSubmittedSearch, page: branchCurrentPage, filters: appliedBranchFilters });
      } catch (err) { setBranchDeleteError(err instanceof Error ? err.message : 'Unable to delete branch.'); setIsBranchDeleteSubmitting(false); }
    } else if (activeTab === 'departments' && deletingDeptId !== null) {
      setIsDeptDeleteSubmitting(true); setDeptDeleteError(null);
      try {
        await deleteDepartment(deletingDeptId); handleCloseDelete();
        void fetchDepartments({ search: deptSubmittedSearch, page: deptCurrentPage, filters: appliedDeptFilters });
      } catch (err) { setDeptDeleteError(err instanceof Error ? err.message : 'Unable to delete department.'); setIsDeptDeleteSubmitting(false); }
    } else if (activeTab === 'locations' && deletingLocId !== null) {
      setIsLocDeleteSubmitting(true); setLocDeleteError(null);
      try {
        await deleteLocation(deletingLocId); handleCloseDelete();
        void fetchLocations({ search: locSubmittedSearch, page: locCurrentPage, filters: appliedLocFilters });
      } catch (err) { setLocDeleteError(err instanceof Error ? err.message : 'Unable to delete location.'); setIsLocDeleteSubmitting(false); }
    }
  };

  // --- Create ---
  const handleOpenCreate = () => {
    if (activeTab === 'branches') { setBranchCreateError(null); setBranchCreateForm(initialBranchForm); setIsBranchCreateOpen(true); }
    else if (activeTab === 'departments') { setDeptCreateError(null); setDeptCreateForm(initialDepartmentForm); setIsDeptCreateOpen(true); }
    else { setLocCreateError(null); setLocCreateForm(initialLocationForm); setIsLocCreateOpen(true); }
  };

  const handleCloseCreate = () => {
    setIsBranchCreateOpen(false); setBranchCreateError(null); setBranchCreateForm(initialBranchForm); setIsBranchCreateSubmitting(false);
    setIsDeptCreateOpen(false); setDeptCreateError(null); setDeptCreateForm(initialDepartmentForm); setIsDeptCreateSubmitting(false);
    setIsLocCreateOpen(false); setLocCreateError(null); setLocCreateForm(initialLocationForm); setIsLocCreateSubmitting(false);
  };

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (activeTab === 'branches') {
      setIsBranchCreateSubmitting(true); setBranchCreateError(null);
      try {
        const created = await createBranch({
          branchCode: branchCreateForm.branchCode, name: branchCreateForm.name,
          status: branchCreateForm.status, address: branchCreateForm.address || null,
          notes: branchCreateForm.notes || null,
        });
        handleCloseCreate(); setBranchCurrentPage(1);
        await fetchBranches({ search: branchSubmittedSearch, page: 1, filters: appliedBranchFilters });
        await handleView(created.id);
      } catch (err) { setBranchCreateError(err instanceof Error ? err.message : 'Unable to create branch.'); setIsBranchCreateSubmitting(false); }
    } else if (activeTab === 'departments') {
      setIsDeptCreateSubmitting(true); setDeptCreateError(null);
      try {
        const created = await createDepartment({
          departmentCode: deptCreateForm.departmentCode, name: deptCreateForm.name,
          status: deptCreateForm.status, branch: deptCreateForm.branch || null,
          notes: deptCreateForm.notes || null,
        });
        handleCloseCreate(); setDeptCurrentPage(1);
        await fetchDepartments({ search: deptSubmittedSearch, page: 1, filters: appliedDeptFilters });
        await handleView(created.id);
      } catch (err) { setDeptCreateError(err instanceof Error ? err.message : 'Unable to create department.'); setIsDeptCreateSubmitting(false); }
    } else {
      setIsLocCreateSubmitting(true); setLocCreateError(null);
      try {
        const created = await createLocation({
          locationCode: locCreateForm.locationCode, name: locCreateForm.name,
          status: locCreateForm.status, branch: locCreateForm.branch || null,
          notes: locCreateForm.notes || null,
        });
        handleCloseCreate(); setLocCurrentPage(1);
        await fetchLocations({ search: locSubmittedSearch, page: 1, filters: appliedLocFilters });
        await handleView(created.id);
      } catch (err) { setLocCreateError(err instanceof Error ? err.message : 'Unable to create location.'); setIsLocCreateSubmitting(false); }
    }
  };

  // --- Edit ---
  const handleOpenEdit = async (id: number | string) => {
    handleCloseDetail();
    if (activeTab === 'branches') {
      setEditingBranchId(id); setBranchEditForm(initialBranchForm); setBranchEditError(null); setIsBranchEditSubmitting(false); setIsBranchEditOpen(true);
      try { setBranchEditForm(mapBranchDetailToForm(await getBranchDetail(id))); } catch (err) { setBranchEditError(err instanceof Error ? err.message : 'Unable to load for editing.'); }
    } else if (activeTab === 'departments') {
      setEditingDeptId(id); setDeptEditForm(initialDepartmentForm); setDeptEditError(null); setIsDeptEditSubmitting(false); setIsDeptEditOpen(true);
      try { setDeptEditForm(mapDepartmentDetailToForm(await getDepartmentDetail(id))); } catch (err) { setDeptEditError(err instanceof Error ? err.message : 'Unable to load for editing.'); }
    } else {
      setEditingLocId(id); setLocEditForm(initialLocationForm); setLocEditError(null); setIsLocEditSubmitting(false); setIsLocEditOpen(true);
      try { setLocEditForm(mapLocationDetailToForm(await getLocationDetail(id))); } catch (err) { setLocEditError(err instanceof Error ? err.message : 'Unable to load for editing.'); }
    }
  };

  const handleCloseEdit = () => {
    setIsBranchEditOpen(false); setIsBranchEditSubmitting(false); setBranchEditError(null); setEditingBranchId(null); setBranchEditForm(initialBranchForm);
    setIsDeptEditOpen(false); setIsDeptEditSubmitting(false); setDeptEditError(null); setEditingDeptId(null); setDeptEditForm(initialDepartmentForm);
    setIsLocEditOpen(false); setIsLocEditSubmitting(false); setLocEditError(null); setEditingLocId(null); setLocEditForm(initialLocationForm);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (activeTab === 'branches' && editingBranchId !== null) {
      setIsBranchEditSubmitting(true); setBranchEditError(null);
      try {
        const updated = await updateBranch(editingBranchId, {
          branchCode: branchEditForm.branchCode, name: branchEditForm.name,
          status: branchEditForm.status, address: branchEditForm.address || null,
          notes: branchEditForm.notes || null,
        });
        handleCloseEdit();
        void fetchBranches({ search: branchSubmittedSearch, page: branchCurrentPage, filters: appliedBranchFilters });
        await handleView(updated.id);
      } catch (err) { setBranchEditError(err instanceof Error ? err.message : 'Unable to update branch.'); setIsBranchEditSubmitting(false); }
    } else if (activeTab === 'departments' && editingDeptId !== null) {
      setIsDeptEditSubmitting(true); setDeptEditError(null);
      try {
        const updated = await updateDepartment(editingDeptId, {
          departmentCode: deptEditForm.departmentCode, name: deptEditForm.name,
          status: deptEditForm.status, branch: deptEditForm.branch || null,
          notes: deptEditForm.notes || null,
        });
        handleCloseEdit();
        void fetchDepartments({ search: deptSubmittedSearch, page: deptCurrentPage, filters: appliedDeptFilters });
        await handleView(updated.id);
      } catch (err) { setDeptEditError(err instanceof Error ? err.message : 'Unable to update department.'); setIsDeptEditSubmitting(false); }
    } else if (activeTab === 'locations' && editingLocId !== null) {
      setIsLocEditSubmitting(true); setLocEditError(null);
      try {
        const updated = await updateLocation(editingLocId, {
          locationCode: locEditForm.locationCode, name: locEditForm.name,
          status: locEditForm.status, branch: locEditForm.branch || null,
          notes: locEditForm.notes || null,
        });
        handleCloseEdit();
        void fetchLocations({ search: locSubmittedSearch, page: locCurrentPage, filters: appliedLocFilters });
        await handleView(updated.id);
      } catch (err) { setLocEditError(err instanceof Error ? err.message : 'Unable to update location.'); setIsLocEditSubmitting(false); }
    }
  };

  // ===== RENDER =====

  const entityLabel = activeTab === 'branches' ? 'Branch' : activeTab === 'departments' ? 'Department' : 'Location';
  const entityType = activeTab === 'branches' ? 'branch' : activeTab === 'departments' ? 'department' : 'location';
  const entityLabelPlural = activeTab === 'branches' ? 'Branches' : activeTab === 'departments' ? 'Departments' : 'Locations';

  const isCreateOpen = isBranchCreateOpen || isDeptCreateOpen || isLocCreateOpen;
  const isCreateSubmitting = isBranchCreateSubmitting || isDeptCreateSubmitting || isLocCreateSubmitting;
  const createErr = branchCreateError || deptCreateError || locCreateError;
  const isEditOpen = isBranchEditOpen || isDeptEditOpen || isLocEditOpen;
  const isEditSubmitting = isBranchEditSubmitting || isDeptEditSubmitting || isLocEditSubmitting;
  const editErr = branchEditError || deptEditError || locEditError;
  const isDetailOpen = selectedBranchId !== null || selectedDeptId !== null || selectedLocId !== null;
  const isDetailLoading = isBranchDetailLoading || isDeptDetailLoading || isLocDetailLoading;
  const detailErr = branchDetailError || deptDetailError || locDetailError;
  const isDeleteOpen = isBranchDeleteOpen || isDeptDeleteOpen || isLocDeleteOpen;
  const isDeleteSubmitting = isBranchDeleteSubmitting || isDeptDeleteSubmitting || isLocDeleteSubmitting;
  const deleteErr = branchDeleteError || deptDeleteError || locDeleteError;
  const activeDeleteBlockers = activeTab === 'branches' ? branchDeleteBlockers : activeTab === 'departments' ? deptDeleteBlockers : locDeleteBlockers;
  const deleteEntityName = deletingBranchName || deletingDeptName || deletingLocName || entityLabel;
  const branchOptions = [{ label: 'No branch', value: '' }, ...(activeTab === 'departments' ? (deptData?.section.filters.branches ?? []) : (locData?.section.filters.branches ?? []))];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Core / Master Records</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700"><FileText className="h-6 w-6" /></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Organization & Reporting Dimensions</h1>
              <p className="mt-1 max-w-3xl text-sm text-gray-600">Maintain branches, departments, and locations used to segment records and drive accounting reporting filters.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs card */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Tab bar */}
        <div className="border-b border-gray-200 px-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {staticTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} type="button" onClick={() => handleTabChange(tab.id as OrgDimensionTab)}
                  className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab content */}
        <div className="space-y-6 p-6">
          {/* Tab header */}
          <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-gray-900">{currentSection.label}</h2>
              <p className="text-sm text-gray-600">{currentSection.description}</p>
              <p className="text-sm text-gray-500">{currentTotal ?? 0} matching {activeTab === 'branches' ? 'branches' : activeTab === 'departments' ? 'departments' : 'locations'}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
                <Plus className="h-4 w-4" /> Create {entityLabel}
              </button>
              <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
              <button type="button" onClick={handleExport}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={activeTab === 'branches' ? !branchData?.section.table.rows.length : activeTab === 'departments' ? !deptData?.section.table.rows.length : !locData?.section.table.rows.length}>
                <Download className="h-4 w-4" /> Download View
              </button>
            </div>
          </div>

          {/* Metrics */}
          {currentMetrics && currentMetrics.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
              {currentMetrics.map((metric) => (
                <div key={metric.id}>
                  <MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
              {staticTabs.find((t) => t.id === activeTab)?.metrics.map((metric, i) => (
                <div key={i}>
                  <MetricCard label={metric.label} value={0} change={metric.change} trend="neutral" />
                </div>
              ))}
            </div>
          )}

          {/* Table card */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Search + filters */}
            <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                <form onSubmit={handleSearchSubmit} className="relative min-w-0 flex-1 max-w-xl">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder={currentSection.searchPlaceholder}
                    value={activeTab === 'branches' ? branchSearchInput : activeTab === 'departments' ? deptSearchInput : locSearchInput}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (activeTab === 'branches') setBranchSearchInput(v);
                      else if (activeTab === 'departments') setDeptSearchInput(v);
                      else setLocSearchInput(v);
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </form>
                <button type="button" onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                  <Filter className="h-4 w-4" /> Filters
                  {(branchFilterCount || deptFilterCount || locFilterCount) > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                      {activeTab === 'branches' ? branchFilterCount : activeTab === 'departments' ? deptFilterCount : locFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Quick filter chips */}
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const branchQf = branchData?.section?.filters?.quickFilters;
                  const deptQf = deptData?.section?.filters?.quickFilters;
                  const locQf = locData?.section?.filters?.quickFilters;
                  const tabsStatic = staticTabs.find((t) => t.id === activeTab);

                  if (activeTab === 'branches') {
                    if (branchQf && branchQf.length > 0) {
                      return branchQf.map((qf) => {
                        const isActive = qf.value.startsWith('status:')
                          ? appliedBranchFilters.statuses.includes(qf.value.replace('status:', ''))
                          : appliedBranchFilters.addressFilter === qf.value;
                        return (
                          <button key={qf.value} type="button" onClick={() => handleToggleQuickFilter(qf.value)}
                            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                            {qf.label}
                          </button>
                        );
                      });
                    }
                    return tabsStatic?.filters.map((f, i) => (
                      <button key={f} type="button" onClick={() => handleToggleQuickFilter(f === 'With Address' ? 'hasAddress' : `status:${f.toLowerCase()}`)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${i === 0 ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                        {f}
                      </button>
                    ));
                  }

                  if (activeTab === 'departments' && deptQf && deptQf.length > 0) {
                    return deptQf.map((qf) => {
                      const isActive = qf.value.startsWith('status:')
                        ? appliedDeptFilters.statuses.includes(qf.value.replace('status:', ''))
                        : appliedDeptFilters.branchFilters.includes(qf.value);
                      return (
                        <button key={qf.value} type="button" onClick={() => handleToggleQuickFilter(qf.value)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}>
                          {qf.label}
                        </button>
                      );
                    });
                  }

                  if (activeTab === 'locations' && locQf && locQf.length > 0) {
                    return locQf.map((qf) => {
                      const isActive = qf.value.startsWith('status:')
                        ? appliedLocFilters.statuses.includes(qf.value.replace('status:', ''))
                        : appliedLocFilters.branchFilters.includes(qf.value);
                      return (
                        <button key={qf.value} type="button" onClick={() => handleToggleQuickFilter(qf.value)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}>
                          {qf.label}
                        </button>
                      );
                    });
                  }

                  return null;
                })()}
              </div>
            </div>

            {/* Filter panel */}
            {isFilterPanelOpen && (
              <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900">Status Filters</h4>
                  <div className="flex gap-2">
                    <button type="button" onClick={handleResetFilters} className="text-sm text-gray-500 hover:text-gray-700">Reset</button>
                    <button type="button" onClick={handleApplyFilters} className="rounded-lg bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700">Apply</button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {ACCOUNTING_DIMENSION_STATUS_OPTIONS.map((opt) => {
                    const isSelected = activeTab === 'branches'
                      ? draftBranchFilters.statuses.includes(opt.value)
                      : activeTab === 'departments'
                        ? draftDeptFilters.statuses.includes(opt.value)
                        : draftLocFilters.statuses.includes(opt.value);
                    return (
                      <button key={opt.value} type="button" onClick={() => {
                        if (activeTab === 'branches') setDraftBranchFilters((p) => ({ ...p, statuses: toggleFilterValue(p.statuses, opt.value) }));
                        else if (activeTab === 'departments') setDraftDeptFilters((p) => ({ ...p, statuses: toggleFilterValue(p.statuses, opt.value) }));
                        else setDraftLocFilters((p) => ({ ...p, statuses: toggleFilterValue(p.statuses, opt.value) }));
                      }}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Table */}
            <div className="space-y-4 p-5">
              {currentError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {currentError}
                </div>
              )}

              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                <>
                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {columns.map((col) => (
                              <th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{col}</th>
                            ))}
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {currentRows.length === 0 ? (
                            <tr>
                              <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-sm text-gray-500">No records found.</td>
                            </tr>
                          ) : (
                            currentRows.map((row: any) => (
                              <tr key={row.id} className="hover:bg-gray-50">
                                {row.cells.map((cell: StaticTableCell, idx: number) => renderCell(cell, idx))}
                                <td className="px-4 py-3 text-right">
                                  <div className="inline-flex items-center gap-1">
                                    <button type="button" onClick={() => handleView(row.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600" title="View">
                                      <Eye className="h-4 w-4" />
                                    </button>
                                    <button type="button" onClick={() => handleOpenEdit(row.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-amber-600" title="Edit">
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button type="button" onClick={() => { const n = row.branchCode || row.departmentCode || row.locationCode || row.name || ''; handleOpenDelete(row.id, n); }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600" title="Delete">
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination */}
                  {currentPagination && (
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                      <p className="text-sm text-gray-600">
                        Page {currentPagination.page} of {currentPagination.totalPages} ({currentPagination.totalDocs} total)
                      </p>
                      <div className="flex gap-2">
                        <button type="button" disabled={!currentPagination.hasPrevPage}
                          onClick={() => {
                            if (activeTab === 'branches') setBranchCurrentPage((p) => Math.max(1, p - 1));
                            else if (activeTab === 'departments') setDeptCurrentPage((p) => Math.max(1, p - 1));
                            else setLocCurrentPage((p) => Math.max(1, p - 1));
                          }}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                          Previous
                        </button>
                        <button type="button" disabled={!currentPagination.hasNextPage}
                          onClick={() => {
                            if (activeTab === 'branches') setBranchCurrentPage((p) => p + 1);
                            else if (activeTab === 'departments') setDeptCurrentPage((p) => p + 1);
                            else setLocCurrentPage((p) => p + 1);
                          }}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Slide-over detail */}
      <SlideOver isOpen={isDetailOpen} onClose={handleCloseDetail} title={`${entityLabel} Detail`}>
        {isDetailLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-6 animate-pulse rounded bg-gray-200" />)}
          </div>
        ) : detailErr ? (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {detailErr}
          </div>
        ) : (selectedBranch || selectedDept || selectedLoc) ? (
          <div className="space-y-4 text-sm">
            {((): React.ReactNode => {
              const d = selectedBranch || selectedDept || selectedLoc;
              if (!d) return null;
              const code = 'branchCode' in d ? d.branchCode : 'departmentCode' in d ? d.departmentCode : 'locationCode' in d ? d.locationCode : null;
              return (
                <>
                  <div><span className="font-medium text-gray-500">Code:</span> <span className="ml-2 text-gray-900">{code || '-'}</span></div>
                  <div><span className="font-medium text-gray-500">Name:</span> <span className="ml-2 text-gray-900">{d.name || '-'}</span></div>
                  <div><span className="font-medium text-gray-500">Status:</span> <span className={`ml-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusBadgeClasses(d.status)}`}>{d.status || '-'}</span></div>
                  {'branch' in d && d.branch ? <div><span className="font-medium text-gray-500">Branch:</span> <span className="ml-2 text-gray-900">{typeof d.branch === 'object' ? `${d.branch.branchCode ?? ''} - ${d.branch.name ?? ''}` : String(d.branch)}</span></div> : null}
                  {'notes' in d && d.notes ? <div><span className="font-medium text-gray-500">Notes:</span> <span className="ml-2 text-gray-900">{d.notes}</span></div> : null}
                  <div><span className="font-medium text-gray-500">Created:</span> <span className="ml-2 text-gray-900">{formatDateTime(d.createdAt)}</span></div>
                  <div><span className="font-medium text-gray-500">Updated:</span> <span className="ml-2 text-gray-900">{formatDateTime(d.updatedAt)}</span></div>
                  <div><span className="font-medium text-gray-500">Created By:</span> <span className="ml-2 text-gray-900">{formatUser(d.createdBy)}</span></div>
                  <div><span className="font-medium text-gray-500">Updated By:</span> <span className="ml-2 text-gray-900">{formatUser(d.updatedBy)}</span></div>
                  <div className="flex gap-2 pt-4">
                    <button type="button" onClick={() => { const id = d.id; handleCloseDetail(); handleOpenEdit(id); }} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      <Edit className="h-4 w-4" /> Edit
                    </button>
                    <button type="button" onClick={handleCloseDetail} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      Close
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        ) : null}
      </SlideOver>

      {/* Create Modal */}
      <SlideOver isOpen={isCreateOpen} onClose={handleCloseCreate} title={`Create ${entityLabel}`}>
        {createErr && <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{createErr}</div>}
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <FormField label={`${entityLabel} Code`} required>
            <Input value={activeTab === 'branches' ? branchCreateForm.branchCode : activeTab === 'departments' ? deptCreateForm.departmentCode : locCreateForm.locationCode}
              onChange={(v) => {
                if (activeTab === 'branches') setBranchCreateForm((p) => ({ ...p, branchCode: v }));
                else if (activeTab === 'departments') setDeptCreateForm((p) => ({ ...p, departmentCode: v }));
                else setLocCreateForm((p) => ({ ...p, locationCode: v }));
              }} placeholder={`Enter ${entityLabel.toLowerCase()} code`} required />
          </FormField>
          <FormField label="Name" required>
            <Input value={activeTab === 'branches' ? branchCreateForm.name : activeTab === 'departments' ? deptCreateForm.name : locCreateForm.name}
              onChange={(v) => {
                if (activeTab === 'branches') setBranchCreateForm((p) => ({ ...p, name: v }));
                else if (activeTab === 'departments') setDeptCreateForm((p) => ({ ...p, name: v }));
                else setLocCreateForm((p) => ({ ...p, name: v }));
              }} placeholder={`Enter ${entityLabel.toLowerCase()} name`} required />
          </FormField>
          <FormField label="Status">
            <Select value={activeTab === 'branches' ? branchCreateForm.status : activeTab === 'departments' ? deptCreateForm.status : locCreateForm.status}
              onChange={(v) => {
                if (activeTab === 'branches') setBranchCreateForm((p) => ({ ...p, status: v }));
                else if (activeTab === 'departments') setDeptCreateForm((p) => ({ ...p, status: v }));
                else setLocCreateForm((p) => ({ ...p, status: v }));
              }} options={ACCOUNTING_DIMENSION_STATUS_OPTIONS} />
          </FormField>
          {activeTab !== 'branches' && (
            <FormField label="Branch">
              <Select value={activeTab as string === 'departments' ? deptCreateForm.branch : locCreateForm.branch}
                onChange={(v) => {
                  if (activeTab === 'departments') setDeptCreateForm((p) => ({ ...p, branch: v }));
                  else setLocCreateForm((p) => ({ ...p, branch: v }));
                }} options={branchOptions} />
            </FormField>
          )}
          <FormField label="Notes">
            <TextArea value={activeTab === 'branches' ? branchCreateForm.notes : activeTab === 'departments' ? deptCreateForm.notes : locCreateForm.notes}
              onChange={(v) => {
                if (activeTab === 'branches') setBranchCreateForm((p) => ({ ...p, notes: v }));
                else if (activeTab === 'departments') setDeptCreateForm((p) => ({ ...p, notes: v }));
                else setLocCreateForm((p) => ({ ...p, notes: v }));
              }} />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={handleCloseCreate} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isCreateSubmitting} className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {isCreateSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </SlideOver>

      {/* Edit Modal */}
      <SlideOver isOpen={isEditOpen} onClose={handleCloseEdit} title={`Edit ${entityLabel}`}>
        {editErr && <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{editErr}</div>}
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <FormField label={`${entityLabel} Code`} required>
            <Input value={activeTab === 'branches' ? branchEditForm.branchCode : activeTab === 'departments' ? deptEditForm.departmentCode : locEditForm.locationCode}
              onChange={(v) => {
                if (activeTab === 'branches') setBranchEditForm((p) => ({ ...p, branchCode: v }));
                else if (activeTab === 'departments') setDeptEditForm((p) => ({ ...p, departmentCode: v }));
                else setLocEditForm((p) => ({ ...p, locationCode: v }));
              }} required />
          </FormField>
          <FormField label="Name" required>
            <Input value={activeTab === 'branches' ? branchEditForm.name : activeTab === 'departments' ? deptEditForm.name : locEditForm.name}
              onChange={(v) => {
                if (activeTab === 'branches') setBranchEditForm((p) => ({ ...p, name: v }));
                else if (activeTab === 'departments') setDeptEditForm((p) => ({ ...p, name: v }));
                else setLocEditForm((p) => ({ ...p, name: v }));
              }} required />
          </FormField>
          <FormField label="Status">
            <Select value={activeTab === 'branches' ? branchEditForm.status : activeTab === 'departments' ? deptEditForm.status : locEditForm.status}
              onChange={(v) => {
                if (activeTab === 'branches') setBranchEditForm((p) => ({ ...p, status: v }));
                else if (activeTab === 'departments') setDeptEditForm((p) => ({ ...p, status: v }));
                else setLocEditForm((p) => ({ ...p, status: v }));
              }} options={ACCOUNTING_DIMENSION_STATUS_OPTIONS} />
          </FormField>
          {activeTab !== 'branches' && (
            <FormField label="Branch">
              <Select value={activeTab as string === 'departments' ? deptEditForm.branch : locEditForm.branch}
                onChange={(v) => {
                  if (activeTab === 'departments') setDeptEditForm((p) => ({ ...p, branch: v }));
                  else setLocEditForm((p) => ({ ...p, branch: v }));
                }} options={branchOptions} />
            </FormField>
          )}
          <FormField label="Notes">
            <TextArea value={activeTab === 'branches' ? branchEditForm.notes : activeTab === 'departments' ? deptEditForm.notes : locEditForm.notes}
              onChange={(v) => {
                if (activeTab === 'branches') setBranchEditForm((p) => ({ ...p, notes: v }));
                else if (activeTab === 'departments') setDeptEditForm((p) => ({ ...p, notes: v }));
                else setLocEditForm((p) => ({ ...p, notes: v }));
              }} />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={handleCloseEdit} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isEditSubmitting} className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {isEditSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </SlideOver>

      {/* Delete Modal */}
      <SlideOver isOpen={isDeleteOpen} onClose={handleCloseDelete} title={`Delete ${entityType}`} description={`Remove "${deleteEntityName}" from the ${entityLabelPlural} list.`}>
        {deleteErr && <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{deleteErr}</div>}
        {activeDeleteBlockers.length > 0 ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-medium">Cannot delete this {entityType}</p>
              <p className="mt-1">This {entityType} cannot be deleted because the following dependencies exist:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                {activeDeleteBlockers.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
              <p className="mt-2">Remove all dependencies before attempting to delete this {entityType}.</p>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={handleCloseDelete} className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200">
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p className="font-medium">Are you sure?</p>
              <p className="mt-1">This action cannot be undone. The {entityType} &ldquo;{deleteEntityName}&rdquo; will be permanently removed.</p>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={handleCloseDelete} disabled={isDeleteSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50">
                Cancel
              </button>
              <button type="button" onClick={handleConfirmDelete} disabled={isDeleteSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50">
                {isDeleteSubmitting ? 'Deleting...' : `Delete ${entityType}`}
              </button>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
