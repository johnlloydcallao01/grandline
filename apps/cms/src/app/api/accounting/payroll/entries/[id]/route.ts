import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { AccountingApiError, handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params

    const doc = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollEntries,
      id: params.id,
      depth: 2,
      overrideAccess: true,
    })

    if (!doc) throw new AccountingApiError('Payroll entry not found.', 404)

    return NextResponse.json(doc)
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

    const existing = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollEntries,
      id: params.id,
      depth: 0,
      overrideAccess: true,
    })
    if (!existing) throw new AccountingApiError('Payroll entry not found.', 404)
    if ((existing as unknown as Record<string, unknown>).status === 'posted') {
      throw new AccountingApiError('Cannot edit a posted payroll entry.', 400)
    }
    if ((existing as unknown as Record<string, unknown>).status === 'voided') {
      throw new AccountingApiError('Cannot edit a voided payroll entry.', 400)
    }

    const toId = (v: unknown): number | null => {
      if (v === null || v === undefined) return null
      const n = Number(v)
      return Number.isFinite(n) && n > 0 ? n : null
    }

    const data: Record<string, unknown> = {
      updatedBy: user.id,
    }

    if (body.entryType !== undefined) data.entryType = String(body.entryType)
    if (body.grossAmount !== undefined) data.grossAmount = Math.max(0, Number(body.grossAmount))
    if (body.deductionAmount !== undefined) data.deductionAmount = Math.max(0, Number(body.deductionAmount))
    if (body.status !== undefined) data.status = String(body.status)
    if (body.notes !== undefined) data.notes = String(body.notes).trim()

    const payrollRun = toId(body.payrollRun)
    const expenseAccount = toId(body.expenseAccount)
    const payableAccount = toId(body.payableAccount)
    const userRel = toId(body.user)
    const instructor = toId(body.instructor)
    const project = toId(body.project)

    if (payrollRun) data.payrollRun = payrollRun
    if (expenseAccount) data.expenseAccount = expenseAccount
    if (payableAccount) data.payableAccount = payableAccount
    if (userRel !== null) data.user = userRel
    if (instructor !== null) data.instructor = instructor
    if (project !== null) data.project = project

    const record = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollEntries,
      id: params.id,
      overrideAccess: true,
      data: data as never,
      depth: 2,
    })

    return NextResponse.json(record)
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

    const existing = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollEntries,
      id: params.id,
      depth: 0,
      overrideAccess: true,
    })
    if (!existing) throw new AccountingApiError('Payroll entry not found.', 404)
    if ((existing as unknown as Record<string, unknown>).status === 'posted') {
      throw new AccountingApiError('Cannot delete a posted payroll entry.', 400)
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollEntries,
      id: params.id,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
