import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

type LineSeed = {
  journalEntryId: number | string
  lineNumber: number
  accountCode: string
  description: string
  debit: number
  credit: number
}

const neededAccounts = [
  { code: '1010-OP', name: 'Cash in Bank - Operating', normalBalance: 'debit', isActive: true, allowManualEntries: true, isControlAccount: false, accountType: 'asset', accountSubType: 'cash_and_cash_equivalents' },
  { code: '1100-AR', name: 'Accounts Receivable - Trade', normalBalance: 'debit', isActive: true, allowManualEntries: true, isControlAccount: false, accountType: 'asset', accountSubType: 'accounts_receivable' },
  { code: '1400-EQ', name: 'Office Equipment', normalBalance: 'debit', isActive: true, allowManualEntries: true, isControlAccount: false, accountType: 'asset', accountSubType: 'fixed_asset' },
  { code: '2100-AP', name: 'Accounts Payable - Trade', normalBalance: 'credit', isActive: true, allowManualEntries: true, isControlAccount: false, accountType: 'liability', accountSubType: 'accounts_payable' },
  { code: '2200-AL', name: 'Accrued Liabilities', normalBalance: 'credit', isActive: true, allowManualEntries: true, isControlAccount: false, accountType: 'liability', accountSubType: 'accrued_liability' },
  { code: '3100-CAP', name: 'Capital Stock', normalBalance: 'credit', isActive: true, allowManualEntries: true, isControlAccount: false, accountType: 'equity', accountSubType: 'owner_equity' },
  { code: '3200-RE', name: 'Retained Earnings - Current', normalBalance: 'credit', isActive: true, allowManualEntries: true, isControlAccount: false, accountType: 'equity', accountSubType: 'retained_earnings' },
  { code: '5100-SAL', name: 'Salaries Expense', normalBalance: 'debit', isActive: true, allowManualEntries: true, isControlAccount: false, accountType: 'expense', accountSubType: 'operating_expense' },
  { code: '5200-REN', name: 'Rent Expense', normalBalance: 'debit', isActive: true, allowManualEntries: true, isControlAccount: false, accountType: 'expense', accountSubType: 'operating_expense' },
  { code: '6100-REV', name: 'Training Revenue', normalBalance: 'credit', isActive: true, allowManualEntries: true, isControlAccount: false, accountType: 'revenue', accountSubType: 'revenue' },
]

async function ensureAccounts(payload: any) {
  let created = 0
  for (const acct of neededAccounts) {
    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
      where: { code: { equals: acct.code } },
      overrideAccess: true, depth: 0, limit: 1,
    })
    if (existing.docs.length === 0) {
      await payload.create({
        collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
        overrideAccess: true,
        data: acct as never,
      })
      created++
    }
  }
  return created
}

async function getAccountMap(payload: any) {
  const r = await payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts, limit: 100, overrideAccess: true, depth: 0 })
  const map = new Map<string, number | string>()
  for (const a of r.docs) {
    const acct = a as Record<string, unknown>
    if (String(acct.code)) map.set(String(acct.code), acct.id as number | string)
  }
  return map
}

async function getEntryMap(payload: any) {
  const r = await payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries, limit: 100, overrideAccess: true, depth: 0 })
  const map = new Map<string, number | string>()
  for (const e of r.docs) {
    const entry = e as Record<string, unknown>
    if (String(entry.sourceReference)) map.set(String(entry.sourceReference), entry.id as number | string)
  }
  return map
}

const lineSeeds: Array<{ ref: string; lines: Omit<LineSeed, 'journalEntryId'>[] }> = [
  {
    ref: 'OB-2026', lines: [
      { lineNumber: 1, accountCode: '1010-OP', description: 'Opening balance - Cash in Bank', debit: 500000, credit: 0 },
      { lineNumber: 2, accountCode: '1100-AR', description: 'Opening balance - Accounts Receivable', debit: 200000, credit: 0 },
      { lineNumber: 3, accountCode: '2100-AP', description: 'Opening balance - Accounts Payable', debit: 0, credit: 150000 },
      { lineNumber: 4, accountCode: '3200-RE', description: 'Opening balance - Retained Earnings', debit: 0, credit: 550000 },
    ],
  },
  {
    ref: 'MEM-2026-001', lines: [
      { lineNumber: 1, accountCode: '1010-OP', description: 'Capital contribution - Cash', debit: 1000000, credit: 0 },
      { lineNumber: 2, accountCode: '3100-CAP', description: 'Capital contribution - Equity', debit: 0, credit: 1000000 },
    ],
  },
  {
    ref: 'INV-BATCH-2026-01', lines: [
      { lineNumber: 1, accountCode: '1100-AR', description: 'January invoice batch - AR', debit: 428880, credit: 0 },
      { lineNumber: 2, accountCode: '6100-REV', description: 'January invoice batch - Revenue', debit: 0, credit: 428880 },
    ],
  },
  {
    ref: 'MEM-2026-002', lines: [
      { lineNumber: 1, accountCode: '1400-EQ', description: 'Office furniture purchase', debit: 150000, credit: 0 },
      { lineNumber: 2, accountCode: '2100-AP', description: 'Office furniture - Payable', debit: 0, credit: 150000 },
    ],
  },
  {
    ref: 'BILL-BATCH-2026-02', lines: [
      { lineNumber: 1, accountCode: '5200-REN', description: 'February bills - Rent', debit: 85000, credit: 0 },
      { lineNumber: 2, accountCode: '5100-SAL', description: 'February bills - Salaries', debit: 320000, credit: 0 },
      { lineNumber: 3, accountCode: '2100-AP', description: 'February bills - AP', debit: 0, credit: 405000 },
    ],
  },
  {
    ref: 'ADJ-2026-001', lines: [
      { lineNumber: 1, accountCode: '5200-REN', description: 'Reclass - Rent expense correction', debit: 15000, credit: 0 },
      { lineNumber: 2, accountCode: '5100-SAL', description: 'Reclass - Salaries reduction', debit: 0, credit: 15000 },
    ],
  },
  {
    ref: 'MEM-2026-003', lines: [
      { lineNumber: 1, accountCode: '5100-SAL', description: 'Q1 tax accrual - Salaries portion', debit: 45000, credit: 0 },
      { lineNumber: 2, accountCode: '2200-AL', description: 'Q1 tax accrual - Liability', debit: 0, credit: 45000 },
    ],
  },
  {
    ref: 'REV-2026-001', lines: [
      { lineNumber: 1, accountCode: '5200-REN', description: 'Reversal - Rent correction (reversed)', debit: 0, credit: 15000 },
      { lineNumber: 2, accountCode: '5100-SAL', description: 'Reversal - Salaries reduction (reversed)', debit: 15000, credit: 0 },
    ],
  },
  {
    ref: 'MEM-2026-004', lines: [
      { lineNumber: 1, accountCode: '5100-SAL', description: 'Software license - Expense', debit: 72000, credit: 0 },
      { lineNumber: 2, accountCode: '2100-AP', description: 'Software license - Payable', debit: 0, credit: 72000 },
    ],
  },
  {
    ref: 'PAYROLL-2026-04', lines: [
      { lineNumber: 1, accountCode: '5100-SAL', description: 'April payroll - Salaries', debit: 285000, credit: 0 },
      { lineNumber: 2, accountCode: '1010-OP', description: 'April payroll - Cash disbursement', debit: 0, credit: 285000 },
    ],
  },
  {
    ref: 'MEM-2026-005', lines: [
      { lineNumber: 1, accountCode: '5200-REN', description: 'April utilities accrual - Expense', debit: 18500, credit: 0 },
      { lineNumber: 2, accountCode: '2200-AL', description: 'April utilities accrual - Liability', debit: 0, credit: 18500 },
    ],
  },
  {
    ref: 'ADJ-2026-002', lines: [
      { lineNumber: 1, accountCode: '5200-REN', description: 'Depreciation - Office equipment', debit: 12500, credit: 0 },
      { lineNumber: 2, accountCode: '2200-AL', description: 'Depreciation - Accumulated', debit: 0, credit: 12500 },
    ],
  },
  {
    ref: 'MEM-2026-006', lines: [
      { lineNumber: 1, accountCode: '5100-SAL', description: 'May accrual - Salaries', debit: 92000, credit: 0 },
      { lineNumber: 2, accountCode: '5200-REN', description: 'May accrual - Utilities', debit: 22000, credit: 0 },
      { lineNumber: 3, accountCode: '2200-AL', description: 'May accrual - Liabilities', debit: 0, credit: 114000 },
    ],
  },
  {
    ref: 'OB-MIDYEAR', lines: [
      { lineNumber: 1, accountCode: '1100-AR', description: 'Mid-year adj - AR increase', debit: 35000, credit: 0 },
      { lineNumber: 2, accountCode: '3200-RE', description: 'Mid-year adj - RE adjustment', debit: 0, credit: 35000 },
    ],
  },
  {
    ref: 'INV-BATCH-2026-06', lines: [
      { lineNumber: 1, accountCode: '1100-AR', description: 'June invoice batch - AR', debit: 312500, credit: 0 },
      { lineNumber: 2, accountCode: '6100-REV', description: 'June invoice batch - Revenue', debit: 0, credit: 312500 },
    ],
  },
  {
    ref: 'ADJ-2026-003', lines: [
      { lineNumber: 1, accountCode: '1010-OP', description: 'FX gain - Cash revaluation', debit: 8500, credit: 0 },
      { lineNumber: 2, accountCode: '6100-REV', description: 'FX gain - Unrealized income', debit: 0, credit: 8500 },
    ],
  },
  {
    ref: 'MEM-2026-007', lines: [
      { lineNumber: 1, accountCode: '5200-REN', description: 'Q2 consulting fees - Expense', debit: 95000, credit: 0 },
      { lineNumber: 2, accountCode: '2200-AL', description: 'Q2 consulting fees - Accrued', debit: 0, credit: 95000 },
    ],
  },
  {
    ref: 'REV-2026-002', lines: [
      { lineNumber: 1, accountCode: '5200-REN', description: 'Reversal - Utilities accrual', debit: 0, credit: 18500 },
      { lineNumber: 2, accountCode: '2200-AL', description: 'Reversal - Liability removal', debit: 18500, credit: 0 },
    ],
  },
  {
    ref: 'MEM-2026-008', lines: [
      { lineNumber: 1, accountCode: '5200-REN', description: 'Insurance amortization - June', debit: 8400, credit: 0 },
      { lineNumber: 2, accountCode: '2200-AL', description: 'Insurance amortization - Prepaid reduction', debit: 0, credit: 8400 },
    ],
  },
  {
    ref: 'ADJ-2026-004', lines: [
      { lineNumber: 1, accountCode: '5100-SAL', description: 'Inventory write-down - Obsolete items', debit: 38500, credit: 0 },
      { lineNumber: 2, accountCode: '1100-AR', description: 'Inventory write-down - AR reduction', debit: 0, credit: 38500 },
    ],
  },
]

async function seedJournalEntryLines() {
  const payload = await getPayload({ config })

  console.log('[seed] Ensuring chart accounts exist...')
  const createdAccounts = await ensureAccounts(payload)
  console.log(`[seed] Accounts created: ${createdAccounts}`)

  const accountMap = await getAccountMap(payload)
  const entryMap = await getEntryMap(payload)

  let lineCount = 0

  for (const group of lineSeeds) {
    const entryId = entryMap.get(group.ref)
    if (!entryId) {
      console.log(`[seed] Skipping ${group.ref}: journal entry not found`)
      continue
    }

    // Check if lines already exist for this entry
    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntryLines,
      where: { journalEntry: { equals: entryId } },
      overrideAccess: true, depth: 0, limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`[seed] Skipping ${group.ref}: lines already exist`)
      continue
    }

    for (const line of group.lines) {
      const accountId = accountMap.get(line.accountCode)
      if (!accountId) {
        console.log(`[seed] Skipping line for ${group.ref}: account ${line.accountCode} not found`)
        continue
      }

      try {
        await payload.create({
          collection: ACCOUNTING_COLLECTION_SLUGS.journalEntryLines,
          overrideAccess: true,
          data: {
            journalEntry: entryId,
            lineNumber: line.lineNumber,
            account: accountId,
            description: line.description,
            debit: line.debit,
            credit: line.credit,
          } as never,
        })
        lineCount++
      } catch (err) {
        console.log(`[seed] Error creating line for ${group.ref} line ${line.lineNumber}: ${err instanceof Error ? err.message : err}`)
      }
    }
  }

  console.log(`[seed] Done. Lines created: ${lineCount}`)
  process.exit(0)
}

seedJournalEntryLines().catch((error) => {
  console.error('[seed] Fatal error:', error)
  process.exit(1)
})
