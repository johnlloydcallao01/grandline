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
  const r = record as Record<string, unknown>
  const cust = r.defaultCustomer as unknown as Record<string, unknown> | undefined
  return {
    id: String(r.id),
    sponsorCode: String(r.sponsorCode || ''),
    name: String(r.name || ''),
    defaultCustomer: cust ? String(cust.id ?? cust) : '',
    defaultCustomerLabel: cust ? String(cust.displayName || cust.customerCode || `Customer #${cust.id}`) : '-',
    contactName: String(r.contactName || ''),
    email: String(r.email || ''),
    phone: String(r.phone || ''),
    billingAddress: String(r.billingAddress || ''),
    status: String(r.status || 'active'),
    notes: String(r.notes || ''),
    createdAt: r.createdAt ? String(r.createdAt) : null,
    updatedAt: r.updatedAt ? String(r.updatedAt) : null,
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

    const toId = (v: unknown): number | null => {
      if (v === null || v === undefined) return null
      const n = Number(v)
      return Number.isFinite(n) && n > 0 ? n : null
    }

    const data: Record<string, unknown> = { updatedBy: user.id }
    if (body.sponsorCode !== undefined) data.sponsorCode = String(body.sponsorCode || '').trim() || undefined
    if (body.name !== undefined) data.name = String(body.name || '').trim()
    if (body.contactName !== undefined) data.contactName = String(body.contactName || '').trim() || undefined
    if (body.email !== undefined) data.email = String(body.email || '').trim() || undefined
    if (body.phone !== undefined) data.phone = String(body.phone || '').trim() || undefined
    if (body.billingAddress !== undefined) data.billingAddress = String(body.billingAddress || '').trim() || undefined
    if (body.status !== undefined) data.status = String(body.status || 'active')
    if (body.notes !== undefined) data.notes = String(body.notes || '').trim() || undefined
    if (body.defaultCustomer !== undefined) data.defaultCustomer = toId(body.defaultCustomer)

    const record = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.scholarshipSponsors,
      id: parseNumberParam(id) || id,
      depth: 2,
      overrideAccess: true,
      data: data as never,
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
