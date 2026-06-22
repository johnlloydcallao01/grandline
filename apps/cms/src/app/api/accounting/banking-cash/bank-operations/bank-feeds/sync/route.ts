import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../../_utils/auth'
import { type BankFeedDoc } from '../_shared'

const addInterval = (date: Date, frequency: string) => {
  const next = new Date(date)
  if (frequency === 'daily') {
    next.setUTCDate(next.getUTCDate() + 1)
    return next
  }
  if (frequency === 'manual') return null
  next.setUTCHours(next.getUTCHours() + 1)
  return next
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = ((await request.json().catch(() => ({}))) || {}) as { ids?: Array<string | number> }
    const requestedIds = Array.isArray(body.ids)
      ? Array.from(new Set(body.ids.map((value) => String(value || '').trim()).filter(Boolean)))
      : []

    if (requestedIds.length === 0) {
      return NextResponse.json({ success: true, syncedCount: 0, skippedCount: 0 })
    }

    let syncedCount = 0
    let skippedCount = 0
    const now = new Date()

    for (const id of requestedIds) {
      const currentRecord = (await payload.findByID({
        collection: ACCOUNTING_COLLECTION_SLUGS.bankFeeds,
        id,
        depth: 0,
        overrideAccess: true,
      })) as BankFeedDoc

      const connectionStatus = String(currentRecord.connectionStatus || '')
      if (connectionStatus === 'disconnected' || currentRecord.needsReconnection) {
        skippedCount += 1
        continue
      }

      const nextScheduled = addInterval(now, String(currentRecord.syncFrequency || 'hourly'))

      await payload.update({
        collection: ACCOUNTING_COLLECTION_SLUGS.bankFeeds,
        id,
        overrideAccess: true,
        depth: 0,
        data: {
          connectionStatus: 'connected',
          healthStatus: 'healthy',
          lastAttemptedSyncAt: now.toISOString(),
          lastSuccessfulSyncAt: now.toISOString(),
          lastSyncAt: now.toISOString(),
          nextScheduledSyncAt: nextScheduled ? nextScheduled.toISOString() : null,
          syncDelayMinutes: 0,
          lastErrorSummary: null,
          updatedBy: user.id,
        } as never,
      })

      syncedCount += 1
    }

    return NextResponse.json({ success: true, syncedCount, skippedCount })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
