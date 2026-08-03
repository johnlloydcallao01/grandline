'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Eye,
  FileText,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import {
  getBillingPipeline,
  type PipelineCell,
  type PipelineMetric,
  type PendingEnrollmentRow,
  type CorporateReceivableRow,
  type TraineeCollectionRow,
  type PipelineResponse,
} from './actions';

type TabId = 'pending-enrollment-billing' | 'corporate-receivables' | 'trainee-collections';

const STATIC_TABS: Array<{ id: TabId; label: string; description: string; searchPlaceholder: string; columns: string[] }> = [
  {
    id: 'pending-enrollment-billing',
    label: 'Pending Enrollment Billing',
    description: 'Review pending LMS enrollment billing workload using the LMS dashboard summary fields for pending enrollment requests and estimated pending billing value.',
    searchPlaceholder: 'Search enrollment, course, trainee, requested amount, or billing state',
    columns: ['Enrollment', 'Course', 'Trainee', 'Billing State', 'Estimated Charge', 'Action Stage'],
  },
  {
    id: 'corporate-receivables',
    label: 'Corporate Receivables',
    description: 'Review active corporate receivable balances using the dedicated LMS corporate receivables query output.',
    searchPlaceholder: 'Search corporate account, invoice, covered amount, trainee share, balance due, or status',
    columns: ['Account Code', 'Corporate Account', 'Invoice', 'Covered Amount', 'Balance Due', 'Status'],
  },
  {
    id: 'trainee-collections',
    label: 'Trainee Collections',
    description: 'Review top trainee collection balances using the LMS dashboard output that ranks due amounts per billing link and related trainee or customer context.',
    searchPlaceholder: 'Search enrollment, trainee id, customer id, amount due, or collection priority',
    columns: ['Enrollment', 'Trainee ID', 'Customer ID', 'Amount Due', 'Priority', 'Collection State'],
  },
];

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 dark:border-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800';
  if (variant === 'ghost') return 'border border-transparent bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-300';
  return 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800';
}

function getMetricTone(trend: PipelineMetric['trend']) {
  if (trend === 'down') return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30';
  if (trend === 'neutral') return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
  return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30';
}

function escapeCsvValue(value: string | number | boolean | null | undefined) {
  const stringValue = String(value ?? '');
  return /[",\n]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
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

function renderCell(cell: PipelineCell, index: number) {
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

function PendingEnrollmentBillingTab() {
  const [data, setData] = useState<PipelineResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewDetail, setViewDetail] = useState<PendingEnrollmentRow | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const fetchData = useCallback(async ({
    search, page,
  }: {
    search: string; page: number;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getBillingPipeline({
        tab: 'pending-enrollment-billing',
        search,
        page,
      });
      setData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load pending enrollment billing data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData({ search: submittedSearch, page: currentPage });
  }, [currentPage, fetchData, submittedSearch]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput);
    setCurrentPage(1);
    void fetchData({ search: searchInput, page: 1 });
  };

  const handleRefresh = () => {
    void fetchData({ search: submittedSearch, page: currentPage });
  };

  const handleExport = () => {
    const rows = (data?.rows || []) as PendingEnrollmentRow[];
    if (!rows.length) return;
    const headers = ['Enrollment', 'Course', 'Trainee', 'Billing State', 'Estimated Charge', 'Action Stage'];
    const csvRows = rows.map((row) => [
      row.sourceReference,
      row.courseTitle,
      row.traineeName,
      row.billingStatusLabel,
      row.finalChargeLabel,
      row.actionStage,
    ]);
    const csvContent = [headers, ...csvRows].map((r) => r.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pending-enrollment-billing.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Pending Enrollment Billing</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{data?.tab === 'pending-enrollment-billing' ? 'Pending enrollment billing workload aligned to enrollment billing link status snapshots.' : 'Review pending LMS enrollment billing workload.'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50" disabled={!data?.rows?.length}>
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {data?.metrics?.length ? <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{data.metrics.map((metric) => <div key={metric.id}><MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} /></div>)}</div> : null}

      <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-800 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <form onSubmit={handleSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input type="text" placeholder="Search enrollment, course, trainee, requested amount, or billing state" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 dark:border-blue-700 bg-blue-600 dark:bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700">
                <Search className="h-4 w-4" /> Search
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-4 p-[10px] sm:p-5">
          {error ? <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div> : null}

          {isLoading ? <LoadingSkeleton /> : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[var(--card-border)]">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        {['Enrollment', 'Course', 'Trainee', 'Billing State', 'Estimated Charge', 'Action Stage'].map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${column === 'Estimated Charge' ? 'text-right' : 'text-left'}`}>{column}</th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[var(--card-background)]">
                      {((data?.rows || []) as PendingEnrollmentRow[]).length > 0 ? ((data?.rows || []) as PendingEnrollmentRow[]).map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          {row.cells.map((cell, index) => renderCell(cell, index))}
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => { setViewDetail(row); setIsViewOpen(true); }} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300" title="View detail">
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No pending enrollment billing rows found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {data?.pagination && data.pagination.totalPages > 1 ? (
                <div className="flex items-center justify-between">
                  <button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">Previous</button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Page {data.pagination.page} of {data.pagination.totalPages}</span>
                  <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">Next</button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Enrollment Billing Detail" description="Review billing link values, course info, trainee details, and current action stage." width="max-w-lg">
        {viewDetail ? (
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Enrollment Reference</p>
                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{viewDetail.sourceReference}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Course</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{viewDetail.courseTitle}</p>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Trainee</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{viewDetail.traineeName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Billing State</p>
                  <p className="mt-2">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                      viewDetail.billingStatusTone === 'amber' ? 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:ring-amber-800' :
                      viewDetail.billingStatusTone === 'blue' ? 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-800' :
                      viewDetail.billingStatusTone === 'green' ? 'bg-green-50 text-green-700 ring-green-200 dark:bg-green-950/30 dark:text-green-400 dark:ring-green-800' :
                      viewDetail.billingStatusTone === 'red' ? 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/30 dark:text-red-400 dark:ring-red-800' :
                      'bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700'
                    }`}>{viewDetail.billingStatusLabel}</span>
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Estimated Charge</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{viewDetail.finalChargeLabel}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Customer</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{viewDetail.customerLabel || 'Not assigned'}</p>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Action Stage</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{viewDetail.actionStage}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end border-t border-gray-200 dark:border-gray-800 pt-4">
              <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">Close</button>
            </div>
          </div>
        ) : null}
      </SlideOver>
    </div>
  );
}

function CorporateReceivablesTab() {
  const [data, setData] = useState<PipelineResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewDetail, setViewDetail] = useState<CorporateReceivableRow | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const fetchData = useCallback(async ({
    search, page,
  }: {
    search: string; page: number;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getBillingPipeline({
        tab: 'corporate-receivables',
        search,
        page,
      });
      setData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load corporate receivables data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData({ search: submittedSearch, page: currentPage });
  }, [currentPage, fetchData, submittedSearch]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput);
    setCurrentPage(1);
    void fetchData({ search: searchInput, page: 1 });
  };

  const handleRefresh = () => {
    void fetchData({ search: submittedSearch, page: currentPage });
  };

  const handleExport = () => {
    const rows = (data?.rows || []) as CorporateReceivableRow[];
    if (!rows.length) return;
    const headers = ['Account Code', 'Corporate Account', 'Invoice', 'Covered Amount', 'Balance Due', 'Status'];
    const csvRows = rows.map((row) => [
      row.accountCode,
      row.accountName,
      row.invoiceNumber,
      row.coveredAmountLabel,
      row.balanceDueLabel,
      row.statusLabel,
    ]);
    const csvContent = [headers, ...csvRows].map((r) => r.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'corporate-receivables.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Corporate Receivables</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{data?.tab === 'corporate-receivables' ? 'Corporate receivable balances aligned to corporate billing link records.' : 'Review active corporate receivable balances.'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50" disabled={!data?.rows?.length}>
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {data?.metrics?.length ? <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{data.metrics.map((metric) => <div key={metric.id}><MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} /></div>)}</div> : null}

      <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-800 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <form onSubmit={handleSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input type="text" placeholder="Search corporate account, invoice, covered amount, trainee share, balance due, or status" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 dark:border-blue-700 bg-blue-600 dark:bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700">
                <Search className="h-4 w-4" /> Search
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-4 p-[10px] sm:p-5">
          {error ? <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div> : null}

          {isLoading ? <LoadingSkeleton /> : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[var(--card-border)]">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        {['Account Code', 'Corporate Account', 'Invoice', 'Covered Amount', 'Balance Due', 'Status'].map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${column === 'Covered Amount' || column === 'Balance Due' ? 'text-right' : 'text-left'}`}>{column}</th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[var(--card-background)]">
                      {((data?.rows || []) as CorporateReceivableRow[]).length > 0 ? ((data?.rows || []) as CorporateReceivableRow[]).map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          {row.cells.map((cell, index) => renderCell(cell, index))}
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => { setViewDetail(row); setIsViewOpen(true); }} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300" title="View detail">
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No corporate receivable rows found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {data?.pagination && data.pagination.totalPages > 1 ? (
                <div className="flex items-center justify-between">
                  <button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">Previous</button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Page {data.pagination.page} of {data.pagination.totalPages}</span>
                  <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">Next</button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Corporate Receivable Detail" description="Review corporate billing link values, coverage details, and balance information." width="max-w-lg">
        {viewDetail ? (
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Account Code</p>
                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{viewDetail.accountCode}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Corporate Account</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{viewDetail.accountName}</p>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Invoice</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{viewDetail.invoiceNumber || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Covered Amount</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{viewDetail.coveredAmountLabel}</p>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Balance Due</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{viewDetail.balanceDueLabel}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Coverage Type</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{viewDetail.coverageType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</p>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</p>
                  <p className="mt-2">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                      viewDetail.statusTone === 'green' ? 'bg-green-50 text-green-700 ring-green-200 dark:bg-green-950/30 dark:text-green-400 dark:ring-green-800' :
                      viewDetail.statusTone === 'gray' ? 'bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700' :
                      'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:ring-amber-800'
                    }`}>{viewDetail.statusLabel}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end border-t border-gray-200 dark:border-gray-800 pt-4">
              <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">Close</button>
            </div>
          </div>
        ) : null}
      </SlideOver>
    </div>
  );
}

function TraineeCollectionsTab() {
  const [data, setData] = useState<PipelineResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewDetail, setViewDetail] = useState<TraineeCollectionRow | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const fetchData = useCallback(async ({
    search, page,
  }: {
    search: string; page: number;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getBillingPipeline({
        tab: 'trainee-collections',
        search,
        page,
      });
      setData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load trainee collections data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData({ search: submittedSearch, page: currentPage });
  }, [currentPage, fetchData, submittedSearch]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput);
    setCurrentPage(1);
    void fetchData({ search: searchInput, page: 1 });
  };

  const handleRefresh = () => {
    void fetchData({ search: submittedSearch, page: currentPage });
  };

  const handleExport = () => {
    const rows = (data?.rows || []) as TraineeCollectionRow[];
    if (!rows.length) return;
    const headers = ['Enrollment', 'Trainee ID', 'Customer ID', 'Amount Due', 'Priority', 'Collection State'];
    const csvRows = rows.map((row) => [
      row.sourceReference,
      row.traineeId,
      row.customerIdRef,
      row.amountDueLabel,
      row.priority,
      row.collectionState,
    ]);
    const csvContent = [headers, ...csvRows].map((r) => r.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'trainee-collections.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Trainee Collections</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{data?.tab === 'trainee-collections' ? 'Trainee collection balances ranked by amount due from enrollment billing link snapshots.' : 'Review top trainee collection balances.'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50" disabled={!data?.rows?.length}>
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {data?.metrics?.length ? <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{data.metrics.map((metric) => <div key={metric.id}><MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} /></div>)}</div> : null}

      <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-800 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <form onSubmit={handleSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input type="text" placeholder="Search enrollment, trainee id, customer id, amount due, or collection priority" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 dark:border-blue-700 bg-blue-600 dark:bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700">
                <Search className="h-4 w-4" /> Search
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-4 p-[10px] sm:p-5">
          {error ? <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div> : null}

          {isLoading ? <LoadingSkeleton /> : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[var(--card-border)]">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        {['Enrollment', 'Trainee ID', 'Customer ID', 'Amount Due', 'Priority', 'Collection State'].map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${column === 'Amount Due' ? 'text-right' : 'text-left'}`}>{column}</th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[var(--card-background)]">
                      {((data?.rows || []) as TraineeCollectionRow[]).length > 0 ? ((data?.rows || []) as TraineeCollectionRow[]).map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          {row.cells.map((cell, index) => renderCell(cell, index))}
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => { setViewDetail(row); setIsViewOpen(true); }} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300" title="View detail">
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No trainee collection rows found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {data?.pagination && data.pagination.totalPages > 1 ? (
                <div className="flex items-center justify-between">
                  <button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">Previous</button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Page {data.pagination.page} of {data.pagination.totalPages}</span>
                  <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">Next</button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Trainee Collection Detail" description="Review trainee billing link values, amount due, priority, and collection state." width="max-w-lg">
        {viewDetail ? (
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Enrollment Reference</p>
                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{viewDetail.sourceReference}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Trainee</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{viewDetail.traineeName || viewDetail.traineeId}</p>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Customer</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{viewDetail.customerLabel || viewDetail.customerIdRef}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Amount Due</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{viewDetail.amountDueLabel}</p>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Priority</p>
                  <p className="mt-2">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                      viewDetail.priorityTone === 'amber' ? 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:ring-amber-800' :
                      viewDetail.priorityTone === 'blue' ? 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-800' :
                      'bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700'
                    }`}>{viewDetail.priority}</span>
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Collection State</p>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{viewDetail.collectionState}</p>
              </div>
            </div>
            <div className="flex justify-end border-t border-gray-200 dark:border-gray-800 pt-4">
              <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">Close</button>
            </div>
          </div>
        ) : null}
      </SlideOver>
    </div>
  );
}

export function BillingPipelineMonitoringClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get('tab') as TabId) || 'pending-enrollment-billing';

  const handleTabChange = useCallback(
    (tabId: TabId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', tabId);
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const selectedTab = STATIC_TABS.find((tab) => tab.id === activeTab) ?? STATIC_TABS[0];

  return (
    <div className="space-y-6 p-[10px]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">LMS Finance / LMS Finance Reporting</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 p-3 text-blue-700 dark:text-blue-400">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Billing Pipeline Monitoring</h1>
              <p className="mt-1 max-w-3xl text-base text-gray-600 dark:text-gray-400">Review pending enrollment billing, corporate receivable balances, and trainee collection exposure using the LMS reporting service outputs.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700 px-[10px]">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {STATIC_TABS.map((tab) => {
              const isActive = selectedTab.id === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600 dark:border-blue-500 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-[10px]">
          {activeTab === 'pending-enrollment-billing' && <PendingEnrollmentBillingTab />}
          {activeTab === 'corporate-receivables' && <CorporateReceivablesTab />}
          {activeTab === 'trainee-collections' && <TraineeCollectionsTab />}
        </div>
      </div>
    </div>
  );
}
