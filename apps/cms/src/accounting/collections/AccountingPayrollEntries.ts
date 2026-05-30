import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_PAYROLL_ENTRY_STATUS_OPTIONS,
  ACCOUNTING_PAYROLL_ENTRY_TYPE_OPTIONS,
} from '../constants/accounting'
import { AccountingPayrollService } from '../services/payroll/AccountingPayrollService'
import { buildAuditedHooks, buildCreatedUpdatedByFields } from '../utils/phase4-collections'

const auditedHooks = buildAuditedHooks('payroll_entry') ?? {}

export const AccountingPayrollEntries: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.payrollEntries,
  dbName: 'acct_payroll_entries',
  admin: {
    useAsTitle: 'entryType',
    defaultColumns: ['payrollRun', 'user', 'instructor', 'entryType', 'netAmount', 'status'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Person-level payroll or contractor payout rows grouped under payroll runs.',
  },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'payrollRun', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.payrollRuns, required: true, index: true },
    { name: 'user', type: 'relationship', relationTo: 'users', index: true },
    { name: 'instructor', type: 'relationship', relationTo: 'instructors', index: true },
    { name: 'project', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.projects, index: true },
    { name: 'entryType', type: 'select', required: true, defaultValue: 'salary', options: [...ACCOUNTING_PAYROLL_ENTRY_TYPE_OPTIONS] },
    { name: 'grossAmount', type: 'number', required: true, min: 0, defaultValue: 0 },
    { name: 'deductionAmount', type: 'number', min: 0, defaultValue: 0 },
    { name: 'netAmount', type: 'number', required: true, defaultValue: 0 },
    { name: 'expenseAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts, required: true },
    { name: 'payableAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts, required: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [...ACCOUNTING_PAYROLL_ENTRY_STATUS_OPTIONS] },
    { name: 'notes', type: 'textarea' },
    ...buildCreatedUpdatedByFields(),
  ],
  hooks: {
    ...auditedHooks,
    beforeChange: [
      ...(auditedHooks.beforeChange || []),
      ({ data }) => {
        if (!data) return data
        data.netAmount = AccountingPayrollService.calculateNetAmount(data)
        return data
      },
    ],
  },
}
