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

const countCorporateBillingLinksForAccount = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  accountId: number | string,
) => {
  const usage = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.corporateBillingLinks,
    where: {
      corporateAccount: {
        equals: accountId,
      },
    } as never,
    overrideAccess: true,
  })
  return Number(usage.totalDocs || 0)
}

const computeAccountUsageSummary = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  accountId: number | string,
) => {
  const [corporateBillingLinkCount] = await Promise.all([
    countCorporateBillingLinksForAccount(payload, accountId),
  ])
  return {
    corporateBillingLinkCount,
    hasDependents: corporateBillingLinkCount > 0,
  }
}

const buildDetailResponse = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  record: Record<string, unknown>,
) => {
  const usage = await computeAccountUsageSummary(payload, record.id as number | string)
  return {
    ...record,
    usageSummary: {
      corporateBillingLinkCount: usage.corporateBillingLinkCount,
    },
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params

    const record = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.corporateAccounts,
      id: parseNumberParam(id) || id,
      depth: 1,
      overrideAccess: true,
    })

    return NextResponse.json(await buildDetailResponse(payload, record as unknown as Record<string, unknown>))
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
      collection: ACCOUNTING_COLLECTION_SLUGS.corporateAccounts,
      id: parseNumberParam(id) || id,
      depth: 1,
      overrideAccess: true,
      data: {
        ...body,
        updatedBy: user.id,
      },
    })

    return NextResponse.json(await buildDetailResponse(payload, record as unknown as Record<string, unknown>))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const accountId = parseNumberParam(id) || id

    const usage = await computeAccountUsageSummary(payload, accountId)

    if (usage.corporateBillingLinkCount > 0) {
      throw new AccountingApiError(
        `Cannot delete corporate account: referenced by ${usage.corporateBillingLinkCount} corporate billing link(s). Remove all references before deleting.`,
        409,
      )
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.corporateAccounts,
      id: accountId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
