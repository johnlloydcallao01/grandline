import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { AccountingBankingService } from '@/accounting/services/banking/AccountingBankingService'
import { isLockedReconciliationStatus } from '@/accounting/utils/commercial'
import {
  AccountingApiError,
  handleAccountingApiError,
  parseNumberParam,
  requireAccountingAdmin,
} from '../../../../../_utils/auth'
import { buildReconciliationDetailResponse, type ReconciliationDoc } from '../../_shared'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params
    const reconciliationId = parseNumberParam(params.id) || params.id
    const currentRecord = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankReconciliations,
      id: reconciliationId,
      depth: 2,
      overrideAccess: true,
    })) as ReconciliationDoc

    if (isLockedReconciliationStatus(String(currentRecord.status || ''))) {
      throw new AccountingApiError('Completed or locked reconciliation sessions cannot be completed again.', 400)
    }

    const snapshot = await AccountingBankingService.getReconciliationSnapshot(payload, reconciliationId)
    if (!snapshot.canComplete) {
      const reasons: string[] = []
      if (Math.abs(Number(snapshot.differenceAmount || 0)) > 0.0001) {
        reasons.push('The statement difference must be zero before completion.')
      }
      if (snapshot.unmatchedTransactionCount > 0) {
        reasons.push(`${snapshot.unmatchedTransactionCount} transaction(s) still need to be matched or ignored.`)
      }
      throw new AccountingApiError(reasons.join(' '), 400)
    }

    const completedRecord = (await AccountingBankingService.completeReconciliation({
      payload,
      reconciliationId,
      userId: user.id,
    })) as ReconciliationDoc

    return NextResponse.json(await buildReconciliationDetailResponse(payload, completedRecord))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
