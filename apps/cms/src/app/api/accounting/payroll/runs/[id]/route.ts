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
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollRuns,
      id: params.id,
      depth: 2,
      overrideAccess: true,
    })

    if (!doc) throw new AccountingApiError('Payroll run not found.', 404)

    const [entries] = await Promise.all([
      payload.find({
        collection: ACCOUNTING_COLLECTION_SLUGS.payrollEntries,
        depth: 1,
        limit: 1000,
        sort: 'createdAt',
        where: { payrollRun: { equals: Number(params.id) } } as never,
        overrideAccess: true,
      }),
    ])

    return NextResponse.json({ ...doc, entries: entries.docs })
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
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollRuns,
      id: params.id,
      depth: 0,
      overrideAccess: true,
    })
    if (!existing) throw new AccountingApiError('Payroll run not found.', 404)

    const toId = (v: unknown): number | null => {
      if (v === null || v === undefined) return null
      const n = Number(v)
      return Number.isFinite(n) && n > 0 ? n : null
    }

    const data: Record<string, unknown> = {
      updatedBy: user.id,
    }

    if (body.payrollCode !== undefined) data.payrollCode = String(body.payrollCode).trim()
    if (body.periodStart !== undefined) data.periodStart = body.periodStart
    if (body.periodEnd !== undefined) data.periodEnd = body.periodEnd
    if (body.paymentDate !== undefined) data.paymentDate = body.paymentDate
    if (body.status !== undefined) data.status = String(body.status)
    if (body.notes !== undefined) data.notes = String(body.notes).trim()

    const branch = toId(body.branch)
    const department = toId(body.department)
    if (branch !== null) data.branch = branch
    if (department !== null) data.department = department

    const record = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollRuns,
      id: params.id,
      overrideAccess: true,
      data: data as never,
      depth: 1,
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
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollRuns,
      id: params.id,
      depth: 0,
      overrideAccess: true,
    })
    if (!existing) throw new AccountingApiError('Payroll run not found.', 404)

    if ((existing as unknown as Record<string, unknown>).status === 'posted') {
      throw new AccountingApiError('Cannot delete a posted payroll run.', 400)
    }

    const entryCount = await payload.count({
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollEntries,
      where: { payrollRun: { equals: Number(params.id) } } as never,
      overrideAccess: true,
    })
    if (entryCount.totalDocs > 0) {
      throw new AccountingApiError('Cannot delete payroll run with existing payroll entries. Remove entries first.', 400)
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollRuns,
      id: params.id,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
