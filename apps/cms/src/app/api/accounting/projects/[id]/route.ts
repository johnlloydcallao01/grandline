import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

const formatDate = (v: string | null | undefined) => { if (!v) return '-'; const d = new Date(v); if (Number.isNaN(d.getTime())) return String(v); return d.toLocaleDateString('en-CA') }

function getRelationshipLabel(rel: unknown): string {
  if (!rel) return '-'
  if (typeof rel === 'object' && rel !== null) {
    const r = rel as { displayName?: string; name?: string; title?: string; firstName?: string; lastName?: string; email?: string }
    return r.displayName || r.name || r.title || [r.firstName, r.lastName].filter(Boolean).join(' ') || r.email || String((rel as any).id || '')
  }
  return String(rel)
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const doc = await payload.findByID({ collection: ACCOUNTING_COLLECTION_SLUGS.projects, id: params.id, depth: 2, overrideAccess: true })
    if (!doc) return NextResponse.json({ error: 'Project not found.' }, { status: 404 })

    return NextResponse.json({
      id: String(doc.id), projectCode: (doc as any).projectCode || '', name: (doc as any).name || '',
      status: (doc as any).status || 'draft', projectType: (doc as any).projectType || 'internal',
      customerId: (doc as any).customer !== null && typeof (doc as any).customer === 'object' ? String(((doc as any).customer as any).id || '') : String((doc as any).customer || ''),
      customerLabel: getRelationshipLabel((doc as any).customer),
      managerUserId: (doc as any).managerUser !== null && typeof (doc as any).managerUser === 'object' ? String(((doc as any).managerUser as any).id || '') : String((doc as any).managerUser || ''),
      managerLabel: getRelationshipLabel((doc as any).managerUser),
      courseId: (doc as any).course !== null && typeof (doc as any).course === 'object' ? String(((doc as any).course as any).id || '') : String((doc as any).course || ''),
      courseLabel: getRelationshipLabel((doc as any).course),
      startDate: (doc as any).startDate || null, startDateLabel: formatDate((doc as any).startDate),
      endDate: (doc as any).endDate || null, endDateLabel: formatDate((doc as any).endDate),
      branchId: (doc as any).branch !== null && typeof (doc as any).branch === 'object' ? String(((doc as any).branch as any).id || '') : String((doc as any).branch || ''),
      branchLabel: getRelationshipLabel((doc as any).branch),
      departmentId: (doc as any).department !== null && typeof (doc as any).department === 'object' ? String(((doc as any).department as any).id || '') : String((doc as any).department || ''),
      departmentLabel: getRelationshipLabel((doc as any).department),
      locationId: (doc as any).location !== null && typeof (doc as any).location === 'object' ? String(((doc as any).location as any).id || '') : String((doc as any).location || ''),
      locationLabel: getRelationshipLabel((doc as any).location),
      budgetAmount: typeof (doc as any).budgetAmount === 'number' ? (doc as any).budgetAmount : 0,
      notes: (doc as any).notes || '',
      createdAt: (doc as any).createdAt || null, updatedAt: (doc as any).updatedAt || null,
    })
  } catch (error) { return handleAccountingApiError(error) }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params
    const body = await request.json()

    if (body.projectCode) {
      const dup = await payload.find({
        collection: ACCOUNTING_COLLECTION_SLUGS.projects,
        where: { and: [{ projectCode: { equals: body.projectCode } }, { id: { not_equals: params.id } }] },
        limit: 1, depth: 0, overrideAccess: true,
      })
      if (dup.docs.length > 0) { return NextResponse.json({ error: `A project with code "${body.projectCode}" already exists.` }, { status: 409 }) }
    }

    const data: Record<string, unknown> = { updatedBy: user.id }
    if (body.projectCode !== undefined) data.projectCode = body.projectCode
    if (body.name !== undefined) data.name = body.name
    if (body.status !== undefined) data.status = body.status
    if (body.projectType !== undefined) data.projectType = body.projectType
    if (body.startDate !== undefined) data.startDate = body.startDate || null
    if (body.endDate !== undefined) data.endDate = body.endDate || null
    if (body.budgetAmount !== undefined) data.budgetAmount = Number(body.budgetAmount) || 0
    if (body.notes !== undefined) data.notes = body.notes || null
    if (body.customerId !== undefined) { const n = Number(body.customerId); data.customer = Number.isFinite(n) ? n : null }
    if (body.managerUserId !== undefined) { const n = Number(body.managerUserId); data.managerUser = Number.isFinite(n) ? n : null }
    if (body.courseId !== undefined) { const n = Number(body.courseId); data.course = Number.isFinite(n) ? n : null }
    if (body.branchId !== undefined) { const n = Number(body.branchId); data.branch = Number.isFinite(n) ? n : null }
    if (body.departmentId !== undefined) { const n = Number(body.departmentId); data.department = Number.isFinite(n) ? n : null }
    if (body.locationId !== undefined) { const n = Number(body.locationId); data.location = Number.isFinite(n) ? n : null }

    const updated = await payload.update({ collection: ACCOUNTING_COLLECTION_SLUGS.projects, id: params.id, depth: 2, overrideAccess: true, data: data as never })
    return NextResponse.json({ id: updated.id, project: updated })
  } catch (error) { return handleAccountingApiError(error) }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params

    const [taskDocs, invoiceDocs, expenseDocs] = await Promise.all([
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.projectTasks, depth: 0, where: { project: { equals: params.id } } }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.invoices, depth: 0, where: { project: { equals: params.id } } }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.expenses, depth: 0, where: { project: { equals: params.id } } }),
    ])

    const barriers: string[] = []
    if (taskDocs.length > 0) barriers.push(`${taskDocs.length} project task${taskDocs.length > 1 ? 's' : ''}`)
    if (invoiceDocs.length > 0) barriers.push(`${invoiceDocs.length} invoice${invoiceDocs.length > 1 ? 's' : ''}`)
    if (expenseDocs.length > 0) barriers.push(`${expenseDocs.length} expense${expenseDocs.length > 1 ? 's' : ''}`)
    if (barriers.length > 0) { return NextResponse.json({ error: `Cannot delete this project because it is linked to ${barriers.join(', ')}. Remove those links first.` }, { status: 409 }) }

    await payload.delete({ collection: ACCOUNTING_COLLECTION_SLUGS.projects, id: params.id, overrideAccess: true })
    return NextResponse.json({ success: true })
  } catch (error) { return handleAccountingApiError(error) }
}
