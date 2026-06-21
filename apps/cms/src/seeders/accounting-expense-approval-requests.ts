import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'
import { AccountingApprovalService } from '../accounting/services/approvals/AccountingApprovalService'
import { getRelationshipId } from '../accounting/utils/accounting-audit'

type UserDoc = {
  id: number | string
  role?: string | null
  isActive?: boolean | null
}

type ExpenseDoc = {
  id: number | string
  expenseNumber?: string | null
  status?: string | null
}

type WorkflowStepDoc = {
  stepNumber?: number | null
  label?: string | null
  approverUser?: { id?: number | string | null } | number | string | null
}

type WorkflowDoc = {
  id: number | string
  workflowCode?: string | null
  name?: string | null
  steps?: WorkflowStepDoc[] | null
}

type ApprovalTrailDoc = {
  stepNumber?: number | null
}

type ApprovalRequestDoc = {
  id: number | string
  entityId?: string | null
  status?: string | null
  workflow?: WorkflowDoc | number | string | null
  approvalTrail?: ApprovalTrailDoc[] | null
  resolutionNotes?: string | null
}

type SeedStatus = 'pending' | 'approved' | 'rejected'

const SAMPLE_COUNT = 20
const PENDING_REQUEST_TARGET = 8

const buildSeedKey = (sequence: number) =>
  `[seed:expense-approval-request-${String(sequence).padStart(3, '0')}]`

const buildSeedNote = (sequence: number) =>
  `${buildSeedKey(sequence)} Sample approval request seeded for claims-reimbursements approval-request coverage.`

const getDesiredStatus = (sequence: number): SeedStatus => {
  if (sequence <= 8) return 'pending'
  if (sequence <= 16) return 'approved'
  return 'rejected'
}

const formatExpenseLabel = (expense: ExpenseDoc) =>
  expense.expenseNumber || `Expense ${String(expense.id)}`

const getCurrentStep = (request: ApprovalRequestDoc) => {
  const workflow =
    typeof request.workflow === 'object' && request.workflow ? request.workflow : null
  const steps = Array.isArray(workflow?.steps)
    ? [...workflow.steps].sort((left, right) => (left.stepNumber || 0) - (right.stepNumber || 0))
    : []
  const currentStepIndex = Array.isArray(request.approvalTrail) ? request.approvalTrail.length : 0
  return steps[currentStepIndex]
}

const getStepApproverId = (step?: WorkflowStepDoc | null) => {
  const relationshipId = getRelationshipId(step?.approverUser)
  if (typeof relationshipId === 'number' && Number.isFinite(relationshipId)) {
    return relationshipId
  }
  if (typeof relationshipId === 'string') {
    const parsed = Number(relationshipId)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

async function progressRequestToApproved({
  payload,
  request,
  finalNote,
}: {
  payload: Awaited<ReturnType<typeof getPayload>>
  request: ApprovalRequestDoc
  finalNote: string
}) {
  let currentRequest = request

  while (String(currentRequest.status || '') === 'pending') {
    const currentStep = getCurrentStep(currentRequest)
    const approverUserId = getStepApproverId(currentStep)

    if (!approverUserId) {
      throw new Error(
        `Approval workflow ${String(
          typeof currentRequest.workflow === 'object' && currentRequest.workflow
            ? currentRequest.workflow.workflowCode || currentRequest.workflow.id
            : currentRequest.workflow || '',
        )} is missing an approver on the current step.`,
      )
    }

    currentRequest = (await AccountingApprovalService.approveRequest({
      payload,
      approvalRequestId: currentRequest.id,
      approverUserId,
      notes: finalNote,
    })) as ApprovalRequestDoc
  }

  if (String(currentRequest.status || '') !== 'approved') {
    throw new Error(`Failed to fully approve seeded request ${String(currentRequest.id)}.`)
  }
}

async function progressRequestToRejected({
  payload,
  request,
  finalNote,
}: {
  payload: Awaited<ReturnType<typeof getPayload>>
  request: ApprovalRequestDoc
  finalNote: string
}) {
  const currentStep = getCurrentStep(request)
  const approverUserId = getStepApproverId(currentStep)

  if (!approverUserId) {
    throw new Error(
      `Approval workflow ${String(
        typeof request.workflow === 'object' && request.workflow
          ? request.workflow.workflowCode || request.workflow.id
          : request.workflow || '',
      )} is missing an approver on the current step.`,
    )
  }

  const updated = (await AccountingApprovalService.rejectRequest({
    payload,
    approvalRequestId: request.id,
    approverUserId,
    notes: finalNote,
  })) as ApprovalRequestDoc

  if (String(updated.status || '') !== 'rejected') {
    throw new Error(`Failed to reject seeded request ${String(request.id)}.`)
  }
}

async function seedExpenseApprovalRequests() {
  const payload = await getPayload({ config })

  const [usersResult, expenseResult, workflowResult, pendingExpenseRequests] = await Promise.all([
    payload.find({
      collection: 'users',
      limit: 200,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.expenses as any,
      where: {
        status: {
          not_equals: 'voided',
        },
      } as never,
      limit: 500,
      depth: 0,
      sort: '-updatedAt',
      overrideAccess: true,
    }),
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.approvalWorkflows as any,
      where: {
        and: [
          {
            entityType: {
              equals: 'expense',
            },
          },
          {
            isActive: {
              equals: true,
            },
          },
        ],
      } as never,
      limit: 100,
      depth: 2,
      sort: 'workflowCode',
      overrideAccess: true,
    }),
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.approvalRequests as any,
      where: {
        and: [
          {
            entityType: {
              equals: 'expense',
            },
          },
          {
            status: {
              equals: 'pending',
            },
          },
        ],
      } as never,
      limit: 500,
      depth: 0,
      overrideAccess: true,
    }),
  ])

  const eligibleUsers = (usersResult.docs as UserDoc[]).filter(
    (user) => String(user.role || '') !== 'service' && user.isActive !== false,
  )
  const requesterUserId =
    eligibleUsers.find((user) => String(user.role || '') === 'admin')?.id ??
    eligibleUsers[0]?.id ??
    null

  const expenses = expenseResult.docs as ExpenseDoc[]
  const workflows = workflowResult.docs as WorkflowDoc[]
  const pendingExpenseIds = new Set(
    (pendingExpenseRequests.docs as ApprovalRequestDoc[])
      .map((request) => String(request.entityId || ''))
      .filter(Boolean),
  )

  if (!requesterUserId) {
    throw new Error('No eligible requesting user was found. Create an active admin user, then rerun.')
  }

  if (workflows.length === 0) {
    throw new Error(
      'No active expense approval workflows were found. Run seed:approval-workflows first or configure active expense workflows.',
    )
  }

  const existingSeedRequests = new Map<number, ApprovalRequestDoc>()
  for (let index = 0; index < SAMPLE_COUNT; index += 1) {
    const sequence = index + 1
    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.approvalRequests as any,
      where: {
        and: [
          {
            entityType: {
              equals: 'expense',
            },
          },
          {
            resolutionNotes: {
              equals: buildSeedNote(sequence),
            },
          },
        ],
      } as never,
      limit: 1,
      depth: 2,
      overrideAccess: true,
    })

    const existingRequest = existing.docs[0] as ApprovalRequestDoc | undefined
    if (existingRequest) {
      existingSeedRequests.set(sequence, existingRequest)
    }
  }

  const missingPendingRequestCount = Array.from({ length: PENDING_REQUEST_TARGET }, (_, index) => index + 1).filter(
    (sequence) => !existingSeedRequests.has(sequence),
  ).length
  const missingResolvedRequestCount = Array.from(
    { length: SAMPLE_COUNT - PENDING_REQUEST_TARGET },
    (_, index) => index + PENDING_REQUEST_TARGET + 1,
  ).filter((sequence) => !existingSeedRequests.has(sequence)).length

  const availableExpenses = expenses.filter((expense) => !pendingExpenseIds.has(String(expense.id)))

  if (
    availableExpenses.length < missingPendingRequestCount ||
    (missingResolvedRequestCount > 0 && availableExpenses.length <= missingPendingRequestCount)
  ) {
    throw new Error(
      `Only ${availableExpenses.length} expenses are currently eligible for new approval requests. The remaining missing seed requests need ${missingPendingRequestCount} pending slots and ${missingResolvedRequestCount > 0 ? 'at least one' : 'no'} resolved-request slot.`,
    )
  }

  const pendingExpensePool = availableExpenses.slice(0, missingPendingRequestCount)
  const resolvedExpensePool = availableExpenses.slice(missingPendingRequestCount)
  let pendingExpensePoolIndex = 0
  let resolvedExpensePoolIndex = 0

  let createdCount = 0
  let approvedCount = 0
  let rejectedCount = 0
  let pendingCount = 0
  let skippedCount = 0

  for (let index = 0; index < SAMPLE_COUNT; index += 1) {
    const sequence = index + 1
    const seedNote = buildSeedNote(sequence)
    const desiredStatus = getDesiredStatus(sequence)

    let request = existingSeedRequests.get(sequence)

    if (!request) {
      const expense =
        desiredStatus === 'pending'
          ? pendingExpensePool[pendingExpensePoolIndex++]
          : resolvedExpensePool[resolvedExpensePoolIndex++ % resolvedExpensePool.length]
      const workflow = workflows[index % workflows.length]

      request = (await AccountingApprovalService.requestApproval({
        payload,
        entityType: 'expense',
        entityId: expense.id,
        workflowId: workflow.id,
        requestedBy: requesterUserId,
        resolutionNotes: seedNote,
      })) as ApprovalRequestDoc

      createdCount += 1
      console.log(
        `Created seeded approval request ${String(request.id)} for ${formatExpenseLabel(expense)} using ${String(workflow.workflowCode || workflow.id)}`,
      )
    }

    const currentStatus = String(request.status || '')

    if (desiredStatus === 'pending') {
      pendingCount += 1
      if (existingSeedRequests.has(sequence)) {
        skippedCount += 1
        console.log(`Skipped seeded pending request ${String(request.id)} (already exists).`)
      }
      continue
    }

    if (desiredStatus === 'approved') {
      if (currentStatus !== 'approved') {
        await progressRequestToApproved({
          payload,
          request,
          finalNote: seedNote,
        })
      } else {
        skippedCount += 1
      }
      approvedCount += 1
      console.log(`Ready approved seeded request ${String(request.id)}.`)
      continue
    }

    if (currentStatus !== 'rejected') {
      await progressRequestToRejected({
        payload,
        request,
        finalNote: seedNote,
      })
    } else {
      skippedCount += 1
    }
    rejectedCount += 1
    console.log(`Ready rejected seeded request ${String(request.id)}.`)
  }

  console.log(
    `[seed] Expense approval requests ready. Created: ${createdCount}, Pending: ${pendingCount}, Approved: ${approvedCount}, Rejected: ${rejectedCount}, Skipped existing: ${skippedCount}`,
  )
}

seedExpenseApprovalRequests()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('[seed] Fatal error while seeding expense approval requests:', error)
    process.exit(1)
  })
