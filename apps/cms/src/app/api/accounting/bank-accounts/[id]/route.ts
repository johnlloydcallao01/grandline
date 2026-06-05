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

const countBankTransactionsForAccount = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  accountId: number | string,
) => {
  const usage = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.bankTransactions,
    where: {
      bankAccount: {
        equals: accountId,
      },
    } as never,
    overrideAccess: true,
  })

  return Number(usage.totalDocs || 0)
}

const countBankReconciliationsForAccount = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  accountId: number | string,
) => {
  const usage = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.bankReconciliations,
    where: {
      bankAccount: {
        equals: accountId,
      },
    } as never,
    overrideAccess: true,
  })

  return Number(usage.totalDocs || 0)
}

const countPaymentsMadeForAccount = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  accountId: number | string,
) => {
  const usage = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.paymentsMade,
    where: {
      bankAccount: {
        equals: accountId,
      },
    } as never,
    overrideAccess: true,
  })

  return Number(usage.totalDocs || 0)
}

const countPaymentsReceivedForAccount = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  accountId: number | string,
) => {
  const usage = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
    where: {
      depositAccount: {
        equals: accountId,
      },
    } as never,
    overrideAccess: true,
  })

  return Number(usage.totalDocs || 0)
}

const countDepositsForAccount = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  accountId: number | string,
) => {
  const usage = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.deposits,
    where: {
      bankAccount: {
        equals: accountId,
      },
    } as never,
    overrideAccess: true,
  })

  return Number(usage.totalDocs || 0)
}

type BankAccountUsageSummary = {
  bankTransactionCount: number
  bankReconciliationCount: number
  paymentMadeCount: number
  paymentReceivedCount: number
  depositCount: number
  hasDependents: boolean
}

const computeBankAccountUsageSummary = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  accountId: number | string,
): Promise<BankAccountUsageSummary> => {
  const [bankTransactionCount, bankReconciliationCount, paymentMadeCount, paymentReceivedCount, depositCount] =
    await Promise.all([
      countBankTransactionsForAccount(payload, accountId),
      countBankReconciliationsForAccount(payload, accountId),
      countPaymentsMadeForAccount(payload, accountId),
      countPaymentsReceivedForAccount(payload, accountId),
      countDepositsForAccount(payload, accountId),
    ])

  return {
    bankTransactionCount,
    bankReconciliationCount,
    paymentMadeCount,
    paymentReceivedCount,
    depositCount,
    hasDependents:
      bankTransactionCount > 0 ||
      bankReconciliationCount > 0 ||
      paymentMadeCount > 0 ||
      paymentReceivedCount > 0 ||
      depositCount > 0,
  }
}

const buildBankAccountDetailResponse = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  record: Record<string, unknown>,
) => {
  const usage = await computeBankAccountUsageSummary(payload, record.id as number | string)

  return {
    ...record,
    usageSummary: {
      bankTransactionCount: usage.bankTransactionCount,
      bankReconciliationCount: usage.bankReconciliationCount,
      paymentMadeCount: usage.paymentMadeCount,
      paymentReceivedCount: usage.paymentReceivedCount,
      depositCount: usage.depositCount,
    },
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params

    const record = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts,
      id: parseNumberParam(id) || id,
      depth: 1,
      overrideAccess: true,
    })

    return NextResponse.json(await buildBankAccountDetailResponse(payload, record as unknown as Record<string, unknown>))
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
      collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts,
      id: parseNumberParam(id) || id,
      depth: 1,
      overrideAccess: true,
      data: {
        ...body,
        updatedBy: user.id,
      },
    })

    return NextResponse.json(await buildBankAccountDetailResponse(payload, record as unknown as Record<string, unknown>))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const accountId = parseNumberParam(id) || id

    const usage = await computeBankAccountUsageSummary(payload, accountId)

    const barriers: string[] = []

    if (usage.bankTransactionCount > 0) {
      barriers.push(`referenced by ${usage.bankTransactionCount} bank transaction(s)`)
    }

    if (usage.bankReconciliationCount > 0) {
      barriers.push(`referenced by ${usage.bankReconciliationCount} bank reconciliation(s)`)
    }

    if (usage.paymentMadeCount > 0) {
      barriers.push(`referenced by ${usage.paymentMadeCount} payment(s) made`)
    }

    if (usage.paymentReceivedCount > 0) {
      barriers.push(`referenced by ${usage.paymentReceivedCount} payment(s) received`)
    }

    if (usage.depositCount > 0) {
      barriers.push(`referenced by ${usage.depositCount} deposit(s)`)
    }

    if (barriers.length > 0) {
      throw new AccountingApiError(
        `Cannot delete bank account: ${barriers.join(', ')}. Remove all references before deleting.`,
        409,
      )
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts,
      id: accountId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
