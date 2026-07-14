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
  Send,
  Trash2,
  X,
} from 'lucide-react';
import {
  createEnrollmentBillingLink,
  createPaymentAllocation,
  deleteEnrollmentBillingLink,
  deletePaymentAllocation,
  getEnrollmentBillingLinkDetail,
  getEnrollmentBillingLinks,
  getEnrollmentFinanceSummary,
  getEnrollmentFinanceSummaryDetail,
  getPaymentAllocationDetail,
  getPaymentAllocations,
  syncEnrollmentBillingLink,
  updateEnrollmentBillingLink,
  updatePaymentAllocation,
  type BillingLinkDetail,
  type BillingLinksResponse,
  type Cell,
  type FinanceSummaryResponse,
  type Metric,
  type PaymentAllocationDetail,
  type PaymentAllocationMutationInput,
  type PaymentAllocationResponse,
} from './actions';

type TabId = 'enrollment-billing-links' | 'enrollment-finance-summary' | 'payment-allocations';
type BillingLinkFilterState = { statuses: string[]; courseIds: string[] };
type FinanceSummaryFilterState = { statuses: string[] };
type PaymentAllocationFilterState = { allocationTypes: string[] };
type BillingLinkActionTarget = { id: string; sourceReference: string };
type PaymentAllocationActionTarget = { id: string; paymentLabel: string };

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
    id: 'enrollment-billing-links',
    label: 'Enrollment Billing Links',
    description: 'Review bridge records that connect LMS enrollments to customers, invoices, billing status, and the final finance snapshots carried into accounting.',
    searchPlaceholder: 'Search enrollment, source reference, customer, invoice, billing status, or final charge',
    columns: ['Source Ref', 'Course', 'Customer', 'Invoice', 'Billing Status', 'Final Charge'],
    tableTitle: 'Enrollment Billing Link Register',
    tableDescription: 'Bridge records aligned to accounting-enrollment-billing-links, including invoice, customer, billing status, and final charge snapshot.',
  },
  {
    id: 'enrollment-finance-summary',
    label: 'Enrollment Finance Summary',
    description: 'Review LMS billing summaries built from list price, sale price, coupon discount, scholarship discount, corporate coverage, adjustments, paid amount, and balance due.',
    searchPlaceholder: 'Search enrollment, customer, sale price, discounts, corporate coverage, paid amount, or balance due',
    columns: ['Enrollment', 'Sale Price', 'Discounts', 'Corporate', 'Paid', 'Balance Due'],
    tableTitle: 'Enrollment Finance Summary Register',
    tableDescription: 'Summary view of finance calculation using the charge breakdown and balance logic derived from linked records.',
  },
  {
    id: 'payment-allocations',
    label: 'Payment Allocations',
    description: 'Review LMS payment allocations created from payment applications, including invoice settlement and installment-payment allocation types.',
    searchPlaceholder: 'Search payment, invoice, billing link, allocation type, allocation date, or allocated amount',
    columns: ['Payment', 'Invoice', 'Billing Link', 'Allocation Date', 'Allocated Amount', 'Type'],
    tableTitle: 'Payment Allocation Register',
    tableDescription: 'Allocation records aligned to accounting-payment-allocations, including the payment, invoice, billing link, amount, and allocation type.',
  },
];

const MUTABLE_STATUSES = new Set(['not_started', 'drafted', 'invoiced']);

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  if (variant === 'ghost') return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
}

function getMetricTone(trend: Metric['trend']) {
  if (trend === 'down') return 'text-red-600 bg-red-50';
  if (trend === 'neutral') return 'text-gray-600 bg-gray-100';
  return 'text-green-600 bg-green-50';
}

function escapeCsvValue(value: string | number | boolean | null | undefined) {
  const stringValue = String(value ?? '');
  return /[",\n]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
}

function toggleFilterValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
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
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500"
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
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500"
    >
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
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
      <div className={`flex h-full w-full ${width} flex-col bg-white shadow-xl transition-all duration-300 ease-in-out ${animate ? 'translate-x-0' : 'translate-x-full'}`} onClick={(event) => event.stopPropagation()}>
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
          <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="mt-4 h-8 w-20 animate-pulse rounded bg-gray-100" />
            <div className="mt-4 h-5 w-28 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: 7 }).map((_, index) => (
                  <th key={index} className="px-4 py-3">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan={7} className="px-4 py-3">
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

function renderCell(cell: Cell, index: number) {
  if (typeof cell === 'string') {
    return <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{cell}</td>;
  }

  const alignClass = cell.align === 'right' ? 'text-right' : cell.align === 'center' ? 'text-center' : 'text-left';
  if (cell.tone) {
    const toneMap: Record<string, string> = {
      amber: 'bg-amber-50 text-amber-700 ring-amber-200',
      blue: 'bg-blue-50 text-blue-700 ring-blue-200',
      gray: 'bg-gray-100 text-gray-700 ring-gray-200',
      green: 'bg-green-50 text-green-700 ring-green-200',
      red: 'bg-red-50 text-red-700 ring-red-200',
    };
    return (
      <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${alignClass}`}>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${toneMap[cell.tone] || toneMap.gray}`}>{cell.text}</span>
      </td>
    );
  }

  return <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${cell.emphasis ? 'font-semibold text-gray-900' : 'text-gray-600'} ${alignClass}`}>{cell.text}</td>;
}

export function EnrollmentBillingOperationsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = (STATIC_TABS.find((tab) => tab.id === rawTab)?.id) || 'enrollment-billing-links';
  const currentTab = STATIC_TABS.find((tab) => tab.id === activeTab) || STATIC_TABS[0];

  // State for billing links tab
  const [billingLinksData, setBillingLinksData] = useState<BillingLinksResponse | null>(null);
  const [financeSummaryData, setFinanceSummaryData] = useState<FinanceSummaryResponse | null>(null);
  const [paymentAllocationsData, setPaymentAllocationsData] = useState<PaymentAllocationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Billing links search/filter/pagination
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<BillingLinkFilterState>({ statuses: [], courseIds: [] });
  const [draftFilters, setDraftFilters] = useState<BillingLinkFilterState>({ statuses: [], courseIds: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Finance summary search/filter/pagination
  const [financeSearchInput, setFinanceSearchInput] = useState('');
  const [financeSubmittedSearch, setFinanceSubmittedSearch] = useState('');
  const [financeCurrentPage, setFinanceCurrentPage] = useState(1);
  const [financeFilters, setFinanceFilters] = useState<FinanceSummaryFilterState>({ statuses: [] });
  const [financeDraftFilters, setFinanceDraftFilters] = useState<FinanceSummaryFilterState>({ statuses: [] });
  const [financeQuickFilters, setFinanceQuickFilters] = useState<string[]>([]);
  const [isFinanceFilterPanelOpen, setIsFinanceFilterPanelOpen] = useState(false);

  // Payment allocations search/filter/pagination
  const [paymentSearchInput, setPaymentSearchInput] = useState('');
  const [paymentSubmittedSearch, setPaymentSubmittedSearch] = useState('');
  const [paymentCurrentPage, setPaymentCurrentPage] = useState(1);
  const [paymentFilters, setPaymentFilters] = useState<PaymentAllocationFilterState>({ allocationTypes: [] });
  const [paymentDraftFilters, setPaymentDraftFilters] = useState<PaymentAllocationFilterState>({ allocationTypes: [] });
  const [paymentQuickFilters, setPaymentQuickFilters] = useState<string[]>([]);
  const [isPaymentFilterPanelOpen, setIsPaymentFilterPanelOpen] = useState(false);

  // View detail
  const [viewDetail, setViewDetail] = useState<BillingLinkDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);

  // Payment allocation view
  const [paymentViewDetail, setPaymentViewDetail] = useState<PaymentAllocationDetail | null>(null);
  const [isPaymentViewOpen, setIsPaymentViewOpen] = useState(false);

  // Billing link actions
  const [deleteTarget, setDeleteTarget] = useState<BillingLinkActionTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [postTarget, setPostTarget] = useState<BillingLinkActionTarget | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  // Billing link form (create/edit)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function createEmptyFormState() {
    return {
      enrollment: '',
      course: '',
      trainee: '',
      user: '',
      invoice: '',
      customer: '',
      sourceReference: '',
      billingStatus: 'not_started',
      listPriceSnapshot: '0',
      salePriceSnapshot: '0',
      couponDiscountSnapshot: '0',
      scholarshipDiscountSnapshot: '0',
      corporateCoverageSnapshot: '0',
      adjustmentsNetSnapshot: '0',
      finalChargeSnapshot: '0',
      recognizedRevenueSnapshot: '0',
      currency: 'PHP',
      notes: '',
    };
  }

  const [formState, setFormState] = useState<ReturnType<typeof createEmptyFormState>>(createEmptyFormState());

  // Payment allocation form (create/edit)
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [isPaymentSubmitting, setIsPaymentSubmitting] = useState(false);
  const [paymentFormError, setPaymentFormError] = useState<string | null>(null);

  function createEmptyPaymentFormState() {
    return {
      paymentReceived: '',
      invoice: '',
      enrollmentBillingLink: '',
      allocationDate: new Date().toISOString().slice(0, 10),
      allocatedAmount: '0',
      allocationType: 'invoice_settlement',
      notes: '',
    };
  }

  const [paymentFormState, setPaymentFormState] = useState<ReturnType<typeof createEmptyPaymentFormState>>(createEmptyPaymentFormState());

  // Payment allocation delete
  const [paymentDeleteTarget, setPaymentDeleteTarget] = useState<PaymentAllocationActionTarget | null>(null);
  const [isPaymentDeleting, setIsPaymentDeleting] = useState(false);

  const filterCount = filters.statuses.length + filters.courseIds.length;
  const financeFilterCount = financeFilters.statuses.length;
  const paymentFilterCount = paymentFilters.allocationTypes.length;

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  // === Billing Links Fetch ===
  const fetchBillingLinks = useCallback(async ({
    search, page, nextFilters, nextQuickFilters,
  }: {
    search: string; page: number; nextFilters: BillingLinkFilterState; nextQuickFilters: string[];
  }) => {
    if (activeTab !== 'enrollment-billing-links') return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getEnrollmentBillingLinks({
        search, page,
        statuses: nextFilters.statuses,
        courseIds: nextFilters.courseIds,
        quickFilters: nextQuickFilters,
      });
      setBillingLinksData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load billing links.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  // === Finance Summary Fetch ===
  const fetchFinanceSummary = useCallback(async ({
    search, page, nextFilters, nextQuickFilters,
  }: {
    search: string; page: number; nextFilters: FinanceSummaryFilterState; nextQuickFilters: string[];
  }) => {
    if (activeTab !== 'enrollment-finance-summary') return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getEnrollmentFinanceSummary({
        search, page,
        statuses: nextFilters.statuses,
        quickFilters: nextQuickFilters,
      });
      setFinanceSummaryData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load finance summary.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  // === Payment Allocations Fetch ===
  const fetchPaymentAllocations = useCallback(async ({
    search, page, nextFilters, nextQuickFilters,
  }: {
    search: string; page: number; nextFilters: PaymentAllocationFilterState; nextQuickFilters: string[];
  }) => {
    if (activeTab !== 'payment-allocations') return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getPaymentAllocations({
        search, page,
        allocationTypes: nextFilters.allocationTypes,
        quickFilters: nextQuickFilters,
      });
      setPaymentAllocationsData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load payment allocations.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  // Effects per tab
  useEffect(() => {
    if (activeTab === 'enrollment-billing-links') {
      void fetchBillingLinks({
        search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters,
      });
    }
  }, [activeTab, currentPage, fetchBillingLinks, filters, quickFilters, submittedSearch]);

  useEffect(() => {
    if (activeTab === 'enrollment-finance-summary') {
      void fetchFinanceSummary({
        search: financeSubmittedSearch, page: financeCurrentPage, nextFilters: financeFilters, nextQuickFilters: financeQuickFilters,
      });
    }
  }, [activeTab, fetchFinanceSummary, financeCurrentPage, financeFilters, financeQuickFilters, financeSubmittedSearch]);

  useEffect(() => {
    if (activeTab === 'payment-allocations') {
      void fetchPaymentAllocations({
        search: paymentSubmittedSearch, page: paymentCurrentPage, nextFilters: paymentFilters, nextQuickFilters: paymentQuickFilters,
      });
    }
  }, [activeTab, fetchPaymentAllocations, paymentCurrentPage, paymentFilters, paymentQuickFilters, paymentSubmittedSearch]);

  // === Billing Links Handlers ===
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput);
    setCurrentPage(1);
    void fetchBillingLinks({ search: searchInput, page: 1, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleRefresh = () => {
    void fetchBillingLinks({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleExport = () => {
    const data = activeTab === 'enrollment-billing-links' ? billingLinksData
      : activeTab === 'enrollment-finance-summary' ? financeSummaryData
      : paymentAllocationsData;
    const rows = data?.section.table.rows || [];
    if (!rows.length) return;
    const headers = currentTab.columns;
    const csvRows = rows.map((row: Record<string, unknown>) =>
      (row as { cells: Cell[] }).cells.map((cell) => (typeof cell === 'string' ? cell : cell.text))
    );
    const csvContent = [headers, ...csvRows].map((row) => row.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `enrollment-${activeTab}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleToggleQuickFilter = (value: string) => {
    setQuickFilters((previous) => toggleFilterValue(previous, value));
    setCurrentPage(1);
  };

  const handleView = async (id: string) => {
    setIsViewOpen(true);
    setIsViewLoading(true);
    setViewDetail(null);
    try {
      const detail = await getEnrollmentBillingLinkDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load billing link detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteEnrollmentBillingLink(deleteTarget.id);
      setDeleteTarget(null);
      void fetchBillingLinks({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete billing link.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmSync = async () => {
    if (!postTarget) return;
    setIsPosting(true);
    setError(null);
    try {
      await syncEnrollmentBillingLink(postTarget.id);
      setPostTarget(null);
      void fetchBillingLinks({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
    } catch (postError) {
      setError(postError instanceof Error ? postError.message : 'Unable to sync billing link.');
    } finally {
      setIsPosting(false);
    }
  };

  // === Billing Link Create/Edit Handlers ===
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormError(null);
    setFormState(createEmptyFormState());
    setIsFormOpen(true);
  };

  const handleOpenEdit = async (id: string) => {
    setEditingId(id);
    setFormError(null);
    setIsFormOpen(true);
    try {
      const detail = await getEnrollmentBillingLinkDetail(id);
      setFormState({
        enrollment: detail.enrollmentId || '',
        course: detail.courseId || '',
        trainee: detail.traineeId || '',
        user: '',
        invoice: detail.invoiceId || '',
        customer: detail.customerId || '',
        sourceReference: detail.sourceReference,
        billingStatus: detail.billingStatus,
        listPriceSnapshot: String(detail.listPriceSnapshot),
        salePriceSnapshot: String(detail.salePriceSnapshot),
        couponDiscountSnapshot: String(detail.couponDiscountSnapshot),
        scholarshipDiscountSnapshot: String(detail.scholarshipDiscountSnapshot),
        corporateCoverageSnapshot: String(detail.corporateCoverageSnapshot),
        adjustmentsNetSnapshot: String(detail.adjustmentsNetSnapshot),
        finalChargeSnapshot: String(detail.finalChargeSnapshot),
        recognizedRevenueSnapshot: String(detail.recognizedRevenueSnapshot),
        currency: detail.currency,
        notes: detail.notes,
      });
    } catch (detailError) {
      setFormError(detailError instanceof Error ? detailError.message : 'Unable to load billing link detail.');
    }
  };

  const normalizeFormPayload = () => ({
    enrollment: formState.enrollment,
    course: formState.course,
    trainee: formState.trainee,
    user: formState.user || null,
    invoice: formState.invoice || null,
    customer: formState.customer || null,
    sourceReference: formState.sourceReference.trim(),
    billingStatus: formState.billingStatus,
    listPriceSnapshot: Number(formState.listPriceSnapshot) || 0,
    salePriceSnapshot: Number(formState.salePriceSnapshot) || 0,
    couponDiscountSnapshot: Number(formState.couponDiscountSnapshot) || 0,
    scholarshipDiscountSnapshot: Number(formState.scholarshipDiscountSnapshot) || 0,
    corporateCoverageSnapshot: Number(formState.corporateCoverageSnapshot) || 0,
    adjustmentsNetSnapshot: Number(formState.adjustmentsNetSnapshot) || 0,
    finalChargeSnapshot: Number(formState.finalChargeSnapshot) || 0,
    recognizedRevenueSnapshot: Number(formState.recognizedRevenueSnapshot) || 0,
    currency: formState.currency.trim() || 'PHP',
    notes: formState.notes.trim() || null,
  });

  const refreshBillingLinksView = async () => {
    await fetchBillingLinks({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      const payload = normalizeFormPayload();
      if (editingId) {
        await updateEnrollmentBillingLink(editingId, payload);
      } else {
        await createEnrollmentBillingLink(payload);
      }
      setIsFormOpen(false);
      await refreshBillingLinksView();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Unable to save billing link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // === Finance Summary Handlers ===
  const handleFinanceSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setFinanceSubmittedSearch(financeSearchInput);
    setFinanceCurrentPage(1);
    void fetchFinanceSummary({ search: financeSearchInput, page: 1, nextFilters: financeFilters, nextQuickFilters: financeQuickFilters });
  };

  const handleFinanceRefresh = () => {
    void fetchFinanceSummary({ search: financeSubmittedSearch, page: financeCurrentPage, nextFilters: financeFilters, nextQuickFilters: financeQuickFilters });
  };

  const handleFinanceExport = () => {
    const rows = financeSummaryData?.section.table.rows || [];
    if (!rows.length) return;
    const headers = currentTab.columns;
    const csvRows = rows.map((row) => row.cells.map((cell) => (typeof cell === 'string' ? cell : cell.text)));
    const csvContent = [headers, ...csvRows].map((row) => row.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'enrollment-finance-summary.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleToggleFinanceQuickFilter = (value: string) => {
    setFinanceQuickFilters((previous) => toggleFilterValue(previous, value));
    setFinanceCurrentPage(1);
  };

  const handleFinanceView = async (id: string) => {
    setIsViewOpen(true);
    setIsViewLoading(true);
    setViewDetail(null);
    try {
      const detail = await getEnrollmentFinanceSummaryDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load finance summary detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  // === Payment Allocation Handlers ===
  const handlePaymentSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPaymentSubmittedSearch(paymentSearchInput);
    setPaymentCurrentPage(1);
    void fetchPaymentAllocations({ search: paymentSearchInput, page: 1, nextFilters: paymentFilters, nextQuickFilters: paymentQuickFilters });
  };

  const handlePaymentRefresh = () => {
    void fetchPaymentAllocations({ search: paymentSubmittedSearch, page: paymentCurrentPage, nextFilters: paymentFilters, nextQuickFilters: paymentQuickFilters });
  };

  const handlePaymentExport = () => {
    const rows = paymentAllocationsData?.section.table.rows || [];
    if (!rows.length) return;
    const headers = currentTab.columns;
    const csvRows = rows.map((row) => row.cells.map((cell) => (typeof cell === 'string' ? cell : cell.text)));
    const csvContent = [headers, ...csvRows].map((row) => row.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'payment-allocations.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleTogglePaymentQuickFilter = (value: string) => {
    setPaymentQuickFilters((previous) => toggleFilterValue(previous, value));
    setPaymentCurrentPage(1);
  };

  const handlePaymentView = async (id: string) => {
    setIsPaymentViewOpen(true);
    setIsViewLoading(true);
    setPaymentViewDetail(null);
    try {
      const detail = await getPaymentAllocationDetail(id);
      setPaymentViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load payment allocation detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleOpenCreatePayment = () => {
    setEditingPaymentId(null);
    setPaymentFormError(null);
    setPaymentFormState(createEmptyPaymentFormState());
    setIsPaymentFormOpen(true);
  };

  const handleOpenEditPayment = async (id: string) => {
    setEditingPaymentId(id);
    setPaymentFormError(null);
    setIsPaymentFormOpen(true);
    try {
      const detail = await getPaymentAllocationDetail(id);
      setPaymentFormState({
        paymentReceived: detail.paymentReceivedId || '',
        invoice: detail.invoiceId || '',
        enrollmentBillingLink: detail.billingLinkId || '',
        allocationDate: detail.allocationDate ? detail.allocationDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
        allocatedAmount: String(detail.allocatedAmount),
        allocationType: detail.allocationType,
        notes: detail.notes,
      });
    } catch (detailError) {
      setPaymentFormError(detailError instanceof Error ? detailError.message : 'Unable to load payment allocation detail.');
    }
  };

  const normalizePaymentFormPayload = (): PaymentAllocationMutationInput => ({
    paymentReceived: paymentFormState.paymentReceived,
    invoice: paymentFormState.invoice || null,
    enrollmentBillingLink: paymentFormState.enrollmentBillingLink || null,
    allocationDate: paymentFormState.allocationDate || new Date().toISOString(),
    allocatedAmount: Number(paymentFormState.allocatedAmount) || 0,
    allocationType: paymentFormState.allocationType,
    notes: paymentFormState.notes.trim() || null,
  });

  const refreshPaymentAllocationsView = async () => {
    await fetchPaymentAllocations({ search: paymentSubmittedSearch, page: paymentCurrentPage, nextFilters: paymentFilters, nextQuickFilters: paymentQuickFilters });
  };

  const handlePaymentFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsPaymentSubmitting(true);
    setPaymentFormError(null);
    try {
      const payload = normalizePaymentFormPayload();
      if (editingPaymentId) {
        await updatePaymentAllocation(editingPaymentId, payload);
      } else {
        await createPaymentAllocation(payload);
      }
      setIsPaymentFormOpen(false);
      await refreshPaymentAllocationsView();
    } catch (submitError) {
      setPaymentFormError(submitError instanceof Error ? submitError.message : 'Unable to save payment allocation.');
    } finally {
      setIsPaymentSubmitting(false);
    }
  };

  const handleConfirmPaymentDelete = async () => {
    if (!paymentDeleteTarget) return;
    setIsPaymentDeleting(true);
    setError(null);
    try {
      await deletePaymentAllocation(paymentDeleteTarget.id);
      setPaymentDeleteTarget(null);
      void fetchPaymentAllocations({ search: paymentSubmittedSearch, page: paymentCurrentPage, nextFilters: paymentFilters, nextQuickFilters: paymentQuickFilters });
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete payment allocation.');
    } finally {
      setIsPaymentDeleting(false);
    }
  };

  // === Render Billing Link Actions ===
  const renderBillingLinkActions = (row: { id: string; sourceReference: string; billingStatus: string }) => {
    const isMutable = MUTABLE_STATUSES.has(row.billingStatus);
    const canSync = row.billingStatus === 'not_started' || row.billingStatus === 'drafted';

    return (
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail">
            <Eye className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => handleOpenEdit(row.id)} disabled={!isMutable} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40" title="Edit billing link">
            <Edit className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setPostTarget({ id: row.id, sourceReference: row.sourceReference })} disabled={!canSync} className="inline-flex items-center gap-1 rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40" title="Sync billing link">
            <Send className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setDeleteTarget({ id: row.id, sourceReference: row.sourceReference })} disabled={!isMutable} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40" title="Delete billing link">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    );
  };

  const renderFinanceActions = (row: { id: string }) => (
    <td className="px-4 py-3 text-right">
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => handleFinanceView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail">
          <Eye className="h-4 w-4" />
        </button>
      </div>
    </td>
  );

  const renderPaymentActions = (row: { id: string; paymentLabel: string }) => (
    <td className="px-4 py-3 text-right">
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => handlePaymentView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail">
          <Eye className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => handleOpenEditPayment(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="Edit allocation">
          <Edit className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => setPaymentDeleteTarget({ id: row.id, paymentLabel: row.paymentLabel })} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700" title="Delete allocation">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </td>
  );

  return (
    <div className="space-y-6 p-[10px]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">LMS Finance / LMS Billing & Collections</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Enrollment Billing Operations</h1>
          <p className="mt-1 text-base text-gray-600">Review LMS enrollment billing links, finance summaries, and payment allocations that connect course enrollments to accounting invoices and settlement.</p>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {STATIC_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} type="button" onClick={() => handleTabChange(tab.id)} className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* === ENROLLMENT BILLING LINKS TAB === */}
      {activeTab === 'enrollment-billing-links' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-gray-900">{currentTab.label}</h2>
              <p className="text-sm text-gray-600">{currentTab.description}</p>
              <p className="text-sm text-gray-500">{billingLinksData?.totals.filteredRows ?? 0} matching rows</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
                <Plus className="h-4 w-4" />
                Create Billing Link
              </button>
              <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
                <RefreshCw className="h-4 w-4" />
                Refresh Links
              </button>
              <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!billingLinksData?.section.table.rows.length}>
                <Download className="h-4 w-4" />
                Download View
              </button>
            </div>
          </div>

          {billingLinksData?.section.metrics?.length ? <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{billingLinksData.section.metrics.map((metric) => <div key={metric.id}><MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} /></div>)}</div> : null}

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                <form onSubmit={handleSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder={currentTab.searchPlaceholder} value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                  </div>
                  <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700">
                    <Search className="h-4 w-4" />
                    Search
                  </button>
                </form>
                <button type="button" onClick={() => { if (!isFilterPanelOpen) setDraftFilters({ ...filters }); setIsFilterPanelOpen((previous) => !previous); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isFilterPanelOpen || filterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}>
                  <Filter className="h-4 w-4" />
                  Filters
                  {filterCount > 0 ? <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{filterCount}</span> : null}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(billingLinksData?.section.filters.quickFilters || []).map((filter) => (
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
                      <p className="mt-1 text-sm text-gray-600">Select as many filter values as needed, then apply them in one step.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" onClick={() => { setDraftFilters({ statuses: [], courseIds: [] }); setFilters({ statuses: [], courseIds: [] }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Clear all</button>
                      <button type="button" onClick={() => setIsFilterPanelOpen(false)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                      <button type="button" onClick={() => { setFilters({ ...draftFilters }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</h5>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(billingLinksData?.section.filters.statuses || []).map((option) => {
                          const selected = draftFilters.statuses.includes(option.value);
                          return <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{option.label}</button>;
                        })}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Course</h5>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(billingLinksData?.section.filters.courses || []).map((option) => {
                          const selected = draftFilters.courseIds.includes(option.value);
                          return <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, courseIds: toggleFilterValue(previous.courseIds, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{option.label}</button>;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-gray-900">{billingLinksData?.section.table.title || currentTab.tableTitle}</h3>
                  <p className="text-sm text-gray-600">{billingLinksData?.section.table.description || currentTab.tableDescription}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <span>{billingLinksData?.totals.filteredRows ?? 0} matching rows</span>
                </div>
              </div>

              {error ? <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div> : null}

              {isLoading ? <LoadingSkeleton /> : (
                <>
                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {currentTab.columns.map((column) => (
                              <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Final Charge' ? 'text-right' : 'text-left'}`}>{column}</th>
                            ))}
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {(billingLinksData?.section.table.rows || []).length > 0 ? (billingLinksData?.section.table.rows || []).map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50">
                              {row.cells.map((cell, index) => renderCell(cell, index))}
                              {renderBillingLinkActions(row)}
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={currentTab.columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">No billing link rows found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {billingLinksData?.pagination && billingLinksData.pagination.totalPages > 1 ? (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Page {billingLinksData.pagination.page} of {billingLinksData.pagination.totalPages}</p>
                      <div className="flex gap-2">
                        <button type="button" disabled={!billingLinksData.pagination.hasPrevPage} onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button>
                        <button type="button" disabled={!billingLinksData.pagination.hasNextPage} onClick={() => setCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === ENROLLMENT FINANCE SUMMARY TAB === */}
      {activeTab === 'enrollment-finance-summary' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-gray-900">{currentTab.label}</h2>
              <p className="text-sm text-gray-600">{currentTab.description}</p>
              <p className="text-sm text-gray-500">{financeSummaryData?.totals.filteredRows ?? 0} matching rows</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={handleFinanceRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
                <RefreshCw className="h-4 w-4" />
                Refresh Summary
              </button>
              <button type="button" onClick={handleFinanceExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!financeSummaryData?.section.table.rows.length}>
                <Download className="h-4 w-4" />
                Download View
              </button>
            </div>
          </div>

          {financeSummaryData?.section.metrics?.length ? <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{financeSummaryData.section.metrics.map((metric) => <div key={metric.id}><MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} /></div>)}</div> : null}

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                <form onSubmit={handleFinanceSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder={currentTab.searchPlaceholder} value={financeSearchInput} onChange={(event) => setFinanceSearchInput(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                  </div>
                  <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700">
                    <Search className="h-4 w-4" />
                    Search
                  </button>
                </form>
                <button type="button" onClick={() => { if (!isFinanceFilterPanelOpen) setFinanceDraftFilters({ ...financeFilters }); setIsFinanceFilterPanelOpen((previous) => !previous); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isFinanceFilterPanelOpen || financeFilterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}>
                  <Filter className="h-4 w-4" />
                  Filters
                  {financeFilterCount > 0 ? <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{financeFilterCount}</span> : null}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(financeSummaryData?.section.filters.quickFilters || []).map((filter) => (
                  <button key={filter.value} type="button" onClick={() => handleToggleFinanceQuickFilter(filter.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${financeQuickFilters.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 p-[10px] sm:p-5">
              {isFinanceFilterPanelOpen ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Filters</h4>
                      <p className="mt-1 text-sm text-gray-600">Select status values to narrow the finance summary view.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" onClick={() => { setFinanceDraftFilters({ statuses: [] }); setFinanceFilters({ statuses: [] }); setFinanceCurrentPage(1); setIsFinanceFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Clear all</button>
                      <button type="button" onClick={() => setIsFinanceFilterPanelOpen(false)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                      <button type="button" onClick={() => { setFinanceFilters({ ...financeDraftFilters }); setFinanceCurrentPage(1); setIsFinanceFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-6 md:grid-cols-1">
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</h5>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(financeSummaryData?.section.filters.statuses || []).map((option) => {
                          const selected = financeDraftFilters.statuses.includes(option.value);
                          return <button key={option.value} type="button" onClick={() => setFinanceDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{option.label}</button>;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-gray-900">{financeSummaryData?.section.table.title || currentTab.tableTitle}</h3>
                  <p className="text-sm text-gray-600">{financeSummaryData?.section.table.description || currentTab.tableDescription}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <span>{financeSummaryData?.totals.filteredRows ?? 0} matching rows</span>
                </div>
              </div>

              {error ? <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div> : null}

              {isLoading ? <LoadingSkeleton /> : (
                <>
                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {currentTab.columns.map((column) => (
                              <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column !== 'Enrollment' ? 'text-right' : 'text-left'}`}>{column}</th>
                            ))}
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {(financeSummaryData?.section.table.rows || []).length > 0 ? (financeSummaryData?.section.table.rows || []).map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50">
                              {row.cells.map((cell, index) => renderCell(cell, index))}
                              {renderFinanceActions(row)}
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={currentTab.columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">No finance summary rows found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {financeSummaryData?.pagination && financeSummaryData.pagination.totalPages > 1 ? (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Page {financeSummaryData.pagination.page} of {financeSummaryData.pagination.totalPages}</p>
                      <div className="flex gap-2">
                        <button type="button" disabled={!financeSummaryData.pagination.hasPrevPage} onClick={() => setFinanceCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button>
                        <button type="button" disabled={!financeSummaryData.pagination.hasNextPage} onClick={() => setFinanceCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === PAYMENT ALLOCATIONS TAB === */}
      {activeTab === 'payment-allocations' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-gray-900">{currentTab.label}</h2>
              <p className="text-sm text-gray-600">{currentTab.description}</p>
              <p className="text-sm text-gray-500">{paymentAllocationsData?.totals.filteredRows ?? 0} matching rows</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={handleOpenCreatePayment} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
                <Plus className="h-4 w-4" />
                Create Allocation
              </button>
              <button type="button" onClick={handlePaymentRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
                <RefreshCw className="h-4 w-4" />
                Refresh Allocations
              </button>
              <button type="button" onClick={handlePaymentExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!paymentAllocationsData?.section.table.rows.length}>
                <Download className="h-4 w-4" />
                Download View
              </button>
            </div>
          </div>

          {paymentAllocationsData?.section.metrics?.length ? <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{paymentAllocationsData.section.metrics.map((metric) => <div key={metric.id}><MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} /></div>)}</div> : null}

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                <form onSubmit={handlePaymentSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder={currentTab.searchPlaceholder} value={paymentSearchInput} onChange={(event) => setPaymentSearchInput(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                  </div>
                  <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700">
                    <Search className="h-4 w-4" />
                    Search
                  </button>
                </form>
                <button type="button" onClick={() => { if (!isPaymentFilterPanelOpen) setPaymentDraftFilters({ ...paymentFilters }); setIsPaymentFilterPanelOpen((previous) => !previous); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isPaymentFilterPanelOpen || paymentFilterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}>
                  <Filter className="h-4 w-4" />
                  Filters
                  {paymentFilterCount > 0 ? <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{paymentFilterCount}</span> : null}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(paymentAllocationsData?.section.filters.quickFilters || []).map((filter) => (
                  <button key={filter.value} type="button" onClick={() => handleTogglePaymentQuickFilter(filter.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${paymentQuickFilters.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 p-[10px] sm:p-5">
              {isPaymentFilterPanelOpen ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Filters</h4>
                      <p className="mt-1 text-sm text-gray-600">Select allocation types to narrow the register view.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" onClick={() => { setPaymentDraftFilters({ allocationTypes: [] }); setPaymentFilters({ allocationTypes: [] }); setPaymentCurrentPage(1); setIsPaymentFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Clear all</button>
                      <button type="button" onClick={() => setIsPaymentFilterPanelOpen(false)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                      <button type="button" onClick={() => { setPaymentFilters({ ...paymentDraftFilters }); setPaymentCurrentPage(1); setIsPaymentFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-6 md:grid-cols-1">
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Allocation Type</h5>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(paymentAllocationsData?.section.filters.allocationTypes || []).map((option) => {
                          const selected = paymentDraftFilters.allocationTypes.includes(option.value);
                          return <button key={option.value} type="button" onClick={() => setPaymentDraftFilters((previous) => ({ ...previous, allocationTypes: toggleFilterValue(previous.allocationTypes, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{option.label}</button>;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-gray-900">{paymentAllocationsData?.section.table.title || currentTab.tableTitle}</h3>
                  <p className="text-sm text-gray-600">{paymentAllocationsData?.section.table.description || currentTab.tableDescription}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <span>{paymentAllocationsData?.totals.filteredRows ?? 0} matching rows</span>
                </div>
              </div>

              {error ? <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div> : null}

              {isLoading ? <LoadingSkeleton /> : (
                <>
                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {currentTab.columns.map((column) => (
                              <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Allocated Amount' ? 'text-right' : 'text-left'}`}>{column}</th>
                            ))}
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {(paymentAllocationsData?.section.table.rows || []).length > 0 ? (paymentAllocationsData?.section.table.rows || []).map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50">
                              {row.cells.map((cell, index) => renderCell(cell, index))}
                              {renderPaymentActions(row)}
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={currentTab.columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">No payment allocation rows found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {paymentAllocationsData?.pagination && paymentAllocationsData.pagination.totalPages > 1 ? (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Page {paymentAllocationsData.pagination.page} of {paymentAllocationsData.pagination.totalPages}</p>
                      <div className="flex gap-2">
                        <button type="button" disabled={!paymentAllocationsData.pagination.hasPrevPage} onClick={() => setPaymentCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button>
                        <button type="button" disabled={!paymentAllocationsData.pagination.hasNextPage} onClick={() => setPaymentCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === Billing Link Create/Edit Form SlideOver === */}
      <SlideOver isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingId ? 'Edit Billing Link' : 'Create Billing Link'} description="Set billing link fields including enrollment, course, trainee, billing status, snapshots, and notes.">
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {formError ? <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{formError}</div> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Source Reference" required>
              <Input value={formState.sourceReference} onChange={(value) => setFormState((previous) => ({ ...previous, sourceReference: value }))} placeholder="e.g. BL-2026-001" required />
            </FormField>
            <FormField label="Billing Status" required>
              <Select value={formState.billingStatus} onChange={(value) => setFormState((previous) => ({ ...previous, billingStatus: value }))} options={(billingLinksData?.referenceData.statuses || []).map((s) => ({ label: s.label, value: s.value }))} />
            </FormField>
            <FormField label="Enrollment" required>
              <Select value={formState.enrollment} onChange={(value) => {
                setFormState((previous) => {
                  const enrollment = (billingLinksData?.referenceData.enrollments || []).find((e) => e.id === value)
                  return {
                    ...previous,
                    enrollment: value,
                    course: enrollment?.courseId || '',
                    trainee: enrollment?.traineeId || '',
                  }
                })
              }} options={[{ label: 'Select an enrollment', value: '' }, ...(billingLinksData?.referenceData.enrollments || []).map((e) => ({ label: e.label, value: e.id }))]} />
            </FormField>
            <FormField label="Course" required>
              <Select value={formState.course} onChange={() => {}} disabled options={[{ label: 'Select a course', value: '' }, ...(billingLinksData?.referenceData.courses || []).map((c) => ({ label: c.title || `Course ${c.id}`, value: String(c.id) }))]} />
            </FormField>
            <FormField label="Trainee" required>
              <Select value={formState.trainee} onChange={() => {}} disabled options={[{ label: 'Select a trainee', value: '' }, ...(billingLinksData?.referenceData.trainees || []).map((t) => ({ label: t.label, value: t.id }))]} />
            </FormField>
            <FormField label="Invoice">
              <Select value={formState.invoice} onChange={(value) => setFormState((previous) => ({ ...previous, invoice: value }))} options={[{ label: 'No invoice', value: '' }, ...(billingLinksData?.referenceData.invoices || []).map((inv) => ({ label: inv.label, value: inv.id }))]} />
            </FormField>
            <FormField label="Customer">
              <Select value={formState.customer} onChange={(value) => setFormState((previous) => ({ ...previous, customer: value }))} options={[{ label: 'No customer', value: '' }, ...(billingLinksData?.referenceData.customers || []).map((c) => ({ label: c.label, value: c.id }))]} />
            </FormField>
            <FormField label="Currency" required>
              <Input value={formState.currency} onChange={(value) => setFormState((previous) => ({ ...previous, currency: value }))} required />
            </FormField>
            <FormField label="List Price Snapshot">
              <Input type="number" value={formState.listPriceSnapshot} onChange={(value) => setFormState((previous) => ({ ...previous, listPriceSnapshot: value }))} />
            </FormField>
            <FormField label="Sale Price Snapshot">
              <Input type="number" value={formState.salePriceSnapshot} onChange={(value) => setFormState((previous) => ({ ...previous, salePriceSnapshot: value }))} />
            </FormField>
            <FormField label="Coupon Discount Snapshot">
              <Input type="number" value={formState.couponDiscountSnapshot} onChange={(value) => setFormState((previous) => ({ ...previous, couponDiscountSnapshot: value }))} />
            </FormField>
            <FormField label="Scholarship Discount Snapshot">
              <Input type="number" value={formState.scholarshipDiscountSnapshot} onChange={(value) => setFormState((previous) => ({ ...previous, scholarshipDiscountSnapshot: value }))} />
            </FormField>
            <FormField label="Corporate Coverage Snapshot">
              <Input type="number" value={formState.corporateCoverageSnapshot} onChange={(value) => setFormState((previous) => ({ ...previous, corporateCoverageSnapshot: value }))} />
            </FormField>
            <FormField label="Adjustments Net Snapshot">
              <Input type="number" value={formState.adjustmentsNetSnapshot} onChange={(value) => setFormState((previous) => ({ ...previous, adjustmentsNetSnapshot: value }))} />
            </FormField>
            <FormField label="Final Charge Snapshot">
              <Input type="number" value={formState.finalChargeSnapshot} onChange={(value) => setFormState((previous) => ({ ...previous, finalChargeSnapshot: value }))} />
            </FormField>
            <FormField label="Recognized Revenue Snapshot">
              <Input type="number" value={formState.recognizedRevenueSnapshot} onChange={(value) => setFormState((previous) => ({ ...previous, recognizedRevenueSnapshot: value }))} />
            </FormField>
          </div>
          <FormField label="Notes">
            <TextArea value={formState.notes} onChange={(value) => setFormState((previous) => ({ ...previous, notes: value }))} rows={3} />
          </FormField>
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} disabled={isSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>{isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Billing Link'}</button>
          </div>
        </form>
      </SlideOver>

      {/* === Billing Link Detail SlideOver === */}
      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Billing Link Detail" description="Review enrollment billing link header values, finance snapshots, and dependency status.">
        <div className="space-y-6">
          {isViewLoading ? <LoadingSkeleton /> : viewDetail ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['Source Reference', viewDetail.sourceReference],
                  ['Course', viewDetail.courseLabel || '-'],
                  ['Trainee', viewDetail.traineeLabel || '-'],
                  ['User', viewDetail.userLabel || '-'],
                  ['Customer', viewDetail.customerLabel || '-'],
                  ['Invoice', viewDetail.invoiceLabel || '-'],
                  ['Billing Status', viewDetail.billingStatusLabel],
                  ['Currency', viewDetail.currency],
                  ['Linked At', viewDetail.linkedAtLabel],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ['List Price', formatCurrency(viewDetail.listPriceSnapshot)],
                  ['Sale Price', formatCurrency(viewDetail.salePriceSnapshot)],
                  ['Coupon Discount', formatCurrency(viewDetail.couponDiscountSnapshot)],
                  ['Scholarship Discount', formatCurrency(viewDetail.scholarshipDiscountSnapshot)],
                  ['Corporate Coverage', formatCurrency(viewDetail.corporateCoverageSnapshot)],
                  ['Adjustments (Net)', formatCurrency(viewDetail.adjustmentsNetSnapshot)],
                  ['Final Charge', formatCurrency(viewDetail.finalChargeSnapshot)],
                  ['Recognized Revenue', formatCurrency(viewDetail.recognizedRevenueSnapshot)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-2 text-sm font-semibold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              {viewDetail.notes ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                  <p className="font-medium text-gray-900">Notes</p>
                  <p className="mt-2">{viewDetail.notes}</p>
                </div>
              ) : null}

              <div className="flex justify-end pt-4">
                <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Close</button>
              </div>
            </>
          ) : <p className="text-sm text-gray-500">No details available.</p>}
        </div>
      </SlideOver>

      {/* === Payment Allocation Detail SlideOver === */}
      <SlideOver isOpen={isPaymentViewOpen} onClose={() => setIsPaymentViewOpen(false)} title="Payment Allocation Detail" description="Review payment allocation header values and allocation details." width="max-w-2xl">
        <div className="space-y-6">
          {isViewLoading ? <LoadingSkeleton /> : paymentViewDetail ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['Payment', paymentViewDetail.paymentLabel],
                  ['Invoice', paymentViewDetail.invoiceLabel],
                  ['Billing Link', paymentViewDetail.billingLinkLabel],
                  ['Allocation Date', paymentViewDetail.allocationDateLabel],
                  ['Allocated Amount', paymentViewDetail.allocatedAmountLabel],
                  ['Allocation Type', paymentViewDetail.allocationTypeLabel],
                  ['Created By', paymentViewDetail.createdByLabel],
                  ['Updated By', paymentViewDetail.updatedByLabel],
                  ['Created At', paymentViewDetail.createdAtLabel],
                  ['Updated At', paymentViewDetail.updatedAtLabel],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              {paymentViewDetail.notes ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                  <p className="font-medium text-gray-900">Notes</p>
                  <p className="mt-2">{paymentViewDetail.notes}</p>
                </div>
              ) : null}

              <div className="flex justify-end pt-4">
                <button type="button" onClick={() => setIsPaymentViewOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Close</button>
              </div>
            </>
          ) : <p className="text-sm text-gray-500">No details available.</p>}
        </div>
      </SlideOver>

      {/* === Payment Allocation Create/Edit Form SlideOver === */}
      <SlideOver isOpen={isPaymentFormOpen} onClose={() => setIsPaymentFormOpen(false)} title={editingPaymentId ? 'Edit Payment Allocation' : 'Create Payment Allocation'} description="Set payment allocation fields including payment, invoice, billing link, amount, and allocation type.">
        <form onSubmit={handlePaymentFormSubmit} className="space-y-6">
          {paymentFormError ? <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{paymentFormError}</div> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Payment Received" required>
              <Select value={paymentFormState.paymentReceived} onChange={(value) => setPaymentFormState((previous) => ({ ...previous, paymentReceived: value }))} options={[{ label: 'Select payment', value: '' }, ...(paymentAllocationsData?.referenceData.payments || []).map((p) => ({ label: p.label, value: p.id }))]} />
            </FormField>
            <FormField label="Allocation Type" required>
              <Select value={paymentFormState.allocationType} onChange={(value) => setPaymentFormState((previous) => ({ ...previous, allocationType: value }))} options={[{ label: 'Select type', value: '' }, ...(paymentAllocationsData?.referenceData.allocationTypes || []).map((t) => ({ label: t.label, value: t.value }))]} />
            </FormField>
            <FormField label="Allocated Amount" required>
              <Input type="number" value={paymentFormState.allocatedAmount} onChange={(value) => setPaymentFormState((previous) => ({ ...previous, allocatedAmount: value }))} required />
            </FormField>
            <FormField label="Allocation Date">
              <Input type="date" value={paymentFormState.allocationDate} onChange={(value) => setPaymentFormState((previous) => ({ ...previous, allocationDate: value }))} />
            </FormField>
            <FormField label="Invoice">
              <Select value={paymentFormState.invoice} onChange={(value) => setPaymentFormState((previous) => ({ ...previous, invoice: value }))} options={[{ label: 'No invoice', value: '' }, ...(paymentAllocationsData?.referenceData.invoices || []).map((inv) => ({ label: inv.label, value: inv.id }))]} />
            </FormField>
            <FormField label="Billing Link">
              <Select value={paymentFormState.enrollmentBillingLink} onChange={(value) => setPaymentFormState((previous) => ({ ...previous, enrollmentBillingLink: value }))} options={[{ label: 'No billing link', value: '' }, ...(paymentAllocationsData?.referenceData.billingLinks || []).map((bl) => ({ label: bl.label, value: bl.id }))]} />
            </FormField>
          </div>
          <FormField label="Notes">
            <TextArea value={paymentFormState.notes} onChange={(value) => setPaymentFormState((previous) => ({ ...previous, notes: value }))} rows={3} />
          </FormField>
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setIsPaymentFormOpen(false)} disabled={isPaymentSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isPaymentSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>{isPaymentSubmitting ? 'Saving...' : editingPaymentId ? 'Save Changes' : 'Create Allocation'}</button>
          </div>
        </form>
      </SlideOver>

      {/* === Sync (Post) Confirmation === */}
      <SlideOver isOpen={Boolean(postTarget)} onClose={() => setPostTarget(null)} title="Sync Billing Link" description="Syncing re-ensures the billing link, invoice, and finance summary for this enrollment." width="max-w-lg">
        <div className="space-y-6">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
            <p className="font-medium">Sync billing link {postTarget?.sourceReference}?</p>
            <p className="mt-1">This will re-sync the enrollment artifacts including the billing link, invoice, and revenue recognition schedule.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setPostTarget(null)} disabled={isPosting} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleConfirmSync} disabled={isPosting} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">{isPosting ? 'Syncing...' : 'Sync Billing Link'}</button>
          </div>
        </div>
      </SlideOver>

      {/* === Delete Billing Link Confirmation === */}
      <SlideOver isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete Billing Link" description="Delete this mutable billing link after dependency validation completes." width="max-w-lg">
        <div className="space-y-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Delete billing link {deleteTarget?.sourceReference}?</p>
            <p className="mt-1">Draft, not_started, and invoiced billing links can be deleted only when no blocking dependency exists.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">{isDeleting ? 'Deleting...' : 'Delete Billing Link'}</button>
          </div>
        </div>
      </SlideOver>

      {/* === Delete Payment Allocation Confirmation === */}
      <SlideOver isOpen={Boolean(paymentDeleteTarget)} onClose={() => setPaymentDeleteTarget(null)} title="Delete Payment Allocation" description="Delete this payment allocation record." width="max-w-lg">
        <div className="space-y-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Delete payment allocation {paymentDeleteTarget?.paymentLabel}?</p>
            <p className="mt-1">This action permanently removes the allocation record. Linked invoices and billing links will not be affected.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setPaymentDeleteTarget(null)} disabled={isPaymentDeleting} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleConfirmPaymentDelete} disabled={isPaymentDeleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">{isPaymentDeleting ? 'Deleting...' : 'Delete Allocation'}</button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
