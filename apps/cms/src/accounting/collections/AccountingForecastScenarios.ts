import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_SCENARIO_STATUS_OPTIONS,
  ACCOUNTING_SCENARIO_TYPE_OPTIONS,
} from '../constants/accounting'
import { buildAuditedHooks, buildCreatedUpdatedByFields } from '../utils/phase4-collections'

export const AccountingForecastScenarios: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.forecastScenarios,
  dbName: 'acct_forecast_scenarios',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'scenarioType', 'fiscalYear', 'status'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Scenario planning records for forecasting and variance analysis.',
  },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'scenarioType', type: 'select', required: true, defaultValue: 'base_case', options: [...ACCOUNTING_SCENARIO_TYPE_OPTIONS] },
    { name: 'fiscalYear', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.fiscalYears, required: true, index: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [...ACCOUNTING_SCENARIO_STATUS_OPTIONS] },
    { name: 'assumptions', type: 'json' },
    { name: 'notes', type: 'textarea' },
    ...buildCreatedUpdatedByFields(),
  ],
  hooks: buildAuditedHooks('forecast_scenario'),
}
