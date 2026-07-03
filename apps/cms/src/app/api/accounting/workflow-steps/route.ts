import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_APPROVAL_ENTITY_TYPE_OPTIONS, ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => { if (!value) return fallback; const p = Number(value); return Number.isFinite(p) ? p : fallback }
const parseListParam = (searchParams: URLSearchParams, key: string): string[] => Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))
const normalizeText = (value?: string | null) => String(value || '').trim().toLowerCase()

const ENTITY_TYPE_LABEL: Record<string, string> = ACCOUNTING_APPROVAL_ENTITY_TYPE_OPTIONS.reduce((acc, opt) => { acc[opt.value] = opt.label; return acc }, {} as Record<string, string>)

function getApproverName(user: unknown): string {
  if (!user) return '-'
  if (typeof user === 'object' && user !== null) {
    const u = user as { firstName?: string; lastName?: string; email?: string; username?: string; id?: string | number }
    return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || u.username || `User ${u.id}`
  }
  return `User ${user}`
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = normalizeText(searchParams.get('search'))
    const entityTypes = parseListParam(searchParams, 'entityType')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [workflowDocs, userDocs] = await Promise.all([
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.approvalWorkflows, depth: 2, sort: '-createdAt' }),
      findAllDocs<any>({ payload, collection: 'users', depth: 0 }),
    ])

    const users = userDocs
      .filter((u) => u.role !== 'service' && u.isActive !== false)
      .map((u) => ({ id: String(u.id), label: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || u.username || `User ${u.id}`, email: u.email || '', username: u.username || '' }))

    const workflows = workflowDocs.map((doc) => ({
      id: String(doc.id),
      workflowCode: doc.workflowCode || '',
      name: doc.name || '',
      entityType: doc.entityType || '',
      entityTypeLabel: ENTITY_TYPE_LABEL[doc.entityType || ''] || doc.entityType || '',
    }))

    type StepRow = {
      id: string
      workflowId: string
      workflowCode: string
      workflowName: string
      entityType: string
      entityTypeLabel: string
      stepNumber: number
      label: string
      approverUserName: string
      approverUserId: string
      approverRole: string
      workflowIsActive: boolean
      isFinalStep: boolean
      searchableText: string
      cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>
    }

    const allSteps: StepRow[] = []
    for (const doc of workflowDocs) {
      const steps: Array<{ stepNumber?: number; label?: string; approverUser?: unknown; approverRole?: string }> = Array.isArray(doc.steps) ? doc.steps : []
      const sortedSteps = steps.slice().sort((a: { stepNumber?: number }, b: { stepNumber?: number }) => (a.stepNumber || 0) - (b.stepNumber || 0))
      const entityType = doc.entityType || ''
      const entityTypeLabel = ENTITY_TYPE_LABEL[entityType] || entityType
      const isActive = doc.isActive !== false
      const workflowCode = doc.workflowCode || ''
      const workflowName = doc.name || ''

      for (let i = 0; i < sortedSteps.length; i++) {
        const step = sortedSteps[i]
        const stepNumber = step.stepNumber || i + 1
        const approverName = getApproverName(step.approverUser)
        const approverId = typeof step.approverUser === 'object' && step.approverUser !== null
          ? String((step.approverUser as { id?: string | number }).id || '')
          : step.approverUser ? String(step.approverUser) : ''
        const isFinal = i === sortedSteps.length - 1

        allSteps.push({
          id: `step-${doc.id}-${stepNumber}`,
          workflowId: String(doc.id),
          workflowCode,
          workflowName,
          entityType,
          entityTypeLabel,
          stepNumber,
          label: step.label || '',
          approverUserName: approverName,
          approverUserId: approverId,
          approverRole: step.approverRole || '',
          workflowIsActive: isActive,
          isFinalStep: isFinal,
          searchableText: normalizeText([workflowCode, workflowName, entityTypeLabel, String(stepNumber), step.label || '', approverName, step.approverRole || ''].join(' ')),
          cells: [
            { text: workflowCode || '-', emphasis: true },
            entityTypeLabel,
            { text: String(stepNumber), align: 'right' },
            step.label || '-',
            approverName,
            step.approverRole || '-',
          ],
        })
      }
    }

    let filtered = allSteps
    if (search) { filtered = filtered.filter((r) => r.searchableText.includes(search)) }
    if (entityTypes.length > 0) { filtered = filtered.filter((r) => entityTypes.includes(r.entityType)) }
    if (quickFilters.length > 0) {
      filtered = filtered.filter((r) => quickFilters.some((qf) => {
        if (qf === 'assignee:with_user') return Boolean(r.approverUserId)
        if (qf === 'assignee:with_role') return Boolean(r.approverRole)
        if (qf === 'position:first') return r.stepNumber === 1
        if (qf === 'position:final') return r.isFinalStep
        return false
      }))
    }

    const totalDocs = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filtered.slice((currentPage - 1) * limit, currentPage * limit)

    const withUserCount = allSteps.filter((r) => Boolean(r.approverUserId)).length
    const withRoleCount = allSteps.filter((r) => Boolean(r.approverRole)).length
    const workflowCount = new Set(allSteps.map((r) => r.workflowId)).size
    const multiStepWorkflowCount = new Set(
      allSteps.reduce((acc: string[], r) => {
        const counts = allSteps.filter((s) => s.workflowId === r.workflowId)
        if (counts.length > 1 && !acc.includes(r.workflowId)) acc.push(r.workflowId)
        return acc
      }, [])
    ).size

    return NextResponse.json({
      section: {
        id: 'workflow-steps',
        label: 'Workflow Steps',
        description: 'Review per-step configuration using step number, step label, approver user, and approver role captured inside workflow step arrays.',
        searchPlaceholder: 'Search workflow code, entity type, step number, approver user, approver role, or label',
        filters: {
          entityTypes: ACCOUNTING_APPROVAL_ENTITY_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
          quickFilters: [
            { label: 'With User', value: 'assignee:with_user' },
            { label: 'With Role', value: 'assignee:with_role' },
            { label: 'First Step', value: 'position:first' },
            { label: 'Final Step', value: 'position:final' },
          ],
        },
        metrics: [
          { id: 'total-steps', label: 'Configured Steps', value: allSteps.length, change: 'Workflow steps recorded across templates', trend: 'up' as const },
          { id: 'with-user', label: 'User-Assignee Steps', value: withUserCount, change: 'Steps mapped to a specific approver user', trend: withUserCount > 0 ? 'up' as const : 'neutral' as const },
          { id: 'with-role', label: 'Role-Assignee Steps', value: withRoleCount, change: 'Steps carrying an approver role label', trend: withRoleCount > 0 ? 'up' as const : 'neutral' as const },
          { id: 'multi-step-flows', label: 'Multi-Step Workflows', value: multiStepWorkflowCount, change: 'Workflows with more than one configured step', trend: multiStepWorkflowCount > 0 ? 'up' as const : 'neutral' as const },
        ],
        table: {
          title: 'Workflow Step Register',
          description: 'Step-level approval configuration aligned to the steps array in approval workflows, including assignee user and role fields.',
          columns: ['Workflow Code', 'Entity Type', 'Step', 'Label', 'Approver User', 'Approver Role'],
          rows: paginatedRows,
        },
      },
      appliedFilters: { search, entityTypes, quickFilters },
      pagination: { page: currentPage, limit, totalDocs, totalPages, hasPrevPage: currentPage > 1, hasNextPage: currentPage < totalPages },
      totals: { totalRows: allSteps.length, filteredRows: totalDocs, withUserCount, withRoleCount, workflowCount, multiStepWorkflowCount },
      referenceData: {
        entityTypes: ACCOUNTING_APPROVAL_ENTITY_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
        users,
        workflows,
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
