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

        data.journalNumberPrefix = String(data.journalNumberPrefix || DEFAULT_ACCOUNTING_SETTINGS.journalNumberPrefix)
          .trim()
          .toUpperCase()
        data.updatedBy = getRequestUserId(req)

        return data
      },
    ],
  },
}
