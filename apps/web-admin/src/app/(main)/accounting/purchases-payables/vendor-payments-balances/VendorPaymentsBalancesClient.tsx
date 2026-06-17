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
  createPaymentMade,
  deleteVendorBalanceVendor,
  deletePaymentMade,
  getVendorBalanceDetail,
  getVendorBalances,
  getPaymentMadeDetail,
  getPaymentsMade,
  postPaymentMade,
  updateVendorBalanceVendor,
  updatePaymentMade,
  type PaymentMadeDetail,
  type PaymentMadeMutationInput,
  type PaymentMadeRow,
  type VendorBalanceDetail,
  type VendorBalanceMutationInput,
  type VendorBalanceRegisterResponse,
  type PaymentsMadeCell,
  type PaymentsMadeMetric,
  type PaymentsMadeRegisterResponse,
} from './actions';

type TabId = 'payments-made' | 'vendor-balances';
type PaymentsMadeFilterState = {
  statuses: string[];
  paymentMethods: string[];
  vendorIds: string[];
  applicationStates: string[];
};
type PaymentApplicationFormState = {
  id: string;
  bill: string;
  amountApplied: string;
};
type PaymentMadeFormState = {
  paymentNumber: string;
  vendor: string;
  paymentDate: string;
  postingDate: string;
  paymentMethod: PaymentMadeMutationInput['paymentMethod'];
  bankAccount: string;
  amountPaid: string;
  currency: string;
  exchangeRate: string;
  referenceNumber: string;
  notes: string;
  applications: PaymentApplicationFormState[];
};
type VendorBalanceFilterState = {
  statuses: string[];
  paymentTermIds: string[];
  balanceStates: string[];
};
type VendorBalanceFormState = {
  vendorCode: string;
  displayName: string;
  legalName: string;
  vendorType: string;
  email: string;
  phone: string;
  billingAddress: string;
  taxId: string;
  currencyReference: string;
  paymentTermReference: string;
  status: string;
  notes: string;
};
type VendorBalanceActionTarget = {
  id: string;
  vendorLabel: string;
};

const TABS = [
  {
    id: 'payments-made' as TabId,
    label: 'Payments Made',
    description:
      'Manage outgoing vendor payments with posting status, payment method, bank account, and bill applications.',
    searchPlaceholder: 'Search payment no., vendor, bank account, reference no., or payment method',
    columns: ['Payment No.', 'Payment Date', 'Vendor', 'Method', { label: 'Amount', align: 'right' }, 'Status'],
    tableTitle: 'Vendor Payment Register',
    tableDescription:
      'Payment-made records with bank account routing, application coverage, and posting status.',
  },
  {
    id: 'vendor-balances' as TabId,
    label: 'Vendor Balances',
    description:
      'Monitor open payable balances by vendor using vendor master status, bill totals, due dates, and aging position.',
    searchPlaceholder: 'Search vendor, vendor code, payment terms, open balance, or oldest due date',
    columns: ['Vendor', 'Vendor Code', 'Payment Terms', 'Open Bills', { label: 'Balance Due', align: 'right' }, 'Vendor Status'],
    tableTitle: 'Vendor Balance View',
    tableDescription:
      'Vendor-level open balance view aligned with vendor master records and accounts payable aging logic.',
  },
];

const PAYMENT_METHOD_OPTIONS: Array<{ label: string; value: PaymentMadeMutationInput['paymentMethod'] }> = [
  { label: 'Cash', value: 'cash' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Check', value: 'check' },
  { label: 'Card', value: 'card' },
  { label: 'E-Wallet', value: 'e_wallet' },
  { label: 'Other', value: 'other' },
];

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') {
    return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  }
  if (variant === 'ghost') {
    return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  }
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
}

function getMetricTone(trend: PaymentsMadeMetric['trend']) {
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

function toDateInputValue(value: string | null | undefined) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function createLineId() {
  return Math.random().toString(36).slice(2, 10);
}

function createEmptyApplication(): PaymentApplicationFormState {
  return {
    id: createLineId(),
    bill: '',
    amountApplied: '0',
  };
}

function createEmptyForm(): PaymentMadeFormState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    paymentNumber: '',
    vendor: '',
    paymentDate: today,
    postingDate: today,
    paymentMethod: 'bank_transfer',
    bankAccount: '',
    amountPaid: '0',
    currency: 'PHP',
    exchangeRate: '1',
    referenceNumber: '',
    notes: '',
    applications: [createEmptyApplication()],
  };
}

function createEmptyVendorBalanceForm(): VendorBalanceFormState {
  return {
    vendorCode: '',
    displayName: '',
    legalName: '',
    vendorType: 'supplier',
    email: '',
    phone: '',
    billingAddress: '',
    taxId: '',
    currencyReference: '',
    paymentTermReference: '',
    status: 'active',
    notes: '',
  };
}

function mapVendorBalanceDetailToFormState(detail: VendorBalanceDetail): VendorBalanceFormState {
  return {
    vendorCode: detail.vendorCode || '',
    displayName: detail.displayName || '',
    legalName: detail.legalName || '',
    vendorType: detail.vendorType || 'supplier',
    email: detail.email || '',
    phone: detail.phone || '',
    billingAddress: detail.billingAddress || '',
    taxId: detail.taxId || '',
    currencyReference: detail.currencyReferenceId || '',
    paymentTermReference: detail.paymentTermReferenceId || '',
    status: detail.status || 'active',
    notes: detail.notes || '',
  };
}

function buildFormFromDetail(detail: PaymentMadeDetail): PaymentMadeFormState {
  return {
    paymentNumber: detail.paymentNumber,
    vendor: detail.vendorId,
    paymentDate: toDateInputValue(detail.paymentDate),
    postingDate: toDateInputValue(detail.postingDate),
    paymentMethod: PAYMENT_METHOD_OPTIONS.some((option) => option.value === detail.paymentMethod)
      ? (detail.paymentMethod as PaymentMadeMutationInput['paymentMethod'])
      : 'bank_transfer',
    bankAccount: detail.bankAccountId,
    amountPaid: String(detail.amountPaid || 0),
    currency: detail.currency || 'PHP',
    exchangeRate: String(detail.exchangeRate || 1),
    referenceNumber: detail.referenceNumber || '',
    notes: detail.notes || '',
    applications: detail.applications.length
      ? detail.applications.map((application) => ({
          id: createLineId(),
          bill: application.billId,
          amountApplied: String(application.amountApplied || 0),
        }))
      : [createEmptyApplication()],
  };
}

function calculatePreview(formState: PaymentMadeFormState) {
  const amountPaid = Number(formState.amountPaid || 0);
  const appliedAmount = formState.applications.reduce(
    (sum, application) => sum + Number(application.amountApplied || 0),
    0,
  );
  const unappliedAmount = Math.max(0, amountPaid - appliedAmount);

  return {
    amountPaid,
    appliedAmount,
    unappliedAmount,
  };
}

function toMutationInput(formState: PaymentMadeFormState): PaymentMadeMutationInput {
  return {
    paymentNumber: formState.paymentNumber.trim() || null,
    vendor: formState.vendor,
    paymentDate: formState.paymentDate,
    postingDate: formState.postingDate,
    paymentMethod: formState.paymentMethod,
    bankAccount: formState.bankAccount,
    amountPaid: Number(formState.amountPaid || 0),
    currency: formState.currency.trim() || 'PHP',
    exchangeRate: Number(formState.exchangeRate || 1),
    referenceNumber: formState.referenceNumber.trim() || null,
    notes: formState.notes.trim() || null,
    applications: formState.applications
      .filter((application) => application.bill && Number(application.amountApplied || 0) > 0)
      .map((application) => ({
        bill: application.bill,
        amountApplied: Number(application.amountApplied || 0),
      })),
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

function renderCell(cell: PaymentsMadeCell, index: number) {
  if (typeof cell === 'string') {
    return (
      <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
        {cell}
      </td>
    );
  }

  const alignClass =
    cell.align === 'right' ? 'text-right' : cell.align === 'center' ? 'text-center' : 'text-left';

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
    <td
      key={index}
      className={`whitespace-nowrap px-4 py-3 text-sm ${cell.emphasis ? 'font-semibold text-gray-900' : 'text-gray-600'} ${alignClass}`}
    >
      {cell.text}
    </td>
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
        className={`flex w-full max-w-5xl flex-col bg-white shadow-xl transition-all duration-300 ease-in-out ${animate ? 'translate-x-0' : 'translate-x-full'}`}
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

function getColumnLabel(column: string | { label: string; align: string }) {
  return typeof column === 'string' ? column : column.label;
}

function getColumnAlign(column: string | { label: string; align: string }) {
  return typeof column === 'string' ? 'left' : column.align;
}

function PaymentMadeForm({
  formState,
  setFormState,
  data,
  mode,
  submitLabel,
  submitting,
  error,
  onSubmit,
}: {
  formState: PaymentMadeFormState;
  setFormState: React.Dispatch<React.SetStateAction<PaymentMadeFormState>>;
  data: PaymentsMadeRegisterResponse | null;
  mode: 'create' | 'edit';
  submitLabel: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (event: React.FormEvent) => void;
}) {
  const preview = useMemo(() => calculatePreview(formState), [formState]);
  const vendorOptions = useMemo(
    () => [
      { label: 'Select a vendor', value: '' },
      ...((data?.referenceData.vendors || []).map((vendor) => ({
        label: `${vendor.vendorCode ? `${vendor.vendorCode} - ` : ''}${vendor.displayName || `Vendor ${vendor.id}`}`,
        value: String(vendor.id),
      })) as Array<{ label: string; value: string }>),
    ],
    [data],
  );
  const bankAccountOptions = useMemo(
    () => [
      { label: 'Select a bank account', value: '' },
      ...((data?.referenceData.bankAccounts || []).map((bankAccount) => ({
        label: [
          bankAccount.accountName || `Bank Account ${bankAccount.id}`,
          bankAccount.bankName || null,
          bankAccount.accountNumberMasked || null,
          bankAccount.isActive ? null : 'Inactive',
        ]
          .filter(Boolean)
          .join(' - '),
        value: String(bankAccount.id),
      })) as Array<{ label: string; value: string }>),
    ],
    [data],
  );
  const billOptions = useMemo(() => {
    const rows = (data?.referenceData.bills || []).filter((bill) =>
      formState.vendor ? bill.vendorId === formState.vendor : false,
    );

    return [
      { label: formState.vendor ? 'Select a bill' : 'Select a vendor first', value: '' },
      ...rows.map((bill) => ({
        label: `${bill.billNumber || `Bill ${bill.id}`} - ${formatCurrency(bill.balanceDue, bill.currency || formState.currency || 'PHP')}`,
        value: String(bill.id),
      })),
    ];
  }, [data, formState.currency, formState.vendor]);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error ? (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Payment No.">
              <Input
                value={formState.paymentNumber}
                onChange={(value) => setFormState((previous) => ({ ...previous, paymentNumber: value }))}
                placeholder="Leave blank to auto-generate"
              />
            </FormField>
            <FormField label="Status">
              <Input value="Draft" disabled />
            </FormField>
            <FormField label="Vendor" required>
              <Select
                value={formState.vendor}
                onChange={(value) =>
                  setFormState((previous) => ({
                    ...previous,
                    vendor: value,
                    applications: previous.applications.map((application) => ({
                      ...application,
                      bill: '',
                    })),
                  }))
                }
                options={vendorOptions}
              />
            </FormField>
            <FormField label="Bank Account" required>
              <Select
                value={formState.bankAccount}
                onChange={(value) => setFormState((previous) => ({ ...previous, bankAccount: value }))}
                options={bankAccountOptions}
              />
            </FormField>
            <FormField label="Payment Date" required>
              <Input
                type="date"
                value={formState.paymentDate}
                onChange={(value) => setFormState((previous) => ({ ...previous, paymentDate: value }))}
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
            <FormField label="Payment Method" required>
              <Select
                value={formState.paymentMethod}
                onChange={(value) =>
                  setFormState((previous) => ({
                    ...previous,
                    paymentMethod: value as PaymentMadeMutationInput['paymentMethod'],
                  }))
                }
                options={PAYMENT_METHOD_OPTIONS}
              />
            </FormField>
            <FormField label="Currency" required>
              <Input
                value={formState.currency}
                onChange={(value) => setFormState((previous) => ({ ...previous, currency: value }))}
                required
              />
            </FormField>
            <FormField label="Amount Paid" required>
              <Input
                type="number"
                value={formState.amountPaid}
                onChange={(value) => setFormState((previous) => ({ ...previous, amountPaid: value }))}
                required
              />
            </FormField>
            <FormField label="Exchange Rate" required>
              <Input
                type="number"
                value={formState.exchangeRate}
                onChange={(value) => setFormState((previous) => ({ ...previous, exchangeRate: value }))}
                required
              />
            </FormField>
            <FormField label="Reference No.">
              <Input
                value={formState.referenceNumber}
                onChange={(value) => setFormState((previous) => ({ ...previous, referenceNumber: value }))}
                placeholder="Check no., transfer ref, or external reference"
              />
            </FormField>
            <FormField label="Mode">
              <Input value={mode === 'create' ? 'Create Draft Payment' : 'Edit Draft Payment'} disabled />
            </FormField>
          </div>

          <FormField label="Notes">
            <TextArea
              value={formState.notes}
              onChange={(value) => setFormState((previous) => ({ ...previous, notes: value }))}
              rows={4}
            />
          </FormField>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Bill Applications</h4>
                <p className="mt-1 text-sm text-gray-600">Allocate this payment to one or more vendor bills.</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormState((previous) => ({
                    ...previous,
                    applications: [...previous.applications, createEmptyApplication()],
                  }))
                }
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
                Add Application
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {formState.applications.map((application, index) => (
                <div key={application.id} className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-[minmax(0,1fr),180px,auto]">
                  <FormField label={`Bill ${index + 1}`} required>
                    <Select
                      value={application.bill}
                      onChange={(value) =>
                        setFormState((previous) => ({
                          ...previous,
                          applications: previous.applications.map((row) =>
                            row.id === application.id ? { ...row, bill: value } : row,
                          ),
                        }))
                      }
                      options={billOptions}
                      disabled={!formState.vendor}
                    />
                  </FormField>
                  <FormField label="Amount Applied" required>
                    <Input
                      type="number"
                      value={application.amountApplied}
                      onChange={(value) =>
                        setFormState((previous) => ({
                          ...previous,
                          applications: previous.applications.map((row) =>
                            row.id === application.id ? { ...row, amountApplied: value } : row,
                          ),
                        }))
                      }
                      required
                    />
                  </FormField>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() =>
                        setFormState((previous) => ({
                          ...previous,
                          applications:
                            previous.applications.length > 1
                              ? previous.applications.filter((row) => row.id !== application.id)
                              : [createEmptyApplication()],
                        }))
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h4 className="text-sm font-semibold text-gray-900">Payment Preview</h4>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">Amount Paid</span>
                <span className="font-semibold text-gray-900">{formatCurrency(preview.amountPaid, formState.currency || 'PHP')}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">Applied Amount</span>
                <span className="font-semibold text-gray-900">{formatCurrency(preview.appliedAmount, formState.currency || 'PHP')}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">Unapplied Amount</span>
                <span className="font-semibold text-gray-900">{formatCurrency(preview.unappliedAmount, formState.currency || 'PHP')}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h4 className="text-sm font-semibold text-gray-900">Read-Only Workflow Fields</h4>
            <div className="mt-4 space-y-4">
              <FormField label="Posting Status">
                <Input value="Unposted until the payment is posted" disabled />
              </FormField>
              <FormField label="Journal Link">
                <Input value="Created automatically during posting" disabled />
              </FormField>
              <FormField label="Fiscal Period">
                <Input value="Derived from posting workflow" disabled />
              </FormField>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function VendorBalancesPanel({ tab }: { tab: (typeof TABS)[number] }) {
  const [data, setData] = useState<VendorBalanceRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<VendorBalanceFilterState>({
    statuses: [],
    paymentTermIds: [],
    balanceStates: [],
  });
  const [draftFilters, setDraftFilters] = useState<VendorBalanceFilterState>({
    statuses: [],
    paymentTermIds: [],
    balanceStates: [],
  });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [viewDetail, setViewDetail] = useState<VendorBalanceDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [formState, setFormState] = useState<VendorBalanceFormState>(createEmptyVendorBalanceForm());
  const [editDetail, setEditDetail] = useState<VendorBalanceDetail | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VendorBalanceActionTarget | null>(null);
  const [deleteDetail, setDeleteDetail] = useState<VendorBalanceDetail | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filterCount = filters.statuses.length + filters.paymentTermIds.length + filters.balanceStates.length;

  const fetchVendorBalanceRegister = useCallback(
    async ({
      search,
      page,
      nextFilters,
      nextQuickFilters,
    }: {
      search: string;
      page: number;
      nextFilters: VendorBalanceFilterState;
      nextQuickFilters: string[];
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getVendorBalances({
          search,
          page,
          statuses: nextFilters.statuses,
          paymentTermIds: nextFilters.paymentTermIds,
          balanceStates: nextFilters.balanceStates,
          quickFilters: nextQuickFilters,
        });
        setData(response);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load vendor balances.');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchVendorBalanceRegister({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  }, [currentPage, fetchVendorBalanceRegister, filters, quickFilters, submittedSearch]);

  const refreshCurrentView = async () => {
    await fetchVendorBalanceRegister({
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
    void fetchVendorBalanceRegister({
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
    const headers = ['Vendor', 'Vendor Code', 'Payment Terms', 'Open Bills', 'Balance Due', 'Status'];
    const csvRows = rows.map((row) => [
      row.vendorLabel,
      row.vendorCode,
      row.paymentTermsLabel,
      row.openBillCount,
      row.balanceDueLabel,
      row.statusLabel,
    ]);
    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vendor-balances.csv';
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
      const detail = await getVendorBalanceDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load vendor balance detail.');
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
      const detail = await getVendorBalanceDetail(id);
      setEditDetail(detail);
      setFormState(mapVendorBalanceDetailToFormState(detail));
    } catch (detailError) {
      setEditError(detailError instanceof Error ? detailError.message : 'Unable to load vendor for editing.');
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
      const payload: VendorBalanceMutationInput = {
        vendorCode: formState.vendorCode || null,
        displayName: formState.displayName,
        legalName: formState.legalName || null,
        vendorType: formState.vendorType,
        email: formState.email || null,
        phone: formState.phone || null,
        billingAddress: formState.billingAddress || null,
        taxId: formState.taxId || null,
        status: formState.status,
        notes: formState.notes || null,
        currencyReference: formState.currencyReference || null,
        paymentTermReference: formState.paymentTermReference || null,
      };
      const updated = await updateVendorBalanceVendor(editingId, payload);
      setEditDetail(updated);
      setIsEditOpen(false);
      await refreshCurrentView();
      await handleView(String(updated.id));
    } catch (submitError) {
      setEditError(submitError instanceof Error ? submitError.message : 'Unable to update vendor.');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleOpenDelete = async (id: string, vendorLabel: string) => {
    setDeleteTarget({ id, vendorLabel });
    setDeleteDetail(null);
    setError(null);
    setIsDeleteLoading(true);
    try {
      const detail = await getVendorBalanceDetail(id);
      setDeleteDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load vendor dependency details.');
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteVendorBalanceVendor(deleteTarget.id);
      setDeleteTarget(null);
      setDeleteDetail(null);
      await refreshCurrentView();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete vendor.');
    } finally {
      setIsDeleting(false);
    }
  };

  const statusOptions = data?.referenceData.statuses || [];
  const vendorTypeOptions =
    data?.referenceData.vendorTypes || [{ label: 'Supplier', value: 'supplier' }];
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
                className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:border-blue-700 hover:bg-blue-700"
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
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                isFilterPanelOpen || filterCount > 0
                  ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
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
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  quickFilters.includes(filter.value)
                    ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
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
                  <p className="mt-1 text-sm text-gray-600">
                    Select as many filter values as needed, then apply them in one step.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const empty = { statuses: [], paymentTermIds: [], balanceStates: [] };
                      setDraftFilters(empty);
                      setFilters(empty);
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

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.statuses || []).map((option) => {
                      const isSelected = draftFilters.statuses.includes(option.value);
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
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'
                          }`}
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
                      const isSelected = draftFilters.paymentTermIds.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setDraftFilters((previous) => ({
                              ...previous,
                              paymentTermIds: toggleFilterValue(previous.paymentTermIds, option.value),
                            }))
                          }
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'
                          }`}
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
                      const isSelected = draftFilters.balanceStates.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setDraftFilters((previous) => ({
                              ...previous,
                              balanceStates: toggleFilterValue(previous.balanceStates, option.value),
                            }))
                          }
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'
                          }`}
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

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
            {(data?.metrics || []).map((metric) => (
              <div key={metric.id}>
                <MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} />
              </div>
            ))}
          </div>

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
            <LoadingSkeleton columnCount={(data?.meta.columns || tab.columns).length} />
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {(data?.meta.columns || tab.columns).map((column) => (
                          <th
                            key={getColumnLabel(column)}
                            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${
                              getColumnAlign(column) === 'right' ? 'text-right' : 'text-left'
                            }`}
                          >
                            {getColumnLabel(column)}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {data?.rows.length ? (
                        data.rows.map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50">
                            {row.cells.map((cell, index) => renderCell(cell, index))}
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleView(row.id)}
                                  className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                  title="View"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(row.id)}
                                  className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                  title="Edit vendor"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenDelete(row.id, row.vendorLabel)}
                                  className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                                  title="Delete vendor"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={(data?.meta.columns || tab.columns).length + 1} className="px-4 py-10 text-center text-sm text-gray-500">
                            No rows found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {data?.pagination.totalPages && data.pagination.totalPages > 1 ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Page {data.pagination.page} of {data.pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!data.pagination.hasPrevPage}
                      onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={!data.pagination.hasNextPage}
                      onClick={() => setCurrentPage((previous) => previous + 1)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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
        title="Vendor Balance Detail"
        description="Review vendor master data, open bill coverage, and dependency counts."
      >
        {isViewLoading ? (
          <LoadingSkeleton columnCount={2} />
        ) : viewDetail ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Vendor</p>
                <p className="mt-2 text-base font-semibold text-gray-900">{viewDetail.displayName || '-'}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Balance Due</p>
                <p className="mt-2 text-base font-semibold text-gray-900">{viewDetail.currentBalanceDueLabel}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Open Bills</p>
                <p className="mt-2 text-base font-semibold text-gray-900">{viewDetail.openBillCount}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Overdue Bills</p>
                <p className="mt-2 text-base font-semibold text-gray-900">{viewDetail.overdueBillCount}</p>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="space-y-4 rounded-xl border border-gray-200 p-4">
                <h4 className="text-sm font-semibold text-gray-900">Vendor Master</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="Vendor Code">
                    <Input value={viewDetail.vendorCode || '-'} disabled />
                  </FormField>
                  <FormField label="Vendor Type">
                    <Input value={viewDetail.vendorTypeLabel || '-'} disabled />
                  </FormField>
                  <FormField label="Payment Terms">
                    <Input value={viewDetail.paymentTermsLabel || '-'} disabled />
                  </FormField>
                  <FormField label="Currency">
                    <Input value={viewDetail.currencyLabel || '-'} disabled />
                  </FormField>
                  <FormField label="Status">
                    <Input value={viewDetail.statusLabel || '-'} disabled />
                  </FormField>
                  <FormField label="Latest Bill Date">
                    <Input value={viewDetail.latestBillDateLabel || '-'} disabled />
                  </FormField>
                </div>
              </div>

              <div className="space-y-4 rounded-xl border border-gray-200 p-4">
                <h4 className="text-sm font-semibold text-gray-900">Dependency Summary</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="Bill Count">
                    <Input value={String(viewDetail.usageSummary.billCount)} disabled />
                  </FormField>
                  <FormField label="Payments Made">
                    <Input value={String(viewDetail.usageSummary.paymentMadeCount)} disabled />
                  </FormField>
                  <FormField label="Vendor Credits">
                    <Input value={String(viewDetail.usageSummary.vendorCreditCount)} disabled />
                  </FormField>
                  <FormField label="Expenses">
                    <Input value={String(viewDetail.usageSummary.expenseCount)} disabled />
                  </FormField>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Open Bills</h4>
                  <p className="mt-1 text-sm text-gray-600">Current payable obligations still carrying balance due.</p>
                </div>
              </div>
              <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Bill', 'Bill Date', 'Due Date', 'Status', 'Balance Due'].map((column) => (
                          <th
                            key={column}
                            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${
                              column === 'Balance Due' ? 'text-right' : 'text-left'
                            }`}
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {viewDetail.openBills.length ? (
                        viewDetail.openBills.map((bill) => (
                          <tr key={bill.id}>
                            <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{bill.billNumber}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{bill.billDateLabel}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{bill.dueDateLabel}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{bill.statusLabel}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-gray-900">{bill.balanceDueLabel}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">No open bills recorded.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </SlideOver>

      <SlideOver
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingId(null);
        }}
        title="Edit Vendor"
        description="Update vendor master fields while keeping balance totals read-only."
      >
        {isEditLoading ? (
          <LoadingSkeleton columnCount={2} />
        ) : (
          <form onSubmit={handleSubmitEdit} className="space-y-6">
            {editError ? (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {editError}
              </div>
            ) : null}

            <div className="grid gap-6 xl:grid-cols-3">
              <div className="space-y-4 xl:col-span-2">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="Vendor Code" required>
                    <Input value={formState.vendorCode} onChange={(value) => setFormState((previous) => ({ ...previous, vendorCode: value }))} required />
                  </FormField>
                  <FormField label="Display Name" required>
                    <Input value={formState.displayName} onChange={(value) => setFormState((previous) => ({ ...previous, displayName: value }))} required />
                  </FormField>
                  <FormField label="Legal Name">
                    <Input value={formState.legalName} onChange={(value) => setFormState((previous) => ({ ...previous, legalName: value }))} />
                  </FormField>
                  <FormField label="Vendor Type" required>
                    <Select value={formState.vendorType} onChange={(value) => setFormState((previous) => ({ ...previous, vendorType: value }))} options={vendorTypeOptions} />
                  </FormField>
                  <FormField label="Email">
                    <Input value={formState.email} onChange={(value) => setFormState((previous) => ({ ...previous, email: value }))} />
                  </FormField>
                  <FormField label="Phone">
                    <Input value={formState.phone} onChange={(value) => setFormState((previous) => ({ ...previous, phone: value }))} />
                  </FormField>
                  <FormField label="Tax ID">
                    <Input value={formState.taxId} onChange={(value) => setFormState((previous) => ({ ...previous, taxId: value }))} />
                  </FormField>
                  <FormField label="Status" required>
                    <Select value={formState.status} onChange={(value) => setFormState((previous) => ({ ...previous, status: value }))} options={statusOptions} />
                  </FormField>
                  <FormField label="Currency" required>
                    <Select value={formState.currencyReference} onChange={(value) => setFormState((previous) => ({ ...previous, currencyReference: value }))} options={currencyOptions} />
                  </FormField>
                  <FormField label="Payment Terms" required>
                    <Select value={formState.paymentTermReference} onChange={(value) => setFormState((previous) => ({ ...previous, paymentTermReference: value }))} options={paymentTermOptions} />
                  </FormField>
                </div>
                <FormField label="Billing Address">
                  <TextArea value={formState.billingAddress} onChange={(value) => setFormState((previous) => ({ ...previous, billingAddress: value }))} rows={4} />
                </FormField>
                <FormField label="Notes">
                  <TextArea value={formState.notes} onChange={(value) => setFormState((previous) => ({ ...previous, notes: value }))} rows={4} />
                </FormField>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <h4 className="text-sm font-semibold text-gray-900">Read-Only Balance Fields</h4>
                  <div className="mt-4 space-y-4">
                    <FormField label="Current Balance Due">
                      <Input value={editDetail?.currentBalanceDueLabel || 'PHP 0.00'} disabled />
                    </FormField>
                    <FormField label="Open Bills">
                      <Input value={String(editDetail?.openBillCount || 0)} disabled />
                    </FormField>
                    <FormField label="Overdue Bills">
                      <Input value={String(editDetail?.overdueBillCount || 0)} disabled />
                    </FormField>
                    <FormField label="High Balance Portion">
                      <Input value={editDetail?.highBalanceAmountLabel || 'PHP 0.00'} disabled />
                    </FormField>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
              <button
                type="submit"
                disabled={isEditSubmitting}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isEditSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </SlideOver>

      <SlideOver
        isOpen={Boolean(deleteTarget)}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteDetail(null);
        }}
        title="Delete Vendor"
        description="Delete this vendor only when no payables references remain."
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Delete <span className="font-semibold text-gray-900">{deleteTarget?.vendorLabel || 'this vendor'}</span>?
            This cannot be undone.
          </p>

          {isDeleteLoading ? (
            <LoadingSkeleton columnCount={2} />
          ) : deleteDetail ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h4 className="text-sm font-semibold text-gray-900">Dependency Check</h4>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <FormField label="Bills">
                  <Input value={String(deleteDetail.usageSummary.billCount)} disabled />
                </FormField>
                <FormField label="Payments Made">
                  <Input value={String(deleteDetail.usageSummary.paymentMadeCount)} disabled />
                </FormField>
                <FormField label="Vendor Credits">
                  <Input value={String(deleteDetail.usageSummary.vendorCreditCount)} disabled />
                </FormField>
                <FormField label="Expenses">
                  <Input value={String(deleteDetail.usageSummary.expenseCount)} disabled />
                </FormField>
              </div>
              {!deleteDetail.usageSummary.canDelete ? (
                <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                  This vendor still has dependent accounting records and cannot be deleted.
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setDeleteTarget(null);
                setDeleteDetail(null);
              }}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting || !deleteDetail?.usageSummary.canDelete}
              className="rounded-lg border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete Vendor'}
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}

export function VendorPaymentsBalancesClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = TABS.find((tab) => tab.id === rawTab)?.id || 'payments-made';
  const currentTab = TABS.find((tab) => tab.id === activeTab) || TABS[0];

  const [data, setData] = useState<PaymentsMadeRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<PaymentsMadeFilterState>({
    statuses: [],
    paymentMethods: [],
    vendorIds: [],
    applicationStates: [],
  });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [draftFilters, setDraftFilters] = useState<PaymentsMadeFilterState>({
    statuses: [],
    paymentMethods: [],
    vendorIds: [],
    applicationStates: [],
  });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [formState, setFormState] = useState<PaymentMadeFormState>(createEmptyForm());
  const [viewDetail, setViewDetail] = useState<PaymentMadeDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | number | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [deleteLabel, setDeleteLabel] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [postingId, setPostingId] = useState<string | null>(null);

  const filterCount =
    filters.statuses.length +
    filters.paymentMethods.length +
    filters.vendorIds.length +
    filters.applicationStates.length;

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const fetchData = useCallback(
    async ({
      search,
      page,
      filters: nextFilters,
      nextQuickFilters,
    }: {
      search: string;
      page: number;
      filters: PaymentsMadeFilterState;
      nextQuickFilters: string[];
    }) => {
      if (activeTab !== 'payments-made') return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await getPaymentsMade({
          search,
          page,
          statuses: nextFilters.statuses,
          paymentMethods: nextFilters.paymentMethods,
          vendorIds: nextFilters.vendorIds,
          applicationStates: nextFilters.applicationStates,
          quickFilters: nextQuickFilters,
        });
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load payments made.');
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab],
  );

  useEffect(() => {
    if (activeTab === 'payments-made') {
      void fetchData({
        search: submittedSearch,
        page: currentPage,
        filters,
        nextQuickFilters: quickFilters,
      });
    }
  }, [activeTab, currentPage, fetchData, filters, quickFilters, submittedSearch]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput);
    setCurrentPage(1);
    void fetchData({
      search: searchInput,
      page: 1,
      filters,
      nextQuickFilters: quickFilters,
    });
  };

  const handleRefresh = () => {
    void fetchData({
      search: submittedSearch,
      page: currentPage,
      filters,
      nextQuickFilters: quickFilters,
    });
  };

  const handleToggleQuickFilter = (value: string) => {
    setQuickFilters((previous) => toggleFilterValue(previous, value));
    setCurrentPage(1);
  };

  const handleExport = () => {
    if (!data?.rows.length) return;
    const headers = ['Payment No.', 'Payment Date', 'Vendor', 'Method', 'Amount', 'Applied', 'Unapplied', 'Status'];
    const csvRows = data.rows.map((row) => [
      row.paymentNumber,
      row.paymentDateLabel,
      row.vendorLabel,
      row.paymentMethodLabel,
      row.amountPaidLabel,
      row.appliedAmountLabel,
      row.unappliedAmountLabel,
      row.statusLabel,
    ]);
    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((value) => escapeCsvValue(value)).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'payments-made.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenCreate = () => {
    setFormState(createEmptyForm());
    setCreateError(null);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreateError(null);
    setIsCreateSubmitting(true);
    try {
      await createPaymentMade(toMutationInput(formState));
      setIsCreateOpen(false);
      handleRefresh();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Unable to create payment.');
    } finally {
      setIsCreateSubmitting(false);
    }
  };

  const handleView = async (id: string | number) => {
    setIsViewOpen(true);
    setIsViewLoading(true);
    setViewError(null);
    setViewDetail(null);
    try {
      const detail = await getPaymentMadeDetail(id);
      setViewDetail(detail);
    } catch (err) {
      setViewError(err instanceof Error ? err.message : 'Unable to load payment.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleOpenEdit = async (id: string | number) => {
    setEditId(id);
    setIsEditOpen(true);
    setIsViewLoading(true);
    setEditError(null);
    try {
      const detail = await getPaymentMadeDetail(id);
      setFormState(buildFormFromDetail(detail));
      setViewDetail(detail);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Unable to load payment.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editId) return;
    setEditError(null);
    setIsEditSubmitting(true);
    try {
      await updatePaymentMade(editId, toMutationInput(formState));
      setIsEditOpen(false);
      setEditId(null);
      handleRefresh();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Unable to update payment.');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleOpenDelete = (row: PaymentMadeRow) => {
    setDeleteId(row.id);
    setDeleteLabel(row.paymentNumber);
    setDeleteError(null);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleteSubmitting(true);
    setDeleteError(null);
    try {
      await deletePaymentMade(deleteId);
      setIsDeleteOpen(false);
      setDeleteId(null);
      setDeleteLabel('');
      handleRefresh();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Unable to delete payment.');
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  const handlePost = async (id: string) => {
    setPostingId(id);
    setError(null);
    try {
      await postPaymentMade(id);
      handleRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to post payment.');
    } finally {
      setPostingId(null);
    }
  };

  if (activeTab === 'vendor-balances') {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Operations / Purchases & Payables</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">Vendor Payments & Balances</h1>
            <p className="mt-1 text-base text-gray-600">
              Manage vendor disbursements and vendor-level payable balances in one payables workspace.
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
                  className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <VendorBalancesPanel tab={currentTab} />
      </div>
    );
  }

  const liveColumns = data?.meta.columns || TABS[0].columns;
  const rows = data?.rows || [];
  const metrics = data?.metrics || [];
  const totalMatches = data?.totals.filteredRows || 0;
  const tableTitle = data?.meta.tableTitle || TABS[0].tableTitle;
  const tableDescription = data?.meta.tableDescription || TABS[0].tableDescription;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Operations / Purchases & Payables</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Vendor Payments & Balances</h1>
          <p className="mt-1 text-base text-gray-600">
            Manage vendor disbursements and vendor-level payable balances in one payables workspace.
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
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-gray-900">{currentTab.label}</h2>
            <p className="text-sm text-gray-600">{currentTab.description}</p>
            <p className="text-sm text-gray-500">{totalMatches} matching rows</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Payments
            </button>
            <button
              type="button"
              onClick={handleOpenCreate}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}
            >
              <Plus className="h-4 w-4" />
              Create Payment
            </button>
          </div>
        </div>

        {metrics.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.id}>
                <MetricCard
                  label={metric.label}
                  value={metric.value}
                  change={metric.change}
                  trend={metric.trend}
                />
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
                    placeholder={currentTab.searchPlaceholder}
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:border-blue-700 hover:bg-blue-700"
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
                className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  isFilterPanelOpen || filterCount > 0
                    ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
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
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    quickFilters.includes(filter.value)
                      ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
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
                    <p className="mt-1 text-sm text-gray-600">
                      Select as many filter values as needed, then apply them in one step.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const empty = {
                          statuses: [],
                          paymentMethods: [],
                          vendorIds: [],
                          applicationStates: [],
                        };
                        setDraftFilters(empty);
                        setFilters(empty);
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

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div>
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</h5>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(data?.filterOptions.statuses || []).map((option) => {
                        const isSelected = draftFilters.statuses.includes(option.value);
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
                            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'
                            }`}
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
                        const isSelected = draftFilters.paymentMethods.includes(option.value);
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setDraftFilters((previous) => ({
                                ...previous,
                                paymentMethods: toggleFilterValue(previous.paymentMethods, option.value),
                              }))
                            }
                            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'
                            }`}
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
                        const isSelected = draftFilters.vendorIds.includes(option.value);
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
                            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Application State</h5>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(data?.filterOptions.applicationStates || []).map((option) => {
                        const isSelected = draftFilters.applicationStates.includes(option.value);
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setDraftFilters((previous) => ({
                                ...previous,
                                applicationStates: toggleFilterValue(previous.applicationStates, option.value),
                              }))
                            }
                            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'
                            }`}
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
                <h3 className="text-base font-semibold text-gray-900">{tableTitle}</h3>
                <p className="text-sm text-gray-600">{tableDescription}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span>{totalMatches} matching rows</span>
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={!data?.rows.length}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  Download View
                </button>
              </div>
            </div>

            {error ? (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            ) : null}

            {isLoading ? (
              <LoadingSkeleton columnCount={liveColumns.length} />
            ) : (
              <>
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {liveColumns.map((column) => (
                            <th
                              key={getColumnLabel(column)}
                              className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${
                                getColumnAlign(column) === 'right' ? 'text-right' : 'text-left'
                              }`}
                            >
                              {getColumnLabel(column)}
                            </th>
                          ))}
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {rows.length > 0 ? (
                          rows.map((row) => {
                            const mutable = data?.flags.mutablePaymentIds.includes(row.id);
                            const liveRow = row as PaymentMadeRow;
                            return (
                              <tr key={row.id} className="hover:bg-gray-50">
                                {row.cells.map((cell, index) => renderCell(cell, index))}
                                <td className="px-4 py-3 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleView(liveRow.id)}
                                      className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                      title="View"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEdit(liveRow.id)}
                                      disabled={!mutable}
                                      className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                                      title={mutable ? 'Edit' : 'Only draft payments can be edited'}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenDelete(liveRow)}
                                      disabled={!mutable}
                                      className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                                      title={mutable ? 'Delete' : 'Only draft payments can be deleted'}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handlePost(liveRow.id)}
                                      disabled={!mutable || postingId === liveRow.id}
                                      className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                                      title={mutable ? 'Post payment' : 'Only draft payments can be posted'}
                                    >
                                      <SendHorizonal className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan={liveColumns.length + 1}
                              className="px-4 py-10 text-center text-sm text-gray-500"
                            >
                              No rows found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {data?.pagination.totalPages && data.pagination.totalPages > 1 ? (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Page {data.pagination.page} of {data.pagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={!data.pagination.hasPrevPage}
                        onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        disabled={!data.pagination.hasNextPage}
                        onClick={() => setCurrentPage((previous) => previous + 1)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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
      </div>

      <SlideOver
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Payment"
        description="Create a draft vendor payment with bank routing and bill applications."
      >
        <PaymentMadeForm
          formState={formState}
          setFormState={setFormState}
          data={data}
          mode="create"
          submitLabel={isCreateSubmitting ? 'Creating...' : 'Create Payment'}
          submitting={isCreateSubmitting}
          error={createError}
          onSubmit={handleCreateSubmit}
        />
      </SlideOver>

      <SlideOver
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditId(null);
        }}
        title="Edit Payment"
        description="Update the draft payment header, bank routing, and bill applications."
      >
        {isViewLoading ? (
          <LoadingSkeleton columnCount={2} />
        ) : (
          <PaymentMadeForm
            formState={formState}
            setFormState={setFormState}
            data={data}
            mode="edit"
            submitLabel={isEditSubmitting ? 'Saving...' : 'Save Changes'}
            submitting={isEditSubmitting}
            error={editError}
            onSubmit={handleEditSubmit}
          />
        )}
      </SlideOver>

      <SlideOver
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Payment Detail"
        description="Review payment header data, bill applications, and posting usage."
      >
        {isViewLoading ? (
          <LoadingSkeleton columnCount={2} />
        ) : viewError ? (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {viewError}
          </div>
        ) : viewDetail ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Payment No.</p>
                <p className="mt-2 text-base font-semibold text-gray-900">{viewDetail.paymentNumber}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Vendor</p>
                <p className="mt-2 text-base font-semibold text-gray-900">{viewDetail.vendorLabel}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</p>
                <p className="mt-2 text-base font-semibold text-gray-900">{viewDetail.statusLabel}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Amount Paid</p>
                <p className="mt-2 text-base font-semibold text-gray-900">{viewDetail.amountPaidLabel}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Applied Amount</p>
                <p className="mt-2 text-base font-semibold text-gray-900">{viewDetail.appliedAmountLabel}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Unapplied Amount</p>
                <p className="mt-2 text-base font-semibold text-gray-900">{viewDetail.unappliedAmountLabel}</p>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="space-y-4 rounded-xl border border-gray-200 p-4">
                <h4 className="text-sm font-semibold text-gray-900">Header Details</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="Payment Date">
                    <Input value={viewDetail.paymentDateLabel} disabled />
                  </FormField>
                  <FormField label="Posting Date">
                    <Input value={viewDetail.postingDateLabel} disabled />
                  </FormField>
                  <FormField label="Payment Method">
                    <Input value={viewDetail.paymentMethodLabel} disabled />
                  </FormField>
                  <FormField label="Bank Account">
                    <Input value={viewDetail.bankAccountLabel} disabled />
                  </FormField>
                  <FormField label="Reference No.">
                    <Input value={viewDetail.referenceNumber || '-'} disabled />
                  </FormField>
                  <FormField label="Posted Journal Entry">
                    <Input value={viewDetail.postedJournalEntryId || '-'} disabled />
                  </FormField>
                </div>
                <FormField label="Notes">
                  <textarea
                    value={viewDetail.notes || '-'}
                    disabled
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500"
                  />
                </FormField>
              </div>

              <div className="space-y-4 rounded-xl border border-gray-200 p-4">
                <h4 className="text-sm font-semibold text-gray-900">Usage Summary</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="Applications">
                    <Input value={String(viewDetail.usageSummary.applicationCount)} disabled />
                  </FormField>
                  <FormField label="Support Documents">
                    <Input value={String(viewDetail.usageSummary.documentCount)} disabled />
                  </FormField>
                  <FormField label="Matched Bank Transactions">
                    <Input value={String(viewDetail.usageSummary.matchedBankTransactionCount)} disabled />
                  </FormField>
                  <FormField label="Editable">
                    <Input value={viewDetail.usageSummary.canEdit ? 'Yes' : 'No'} disabled />
                  </FormField>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Bill Applications</h4>
                  <p className="mt-1 text-sm text-gray-600">Applied bill allocations tied to this payment.</p>
                </div>
              </div>
              <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Bill', 'Bill Status', 'Balance Due', 'Amount Applied'].map((column) => (
                          <th
                            key={column}
                            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${
                              column.includes('Amount') || column.includes('Balance') ? 'text-right' : 'text-left'
                            }`}
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {viewDetail.applications.length > 0 ? (
                        viewDetail.applications.map((application) => (
                          <tr key={application.id}>
                            <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                              {application.billLabel}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                              {application.billStatusLabel}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-600">
                              {application.billBalanceDueLabel}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-gray-900">
                              {application.amountAppliedLabel}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                            No bill applications recorded.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </SlideOver>

      <SlideOver
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Payment"
        description="Delete this draft payment if it has no blocking dependencies."
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Delete <span className="font-semibold text-gray-900">{deleteLabel}</span>? This cannot be undone.
          </p>
          {deleteError ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {deleteError}
            </div>
          ) : null}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleteSubmitting}
              className="rounded-lg border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleteSubmitting ? 'Deleting...' : 'Delete Payment'}
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
