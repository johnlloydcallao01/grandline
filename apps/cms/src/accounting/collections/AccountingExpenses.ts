import { APIError, type CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  EXPENSE_PAYMENT_METHOD_OPTIONS,
  SIMPLE_POSTING_STATUS_OPTIONS,
} from '../constants/accounting'
import { AccountingExpenseService } from '../services/expenses/AccountingExpenseService'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'
import { isTerminalSimplePostingStatus } from '../utils/commercial'

export const AccountingExpenses: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.expenses,
  admin: {
    useAsTitle: 'expenseNumber',
    defaultColumns: ['expenseNumber', 'expenseDate', 'vendor', 'total', 'status'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Direct expenses that post immediately to expense and cash or bank accounts.',
  },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'expenseNumber', type: 'text', required: true, unique: true, index: true },
    { name: 'expenseDate', type: 'date', required: true, defaultValue: () => new Date().toISOString() },
    { name: 'postingDate', type: 'date', required: true, defaultValue: () => new Date().toISOString() },
    { name: 'fiscalYear', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.fiscalYears, admin: { readOnly: true } },
    { name: 'period', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.periods, admin: { readOnly: true } },
    { name: 'vendor', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.vendors },
    { name: 'expenseCategory', type: 'text' },
    { name: 'paymentMethod', type: 'select', required: true, defaultValue: 'bank', options: [...EXPENSE_PAYMENT_METHOD_OPTIONS] },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [...SIMPLE_POSTING_STATUS_OPTIONS], index: true },
    { name: 'currency', type: 'text', required: true, defaultValue: 'PHP' },
    { name: 'subtotal', type: 'number', required: true, min: 0, defaultValue: 0 },
    { name: 'taxTotal', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'total', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'expenseAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts, required: true },
    { name: 'taxCode', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.taxCodes },
    { name: 'paymentAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts },
    { name: 'bankAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.bankAccounts },
    { name: 'postedJournalEntry', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.journalEntries, admin: { readOnly: true } },
    { name: 'notes', type: 'textarea' },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'updatedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc, operation }) => {
        if (!data) return data
        if (originalDoc && isTerminalSimplePostingStatus(String(originalDoc.status || ''))) {
          throw new APIError('Posted or voided expenses cannot be edited directly.', 400)
        }
        if (operation === 'create' && !data.expenseNumber) {
          data.expenseNumber = await AccountingExpenseService.generateExpenseNumber(req.payload)
        }
        AccountingExpenseService.normalizeHeader(data)
        applyCreatedAndUpdatedBy({ data, originalDoc, req })
        return data
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        const expense = await req.payload.findByID({
          collection: ACCOUNTING_COLLECTION_SLUGS.expenses,
          id,
          depth: 0,
          overrideAccess: true,
        })
        if (isTerminalSimplePostingStatus(String(expense?.status || ''))) {
          throw new APIError('Posted or voided expenses cannot be deleted.', 400)
        }
      },
    ],
  },
}
