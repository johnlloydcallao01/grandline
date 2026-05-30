import { NextRequest, NextResponse } from 'next/server'
import { AccountingBankingService } from '@/accounting/services/banking/AccountingBankingService'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params

    const record = await AccountingBankingService.completeReconciliation({
      payload,
      reconciliationId: params.id,
      userId: user.id,
    })

    return NextResponse.json(record)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
