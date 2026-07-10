import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin, AccountingApiError } from '../../_utils/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await params
    const record = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollAccountMappings,
      id,
      depth: 2,
      overrideAccess: true,
    })
    if (!record) throw new AccountingApiError('Mapping not found', 404)
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

    const toId = (v: unknown): number | null => {
      if (v === null || v === undefined) return null
      const n = Number(v)
      return Number.isFinite(n) && n > 0 ? n : null
    }

    const data: Record<string, unknown> = { updatedBy: user.id }

    if (body.entryType !== undefined) data.entryType = String(body.entryType)
    if (body.person !== undefined) data.person = String(body.person).trim()
    if (body.expenseAccount !== undefined) data.expenseAccount = toId(body.expenseAccount)
    if (body.payableAccount !== undefined) data.payableAccount = toId(body.payableAccount)
    if (body.deductionAmount !== undefined) data.deductionAmount = Math.max(0, Number(body.deductionAmount) || 0)
    if (body.status !== undefined) data.status = String(body.status)
    if (body.notes !== undefined) data.notes = String(body.notes).trim()

    const record = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollAccountMappings,
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
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollAccountMappings,
      id,
      overrideAccess: true,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
