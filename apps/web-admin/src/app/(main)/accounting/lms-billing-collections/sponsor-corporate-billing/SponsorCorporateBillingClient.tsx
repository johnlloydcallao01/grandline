'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  X,
} from 'lucide-react';
import {
  createCorporateBillingLink,
  createScholarshipAward,
  deleteCorporateBillingLink,
  deleteScholarshipAward,
  getCorporateBillingLinkDetail,
  getCorporateBillingLinks,
  getFormReferenceData,
  getScholarshipAwardDetail,
  getScholarshipAwards,
  updateCorporateBillingLink,
  updateScholarshipAward,
  type Cell,
  type CorporateBillingLinkDetail,
  type CorporateBillingLinkMutationInput,
  type CorporateBillingLinksResponse,
  type FormReferenceData,
  type Metric,
  type ScholarshipAwardDetail,
  type ScholarshipAwardMutationInput,
  type ScholarshipAwardsResponse,
} from './actions';

type TabId = 'scholarship-awards' | 'corporate-billing-links';
type FilterState = { statuses: string[] };
type ActionTarget = { id: string; label: string };

const AWARD_TYPE_OPTIONS = [
  { label: 'Full', value: 'full' },
  { label: 'Partial', value: 'partial' },
  { label: 'Contra Revenue', value: 'contra_revenue' },
  { label: 'Third Party Billed', value: 'third_party_billed' },
];

const COVERAGE_TYPE_OPTIONS = [
  { label: 'Full Company Pay', value: 'full_company_pay' },
  { label: 'Shared Pay', value: 'shared_pay' },
  { label: 'Credit Terms', value: 'credit_terms' },
];

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Archived', value: 'archived' },
];

const STATIC_TABS: Array<{
  id: TabId;
  label: string;
  description: string;
  searchPlaceholder: string;
  columns: string[];
  tableTitle: string;
  tableDescription: string;
}> = [
  {
    id: 'scholarship-awards',
    label: 'Scholarship Awards',
    description: 'Review sponsor and scholarship coverage awards applied to LMS billing links, including award type, award amount, trainee share, sponsor, and status.',
    searchPlaceholder: 'Search award type, sponsor, or status',
    columns: ['Award Type', 'Sponsor', 'Trainee', 'Amount', 'Status'],
    tableTitle: 'Scholarship Award Register',
    tableDescription: 'Award records aligned to accounting-scholarship-awards, including sponsor, billing link, award type, award amount, trainee share, and status.',
  },
  {
    id: 'corporate-billing-links',
    label: 'Corporate Billing Links',
    description: 'Review corporate payer coverage links between LMS enrollments, corporate accounts, invoices, covered amounts, trainee share, and link status.',
    searchPlaceholder: 'Search coverage type, corporate account, or status',
    columns: ['Coverage Type', 'Account', 'Covered Amount', 'Trainee Share', 'Status'],
    tableTitle: 'Corporate Billing Link Register',
    tableDescription: 'Corporate coverage records aligned to accounting-corporate-billing-links, including account, invoice, covered amount, trainee share, and status.',
  },
];

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 dark:border-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800';
  if (variant === 'ghost') return 'border border-transparent bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-300';
  return 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800';
}

function getMetricTone(trend: Metric['trend']) {
  if (trend === 'down') return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30';
  if (trend === 'neutral') return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
  return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30';
}

function escapeCsvValue(value: string | number | boolean | null | undefined) {
  const stringValue = String(value ?? '');
  return /[",\n]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
}

function toggleFilterValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
}

function FormField({ label, children, required, error }: { label: string; children: React.ReactNode; required?: boolean; error?: string | null }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </label>
      {children}
      {error ? <p className="text-xs text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 disabled:bg-gray-50 disabled:text-gray-500"
    />
  );
}

function Select({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 disabled:bg-gray-50 disabled:text-gray-500"
    >
      <option value="">Select...</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function TextArea({
  value,
  onChange,
  rows = 3,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={rows}
      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50"
    />
  );
}

function SlideOver({
  isOpen,
  onClose,
  title,
  description,
  children,
  width = 'max-w-4xl',
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

function MetricCard({ label, value, change, trend = 'neutral' }: { label: string; value: string | number; change: string; trend?: 'up' | 'down' | 'neutral' }) {
  const TrendIcon = trend === 'down' ? ArrowDownRight : ArrowUpRight;
  return (
    <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
        <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-3 text-gray-600 dark:text-gray-400">
          <FileText className="h-5 w-5" />
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

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-5 shadow-sm">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-4 h-8 w-20 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
            <div className="mt-4 h-5 w-28 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[var(--card-border)]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                {Array.from({ length: 6 }).map((_, index) => (
                  <th key={index} className="px-4 py-3">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-[var(--card-background)]">
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan={6} className="px-4 py-3">
                    <div className="h-6 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
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

function renderCell(cell: Cell, index: number) {
  if (typeof cell === 'string') {
    return <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{cell}</td>;
  }

  const alignClass = cell.align === 'right' ? 'text-right' : cell.align === 'center' ? 'text-center' : 'text-left';
  if (cell.tone) {
    const toneMap: Record<string, string> = {
      amber: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:ring-amber-800',
      blue: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-800',
      gray: 'bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700',
      green: 'bg-green-50 text-green-700 ring-green-200 dark:bg-green-950/30 dark:text-green-400 dark:ring-green-800',
      red: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/30 dark:text-red-400 dark:ring-red-800',
    };
    return (
      <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${alignClass}`}>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${toneMap[cell.tone] || toneMap.gray}`}>{cell.text}</span>
      </td>
    );
  }

  return <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${cell.emphasis ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'} ${alignClass}`}>{cell.text}</td>;
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{value || '-'}</p>
    </div>
  );
}

export function SponsorCorporateBillingClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = (STATIC_TABS.find((tab) => tab.id === rawTab)?.id) || 'scholarship-awards';
  const currentTab = STATIC_TABS.find((tab) => tab.id === activeTab) || STATIC_TABS[0];

  // State
  const [awardData, setAwardData] = useState<ScholarshipAwardsResponse | null>(null);
  const [linkData, setLinkData] = useState<CorporateBillingLinksResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Scholarship awards search/filter/pagination
  const [awardSearchInput, setAwardSearchInput] = useState('');
  const [awardSubmittedSearch, setAwardSubmittedSearch] = useState('');
  const [awardCurrentPage, setAwardCurrentPage] = useState(1);
  const [awardFilters, setAwardFilters] = useState<FilterState>({ statuses: [] });
  const [awardDraftFilters, setAwardDraftFilters] = useState<FilterState>({ statuses: [] });
  const [isAwardFilterPanelOpen, setIsAwardFilterPanelOpen] = useState(false);

  // Corporate billing links search/filter/pagination
  const [linkSearchInput, setLinkSearchInput] = useState('');
  const [linkSubmittedSearch, setLinkSubmittedSearch] = useState('');
  const [linkCurrentPage, setLinkCurrentPage] = useState(1);
  const [linkFilters, setLinkFilters] = useState<FilterState>({ statuses: [] });
  const [linkDraftFilters, setLinkDraftFilters] = useState<FilterState>({ statuses: [] });
  const [isLinkFilterPanelOpen, setIsLinkFilterPanelOpen] = useState(false);

  // View detail
  const [viewDetail, setViewDetail] = useState<ScholarshipAwardDetail | CorporateBillingLinkDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<ActionTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form (create/edit)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTab, setEditingTab] = useState<TabId | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formRefData, setFormRefData] = useState<FormReferenceData | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  function clearFormError(field: string) {
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validateAwardForm(): boolean {
    const errors: Record<string, string> = {};
    if (!awardFormState.enrollmentBillingLink) errors.enrollmentBillingLink = 'Billing link is required';
    if (!awardFormState.scholarshipSponsor) errors.scholarshipSponsor = 'Sponsor is required';
    if (!awardFormState.trainee) errors.trainee = 'Trainee is required';
    if (!awardFormState.effectiveDate) errors.effectiveDate = 'Effective date is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function validateLinkForm(): boolean {
    const errors: Record<string, string> = {};
    if (!linkFormState.corporateAccount) errors.corporateAccount = 'Corporate account is required';
    if (!linkFormState.enrollmentBillingLink) errors.enrollmentBillingLink = 'Billing link is required';
    if (!linkFormState.effectiveDate) errors.effectiveDate = 'Effective date is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // Scholarship award form state
  const [awardFormState, setAwardFormState] = useState({
    enrollmentBillingLink: '',
    scholarshipSponsor: '',
    trainee: '',
    awardType: 'partial',
    awardAmount: '',
    awardPercent: '',
    traineeShareAmount: '',
    effectiveDate: '',
    status: 'active',
    notes: '',
  });

  // Corporate billing link form state
  const [linkFormState, setLinkFormState] = useState({
    corporateAccount: '',
    enrollmentBillingLink: '',
    invoice: '',
    coverageType: 'full_company_pay',
    coveredAmount: '',
    traineeShareAmount: '',
    effectiveDate: '',
    status: 'active',
    notes: '',
  });

  const awardFilterCount = awardFilters.statuses.length;
  const linkFilterCount = linkFilters.statuses.length;

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  // === Scholarship Awards Fetch ===
  const fetchAwards = useCallback(async ({
    search, page, nextFilters,
  }: {
    search: string; page: number; nextFilters: FilterState;
  }) => {
    if (activeTab !== 'scholarship-awards') return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getScholarshipAwards({
        search, page,
        statuses: nextFilters.statuses,
      });
      setAwardData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load scholarship awards.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  // === Corporate Billing Links Fetch ===
  const fetchLinks = useCallback(async ({
    search, page, nextFilters,
  }: {
    search: string; page: number; nextFilters: FilterState;
  }) => {
    if (activeTab !== 'corporate-billing-links') return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getCorporateBillingLinks({
        search, page,
        statuses: nextFilters.statuses,
      });
      setLinkData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load corporate billing links.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  // Effects per tab
  useEffect(() => {
    if (activeTab === 'scholarship-awards') {
      void fetchAwards({ search: awardSubmittedSearch, page: awardCurrentPage, nextFilters: awardFilters });
    }
  }, [activeTab, awardCurrentPage, fetchAwards, awardFilters, awardSubmittedSearch]);

  useEffect(() => {
    if (activeTab === 'corporate-billing-links') {
      void fetchLinks({ search: linkSubmittedSearch, page: linkCurrentPage, nextFilters: linkFilters });
    }
  }, [activeTab, fetchLinks, linkCurrentPage, linkFilters, linkSubmittedSearch]);

  // === Awards Handlers ===
  const handleAwardSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setAwardSubmittedSearch(awardSearchInput);
    setAwardCurrentPage(1);
    void fetchAwards({ search: awardSearchInput, page: 1, nextFilters: awardFilters });
  };

  const handleAwardRefresh = () => {
    void fetchAwards({ search: awardSubmittedSearch, page: awardCurrentPage, nextFilters: awardFilters });
  };

  const handleAwardExport = () => {
    const rows = awardData?.section?.table?.rows || [];
    if (!rows.length) return;
    const headers = currentTab.columns;
    const csvRows = rows.map((row) =>
      row.cells.map((cell) => (typeof cell === 'string' ? cell : cell.text))
    );
    const csvContent = [headers, ...csvRows].map((row) => row.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'scholarship-awards.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // === Links Handlers ===
  const handleLinkSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setLinkSubmittedSearch(linkSearchInput);
    setLinkCurrentPage(1);
    void fetchLinks({ search: linkSearchInput, page: 1, nextFilters: linkFilters });
  };

  const handleLinkRefresh = () => {
    void fetchLinks({ search: linkSubmittedSearch, page: linkCurrentPage, nextFilters: linkFilters });
  };

  const handleLinkExport = () => {
    const rows = linkData?.section?.table?.rows || [];
    if (!rows.length) return;
    const headers = currentTab.columns;
    const csvRows = rows.map((row) =>
      row.cells.map((cell) => (typeof cell === 'string' ? cell : cell.text))
    );
    const csvContent = [headers, ...csvRows].map((row) => row.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'corporate-billing-links.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // === View Handlers ===
  const handleView = async (id: string) => {
    setIsViewOpen(true);
    setIsViewLoading(true);
    setViewDetail(null);
    try {
      const detail = activeTab === 'scholarship-awards'
        ? await getScholarshipAwardDetail(id)
        : await getCorporateBillingLinkDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  // === Form Handlers ===
  const loadFormReferenceData = async () => {
    if (!formRefData) {
      try {
        const refData = await getFormReferenceData();
        setFormRefData(refData);
      } catch {
        // Silently fail - forms will work without picklist data
      }
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setEditingTab(activeTab);
    setFormError(null);
    setFormErrors({});
    setAwardFormState({
      enrollmentBillingLink: '',
      scholarshipSponsor: '',
      trainee: '',
      awardType: 'partial',
      awardAmount: '',
      awardPercent: '',
      traineeShareAmount: '',
      effectiveDate: '',
      status: 'active',
      notes: '',
    });
    setLinkFormState({
      corporateAccount: '',
      enrollmentBillingLink: '',
      invoice: '',
      coverageType: 'full_company_pay',
      coveredAmount: '',
      traineeShareAmount: '',
      effectiveDate: '',
      status: 'active',
      notes: '',
    });
    setIsFormOpen(true);
    void loadFormReferenceData();
  };

  const handleOpenEdit = async (id: string) => {
    setEditingId(id);
    setEditingTab(activeTab);
    setFormError(null);
    setFormErrors({});
    setIsFormOpen(true);
    void loadFormReferenceData();
    try {
      if (activeTab === 'scholarship-awards') {
        const detail = await getScholarshipAwardDetail(id);
        setAwardFormState({
          enrollmentBillingLink: detail.enrollmentBillingLinkId || '',
          scholarshipSponsor: detail.scholarshipSponsorId || '',
          trainee: detail.traineeId || '',
          awardType: detail.awardType || 'partial',
          awardAmount: detail.awardAmount ? String(detail.awardAmount) : '',
          awardPercent: detail.awardPercent != null ? String(detail.awardPercent) : '',
          traineeShareAmount: detail.traineeShareAmount ? String(detail.traineeShareAmount) : '',
          effectiveDate: detail.effectiveDate || '',
          status: detail.status || 'active',
          notes: detail.notes || '',
        });
      } else {
        const detail = await getCorporateBillingLinkDetail(id);
        setLinkFormState({
          corporateAccount: detail.corporateAccountId || '',
          enrollmentBillingLink: detail.enrollmentBillingLinkId || '',
          invoice: detail.invoiceId || '',
          coverageType: detail.coverageType || 'full_company_pay',
          coveredAmount: detail.coveredAmount ? String(detail.coveredAmount) : '',
          traineeShareAmount: detail.traineeShareAmount ? String(detail.traineeShareAmount) : '',
          effectiveDate: detail.effectiveDate || '',
          status: detail.status || 'active',
          notes: detail.notes || '',
        });
      }
    } catch (detailError) {
      setFormError(detailError instanceof Error ? detailError.message : 'Unable to load detail for editing.');
    }
  };

  const normalizeAwardPayload = (): ScholarshipAwardMutationInput => ({
    enrollmentBillingLink: awardFormState.enrollmentBillingLink ? Number(awardFormState.enrollmentBillingLink) : null,
    scholarshipSponsor: awardFormState.scholarshipSponsor ? Number(awardFormState.scholarshipSponsor) : null,
    trainee: awardFormState.trainee ? Number(awardFormState.trainee) : null,
    awardType: awardFormState.awardType || 'partial',
    awardAmount: awardFormState.awardAmount ? Number(awardFormState.awardAmount) : 0,
    awardPercent: awardFormState.awardPercent ? Number(awardFormState.awardPercent) : null,
    traineeShareAmount: awardFormState.traineeShareAmount ? Number(awardFormState.traineeShareAmount) : 0,
    effectiveDate: awardFormState.effectiveDate || null,
    status: awardFormState.status || 'active',
    notes: awardFormState.notes.trim() || null,
  });

  const normalizeLinkPayload = (): CorporateBillingLinkMutationInput => ({
    corporateAccount: linkFormState.corporateAccount ? Number(linkFormState.corporateAccount) : null,
    enrollmentBillingLink: linkFormState.enrollmentBillingLink ? Number(linkFormState.enrollmentBillingLink) : null,
    invoice: linkFormState.invoice ? Number(linkFormState.invoice) : null,
    coverageType: linkFormState.coverageType || 'full_company_pay',
    coveredAmount: linkFormState.coveredAmount ? Number(linkFormState.coveredAmount) : 0,
    traineeShareAmount: linkFormState.traineeShareAmount ? Number(linkFormState.traineeShareAmount) : 0,
    effectiveDate: linkFormState.effectiveDate || null,
    status: linkFormState.status || 'active',
    notes: linkFormState.notes.trim() || null,
  });

  const refreshCurrentView = async () => {
    if (activeTab === 'scholarship-awards') {
      await fetchAwards({ search: awardSubmittedSearch, page: awardCurrentPage, nextFilters: awardFilters });
    } else {
      await fetchLinks({ search: linkSubmittedSearch, page: linkCurrentPage, nextFilters: linkFilters });
    }
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const isValid = editingTab === 'scholarship-awards' ? validateAwardForm() : validateLinkForm();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      if (editingTab === 'scholarship-awards') {
        const payload = normalizeAwardPayload();
        if (editingId) {
          await updateScholarshipAward(editingId, payload);
        } else {
          await createScholarshipAward(payload);
        }
      } else {
        const payload = normalizeLinkPayload();
        if (editingId) {
          await updateCorporateBillingLink(editingId, payload);
        } else {
          await createCorporateBillingLink(payload);
        }
      }
      setIsFormOpen(false);
      await refreshCurrentView();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Unable to save record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    try {
      if (activeTab === 'scholarship-awards') {
        await deleteScholarshipAward(deleteTarget.id);
      } else {
        await deleteCorporateBillingLink(deleteTarget.id);
      }
      setDeleteTarget(null);
      await refreshCurrentView();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete record.');
    } finally {
      setIsDeleting(false);
    }
  };

  // === Render Actions ===
  const renderActions = (row: { id: string; status?: string | null }) => (
    <td className="px-4 py-3 text-right">
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300" title="View detail">
          <Eye className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => handleOpenEdit(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300" title="Edit record">
          <Edit className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => setDeleteTarget({ id: row.id, label: row.id })} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300" title="Delete record">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </td>
  );

  // === Render Tab Content ===
  const isAwardTab = activeTab === 'scholarship-awards';
  const currentRows = isAwardTab
    ? (awardData?.section?.table?.rows || [])
    : (linkData?.section?.table?.rows || []);
  const currentMetrics = isAwardTab
    ? (awardData?.section?.metrics || [])
    : (linkData?.section?.metrics || []);
  const currentPagination = isAwardTab
    ? (awardData?.pagination || null)
    : (linkData?.pagination || null);

  const picklistSponsors = useMemo(() => [
    { label: 'Select a sponsor', value: '' },
    ...(formRefData?.sponsors || []).map((s) => ({ label: s.label, value: s.id })),
  ], [formRefData?.sponsors]);

  const picklistAccounts = useMemo(() => [
    { label: 'Select a corporate account', value: '' },
    ...(formRefData?.corporateAccounts || []).map((a) => ({ label: a.label, value: a.id })),
  ], [formRefData?.corporateAccounts]);

  const picklistBillingLinks = useMemo(() => [
    { label: 'Select a billing link', value: '' },
    ...(formRefData?.billingLinks || []).map((b) => ({ label: b.label, value: b.id })),
  ], [formRefData?.billingLinks]);

  const picklistTrainees = useMemo(() => [
    { label: 'Select a trainee', value: '' },
    ...(formRefData?.trainees || []).map((t) => ({ label: t.label, value: t.id })),
  ], [formRefData?.trainees]);

  const picklistInvoices = useMemo(() => [
    { label: 'No invoice (optional)', value: '' },
    ...(formRefData?.invoices || []).map((i) => ({ label: i.label, value: i.id })),
  ], [formRefData?.invoices]);

  return (
    <div className="space-y-6 p-[10px]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">LMS Finance / LMS Billing & Collections</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">Sponsor & Corporate Billing</h1>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-400">Review scholarship awards and corporate billing links that reduce or transfer LMS trainee charges to sponsor and company payers.</p>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {STATIC_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} type="button" onClick={() => handleTabChange(tab.id)} className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${isActive ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* === SCHOLARSHIP AWARDS TAB === */}
      {activeTab === 'scholarship-awards' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{awardData?.section?.label || currentTab.label}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{awardData?.section?.description || currentTab.description}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{awardData?.totals?.filteredAwards ?? 0} matching rows</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
                <Plus className="h-4 w-4" />
                New Award
              </button>
              <button type="button" onClick={handleAwardRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
                <RefreshCw className="h-4 w-4" />
                Refresh Awards
              </button>
              <button type="button" onClick={handleAwardExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50" disabled={!currentRows.length}>
                <Download className="h-4 w-4" />
                Download View
              </button>
            </div>
          </div>

          {currentMetrics.length > 0 ? <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{currentMetrics.map((metric) => <div key={metric.id}><MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} /></div>)}</div> : null}

          <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-800 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                <form onSubmit={handleAwardSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input type="text" placeholder={awardData?.section?.searchPlaceholder || currentTab.searchPlaceholder} value={awardSearchInput} onChange={(event) => setAwardSearchInput(event.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50" />
                  </div>
                  <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 dark:border-blue-700 bg-blue-600 dark:bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800">
                    <Search className="h-4 w-4" />
                    Search
                  </button>
                </form>
                <button type="button" onClick={() => { if (!isAwardFilterPanelOpen) setAwardDraftFilters({ ...awardFilters }); setIsAwardFilterPanelOpen((previous) => !previous); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isAwardFilterPanelOpen || awardFilterCount > 0 ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  <Filter className="h-4 w-4" />
                  Filters
                  {awardFilterCount > 0 ? <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-700 px-1.5 py-0.5 text-[11px] font-semibold text-white">{awardFilterCount}</span> : null}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(awardData?.section?.filters || []).map((filter) => (
                  <button key={filter.value} type="button" onClick={() => { const next = toggleFilterValue(awardFilters.statuses, filter.value); setAwardFilters({ statuses: next }); setAwardCurrentPage(1); }} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${awardFilters.statuses.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 p-[10px] sm:p-5">
              {isAwardFilterPanelOpen ? (
                <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Filters</h4>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Select status values to narrow the award register.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" onClick={() => { setAwardDraftFilters({ statuses: [] }); setAwardFilters({ statuses: [] }); setAwardCurrentPage(1); setIsAwardFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">Clear all</button>
                      <button type="button" onClick={() => setIsAwardFilterPanelOpen(false)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                      <button type="button" onClick={() => { setAwardFilters({ ...awardDraftFilters }); setAwardCurrentPage(1); setIsAwardFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 dark:border-blue-700 bg-blue-600 dark:bg-blue-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-800">Apply Filters</button>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-6 md:grid-cols-1">
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</h5>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(awardData?.section?.filters || []).map((option) => {
                          const selected = awardDraftFilters.statuses.includes(option.value);
                          return <button key={option.value} type="button" onClick={() => setAwardDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{option.label}</button>;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{awardData?.section?.table?.title || currentTab.tableTitle}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{awardData?.section?.table?.description || currentTab.tableDescription}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span>{awardData?.totals?.filteredAwards ?? 0} matching rows</span>
                </div>
              </div>

              {error ? <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div> : null}

              {isLoading ? <LoadingSkeleton /> : (
                <>
                  <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[var(--card-border)]">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                          <tr>
                            {(awardData?.section?.table?.columns || currentTab.columns).map((column) => (
                              <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${column === 'Amount' ? 'text-right' : 'text-left'}`}>{column}</th>
                            ))}
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-[var(--card-background)]">
                          {currentRows.length > 0 ? currentRows.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              {row.cells.map((cell, index) => renderCell(cell, index))}
                              {renderActions(row)}
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={(awardData?.section?.table?.columns || currentTab.columns).length + 1} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No scholarship award rows found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {currentPagination && currentPagination.totalPages > 1 ? (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Page {currentPagination.page} of {currentPagination.totalPages}</p>
                      <div className="flex gap-2">
                        <button type="button" disabled={!currentPagination.hasPrevPage} onClick={() => setAwardCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">Previous</button>
                        <button type="button" disabled={!currentPagination.hasNextPage} onClick={() => setAwardCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">Next</button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === CORPORATE BILLING LINKS TAB === */}
      {activeTab === 'corporate-billing-links' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{linkData?.section?.label || currentTab.label}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{linkData?.section?.description || currentTab.description}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{linkData?.totals?.filteredLinks ?? 0} matching rows</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
                <Plus className="h-4 w-4" />
                New Corporate Link
              </button>
              <button type="button" onClick={handleLinkRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
                <RefreshCw className="h-4 w-4" />
                Refresh Links
              </button>
              <button type="button" onClick={handleLinkExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50" disabled={!currentRows.length}>
                <Download className="h-4 w-4" />
                Download View
              </button>
            </div>
          </div>

          {currentMetrics.length > 0 ? <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{currentMetrics.map((metric) => <div key={metric.id}><MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} /></div>)}</div> : null}

          <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-800 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                <form onSubmit={handleLinkSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input type="text" placeholder={linkData?.section?.searchPlaceholder || currentTab.searchPlaceholder} value={linkSearchInput} onChange={(event) => setLinkSearchInput(event.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50" />
                  </div>
                  <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 dark:border-blue-700 bg-blue-600 dark:bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800">
                    <Search className="h-4 w-4" />
                    Search
                  </button>
                </form>
                <button type="button" onClick={() => { if (!isLinkFilterPanelOpen) setLinkDraftFilters({ ...linkFilters }); setIsLinkFilterPanelOpen((previous) => !previous); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isLinkFilterPanelOpen || linkFilterCount > 0 ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  <Filter className="h-4 w-4" />
                  Filters
                  {linkFilterCount > 0 ? <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-700 px-1.5 py-0.5 text-[11px] font-semibold text-white">{linkFilterCount}</span> : null}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(linkData?.section?.filters || []).map((filter) => (
                  <button key={filter.value} type="button" onClick={() => { const next = toggleFilterValue(linkFilters.statuses, filter.value); setLinkFilters({ statuses: next }); setLinkCurrentPage(1); }} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${linkFilters.statuses.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 p-[10px] sm:p-5">
              {isLinkFilterPanelOpen ? (
                <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Filters</h4>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Select status values to narrow the corporate billing links register.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" onClick={() => { setLinkDraftFilters({ statuses: [] }); setLinkFilters({ statuses: [] }); setLinkCurrentPage(1); setIsLinkFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">Clear all</button>
                      <button type="button" onClick={() => setIsLinkFilterPanelOpen(false)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                      <button type="button" onClick={() => { setLinkFilters({ ...linkDraftFilters }); setLinkCurrentPage(1); setIsLinkFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 dark:border-blue-700 bg-blue-600 dark:bg-blue-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-800">Apply Filters</button>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-6 md:grid-cols-1">
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</h5>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(linkData?.section?.filters || []).map((option) => {
                          const selected = linkDraftFilters.statuses.includes(option.value);
                          return <button key={option.value} type="button" onClick={() => setLinkDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{option.label}</button>;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{linkData?.section?.table?.title || currentTab.tableTitle}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{linkData?.section?.table?.description || currentTab.tableDescription}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span>{linkData?.totals?.filteredLinks ?? 0} matching rows</span>
                </div>
              </div>

              {error ? <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div> : null}

              {isLoading ? <LoadingSkeleton /> : (
                <>
                  <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[var(--card-border)]">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                          <tr>
                            {(linkData?.section?.table?.columns || currentTab.columns).map((column) => (
                              <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${column === 'Covered Amount' || column === 'Trainee Share' ? 'text-right' : 'text-left'}`}>{column}</th>
                            ))}
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-[var(--card-background)]">
                          {currentRows.length > 0 ? currentRows.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              {row.cells.map((cell, index) => renderCell(cell, index))}
                              {renderActions(row)}
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={(linkData?.section?.table?.columns || currentTab.columns).length + 1} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No corporate billing link rows found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {currentPagination && currentPagination.totalPages > 1 ? (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Page {currentPagination.page} of {currentPagination.totalPages}</p>
                      <div className="flex gap-2">
                        <button type="button" disabled={!currentPagination.hasPrevPage} onClick={() => setLinkCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">Previous</button>
                        <button type="button" disabled={!currentPagination.hasNextPage} onClick={() => setLinkCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">Next</button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === VIEW DETAIL SLIDE OVER === */}
      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Record Details" width="max-w-2xl">
        {isViewLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-5 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        ) : viewDetail ? (
          <div className="space-y-6">
            {'awardType' in viewDetail ? (
              <>
                <div className="grid grid-cols-2 gap-6">
                  <DetailField label="Award Type" value={viewDetail.awardType} />
                  <DetailField label="Status" value={viewDetail.statusLabel} />
                  <DetailField label="Sponsor" value={(viewDetail as ScholarshipAwardDetail).scholarshipSponsorLabel} />
                  <DetailField label="Trainee" value={(viewDetail as ScholarshipAwardDetail).traineeLabel} />
                  <DetailField label="Award Amount" value={`PHP ${(viewDetail.awardAmount || 0).toLocaleString()}`} />
                  <DetailField label="Award Percent" value={viewDetail.awardPercent != null ? `${viewDetail.awardPercent}%` : '-'} />
                  <DetailField label="Trainee Share Amount" value={`PHP ${(viewDetail.traineeShareAmount || 0).toLocaleString()}`} />
                  <DetailField label="Effective Date" value={(viewDetail as ScholarshipAwardDetail).effectiveDateLabel} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <DetailField label="Billing Link" value={(viewDetail as ScholarshipAwardDetail).enrollmentBillingLinkLabel} />
                  <DetailField label="Created At" value={(viewDetail as ScholarshipAwardDetail).createdAt || '-'} />
                </div>
                <div>
                  <DetailField label="Notes" value={(viewDetail as ScholarshipAwardDetail).notes || '-'} />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-6">
                  <DetailField label="Coverage Type" value={(viewDetail as CorporateBillingLinkDetail).coverageTypeLabel} />
                  <DetailField label="Status" value={viewDetail.statusLabel} />
                  <DetailField label="Corporate Account" value={(viewDetail as CorporateBillingLinkDetail).corporateAccountLabel} />
                  <DetailField label="Billing Link" value={(viewDetail as CorporateBillingLinkDetail).enrollmentBillingLinkLabel} />
                  <DetailField label="Invoice" value={(viewDetail as CorporateBillingLinkDetail).invoiceLabel} />
                  <DetailField label="Covered Amount" value={`PHP ${(viewDetail.coveredAmount || 0).toLocaleString()}`} />
                  <DetailField label="Trainee Share" value={`PHP ${(viewDetail.traineeShareAmount || 0).toLocaleString()}`} />
                  <DetailField label="Effective Date" value={(viewDetail as CorporateBillingLinkDetail).effectiveDateLabel} />
                </div>
                <div>
                  <DetailField label="Notes" value={(viewDetail as CorporateBillingLinkDetail).notes || '-'} />
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No details available.</p>
        )}
      </SlideOver>

      {/* === FORM SLIDE OVER === */}
      <SlideOver
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? 'Edit Record' : 'New Record'}
        description={editingTab === 'scholarship-awards' ? 'Scholarship Award' : 'Corporate Billing Link'}
        width="max-w-3xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {formError ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {formError}
            </div>
          ) : null}

          {editingTab === 'scholarship-awards' ? (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField label="Billing Link" required error={formErrors.enrollmentBillingLink}>
                  <Select value={awardFormState.enrollmentBillingLink} onChange={(val) => { setAwardFormState((prev) => ({ ...prev, enrollmentBillingLink: val })); clearFormError('enrollmentBillingLink'); }} options={picklistBillingLinks} />
                </FormField>
                <FormField label="Sponsor" required error={formErrors.scholarshipSponsor}>
                  <Select value={awardFormState.scholarshipSponsor} onChange={(val) => { setAwardFormState((prev) => ({ ...prev, scholarshipSponsor: val })); clearFormError('scholarshipSponsor'); }} options={picklistSponsors} />
                </FormField>
                <FormField label="Trainee" required error={formErrors.trainee}>
                  <Select value={awardFormState.trainee} onChange={(val) => { setAwardFormState((prev) => ({ ...prev, trainee: val })); clearFormError('trainee'); }} options={picklistTrainees} />
                </FormField>
                <FormField label="Award Type" required>
                  <Select value={awardFormState.awardType} onChange={(val) => setAwardFormState((prev) => ({ ...prev, awardType: val }))} options={AWARD_TYPE_OPTIONS} />
                </FormField>
                <FormField label="Award Amount (PHP)">
                  <Input value={awardFormState.awardAmount} onChange={(val) => setAwardFormState((prev) => ({ ...prev, awardAmount: val }))} type="number" placeholder="0.00" />
                </FormField>
                <FormField label="Award Percent (%)">
                  <Input value={awardFormState.awardPercent} onChange={(val) => setAwardFormState((prev) => ({ ...prev, awardPercent: val }))} type="number" placeholder="e.g. 50" />
                </FormField>
                <FormField label="Trainee Share (PHP)">
                  <Input value={awardFormState.traineeShareAmount} onChange={(val) => setAwardFormState((prev) => ({ ...prev, traineeShareAmount: val }))} type="number" placeholder="0.00" />
                </FormField>
                <FormField label="Effective Date" required error={formErrors.effectiveDate}>
                  <Input value={awardFormState.effectiveDate} onChange={(val) => { setAwardFormState((prev) => ({ ...prev, effectiveDate: val })); clearFormError('effectiveDate'); }} type="date" />
                </FormField>
                <FormField label="Status" required>
                  <Select value={awardFormState.status} onChange={(val) => setAwardFormState((prev) => ({ ...prev, status: val }))} options={STATUS_OPTIONS} />
                </FormField>
              </div>
              <FormField label="Notes">
                <TextArea value={awardFormState.notes} onChange={(val) => setAwardFormState((prev) => ({ ...prev, notes: val }))} />
              </FormField>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField label="Corporate Account" required error={formErrors.corporateAccount}>
                  <Select value={linkFormState.corporateAccount} onChange={(val) => { setLinkFormState((prev) => ({ ...prev, corporateAccount: val })); clearFormError('corporateAccount'); }} options={picklistAccounts} />
                </FormField>
                <FormField label="Billing Link" required error={formErrors.enrollmentBillingLink}>
                  <Select value={linkFormState.enrollmentBillingLink} onChange={(val) => { setLinkFormState((prev) => ({ ...prev, enrollmentBillingLink: val })); clearFormError('enrollmentBillingLink'); }} options={picklistBillingLinks} />
                </FormField>
                <FormField label="Invoice">
                  <Select value={linkFormState.invoice} onChange={(val) => setLinkFormState((prev) => ({ ...prev, invoice: val }))} options={picklistInvoices} />
                </FormField>
                <FormField label="Coverage Type" required>
                  <Select value={linkFormState.coverageType} onChange={(val) => setLinkFormState((prev) => ({ ...prev, coverageType: val }))} options={COVERAGE_TYPE_OPTIONS} />
                </FormField>
                <FormField label="Covered Amount (PHP)">
                  <Input value={linkFormState.coveredAmount} onChange={(val) => setLinkFormState((prev) => ({ ...prev, coveredAmount: val }))} type="number" placeholder="0.00" />
                </FormField>
                <FormField label="Trainee Share (PHP)">
                  <Input value={linkFormState.traineeShareAmount} onChange={(val) => setLinkFormState((prev) => ({ ...prev, traineeShareAmount: val }))} type="number" placeholder="0.00" />
                </FormField>
                <FormField label="Effective Date" required error={formErrors.effectiveDate}>
                  <Input value={linkFormState.effectiveDate} onChange={(val) => { setLinkFormState((prev) => ({ ...prev, effectiveDate: val })); clearFormError('effectiveDate'); }} type="date" />
                </FormField>
                <FormField label="Status" required>
                  <Select value={linkFormState.status} onChange={(val) => setLinkFormState((prev) => ({ ...prev, status: val }))} options={STATUS_OPTIONS} />
                </FormField>
              </div>
              <FormField label="Notes">
                <TextArea value={linkFormState.notes} onChange={(val) => setLinkFormState((prev) => ({ ...prev, notes: val }))} />
              </FormField>
            </>
          )}

          <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-800 pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="rounded-lg border border-blue-600 dark:border-blue-700 bg-blue-600 dark:bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50">
              {isSubmitting ? 'Saving...' : editingId ? 'Update Record' : 'Create Record'}
            </button>
          </div>
        </form>
      </SlideOver>

      {/* === DELETE CONFIRMATION === */}
      {deleteTarget ? createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteTarget(null)}>
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-[var(--card-background)] p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Confirm Delete</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this record?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
              <button type="button" onClick={handleConfirmDelete} disabled={isDeleting} className="rounded-lg border border-red-600 dark:border-red-700 bg-red-600 dark:bg-red-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:hover:bg-red-800 disabled:opacity-50">
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}
