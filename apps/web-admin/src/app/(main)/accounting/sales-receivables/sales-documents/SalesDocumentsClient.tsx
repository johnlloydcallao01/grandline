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
  Send,
  Trash2,
  X,
} from 'lucide-react';
import {
  createSalesCreditNote,
  createSalesInvoice,
  deleteSalesCreditNote,
  deleteSalesInvoice,
  getSalesCreditNoteDetail,
  getSalesCreditNotes,
  getSalesInvoiceDetail,
  getSalesInvoiceDetailRegister,
  getSalesInvoices,
  postSalesCreditNote,
  postSalesInvoice,
  updateSalesCreditNote,
  updateSalesInvoice,
  type SalesCreditNoteDetail,
  type SalesCreditNoteMutationInput,
  type SalesCreditNoteRegisterResponse,
  type SalesDocumentsCell,
  type SalesDocumentsMetric,
  type SalesInvoiceDetail,
  type SalesInvoiceDetailRegisterResponse,
  type SalesInvoiceMutationInput,
  type SalesInvoiceRegisterResponse,
} from './actions';

type TabId = 'invoices' | 'invoice-detail' | 'credit-notes';
type InvoiceFilterState = { statuses: string[]; postingStatuses: string[]; customerIds: string[] };
type InvoiceDetailFilterState = { statuses: string[]; coverage: string[] };
type CreditNoteFilterState = { statuses: string[]; customerIds: string[] };
type InvoiceLineFormState = {
  id: string;
  description: string;
  itemType: string;
  quantity: string;
  unitPrice: string;
  discountAmount: string;
  taxCode: string;
  incomeAccount: string;
  receivableAccountOverride: string;
};
type InvoiceFormState = {
  invoiceNumber: string;
  customer: string;
  invoiceDate: string;
  postingDate: string;
  dueDate: string;
  status: 'draft' | 'approved';
  currency: string;
  exchangeRate: string;
  referenceNumber: string;
  memo: string;
  sourceType: string;
  sourceReference: string;
  receivableAccountOverride: string;
  notes: string;
  lines: InvoiceLineFormState[];
};
type InvoiceActionTarget = {
  id: string;
  invoiceNumber: string;
};
type CreditNoteApplicationFormState = {
  id: string;
  invoice: string;
  amountApplied: string;
};
type CreditNoteFormState = {
  creditNoteNumber: string;
  customer: string;
  creditDate: string;
  postingDate: string;
  status: 'draft' | 'approved';
  currency: string;
  subtotal: string;
  taxTotal: string;
  sourceInvoice: string;
  adjustmentAccount: string;
  reason: string;
  notes: string;
  applications: CreditNoteApplicationFormState[];
};
type CreditNoteActionTarget = {
  id: string;
  creditNoteNumber: string;
};

const STATIC_TABS: Array<{
  id: TabId;
  label: string;
  description: string;
  searchPlaceholder: string;
  columns: string[];
  metrics: SalesDocumentsMetric[];
  rows: Array<{ id: string; cells: SalesDocumentsCell[] }>;
  tableTitle: string;
  tableDescription: string;
}> = [
    {
      id: 'invoices',
      label: 'Invoices',
      description: 'Create, review, and post customer invoices with due dates, totals, balances, and settlement status.',
      searchPlaceholder: 'Search invoice no., customer, reference no., memo, or due date',
      columns: ['Invoice No.', 'Invoice Date', 'Customer', 'Due Date', 'Total', 'Status'],
      metrics: [],
      rows: [],
      tableTitle: 'Invoice Register',
      tableDescription: 'Primary invoice register aligned with the invoice collection, due dates, and balance-due fields.',
    },
    {
      id: 'invoice-detail',
      label: 'Invoice Detail',
      description: 'Inspect invoice headers, normalized line items, tax totals, document support, and journal linkage.',
      searchPlaceholder: 'Search invoice no., customer, line description, tax code, or journal ref',
      columns: ['Invoice No.', 'Customer', 'Line Items', 'Tax Total', 'Balance Due', 'Status'],
      metrics: [
        { id: 'detail-1', label: 'Invoices With Lines', value: '72', change: 'Normalized through invoice line items', trend: 'up' },
        { id: 'detail-2', label: 'Invoice Lines', value: '384', change: 'Service and revenue-coded detail lines', trend: 'up' },
        { id: 'detail-3', label: 'Linked Documents', value: '66', change: 'Invoice support attached through document links', trend: 'neutral' },
        { id: 'detail-4', label: 'Journal-Linked Invoices', value: '52', change: 'Posted invoices with journal references', trend: 'up' },
      ],
      tableTitle: 'Invoice Detail Coverage',
      tableDescription: 'Detail-oriented view of invoice lines, tax totals, open balances, and linked accounting references.',
      rows: [
        { id: 'detail-1', cells: [{ text: 'INV-2026-1447', emphasis: true }, 'Blue Anchor Marine', '5 lines', { text: 'PHP 26,702', align: 'right' }, { text: 'PHP 248,880', emphasis: true, align: 'right' }, { text: 'Approved', tone: 'amber' }] },
        { id: 'detail-2', cells: [{ text: 'INV-2026-1439', emphasis: true }, 'Harbor Training Ltd.', '3 lines', { text: 'PHP 10,336', align: 'right' }, { text: 'PHP 96,440', emphasis: true, align: 'right' }, { text: 'Posted', tone: 'green' }] },
        { id: 'detail-3', cells: [{ text: 'INV-2026-1435', emphasis: true }, 'North Port Logistics', '2 lines', { text: 'PHP 0', align: 'right' }, { text: 'PHP 58,000', emphasis: true, align: 'right' }, { text: 'Draft', tone: 'blue' }] },
      ],
    },
    {
      id: 'credit-notes',
      label: 'Credit Notes',
      description: 'Manage customer credit notes through source invoices, applications, remaining balances, and posting status.',
      searchPlaceholder: 'Search credit note no., customer, source invoice, reason, or posting date',
      columns: ['Credit No.', 'Credit Date', 'Customer', 'Source Invoice', 'Remaining', 'Status'],
      metrics: [
        { id: 'credit-1', label: 'Draft Credits', value: '8', change: 'Prepared but not yet posted', trend: 'neutral' },
        { id: 'credit-2', label: 'Posted Credits', value: '16', change: 'Reducing open receivable balances', trend: 'up' },
        { id: 'credit-3', label: 'Applied Amount', value: 'PHP 286,300', change: 'Applied back to customer invoices', trend: 'up' },
        { id: 'credit-4', label: 'Remaining Credit', value: 'PHP 74,920', change: 'Available for further application', trend: 'down' },
      ],
      tableTitle: 'Credit Note Register',
      tableDescription: 'Customer credit notes with source-invoice references, application progress, and remaining balances.',
      rows: [
        { id: 'credit-1', cells: [{ text: 'CN-2026-028', emphasis: true }, '2026-05-31', 'SM Shipping Corp.', 'INV-2026-1452', { text: 'PHP 18,400', emphasis: true, align: 'right' }, { text: 'Draft', tone: 'blue' }] },
        { id: 'credit-2', cells: [{ text: 'CN-2026-026', emphasis: true }, '2026-05-30', 'Grandline Corporate', 'INV-2026-1433', { text: 'PHP 0', emphasis: true, align: 'right' }, { text: 'Posted', tone: 'green' }] },
        { id: 'credit-3', cells: [{ text: 'CN-2026-024', emphasis: true }, '2026-05-29', 'Blue Anchor Marine', 'INV-2026-1447', { text: 'PHP 11,520', emphasis: true, align: 'right' }, { text: 'Approved', tone: 'amber' }] },
      ],
    },
  ];

const MUTABLE_STATUSES = new Set(['draft', 'approved']);

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  if (variant === 'ghost') return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
}

function getMetricTone(trend: SalesDocumentsMetric['trend']) {
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

function computeLinePreview(line: InvoiceLineFormState, taxCodes: SalesInvoiceRegisterResponse['referenceData']['taxCodes']) {
  const quantity = Number(line.quantity || 0);
  const unitPrice = Number(line.unitPrice || 0);
  const discountAmount = Number(line.discountAmount || 0);
  const gross = Math.max(0, quantity * unitPrice);
  const taxable = Math.max(0, gross - discountAmount);
  const taxCode = taxCodes.find((entry) => String(entry.id) === line.taxCode);
  const rate = (taxCode?.rate || 0) / 100;
  let lineTax = 0;
  let lineSubtotal = taxable;
  if (taxCode?.calculationMethod === 'inclusive' && rate > 0) {
    lineTax = taxable - taxable / (1 + rate);
    lineSubtotal = taxable - lineTax;
  } else if (rate > 0 && taxCode?.calculationMethod !== 'exempt' && taxCode?.calculationMethod !== 'zero_rated') {
    lineTax = taxable * rate;
  }
  const lineTotal = (taxCode?.calculationMethod === 'inclusive' ? taxable : lineSubtotal + lineTax) || 0;

  return {
    lineSubtotal,
    lineTax,
    lineTotal,
  };
}

function createEmptyLine(): InvoiceLineFormState {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    description: '',
    itemType: 'service',
    quantity: '1',
    unitPrice: '0',
    discountAmount: '0',
    taxCode: '',
    incomeAccount: '',
    receivableAccountOverride: '',
  };
}

function createEmptyInvoiceForm(): InvoiceFormState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    invoiceNumber: '',
    customer: '',
    invoiceDate: today,
    postingDate: today,
    dueDate: today,
    status: 'draft',
    currency: 'PHP',
    exchangeRate: '1',
    referenceNumber: '',
    memo: '',
    sourceType: 'commercial_invoice',
    sourceReference: '',
    receivableAccountOverride: '',
    notes: '',
    lines: [createEmptyLine()],
  };
}

function createEmptyCreditNoteApplication(): CreditNoteApplicationFormState {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    invoice: '',
    amountApplied: '0',
  };
}

function createEmptyCreditNoteForm(): CreditNoteFormState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    creditNoteNumber: '',
    customer: '',
    creditDate: today,
    postingDate: today,
    status: 'draft',
    currency: 'PHP',
    subtotal: '0',
    taxTotal: '0',
    sourceInvoice: '',
    adjustmentAccount: '',
    reason: '',
    notes: '',
    applications: [createEmptyCreditNoteApplication()],
  };
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

function renderCell(cell: SalesDocumentsCell, index: number) {
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

function CreditNotesTab() {
  const [data, setData] = useState<SalesCreditNoteRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<CreditNoteFilterState>({ statuses: [], customerIds: [] });
  const [draftFilters, setDraftFilters] = useState<CreditNoteFilterState>({ statuses: [], customerIds: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [viewDetail, setViewDetail] = useState<SalesCreditNoteDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [formState, setFormState] = useState<CreditNoteFormState>(createEmptyCreditNoteForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CreditNoteActionTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [postTarget, setPostTarget] = useState<CreditNoteActionTarget | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const filterCount = filters.statuses.length + filters.customerIds.length;

  const fetchCreditNotes = useCallback(async ({
    search,
    page,
    nextFilters,
    nextQuickFilters,
  }: {
    search: string;
    page: number;
    nextFilters: CreditNoteFilterState;
    nextQuickFilters: string[];
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getSalesCreditNotes({
        search,
        page,
        statuses: nextFilters.statuses,
        customerIds: nextFilters.customerIds,
        quickFilters: nextQuickFilters,
      });
      setData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load credit notes.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCreditNotes({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  }, [currentPage, fetchCreditNotes, filters, quickFilters, submittedSearch]);

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

  const accountOptions = useMemo(
    () => [
      { label: 'Select an account', value: '' },
      ...(referenceData?.chartAccounts || []).map((account) => ({
        label: `${account.code ? `${account.code} - ` : ''}${account.name || 'Unnamed account'}`,
        value: String(account.id),
      })),
    ],
    [referenceData?.chartAccounts],
  );

  const sourceInvoiceOptions = useMemo(() => {
    const filteredInvoices = (referenceData?.invoices || []).filter((invoice) => {
      if (!formState.customer) return true;
      return invoice.customerId === formState.customer;
    });
    return [
      { label: 'No source invoice', value: '' },
      ...filteredInvoices.map((invoice) => ({
        label: `${invoice.invoiceNumber || `Invoice ${invoice.id}`} • ${invoice.customerLabel}`,
        value: String(invoice.id),
      })),
    ];
  }, [formState.customer, referenceData?.invoices]);

  const applicationInvoiceOptions = useMemo(() => {
    const filteredInvoices = (referenceData?.invoices || []).filter((invoice) => {
      if (!['posted', 'partially_paid'].includes(invoice.status)) return false;
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

  const creditPreview = useMemo(() => {
    const subtotal = Number(formState.subtotal || 0);
    const taxTotal = Number(formState.taxTotal || 0);
    const total = subtotal + taxTotal;
    const appliedAmount = formState.applications.reduce((sum, application) => sum + Number(application.amountApplied || 0), 0);
    const remainingAmount = Math.max(0, total - appliedAmount);
    return { subtotal, taxTotal, total, appliedAmount, remainingAmount };
  }, [formState.applications, formState.subtotal, formState.taxTotal]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput);
    setCurrentPage(1);
    void fetchCreditNotes({ search: searchInput, page: 1, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleRefresh = () => {
    void fetchCreditNotes({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleExport = () => {
    const rows = data?.section.table.rows || [];
    if (!rows.length) return;
    const headers = ['Credit No.', 'Credit Date', 'Customer', 'Source Invoice', 'Total', 'Applied Amount', 'Remaining', 'Status'];
    const csvRows = rows.map((row) => [
      row.creditNoteNumber,
      row.creditDateLabel,
      row.customerLabel,
      row.sourceInvoiceLabel,
      row.totalLabel,
      row.appliedAmountLabel,
      row.remainingAmountLabel,
      row.statusLabel,
    ]);
    const csvContent = [headers, ...csvRows].map((row) => row.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sales-document-credit-notes.csv';
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
    setFormState(createEmptyCreditNoteForm());
    setIsFormOpen(true);
  };

  const handleView = async (id: string) => {
    setIsViewOpen(true);
    setIsViewLoading(true);
    setViewDetail(null);
    try {
      const detail = await getSalesCreditNoteDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load credit note detail.');
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
      const detail = await getSalesCreditNoteDetail(id);
      setFormState({
        creditNoteNumber: detail.creditNoteNumber,
        customer: detail.customerId,
        creditDate: toDateInputValue(detail.creditDate),
        postingDate: toDateInputValue(detail.postingDate),
        status: detail.status === 'approved' ? 'approved' : 'draft',
        currency: detail.currency || 'PHP',
        subtotal: String(detail.subtotal || 0),
        taxTotal: String(detail.taxTotal || 0),
        sourceInvoice: detail.sourceInvoiceId || '',
        adjustmentAccount: detail.adjustmentAccountId || '',
        reason: detail.reason || '',
        notes: detail.notes || '',
        applications: detail.applications.length > 0
          ? detail.applications.map((application) => ({
            id: application.id,
            invoice: application.invoiceId || '',
            amountApplied: String(application.amountApplied || 0),
          }))
          : [createEmptyCreditNoteApplication()],
      });
    } catch (detailError) {
      setFormError(detailError instanceof Error ? detailError.message : 'Unable to load credit note detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleUpdateApplication = (applicationId: string, field: keyof CreditNoteApplicationFormState, value: string) => {
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
      applications: [...previous.applications, createEmptyCreditNoteApplication()],
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

  const normalizeFormPayload = (): SalesCreditNoteMutationInput => ({
    creditNoteNumber: formState.creditNoteNumber.trim() || null,
    customer: formState.customer,
    creditDate: formState.creditDate,
    postingDate: formState.postingDate,
    status: formState.status,
    currency: formState.currency.trim() || 'PHP',
    subtotal: Number(formState.subtotal || 0),
    taxTotal: Number(formState.taxTotal || 0),
    sourceInvoice: formState.sourceInvoice || null,
    adjustmentAccount: formState.adjustmentAccount,
    reason: formState.reason.trim() || null,
    notes: formState.notes.trim() || null,
    applications: formState.applications
      .filter((application) => application.invoice && Number(application.amountApplied || 0) > 0)
      .map((application) => ({
        invoice: application.invoice,
        amountApplied: Number(application.amountApplied || 0),
      })),
  });

  const refreshCurrentView = async () => {
    await fetchCreditNotes({
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
        await updateSalesCreditNote(editingId, payload);
      } else {
        await createSalesCreditNote(payload);
      }
      setIsFormOpen(false);
      await refreshCurrentView();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Unable to save credit note.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteSalesCreditNote(deleteTarget.id);
      setDeleteTarget(null);
      await refreshCurrentView();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete credit note.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmPost = async () => {
    if (!postTarget) return;
    setIsPosting(true);
    setError(null);
    try {
      await postSalesCreditNote(postTarget.id);
      setPostTarget(null);
      await refreshCurrentView();
    } catch (postError) {
      setError(postError instanceof Error ? postError.message : 'Unable to post credit note.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">{data?.section.label || 'Credit Notes'}</h2>
          <p className="text-sm text-gray-600">{data?.section.description || 'Manage customer credit notes through source invoices, applications, remaining balances, and posting status.'}</p>
          <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
            <Plus className="h-4 w-4" />
            Create Credit Note
          </button>
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" />
            Refresh Credits
          </button>
          <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!data?.section.table.rows.length}>
            <Download className="h-4 w-4" />
            Export Credits
          </button>
        </div>
      </div>

      {data?.section.metrics?.length ? <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{data.section.metrics.map((metric) => <div key={metric.id}><MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} /></div>)}</div> : null}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <form onSubmit={handleSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder={data?.section.searchPlaceholder || 'Search credit note no., customer, source invoice, reason, or posting date'} value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
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
            {(data?.section.filters.quickFilters || []).map((filter) => (
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
                  <p className="mt-1 text-sm text-gray-600">Select as many values as needed per group, then apply the filtered view.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => { setDraftFilters({ statuses: [], customerIds: [] }); setFilters({ statuses: [], customerIds: [] }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Clear all</button>
                  <button type="button" onClick={() => setIsFilterPanelOpen(false)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="button" onClick={() => { setFilters({ ...draftFilters }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button>
                </div>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.section.filters.statuses || []).map((option) => {
                      const selected = draftFilters.statuses.includes(option.value);
                      return <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{option.label}</button>;
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Customer</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.section.filters.customers || []).map((option) => {
                      const selected = draftFilters.customerIds.includes(option.value);
                      return <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, customerIds: toggleFilterValue(previous.customerIds, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{option.label}</button>;
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">{data?.section.table.title || 'Credit Note Register'}</h3>
              <p className="text-sm text-gray-600">{data?.section.table.description || 'Customer credit notes with source-invoice references, application progress, and remaining balances.'}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span>{data?.totals.filteredRows ?? 0} matching rows</span>
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
                        {['Credit No.', 'Credit Date', 'Customer', 'Source Invoice', 'Remaining', 'Status'].map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Remaining' ? 'text-right' : 'text-left'}`}>{column}</th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {(data?.section.table.rows || []).length > 0 ? (data?.section.table.rows || []).map((row) => {
                        const isMutable = MUTABLE_STATUSES.has(row.status);
                        const canPost = row.status === 'approved' || row.status === 'draft';
                        return (
                          <tr key={row.id} className="hover:bg-gray-50">
                            {row.cells.map((cell, index) => renderCell(cell, index))}
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => handleOpenEdit(row.id)} disabled={!isMutable} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40" title="Edit credit note">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => setPostTarget({ id: row.id, creditNoteNumber: row.creditNoteNumber })} disabled={!canPost} className="inline-flex items-center gap-1 rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40" title="Post credit note">
                                  <Send className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => setDeleteTarget({ id: row.id, creditNoteNumber: row.creditNoteNumber })} disabled={!isMutable} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40" title="Delete credit note">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">No credit note rows found.</td>
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
                    <button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button>
                    <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Credit Note Detail" description="Review credit-note header values, applications, remaining balance, and journal linkage.">
        <div className="space-y-6">
          {isViewLoading ? <LoadingSkeleton /> : viewDetail ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['Credit No.', viewDetail.creditNoteNumber],
                  ['Customer', viewDetail.customerLabel || '-'],
                  ['Credit Date', viewDetail.creditDateLabel],
                  ['Posting Date', viewDetail.postingDateLabel],
                  ['Status', viewDetail.statusLabel],
                  ['Source Invoice', viewDetail.sourceInvoiceLabel || '-'],
                  ['Adjustment Account', viewDetail.adjustmentAccountLabel || '-'],
                  ['Posted Journal', viewDetail.postedJournalEntryId || '-'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {[
                  ['Subtotal', viewDetail.subtotalLabel],
                  ['Tax Total', viewDetail.taxTotalLabel],
                  ['Total', viewDetail.totalLabel],
                  ['Applied Amount', viewDetail.appliedAmountLabel],
                  ['Remaining Amount', viewDetail.remainingAmountLabel],
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
                        {['Invoice', 'Invoice Balance Due', 'Amount Applied'].map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column !== 'Invoice' ? 'text-right' : 'text-left'}`}>{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {viewDetail.applications.length > 0 ? viewDetail.applications.map((application) => (
                        <tr key={application.id}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{application.invoiceLabel || '-'}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-600">{application.invoiceBalanceDueLabel}</td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{application.amountAppliedLabel}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-500">No applications recorded.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-medium text-gray-900">Dependencies</p>
                <p className="mt-2">Applications: {viewDetail.usageSummary.applicationCount}</p>
                <p>Has Posted Journal Entry: {viewDetail.usageSummary.hasPostedJournalEntry ? 'Yes' : 'No'}</p>
                <p>Has Blocking Dependents: {viewDetail.usageSummary.hasBlockingDependents ? 'Yes' : 'No'}</p>
              </div>
            </>
          ) : <p className="text-sm text-gray-500">No details available.</p>}
          <div className="flex justify-end pt-4">
            <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Close</button>
          </div>
        </div>
      </SlideOver>

      <SlideOver isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingId ? 'Edit Credit Note' : 'Create Credit Note'} description="Use guided selections for customer, invoice applications, and adjustment account. Totals and remaining balance are visible as controlled values.">
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError ? <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{formError}</div> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Credit Note Number">
              <Input value={formState.creditNoteNumber} onChange={(value) => setFormState((previous) => ({ ...previous, creditNoteNumber: value }))} placeholder="Leave blank to auto-generate" />
            </FormField>
            <FormField label="Customer" required>
              <Select value={formState.customer} onChange={(value) => setFormState((previous) => ({ ...previous, customer: value, sourceInvoice: '', applications: [createEmptyCreditNoteApplication()] }))} options={customerOptions} />
            </FormField>
            <FormField label="Credit Date" required>
              <Input type="date" value={formState.creditDate} onChange={(value) => setFormState((previous) => ({ ...previous, creditDate: value }))} required />
            </FormField>
            <FormField label="Posting Date" required>
              <Input type="date" value={formState.postingDate} onChange={(value) => setFormState((previous) => ({ ...previous, postingDate: value }))} required />
            </FormField>
            <FormField label="Status" required>
              <Select value={formState.status} onChange={(value) => setFormState((previous) => ({ ...previous, status: value as 'draft' | 'approved' }))} options={[{ label: 'Draft', value: 'draft' }, { label: 'Approved', value: 'approved' }]} />
            </FormField>
            <FormField label="Currency" required>
              <Input value={formState.currency} onChange={(value) => setFormState((previous) => ({ ...previous, currency: value }))} required />
            </FormField>
            <FormField label="Subtotal" required>
              <Input type="number" value={formState.subtotal} onChange={(value) => setFormState((previous) => ({ ...previous, subtotal: value }))} required />
            </FormField>
            <FormField label="Tax Total">
              <Input type="number" value={formState.taxTotal} onChange={(value) => setFormState((previous) => ({ ...previous, taxTotal: value }))} />
            </FormField>
            <FormField label="Source Invoice">
              <Select value={formState.sourceInvoice} onChange={(value) => setFormState((previous) => ({ ...previous, sourceInvoice: value }))} options={sourceInvoiceOptions} />
            </FormField>
            <FormField label="Adjustment Account" required>
              <Select value={formState.adjustmentAccount} onChange={(value) => setFormState((previous) => ({ ...previous, adjustmentAccount: value }))} options={accountOptions} />
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Reason">
              <TextArea value={formState.reason} onChange={(value) => setFormState((previous) => ({ ...previous, reason: value }))} rows={3} />
            </FormField>
            <FormField label="Notes">
              <TextArea value={formState.notes} onChange={(value) => setFormState((previous) => ({ ...previous, notes: value }))} rows={3} />
            </FormField>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Applications</h4>
                <p className="mt-1 text-sm text-gray-600">Allocate the credit note to posted or partially paid customer invoices.</p>
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
                    <button type="button" onClick={() => handleRemoveApplication(application.id)} disabled={formState.applications.length === 1} className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40">Remove</button>
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

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FormField label="Total">
              <Input value={formatCurrency(creditPreview.total)} onChange={() => undefined} disabled />
            </FormField>
            <FormField label="Applied Amount">
              <Input value={formatCurrency(creditPreview.appliedAmount)} onChange={() => undefined} disabled />
            </FormField>
            <FormField label="Remaining Amount">
              <Input value={formatCurrency(creditPreview.remainingAmount)} onChange={() => undefined} disabled />
            </FormField>
            <FormField label="Blocking Dependency">
              <Input value={editingId && viewDetail?.usageSummary.hasBlockingDependents ? 'Yes' : 'No'} onChange={() => undefined} disabled />
            </FormField>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} disabled={isSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>{isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Credit Note'}</button>
          </div>
        </form>
      </SlideOver>

      <SlideOver isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete Credit Note" description="Delete this mutable credit note after dependency validation completes." width="max-w-lg">
        <div className="space-y-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Delete credit note {deleteTarget?.creditNoteNumber}?</p>
            <p className="mt-1">Draft and approved credit notes can be deleted only when no blocking posted journal dependency exists.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">{isDeleting ? 'Deleting...' : 'Delete Credit Note'}</button>
          </div>
        </div>
      </SlideOver>

      <SlideOver isOpen={Boolean(postTarget)} onClose={() => setPostTarget(null)} title="Post Credit Note" description="Posting creates the journal entry and final application status for the credit note." width="max-w-lg">
        <div className="space-y-6">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
            <p className="font-medium">Post credit note {postTarget?.creditNoteNumber}?</p>
            <p className="mt-1">Make sure the customer, adjustment account, and invoice applications are complete before posting.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setPostTarget(null)} disabled={isPosting} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleConfirmPost} disabled={isPosting} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">{isPosting ? 'Posting...' : 'Post Credit Note'}</button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}

export function SalesDocumentsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = (STATIC_TABS.find((tab) => tab.id === rawTab)?.id) || 'invoices';
  const currentTab = STATIC_TABS.find((tab) => tab.id === activeTab) || STATIC_TABS[0];

  const [invoiceData, setInvoiceData] = useState<SalesInvoiceRegisterResponse | null>(null);
  const [invoiceDetailData, setInvoiceDetailData] = useState<SalesInvoiceDetailRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<InvoiceFilterState>({ statuses: [], postingStatuses: [], customerIds: [] });
  const [draftFilters, setDraftFilters] = useState<InvoiceFilterState>({ statuses: [], postingStatuses: [], customerIds: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [invoiceDetailSearchInput, setInvoiceDetailSearchInput] = useState('');
  const [invoiceDetailSubmittedSearch, setInvoiceDetailSubmittedSearch] = useState('');
  const [invoiceDetailCurrentPage, setInvoiceDetailCurrentPage] = useState(1);
  const [invoiceDetailFilters, setInvoiceDetailFilters] = useState<InvoiceDetailFilterState>({ statuses: [], coverage: [] });
  const [invoiceDetailDraftFilters, setInvoiceDetailDraftFilters] = useState<InvoiceDetailFilterState>({ statuses: [], coverage: [] });
  const [invoiceDetailQuickFilters, setInvoiceDetailQuickFilters] = useState<string[]>([]);
  const [isInvoiceDetailFilterPanelOpen, setIsInvoiceDetailFilterPanelOpen] = useState(false);
  const [viewDetail, setViewDetail] = useState<SalesInvoiceDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [formState, setFormState] = useState<InvoiceFormState>(createEmptyInvoiceForm());
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InvoiceActionTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [postTarget, setPostTarget] = useState<InvoiceActionTarget | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const filterCount = filters.statuses.length + filters.postingStatuses.length + filters.customerIds.length;
  const invoiceDetailFilterCount = invoiceDetailFilters.statuses.length + invoiceDetailFilters.coverage.length;

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const fetchInvoices = useCallback(async ({
    search,
    page,
    nextFilters,
    nextQuickFilters,
  }: {
    search: string;
    page: number;
    nextFilters: InvoiceFilterState;
    nextQuickFilters: string[];
  }) => {
    if (activeTab !== 'invoices') return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getSalesInvoices({
        search,
        page,
        statuses: nextFilters.statuses,
        postingStatuses: nextFilters.postingStatuses,
        customerIds: nextFilters.customerIds,
        quickFilters: nextQuickFilters,
      });
      setInvoiceData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load invoices.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  const fetchInvoiceDetailRegister = useCallback(async ({
    search,
    page,
    nextFilters,
    nextQuickFilters,
  }: {
    search: string;
    page: number;
    nextFilters: InvoiceDetailFilterState;
    nextQuickFilters: string[];
  }) => {
    if (activeTab !== 'invoice-detail') return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getSalesInvoiceDetailRegister({
        search,
        page,
        statuses: nextFilters.statuses,
        coverage: nextFilters.coverage,
        quickFilters: nextQuickFilters,
      });
      setInvoiceDetailData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load invoice detail coverage.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'invoices') {
      void fetchInvoices({
        search: submittedSearch,
        page: currentPage,
        nextFilters: filters,
        nextQuickFilters: quickFilters,
      });
    }
  }, [activeTab, currentPage, fetchInvoices, filters, quickFilters, submittedSearch]);

  useEffect(() => {
    if (activeTab === 'invoice-detail') {
      void fetchInvoiceDetailRegister({
        search: invoiceDetailSubmittedSearch,
        page: invoiceDetailCurrentPage,
        nextFilters: invoiceDetailFilters,
        nextQuickFilters: invoiceDetailQuickFilters,
      });
    }
  }, [
    activeTab,
    fetchInvoiceDetailRegister,
    invoiceDetailCurrentPage,
    invoiceDetailFilters,
    invoiceDetailQuickFilters,
    invoiceDetailSubmittedSearch,
  ]);

  const referenceData = invoiceData?.referenceData;

  const invoicePreview = useMemo(() => {
    const taxCodes = referenceData?.taxCodes || [];
    const linePreviews = formState.lines.map((line) => computeLinePreview(line, taxCodes));
    const subtotal = linePreviews.reduce((sum, line) => sum + line.lineSubtotal, 0);
    const taxTotal = linePreviews.reduce((sum, line) => sum + line.lineTax, 0);
    const total = linePreviews.reduce((sum, line) => sum + line.lineTotal, 0);
    const discountTotal = formState.lines.reduce((sum, line) => sum + Number(line.discountAmount || 0), 0);
    return { linePreviews, subtotal, taxTotal, total, discountTotal };
  }, [formState.lines, referenceData?.taxCodes]);

  const customerOptions = useMemo(() => [
    { label: 'Select a customer', value: '' },
    ...(referenceData?.customers || []).map((customer) => ({
      label: `${customer.customerCode ? `${customer.customerCode} - ` : ''}${customer.displayName || 'Unnamed customer'}`,
      value: String(customer.id),
    })),
  ], [referenceData?.customers]);

  const accountOptions = useMemo(() => [
    { label: 'Select an account', value: '' },
    ...(referenceData?.chartAccounts || []).map((account) => ({
      label: `${account.code ? `${account.code} - ` : ''}${account.name || 'Unnamed account'}`,
      value: String(account.id),
    })),
  ], [referenceData?.chartAccounts]);

  const taxCodeOptions = useMemo(() => [
    { label: 'No tax code', value: '' },
    ...(referenceData?.taxCodes || []).map((taxCode) => ({
      label: `${taxCode.code ? `${taxCode.code} - ` : ''}${taxCode.name || 'Unnamed tax code'}`,
      value: String(taxCode.id),
    })),
  ], [referenceData?.taxCodes]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput);
    setCurrentPage(1);
    void fetchInvoices({ search: searchInput, page: 1, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleRefresh = () => {
    void fetchInvoices({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleExport = () => {
    const rows = invoiceData?.section.table.rows || [];
    if (!rows.length) return;
    const headers = ['Invoice No.', 'Invoice Date', 'Customer', 'Due Date', 'Total', 'Balance Due', 'Status', 'Posting Status'];
    const csvRows = rows.map((row) => [
      row.invoiceNumber,
      row.invoiceDateLabel,
      row.customerLabel,
      row.dueDateLabel,
      row.totalLabel,
      row.balanceDueLabel,
      row.statusLabel,
      row.postingStatusLabel,
    ]);
    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sales-document-invoices.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleToggleQuickFilter = (value: string) => {
    setQuickFilters((previous) => toggleFilterValue(previous, value));
    setCurrentPage(1);
  };

  const handleInvoiceDetailSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setInvoiceDetailSubmittedSearch(invoiceDetailSearchInput);
    setInvoiceDetailCurrentPage(1);
    void fetchInvoiceDetailRegister({
      search: invoiceDetailSearchInput,
      page: 1,
      nextFilters: invoiceDetailFilters,
      nextQuickFilters: invoiceDetailQuickFilters,
    });
  };

  const handleInvoiceDetailRefresh = () => {
    void fetchInvoiceDetailRegister({
      search: invoiceDetailSubmittedSearch,
      page: invoiceDetailCurrentPage,
      nextFilters: invoiceDetailFilters,
      nextQuickFilters: invoiceDetailQuickFilters,
    });
  };

  const handleInvoiceDetailExport = () => {
    const rows = invoiceDetailData?.section.table.rows || [];
    if (!rows.length) return;
    const headers = ['Invoice No.', 'Customer', 'Line Items', 'Tax Total', 'Balance Due', 'Status', 'Linked Documents', 'Posted Journal'];
    const csvRows = rows.map((row) => [
      row.invoiceNumber,
      row.customerLabel,
      row.lineItemLabel,
      row.taxTotalLabel,
      row.balanceDueLabel,
      row.statusLabel,
      row.documentCountLabel,
      row.postedJournalEntryId || '-',
    ]);
    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sales-document-invoice-detail.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleToggleInvoiceDetailQuickFilter = (value: string) => {
    setInvoiceDetailQuickFilters((previous) => toggleFilterValue(previous, value));
    setInvoiceDetailCurrentPage(1);
  };

  const handleOpenCreate = () => {
    setEditingInvoiceId(null);
    setFormError(null);
    setFormState(createEmptyInvoiceForm());
    setIsFormOpen(true);
  };

  const handleView = async (id: string) => {
    setIsViewOpen(true);
    setIsViewLoading(true);
    setViewDetail(null);
    try {
      const detail = await getSalesInvoiceDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load invoice detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleOpenEdit = async (id: string) => {
    setEditingInvoiceId(id);
    setFormError(null);
    setIsFormOpen(true);
    setIsViewLoading(true);
    try {
      const detail = await getSalesInvoiceDetail(id);
      setFormState({
        invoiceNumber: detail.invoiceNumber,
        customer: detail.customerId,
        invoiceDate: toDateInputValue(detail.invoiceDate),
        postingDate: toDateInputValue(detail.postingDate),
        dueDate: toDateInputValue(detail.dueDate),
        status: detail.status === 'approved' ? 'approved' : 'draft',
        currency: detail.currency || 'PHP',
        exchangeRate: String(detail.exchangeRate || 1),
        referenceNumber: detail.referenceNumber || '',
        memo: detail.memo || '',
        sourceType: detail.sourceType || 'commercial_invoice',
        sourceReference: detail.sourceReference || '',
        receivableAccountOverride: detail.receivableAccountOverrideId || '',
        notes: detail.notes || '',
        lines: detail.lineItems.length > 0 ? detail.lineItems.map((line) => ({
          id: line.id,
          description: line.description,
          itemType: line.itemType || 'service',
          quantity: String(line.quantity || 0),
          unitPrice: String(line.unitPrice || 0),
          discountAmount: String(line.discountAmount || 0),
          taxCode: line.taxCodeId || '',
          incomeAccount: line.incomeAccountId || '',
          receivableAccountOverride: line.receivableAccountOverrideId || '',
        })) : [createEmptyLine()],
      });
    } catch (detailError) {
      setFormError(detailError instanceof Error ? detailError.message : 'Unable to load invoice detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleUpdateLine = (lineId: string, field: keyof InvoiceLineFormState, value: string) => {
    setFormState((previous) => ({
      ...previous,
      lines: previous.lines.map((line) => (line.id === lineId ? { ...line, [field]: value } : line)),
    }));
  };

  const handleAddLine = () => {
    setFormState((previous) => ({ ...previous, lines: [...previous.lines, createEmptyLine()] }));
  };

  const handleRemoveLine = (lineId: string) => {
    setFormState((previous) => ({
      ...previous,
      lines: previous.lines.length > 1 ? previous.lines.filter((line) => line.id !== lineId) : previous.lines,
    }));
  };

  const normalizeFormPayload = (): SalesInvoiceMutationInput => ({
    invoiceNumber: formState.invoiceNumber.trim() || null,
    customer: formState.customer,
    invoiceDate: formState.invoiceDate,
    postingDate: formState.postingDate,
    dueDate: formState.dueDate,
    status: formState.status,
    currency: formState.currency.trim() || 'PHP',
    exchangeRate: Number(formState.exchangeRate || 1),
    referenceNumber: formState.referenceNumber.trim() || null,
    memo: formState.memo.trim() || null,
    sourceType: formState.sourceType.trim() || null,
    sourceReference: formState.sourceReference.trim() || null,
    receivableAccountOverride: formState.receivableAccountOverride || null,
    notes: formState.notes.trim() || null,
    lines: formState.lines.map((line) => ({
      description: line.description.trim(),
      itemType: line.itemType,
      quantity: Number(line.quantity || 0),
      unitPrice: Number(line.unitPrice || 0),
      discountAmount: Number(line.discountAmount || 0),
      taxCode: line.taxCode || null,
      incomeAccount: line.incomeAccount,
      receivableAccountOverride: line.receivableAccountOverride || null,
    })),
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      const payload = normalizeFormPayload();
      if (editingInvoiceId) {
        await updateSalesInvoice(editingInvoiceId, payload);
      } else {
        await createSalesInvoice(payload);
      }
      setIsFormOpen(false);
      if (activeTab === 'invoice-detail') {
        await fetchInvoiceDetailRegister({
          search: invoiceDetailSubmittedSearch,
          page: invoiceDetailCurrentPage,
          nextFilters: invoiceDetailFilters,
          nextQuickFilters: invoiceDetailQuickFilters,
        });
      } else {
        await fetchInvoices({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
      }
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Unable to save invoice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteSalesInvoice(deleteTarget.id);
      setDeleteTarget(null);
      if (activeTab === 'invoice-detail') {
        await fetchInvoiceDetailRegister({
          search: invoiceDetailSubmittedSearch,
          page: invoiceDetailCurrentPage,
          nextFilters: invoiceDetailFilters,
          nextQuickFilters: invoiceDetailQuickFilters,
        });
      } else {
        await fetchInvoices({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete invoice.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmPost = async () => {
    if (!postTarget) return;
    setIsPosting(true);
    setError(null);
    try {
      await postSalesInvoice(postTarget.id);
      setPostTarget(null);
      if (activeTab === 'invoice-detail') {
        await fetchInvoiceDetailRegister({
          search: invoiceDetailSubmittedSearch,
          page: invoiceDetailCurrentPage,
          nextFilters: invoiceDetailFilters,
          nextQuickFilters: invoiceDetailQuickFilters,
        });
      } else {
        await fetchInvoices({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
      }
    } catch (postError) {
      setError(postError instanceof Error ? postError.message : 'Unable to post invoice.');
    } finally {
      setIsPosting(false);
    }
  };

  const renderInvoiceActions = (row: { id: string; invoiceNumber: string; status: string }) => {
    const isMutable = MUTABLE_STATUSES.has(row.status);
    const canPost = row.status === 'approved' || row.status === 'draft';

    return (
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail">
            <Eye className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => handleOpenEdit(row.id)} disabled={!isMutable} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40" title="Edit invoice">
            <Edit className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setPostTarget({ id: row.id, invoiceNumber: row.invoiceNumber })} disabled={!canPost} className="inline-flex items-center gap-1 rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40" title="Post invoice">
            <Send className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setDeleteTarget({ id: row.id, invoiceNumber: row.invoiceNumber })} disabled={!isMutable} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40" title="Delete invoice">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Operations / Sales & Receivables</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Sales Documents</h1>
          <p className="mt-1 text-base text-gray-600">Manage invoices, invoice detail records, and customer credit notes across the receivables document workflow.</p>
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

      {activeTab === 'credit-notes' ? <CreditNotesTab /> : activeTab === 'invoice-detail' ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-gray-900">{currentTab.label}</h2>
              <p className="text-sm text-gray-600">{currentTab.description}</p>
              <p className="text-sm text-gray-500">{invoiceDetailData?.totals.filteredRows ?? 0} matching rows</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={handleInvoiceDetailRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
                <RefreshCw className="h-4 w-4" />
                Refresh Detail
              </button>
            </div>
          </div>

          {invoiceDetailData?.section.metrics?.length ? <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{invoiceDetailData.section.metrics.map((metric) => <div key={metric.id}><MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} /></div>)}</div> : null}

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                <form onSubmit={handleInvoiceDetailSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder={invoiceDetailData?.section.searchPlaceholder || currentTab.searchPlaceholder} value={invoiceDetailSearchInput} onChange={(event) => setInvoiceDetailSearchInput(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                  </div>
                  <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700">
                    <Search className="h-4 w-4" />
                    Search
                  </button>
                </form>
                <button type="button" onClick={() => { if (!isInvoiceDetailFilterPanelOpen) setInvoiceDetailDraftFilters({ ...invoiceDetailFilters }); setIsInvoiceDetailFilterPanelOpen((previous) => !previous); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isInvoiceDetailFilterPanelOpen || invoiceDetailFilterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}>
                  <Filter className="h-4 w-4" />
                  Filters
                  {invoiceDetailFilterCount > 0 ? <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{invoiceDetailFilterCount}</span> : null}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(invoiceDetailData?.section.filters.quickFilters || []).map((filter) => (
                  <button key={filter.value} type="button" onClick={() => handleToggleInvoiceDetailQuickFilter(filter.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${invoiceDetailQuickFilters.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 p-5">
              {isInvoiceDetailFilterPanelOpen ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Filters</h4>
                      <p className="mt-1 text-sm text-gray-600">Select detail coverage values freely within the same group to widen results.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" onClick={() => { setInvoiceDetailDraftFilters({ statuses: [], coverage: [] }); setInvoiceDetailFilters({ statuses: [], coverage: [] }); setInvoiceDetailCurrentPage(1); setIsInvoiceDetailFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Clear all</button>
                      <button type="button" onClick={() => setIsInvoiceDetailFilterPanelOpen(false)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                      <button type="button" onClick={() => { setInvoiceDetailFilters({ ...invoiceDetailDraftFilters }); setInvoiceDetailCurrentPage(1); setIsInvoiceDetailFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</h5>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(invoiceDetailData?.section.filters.statuses || []).map((option) => {
                          const selected = invoiceDetailDraftFilters.statuses.includes(option.value);
                          return <button key={option.value} type="button" onClick={() => setInvoiceDetailDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{option.label}</button>;
                        })}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Coverage</h5>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(invoiceDetailData?.section.filters.coverage || []).map((option) => {
                          const selected = invoiceDetailDraftFilters.coverage.includes(option.value);
                          return <button key={option.value} type="button" onClick={() => setInvoiceDetailDraftFilters((previous) => ({ ...previous, coverage: toggleFilterValue(previous.coverage, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{option.label}</button>;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-gray-900">{invoiceDetailData?.section.table.title || currentTab.tableTitle}</h3>
                  <p className="text-sm text-gray-600">{invoiceDetailData?.section.table.description || currentTab.tableDescription}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <span>{invoiceDetailData?.totals.filteredRows ?? 0} matching rows</span>
                  <button type="button" onClick={handleInvoiceDetailExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!invoiceDetailData?.section.table.rows.length}>
                    <Download className="h-4 w-4" />
                    Download View
                  </button>
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
                              <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Tax Total' || column === 'Balance Due' ? 'text-right' : 'text-left'}`}>{column}</th>
                            ))}
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {(invoiceDetailData?.section.table.rows || []).length > 0 ? (invoiceDetailData?.section.table.rows || []).map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50">
                              {row.cells.map((cell, index) => renderCell(cell, index))}
                              {renderInvoiceActions(row)}
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={currentTab.columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">No invoice detail rows found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {invoiceDetailData?.pagination && invoiceDetailData.pagination.totalPages > 1 ? (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Page {invoiceDetailData.pagination.page} of {invoiceDetailData.pagination.totalPages}</p>
                      <div className="flex gap-2">
                        <button type="button" disabled={!invoiceDetailData.pagination.hasPrevPage} onClick={() => setInvoiceDetailCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button>
                        <button type="button" disabled={!invoiceDetailData.pagination.hasNextPage} onClick={() => setInvoiceDetailCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-gray-900">{currentTab.label}</h2>
              <p className="text-sm text-gray-600">{currentTab.description}</p>
              <p className="text-sm text-gray-500">{invoiceData?.totals.filteredRows ?? 0} matching rows</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
                <RefreshCw className="h-4 w-4" />
                Refresh List
              </button>
              <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
                <Plus className="h-4 w-4" />
                Create Invoice
              </button>
            </div>
          </div>

          {invoiceData?.section.metrics?.length ? <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{invoiceData.section.metrics.map((metric) => <div key={metric.id}><MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} /></div>)}</div> : null}

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
                {(invoiceData?.section.filters.quickFilters || []).map((filter) => (
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
                      <p className="mt-1 text-sm text-gray-600">Select as many filter values as needed, then apply them in one step.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" onClick={() => { setDraftFilters({ statuses: [], postingStatuses: [], customerIds: [] }); setFilters({ statuses: [], postingStatuses: [], customerIds: [] }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Clear all</button>
                      <button type="button" onClick={() => setIsFilterPanelOpen(false)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                      <button type="button" onClick={() => { setFilters({ ...draftFilters }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-6 md:grid-cols-3">
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</h5>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(invoiceData?.section.filters.statuses || []).map((option) => {
                          const selected = draftFilters.statuses.includes(option.value);
                          return <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{option.label}</button>;
                        })}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Posting Status</h5>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(invoiceData?.section.filters.postingStatuses || []).map((option) => {
                          const selected = draftFilters.postingStatuses.includes(option.value);
                          return <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, postingStatuses: toggleFilterValue(previous.postingStatuses, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{option.label}</button>;
                        })}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Customer</h5>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(invoiceData?.section.filters.customers || []).map((option) => {
                          const selected = draftFilters.customerIds.includes(option.value);
                          return <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, customerIds: toggleFilterValue(previous.customerIds, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{option.label}</button>;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-gray-900">{invoiceData?.section.table.title || currentTab.tableTitle}</h3>
                  <p className="text-sm text-gray-600">{invoiceData?.section.table.description || currentTab.tableDescription}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <span>{invoiceData?.totals.filteredRows ?? 0} matching rows</span>
                  <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!invoiceData?.section.table.rows.length}>
                    <Download className="h-4 w-4" />
                    Download View
                  </button>
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
                              <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Total' ? 'text-right' : 'text-left'}`}>{column}</th>
                            ))}
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {(invoiceData?.section.table.rows || []).length > 0 ? (invoiceData?.section.table.rows || []).map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50">
                              {row.cells.map((cell, index) => renderCell(cell, index))}
                              {renderInvoiceActions(row)}
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={currentTab.columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">No invoice rows found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {invoiceData?.pagination && invoiceData.pagination.totalPages > 1 ? (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Page {invoiceData.pagination.page} of {invoiceData.pagination.totalPages}</p>
                      <div className="flex gap-2">
                        <button type="button" disabled={!invoiceData.pagination.hasPrevPage} onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button>
                        <button type="button" disabled={!invoiceData.pagination.hasNextPage} onClick={() => setCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Invoice Detail" description="Review invoice header values, lines, system totals, and dependency status.">
        <div className="space-y-6">
          {isViewLoading ? <LoadingSkeleton /> : viewDetail ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['Invoice No.', viewDetail.invoiceNumber],
                  ['Customer', viewDetail.customerLabel || '-'],
                  ['Invoice Date', viewDetail.invoiceDateLabel],
                  ['Posting Date', viewDetail.postingDateLabel],
                  ['Due Date', viewDetail.dueDateLabel],
                  ['Status', viewDetail.statusLabel],
                  ['Posting Status', viewDetail.postingStatusLabel],
                  ['Reference No.', viewDetail.referenceNumber || '-'],
                  ['Source Type', viewDetail.sourceType || '-'],
                  ['Source Reference', viewDetail.sourceReference || '-'],
                  ['Receivable Override', viewDetail.receivableAccountOverrideLabel || '-'],
                  ['Posted Journal', viewDetail.postedJournalEntryId || '-'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {[
                  ['Subtotal', viewDetail.subtotalLabel],
                  ['Tax Total', viewDetail.taxTotalLabel],
                  ['Discount Total', viewDetail.discountTotalLabel],
                  ['Total', viewDetail.totalLabel],
                  ['Balance Due', viewDetail.balanceDueLabel],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-2 text-sm font-semibold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-5 py-4">
                  <h4 className="text-sm font-semibold text-gray-900">Invoice Lines</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Line', 'Description', 'Income Account', 'Tax Code', 'Qty', 'Unit Price', 'Line Total'].map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Qty' || column === 'Unit Price' || column === 'Line Total' ? 'text-right' : 'text-left'}`}>{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {viewDetail.lineItems.map((line) => (
                        <tr key={line.id}>
                          <td className="px-4 py-3 text-sm text-gray-600">{line.lineNumber}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{line.description}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{line.incomeAccountLabel || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{line.taxCodeLabel || '-'}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-600">{line.quantity}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(line.unitPrice)}</td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{line.lineTotalLabel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-5 py-4">
                  <h4 className="text-sm font-semibold text-gray-900">Support Documents</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Category', 'Document Date', 'Primary', 'Notes'].map((column) => (
                          <th key={column} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {viewDetail.documentLinks.length > 0 ? viewDetail.documentLinks.map((documentLink) => (
                        <tr key={documentLink.id}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{documentLink.documentCategoryLabel || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{documentLink.documentDateLabel}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{documentLink.isPrimary ? 'Yes' : 'No'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{documentLink.notes || '-'}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">No support documents linked.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-medium text-gray-900">Dependencies</p>
                <p className="mt-2">Line Items: {viewDetail.usageSummary.lineItemCount}</p>
                <p>Applied Payments: {viewDetail.usageSummary.appliedPaymentsCount}</p>
                <p>Applied Credit Notes: {viewDetail.usageSummary.appliedCreditNotesCount}</p>
                <p>Support Documents: {viewDetail.usageSummary.documentCount}</p>
                <p>Has Blocking Dependents: {viewDetail.usageSummary.hasDependents ? 'Yes' : 'No'}</p>
              </div>
            </>
          ) : <p className="text-sm text-gray-500">No details available.</p>}
          <div className="flex justify-end pt-4">
            <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Close</button>
          </div>
        </div>
      </SlideOver>

      <SlideOver isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingInvoiceId ? 'Edit Invoice' : 'Create Invoice'} description="Use guided selections for customer, tax, and account mappings. System totals remain read-only.">
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError ? <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{formError}</div> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Invoice Number">
              <Input value={formState.invoiceNumber} onChange={(value) => setFormState((previous) => ({ ...previous, invoiceNumber: value }))} placeholder="Leave blank to auto-generate" />
            </FormField>
            <FormField label="Customer" required>
              <Select value={formState.customer} onChange={(value) => setFormState((previous) => ({ ...previous, customer: value }))} options={customerOptions} />
            </FormField>
            <FormField label="Invoice Date" required>
              <Input type="date" value={formState.invoiceDate} onChange={(value) => setFormState((previous) => ({ ...previous, invoiceDate: value }))} required />
            </FormField>
            <FormField label="Posting Date" required>
              <Input type="date" value={formState.postingDate} onChange={(value) => setFormState((previous) => ({ ...previous, postingDate: value }))} required />
            </FormField>
            <FormField label="Due Date" required>
              <Input type="date" value={formState.dueDate} onChange={(value) => setFormState((previous) => ({ ...previous, dueDate: value }))} required />
            </FormField>
            <FormField label="Status" required>
              <Select value={formState.status} onChange={(value) => setFormState((previous) => ({ ...previous, status: value as 'draft' | 'approved' }))} options={[{ label: 'Draft', value: 'draft' }, { label: 'Approved', value: 'approved' }]} />
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
            <FormField label="Receivable Override">
              <Select value={formState.receivableAccountOverride} onChange={(value) => setFormState((previous) => ({ ...previous, receivableAccountOverride: value }))} options={accountOptions} />
            </FormField>
            <FormField label="Source Type">
              <Input value={formState.sourceType} onChange={(value) => setFormState((previous) => ({ ...previous, sourceType: value }))} />
            </FormField>
            <FormField label="Source Reference">
              <Input value={formState.sourceReference} onChange={(value) => setFormState((previous) => ({ ...previous, sourceReference: value }))} />
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Memo">
              <TextArea value={formState.memo} onChange={(value) => setFormState((previous) => ({ ...previous, memo: value }))} rows={3} />
            </FormField>
            <FormField label="Notes">
              <TextArea value={formState.notes} onChange={(value) => setFormState((previous) => ({ ...previous, notes: value }))} rows={3} />
            </FormField>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Invoice Lines</h4>
                <p className="mt-1 text-sm text-gray-600">Maintain revenue, tax, and optional receivable overrides per line.</p>
              </div>
              <button type="button" onClick={handleAddLine} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Plus className="h-4 w-4" />
                Add Line
              </button>
            </div>
            <div className="space-y-4 p-5">
              {formState.lines.map((line, index) => {
                const preview = invoicePreview.linePreviews[index];
                return (
                  <div key={line.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h5 className="text-sm font-semibold text-gray-900">Line {index + 1}</h5>
                      <button type="button" onClick={() => handleRemoveLine(line.id)} disabled={formState.lines.length === 1} className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40">Remove</button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <FormField label="Description" required>
                        <Input value={line.description} onChange={(value) => handleUpdateLine(line.id, 'description', value)} required />
                      </FormField>
                      <FormField label="Item Type" required>
                        <Select value={line.itemType} onChange={(value) => handleUpdateLine(line.id, 'itemType', value)} options={[{ label: 'Service', value: 'service' }, { label: 'Product', value: 'product' }, { label: 'Fee', value: 'fee' }, { label: 'Other', value: 'other' }]} />
                      </FormField>
                      <FormField label="Quantity" required>
                        <Input type="number" value={line.quantity} onChange={(value) => handleUpdateLine(line.id, 'quantity', value)} required />
                      </FormField>
                      <FormField label="Unit Price" required>
                        <Input type="number" value={line.unitPrice} onChange={(value) => handleUpdateLine(line.id, 'unitPrice', value)} required />
                      </FormField>
                      <FormField label="Discount Amount">
                        <Input type="number" value={line.discountAmount} onChange={(value) => handleUpdateLine(line.id, 'discountAmount', value)} />
                      </FormField>
                      <FormField label="Tax Code">
                        <Select value={line.taxCode} onChange={(value) => handleUpdateLine(line.id, 'taxCode', value)} options={taxCodeOptions} />
                      </FormField>
                      <FormField label="Income Account" required>
                        <Select value={line.incomeAccount} onChange={(value) => handleUpdateLine(line.id, 'incomeAccount', value)} options={accountOptions} />
                      </FormField>
                      <FormField label="Receivable Override">
                        <Select value={line.receivableAccountOverride} onChange={(value) => handleUpdateLine(line.id, 'receivableAccountOverride', value)} options={accountOptions} />
                      </FormField>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <FormField label="Line Subtotal">
                        <Input value={formatCurrency(preview?.lineSubtotal || 0)} onChange={() => undefined} disabled />
                      </FormField>
                      <FormField label="Line Tax">
                        <Input value={formatCurrency(preview?.lineTax || 0)} onChange={() => undefined} disabled />
                      </FormField>
                      <FormField label="Line Total">
                        <Input value={formatCurrency(preview?.lineTotal || 0)} onChange={() => undefined} disabled />
                      </FormField>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <FormField label="Subtotal">
              <Input value={formatCurrency(invoicePreview.subtotal)} onChange={() => undefined} disabled />
            </FormField>
            <FormField label="Tax Total">
              <Input value={formatCurrency(invoicePreview.taxTotal)} onChange={() => undefined} disabled />
            </FormField>
            <FormField label="Discount Total">
              <Input value={formatCurrency(invoicePreview.discountTotal)} onChange={() => undefined} disabled />
            </FormField>
            <FormField label="Total">
              <Input value={formatCurrency(invoicePreview.total)} onChange={() => undefined} disabled />
            </FormField>
            <FormField label="Balance Due">
              <Input value={formatCurrency(invoicePreview.total)} onChange={() => undefined} disabled />
            </FormField>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} disabled={isSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>{isSubmitting ? 'Saving...' : editingInvoiceId ? 'Save Changes' : 'Create Invoice'}</button>
          </div>
        </form>
      </SlideOver>

      <SlideOver isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete Invoice" description="Delete this mutable invoice after dependency validation completes." width="max-w-lg">
        <div className="space-y-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Delete invoice {deleteTarget?.invoiceNumber}?</p>
            <p className="mt-1">Draft and approved invoices can be deleted only when they do not have posted dependents.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">{isDeleting ? 'Deleting...' : 'Delete Invoice'}</button>
          </div>
        </div>
      </SlideOver>

      <SlideOver isOpen={Boolean(postTarget)} onClose={() => setPostTarget(null)} title="Post Invoice" description="Posting creates the journal entry and locks direct edits on the invoice." width="max-w-lg">
        <div className="space-y-6">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
            <p className="font-medium">Post invoice {postTarget?.invoiceNumber}?</p>
            <p className="mt-1">Make sure the invoice lines, tax mapping, and receivable account are complete before posting.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setPostTarget(null)} disabled={isPosting} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleConfirmPost} disabled={isPosting} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">{isPosting ? 'Posting...' : 'Post Invoice'}</button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
