import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { parseNumberParam, handleAccountingApiError, requireAccountingAdmin, AccountingApiError } from '../../../../_utils/auth'
import {
  assertBankFeedMutationPayload,
  buildBankFeedDetailResponse,
  buildBankFeedPersistenceData,
  normalizeBankFeedMutationBody,
  type BankFeedDoc,
} from '../_shared'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const record = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankFeeds,
      id: parseNumberParam(params.id) || params.id,
      depth: 2,
      overrideAccess: true,
    })) as BankFeedDoc

    return NextResponse.json(await buildBankFeedDetailResponse(payload, record))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params
    const bankFeedId = parseNumberParam(params.id) || params.id
    const currentRecord = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankFeeds,
      id: bankFeedId,
      depth: 2,
      overrideAccess: true,
    })) as BankFeedDoc

    const body = normalizeBankFeedMutationBody((await request.json()) as Record<string, unknown>)
    await assertBankFeedMutationPayload(
      payload,
      {
        feedReference: body.feedReference ?? currentRecord.feedReference ?? null,
        bankAccount:
          body.bankAccount ??
          (typeof currentRecord.bankAccount === 'object' && currentRecord.bankAccount
            ? currentRecord.bankAccount.id ?? null
            : currentRecord.bankAccount ?? null),
        connectorType: body.connectorType ?? currentRecord.connectorType ?? 'direct_api',
        connectorName: body.connectorName ?? currentRecord.connectorName ?? null,
        providerReference: body.providerReference ?? currentRecord.providerReference ?? null,
        externalAccountId: body.externalAccountId ?? currentRecord.externalAccountId ?? null,
        connectionStatus: body.connectionStatus ?? currentRecord.connectionStatus ?? 'connected',
        healthStatus: body.healthStatus ?? currentRecord.healthStatus ?? 'healthy',
        syncFrequency: body.syncFrequency ?? currentRecord.syncFrequency ?? 'hourly',
        lastSyncAt: body.lastSyncAt ?? currentRecord.lastSyncAt ?? null,
        lastSuccessfulSyncAt: body.lastSuccessfulSyncAt ?? currentRecord.lastSuccessfulSyncAt ?? null,
        lastAttemptedSyncAt: body.lastAttemptedSyncAt ?? currentRecord.lastAttemptedSyncAt ?? null,
        nextScheduledSyncAt: body.nextScheduledSyncAt ?? currentRecord.nextScheduledSyncAt ?? null,
        lastImportedRowCount: body.lastImportedRowCount ?? currentRecord.lastImportedRowCount ?? 0,
        lastImportedTransactionCount:
          body.lastImportedTransactionCount ?? currentRecord.lastImportedTransactionCount ?? 0,
        feedRuleSetName: body.feedRuleSetName ?? currentRecord.feedRuleSetName ?? null,
        feedRuleCount: body.feedRuleCount ?? currentRecord.feedRuleCount ?? 0,
        autoPostRuleCount: body.autoPostRuleCount ?? currentRecord.autoPostRuleCount ?? 0,
        manualReviewRuleCount: body.manualReviewRuleCount ?? currentRecord.manualReviewRuleCount ?? 0,
        lastRuleChangeAt: body.lastRuleChangeAt ?? currentRecord.lastRuleChangeAt ?? null,
        syncDelayMinutes: body.syncDelayMinutes ?? currentRecord.syncDelayMinutes ?? 0,
        averageSyncLatencySeconds:
          body.averageSyncLatencySeconds ?? currentRecord.averageSyncLatencySeconds ?? 0,
        tokenExpiresAt: body.tokenExpiresAt ?? currentRecord.tokenExpiresAt ?? null,
        needsReconnection: body.needsReconnection ?? currentRecord.needsReconnection ?? false,
        disconnectReason: body.disconnectReason ?? currentRecord.disconnectReason ?? null,
        lastErrorSummary: body.lastErrorSummary ?? currentRecord.lastErrorSummary ?? null,
        notes: body.notes ?? currentRecord.notes ?? null,
        metadata: body.metadata ?? currentRecord.metadata ?? null,
      },
      bankFeedId,
    )

    const updatedRecord = (await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankFeeds,
      id: bankFeedId,
      overrideAccess: true,
      depth: 2,
      data: {
        ...buildBankFeedPersistenceData(body),
        updatedBy: user.id,
      } as never,
    })) as BankFeedDoc

    return NextResponse.json(await buildBankFeedDetailResponse(payload, updatedRecord))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const bankFeedId = parseNumberParam(params.id) || params.id
    const currentRecord = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankFeeds,
      id: bankFeedId,
      depth: 0,
      overrideAccess: true,
    })) as BankFeedDoc

    if (String(currentRecord.connectionStatus || '') !== 'disconnected') {
      throw new AccountingApiError('Disconnect the bank feed before deleting the connection record.', 400)
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankFeeds,
      id: bankFeedId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
