import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_APPROVAL_ENTITY_TYPE_OPTIONS, ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => { if (!value) return fallback; const p = Number(value); return Number.isFinite(p) ? p : fallback }
const parseListParam = (searchParams: URLSearchParams, key: string): string[] => Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))
const normalizeText = (value?: string | null) => String(value || '').trim().toLowerCase()
const formatDateTime = (v: string | null | undefined) => { if (!v) return '-'; const d = new Date(v); if (Number.isNaN(d.getTime())) return String(v); return d.toLocaleDateString('en-CA') + ' ' + d.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' }) }

const ENTITY_TYPE_LABEL: Record<string, string> = ACCOUNTING_APPROVAL_ENTITY_TYPE_OPTIONS.reduce((acc, opt) => { acc[opt.value] = opt.label; return acc }, {} as Record<string, string>)

function getApproverName(user: any): string {
  if (!user) return '-'
  if (typeof user === 'object') return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || user.username || `User ${user.id}`
  return `User ${user}`
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = normalizeText(searchParams.get('search'))
    const entityTypes = parseListParam(searchParams, 'entityType')
    const activeStates = parseListParam(searchParams, 'activeState')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [workflowDocs, userDocs] = await Promise.all([
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.approvalWorkflows, depth: 2, sort: '-createdAt' }),
      findAllDocs<any>({ payload, collection: 'users', depth: 0 }),
    ])

    const users = userDocs
      .filter((u) => u.role !== 'service' && u.isActive !== false)
      .map((u) => ({ id: u.id, label: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || u.username || `User ${u.id}`, email: u.email || '', username: u.username || '' }))

    const mappedRows = workflowDocs.map((doc) => {
      const steps: Array<{ stepNumber?: number; label?: string; approverUser?: any; approverRole?: string }> = Array.isArray(doc.steps) ? doc.steps : []
      const stepCount = steps.length
      const firstStep = steps.slice().sort((a: { stepNumber?: number }, b: { stepNumber?: number }) => (a.stepNumber || 0) - (b.stepNumber || 0))[0]
      const firstApprover = firstStep?.approverUser
      const entityType = doc.entityType || ''
      const entityTypeLabel = ENTITY_TYPE_LABEL[entityType] || entityType
      const isActive = doc.isActive !== false
      const sortedSteps = steps.slice().sort((a: { stepNumber?: number }, b: { stepNumber?: number }) => (a.stepNumber || 0) - (b.stepNumber || 0))

      return {
        id: `wf-${doc.id}`,
        workflowId: String(doc.id),
        workflowCode: doc.workflowCode || '',
        name: doc.name || '',
        entityType,
        entityTypeLabel,
        isActive,
        activeLabel: isActive ? 'Yes' : 'No',
        stepCount,
        notes: doc.notes || '',
        firstApproverName: getApproverName(firstApprover),
        createdAt: doc.createdAt || null,
        createdAtLabel: formatDateTime(doc.createdAt),
        updatedAt: doc.updatedAt || null,
        updatedAtLabel: formatDateTime(doc.updatedAt),
        steps: sortedSteps.map((s, i) => ({
          stepNumber: s.stepNumber || i + 1,
          label: s.label || '',
          approverUserName: getApproverName(s.approverUser),
          approverUserId: typeof s.approverUser === 'object' ? String(s.approverUser?.id || '') : String(s.approverUser || ''),
          approverRole: s.approverRole || '',
        })),
        searchableText: normalizeText([doc.workflowCode, doc.name, entityTypeLabel, isActive ? 'active yes' : 'inactive no', String(stepCount), doc.notes, getApproverName(firstApprover)].join(' ')),
        cells: [
          { text: doc.workflowCode || '-', emphasis: true },
          doc.name || '-',
          entityTypeLabel,
          { text: isActive ? 'Yes' : 'No', tone: isActive ? 'green' : 'gray' },
          { text: String(stepCount), align: 'right' },
          doc.notes || '-',
        ],
      }
    })

    let filtered = mappedRows
    if (search) { filtered = filtered.filter((r) => r.searchableText.includes(search)) }
    if (entityTypes.length > 0) { filtered = filtered.filter((r) => entityTypes.includes(r.entityType)) }
    if (activeStates.length > 0) { filtered = filtered.filter((r) => activeStates.includes(r.isActive ? 'true' : 'false')) }
    if (quickFilters.length > 0) {
      filtered = filtered.filter((r) => quickFilters.some((qf) => {
        const [prefix, value] = qf.split(':')
        if (prefix === 'active') return r.isActive === (value === 'true')
        if (prefix === 'steps') return qf === 'steps:multi' ? r.stepCount > 1 : r.stepCount <= 1
        return false
      }))
    }

    const totalDocs = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filtered.slice((currentPage - 1) * limit, currentPage * limit)

    const activeCount = mappedRows.filter((r) => r.isActive).length
    const multiStepCount = mappedRows.filter((r) => r.stepCount > 1).length
    const entityTypeCoverage = new Set(mappedRows.map((r) => r.entityType)).size
    const totalSteps = mappedRows.reduce((sum, r) => sum + r.stepCount, 0)

    return NextResponse.json({
      section: {
        id: 'workflow-directory',
        label: 'Workflow Directory',
        description: 'Review reusable approval workflow definitions by workflow code, name, entity type, active state, and step count.',
        searchPlaceholder: 'Search workflow code, workflow name, entity type, step count, or active state',
        filters: {
          entityTypes: ACCOUNTING_APPROVAL_ENTITY_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
          activeStates: [{ label: 'Active', value: 'true' }, { label: 'Inactive', value: 'false' }],
          quickFilters: [
            { label: 'Active Workflows', value: 'active:true' },
            { label: 'Inactive Workflows', value: 'active:false' },
            { label: 'Multi-Step', value: 'steps:multi' },
            { label: 'Single-Step', value: 'steps:single' },
          ],
        },
        metrics: [
          { id: 'total-workflows', label: 'Workflow Templates', value: mappedRows.length, change: 'Configured approval workflows', trend: 'up' as const },
          { id: 'active-workflows', label: 'Active Workflows', value: activeCount, change: 'Templates currently enabled for request creation', trend: activeCount > 0 ? 'up' as const : 'neutral' as const },
          { id: 'multi-step', label: 'Multi-Step Workflows', value: multiStepCount, change: 'Workflows with more than one approval step', trend: multiStepCount > 0 ? 'up' as const : 'neutral' as const },
          { id: 'entity-coverage', label: 'Entity Type Coverage', value: entityTypeCoverage, change: 'Distinct entity types with workflow coverage', trend: 'neutral' as const },
        ],
        table: {
          title: 'Approval Workflow Directory',
          description: 'Workflow register aligned to approvalWorkflows, showing workflow code, entity type, active state, and configured step count.',
          columns: ['Workflow Code', 'Name', 'Entity Type', 'Active', 'Step Count', 'Notes'],
          rows: paginatedRows,
        },
      },
      appliedFilters: { search, entityTypes, activeStates, quickFilters },
      pagination: { page: currentPage, limit, totalDocs, totalPages, hasPrevPage: currentPage > 1, hasNextPage: currentPage < totalPages },
      totals: { totalRows: mappedRows.length, filteredRows: totalDocs, activeCount, multiStepCount, entityTypeCoverage, totalSteps },
      referenceData: {
        entityTypes: ACCOUNTING_APPROVAL_ENTITY_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
        users,
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = await request.json()

    if (!body?.workflowCode || !body?.name || !body?.entityType) {
      return NextResponse.json({ error: 'workflowCode, name, and entityType are required.' }, { status: 400 })
    }

    const duplicateCheck = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.approvalWorkflows,
      where: { workflowCode: { equals: body.workflowCode } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (duplicateCheck.docs.length > 0) {
      return NextResponse.json({ error: `A workflow with code "${body.workflowCode}" already exists. Please use a unique code.` }, { status: 409 })
    }

    const steps = Array.isArray(body.steps) ? body.steps.map((s: any, i: number) => ({
      stepNumber: s.stepNumber || i + 1,
      label: s.label || undefined,
      approverUser: s.approverUserId ? Number(s.approverUserId) : undefined,
      approverRole: s.approverRole || undefined,
    })).filter((s: any) => s.stepNumber) : []

    const created = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.approvalWorkflows,
      depth: 2,
      overrideAccess: true,
      data: {
        workflowCode: body.workflowCode,
        name: body.name,
        entityType: body.entityType,
        isActive: body.isActive !== false,
        steps: steps.length > 0 ? steps : undefined,
        notes: body.notes || undefined,
        createdBy: user.id,
        updatedBy: user.id,
      } as never,
    })

    return NextResponse.json({ id: created.id, workflow: created })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
