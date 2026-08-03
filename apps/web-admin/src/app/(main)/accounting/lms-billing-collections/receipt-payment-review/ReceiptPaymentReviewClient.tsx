'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Ban,
  CheckCircle,
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
  createReceipt,
  deleteReceipt,
  getReceiptDetail,
  getReceipts,
  issueReceipt,
  updateReceipt,
  voidReceipt,
  type Cell,
  type Metric,
  type ReceiptDetail,
  type ReceiptMutationInput,
  type ReceiptRegisterResponse,
} from './actions';

type TabId = 'receipts' | 'proof-of-payment';
type ReceiptFilterState = { statuses: string[]; customerIds: string[]; proofStates: string[] };
type ReceiptActionTarget = { id: string; receiptNumber: string };

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
    id: 'receipts',
    label: 'Receipts',
    description: 'Review LMS-linked official receipts by receipt number, payment, customer, billing link, amount, receipt date, and receipt status.',
    searchPlaceholder: 'Search receipt number, payment, customer, billing link, amount, or status',
    columns: ['Receipt Number', 'Receipt Date', 'Customer', 'Payment Ref', 'Amount', 'Status'],
    tableTitle: 'Receipt Register',
    tableDescription: 'Receipt records aligned to accounting-receipts, including the payment relationship, customer, amount, proof document, and status.',
  },
  {
    id: 'proof-of-payment',
    label: 'Proof of Payment',
    description: 'Review payment-proof coverage using receipt proof documents and the receipt-to-payment linkage used to validate LMS payment collection evidence.',
    searchPlaceholder: 'Search receipt number, payment, customer, proof document, or proof state',
    columns: ['Receipt Number', 'Payment', 'Customer', 'Proof File', 'Receipt Date', 'Proof State'],
    tableTitle: 'Proof Of Payment Register',
    tableDescription: 'Receipt proof coverage aligned to the proofDocument field on accounting-receipts, shown with the related payment and customer context.',
  },
];

const RECEIPT_STATUSES = new Set(['draft']);

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

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </label>
      {children}
    </div>
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
                {Array.from({ length: 7 }).map((_, index) => (
                  <th key={index} className="px-4 py-3">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[var(--card-background)]">
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan={7} className="px-4 py-3">
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

export function ReceiptPaymentReviewClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = (STATIC_TABS.find((tab) => tab.id === rawTab)?.id) || 'receipts';
  const currentTab = STATIC_TABS.find((tab) => tab.id === activeTab) || STATIC_TABS[0];

  // State for receipts tab
  const [receiptData, setReceiptData] = useState<ReceiptRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Receipts search/filter/pagination
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ReceiptFilterState>({ statuses: [], customerIds: [], proofStates: [] });
  const [draftFilters, setDraftFilters] = useState<ReceiptFilterState>({ statuses: [], customerIds: [], proofStates: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Proof of payment search/filter/pagination
  const [proofSearchInput, setProofSearchInput] = useState('');
  const [proofSubmittedSearch, setProofSubmittedSearch] = useState('');
  const [proofCurrentPage, setProofCurrentPage] = useState(1);
  const [proofFilters, setProofFilters] = useState<ReceiptFilterState>({ statuses: [], customerIds: [], proofStates: [] });
  const [proofDraftFilters, setProofDraftFilters] = useState<ReceiptFilterState>({ statuses: [], customerIds: [], proofStates: [] });
  const [proofQuickFilters, setProofQuickFilters] = useState<string[]>([]);
  const [isProofFilterPanelOpen, setIsProofFilterPanelOpen] = useState(false);

  // View detail
  const [viewDetail, setViewDetail] = useState<ReceiptDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);

  // Receipt actions
  const [deleteTarget, setDeleteTarget] = useState<ReceiptActionTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [issueTarget, setIssueTarget] = useState<ReceiptActionTarget | null>(null);
  const [isIssuing, setIsIssuing] = useState(false);
  const [voidTarget, setVoidTarget] = useState<ReceiptActionTarget | null>(null);
  const [isVoiding, setIsVoiding] = useState(false);

  // Receipt form (create/edit)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function createEmptyFormState() {
    return {
      paymentReceived: '',
      proofDocument: '',
      notes: '',
    };
  }

  const [formState, setFormState] = useState<ReturnType<typeof createEmptyFormState>>(createEmptyFormState());

  const filterCount = filters.statuses.length + filters.customerIds.length + filters.proofStates.length;
  const proofFilterCount = proofFilters.statuses.length + proofFilters.customerIds.length + proofFilters.proofStates.length;

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  // === Receipts Fetch ===
  const fetchReceipts = useCallback(async ({
    search, page, nextFilters, nextQuickFilters,
  }: {
    search: string; page: number; nextFilters: ReceiptFilterState; nextQuickFilters: string[];
  }) => {
    if (activeTab !== 'receipts') return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getReceipts({
        search, page,
        statuses: nextFilters.statuses,
        customerIds: nextFilters.customerIds,
        proofStates: nextFilters.proofStates,
        quickFilters: nextQuickFilters,
      });
      setReceiptData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load receipts.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  // === Proof of Payment Fetch ===
  const fetchProofOfPayments = useCallback(async ({
    search, page, nextFilters, nextQuickFilters,
  }: {
    search: string; page: number; nextFilters: ReceiptFilterState; nextQuickFilters: string[];
  }) => {
    if (activeTab !== 'proof-of-payment') return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getReceipts({
        search, page,
        statuses: nextFilters.statuses,
        customerIds: nextFilters.customerIds,
        proofStates: nextFilters.proofStates,
        quickFilters: nextQuickFilters,
      });
      setReceiptData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load proof of payment data.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  // Effects per tab
  useEffect(() => {
    if (activeTab === 'receipts') {
      void fetchReceipts({
        search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters,
      });
    }
  }, [activeTab, currentPage, fetchReceipts, filters, quickFilters, submittedSearch]);

  useEffect(() => {
    if (activeTab === 'proof-of-payment') {
      void fetchProofOfPayments({
        search: proofSubmittedSearch, page: proofCurrentPage, nextFilters: proofFilters, nextQuickFilters: proofQuickFilters,
      });
    }
  }, [activeTab, fetchProofOfPayments, proofCurrentPage, proofFilters, proofQuickFilters, proofSubmittedSearch]);

  // === Receipts Handlers ===
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput);
    setCurrentPage(1);
    void fetchReceipts({ search: searchInput, page: 1, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleRefresh = () => {
    void fetchReceipts({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleExport = () => {
    const data = receiptData;
    const rows = data?.rows || [];
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
    link.download = 'receipt-payment-review.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleToggleQuickFilter = (value: string) => {
    setQuickFilters((previous) => toggleFilterValue(previous, value));
    setCurrentPage(1);
  };

  // === Proof of Payment Handlers ===
  const handleProofSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setProofSubmittedSearch(proofSearchInput);
    setProofCurrentPage(1);
    void fetchProofOfPayments({ search: proofSearchInput, page: 1, nextFilters: proofFilters, nextQuickFilters: proofQuickFilters });
  };

  const handleProofRefresh = () => {
    void fetchProofOfPayments({ search: proofSubmittedSearch, page: proofCurrentPage, nextFilters: proofFilters, nextQuickFilters: proofQuickFilters });
  };

  const handleProofExport = () => {
    const rows = receiptData?.rows || [];
    if (!rows.length) return;
    const headers = ['Receipt Number', 'Payment', 'Customer', 'Proof File', 'Receipt Date', 'Proof State'];
    const csvRows = rows.map((row) => [
      row.receiptNumber,
      row.paymentLabel,
      row.customerLabel,
      row.proofDocumentLabel || '-',
      row.receiptDateLabel,
      row.proofDocumentId ? 'Attached' : 'Missing',
    ]);
    const csvContent = [headers, ...csvRows].map((row) => row.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'receipt-proof-of-payment.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleToggleProofQuickFilter = (value: string) => {
    setProofQuickFilters((previous) => toggleFilterValue(previous, value));
    setProofCurrentPage(1);
  };

  const handleView = async (id: string) => {
    setIsViewOpen(true);
    setIsViewLoading(true);
    setViewDetail(null);
    try {
      const detail = await getReceiptDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load receipt detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

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
      const detail = await getReceiptDetail(id);
      setFormState({
        paymentReceived: detail.paymentReceivedId || '',
        proofDocument: detail.proofDocumentId || '',
        notes: detail.notes || '',
      });
    } catch (detailError) {
      setFormError(detailError instanceof Error ? detailError.message : 'Unable to load receipt detail.');
    }
  };

  const normalizeFormPayload = (): ReceiptMutationInput => ({
    paymentReceived: formState.paymentReceived,
    proofDocument: formState.proofDocument || null,
    notes: formState.notes.trim() || null,
  });

  const refreshReceiptsView = async () => {
    await fetchReceipts({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      const payload = normalizeFormPayload();
      if (editingId) {
        await updateReceipt(editingId, payload);
      } else {
        await createReceipt(payload);
      }
      setIsFormOpen(false);
      await refreshReceiptsView();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Unable to save receipt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteReceipt(deleteTarget.id);
      setDeleteTarget(null);
      void fetchReceipts({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete receipt.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmIssue = async () => {
    if (!issueTarget) return;
    setIsIssuing(true);
    setError(null);
    try {
      await issueReceipt(issueTarget.id);
      setIssueTarget(null);
      void fetchReceipts({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
    } catch (issueError) {
      setError(issueError instanceof Error ? issueError.message : 'Unable to issue receipt.');
    } finally {
      setIsIssuing(false);
    }
  };

  const handleConfirmVoid = async () => {
    if (!voidTarget) return;
    setIsVoiding(true);
    setError(null);
    try {
      await voidReceipt(voidTarget.id);
      setVoidTarget(null);
      void fetchReceipts({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
    } catch (voidError) {
      setError(voidError instanceof Error ? voidError.message : 'Unable to void receipt.');
    } finally {
      setIsVoiding(false);
    }
  };

  // === Render Receipt Actions ===
  const renderReceiptActions = (row: { id: string; receiptNumber: string; status: string }) => {
    const isMutable = RECEIPT_STATUSES.has(row.status);
    const isIssued = row.status === 'issued';
    const isDraft = row.status === 'draft';

    return (
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300" title="View detail">
            <Eye className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => handleOpenEdit(row.id)} disabled={!isMutable} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 disabled:cursor-not-allowed disabled:opacity-40" title="Edit receipt">
            <Edit className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setIssueTarget({ id: row.id, receiptNumber: row.receiptNumber })} disabled={!isDraft} className="inline-flex items-center gap-1 rounded-lg p-2 text-blue-600 dark:text-blue-400 transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-700 dark:hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-40" title="Issue receipt">
            <CheckCircle className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setVoidTarget({ id: row.id, receiptNumber: row.receiptNumber })} disabled={!isIssued} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40" title="Void receipt">
            <Ban className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setDeleteTarget({ id: row.id, receiptNumber: row.receiptNumber })} disabled={!isMutable} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40" title="Delete receipt">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    );
  };

  const renderProofActions = (row: { id: string }) => (
    <td className="px-4 py-3 text-right">
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300" title="View detail">
          <Eye className="h-4 w-4" />
        </button>
      </div>
    </td>
  );

  const paymentsOptions = useMemo(() => {
    const rawPayments = receiptData?.referenceData?.payments || [];
    const filtered = rawPayments.filter((payment) => !payment.linkedOfficialReceiptId || (editingId && payment.linkedOfficialReceiptId === editingId));
    return [
      { label: 'Select a payment', value: '' },
      ...filtered.map((payment) => ({
        label: payment.label,
        value: String(payment.id),
      })),
    ];
  }, [receiptData?.referenceData?.payments, editingId]);

  const mediaOptions = useMemo(() => [
    { label: 'No proof document', value: '' },
    ...(receiptData?.referenceData?.mediaDocuments || []).map((media) => ({
      label: media.filename || `Media ${media.id}`,
      value: String(media.id),
    })),
  ], [receiptData?.referenceData?.mediaDocuments]);

  return (
    <div className="space-y-6 p-[10px]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">LMS Finance / LMS Billing & Collections</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">Receipt & Payment Review</h1>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-400">Review LMS receipts and proof-of-payment coverage for customer payments collected against enrollment billing and invoice settlement.</p>
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

      {/* === RECEIPTS TAB === */}
      {activeTab === 'receipts' && (
<div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{receiptData?.meta?.label || currentTab.label}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{receiptData?.meta?.description || currentTab.description}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{receiptData?.totals?.filteredRows ?? 0} matching rows</p>
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
                <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50" disabled={!receiptData?.rows?.length}>
                  <Download className="h-4 w-4" />
                  Download View
                </button>
              </div>
            </div>

          {receiptData?.metrics?.length ? <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{receiptData.metrics.map((metric) => <div key={metric.id}><MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} /></div>)}</div> : null}

<div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] shadow-sm">
              <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-800 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                  <form onSubmit={handleSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
                    <div className="relative min-w-0 flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                      <input type="text" placeholder={receiptData?.meta?.searchPlaceholder || currentTab.searchPlaceholder} value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50" />
                    </div>
                    <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 dark:border-blue-700 bg-blue-600 dark:bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 dark:hover:border-blue-800 dark:hover:bg-blue-800">
                      <Search className="h-4 w-4" />
                      Search
                    </button>
                  </form>
                  <button type="button" onClick={() => { if (!isFilterPanelOpen) setDraftFilters({ ...filters }); setIsFilterPanelOpen((previous) => !previous); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isFilterPanelOpen || filterCount > 0 ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                    <Filter className="h-4 w-4" />
                    Filters
                    {filterCount > 0 ? <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-700 px-1.5 py-0.5 text-[11px] font-semibold text-white">{filterCount}</span> : null}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(receiptData?.filterOptions?.quickFilters || []).map((filter) => (
                    <button key={filter.value} type="button" onClick={() => handleToggleQuickFilter(filter.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${quickFilters.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
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
                      <button type="button" onClick={() => { setDraftFilters({ statuses: [], customerIds: [], proofStates: [] }); setFilters({ statuses: [], customerIds: [], proofStates: [] }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">Clear all</button>
                      <button type="button" onClick={() => setIsFilterPanelOpen(false)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                      <button type="button" onClick={() => { setFilters({ ...draftFilters }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 dark:border-blue-700 bg-blue-600 dark:bg-blue-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-800">Apply Filters</button>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-6 md:grid-cols-3">
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</h5>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(receiptData?.filterOptions?.statuses || []).map((option) => {
                          const selected = draftFilters.statuses.includes(option.value);
                          return <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{option.label}</button>;
                        })}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Customer</h5>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(receiptData?.filterOptions?.customers || []).map((option) => {
                          const selected = draftFilters.customerIds.includes(option.value);
                          return <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, customerIds: toggleFilterValue(previous.customerIds, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{option.label}</button>;
                        })}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Proof State</h5>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(receiptData?.filterOptions?.proofStates || []).map((option) => {
                          const selected = draftFilters.proofStates.includes(option.value);
                          return <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, proofStates: toggleFilterValue(previous.proofStates, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{option.label}</button>;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{receiptData?.meta?.tableTitle || currentTab.tableTitle}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{receiptData?.meta?.tableDescription || currentTab.tableDescription}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span>{receiptData?.totals?.filteredRows ?? 0} matching rows</span>
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
                            {(receiptData?.meta?.columns || currentTab.columns).map((column) => {
                              const label = typeof column === 'string' ? column : column.label;
                              const align = typeof column === 'object' && column.align === 'right' ? 'text-right' : 'text-left';
                              return (
                                <th key={label} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${align}`}>{label}</th>
                              );
                            })}
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[var(--card-background)]">
                          {(receiptData?.rows || []).length > 0 ? (receiptData?.rows || []).map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              {row.cells.map((cell, index) => renderCell(cell, index))}
                              {renderReceiptActions(row)}
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={(receiptData?.meta?.columns || currentTab.columns).length + 1} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No receipt rows found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {receiptData?.pagination && receiptData.pagination.totalPages > 1 ? (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Page {receiptData.pagination.page} of {receiptData.pagination.totalPages}</p>
                      <div className="flex gap-2">
                        <button type="button" disabled={!receiptData.pagination.hasPrevPage} onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">Previous</button>
                        <button type="button" disabled={!receiptData.pagination.hasNextPage} onClick={() => setCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">Next</button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === PROOF OF PAYMENT TAB === */}
      {activeTab === 'proof-of-payment' && (
<div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{currentTab.label}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{currentTab.description}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{receiptData?.totals?.filteredRows ?? 0} matching rows</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={handleProofRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
                  <RefreshCw className="h-4 w-4" />
                  Refresh Proofs
                </button>
                <button type="button" onClick={handleProofExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50" disabled={!receiptData?.rows?.length}>
                  <Download className="h-4 w-4" />
                  Download View
                </button>
              </div>
            </div>

          {receiptData?.metrics?.length ? <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{receiptData.metrics.map((metric) => <div key={metric.id}><MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} /></div>)}</div> : null}

          <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-800 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                <form onSubmit={handleProofSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input type="text" placeholder={currentTab.searchPlaceholder} value={proofSearchInput} onChange={(event) => setProofSearchInput(event.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50" />
                  </div>
                  <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 dark:border-blue-700 bg-blue-600 dark:bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 dark:hover:border-blue-800 dark:hover:bg-blue-800">
                    <Search className="h-4 w-4" />
                    Search
                  </button>
                </form>
                <button type="button" onClick={() => { if (!isProofFilterPanelOpen) setProofDraftFilters({ ...proofFilters }); setIsProofFilterPanelOpen((previous) => !previous); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isProofFilterPanelOpen || proofFilterCount > 0 ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  <Filter className="h-4 w-4" />
                  Filters
                  {proofFilterCount > 0 ? <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-700 px-1.5 py-0.5 text-[11px] font-semibold text-white">{proofFilterCount}</span> : null}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(receiptData?.filterOptions?.quickFilters || []).map((filter) => (
                  <button key={filter.value} type="button" onClick={() => handleToggleProofQuickFilter(filter.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${proofQuickFilters.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 p-[10px] sm:p-5">
              {isProofFilterPanelOpen ? (
                <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Filters</h4>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Select proof coverage and status values to narrow the register view.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" onClick={() => { setProofDraftFilters({ statuses: [], customerIds: [], proofStates: [] }); setProofFilters({ statuses: [], customerIds: [], proofStates: [] }); setProofCurrentPage(1); setIsProofFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">Clear all</button>
                      <button type="button" onClick={() => setIsProofFilterPanelOpen(false)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                      <button type="button" onClick={() => { setProofFilters({ ...proofDraftFilters }); setProofCurrentPage(1); setIsProofFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 dark:border-blue-700 bg-blue-600 dark:bg-blue-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-800">Apply Filters</button>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</h5>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(receiptData?.filterOptions?.statuses || []).map((option) => {
                          const selected = proofDraftFilters.statuses.includes(option.value);
                          return <button key={option.value} type="button" onClick={() => setProofDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{option.label}</button>;
                        })}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Customer</h5>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(receiptData?.filterOptions?.customers || []).map((option) => {
                          const selected = proofDraftFilters.customerIds.includes(option.value);
                          return <button key={option.value} type="button" onClick={() => setProofDraftFilters((previous) => ({ ...previous, customerIds: toggleFilterValue(previous.customerIds, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{option.label}</button>;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{currentTab.tableTitle}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{currentTab.tableDescription}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span>{receiptData?.totals?.filteredRows ?? 0} matching rows</span>
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
                            {currentTab.columns.map((column) => (
                              <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${column === 'Amount' ? 'text-right' : 'text-left'}`}>{column}</th>
                            ))}
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[var(--card-background)]">
                          {(receiptData?.rows || []).length > 0 ? (receiptData?.rows || []).map((row) => {
const stateLabel = row.proofDocumentId ? 'Attached' : 'Missing';
                            const stateTone = row.proofDocumentId ? 'green' as const : 'amber' as const;
                            return (

                              <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">{row.receiptNumber}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{row.paymentLabel}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{row.customerLabel}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{row.proofDocumentLabel || '-'}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{row.receiptDateLabel}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm">
                                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${stateTone === 'green' ? 'bg-green-50 text-green-700 ring-green-200 dark:bg-green-950/30 dark:text-green-400 dark:ring-green-800' : 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:ring-amber-800'}`}>{stateLabel}</span>
                                </td>
                                {renderProofActions(row)}
                              </tr>
                            );
                          }) : (
                            <tr>
                              <td colSpan={currentTab.columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No proof of payment rows found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {receiptData?.pagination && receiptData.pagination.totalPages > 1 ? (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Page {receiptData.pagination.page} of {receiptData.pagination.totalPages}</p>
                      <div className="flex gap-2">
                        <button type="button" disabled={!receiptData.pagination.hasPrevPage} onClick={() => setProofCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">Previous</button>
                        <button type="button" disabled={!receiptData.pagination.hasNextPage} onClick={() => setProofCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">Next</button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* === Receipt Detail SlideOver === */}
      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Receipt Detail" description="Review receipt header values, payment linkage, proof document, and status.">
        <div className="space-y-6">
          {isViewLoading ? <LoadingSkeleton /> : viewDetail ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['Receipt Number', viewDetail.receiptNumber],
                  ['Customer', viewDetail.customerLabel || '-'],
                  ['Payment Received', viewDetail.paymentReceivedLabel || '-'],
                  ['Payment Ref', viewDetail.paymentReferenceNumber || '-'],
                  ['Payment Status', viewDetail.paymentStatusLabel || '-'],
                  ['Receipt Date', viewDetail.receiptDateLabel],
                  ['Status', viewDetail.statusLabel],
                  ['Currency', viewDetail.currency],
                  ['Issued By', viewDetail.issuedByLabel || '-'],
                  ['Proof Document', viewDetail.proofDocumentLabel || '-'],
                  ['Voided At', viewDetail.voidedAtLabel || '-'],
                  ['Voided By', viewDetail.voidedByLabel || '-'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Amount', viewDetail.amountLabel],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">{value}</p>
                  </div>
                ))}
              </div>

              {viewDetail.notes ? (
                <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-4 text-sm text-gray-700 dark:text-gray-300">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Notes</p>
                  <p className="mt-2">{viewDetail.notes}</p>
                </div>
              ) : null}

              <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-4 text-sm text-gray-700 dark:text-gray-300">
                <p className="font-medium text-gray-900 dark:text-gray-100">Dependencies</p>
                <p className="mt-2">Can Edit: {viewDetail.usageSummary.canEdit ? 'Yes' : 'No'}</p>
                <p>Can Delete: {viewDetail.usageSummary.canDelete ? 'Yes' : 'No'}</p>
                <p>Can Issue: {viewDetail.usageSummary.canIssue ? 'Yes' : 'No'}</p>
                <p>Can Void: {viewDetail.usageSummary.canVoid ? 'Yes' : 'No'}</p>
                <p>Has Proof Document: {viewDetail.usageSummary.hasProofDocument ? 'Yes' : 'No'}</p>
              </div>
            </>
          ) : <p className="text-sm text-gray-500 dark:text-gray-400">No details available.</p>}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
            <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">Close</button>
          </div>
        </div>
      </SlideOver>

      {/* === Receipt Create/Edit Form SlideOver === */}
      <SlideOver isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingId ? 'Edit Receipt' : 'Create Receipt'} description="Set receipt fields including payment received, proof document, and notes.">
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {formError ? <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400"><AlertCircle className="h-4 w-4 shrink-0" />{formError}</div> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Payment Received" required>
              <Select value={formState.paymentReceived} onChange={(value) => setFormState((previous) => ({ ...previous, paymentReceived: value }))} options={paymentsOptions} />
            </FormField>
            <FormField label="Proof Document">
              <Select value={formState.proofDocument} onChange={(value) => setFormState((previous) => ({ ...previous, proofDocument: value }))} options={mediaOptions} />
            </FormField>
          </div>
          <FormField label="Notes">
            <TextArea value={formState.notes} onChange={(value) => setFormState((previous) => ({ ...previous, notes: value }))} rows={3} />
          </FormField>
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-800 pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} disabled={isSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>{isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Receipt'}</button>
          </div>
        </form>
      </SlideOver>

      {/* === Issue Receipt Confirmation === */}
      <SlideOver isOpen={Boolean(issueTarget)} onClose={() => setIssueTarget(null)} title="Issue Receipt" description="Issuing finalizes the receipt and links it to the payment received record." width="max-w-lg">
        <div className="space-y-6">
          <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4 text-sm text-blue-700 dark:text-blue-400">
            <p className="font-medium">Issue receipt {issueTarget?.receiptNumber}?</p>
            <p className="mt-1">Make sure the payment, customer, and proof document are ready before issuing.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-800 pt-4">
            <button type="button" onClick={() => setIssueTarget(null)} disabled={isIssuing} className="rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleConfirmIssue} disabled={isIssuing} className="rounded-lg bg-blue-600 dark:bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50">{isIssuing ? 'Issuing...' : 'Issue Receipt'}</button>
          </div>
        </div>
      </SlideOver>

      {/* === Void Receipt Confirmation === */}
      <SlideOver isOpen={Boolean(voidTarget)} onClose={() => setVoidTarget(null)} title="Void Receipt" description="Voiding marks the receipt as void but retains it for audit visibility." width="max-w-lg">
        <div className="space-y-6">
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-700 dark:text-red-400">
            <p className="font-medium">Void receipt {voidTarget?.receiptNumber}?</p>
            <p className="mt-1">Only issued official receipts can be voided. This action is irreversible.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-800 pt-4">
            <button type="button" onClick={() => setVoidTarget(null)} disabled={isVoiding} className="rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleConfirmVoid} disabled={isVoiding} className="rounded-lg bg-red-600 dark:bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:hover:bg-red-800 disabled:opacity-50">{isVoiding ? 'Voiding...' : 'Void Receipt'}</button>
          </div>
        </div>
      </SlideOver>

      {/* === Delete Receipt Confirmation === */}
      <SlideOver isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete Receipt" description="Delete this mutable receipt after dependency validation completes." width="max-w-lg">
        <div className="space-y-6">
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-700 dark:text-red-400">
            <p className="font-medium">Delete receipt {deleteTarget?.receiptNumber}?</p>
            <p className="mt-1">Draft receipts can be deleted only when no blocking dependency exists.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-800 pt-4">
            <button type="button" onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleting} className="rounded-lg bg-red-600 dark:bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:hover:bg-red-800 disabled:opacity-50">{isDeleting ? 'Deleting...' : 'Delete Receipt'}</button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
