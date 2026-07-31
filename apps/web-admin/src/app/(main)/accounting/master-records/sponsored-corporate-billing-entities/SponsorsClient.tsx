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
  getSponsorRegister,
  getSponsorDetail,
  createSponsor,
  updateSponsor,
  deleteSponsor,
  getCorporateAccountRegister,
  getCorporateAccountDetail,
  createCorporateAccount,
  updateCorporateAccount,
  deleteCorporateAccount,
  getCoverageLinkRegister,
  getScholarshipAwardDetail,
  createScholarshipAward,
  updateScholarshipAward,
  deleteScholarshipAward,
  getCorporateBillingLinkDetail,
  createCorporateBillingLink,
  updateCorporateBillingLink,
  deleteCorporateBillingLink,
  getEnrollmentBillingLinkChoices,
  getTraineeChoices,
  type SponsorRegisterResponse,
  type SponsorDetail,
  type SponsorCell,
  type CreateSponsorInput,
  type UpdateSponsorInput,
  type CorporateAccountRegisterResponse,
  type CorporateAccountDetail,
  type CreateCorporateAccountInput,
  type UpdateCorporateAccountInput,
  type CoverageLinkRegisterResponse,
  type CustomerChoice,
} from './actions';

type TabId = 'scholarship-sponsors' | 'corporate-accounts' | 'coverage-links';

type SponsorFilterState = { statuses: string[]; contactFilter: string[] };

type CorporateAccountCreateFormState = {
  accountCode: string;
  name: string;
  customer: string;
  billingContact: string;
  email: string;
  phone: string;
  creditTerms: string;
  paymentTerms: string;
  status: string;
  notes: string;
};

type SponsorCreateFormState = {
  sponsorCode: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  billingAddress: string;
  defaultCustomer: string;
  status: string;
  notes: string;
};

type SponsorActionTarget = {
  id: string;
  name: string;
};

const TAB_IDS: Record<TabId, TabId> = {
  'scholarship-sponsors': 'scholarship-sponsors',
  'corporate-accounts': 'corporate-accounts',
  'coverage-links': 'coverage-links',
};

const SPONSOR_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Archived', value: 'archived' },
] as const;

const initialSponsorCreateFormState: SponsorCreateFormState = {
  sponsorCode: '',
  name: '',
  contactName: '',
  email: '',
  phone: '',
  billingAddress: '',
  defaultCustomer: '',
  status: 'active',
  notes: '',
};

const initialCorporateAccountCreateFormState: CorporateAccountCreateFormState = {
  accountCode: '',
  name: '',
  customer: '',
  billingContact: '',
  email: '',
  phone: '',
  creditTerms: '',
  paymentTerms: '',
  status: 'active',
  notes: '',
};

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  if (variant === 'ghost') return 'border border-transparent bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100';
  return 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800';
}

function toggleFilterValue(values: string[], value: string) {
  if (values.includes(value)) return values.filter((v) => v !== value);
  return [...values, value];
}

function escapeCsvValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: 6 }).map((_, j) => (
            <div key={j} className="h-5 flex-1 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      ))}
    </div>
  );
}

function MetricCard({ label, value, change, trend }: { label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral' }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <div className="mt-2 flex items-center gap-1">
        {trend === 'up' ? <ArrowUpRight className="h-3.5 w-3.5 text-green-500" /> : trend === 'down' ? <ArrowDownRight className="h-3.5 w-3.5 text-red-500" /> : <div className="h-3.5 w-3.5" />}
        <span className="text-xs text-gray-500 dark:text-gray-400">{change}</span>
      </div>
    </div>
  );
}

function renderCell(cell: SponsorCell, index: number) {
  if (typeof cell === 'string') {
    return <td key={index} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{cell}</td>;
  }
  const alignClass = cell.align === 'right' ? 'text-right' : cell.align === 'center' ? 'text-center' : 'text-left';
  const toneClass = cell.tone === 'green' ? 'text-green-700 bg-green-50 ring-green-200 dark:text-green-400 dark:bg-green-950/30 dark:ring-green-800' : cell.tone === 'amber' ? 'text-amber-700 bg-amber-50 ring-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:ring-amber-800' : cell.tone === 'red' ? 'text-red-700 bg-red-50 ring-red-200 dark:text-red-400 dark:bg-red-950/30 dark:ring-red-800' : cell.tone === 'blue' ? 'text-blue-700 bg-blue-50 ring-blue-200 dark:text-blue-400 dark:bg-blue-950/30 dark:ring-blue-800' : 'text-gray-700 dark:text-gray-300';
  return (
    <td key={index} className={`px-4 py-3 text-sm ${alignClass}`}>
      {cell.tone ? (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${toneClass}`}>{cell.text}</span>
      ) : (
        <span className={cell.emphasis ? 'font-medium text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}>{cell.text}</span>
      )}
    </td>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}{required ? <span className="ml-1 text-red-500 dark:text-red-400">*</span> : null}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type, disabled }: { value: string; onChange: (value: string) => void; placeholder?: string; type?: string; disabled?: boolean }) {
  return <input type={type || 'text'} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-800 disabled:cursor-not-allowed disabled:opacity-50" />;
}

function Select({ value, onChange, options, disabled }: { value: string; onChange: (value: string) => void; options: Array<{ label: string; value: string }>; disabled?: boolean }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-800 disabled:cursor-not-allowed disabled:opacity-50">
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  );
}

function TextArea({ value, onChange, placeholder, rows }: { value: string; onChange: (value: string) => void; placeholder?: string; rows?: number }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows || 3} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-800" />;
}

// ===================================================================
// ScholarshipSponsorsTab
// ===================================================================

function ScholarshipSponsorsTab({ initialData }: { initialData?: SponsorRegisterResponse | null }) {
  const [data, setData] = useState<SponsorRegisterResponse | null>(initialData ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [searchInput, setSearchInput] = useState(initialData?.appliedFilters?.search || '');
  const [submittedSearch, setSubmittedSearch] = useState(initialData?.appliedFilters?.search || '');
  const [currentPage, setCurrentPage] = useState(initialData?.pagination?.page || 1);
  const [filters, setFilters] = useState<SponsorFilterState>({ statuses: initialData?.appliedFilters?.statuses || [], contactFilter: initialData?.appliedFilters?.contactFilter ? [initialData.appliedFilters.contactFilter] : [] });
  const [draftFilters, setDraftFilters] = useState<SponsorFilterState>({ statuses: initialData?.appliedFilters?.statuses || [], contactFilter: initialData?.appliedFilters?.contactFilter ? [initialData.appliedFilters.contactFilter] : [] });
  const [quickFilters, setQuickFilters] = useState<string[]>(initialData?.appliedFilters?.quickFilters || []);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [viewDetail, setViewDetail] = useState<SponsorDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [formState, setFormState] = useState<SponsorCreateFormState>(initialSponsorCreateFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SponsorActionTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filterCount = filters.statuses.length + filters.contactFilter.length;

  const fetchData = useCallback(async ({
    search, page, nextFilters, nextQuickFilters,
  }: {
    search: string; page: number; nextFilters: SponsorFilterState; nextQuickFilters: string[];
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getSponsorRegister({
        search, page,
        statuses: nextFilters.statuses,
        contactFilter: nextFilters.contactFilter.length > 0 ? nextFilters.contactFilter[0] : undefined,
        quickFilters: nextQuickFilters,
      });
      setData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load scholarship sponsors.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  }, [currentPage, fetchData, filters, quickFilters, submittedSearch]);

  const referenceData = data?.referenceData;

  const customerOptions = useMemo(
    () => [
      { label: 'Select a customer', value: '' },
      ...(referenceData?.customers || []).map((customer) => ({
        label: `${customer.customerCode ? `${customer.customerCode} - ` : ''}${customer.displayName || `Customer ${customer.id}`}`,
        value: customer.id,
      })),
    ],
    [referenceData?.customers],
  );

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput);
    setCurrentPage(1);
    void fetchData({ search: searchInput, page: 1, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleRefresh = () => {
    void fetchData({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleExport = () => {
    const rows = data?.section?.table?.rows || [];
    if (!rows.length) return;
    const csvRows = [
      ['Sponsor Code', 'Name', 'Default Customer', 'Contact', 'Email', 'Status'],
      ...rows.map((row) => [
        row.sponsorCode,
        row.name,
        row.defaultCustomerLabel,
        row.contactName,
        row.email,
        row.status,
      ]),
    ];
    const csvContent = csvRows.map((r) => r.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'scholarship-sponsor-register.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleToggleQuickFilter = (value: string) => {
    setQuickFilters((previous) => toggleFilterValue(previous, value));
    setCurrentPage(1);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormError(null);
    setFormState(initialSponsorCreateFormState);
    setIsFormOpen(true);
  };

  const handleView = async (id: string) => {
    setIsViewOpen(true);
    setIsViewLoading(true);
    setViewDetail(null);
    try {
      const detail = await getSponsorDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load sponsor detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleOpenEdit = async (id: string) => {
    setEditingId(id);
    setFormError(null);
    setIsFormOpen(true);
    setIsViewLoading(true);
    try {
      const detail = await getSponsorDetail(id);
      setFormState({
        sponsorCode: detail.sponsorCode || '',
        name: detail.name || '',
        contactName: detail.contactName || '',
        email: detail.email || '',
        phone: detail.phone || '',
        billingAddress: detail.billingAddress || '',
        defaultCustomer: typeof detail.defaultCustomer === 'object' && detail.defaultCustomer !== null
          ? String((detail.defaultCustomer as Record<string, unknown>).id ?? '')
          : String(detail.defaultCustomer ?? ''),
        status: detail.status || 'active',
        notes: detail.notes || '',
      });
    } catch (detailError) {
      setFormError(detailError instanceof Error ? detailError.message : 'Unable to load sponsor detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const refreshCurrentView = async () => {
    await fetchData({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (editingId) {
        await updateSponsor(editingId, formState as UpdateSponsorInput);
      } else {
        await createSponsor(formState as CreateSponsorInput);
      }
      setIsFormOpen(false);
      await refreshCurrentView();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Unable to save sponsor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteSponsor(deleteTarget.id);
      setDeleteTarget(null);
      await refreshCurrentView();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete sponsor.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 p-[10px]">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{data?.section?.label || 'Scholarship Sponsors'}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{data?.section?.description || 'Scholarship, grant, and sponsorship master records mapped to accounting customers.'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
            <Plus className="h-4 w-4" /> New Sponsor
          </button>
        </div>
      </div>

      {data?.section?.metrics?.length ? <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{data.section.metrics.map((metric) => <div key={metric.id}><MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} /></div>)}</div> : null}

      <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-[var(--card-border)] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <form onSubmit={handleSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder={data?.section?.searchPlaceholder || 'Search sponsor code, name, default customer, contact, or status'} value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-800" />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700">
                <Search className="h-4 w-4" /> Search
              </button>
            </form>
            <button type="button" onClick={() => { if (!isFilterPanelOpen) setDraftFilters({ ...filters }); setIsFilterPanelOpen((previous) => !previous); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isFilterPanelOpen || filterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <Filter className="h-4 w-4" /> Filters
              {filterCount > 0 ? <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{filterCount}</span> : null}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(data?.section?.filters?.quickFilters || []).map((filter) => (
              <button key={filter.value} type="button" onClick={() => handleToggleQuickFilter(filter.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${quickFilters.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 p-[10px] sm:p-5">
          {isFilterPanelOpen ? (
            <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Filters</h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Select as many filter values as needed, then apply them in one step.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => { setDraftFilters({ statuses: [], contactFilter: [] }); setFilters({ statuses: [], contactFilter: [] }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">Clear all</button>
                  <button type="button" onClick={() => setIsFilterPanelOpen(false)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                  <button type="button" onClick={() => { setFilters({ ...draftFilters }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button>
                </div>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.section?.filters?.statuses || SPONSOR_STATUS_OPTIONS).map((option) => {
                      const optLabel = option.label;
                      const optValue = option.value;
                      const selected = draftFilters.statuses.includes(optValue);
                      return <button key={optValue} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, optValue) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{optLabel}</button>;
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Contact</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.section?.filters?.contactFilters || []).map((option) => {
                      const selected = draftFilters.contactFilter.includes(option.value);
                      return <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, contactFilter: toggleFilterValue(previous.contactFilter, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{option.label}</button>;
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{data?.section?.table?.title || 'Scholarship Sponsor Register'}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{data?.section?.table?.description || 'Sponsor records using sponsor code, name, default customer relationship, and status.'}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span>{data?.totals.filteredRows ?? 0} matching rows</span>
              <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50" disabled={!data?.section?.table?.rows?.length}>
                <Download className="h-4 w-4" /> Download View
              </button>
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
                        {['Sponsor Code', 'Name', 'Default Customer', 'Contact', 'Email', 'Status'].map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${column === 'Status' ? 'text-right' : 'text-left'}`}>{column}</th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[var(--card-background)]">
                      {(data?.section?.table?.rows || []).length > 0 ? (data?.section?.table?.rows || []).map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          {row.cells.map((cell, index) => renderCell(cell, index))}
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200" title="View detail">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button type="button" onClick={() => handleOpenEdit(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200" title="Edit sponsor">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button type="button" onClick={() => setDeleteTarget({ id: row.id, name: row.name })} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400" title="Delete sponsor">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No sponsor rows found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {data?.pagination && data.pagination.totalPages > 1 ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Page {data.pagination.page} of {data.pagination.totalPages}</p>
                  <div className="flex gap-2">
                    <button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">Previous</button>
                    <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">Next</button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Sponsor Detail" description="Review scholarship sponsor master record details.">
        {(isViewLoading || isViewOpen) && !viewDetail ? <LoadingSkeleton /> : viewDetail ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['Sponsor Code', viewDetail.sponsorCode || '-'],
                ['Name', viewDetail.name || '-'],
                ['Default Customer', viewDetail.defaultCustomer && typeof viewDetail.defaultCustomer === 'object' ? String((viewDetail.defaultCustomer as Record<string, unknown>).displayName || (viewDetail.defaultCustomer as Record<string, unknown>).customerCode || `Customer #${(viewDetail.defaultCustomer as Record<string, unknown>).id}`) : viewDetail.defaultCustomer ? `Customer #${viewDetail.defaultCustomer}` : '-'],
                ['Contact Name', viewDetail.contactName || '-'],
                ['Email', viewDetail.email || '-'],
                ['Phone', viewDetail.phone || '-'],
                ['Billing Address', viewDetail.billingAddress || '-'],
                ['Status', viewDetail.status || '-'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
                  <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">{value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Notes</p>
              <p className="mt-2 text-sm text-gray-900 dark:text-gray-100">{viewDetail.notes || '-'}</p>
            </div>
            {viewDetail.usageSummary ? (
              <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Usage Summary</p>
                <p className="mt-2 text-sm text-gray-900 dark:text-gray-100">{viewDetail.usageSummary.scholarshipAwardCount} scholarship award(s)</p>
              </div>
            ) : null}
            <div className="flex justify-end border-t border-gray-200 dark:border-[var(--card-border)] pt-4">
              <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 dark:bg-[var(--card-background)] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800">Close</button>
            </div>
          </div>
        ) : null}
      </SlideOver>

      <SlideOver
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? 'Edit Sponsor' : 'New Sponsor'}
        description={editingId ? 'Update the scholarship sponsor master record.' : 'Create a new scholarship, grant, or sponsorship master record.'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError ? <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{formError}</div> : null}

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Sponsor Code" required>
              <Input value={formState.sponsorCode} onChange={(value) => setFormState((previous) => ({ ...previous, sponsorCode: value }))} placeholder="e.g. SPON-001" />
            </FormField>
            <FormField label="Name" required>
              <Input value={formState.name} onChange={(value) => setFormState((previous) => ({ ...previous, name: value }))} placeholder="Sponsor name" />
            </FormField>
            <FormField label="Contact Name">
              <Input value={formState.contactName} onChange={(value) => setFormState((previous) => ({ ...previous, contactName: value }))} placeholder="Contact person" />
            </FormField>
            <FormField label="Email">
              <Input type="email" value={formState.email} onChange={(value) => setFormState((previous) => ({ ...previous, email: value }))} placeholder="Email address" />
            </FormField>
            <FormField label="Phone">
              <Input value={formState.phone} onChange={(value) => setFormState((previous) => ({ ...previous, phone: value }))} placeholder="Phone number" />
            </FormField>
            <FormField label="Default Customer">
              <Select value={formState.defaultCustomer} onChange={(value) => setFormState((previous) => ({ ...previous, defaultCustomer: value }))} options={customerOptions} />
            </FormField>
            <FormField label="Status" required>
              <Select value={formState.status} onChange={(value) => setFormState((previous) => ({ ...previous, status: value }))} options={SPONSOR_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value }))} />
            </FormField>
            <FormField label="Billing Address">
              <TextArea value={formState.billingAddress} onChange={(value) => setFormState((previous) => ({ ...previous, billingAddress: value }))} placeholder="Billing address" rows={2} />
            </FormField>
          </div>

          <FormField label="Notes">
            <TextArea value={formState.notes} onChange={(value) => setFormState((previous) => ({ ...previous, notes: value }))} placeholder="Additional notes" rows={2} />
          </FormField>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 dark:border-[var(--card-border)] pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} disabled={isSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>
              {isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Sponsor'}
            </button>
          </div>
        </form>
      </SlideOver>

      <SlideOver isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete Sponsor" description="Remove this sponsor master record after dependency validation completes." width="max-w-lg">
        <div className="space-y-6">
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-700 dark:text-red-400">
            <p className="font-medium">Delete sponsor {deleteTarget?.name}?</p>
            <p className="mt-1">This action cannot be undone. If the sponsor has active scholarship awards, deletion will be blocked.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-[var(--card-border)] pt-4">
            <button type="button" onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="rounded-lg bg-gray-100 dark:text-gray-300 dark:bg-[var(--card-background)] px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">{isDeleting ? 'Deleting...' : 'Delete Sponsor'}</button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}

// ===================================================================
// CorporateAccountsTab
// ===================================================================

type CorporateAccountFilterState = { statuses: string[]; creditFilter: string[] };
type CorporateAccountActionTarget = { id: string; name: string };

function CorporateAccountsTab({ initialData }: { initialData?: CorporateAccountRegisterResponse | null }) {
  const [data, setData] = useState<CorporateAccountRegisterResponse | null>(initialData ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [searchInput, setSearchInput] = useState(initialData?.appliedFilters?.search || '');
  const [submittedSearch, setSubmittedSearch] = useState(initialData?.appliedFilters?.search || '');
  const [currentPage, setCurrentPage] = useState(initialData?.pagination?.page || 1);
  const [filters, setFilters] = useState<CorporateAccountFilterState>({
    statuses: initialData?.appliedFilters?.statuses || [],
    creditFilter: initialData?.appliedFilters?.creditFilter ? [initialData.appliedFilters.creditFilter] : [],
  });
  const [draftFilters, setDraftFilters] = useState<CorporateAccountFilterState>({
    statuses: initialData?.appliedFilters?.statuses || [],
    creditFilter: initialData?.appliedFilters?.creditFilter ? [initialData.appliedFilters.creditFilter] : [],
  });
  const [quickFilters, setQuickFilters] = useState<string[]>(initialData?.appliedFilters?.quickFilters || []);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [viewDetail, setViewDetail] = useState<CorporateAccountDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [formState, setFormState] = useState<CorporateAccountCreateFormState>(initialCorporateAccountCreateFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CorporateAccountActionTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filterCount = filters.statuses.length + filters.creditFilter.length;

  const fetchData = useCallback(async ({
    search, page, nextFilters, nextQuickFilters,
  }: {
    search: string; page: number; nextFilters: CorporateAccountFilterState; nextQuickFilters: string[];
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getCorporateAccountRegister({
        search, page,
        statuses: nextFilters.statuses,
        creditFilter: nextFilters.creditFilter.length > 0 ? nextFilters.creditFilter[0] : undefined,
        quickFilters: nextQuickFilters,
      });
      setData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load corporate accounts.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  }, [currentPage, fetchData, filters, quickFilters, submittedSearch]);

  const referenceData = data?.referenceData;

  const customerOptions = useMemo(
    () => [
      { label: 'Select a customer', value: '' },
      ...(referenceData?.customers || []).map((customer) => ({
        label: `${customer.customerCode ? `${customer.customerCode} - ` : ''}${customer.displayName || `Customer ${customer.id}`}`,
        value: customer.id,
      })),
    ],
    [referenceData?.customers],
  );

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput);
    setCurrentPage(1);
    void fetchData({ search: searchInput, page: 1, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleRefresh = () => {
    void fetchData({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleExport = () => {
    const rows = data?.section?.table?.rows || [];
    if (!rows.length) return;
    const csvRows = [
      ['Account Code', 'Name', 'Customer', 'Billing Contact', 'Credit Terms', 'Status'],
      ...rows.map((row) => [
        row.accountCode,
        row.name,
        row.customerLabel,
        row.billingContact,
        row.creditTermsLabel,
        row.statusLabel,
      ]),
    ];
    const csvContent = csvRows.map((r) => r.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'corporate-account-register.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleToggleQuickFilter = (value: string) => {
    setQuickFilters((previous) => toggleFilterValue(previous, value));
    setCurrentPage(1);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormError(null);
    setFormState(initialCorporateAccountCreateFormState);
    setIsFormOpen(true);
  };

  const handleView = async (id: string) => {
    setIsViewOpen(true);
    setIsViewLoading(true);
    setViewDetail(null);
    try {
      const detail = await getCorporateAccountDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load corporate account detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleOpenEdit = async (id: string) => {
    setEditingId(id);
    setFormError(null);
    setIsFormOpen(true);
    setIsViewLoading(true);
    try {
      const detail = await getCorporateAccountDetail(id);
      setFormState({
        accountCode: detail.accountCode || '',
        name: detail.name || '',
        customer: typeof detail.customer === 'object' && detail.customer !== null
          ? String((detail.customer as Record<string, unknown>).id ?? '')
          : String(detail.customer ?? ''),
        billingContact: detail.billingContact || '',
        email: detail.email || '',
        phone: detail.phone || '',
        creditTerms: detail.creditTerms || '',
        paymentTerms: detail.paymentTerms || '',
        status: detail.status || 'active',
        notes: detail.notes || '',
      });
    } catch (detailError) {
      setFormError(detailError instanceof Error ? detailError.message : 'Unable to load corporate account detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const refreshCurrentView = async () => {
    await fetchData({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (editingId) {
        await updateCorporateAccount(editingId, formState as UpdateCorporateAccountInput);
      } else {
        await createCorporateAccount(formState as CreateCorporateAccountInput);
      }
      setIsFormOpen(false);
      await refreshCurrentView();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Unable to save corporate account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteCorporateAccount(deleteTarget.id);
      setDeleteTarget(null);
      await refreshCurrentView();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete corporate account.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 p-[10px]">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{data?.section?.label || 'Corporate Accounts'}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{data?.section?.description || 'Create, review, and manage B2B training customer / corporate payer master records with credit terms, billing contact, and account status.'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{data?.totals?.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
            <Plus className="h-4 w-4" /> New Account
          </button>
        </div>
      </div>

      {data?.section?.metrics?.length ? <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{data.section.metrics.map((metric) => <div key={metric.id}><MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} /></div>)}</div> : null}

      <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-[var(--card-border)] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <form onSubmit={handleSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder={data?.section?.searchPlaceholder || 'Search account code, company name, customer, billing contact, or status'} value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-800" />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700">
                <Search className="h-4 w-4" /> Search
              </button>
            </form>
            <button type="button" onClick={() => { if (!isFilterPanelOpen) setDraftFilters({ ...filters }); setIsFilterPanelOpen((previous) => !previous); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isFilterPanelOpen || filterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <Filter className="h-4 w-4" /> Filters
              {filterCount > 0 ? <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{filterCount}</span> : null}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(data?.section?.filters?.quickFilters || []).map((filter) => (
              <button key={filter.value} type="button" onClick={() => handleToggleQuickFilter(filter.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${quickFilters.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 p-[10px] sm:p-5">
          {isFilterPanelOpen ? (
            <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Filters</h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Select as many filter values as needed, then apply them in one step.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => { setDraftFilters({ statuses: [], creditFilter: [] }); setFilters({ statuses: [], creditFilter: [] }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">Clear all</button>
                  <button type="button" onClick={() => setIsFilterPanelOpen(false)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                  <button type="button" onClick={() => { setFilters({ ...draftFilters }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button>
                </div>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.section?.filters?.statuses || SPONSOR_STATUS_OPTIONS).map((option) => {
                      const optLabel = option.label;
                      const optValue = option.value;
                      const selected = draftFilters.statuses.includes(optValue);
                      return <button key={optValue} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, optValue) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{optLabel}</button>;
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Credit</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.section?.filters?.creditFilters || []).map((option) => {
                      const selected = draftFilters.creditFilter.includes(option.value);
                      return <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, creditFilter: toggleFilterValue(previous.creditFilter, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{option.label}</button>;
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{data?.section?.table?.title || 'Corporate Account Register'}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{data?.section?.table?.description || 'Corporate account records using account code, linked customer, billing contact, terms, and status.'}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span>{data?.totals?.filteredRows ?? 0} matching rows</span>
              <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50" disabled={!data?.section?.table?.rows?.length}>
                <Download className="h-4 w-4" /> Download View
              </button>
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
                        {['Account Code', 'Name', 'Customer', 'Billing Contact', 'Credit Terms', 'Status'].map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${column === 'Status' ? 'text-right' : 'text-left'}`}>{column}</th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[var(--card-background)]">
                      {(data?.section?.table?.rows || []).length > 0 ? (data?.section?.table?.rows || []).map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          {row.cells.map((cell, index) => renderCell(cell, index))}
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200" title="View detail">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button type="button" onClick={() => handleOpenEdit(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200" title="Edit account">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button type="button" onClick={() => setDeleteTarget({ id: row.id, name: row.name })} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400" title="Delete account">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No corporate account rows found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {data?.pagination && data.pagination.totalPages > 1 ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Page {data.pagination.page} of {data.pagination.totalPages}</p>
                  <div className="flex gap-2">
                    <button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">Previous</button>
                    <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">Next</button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Corporate Account Detail" description="Review corporate payer master record details.">
        {(isViewLoading || isViewOpen) && !viewDetail ? <LoadingSkeleton /> : viewDetail ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['Account Code', viewDetail.accountCode || '-'],
                ['Name', viewDetail.name || '-'],
                ['Customer', viewDetail.customer && typeof viewDetail.customer === 'object' ? String((viewDetail.customer as Record<string, unknown>).displayName || (viewDetail.customer as Record<string, unknown>).customerCode || `Customer #${(viewDetail.customer as Record<string, unknown>).id}`) : viewDetail.customer ? `Customer #${viewDetail.customer}` : '-'],
                ['Billing Contact', viewDetail.billingContact || '-'],
                ['Email', viewDetail.email || '-'],
                ['Phone', viewDetail.phone || '-'],
                ['Credit Terms', viewDetail.creditTerms || '-'],
                ['Payment Terms', viewDetail.paymentTerms || '-'],
                ['Status', viewDetail.status || '-'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
                  <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">{value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Notes</p>
              <p className="mt-2 text-sm text-gray-900 dark:text-gray-100">{viewDetail.notes || '-'}</p>
            </div>
            {viewDetail.usageSummary ? (
              <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Usage Summary</p>
                <p className="mt-2 text-sm text-gray-900 dark:text-gray-100">{viewDetail.usageSummary.corporateBillingLinkCount} corporate billing link(s)</p>
              </div>
            ) : null}
            <div className="flex justify-end border-t border-gray-200 dark:border-[var(--card-border)] pt-4">
              <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 dark:bg-[var(--card-background)] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800">Close</button>
            </div>
          </div>
        ) : null}
      </SlideOver>

      <SlideOver
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? 'Edit Corporate Account' : 'New Corporate Account'}
        description={editingId ? 'Update the corporate payer master record.' : 'Create a new B2B training customer / corporate payer master record.'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError ? <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400"><AlertCircle className="h-4 w-4 shrink-0" />{formError}</div> : null}

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Account Code" required>
              <Input value={formState.accountCode} onChange={(value) => setFormState((previous) => ({ ...previous, accountCode: value }))} placeholder="e.g. CORP-001" />
            </FormField>
            <FormField label="Name" required>
              <Input value={formState.name} onChange={(value) => setFormState((previous) => ({ ...previous, name: value }))} placeholder="Company name" />
            </FormField>
            <FormField label="Customer" required>
              <Select value={formState.customer} onChange={(value) => setFormState((previous) => ({ ...previous, customer: value }))} options={customerOptions} />
            </FormField>
            <FormField label="Billing Contact">
              <Input value={formState.billingContact} onChange={(value) => setFormState((previous) => ({ ...previous, billingContact: value }))} placeholder="Contact person" />
            </FormField>
            <FormField label="Email">
              <Input type="email" value={formState.email} onChange={(value) => setFormState((previous) => ({ ...previous, email: value }))} placeholder="Email address" />
            </FormField>
            <FormField label="Phone">
              <Input value={formState.phone} onChange={(value) => setFormState((previous) => ({ ...previous, phone: value }))} placeholder="Phone number" />
            </FormField>
            <FormField label="Credit Terms">
              <Input value={formState.creditTerms} onChange={(value) => setFormState((previous) => ({ ...previous, creditTerms: value }))} placeholder="e.g. Net 30" />
            </FormField>
            <FormField label="Payment Terms">
              <Input value={formState.paymentTerms} onChange={(value) => setFormState((previous) => ({ ...previous, paymentTerms: value }))} placeholder="e.g. Due on receipt" />
            </FormField>
            <FormField label="Status" required>
              <Select value={formState.status} onChange={(value) => setFormState((previous) => ({ ...previous, status: value }))} options={SPONSOR_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value }))} />
            </FormField>
          </div>

          <FormField label="Notes">
            <TextArea value={formState.notes} onChange={(value) => setFormState((previous) => ({ ...previous, notes: value }))} placeholder="Additional notes" rows={2} />
          </FormField>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 dark:border-[var(--card-border)] pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} disabled={isSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>
              {isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Account'}
            </button>
          </div>
        </form>
      </SlideOver>

      <SlideOver isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete Corporate Account" description="Remove this corporate account after dependency validation completes." width="max-w-lg">
        <div className="space-y-6">
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-700 dark:text-red-400">
            <p className="font-medium">Delete corporate account {deleteTarget?.name}?</p>
            <p className="mt-1">This action cannot be undone. If the corporate account has active billing links, deletion will be blocked.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-[var(--card-border)] pt-4">
            <button type="button" onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="rounded-lg bg-gray-100 dark:bg-[var(--card-background)] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">{isDeleting ? 'Deleting...' : 'Delete Corporate Account'}</button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}

// ===================================================================
// CoverageLinksTab
// ===================================================================

type CoverageLinkActionTarget = { id: string; name: string };
type CoverageCreateType = 'award' | 'billing';

type CoverageLinkFormState = {
  enrollmentBillingLink: string;
  scholarshipSponsor: string;
  trainee: string;
  awardType: string;
  awardAmount: string;
  awardPercent: string;
  traineeShareAmount: string;
  effectiveDate: string;
  status: string;
  notes: string;
};

type CoverageBillingFormState = {
  corporateAccount: string;
  enrollmentBillingLink: string;
  invoice: string;
  coverageType: string;
  coveredAmount: string;
  traineeShareAmount: string;
  status: string;
  notes: string;
};

const initialCoverageAwardFormState: CoverageLinkFormState = {
  enrollmentBillingLink: '',
  scholarshipSponsor: '',
  trainee: '',
  awardType: 'partial',
  awardAmount: '',
  awardPercent: '',
  traineeShareAmount: '',
  effectiveDate: new Date().toISOString().slice(0, 10),
  status: 'active',
  notes: '',
};

const initialCoverageBillingFormState: CoverageBillingFormState = {
  corporateAccount: '',
  enrollmentBillingLink: '',
  invoice: '',
  coverageType: 'full_company_pay',
  coveredAmount: '',
  traineeShareAmount: '',
  status: 'active',
  notes: '',
};

function CoverageLinksTab({
  initialSponsorData,
  initialCorporateAccountData,
}: {
  initialSponsorData?: SponsorRegisterResponse | null;
  initialCorporateAccountData?: CorporateAccountRegisterResponse | null;
}) {
  const [data, setData] = useState<CoverageLinkRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<CoverageLinkActionTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<CoverageCreateType>('award');
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [coverageCreateType, setCoverageCreateType] = useState<CoverageCreateType>('award');
  const [awardForm, setAwardForm] = useState<CoverageLinkFormState>(initialCoverageAwardFormState);
  const [billingForm, setBillingForm] = useState<CoverageBillingFormState>(initialCoverageBillingFormState);
  const [editAwardForm, setEditAwardForm] = useState<CoverageLinkFormState>(initialCoverageAwardFormState);
  const [editBillingForm, setEditBillingForm] = useState<CoverageBillingFormState>(initialCoverageBillingFormState);
  const [accountData, setAccountData] = useState<CorporateAccountRegisterResponse | null>(initialCorporateAccountData ?? null);
  const [billingLinkChoices, setBillingLinkChoices] = useState<CustomerChoice[]>([]);
  const [traineeChoices, setTraineeChoices] = useState<CustomerChoice[]>([]);

  const fetchData = useCallback(async ({
    search, page, nextQuickFilters,
  }: {
    search: string; page: number; nextQuickFilters: string[];
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getCoverageLinkRegister({
        search, page,
        quickFilters: nextQuickFilters,
      });
      setData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load coverage links.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData({
      search: submittedSearch,
      page: currentPage,
      nextQuickFilters: quickFilters,
    });
  }, [currentPage, fetchData, quickFilters, submittedSearch]);

  const fetchAccountData = useCallback(async () => {
    try {
      const result = await getCorporateAccountRegister({ page: 1, limit: 1000 });
      setAccountData(result);
    } catch {
      // silently fail
    }
  }, []);

  const fetchBillingLinkChoices = useCallback(async () => {
    try {
      const result = await getEnrollmentBillingLinkChoices();
      setBillingLinkChoices(result);
    } catch {
      setBillingLinkChoices([]);
    }
  }, []);

  const fetchTraineeChoices = useCallback(async () => {
    try {
      const result = await getTraineeChoices();
      setTraineeChoices(result);
    } catch {
      setTraineeChoices([]);
    }
  }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput);
    setCurrentPage(1);
    void fetchData({ search: searchInput, page: 1, nextQuickFilters: quickFilters });
  };

  const handleRefresh = () => {
    void fetchData({ search: submittedSearch, page: currentPage, nextQuickFilters: quickFilters });
  };

  const handleExport = () => {
    const rows = data?.section?.table?.rows || [];
    if (!rows.length) return;
    const csvRows = [
      ['Link Type', 'Entity', 'Coverage Type', 'Covered Amount', 'Trainee Share', 'Status'],
      ...rows.map((row) => [
        row.linkType,
        row.entity,
        row.coverageType,
        String(row.coveredAmount),
        String(row.traineeShareAmount),
        row.status,
      ]),
    ];
    const csvContent = csvRows.map((r) => r.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'coverage-link-register.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleToggleQuickFilter = (value: string) => {
    setQuickFilters((previous) => toggleFilterValue(previous, value));
    setCurrentPage(1);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormError(null);
    setCoverageCreateType('award');
    setAwardForm(initialCoverageAwardFormState);
    setBillingForm(initialCoverageBillingFormState);
    setIsFormOpen(true);
    void fetchBillingLinkChoices();
    void fetchTraineeChoices();
    void fetchAccountData();
  };

  const handleOpenEdit = async (id: string) => {
    setEditingId(id);
    setFormError(null);
    setIsFormOpen(true);
    setIsFormLoading(true);
    const isAward = id.startsWith('scholarship-');
    const actualId = id.replace(/^(scholarship|corporate)-/, '');
    setEditingType(isAward ? 'award' : 'billing');
    try {
      if (isAward) {
        const detail = await getScholarshipAwardDetail(actualId);
        setEditAwardForm({
          enrollmentBillingLink: String(detail.enrollmentBillingLink ?? ''),
          scholarshipSponsor: String(detail.scholarshipSponsor ?? ''),
          trainee: String(detail.trainee ?? ''),
          awardType: String(detail.awardType ?? 'partial'),
          awardAmount: String(detail.awardAmount ?? ''),
          awardPercent: String(detail.awardPercent ?? ''),
          traineeShareAmount: String(detail.traineeShareAmount ?? ''),
          effectiveDate: detail.effectiveDate ? String(detail.effectiveDate).slice(0, 10) : new Date().toISOString().slice(0, 10),
          status: String(detail.status ?? 'active'),
          notes: String(detail.notes ?? ''),
        });
      } else {
        const detail = await getCorporateBillingLinkDetail(actualId);
        setEditBillingForm({
          corporateAccount: String(detail.corporateAccount ?? ''),
          enrollmentBillingLink: String(detail.enrollmentBillingLink ?? ''),
          invoice: String(detail.invoice ?? ''),
          coverageType: String(detail.coverageType ?? 'full_company_pay'),
          coveredAmount: String(detail.coveredAmount ?? ''),
          traineeShareAmount: String(detail.traineeShareAmount ?? ''),
          status: String(detail.status ?? 'active'),
          notes: String(detail.notes ?? ''),
        });
      }
    } catch (detailError) {
      setFormError(detailError instanceof Error ? detailError.message : 'Unable to load coverage link detail.');
    } finally {
      setIsFormLoading(false);
    }
  };

  const refreshCurrentView = async () => {
    await fetchData({
      search: submittedSearch,
      page: currentPage,
      nextQuickFilters: quickFilters,
    });
  };

  const handleCreateSubmit = async (
    type: CoverageCreateType,
    formData: CoverageLinkFormState | CoverageBillingFormState,
  ) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (type === 'award') {
        const awardData = formData as CoverageLinkFormState;
        await createScholarshipAward({
          enrollmentBillingLink: Number(awardData.enrollmentBillingLink) || awardData.enrollmentBillingLink,
          scholarshipSponsor: Number(awardData.scholarshipSponsor) || awardData.scholarshipSponsor,
          trainee: Number(awardData.trainee) || awardData.trainee,
          awardType: awardData.awardType,
          awardAmount: awardData.awardAmount ? Number(awardData.awardAmount) : null,
          awardPercent: awardData.awardPercent ? Number(awardData.awardPercent) : null,
          traineeShareAmount: awardData.traineeShareAmount ? Number(awardData.traineeShareAmount) : null,
          effectiveDate: awardData.effectiveDate,
          status: awardData.status,
          notes: awardData.notes || null,
        });
      } else {
        const billingData = formData as CoverageBillingFormState;
        await createCorporateBillingLink({
          corporateAccount: Number(billingData.corporateAccount) || billingData.corporateAccount,
          enrollmentBillingLink: Number(billingData.enrollmentBillingLink) || billingData.enrollmentBillingLink,
          invoice: billingData.invoice ? Number(billingData.invoice) || billingData.invoice : null,
          coverageType: billingData.coverageType,
          coveredAmount: billingData.coveredAmount ? Number(billingData.coveredAmount) : null,
          traineeShareAmount: billingData.traineeShareAmount ? Number(billingData.traineeShareAmount) : null,
          status: billingData.status,
          notes: billingData.notes || null,
        });
      }
      setIsFormOpen(false);
      await refreshCurrentView();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Unable to save coverage link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubmit = async () => {
    if (!editingId) return;
    setIsSubmitting(true);
    setFormError(null);
    const actualId = editingId.replace(/^(scholarship|corporate)-/, '');
    try {
      if (editingType === 'award') {
        const f = editAwardForm;
        await updateScholarshipAward(actualId, {
          awardType: f.awardType,
          awardAmount: f.awardAmount ? Number(f.awardAmount) : null,
          awardPercent: f.awardPercent ? Number(f.awardPercent) : null,
          traineeShareAmount: f.traineeShareAmount ? Number(f.traineeShareAmount) : null,
          effectiveDate: f.effectiveDate,
          status: f.status,
          notes: f.notes || null,
        });
      } else {
        const f = editBillingForm;
        await updateCorporateBillingLink(actualId, {
          coverageType: f.coverageType,
          coveredAmount: f.coveredAmount ? Number(f.coveredAmount) : null,
          traineeShareAmount: f.traineeShareAmount ? Number(f.traineeShareAmount) : null,
          invoice: f.invoice ? Number(f.invoice) || f.invoice : null,
          status: f.status,
          notes: f.notes || null,
        });
      }
      setIsFormOpen(false);
      setEditingId(null);
      await refreshCurrentView();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Unable to update coverage link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    const isAward = deleteTarget.id.startsWith('scholarship-');
    const actualId = deleteTarget.id.replace(/^(scholarship|corporate)-/, '');
    try {
      if (isAward) {
        await deleteScholarshipAward(actualId);
      } else {
        await deleteCorporateBillingLink(actualId);
      }
      setDeleteTarget(null);
      await refreshCurrentView();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete coverage link.');
    } finally {
      setIsDeleting(false);
    }
  };

  const sponsorOptions = useMemo(
    () => [
      { label: 'Select a sponsor', value: '' },
      ...(initialSponsorData?.section?.table?.rows || []).map((s) => ({
        label: s.name || `Sponsor ${s.id}`,
        value: String(s.id),
      })),
    ],
    [initialSponsorData],
  );

  const accountOptions = useMemo(
    () => [
      { label: 'Select an account', value: '' },
      ...(accountData?.section?.table?.rows || []).map((a) => ({
        label: a.name || `Account ${a.id}`,
        value: String(a.id),
      })),
    ],
    [accountData],
  );

  return (
    <div className="space-y-6 p-[10px]">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{data?.section?.label || 'Coverage Links'}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{data?.section?.description || 'Coverage links that connect enrollment billing to payer entities.'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{data?.totals?.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
            <Plus className="h-4 w-4" /> New Coverage Link
          </button>
        </div>
      </div>

      {data?.section?.metrics?.length ? <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{data.section.metrics.map((metric) => <div key={metric.id}><MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} /></div>)}</div> : null}

      <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-[var(--card-border)] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <form onSubmit={handleSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder={data?.section?.searchPlaceholder || 'Search sponsor, corporate account, coverage type, enrollment link, or status'} value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-800" />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700">
                <Search className="h-4 w-4" /> Search
              </button>
            </form>
          </div>
          <div className="flex flex-wrap gap-2">
            {(data?.section?.filters?.quickFilters || []).map((filter) => (
              <button key={filter.value} type="button" onClick={() => handleToggleQuickFilter(filter.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${quickFilters.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 p-[10px] sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{data?.section?.table?.title || 'Coverage Link Register'}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{data?.section?.table?.description || 'Coverage links drawn from scholarship awards and corporate billing-link records.'}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span>{data?.totals?.filteredRows ?? 0} matching rows</span>
              <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50" disabled={!data?.section?.table?.rows?.length}>
                <Download className="h-4 w-4" /> Download View
              </button>
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
                        {['Link Type', 'Entity', 'Coverage Type', 'Covered Amount', 'Trainee Share', 'Status'].map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${column === 'Status' ? 'text-right' : 'text-left'}`}>{column}</th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[var(--card-background)]">
                      {(data?.section?.table?.rows || []).length > 0 ? (data?.section?.table?.rows || []).map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          {row.cells.map((cell, index) => renderCell(cell, index))}
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => handleOpenEdit(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200" title="Edit coverage link">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button type="button" onClick={() => setDeleteTarget({ id: row.id, name: `${row.linkType} - ${row.entity}` })} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400" title="Delete coverage link">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No coverage links found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {data?.pagination && data.pagination.totalPages > 1 ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Page {data.pagination.page} of {data.pagination.totalPages}</p>
                  <div className="flex gap-2">
                    <button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">Previous</button>
                    <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">Next</button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <SlideOver
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingId(null); }}
        title={editingId ? 'Edit Coverage Link' : 'New Coverage Link'}
        description={editingId ? 'Update the coverage link record.' : 'Create a scholarship award or corporate billing link.'}
      >
        <div className="space-y-6">
          {formError ? <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400"><AlertCircle className="h-4 w-4 shrink-0" />{formError}</div> : null}

          {editingId ? null : (
            <div className="flex gap-4">
              <button type="button" onClick={() => setCoverageCreateType('award')} className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium ${coverageCreateType === 'award' ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>Scholarship Award</button>
              <button type="button" onClick={() => setCoverageCreateType('billing')} className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium ${coverageCreateType === 'billing' ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>Corporate Billing Link</button>
            </div>
          )}

          {isFormLoading ? <LoadingSkeleton /> : editingId && editingType === 'award' || (!editingId && coverageCreateType === 'award') ? (
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Enrollment Billing Link" required>
                {editingId ? (
                  <Input value={editAwardForm.enrollmentBillingLink} onChange={() => {}} disabled />
                ) : (
                  <Select value={awardForm.enrollmentBillingLink} onChange={(v) => setAwardForm((p) => ({ ...p, enrollmentBillingLink: v }))} options={[{ label: 'Select billing link', value: '' }, ...billingLinkChoices.map((b) => ({ label: b.label, value: String(b.value) }))]} />
                )}
              </FormField>
              <FormField label="Scholarship Sponsor" required>
                {editingId ? (
                  <Input value={editAwardForm.scholarshipSponsor} onChange={() => {}} disabled />
                ) : (
                  <Select value={awardForm.scholarshipSponsor} onChange={(v) => setAwardForm((p) => ({ ...p, scholarshipSponsor: v }))} options={sponsorOptions} />
                )}
              </FormField>
              <FormField label="Trainee" required>
                {editingId ? (
                  <Input value={editAwardForm.trainee} onChange={() => {}} disabled />
                ) : (
                  <Select value={awardForm.trainee} onChange={(v) => setAwardForm((p) => ({ ...p, trainee: v }))} options={[{ label: 'Select trainee', value: '' }, ...traineeChoices.map((t) => ({ label: t.label, value: String(t.value) }))]} />
                )}
              </FormField>
              <FormField label="Award Type" required>
                <Select value={editingId ? editAwardForm.awardType : awardForm.awardType} onChange={(v) => editingId ? setEditAwardForm((p) => ({ ...p, awardType: v })) : setAwardForm((p) => ({ ...p, awardType: v }))} options={[{ label: 'Full', value: 'full' }, { label: 'Partial', value: 'partial' }, { label: 'Contra Revenue', value: 'contra_revenue' }, { label: 'Third Party Billed', value: 'third_party_billed' }]} />
              </FormField>
              <FormField label="Award Amount">
                <Input type="number" value={editingId ? editAwardForm.awardAmount : awardForm.awardAmount} onChange={(v) => editingId ? setEditAwardForm((p) => ({ ...p, awardAmount: v })) : setAwardForm((p) => ({ ...p, awardAmount: v }))} />
              </FormField>
              <FormField label="Award Percent">
                <Input type="number" value={editingId ? editAwardForm.awardPercent : awardForm.awardPercent} onChange={(v) => editingId ? setEditAwardForm((p) => ({ ...p, awardPercent: v })) : setAwardForm((p) => ({ ...p, awardPercent: v }))} />
              </FormField>
              <FormField label="Trainee Share Amount">
                <Input type="number" value={editingId ? editAwardForm.traineeShareAmount : awardForm.traineeShareAmount} onChange={(v) => editingId ? setEditAwardForm((p) => ({ ...p, traineeShareAmount: v })) : setAwardForm((p) => ({ ...p, traineeShareAmount: v }))} />
              </FormField>
              <FormField label="Effective Date">
                <Input type="date" value={editingId ? editAwardForm.effectiveDate : awardForm.effectiveDate} onChange={(v) => editingId ? setEditAwardForm((p) => ({ ...p, effectiveDate: v })) : setAwardForm((p) => ({ ...p, effectiveDate: v }))} />
              </FormField>
              <FormField label="Status" required>
                <Select value={editingId ? editAwardForm.status : awardForm.status} onChange={(v) => editingId ? setEditAwardForm((p) => ({ ...p, status: v })) : setAwardForm((p) => ({ ...p, status: v }))} options={SPONSOR_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value }))} />
              </FormField>
              <div className="md:col-span-2">
                <FormField label="Notes">
                  <TextArea value={editingId ? editAwardForm.notes : awardForm.notes} onChange={(v) => editingId ? setEditAwardForm((p) => ({ ...p, notes: v })) : setAwardForm((p) => ({ ...p, notes: v }))} rows={2} />
                </FormField>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Corporate Account" required>
                {editingId ? (
                  <Input value={editBillingForm.corporateAccount} onChange={() => {}} disabled />
                ) : (
                  <Select value={billingForm.corporateAccount} onChange={(v) => setBillingForm((p) => ({ ...p, corporateAccount: v }))} options={accountOptions} />
                )}
              </FormField>
              <FormField label="Enrollment Billing Link" required>
                {editingId ? (
                  <Input value={editBillingForm.enrollmentBillingLink} onChange={() => {}} disabled />
                ) : (
                  <Select value={billingForm.enrollmentBillingLink} onChange={(v) => setBillingForm((p) => ({ ...p, enrollmentBillingLink: v }))} options={[{ label: 'Select billing link', value: '' }, ...billingLinkChoices.map((b) => ({ label: b.label, value: String(b.value) }))]} />
                )}
              </FormField>
              <FormField label="Invoice">
                {editingId ? (
                  <Input value={editBillingForm.invoice} onChange={() => {}} disabled />
                ) : (
                  <Select value={billingForm.invoice} onChange={(v) => setBillingForm((p) => ({ ...p, invoice: v }))} options={[{ label: 'Select invoice (optional)', value: '' }]} />
                )}
              </FormField>
              <FormField label="Coverage Type" required>
                <Select value={editingId ? editBillingForm.coverageType : billingForm.coverageType} onChange={(v) => editingId ? setEditBillingForm((p) => ({ ...p, coverageType: v })) : setBillingForm((p) => ({ ...p, coverageType: v }))} options={[{ label: 'Full Company Pay', value: 'full_company_pay' }, { label: 'Shared Pay', value: 'shared_pay' }, { label: 'Credit Terms', value: 'credit_terms' }]} />
              </FormField>
              <FormField label="Covered Amount">
                <Input type="number" value={editingId ? editBillingForm.coveredAmount : billingForm.coveredAmount} onChange={(v) => editingId ? setEditBillingForm((p) => ({ ...p, coveredAmount: v })) : setBillingForm((p) => ({ ...p, coveredAmount: v }))} />
              </FormField>
              <FormField label="Trainee Share Amount">
                <Input type="number" value={editingId ? editBillingForm.traineeShareAmount : billingForm.traineeShareAmount} onChange={(v) => editingId ? setEditBillingForm((p) => ({ ...p, traineeShareAmount: v })) : setBillingForm((p) => ({ ...p, traineeShareAmount: v }))} />
              </FormField>
              <FormField label="Status" required>
                <Select value={editingId ? editBillingForm.status : billingForm.status} onChange={(v) => editingId ? setEditBillingForm((p) => ({ ...p, status: v })) : setBillingForm((p) => ({ ...p, status: v }))} options={SPONSOR_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value }))} />
              </FormField>
              <div className="md:col-span-2">
                <FormField label="Notes">
                  <TextArea value={editingId ? editBillingForm.notes : billingForm.notes} onChange={(v) => editingId ? setEditBillingForm((p) => ({ ...p, notes: v })) : setBillingForm((p) => ({ ...p, notes: v }))} rows={2} />
                </FormField>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 dark:border-[var(--card-border)] pt-4">
            <button type="button" onClick={() => { setIsFormOpen(false); setEditingId(null); }} disabled={isSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={editingId ? handleUpdateSubmit : () => handleCreateSubmit(coverageCreateType, coverageCreateType === 'award' ? awardForm : billingForm)} disabled={isSubmitting || isFormLoading} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>
              {isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : `Create ${coverageCreateType === 'award' ? 'Award' : 'Billing Link'}`}
            </button>
          </div>
        </div>
      </SlideOver>

      <SlideOver isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete Coverage Link" description="Remove this coverage link record." width="max-w-lg">
        <div className="space-y-6">
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-700 dark:text-red-400">
            <p className="font-medium">Delete coverage link {deleteTarget?.name}?</p>
            <p className="mt-1">This action cannot be undone. The coverage link will be permanently removed.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-[var(--card-border)] pt-4">
            <button type="button" onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="rounded-lg bg-gray-100 dark:bg-[var(--card-background)] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">{isDeleting ? 'Deleting...' : 'Delete Coverage Link'}</button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}

// ===================================================================
// SponsorsClient
// ===================================================================

export function SponsorsClient({
  initialSponsorData,
  initialCorporateAccountData,
}: {
  initialSponsorData?: SponsorRegisterResponse | null;
  initialCorporateAccountData?: CorporateAccountRegisterResponse | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = (Object.values(TAB_IDS) as TabId[]).find((id) => id === rawTab) || 'scholarship-sponsors';

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6 p-[10px]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Core / Master Records</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sponsored & Corporate Billing Entities</h1>
              <p className="mt-1 max-w-3xl text-sm text-gray-600 dark:text-gray-400">Maintain sponsor and corporate payer entities together with the coverage links that support scholarship and company-billed training.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] shadow-sm">
        <div className="border-b border-gray-200 dark:border-[var(--card-border)] px-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            <button type="button" onClick={() => handleTabChange('scholarship-sponsors')} className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${activeTab === 'scholarship-sponsors' ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'}`}>
              Scholarship Sponsors
            </button>
            <button type="button" onClick={() => handleTabChange('corporate-accounts')} className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${activeTab === 'corporate-accounts' ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'}`}>
              Corporate Accounts
            </button>
            <button type="button" onClick={() => handleTabChange('coverage-links')} className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${activeTab === 'coverage-links' ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'}`}>
              Coverage Links
            </button>
          </nav>
        </div>

        {activeTab === 'scholarship-sponsors' && <ScholarshipSponsorsTab initialData={initialSponsorData} />}
        {activeTab === 'corporate-accounts' && <CorporateAccountsTab initialData={initialCorporateAccountData} />}
        {activeTab === 'coverage-links' && <CoverageLinksTab initialSponsorData={initialSponsorData} initialCorporateAccountData={initialCorporateAccountData} />}
      </div>

    </div>
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
  const [mounted, setMounted] = useState(isOpen);
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
              {description ? (<p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{description}</p>) : null}
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
