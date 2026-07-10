import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

const SAMPLE_MAPPINGS = [
  { entryType: 'salary', person: 'Maria Santos', expenseAccountName: 'Salaries Expense', payableAccountName: 'Cash in Bank - Payroll', deductionAmount: 4500, status: 'posted', notes: 'Monthly salary mapping for Maria Santos - full-time instructor' },
  { entryType: 'contractor', person: 'Joel Reyes', expenseAccountName: 'Salaries Expense', payableAccountName: 'Accounts Payable - Trade', deductionAmount: 0, status: 'posted', notes: 'Contractor instruction mapping for Joel Reyes - per session rate' },
  { entryType: 'reimbursement', person: 'Ana Cruz', expenseAccountName: 'Rent Expense', payableAccountName: 'Accrued Liabilities', deductionAmount: 0, status: 'approved', notes: 'Staff reimbursement mapping for Ana Cruz - travel and materials' },
  { entryType: 'adjustment', person: 'Paolo Ramos', expenseAccountName: 'Salaries Expense', payableAccountName: 'Cash in Bank - Payroll', deductionAmount: 1250, status: 'draft', notes: 'Payroll adjustment mapping for Paolo Ramos - retroactive pay' },
  { entryType: 'salary', person: 'Catherine Lim', expenseAccountName: 'Salaries Expense', payableAccountName: 'Cash in Bank - Payroll', deductionAmount: 3200, status: 'approved', notes: 'Monthly salary mapping for Catherine Lim - senior instructor' },
  { entryType: 'contractor', person: 'Miguel Torres', expenseAccountName: 'Salaries Expense', payableAccountName: 'Accounts Payable - Trade', deductionAmount: 0, status: 'draft', notes: 'Contractor mapping for Miguel Torres - curriculum development' },
  { entryType: 'salary', person: 'Sofia Garcia', expenseAccountName: 'Salaries Expense', payableAccountName: 'Cash in Bank - Payroll', deductionAmount: 2800, status: 'posted', notes: 'Monthly salary mapping for Sofia Garcia - associate instructor' },
  { entryType: 'reimbursement', person: 'David Tan', expenseAccountName: 'Rent Expense', payableAccountName: 'Accrued Liabilities', deductionAmount: 0, status: 'draft', notes: 'Reimbursement mapping for David Tan - certification exam fees' },
  { entryType: 'adjustment', person: 'Lena Park', expenseAccountName: 'Salaries Expense', payableAccountName: 'Cash in Bank - Payroll', deductionAmount: 750, status: 'posted', notes: 'Adjustment mapping for Lena Park - overtime correction' },
  { entryType: 'contractor', person: 'Omar Hassan', expenseAccountName: 'Salaries Expense', payableAccountName: 'Accounts Payable - Trade', deductionAmount: 0, status: 'approved', notes: 'Contractor mapping for Omar Hassan - guest lecture series' },
]

async function seedPayrollAccountMappings() {
  console.log('[seed:payroll-account-mappings] Connecting to Payload...')
  const payload = await getPayload({ config })

  const accounts = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
    depth: 0,
    limit: 50,
    overrideAccess: true,
  })
  if (!accounts.docs.length) {
    console.error('[seed:payroll-account-mappings] No chart of accounts found. Seed chart of accounts first.')
    process.exit(1)
  }
  console.log(`[seed:payroll-account-mappings] Found ${accounts.docs.length} chart of accounts`)

  const accountByName = new Map<string, unknown>()
  for (const acct of accounts.docs) {
    const a = acct as unknown as Record<string, unknown>
    if (a.name) {
      accountByName.set(String(a.name), acct)
    }
  }

  let created = 0

  for (const mapping of SAMPLE_MAPPINGS) {
    const expenseAcct = accountByName.get(mapping.expenseAccountName)
    const payableAcct = accountByName.get(mapping.payableAccountName)

    if (!expenseAcct || !payableAcct) {
      console.log(`[seed:payroll-account-mappings] Skipping ${mapping.person} - account "${mapping.expenseAccountName}" or "${mapping.payableAccountName}" not found`)
      continue
    }

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollAccountMappings,
      where: {
        person: { equals: mapping.person },
      },
      overrideAccess: true,
    })

    if (existing.docs.length > 0) {
      console.log(`[seed:payroll-account-mappings] Skipping ${mapping.person} (already exists)`)
      continue
    }

    await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollAccountMappings,
      overrideAccess: true,
      data: {
        entryType: mapping.entryType,
        person: mapping.person,
        expenseAccount: (expenseAcct as unknown as Record<string, unknown>).id,
        payableAccount: (payableAcct as unknown as Record<string, unknown>).id,
        deductionAmount: mapping.deductionAmount,
        status: mapping.status,
        notes: mapping.notes,
      } as never,
    })

    console.log(`[seed:payroll-account-mappings] Created mapping for ${mapping.person} (${mapping.entryType}, ${mapping.status})`)
    created++
  }

  console.log(`[seed:payroll-account-mappings] Done. Created: ${created}`)
  process.exit(0)
}

seedPayrollAccountMappings().catch((error) => {
  console.error('[seed:payroll-account-mappings] Fatal error:', error)
  process.exit(1)
})
