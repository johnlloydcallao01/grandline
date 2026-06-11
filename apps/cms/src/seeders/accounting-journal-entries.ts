import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

type SeedJournalEntry = {
  entryDate: string
  postingDate: string
  sourceType: 'manual' | 'opening_balance' | 'adjustment' | 'reversal' | 'system'
  sourceReference: string | null
  memo: string | null
  referenceNumber: string | null
  notes: string | null
}

const sampleEntries: SeedJournalEntry[] = [
  {
    entryDate: '2026-01-02',
    postingDate: '2026-01-02',
    sourceType: 'opening_balance',
    sourceReference: 'OB-2026',
    memo: 'Opening balance entry for fiscal year 2026',
    referenceNumber: 'OPENING-2026-001',
    notes: 'System-generated opening balances for all asset, liability, and equity accounts.',
  },
  {
    entryDate: '2026-01-15',
    postingDate: '2026-01-15',
    sourceType: 'manual',
    sourceReference: 'MEM-2026-001',
    memo: 'Initial capitalization entry',
    referenceNumber: 'CAP-2026-001',
    notes: 'Founder capital contribution recorded.',
  },
  {
    entryDate: '2026-01-31',
    postingDate: '2026-01-31',
    sourceType: 'system',
    sourceReference: 'INV-BATCH-2026-01',
    memo: 'January 2026 invoice posting batch',
    referenceNumber: 'SYS-INV-2026-001',
    notes: 'Batch posting of all January sales invoices.',
  },
  {
    entryDate: '2026-02-15',
    postingDate: '2026-02-15',
    sourceType: 'manual',
    sourceReference: 'MEM-2026-002',
    memo: 'Equipment purchase - Office furniture',
    referenceNumber: 'PUR-2026-001',
    notes: 'Purchase of office furniture and fixtures for the Makati HQ.',
  },
  {
    entryDate: '2026-02-28',
    postingDate: '2026-02-28',
    sourceType: 'system',
    sourceReference: 'BILL-BATCH-2026-02',
    memo: 'February 2026 bill posting batch',
    referenceNumber: 'SYS-BILL-2026-001',
    notes: 'Batch posting of February vendor bills.',
  },
  {
    entryDate: '2026-03-10',
    postingDate: '2026-03-10',
    sourceType: 'adjustment',
    sourceReference: 'ADJ-2026-001',
    memo: 'Correction: Misclassified rent expense',
    referenceNumber: 'ADJ-RENT-2026',
    notes: 'Reclassified rent expense from administrative to operating expense.',
  },
  {
    entryDate: '2026-03-25',
    postingDate: '2026-03-25',
    sourceType: 'manual',
    sourceReference: 'MEM-2026-003',
    memo: 'Quarterly tax accrual - Q1 2026',
    referenceNumber: 'TAX-Q1-2026',
    notes: 'Estimated income tax accrual for the first quarter.',
  },
  {
    entryDate: '2026-04-01',
    postingDate: '2026-04-01',
    sourceType: 'reversal',
    sourceReference: 'REV-2026-001',
    memo: 'Reversal of JE-2026-003 (Rent correction)',
    referenceNumber: 'REV-RENT-2026',
    notes: 'Reversal of the March rent correction entry due to updated lease terms.',
  },
  {
    entryDate: '2026-04-15',
    postingDate: '2026-04-15',
    sourceType: 'manual',
    sourceReference: 'MEM-2026-004',
    memo: 'Software license renewal',
    referenceNumber: 'PUR-2026-002',
    notes: 'Annual renewal of accounting software licenses.',
  },
  {
    entryDate: '2026-04-30',
    postingDate: '2026-04-30',
    sourceType: 'system',
    sourceReference: 'PAYROLL-2026-04',
    memo: 'April 2026 payroll journal',
    referenceNumber: 'PR-2026-004',
    notes: 'Monthly payroll run for April including salary, benefits, and withholding tax.',
  },
  {
    entryDate: '2026-05-08',
    postingDate: '2026-05-08',
    sourceType: 'manual',
    sourceReference: 'MEM-2026-005',
    memo: 'Utilities expense accrual - April',
    referenceNumber: 'ACCRUAL-UTIL-2026',
    notes: 'Accrual for April utilities pending receipt of actual bills.',
  },
  {
    entryDate: '2026-05-20',
    postingDate: '2026-05-20',
    sourceType: 'adjustment',
    sourceReference: 'ADJ-2026-002',
    memo: 'Depreciation adjustment - Office equipment',
    referenceNumber: 'DEP-2026-002',
    notes: 'Monthly depreciation entry for office equipment.',
  },
  {
    entryDate: '2026-05-31',
    postingDate: '2026-05-31',
    sourceType: 'manual',
    sourceReference: 'MEM-2026-006',
    memo: 'Month-end accrual adjustment - May',
    referenceNumber: 'ACCRUAL-MAY-2026',
    notes: 'Various month-end accruals for May including salaries, utilities, and professional fees.',
  },
  {
    entryDate: '2026-06-01',
    postingDate: '2026-06-01',
    sourceType: 'opening_balance',
    sourceReference: 'OB-MIDYEAR',
    memo: 'Mid-year opening balance adjustment',
    referenceNumber: 'OB-2026-MID',
    notes: 'Adjustments to opening balances following the Q1 audit.',
  },
  {
    entryDate: '2026-06-10',
    postingDate: '2026-06-10',
    sourceType: 'system',
    sourceReference: 'INV-BATCH-2026-06',
    memo: 'June 2026 invoice posting batch',
    referenceNumber: 'SYS-INV-2026-006',
    notes: 'Pending review before final posting.',
  },
  {
    entryDate: '2026-06-15',
    postingDate: '2026-06-15',
    sourceType: 'adjustment',
    sourceReference: 'ADJ-2026-003',
    memo: 'Foreign exchange gain adjustment',
    referenceNumber: 'FX-ADJ-2026-01',
    notes: 'Unrealized foreign exchange gain on USD bank account.',
  },
  {
    entryDate: '2026-06-18',
    postingDate: '2026-06-18',
    sourceType: 'manual',
    sourceReference: 'MEM-2026-007',
    memo: 'Consulting fees - Q2 2026',
    referenceNumber: 'CF-Q2-2026',
    notes: 'Accrual for Q2 consulting services rendered.',
  },
  {
    entryDate: '2026-06-20',
    postingDate: '2026-06-20',
    sourceType: 'reversal',
    sourceReference: 'REV-2026-002',
    memo: 'Reversal of ADJ-UTIL-0426',
    referenceNumber: 'REV-UTIL-2026',
    notes: 'Reversal of the April utilities accrual upon receipt of actual bill.',
  },
  {
    entryDate: '2026-06-22',
    postingDate: '2026-06-22',
    sourceType: 'manual',
    sourceReference: 'MEM-2026-008',
    memo: 'Prepaid insurance amortization',
    referenceNumber: 'AMORT-INS-2026',
    notes: 'Monthly amortization of prepaid insurance for June.',
  },
  {
    entryDate: '2026-06-25',
    postingDate: '2026-06-25',
    sourceType: 'adjustment',
    sourceReference: 'ADJ-2026-004',
    memo: 'Inventory write-down adjustment',
    referenceNumber: 'INV-WD-2026-01',
    notes: 'Write-down of obsolete inventory items per physical count.',
  },
]

async function seedJournalEntries() {
  const payload = await getPayload({ config })

  console.log('[seed] Seeding Accounting Journal Entries...')

  let created = 0
  let updated = 0

  for (const entry of sampleEntries) {
    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
      where: { sourceReference: { equals: entry.sourceReference } },
      overrideAccess: true,
      depth: 0,
      limit: 1,
    })

    const data = {
      entryDate: entry.entryDate,
      postingDate: entry.postingDate,
      sourceType: entry.sourceType,
      sourceReference: entry.sourceReference,
      memo: entry.memo,
      referenceNumber: entry.referenceNumber,
      notes: entry.notes,
    } as never

    if (existing.docs.length > 0) {
      const existingEntry = existing.docs[0] as unknown as Record<string, unknown>
      const existingStatus = String(existingEntry.status || '')
      if (['posted', 'reversed', 'voided'].includes(existingStatus)) {
        console.log(`[seed] Skipping ${entry.sourceReference}: status is ${existingStatus}`)
        continue
      }
      await payload.update({
        collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
        id: existing.docs[0].id,
        overrideAccess: true,
        data,
      })
      updated++
    } else {
      await payload.create({
        collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
        overrideAccess: true,
        data,
      })
      created++
    }
  }

  console.log(`[seed] Done. Created: ${created}, Updated: ${updated}`)
  process.exit(0)
}

seedJournalEntries().catch((error) => {
  console.error('[seed] Fatal error:', error)
  process.exit(1)
})
