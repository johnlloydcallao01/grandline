import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

type SeedLedgerAccount = {
  code: string
  name: string
  accountSubType: 'bank' | 'cash_and_cash_equivalents'
  isActive: boolean
  description: string
  sortOrder: number
}

type SeedBankAccount = {
  accountName: string
  accountNumberMasked: string | null
  bankName: string | null
  branchName: string | null
  accountType: 'bank' | 'cash_on_hand' | 'undeposited_funds'
  ledgerCode: string
  isDefaultReceiptAccount: boolean
  isDefaultDisbursementAccount: boolean
  isActive: boolean
  notes: string
}

const baseCurrencyCode = 'PHP'

const sampleLedgerAccounts: SeedLedgerAccount[] = [
  {
    code: '1010',
    name: 'Cash in Bank - Operating',
    accountSubType: 'bank',
    isActive: true,
    description: 'Primary ledger account for the main operating bank account.',
    sortOrder: 1010,
  },
  {
    code: '1011',
    name: 'Cash in Bank - Collections',
    accountSubType: 'bank',
    isActive: true,
    description: 'Ledger account for customer collections and incoming receipts.',
    sortOrder: 1011,
  },
  {
    code: '1012',
    name: 'Cash in Bank - Vendor Disbursement',
    accountSubType: 'bank',
    isActive: true,
    description: 'Ledger account used for vendor and payable disbursements.',
    sortOrder: 1012,
  },
  {
    code: '1013',
    name: 'Cash in Bank - Payroll',
    accountSubType: 'bank',
    isActive: true,
    description: 'Ledger account reserved for payroll funding and salary releases.',
    sortOrder: 1013,
  },
  {
    code: '1014',
    name: 'Cash in Bank - Tax Remittance',
    accountSubType: 'bank',
    isActive: true,
    description: 'Ledger account for tax remittance and statutory payments.',
    sortOrder: 1014,
  },
  {
    code: '1015',
    name: 'Cash in Bank - Executive Reserve',
    accountSubType: 'bank',
    isActive: true,
    description: 'Reserve cash ledger used for contingency approvals.',
    sortOrder: 1015,
  },
  {
    code: '1016',
    name: 'Cash On Hand - Head Office',
    accountSubType: 'cash_and_cash_equivalents',
    isActive: true,
    description: 'Petty cash ledger for the head office daily cash needs.',
    sortOrder: 1016,
  },
  {
    code: '1017',
    name: 'Cash On Hand - Training Center',
    accountSubType: 'cash_and_cash_equivalents',
    isActive: true,
    description: 'Petty cash ledger for training center operations and supplies.',
    sortOrder: 1017,
  },
  {
    code: '1018',
    name: 'Cash On Hand - Field Operations',
    accountSubType: 'cash_and_cash_equivalents',
    isActive: true,
    description: 'Field cash float ledger for operational site requirements.',
    sortOrder: 1018,
  },
  {
    code: '1019',
    name: 'Undeposited Funds - Main',
    accountSubType: 'cash_and_cash_equivalents',
    isActive: true,
    description: 'Ledger account for receipts pending main-branch deposit.',
    sortOrder: 1019,
  },
  {
    code: '1020',
    name: 'Undeposited Funds - Branch',
    accountSubType: 'cash_and_cash_equivalents',
    isActive: true,
    description: 'Ledger account for branch receipts awaiting bank deposit.',
    sortOrder: 1020,
  },
  {
    code: '1021',
    name: 'Cash in Bank - Cebu Branch',
    accountSubType: 'bank',
    isActive: true,
    description: 'Operating bank ledger for the Cebu branch.',
    sortOrder: 1021,
  },
  {
    code: '1022',
    name: 'Cash in Bank - Davao Branch',
    accountSubType: 'bank',
    isActive: true,
    description: 'Operating bank ledger for the Davao branch.',
    sortOrder: 1022,
  },
  {
    code: '1023',
    name: 'Cash in Bank - Iloilo Branch',
    accountSubType: 'bank',
    isActive: true,
    description: 'Operating bank ledger for the Iloilo branch.',
    sortOrder: 1023,
  },
  {
    code: '1024',
    name: 'Cash in Bank - Merchant Settlement',
    accountSubType: 'bank',
    isActive: true,
    description: 'Ledger account for card and merchant settlement proceeds.',
    sortOrder: 1024,
  },
  {
    code: '1025',
    name: 'Cash in Bank - Refund Clearing',
    accountSubType: 'bank',
    isActive: true,
    description: 'Ledger account used for refund processing and clearing.',
    sortOrder: 1025,
  },
  {
    code: '1026',
    name: 'Cash in Bank - Project Disbursement',
    accountSubType: 'bank',
    isActive: true,
    description: 'Project-specific disbursement ledger for controlled payouts.',
    sortOrder: 1026,
  },
  {
    code: '1027',
    name: 'Cash in Bank - Emergency Reserve',
    accountSubType: 'bank',
    isActive: false,
    description: 'Reserve ledger retained for emergency liquidity and historical use.',
    sortOrder: 1027,
  },
  {
    code: '1028',
    name: 'Cash in Bank - Legacy Dormant',
    accountSubType: 'bank',
    isActive: false,
    description: 'Legacy dormant bank ledger retained for audit history.',
    sortOrder: 1028,
  },
  {
    code: '1029',
    name: 'Cash in Bank - Digital Collections',
    accountSubType: 'bank',
    isActive: true,
    description: 'Ledger account for digital wallet and online collection settlements.',
    sortOrder: 1029,
  },
]

const sampleBankAccounts: SeedBankAccount[] = [
  {
    accountName: 'Main Operating Account',
    accountNumberMasked: '**** **** **** 4821',
    bankName: 'Bank of the Philippine Islands (BPI)',
    branchName: 'Quezon City Main Branch',
    accountType: 'bank',
    ledgerCode: '1010',
    isDefaultReceiptAccount: true,
    isDefaultDisbursementAccount: true,
    isActive: true,
    notes: 'Primary company account used for daily transactions, payroll, and vendor payments.',
  },
  {
    accountName: 'Collections Account',
    accountNumberMasked: '**** **** **** 1904',
    bankName: 'Bank of the Philippine Islands (BPI)',
    branchName: 'Quezon City Main Branch',
    accountType: 'bank',
    ledgerCode: '1011',
    isDefaultReceiptAccount: true,
    isDefaultDisbursementAccount: false,
    isActive: true,
    notes: 'Dedicated account for customer collections, receipts, and daily deposits.',
  },
  {
    accountName: 'Vendor Disbursement Account',
    accountNumberMasked: '**** **** **** 7752',
    bankName: 'Banco de Oro (BDO)',
    branchName: 'Makati Corporate Branch',
    accountType: 'bank',
    ledgerCode: '1012',
    isDefaultReceiptAccount: false,
    isDefaultDisbursementAccount: true,
    isActive: true,
    notes: 'Primary disbursement account for supplier payments and accounts payable releases.',
  },
  {
    accountName: 'Payroll Funding Account',
    accountNumberMasked: '**** **** **** 6618',
    bankName: 'RCBC',
    branchName: 'Ortigas Center Branch',
    accountType: 'bank',
    ledgerCode: '1013',
    isDefaultReceiptAccount: false,
    isDefaultDisbursementAccount: true,
    isActive: true,
    notes: 'Funding account used exclusively for payroll runs and salary releases.',
  },
  {
    accountName: 'Tax Remittance Account',
    accountNumberMasked: '**** **** **** 2446',
    bankName: 'Metrobank',
    branchName: 'Pasig Capitol Branch',
    accountType: 'bank',
    ledgerCode: '1014',
    isDefaultReceiptAccount: false,
    isDefaultDisbursementAccount: false,
    isActive: true,
    notes: 'Reserved account for tax remittance, government payments, and statutory obligations.',
  },
  {
    accountName: 'Executive Reserve Account',
    accountNumberMasked: '**** **** **** 1083',
    bankName: 'Security Bank',
    branchName: 'BGC High Street Branch',
    accountType: 'bank',
    ledgerCode: '1015',
    isDefaultReceiptAccount: false,
    isDefaultDisbursementAccount: false,
    isActive: true,
    notes: 'Reserve account maintained for contingency draws and executive-approved cash needs.',
  },
  {
    accountName: 'Petty Cash - Head Office',
    accountNumberMasked: null,
    bankName: null,
    branchName: 'Head Office Cashier',
    accountType: 'cash_on_hand',
    ledgerCode: '1016',
    isDefaultReceiptAccount: false,
    isDefaultDisbursementAccount: false,
    isActive: true,
    notes: 'Petty cash fund for head office courier fees, pantry purchases, and minor reimbursements.',
  },
  {
    accountName: 'Petty Cash - Training Center',
    accountNumberMasked: null,
    bankName: null,
    branchName: 'Training Center Cashier',
    accountType: 'cash_on_hand',
    ledgerCode: '1017',
    isDefaultReceiptAccount: false,
    isDefaultDisbursementAccount: false,
    isActive: true,
    notes: 'Petty cash fund for training center supplies, transport, and emergency classroom needs.',
  },
  {
    accountName: 'Field Operations Cash Float',
    accountNumberMasked: null,
    bankName: null,
    branchName: 'Operations Dispatch Desk',
    accountType: 'cash_on_hand',
    ledgerCode: '1018',
    isDefaultReceiptAccount: false,
    isDefaultDisbursementAccount: false,
    isActive: true,
    notes: 'Field cash float for operational dispatches, inspections, and approved site expenses.',
  },
  {
    accountName: 'Undeposited Funds - Main Collections',
    accountNumberMasked: null,
    bankName: null,
    branchName: 'Quezon City Main Branch',
    accountType: 'undeposited_funds',
    ledgerCode: '1019',
    isDefaultReceiptAccount: false,
    isDefaultDisbursementAccount: false,
    isActive: true,
    notes: 'Temporary holding account for receipts pending deposit to the main collections bank account.',
  },
  {
    accountName: 'Undeposited Funds - Branch Collections',
    accountNumberMasked: null,
    bankName: null,
    branchName: 'Provincial Branch Network',
    accountType: 'undeposited_funds',
    ledgerCode: '1020',
    isDefaultReceiptAccount: false,
    isDefaultDisbursementAccount: false,
    isActive: true,
    notes: 'Temporary holding account for branch receipts awaiting bank pick-up or scheduled deposit.',
  },
  {
    accountName: 'Cebu Branch Operating Account',
    accountNumberMasked: '**** **** **** 3157',
    bankName: 'Bank of the Philippine Islands (BPI)',
    branchName: 'Cebu Business Park Branch',
    accountType: 'bank',
    ledgerCode: '1021',
    isDefaultReceiptAccount: false,
    isDefaultDisbursementAccount: false,
    isActive: true,
    notes: 'Operating account for Cebu branch collections, local expenses, and branch disbursements.',
  },
  {
    accountName: 'Davao Branch Operating Account',
    accountNumberMasked: '**** **** **** 5588',
    bankName: 'Banco de Oro (BDO)',
    branchName: 'Davao Quimpo Branch',
    accountType: 'bank',
    ledgerCode: '1022',
    isDefaultReceiptAccount: false,
    isDefaultDisbursementAccount: false,
    isActive: true,
    notes: 'Operating account for Davao branch collections and local vendor settlements.',
  },
  {
    accountName: 'Iloilo Branch Operating Account',
    accountNumberMasked: '**** **** **** 6301',
    bankName: 'Metrobank',
    branchName: 'Iloilo City Center Branch',
    accountType: 'bank',
    ledgerCode: '1023',
    isDefaultReceiptAccount: false,
    isDefaultDisbursementAccount: false,
    isActive: true,
    notes: 'Operating account for Iloilo branch transactions, branch payroll support, and utilities.',
  },
  {
    accountName: 'Merchant Settlement Account',
    accountNumberMasked: '**** **** **** 7280',
    bankName: 'UnionBank',
    branchName: 'Ortigas Tech Branch',
    accountType: 'bank',
    ledgerCode: '1024',
    isDefaultReceiptAccount: true,
    isDefaultDisbursementAccount: false,
    isActive: true,
    notes: 'Settlement account for card terminals, gateway proceeds, and merchant collection batches.',
  },
  {
    accountName: 'Refund Clearing Account',
    accountNumberMasked: '**** **** **** 8096',
    bankName: 'Land Bank of the Philippines',
    branchName: 'Manila Port Area Branch',
    accountType: 'bank',
    ledgerCode: '1025',
    isDefaultReceiptAccount: false,
    isDefaultDisbursementAccount: false,
    isActive: true,
    notes: 'Clearing account used for approved customer refunds and refund reconciliation tracking.',
  },
  {
    accountName: 'Project Disbursement Account',
    accountNumberMasked: '**** **** **** 4415',
    bankName: 'EastWest Bank',
    branchName: 'Alabang Corporate Branch',
    accountType: 'bank',
    ledgerCode: '1026',
    isDefaultReceiptAccount: false,
    isDefaultDisbursementAccount: false,
    isActive: true,
    notes: 'Restricted account for project-based payouts, mobilization funds, and implementation costs.',
  },
  {
    accountName: 'Emergency Reserve Account',
    accountNumberMasked: '**** **** **** 9022',
    bankName: 'Philippine National Bank (PNB)',
    branchName: 'Quezon Avenue Branch',
    accountType: 'bank',
    ledgerCode: '1027',
    isDefaultReceiptAccount: false,
    isDefaultDisbursementAccount: false,
    isActive: false,
    notes: 'Emergency reserve account retained for approved contingency use and legacy cash planning.',
  },
  {
    accountName: 'Legacy Dormant Account',
    accountNumberMasked: '**** **** **** 1179',
    bankName: 'RCBC',
    branchName: 'Cebu Fuente Branch',
    accountType: 'bank',
    ledgerCode: '1028',
    isDefaultReceiptAccount: false,
    isDefaultDisbursementAccount: false,
    isActive: false,
    notes: 'Dormant legacy account retained only for audit history and historical transaction tracing.',
  },
  {
    accountName: 'Digital Collections Clearing',
    accountNumberMasked: '**** **** **** 6640',
    bankName: 'Maya Business',
    branchName: 'Makati Digital Hub',
    accountType: 'bank',
    ledgerCode: '1029',
    isDefaultReceiptAccount: true,
    isDefaultDisbursementAccount: false,
    isActive: true,
    notes: 'Clearing account for online payments, wallet settlements, and digital collection channels.',
  },
]

async function getCurrencyReferenceId(payload: Awaited<ReturnType<typeof getPayload>>) {
  const result = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.currencies as any,
    where: {
      code: {
        equals: baseCurrencyCode,
      },
    } as any,
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const record = result.docs[0]

  if (!record) {
    throw new Error(`Required accounting currency '${baseCurrencyCode}' was not found.`)
  }

  return record.id
}

async function upsertLedgerAccounts(payload: Awaited<ReturnType<typeof getPayload>>) {
  let createdCount = 0
  let updatedCount = 0

  const ledgerAccountIdMap = new Map<string, number | string>()

  for (const ledgerAccount of sampleLedgerAccounts) {
    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts as any,
      where: {
        code: {
          equals: ledgerAccount.code,
        },
      } as any,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const data = {
      code: ledgerAccount.code,
      name: ledgerAccount.name,
      accountType: 'asset',
      accountSubType: ledgerAccount.accountSubType,
      normalBalance: 'debit',
      isActive: ledgerAccount.isActive,
      allowManualEntries: false,
      isControlAccount: true,
      isRetainedEarnings: false,
      isSuspenseAccount: false,
      description: ledgerAccount.description,
      sortOrder: ledgerAccount.sortOrder,
    }

    if (existing.docs[0]) {
      await payload.update({
        collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts as any,
        id: existing.docs[0].id,
        data,
        depth: 0,
        overrideAccess: true,
      })
      ledgerAccountIdMap.set(ledgerAccount.code, existing.docs[0].id)
      updatedCount += 1
      console.log(`Updated ledger ${ledgerAccount.code} - ${ledgerAccount.name}`)
    } else {
      const created = await payload.create({
        collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts as any,
        data,
        depth: 0,
        overrideAccess: true,
      })
      ledgerAccountIdMap.set(ledgerAccount.code, created.id)
      createdCount += 1
      console.log(`Created ledger ${ledgerAccount.code} - ${ledgerAccount.name}`)
    }
  }

  return {
    ledgerAccountIdMap,
    createdCount,
    updatedCount,
  }
}

async function seedAccountingBankAccounts() {
  const payload = await getPayload({ config })

  console.log('Seeding accounting chart of accounts for bank ledgers...')

  const currencyReferenceId = await getCurrencyReferenceId(payload)
  const {
    ledgerAccountIdMap,
    createdCount: createdLedgerCount,
    updatedCount: updatedLedgerCount,
  } = await upsertLedgerAccounts(payload)

  const missingLedgers = sampleBankAccounts
    .map((bankAccount) => bankAccount.ledgerCode)
    .filter((ledgerCode) => !ledgerAccountIdMap.has(ledgerCode))

  if (missingLedgers.length) {
    throw new Error(`Missing required ledger accounts for codes: ${Array.from(new Set(missingLedgers)).join(', ')}`)
  }

  console.log('Seeding accounting bank accounts...')

  let createdBankAccountCount = 0
  let updatedBankAccountCount = 0

  for (const bankAccount of sampleBankAccounts) {
    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts as any,
      where: {
        accountName: {
          equals: bankAccount.accountName,
        },
      } as any,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const data = {
      accountName: bankAccount.accountName,
      accountNumberMasked: bankAccount.accountNumberMasked,
      bankName: bankAccount.bankName,
      branchName: bankAccount.branchName,
      accountType: bankAccount.accountType,
      currencyReference: currencyReferenceId,
      ledgerAccount: ledgerAccountIdMap.get(bankAccount.ledgerCode),
      isDefaultReceiptAccount: bankAccount.isDefaultReceiptAccount,
      isDefaultDisbursementAccount: bankAccount.isDefaultDisbursementAccount,
      isActive: bankAccount.isActive,
      notes: bankAccount.notes,
    }

    if (existing.docs[0]) {
      await payload.update({
        collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts as any,
        id: existing.docs[0].id,
        data,
        depth: 0,
        overrideAccess: true,
      })
      updatedBankAccountCount += 1
      console.log(`Updated bank account ${bankAccount.accountName}`)
    } else {
      await payload.create({
        collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts as any,
        data,
        depth: 0,
        overrideAccess: true,
      })
      createdBankAccountCount += 1
      console.log(`Created bank account ${bankAccount.accountName}`)
    }
  }

  const [ledgerTotal, bankAccountTotal] = await Promise.all([
    payload.count({
      collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts as any,
      overrideAccess: true,
    }),
    payload.count({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts as any,
      overrideAccess: true,
    }),
  ])

  console.log(
    `Done. Ledgers created: ${createdLedgerCount}, updated: ${updatedLedgerCount}, total chart accounts now: ${ledgerTotal.totalDocs}`,
  )
  console.log(
    `Done. Bank accounts created: ${createdBankAccountCount}, updated: ${updatedBankAccountCount}, total bank accounts now: ${bankAccountTotal.totalDocs}`,
  )
}

seedAccountingBankAccounts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to seed accounting bank accounts:', error)
    process.exit(1)
  })
