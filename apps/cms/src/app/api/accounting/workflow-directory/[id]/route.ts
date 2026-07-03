import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params

    const doc = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.approvalWorkflows,
      id: params.id,
      depth: 2,
      overrideAccess: true,
    })

    if (!doc) {
      return NextResponse.json({ error: 'Workflow not found.' }, { status: 404 })
    }

    const steps = Array.isArray((doc as any).steps) ? (doc as any).steps : []
    const sortedSteps = steps.slice().sort((a: any, b: any) => (a.stepNumber || 0) - (b.stepNumber || 0))

    const formatApprover = (approver: any) => {
      if (!approver) return null
      if (typeof approver === 'object') {
        return {
          id: String(approver.id),
          label: [approver.firstName, approver.lastName].filter(Boolean).join(' ') || approver.email || approver.username || `User ${approver.id}`,
        }
      }
      return { id: String(approver), label: `User ${approver}` }
    }

    return NextResponse.json({
      id: String(doc.id),
      workflowCode: (doc as any).workflowCode || '',
      name: (doc as any).name || '',
      entityType: (doc as any).entityType || '',
      isActive: (doc as any).isActive !== false,
      notes: (doc as any).notes || '',
      steps: sortedSteps.map((s: any, i: number) => ({
        stepNumber: s.stepNumber || i + 1,
        label: s.label || '',
        approverUser: formatApprover(s.approverUser),
        approverRole: s.approverRole || '',
      })),
      createdAt: (doc as any).createdAt || null,
      updatedAt: (doc as any).updatedAt || null,
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params
    const body = await request.json()

    const data: Record<string, unknown> = { updatedBy: user.id }
    if (body.workflowCode !== undefined) data.workflowCode = body.workflowCode
    if (body.name !== undefined) data.name = body.name
    if (body.entityType !== undefined) data.entityType = body.entityType
    if (body.isActive !== undefined) data.isActive = body.isActive
    if (body.notes !== undefined) data.notes = body.notes || undefined
    if (Array.isArray(body.steps)) {
      data.steps = body.steps.map((s: any, i: number) => ({
        stepNumber: s.stepNumber || i + 1,
        label: s.label || undefined,
        approverUser: s.approverUserId ? Number(s.approverUserId) : undefined,
        approverRole: s.approverRole || undefined,
      })).filter((s: any) => s.stepNumber)
    }

    const updated = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.approvalWorkflows,
      id: params.id,
      depth: 2,
      overrideAccess: true,
      data: data as never,
    })

    return NextResponse.json({ id: updated.id, workflow: updated })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params

    const dependencyResult = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.approvalRequests,
      where: { workflow: { equals: params.id } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (dependencyResult.docs && dependencyResult.docs.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete this workflow because it is referenced by existing approval requests. Deactivate it instead.' },
        { status: 409 },
      )
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.approvalWorkflows,
      id: params.id,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
