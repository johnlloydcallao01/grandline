import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import {
  AccountingApiError,
  handleAccountingApiError,
  parseNumberParam,
  requireAccountingAdmin,
} from '../../_utils/auth'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

const countBillsForVendor = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  vendorId: number | string,
) => {
  const usage = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.bills,
    where: {
      vendor: {
        equals: vendorId,
      },
    } as never,
    overrideAccess: true,
  })

  return Number(usage.totalDocs || 0)
}

const countPaymentsMadeForVendor = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  vendorId: number | string,
) => {
  const usage = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.paymentsMade,
    where: {
      vendor: {
        equals: vendorId,
      },
    } as never,
    overrideAccess: true,
  })

  return Number(usage.totalDocs || 0)
}

const countVendorCreditsForVendor = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  vendorId: number | string,
) => {
  const usage = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.vendorCredits,
    where: {
      vendor: {
        equals: vendorId,
      },
    } as never,
    overrideAccess: true,
  })

  return Number(usage.totalDocs || 0)
}

const countExpensesForVendor = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  vendorId: number | string,
) => {
  const usage = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.expenses,
    where: {
      vendor: {
        equals: vendorId,
      },
    } as never,
    overrideAccess: true,
  })

  return Number(usage.totalDocs || 0)
}

type VendorUsageSummary = {
  billCount: number
  paymentMadeCount: number
  vendorCreditCount: number
  expenseCount: number
  hasDependents: boolean
}

const computeVendorUsageSummary = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  vendorId: number | string,
): Promise<VendorUsageSummary> => {
  const [billCount, paymentMadeCount, vendorCreditCount, expenseCount] = await Promise.all([
    countBillsForVendor(payload, vendorId),
    countPaymentsMadeForVendor(payload, vendorId),
    countVendorCreditsForVendor(payload, vendorId),
    countExpensesForVendor(payload, vendorId),
  ])

  return {
    billCount,
    paymentMadeCount,
    vendorCreditCount,
    expenseCount,
    hasDependents: billCount > 0 || paymentMadeCount > 0 || vendorCreditCount > 0 || expenseCount > 0,
  }
}

const buildVendorDetailResponse = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  record: Record<string, unknown>,
) => {
  const usage = await computeVendorUsageSummary(payload, record.id as number | string)

  return {
    ...record,
    usageSummary: {
      billCount: usage.billCount,
      paymentMadeCount: usage.paymentMadeCount,
      vendorCreditCount: usage.vendorCreditCount,
      expenseCount: usage.expenseCount,
    },
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params

    const record = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.vendors,
      id: parseNumberParam(id) || id,
      depth: 1,
      overrideAccess: true,
    })

    return NextResponse.json(await buildVendorDetailResponse(payload, record as unknown as Record<string, unknown>))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const body = await request.json()

    const record = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.vendors,
      id: parseNumberParam(id) || id,
      depth: 1,
      overrideAccess: true,
      data: {
        ...body,
        updatedBy: user.id,
      },
    })

    return NextResponse.json(await buildVendorDetailResponse(payload, record as unknown as Record<string, unknown>))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const vendorId = parseNumberParam(id) || id

    const usage = await computeVendorUsageSummary(payload, vendorId)

    const barriers: string[] = []

    if (usage.billCount > 0) {
      barriers.push(`referenced by ${usage.billCount} bill(s)`)
    }

    if (usage.paymentMadeCount > 0) {
      barriers.push(`referenced by ${usage.paymentMadeCount} payment(s) made`)
    }

    if (usage.vendorCreditCount > 0) {
      barriers.push(`referenced by ${usage.vendorCreditCount} vendor credit(s)`)
    }

    if (usage.expenseCount > 0) {
      barriers.push(`referenced by ${usage.expenseCount} expense(s)`)
    }

    if (barriers.length > 0) {
      throw new AccountingApiError(
        `Cannot delete vendor: ${barriers.join(', ')}. Remove all references before deleting.`,
        409,
      )
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.vendors,
      id: vendorId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
