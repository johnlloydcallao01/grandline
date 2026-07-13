import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_APPROVAL_ENTITY_TYPE_OPTIONS, ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

const GUARDS = [
  {
    area: 'Accounting Period',
    protectedAction: 'Reopen Period',
    condition: 'Fiscal year must still be open',
    behavior: 'Rejects reopen when fiscal year is not open',
    source: 'AccountingCloseService',
  },
  {
    area: 'Accounting Period',
    protectedAction: 'Post Transaction',
    condition: 'Period status is closed or draft',
    behavior: 'Blocks posting in closed or draft periods',
    source: 'AccountingPeriodService',
  },
  {
    area: 'Accounting Period',
    protectedAction: 'Post Transaction',
    condition: 'Period is soft_locked and allowBackdatedPosting is disabled',
    behavior: 'Blocks posting in soft-locked periods without override',
    source: 'AccountingPeriodService',
  },
  {
    area: 'Accounting Period',
    protectedAction: 'Post Transaction',
    condition: 'Posting date falls inside locked period window',
    behavior: 'Blocks posting inside locked period date range',
    source: 'AccountingPeriodService',
  },
  {
    area: 'Fiscal Year',
    protectedAction: 'Post Transaction',
    condition: 'Fiscal year is not open',
    behavior: 'Blocks posting in non-open fiscal years',
    source: 'AccountingPeriodService',
  },
  {
    area: 'Fiscal Year',
    protectedAction: 'Post Transaction',
    condition: 'Posting date falls inside locked fiscal-year window (hard_lock mode)',
    behavior: 'Blocks posting and respects hard-lock mode configuration',
    source: 'AccountingPeriodService',
  },
  {
    area: 'Fiscal Year',
    protectedAction: 'Close Fiscal Year',
    condition: 'All accounting periods must be closed first',
    behavior: 'Rejects close with required prerequisite',
    source: 'AccountingCloseService',
  },
  {
    area: 'Approval Gate',
    protectedAction: 'Post Payroll Run',
    condition: 'Approved approval-request record must exist',
    behavior: 'Prevents payroll posting until workflow is approved',
    source: 'AccountingApprovalService',
  },
  {
    area: 'Approval Gate',
    protectedAction: 'Dispose Asset',
    condition: 'Approved approval-request record must exist',
    behavior: 'Prevents disposal processing until workflow is approved',
    source: 'AccountingApprovalService',
  },
  {
    area: 'Journal Entry',
    protectedAction: 'Re-post Posted Entry',
    condition: 'Entry status is already posted, reversed, or voided',
    behavior: 'Prevents re-posting of immutable journal entries',
    source: 'AccountingPostingService',
  },
]

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)

    const workflowsResult = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.approvalWorkflows,
      where: { isActive: { equals: true } } as never,
      limit: 100,
      depth: 0,
      overrideAccess: true,
    })

    const workflowsByType: Record<string, unknown[]> = {}
    for (const wf of workflowsResult.docs as unknown as Record<string, unknown>[]) {
      const et = (wf.entityType as string) || ''
      if (!workflowsByType[et]) workflowsByType[et] = []
      workflowsByType[et].push(wf)
    }

    const entityCoverage = ACCOUNTING_APPROVAL_ENTITY_TYPE_OPTIONS.map((opt) => {
      const workflows = (workflowsByType[opt.value] || []) as Record<string, unknown>[]
      return {
        entityType: opt.value,
        entityLabel: opt.label,
        hasActiveWorkflow: workflows.length > 0,
        activeWorkflowCount: workflows.length,
        workflows: workflows.map((wf) => ({
          workflowCode: (wf.workflowCode as string) || '',
          name: (wf.name as string) || '',
          stepCount: ((wf.steps as unknown[]) || []).length,
        })),
        needsWorkflow: workflows.length === 0,
      }
    })

    let coveredTypes = 0
    let gapTypes = 0
    let totalStepsConfigured = 0
    for (const ec of entityCoverage) {
      if (ec.hasActiveWorkflow) coveredTypes++
      else gapTypes++
      for (const wf of ec.workflows) totalStepsConfigured += wf.stepCount
    }

    return NextResponse.json({
      entityCoverage,
      safeguards: GUARDS,
      counts: {
        totalEntityTypes: ACCOUNTING_APPROVAL_ENTITY_TYPE_OPTIONS.length,
        coveredTypes,
        gapTypes,
        totalActiveWorkflows: workflowsResult.totalDocs,
        totalStepsConfigured,
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
