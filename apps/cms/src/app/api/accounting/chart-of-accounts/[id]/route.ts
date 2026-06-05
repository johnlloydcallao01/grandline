import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import type { AccountingAccountSubType, AccountingAccountType, AccountingNormalBalance } from '@/accounting/types/accounting'
import {
  AccountingApiError,
  handleAccountingApiError,
  parseNumberParam,
  requireAccountingAdmin,
} from '../../_utils/auth'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

type ChartOfAccountRecord = {
  id: number | string
  code?: string | null
  name?: string | null
  accountType?: string | null
  accountSubType?: string | null
  normalBalance?: string | null
  isActive?: boolean | null
  allowManualEntries?: boolean | null
  isControlAccount?: boolean | null
  isRetainedEarnings?: boolean | null
  isSuspenseAccount?: boolean | null
  description?: string | null
  sortOrder?: number | null
  createdAt?: string | null
  updatedAt?: string | null
  parentAccount?: unknown
}

const normalizeChartOfAccountsMutationBody = (body: Record<string, unknown>) => {
  const rawParentAccount =
    typeof body.parentAccount === 'string'
      ? body.parentAccount.trim()
      : body.parentAccount === null || body.parentAccount === undefined
        ? null
        : body.parentAccount

  const parentAccount =
    rawParentAccount === null || rawParentAccount === ''
      ? null
      : typeof rawParentAccount === 'string'
        ? parseNumberParam(rawParentAccount) ?? rawParentAccount
        : rawParentAccount

  const description =
    typeof body.description === 'string' ? body.description.trim() || null : (body.description as string | null | undefined)

  const sortOrder =
    typeof body.sortOrder === 'string'
      ? Number.isFinite(Number(body.sortOrder))
        ? Number(body.sortOrder)
        : 0
      : typeof body.sortOrder === 'number'
        ? body.sortOrder
        : undefined

  const accountSubType =
    typeof body.accountSubType === 'string' && !body.accountSubType.trim()
      ? null
      : (body.accountSubType as string | null | undefined)

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

  return {
    ...(code !== undefined ? { code } : {}),
    ...(name !== undefined ? { name } : {}),
    ...(body.accountType !== undefined ? { accountType: (typeof body.accountType === 'string' ? body.accountType : null) as AccountingAccountType | null } : {}),
    ...(accountSubType !== undefined ? { accountSubType: accountSubType as AccountingAccountSubType | null } : {}),
    ...(body.normalBalance !== undefined ? { normalBalance: (typeof body.normalBalance === 'string' ? body.normalBalance : null) as AccountingNormalBalance | null } : {}),
    ...(parentAccount !== undefined ? { parentAccount } : {}),
    ...(body.isActive !== undefined ? { isActive: body.isActive === true } : {}),
    ...(body.allowManualEntries !== undefined ? { allowManualEntries: body.allowManualEntries !== false } : {}),
    ...(body.isControlAccount !== undefined ? { isControlAccount: body.isControlAccount === true } : {}),
    ...(body.isRetainedEarnings !== undefined ? { isRetainedEarnings: body.isRetainedEarnings === true } : {}),
    ...(body.isSuspenseAccount !== undefined ? { isSuspenseAccount: body.isSuspenseAccount === true } : {}),
    ...(description !== undefined ? { description: description as string | null } : {}),
    ...(sortOrder !== undefined ? { sortOrder } : {}),
    ...(body.createdBy !== undefined ? { createdBy: body.createdBy as number | undefined } : {}),
    ...(body.updatedBy !== undefined ? { updatedBy: body.updatedBy as number | undefined } : {}),
  }
}

const countJournalLineUsage = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  accountId: number | string,
) => {
  const usage = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.journalEntryLines,
    where: {
      account: {
        equals: accountId,
      },
    } as never,
    overrideAccess: true,
  })

  return Number(usage.totalDocs || 0)
}

const countChildAccounts = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  accountId: number | string,
) => {
  const usage = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
    where: {
      parentAccount: {
        equals: accountId,
      },
    } as never,
    overrideAccess: true,
  })

  return Number(usage.totalDocs || 0)
}

const countTaxCodeReferences = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  accountId: number | string,
) => {
  const purchaseUsage = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.taxCodes,
    where: {
      purchaseAccount: {
        equals: accountId,
      },
    } as never,
    overrideAccess: true,
  })

  const salesUsage = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.taxCodes,
    where: {
      salesAccount: {
        equals: accountId,
      },
    } as never,
    overrideAccess: true,
  })

  return Number(purchaseUsage.totalDocs || 0) + Number(salesUsage.totalDocs || 0)
}

type ChartOfAccountUsageSummary = {
  journalLineCount: number
  childAccountCount: number
  taxCodeCount: number
  hasDependents: boolean
  hasJournalActivity: boolean
}

const computeUsageSummary = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  accountId: number | string,
): Promise<ChartOfAccountUsageSummary> => {
  const [journalLineCount, childAccountCount, taxCodeCount] = await Promise.all([
    countJournalLineUsage(payload, accountId),
    countChildAccounts(payload, accountId),
    countTaxCodeReferences(payload, accountId),
  ])

  return {
    journalLineCount,
    childAccountCount,
    taxCodeCount,
    hasDependents: childAccountCount > 0 || taxCodeCount > 0,
    hasJournalActivity: journalLineCount > 0,
  }
}

const buildChartOfAccountDetailResponse = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  record: ChartOfAccountRecord,
) => {
  const usage = await computeUsageSummary(payload, record.id)

  return {
    ...record,
    usageSummary: {
      journalLineCount: usage.journalLineCount,
      childAccountCount: usage.childAccountCount,
      taxCodeCount: usage.taxCodeCount,
      hasTransactions: usage.hasJournalActivity,
    },
    editPermissions: {
      canEdit: true,
      canEditAccountType: !usage.hasJournalActivity,
      canEditNormalBalance: !usage.hasJournalActivity,
      canEditParentAccount: !usage.hasJournalActivity,
      restrictionReason: usage.hasJournalActivity
        ? 'This account already has journal activity, so account type, normal balance, and parent account are locked.'
        : null,
    },
  }
}

const assertChartOfAccountsUpdatePayload = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  body: Record<string, unknown>,
  currentRecord: ChartOfAccountRecord,
) => {
  const currentId = currentRecord.id

  if ('code' in body) {
    const code = String(body.code || '').trim().toUpperCase()

    if (!code) {
      throw new AccountingApiError('Account code is required.', 400)
    }

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
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
      throw new AccountingApiError(`Account code "${code}" already exists. Use a different code.`, 409)
    }
  }

  if ('name' in body) {
    const name = String(body.name || '').trim()

    if (!name) {
      throw new AccountingApiError('Account name is required.', 400)
    }
  }

  const journalLineCount = await countJournalLineUsage(payload, currentId)
  const hasTransactions = journalLineCount > 0

  if (!hasTransactions) {
    return
  }

  if (
    'accountType' in body &&
    String(body.accountType || '') !== String(currentRecord.accountType || '')
  ) {
    throw new AccountingApiError(
      'Account type cannot be changed after the account has journal activity.',
      400,
    )
  }

  if (
    'normalBalance' in body &&
    String(body.normalBalance || '') !== String(currentRecord.normalBalance || '')
  ) {
    throw new AccountingApiError(
      'Normal balance cannot be changed after the account has journal activity.',
      400,
    )
  }

  if (
    'parentAccount' in body &&
    String(getRelationshipId(body.parentAccount) || '') !==
      String(getRelationshipId(currentRecord.parentAccount) || '')
  ) {
    throw new AccountingApiError(
      'Parent account cannot be changed after the account has journal activity.',
      400,
    )
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params

    const record = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
      id: parseNumberParam(id) || id,
      depth: 1,
      overrideAccess: true,
    })) as ChartOfAccountRecord

    return NextResponse.json(await buildChartOfAccountDetailResponse(payload, record))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const body = normalizeChartOfAccountsMutationBody(await request.json())
    const currentId = parseNumberParam(id) || id
    const currentRecord = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
      id: currentId,
      depth: 1,
      overrideAccess: true,
    })) as ChartOfAccountRecord
    await assertChartOfAccountsUpdatePayload(payload, body, currentRecord)

    const record = (await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
      id: currentId,
      depth: 1,
      overrideAccess: true,
      data: {
        ...body,
        updatedBy: user.id,
      } as never,
    })) as unknown as ChartOfAccountRecord

    return NextResponse.json(await buildChartOfAccountDetailResponse(payload, record))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const accountId = parseNumberParam(id) || id

    const usage = await computeUsageSummary(payload, accountId)

    const barriers: string[] = []

    if (usage.journalLineCount > 0) {
      barriers.push(`used in ${usage.journalLineCount} journal entry line(s)`)
    }

    if (usage.childAccountCount > 0) {
      barriers.push(`has ${usage.childAccountCount} child account(s)`)
    }

    if (usage.taxCodeCount > 0) {
      barriers.push(`referenced by ${usage.taxCodeCount} tax code(s)`)
    }

    if (barriers.length > 0) {
      throw new AccountingApiError(
        `Cannot delete account: ${barriers.join(', ')}. Remove all dependencies before deleting.`,
        409,
      )
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
      id: accountId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
