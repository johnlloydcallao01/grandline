import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, ACCOUNTING_TIME_ENTRY_STATUS_OPTIONS, ACCOUNTING_TIME_ENTRY_SOURCE_TYPE_OPTIONS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => { if (!value) return fallback; const p = Number(value); return Number.isFinite(p) ? p : fallback }
const parseListParam = (searchParams: URLSearchParams, key: string): string[] => Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))
const normalizeText = (value?: string | null) => String(value || '').trim().toLowerCase()
const formatDate = (v: string | null | undefined) => { if (!v) return '-'; const d = new Date(v); if (Number.isNaN(d.getTime())) return String(v); return d.toLocaleDateString('en-CA') }
const formatDateTime = (v: string | null | undefined) => { if (!v) return '-'; const d = new Date(v); if (Number.isNaN(d.getTime())) return String(v); return d.toLocaleDateString('en-CA') + ' ' + d.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' }) }

const STATUS_TONE: Record<string, string> = { draft: 'amber', submitted: 'blue', approved: 'green', rejected: 'red', posted: 'blue' }
const SOURCE_TONE: Record<string, string> = { manual: 'gray', timer: 'blue', course_delivery: 'green', project_work: 'green', support: 'amber', other: 'gray' }

function getRelationLabel(rel: unknown): string {
  if (!rel) return '-'
  if (typeof rel === 'object' && rel !== null) { const r = rel as { name?: string; displayName?: string; projectCode?: string; taskCode?: string; title?: string; firstName?: string; lastName?: string; email?: string; username?: string; id?: string | number }; return r.name || r.displayName || r.projectCode || r.taskCode || r.title || [r.firstName, r.lastName].filter(Boolean).join(' ') || r.email || r.username || String(r.id || '') }
  return String(rel)
}

function fmtHours(h: number | null | undefined, m: number | null | undefined): string { const total = (h || 0) + (m || 0) / 60; return total.toFixed(2) }

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = normalizeText(searchParams.get('search'))
    const statuses = parseListParam(searchParams, 'status')
    const billableFilter = parseListParam(searchParams, 'billable')
    const sourceTypes = parseListParam(searchParams, 'sourceType')
    const projectIds = parseListParam(searchParams, 'projectId')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [entryDocs, projectDocs, userDocs, taskDocs, courseDocs, instructorDocs, timesheetDocs] = await Promise.all([
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.timeEntries, depth: 2, sort: '-entryDate' }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.projects, depth: 0 }),
      findAllDocs<any>({ payload, collection: 'users', depth: 0 }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.projectTasks, depth: 0 }),
      findAllDocs<any>({ payload, collection: 'courses', depth: 0 }),
      findAllDocs<any>({ payload, collection: 'instructors', depth: 0 }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.timesheets, depth: 0 }),
    ])

    const projects = projectDocs.map((p) => ({ id: String(p.id), label: `${p.projectCode ? `${p.projectCode} - ` : ''}${p.name || ''}`.trim() || `Project ${p.id}` }))
    const users = userDocs.filter((u) => u.role !== 'service' && u.isActive !== false).map((u) => ({ id: String(u.id), label: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || u.username || `User ${u.id}` }))
    const tasks = taskDocs.map((t) => ({ id: String(t.id), label: t.name || t.taskCode || `Task ${t.id}` }))
    const courses = courseDocs.map((c) => ({ id: String(c.id), label: c.title || c.name || `Course ${c.id}` }))
    const instructors = instructorDocs.map((i) => ({ id: String(i.id), label: i.name || i.displayName || `Instructor ${i.id}` }))
    const timesheets = timesheetDocs.map((ts) => ({ id: String(ts.id), label: `${formatDate(ts.periodStart)} – ${formatDate(ts.periodEnd)}` }))

    const rows = entryDocs.map((doc) => {
      const status = doc.status || 'draft'; const stLabel = ACCOUNTING_TIME_ENTRY_STATUS_OPTIONS.find((o) => o.value === status)?.label || status
      const srcType = doc.sourceType || 'manual'; const srcLabel = ACCOUNTING_TIME_ENTRY_SOURCE_TYPE_OPTIONS.find((o) => o.value === srcType)?.label || srcType
      const isBillable = doc.billable !== false
      const hrs = fmtHours(doc.hours, doc.minutes)

      return {
        id: String(doc.id), entryDate: doc.entryDate || null, entryDateLabel: formatDate(doc.entryDate), status, statusLabel: stLabel, statusTone: STATUS_TONE[status] || 'gray',
        sourceType: srcType, sourceTypeLabel: srcLabel, sourceTypeTone: SOURCE_TONE[srcType] || 'gray',
        userId: doc.user !== null && typeof doc.user === 'object' ? String((doc.user as any).id || '') : String(doc.user || ''),
        userLabel: getRelationLabel(doc.user),
        projectId: doc.project !== null && typeof doc.project === 'object' ? String((doc.project as any).id || '') : String(doc.project || ''),
        projectLabel: getRelationLabel(doc.project),
        projectTaskId: doc.projectTask !== null && typeof doc.projectTask === 'object' ? String((doc.projectTask as any).id || '') : String(doc.projectTask || ''),
        projectTaskLabel: getRelationLabel(doc.projectTask),
        courseId: doc.course !== null && typeof doc.course === 'object' ? String((doc.course as any).id || '') : String(doc.course || ''),
        courseLabel: getRelationLabel(doc.course),
        instructorId: doc.instructor !== null && typeof doc.instructor === 'object' ? String((doc.instructor as any).id || '') : String(doc.instructor || ''),
        instructorLabel: getRelationLabel(doc.instructor),
        timesheetId: doc.timesheet !== null && typeof doc.timesheet === 'object' ? String((doc.timesheet as any).id || '') : String(doc.timesheet || ''),
        timesheetLabel: doc.timesheet !== null && typeof doc.timesheet === 'object' ? `${formatDate((doc.timesheet as any).periodStart)} – ${formatDate((doc.timesheet as any).periodEnd)}` : '-',
        hours: Number(hrs), hoursLabel: hrs, minutes: doc.minutes || 0,
        isBillable, billableLabel: isBillable ? 'Yes' : 'No',
        billingRate: typeof doc.billingRate === 'number' ? doc.billingRate : 0,
        costRate: typeof doc.costRate === 'number' ? doc.costRate : 0,
        startedAt: doc.startedAt || null, startedAtLabel: formatDateTime(doc.startedAt),
        endedAt: doc.endedAt || null, endedAtLabel: formatDateTime(doc.endedAt),
        approvedByLabel: getRelationLabel(doc.approvedBy),
        approvedAt: doc.approvedAt || null, approvedAtLabel: formatDateTime(doc.approvedAt),
        notes: doc.notes || '', createdAt: doc.createdAt || null, updatedAt: doc.updatedAt || null,
        searchableText: normalizeText([formatDate(doc.entryDate), stLabel, srcLabel, getRelationLabel(doc.user), getRelationLabel(doc.project), getRelationLabel(doc.projectTask), isBillable ? 'billable' : '', doc.notes].join(' ')),
        cells: [
          formatDate(doc.entryDate),
          getRelationLabel(doc.project),
          { text: hrs, align: 'right' },
          { text: isBillable ? 'Yes' : 'No', tone: isBillable ? 'green' : 'gray' },
          { text: stLabel, tone: STATUS_TONE[status] || 'gray' },
        ],
      }
    })

    let filtered = rows
    if (search) { filtered = filtered.filter((r) => r.searchableText.includes(search)) }
    if (statuses.length > 0) { filtered = filtered.filter((r) => statuses.includes(r.status)) }
    if (billableFilter.length > 0) { filtered = filtered.filter((r) => billableFilter.includes(r.isBillable ? 'true' : 'false')) }
    if (sourceTypes.length > 0) { filtered = filtered.filter((r) => sourceTypes.includes(r.sourceType)) }
    if (projectIds.length > 0) { filtered = filtered.filter((r) => projectIds.includes(r.projectId)) }
    if (quickFilters.length > 0) {
      filtered = filtered.filter((r) => quickFilters.some((qf) => {
        if (qf === 'billable:yes') return r.isBillable
        if (qf === 'billable:no') return !r.isBillable
        if (qf === 'status:draft') return r.status === 'draft'
        if (qf === 'status:approved') return r.status === 'approved'
        if (qf === 'source:timer') return r.sourceType === 'timer'
        return false
      }))
    }

    const totalDocs = filtered.length; const totalPages = Math.max(1, Math.ceil(totalDocs / limit)); const currentPage = Math.min(page, totalPages); const paginatedRows = filtered.slice((currentPage - 1) * limit, currentPage * limit)
    const billableCount = rows.filter((r) => r.isBillable).length
    const totalHours = rows.reduce((s, r) => s + r.hours, 0)
    const approvedHours = rows.filter((r) => r.status === 'approved' || r.status === 'posted').reduce((s, r) => s + r.hours, 0)

    return NextResponse.json({
      section: { id: 'time-entries', label: 'Time Entries', description: 'Review billable and non-billable time entries used for approvals, payroll support, and project profitability.', searchPlaceholder: 'Search entry date, user, project, task, course, source type, or status',
        filters: { statuses: ACCOUNTING_TIME_ENTRY_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })), billableOptions: [{ label: 'Billable', value: 'true' }, { label: 'Non-Billable', value: 'false' }], sourceTypes: ACCOUNTING_TIME_ENTRY_SOURCE_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value })), quickFilters: [{ label: 'Billable', value: 'billable:yes' }, { label: 'Non-Billable', value: 'billable:no' }, { label: 'Draft', value: 'status:draft' }, { label: 'Approved', value: 'status:approved' }, { label: 'Timer Entries', value: 'source:timer' }] },
        metrics: [
          { id: 'total', label: 'Time Entries', value: rows.length, change: 'Billable and non-billable time records', trend: 'up' as const },
          { id: 'billable', label: 'Billable Entries', value: billableCount, change: 'Entries marked for client billing', trend: 'up' as const },
          { id: 'hours', label: 'Total Hours', value: `${totalHours.toFixed(1)}h`, change: 'Combined decimal hours across all entries', trend: 'neutral' as const },
          { id: 'billed', label: 'Billed Amount', value: `PHP ${rows.reduce((s, r) => s + r.hours * r.billingRate, 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, change: `Approved/posted: ${approvedHours.toFixed(1)}h`, trend: 'up' as const },
        ],
        table: { title: 'Time Entry Register', description: 'Time records aligned to accounting-time-entries, including project, task, hours, billable flag, and approval status.', columns: ['Entry Date', 'Project', 'Hours', 'Billable', 'Status'], rows: paginatedRows },
      },
      appliedFilters: { search, statuses, billableFilter, sourceTypes, projectIds, quickFilters },
      pagination: { page: currentPage, limit, totalDocs, totalPages, hasPrevPage: currentPage > 1, hasNextPage: currentPage < totalPages },
      totals: { totalRows: rows.length, filteredRows: totalDocs, billableCount, totalHours, approvedHours },
      referenceData: { projects, users, tasks, courses, instructors, timesheets, statusOptions: ACCOUNTING_TIME_ENTRY_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })), sourceTypeOptions: ACCOUNTING_TIME_ENTRY_SOURCE_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value })) },
    })
  } catch (error) { return handleAccountingApiError(error) }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = await request.json()
    if (!body?.entryDate || !body?.userId) { return NextResponse.json({ error: 'Entry date and user are required.' }, { status: 400 }) }

    const data: Record<string, unknown> = {
      entryDate: body.entryDate, user: Number(body.userId),
      status: body.status || 'draft', sourceType: body.sourceType || 'manual',
      hours: Number(body.hours) || 0, minutes: Number(body.minutes) || 0,
      billable: body.billable !== false,
      billingRate: Number(body.billingRate) || 0, costRate: Number(body.costRate) || 0,
      startedAt: body.startedAt || undefined, endedAt: body.endedAt || undefined,
      notes: body.notes || undefined, createdBy: user.id, updatedBy: user.id,
    }
    if (body.projectId) { const n = Number(body.projectId); if (Number.isFinite(n)) data.project = n }
    if (body.projectTaskId) { const n = Number(body.projectTaskId); if (Number.isFinite(n)) data.projectTask = n }
    if (body.courseId) { const n = Number(body.courseId); if (Number.isFinite(n)) data.course = n }
    if (body.instructorId) { const n = Number(body.instructorId); if (Number.isFinite(n)) data.instructor = n }
    if (body.timesheetId) { const n = Number(body.timesheetId); if (Number.isFinite(n)) data.timesheet = n }

    const created = await payload.create({ collection: ACCOUNTING_COLLECTION_SLUGS.timeEntries, depth: 2, overrideAccess: true, data: data as never })
    return NextResponse.json({ id: created.id, entry: created }, { status: 201 })
  } catch (error) { return handleAccountingApiError(error) }
}
