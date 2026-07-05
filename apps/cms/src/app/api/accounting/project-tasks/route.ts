import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, ACCOUNTING_PROJECT_TASK_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => { if (!value) return fallback; const p = Number(value); return Number.isFinite(p) ? p : fallback }
const parseListParam = (searchParams: URLSearchParams, key: string): string[] => Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))
const normalizeText = (value?: string | null) => String(value || '').trim().toLowerCase()
const formatDate = (v: string | null | undefined) => { if (!v) return '-'; const d = new Date(v); if (Number.isNaN(d.getTime())) return String(v); return d.toLocaleDateString('en-CA') }

const STATUS_TONE: Record<string, string> = { draft: 'amber', open: 'blue', in_progress: 'blue', completed: 'green', cancelled: 'red' }

function getRelationshipLabel(rel: unknown): string {
  if (!rel) return '-'
  if (typeof rel === 'object' && rel !== null) { const r = rel as { name?: string; displayName?: string; projectCode?: string; firstName?: string; lastName?: string; email?: string; username?: string; id?: string | number }; return r.name || r.displayName || r.projectCode || [r.firstName, r.lastName].filter(Boolean).join(' ') || r.email || r.username || String(r.id || '') }
  return String(rel)
}

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

    const [taskDocs, projectDocs, userDocs] = await Promise.all([
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.projectTasks, depth: 2, sort: '-createdAt' }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.projects, depth: 0 }),
      findAllDocs<any>({ payload, collection: 'users', depth: 0 }),
    ])

    const projects = projectDocs.map((p) => ({ id: String(p.id), label: `${p.projectCode ? `${p.projectCode} - ` : ''}${p.name || ''}`.trim() || `Project ${p.id}`, code: p.projectCode || '', name: p.name || '' }))
    const users = userDocs.filter((u) => u.role !== 'service' && u.isActive !== false).map((u) => ({ id: String(u.id), label: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || u.username || `User ${u.id}` }))

    const rows = taskDocs.map((doc) => {
      const status = doc.status || 'draft'
      const statusLabel = ACCOUNTING_PROJECT_TASK_STATUS_OPTIONS.find((o) => o.value === status)?.label || status
      const isAssigned = doc.assignedTo !== null && doc.assignedTo !== undefined
      const assigneeLabel = getRelationshipLabel(doc.assignedTo)
      const projectLabel = getRelationshipLabel(doc.project)
      const isBillable = doc.billable !== false

      return {
        id: String(doc.id), taskCode: doc.taskCode || '', name: doc.name || '',
        status, statusLabel, statusTone: STATUS_TONE[status] || 'gray',
        projectId: doc.project !== null && typeof doc.project === 'object' ? String((doc.project as any).id || '') : String(doc.project || ''),
        projectLabel, projectCode: doc.project !== null && typeof doc.project === 'object' ? ((doc.project as any).projectCode || '') : '',
        assignedToId: doc.assignedTo !== null && typeof doc.assignedTo === 'object' ? String((doc.assignedTo as any).id || '') : String(doc.assignedTo || ''),
        assigneeLabel, isAssigned, isBillable,
        billableLabel: isBillable ? 'Yes' : 'No',
        startDate: doc.startDate || null, startDateLabel: formatDate(doc.startDate),
        dueDate: doc.dueDate || null, dueDateLabel: formatDate(doc.dueDate),
        notes: doc.notes || '', createdAt: doc.createdAt || null, updatedAt: doc.updatedAt || null,
        searchableText: normalizeText([doc.taskCode, doc.name, statusLabel, projectLabel, assigneeLabel, isBillable ? 'billable' : 'non-billable', doc.notes].join(' ')),
        cells: [
          { text: doc.taskCode || '-', emphasis: true },
          doc.name || '-',
          projectLabel,
          assigneeLabel,
          { text: isBillable ? 'Yes' : 'No', tone: isBillable ? 'green' : 'gray' },
          { text: statusLabel, tone: STATUS_TONE[status] || 'gray' },
        ],
      }
    })

    let filtered = rows
    if (search) { filtered = filtered.filter((r) => r.searchableText.includes(search)) }
    if (statuses.length > 0) { filtered = filtered.filter((r) => statuses.includes(r.status)) }
    if (billableFilter.length > 0) { filtered = filtered.filter((r) => billableFilter.includes(r.isBillable ? 'true' : 'false')) }
    if (projectIds.length > 0) { filtered = filtered.filter((r) => projectIds.includes(r.projectId)) }
    if (quickFilters.length > 0) {
      filtered = filtered.filter((r) => quickFilters.some((qf) => {
        if (qf === 'billable:yes') return r.isBillable
        if (qf === 'billable:no') return !r.isBillable
        if (qf === 'assignee:yes') return r.isAssigned
        if (qf === 'assignee:no') return !r.isAssigned
        if (qf === 'status:open') return r.status === 'draft' || r.status === 'open' || r.status === 'in_progress'
        return false
      }))
    }

    const totalDocs = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filtered.slice((currentPage - 1) * limit, currentPage * limit)

    const billableCount = rows.filter((r) => r.isBillable).length
    const assignedCount = rows.filter((r) => r.isAssigned).length
    const openCount = rows.filter((r) => r.status === 'draft' || r.status === 'open' || r.status === 'in_progress').length

    return NextResponse.json({
      section: { id: 'project-tasks', label: 'Project Tasks', description: 'Review project work units using task code, project, assigned user, billable flag, task status, and due-date tracking.', searchPlaceholder: 'Search task code, task name, project, assigned user, billable flag, or task status',
        filters: { statuses: ACCOUNTING_PROJECT_TASK_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })), billableOptions: [{ label: 'Billable', value: 'true' }, { label: 'Non-Billable', value: 'false' }], quickFilters: [{ label: 'Billable', value: 'billable:yes' }, { label: 'Non-Billable', value: 'billable:no' }, { label: 'Assigned', value: 'assignee:yes' }, { label: 'Unassigned', value: 'assignee:no' }, { label: 'Open Tasks', value: 'status:open' }] },
        metrics: [
          { id: 'total', label: 'Project Tasks', value: rows.length, change: 'Tracked project work units across active projects', trend: 'up' as const },
          { id: 'billable', label: 'Billable Tasks', value: billableCount, change: 'Tasks marked billable for project revenue support', trend: 'up' as const },
          { id: 'assigned', label: 'Assigned Tasks', value: assignedCount, change: 'Tasks already assigned to a responsible user', trend: 'up' as const },
          { id: 'open', label: 'Open Tasks', value: openCount, change: 'Draft or in-progress task workload still active', trend: 'neutral' as const },
        ],
        table: { title: 'Project Task Register', description: 'Task records aligned to accounting-project-tasks, including the project link, assignee, billable flag, and task status.', columns: ['Task Code', 'Task Name', 'Project', 'Assigned To', 'Billable', 'Status'], rows: paginatedRows },
      },
      appliedFilters: { search, statuses, billableFilter, projectIds, quickFilters },
      pagination: { page: currentPage, limit, totalDocs, totalPages, hasPrevPage: currentPage > 1, hasNextPage: currentPage < totalPages },
      totals: { totalRows: rows.length, filteredRows: totalDocs, billableCount, assignedCount, openCount },
      referenceData: { projects, users, statusOptions: ACCOUNTING_PROJECT_TASK_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })) },
    })
  } catch (error) { return handleAccountingApiError(error) }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = await request.json()
    if (!body?.name || !body?.projectId) { return NextResponse.json({ error: 'Task name and project are required.' }, { status: 400 }) }
    if (body.taskCode) { const dup = await payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.projectTasks, where: { taskCode: { equals: body.taskCode } }, limit: 1, depth: 0, overrideAccess: true }); if (dup.docs.length > 0) { return NextResponse.json({ error: `A task with code "${body.taskCode}" already exists.` }, { status: 409 }) } }

    const taskCode = body.taskCode || `TASK-${Date.now().toString(36).toUpperCase()}`
    const data: Record<string, unknown> = { project: Number(body.projectId), taskCode, name: body.name, status: body.status || 'draft', billable: body.billable !== false, startDate: body.startDate || undefined, dueDate: body.dueDate || undefined, notes: body.notes || undefined, createdBy: user.id, updatedBy: user.id }
    if (body.assignedToId) { const n = Number(body.assignedToId); if (Number.isFinite(n)) data.assignedTo = n }

    const created = await payload.create({ collection: ACCOUNTING_COLLECTION_SLUGS.projectTasks, depth: 2, overrideAccess: true, data: data as never })
    return NextResponse.json({ id: created.id, task: created }, { status: 201 })
  } catch (error) { return handleAccountingApiError(error) }
}
