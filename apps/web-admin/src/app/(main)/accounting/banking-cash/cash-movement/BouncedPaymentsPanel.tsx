'use client';

import React, { useCallback, useEffect, useState } from 'react';
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
  createBouncedPayment,
  deleteBouncedPayment,
  getBouncedPaymentDetail,
  getBouncedPayments,
  reverseBouncedPayment,
  updateBouncedPayment,
  type BouncedPaymentCell,
  type BouncedPaymentDetail,
  type BouncedPaymentMetric,
  type BouncedPaymentMutationInput,
  type BouncedPaymentRegisterResponse,
  type BouncedPaymentRow,
} from './actions';

type BouncedPaymentFilterState = {
  statuses: string[];
  reasons: string[];
  customerIds: string[];
};

type BouncedPaymentFormState = {
  caseNumber: string;
  originalPayment: string;
  bounceDate: string;
  bankNoticeDate: string;
  bounceReason: string;
  caseStatus: string;
  bankChargeAmount: string;
  chargeExpenseAccount: string;
  recoveryPayment: string;
  recoveryDate: string;
  followUpDate: string;
  resolutionDate: string;
  notes: string;
  resolutionNotes: string;
};

const LIVE_TAB = {
  id: 'bounced-payments',
  label: 'Bounced Payments',
  description: 'Track failed incoming payments, reversal journals, bank charges, and customer recovery follow-up using live accounting data.',
  searchPlaceholder: 'Search case no., customer, receipt no., bounce reason, or journal reference',
} as const;

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  if (variant === 'ghost') return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
}

function getMetricTone(trend: BouncedPaymentMetric['trend']) {
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

function toDateInputValue(value: string | null | undefined) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function createEmptyForm(): BouncedPaymentFormState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    caseNumber: '',
    originalPayment: '',
    bounceDate: today,
    bankNoticeDate: today,
    bounceReason: 'insufficient_funds',
    caseStatus: 'awaiting_reversal',
    bankChargeAmount: '0',
    chargeExpenseAccount: '',
    recoveryPayment: '',
    recoveryDate: '',
    followUpDate: '',
    resolutionDate: '',
    notes: '',
    resolutionNotes: '',
  };
}

function buildFormFromDetail(detail: BouncedPaymentDetail): BouncedPaymentFormState {
  return {
    caseNumber: detail.caseNumber || '',
    originalPayment: detail.originalPaymentId || '',
    bounceDate: toDateInputValue(detail.bounceDate),
    bankNoticeDate: toDateInputValue(detail.bankNoticeDate),
    bounceReason: detail.bounceReason || 'insufficient_funds',
    caseStatus: detail.caseStatus || 'open',
    bankChargeAmount: String(detail.bankChargeAmount || 0),
    chargeExpenseAccount: detail.chargeExpenseAccountId || '',
    recoveryPayment: detail.recoveryPaymentId || '',
    recoveryDate: toDateInputValue(detail.recoveryDate),
    followUpDate: toDateInputValue(detail.followUpDate),
    resolutionDate: toDateInputValue(detail.resolutionDate),
    notes: detail.notes || '',
    resolutionNotes: detail.resolutionNotes || '',
  };
}

function toMutationInput(formState: BouncedPaymentFormState): BouncedPaymentMutationInput {
  return {
    caseNumber: formState.caseNumber.trim() || null,
    originalPayment: formState.originalPayment,
    bounceDate: formState.bounceDate,
    bankNoticeDate: formState.bankNoticeDate || null,
    bounceReason: formState.bounceReason,
    caseStatus: formState.caseStatus || null,
    bankChargeAmount: Number(formState.bankChargeAmount || 0),
    chargeExpenseAccount: formState.chargeExpenseAccount || null,
    recoveryPayment: formState.recoveryPayment || null,
    recoveryDate: formState.recoveryDate || null,
    followUpDate: formState.followUpDate || null,
    resolutionDate: formState.resolutionDate || null,
    notes: formState.notes.trim() || null,
    resolutionNotes: formState.resolutionNotes.trim() || null,
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
      return;
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
        className={`flex w-full max-w-2xl flex-col bg-white shadow-xl transition-all duration-300 ease-in-out ${animate ? 'translate-x-0' : 'translate-x-full'}`}
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
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
    />
  );
}

function Select({
  value,
  onChange,
  options,
  required,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required={required}
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
                {Array.from({ length: columnCount }).map((_, index) => (
                  <th key={index} className="px-4 py-3">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan={columnCount} className="px-4 py-3">
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

function renderCell(cell: BouncedPaymentCell, index: number) {
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

export function BouncedPaymentsPanel() {
  const [data, setData] = useState<BouncedPaymentRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<BouncedPaymentFilterState>({ statuses: [], reasons: [], customerIds: [] });
  const [draftFilters, setDraftFilters] = useState<BouncedPaymentFilterState>({ statuses: [], reasons: [], customerIds: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const [viewDetail, setViewDetail] = useState<BouncedPaymentDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);

  const [createForm, setCreateForm] = useState<BouncedPaymentFormState>(createEmptyForm());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<BouncedPaymentFormState>(createEmptyForm());
  const [editDetail, setEditDetail] = useState<BouncedPaymentDetail | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<BouncedPaymentRow | null>(null);
  const [deleteDetail, setDeleteDetail] = useState<BouncedPaymentDetail | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [reverseTarget, setReverseTarget] = useState<BouncedPaymentDetail | null>(null);
  const [isReverseOpen, setIsReverseOpen] = useState(false);
  const [isReverseLoading, setIsReverseLoading] = useState(false);
  const [isReverseSubmitting, setIsReverseSubmitting] = useState(false);
  const [reverseError, setReverseError] = useState<string | null>(null);

  const filterCount = filters.statuses.length + filters.reasons.length + filters.customerIds.length;

  const fetchRegister = useCallback(
    async ({
      search,
      page,
      nextFilters,
      nextQuickFilters,
    }: {
      search: string;
      page: number;
      nextFilters: BouncedPaymentFilterState;
      nextQuickFilters: string[];
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getBouncedPayments({
          search,
          page,
          statuses: nextFilters.statuses,
          reasons: nextFilters.reasons,
          customerIds: nextFilters.customerIds,
          quickFilters: nextQuickFilters,
        });
        setData(response);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load bounced payments.');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

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

  const handleToggleQuickFilter = (value: string) => {
    setQuickFilters((previous) => toggleFilterValue(previous, value));
    setCurrentPage(1);
  };

  const handleExport = () => {
    if (!data?.rows.length) return;
    const headers = ['Case ID', 'Customer', 'Original Receipt', 'Bounce Reason', 'Exposure', 'Case Status', 'Reversal Journal', 'Recovery Payment'];
    const csvRows = data.rows.map((row) => [
      row.caseNumber,
      row.customerLabel,
      row.originalReceiptNumber,
      row.bounceReasonLabel,
      row.exposureAmountLabel,
      row.caseStatusLabel,
      row.reversalJournalEntryLabel,
      row.recoveryPaymentLabel,
    ]);
    const csvContent = [headers, ...csvRows].map((row) => row.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cash-movement-bounced-payments.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenView = async (id: string) => {
    setIsViewOpen(true);
    setIsViewLoading(true);
    setViewDetail(null);
    try {
      const detail = await getBouncedPaymentDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load bounced-payment detail.');
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
      await createBouncedPayment(toMutationInput(createForm));
      setIsCreateOpen(false);
      setCurrentPage(1);
      await fetchRegister({ search: submittedSearch, page: 1, nextFilters: filters, nextQuickFilters: quickFilters });
    } catch (submissionError) {
      setCreateError(submissionError instanceof Error ? submissionError.message : 'Unable to create bounced-payment case.');
    } finally {
      setIsCreateSubmitting(false);
    }
  };

  const handleOpenEdit = async (id: string) => {
    setEditingId(id);
    setEditError(null);
    setIsEditOpen(true);
    setIsEditLoading(true);
    try {
      const detail = await getBouncedPaymentDetail(id);
      setEditDetail(detail);
      setEditForm(buildFormFromDetail(detail));
    } catch (detailError) {
      setEditError(detailError instanceof Error ? detailError.message : 'Unable to load bounced-payment detail.');
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingId) return;
    setEditError(null);
    setIsEditSubmitting(true);
    try {
      await updateBouncedPayment(editingId, toMutationInput(editForm));
      setIsEditOpen(false);
      setEditingId(null);
      setEditDetail(null);
      handleRefresh();
    } catch (submissionError) {
      setEditError(submissionError instanceof Error ? submissionError.message : 'Unable to update bounced-payment case.');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleOpenDelete = async (row: BouncedPaymentRow) => {
    setDeleteTarget(row);
    setDeleteDetail(null);
    setDeleteError(null);
    setIsDeleteOpen(true);
    setIsDeleteLoading(true);
    try {
      const detail = await getBouncedPaymentDetail(row.id);
      setDeleteDetail(detail);
    } catch (detailError) {
      setDeleteError(detailError instanceof Error ? detailError.message : 'Unable to load bounced-payment detail.');
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleteSubmitting(true);
    setDeleteError(null);
    try {
      await deleteBouncedPayment(deleteTarget.id);
      setIsDeleteOpen(false);
      setDeleteTarget(null);
      setDeleteDetail(null);
      handleRefresh();
    } catch (deletionError) {
      setDeleteError(deletionError instanceof Error ? deletionError.message : 'Unable to delete bounced-payment case.');
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  const handleOpenReverse = async (row: BouncedPaymentRow) => {
    setReverseError(null);
    setIsReverseOpen(true);
    setIsReverseLoading(true);
    try {
      const detail = await getBouncedPaymentDetail(row.id);
      setReverseTarget(detail);
    } catch (detailError) {
      setReverseError(detailError instanceof Error ? detailError.message : 'Unable to load bounced-payment detail.');
    } finally {
      setIsReverseLoading(false);
    }
  };

  const handleConfirmReverse = async () => {
    if (!reverseTarget) return;
    setIsReverseSubmitting(true);
    setReverseError(null);
    try {
      await reverseBouncedPayment(reverseTarget.id);
      setIsReverseOpen(false);
      setReverseTarget(null);
      handleRefresh();
    } catch (reversalError) {
      setReverseError(reversalError instanceof Error ? reversalError.message : 'Unable to post reversal for this bounced-payment case.');
    } finally {
      setIsReverseSubmitting(false);
    }
  };

  const originalPaymentOptions = [{ label: 'Select posted receipt', value: '' }].concat(
    (data?.referenceData.originalPayments || []).map((payment) => ({
      label: `${payment.receiptNumber || `Receipt ${payment.id}`} - ${payment.customerLabel} - ${payment.amountReceived.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}`,
      value: String(payment.id),
    })),
  );

  const chargeExpenseOptions = [{ label: 'No bank charge account', value: '' }].concat(
    (data?.referenceData.chargeExpenseAccounts || []).map((account) => ({
      label: `${account.code ? `${account.code} - ` : ''}${account.name || `Account ${account.id}`}`,
      value: String(account.id),
    })),
  );

  const recoveryPaymentOptions = [{ label: 'No recovery payment linked', value: '' }].concat(
    (data?.referenceData.originalPayments || []).map((payment) => ({
      label: `${payment.receiptNumber || `Receipt ${payment.id}`} - ${payment.customerLabel} - ${payment.amountReceived.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}`,
      value: String(payment.id),
    })),
  );

  const reasonOptions = [{ label: 'Select reason', value: '' }].concat(
    (data?.filterOptions.reasons || []).map((option) => ({ label: option.label, value: option.value })),
  );

  const statusOptions = [{ label: 'Select status', value: '' }].concat(
    (data?.filterOptions.statuses || []).map((option) => ({ label: option.label, value: option.value })),
  );

  const renderForm = (
    formState: BouncedPaymentFormState,
    setFormState: React.Dispatch<React.SetStateAction<BouncedPaymentFormState>>,
    submitLabel: string,
    isSubmitting: boolean,
    errorMessage: string | null,
    onCancel: () => void,
    onSubmit: (event: React.FormEvent) => void,
    options?: {
      lockFinancialCore?: boolean;
      lockFinancialMessage?: string | null;
    },
  ) => (
    <form onSubmit={onSubmit} className="space-y-6">
      {errorMessage ? (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      ) : null}

      {options?.lockFinancialMessage ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">Financial core is locked.</p>
          <p className="mt-1">{options.lockFinancialMessage}</p>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Case No.">
          <Input value={formState.caseNumber} onChange={(value) => setFormState((previous) => ({ ...previous, caseNumber: value }))} placeholder="Auto-generated when blank" />
        </FormField>
        <FormField label="Original Payment" required>
          <Select value={formState.originalPayment} onChange={(value) => setFormState((previous) => ({ ...previous, originalPayment: value }))} options={originalPaymentOptions} required disabled={options?.lockFinancialCore} />
        </FormField>
        <FormField label="Bounce Date" required>
          <Input type="date" value={formState.bounceDate} onChange={(value) => setFormState((previous) => ({ ...previous, bounceDate: value }))} required disabled={options?.lockFinancialCore} />
        </FormField>
        <FormField label="Bank Notice Date">
          <Input type="date" value={formState.bankNoticeDate} onChange={(value) => setFormState((previous) => ({ ...previous, bankNoticeDate: value }))} disabled={options?.lockFinancialCore} />
        </FormField>
        <FormField label="Bounce Reason" required>
          <Select value={formState.bounceReason} onChange={(value) => setFormState((previous) => ({ ...previous, bounceReason: value }))} options={reasonOptions} required disabled={options?.lockFinancialCore} />
        </FormField>
        <FormField label="Case Status">
          <Select value={formState.caseStatus} onChange={(value) => setFormState((previous) => ({ ...previous, caseStatus: value }))} options={statusOptions} />
        </FormField>
        <FormField label="Bank Charge Amount">
          <Input type="number" value={formState.bankChargeAmount} onChange={(value) => setFormState((previous) => ({ ...previous, bankChargeAmount: value }))} disabled={options?.lockFinancialCore} />
        </FormField>
        <FormField label="Charge Expense Account">
          <Select value={formState.chargeExpenseAccount} onChange={(value) => setFormState((previous) => ({ ...previous, chargeExpenseAccount: value }))} options={chargeExpenseOptions} disabled={options?.lockFinancialCore} />
        </FormField>
        <FormField label="Recovery Payment">
          <Select value={formState.recoveryPayment} onChange={(value) => setFormState((previous) => ({ ...previous, recoveryPayment: value }))} options={recoveryPaymentOptions} />
        </FormField>
        <FormField label="Recovery Date">
          <Input type="date" value={formState.recoveryDate} onChange={(value) => setFormState((previous) => ({ ...previous, recoveryDate: value }))} />
        </FormField>
        <FormField label="Follow-up Date">
          <Input type="date" value={formState.followUpDate} onChange={(value) => setFormState((previous) => ({ ...previous, followUpDate: value }))} />
        </FormField>
        <FormField label="Resolution Date">
          <Input type="date" value={formState.resolutionDate} onChange={(value) => setFormState((previous) => ({ ...previous, resolutionDate: value }))} />
        </FormField>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h4 className="text-sm font-semibold text-gray-900">Reversal Guidance</h4>
        <p className="mt-1 text-sm text-gray-600">Create the bounce case first, review the linked posted receipt, then use the dedicated Post Reversal action from the table when the bank return is confirmed.</p>
      </div>

      <FormField label="Notes">
        <TextArea value={formState.notes} onChange={(value) => setFormState((previous) => ({ ...previous, notes: value }))} rows={4} />
      </FormField>

      <FormField label="Resolution Notes">
        <TextArea value={formState.resolutionNotes} onChange={(value) => setFormState((previous) => ({ ...previous, resolutionNotes: value }))} rows={3} />
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">{data?.meta.label || LIVE_TAB.label}</h2>
          <p className="text-sm text-gray-600">{data?.meta.description || LIVE_TAB.description}</p>
          <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" />
            Refresh Cases
          </button>
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
            <Plus className="h-4 w-4" />
            Create Bounce Case
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {(data?.metrics || []).map((metric) => (
          <div key={metric.id}>
            <MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <form onSubmit={handleSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={data?.meta.searchPlaceholder || LIVE_TAB.searchPlaceholder}
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
                  <p className="mt-1 text-sm text-gray-600">Select as many filter values as needed. Bounced-payment filters widen results using OR behavior across all checked options.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => { setDraftFilters({ statuses: [], reasons: [], customerIds: [] }); setFilters({ statuses: [], reasons: [], customerIds: [] }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">
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

              <div className="mt-6 grid gap-6 md:grid-cols-3">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Case Status</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.statuses || []).map((option) => {
                      const isSelected = draftFilters.statuses.includes(option.value);
                      return (
                        <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Reason</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.reasons || []).map((option) => {
                      const isSelected = draftFilters.reasons.includes(option.value);
                      return (
                        <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, reasons: toggleFilterValue(previous.reasons, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>
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
                      const isSelected = draftFilters.customerIds.includes(option.value);
                      return (
                        <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, customerIds: toggleFilterValue(previous.customerIds, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>
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
              <h3 className="text-base font-semibold text-gray-900">{data?.meta.tableTitle || 'Bounced Payment Caseboard'}</h3>
              <p className="text-sm text-gray-600">{data?.meta.tableDescription || 'Live bounced-payment cases with reversal and recovery visibility.'}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span>{data?.totals.filteredRows ?? 0} matching rows</span>
              <button type="button" onClick={handleExport} disabled={!(data?.rows.length)} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
                <Download className="h-4 w-4" />
                Export View
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
            <LoadingSkeleton columnCount={(data?.meta.columns || []).length + 1 || 7} />
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {(data?.meta.columns || ['Case ID', 'Customer', 'Original Receipt', 'Bounce Reason', { label: 'Exposure', align: 'right' }, 'Case Status']).map((column) => {
                          const label = typeof column === 'string' ? column : column.label;
                          const align = typeof column === 'string' ? 'left' : column.align;
                          return (
                            <th key={label} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${align === 'right' ? 'text-right' : 'text-left'}`}>
                              {label}
                            </th>
                          );
                        })}
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
                                <button type="button" onClick={() => handleOpenView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => handleOpenReverse(row)} disabled={row.hasReversal} className="inline-flex items-center gap-1 rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40" title={row.hasReversal ? 'Reversal already posted' : 'Post reversal'}>
                                  <SendHorizonal className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => handleOpenEdit(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="Edit">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => handleOpenDelete(row)} disabled={row.hasReversal || row.hasChargeJournal} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40" title={row.hasReversal || row.hasChargeJournal ? 'Cannot delete after journals are posted' : 'Delete'}>
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                            No bounced-payment cases match the current search and filter combination.
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

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Bounced Payment Detail" description="Review the original receipt, reversal status, charge journals, and recovery handling for this bounced-payment case.">
        {isViewLoading ? (
          <LoadingSkeleton columnCount={2} />
        ) : viewDetail ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['Case No.', viewDetail.caseNumber],
                ['Customer', viewDetail.customerLabel],
                ['Original Receipt', viewDetail.originalReceiptNumber],
                ['Original Payment Amount', viewDetail.originalPaymentAmountLabel],
                ['Bounce Reason', viewDetail.bounceReasonLabel],
                ['Case Status', viewDetail.caseStatusLabel],
                ['Exposure', viewDetail.exposureAmountLabel],
                ['Bank Charge', viewDetail.bankChargeAmountLabel],
                ['Original Journal', viewDetail.originalJournalEntryLabel],
                ['Reversal Journal', viewDetail.reversalJournalEntryLabel],
                ['Charge Journal', viewDetail.chargeJournalEntryLabel],
                ['Recovery Payment', viewDetail.recoveryPaymentLabel],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                  <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className={`rounded-xl border p-4 shadow-sm ${viewDetail.hasReversal ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Reversal Status</p>
                <p className="mt-2 text-sm font-medium text-gray-900">{viewDetail.hasReversal ? 'Reversal journal posted' : 'Awaiting reversal posting'}</p>
              </div>
              <div className={`rounded-xl border p-4 shadow-sm ${viewDetail.hasBankCharge ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Bank Charge</p>
                <p className="mt-2 text-sm font-medium text-gray-900">{viewDetail.hasBankCharge ? `${viewDetail.bankChargeAmountLabel} charged to ${viewDetail.chargeExpenseAccountLabel}` : 'No bank charge applied'}</p>
              </div>
              <div className={`rounded-xl border p-4 shadow-sm ${viewDetail.hasRecovery ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Recovery</p>
                <p className="mt-2 text-sm font-medium text-gray-900">{viewDetail.hasRecovery ? `${viewDetail.recoveryPaymentLabel} recovered ${viewDetail.recoveryAmountLabel}` : 'No recovery receipt linked yet'}</p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900">Notes</h4>
              <p className="mt-2 text-sm text-gray-700">{viewDetail.notes || '-'}</p>
              <h4 className="mt-4 text-sm font-semibold text-gray-900">Resolution Notes</h4>
              <p className="mt-2 text-sm text-gray-700">{viewDetail.resolutionNotes || '-'}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No detail available.</p>
        )}
      </SlideOver>

      <SlideOver isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Bounce Case" description="Create a real bounced-payment case linked to an already posted customer receipt.">
        {renderForm(createForm, setCreateForm, 'Create Case', isCreateSubmitting, createError, () => setIsCreateOpen(false), handleCreateSubmit)}
      </SlideOver>

      <SlideOver isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Bounce Case" description="Update follow-up, recovery, and resolution details while respecting posted reversal journals.">
        {isEditLoading ? (
          <LoadingSkeleton columnCount={2} />
        ) : (
          renderForm(
            editForm,
            setEditForm,
            'Save Changes',
            isEditSubmitting,
            editError,
            () => setIsEditOpen(false),
            handleEditSubmit,
            {
              lockFinancialCore: Boolean(editDetail?.usageSummary.financialLockReason),
              lockFinancialMessage: editDetail?.usageSummary.financialLockReason || null,
            },
          )
        )}
      </SlideOver>

      <SlideOver isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Bounce Case" description="Delete this bounced-payment case only if no reversal or charge journal has been posted.">
        <div className="space-y-6">
          {deleteError ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {deleteError}
            </div>
          ) : null}

          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Delete {deleteTarget?.caseNumber || 'this bounced-payment case'}?</p>
            <p className="mt-1">This action cannot be undone.</p>
          </div>

          {isDeleteLoading ? (
            <LoadingSkeleton columnCount={2} />
          ) : deleteDetail && !deleteDetail.usageSummary.canDelete ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-medium">Delete is blocked.</p>
              <p className="mt-1">{deleteDetail.usageSummary.deleteBlockedReason || 'This case cannot be deleted.'}</p>
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setIsDeleteOpen(false)} disabled={isDeleteSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleteSubmitting || (deleteDetail ? !deleteDetail.usageSummary.canDelete : true)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {isDeleteSubmitting ? 'Deleting...' : 'Delete Case'}
            </button>
          </div>
        </div>
      </SlideOver>

      <SlideOver isOpen={isReverseOpen} onClose={() => setIsReverseOpen(false)} title="Post Reversal" description="Post the reversal journal for this bounced-payment case and create the optional bank-charge journal if needed.">
        <div className="space-y-6">
          {reverseError ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {reverseError}
            </div>
          ) : null}

          {isReverseLoading ? (
            <LoadingSkeleton columnCount={2} />
          ) : reverseTarget ? (
            <>
              {!reverseTarget.usageSummary.canReverse ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <p className="font-medium">Reversal is blocked.</p>
                  <p className="mt-1">{reverseTarget.usageSummary.reverseBlockedReason || 'This bounced-payment case cannot be reversed.'}</p>
                </div>
              ) : null}

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-sm text-gray-500">Case No.</span>
                  <span className="text-sm font-medium text-gray-900">{reverseTarget.caseNumber}</span>
                </div>
                <div className="mt-3 flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-sm text-gray-500">Original Receipt</span>
                  <span className="text-sm font-medium text-gray-900">{reverseTarget.originalReceiptNumber}</span>
                </div>
                <div className="mt-3 flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-sm text-gray-500">Exposure</span>
                  <span className="text-sm font-medium text-gray-900">{reverseTarget.exposureAmountLabel}</span>
                </div>
                <div className="mt-3 flex justify-between">
                  <span className="text-sm text-gray-500">Bank Charge</span>
                  <span className="text-sm font-medium text-gray-900">{reverseTarget.bankChargeAmountLabel}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">Loading bounced-payment detail...</p>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setIsReverseOpen(false)} disabled={isReverseSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={handleConfirmReverse} disabled={isReverseSubmitting || !reverseTarget?.usageSummary.canReverse} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {isReverseSubmitting ? 'Posting...' : 'Post Reversal'}
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
