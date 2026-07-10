import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin, AccountingApiError } from '../../_utils/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await params
    const record = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.instructorPayouts,
      id,
      depth: 2,
      overrideAccess: true,
    })
    if (!record) throw new AccountingApiError('Payout not found', 404)
    return NextResponse.json(record)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const { id } = await params
    const body = await request.json()

    const data: Record<string, unknown> = { updatedBy: user.id }

    if (body.instructor !== undefined) data.instructor = body.instructor
    if (body.course !== undefined) data.course = body.course
    if (body.periodStart !== undefined) data.periodStart = String(body.periodStart)
    if (body.periodEnd !== undefined) data.periodEnd = String(body.periodEnd)
    if (body.sourceType !== undefined) data.sourceType = String(body.sourceType)
    if (body.sourceReference !== undefined) data.sourceReference = String(body.sourceReference)
    if (body.calculatedAmount !== undefined) data.calculatedAmount = Math.max(0, Number(body.calculatedAmount) || 0)
    if (body.approvedAmount !== undefined) data.approvedAmount = Math.max(0, Number(body.approvedAmount) || 0)
    if (body.status !== undefined) data.status = String(body.status)
    if (body.notes !== undefined) data.notes = String(body.notes).trim()

    const record = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.instructorPayouts,
      id,
      overrideAccess: true,
      data: data as never,
      depth: 2,
    })

    return NextResponse.json(record)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await params
    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.instructorPayouts,
      id,
      overrideAccess: true,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
