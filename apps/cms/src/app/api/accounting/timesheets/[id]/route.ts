import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

const formatDate = (v: string | null | undefined) => { if (!v) return '-'; const d = new Date(v); if (Number.isNaN(d.getTime())) return String(v); return d.toLocaleDateString('en-CA') }
function getRelationLabel(rel: unknown): string { if (!rel) return '-'; if (typeof rel === 'object' && rel !== null) { const r = rel as Record<string, any>; return [r.firstName, r.lastName].filter(Boolean).join(' ') || r.email || r.username || String(r.id || '') } return String(rel) }

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const doc = await payload.findByID({ collection: ACCOUNTING_COLLECTION_SLUGS.timesheets, id: params.id, depth: 2, overrideAccess: true })
    if (!doc) return NextResponse.json({ error: 'Timesheet not found.' }, { status: 404 })

    const d = doc as any
    return NextResponse.json({
      id: String(d.id), periodStart: d.periodStart || null, periodStartLabel: formatDate(d.periodStart),
      periodEnd: d.periodEnd || null, periodEndLabel: formatDate(d.periodEnd),
      status: d.status || 'draft', totalHours: typeof d.totalHours === 'number' ? d.totalHours : 0,
      userId: d.user !== null && typeof d.user === 'object' ? String((d.user as any).id || '') : String(d.user || ''),
      userLabel: getRelationLabel(d.user),
      approvedByLabel: getRelationLabel(d.approvedBy),
      approvedAt: d.approvedAt || null, approvedAtLabel: formatDate(d.approvedAt),
      notes: d.notes || '', createdAt: d.createdAt || null, updatedAt: d.updatedAt || null,
    })
  } catch (e) { return handleAccountingApiError(e) }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { payload, user: me } = await requireAccountingAdmin(request)
    const params = await context.params
    const body = await request.json()
    const data: Record<string, unknown> = { updatedBy: me.id }
    if (body.periodStart !== undefined) data.periodStart = body.periodStart
    if (body.periodEnd !== undefined) data.periodEnd = body.periodEnd
    if (body.status !== undefined) data.status = body.status
    if (body.notes !== undefined) data.notes = body.notes || null
    if (body.userId !== undefined) { const n = Number(body.userId); data.user = Number.isFinite(n) ? n : undefined }
    if (body.approvedBy !== undefined) { const n = Number(body.approvedBy); data.approvedBy = Number.isFinite(n) ? n : null }
    if (body.approvedAt !== undefined) data.approvedAt = body.approvedAt || null
    const updated = await payload.update({ collection: ACCOUNTING_COLLECTION_SLUGS.timesheets, id: params.id, depth: 2, overrideAccess: true, data: data as never })
    return NextResponse.json({ id: updated.id, timesheet: updated })
  } catch (e) { return handleAccountingApiError(e) }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const entries = await findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.timeEntries, depth: 0, where: { timesheet: { equals: params.id } } })
    if (entries.length > 0) { return NextResponse.json({ error: `Cannot delete — ${entries.length} time entr${entries.length > 1 ? 'ies' : 'y'} linked to this timesheet. Unlink them first.` }, { status: 409 }) }
    await payload.delete({ collection: ACCOUNTING_COLLECTION_SLUGS.timesheets, id: params.id, overrideAccess: true })
    return NextResponse.json({ success: true })
  } catch (e) { return handleAccountingApiError(e) }
}
