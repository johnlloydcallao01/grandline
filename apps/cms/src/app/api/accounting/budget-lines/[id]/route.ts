import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

function getRelationLabel(rel: unknown): string { if (!rel) return '-'; if (typeof rel === 'object' && rel !== null) { const r = rel as Record<string, any>; return r.displayName || r.name || r.code || r.budgetCode || String(r.id || '') } return String(rel) }

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const doc = await payload.findByID({ collection: ACCOUNTING_COLLECTION_SLUGS.budgetLines, id: params.id, depth: 2, overrideAccess: true })
    if (!doc) return NextResponse.json({ error: 'Budget line not found.' }, { status: 404 })
    const d = doc as any
    return NextResponse.json({
      id: String(d.id), budgetId: d.budget !== null && typeof d.budget === 'object' ? String((d.budget as any).id || '') : String(d.budget || ''),
      budgetLabel: getRelationLabel(d.budget), accountId: d.account !== null && typeof d.account === 'object' ? String((d.account as any).id || '') : String(d.account || ''),
      accountLabel: getRelationLabel(d.account), accountCode: d.account !== null && typeof d.account === 'object' ? ((d.account as any).code || '') : '',
      periodId: d.period !== null && typeof d.period === 'object' ? String((d.period as any).id || '') : String(d.period || ''),
      periodLabel: getRelationLabel(d.period), plannedAmount: typeof d.plannedAmount === 'number' ? d.plannedAmount : 0,
      notes: d.notes || '', createdAt: d.createdAt || null, updatedAt: d.updatedAt || null,
    })
  } catch (e) { return handleAccountingApiError(e) }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params; const body = await request.json()
    const data: Record<string, unknown> = { updatedBy: user.id }
    if (body.budgetId !== undefined) { const n = Number(body.budgetId); data.budget = Number.isFinite(n) ? n : undefined }
    if (body.accountId !== undefined) { const n = Number(body.accountId); data.account = Number.isFinite(n) ? n : undefined }
    if (body.plannedAmount !== undefined) data.plannedAmount = Number(body.plannedAmount) || 0
    if (body.notes !== undefined) data.notes = body.notes || null
    if (body.periodId !== undefined) { const n = Number(body.periodId); data.period = Number.isFinite(n) ? n : null }
    const updated = await payload.update({ collection: ACCOUNTING_COLLECTION_SLUGS.budgetLines, id: params.id, depth: 2, overrideAccess: true, data: data as never })
    return NextResponse.json({ id: updated.id, line: updated })
  } catch (e) { return handleAccountingApiError(e) }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    await payload.delete({ collection: ACCOUNTING_COLLECTION_SLUGS.budgetLines, id: params.id, overrideAccess: true })
    return NextResponse.json({ success: true })
  } catch (e) { return handleAccountingApiError(e) }
}
