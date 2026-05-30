import type { Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'

type AuditAction = 'created' | 'updated' | 'submitted' | 'approved' | 'posted' | 'reversed' | 'voided' | 'exported'

export class AccountingAuditService {
  static toJsonValue(value: unknown) {
    if (value === null || value === undefined) return undefined
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value
    if (Array.isArray(value)) return value as unknown[]
    if (typeof value === 'object') return value as Record<string, unknown>
    return String(value)
  }

  static async logAction({
    payload,
    entityType,
    entityId,
    actionType,
    performedBy,
    beforeData,
    afterData,
    reason,
    metadata,
  }: {
    payload: Payload
    entityType: string
    entityId: number | string
    actionType: AuditAction
    performedBy?: number | string | null
    beforeData?: unknown
    afterData?: unknown
    reason?: string | null
    metadata?: Record<string, unknown> | null
  }) {
    try {
      await payload.create({
        collection: ACCOUNTING_COLLECTION_SLUGS.auditLogs,
        overrideAccess: true,
        depth: 0,
        data: {
          entityType: entityType as any,
          entityId: String(entityId),
          actionType,
          performedBy: typeof performedBy === 'number' ? performedBy : performedBy ? Number(performedBy) : undefined,
          performedAt: new Date().toISOString(),
          beforeData: this.toJsonValue(beforeData) as any,
          afterData: this.toJsonValue(afterData) as any,
          reason: reason || undefined,
          metadata: metadata || undefined,
        },
      })
    } catch (_error) {
      // Audit logging must not break the primary finance workflow.
    }
  }
}
