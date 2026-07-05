import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

const formatDate = (v: string | null | undefined) => { if (!v) return '-'; const d = new Date(v); if (Number.isNaN(d.getTime())) return String(v); return d.toLocaleDateString('en-CA') }
const formatDateTime = (v: string | null | undefined) => { if (!v) return '-'; const d = new Date(v); if (Number.isNaN(d.getTime())) return String(v); return d.toLocaleDateString('en-CA') + ' ' + d.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' }) }

function getRelationLabel(rel: unknown): string {
  if (!rel) return '-'
  if (typeof rel === 'object' && rel !== null) { const r = rel as { name?: string; displayName?: string; projectCode?: string; taskCode?: string; title?: string; firstName?: string; lastName?: string; email?: string; username?: string; id?: string | number }; return r.name || r.displayName || r.projectCode || r.taskCode || r.title || [r.firstName, r.lastName].filter(Boolean).join(' ') || r.email || r.username || String(r.id || '') }
  return String(rel)
}

function fmtHours(h: number | null | undefined, m: number | null | undefined): string { const total = (h || 0) + (m || 0) / 60; return total.toFixed(2) }

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const doc = await payload.findByID({ collection: ACCOUNTING_COLLECTION_SLUGS.timeEntries, id: params.id, depth: 2, overrideAccess: true })
    if (!doc) return NextResponse.json({ error: 'Time entry not found.' }, { status: 404 })

    return NextResponse.json({
      id: String(doc.id), entryDate: (doc as any).entryDate || null, entryDateLabel: formatDate((doc as any).entryDate),
      status: (doc as any).status || 'draft', sourceType: (doc as any).sourceType || 'manual',
      userId: (doc as any).user !== null && typeof (doc as any).user === 'object' ? String(((doc as any).user as any).id || '') : String((doc as any).user || ''),
      userLabel: getRelationLabel((doc as any).user),
      projectId: (doc as any).project !== null && typeof (doc as any).project === 'object' ? String(((doc as any).project as any).id || '') : String((doc as any).project || ''),
      projectLabel: getRelationLabel((doc as any).project),
      projectTaskId: (doc as any).projectTask !== null && typeof (doc as any).projectTask === 'object' ? String(((doc as any).projectTask as any).id || '') : String((doc as any).projectTask || ''),
      projectTaskLabel: getRelationLabel((doc as any).projectTask),
      courseId: (doc as any).course !== null && typeof (doc as any).course === 'object' ? String(((doc as any).course as any).id || '') : String((doc as any).course || ''),
      courseLabel: getRelationLabel((doc as any).course),
      instructorId: (doc as any).instructor !== null && typeof (doc as any).instructor === 'object' ? String(((doc as any).instructor as any).id || '') : String((doc as any).instructor || ''),
      instructorLabel: getRelationLabel((doc as any).instructor),
      timesheetId: (doc as any).timesheet !== null && typeof (doc as any).timesheet === 'object' ? String(((doc as any).timesheet as any).id || '') : String((doc as any).timesheet || ''),
      hours: typeof (doc as any).hours === 'number' ? (doc as any).hours : 0, hoursLabel: fmtHours((doc as any).hours, (doc as any).minutes),
      minutes: typeof (doc as any).minutes === 'number' ? (doc as any).minutes : 0,
      billable: (doc as any).billable !== false,
      billingRate: typeof (doc as any).billingRate === 'number' ? (doc as any).billingRate : 0,
      costRate: typeof (doc as any).costRate === 'number' ? (doc as any).costRate : 0,
      startedAt: (doc as any).startedAt || null, startedAtLabel: formatDateTime((doc as any).startedAt),
      endedAt: (doc as any).endedAt || null, endedAtLabel: formatDateTime((doc as any).endedAt),
      approvedByLabel: getRelationLabel((doc as any).approvedBy),
      approvedAt: (doc as any).approvedAt || null, approvedAtLabel: formatDateTime((doc as any).approvedAt),
      notes: (doc as any).notes || '', createdAt: (doc as any).createdAt || null, updatedAt: (doc as any).updatedAt || null,
    })
  } catch (error) { return handleAccountingApiError(error) }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params
    const body = await request.json()

    const data: Record<string, unknown> = { updatedBy: user.id }
    if (body.entryDate !== undefined) data.entryDate = body.entryDate
    if (body.status !== undefined) data.status = body.status
    if (body.sourceType !== undefined) data.sourceType = body.sourceType
    if (body.hours !== undefined) data.hours = Number(body.hours) || 0
    if (body.minutes !== undefined) data.minutes = Number(body.minutes) || 0
    if (body.billable !== undefined) data.billable = body.billable
    if (body.billingRate !== undefined) data.billingRate = Number(body.billingRate) || 0
    if (body.costRate !== undefined) data.costRate = Number(body.costRate) || 0
    if (body.startedAt !== undefined) data.startedAt = body.startedAt || null
    if (body.endedAt !== undefined) data.endedAt = body.endedAt || null
    if (body.notes !== undefined) data.notes = body.notes || null
    if (body.userId !== undefined) { const n = Number(body.userId); data.user = Number.isFinite(n) ? n : undefined }
    if (body.projectId !== undefined) { const n = Number(body.projectId); data.project = Number.isFinite(n) ? n : null }
    if (body.projectTaskId !== undefined) { const n = Number(body.projectTaskId); data.projectTask = Number.isFinite(n) ? n : null }
    if (body.courseId !== undefined) { const n = Number(body.courseId); data.course = Number.isFinite(n) ? n : null }
    if (body.instructorId !== undefined) { const n = Number(body.instructorId); data.instructor = Number.isFinite(n) ? n : null }
    if (body.timesheetId !== undefined) { const n = Number(body.timesheetId); data.timesheet = Number.isFinite(n) ? n : null }

    const updated = await payload.update({ collection: ACCOUNTING_COLLECTION_SLUGS.timeEntries, id: params.id, depth: 2, overrideAccess: true, data: data as never })
    return NextResponse.json({ id: updated.id, entry: updated })
  } catch (error) { return handleAccountingApiError(error) }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    await payload.delete({ collection: ACCOUNTING_COLLECTION_SLUGS.timeEntries, id: params.id, overrideAccess: true })
    return NextResponse.json({ success: true })
  } catch (error) { return handleAccountingApiError(error) }
}
