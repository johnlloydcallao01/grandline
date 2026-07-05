import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_APPROVAL_ENTITY_TYPE_OPTIONS, ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => { if (!value) return fallback; const p = Number(value); return Number.isFinite(p) ? p : fallback }
const parseListParam = (searchParams: URLSearchParams, key: string): string[] => Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))
const normalizeText = (value?: string | null) => String(value || '').trim().toLowerCase()

const ENTITY_TYPE_LABEL: Record<string, string> = ACCOUNTING_APPROVAL_ENTITY_TYPE_OPTIONS.reduce((acc, opt) => { acc[opt.value] = opt.label; return acc }, {} as Record<string, string>)

const TRANSACTION_ENTITY_TYPES = ['invoice', 'bill', 'expense', 'journal']
const OPERATIONS_ENTITY_TYPES = ['budget', 'asset_disposal', 'timesheet', 'payroll_run']

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

    const workflowsByEntityType: Record<string, any[]> = {}
    for (const doc of workflowDocs) {
      const et = doc.entityType || ''
      if (!et) continue
      if (!workflowsByEntityType[et]) workflowsByEntityType[et] = []
      workflowsByEntityType[et].push(doc)
    }

    type CoverageRow = {
      id: string
      entityType: string
      entityTypeLabel: string
      workflowId: string
      workflowCode: string
      workflowName: string
      firstApproverName: string
      firstApproverUserId: string
      stepCount: number
      isActive: boolean
      status: string
      statusTone: string
      isGap: boolean
      workflowCount: number
      cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>
    }

    const coverageRows: CoverageRow[] = []

    for (const doc of workflowDocs) {
      const et = doc.entityType || ''
      const etLabel = ENTITY_TYPE_LABEL[et] || et
      const steps: Array<{ stepNumber?: number; label?: string; approverUser?: unknown; approverRole?: string }> = Array.isArray(doc.steps) ? doc.steps : []
      const sortedSteps = steps.slice().sort((a: { stepNumber?: number }, b: { stepNumber?: number }) => (a.stepNumber || 0) - (b.stepNumber || 0))
      const firstStep = sortedSteps[0]
      const firstApprover = firstStep?.approverUser
      const isActive = doc.isActive !== false
      const stepCount = steps.length
      const approverName = getApproverName(firstApprover)
      const approverId = typeof firstApprover === 'object' && firstApprover !== null
        ? String((firstApprover as { id?: string | number }).id || '')
        : firstApprover ? String(firstApprover) : ''
      const totalForType = (workflowsByEntityType[et] || []).length

      coverageRows.push({
        id: `aw-${doc.id}`,
        entityType: et,
        entityTypeLabel: etLabel,
        workflowId: String(doc.id),
        workflowCode: doc.workflowCode || '',
        workflowName: doc.name || '',
        firstApproverName: approverName,
        firstApproverUserId: approverId,
        stepCount,
        isActive,
        status: isActive ? 'Active' : 'Inactive',
        statusTone: isActive ? 'green' : 'gray',
        isGap: false,
        workflowCount: totalForType,
        cells: [
          etLabel,
          { text: doc.workflowCode || '-', emphasis: true },
          doc.name || '-',
          approverName,
          { text: String(stepCount), align: 'right' },
          { text: isActive ? 'Active' : 'Inactive', tone: isActive ? 'green' : 'gray' },
        ],
      })
    }

    const coveredTypes = new Set(workflowDocs.map((d) => d.entityType || ''))
    for (const opt of ACCOUNTING_APPROVAL_ENTITY_TYPE_OPTIONS) {
      const et = opt.value
      if (coveredTypes.has(et)) continue
      coverageRows.push({
        id: `aw-gap-${et}`,
        entityType: et,
        entityTypeLabel: opt.label,
        workflowId: '',
        workflowCode: '',
        workflowName: '',
        firstApproverName: '-',
        firstApproverUserId: '',
        stepCount: 0,
        isActive: false,
        status: 'No Coverage',
        statusTone: 'red',
        isGap: true,
        workflowCount: 0,
        cells: [
          opt.label,
          { text: '-', emphasis: false },
          'No workflow configured',
          '-',
          { text: '0', align: 'right' },
          { text: 'No Coverage', tone: 'red' },
        ],
      })
    }

    let filtered = coverageRows
    if (search) { filtered = filtered.filter((r) => normalizeText([r.entityTypeLabel, r.workflowCode, r.workflowName, r.firstApproverName, r.status].join(' ')).includes(search)) }
    if (entityTypes.length > 0) { filtered = filtered.filter((r) => entityTypes.includes(r.entityType)) }
    if (quickFilters.length > 0) {
      filtered = filtered.filter((r) => quickFilters.some((qf) => {
        if (qf === 'coverage:active') return r.isActive
        if (qf === 'coverage:inactive') return !r.isActive && !r.isGap
        if (qf === 'coverage:gap') return r.isGap
        if (qf === 'scope:transactions') return TRANSACTION_ENTITY_TYPES.includes(r.entityType)
        if (qf === 'scope:operations') return OPERATIONS_ENTITY_TYPES.includes(r.entityType)
        if (qf === 'steps:multi') return r.stepCount > 1
        return false
      }))
    }

    const totalDocs = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filtered.slice((currentPage - 1) * limit, currentPage * limit)

    const activeNonGaps = coverageRows.filter((r) => r.isActive)
    const eligibleCount = new Set(activeNonGaps.map((r) => r.entityType)).size
    const multiStepActiveEts = new Set(activeNonGaps.filter((r) => r.stepCount > 1).map((r) => r.entityType))
    const firstApproverEts = new Set(activeNonGaps.filter((r) => Boolean(r.firstApproverUserId)).map((r) => r.entityType))
    const gapCount = coverageRows.filter((r) => r.isGap).length

    return NextResponse.json({
      section: {
        id: 'active-workflows',
        label: 'Active Workflows',
        description: 'Focus on enabled workflow records that can be discovered when a request is submitted without an explicit workflow id.',
        searchPlaceholder: 'Search active workflow code, entity type, first approver, or coverage status',
        filters: {
          entityTypes: ACCOUNTING_APPROVAL_ENTITY_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
          quickFilters: [
            { label: 'Active Only', value: 'coverage:active' },
            { label: 'Inactive', value: 'coverage:inactive' },
            { label: 'Coverage Gaps', value: 'coverage:gap' },
            { label: 'Transactions', value: 'scope:transactions' },
            { label: 'Operations', value: 'scope:operations' },
            { label: 'Multi-Step', value: 'steps:multi' },
          ],
        },
        metrics: [
          { id: 'eligible', label: 'Eligible For Requests', value: eligibleCount, change: 'Entity types with an active workflow discoverable by the approval service', trend: eligibleCount > 0 ? 'up' as const : 'neutral' as const },
          { id: 'multi-step-active', label: 'Multi-Step Active', value: multiStepActiveEts.size, change: 'Active workflows with more than one step', trend: multiStepActiveEts.size > 0 ? 'up' as const : 'neutral' as const },
          { id: 'first-approvers', label: 'First Approvers Set', value: firstApproverEts.size, change: 'Active workflows carrying a first approver user', trend: firstApproverEts.size > 0 ? 'up' as const : 'neutral' as const },
          { id: 'gaps', label: 'Coverage Gaps', value: gapCount, change: 'Entity types currently missing active workflow coverage', trend: gapCount > 0 ? 'down' as const : 'neutral' as const },
        ],
        table: {
          title: 'Active Approval Coverage',
          description: 'Active workflow coverage aligned to the workflow lookup behavior that finds the first active workflow for a requested entity type.',
          columns: ['Entity Type', 'Workflow Code', 'Workflow Name', 'First Approver', 'Step Count', 'Status'],
          rows: paginatedRows,
        },
      },
      appliedFilters: { search, entityTypes, quickFilters },
      pagination: { page: currentPage, limit, totalDocs, totalPages, hasPrevPage: currentPage > 1, hasNextPage: currentPage < totalPages },
      totals: { totalRows: coverageRows.length, filteredRows: totalDocs, eligibleCount, multiStepActiveCount: multiStepActiveEts.size, firstApproversSetCount: firstApproverEts.size, gapCount },
      referenceData: {
        entityTypes: ACCOUNTING_APPROVAL_ENTITY_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
        users,
        workflows: workflowDocs.map((doc) => ({
          id: String(doc.id),
          workflowCode: doc.workflowCode || '',
          name: doc.name || '',
          entityType: doc.entityType || '',
          entityTypeLabel: ENTITY_TYPE_LABEL[doc.entityType || ''] || doc.entityType || '',
        })),
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
