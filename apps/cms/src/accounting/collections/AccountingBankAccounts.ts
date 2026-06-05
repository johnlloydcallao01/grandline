import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  BANK_ACCOUNT_TYPE_OPTIONS,
} from '../constants/accounting'
import { AccountingBankAccountService } from '../services/banking/AccountingBankAccountService'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'

export const AccountingBankAccounts: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.bankAccounts,
  admin: {
    useAsTitle: 'accountName',
    defaultColumns: ['accountName', 'bankName', 'accountType', 'currencyReference', 'isActive'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Bank, cash on hand, and undeposited funds master accounts.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'accountName', type: 'text', required: true },
    { name: 'accountNumberMasked', type: 'text' },
    { name: 'bankName', type: 'text' },
    { name: 'branchName', type: 'text' },
    { name: 'accountType', type: 'select', required: true, defaultValue: 'bank', options: [...BANK_ACCOUNT_TYPE_OPTIONS], index: true },
    {
      name: 'currencyReference',
      type: 'relationship',
      relationTo: ACCOUNTING_COLLECTION_SLUGS.currencies,
      required: true,
      index: true,
    },
    { name: 'ledgerAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts, required: true, index: true },
    { name: 'isDefaultReceiptAccount', type: 'checkbox', defaultValue: false },
    { name: 'isDefaultDisbursementAccount', type: 'checkbox', defaultValue: false },
    { name: 'isActive', type: 'checkbox', defaultValue: true, index: true },
    { name: 'notes', type: 'textarea' },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'updatedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (!data) return data
        AccountingBankAccountService.normalizeData(data)
        await AccountingBankAccountService.validateLookupReferences(req.payload, data)
        applyCreatedAndUpdatedBy({ data, req })
        return data
      },
    ],
  },
}
