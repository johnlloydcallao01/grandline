import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
} from '../constants/accounting'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'

export const ACCOUNT_MAPPING_ENTRY_TYPE_OPTIONS = [
  { label: 'Salary', value: 'salary' },
  { label: 'Contractor', value: 'contractor' },
  { label: 'Reimbursement', value: 'reimbursement' },
  { label: 'Adjustment', value: 'adjustment' },
] as const

export const ACCOUNT_MAPPING_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Approved', value: 'approved' },
  { label: 'Posted', value: 'posted' },
  { label: 'Voided', value: 'voided' },
] as const

export const AccountingPayrollAccountMappings: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.payrollAccountMappings,
  dbName: 'acct_payroll_account_mappings',
  admin: {
    useAsTitle: 'person',
    defaultColumns: ['entryType', 'person', 'expenseAccount', 'payableAccount', 'deductionAmount', 'status'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Payroll account mapping rules linking entry types and persons to expense and payable accounts.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'entryType',
      type: 'select',
      required: true,
      defaultValue: 'salary',
      options: [...ACCOUNT_MAPPING_ENTRY_TYPE_OPTIONS],
      index: true,
    },
    {
      name: 'person',
      type: 'text',
      required: true,
      admin: { description: 'Name of the person (employee, contractor, or instructor)' },
    },
    {
      name: 'expenseAccount',
      type: 'relationship',
      relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
      required: true,
      index: true,
    },
    {
      name: 'payableAccount',
      type: 'relationship',
      relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
      required: true,
      index: true,
    },
    {
      name: 'deductionAmount',
      type: 'number',
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [...ACCOUNT_MAPPING_STATUS_OPTIONS],
      index: true,
    },
    { name: 'notes', type: 'textarea' },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'updatedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, originalDoc }) => {
        if (!data) return data
        applyCreatedAndUpdatedBy({ data, originalDoc, req })
        return data
      },
    ],
  },
}
