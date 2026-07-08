import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

function getRelationLabel(rel: unknown): string { if (!rel) return '-'; if (typeof rel === 'object' && rel !== null) { const r = rel as Record<string, any>; return r.code || r.name || String(r.id || '') } return String(rel) }

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const doc = await payload.findByID({ collection: ACCOUNTING_COLLECTION_SLUGS.forecastScenarios, id: params.id, depth: 2, overrideAccess: true })
    if (!doc) return NextResponse.json({ error: 'Scenario not found.' }, { status: 404 })
    const d = doc as any
    return NextResponse.json({
      id: String(d.id), name: d.name || '', status: d.status || 'draft', scenarioType: d.scenarioType || 'base_case',
      fiscalYearId: d.fiscalYear !== null && typeof d.fiscalYear === 'object' ? String((d.fiscalYear as any).id || '') : String(d.fiscalYear || ''),
      fiscalYearLabel: getRelationLabel(d.fiscalYear),
      assumptions: d.assumptions || null, notes: d.notes || '',
      createdAt: d.createdAt || null, updatedAt: d.updatedAt || null,
    })
  } catch (e) { return handleAccountingApiError(e) }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params; const body = await request.json()
    const data: Record<string, unknown> = { updatedBy: user.id }
    if (body.name !== undefined) data.name = body.name; if (body.status !== undefined) data.status = body.status; if (body.scenarioType !== undefined) data.scenarioType = body.scenarioType
    if (body.assumptions !== undefined) data.assumptions = body.assumptions; if (body.notes !== undefined) data.notes = body.notes || null
    if (body.fiscalYearId !== undefined) { const n = Number(body.fiscalYearId); data.fiscalYear = Number.isFinite(n) ? n : undefined }
    const updated = await payload.update({ collection: ACCOUNTING_COLLECTION_SLUGS.forecastScenarios, id: params.id, depth: 2, overrideAccess: true, data: data as never })
    return NextResponse.json({ id: updated.id, scenario: updated })
  } catch (e) { return handleAccountingApiError(e) }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const budgets = await findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.budgets, depth: 0, where: { scenario: { equals: params.id } } })
    if (budgets.length > 0) { return NextResponse.json({ error: `Cannot delete — ${budgets.length} budget${budgets.length > 1 ? 's' : ''} linked. Unlink them first.` }, { status: 409 }) }
    await payload.delete({ collection: ACCOUNTING_COLLECTION_SLUGS.forecastScenarios, id: params.id, overrideAccess: true })
    return NextResponse.json({ success: true })
  } catch (e) { return handleAccountingApiError(e) }
}
