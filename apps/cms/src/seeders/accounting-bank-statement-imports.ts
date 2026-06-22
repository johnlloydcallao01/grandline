import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

type BankAccountDoc = {
  id: number | string
  accountName?: string | null
  bankName?: string | null
  accountNumberMasked?: string | null
  accountType?: string | null
  isActive?: boolean | null
}

type MediaDoc = {
  id: number | string
  filename?: string | null
  mimeType?: string | null
}

type UserDoc = {
  id: number | string
}

type StatementImportTemplate = {
  seedKey: string
  importBatchNumber: string
  statementDateFrom: string
  statementDateTo: string
  sourceFormat: 'csv' | 'xlsx' | 'ofx' | 'pdf' | 'other'
  importStatus: 'queued' | 'imported' | 'partial_import' | 'parse_error' | 'reupload_required'
  totalLines: number
  importedLines: number
  failedLines: number
  duplicateLines: number
  importedTransactionCount: number
  parseErrorSummary?: string | null
  notes: string
}

const sourceFormats: StatementImportTemplate['sourceFormat'][] = ['csv', 'xlsx', 'ofx', 'pdf', 'other']
const statuses: StatementImportTemplate['importStatus'][] = [
  'queued',
  'imported',
  'partial_import',
  'parse_error',
  'reupload_required',
]

const batchThemes = [
  'Main operating account daily statement',
  'Payroll settlement file from treasury',
  'Collections deposit batch for training fees',
  'Corporate billing remittance support file',
  'Refund and reversal review batch',
  'Vendor payment settlement batch',
  'Weekend workshop collection imports',
  'Cash-on-hand replenishment review file',
  'OFX treasury transfer intake',
  'Monthly reserve account statement package',
] as const

const buildTemplates = (): StatementImportTemplate[] =>
  Array.from({ length: 20 }, (_, index) => {
    const sequence = index + 1
    const status = statuses[index % statuses.length]
    const sourceFormat = sourceFormats[index % sourceFormats.length]
    const day = String(((index % 20) + 1)).padStart(2, '0')
    const nextDay = String(((index % 20) + 2)).padStart(2, '0')
    const totalLines = 120 + index * 9
    const duplicateLines = status === 'partial_import' || status === 'reupload_required' ? (index % 4) + 1 : 0
    const failedLines =
      status === 'parse_error' ? Math.max(8, Math.floor(totalLines * 0.4)) : status === 'reupload_required' ? (index % 6) + 3 : status === 'partial_import' ? (index % 5) + 2 : 0
    const importedLines =
      status === 'queued' ? 0 : status === 'parse_error' ? 0 : Math.max(totalLines - failedLines - duplicateLines, 0)
    const importedTransactionCount =
      status === 'queued' || status === 'parse_error' ? 0 : Math.max(importedLines - ((index % 3) + 1), 0)
    const parseErrorSummary =
      status === 'parse_error'
        ? 'Unable to parse several rows because the date and amount columns are misaligned.'
        : status === 'reupload_required'
          ? 'Imported file needs re-upload because duplicate and invalid lines exceeded tolerance.'
          : status === 'partial_import'
            ? 'Some rows were skipped because references were duplicated in the imported statement.'
            : null

    return {
      seedKey: `statement-import-sample-${String(sequence).padStart(3, '0')}`,
      importBatchNumber: `BSI-SAMPLE-202606-${String(sequence).padStart(3, '0')}`,
      statementDateFrom: `2026-06-${day}T00:00:00.000Z`,
      statementDateTo: `2026-06-${nextDay}T23:59:59.000Z`,
      sourceFormat,
      importStatus: status,
      totalLines,
      importedLines,
      failedLines,
      duplicateLines,
      importedTransactionCount,
      parseErrorSummary,
      notes: `${batchThemes[index % batchThemes.length]}. Seeded sample batch ${String(sequence).padStart(3, '0')} for the statement imports tab.`,
    }
  })

async function seedAccountingBankStatementImports() {
  const payload = await getPayload({ config })

  const [adminUsers, bankAccounts, mediaResult] = await Promise.all([
    payload.find({
      collection: 'users',
      where: { role: { equals: 'admin' } } as never,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts as any,
      where: {
        and: [
          { isActive: { not_equals: false } },
          {
            or: [
              { accountType: { equals: 'bank' } },
              { accountType: { equals: 'cash_on_hand' } },
              { accountType: { equals: 'undeposited_funds' } },
            ],
          },
        ],
      } as never,
      limit: 100,
      depth: 0,
      sort: 'accountName',
      overrideAccess: true,
    }),
    payload.find({
      collection: 'media',
      limit: 100,
      depth: 0,
      sort: '-updatedAt',
      overrideAccess: true,
    }),
  ])

  const adminId = (adminUsers.docs[0] as UserDoc | undefined)?.id ?? null
  const availableBankAccounts = bankAccounts.docs as BankAccountDoc[]
  const mediaDocs = mediaResult.docs as MediaDoc[]
  const templates = buildTemplates()

  if (availableBankAccounts.length === 0) {
    throw new Error('No active bank, cash-on-hand, or undeposited-funds accounts were found. Seed bank accounts first, then rerun this seeder.')
  }

  if (mediaDocs.length === 0) {
    throw new Error('No media records were found. Upload at least one media file first, then rerun this seeder.')
  }

  let createdCount = 0
  let skippedCount = 0

  for (let index = 0; index < templates.length; index += 1) {
    const template = templates[index]
    const bankAccount = availableBankAccounts[index % availableBankAccounts.length]
    const mediaDoc = mediaDocs[index % mediaDocs.length]

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankStatementImports as any,
      where: {
        or: [
          {
            importBatchNumber: {
              equals: template.importBatchNumber,
            },
          },
          {
            notes: {
              equals: template.notes,
            },
          },
        ],
      } as never,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (existing.docs[0]) {
      skippedCount += 1
      console.log(
        `Skipped statement import ${template.importBatchNumber} on ${bankAccount.accountName || bankAccount.bankName || bankAccount.id} (already exists)`,
      )
      continue
    }

    const importedAt =
      template.importStatus === 'imported' || template.importStatus === 'partial_import'
        ? `${template.statementDateTo.slice(0, 10)}T10:${String((index * 3) % 60).padStart(2, '0')}:00.000Z`
        : null

    await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankStatementImports as any,
      data: {
        importBatchNumber: template.importBatchNumber,
        bankAccount: bankAccount.id,
        statementFile: mediaDoc.id,
        statementDateFrom: template.statementDateFrom,
        statementDateTo: template.statementDateTo,
        sourceFormat: template.sourceFormat,
        importStatus: template.importStatus,
        totalLines: template.totalLines,
        importedLines: template.importedLines,
        failedLines: template.failedLines,
        duplicateLines: template.duplicateLines,
        importedTransactionCount: template.importedTransactionCount,
        uploadedBy: adminId,
        importedBy: importedAt ? adminId : null,
        importedAt,
        parseErrorSummary: template.parseErrorSummary ?? null,
        notes: template.notes,
        metadata: {
          seedKey: template.seedKey,
          seededFor: 'bank-operations-statement-imports',
          seededBankAccountName: bankAccount.accountName || bankAccount.bankName || null,
          seededBankAccountType: bankAccount.accountType || null,
          seededMediaFilename: mediaDoc.filename || null,
          seededMediaMimeType: mediaDoc.mimeType || null,
        },
        createdBy: adminId,
        updatedBy: adminId,
      },
      depth: 0,
      overrideAccess: true,
    })

    createdCount += 1
    console.log(
      `Created statement import ${template.importBatchNumber} using media ${mediaDoc.filename || mediaDoc.id} on ${bankAccount.accountName || bankAccount.bankName || bankAccount.id}`,
    )
  }

  const total = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.bankStatementImports as any,
    overrideAccess: true,
  })

  console.log(
    `Done. Statement imports created: ${createdCount}, skipped: ${skippedCount}, total now: ${total.totalDocs}`,
  )
}

seedAccountingBankStatementImports()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to seed accounting bank statement imports:', error)
    process.exit(1)
  })
