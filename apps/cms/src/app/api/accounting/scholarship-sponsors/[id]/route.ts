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

const countScholarshipAwardsForSponsor = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  sponsorId: number | string,
) => {
  const usage = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.scholarshipAwards,
    where: {
      scholarshipSponsor: {
        equals: sponsorId,
      },
    } as never,
    overrideAccess: true,
  })
  return Number(usage.totalDocs || 0)
}

const computeSponsorUsageSummary = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  sponsorId: number | string,
) => {
  const [scholarshipAwardCount] = await Promise.all([
    countScholarshipAwardsForSponsor(payload, sponsorId),
  ])
  return {
    scholarshipAwardCount,
    hasDependents: scholarshipAwardCount > 0,
  }
}

const buildDetailResponse = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  record: Record<string, unknown>,
) => {
  const usage = await computeSponsorUsageSummary(payload, record.id as number | string)
  return {
    ...record,
    usageSummary: {
      scholarshipAwardCount: usage.scholarshipAwardCount,
    },
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params

    const record = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.scholarshipSponsors,
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
      collection: ACCOUNTING_COLLECTION_SLUGS.scholarshipSponsors,
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
    const sponsorId = parseNumberParam(id) || id

    const usage = await computeSponsorUsageSummary(payload, sponsorId)

    if (usage.scholarshipAwardCount > 0) {
      throw new AccountingApiError(
        `Cannot delete scholarship sponsor: referenced by ${usage.scholarshipAwardCount} scholarship award(s). Remove all references before deleting.`,
        409,
      )
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.scholarshipSponsors,
      id: sponsorId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
