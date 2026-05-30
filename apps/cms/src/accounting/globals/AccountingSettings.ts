import type { GlobalConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_GLOBAL_SLUGS,
  DEFAULT_ACCOUNTING_SETTINGS,
  JOURNAL_SOURCE_TYPE_OPTIONS,
  TAX_CALCULATION_METHOD_OPTIONS,
} from '../constants/accounting'
import { getRequestUserId } from '../utils/accounting-audit'

export const AccountingSettings: GlobalConfig = {
  slug: ACCOUNTING_GLOBAL_SLUGS.settings,
  label: 'Accounting Settings',
  admin: {
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Accounting-wide defaults for journals, posting controls, and master settings.',
  },
  access: {
    read: adminOnly,
    update: adminOnly,
  },
  fields: [
    {
      name: 'baseCurrency',
      type: 'text',
      required: true,
      defaultValue: DEFAULT_ACCOUNTING_SETTINGS.baseCurrency,
    },
    {
      name: 'timezone',
      type: 'text',
      required: true,
      defaultValue: DEFAULT_ACCOUNTING_SETTINGS.timezone,
    },
    {
      name: 'journalNumberPrefix',
      type: 'text',
      required: true,
      defaultValue: DEFAULT_ACCOUNTING_SETTINGS.journalNumberPrefix,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'customerNumberPrefix',
          type: 'text',
          required: true,
          defaultValue: DEFAULT_ACCOUNTING_SETTINGS.customerNumberPrefix,
        },
        {
          name: 'vendorNumberPrefix',
          type: 'text',
          required: true,
          defaultValue: DEFAULT_ACCOUNTING_SETTINGS.vendorNumberPrefix,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'invoiceNumberPrefix',
          type: 'text',
          required: true,
          defaultValue: DEFAULT_ACCOUNTING_SETTINGS.invoiceNumberPrefix,
        },
        {
          name: 'billNumberPrefix',
          type: 'text',
          required: true,
          defaultValue: DEFAULT_ACCOUNTING_SETTINGS.billNumberPrefix,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'paymentReceivedNumberPrefix',
          type: 'text',
          required: true,
          defaultValue: DEFAULT_ACCOUNTING_SETTINGS.paymentReceivedNumberPrefix,
        },
        {
          name: 'paymentMadeNumberPrefix',
          type: 'text',
          required: true,
          defaultValue: DEFAULT_ACCOUNTING_SETTINGS.paymentMadeNumberPrefix,
        },
        {
          name: 'officialReceiptNumberPrefix',
          type: 'text',
          required: true,
          defaultValue: DEFAULT_ACCOUNTING_SETTINGS.officialReceiptNumberPrefix,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'creditNoteNumberPrefix',
          type: 'text',
          required: true,
          defaultValue: DEFAULT_ACCOUNTING_SETTINGS.creditNoteNumberPrefix,
        },
        {
          name: 'vendorCreditNumberPrefix',
          type: 'text',
          required: true,
          defaultValue: DEFAULT_ACCOUNTING_SETTINGS.vendorCreditNumberPrefix,
        },
        {
          name: 'refundNumberPrefix',
          type: 'text',
          required: true,
          defaultValue: DEFAULT_ACCOUNTING_SETTINGS.refundNumberPrefix,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'depositNumberPrefix',
          type: 'text',
          required: true,
          defaultValue: DEFAULT_ACCOUNTING_SETTINGS.depositNumberPrefix,
        },
        {
          name: 'transferNumberPrefix',
          type: 'text',
          required: true,
          defaultValue: DEFAULT_ACCOUNTING_SETTINGS.transferNumberPrefix,
        },
      ],
    },
    {
      name: 'openingBalanceSourceType',
      type: 'select',
      required: true,
      defaultValue: DEFAULT_ACCOUNTING_SETTINGS.openingBalanceSourceType,
      options: [...JOURNAL_SOURCE_TYPE_OPTIONS],
    },
    {
      name: 'defaultSuspenseAccount',
      type: 'relationship',
      relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
    },
    {
      name: 'defaultReceivableAccount',
      type: 'relationship',
      relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
    },
    {
      name: 'defaultPayableAccount',
      type: 'relationship',
      relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
    },
    {
      name: 'defaultUndepositedFundsAccount',
      type: 'relationship',
      relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
    },
    {
      name: 'defaultOutputTaxAccount',
      type: 'relationship',
      relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
    },
    {
      name: 'defaultInputTaxAccount',
      type: 'relationship',
      relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
    },
    {
      name: 'retainedEarningsAccount',
      type: 'relationship',
      relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
    },
    {
      name: 'allowBackdatedPosting',
      type: 'checkbox',
      defaultValue: DEFAULT_ACCOUNTING_SETTINGS.allowBackdatedPosting,
    },
    {
      name: 'defaultTaxBehavior',
      type: 'select',
      required: true,
      defaultValue: DEFAULT_ACCOUNTING_SETTINGS.defaultTaxBehavior,
      options: [...TAX_CALCULATION_METHOD_OPTIONS],
    },
    {
      name: 'updatedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        if (!data) {
          return data
        }

        const prefixFields = [
          'journalNumberPrefix',
          'customerNumberPrefix',
          'vendorNumberPrefix',
          'invoiceNumberPrefix',
          'billNumberPrefix',
          'paymentReceivedNumberPrefix',
          'paymentMadeNumberPrefix',
          'officialReceiptNumberPrefix',
          'creditNoteNumberPrefix',
          'vendorCreditNumberPrefix',
          'refundNumberPrefix',
          'depositNumberPrefix',
          'transferNumberPrefix',
        ] as const

        for (const field of prefixFields) {
          data[field] = String(data[field] || DEFAULT_ACCOUNTING_SETTINGS[field] || '')
            .trim()
            .toUpperCase()
        }

        data.updatedBy = getRequestUserId(req)

        return data
      },
    ],
  },
}
