import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, ACCOUNTING_PROJECT_STATUS_OPTIONS, ACCOUNTING_PROJECT_TYPE_OPTIONS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => { if (!value) return fallback; const p = Number(value); return Number.isFinite(p) ? p : fallback }
const parseListParam = (searchParams: URLSearchParams, key: string): string[] => Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))
const normalizeText = (value?: string | null) => String(value || '').trim().toLowerCase()
const formatDate = (v: string | null | undefined) => { if (!v) return '-'; const d = new Date(v); if (Number.isNaN(d.getTime())) return String(v); return d.toLocaleDateString('en-CA') }
const formatCurrency = (v: number | null | undefined) => { const n = v ?? 0; return `PHP ${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }

const STATUS_TONE: Record<string, string> = { draft: 'amber', active: 'green', on_hold: 'gray', completed: 'blue', cancelled: 'red' }

function getRelationshipLabel(rel: unknown): string {
  if (!rel) return '-'
  if (typeof rel === 'object' && rel !== null) {
    const r = rel as { displayName?: string; name?: string; title?: string; firstName?: string; lastName?: string; email?: string; code?: string; id?: string | number }
    return r.displayName || r.name || r.title || [r.firstName, r.lastName].filter(Boolean).join(' ') || r.email || String(r.id || '')
  }
  return String(rel)
}

function getRelationshipNameOrTitle(rel: unknown): string {
  if (!rel) return '-'
  if (typeof rel === 'object' && rel !== null) {
    const r = rel as { displayName?: string; name?: string; title?: string; id?: string | number }
    return r.displayName || r.name || r.title || String(r.id || '')
  }
  return String(rel)
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = normalizeText(searchParams.get('search'))
    const statuses = parseListParam(searchParams, 'status')
    const projectTypes = parseListParam(searchParams, 'projectType')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [projectDocs, customerDocs, userDocs, courseDocs, branchDocs, departmentDocs, locationDocs] = await Promise.all([
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.projects, depth: 2, sort: '-createdAt' }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.customers, depth: 0 }),
      findAllDocs<any>({ payload, collection: 'users', depth: 0 }),
      findAllDocs<any>({ payload, collection: 'courses', depth: 0 }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.branches, depth: 0 }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.departments, depth: 0 }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.locations, depth: 0 }),
    ])

    const customers = customerDocs.filter((c) => c.status === 'active').map((c) => ({ id: String(c.id), label: c.displayName || c.customerCode || '', code: c.customerCode || '' }))
    const users = userDocs.filter((u) => u.role !== 'service' && u.isActive !== false).map((u) => ({ id: String(u.id), label: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || u.username || `User ${u.id}` }))
    const courses = courseDocs.map((c) => ({ id: String(c.id), label: c.title || c.name || `Course ${c.id}` }))
    const branches = branchDocs.filter((b) => b.isActive !== false).map((b) => ({ id: String(b.id), label: b.name || b.code || `Branch ${b.id}` }))
    const departments = departmentDocs.filter((d) => d.isActive !== false).map((d) => ({ id: String(d.id), label: d.name || `Department ${d.id}` }))
    const locations = locationDocs.filter((l) => l.isActive !== false).map((l) => ({ id: String(l.id), label: l.name || `Location ${l.id}` }))

    const rows = projectDocs.map((doc) => {
      const status = doc.status || 'draft'
      const statusLabel = ACCOUNTING_PROJECT_STATUS_OPTIONS.find((o) => o.value === status)?.label || status
      const projectType = doc.projectType || 'internal'
      const projectTypeLabel = ACCOUNTING_PROJECT_TYPE_OPTIONS.find((o) => o.value === projectType)?.label || projectType
      const customerLabel = getRelationshipNameOrTitle(doc.customer)
      const managerLabel = getRelationshipLabel(doc.managerUser)

      return {
        id: String(doc.id), projectCode: doc.projectCode || '', name: doc.name || '', status, statusLabel, statusTone: STATUS_TONE[status] || 'gray',
        customerId: doc.customer !== null && typeof doc.customer === 'object' ? String((doc.customer as any).id || '') : String(doc.customer || ''),
        customerLabel, customerCode: doc.customer !== null && typeof doc.customer === 'object' ? ((doc.customer as any).customerCode || '') : '',
        managerUserId: doc.managerUser !== null && typeof doc.managerUser === 'object' ? String((doc.managerUser as any).id || '') : String(doc.managerUser || ''),
        managerLabel, projectType, projectTypeLabel,
        courseId: doc.course !== null && typeof doc.course === 'object' ? String((doc.course as any).id || '') : String(doc.course || ''),
        courseLabel: getRelationshipNameOrTitle(doc.course),
        startDate: doc.startDate || null, startDateLabel: formatDate(doc.startDate),
        endDate: doc.endDate || null, endDateLabel: formatDate(doc.endDate),
        branchId: doc.branch !== null && typeof doc.branch === 'object' ? String((doc.branch as any).id || '') : String(doc.branch || ''),
        branchLabel: getRelationshipNameOrTitle(doc.branch),
        departmentId: doc.department !== null && typeof doc.department === 'object' ? String((doc.department as any).id || '') : String(doc.department || ''),
        departmentLabel: getRelationshipNameOrTitle(doc.department),
        locationId: doc.location !== null && typeof doc.location === 'object' ? String((doc.location as any).id || '') : String(doc.location || ''),
        locationLabel: getRelationshipNameOrTitle(doc.location),
        budgetAmount: typeof doc.budgetAmount === 'number' ? doc.budgetAmount : 0,
        budgetAmountLabel: formatCurrency(doc.budgetAmount),
        notes: doc.notes || '',
        createdAt: doc.createdAt || null, updatedAt: doc.updatedAt || null,
        searchableText: normalizeText([doc.projectCode, doc.name, statusLabel, projectTypeLabel, customerLabel, managerLabel, getRelationshipNameOrTitle(doc.course), doc.notes].join(' ')),
        cells: [
          { text: doc.projectCode || '-', emphasis: true },
          doc.name || '-',
          customerLabel,
          managerLabel,
          projectTypeLabel,
          { text: statusLabel, tone: STATUS_TONE[status] || 'gray' },
        ],
      }
    })

    let filtered = rows
    if (search) { filtered = filtered.filter((r) => r.searchableText.includes(search)) }
    if (statuses.length > 0) { filtered = filtered.filter((r) => statuses.includes(r.status)) }
    if (projectTypes.length > 0) { filtered = filtered.filter((r) => projectTypes.includes(r.projectType)) }
    if (quickFilters.length > 0) {
      filtered = filtered.filter((r) => quickFilters.some((qf) => {
        if (qf === 'status:active') return r.status === 'active'
        if (qf === 'status:draft') return r.status === 'draft'
        if (qf === 'type:customer') return r.projectType === 'customer_project' || r.projectType === 'training_delivery'
        if (qf === 'type:internal') return r.projectType === 'internal' || r.projectType === 'implementation'
        if (qf === 'budget:has') return r.budgetAmount > 0
        return false
      }))
    }

    const totalDocs = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filtered.slice((currentPage - 1) * limit, currentPage * limit)

    const activeCount = rows.filter((r) => r.status === 'active').length
    const customerCount = rows.filter((r) => r.projectType === 'customer_project' || r.projectType === 'training_delivery').length
    const totalBudget = rows.reduce((sum, r) => sum + r.budgetAmount, 0)
    const withBudgetCount = rows.filter((r) => r.budgetAmount > 0).length

    return NextResponse.json({
      section: {
        id: 'projects', label: 'Projects',
        description: 'Review project finance overlays using project code, status, customer, manager, project type, linked course, dimensions, and budget amount.',
        searchPlaceholder: 'Search project code, name, customer, manager, project type, course, or status',
        filters: {
          statuses: ACCOUNTING_PROJECT_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
          projectTypes: ACCOUNTING_PROJECT_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
          quickFilters: [
            { label: 'Active', value: 'status:active' }, { label: 'Draft', value: 'status:draft' },
            { label: 'Customer Projects', value: 'type:customer' }, { label: 'Internal', value: 'type:internal' },
            { label: 'Has Budget', value: 'budget:has' },
          ],
        },
        metrics: [
          { id: 'total', label: 'Projects', value: rows.length, change: 'Project overlay records available for costing and reporting', trend: 'up' as const },
          { id: 'active', label: 'Active Projects', value: activeCount, change: 'Projects currently in active or delivery state', trend: 'up' as const },
          { id: 'customer', label: 'Customer Projects', value: customerCount, change: 'Projects linked to external customers', trend: 'up' as const },
          { id: 'budget', label: 'Budget Total', value: formatCurrency(totalBudget), change: `Combined budget across ${withBudgetCount} project${withBudgetCount !== 1 ? 's' : ''}`, trend: 'neutral' as const },
        ],
        table: { title: 'Project Register', description: 'Project records aligned to accounting-projects, including customer, manager, project type, course relationship, and budget amount.', columns: ['Project Code', 'Name', 'Customer', 'Manager', 'Type', 'Status'], rows: paginatedRows },
      },
      appliedFilters: { search, statuses, projectTypes, quickFilters },
      pagination: { page: currentPage, limit, totalDocs, totalPages, hasPrevPage: currentPage > 1, hasNextPage: currentPage < totalPages },
      totals: { totalRows: rows.length, filteredRows: totalDocs, activeCount, customerCount, totalBudget, withBudgetCount },
      referenceData: { customers, users, courses, branches, departments, locations, statusOptions: ACCOUNTING_PROJECT_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })), typeOptions: ACCOUNTING_PROJECT_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value })) },
    })
  } catch (error) { return handleAccountingApiError(error) }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = await request.json()

    if (!body?.name) { return NextResponse.json({ error: 'Project name is required.' }, { status: 400 }) }

    if (body.projectCode) {
      const dup = await payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.projects, where: { projectCode: { equals: body.projectCode } }, limit: 1, depth: 0, overrideAccess: true })
      if (dup.docs.length > 0) { return NextResponse.json({ error: `A project with code "${body.projectCode}" already exists.` }, { status: 409 }) }
    }

    const { AccountingProjectService } = await import('@/accounting/services/projects/AccountingProjectService')
    const projectCode = body.projectCode || await AccountingProjectService.generateProjectCode(payload)

    const data: Record<string, unknown> = {
      projectCode, name: body.name,
      status: body.status || 'draft',
      projectType: body.projectType || 'internal',
      startDate: body.startDate || undefined,
      endDate: body.endDate || undefined,
      budgetAmount: body.budgetAmount !== undefined ? Number(body.budgetAmount) : 0,
      notes: body.notes || undefined,
      createdBy: user.id, updatedBy: user.id,
    }
    if (body.customerId) { const n = Number(body.customerId); if (Number.isFinite(n)) data.customer = n }
    if (body.managerUserId) { const n = Number(body.managerUserId); if (Number.isFinite(n)) data.managerUser = n }
    if (body.courseId) { const n = Number(body.courseId); if (Number.isFinite(n)) data.course = n }
    if (body.branchId) { const n = Number(body.branchId); if (Number.isFinite(n)) data.branch = n }
    if (body.departmentId) { const n = Number(body.departmentId); if (Number.isFinite(n)) data.department = n }
    if (body.locationId) { const n = Number(body.locationId); if (Number.isFinite(n)) data.location = n }

    const created = await payload.create({ collection: ACCOUNTING_COLLECTION_SLUGS.projects, depth: 2, overrideAccess: true, data: data as never })
    return NextResponse.json({ id: created.id, project: created }, { status: 201 })
  } catch (error) { return handleAccountingApiError(error) }
}
