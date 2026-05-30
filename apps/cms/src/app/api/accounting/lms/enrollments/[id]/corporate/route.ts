import { NextRequest, NextResponse } from 'next/server'
import { AccountingCorporateBillingService } from '@/accounting/services/corporate/AccountingCorporateBillingService'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../../_utils/auth'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const body = await request.json()
    const record = await AccountingCorporateBillingService.linkEnrollmentToCorporateAccount({
      payload,
      enrollmentId: params.id,
      corporateAccountId: body?.corporateAccountId,
      coverageType: body?.coverageType || 'full_company_pay',
      coveredAmount: body?.coveredAmount,
      traineeShareAmount: body?.traineeShareAmount,
      notes: body?.notes,
    })
    return NextResponse.json(record)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
