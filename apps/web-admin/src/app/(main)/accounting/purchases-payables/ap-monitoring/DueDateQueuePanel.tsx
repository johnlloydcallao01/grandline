'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  SendHorizonal,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import {
  createDueDateQueueBill,
  deleteDueDateQueueBill,
  getDueDateQueue,
  getDueDateQueueBillDetail,
  postDueDateQueueBill,
  updateDueDateQueueBill,
  type DueDateQueueRegisterResponse,
} from './actions';
import type { BillDetail, BillMutationInput } from '../purchase-documents/actions';

type DueDateQueueFilterState = {
  statuses: string[];
  vendorIds: string[];
  dueStates: string[];
};

type BillLineFormState = {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  taxCodeId: string;
  accountType: 'expense' | 'asset';
  accountId: string;
  payableAccountOverrideId: string;
};

type BillFormState = {
  billNumber: string;
  vendor: string;
  billDate: string;
  postingDate: string;
  dueDate: string;
  status: 'draft' | 'approved';
  currency: string;
  exchangeRate: string;
  referenceNumber: string;
  memo: string;
  payableAccountOverride: string;
  notes: string;
  lines: BillLineFormState[];
};

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') {
    return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  }
  if (variant === 'ghost') {
    return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  }
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
}

function getMetricTone(trend: 'up' | 'down' | 'neutral') {
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

function formatCurrency(value: number | null | undefined, currency = 'PHP') {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function roundCurrency(value: number) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function toDateInputValue(value: string | null | undefined) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function createLineId() {
  return Math.random().toString(36).slice(2, 10);
}

function createEmptyLine(): BillLineFormState {
  return {
    id: createLineId(),
    description: '',
    quantity: '1',
    unitPrice: '0',
    taxCodeId: '',
    accountType: 'expense',
    accountId: '',
    payableAccountOverrideId: '',
  };
}

function createEmptyForm(): BillFormState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    billNumber: '',
    vendor: '',
    billDate: today,
    postingDate: today,
    dueDate: today,
    status: 'draft',
    currency: 'PHP',
    exchangeRate: '1',
    referenceNumber: '',
    memo: '',
    payableAccountOverride: '',
    notes: '',
    lines: [createEmptyLine()],
  };
}

function calculateLinePreview(
  line: BillLineFormState,
  taxCodes: DueDateQueueRegisterResponse['referenceData']['taxCodes'],
) {
  const quantity = Number(line.quantity || 0);
  const unitPrice = Number(line.unitPrice || 0);
  const grossAmount = roundCurrency(quantity * unitPrice);
  const taxCode = taxCodes.find((item) => String(item.id) === line.taxCodeId);
  const rate = Number(taxCode?.rate || 0);
  const calculationMethod = taxCode?.calculationMethod || 'exclusive';
  const lineTax =
    rate <= 0 || grossAmount <= 0
      ? 0
      : calculationMethod === 'inclusive'
        ? roundCurrency(grossAmount - grossAmount / (1 + rate / 100))
        : roundCurrency(grossAmount * (rate / 100));
  const lineSubtotal = calculationMethod === 'inclusive' ? roundCurrency(grossAmount - lineTax) : grossAmount;
  const lineTotal = calculationMethod === 'inclusive' ? grossAmount : roundCurrency(lineSubtotal + lineTax);

  return {
    quantity,
    unitPrice,
    lineSubtotal,
    lineTax,
    lineTotal,
  };
}

function calculateBillPreview(
  formState: BillFormState,
  taxCodes: DueDateQueueRegisterResponse['referenceData']['taxCodes'],
) {
  const subtotal = roundCurrency(
    formState.lines.reduce((sum, line) => sum + calculateLinePreview(line, taxCodes).lineSubtotal, 0),
  );
  const taxTotal = roundCurrency(
    formState.lines.reduce((sum, line) => sum + calculateLinePreview(line, taxCodes).lineTax, 0),
  );
  const total = roundCurrency(
    formState.lines.reduce((sum, line) => sum + calculateLinePreview(line, taxCodes).lineTotal, 0),
  );

  return {
    subtotal,
    taxTotal,
    total,
    balanceDue: total,
  };
}

function toMutationInput(formState: BillFormState): BillMutationInput {
  return {
    billNumber: formState.billNumber.trim() || null,
    vendor: formState.vendor,
    billDate: formState.billDate,
    postingDate: formState.postingDate,
    dueDate: formState.dueDate,
    status: formState.status,
    currency: formState.currency.trim() || 'PHP',
    exchangeRate: Number(formState.exchangeRate || 1),
    referenceNumber: formState.referenceNumber.trim() || null,
    memo: formState.memo.trim() || null,
    payableAccountOverride: formState.payableAccountOverride || null,
    notes: formState.notes.trim() || null,
    lines: formState.lines.map((line) => ({
      description: line.description.trim(),
      quantity: Number(line.quantity || 0),
      unitPrice: Number(line.unitPrice || 0),
      taxCode: line.taxCodeId || null,
      accountType: line.accountType,
      accountId: line.accountId,
      payableAccountOverride: line.payableAccountOverrideId || null,
    })),
  };
}

function buildFormFromDetail(detail: BillDetail): BillFormState {
  return {
    billNumber: detail.billNumber,
    vendor: detail.vendorId,
    billDate: toDateInputValue(detail.billDate),
    postingDate: toDateInputValue(detail.postingDate),
    dueDate: toDateInputValue(detail.dueDate),
    status: detail.status === 'approved' ? 'approved' : 'draft',
    currency: detail.currency || 'PHP',
    exchangeRate: String(detail.exchangeRate || 1),
    referenceNumber: detail.referenceNumber || '',
    memo: detail.memo || '',
    payableAccountOverride: detail.payableAccountOverrideId || '',
    notes: detail.notes || '',
    lines: detail.lineItems.length
      ? detail.lineItems.map((line) => ({
        id: createLineId(),
        description: line.description || '',
        quantity: String(line.quantity || 0),
        unitPrice: String(line.unitPrice || 0),
        taxCodeId: line.taxCodeId || '',
        accountType: line.accountType,
        accountId: line.accountId || '',
        payableAccountOverrideId: line.payableAccountOverrideId || '',
      }))
      : [createEmptyLine()],
  };
}

function FormField({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
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
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}) {
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
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
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

function MetricCard({
  label,
  value,
  change,
  trend = 'neutral',
}: {
  label: string;
  value: string | number;
  change: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
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
                {Array.from({ length: columnCount + 1 }).map((_, index) => (
                  <th key={index} className="px-4 py-3">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
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

function SlideOver({
  isOpen,
  onClose,
  title,
  description,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
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
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ease-in-out ${animate ? 'bg-black/50' : 'bg-transparent'}`}
      onClick={onClose}
    >
      <div
        className={`flex h-full w-full max-w-5xl flex-col bg-white shadow-xl transition-all duration-300 ease-in-out ${animate ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description ? <p className="mt-0.5 text-sm text-gray-500">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

function renderCell(
  cell:
    | string
    | {
      text: string;
      tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red';
      emphasis?: boolean;
      align?: 'left' | 'right' | 'center';
    },
  index: number,
) {
  if (typeof cell === 'string') {
    return (
      <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
        {cell}
      </td>
    );
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
    <td
      key={index}
      className={`whitespace-nowrap px-4 py-3 text-sm ${cell.emphasis ? 'font-semibold text-gray-900' : 'text-gray-600'} ${alignClass}`}
    >
      {cell.text}
    </td>
  );
}

function BillDetailContent({ detail }: { detail: BillDetail }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ['Bill No.', detail.billNumber],
          ['Vendor', detail.vendorLabel || '-'],
          ['Bill Date', detail.billDateLabel],
          ['Posting Date', detail.postingDateLabel],
          ['Due Date', detail.dueDateLabel],
          ['Status', detail.statusLabel],
          ['Posting Status', detail.postingStatusLabel],
          ['Reference No.', detail.referenceNumber || '-'],
          ['Payable Override', detail.payableAccountOverrideLabel || '-'],
          ['Posted Journal', detail.postedJournalEntryId || '-'],
          ['Vendor Currency', detail.vendorCurrency || '-'],
          ['Vendor Terms', detail.vendorPaymentTerms || '-'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
            <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          ['Subtotal', detail.subtotalLabel],
          ['Tax Total', detail.taxTotalLabel],
          ['Total', detail.totalLabel],
          ['Balance Due', detail.balanceDueLabel],
          ['Exchange Rate', String(detail.exchangeRate || 1)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Line Items</h4>
            <p className="mt-1 text-sm text-gray-600">Expense or asset allocations recorded against this bill.</p>
          </div>
          <div className="text-sm text-gray-500">{detail.usageSummary.lineItemCount} line(s)</div>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Line', 'Description', 'Account', 'Tax Code', 'Total'].map((column) => (
                    <th
                      key={column}
                      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Total' ? 'text-right' : 'text-left'}`}
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {detail.lineItems.length > 0 ? (
                  detail.lineItems.map((line) => (
                    <tr key={line.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{line.lineNumber}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{line.description}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{line.accountLabel}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{line.taxCodeLabel || '-'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-gray-900">{line.lineTotalLabel}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                      No line items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export function DueDateQueuePanel({
  tab,
}: {
  tab: {
    label: string;
    description: string;
    searchPlaceholder: string;
    columns: string[];
    tableTitle: string;
    tableDescription: string;
  };
}) {
  const [data, setData] = useState<DueDateQueueRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<DueDateQueueFilterState>({ statuses: [], vendorIds: [], dueStates: [] });
  const [draftFilters, setDraftFilters] = useState<DueDateQueueFilterState>({ statuses: [], vendorIds: [], dueStates: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const [viewDetail, setViewDetail] = useState<BillDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);

  const [createForm, setCreateForm] = useState<BillFormState>(createEmptyForm());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editForm, setEditForm] = useState<BillFormState>(createEmptyForm());
  const [editId, setEditId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLabel, setDeleteLabel] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [postingId, setPostingId] = useState<string | null>(null);

  const filterCount = filters.statuses.length + filters.vendorIds.length + filters.dueStates.length;

  const fetchRegister = useCallback(async ({
    search,
    page,
    nextFilters,
    nextQuickFilters,
  }: {
    search: string;
    page: number;
    nextFilters: DueDateQueueFilterState;
    nextQuickFilters: string[];
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getDueDateQueue({
        search,
        page,
        statuses: nextFilters.statuses,
        vendorIds: nextFilters.vendorIds,
        dueStates: nextFilters.dueStates,
        quickFilters: nextQuickFilters,
      });
      setData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load due date queue.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRegister({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  }, [currentPage, fetchRegister, filters, quickFilters, submittedSearch]);

  const handleRefresh = () => {
    void fetchRegister({
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
    void fetchRegister({
      search: searchInput,
      page: 1,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  };

  const handleExport = () => {
    const rows = data?.rows || [];
    if (!rows.length) return;
    const headers = ['Bill No.', 'Vendor', 'Bill Date', 'Due Date', 'Balance Due', 'Status', 'Due State'];
    const csvRows = rows.map((row) => [
      row.billNumber,
      row.vendorLabel,
      row.billDateLabel,
      row.dueDateLabel,
      row.balanceDueLabel,
      row.statusLabel,
      row.dueStateLabel,
    ]);
    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'due-date-queue.csv';
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
      const detail = await getDueDateQueueBillDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load bill detail.');
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
      await createDueDateQueueBill(toMutationInput(createForm));
      setIsCreateOpen(false);
      handleRefresh();
    } catch (submissionError) {
      setCreateError(submissionError instanceof Error ? submissionError.message : 'Unable to create bill.');
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
      const detail = await getDueDateQueueBillDetail(id);
      setEditForm(buildFormFromDetail(detail));
    } catch (detailError) {
      setEditError(detailError instanceof Error ? detailError.message : 'Unable to load bill detail.');
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
      await updateDueDateQueueBill(editId, toMutationInput(editForm));
      setIsEditOpen(false);
      setEditId(null);
      handleRefresh();
    } catch (submissionError) {
      setEditError(submissionError instanceof Error ? submissionError.message : 'Unable to update bill.');
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
      await deleteDueDateQueueBill(deleteId);
      setIsDeleteOpen(false);
      setDeleteId(null);
      setDeleteLabel('');
      handleRefresh();
    } catch (deletionError) {
      setDeleteError(deletionError instanceof Error ? deletionError.message : 'Unable to delete bill.');
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  const handlePost = async (id: string) => {
    setPostingId(id);
    setError(null);
    try {
      await postDueDateQueueBill(id);
      handleRefresh();
    } catch (postingError) {
      setError(postingError instanceof Error ? postingError.message : 'Unable to post bill.');
    } finally {
      setPostingId(null);
    }
  };

  const mutableBillIds = useMemo(() => new Set(data?.flags.mutableBillIds || []), [data?.flags.mutableBillIds]);
  const currentRows = data?.rows || [];
  const referenceData = data?.referenceData;
  const createPreview = useMemo(
    () => calculateBillPreview(createForm, referenceData?.taxCodes || []),
    [createForm, referenceData?.taxCodes],
  );
  const editPreview = useMemo(
    () => calculateBillPreview(editForm, referenceData?.taxCodes || []),
    [editForm, referenceData?.taxCodes],
  );

  const vendorOptions = [{ label: 'Select a vendor', value: '' }].concat(
    (referenceData?.vendors || []).map((vendor) => ({
      label: `${vendor.vendorCode ? `${vendor.vendorCode} - ` : ''}${vendor.displayName || `Vendor ${vendor.id}`}`,
      value: String(vendor.id),
    })),
  );
  const accountOptions = [{ label: 'Select an account', value: '' }].concat(
    (referenceData?.chartAccounts || []).map((account) => ({
      label: `${account.code ? `${account.code} - ` : ''}${account.name || 'Unnamed account'}`,
      value: String(account.id),
    })),
  );
  const taxCodeOptions = [{ label: 'No tax code', value: '' }].concat(
    (referenceData?.taxCodes || []).map((taxCode) => ({
      label: `${taxCode.code ? `${taxCode.code} - ` : ''}${taxCode.name || 'Unnamed tax code'}`,
      value: String(taxCode.id),
    })),
  );

  const renderBillForm = (
    formState: BillFormState,
    setFormState: React.Dispatch<React.SetStateAction<BillFormState>>,
    preview: { subtotal: number; taxTotal: number; total: number; balanceDue: number },
    submitLabel: string,
    isSubmitting: boolean,
    onCancel: () => void,
    errorMessage: string | null,
    isDisabled = false,
    onSubmit?: (event: React.FormEvent) => void,
  ) => (
    <form onSubmit={onSubmit} className="space-y-6">
      {errorMessage ? (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Bill Number">
          <Input
            value={formState.billNumber}
            onChange={(value) => setFormState((previous) => ({ ...previous, billNumber: value }))}
            placeholder="Leave blank to auto-generate"
            disabled={isDisabled}
          />
        </FormField>
        <FormField label="Vendor" required>
          <Select
            value={formState.vendor}
            onChange={(value) => setFormState((previous) => ({ ...previous, vendor: value }))}
            options={vendorOptions}
            disabled={isDisabled}
          />
        </FormField>
        <FormField label="Bill Date" required>
          <Input
            type="date"
            value={formState.billDate}
            onChange={(value) => setFormState((previous) => ({ ...previous, billDate: value }))}
            required
            disabled={isDisabled}
          />
        </FormField>
        <FormField label="Posting Date" required>
          <Input
            type="date"
            value={formState.postingDate}
            onChange={(value) => setFormState((previous) => ({ ...previous, postingDate: value }))}
            required
            disabled={isDisabled}
          />
        </FormField>
        <FormField label="Due Date" required>
          <Input
            type="date"
            value={formState.dueDate}
            onChange={(value) => setFormState((previous) => ({ ...previous, dueDate: value }))}
            required
            disabled={isDisabled}
          />
        </FormField>
        <FormField label="Status" required>
          <Select
            value={formState.status}
            onChange={(value) =>
              setFormState((previous) => ({ ...previous, status: value === 'approved' ? 'approved' : 'draft' }))
            }
            options={[
              { label: 'Draft', value: 'draft' },
              { label: 'Approved', value: 'approved' },
            ]}
            disabled={isDisabled}
          />
        </FormField>
        <FormField label="Currency" required>
          <Input
            value={formState.currency}
            onChange={(value) => setFormState((previous) => ({ ...previous, currency: value }))}
            required
            disabled={isDisabled}
          />
        </FormField>
        <FormField label="Exchange Rate" required>
          <Input
            type="number"
            value={formState.exchangeRate}
            onChange={(value) => setFormState((previous) => ({ ...previous, exchangeRate: value }))}
            required
            disabled={isDisabled}
          />
        </FormField>
        <FormField label="Reference Number">
          <Input
            value={formState.referenceNumber}
            onChange={(value) => setFormState((previous) => ({ ...previous, referenceNumber: value }))}
            disabled={isDisabled}
          />
        </FormField>
        <FormField label="Payable Account Override">
          <Select
            value={formState.payableAccountOverride}
            onChange={(value) => setFormState((previous) => ({ ...previous, payableAccountOverride: value }))}
            options={accountOptions}
            disabled={isDisabled}
          />
        </FormField>
      </div>

      <FormField label="Memo">
        <TextArea
          value={formState.memo}
          onChange={(value) => setFormState((previous) => ({ ...previous, memo: value }))}
          rows={2}
        />
      </FormField>

      <FormField label="Notes">
        <TextArea
          value={formState.notes}
          onChange={(value) => setFormState((previous) => ({ ...previous, notes: value }))}
          rows={3}
        />
      </FormField>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Line Items</h4>
            <p className="mt-1 text-sm text-gray-600">Add at least one expense or asset line with optional tax mapping.</p>
          </div>
          <button
            type="button"
            onClick={() =>
              setFormState((previous) => ({ ...previous, lines: [...previous.lines, createEmptyLine()] }))
            }
            disabled={isDisabled}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add Line
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {formState.lines.map((line, index) => {
            const linePreview = calculateLinePreview(line, referenceData?.taxCodes || []);

            return (
              <div key={line.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-semibold text-gray-900">Line {index + 1}</h5>
                  <button
                    type="button"
                    onClick={() =>
                      setFormState((previous) => ({
                        ...previous,
                        lines:
                          previous.lines.length === 1
                            ? [createEmptyLine()]
                            : previous.lines.filter((item) => item.id !== line.id),
                      }))
                    }
                    disabled={isDisabled}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Remove line"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <FormField label="Description" required>
                    <Input
                      value={line.description}
                      onChange={(value) =>
                        setFormState((previous) => ({
                          ...previous,
                          lines: previous.lines.map((item) => (item.id === line.id ? { ...item, description: value } : item)),
                        }))
                      }
                      required
                      disabled={isDisabled}
                    />
                  </FormField>
                  <FormField label="Account Type" required>
                    <Select
                      value={line.accountType}
                      onChange={(value) =>
                        setFormState((previous) => ({
                          ...previous,
                          lines: previous.lines.map((item) =>
                            item.id === line.id
                              ? {
                                ...item,
                                accountType: value === 'asset' ? 'asset' : 'expense',
                                accountId: '',
                              }
                              : item,
                          ),
                        }))
                      }
                      options={[
                        { label: 'Expense', value: 'expense' },
                        { label: 'Asset', value: 'asset' },
                      ]}
                      disabled={isDisabled}
                    />
                  </FormField>
                  <FormField label="Quantity" required>
                    <Input
                      type="number"
                      value={line.quantity}
                      onChange={(value) =>
                        setFormState((previous) => ({
                          ...previous,
                          lines: previous.lines.map((item) => (item.id === line.id ? { ...item, quantity: value } : item)),
                        }))
                      }
                      required
                      disabled={isDisabled}
                    />
                  </FormField>
                  <FormField label="Unit Price" required>
                    <Input
                      type="number"
                      value={line.unitPrice}
                      onChange={(value) =>
                        setFormState((previous) => ({
                          ...previous,
                          lines: previous.lines.map((item) => (item.id === line.id ? { ...item, unitPrice: value } : item)),
                        }))
                      }
                      required
                      disabled={isDisabled}
                    />
                  </FormField>
                  <FormField label="Account" required>
                    <Select
                      value={line.accountId}
                      onChange={(value) =>
                        setFormState((previous) => ({
                          ...previous,
                          lines: previous.lines.map((item) => (item.id === line.id ? { ...item, accountId: value } : item)),
                        }))
                      }
                      options={accountOptions}
                      disabled={isDisabled}
                    />
                  </FormField>
                  <FormField label="Tax Code">
                    <Select
                      value={line.taxCodeId}
                      onChange={(value) =>
                        setFormState((previous) => ({
                          ...previous,
                          lines: previous.lines.map((item) => (item.id === line.id ? { ...item, taxCodeId: value } : item)),
                        }))
                      }
                      options={taxCodeOptions}
                      disabled={isDisabled}
                    />
                  </FormField>
                  <FormField label="Line Payable Override">
                    <Select
                      value={line.payableAccountOverrideId}
                      onChange={(value) =>
                        setFormState((previous) => ({
                          ...previous,
                          lines: previous.lines.map((item) =>
                            item.id === line.id ? { ...item, payableAccountOverrideId: value } : item,
                          ),
                        }))
                      }
                      options={accountOptions}
                      disabled={isDisabled}
                    />
                  </FormField>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {[
                    ['Line Subtotal', formatCurrency(linePreview.lineSubtotal, formState.currency || 'PHP')],
                    ['Line Tax', formatCurrency(linePreview.lineTax, formState.currency || 'PHP')],
                    ['Line Total', formatCurrency(linePreview.lineTotal, formState.currency || 'PHP')],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-gray-200 bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Subtotal', formatCurrency(preview.subtotal, formState.currency || 'PHP')],
          ['Tax Total', formatCurrency(preview.taxTotal, formState.currency || 'PHP')],
          ['Total', formatCurrency(preview.total, formState.currency || 'PHP')],
          ['Balance Due', formatCurrency(preview.balanceDue, formState.currency || 'PHP')],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isDisabled}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}
        >
          {isSubmitting ? `${submitLabel}...` : submitLabel}
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">{data?.meta.label || tab.label}</h2>
          <p className="text-sm text-gray-600">{data?.meta.description || tab.description}</p>
          <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleOpenCreate}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}
          >
            <Plus className="h-4 w-4" />
            Create Bill
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Queue
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={!currentRows.length}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Download View
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
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"
              >
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
              {filterCount > 0 ? (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                  {filterCount}
                </span>
              ) : null}
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
                      setDraftFilters({ statuses: [], vendorIds: [], dueStates: [] });
                      setFilters({ statuses: [], vendorIds: [], dueStates: [] });
                      setCurrentPage(1);
                      setIsFilterPanelOpen(false);
                    }}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFilterPanelOpen(false)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
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
                          onClick={() =>
                            setDraftFilters((previous) => ({
                              ...previous,
                              statuses: toggleFilterValue(previous.statuses, option.value),
                            }))
                          }
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Vendor</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.vendors || []).map((option) => {
                      const selected = draftFilters.vendorIds.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setDraftFilters((previous) => ({
                              ...previous,
                              vendorIds: toggleFilterValue(previous.vendorIds, option.value),
                            }))
                          }
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Due State</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.dueStates || []).map((option) => {
                      const selected = draftFilters.dueStates.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setDraftFilters((previous) => ({
                              ...previous,
                              dueStates: toggleFilterValue(previous.dueStates, option.value),
                            }))
                          }
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
                          <th
                            key={column}
                            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Balance Due' ? 'text-right' : 'text-left'}`}
                          >
                            {column}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {currentRows.length > 0 ? (
                        currentRows.map((row) => {
                          const isMutable = mutableBillIds.has(row.id);
                          return (
                            <tr key={row.id} className="hover:bg-gray-50">
                              {row.cells.map((cell, index) => renderCell(cell, index))}
                              <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleView(row.id)}
                                    className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                    title="View detail"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(row.id)}
                                    disabled={!isMutable}
                                    className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                                    title={isMutable ? 'Edit' : 'Only draft or approved bills can be edited'}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDelete(row.id, row.billNumber)}
                                    disabled={!isMutable}
                                    className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                                    title={isMutable ? 'Delete' : 'Only draft or approved bills can be deleted'}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handlePost(row.id)}
                                    disabled={!isMutable || postingId === row.id}
                                    className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    title={isMutable ? 'Post bill' : 'Only draft or approved bills can be posted'}
                                  >
                                    <SendHorizonal className="h-3.5 w-3.5" />
                                    {postingId === row.id ? 'Posting...' : 'Post'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={tab.columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">
                            No due date queue rows found.
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
                    <button
                      type="button"
                      disabled={!data.pagination.hasPrevPage}
                      onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={!data.pagination.hasNextPage}
                      onClick={() => setCurrentPage((previous) => previous + 1)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <SlideOver
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Bill Detail"
        description="Review bill header values, lines, totals, and dependency status from the due date queue."
      >
        <div className="space-y-6">
          {isViewLoading ? <LoadingSkeleton /> : viewDetail ? <BillDetailContent detail={viewDetail} /> : null}
        </div>
      </SlideOver>

      <SlideOver
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Bill"
        description="Create a bill directly from the due date queue using the same guided document workflow."
      >
        {renderBillForm(
          createForm,
          setCreateForm,
          createPreview,
          'Create Bill',
          isCreateSubmitting,
          () => setIsCreateOpen(false),
          createError,
          false,
          handleCreateSubmit,
        )}
      </SlideOver>

      <SlideOver
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Bill"
        description="Update the bill header, due date, and line details while the bill remains mutable."
      >
        {isEditLoading ? (
          <LoadingSkeleton />
        ) : (
          renderBillForm(
            editForm,
            setEditForm,
            editPreview,
            'Save Changes',
            isEditSubmitting,
            () => setIsEditOpen(false),
            editError,
            false,
            handleEditSubmit,
          )
        )}
      </SlideOver>

      <SlideOver
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Bill"
        description="Remove this bill if it has no blocking dependencies."
      >
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
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleteSubmitting}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleteSubmitting}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleteSubmitting ? 'Deleting...' : 'Delete Bill'}
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
