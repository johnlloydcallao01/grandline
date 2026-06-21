import { APIError, type Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { getRelationshipId } from '../../utils/accounting-audit'
import { AccountingAuditService } from '../audit/AccountingAuditService'
import { AccountingTimeTrackingService } from '../time/AccountingTimeTrackingService'

const toRelationshipId = (value: unknown) => {
  const relationshipId = getRelationshipId(value)
  if (relationshipId === null || relationshipId === '') {
    return undefined
  }

  if (typeof relationshipId === 'number' && Number.isFinite(relationshipId)) {
    return relationshipId
  }

  if (typeof relationshipId === 'string') {
    const parsed = Number(relationshipId)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  return undefined
}

type ApprovalEntityType =
  | 'invoice'
  | 'bill'
  | 'expense'
  | 'journal'
  | 'budget'
  | 'asset_disposal'
  | 'timesheet'
  | 'payroll_run'

export class AccountingApprovalService {
  static getEntityCollection(entityType: ApprovalEntityType) {
    switch (entityType) {
      case 'budget':
        return ACCOUNTING_COLLECTION_SLUGS.budgets
      case 'asset_disposal':
        return ACCOUNTING_COLLECTION_SLUGS.assetDisposals
      case 'timesheet':
        return ACCOUNTING_COLLECTION_SLUGS.timesheets
      case 'payroll_run':
        return ACCOUNTING_COLLECTION_SLUGS.payrollRuns
      case 'invoice':
        return ACCOUNTING_COLLECTION_SLUGS.invoices
      case 'bill':
        return ACCOUNTING_COLLECTION_SLUGS.bills
      case 'expense':
        return ACCOUNTING_COLLECTION_SLUGS.expenses
      default:
        return ACCOUNTING_COLLECTION_SLUGS.journalEntries
    }
  }

  static async findWorkflow(payload: Payload, entityType: ApprovalEntityType, workflowId?: number | string) {
    if (workflowId) {
      return payload.findByID({
        collection: ACCOUNTING_COLLECTION_SLUGS.approvalWorkflows,
        id: workflowId,
        depth: 1,
        overrideAccess: true,
      })
    }

    const workflows = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.approvalWorkflows,
      where: {
        and: [
          {
            entityType: {
              equals: entityType,
            },
          },
          {
            isActive: {
              equals: true,
            },
          },
        ],
      },
      limit: 1,
      depth: 1,
      overrideAccess: true,
    })

    return workflows.docs[0]
  }

  static async requestApproval({
    payload,
    entityType,
    entityId,
    workflowId,
    requestedBy,
    resolutionNotes,
  }: {
    payload: Payload
    entityType: ApprovalEntityType
    entityId: number | string
    workflowId?: number | string
    requestedBy?: number | string | null
    resolutionNotes?: string | null
  }) {
    const workflow = await this.findWorkflow(payload, entityType, workflowId)

    if (!workflow) {
      throw new APIError(`No active approval workflow exists for ${entityType}.`, 400)
    }

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.approvalRequests,
      where: {
        and: [
          {
            entityType: {
              equals: entityType,
            },
          },
          {
            entityId: {
              equals: String(entityId),
            },
          },
          {
            status: {
              equals: 'pending',
            },
          },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (existing.docs[0]) {
      return existing.docs[0]
    }

    const firstStep = Array.isArray(workflow.steps) ? workflow.steps.slice().sort((a, b) => (a.stepNumber || 0) - (b.stepNumber || 0))[0] : null
    const workflowRelationshipId = toRelationshipId(workflow)

    if (!workflowRelationshipId) {
      throw new APIError('The selected approval workflow is invalid.', 400)
    }

    const request = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.approvalRequests,
      overrideAccess: true,
      depth: 1,
      data: {
        workflow: workflowRelationshipId,
        entityType,
        entityId: String(entityId),
        status: 'pending',
        requestedBy: toRelationshipId(requestedBy),
        currentApprover: toRelationshipId(firstStep?.approverUser),
        requestedAt: new Date().toISOString(),
        resolutionNotes: resolutionNotes || undefined,
      } as never,
    })

    if (entityType === 'timesheet') {
      await AccountingTimeTrackingService.submitTimesheet({
        payload,
        timesheetId: entityId,
        userId: requestedBy,
      })
    }

    if (entityType === 'payroll_run') {
      await payload.update({
        collection: ACCOUNTING_COLLECTION_SLUGS.payrollRuns,
        id: entityId,
        overrideAccess: true,
        depth: 0,
        data: {
          status: 'review',
          approvalRequest: request.id,
        },
      })
    }

    await AccountingAuditService.logAction({
      payload,
      entityType: 'approval_request',
      entityId: request.id,
      actionType: 'submitted',
      performedBy: requestedBy,
      afterData: request,
      metadata: {
        targetEntityType: entityType,
        targetEntityId: String(entityId),
      },
    })

    return request
  }

  static async applyEntityApprovalOutcome({
    payload,
    entityType,
    entityId,
    decision,
    approverUserId,
  }: {
    payload: Payload
    entityType: ApprovalEntityType
    entityId: number | string
    decision: 'approved' | 'rejected'
    approverUserId?: number | string | null
  }) {
    if (entityType === 'timesheet') {
      return decision === 'approved'
        ? AccountingTimeTrackingService.approveTimesheet({
            payload,
            timesheetId: entityId,
            approverUserId,
          })
        : AccountingTimeTrackingService.rejectTimesheet({
            payload,
            timesheetId: entityId,
          })
    }

    const collection = this.getEntityCollection(entityType)
    const numericApprover = toRelationshipId(approverUserId)
    const data: Record<string, unknown> =
      decision === 'approved'
        ? entityType === 'budget'
          ? { status: 'approved' }
          : entityType === 'asset_disposal'
            ? { status: 'approved' }
            : entityType === 'payroll_run'
              ? { status: 'approved' }
              : {}
        : entityType === 'budget'
          ? { status: 'draft' }
          : entityType === 'asset_disposal'
            ? { status: 'draft' }
            : entityType === 'payroll_run'
              ? { status: 'review' }
              : {}

    if (numericApprover && decision === 'approved' && entityType === 'payroll_run') {
      data.updatedBy = numericApprover
    }

    if (!Object.keys(data).length) {
      return null
    }

    return payload.update({
      collection,
      id: entityId,
      overrideAccess: true,
      depth: 1,
      data,
    })
  }

  static async approveRequest({
    payload,
    approvalRequestId,
    approverUserId,
    notes,
  }: {
    payload: Payload
    approvalRequestId: number | string
    approverUserId?: number | string | null
    notes?: string | null
  }) {
    const request = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.approvalRequests,
      id: approvalRequestId,
      depth: 2,
      overrideAccess: true,
    })

    if (!request || request.status !== 'pending') {
      throw new APIError('Approval request is not pending.', 400)
    }

    const steps = Array.isArray((request.workflow as any)?.steps)
      ? [...((request.workflow as any).steps as any[])].sort((a, b) => (a.stepNumber || 0) - (b.stepNumber || 0))
      : []
    const nextTrail = Array.isArray(request.approvalTrail) ? [...request.approvalTrail] : []
    const currentStep = steps[nextTrail.length]

    if (currentStep?.approverUser) {
      const expectedApprover = getRelationshipId(currentStep.approverUser)
      if (expectedApprover && String(expectedApprover) !== String(approverUserId || '')) {
        throw new APIError('This approval step is assigned to a different approver.', 403)
      }
    }

    nextTrail.push({
      stepNumber: currentStep?.stepNumber || nextTrail.length + 1,
      approver: toRelationshipId(approverUserId),
      decision: 'approved',
      notes: notes || undefined,
      actedAt: new Date().toISOString(),
    })

    const followingStep = steps[nextTrail.length]
    const isFinalApproval = !followingStep

    const updatedRequest = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.approvalRequests,
      id: approvalRequestId,
      overrideAccess: true,
      depth: 1,
      data: {
        approvalTrail: nextTrail,
        status: isFinalApproval ? 'approved' : 'pending',
        currentApprover: isFinalApproval ? undefined : toRelationshipId(followingStep?.approverUser),
        resolvedAt: isFinalApproval ? new Date().toISOString() : undefined,
        resolutionNotes: isFinalApproval ? notes || undefined : request.resolutionNotes || undefined,
      },
    })

    if (isFinalApproval) {
      await this.applyEntityApprovalOutcome({
        payload,
        entityType: request.entityType as ApprovalEntityType,
        entityId: request.entityId,
        decision: 'approved',
        approverUserId,
      })
    }

    await AccountingAuditService.logAction({
      payload,
      entityType: 'approval_request',
      entityId: approvalRequestId,
      actionType: 'approved',
      performedBy: approverUserId,
      beforeData: request,
      afterData: updatedRequest,
    })

    return updatedRequest
  }

  static async rejectRequest({
    payload,
    approvalRequestId,
    approverUserId,
    notes,
  }: {
    payload: Payload
    approvalRequestId: number | string
    approverUserId?: number | string | null
    notes?: string | null
  }) {
    const request = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.approvalRequests,
      id: approvalRequestId,
      depth: 1,
      overrideAccess: true,
    })

    if (!request || request.status !== 'pending') {
      throw new APIError('Approval request is not pending.', 400)
    }

    const updated = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.approvalRequests,
      id: approvalRequestId,
      overrideAccess: true,
      depth: 1,
      data: {
        status: 'rejected',
        currentApprover: undefined,
        resolvedAt: new Date().toISOString(),
        resolutionNotes: notes || undefined,
        approvalTrail: [
          ...(Array.isArray(request.approvalTrail) ? request.approvalTrail : []),
          {
            stepNumber: (Array.isArray(request.approvalTrail) ? request.approvalTrail.length : 0) + 1,
            approver: toRelationshipId(approverUserId),
            decision: 'rejected',
            notes: notes || undefined,
            actedAt: new Date().toISOString(),
          },
        ],
      },
    })

    await this.applyEntityApprovalOutcome({
      payload,
      entityType: request.entityType as ApprovalEntityType,
      entityId: request.entityId,
      decision: 'rejected',
      approverUserId,
    })

    await AccountingAuditService.logAction({
      payload,
      entityType: 'approval_request',
      entityId: approvalRequestId,
      actionType: 'voided',
      performedBy: approverUserId,
      beforeData: request,
      afterData: updated,
      reason: notes || undefined,
    })

    return updated
  }

  static async getApprovalQueue(payload: Payload, approverUserId?: number | string | null) {
    return payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.approvalRequests,
      where: approverUserId
        ? {
            and: [
              {
                status: {
                  equals: 'pending',
                },
              },
              {
                currentApprover: {
                  equals: approverUserId,
                },
              },
            ],
          }
        : {
            status: {
              equals: 'pending',
            },
          },
      sort: '-requestedAt',
      depth: 1,
      limit: 100,
      overrideAccess: true,
    })
  }

  static async ensureApprovedForEntity({
    payload,
    entityType,
    entityId,
  }: {
    payload: Payload
    entityType: ApprovalEntityType
    entityId: number | string
  }) {
    const approvals = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.approvalRequests,
      where: {
        and: [
          {
            entityType: {
              equals: entityType,
            },
          },
          {
            entityId: {
              equals: String(entityId),
            },
          },
          {
            status: {
              equals: 'approved',
            },
          },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (!approvals.docs[0]) {
      throw new APIError(`An approved workflow is required before ${entityType} can proceed.`, 400)
    }

    return approvals.docs[0]
  }
}
