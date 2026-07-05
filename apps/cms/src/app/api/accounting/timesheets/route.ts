import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, ACCOUNTING_TIMESHEET_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => { if (!value) return fallback; const p = Number(value); return Number.isFinite(p) ? p : fallback }
const parseListParam = (searchParams: URLSearchParams, key: string): string[] => Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))
const normalizeText = (value?: string | null) => String(value || '').trim().toLowerCase()
const formatDate = (v: string | null | undefined) => { if (!v) return '-'; const d = new Date(v); if (Number.isNaN(d.getTime())) return String(v); return d.toLocaleDateString('en-CA') }
function getRelationLabel(rel: unknown): string { if (!rel) return '-'; if (typeof rel === 'object' && rel !== null) { const r = rel as Record<string, any>; return [r.firstName, r.lastName].filter(Boolean).join(' ') || r.email || r.username || String(r.id || '') } return String(rel) }
const STATUS_TONE: Record<string, string> = { draft: 'amber', submitted: 'blue', approved: 'green', rejected: 'red', locked: 'gray' }

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = normalizeText(searchParams.get('search'))
    const statuses = parseListParam(searchParams, 'status')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [tsDocs, userDocs] = await Promise.all([
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.timesheets, depth: 2, sort: '-periodStart' }),
      findAllDocs<any>({ payload, collection: 'users', depth: 0 }),
    ])
    const users = userDocs.filter((u) => u.role !== 'service' && u.isActive !== false).map((u) => ({ id: String(u.id), label: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || u.username || `User ${u.id}` }))

    const rows = tsDocs.map((doc) => {
      const s = doc.status || 'draft'; const sl = ACCOUNTING_TIMESHEET_STATUS_OPTIONS.find((o) => o.value === s)?.label || s
      return {
        id: String(doc.id), periodStart: doc.periodStart || null, periodStartLabel: formatDate(doc.periodStart),
        periodEnd: doc.periodEnd || null, periodEndLabel: formatDate(doc.periodEnd),
        status: s, statusLabel: sl, statusTone: STATUS_TONE[s] || 'gray',
        userId: doc.user !== null && typeof doc.user === 'object' ? String((doc.user as any).id || '') : String(doc.user || ''),
        userLabel: getRelationLabel(doc.user),
        totalHours: typeof doc.totalHours === 'number' ? doc.totalHours : 0,
        totalHoursLabel: (typeof doc.totalHours === 'number' ? doc.totalHours : 0).toFixed(2),
        approvedByLabel: getRelationLabel(doc.approvedBy),
        approvedAt: doc.approvedAt || null, approvedAtLabel: formatDate(doc.approvedAt),
        notes: doc.notes || '',
        searchableText: normalizeText([formatDate(doc.periodStart), formatDate(doc.periodEnd), sl, getRelationLabel(doc.user), doc.notes].join(' ')),
        cells: [
          formatDate(doc.periodStart),
          formatDate(doc.periodEnd),
          getRelationLabel(doc.user),
          { text: (typeof doc.totalHours === 'number' ? doc.totalHours : 0).toFixed(2), align: 'right' },
          { text: sl, tone: STATUS_TONE[s] || 'gray' },
        ],
      }
    })

    let filtered = rows
    if (search) { filtered = filtered.filter((r) => r.searchableText.includes(search)) }
    if (statuses.length > 0) { filtered = filtered.filter((r) => statuses.includes(r.status)) }
    if (quickFilters.length > 0) { filtered = filtered.filter((r) => quickFilters.some((q) => { if (q === 'approved') return r.status === 'approved'; if (q === 'draft') return r.status === 'draft'; if (q === 'submitted') return r.status === 'submitted'; return false })) }

    const totalDocs = filtered.length; const tp = Math.max(1, Math.ceil(totalDocs / limit)); const cp = Math.min(page, tp); const pr = filtered.slice((cp - 1) * limit, cp * limit)
    const approvedCount = rows.filter((r) => r.status === 'approved').length
    const totalHrs = rows.reduce((s, r) => s + r.totalHours, 0)
    const pendingCount = rows.filter((r) => r.status === 'draft').length

    return NextResponse.json({
      section: { id: 'timesheets', label: 'Timesheets', description: 'Review timesheet containers grouping time entries by user and period for submission and approval.', searchPlaceholder: 'Search timesheet user, period, status, or total hours',
        filters: { statuses: ACCOUNTING_TIMESHEET_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })), quickFilters: [{ label: 'Draft', value: 'draft' }, { label: 'Submitted', value: 'submitted' }, { label: 'Approved', value: 'approved' }] },
        metrics: [
          { id: 'total', label: 'Timesheets', value: rows.length, change: 'Timesheet containers across users and periods', trend: 'up' as const },
          { id: 'approved', label: 'Approved', value: approvedCount, change: 'Timesheets fully approved and ready for payroll', trend: approvedCount > 0 ? 'up' as const : 'neutral' as const },
          { id: 'hours', label: 'Total Hours', value: `${totalHrs.toFixed(1)}h`, change: 'Combined hours across all timesheets', trend: 'neutral' as const },
          { id: 'pending', label: 'Pending', value: pendingCount, change: 'Timesheets still in draft state', trend: pendingCount > 0 ? 'down' as const : 'neutral' as const },
        ],
        table: { title: 'Timesheet Register', description: 'Timesheet containers aligned to accounting-timesheets, showing period, user, status, and total hours.', columns: ['Period Start', 'Period End', 'User', 'Total Hours', 'Status'], rows: pr },
      },
      appliedFilters: { search, statuses, quickFilters },
      pagination: { page: cp, limit, totalDocs, totalPages: tp, hasPrevPage: cp > 1, hasNextPage: cp < tp },
      totals: { totalRows: rows.length, filteredRows: totalDocs, approvedCount, totalHours: totalHrs, pendingCount },
      referenceData: { users, statusOptions: ACCOUNTING_TIMESHEET_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })) },
    })
  } catch (e) { return handleAccountingApiError(e) }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user: me } = await requireAccountingAdmin(request)
    const body = await request.json()
    if (!body?.userId || !body?.periodStart || !body?.periodEnd) { return NextResponse.json({ error: 'User, periodStart, and periodEnd are required.' }, { status: 400 }) }
    const data = { user: Number(body.userId), periodStart: body.periodStart, periodEnd: body.periodEnd, status: body.status || 'draft', notes: body.notes || undefined, createdBy: me.id, updatedBy: me.id } as never
    const created = await payload.create({ collection: ACCOUNTING_COLLECTION_SLUGS.timesheets, depth: 2, overrideAccess: true, data })
    return NextResponse.json({ id: created.id, timesheet: created }, { status: 201 })
  } catch (e) { return handleAccountingApiError(e) }
}
