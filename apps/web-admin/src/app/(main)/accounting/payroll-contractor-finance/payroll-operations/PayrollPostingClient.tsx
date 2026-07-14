'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Eye,
  FileText,
  Filter,
  RefreshCw,
  Search,
  SendHorizonal,
  Trash2,
  X,
} from 'lucide-react';
import {
  getPostingRegister,
  getPostingDetail,
  postPayrollRunToGL,
  voidPayrollRun,
  type PostingCell,
  type PostingDetail,
  type PostingMetric,
  type PostingRegisterResponse,
} from './actions-payroll-posting';

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

function getMetricTone(trend: PostingMetric['trend']) {
  if (trend === 'down') return 'text-red-600 bg-red-50';
  if (trend === 'neutral') return 'text-gray-600 bg-gray-100';
  return 'text-green-600 bg-green-50';
}

function escapeCsvValue(v: string) {
  return /[,"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

function toggleFilterValue(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

const fmt = (n: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(n);

type ActionTarget = { id: string; label: string };

const META = {
  searchPlaceholder: 'Search payroll code, payment date, posting state, or entry count',
  columns: ['Payroll Code', 'Payment Date', 'Entry Count', 'Gross Total', 'Approval State', 'Posted Journal', 'Posting State'],
  tableTitle: 'Payroll Posting Register',
  tableDescription: 'Posting readiness view grounded in payroll run status, entry counts, and journal linkage.',
};

function renderCell(cell: PostingCell, index: number) {
  if (typeof cell === 'string') {
    return <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{cell}</td>;
  }
  const alignClass = cell.align === 'right' ? 'text-right' : cell.align === 'center' ? 'text-center' : 'text-left';
  if (cell.tone) {
    const toneClasses: Record<string, string> = {
      green: 'bg-green-50 text-green-700 ring-green-200',
      blue: 'bg-blue-50 text-blue-700 ring-blue-200',
      amber: 'bg-amber-50 text-amber-700 ring-amber-200',
      red: 'bg-red-50 text-red-700 ring-red-200',
      gray: 'bg-gray-100 text-gray-700 ring-gray-200',
    };
    return (
      <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${alignClass}`}>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${toneClasses[cell.tone] || toneClasses.gray}`}>
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

function renderDetail(detail: PostingDetail) {
  const d = detail as Record<string, unknown>;
  const je = d.postedJournalEntry as Record<string, unknown> | undefined;
  const entries = d.entries as Record<string, unknown>[] | undefined;
  const branch = d.branch as Record<string, unknown> | undefined;
  const department = d.department as Record<string, unknown> | undefined;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><p className="text-xs font-medium text-gray-500">Payroll Code</p><p className="mt-0.5 text-sm font-semibold text-gray-900">{String(d.payrollCode || '-')}</p></div>
        <div><p className="text-xs font-medium text-gray-500">Status</p><p className="mt-0.5 text-sm text-gray-900">{String(d.status || '-')}</p></div>
        <div><p className="text-xs font-medium text-gray-500">Period Start</p><p className="mt-0.5 text-sm text-gray-900">{d.periodStart ? String(d.periodStart).slice(0, 10) : '-'}</p></div>
        <div><p className="text-xs font-medium text-gray-500">Period End</p><p className="mt-0.5 text-sm text-gray-900">{d.periodEnd ? String(d.periodEnd).slice(0, 10) : '-'}</p></div>
        <div><p className="text-xs font-medium text-gray-500">Payment Date</p><p className="mt-0.5 text-sm text-gray-900">{d.paymentDate ? String(d.paymentDate).slice(0, 10) : '-'}</p></div>
        <div><p className="text-xs font-medium text-gray-500">Branch</p><p className="mt-0.5 text-sm text-gray-900">{branch ? String(branch.name || '') : '-'}</p></div>
        <div><p className="text-xs font-medium text-gray-500">Department</p><p className="mt-0.5 text-sm text-gray-900">{department ? String(department.name || '') : '-'}</p></div>
      </div>
      {je && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <p className="text-xs font-medium text-green-700">Posted Journal Entry</p>
          <p className="mt-1 text-sm font-semibold text-green-800">{String(je.entryNumber || je.id || '')}</p>
          {je.memo && <p className="mt-0.5 text-xs text-green-600">{String(je.memo)}</p>}
        </div>
      )}
      <div><p className="text-xs font-medium text-gray-500">Notes</p><p className="mt-0.5 text-sm text-gray-900">{d.notes ? String(d.notes) : '-'}</p></div>
      {entries && entries.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Payroll Entries ({entries.length})</p>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-500">Person</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-500">Gross</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-500">Net</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entries.map((e: Record<string, unknown>) => (
                  <tr key={String(e.id)} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-900">{String(e.user ? (e.user as Record<string, unknown>).name || '' : e.employeeName || e.employeeCode || '')}</td>
                    <td className="px-3 py-2 text-right text-gray-900">{fmt(Number(e.grossAmount) || 0)}</td>
                    <td className="px-3 py-2 text-right text-gray-900">{fmt(Number(e.netAmount) || 0)}</td>
                    <td className="px-3 py-2 text-gray-600">{String(e.status || '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PayrollPostingClient() {
  const [data, setData] = useState<PostingRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [viewDetail, setViewDetail] = useState<PostingDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [postTarget, setPostTarget] = useState<ActionTarget | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [voidTarget, setVoidTarget] = useState<ActionTarget | null>(null);
  const [isVoiding, setIsVoiding] = useState(false);

  const fetchData = useCallback(async (query?: { search?: string; page?: number; quickFilters?: string[] }) => {
    setError(null);
    try {
      const result = await getPostingRegister(query || { search: searchInput, page, quickFilters });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posting register.');
    }
  }, [searchInput, page, quickFilters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = useCallback((value: string) => {
    setSearchInput(value);
    setPage(1);
  }, []);

  const handleQuickFilter = useCallback((value: string) => {
    setQuickFilters((prev) => toggleFilterValue(prev, value));
    setPage(1);
  }, []);

  const openView = useCallback(async (id: string) => {
    setIsViewLoading(true);
    setIsViewOpen(true);
    try {
      const detail = await getPostingDetail(id);
      setViewDetail(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load detail.');
    } finally {
      setIsViewLoading(false);
    }
  }, []);

  const closeView = useCallback(() => {
    setIsViewOpen(false);
    setViewDetail(null);
  }, []);

  const handleConfirmPost = useCallback(async () => {
    if (!postTarget) return;
    setIsPosting(true);
    setError(null);
    try {
      await postPayrollRunToGL(postTarget.id);
      setPostTarget(null);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post payroll run.');
    } finally {
      setIsPosting(false);
    }
  }, [postTarget, fetchData]);

  const handleConfirmVoid = useCallback(async () => {
    if (!voidTarget) return;
    setIsVoiding(true);
    setError(null);
    try {
      await voidPayrollRun(voidTarget.id);
      setVoidTarget(null);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to void payroll run.');
    } finally {
      setIsVoiding(false);
    }
  }, [voidTarget, fetchData]);

  const handleExportCsv = useCallback(() => {
    if (!data) return;
    const headers = META.columns;
    const rows = data.rows.map((r) => [
      r.payrollCode,
      r.paymentDate || '',
      String(r.entryCount),
      r.grossTotalLabel,
      r.statusLabel,
      r.journalRef || '',
      r.postingStateLabel,
    ].map(escapeCsvValue).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `payroll-posting-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }, [data]);

  const quickFilterOptions = data?.filterOptions.quickFilters || [];

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button type="button" onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {(data?.metrics || []).map((metric) => {
          const TrendIcon = metric.trend === 'down' ? ArrowDownRight : ArrowUpRight;
          const toneClass = getMetricTone(metric.trend);
          return (
            <div key={metric.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">{metric.label}</p>
                  <p className="mt-3 text-2xl font-bold text-gray-900">{metric.value}</p>
                </div>
                <div className="rounded-lg bg-gray-100 p-3 text-gray-600">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${toneClass}`}>
                  <TrendIcon className="h-3.5 w-3.5" />
                  {metric.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">Payroll Posting</h2>
          <p className="text-sm text-gray-600">{META.tableDescription}</p>
          <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => fetchData()} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button type="button" onClick={handleExportCsv} className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-transparent px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1 max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={META.searchPlaceholder}
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Quick Filters</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickFilterOptions.map((qf) => {
              const selected = quickFilters.includes(qf.value);
              return (
                <button
                  key={qf.value}
                  type="button"
                  onClick={() => handleQuickFilter(qf.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    selected ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {qf.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 p-[10px] sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">{META.tableTitle}</h3>
              <p className="text-sm text-gray-600">{META.tableDescription}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span>{data?.totals.filteredRows ?? 0} matching rows</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {META.columns.map((col) => (
                      <th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{col}</th>
                    ))}
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {data?.rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.cells.map((cell, index) => renderCell(cell, index))}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" onClick={() => openView(row.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700" title="View detail">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => row.postingState === 'ready_to_post' && setPostTarget({ id: row.id, label: row.payrollCode })}
                            disabled={row.postingState !== 'ready_to_post' || isPosting}
                            className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                            title={row.postingState === 'ready_to_post' ? 'Post to General Ledger' : row.postingState === 'posted' ? 'Already posted' : 'Must be approved first'}
                          >
                            <SendHorizonal className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => (row.postingState === 'draft' || row.postingState === 'pending_review') && setVoidTarget({ id: row.id, label: row.payrollCode })}
                            disabled={row.postingState !== 'draft' && row.postingState !== 'pending_review'}
                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                            title={row.postingState === 'draft' || row.postingState === 'pending_review' ? 'Void payroll run' : row.postingState === 'voided' ? 'Already voided' : 'Cannot void after posting'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!data || data.rows.length === 0) && (
                    <tr>
                      <td colSpan={META.columns.length + 1} className="px-4 py-12 text-center text-sm text-gray-500">
                        No payroll posting records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500">
                Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.totalDocs} total)
              </p>
              <div className="flex gap-2">
                <button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
                </button>
                <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <SlideOver isOpen={isViewOpen} onClose={closeView} title="Payroll Posting Detail">
        {isViewLoading ? (
          <div className="flex items-center justify-center py-12"><RefreshCw className="h-6 w-6 animate-spin text-gray-400" /></div>
        ) : viewDetail ? (
          renderDetail(viewDetail)
        ) : (
          <p className="text-sm text-gray-500">No detail available.</p>
        )}
        <div className="mt-6 flex items-center gap-3 border-t border-gray-200 pt-4">
          <button type="button" onClick={closeView} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Close
          </button>
        </div>
      </SlideOver>

      <SlideOver isOpen={Boolean(postTarget)} onClose={() => setPostTarget(null)} title="Post Payroll Run" description="Posting creates the journal entry and finalizes the payroll run in the General Ledger." width="max-w-lg">
        <div className="space-y-6">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
            <p className="font-medium">Post payroll run {postTarget?.label}?</p>
            <p className="mt-1">Make sure the payroll entries are complete and the expense/payable accounts are correctly mapped before posting.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setPostTarget(null)} disabled={isPosting} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleConfirmPost} disabled={isPosting} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">{isPosting ? 'Posting...' : 'Post Payroll Run'}</button>
          </div>
        </div>
      </SlideOver>

      <SlideOver isOpen={Boolean(voidTarget)} onClose={() => setVoidTarget(null)} title="Void Payroll Run" description="Cancel this payroll run and prevent any further posting actions." width="max-w-lg">
        <div className="space-y-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Void payroll run {voidTarget?.label}?</p>
            <p className="mt-1">This action cannot be undone. The run and its entries will be voided and excluded from posting.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setVoidTarget(null)} disabled={isVoiding} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleConfirmVoid} disabled={isVoiding} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">{isVoiding ? 'Voiding...' : 'Void Payroll Run'}</button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
