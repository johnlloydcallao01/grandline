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
  createBill,
  createVendorCredit,
  deleteBill,
  deleteVendorCredit,
  getBillDetail,
  getBillDetailRegister,
  getBills,
  getVendorCreditDetail,
  getVendorCredits,
  postBill,
  postVendorCredit,
  updateBill,
  updateVendorCredit,
  type BillDetail,
  type BillDetailRegisterResponse,
  type BillMutationInput,
  type BillsCell,
  type BillsMetric,
  type BillsRegisterResponse,
  type VendorCreditDetail,
  type VendorCreditMutationInput,
  type VendorCreditRegisterResponse,
} from './actions';

type TabId = 'bills' | 'bill-detail' | 'vendor-credits';
type BillsFilterState = { statuses: string[]; vendorIds: string[] };
type BillDetailFilterState = { statuses: string[]; vendorIds: string[]; coverageStates: string[] };
type VendorCreditFilterState = { statuses: string[]; vendorIds: string[]; balanceStates: string[] };
type StaticTab = {
  id: never;
  label: string;
  description: string;
  searchPlaceholder: string;
  columns: string[];
  tableTitle: string;
  tableDescription: string;
  metrics: BillsMetric[];
  rows: Array<{ id: string; cells: BillsCell[] }>;
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

type VendorCreditApplicationFormState = {
  id: string;
  bill: string;
  amountApplied: string;
};

type VendorCreditFormState = {
  vendorCreditNumber: string;
  vendor: string;
  creditDate: string;
  postingDate: string;
  status: 'draft' | 'approved';
  currency: string;
  subtotal: string;
  taxTotal: string;
  sourceBill: string;
  adjustmentAccount: string;
  reason: string;
  notes: string;
  applications: VendorCreditApplicationFormState[];
};

const TABS = [
  {
    id: 'bills' as TabId,
    label: 'Bills',
    description: 'Create, review, and post vendor bills with due dates, totals, balances, and status tracking.',
    searchPlaceholder: 'Search bill no., vendor, reference no., memo, or due date',
    columns: ['Bill No.', 'Bill Date', 'Vendor', 'Due Date', 'Total', 'Status'],
    tableTitle: 'Vendor Bill Register',
    tableDescription: 'Primary bill register based on the bill document collection and payable status fields.',
  },
  {
    id: 'bill-detail' as TabId,
    label: 'Bill Detail',
    description: 'Inspect bill headers, normalized line items, tax totals, linked documents, and journal references.',
    searchPlaceholder: 'Search bill no., vendor, line description, tax code, or journal ref',
    columns: ['Bill No.', 'Vendor', 'Line Items', 'Tax Total', 'Balance Due', 'Status'],
    tableTitle: 'Bill Detail Coverage',
    tableDescription: 'Detail-oriented view of line totals, tax totals, document support, and journal linkage for posted and draft bills.',
  },
  {
    id: 'vendor-credits' as TabId,
    label: 'Vendor Credits',
    description: 'Manage vendor credits that reduce payables through source bills, applications, and remaining balances.',
    searchPlaceholder: 'Search credit no., vendor, source bill, reason, or posting date',
    columns: ['Credit No.', 'Credit Date', 'Vendor', 'Source Bill', 'Remaining', 'Status'],
    tableTitle: 'Vendor Credit Register',
    tableDescription: 'Vendor credit records with source-bill references, totals, application progress, and remaining amounts.',
  },
];

const STATIC_TABS: StaticTab[] = [];

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') {
    return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  }
  if (variant === 'ghost') {
    return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  }
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
}

function getMetricTone(trend: BillsMetric['trend']) {
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

function createEmptyVendorCreditApplication(): VendorCreditApplicationFormState {
  return {
    id: createLineId(),
    bill: '',
    amountApplied: '0',
  };
}

function createEmptyVendorCreditForm(): VendorCreditFormState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    vendorCreditNumber: '',
    vendor: '',
    creditDate: today,
    postingDate: today,
    status: 'draft',
    currency: 'PHP',
    subtotal: '0',
    taxTotal: '0',
    sourceBill: '',
    adjustmentAccount: '',
    reason: '',
    notes: '',
    applications: [createEmptyVendorCreditApplication()],
  };
}

function calculateVendorCreditPreview(formState: VendorCreditFormState) {
  const subtotal = roundCurrency(Number(formState.subtotal || 0));
  const taxTotal = roundCurrency(Number(formState.taxTotal || 0));
  const total = roundCurrency(subtotal + taxTotal);
  const appliedAmount = roundCurrency(
    formState.applications.reduce((sum, application) => sum + Number(application.amountApplied || 0), 0),
  );
  const remainingAmount = roundCurrency(Math.max(0, total - appliedAmount));

  return {
    subtotal,
    taxTotal,
    total,
    appliedAmount,
    remainingAmount,
  };
}

function toVendorCreditMutationInput(formState: VendorCreditFormState): VendorCreditMutationInput {
  return {
    vendorCreditNumber: formState.vendorCreditNumber.trim() || null,
    vendor: formState.vendor,
    creditDate: formState.creditDate,
    postingDate: formState.postingDate,
    status: formState.status,
    currency: formState.currency.trim() || 'PHP',
    subtotal: Number(formState.subtotal || 0),
    taxTotal: Number(formState.taxTotal || 0),
    sourceBill: formState.sourceBill || null,
    adjustmentAccount: formState.adjustmentAccount,
    reason: formState.reason.trim() || null,
    notes: formState.notes.trim() || null,
    applications: formState.applications
      .filter((application) => application.bill && Number(application.amountApplied || 0) > 0)
      .map((application) => ({
        bill: application.bill,
        amountApplied: Number(application.amountApplied || 0),
      })),
  };
}

function buildVendorCreditFormFromDetail(detail: VendorCreditDetail): VendorCreditFormState {
  return {
    vendorCreditNumber: detail.vendorCreditNumber,
    vendor: detail.vendorId,
    creditDate: toDateInputValue(detail.creditDate),
    postingDate: toDateInputValue(detail.postingDate),
    status: detail.status === 'approved' ? 'approved' : 'draft',
    currency: detail.currency || 'PHP',
    subtotal: String(detail.subtotal || 0),
    taxTotal: String(detail.taxTotal || 0),
    sourceBill: detail.sourceBillId || '',
    adjustmentAccount: detail.adjustmentAccountId || '',
    reason: detail.reason || '',
    notes: detail.notes || '',
    applications: detail.applications.length
      ? detail.applications.map((application) => ({
          id: createLineId(),
          bill: application.billId || '',
          amountApplied: String(application.amountApplied || 0),
        }))
      : [createEmptyVendorCreditApplication()],
  };
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
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ease-in-out ${animate ? 'bg-black/50' : 'bg-transparent'}`} onClick={onClose}>
      <div className={`flex w-full max-w-5xl flex-col bg-white shadow-xl transition-all duration-300 ease-in-out ${animate ? 'translate-x-0' : 'translate-x-full'}`} onClick={(event) => event.stopPropagation()}>
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

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: 6 }).map((_, index) => (
                  <th key={index} className="px-4 py-3">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  </th>
                ))}
                <th className="px-4 py-3">
                  <div className="ml-auto h-4 w-20 animate-pulse rounded bg-gray-200" />
                </th>
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

function renderCell(cell: BillsCell, index: number) {
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
      blue: 'bg-blue-50 text-blue-700 ring-blue-200',
      gray: 'bg-gray-100 text-gray-700 ring-gray-200',
      green: 'bg-green-50 text-green-700 ring-green-200',
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

function calculateLinePreview(
  line: BillLineFormState,
  taxCodes: BillsRegisterResponse['referenceData']['taxCodes'],
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
  taxCodes: BillsRegisterResponse['referenceData']['taxCodes'],
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

function StaticTabPanel({ tab }: { tab: StaticTab }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">{tab.label}</h2>
          <p className="text-sm text-gray-600">{tab.description}</p>
          <p className="text-sm text-gray-500">{tab.rows.length} matching rows</p>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        This tab remains on the current placeholder implementation for now.
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {tab.metrics.map((metric) => (
          <div key={metric.id}>
            <MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="space-y-4 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">{tab.tableTitle}</h3>
              <p className="text-sm text-gray-600">{tab.tableDescription}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {tab.columns.map((column) => (
                      <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Tax Total' || column === 'Balance Due' || column === 'Remaining' ? 'text-right' : 'text-left'}`}>
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {tab.rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.cells.map((cell, index) => renderCell(cell, index))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BillFormPanel({
  formState,
  setFormState,
  referenceData,
  submitLabel,
  onSubmit,
  onCancel,
  error,
  isSubmitting,
}: {
  formState: BillFormState;
  setFormState: React.Dispatch<React.SetStateAction<BillFormState>>;
  referenceData: BillsRegisterResponse['referenceData'] | null;
  submitLabel: string;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
  error: string | null;
  isSubmitting: boolean;
}) {
  const preview = useMemo(
    () => calculateBillPreview(formState, referenceData?.taxCodes || []),
    [formState, referenceData],
  );

  const vendorOptions = [
    { label: 'Select a vendor', value: '' },
    ...((referenceData?.vendors || []).map((vendor) => ({
      label: `${vendor.vendorCode ? `${vendor.vendorCode} - ` : ''}${vendor.displayName || `Vendor ${vendor.id}`}`,
      value: String(vendor.id),
    }))),
  ];

  const accountOptions = [
    { label: 'Select an account', value: '' },
    ...((referenceData?.chartAccounts || []).map((account) => ({
      label: `${account.code ? `${account.code} - ` : ''}${account.name || 'Unnamed account'}`,
      value: String(account.id),
    }))),
  ];

  const taxCodeOptions = [
    { label: 'No tax code', value: '' },
    ...((referenceData?.taxCodes || []).map((taxCode) => ({
      label: `${taxCode.code ? `${taxCode.code} - ` : ''}${taxCode.name || 'Unnamed tax code'}`,
      value: String(taxCode.id),
    }))),
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error ? (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Bill Number">
          <Input value={formState.billNumber} onChange={(value) => setFormState((previous) => ({ ...previous, billNumber: value }))} placeholder="Leave blank to auto-generate" />
        </FormField>
        <FormField label="Vendor" required>
          <Select value={formState.vendor} onChange={(value) => setFormState((previous) => ({ ...previous, vendor: value }))} options={vendorOptions} />
        </FormField>
        <FormField label="Bill Date" required>
          <Input type="date" value={formState.billDate} onChange={(value) => setFormState((previous) => ({ ...previous, billDate: value }))} required />
        </FormField>
        <FormField label="Posting Date" required>
          <Input type="date" value={formState.postingDate} onChange={(value) => setFormState((previous) => ({ ...previous, postingDate: value }))} required />
        </FormField>
        <FormField label="Due Date" required>
          <Input type="date" value={formState.dueDate} onChange={(value) => setFormState((previous) => ({ ...previous, dueDate: value }))} required />
        </FormField>
        <FormField label="Status" required>
          <Select
            value={formState.status}
            onChange={(value) => setFormState((previous) => ({ ...previous, status: value as 'draft' | 'approved' }))}
            options={[
              { label: 'Draft', value: 'draft' },
              { label: 'Approved', value: 'approved' },
            ]}
          />
        </FormField>
        <FormField label="Currency" required>
          <Input value={formState.currency} onChange={(value) => setFormState((previous) => ({ ...previous, currency: value }))} required />
        </FormField>
        <FormField label="Exchange Rate" required>
          <Input type="number" value={formState.exchangeRate} onChange={(value) => setFormState((previous) => ({ ...previous, exchangeRate: value }))} required />
        </FormField>
        <FormField label="Reference Number">
          <Input value={formState.referenceNumber} onChange={(value) => setFormState((previous) => ({ ...previous, referenceNumber: value }))} placeholder="Vendor reference or invoice reference" />
        </FormField>
        <FormField label="Payable Account Override">
          <Select value={formState.payableAccountOverride} onChange={(value) => setFormState((previous) => ({ ...previous, payableAccountOverride: value }))} options={accountOptions} />
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

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Calculated Totals</h4>
            <p className="text-sm text-gray-600">System-calculated totals remain read-only and update from the line inputs below.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FormField label="Subtotal">
            <Input value={formatCurrency(preview.subtotal, formState.currency || 'PHP')} disabled />
          </FormField>
          <FormField label="Tax Total">
            <Input value={formatCurrency(preview.taxTotal, formState.currency || 'PHP')} disabled />
          </FormField>
          <FormField label="Total">
            <Input value={formatCurrency(preview.total, formState.currency || 'PHP')} disabled />
          </FormField>
          <FormField label="Balance Due">
            <Input value={formatCurrency(preview.balanceDue, formState.currency || 'PHP')} disabled />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Line Items</h4>
            <p className="text-sm text-gray-600">Use guided selectors for tax and account mappings on each bill line.</p>
          </div>
          <button
            type="button"
            onClick={() => setFormState((previous) => ({ ...previous, lines: [...previous.lines, createEmptyLine()] }))}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Line
          </button>
        </div>
        <div className="space-y-4 p-5">
          {formState.lines.map((line, index) => {
            const linePreview = calculateLinePreview(line, referenceData?.taxCodes || []);
            return (
              <div key={line.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-semibold text-gray-900">Line {index + 1}</h5>
                  <button
                    type="button"
                    onClick={() =>
                      setFormState((previous) => ({
                        ...previous,
                        lines: previous.lines.length === 1 ? [createEmptyLine()] : previous.lines.filter((item) => item.id !== line.id),
                      }))
                    }
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                    />
                  </FormField>
                  <FormField label="Account Type" required>
                    <Select
                      value={line.accountType}
                      onChange={(value) =>
                        setFormState((previous) => ({
                          ...previous,
                          lines: previous.lines.map((item) => (item.id === line.id ? { ...item, accountType: value as 'expense' | 'asset' } : item)),
                        }))
                      }
                      options={[
                        { label: 'Expense Account', value: 'expense' },
                        { label: 'Asset Account', value: 'asset' },
                      ]}
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
                    />
                  </FormField>
                  <FormField label="Line Payable Override">
                    <Select
                      value={line.payableAccountOverrideId}
                      onChange={(value) =>
                        setFormState((previous) => ({
                          ...previous,
                          lines: previous.lines.map((item) => (item.id === line.id ? { ...item, payableAccountOverrideId: value } : item)),
                        }))
                      }
                      options={accountOptions}
                    />
                  </FormField>
                  <FormField label="Line Subtotal">
                    <Input value={formatCurrency(linePreview.lineSubtotal, formState.currency || 'PHP')} disabled />
                  </FormField>
                  <FormField label="Line Tax">
                    <Input value={formatCurrency(linePreview.lineTax, formState.currency || 'PHP')} disabled />
                  </FormField>
                  <FormField label="Line Total">
                    <Input value={formatCurrency(linePreview.lineTotal, formState.currency || 'PHP')} disabled />
                  </FormField>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

function VendorCreditFormPanel({
  formState,
  setFormState,
  referenceData,
  submitLabel,
  onSubmit,
  onCancel,
  error,
  isSubmitting,
}: {
  formState: VendorCreditFormState;
  setFormState: React.Dispatch<React.SetStateAction<VendorCreditFormState>>;
  referenceData: VendorCreditRegisterResponse['referenceData'] | null;
  submitLabel: string;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
  error: string | null;
  isSubmitting: boolean;
}) {
  const preview = useMemo(() => calculateVendorCreditPreview(formState), [formState]);

  const vendorOptions = [
    { label: 'Select a vendor', value: '' },
    ...((referenceData?.vendors || []).map((vendor) => ({
      label: `${vendor.vendorCode ? `${vendor.vendorCode} - ` : ''}${vendor.displayName || `Vendor ${vendor.id}`}`,
      value: String(vendor.id),
    }))),
  ];

  const accountOptions = [
    { label: 'Select an adjustment account', value: '' },
    ...((referenceData?.chartAccounts || []).map((account) => ({
      label: `${account.code ? `${account.code} - ` : ''}${account.name || 'Unnamed account'}`,
      value: String(account.id),
    }))),
  ];

  const sourceBillOptions = [
    { label: 'No source bill', value: '' },
    ...((referenceData?.bills || [])
      .filter((bill) => !formState.vendor || String(bill.vendorId || '') === formState.vendor)
      .map((bill) => ({
        label: `${bill.billNumber || `Bill ${bill.id}`} (${formatCurrency(bill.balanceDue, bill.currency || 'PHP')} open)`,
        value: String(bill.id),
      }))),
  ];

  const applicationBillOptions = [
    { label: 'Select a bill', value: '' },
    ...((referenceData?.bills || [])
      .filter((bill) => !formState.vendor || String(bill.vendorId || '') === formState.vendor)
      .map((bill) => ({
        label: `${bill.billNumber || `Bill ${bill.id}`} (${formatCurrency(bill.balanceDue, bill.currency || 'PHP')} open)`,
        value: String(bill.id),
      }))),
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error ? (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Vendor Credit Number">
          <Input
            value={formState.vendorCreditNumber}
            onChange={(value) => setFormState((previous) => ({ ...previous, vendorCreditNumber: value }))}
            placeholder="Leave blank to auto-generate"
          />
        </FormField>
        <FormField label="Vendor" required>
          <Select
            value={formState.vendor}
            onChange={(value) =>
              setFormState((previous) => ({
                ...previous,
                vendor: value,
                sourceBill:
                  previous.sourceBill &&
                  !(referenceData?.bills || []).some(
                    (bill) => String(bill.id) === previous.sourceBill && String(bill.vendorId || '') === value,
                  )
                    ? ''
                    : previous.sourceBill,
                applications: previous.applications.map((application) => ({
                  ...application,
                  bill:
                    application.bill &&
                    !(referenceData?.bills || []).some(
                      (bill) => String(bill.id) === application.bill && String(bill.vendorId || '') === value,
                    )
                      ? ''
                      : application.bill,
                })),
              }))
            }
            options={vendorOptions}
          />
        </FormField>
        <FormField label="Credit Date" required>
          <Input
            type="date"
            value={formState.creditDate}
            onChange={(value) => setFormState((previous) => ({ ...previous, creditDate: value }))}
            required
          />
        </FormField>
        <FormField label="Posting Date" required>
          <Input
            type="date"
            value={formState.postingDate}
            onChange={(value) => setFormState((previous) => ({ ...previous, postingDate: value }))}
            required
          />
        </FormField>
        <FormField label="Status" required>
          <Select
            value={formState.status}
            onChange={(value) =>
              setFormState((previous) => ({ ...previous, status: value as 'draft' | 'approved' }))
            }
            options={[
              { label: 'Draft', value: 'draft' },
              { label: 'Approved', value: 'approved' },
            ]}
          />
        </FormField>
        <FormField label="Currency" required>
          <Input
            value={formState.currency}
            onChange={(value) => setFormState((previous) => ({ ...previous, currency: value }))}
            required
          />
        </FormField>
        <FormField label="Source Bill">
          <Select
            value={formState.sourceBill}
            onChange={(value) => setFormState((previous) => ({ ...previous, sourceBill: value }))}
            options={sourceBillOptions}
          />
        </FormField>
        <FormField label="Adjustment Account" required>
          <Select
            value={formState.adjustmentAccount}
            onChange={(value) => setFormState((previous) => ({ ...previous, adjustmentAccount: value }))}
            options={accountOptions}
          />
        </FormField>
        <FormField label="Subtotal" required>
          <Input
            type="number"
            value={formState.subtotal}
            onChange={(value) => setFormState((previous) => ({ ...previous, subtotal: value }))}
            required
          />
        </FormField>
        <FormField label="Tax Total">
          <Input
            type="number"
            value={formState.taxTotal}
            onChange={(value) => setFormState((previous) => ({ ...previous, taxTotal: value }))}
          />
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

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Calculated Credit Totals</h4>
            <p className="text-sm text-gray-600">Applied and remaining amounts are system-derived from the credit amount and bill applications below.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <FormField label="Subtotal">
            <Input value={formatCurrency(preview.subtotal, formState.currency || 'PHP')} disabled />
          </FormField>
          <FormField label="Tax Total">
            <Input value={formatCurrency(preview.taxTotal, formState.currency || 'PHP')} disabled />
          </FormField>
          <FormField label="Total">
            <Input value={formatCurrency(preview.total, formState.currency || 'PHP')} disabled />
          </FormField>
          <FormField label="Applied Amount">
            <Input value={formatCurrency(preview.appliedAmount, formState.currency || 'PHP')} disabled />
          </FormField>
          <FormField label="Remaining Amount">
            <Input value={formatCurrency(preview.remainingAmount, formState.currency || 'PHP')} disabled />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Applications</h4>
            <p className="text-sm text-gray-600">Allocate the vendor credit to posted or partially paid bills for the same vendor.</p>
          </div>
          <button
            type="button"
            onClick={() =>
              setFormState((previous) => ({
                ...previous,
                applications: [...previous.applications, createEmptyVendorCreditApplication()],
              }))
            }
            className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Application
          </button>
        </div>
        <div className="space-y-4 p-5">
          {formState.applications.map((application, index) => (
            <div key={application.id} className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-semibold text-gray-900">Application {index + 1}</h5>
                <button
                  type="button"
                  onClick={() =>
                    setFormState((previous) => ({
                      ...previous,
                      applications:
                        previous.applications.length === 1
                          ? [createEmptyVendorCreditApplication()]
                          : previous.applications.filter((item) => item.id !== application.id),
                    }))
                  }
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <FormField label="Bill" required>
                  <Select
                    value={application.bill}
                    onChange={(value) =>
                      setFormState((previous) => ({
                        ...previous,
                        applications: previous.applications.map((item) =>
                          item.id === application.id ? { ...item, bill: value } : item,
                        ),
                      }))
                    }
                    options={applicationBillOptions}
                  />
                </FormField>
                <FormField label="Amount Applied" required>
                  <Input
                    type="number"
                    value={application.amountApplied}
                    onChange={(value) =>
                      setFormState((previous) => ({
                        ...previous,
                        applications: previous.applications.map((item) =>
                          item.id === application.id ? { ...item, amountApplied: value } : item,
                        ),
                      }))
                    }
                    required
                  />
                </FormField>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

function BillsPanel({ tab }: { tab: (typeof TABS)[number] }) {
  const [data, setData] = useState<BillsRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<BillsFilterState>({ statuses: [], vendorIds: [] });
  const [draftFilters, setDraftFilters] = useState<BillsFilterState>({ statuses: [], vendorIds: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [viewDetail, setViewDetail] = useState<BillDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState<BillFormState>(createEmptyForm());
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editForm, setEditForm] = useState<BillFormState>(createEmptyForm());
  const [editId, setEditId] = useState<string | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLabel, setDeleteLabel] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [postingId, setPostingId] = useState<string | null>(null);

  const filterCount = filters.statuses.length + filters.vendorIds.length;

  const fetchRegister = useCallback(async ({
    search,
    page,
    nextFilters,
    nextQuickFilters,
  }: {
    search: string;
    page: number;
    nextFilters: BillsFilterState;
    nextQuickFilters: string[];
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getBills({
        search,
        page,
        statuses: nextFilters.statuses,
        vendorIds: nextFilters.vendorIds,
        quickFilters: nextQuickFilters,
      });
      setData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load bills.');
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

  const handleRefresh = () => {
    void fetchRegister({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  };

  const handleExport = () => {
    const rows = data?.rows || [];
    if (!rows.length) return;

    const headers = ['Bill No.', 'Bill Date', 'Vendor', 'Due Date', 'Total', 'Balance Due', 'Status', 'Posting Status'];
    const csvRows = rows.map((row) => [
      row.billNumber,
      row.billDateLabel,
      row.vendorLabel,
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
    link.download = 'purchase-bills.csv';
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
      const detail = await getBillDetail(id);
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
    setCreateError(null);
    setIsCreateSubmitting(true);
    try {
      await createBill(toMutationInput(createForm));
      setIsCreateOpen(false);
      handleRefresh();
    } catch (submitError) {
      setCreateError(submitError instanceof Error ? submitError.message : 'Unable to create bill.');
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
      const detail = await getBillDetail(id);
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
    setEditError(null);
    setIsEditSubmitting(true);
    try {
      await updateBill(editId, toMutationInput(editForm));
      setIsEditOpen(false);
      handleRefresh();
    } catch (submitError) {
      setEditError(submitError instanceof Error ? submitError.message : 'Unable to update bill.');
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
    setDeleteError(null);
    setIsDeleteSubmitting(true);
    try {
      await deleteBill(deleteId);
      setIsDeleteOpen(false);
      handleRefresh();
    } catch (submitError) {
      setDeleteError(submitError instanceof Error ? submitError.message : 'Unable to delete bill.');
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  const handlePost = async (id: string) => {
    setPostingId(id);
    setError(null);
    try {
      await postBill(id);
      handleRefresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to post bill.');
    } finally {
      setPostingId(null);
    }
  };

  const currentRows = data?.rows || [];

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
            Refresh List
          </button>
          <button type="button" onClick={handleExport} disabled={!currentRows.length} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
            <Download className="h-4 w-4" />
            Export View
          </button>
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
            <Plus className="h-4 w-4" />
            Create Bill
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
                      setDraftFilters({ statuses: [], vendorIds: [] });
                      setFilters({ statuses: [], vendorIds: [] });
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

              <div className="mt-6 grid gap-6 md:grid-cols-2">
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
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Vendor</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.vendors || []).map((option) => {
                      const selected = draftFilters.vendorIds.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setDraftFilters((previous) => ({ ...previous, vendorIds: toggleFilterValue(previous.vendorIds, option.value) }))}
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
                        {(data?.meta.columns || tab.columns).map((column) => {
                          const label = typeof column === 'string' ? column : column.label;
                          const align = typeof column === 'string' ? 'left' : column.align;
                          return (
                            <th key={label} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${align === 'right' || label === 'Total' ? 'text-right' : 'text-left'}`}>
                              {label}
                            </th>
                          );
                        })}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {currentRows.length > 0 ? (
                        currentRows.map((row) => {
                          const isMutable = ['draft', 'approved'].includes(row.status);
                          return (
                            <tr key={row.id} className="hover:bg-gray-50">
                              {row.cells.map((cell, index) => renderCell(cell, index))}
                              <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail">
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button type="button" onClick={() => handleOpenEdit(row.id)} disabled={!isMutable} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40" title={isMutable ? 'Edit' : 'Only draft or approved bills can be edited'}>
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button type="button" onClick={() => handleOpenDelete(row.id, row.billNumber)} disabled={!isMutable} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40" title={isMutable ? 'Delete' : 'Only draft or approved bills can be deleted'}>
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                  <button type="button" onClick={() => handlePost(row.id)} disabled={!isMutable || postingId === row.id} className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40" title={isMutable ? 'Post bill' : 'Only draft or approved bills can be posted'}>
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
                            No bill rows found.
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

      <SlideOver isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Bill" description="Create a new vendor bill with guided tax and account selections.">
        <BillFormPanel
          formState={createForm}
          setFormState={setCreateForm}
          referenceData={data?.referenceData || null}
          submitLabel="Create Bill"
          onSubmit={handleCreateSubmit}
          onCancel={() => setIsCreateOpen(false)}
          error={createError}
          isSubmitting={isCreateSubmitting}
        />
      </SlideOver>

      <SlideOver isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Bill" description="Update a mutable bill before it is posted or settled.">
        {isEditLoading ? (
          <LoadingSkeleton />
        ) : (
          <BillFormPanel
            formState={editForm}
            setFormState={setEditForm}
            referenceData={data?.referenceData || null}
            submitLabel="Save Changes"
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditOpen(false)}
            error={editError}
            isSubmitting={isEditSubmitting}
          />
        )}
      </SlideOver>

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Bill Detail" description="Review bill header values, line items, totals, support documents, and dependency status.">
        <div className="space-y-6">
          {isViewLoading ? (
            <LoadingSkeleton />
          ) : viewDetail ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['Bill No.', viewDetail.billNumber],
                  ['Vendor', viewDetail.vendorLabel],
                  ['Vendor Currency', viewDetail.vendorCurrency || '-'],
                  ['Payment Terms', viewDetail.vendorPaymentTerms || '-'],
                  ['Bill Date', viewDetail.billDateLabel],
                  ['Posting Date', viewDetail.postingDateLabel],
                  ['Due Date', viewDetail.dueDateLabel],
                  ['Status', viewDetail.statusLabel],
                  ['Posting Status', viewDetail.postingStatusLabel],
                  ['Reference No.', viewDetail.referenceNumber || '-'],
                  ['Payable Override', viewDetail.payableAccountOverrideLabel || '-'],
                  ['Posted Journal', viewDetail.postedJournalEntryId || '-'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Subtotal', viewDetail.subtotalLabel],
                  ['Tax Total', viewDetail.taxTotalLabel],
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
                  <h4 className="text-sm font-semibold text-gray-900">Bill Lines</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Line', 'Description', 'Account', 'Tax Code', 'Qty', 'Unit Price', 'Line Total'].map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Qty' || column === 'Unit Price' || column === 'Line Total' ? 'text-right' : 'text-left'}`}>
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {viewDetail.lineItems.length > 0 ? (
                        viewDetail.lineItems.map((line) => (
                          <tr key={line.id}>
                            <td className="px-4 py-3 text-sm text-gray-600">{line.lineNumber}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{line.description}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{line.accountLabel || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{line.taxCodeLabel || '-'}</td>
                            <td className="px-4 py-3 text-right text-sm text-gray-600">{line.quantity}</td>
                            <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(line.unitPrice, viewDetail.currency || 'PHP')}</td>
                            <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{line.lineTotalLabel}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">No bill lines found.</td>
                        </tr>
                      )}
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
                      {viewDetail.documentLinks.length > 0 ? (
                        viewDetail.documentLinks.map((documentLink) => (
                          <tr key={documentLink.id}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{documentLink.documentCategoryLabel || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{documentLink.documentDateLabel}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{documentLink.isPrimary ? 'Yes' : 'No'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{documentLink.notes || '-'}</td>
                          </tr>
                        ))
                      ) : (
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
                <p>Vendor Credits: {viewDetail.usageSummary.appliedVendorCreditsCount}</p>
                <p>Support Documents: {viewDetail.usageSummary.documentCount}</p>
                <p>Has Blocking Dependents: {viewDetail.usageSummary.hasDependents ? 'Yes' : 'No'}</p>
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

      <SlideOver isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Bill" description="Remove this bill if it has no blocking references.">
        <div className="space-y-6">
          {deleteError ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {deleteError}
            </div>
          ) : null}
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Are you sure?</p>
            <p className="mt-1">This action cannot be undone. Bill "{deleteLabel}" will be permanently removed if no blocking references exist.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setIsDeleteOpen(false)} disabled={isDeleteSubmitting} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleteSubmitting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {isDeleteSubmitting ? 'Deleting...' : 'Delete Bill'}
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}

function BillDetailPanel({ tab }: { tab: (typeof TABS)[number] }) {
  const [data, setData] = useState<BillDetailRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<BillDetailFilterState>({ statuses: [], vendorIds: [], coverageStates: [] });
  const [draftFilters, setDraftFilters] = useState<BillDetailFilterState>({ statuses: [], vendorIds: [], coverageStates: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [viewDetail, setViewDetail] = useState<BillDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState<BillFormState>(createEmptyForm());
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editForm, setEditForm] = useState<BillFormState>(createEmptyForm());
  const [editId, setEditId] = useState<string | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLabel, setDeleteLabel] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [postingId, setPostingId] = useState<string | null>(null);

  const filterCount = filters.statuses.length + filters.vendorIds.length + filters.coverageStates.length;

  const fetchRegister = useCallback(async ({
    search,
    page,
    nextFilters,
    nextQuickFilters,
  }: {
    search: string;
    page: number;
    nextFilters: BillDetailFilterState;
    nextQuickFilters: string[];
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getBillDetailRegister({
        search,
        page,
        statuses: nextFilters.statuses,
        vendorIds: nextFilters.vendorIds,
        coverageStates: nextFilters.coverageStates,
        quickFilters: nextQuickFilters,
      });
      setData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load bill detail.');
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

  const handleRefresh = () => {
    void fetchRegister({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  };

  const handleExport = () => {
    const rows = data?.rows || [];
    if (!rows.length) return;

    const headers = ['Bill No.', 'Vendor', 'Line Items', 'Tax Total', 'Balance Due', 'Status', 'Documents', 'Journal Linked'];
    const csvRows = rows.map((row) => [
      row.billNumber,
      row.vendorLabel,
      row.lineItemCountLabel,
      row.taxTotalLabel,
      row.balanceDueLabel,
      row.statusLabel,
      row.documentCount,
      row.hasJournalLink ? 'Yes' : 'No',
    ]);

    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bill-detail.csv';
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
      const detail = await getBillDetail(id);
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
    setCreateError(null);
    setIsCreateSubmitting(true);
    try {
      await createBill(toMutationInput(createForm));
      setIsCreateOpen(false);
      handleRefresh();
    } catch (submitError) {
      setCreateError(submitError instanceof Error ? submitError.message : 'Unable to create bill.');
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
      const detail = await getBillDetail(id);
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
    setEditError(null);
    setIsEditSubmitting(true);
    try {
      await updateBill(editId, toMutationInput(editForm));
      setIsEditOpen(false);
      handleRefresh();
    } catch (submitError) {
      setEditError(submitError instanceof Error ? submitError.message : 'Unable to update bill.');
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
    setDeleteError(null);
    setIsDeleteSubmitting(true);
    try {
      await deleteBill(deleteId);
      setIsDeleteOpen(false);
      handleRefresh();
    } catch (submitError) {
      setDeleteError(submitError instanceof Error ? submitError.message : 'Unable to delete bill.');
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  const handlePost = async (id: string) => {
    setPostingId(id);
    setError(null);
    try {
      await postBill(id);
      handleRefresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to post bill.');
    } finally {
      setPostingId(null);
    }
  };

  const currentRows = data?.rows || [];

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
            Refresh Detail
          </button>
          <button type="button" onClick={handleExport} disabled={!currentRows.length} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
            <Download className="h-4 w-4" />
            Export View
          </button>
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
            <Plus className="h-4 w-4" />
            Create Bill
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
                      setDraftFilters({ statuses: [], vendorIds: [], coverageStates: [] });
                      setFilters({ statuses: [], vendorIds: [], coverageStates: [] });
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
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Vendor</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.vendors || []).map((option) => {
                      const selected = draftFilters.vendorIds.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setDraftFilters((previous) => ({ ...previous, vendorIds: toggleFilterValue(previous.vendorIds, option.value) }))}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Coverage</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.coverageStates || []).map((option) => {
                      const selected = draftFilters.coverageStates.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setDraftFilters((previous) => ({ ...previous, coverageStates: toggleFilterValue(previous.coverageStates, option.value) }))}
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
                        {(data?.meta.columns || tab.columns).map((column) => {
                          const label = typeof column === 'string' ? column : column.label;
                          const align = typeof column === 'string' ? 'left' : column.align;
                          return (
                            <th key={label} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${align === 'right' || label === 'Tax Total' || label === 'Balance Due' ? 'text-right' : 'text-left'}`}>
                              {label}
                            </th>
                          );
                        })}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {currentRows.length > 0 ? (
                        currentRows.map((row) => {
                          const isMutable = ['draft', 'approved'].includes(row.status);
                          return (
                            <tr key={row.id} className="hover:bg-gray-50">
                              {row.cells.map((cell, index) => renderCell(cell, index))}
                              <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail">
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button type="button" onClick={() => handleOpenEdit(row.id)} disabled={!isMutable} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40" title={isMutable ? 'Edit' : 'Only draft or approved bills can be edited'}>
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button type="button" onClick={() => handleOpenDelete(row.id, row.billNumber)} disabled={!isMutable} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40" title={isMutable ? 'Delete' : 'Only draft or approved bills can be deleted'}>
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                  <button type="button" onClick={() => handlePost(row.id)} disabled={!isMutable || postingId === row.id} className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40" title={isMutable ? 'Post bill' : 'Only draft or approved bills can be posted'}>
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
                            No bill detail rows found.
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

      <SlideOver isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Bill" description="Create a new vendor bill with guided tax and account selections.">
        <BillFormPanel
          formState={createForm}
          setFormState={setCreateForm}
          referenceData={data?.referenceData || null}
          submitLabel="Create Bill"
          onSubmit={handleCreateSubmit}
          onCancel={() => setIsCreateOpen(false)}
          error={createError}
          isSubmitting={isCreateSubmitting}
        />
      </SlideOver>

      <SlideOver isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Bill" description="Update a mutable bill before it is posted or settled.">
        {isEditLoading ? (
          <LoadingSkeleton />
        ) : (
          <BillFormPanel
            formState={editForm}
            setFormState={setEditForm}
            referenceData={data?.referenceData || null}
            submitLabel="Save Changes"
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditOpen(false)}
            error={editError}
            isSubmitting={isEditSubmitting}
          />
        )}
      </SlideOver>

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Bill Detail" description="Review bill header values, line items, totals, support documents, and dependency status.">
        <div className="space-y-6">
          {isViewLoading ? (
            <LoadingSkeleton />
          ) : viewDetail ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['Bill No.', viewDetail.billNumber],
                  ['Vendor', viewDetail.vendorLabel],
                  ['Vendor Currency', viewDetail.vendorCurrency || '-'],
                  ['Payment Terms', viewDetail.vendorPaymentTerms || '-'],
                  ['Bill Date', viewDetail.billDateLabel],
                  ['Posting Date', viewDetail.postingDateLabel],
                  ['Due Date', viewDetail.dueDateLabel],
                  ['Status', viewDetail.statusLabel],
                  ['Posting Status', viewDetail.postingStatusLabel],
                  ['Reference No.', viewDetail.referenceNumber || '-'],
                  ['Payable Override', viewDetail.payableAccountOverrideLabel || '-'],
                  ['Posted Journal', viewDetail.postedJournalEntryId || '-'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Subtotal', viewDetail.subtotalLabel],
                  ['Tax Total', viewDetail.taxTotalLabel],
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
                  <h4 className="text-sm font-semibold text-gray-900">Bill Lines</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Line', 'Description', 'Account', 'Tax Code', 'Qty', 'Unit Price', 'Line Total'].map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Qty' || column === 'Unit Price' || column === 'Line Total' ? 'text-right' : 'text-left'}`}>
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {viewDetail.lineItems.length > 0 ? (
                        viewDetail.lineItems.map((line) => (
                          <tr key={line.id}>
                            <td className="px-4 py-3 text-sm text-gray-600">{line.lineNumber}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{line.description}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{line.accountLabel || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{line.taxCodeLabel || '-'}</td>
                            <td className="px-4 py-3 text-right text-sm text-gray-600">{line.quantity}</td>
                            <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(line.unitPrice, viewDetail.currency || 'PHP')}</td>
                            <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{line.lineTotalLabel}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">No bill lines found.</td>
                        </tr>
                      )}
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
                      {viewDetail.documentLinks.length > 0 ? (
                        viewDetail.documentLinks.map((documentLink) => (
                          <tr key={documentLink.id}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{documentLink.documentCategoryLabel || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{documentLink.documentDateLabel}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{documentLink.isPrimary ? 'Yes' : 'No'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{documentLink.notes || '-'}</td>
                          </tr>
                        ))
                      ) : (
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
                <p>Vendor Credits: {viewDetail.usageSummary.appliedVendorCreditsCount}</p>
                <p>Support Documents: {viewDetail.usageSummary.documentCount}</p>
                <p>Has Blocking Dependents: {viewDetail.usageSummary.hasDependents ? 'Yes' : 'No'}</p>
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

      <SlideOver isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Bill" description="Remove this bill if it has no blocking references.">
        <div className="space-y-6">
          {deleteError ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {deleteError}
            </div>
          ) : null}
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Are you sure?</p>
            <p className="mt-1">This action cannot be undone. Bill "{deleteLabel}" will be permanently removed if no blocking references exist.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setIsDeleteOpen(false)} disabled={isDeleteSubmitting} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleteSubmitting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {isDeleteSubmitting ? 'Deleting...' : 'Delete Bill'}
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}

function VendorCreditsPanel({ tab }: { tab: (typeof TABS)[number] }) {
  const [data, setData] = useState<VendorCreditRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<VendorCreditFilterState>({ statuses: [], vendorIds: [], balanceStates: [] });
  const [draftFilters, setDraftFilters] = useState<VendorCreditFilterState>({ statuses: [], vendorIds: [], balanceStates: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [viewDetail, setViewDetail] = useState<VendorCreditDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState<VendorCreditFormState>(createEmptyVendorCreditForm());
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editForm, setEditForm] = useState<VendorCreditFormState>(createEmptyVendorCreditForm());
  const [editId, setEditId] = useState<string | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLabel, setDeleteLabel] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [postingId, setPostingId] = useState<string | null>(null);

  const filterCount = filters.statuses.length + filters.vendorIds.length + filters.balanceStates.length;

  const fetchRegister = useCallback(async ({
    search,
    page,
    nextFilters,
    nextQuickFilters,
  }: {
    search: string;
    page: number;
    nextFilters: VendorCreditFilterState;
    nextQuickFilters: string[];
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getVendorCredits({
        search,
        page,
        statuses: nextFilters.statuses,
        vendorIds: nextFilters.vendorIds,
        balanceStates: nextFilters.balanceStates,
        quickFilters: nextQuickFilters,
      });
      setData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load vendor credits.');
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

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput);
    setCurrentPage(1);
    void fetchRegister({ search: searchInput, page: 1, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleRefresh = () => {
    void fetchRegister({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleExport = () => {
    const rows = data?.rows || [];
    if (!rows.length) return;
    const headers = ['Credit No.', 'Credit Date', 'Vendor', 'Source Bill', 'Total', 'Applied', 'Remaining', 'Status'];
    const csvRows = rows.map((row) => [
      row.vendorCreditNumber,
      row.creditDateLabel,
      row.vendorLabel,
      row.sourceBillLabel,
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
    link.download = 'vendor-credits.csv';
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
      setViewDetail(await getVendorCreditDetail(id));
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load vendor credit detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setCreateForm(createEmptyVendorCreditForm());
    setCreateError(null);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreateError(null);
    setIsCreateSubmitting(true);
    try {
      await createVendorCredit(toVendorCreditMutationInput(createForm));
      setIsCreateOpen(false);
      handleRefresh();
    } catch (submitError) {
      setCreateError(submitError instanceof Error ? submitError.message : 'Unable to create vendor credit.');
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
      const detail = await getVendorCreditDetail(id);
      setEditForm(buildVendorCreditFormFromDetail(detail));
    } catch (detailError) {
      setEditError(detailError instanceof Error ? detailError.message : 'Unable to load vendor credit detail.');
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editId) return;
    setEditError(null);
    setIsEditSubmitting(true);
    try {
      await updateVendorCredit(editId, toVendorCreditMutationInput(editForm));
      setIsEditOpen(false);
      handleRefresh();
    } catch (submitError) {
      setEditError(submitError instanceof Error ? submitError.message : 'Unable to update vendor credit.');
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
    setDeleteError(null);
    setIsDeleteSubmitting(true);
    try {
      await deleteVendorCredit(deleteId);
      setIsDeleteOpen(false);
      handleRefresh();
    } catch (submitError) {
      setDeleteError(submitError instanceof Error ? submitError.message : 'Unable to delete vendor credit.');
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  const handlePost = async (id: string) => {
    setPostingId(id);
    setError(null);
    try {
      await postVendorCredit(id);
      handleRefresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to post vendor credit.');
    } finally {
      setPostingId(null);
    }
  };

  const currentRows = data?.rows || [];

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
            Refresh Credits
          </button>
          <button type="button" onClick={handleExport} disabled={!currentRows.length} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
            <Download className="h-4 w-4" />
            Export View
          </button>
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
            <Plus className="h-4 w-4" />
            Create Credit
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
                <input type="text" placeholder={data?.meta.searchPlaceholder || tab.searchPlaceholder} value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
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
                  <button type="button" onClick={() => { setDraftFilters({ statuses: [], vendorIds: [], balanceStates: [] }); setFilters({ statuses: [], vendorIds: [], balanceStates: [] }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Clear all</button>
                  <button type="button" onClick={() => setIsFilterPanelOpen(false)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="button" onClick={() => { setFilters({ ...draftFilters }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button>
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-3">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.statuses || []).map((option) => {
                      const selected = draftFilters.statuses.includes(option.value);
                      return <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{option.label}</button>;
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Vendor</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.vendors || []).map((option) => {
                      const selected = draftFilters.vendorIds.includes(option.value);
                      return <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, vendorIds: toggleFilterValue(previous.vendorIds, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{option.label}</button>;
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Balance State</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.balanceStates || []).map((option) => {
                      const selected = draftFilters.balanceStates.includes(option.value);
                      return <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, balanceStates: toggleFilterValue(previous.balanceStates, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{option.label}</button>;
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

          {error ? <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div> : null}

          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {(data?.meta.columns || tab.columns).map((column) => {
                          const label = typeof column === 'string' ? column : column.label;
                          const align = typeof column === 'string' ? 'left' : column.align;
                          return <th key={label} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${align === 'right' || label === 'Remaining' ? 'text-right' : 'text-left'}`}>{label}</th>;
                        })}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {currentRows.length > 0 ? currentRows.map((row) => {
                        const isMutable = ['draft', 'approved'].includes(row.status);
                        return (
                          <tr key={row.id} className="hover:bg-gray-50">
                            {row.cells.map((cell, index) => renderCell(cell, index))}
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail"><Eye className="h-4 w-4" /></button>
                                <button type="button" onClick={() => handleOpenEdit(row.id)} disabled={!isMutable} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40" title={isMutable ? 'Edit' : 'Only draft or approved vendor credits can be edited'}><Edit className="h-4 w-4" /></button>
                                <button type="button" onClick={() => handleOpenDelete(row.id, row.vendorCreditNumber)} disabled={!isMutable} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40" title={isMutable ? 'Delete' : 'Only draft or approved vendor credits can be deleted'}><Trash2 className="h-4 w-4" /></button>
                                <button type="button" onClick={() => handlePost(row.id)} disabled={!isMutable || postingId === row.id} className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40" title={isMutable ? 'Post vendor credit' : 'Only draft or approved vendor credits can be posted'}><SendHorizonal className="h-3.5 w-3.5" />{postingId === row.id ? 'Posting...' : 'Post'}</button>
                              </div>
                            </td>
                          </tr>
                        );
                      }) : <tr><td colSpan={tab.columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">No vendor credits found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              {data?.pagination && data.pagination.totalPages > 1 ? <div className="flex items-center justify-between"><p className="text-sm text-gray-600">Page {data.pagination.page} of {data.pagination.totalPages}</p><div className="flex gap-2"><button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button><button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button></div></div> : null}
            </>
          )}
        </div>
      </div>

      <SlideOver isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Vendor Credit" description="Create a new vendor credit with source-bill linkage and guided bill applications.">
        <VendorCreditFormPanel formState={createForm} setFormState={setCreateForm} referenceData={data?.referenceData || null} submitLabel="Create Vendor Credit" onSubmit={handleCreateSubmit} onCancel={() => setIsCreateOpen(false)} error={createError} isSubmitting={isCreateSubmitting} />
      </SlideOver>

      <SlideOver isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Vendor Credit" description="Update a mutable vendor credit before it is posted or fully applied.">
        {isEditLoading ? <LoadingSkeleton /> : <VendorCreditFormPanel formState={editForm} setFormState={setEditForm} referenceData={data?.referenceData || null} submitLabel="Save Changes" onSubmit={handleEditSubmit} onCancel={() => setIsEditOpen(false)} error={editError} isSubmitting={isEditSubmitting} />}
      </SlideOver>

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Vendor Credit Detail" description="Review vendor credit header values, applications, totals, and dependency status.">
        <div className="space-y-6">
          {isViewLoading ? <LoadingSkeleton /> : viewDetail ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['Credit No.', viewDetail.vendorCreditNumber],
                  ['Vendor', viewDetail.vendorLabel],
                  ['Vendor Currency', viewDetail.vendorCurrency || '-'],
                  ['Payment Terms', viewDetail.vendorPaymentTerms || '-'],
                  ['Credit Date', viewDetail.creditDateLabel],
                  ['Posting Date', viewDetail.postingDateLabel],
                  ['Status', viewDetail.statusLabel],
                  ['Source Bill', viewDetail.sourceBillLabel || '-'],
                  ['Source Bill Balance', viewDetail.sourceBillBalanceDueLabel],
                  ['Adjustment Account', viewDetail.adjustmentAccountLabel || '-'],
                  ['Posted Journal', viewDetail.postedJournalEntryId || '-'],
                  ['Reason', viewDetail.reason || '-'],
                ].map(([label, value]) => <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p><p className="mt-2 text-sm font-medium text-gray-900">{value}</p></div>)}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {[
                  ['Subtotal', viewDetail.subtotalLabel],
                  ['Tax Total', viewDetail.taxTotalLabel],
                  ['Total', viewDetail.totalLabel],
                  ['Applied', viewDetail.appliedAmountLabel],
                  ['Remaining', viewDetail.remainingAmountLabel],
                ].map(([label, value]) => <div key={label} className="rounded-xl border border-gray-200 bg-gray-50 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p><p className="mt-2 text-sm font-semibold text-gray-900">{value}</p></div>)}
              </div>

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-5 py-4"><h4 className="text-sm font-semibold text-gray-900">Applications</h4></div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Bill', 'Amount Applied', 'Bill Balance Due'].map((column) => <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column !== 'Bill' ? 'text-right' : 'text-left'}`}>{column}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {viewDetail.applications.length > 0 ? viewDetail.applications.map((application) => (
                        <tr key={application.id}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{application.billLabel || '-'}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-600">{application.amountAppliedLabel}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-600">{application.billBalanceDueLabel}</td>
                        </tr>
                      )) : <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-500">No applications recorded.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-medium text-gray-900">Dependencies</p>
                <p className="mt-2">Application Count: {viewDetail.usageSummary.applicationCount}</p>
                <p>Has Posted Journal Entry: {viewDetail.usageSummary.hasPostedJournalEntry ? 'Yes' : 'No'}</p>
                <p>Has Blocking Dependents: {viewDetail.usageSummary.hasBlockingDependents ? 'Yes' : 'No'}</p>
              </div>
            </>
          ) : <p className="text-sm text-gray-500">No details available.</p>}
          <div className="flex justify-end pt-4"><button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Close</button></div>
        </div>
      </SlideOver>

      <SlideOver isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Vendor Credit" description="Remove this vendor credit if it has no blocking posted links.">
        <div className="space-y-6">
          {deleteError ? <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{deleteError}</div> : null}
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><p className="font-medium">Are you sure?</p><p className="mt-1">This action cannot be undone. Vendor credit "{deleteLabel}" will be permanently removed if no blocking references exist.</p></div>
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4"><button type="button" onClick={() => setIsDeleteOpen(false)} disabled={isDeleteSubmitting} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">Cancel</button><button type="button" onClick={handleConfirmDelete} disabled={isDeleteSubmitting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">{isDeleteSubmitting ? 'Deleting...' : 'Delete Vendor Credit'}</button></div>
        </div>
      </SlideOver>
    </div>
  );
}

export function PurchaseDocumentsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = TABS.find((tab) => tab.id === rawTab)?.id || 'bills';
  const currentTab = TABS.find((tab) => tab.id === activeTab) || TABS[0];
  const staticTab = STATIC_TABS.find((tab) => tab.id === activeTab);

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Operations / Purchases & Payables</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Purchase Documents</h1>
          <p className="mt-1 text-base text-gray-600">Manage vendor bills, bill detail records, and vendor credits across the payables document workflow.</p>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} type="button" onClick={() => handleTabChange(tab.id)} className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === 'bills' ? <BillsPanel tab={currentTab} /> : activeTab === 'bill-detail' ? <BillDetailPanel tab={currentTab} /> : activeTab === 'vendor-credits' ? <VendorCreditsPanel tab={currentTab} /> : staticTab ? <StaticTabPanel tab={staticTab} /> : null}
    </div>
  );
}
