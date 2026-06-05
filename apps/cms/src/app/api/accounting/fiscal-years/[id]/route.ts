import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import type { AccountingFiscalYearCloseMode, AccountingFiscalYearStatus } from '@/accounting/types/accounting'
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

type FiscalYearRecord = {
  id: number | string
  code?: string | null
  name?: string | null
  startDate?: string | null
  endDate?: string | null
  status?: string | null
  closeMode?: string | null
  lockedFromDate?: string | null
  closedAt?: string | null
  closedBy?: unknown
  notes?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

const normalizeFiscalYearMutationBody = (body: Record<string, unknown>) => {
  const code =
    typeof body.code === 'string'
      ? body.code.trim().toUpperCase()
      : body.code === undefined
        ? undefined
        : String(body.code ?? '').trim().toUpperCase()

  const name =
    typeof body.name === 'string'
      ? body.name.trim()
      : body.name === undefined
        ? undefined
        : String(body.name ?? '').trim()

  const notes =
    typeof body.notes === 'string'
      ? body.notes.trim() || null
      : (body.notes as string | null | undefined)

  const lockedFromDate =
    typeof body.lockedFromDate === 'string' && !body.lockedFromDate.trim()
      ? null
      : (body.lockedFromDate as string | null | undefined)

  return {
    ...(code !== undefined ? { code } : {}),
    ...(name !== undefined ? { name } : {}),
    ...(body.startDate !== undefined ? { startDate: typeof body.startDate === 'string' ? body.startDate : undefined } : {}),
    ...(body.endDate !== undefined ? { endDate: typeof body.endDate === 'string' ? body.endDate : undefined } : {}),
    ...(body.status !== undefined ? { status: (typeof body.status === 'string' ? body.status : 'draft') as AccountingFiscalYearStatus } : {}),
    ...(body.closeMode !== undefined ? { closeMode: (typeof body.closeMode === 'string' ? body.closeMode : 'manual') as AccountingFiscalYearCloseMode } : {}),
    ...(lockedFromDate !== undefined ? { lockedFromDate: lockedFromDate as string | null | undefined } : {}),
    ...(notes !== undefined ? { notes: notes as string | null | undefined } : {}),
    ...(body.createdBy !== undefined ? { createdBy: body.createdBy as number | undefined } : {}),
    ...(body.updatedBy !== undefined ? { updatedBy: body.updatedBy as number | undefined } : {}),
  }
}

const countPeriodsForFiscalYear = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  fiscalYearId: number | string,
) => {
  const usage = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.periods,
    where: {
      fiscalYear: {
        equals: fiscalYearId,
      },
    } as never,
    overrideAccess: true,
  })

  return Number(usage.totalDocs || 0)
}

const countBudgetsForFiscalYear = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  fiscalYearId: number | string,
) => {
  const usage = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.budgets,
    where: {
      fiscalYear: {
        equals: fiscalYearId,
      },
    } as never,
    overrideAccess: true,
  })

  return Number(usage.totalDocs || 0)
}

const countJournalEntriesForFiscalYear = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  fiscalYearId: number | string,
) => {
  const usage = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
    where: {
      fiscalYear: {
        equals: fiscalYearId,
      },
    } as never,
    overrideAccess: true,
  })

  return Number(usage.totalDocs || 0)
}

type FiscalYearUsageSummary = {
  periodCount: number
  budgetCount: number
  journalEntryCount: number
  hasPeriods: boolean
  hasDependents: boolean
}

const computeFiscalYearUsageSummary = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  fiscalYearId: number | string,
): Promise<FiscalYearUsageSummary> => {
  const [periodCount, budgetCount, journalEntryCount] = await Promise.all([
    countPeriodsForFiscalYear(payload, fiscalYearId),
    countBudgetsForFiscalYear(payload, fiscalYearId),
    countJournalEntriesForFiscalYear(payload, fiscalYearId),
  ])

  return {
    periodCount,
    budgetCount,
    journalEntryCount,
    hasPeriods: periodCount > 0,
    hasDependents: budgetCount > 0 || journalEntryCount > 0,
  }
}

const buildFiscalYearDetailResponse = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  record: FiscalYearRecord,
) => {
  const usage = await computeFiscalYearUsageSummary(payload, record.id)

  return {
    ...record,
    usageSummary: {
      periodCount: usage.periodCount,
      budgetCount: usage.budgetCount,
      journalEntryCount: usage.journalEntryCount,
      hasPeriods: usage.hasPeriods,
    },
    editPermissions: {
      canEdit: true,
      canEditStartDate: !usage.hasPeriods,
      canEditEndDate: !usage.hasPeriods,
      restrictionReason: usage.hasPeriods
        ? 'This fiscal year already has periods, so the date range cannot be changed.'
        : null,
    },
  }
}

const assertFiscalYearUpdatePayload = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  body: Record<string, unknown>,
  currentRecord: FiscalYearRecord,
) => {
  const currentId = currentRecord.id

  if ('code' in body) {
    const code = String(body.code || '').trim().toUpperCase()

    if (!code) {
      throw new AccountingApiError('Fiscal year code is required.', 400)
    }

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears,
      where: {
        code: {
          equals: code,
        },
      } as never,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (existing.docs[0] && String(existing.docs[0].id) !== String(currentId)) {
      throw new AccountingApiError(`Fiscal year code "${code}" already exists. Use a different code.`, 409)
    }
  }

  if ('name' in body) {
    const name = String(body.name || '').trim()

    if (!name) {
      throw new AccountingApiError('Fiscal year name is required.', 400)
    }
  }

  const periodCount = await countPeriodsForFiscalYear(payload, currentId)
  const hasPeriods = periodCount > 0

  if (!hasPeriods) {
    return
  }

  if (
    'startDate' in body &&
    String(body.startDate || '') !== String(currentRecord.startDate || '')
  ) {
    throw new AccountingApiError(
      'Fiscal year start date cannot be changed after periods have been created.',
      400,
    )
  }

  if (
    'endDate' in body &&
    String(body.endDate || '') !== String(currentRecord.endDate || '')
  ) {
    throw new AccountingApiError(
      'Fiscal year end date cannot be changed after periods have been created.',
      400,
    )
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params

    const record = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears,
      id: parseNumberParam(id) || id,
      depth: 1,
      overrideAccess: true,
    })) as FiscalYearRecord

    return NextResponse.json(await buildFiscalYearDetailResponse(payload, record))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const body = normalizeFiscalYearMutationBody(await request.json())
    const currentId = parseNumberParam(id) || id
    const currentRecord = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears,
      id: currentId,
      depth: 1,
      overrideAccess: true,
    })) as FiscalYearRecord
    await assertFiscalYearUpdatePayload(payload, body, currentRecord)

    const record = (await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears,
      id: currentId,
      depth: 1,
      overrideAccess: true,
      data: {
        ...body,
        updatedBy: user.id,
      } as never,
    })) as unknown as FiscalYearRecord

    return NextResponse.json(await buildFiscalYearDetailResponse(payload, record))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const fiscalYearId = parseNumberParam(id) || id

    const usage = await computeFiscalYearUsageSummary(payload, fiscalYearId)

    const barriers: string[] = []

    if (usage.periodCount > 0) {
      barriers.push(`has ${usage.periodCount} associated period(s)`)
    }

    if (usage.budgetCount > 0) {
      barriers.push(`has ${usage.budgetCount} budget reference(s)`)
    }

    if (usage.journalEntryCount > 0) {
      barriers.push(`has ${usage.journalEntryCount} journal entry reference(s)`)
    }

    if (barriers.length > 0) {
      throw new AccountingApiError(
        `Cannot delete fiscal year: ${barriers.join(', ')}. Remove all dependencies before deleting.`,
        409,
      )
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears,
      id: fiscalYearId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
