import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

function getRelationLabel(rel: unknown): string { if (!rel) return '-'; if (typeof rel === 'object' && rel !== null) { const r = rel as Record<string, any>; return r.displayName || r.name || r.title || r.code || String(r.id || '') } return String(rel) }

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const doc = await payload.findByID({ collection: ACCOUNTING_COLLECTION_SLUGS.budgets, id: params.id, depth: 2, overrideAccess: true })
    if (!doc) return NextResponse.json({ error: 'Budget not found.' }, { status: 404 })
    const d = doc as any
    return NextResponse.json({
      id: String(d.id), budgetCode: d.budgetCode || '', name: d.name || '', status: d.status || 'draft', budgetType: d.budgetType || 'annual',
      fiscalYearId: d.fiscalYear !== null && typeof d.fiscalYear === 'object' ? String((d.fiscalYear as any).id || '') : String(d.fiscalYear || ''),
      fiscalYearLabel: getRelationLabel(d.fiscalYear),
      scenarioId: d.scenario !== null && typeof d.scenario === 'object' ? String((d.scenario as any).id || '') : String(d.scenario || ''),
      scenarioLabel: getRelationLabel(d.scenario),
      projectId: d.project !== null && typeof d.project === 'object' ? String((d.project as any).id || '') : String(d.project || ''),
      projectLabel: getRelationLabel(d.project),
      courseCategoryId: d.courseCategory !== null && typeof d.courseCategory === 'object' ? String((d.courseCategory as any).id || '') : String(d.courseCategory || ''),
      courseCategoryLabel: getRelationLabel(d.courseCategory),
      branchId: d.branch !== null && typeof d.branch === 'object' ? String((d.branch as any).id || '') : String(d.branch || ''),
      branchLabel: getRelationLabel(d.branch),
      departmentId: d.department !== null && typeof d.department === 'object' ? String((d.department as any).id || '') : String(d.department || ''),
      departmentLabel: getRelationLabel(d.department),
      locationId: d.location !== null && typeof d.location === 'object' ? String((d.location as any).id || '') : String(d.location || ''),
      locationLabel: getRelationLabel(d.location),
      notes: d.notes || '', createdAt: d.createdAt || null, updatedAt: d.updatedAt || null,
    })
  } catch (e) { return handleAccountingApiError(e) }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params
    const body = await request.json()
    if (body.budgetCode) { const dup = await payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.budgets, where: { and: [{ budgetCode: { equals: body.budgetCode } }, { id: { not_equals: params.id } }] }, limit: 1, depth: 0, overrideAccess: true }); if (dup.docs.length > 0) { return NextResponse.json({ error: `A budget with code "${body.budgetCode}" already exists.` }, { status: 409 }) } }
    const data: Record<string, unknown> = { updatedBy: user.id }
    if (body.budgetCode !== undefined) data.budgetCode = body.budgetCode
    if (body.name !== undefined) data.name = body.name; if (body.status !== undefined) data.status = body.status; if (body.budgetType !== undefined) data.budgetType = body.budgetType
    if (body.notes !== undefined) data.notes = body.notes || null
    if (body.fiscalYearId !== undefined) { const n = Number(body.fiscalYearId); data.fiscalYear = Number.isFinite(n) ? n : undefined }
    if (body.branchId !== undefined) { const n = Number(body.branchId); data.branch = Number.isFinite(n) ? n : null }
    if (body.departmentId !== undefined) { const n = Number(body.departmentId); data.department = Number.isFinite(n) ? n : null }
    if (body.locationId !== undefined) { const n = Number(body.locationId); data.location = Number.isFinite(n) ? n : null }
    if (body.projectId !== undefined) { const n = Number(body.projectId); data.project = Number.isFinite(n) ? n : null }
    if (body.courseCategoryId !== undefined) { const n = Number(body.courseCategoryId); data.courseCategory = Number.isFinite(n) ? n : null }
    if (body.scenarioId !== undefined) { const n = Number(body.scenarioId); data.scenario = Number.isFinite(n) ? n : null }
    const updated = await payload.update({ collection: ACCOUNTING_COLLECTION_SLUGS.budgets, id: params.id, depth: 2, overrideAccess: true, data: data as never })
    return NextResponse.json({ id: updated.id, budget: updated })
  } catch (e) { return handleAccountingApiError(e) }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const lines = await findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.budgetLines, depth: 0, where: { budget: { equals: params.id } } })
    if (lines.length > 0) { return NextResponse.json({ error: `Cannot delete — ${lines.length} budget line${lines.length > 1 ? 's' : ''} linked. Remove them first.` }, { status: 409 }) }
    await payload.delete({ collection: ACCOUNTING_COLLECTION_SLUGS.budgets, id: params.id, overrideAccess: true })
    return NextResponse.json({ success: true })
  } catch (e) { return handleAccountingApiError(e) }
}
