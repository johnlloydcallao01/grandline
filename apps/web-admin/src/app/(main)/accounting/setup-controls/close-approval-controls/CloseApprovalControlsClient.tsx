'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Key,
  Lock,
  RefreshCw,
  Shield,
  ShieldAlert,
  Sliders,
  Unlock,
  X,
  Loader2,
} from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import {
  fetchCloseApprovalState,
  fetchApprovalCoverage,
  closePeriod,
  reopenPeriod,
  closeFiscalYear,
  reopenFiscalYear,
  type CloseApprovalStateResponse,
  type ApprovalCoverageResponse,
  type FiscalYearSummary,
  type PeriodSummary,
} from './actions'

type TabId = 'lock-close' | 'coverage' | 'safeguards'

type ConfirmAction =
  | { type: 'closePeriod'; period: PeriodSummary; fiscalYearCode: string }
  | { type: 'reopenPeriod'; period: PeriodSummary; fiscalYearCode: string }
  | { type: 'closeFiscalYear'; fiscalYear: FiscalYearSummary }
  | { type: 'reopenFiscalYear'; fiscalYear: FiscalYearSummary }
  | null

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    open: 'bg-green-50 text-green-700 border-green-200',
    closed: 'bg-slate-100 text-slate-600 border-slate-200',
    soft_locked: 'bg-amber-50 text-amber-700 border-amber-200',
    draft: 'bg-gray-50 text-gray-500 border-gray-200',
  }
  const labels: Record<string, string> = {
    open: 'Open',
    closed: 'Closed',
    soft_locked: 'Soft Locked',
    draft: 'Draft',
  }
  return (
    <span className={`inline-flex rounded-md border px-2.5 py-0.5 text-xs font-medium ${colors[status] || colors.draft}`}>
      {labels[status] || status}
    </span>
  )
}

function closeModeBadge(mode: string) {
  if (mode === 'hard_lock') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
        <Lock className="h-3 w-3" /> Hard Lock
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600">
      <Unlock className="h-3 w-3" /> Manual
    </span>
  )
}

function MetricCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: number | string; sub?: string; color: string
}) {
  const colors: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    amber: 'text-amber-600 bg-amber-50 border-amber-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    slate: 'text-slate-600 bg-slate-50 border-slate-200',
    red: 'text-red-600 bg-red-50 border-red-200',
  }
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg border ${colors[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {sub ? <p className="text-xs text-gray-400">{sub}</p> : null}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 w-full animate-pulse rounded-lg bg-gray-50" />
        ))}
      </div>
    </div>
  )
}

export function CloseApprovalControlsClient() {
  const [activeTab, setActiveTab] = useState<TabId>('lock-close')
  const [stateData, setStateData] = useState<CloseApprovalStateResponse | null>(null)
  const [coverageData, setCoverageData] = useState<ApprovalCoverageResponse | null>(null)
  const [isLoadingState, setIsLoadingState] = useState(true)
  const [isLoadingCoverage, setIsLoadingCoverage] = useState(true)
  const [stateError, setStateError] = useState<string | null>(null)
  const [coverageError, setCoverageError] = useState<string | null>(null)
  const [expandedFiscalYears, setExpandedFiscalYears] = useState<Set<string>>(new Set())
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [lockedFromDate, setLockedFromDate] = useState('')
  const [clearLockDate, setClearLockDate] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [searchFilter, setSearchFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { addToast } = useToast()

  const loadState = useCallback(async () => {
    setIsLoadingState(true)
    setStateError(null)
    try {
      const res = await fetchCloseApprovalState()
      setStateData(res)
    } catch (err) {
      setStateError(err instanceof Error ? err.message : 'Failed to load close state.')
    } finally {
      setIsLoadingState(false)
    }
  }, [])

  const loadCoverage = useCallback(async () => {
    setIsLoadingCoverage(true)
    setCoverageError(null)
    try {
      const res = await fetchApprovalCoverage()
      setCoverageData(res)
    } catch (err) {
      setCoverageError(err instanceof Error ? err.message : 'Failed to load coverage data.')
    } finally {
      setIsLoadingCoverage(false)
    }
  }, [])

  useEffect(() => { void loadState() }, [loadState])
  useEffect(() => { void loadCoverage() }, [loadCoverage])

  const toggleFiscalYear = (id: string | number) => {
    setExpandedFiscalYears((prev) => {
      const next = new Set(prev)
      const key = String(id)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleConfirmAction = async () => {
    if (!confirmAction) return
    setIsSubmitting(true)
    setActionError(null)
    try {
      switch (confirmAction.type) {
        case 'closePeriod':
          await closePeriod(confirmAction.period.id, lockedFromDate || undefined)
          addToast({ title: 'Period closed', message: `Period ${confirmAction.period.label} has been closed.`, type: 'success' })
          break
        case 'reopenPeriod':
          await reopenPeriod(confirmAction.period.id, clearLockDate)
          addToast({ title: 'Period reopened', message: `Period ${confirmAction.period.label} has been reopened.`, type: 'success' })
          break
        case 'closeFiscalYear':
          await closeFiscalYear(confirmAction.fiscalYear.id, lockedFromDate || undefined)
          addToast({ title: 'Fiscal year closed', message: `${confirmAction.fiscalYear.code} has been closed.`, type: 'success' })
          break
        case 'reopenFiscalYear':
          await reopenFiscalYear(confirmAction.fiscalYear.id, clearLockDate)
          addToast({ title: 'Fiscal year reopened', message: `${confirmAction.fiscalYear.code} has been reopened.`, type: 'success' })
          break
      }
      setConfirmAction(null)
      setLockedFromDate('')
      setClearLockDate(false)
      void loadState()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Operation failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredFiscalYears = stateData?.fiscalYears.filter((fy) => {
    if (searchFilter && !fy.code.toLowerCase().includes(searchFilter.toLowerCase()) && !fy.name.toLowerCase().includes(searchFilter.toLowerCase())) {
      return false
    }
    if (statusFilter && fy.status !== statusFilter) return false
    return true
  }) ?? []

  const filteredEntityCoverage = coverageData?.entityCoverage.filter((ec) => {
    if (roleFilter === 'covered') return ec.hasActiveWorkflow
    if (roleFilter === 'gap') return ec.needsWorkflow
    return true
  }) ?? []

  function renderConfirmModal() {
    if (!confirmAction) return null
    const isClose = confirmAction.type === 'closePeriod' || confirmAction.type === 'closeFiscalYear'
    const title = confirmAction.type === 'closePeriod' ? 'Close Period'
      : confirmAction.type === 'reopenPeriod' ? 'Reopen Period'
      : confirmAction.type === 'closeFiscalYear' ? 'Close Fiscal Year'
      : 'Reopen Fiscal Year'

    const itemLabel = confirmAction.type === 'closePeriod' || confirmAction.type === 'reopenPeriod'
      ? `${confirmAction.period.label} (${confirmAction.fiscalYearCode})`
      : `${confirmAction.fiscalYear.code} — ${confirmAction.fiscalYear.name}`

    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-in-out bg-black/50">
        <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button type="button" onClick={() => { setConfirmAction(null); setActionError(null); setLockedFromDate(''); setClearLockDate(false) }} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="px-6 py-5 space-y-4">
            {actionError ? (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" /> {actionError}
              </div>
            ) : null}
            <p className="text-sm text-gray-700">
              {isClose
                ? `Are you sure you want to close "${itemLabel}"?`
                : `Are you sure you want to reopen "${itemLabel}"?`
              }
            </p>
            {!isClose ? (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Reopening makes the period or fiscal year available for posting again. All related posting guards will be re-evaluated.
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                Closing prevents further postings. This can be reversed by reopening.
              </p>
            )}
            {isClose ? (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Lock From Date (optional)</label>
                <input type="date" value={lockedFromDate} onChange={(e) => setLockedFromDate(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                <p className="mt-1 text-xs text-gray-400">Leave blank to use the period/fiscal year end date.</p>
              </div>
            ) : null}
            {!isClose ? (
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-3 py-2.5">
                <input type="checkbox" checked={clearLockDate} onChange={(e) => setClearLockDate(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 outline-none focus:ring-2 focus:ring-blue-100" />
                <span className="text-sm font-medium text-gray-700">Clear lock date on reopen</span>
              </label>
            ) : null}
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button type="button" onClick={() => { setConfirmAction(null); setActionError(null); setLockedFromDate(''); setClearLockDate(false) }} disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={handleConfirmAction} disabled={isSubmitting} className={`inline-flex items-center gap-2 rounded-lg border px-5 py-2 text-sm font-medium text-white disabled:opacity-50 ${isClose ? 'border-red-600 bg-red-600 hover:bg-red-700' : 'border-blue-600 bg-blue-600 hover:bg-blue-700'}`}>
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
              ) : (
                <>{isClose ? 'Close' : 'Reopen'}</>
              )}
            </button>
          </div>
        </div>
      </div>,
      document.body,
    )
  }

  return (
    <div className="space-y-6 p-[10px]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Core / Setup & Controls</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Close & Approval Controls</h1>
          <p className="mt-1 text-base text-gray-600">
            Command center for period-end close, approval workflow coverage, and posting safeguards.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button type="button" onClick={() => { void loadState(); void loadCoverage() }} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
            <RefreshCw className={`h-4 w-4 ${isLoadingState || isLoadingCoverage ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {[
          { id: 'lock-close' as TabId, label: 'Periods & Close State', icon: Lock },
          { id: 'coverage' as TabId, label: 'Approval Workflow Coverage', icon: Shield },
          { id: 'safeguards' as TabId, label: 'Safeguards & Guardrails', icon: ShieldAlert },
        ].map((tab) => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'lock-close' && (
        <>
          {stateData ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <MetricCard icon={CheckCircle} label="Open Periods" value={stateData.counts.openPeriods} sub="Available for posting" color="green" />
              <MetricCard icon={Lock} label="Closed Periods" value={stateData.counts.closedPeriods} sub="Posting blocked" color="slate" />
              <MetricCard icon={Clock} label="Soft-Locked Periods" value={stateData.counts.softLockedPeriods} sub="Restricted posting" color="amber" />
              <MetricCard icon={FileText} label="Open Fiscal Years" value={stateData.counts.openFiscalYears} sub="Active close cycles" color="blue" />
            </div>
          ) : isLoadingState ? (
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : null}

          {stateError ? (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" /> {stateError}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <input type="text" value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search fiscal year code or name..."
              className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 md:max-w-xs"
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Fiscal Years & Periods</h3>
              <p className="text-xs text-gray-500">Click a fiscal year to expand its periods. Use action buttons to close or reopen.</p>
            </div>
            {isLoadingState ? (
              <LoadingSkeleton />
            ) : filteredFiscalYears.length === 0 ? (
              <div className="px-5 py-12 text-center text-gray-500">
                <FileText className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                <p className="font-medium">No fiscal years found</p>
              </div>
            ) : (
              <div>
                <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1.5fr_auto] gap-4 px-5 py-2.5 bg-gray-50/80 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <span>Fiscal Year / Period</span>
                  <span>Range</span>
                  <span>Status</span>
                  <span>Locked From</span>
                  <span>Closed At</span>
                  <span className="w-40">Actions</span>
                </div>
                {filteredFiscalYears.map((fy) => {
                  const isExpanded = expandedFiscalYears.has(String(fy.id))
                  return (
                    <div key={String(fy.id)}>
                      <div
                        className={`grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1.5fr_auto] gap-2 md:gap-4 px-5 py-3.5 border-b border-gray-50 items-center cursor-pointer transition-colors hover:bg-blue-50/40 ${isExpanded ? 'bg-blue-50/20' : ''}`}
                        onClick={() => toggleFiscalYear(fy.id)}
                      >
                        <div className="flex items-center gap-2 font-medium text-gray-900">
                          {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" /> : <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />}
                          {fy.code}
                          <span className="text-xs text-gray-500 font-normal">— {fy.name}</span>
                        </div>
                        <span className="text-sm text-gray-600">{fy.startDate?.slice(0, 10)} to {fy.endDate?.slice(0, 10)}</span>
                        <div className="flex items-center gap-2">{statusBadge(fy.status)}{closeModeBadge(fy.closeMode)}</div>
                        <span className="text-sm text-gray-500">{fy.lockedFromDate ? fy.lockedFromDate.slice(0, 10) : '—'}</span>
                        <span className="text-sm text-gray-500">{fy.closedAt ? fy.closedAt.slice(0, 10) : '—'}</span>
                        <div className="flex gap-2 w-40" onClick={(e) => e.stopPropagation()}>
                          {fy.status !== 'closed' ? (
                            <button type="button" onClick={() => { setConfirmAction({ type: 'closeFiscalYear', fiscalYear: fy }); setLockedFromDate('') }}
                              className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Close</button>
                          ) : (
                            <button type="button" onClick={() => { setConfirmAction({ type: 'reopenFiscalYear', fiscalYear: fy }); setClearLockDate(false) }}
                              className="rounded-md border border-blue-200 bg-white px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50">Reopen</button>
                          )}
                        </div>
                      </div>
                      {isExpanded && fy.periods.length > 0 && (
                        <div className="bg-gray-50/50">
                          <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1.5fr_auto] gap-4 px-5 py-1.5 text-xs text-gray-400 border-b border-gray-100">
                            <span>Period</span>
                            <span>Range</span>
                            <span>Status</span>
                            <span>Locked From</span>
                            <span>Closed At</span>
                            <span className="w-40">Actions</span>
                          </div>
                          {fy.periods.map((p) => (
                            <div key={String(p.id)} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1.5fr_auto] gap-2 md:gap-4 px-5 py-3 border-b border-gray-100 items-center hover:bg-white transition-colors">
                              <span className="text-sm font-medium text-gray-800 pl-4 md:pl-8">{p.label}</span>
                              <span className="text-sm text-gray-600">{p.startDate?.slice(0, 10)} to {p.endDate?.slice(0, 10)}</span>
                              <div>{statusBadge(p.status)}</div>
                              <span className="text-sm text-gray-500">{p.lockedFromDate ? p.lockedFromDate.slice(0, 10) : '—'}</span>
                              <span className="text-sm text-gray-500">{p.closedAt ? p.closedAt.slice(0, 10) : '—'}</span>
                              <div className="flex gap-2 w-40">
                                {p.status !== 'closed' ? (
                                  <button type="button" onClick={() => setConfirmAction({ type: 'closePeriod', period: p, fiscalYearCode: fy.code })}
                                    className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Close</button>
                                ) : (
                                  <button type="button" onClick={() => setConfirmAction({ type: 'reopenPeriod', period: p, fiscalYearCode: fy.code })}
                                    className="rounded-md border border-blue-200 bg-white px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50">Reopen</button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'coverage' && (
        <>
          {coverageData ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <MetricCard icon={Shield} label="Entity Types" value={coverageData.counts.totalEntityTypes} sub="Supported by approval system" color="blue" />
              <MetricCard icon={CheckCircle} label="Covered" value={coverageData.counts.coveredTypes} sub="With active workflow" color="green" />
              <MetricCard icon={AlertCircle} label="Coverage Gaps" value={coverageData.counts.gapTypes} sub="Missing active workflow" color="red" />
              <MetricCard icon={Sliders} label="Workflow Steps" value={coverageData.counts.totalStepsConfigured} sub="Total across all workflows" color="purple" />
            </div>
          ) : isLoadingCoverage ? (
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : null}

          {coverageError ? (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" /> {coverageError}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All Entity Types</option>
              <option value="covered">Covered (Has Workflow)</option>
              <option value="gap">Coverage Gap (No Workflow)</option>
            </select>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80">
                    <th className="px-5 py-3 font-semibold text-gray-600">Entity Type</th>
                    <th className="px-5 py-3 font-semibold text-gray-600">Active Workflows</th>
                    <th className="px-5 py-3 font-semibold text-gray-600">Workflow Codes</th>
                    <th className="px-5 py-3 font-semibold text-gray-600">Steps</th>
                    <th className="px-5 py-3 font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntityCoverage.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-gray-500">
                        <Shield className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                        <p className="font-medium">No entity types found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredEntityCoverage.map((ec) => (
                      <tr key={ec.entityType} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/40">
                        <td className="px-5 py-3.5 font-medium text-gray-900">{ec.entityLabel}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 font-medium ${ec.hasActiveWorkflow ? 'text-green-600' : 'text-red-500'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${ec.hasActiveWorkflow ? 'bg-green-500' : 'bg-red-400'}`} />
                            {ec.activeWorkflowCount}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {ec.workflows.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {ec.workflows.map((wf) => (
                                <span key={wf.workflowCode} className="inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-200">
                                  {wf.workflowCode}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-gray-700">
                          {ec.workflows.reduce((sum, wf) => sum + wf.stepCount, 0)}
                        </td>
                        <td className="px-5 py-3.5">
                          {ec.hasActiveWorkflow ? (
                            <span className="inline-flex items-center gap-1.5 text-green-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-amber-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Needs Workflow
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'safeguards' && (
        <>
          {coverageData ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <MetricCard icon={Lock} label="Posting Guards" value="6" sub="Period & fiscal year posting enforcement" color="blue" />
              <MetricCard icon={Unlock} label="Reopen Rules" value="2" sub="Close-service reopen safeguards" color="amber" />
              <MetricCard icon={Shield} label="Approval Gates" value="2" sub="Operations requiring approved workflow" color="green" />
              <MetricCard icon={Key} label="Immutability Guards" value="1" sub="Posted entry re-posting protection" color="purple" />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          )}

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">All Safeguards Registry</h3>
              <p className="text-xs text-gray-500">
                Every guard enforced by the accounting engine. These are read-only references — configuration lives in Accounting Settings and the respective services.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80">
                    <th className="px-5 py-3 font-semibold text-gray-600">Control Area</th>
                    <th className="px-5 py-3 font-semibold text-gray-600">Protected Action</th>
                    <th className="px-5 py-3 font-semibold text-gray-600">Condition</th>
                    <th className="px-5 py-3 font-semibold text-gray-600">Behavior</th>
                    <th className="px-5 py-3 font-semibold text-gray-600">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {(coverageData?.safeguards ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-gray-500">
                        <ShieldAlert className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                        <p className="font-medium">No safeguards loaded</p>
                      </td>
                    </tr>
                  ) : (
                    (coverageData?.safeguards ?? []).map((g, i) => (
                      <tr key={i} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/40">
                        <td className="px-5 py-3.5 font-medium text-gray-900">{g.area}</td>
                        <td className="px-5 py-3.5 text-gray-700">{g.protectedAction}</td>
                        <td className="px-5 py-3.5 text-gray-600 max-w-xs">{g.condition}</td>
                        <td className="px-5 py-3.5 text-gray-600 max-w-xs">{g.behavior}</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 border border-purple-200">
                            {g.source}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {renderConfirmModal()}
    </div>
  )
}
