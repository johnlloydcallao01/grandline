import { NextRequest, NextResponse } from 'next/server'
import { AccountingBankingService } from '@/accounting/services/banking/AccountingBankingService'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params

    const snapshot = await AccountingBankingService.getReconciliationSnapshot(payload, params.id)
    return NextResponse.json(snapshot)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
