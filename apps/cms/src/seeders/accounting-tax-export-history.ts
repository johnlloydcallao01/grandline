import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

async function seedTaxExportLogs() {
  const payload = await getPayload({ config })
  console.log('[seed] Seeding 5 tax export audit logs...')

  for (let i = 1; i <= 5; i++) {
    const performedAt = new Date(Date.now() - i * 1000 * 60 * 60 * 24).toISOString() // Past days
    await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.auditLogs,
      data: {
        entityType: 'audit_log' as any,
        entityId: `tax-export-${Date.now()}-${i}`,
        actionType: 'exported',
        performedAt,
        reason: `Monthly tax compliance export for period ${i}`,
        metadata: {
          reportType: 'Tax Summary Report',
          format: 'CSV',
          filtersApplied: { scopes: ['sales', 'purchase'] }
        }
      } as never,
      overrideAccess: true,
    })
  }

  console.log('[seed] Successfully created 5 tax export audit logs.')
  process.exit(0)
}

seedTaxExportLogs().catch((error) => {
  console.error('[seed] Fatal error:', error)
  process.exit(1)
})
