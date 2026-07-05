import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

const formatDate = (v: string | null | undefined) => { if (!v) return '-'; const d = new Date(v); if (Number.isNaN(d.getTime())) return String(v); return d.toLocaleDateString('en-CA') }

function getRelationshipLabel(rel: unknown): string {
  if (!rel) return '-'
  if (typeof rel === 'object' && rel !== null) { const r = rel as { name?: string; displayName?: string; projectCode?: string; firstName?: string; lastName?: string; email?: string; username?: string; id?: string | number }; return r.name || r.displayName || r.projectCode || [r.firstName, r.lastName].filter(Boolean).join(' ') || r.email || r.username || String(r.id || '') }
  return String(rel)
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const doc = await payload.findByID({ collection: ACCOUNTING_COLLECTION_SLUGS.projectTasks, id: params.id, depth: 2, overrideAccess: true })
    if (!doc) return NextResponse.json({ error: 'Project task not found.' }, { status: 404 })

    return NextResponse.json({
      id: String(doc.id), taskCode: (doc as any).taskCode || '', name: (doc as any).name || '',
      status: (doc as any).status || 'draft', billable: (doc as any).billable !== false,
      projectId: (doc as any).project !== null && typeof (doc as any).project === 'object' ? String(((doc as any).project as any).id || '') : String((doc as any).project || ''),
      projectLabel: getRelationshipLabel((doc as any).project),
      assignedToId: (doc as any).assignedTo !== null && typeof (doc as any).assignedTo === 'object' ? String(((doc as any).assignedTo as any).id || '') : String((doc as any).assignedTo || ''),
      assigneeLabel: getRelationshipLabel((doc as any).assignedTo),
      startDate: (doc as any).startDate || null, startDateLabel: formatDate((doc as any).startDate),
      dueDate: (doc as any).dueDate || null, dueDateLabel: formatDate((doc as any).dueDate),
      notes: (doc as any).notes || '', createdAt: (doc as any).createdAt || null, updatedAt: (doc as any).updatedAt || null,
    })
  } catch (error) { return handleAccountingApiError(error) }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params
    const body = await request.json()

    if (body.taskCode) {
      const dup = await payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.projectTasks, where: { and: [{ taskCode: { equals: body.taskCode } }, { id: { not_equals: params.id } }] }, limit: 1, depth: 0, overrideAccess: true })
      if (dup.docs.length > 0) { return NextResponse.json({ error: `A task with code "${body.taskCode}" already exists.` }, { status: 409 }) }
    }

    const data: Record<string, unknown> = { updatedBy: user.id }
    if (body.taskCode !== undefined) data.taskCode = body.taskCode
    if (body.name !== undefined) data.name = body.name
    if (body.status !== undefined) data.status = body.status
    if (body.billable !== undefined) data.billable = body.billable
    if (body.startDate !== undefined) data.startDate = body.startDate || null
    if (body.dueDate !== undefined) data.dueDate = body.dueDate || null
    if (body.notes !== undefined) data.notes = body.notes || null
    if (body.projectId !== undefined) { const n = Number(body.projectId); data.project = Number.isFinite(n) ? n : undefined }
    if (body.assignedToId !== undefined) { const n = Number(body.assignedToId); data.assignedTo = Number.isFinite(n) ? n : null }

    const updated = await payload.update({ collection: ACCOUNTING_COLLECTION_SLUGS.projectTasks, id: params.id, depth: 2, overrideAccess: true, data: data as never })
    return NextResponse.json({ id: updated.id, task: updated })
  } catch (error) { return handleAccountingApiError(error) }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    await payload.delete({ collection: ACCOUNTING_COLLECTION_SLUGS.projectTasks, id: params.id, overrideAccess: true })
    return NextResponse.json({ success: true })
  } catch (error) { return handleAccountingApiError(error) }
}
