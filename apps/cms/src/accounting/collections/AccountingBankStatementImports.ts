import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import { ACCOUNTING_ADMIN_GROUP, ACCOUNTING_COLLECTION_SLUGS } from '../constants/accounting'
import { applyCreatedAndUpdatedBy, getRequestUserId } from '../utils/accounting-audit'
import { normalizeOptionalText } from '../utils/commercial'

const BANK_STATEMENT_IMPORT_STATUS_OPTIONS = [
  { label: 'Queued', value: 'queued' },
  { label: 'Imported', value: 'imported' },
  { label: 'Partial Import', value: 'partial_import' },
  { label: 'Parse Error', value: 'parse_error' },
  { label: 'Needs Re-upload', value: 'reupload_required' },
] as const

const BANK_STATEMENT_SOURCE_FORMAT_OPTIONS = [
  { label: 'CSV', value: 'csv' },
  { label: 'Excel', value: 'xlsx' },
  { label: 'OFX', value: 'ofx' },
  { label: 'PDF', value: 'pdf' },
  { label: 'Other', value: 'other' },
] as const

const normalizeNonNegativeNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return fallback
  return parsed
}

const generateImportBatchNumber = () => {
  const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14)
  const suffix = Math.floor(100 + Math.random() * 900)
  return `BSI-${stamp}-${suffix}`
}

export const AccountingBankStatementImports: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.bankStatementImports,
  admin: {
    useAsTitle: 'importBatchNumber',
    defaultColumns: ['importBatchNumber', 'bankAccount', 'importStatus', 'statementDateFrom', 'statementDateTo'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Uploaded bank statement batches, import outcomes, and follow-up status for banking operations.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'importBatchNumber', type: 'text', required: true, index: true },
    { name: 'bankAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.bankAccounts, required: true, index: true },
    { name: 'statementFile', type: 'relationship', relationTo: 'media', required: true, index: true },
    { name: 'statementDateFrom', type: 'date' },
    { name: 'statementDateTo', type: 'date' },
    {
      name: 'sourceFormat',
      type: 'select',
      required: true,
      defaultValue: 'csv',
      options: [...BANK_STATEMENT_SOURCE_FORMAT_OPTIONS],
      index: true,
    },
    {
      name: 'importStatus',
      type: 'select',
      required: true,
      defaultValue: 'queued',
      options: [...BANK_STATEMENT_IMPORT_STATUS_OPTIONS],
      index: true,
    },
    { name: 'totalLines', type: 'number', min: 0, defaultValue: 0 },
    { name: 'importedLines', type: 'number', min: 0, defaultValue: 0 },
    { name: 'failedLines', type: 'number', min: 0, defaultValue: 0 },
    { name: 'duplicateLines', type: 'number', min: 0, defaultValue: 0 },
    { name: 'importedTransactionCount', type: 'number', min: 0, defaultValue: 0 },
    { name: 'uploadedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true } },
    { name: 'importedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true } },
    { name: 'importedAt', type: 'date', admin: { readOnly: true } },
    { name: 'parseErrorSummary', type: 'textarea' },
    { name: 'notes', type: 'textarea' },
    { name: 'metadata', type: 'json' },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'updatedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, originalDoc }) => {
        if (!data) return data

        data.importBatchNumber = String(data.importBatchNumber || originalDoc?.importBatchNumber || generateImportBatchNumber()).trim()
        data.sourceFormat = String(data.sourceFormat || originalDoc?.sourceFormat || 'csv').trim() || 'csv'
        data.importStatus = String(data.importStatus || originalDoc?.importStatus || 'queued').trim() || 'queued'
        data.totalLines = normalizeNonNegativeNumber(data.totalLines, normalizeNonNegativeNumber(originalDoc?.totalLines))
        data.importedLines = normalizeNonNegativeNumber(data.importedLines, normalizeNonNegativeNumber(originalDoc?.importedLines))
        data.failedLines = normalizeNonNegativeNumber(data.failedLines, normalizeNonNegativeNumber(originalDoc?.failedLines))
        data.duplicateLines = normalizeNonNegativeNumber(
          data.duplicateLines,
          normalizeNonNegativeNumber(originalDoc?.duplicateLines),
        )
        data.importedTransactionCount = normalizeNonNegativeNumber(
          data.importedTransactionCount,
          normalizeNonNegativeNumber(originalDoc?.importedTransactionCount),
        )
        data.notes = normalizeOptionalText(data.notes)
        data.parseErrorSummary = normalizeOptionalText(data.parseErrorSummary)
        data.uploadedBy = data.uploadedBy || originalDoc?.uploadedBy || getRequestUserId(req)

        const isImportedLike = ['imported', 'partial_import'].includes(String(data.importStatus || ''))
        if (isImportedLike) {
          data.importedBy = data.importedBy || originalDoc?.importedBy || getRequestUserId(req)
          data.importedAt = data.importedAt || originalDoc?.importedAt || new Date().toISOString()
        } else if (data.importStatus === 'queued') {
          data.importedBy = null
          data.importedAt = null
        }

        applyCreatedAndUpdatedBy({ data, originalDoc, req })
        return data
      },
    ],
  },
}
