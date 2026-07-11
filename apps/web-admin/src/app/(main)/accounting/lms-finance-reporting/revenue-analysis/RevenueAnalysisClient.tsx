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
import { RevenueChart } from '@encreasl/ui/revenue-chart';
import {
  getRevenueAnalysis,
  type RevenueAnalysisCell,
  type RevenueAnalysisMetric,
  type RevenueAnalysisResponse,
  type RevenueByCourseRow,
  type RevenueByInstructorRow,
  type RevenueByEnrollmentTypeRow,
} from './actions';

type TabId = 'revenue-by-course' | 'revenue-by-instructor' | 'revenue-by-enrollment-type';

const STATIC_TABS: Array<{ id: TabId; label: string; description: string; searchPlaceholder: string; columns: string[] }> = [
  {
    id: 'revenue-by-course',
    label: 'Revenue By Course',
    description: 'Review LMS billed revenue aggregated by course using enrollment billing-link final charge snapshots from the LMS dashboard service.',
    searchPlaceholder: 'Search course, billed revenue, linked enrollments, or billing-link count',
    columns: ['Course', 'Linked Enrollments', 'Average Charge', 'Billed Revenue', 'Rank'],
  },
  {
    id: 'revenue-by-instructor',
    label: 'Revenue By Instructor',
    description: 'Review LMS billed revenue aggregated by course instructor using the instructor-level revenue grouping returned by the LMS dashboard service.',
    searchPlaceholder: 'Search instructor, linked courses, billed revenue, or revenue share',
    columns: ['Instructor', 'Linked Courses', 'Linked Enrollments', 'Billed Revenue', 'Revenue Share'],
  },
  {
    id: 'revenue-by-enrollment-type',
    label: 'Revenue By Enrollment Type',
    description: 'Review LMS billed revenue by enrollment type using the billing-link aggregation returned by the LMS dashboard service.',
    searchPlaceholder: 'Search enrollment type, billed revenue, share, or bucket total',
    columns: ['Enrollment Type', 'Linked Enrollments', 'Average Charge', 'Billed Revenue', 'Share'],
  },
];

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  if (variant === 'ghost') return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
}

function getMetricTone(trend: RevenueAnalysisMetric['trend']) {
  if (trend === 'down') return 'text-red-600 bg-red-50';
  if (trend === 'neutral') return 'text-gray-600 bg-gray-100';
  return 'text-green-600 bg-green-50';
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
                {Array.from({ length: 6 }).map((_, index) => (
                  <th key={index} className="px-4 py-3">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan={6} className="px-4 py-3">
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

function parseMetricNumber(value: string): number {
  const cleaned = value.replace(/[₱$PHP,\s]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

const MONETARY_METRIC_IDS = new Set(['total-revenue', 'top-course', 'top-instructor', 'avg-instructor', 'top-type', 'largest-bucket']);

function MetricsOverviewChart({ metrics }: { metrics: RevenueAnalysisMetric[] }) {
  const parsed = React.useMemo(() => {
    return metrics.map((m) => ({
      ...m,
      numericValue: parseMetricNumber(m.value),
      isMonetary: MONETARY_METRIC_IDS.has(m.id),
    }));
  }, [metrics]);

  const monetaryMetrics = parsed.filter((m) => m.isMonetary);
  const countMetrics = parsed.filter((m) => !m.isMonetary);
  const monetaryMax = Math.max(...monetaryMetrics.map((m) => m.numericValue), 1);
  const countMax = Math.max(...countMetrics.map((m) => m.numericValue), 1);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-gray-900">Key Metrics Overview</h3>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h4 className="mb-3 text-sm font-medium text-gray-500">Revenue Metrics</h4>
          <div className="space-y-4">
            {monetaryMetrics.map((m) => {
              const pct = monetaryMax > 0 ? (m.numericValue / monetaryMax) * 100 : 0;
              return (
                <div key={m.id}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-gray-600">{m.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{m.value}</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-100">
                    <div className="h-3 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: '#2563eb' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-medium text-gray-500">Count Metrics</h4>
          <div className="space-y-4">
            {countMetrics.map((m) => {
              const pct = countMax > 0 ? (m.numericValue / countMax) * 100 : 0;
              return (
                <div key={m.id}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-gray-600">{m.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{m.value}</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-100">
                    <div className="h-3 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: '#14b8a6' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function renderCell(cell: RevenueAnalysisCell, index: number) {
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

function RevenueByCourseTab() {
  const [data, setData] = useState<RevenueAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewDetail, setViewDetail] = useState<RevenueByCourseRow | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const fetchData = useCallback(async ({
    search, page,
  }: {
    search: string; page: number;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getRevenueAnalysis({
        tab: 'revenue-by-course',
        search,
        page,
      });
      setData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load revenue by course data.');
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
    const rows = (data?.rows || []) as RevenueByCourseRow[];
    if (!rows.length) return;
    const headers = ['Course', 'Linked Enrollments', 'Average Charge', 'Billed Revenue', 'Rank'];
    const csvRows = rows.map((row) => [
      row.courseTitle,
      String(row.linkedEnrollments),
      row.averageChargeLabel,
      row.billedRevenueLabel,
      String(row.rank),
    ]);
    const csvContent = [headers, ...csvRows].map((r) => r.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'revenue-by-course.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">Revenue By Course</h2>
          <p className="text-sm text-gray-600">{data?.tab === 'revenue-by-course' ? 'Course-level revenue view aligned to enrollment billing-link final charge snapshots.' : 'Review LMS billed revenue aggregated by course.'}</p>
          <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!data?.rows?.length}>
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {data?.metrics?.length ? <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{data.metrics.map((metric) => <div key={metric.id}><MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} /></div>)}</div> : null}

      {data?.metrics?.length ? <MetricsOverviewChart metrics={data.metrics} /> : null}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Revenue Distribution</h3>
          </div>
          <div className="mt-3">
            <RevenueChart type="bar" data={((data?.rows || []) as RevenueByCourseRow[]).map((r) => ({ name: r.courseTitle, value: r.billedRevenue }))} height={280} barDirection="horizontal" showLegend={false} emptyMessage="No course revenue data to chart." />
          </div>
        </div>
        <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <form onSubmit={handleSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search course, billed revenue, linked enrollments, or billing-link count" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700">
                <Search className="h-4 w-4" /> Search
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-4 p-5">
          {error ? <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div> : null}

          {isLoading ? <LoadingSkeleton /> : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Course', 'Linked Enrollments', 'Average Charge', 'Billed Revenue', 'Rank'].map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Linked Enrollments' || column === 'Average Charge' || column === 'Billed Revenue' || column === 'Rank' ? 'text-right' : 'text-left'}`}>{column}</th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {((data?.rows || []) as RevenueByCourseRow[]).length > 0 ? ((data?.rows || []) as RevenueByCourseRow[]).map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          {row.cells.map((cell, index) => renderCell(cell, index))}
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => { setViewDetail(row); setIsViewOpen(true); }} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail">
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">No revenue-by-course rows found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {data?.pagination && data.pagination.totalPages > 1 ? (
                <div className="flex items-center justify-between">
                  <button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button>
                  <span className="text-sm text-gray-600">Page {data.pagination.page} of {data.pagination.totalPages}</span>
                  <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Course Revenue Detail" width="max-w-lg">
        {viewDetail ? (
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Course</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">{viewDetail.courseTitle}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Rank</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">#{viewDetail.rank}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Billing Links</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{viewDetail.billingLinkCount}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Linked Enrollments</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{viewDetail.linkedEnrollments}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Average Charge</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{viewDetail.averageChargeLabel}</p>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Billed Revenue</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{viewDetail.billedRevenueLabel}</p>
              </div>
            </div>
            <div className="flex justify-end border-t border-gray-200 pt-4">
              <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Close</button>
            </div>
          </div>
        ) : null}
      </SlideOver>
    </div>
  );
}

function RevenueByInstructorTab() {
  const [data, setData] = useState<RevenueAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewDetail, setViewDetail] = useState<RevenueByInstructorRow | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const fetchData = useCallback(async ({
    search, page,
  }: {
    search: string; page: number;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getRevenueAnalysis({
        tab: 'revenue-by-instructor',
        search,
        page,
      });
      setData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load revenue by instructor data.');
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
    const rows = (data?.rows || []) as RevenueByInstructorRow[];
    if (!rows.length) return;
    const headers = ['Instructor', 'Linked Courses', 'Linked Enrollments', 'Billed Revenue', 'Revenue Share'];
    const csvRows = rows.map((row) => [
      row.instructorName,
      String(row.linkedCourses),
      String(row.linkedEnrollments),
      row.billedRevenueLabel,
      row.revenueShareLabel,
    ]);
    const csvContent = [headers, ...csvRows].map((r) => r.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'revenue-by-instructor.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">Revenue By Instructor</h2>
          <p className="text-sm text-gray-600">{data?.tab === 'revenue-by-instructor' ? 'Instructor-level revenue view aligned to enrollment billing-link final charge snapshots.' : 'Review LMS billed revenue aggregated by instructor.'}</p>
          <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!data?.rows?.length}>
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {data?.metrics?.length ? <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{data.metrics.map((metric) => <div key={metric.id}><MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} /></div>)}</div> : null}

      {data?.metrics?.length ? <MetricsOverviewChart metrics={data.metrics} /> : null}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Instructor Revenue Distribution</h3>
          </div>
          <div className="mt-3">
            <RevenueChart type="bar" data={((data?.rows || []) as RevenueByInstructorRow[]).map((r) => ({ name: r.instructorName, value: r.billedRevenue }))} height={280} barDirection="horizontal" showLegend={false} emptyMessage="No instructor revenue data to chart." />
          </div>
        </div>
        <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <form onSubmit={handleSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search instructor, linked courses, billed revenue, or revenue share" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700">
                <Search className="h-4 w-4" /> Search
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-4 p-5">
          {error ? <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div> : null}

          {isLoading ? <LoadingSkeleton /> : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Instructor', 'Linked Courses', 'Linked Enrollments', 'Billed Revenue', 'Revenue Share'].map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Linked Courses' || column === 'Linked Enrollments' || column === 'Billed Revenue' || column === 'Revenue Share' ? 'text-right' : 'text-left'}`}>{column}</th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {((data?.rows || []) as RevenueByInstructorRow[]).length > 0 ? ((data?.rows || []) as RevenueByInstructorRow[]).map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          {row.cells.map((cell, index) => renderCell(cell, index))}
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => { setViewDetail(row); setIsViewOpen(true); }} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail">
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">No revenue-by-instructor rows found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {data?.pagination && data.pagination.totalPages > 1 ? (
                <div className="flex items-center justify-between">
                  <button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button>
                  <span className="text-sm text-gray-600">Page {data.pagination.page} of {data.pagination.totalPages}</span>
                  <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Instructor Revenue Detail" width="max-w-lg">
        {viewDetail ? (
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Instructor</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">{viewDetail.instructorName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Linked Courses</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{viewDetail.linkedCourses}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Linked Enrollments</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{viewDetail.linkedEnrollments}</p>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Billed Revenue</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{viewDetail.billedRevenueLabel}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Revenue Share</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{viewDetail.revenueShareLabel}</p>
              </div>
            </div>
            <div className="flex justify-end border-t border-gray-200 pt-4">
              <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Close</button>
            </div>
          </div>
        ) : null}
      </SlideOver>
    </div>
  );
}

function RevenueByEnrollmentTypeTab() {
  const [data, setData] = useState<RevenueAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewDetail, setViewDetail] = useState<RevenueByEnrollmentTypeRow | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const fetchData = useCallback(async ({
    search, page,
  }: {
    search: string; page: number;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getRevenueAnalysis({
        tab: 'revenue-by-enrollment-type',
        search,
        page,
      });
      setData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load revenue by enrollment type data.');
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
    const rows = (data?.rows || []) as RevenueByEnrollmentTypeRow[];
    if (!rows.length) return;
    const headers = ['Enrollment Type', 'Linked Enrollments', 'Average Charge', 'Billed Revenue', 'Share'];
    const csvRows = rows.map((row) => [
      row.enrollmentType,
      String(row.linkedEnrollments),
      row.averageChargeLabel,
      row.billedRevenueLabel,
      row.shareLabel,
    ]);
    const csvContent = [headers, ...csvRows].map((r) => r.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'revenue-by-enrollment-type.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">Revenue By Enrollment Type</h2>
          <p className="text-sm text-gray-600">{data?.tab === 'revenue-by-enrollment-type' ? 'Enrollment-type revenue view aligned to enrollment billing-link final charge snapshots.' : 'Review LMS billed revenue by enrollment type.'}</p>
          <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!data?.rows?.length}>
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {data?.metrics?.length ? <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{data.metrics.map((metric) => <div key={metric.id}><MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} /></div>)}</div> : null}

      {data?.metrics?.length ? <MetricsOverviewChart metrics={data.metrics} /> : null}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Enrollment Type Distribution</h3>
          </div>
          <div className="mt-3">
            <RevenueChart type="pie" data={((data?.rows || []) as RevenueByEnrollmentTypeRow[]).map((r) => ({ name: r.enrollmentType, value: r.billedRevenue }))} height={300} showLegend={true} emptyMessage="No enrollment type revenue data to chart." />
          </div>
        </div>
        <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <form onSubmit={handleSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search enrollment type, billed revenue, share, or bucket total" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700">
                <Search className="h-4 w-4" /> Search
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-4 p-5">
          {error ? <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div> : null}

          {isLoading ? <LoadingSkeleton /> : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Enrollment Type', 'Linked Enrollments', 'Average Charge', 'Billed Revenue', 'Share'].map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Linked Enrollments' || column === 'Average Charge' || column === 'Billed Revenue' || column === 'Share' ? 'text-right' : 'text-left'}`}>{column}</th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {((data?.rows || []) as RevenueByEnrollmentTypeRow[]).length > 0 ? ((data?.rows || []) as RevenueByEnrollmentTypeRow[]).map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          {row.cells.map((cell, index) => renderCell(cell, index))}
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => { setViewDetail(row); setIsViewOpen(true); }} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail">
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">No revenue-by-enrollment-type rows found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {data?.pagination && data.pagination.totalPages > 1 ? (
                <div className="flex items-center justify-between">
                  <button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button>
                  <span className="text-sm text-gray-600">Page {data.pagination.page} of {data.pagination.totalPages}</span>
                  <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Enrollment Type Revenue Detail" width="max-w-lg">
        {viewDetail ? (
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Enrollment Type</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">{viewDetail.enrollmentType}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Linked Enrollments</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{viewDetail.linkedEnrollments}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Average Charge</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{viewDetail.averageChargeLabel}</p>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Billed Revenue</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{viewDetail.billedRevenueLabel}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Share of Total</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{viewDetail.shareLabel}</p>
              </div>
            </div>
            <div className="flex justify-end border-t border-gray-200 pt-4">
              <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Close</button>
            </div>
          </div>
        ) : null}
      </SlideOver>
    </div>
  );
}

export function RevenueAnalysisClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get('tab') as TabId) || 'revenue-by-course';

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
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">LMS Finance / LMS Finance Reporting</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Revenue Analysis</h1>
              <p className="mt-1 max-w-3xl text-base text-gray-600">Review LMS billed revenue by course, instructor, and enrollment type using the reporting outputs already exposed by the LMS dashboard service.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6">
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
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'revenue-by-course' && <RevenueByCourseTab />}
          {activeTab === 'revenue-by-instructor' && <RevenueByInstructorTab />}
          {activeTab === 'revenue-by-enrollment-type' && <RevenueByEnrollmentTypeTab />}
        </div>
      </div>
    </div>
  );
}
