import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { AccountingApiError, handleAccountingApiError, parseNumberParam, requireAccountingAdmin } from '../../../_utils/auth'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['calculated'],
  calculated: ['approved'],
  approved: ['paid', 'voided'],
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const body = await request.json().catch(() => ({}))
    const action = String(body.action || '').trim().toLowerCase()

    if (!['calculate', 'approve', 'pay', 'void'].includes(action)) {
      throw new AccountingApiError('Invalid action. Must be one of: calculate, approve, pay, void.', 400)
    }

    const targetStatus: Record<string, string> = {
      calculate: 'calculated',
      approve: 'approved',
      pay: 'paid',
      void: 'voided',
    }

    const payoutId = parseNumberParam(id) || id
    const existing = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.instructorPayouts,
      id: payoutId,
      depth: 0,
      overrideAccess: true,
    }) as unknown as Record<string, unknown> | undefined

    if (!existing) throw new AccountingApiError('Instructor payout not found', 404)

    const currentStatus = String(existing.status || '')
    const allowedNext = VALID_TRANSITIONS[currentStatus]

    if (!allowedNext || !allowedNext.includes(targetStatus[action])) {
      throw new AccountingApiError(
        `Cannot ${action} a payout with status "${currentStatus}". Expected one of: ${(VALID_TRANSITIONS[currentStatus] || []).join(', ') || 'none'}.`,
        409,
      )
    }

    const updateData: Record<string, unknown> = {
      status: targetStatus[action],
      updatedBy: user.id,
    }

    if (action === 'approve') {
      const ca = Number(existing.calculatedAmount) || 0
      updateData.approvedAmount = ca
    }

    const record = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.instructorPayouts,
      id: payoutId,
      overrideAccess: true,
      data: updateData as never,
      depth: 2,
    })

    return NextResponse.json({ id: record.id, status: targetStatus[action] })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
