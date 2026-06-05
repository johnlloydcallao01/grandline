import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import type { AccountingPeriodStatus } from '@/accounting/types/accounting'
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

type PeriodRecord = {
  id: number | string
  fiscalYear?:
    | { id: number | string; code?: string | null; name?: string | null }
    | number
    | string
    | null
  periodNumber?: number | null
  label?: string | null
  startDate?: string | null
  endDate?: string | null
  status?: string | null
  lockedFromDate?: string | null
  closedAt?: string | null
  closedBy?: unknown
  notes?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

const normalizePeriodMutationBody = (body: Record<string, unknown>) => {
  const label =
    typeof body.label === 'string'
      ? body.label.trim()
      : body.label === undefined
        ? undefined
        : String(body.label ?? '').trim()

  const notes =
    typeof body.notes === 'string'
      ? body.notes.trim() || null
      : (body.notes as string | null | undefined)

  const lockedFromDate =
    typeof body.lockedFromDate === 'string' && !body.lockedFromDate.trim()
      ? null
      : (body.lockedFromDate as string | null | undefined)

  return {
    ...(body.fiscalYear !== undefined ? { fiscalYear: body.fiscalYear as number | string } : {}),
    ...(body.periodNumber !== undefined
      ? { periodNumber: typeof body.periodNumber === 'number' ? body.periodNumber : Number(body.periodNumber) }
      : {}),
    ...(label !== undefined ? { label } : {}),
    ...(body.startDate !== undefined ? { startDate: typeof body.startDate === 'string' ? body.startDate : undefined } : {}),
    ...(body.endDate !== undefined ? { endDate: typeof body.endDate === 'string' ? body.endDate : undefined } : {}),
    ...(body.status !== undefined ? { status: (typeof body.status === 'string' ? body.status : 'draft') as AccountingPeriodStatus } : {}),
    ...(lockedFromDate !== undefined ? { lockedFromDate: lockedFromDate as string | null | undefined } : {}),
    ...(notes !== undefined ? { notes: notes as string | null | undefined } : {}),
    ...(body.createdBy !== undefined ? { createdBy: body.createdBy as number | undefined } : {}),
    ...(body.updatedBy !== undefined ? { updatedBy: body.updatedBy as number | undefined } : {}),
  }
}

const assertPeriodUpdatePayload = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  body: Record<string, unknown>,
) => {
  if ('label' in body) {
    const label = String(body.label || '').trim()

    if (!label) {
      throw new AccountingApiError('Period label is required.', 400)
    }
  }
}

const countJournalEntriesForPeriod = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  periodId: number | string,
) => {
  const usage = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
    where: {
      period: {
        equals: periodId,
      },
    } as never,
    overrideAccess: true,
  })

  return Number(usage.totalDocs || 0)
}

const countDepreciationEntriesForPeriod = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  periodId: number | string,
) => {
  const usage = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.depreciationEntries,
    where: {
      period: {
        equals: periodId,
      },
    } as never,
    overrideAccess: true,
  })

  return Number(usage.totalDocs || 0)
}

const countBudgetLinesForPeriod = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  periodId: number | string,
) => {
  const usage = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.budgetLines,
    where: {
      period: {
        equals: periodId,
      },
    } as never,
    overrideAccess: true,
  })

  return Number(usage.totalDocs || 0)
}

type PeriodUsageSummary = {
  journalEntryCount: number
  depreciationEntryCount: number
  budgetLineCount: number
  hasDependents: boolean
}

const computePeriodUsageSummary = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  periodId: number | string,
): Promise<PeriodUsageSummary> => {
  const [journalEntryCount, depreciationEntryCount, budgetLineCount] = await Promise.all([
    countJournalEntriesForPeriod(payload, periodId),
    countDepreciationEntriesForPeriod(payload, periodId),
    countBudgetLinesForPeriod(payload, periodId),
  ])

  return {
    journalEntryCount,
    depreciationEntryCount,
    budgetLineCount,
    hasDependents: journalEntryCount > 0 || depreciationEntryCount > 0 || budgetLineCount > 0,
  }
}

const buildPeriodDetailResponse = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  record: PeriodRecord,
) => {
  const usage = await computePeriodUsageSummary(payload, record.id)

  return {
    ...record,
    usageSummary: {
      journalEntryCount: usage.journalEntryCount,
      depreciationEntryCount: usage.depreciationEntryCount,
      budgetLineCount: usage.budgetLineCount,
    },
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params

    const record = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.periods,
      id: parseNumberParam(id) || id,
      depth: 1,
      overrideAccess: true,
    })) as PeriodRecord

    return NextResponse.json(await buildPeriodDetailResponse(payload, record))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const body = normalizePeriodMutationBody(await request.json())
    const currentId = parseNumberParam(id) || id

    await assertPeriodUpdatePayload(payload, body)

    const record = (await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.periods,
      id: currentId,
      depth: 1,
      overrideAccess: true,
      data: {
        ...body,
        updatedBy: user.id,
      } as never,
    })) as unknown as PeriodRecord

    return NextResponse.json(await buildPeriodDetailResponse(payload, record))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const periodId = parseNumberParam(id) || id

    const usage = await computePeriodUsageSummary(payload, periodId)

    const barriers: string[] = []

    if (usage.journalEntryCount > 0) {
      barriers.push(`referenced by ${usage.journalEntryCount} journal entry(ies)`)
    }

    if (usage.depreciationEntryCount > 0) {
      barriers.push(`referenced by ${usage.depreciationEntryCount} depreciation entry(ies)`)
    }

    if (usage.budgetLineCount > 0) {
      barriers.push(`referenced by ${usage.budgetLineCount} budget line(s)`)
    }

    if (barriers.length > 0) {
      throw new AccountingApiError(
        `Cannot delete period: ${barriers.join(', ')}. Remove all references before deleting.`,
        409,
      )
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.periods,
      id: periodId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
