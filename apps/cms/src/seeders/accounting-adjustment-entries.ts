import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

async function seedAdjustmentEntries() {
  const payload = await getPayload({ config })

  console.log('[seed] Seeding Adjustment Entries...')

  // Get some valid accounts to use for lines
  const accountsRes = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
    limit: 10,
    overrideAccess: true,
  })

  if (accountsRes.docs.length < 2) {
    console.error('[seed] Not enough accounts found to create balanced entries. Run seed:journal-entry-lines first.')
    process.exit(1)
  }

  const account1 = accountsRes.docs[0].id
  const account2 = accountsRes.docs[1].id

  const sampleAdjustments = [
    {
      sourceReference: 'ADJ-NEW-001',
      referenceNumber: 'REF-001',
      memo: 'Accrual adjustment for end of month',
      status: 'draft',
      isBalanced: true,
      lines: [
        { debit: 1500, credit: 0, account: account1 },
        { debit: 0, credit: 1500, account: account2 },
      ]
    },
    {
      sourceReference: 'ADJ-NEW-002',
      referenceNumber: 'REF-002',
      memo: 'Unbalanced draft adjustment',
      status: 'draft',
      isBalanced: false,
      lines: [
        { debit: 2000, credit: 0, account: account1 },
        { debit: 0, credit: 1000, account: account2 },
      ]
    },
    {
      sourceReference: 'ADJ-NEW-003',
      referenceNumber: 'REF-003',
      memo: 'Posted adjustment entry',
      status: 'posted',
      isBalanced: true,
      lines: [
        { debit: 500, credit: 0, account: account1 },
        { debit: 0, credit: 500, account: account2 },
      ]
    },
    {
      sourceReference: 'ADJ-NEW-004',
      referenceNumber: 'REF-004',
      memo: 'Correction for prior period',
      status: 'draft',
      isBalanced: true,
      lines: [
        { debit: 3250, credit: 0, account: account1 },
        { debit: 0, credit: 3250, account: account2 },
      ]
    },
    {
      sourceReference: 'ADJ-NEW-005',
      referenceNumber: '',
      memo: 'Another unbalanced entry without reference',
      status: 'draft',
      isBalanced: false,
      lines: [
        { debit: 100, credit: 0, account: account1 },
      ]
    },
    {
      sourceReference: 'ADJ-NEW-006',
      referenceNumber: 'REF-006',
      memo: 'Large adjustment for annual reconciliation',
      status: 'posted',
      isBalanced: true,
      lines: [
        { debit: 15000, credit: 0, account: account1 },
        { debit: 0, credit: 15000, account: account2 },
      ]
    },
    {
      sourceReference: 'ADJ-NEW-007',
      referenceNumber: 'REF-007',
      memo: 'Tax adjustment',
      status: 'posted',
      isBalanced: true,
      lines: [
        { debit: 8000, credit: 0, account: account1 },
        { debit: 0, credit: 8000, account: account2 },
      ]
    },
    {
      sourceReference: 'ADJ-NEW-008',
      referenceNumber: 'REF-008',
      memo: 'Depreciation error correction',
      status: 'draft',
      isBalanced: false,
      lines: [
        { debit: 450, credit: 0, account: account1 },
      ]
    },
    {
      sourceReference: 'ADJ-NEW-009',
      referenceNumber: 'REF-009',
      memo: 'Inventory missing item adjustment',
      status: 'posted',
      isBalanced: true,
      lines: [
        { debit: 1200, credit: 0, account: account1 },
        { debit: 0, credit: 1200, account: account2 },
      ]
    },
    {
      sourceReference: 'ADJ-NEW-010',
      referenceNumber: 'REF-010',
      memo: 'Reclassification of expense',
      status: 'draft',
      isBalanced: true,
      lines: [
        { debit: 750, credit: 0, account: account1 },
        { debit: 0, credit: 750, account: account2 },
      ]
    },
    {
      sourceReference: 'ADJ-NEW-011',
      referenceNumber: 'REF-011',
      memo: 'Unbalanced draft for test',
      status: 'draft',
      isBalanced: false,
      lines: [
        { debit: 0, credit: 200, account: account2 },
      ]
    },
    {
      sourceReference: 'ADJ-NEW-012',
      referenceNumber: 'REF-012',
      memo: 'Year end adjustment 1',
      status: 'posted',
      isBalanced: true,
      lines: [
        { debit: 5000, credit: 0, account: account1 },
        { debit: 0, credit: 5000, account: account2 },
      ]
    },
    {
      sourceReference: 'ADJ-NEW-013',
      referenceNumber: 'REF-013',
      memo: 'Year end adjustment 2',
      status: 'draft',
      isBalanced: true,
      lines: [
        { debit: 2500, credit: 0, account: account1 },
        { debit: 0, credit: 2500, account: account2 },
      ]
    },
    {
      sourceReference: 'ADJ-NEW-014',
      referenceNumber: 'REF-014',
      memo: 'Write off bad debt',
      status: 'posted',
      isBalanced: true,
      lines: [
        { debit: 3400, credit: 0, account: account1 },
        { debit: 0, credit: 3400, account: account2 },
      ]
    },
    {
      sourceReference: 'ADJ-NEW-015',
      referenceNumber: 'REF-015',
      memo: 'Prepaid expense adjustment',
      status: 'draft',
      isBalanced: true,
      lines: [
        { debit: 600, credit: 0, account: account1 },
        { debit: 0, credit: 600, account: account2 },
      ]
    }
  ]

  let created = 0
  let updated = 0

  for (const entry of sampleAdjustments) {
    // Check if header exists
    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
      where: { sourceReference: { equals: entry.sourceReference } },
      overrideAccess: true,
      depth: 0,
      limit: 1,
    })

    const targetStatus = entry.status
    const headerData = {
      entryDate: new Date().toISOString(),
      postingDate: new Date().toISOString(),
      sourceType: 'adjustment',
      sourceReference: entry.sourceReference,
      memo: entry.memo,
      referenceNumber: entry.referenceNumber || null,
      status: 'draft',
      notes: `Generated by adjustment entries seeder`,
    } as never

    let journalEntryId: number | string
    let existingStatus = ''

    if (existing.docs.length > 0) {
      const existingEntry = existing.docs[0] as unknown as Record<string, unknown>
      journalEntryId = existingEntry.id as number | string
      existingStatus = String(existingEntry.status || '')
      if (['posted', 'reversed', 'voided'].includes(existingStatus)) {
        console.log(`[seed] Skipping ${entry.sourceReference}: status is ${existingStatus}`)
        continue
      }
      await payload.update({
        collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
        id: journalEntryId,
        overrideAccess: true,
        data: headerData,
      })
      updated++
    } else {
      const createdHeader = await payload.create({
        collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
        overrideAccess: true,
        data: headerData,
      })
      journalEntryId = createdHeader.id
      created++
    }

    // Clear existing lines for this journal entry if draft
    if (existingStatus !== 'posted' && existingStatus !== 'reversed' && existingStatus !== 'voided') {
      const existingLines = await payload.find({
        collection: ACCOUNTING_COLLECTION_SLUGS.journalEntryLines,
        where: { journalEntry: { equals: journalEntryId } },
        overrideAccess: true,
        limit: 100,
      })

      for (const line of existingLines.docs) {
        await payload.delete({
          collection: ACCOUNTING_COLLECTION_SLUGS.journalEntryLines,
          id: line.id,
          overrideAccess: true,
        })
      }

      // Create lines
      for (let i = 0; i < entry.lines.length; i++) {
        const line = entry.lines[i]
        await payload.create({
          collection: ACCOUNTING_COLLECTION_SLUGS.journalEntryLines,
          overrideAccess: true,
          data: {
            journalEntry: journalEntryId,
            lineNumber: i + 1,
            account: line.account,
            description: `Line ${i + 1} for ${entry.sourceReference}`,
            debit: line.debit,
            credit: line.credit,
          } as never,
        })
      }

      // If the target status is 'posted', update it now that lines exist
      if (targetStatus === 'posted') {
        await payload.update({
          collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
          id: journalEntryId,
          overrideAccess: true,
          data: {
            status: 'posted',
          } as never,
        })
      }
    }
  }

  console.log(`[seed] Done. Created: ${created}, Updated: ${updated}`)
  process.exit(0)
}

seedAdjustmentEntries().catch((error) => {
  console.error('[seed] Fatal error:', error)
  process.exit(1)
})
