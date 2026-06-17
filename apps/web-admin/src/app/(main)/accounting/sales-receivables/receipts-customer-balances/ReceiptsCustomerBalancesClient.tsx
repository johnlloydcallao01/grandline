'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Ban,
  Download,
  Edit,
  Eye,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import {
  deleteCustomerBalanceCustomer,
  createPaymentReceived,
  createOfficialReceipt,
  getCustomerBalanceDetail,
  getCustomerBalances,
  deletePaymentReceived,
  deleteOfficialReceipt,
  type CustomerBalanceDetail,
  type CustomerBalanceMutationInput,
  type CustomerBalanceRegisterResponse,
  getPaymentReceivedDetail,
  getPaymentsReceived,
  getOfficialReceiptDetail,
  getOfficialReceipts,
  issueOfficialReceipt,
  postPaymentReceived,
  updatePaymentReceived,
  updateOfficialReceipt,
  voidOfficialReceipt,
  type OfficialReceiptDetail,
  type OfficialReceiptMutationInput,
  type OfficialReceiptRegisterResponse,
  type PaymentReceivedDetail,
  type PaymentReceivedMutationInput,
  type PaymentReceivedRegisterResponse,
  type PaymentsCell,
  type PaymentsMetric,
  updateCustomerBalanceCustomer,
} from './actions';

type TabId = 'payments-received' | 'official-receipts' | 'customer-balances';
type PaymentFilterState = { statuses: string[]; paymentMethods: string[]; customerIds: string[] };
type OfficialReceiptFilterState = { statuses: string[]; customerIds: string[]; proofStates: string[] };
type CustomerBalanceFilterState = { statuses: string[]; paymentTermIds: string[]; balanceStates: string[] };
type ApplicationFormState = { id: string; invoice: string; amountApplied: string };
type PaymentFormState = {
  receiptNumber: string;
  customer: string;
  paymentDate: string;
  postingDate: string;
  paymentMethod: string;
  depositAccount: string;
  undepositedFundsAccount: string;
  amountReceived: string;
  currency: string;
  exchangeRate: string;
  referenceNumber: string;
  notes: string;
  applications: ApplicationFormState[];
};
type PaymentActionTarget = {
  id: string;
  receiptNumber: string;
};
type OfficialReceiptFormState = {
  receiptNumber: string;
  paymentReceived: string;
  proofDocument: string;
  notes: string;
};
type OfficialReceiptActionTarget = {
  id: string;
  receiptNumber: string;
};
type CustomerBalanceFormState = {
  customerCode: string;
  displayName: string;
  legalName: string;
  customerType: string;
  email: string;
  phone: string;
  billingAddress: string;
  shippingAddress: string;
  taxId: string;
  creditLimit: string;
  status: string;
  notes: string;
  currencyReference: string;
  paymentTermReference: string;
};
type CustomerBalanceActionTarget = {
  id: string;
  customerLabel: string;
};

const TABS: Array<{
  id: TabId;
  label: string;
  description: string;
  searchPlaceholder: string;
  columns: string[];
  tableTitle: string;
  tableDescription: string;
}> = [
  {
    id: 'payments-received',
    label: 'Payments Received',
    description: 'Manage incoming customer payments with payment method, deposit routing, applications, and posting status.',
    searchPlaceholder: 'Search receipt no., customer, method, reference no., or deposit account',
    columns: ['Receipt No.', 'Payment Date', 'Customer', 'Method', 'Amount', 'Status'],
    tableTitle: 'Payments Received Register',
    tableDescription: 'Customer payment records with application coverage, deposit routing, and posting status.',
  },
  {
    id: 'official-receipts',
    label: 'Official Receipts',
    description: 'Manage official receipt issuance tied to payments received, customers, receipt dates, and proof documents.',
    searchPlaceholder: 'Search OR no., customer, payment ref, issued by, or receipt date',
    columns: ['OR No.', 'Receipt Date', 'Customer', 'Payment Ref', 'Amount', 'Status'],
    tableTitle: 'Official Receipt Register',
    tableDescription: 'Receipt register linked to payments received, customers, issue dates, and proof documents.',
  },
  {
    id: 'customer-balances',
    label: 'Customer Balances',
    description: 'Monitor customer master records, credit terms, credit limits, and open receivable balances derived from invoices.',
    searchPlaceholder: 'Search customer, customer code, payment terms, credit limit, or balance',
    columns: ['Customer', 'Customer Code', 'Payment Terms', 'Credit Limit', 'Balance Due', 'Status'],
    tableTitle: 'Customer Balance View',
    tableDescription: 'Customer-level open balance view aligned with customer master records, payment terms, and credit limits.',
  },
];

const MUTABLE_STATUSES = new Set(['draft']);

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  if (variant === 'ghost') return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
}

function getMetricTone(trend: PaymentsMetric['trend']) {
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

function toDateInputValue(value: string | null | undefined) {
  if (!value) return '';
  return value.slice(0, 10);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function createEmptyApplication(): ApplicationFormState {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    invoice: '',
    amountApplied: '0',
  };
}

function createEmptyForm(): PaymentFormState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    receiptNumber: '',
    customer: '',
    paymentDate: today,
    postingDate: today,
    paymentMethod: 'bank_transfer',
    depositAccount: '',
    undepositedFundsAccount: '',
    amountReceived: '0',
    currency: 'PHP',
    exchangeRate: '1',
    referenceNumber: '',
    notes: '',
    applications: [createEmptyApplication()],
  };
}

function createEmptyOfficialReceiptForm(): OfficialReceiptFormState {
  return {
    receiptNumber: '',
    paymentReceived: '',
    proofDocument: '',
    notes: '',
  };
}

function createEmptyCustomerBalanceForm(): CustomerBalanceFormState {
  return {
    customerCode: '',
    displayName: '',
    legalName: '',
    customerType: 'individual',
    email: '',
    phone: '',
    billingAddress: '',
    shippingAddress: '',
    taxId: '',
    creditLimit: '0',
    status: 'active',
    notes: '',
    currencyReference: '',
    paymentTermReference: '',
  };
}

function mapCustomerBalanceDetailToFormState(detail: CustomerBalanceDetail): CustomerBalanceFormState {
  return {
    customerCode: detail.customerCode || '',
    displayName: detail.displayName || '',
    legalName: detail.legalName || '',
    customerType: detail.customerType || 'individual',
    email: detail.email || '',
    phone: detail.phone || '',
    billingAddress: detail.billingAddress || '',
    shippingAddress: detail.shippingAddress || '',
    taxId: detail.taxId || '',
    creditLimit: String(detail.creditLimit || 0),
    status: detail.status || 'active',
    notes: detail.notes || '',
    currencyReference: detail.currencyReferenceId || '',
    paymentTermReference: detail.paymentTermReferenceId || '',
  };
}

function SlideOver({
  isOpen,
  onClose,
  title,
  description,
  children,
  width = 'max-w-5xl',
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
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ease-in-out ${animate ? 'bg-black/50' : 'bg-transparent'}`}
      onClick={onClose}
    >
      <div
        className={`flex h-full w-full ${width} flex-col bg-white shadow-xl transition-all duration-300 ease-in-out ${animate ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(event) => event.stopPropagation()}
      >
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

function renderCell(cell: PaymentsCell, index: number) {
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

function CustomerBalancesPanel({ tab }: { tab: (typeof TABS)[number] }) {
  const [data, setData] = useState<CustomerBalanceRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<CustomerBalanceFilterState>({ statuses: [], paymentTermIds: [], balanceStates: [] });
  const [draftFilters, setDraftFilters] = useState<CustomerBalanceFilterState>({ statuses: [], paymentTermIds: [], balanceStates: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [viewDetail, setViewDetail] = useState<CustomerBalanceDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [formState, setFormState] = useState<CustomerBalanceFormState>(createEmptyCustomerBalanceForm());
  const [editDetail, setEditDetail] = useState<CustomerBalanceDetail | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomerBalanceActionTarget | null>(null);
  const [deleteDetail, setDeleteDetail] = useState<CustomerBalanceDetail | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filterCount = filters.statuses.length + filters.paymentTermIds.length + filters.balanceStates.length;

  const fetchCustomerBalanceRegister = useCallback(
    async ({
      search,
      page,
      nextFilters,
      nextQuickFilters,
    }: {
      search: string;
      page: number;
      nextFilters: CustomerBalanceFilterState;
      nextQuickFilters: string[];
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getCustomerBalances({
          search,
          page,
          statuses: nextFilters.statuses,
          paymentTermIds: nextFilters.paymentTermIds,
          balanceStates: nextFilters.balanceStates,
          quickFilters: nextQuickFilters,
        });
        setData(response);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load customer balances.');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchCustomerBalanceRegister({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  }, [currentPage, fetchCustomerBalanceRegister, filters, quickFilters, submittedSearch]);

  const refreshCurrentView = async () => {
    await fetchCustomerBalanceRegister({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput);
    setCurrentPage(1);
    void fetchCustomerBalanceRegister({
      search: searchInput,
      page: 1,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  };

  const handleRefresh = () => {
    void refreshCurrentView();
  };

  const handleExport = () => {
    const rows = data?.rows || [];
    if (!rows.length) return;
    const headers = ['Customer', 'Customer Code', 'Payment Terms', 'Credit Limit', 'Balance Due', 'Available Credit', 'Status'];
    const csvRows = rows.map((row) => [
      row.customerLabel,
      row.customerCode,
      row.paymentTermsLabel,
      row.creditLimitLabel,
      row.balanceDueLabel,
      row.availableCreditLabel,
      row.statusLabel,
    ]);
    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'customer-balances.csv';
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
      const detail = await getCustomerBalanceDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load customer balance detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleOpenEdit = async (id: string) => {
    setEditingId(id);
    setEditDetail(null);
    setEditError(null);
    setIsEditOpen(true);
    setIsEditLoading(true);
    try {
      const detail = await getCustomerBalanceDetail(id);
      setEditDetail(detail);
      setFormState(mapCustomerBalanceDetailToFormState(detail));
    } catch (detailError) {
      setEditError(detailError instanceof Error ? detailError.message : 'Unable to load customer for editing.');
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleSubmitEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingId) return;
    setIsEditSubmitting(true);
    setEditError(null);
    try {
      const payload: CustomerBalanceMutationInput = {
        customerCode: formState.customerCode || null,
        displayName: formState.displayName,
        legalName: formState.legalName || null,
        customerType: formState.customerType,
        email: formState.email || null,
        phone: formState.phone || null,
        billingAddress: formState.billingAddress || null,
        shippingAddress: formState.shippingAddress || null,
        taxId: formState.taxId || null,
        creditLimit: Number.isFinite(Number(formState.creditLimit)) ? Number(formState.creditLimit) : 0,
        status: formState.status,
        notes: formState.notes || null,
        currencyReference: formState.currencyReference || null,
        paymentTermReference: formState.paymentTermReference || null,
      };
      const updated = await updateCustomerBalanceCustomer(editingId, payload);
      setEditDetail(updated);
      setIsEditOpen(false);
      await refreshCurrentView();
      await handleView(String(updated.id));
    } catch (submitError) {
      setEditError(submitError instanceof Error ? submitError.message : 'Unable to update customer.');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleOpenDelete = async (id: string, customerLabel: string) => {
    setDeleteTarget({ id, customerLabel });
    setDeleteDetail(null);
    setError(null);
    setIsDeleteLoading(true);
    try {
      const detail = await getCustomerBalanceDetail(id);
      setDeleteDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load customer dependency details.');
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteCustomerBalanceCustomer(deleteTarget.id);
      setDeleteTarget(null);
      setDeleteDetail(null);
      await refreshCurrentView();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete customer.');
    } finally {
      setIsDeleting(false);
    }
  };

  const statusOptions = data?.referenceData.statuses || [];
  const customerTypeOptions = data?.referenceData.customerTypes || [];
  const currencyOptions = [
    { label: 'Select a currency', value: '' },
    ...(data?.referenceData.currencies || []).map((currency) => ({
      label: `${currency.code ? `${currency.code} - ` : ''}${currency.name || 'Currency'}`,
      value: String(currency.id),
    })),
  ];
  const paymentTermOptions = [
    { label: 'Select payment terms', value: '' },
    ...(data?.referenceData.paymentTerms || []).map((paymentTerm) => ({
      label: paymentTerm.label,
      value: String(paymentTerm.id),
    })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">{data?.meta.label || tab.label}</h2>
          <p className="text-sm text-gray-600">{data?.meta.description || tab.description}</p>
          <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" />
            Refresh Balances
          </button>
          <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!data?.rows.length}>
            <Download className="h-4 w-4" />
            Export Balances
          </button>
        </div>
      </div>

      {data?.metrics?.length ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {data.metrics.map((metric) => (
            <div key={metric.id}>
              <MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} />
            </div>
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
                  placeholder={data?.meta.searchPlaceholder || tab.searchPlaceholder}
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
              <button
                key={filter.value}
                type="button"
                onClick={() => handleToggleQuickFilter(filter.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${quickFilters.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
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
                  <button
                    type="button"
                    onClick={() => {
                      setDraftFilters({ statuses: [], paymentTermIds: [], balanceStates: [] });
                      setFilters({ statuses: [], paymentTermIds: [], balanceStates: [] });
                      setCurrentPage(1);
                      setIsFilterPanelOpen(false);
                    }}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </button>
                  <button type="button" onClick={() => setIsFilterPanelOpen(false)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters({ ...draftFilters });
                      setCurrentPage(1);
                      setIsFilterPanelOpen(false);
                    }}
                    className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.statuses || []).map((option) => {
                      const selected = draftFilters.statuses.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, option.value) }))}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Payment Terms</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.paymentTerms || []).map((option) => {
                      const selected = draftFilters.paymentTermIds.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setDraftFilters((previous) => ({ ...previous, paymentTermIds: toggleFilterValue(previous.paymentTermIds, option.value) }))}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Balance State</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.balanceStates || []).map((option) => {
                      const selected = draftFilters.balanceStates.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setDraftFilters((previous) => ({ ...previous, balanceStates: toggleFilterValue(previous.balanceStates, option.value) }))}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}
                        >
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
              <h3 className="text-base font-semibold text-gray-900">{data?.meta.tableTitle || tab.tableTitle}</h3>
              <p className="text-sm text-gray-600">{data?.meta.tableDescription || tab.tableDescription}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span>{data?.totals.filteredRows ?? 0} matching rows</span>
            </div>
          </div>

          {error ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {tab.columns.map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Credit Limit' || column === 'Balance Due' ? 'text-right' : 'text-left'}`}>
                            {column}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {(data?.rows || []).length > 0 ? (
                        (data?.rows || []).map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50">
                            {row.cells.map((cell, index) => renderCell(cell, index))}
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => handleOpenEdit(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="Edit customer">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => handleOpenDelete(row.id, row.customerLabel)} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700" title="Delete customer">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={tab.columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">
                            No customer balance rows found.
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
                    <button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">
                      Previous
                    </button>
                    <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Customer Balance Detail" description="Review the customer master profile, open receivable exposure, and credit availability from current invoice balances.">
        <div className="space-y-6">
          {isViewLoading ? (
            <LoadingSkeleton />
          ) : viewDetail ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Customer', viewDetail.displayName || '-'],
                  ['Customer Code', viewDetail.customerCode || '-'],
                  ['Customer Type', viewDetail.customerTypeLabel || '-'],
                  ['Status', viewDetail.statusLabel || '-'],
                  ['Payment Terms', viewDetail.paymentTermsLabel || '-'],
                  ['Currency', viewDetail.currencyLabel || '-'],
                  ['Credit Limit', viewDetail.creditLimitLabel],
                  ['Balance Due', viewDetail.currentBalanceDueLabel],
                  ['Available Credit', viewDetail.availableCreditLabel],
                  ['Over Credit Limit', viewDetail.overCreditLimitAmountLabel],
                  ['Open Invoices', String(viewDetail.openInvoiceCount)],
                  ['Overdue Invoices', String(viewDetail.overdueInvoiceCount)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Contacts</p>
                  <div className="mt-3 space-y-2 text-sm text-gray-700">
                    <p>Email: {viewDetail.email || '-'}</p>
                    <p>Phone: {viewDetail.phone || '-'}</p>
                    <p>Tax ID: {viewDetail.taxId || '-'}</p>
                    <p>Latest Invoice Date: {viewDetail.latestInvoiceDateLabel || '-'}</p>
                    <p>Due This Week: {viewDetail.dueThisWeekCount}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Dependencies</p>
                  <div className="mt-3 space-y-2 text-sm text-gray-700">
                    <p>Total Invoices: {viewDetail.usageSummary.invoiceCount}</p>
                    <p>Payments Received: {viewDetail.usageSummary.paymentReceivedCount}</p>
                    <p>Credit Notes: {viewDetail.usageSummary.creditNoteCount}</p>
                    <p>Can Delete: {viewDetail.usageSummary.canDelete ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-5 py-4">
                  <h4 className="text-sm font-semibold text-gray-900">Open Invoices</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Invoice', 'Invoice Date', 'Due Date', 'Balance Due', 'Status'].map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Balance Due' ? 'text-right' : 'text-left'}`}>
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {viewDetail.openInvoices.length > 0 ? (
                        viewDetail.openInvoices.map((invoice) => (
                          <tr key={invoice.id}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{invoice.invoiceDateLabel}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{invoice.dueDateLabel}</td>
                            <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{invoice.balanceDueLabel}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${invoice.statusTone === 'green' ? 'bg-green-50 text-green-700 ring-green-200' : invoice.statusTone === 'amber' ? 'bg-amber-50 text-amber-700 ring-amber-200' : invoice.statusTone === 'red' ? 'bg-red-50 text-red-700 ring-red-200' : invoice.statusTone === 'blue' ? 'bg-blue-50 text-blue-700 ring-blue-200' : 'bg-gray-100 text-gray-700 ring-gray-200'}`}>
                                {invoice.statusLabel}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">No open invoices found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                  <p className="font-medium text-gray-900">Billing Address</p>
                  <p className="mt-2 whitespace-pre-wrap">{viewDetail.billingAddress || '-'}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                  <p className="font-medium text-gray-900">Shipping Address</p>
                  <p className="mt-2 whitespace-pre-wrap">{viewDetail.shippingAddress || '-'}</p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Notes</p>
                <p className="mt-2 text-sm text-gray-700">{viewDetail.notes || '-'}</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">No details available.</p>
          )}
          <div className="flex justify-end pt-4">
            <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
              Close
            </button>
          </div>
        </div>
      </SlideOver>

      <SlideOver isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Customer Balance Source" description="Update the customer master fields that drive receivable monitoring. Balance figures remain visible but read-only.">
        <form onSubmit={handleSubmitEdit} className="space-y-6">
          {editError ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {editError}
            </div>
          ) : null}

          {isEditLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Customer Code">
                  <Input value={formState.customerCode} onChange={(value) => setFormState((previous) => ({ ...previous, customerCode: value }))} />
                </FormField>
                <FormField label="Display Name" required>
                  <Input value={formState.displayName} onChange={(value) => setFormState((previous) => ({ ...previous, displayName: value }))} required />
                </FormField>
                <FormField label="Legal Name">
                  <Input value={formState.legalName} onChange={(value) => setFormState((previous) => ({ ...previous, legalName: value }))} />
                </FormField>
                <FormField label="Customer Type" required>
                  <Select value={formState.customerType} onChange={(value) => setFormState((previous) => ({ ...previous, customerType: value }))} options={customerTypeOptions.length > 0 ? customerTypeOptions : [{ label: 'Individual', value: 'individual' }]} />
                </FormField>
                <FormField label="Email">
                  <Input value={formState.email} onChange={(value) => setFormState((previous) => ({ ...previous, email: value }))} />
                </FormField>
                <FormField label="Phone">
                  <Input value={formState.phone} onChange={(value) => setFormState((previous) => ({ ...previous, phone: value }))} />
                </FormField>
                <FormField label="Currency" required>
                  <Select value={formState.currencyReference} onChange={(value) => setFormState((previous) => ({ ...previous, currencyReference: value }))} options={currencyOptions} />
                </FormField>
                <FormField label="Payment Terms" required>
                  <Select value={formState.paymentTermReference} onChange={(value) => setFormState((previous) => ({ ...previous, paymentTermReference: value }))} options={paymentTermOptions} />
                </FormField>
                <FormField label="Credit Limit" required>
                  <Input type="number" value={formState.creditLimit} onChange={(value) => setFormState((previous) => ({ ...previous, creditLimit: value }))} required />
                </FormField>
                <FormField label="Status" required>
                  <Select value={formState.status} onChange={(value) => setFormState((previous) => ({ ...previous, status: value }))} options={statusOptions.length > 0 ? statusOptions : [{ label: 'Active', value: 'active' }]} />
                </FormField>
                <FormField label="Tax ID">
                  <Input value={formState.taxId} onChange={(value) => setFormState((previous) => ({ ...previous, taxId: value }))} />
                </FormField>
                <FormField label="Current Balance Due">
                  <Input value={editDetail?.currentBalanceDueLabel || '-'} onChange={() => undefined} disabled />
                </FormField>
                <FormField label="Available Credit">
                  <Input value={editDetail?.availableCreditLabel || '-'} onChange={() => undefined} disabled />
                </FormField>
                <FormField label="Over Credit Limit">
                  <Input value={editDetail?.overCreditLimitAmountLabel || '-'} onChange={() => undefined} disabled />
                </FormField>
                <FormField label="Open Invoices">
                  <Input value={String(editDetail?.openInvoiceCount || 0)} onChange={() => undefined} disabled />
                </FormField>
                <FormField label="Overdue Invoices">
                  <Input value={String(editDetail?.overdueInvoiceCount || 0)} onChange={() => undefined} disabled />
                </FormField>
              </div>

              <FormField label="Billing Address">
                <TextArea value={formState.billingAddress} onChange={(value) => setFormState((previous) => ({ ...previous, billingAddress: value }))} rows={3} />
              </FormField>
              <FormField label="Shipping Address">
                <TextArea value={formState.shippingAddress} onChange={(value) => setFormState((previous) => ({ ...previous, shippingAddress: value }))} rows={3} />
              </FormField>
              <FormField label="Notes">
                <TextArea value={formState.notes} onChange={(value) => setFormState((previous) => ({ ...previous, notes: value }))} rows={3} />
              </FormField>

              <div className="grid gap-4 md:grid-cols-3">
                <FormField label="Invoice Count">
                  <Input value={String(editDetail?.usageSummary.invoiceCount || 0)} onChange={() => undefined} disabled />
                </FormField>
                <FormField label="Payments Received">
                  <Input value={String(editDetail?.usageSummary.paymentReceivedCount || 0)} onChange={() => undefined} disabled />
                </FormField>
                <FormField label="Credit Notes">
                  <Input value={String(editDetail?.usageSummary.creditNoteCount || 0)} onChange={() => undefined} disabled />
                </FormField>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setIsEditOpen(false)} disabled={isEditSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={isEditSubmitting || isEditLoading} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>
              {isEditSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </SlideOver>

      <SlideOver isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete Customer" description="Delete this customer master record after dependency validation completes." width="max-w-lg">
        <div className="space-y-6">
          {isDeleteLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <p className="font-medium">Delete customer {deleteTarget?.customerLabel}?</p>
                <p className="mt-1">Deletion is blocked when invoices, payments received, or credit notes still reference this customer.</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
                <p>Invoices: {deleteDetail?.usageSummary.invoiceCount ?? 0}</p>
                <p>Payments Received: {deleteDetail?.usageSummary.paymentReceivedCount ?? 0}</p>
                <p>Credit Notes: {deleteDetail?.usageSummary.creditNoteCount ?? 0}</p>
              </div>
            </>
          )}
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleting || isDeleteLoading || !deleteDetail?.usageSummary.canDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
              {isDeleting ? 'Deleting...' : 'Delete Customer'}
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}

function OfficialReceiptsPanel({ tab }: { tab: (typeof TABS)[number] }) {
  const [data, setData] = useState<OfficialReceiptRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<OfficialReceiptFilterState>({ statuses: [], customerIds: [], proofStates: [] });
  const [draftFilters, setDraftFilters] = useState<OfficialReceiptFilterState>({ statuses: [], customerIds: [], proofStates: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [viewDetail, setViewDetail] = useState<OfficialReceiptDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [formState, setFormState] = useState<OfficialReceiptFormState>(createEmptyOfficialReceiptForm());
  const [formDetail, setFormDetail] = useState<OfficialReceiptDetail | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<OfficialReceiptActionTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [issueTarget, setIssueTarget] = useState<OfficialReceiptActionTarget | null>(null);
  const [isIssuing, setIsIssuing] = useState(false);
  const [voidTarget, setVoidTarget] = useState<OfficialReceiptActionTarget | null>(null);
  const [isVoiding, setIsVoiding] = useState(false);

  const filterCount = filters.statuses.length + filters.customerIds.length + filters.proofStates.length;

  const fetchOfficialReceipts = useCallback(
    async ({
      search,
      page,
      nextFilters,
      nextQuickFilters,
    }: {
      search: string;
      page: number;
      nextFilters: OfficialReceiptFilterState;
      nextQuickFilters: string[];
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getOfficialReceipts({
          search,
          page,
          statuses: nextFilters.statuses,
          customerIds: nextFilters.customerIds,
          proofStates: nextFilters.proofStates,
          quickFilters: nextQuickFilters,
        });
        setData(response);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load official receipts.');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchOfficialReceipts({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  }, [currentPage, fetchOfficialReceipts, filters, quickFilters, submittedSearch]);

  const paymentOptions = useMemo(
    () => [
      { label: 'Select a payment received record', value: '' },
      ...(data?.referenceData.payments || [])
        .filter((payment) => !payment.linkedOfficialReceiptId || payment.linkedOfficialReceiptId === String(editingId || ''))
        .map((payment) => ({
          label: payment.label,
          value: String(payment.id),
        })),
    ],
    [data?.referenceData.payments, editingId],
  );

  const mediaOptions = useMemo(
    () => [
      { label: 'No proof document selected', value: '' },
      ...(data?.referenceData.mediaDocuments || []).map((document) => ({
        label: document.filename,
        value: String(document.id),
      })),
    ],
    [data?.referenceData.mediaDocuments],
  );

  const selectedPayment = useMemo(
    () => (data?.referenceData.payments || []).find((payment) => String(payment.id) === formState.paymentReceived) || null,
    [data?.referenceData.payments, formState.paymentReceived],
  );

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput);
    setCurrentPage(1);
    void fetchOfficialReceipts({ search: searchInput, page: 1, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleRefresh = () => {
    void fetchOfficialReceipts({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleExport = () => {
    const rows = data?.rows || [];
    if (!rows.length) return;
    const headers = ['OR No.', 'Receipt Date', 'Customer', 'Payment Ref', 'Amount', 'Status', 'Proof Document', 'Issued By'];
    const csvRows = rows.map((row) => [
      row.receiptNumber,
      row.receiptDateLabel,
      row.customerLabel,
      row.paymentLabel,
      row.amountLabel,
      row.statusLabel,
      row.proofDocumentLabel,
      row.issuedByLabel,
    ]);
    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'official-receipts.csv';
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
    setFormDetail(null);
    setFormError(null);
    setFormState(createEmptyOfficialReceiptForm());
    setIsFormOpen(true);
  };

  const handleView = async (id: string) => {
    setIsViewOpen(true);
    setIsViewLoading(true);
    setViewDetail(null);
    try {
      const detail = await getOfficialReceiptDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load official receipt detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleOpenEdit = async (id: string) => {
    setEditingId(id);
    setFormDetail(null);
    setFormError(null);
    setIsFormOpen(true);
    setIsFormLoading(true);
    try {
      const detail = await getOfficialReceiptDetail(id);
      setFormDetail(detail);
      setFormState({
        receiptNumber: detail.receiptNumber,
        paymentReceived: detail.paymentReceivedId,
        proofDocument: detail.proofDocumentId || '',
        notes: detail.notes || '',
      });
    } catch (detailError) {
      setFormError(detailError instanceof Error ? detailError.message : 'Unable to load official receipt detail.');
    } finally {
      setIsFormLoading(false);
    }
  };

  const normalizeFormPayload = (): OfficialReceiptMutationInput => ({
    receiptNumber: formState.receiptNumber.trim() || null,
    paymentReceived: formState.paymentReceived,
    proofDocument: formState.proofDocument || null,
    notes: formState.notes.trim() || null,
  });

  const refreshCurrentView = async () => {
    await fetchOfficialReceipts({
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
      const payload = normalizeFormPayload();
      if (editingId) {
        const updated = await updateOfficialReceipt(editingId, payload);
        setFormDetail(updated);
      } else {
        await createOfficialReceipt(payload);
      }
      setIsFormOpen(false);
      await refreshCurrentView();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Unable to save official receipt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteOfficialReceipt(deleteTarget.id);
      setDeleteTarget(null);
      await refreshCurrentView();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete official receipt.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmIssue = async () => {
    if (!issueTarget) return;
    setIsIssuing(true);
    setError(null);
    try {
      await issueOfficialReceipt(issueTarget.id);
      setIssueTarget(null);
      await refreshCurrentView();
    } catch (issueError) {
      setError(issueError instanceof Error ? issueError.message : 'Unable to issue official receipt.');
    } finally {
      setIsIssuing(false);
    }
  };

  const handleConfirmVoid = async () => {
    if (!voidTarget) return;
    setIsVoiding(true);
    setError(null);
    try {
      await voidOfficialReceipt(voidTarget.id);
      setVoidTarget(null);
      await refreshCurrentView();
    } catch (voidError) {
      setError(voidError instanceof Error ? voidError.message : 'Unable to void official receipt.');
    } finally {
      setIsVoiding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">{data?.meta.label || tab.label}</h2>
          <p className="text-sm text-gray-600">{data?.meta.description || tab.description}</p>
          <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
            <Plus className="h-4 w-4" />
            Create Receipt
          </button>
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" />
            Refresh Receipts
          </button>
          <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!data?.rows.length}>
            <Download className="h-4 w-4" />
            Export Receipts
          </button>
        </div>
      </div>

      {data?.metrics?.length ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {data.metrics.map((metric) => (
            <div key={metric.id}>
              <MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} />
            </div>
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
                  placeholder={data?.meta.searchPlaceholder || tab.searchPlaceholder}
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
              <button
                key={filter.value}
                type="button"
                onClick={() => handleToggleQuickFilter(filter.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${quickFilters.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
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
                  <button
                    type="button"
                    onClick={() => {
                      setDraftFilters({ statuses: [], customerIds: [], proofStates: [] });
                      setFilters({ statuses: [], customerIds: [], proofStates: [] });
                      setCurrentPage(1);
                      setIsFilterPanelOpen(false);
                    }}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </button>
                  <button type="button" onClick={() => setIsFilterPanelOpen(false)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters({ ...draftFilters });
                      setCurrentPage(1);
                      setIsFilterPanelOpen(false);
                    }}
                    className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.statuses || []).map((option) => {
                      const selected = draftFilters.statuses.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, option.value) }))}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Customer</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.customers || []).map((option) => {
                      const selected = draftFilters.customerIds.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setDraftFilters((previous) => ({ ...previous, customerIds: toggleFilterValue(previous.customerIds, option.value) }))}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Proof State</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.proofStates || []).map((option) => {
                      const selected = draftFilters.proofStates.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setDraftFilters((previous) => ({ ...previous, proofStates: toggleFilterValue(previous.proofStates, option.value) }))}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}
                        >
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
              <h3 className="text-base font-semibold text-gray-900">{data?.meta.tableTitle || tab.tableTitle}</h3>
              <p className="text-sm text-gray-600">{data?.meta.tableDescription || tab.tableDescription}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span>{data?.totals.filteredRows ?? 0} matching rows</span>
            </div>
          </div>

          {error ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {tab.columns.map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Amount' ? 'text-right' : 'text-left'}`}>
                            {column}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {(data?.rows || []).length > 0 ? (
                        (data?.rows || []).map((row) => {
                          const isDraft = row.status === 'draft';
                          const isIssued = row.status === 'issued';
                          return (
                            <tr key={row.id} className="hover:bg-gray-50">
                              {row.cells.map((cell, index) => renderCell(cell, index))}
                              <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail">
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button type="button" onClick={() => handleOpenEdit(row.id)} disabled={!isDraft} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40" title="Edit receipt">
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button type="button" onClick={() => setIssueTarget({ id: row.id, receiptNumber: row.receiptNumber })} disabled={!isDraft} className="inline-flex items-center gap-1 rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40" title="Issue receipt">
                                    <Send className="h-4 w-4" />
                                  </button>
                                  <button type="button" onClick={() => setVoidTarget({ id: row.id, receiptNumber: row.receiptNumber })} disabled={!isIssued} className="inline-flex items-center gap-1 rounded-lg p-2 text-amber-600 transition-colors hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-40" title="Void receipt">
                                    <Ban className="h-4 w-4" />
                                  </button>
                                  <button type="button" onClick={() => setDeleteTarget({ id: row.id, receiptNumber: row.receiptNumber })} disabled={!isDraft} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40" title="Delete receipt">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={tab.columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">
                            No official receipt rows found.
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
                    <button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">
                      Previous
                    </button>
                    <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Official Receipt Detail" description="Review the linked payment, proof document, issuance state, and audit-safe status details.">
        <div className="space-y-6">
          {isViewLoading ? (
            <LoadingSkeleton />
          ) : viewDetail ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['OR No.', viewDetail.receiptNumber],
                  ['Payment Receipt', viewDetail.paymentReceivedLabel || '-'],
                  ['Payment Reference', viewDetail.paymentReferenceNumber || '-'],
                  ['Payment Status', viewDetail.paymentStatusLabel || '-'],
                  ['Customer', viewDetail.customerLabel || '-'],
                  ['Receipt Date', viewDetail.receiptDateLabel || '-'],
                  ['Amount', viewDetail.amountLabel || '-'],
                  ['Currency', viewDetail.currency || '-'],
                  ['Status', viewDetail.statusLabel || '-'],
                  ['Proof Document', viewDetail.proofDocumentLabel || '-'],
                  ['Issued By', viewDetail.issuedByLabel || '-'],
                  ['Voided At', viewDetail.voidedAt ? viewDetail.voidedAtLabel : '-'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-medium text-gray-900">Dependencies</p>
                <p className="mt-2">Can Edit: {viewDetail.usageSummary.canEdit ? 'Yes' : 'No'}</p>
                <p>Can Delete: {viewDetail.usageSummary.canDelete ? 'Yes' : 'No'}</p>
                <p>Can Issue: {viewDetail.usageSummary.canIssue ? 'Yes' : 'No'}</p>
                <p>Can Void: {viewDetail.usageSummary.canVoid ? 'Yes' : 'No'}</p>
                <p>Has Proof Document: {viewDetail.usageSummary.hasProofDocument ? 'Yes' : 'No'}</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Notes</p>
                <p className="mt-2 text-sm text-gray-700">{viewDetail.notes || '-'}</p>
                {viewDetail.proofDocumentUrl ? (
                  <a href={viewDetail.proofDocumentUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700">
                    Open Proof Document
                  </a>
                ) : null}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">No details available.</p>
          )}
          <div className="flex justify-end pt-4">
            <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
              Close
            </button>
          </div>
        </div>
      </SlideOver>

      <SlideOver isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingId ? 'Edit Official Receipt' : 'Create Official Receipt'} description="Use guided selections for the linked payment and proof document. Payment-derived fields remain visible but read-only.">
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {formError}
            </div>
          ) : null}

          {isFormLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Official Receipt Number">
                  <Input value={formState.receiptNumber} onChange={(value) => setFormState((previous) => ({ ...previous, receiptNumber: value }))} placeholder="Leave blank to auto-generate" />
                </FormField>
                <FormField label="Payment Received" required>
                  <Select value={formState.paymentReceived} onChange={(value) => setFormState((previous) => ({ ...previous, paymentReceived: value }))} options={paymentOptions} />
                </FormField>
                <FormField label="Customer">
                  <Input value={selectedPayment?.customerLabel || formDetail?.customerLabel || '-'} onChange={() => undefined} disabled />
                </FormField>
                <FormField label="Receipt Date">
                  <Input value={selectedPayment?.paymentDateLabel || formDetail?.receiptDateLabel || '-'} onChange={() => undefined} disabled />
                </FormField>
                <FormField label="Amount">
                  <Input value={selectedPayment?.amountReceivedLabel || formDetail?.amountLabel || '-'} onChange={() => undefined} disabled />
                </FormField>
                <FormField label="Currency">
                  <Input value={selectedPayment?.currency || formDetail?.currency || 'PHP'} onChange={() => undefined} disabled />
                </FormField>
                <FormField label="Payment Reference">
                  <Input value={selectedPayment?.referenceNumber || formDetail?.paymentReferenceNumber || '-'} onChange={() => undefined} disabled />
                </FormField>
                <FormField label="Payment Status">
                  <Input value={selectedPayment?.statusLabel || formDetail?.paymentStatusLabel || '-'} onChange={() => undefined} disabled />
                </FormField>
                <FormField label="Proof Document">
                  <Select value={formState.proofDocument} onChange={(value) => setFormState((previous) => ({ ...previous, proofDocument: value }))} options={mediaOptions} />
                </FormField>
                <FormField label="Status">
                  <Input value={formDetail?.statusLabel || 'Draft'} onChange={() => undefined} disabled />
                </FormField>
              </div>

              <FormField label="Notes">
                <TextArea value={formState.notes} onChange={(value) => setFormState((previous) => ({ ...previous, notes: value }))} rows={3} />
              </FormField>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <FormField label="Issued By">
                  <Input value={formDetail?.issuedByLabel || '-'} onChange={() => undefined} disabled />
                </FormField>
                <FormField label="Voided At">
                  <Input value={formDetail?.voidedAt ? formDetail.voidedAtLabel : '-'} onChange={() => undefined} disabled />
                </FormField>
                <FormField label="Voided By">
                  <Input value={formDetail?.voidedByLabel || '-'} onChange={() => undefined} disabled />
                </FormField>
                <FormField label="Proof Link">
                  <Input value={formDetail?.proofDocumentUrl || '-'} onChange={() => undefined} disabled />
                </FormField>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} disabled={isSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || isFormLoading} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>
              {isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Receipt'}
            </button>
          </div>
        </form>
      </SlideOver>

      <SlideOver isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete Official Receipt" description="Delete this draft official receipt after dependency validation completes." width="max-w-lg">
        <div className="space-y-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Delete official receipt {deleteTarget?.receiptNumber}?</p>
            <p className="mt-1">Only draft official receipts can be deleted. Issued or voided receipts remain locked for audit consistency.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {isDeleting ? 'Deleting...' : 'Delete Receipt'}
            </button>
          </div>
        </div>
      </SlideOver>

      <SlideOver isOpen={Boolean(issueTarget)} onClose={() => setIssueTarget(null)} title="Issue Official Receipt" description="Issuing finalizes the official receipt and locks direct edits on the record." width="max-w-lg">
        <div className="space-y-6">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
            <p className="font-medium">Issue official receipt {issueTarget?.receiptNumber}?</p>
            <p className="mt-1">Make sure the linked payment and proof document are correct before finalizing this official receipt.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setIssueTarget(null)} disabled={isIssuing} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={handleConfirmIssue} disabled={isIssuing} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {isIssuing ? 'Issuing...' : 'Issue Receipt'}
            </button>
          </div>
        </div>
      </SlideOver>

      <SlideOver isOpen={Boolean(voidTarget)} onClose={() => setVoidTarget(null)} title="Void Official Receipt" description="Voiding preserves the receipt for audit purposes while marking it unusable." width="max-w-lg">
        <div className="space-y-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            <p className="font-medium">Void official receipt {voidTarget?.receiptNumber}?</p>
            <p className="mt-1">Only issued official receipts can be voided. The record will remain visible for audit history.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setVoidTarget(null)} disabled={isVoiding} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={handleConfirmVoid} disabled={isVoiding} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50">
              {isVoiding ? 'Voiding...' : 'Void Receipt'}
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}

export function ReceiptsCustomerBalancesClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = TABS.find((tab) => tab.id === rawTab)?.id || 'payments-received';
  const currentTab = TABS.find((tab) => tab.id === activeTab) || TABS[0];

  const [data, setData] = useState<PaymentReceivedRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<PaymentFilterState>({ statuses: [], paymentMethods: [], customerIds: [] });
  const [draftFilters, setDraftFilters] = useState<PaymentFilterState>({ statuses: [], paymentMethods: [], customerIds: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [viewDetail, setViewDetail] = useState<PaymentReceivedDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [formState, setFormState] = useState<PaymentFormState>(createEmptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formDetail, setFormDetail] = useState<PaymentReceivedDetail | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PaymentActionTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [postTarget, setPostTarget] = useState<PaymentActionTarget | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const filterCount = filters.statuses.length + filters.paymentMethods.length + filters.customerIds.length;

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const fetchPayments = useCallback(
    async ({
      search,
      page,
      nextFilters,
      nextQuickFilters,
    }: {
      search: string;
      page: number;
      nextFilters: PaymentFilterState;
      nextQuickFilters: string[];
    }) => {
      if (activeTab !== 'payments-received') return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await getPaymentsReceived({
          search,
          page,
          statuses: nextFilters.statuses,
          paymentMethods: nextFilters.paymentMethods,
          customerIds: nextFilters.customerIds,
          quickFilters: nextQuickFilters,
        });
        setData(response);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load payments received.');
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab],
  );

  useEffect(() => {
    if (activeTab === 'payments-received') {
      void fetchPayments({
        search: submittedSearch,
        page: currentPage,
        nextFilters: filters,
        nextQuickFilters: quickFilters,
      });
    }
  }, [activeTab, currentPage, fetchPayments, filters, quickFilters, submittedSearch]);

  const referenceData = data?.referenceData;

  const customerOptions = useMemo(
    () => [
      { label: 'Select a customer', value: '' },
      ...(referenceData?.customers || []).map((customer) => ({
        label: `${customer.customerCode ? `${customer.customerCode} - ` : ''}${customer.displayName || 'Unnamed customer'}`,
        value: String(customer.id),
      })),
    ],
    [referenceData?.customers],
  );

  const paymentMethodOptions = useMemo(
    () => [
      { label: 'Cash', value: 'cash' },
      { label: 'Bank Transfer', value: 'bank_transfer' },
      { label: 'Check', value: 'check' },
      { label: 'Card', value: 'card' },
      { label: 'E-Wallet', value: 'e_wallet' },
      { label: 'Other', value: 'other' },
    ],
    [],
  );

  const bankAccountOptions = useMemo(
    () => [
      { label: 'No deposit account selected', value: '' },
      ...(referenceData?.bankAccounts || []).map((account) => ({
        label: [account.accountName || 'Unnamed bank account', account.bankName || null, account.accountNumberMasked || null]
          .filter(Boolean)
          .join(' • '),
        value: String(account.id),
      })),
    ],
    [referenceData?.bankAccounts],
  );

  const chartAccountOptions = useMemo(
    () => [
      { label: 'No undeposited funds override', value: '' },
      ...(referenceData?.chartAccounts || []).map((account) => ({
        label: `${account.code ? `${account.code} - ` : ''}${account.name || 'Unnamed account'}`,
        value: String(account.id),
      })),
    ],
    [referenceData?.chartAccounts],
  );

  const applicationInvoiceOptions = useMemo(() => {
    const filteredInvoices = (referenceData?.invoices || []).filter((invoice) => {
      if (invoice.balanceDue <= 0) return false;
      if (!formState.customer) return true;
      return invoice.customerId === formState.customer;
    });
    return [
      { label: 'Select an invoice', value: '' },
      ...filteredInvoices.map((invoice) => ({
        label: `${invoice.invoiceNumber || `Invoice ${invoice.id}`} • ${invoice.customerLabel} • ${formatCurrency(invoice.balanceDue)}`,
        value: String(invoice.id),
      })),
    ];
  }, [formState.customer, referenceData?.invoices]);

  const paymentPreview = useMemo(() => {
    const amountReceived = Number(formState.amountReceived || 0);
    const appliedAmount = formState.applications.reduce((sum, application) => sum + Number(application.amountApplied || 0), 0);
    const unappliedAmount = Math.max(0, amountReceived - appliedAmount);
    return { amountReceived, appliedAmount, unappliedAmount };
  }, [formState.amountReceived, formState.applications]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput);
    setCurrentPage(1);
    void fetchPayments({ search: searchInput, page: 1, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleRefresh = () => {
    void fetchPayments({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleExport = () => {
    const rows = data?.rows || [];
    if (!rows.length) return;
    const headers = ['Receipt No.', 'Payment Date', 'Customer', 'Method', 'Amount', 'Applied', 'Unapplied', 'Status'];
    const csvRows = rows.map((row) => [
      row.receiptNumber,
      row.paymentDateLabel,
      row.customerLabel,
      row.paymentMethodLabel,
      row.amountReceivedLabel,
      row.appliedAmountLabel,
      row.unappliedAmountLabel,
      row.statusLabel,
    ]);
    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'payments-received.csv';
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
    setFormDetail(null);
    setFormError(null);
    setFormState(createEmptyForm());
    setIsFormOpen(true);
  };

  const handleView = async (id: string) => {
    setIsViewOpen(true);
    setIsViewLoading(true);
    setViewDetail(null);
    try {
      const detail = await getPaymentReceivedDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load payment receipt detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleOpenEdit = async (id: string) => {
    setEditingId(id);
    setFormError(null);
    setFormDetail(null);
    setIsFormOpen(true);
    setIsFormLoading(true);
    try {
      const detail = await getPaymentReceivedDetail(id);
      setFormDetail(detail);
      setFormState({
        receiptNumber: detail.receiptNumber,
        customer: detail.customerId,
        paymentDate: toDateInputValue(detail.paymentDate),
        postingDate: toDateInputValue(detail.postingDate),
        paymentMethod: detail.paymentMethod || 'bank_transfer',
        depositAccount: detail.depositAccountId || '',
        undepositedFundsAccount: detail.undepositedFundsAccountId || '',
        amountReceived: String(detail.amountReceived || 0),
        currency: detail.currency || 'PHP',
        exchangeRate: String(detail.exchangeRate || 1),
        referenceNumber: detail.referenceNumber || '',
        notes: detail.notes || '',
        applications:
          detail.applications.length > 0
            ? detail.applications.map((application) => ({
                id: application.id,
                invoice: application.invoiceId || '',
                amountApplied: String(application.amountApplied || 0),
              }))
            : [createEmptyApplication()],
      });
    } catch (detailError) {
      setFormError(detailError instanceof Error ? detailError.message : 'Unable to load payment receipt detail.');
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleUpdateApplication = (applicationId: string, field: keyof ApplicationFormState, value: string) => {
    setFormState((previous) => ({
      ...previous,
      applications: previous.applications.map((application) =>
        application.id === applicationId ? { ...application, [field]: value } : application,
      ),
    }));
  };

  const handleAddApplication = () => {
    setFormState((previous) => ({
      ...previous,
      applications: [...previous.applications, createEmptyApplication()],
    }));
  };

  const handleRemoveApplication = (applicationId: string) => {
    setFormState((previous) => ({
      ...previous,
      applications:
        previous.applications.length > 1
          ? previous.applications.filter((application) => application.id !== applicationId)
          : previous.applications,
    }));
  };

  const normalizeFormPayload = (): PaymentReceivedMutationInput => ({
    receiptNumber: formState.receiptNumber.trim() || null,
    customer: formState.customer,
    paymentDate: formState.paymentDate,
    postingDate: formState.postingDate,
    paymentMethod: formState.paymentMethod,
    depositAccount: formState.depositAccount || null,
    undepositedFundsAccount: formState.undepositedFundsAccount || null,
    amountReceived: Number(formState.amountReceived || 0),
    currency: formState.currency.trim() || 'PHP',
    exchangeRate: Number(formState.exchangeRate || 1),
    referenceNumber: formState.referenceNumber.trim() || null,
    notes: formState.notes.trim() || null,
    applications: formState.applications
      .filter((application) => application.invoice && Number(application.amountApplied || 0) > 0)
      .map((application) => ({
        invoice: application.invoice,
        amountApplied: Number(application.amountApplied || 0),
      })),
  });

  const refreshCurrentView = async () => {
    await fetchPayments({
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
      const payload = normalizeFormPayload();
      if (editingId) {
        const updated = await updatePaymentReceived(editingId, payload);
        setFormDetail(updated);
      } else {
        await createPaymentReceived(payload);
      }
      setIsFormOpen(false);
      await refreshCurrentView();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Unable to save payment receipt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deletePaymentReceived(deleteTarget.id);
      setDeleteTarget(null);
      await refreshCurrentView();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete payment receipt.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmPost = async () => {
    if (!postTarget) return;
    setIsPosting(true);
    setError(null);
    try {
      await postPaymentReceived(postTarget.id);
      setPostTarget(null);
      await refreshCurrentView();
    } catch (postError) {
      setError(postError instanceof Error ? postError.message : 'Unable to post payment receipt.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Operations / Sales & Receivables</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Receipts & Customer Balances</h1>
          <p className="mt-1 text-base text-gray-600">
            Manage customer payments received, official receipts, and customer balance visibility in one receivables workspace.
          </p>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === 'official-receipts' ? (
        <OfficialReceiptsPanel tab={currentTab} />
      ) : activeTab === 'customer-balances' ? (
        <CustomerBalancesPanel tab={currentTab} />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-gray-900">{data?.meta.label || currentTab.label}</h2>
              <p className="text-sm text-gray-600">{data?.meta.description || currentTab.description}</p>
              <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
                <Plus className="h-4 w-4" />
                Create Receipt
              </button>
              <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
                <RefreshCw className="h-4 w-4" />
                Refresh Payments
              </button>
              <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!data?.rows.length}>
                <Download className="h-4 w-4" />
                Export Payments
              </button>
            </div>
          </div>

          {data?.metrics?.length ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
              {data.metrics.map((metric) => (
                <div key={metric.id}>
                  <MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} />
                </div>
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
                      placeholder={data?.meta.searchPlaceholder || currentTab.searchPlaceholder}
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
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => handleToggleQuickFilter(filter.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${quickFilters.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
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
                      <button
                        type="button"
                        onClick={() => {
                          setDraftFilters({ statuses: [], paymentMethods: [], customerIds: [] });
                          setFilters({ statuses: [], paymentMethods: [], customerIds: [] });
                          setCurrentPage(1);
                          setIsFilterPanelOpen(false);
                        }}
                        className="text-sm font-medium text-gray-500 hover:text-gray-700"
                      >
                        Clear all
                      </button>
                      <button type="button" onClick={() => setIsFilterPanelOpen(false)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFilters({ ...draftFilters });
                          setCurrentPage(1);
                          setIsFilterPanelOpen(false);
                        }}
                        className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-6 md:grid-cols-3">
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</h5>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(data?.filterOptions.statuses || []).map((option) => {
                          const selected = draftFilters.statuses.includes(option.value);
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, option.value) }))}
                              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Payment Method</h5>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(data?.filterOptions.paymentMethods || []).map((option) => {
                          const selected = draftFilters.paymentMethods.includes(option.value);
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setDraftFilters((previous) => ({ ...previous, paymentMethods: toggleFilterValue(previous.paymentMethods, option.value) }))}
                              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Customer</h5>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(data?.filterOptions.customers || []).map((option) => {
                          const selected = draftFilters.customerIds.includes(option.value);
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setDraftFilters((previous) => ({ ...previous, customerIds: toggleFilterValue(previous.customerIds, option.value) }))}
                              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}
                            >
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
                  <h3 className="text-base font-semibold text-gray-900">{data?.meta.tableTitle || currentTab.tableTitle}</h3>
                  <p className="text-sm text-gray-600">{data?.meta.tableDescription || currentTab.tableDescription}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <span>{data?.totals.filteredRows ?? 0} matching rows</span>
                </div>
              </div>

              {error ? (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              ) : null}

              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                <>
                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {currentTab.columns.map((column) => (
                              <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Amount' ? 'text-right' : 'text-left'}`}>
                                {column}
                              </th>
                            ))}
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {(data?.rows || []).length > 0 ? (
                            (data?.rows || []).map((row) => {
                              const isMutable = MUTABLE_STATUSES.has(row.status);
                              const canPost = row.status === 'draft';
                              return (
                                <tr key={row.id} className="hover:bg-gray-50">
                                  {row.cells.map((cell, index) => renderCell(cell, index))}
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                      <button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail">
                                        <Eye className="h-4 w-4" />
                                      </button>
                                      <button type="button" onClick={() => handleOpenEdit(row.id)} disabled={!isMutable} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40" title="Edit receipt">
                                        <Edit className="h-4 w-4" />
                                      </button>
                                      <button type="button" onClick={() => setPostTarget({ id: row.id, receiptNumber: row.receiptNumber })} disabled={!canPost} className="inline-flex items-center gap-1 rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40" title="Post receipt">
                                        <Send className="h-4 w-4" />
                                      </button>
                                      <button type="button" onClick={() => setDeleteTarget({ id: row.id, receiptNumber: row.receiptNumber })} disabled={!isMutable} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40" title="Delete receipt">
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={currentTab.columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">
                                No payment receipt rows found.
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
                        <button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">
                          Previous
                        </button>
                        <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">
                          Next
                        </button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Payment Receipt Detail" description="Review payment routing, invoice applications, posting status, and system-calculated accounting links.">
        <div className="space-y-6">
          {isViewLoading ? (
            <LoadingSkeleton />
          ) : viewDetail ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['Receipt No.', viewDetail.receiptNumber],
                  ['Customer', viewDetail.customerLabel || '-'],
                  ['Payment Date', viewDetail.paymentDateLabel],
                  ['Posting Date', viewDetail.postingDateLabel],
                  ['Payment Method', viewDetail.paymentMethodLabel],
                  ['Deposit Account', viewDetail.depositAccountLabel || '-'],
                  ['Undeposited Funds Account', viewDetail.undepositedFundsAccountLabel || '-'],
                  ['Status', viewDetail.statusLabel],
                  ['Reference No.', viewDetail.referenceNumber || '-'],
                  ['Posted Journal', viewDetail.postedJournalEntryId || '-'],
                  ['Fiscal Year', viewDetail.fiscalYearLabel || '-'],
                  ['Period', viewDetail.periodLabel || '-'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Amount Received', viewDetail.amountReceivedLabel],
                  ['Applied Amount', viewDetail.appliedAmountLabel],
                  ['Unapplied Amount', viewDetail.unappliedAmountLabel],
                  ['Exchange Rate', String(viewDetail.exchangeRate || 1)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-2 text-sm font-semibold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-5 py-4">
                  <h4 className="text-sm font-semibold text-gray-900">Applications</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Invoice', 'Invoice Status', 'Invoice Balance Due', 'Amount Applied'].map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Invoice' || column === 'Invoice Status' ? 'text-left' : 'text-right'}`}>
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {viewDetail.applications.length > 0 ? (
                        viewDetail.applications.map((application) => (
                          <tr key={application.id}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{application.invoiceLabel || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{application.invoiceStatusLabel}</td>
                            <td className="px-4 py-3 text-right text-sm text-gray-600">{application.invoiceBalanceDueLabel}</td>
                            <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{application.amountAppliedLabel}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">No applications recorded.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-medium text-gray-900">Dependencies</p>
                <p className="mt-2">Application Count: {viewDetail.usageSummary.applicationCount}</p>
                <p>Has Posted Journal Entry: {viewDetail.usageSummary.hasPostedJournalEntry ? 'Yes' : 'No'}</p>
                <p>Can Edit: {viewDetail.usageSummary.canEdit ? 'Yes' : 'No'}</p>
                <p>Can Delete: {viewDetail.usageSummary.canDelete ? 'Yes' : 'No'}</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Notes</p>
                <p className="mt-2 text-sm text-gray-700">{viewDetail.notes || '-'}</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">No details available.</p>
          )}
          <div className="flex justify-end pt-4">
            <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
              Close
            </button>
          </div>
        </div>
      </SlideOver>

      <SlideOver isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingId ? 'Edit Payment Receipt' : 'Create Payment Receipt'} description="Use guided selections for customer, payment routing, and invoice allocations. System-calculated posting fields remain read-only.">
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {formError}
            </div>
          ) : null}

          {isFormLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Receipt Number">
                  <Input value={formState.receiptNumber} onChange={(value) => setFormState((previous) => ({ ...previous, receiptNumber: value }))} placeholder="Leave blank to auto-generate" />
                </FormField>
                <FormField label="Customer" required>
                  <Select value={formState.customer} onChange={(value) => setFormState((previous) => ({ ...previous, customer: value, applications: [createEmptyApplication()] }))} options={customerOptions} />
                </FormField>
                <FormField label="Payment Date" required>
                  <Input type="date" value={formState.paymentDate} onChange={(value) => setFormState((previous) => ({ ...previous, paymentDate: value }))} required />
                </FormField>
                <FormField label="Posting Date" required>
                  <Input type="date" value={formState.postingDate} onChange={(value) => setFormState((previous) => ({ ...previous, postingDate: value }))} required />
                </FormField>
                <FormField label="Payment Method" required>
                  <Select value={formState.paymentMethod} onChange={(value) => setFormState((previous) => ({ ...previous, paymentMethod: value }))} options={paymentMethodOptions} />
                </FormField>
                <FormField label="Deposit Account">
                  <Select value={formState.depositAccount} onChange={(value) => setFormState((previous) => ({ ...previous, depositAccount: value }))} options={bankAccountOptions} />
                </FormField>
                <FormField label="Undeposited Funds Account">
                  <Select value={formState.undepositedFundsAccount} onChange={(value) => setFormState((previous) => ({ ...previous, undepositedFundsAccount: value }))} options={chartAccountOptions} />
                </FormField>
                <FormField label="Amount Received" required>
                  <Input type="number" value={formState.amountReceived} onChange={(value) => setFormState((previous) => ({ ...previous, amountReceived: value }))} required />
                </FormField>
                <FormField label="Currency" required>
                  <Input value={formState.currency} onChange={(value) => setFormState((previous) => ({ ...previous, currency: value }))} required />
                </FormField>
                <FormField label="Exchange Rate" required>
                  <Input type="number" value={formState.exchangeRate} onChange={(value) => setFormState((previous) => ({ ...previous, exchangeRate: value }))} required />
                </FormField>
                <FormField label="Reference Number">
                  <Input value={formState.referenceNumber} onChange={(value) => setFormState((previous) => ({ ...previous, referenceNumber: value }))} />
                </FormField>
                <FormField label="Status">
                  <Input value={formDetail?.statusLabel || 'Draft'} onChange={() => undefined} disabled />
                </FormField>
              </div>

              <FormField label="Notes">
                <TextArea value={formState.notes} onChange={(value) => setFormState((previous) => ({ ...previous, notes: value }))} rows={3} />
              </FormField>

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Applications</h4>
                    <p className="mt-1 text-sm text-gray-600">Allocate this receipt to posted or partially paid invoices for the selected customer.</p>
                  </div>
                  <button type="button" onClick={handleAddApplication} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <Plus className="h-4 w-4" />
                    Add Application
                  </button>
                </div>
                <div className="space-y-4 p-5">
                  {formState.applications.map((application, index) => (
                    <div key={application.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <h5 className="text-sm font-semibold text-gray-900">Application {index + 1}</h5>
                        <button type="button" onClick={() => handleRemoveApplication(application.id)} disabled={formState.applications.length === 1} className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40">
                          Remove
                        </button>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField label="Invoice">
                          <Select value={application.invoice} onChange={(value) => handleUpdateApplication(application.id, 'invoice', value)} options={applicationInvoiceOptions} />
                        </FormField>
                        <FormField label="Amount Applied">
                          <Input type="number" value={application.amountApplied} onChange={(value) => handleUpdateApplication(application.id, 'amountApplied', value)} />
                        </FormField>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <FormField label="Applied Amount">
                  <Input value={formatCurrency(paymentPreview.appliedAmount)} onChange={() => undefined} disabled />
                </FormField>
                <FormField label="Unapplied Amount">
                  <Input value={formatCurrency(paymentPreview.unappliedAmount)} onChange={() => undefined} disabled />
                </FormField>
                <FormField label="Posted Journal">
                  <Input value={formDetail?.postedJournalEntryId || '-'} onChange={() => undefined} disabled />
                </FormField>
                <FormField label="Fiscal Year">
                  <Input value={formDetail?.fiscalYearLabel || '-'} onChange={() => undefined} disabled />
                </FormField>
                <FormField label="Period">
                  <Input value={formDetail?.periodLabel || '-'} onChange={() => undefined} disabled />
                </FormField>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} disabled={isSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || isFormLoading} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>
              {isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Receipt'}
            </button>
          </div>
        </form>
      </SlideOver>

      <SlideOver isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete Payment Receipt" description="Delete this draft payment receipt after dependency validation completes." width="max-w-lg">
        <div className="space-y-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Delete receipt {deleteTarget?.receiptNumber}?</p>
            <p className="mt-1">Only draft payment receipts can be deleted. Posted or voided receipts remain locked for audit consistency.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {isDeleting ? 'Deleting...' : 'Delete Receipt'}
            </button>
          </div>
        </div>
      </SlideOver>

      <SlideOver isOpen={Boolean(postTarget)} onClose={() => setPostTarget(null)} title="Post Payment Receipt" description="Posting creates the journal entry and locks direct edits on the receipt." width="max-w-lg">
        <div className="space-y-6">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
            <p className="font-medium">Post receipt {postTarget?.receiptNumber}?</p>
            <p className="mt-1">Make sure customer, cash routing, and invoice allocations are complete before posting this payment receipt.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setPostTarget(null)} disabled={isPosting} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={handleConfirmPost} disabled={isPosting} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {isPosting ? 'Posting...' : 'Post Receipt'}
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
