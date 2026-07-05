import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, ACCOUNTING_TIME_ENTRY_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => { if (!value) return fallback; const p = Number(value); return Number.isFinite(p) ? p : fallback }
const parseListParam = (searchParams: URLSearchParams, key: string): string[] => Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))
const normalizeText = (value?: string | null) => String(value || '').trim().toLowerCase()
const formatDate = (v: string | null | undefined) => { if (!v) return '-'; const d = new Date(v); if (Number.isNaN(d.getTime())) return String(v); return d.toLocaleDateString('en-CA') }
const formatDateTime = (v: string | null | undefined) => { if (!v) return '-'; const d = new Date(v); if (Number.isNaN(d.getTime())) return String(v); return d.toLocaleDateString('en-CA') + ' ' + d.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' }) }
function fmtHours(h: number | null | undefined, m: number | null | undefined): string { const t = (h || 0) + (m || 0) / 60; return t.toFixed(2) }
function getRelationLabel(rel: unknown): string { if (!rel) return '-'; if (typeof rel === 'object' && rel !== null) { const r = rel as Record<string, any>; return r.name || r.displayName || r.projectCode || r.taskCode || r.title || [r.firstName, r.lastName].filter(Boolean).join(' ') || r.email || r.username || String(r.id || '') } return String(rel) }
function hoursDiff(start: string | null, end: string | null): number { if (!start || !end) return 0; const s = new Date(start).getTime(), e = new Date(end).getTime(); return Math.max(0, (e - s) / 3600000) }

const STATUS_TONE: Record<string, string> = { draft: 'amber', submitted: 'blue', approved: 'green', rejected: 'red', posted: 'blue' }

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = normalizeText(searchParams.get('search'))
    const statuses = parseListParam(searchParams, 'status')
    const billableFilter = parseListParam(searchParams, 'billable')
    const projectIds = parseListParam(searchParams, 'projectId')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [entryDocs, projectDocs, userDocs] = await Promise.all([
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.timeEntries, depth: 2, sort: '-startedAt' }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.projects, depth: 0 }),
      findAllDocs<any>({ payload, collection: 'users', depth: 0 }),
    ])

    const projects = projectDocs.map((p) => ({ id: String(p.id), label: `${p.projectCode ? `${p.projectCode} - ` : ''}${p.name || ''}`.trim() || `Project ${p.id}` }))
    const users = userDocs.filter((u) => u.role !== 'service' && u.isActive !== false).map((u) => ({ id: String(u.id), label: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || u.username || `User ${u.id}` }))

    const timerDocs = entryDocs.filter((doc) => doc.sourceType === 'timer')

    const rows = timerDocs.map((doc) => {
      const status = doc.status || 'draft'; const stLabel = ACCOUNTING_TIME_ENTRY_STATUS_OPTIONS.find((o) => o.value === status)?.label || status
      const isBillable = doc.billable !== false; const h = fmtHours(doc.hours, doc.minutes)
      const started = doc.startedAt || null; const ended = doc.endedAt || null
      const isRunning = Boolean(started && !ended)
      const computedHrs = hoursDiff(started, ended)

      return {
        id: String(doc.id), entryDate: doc.entryDate || null, entryDateLabel: formatDate(doc.entryDate), status, statusLabel: stLabel, statusTone: STATUS_TONE[status] || 'gray',
        userId: doc.user !== null && typeof doc.user === 'object' ? String((doc.user as any).id || '') : String(doc.user || ''), userLabel: getRelationLabel(doc.user),
        projectId: doc.project !== null && typeof doc.project === 'object' ? String((doc.project as any).id || '') : String(doc.project || ''), projectLabel: getRelationLabel(doc.project),
        projectTaskId: doc.projectTask !== null && typeof doc.projectTask === 'object' ? String((doc.projectTask as any).id || '') : String(doc.projectTask || ''), projectTaskLabel: getRelationLabel(doc.projectTask),
        hours: Number(h), hoursLabel: h, minutes: doc.minutes || 0, isBillable, billableLabel: isBillable ? 'Yes' : 'No',
        billingRate: typeof doc.billingRate === 'number' ? doc.billingRate : 0, costRate: typeof doc.costRate === 'number' ? doc.costRate : 0,
        startedAt: started, startedAtLabel: formatDateTime(started),
        endedAt: ended, endedAtLabel: formatDateTime(ended),
        isRunning, computedHours: round(computedHrs),
        notes: doc.notes || '', searchableText: normalizeText([formatDate(doc.entryDate), stLabel, getRelationLabel(doc.user), getRelationLabel(doc.project), getRelationLabel(doc.projectTask), isBillable ? 'billable' : '', doc.notes].join(' ')),
        cells: [
          formatDate(doc.entryDate),
          getRelationLabel(doc.user),
          getRelationLabel(doc.project),
          { text: h, align: 'right' },
          { text: isBillable ? 'Yes' : 'No', tone: isBillable ? 'green' : 'gray' },
          { text: stLabel, tone: STATUS_TONE[status] || 'gray' },
        ],
      }
    })

    let filtered = rows
    if (search) { filtered = filtered.filter((r) => r.searchableText.includes(search)) }
    if (statuses.length > 0) { filtered = filtered.filter((r) => statuses.includes(r.status)) }
    if (billableFilter.length > 0) { filtered = filtered.filter((r) => billableFilter.includes(r.isBillable ? 'true' : 'false')) }
    if (projectIds.length > 0) { filtered = filtered.filter((r) => projectIds.includes(r.projectId)) }
    if (quickFilters.length > 0) { filtered = filtered.filter((r) => quickFilters.some((qf) => { if (qf === 'running') return r.isRunning; if (qf === 'billable:yes') return r.isBillable; if (qf === 'billable:no') return !r.isBillable; if (qf === 'approved') return r.status === 'approved'; return false })) }

    const totalDocs = filtered.length; const totalPages = Math.max(1, Math.ceil(totalDocs / limit)); const currentPage = Math.min(page, totalPages); const paginatedRows = filtered.slice((currentPage - 1) * limit, currentPage * limit)
    const runningCount = rows.filter((r) => r.isRunning).length
    const billableCount = rows.filter((r) => r.isBillable).length
    const totalHrs = rows.reduce((s, r) => s + r.hours, 0)
    const completed = rows.filter((r) => r.startedAt && r.endedAt)
    const avgDuration = completed.length > 0 ? completed.reduce((s, r) => s + r.computedHours, 0) / completed.length : 0

    return NextResponse.json({
      section: { id: 'timer-entries', label: 'Timer-Based Entries', description: 'Review time entries captured via start/stop timer with start and end timestamps.', searchPlaceholder: 'Search timer entry date, user, project, or hours',
        filters: { statuses: ACCOUNTING_TIME_ENTRY_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })), billableOptions: [{ label: 'Billable', value: 'true' }, { label: 'Non-Billable', value: 'false' }], quickFilters: [{ label: 'Running', value: 'running' }, { label: 'Billable', value: 'billable:yes' }, { label: 'Non-Billable', value: 'billable:no' }, { label: 'Approved', value: 'approved' }] },
        metrics: [
          { id: 'entries', label: 'Timer Entries', value: rows.length, change: 'Entries captured via timer with start/end timestamps', trend: 'up' as const },
          { id: 'running', label: 'Active Timers', value: runningCount, change: 'Currently running timer sessions', trend: runningCount > 0 ? 'up' as const : 'neutral' as const },
          { id: 'hours', label: 'Timer Hours', value: `${totalHrs.toFixed(1)}h`, change: 'Total hours logged via timer entries', trend: 'neutral' as const },
          { id: 'avg', label: 'Avg Duration', value: `${avgDuration.toFixed(1)}h`, change: `Average timer session across ${completed.length} completed`, trend: 'neutral' as const },
        ],
        table: { title: 'Timer-Based Entries', description: 'Timer-captured time entries aligned to accounting-time-entries with sourceType=timer.', columns: ['Entry Date', 'User', 'Project', 'Hours', 'Billable', 'Status'], rows: paginatedRows },
      },
      appliedFilters: { search, statuses, billableFilter, projectIds, quickFilters },
      pagination: { page: currentPage, limit, totalDocs, totalPages, hasPrevPage: currentPage > 1, hasNextPage: currentPage < totalPages },
      totals: { totalRows: rows.length, filteredRows: totalDocs, runningCount, billableCount, totalHours: round(totalHrs), avgDuration: round(avgDuration) },
      referenceData: { projects, users, statusOptions: ACCOUNTING_TIME_ENTRY_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })) },
    })
  } catch (error) { return handleAccountingApiError(error) }
}

function round(v: number): number { return Math.round(v * 100) / 100 }
