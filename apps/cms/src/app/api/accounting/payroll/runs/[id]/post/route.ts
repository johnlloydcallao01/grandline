import { NextRequest, NextResponse } from 'next/server'
import { AccountingPayrollService } from '@/accounting/services/payroll/AccountingPayrollService'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../../_utils/auth'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params
    const result = await AccountingPayrollService.postPayrollRun({
      payload,
      payrollRunId: params.id,
      userId: user.id,
    })
    return NextResponse.json(result)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
