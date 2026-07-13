import { NextRequest, NextResponse } from 'next/server'
import { AccountingCloseService } from '@/accounting/services/periods/AccountingCloseService'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body: Record<string, unknown> = await request.json()
    const target = AccountingCloseService.parseCloseTarget(body.target)
    const clearLockDate = body.clearLockDate === true

    if (target === 'period') {
      if (!body.periodId) {
        return NextResponse.json({ error: 'periodId is required when reopening a period.' }, { status: 400 })
      }
      const record = await AccountingCloseService.reopenPeriod({
        payload,
        periodId: body.periodId as number | string,
        userId: user.id,
        clearLockDate,
      })
      return NextResponse.json({ success: true, target, record })
    }

    if (!body.fiscalYearId) {
      return NextResponse.json({ error: 'fiscalYearId is required when reopening a fiscal year.' }, { status: 400 })
    }

    const record = await AccountingCloseService.reopenFiscalYear({
      payload,
      fiscalYearId: body.fiscalYearId as number | string,
      userId: user.id,
      clearLockDate,
    })

    return NextResponse.json({ success: true, target, record })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
