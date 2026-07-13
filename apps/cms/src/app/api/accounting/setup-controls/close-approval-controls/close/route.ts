import { NextRequest, NextResponse } from 'next/server'
import { AccountingCloseService } from '@/accounting/services/periods/AccountingCloseService'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body: Record<string, unknown> = await request.json()
    const target = AccountingCloseService.parseCloseTarget(body.target)
    const lockedFromDate = typeof body.lockedFromDate === 'string' ? body.lockedFromDate : undefined

    if (target === 'period') {
      if (!body.periodId) {
        return NextResponse.json({ error: 'periodId is required when closing a period.' }, { status: 400 })
      }
      const record = await AccountingCloseService.closePeriod({
        payload,
        periodId: body.periodId as number | string,
        userId: user.id,
        lockedFromDate,
      })
      return NextResponse.json({ success: true, target, record })
    }

    if (!body.fiscalYearId) {
      return NextResponse.json({ error: 'fiscalYearId is required when closing a fiscal year.' }, { status: 400 })
    }

    const record = await AccountingCloseService.closeFiscalYear({
      payload,
      fiscalYearId: body.fiscalYearId as number | string,
      userId: user.id,
      lockedFromDate,
    })

    return NextResponse.json({ success: true, target, record })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
