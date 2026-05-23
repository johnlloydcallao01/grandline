export const ACCOUNTING_ADMIN_GROUP = 'Accounting'

export const ACCOUNTING_COLLECTION_SLUGS = {
  chartOfAccounts: 'accounting-chart-of-accounts',
  fiscalYears: 'accounting-fiscal-years',
  periods: 'accounting-periods',
  taxCodes: 'accounting-tax-codes',
  journalEntries: 'accounting-journal-entries',
  journalEntryLines: 'accounting-journal-entry-lines',
} as const

export const ACCOUNTING_GLOBAL_SLUGS = {
  settings: 'accounting-settings',
} as const

export const ACCOUNT_TYPE_OPTIONS = [
  { label: 'Asset', value: 'asset' },
  { label: 'Liability', value: 'liability' },
  { label: 'Equity', value: 'equity' },
  { label: 'Revenue', value: 'revenue' },
  { label: 'Expense', value: 'expense' },
] as const

export const ACCOUNT_SUB_TYPE_OPTIONS = [
  { label: 'Cash And Cash Equivalents', value: 'cash_and_cash_equivalents' },
  { label: 'Bank', value: 'bank' },
  { label: 'Accounts Receivable', value: 'accounts_receivable' },
  { label: 'Prepaid Expense', value: 'prepaid_expense' },
  { label: 'Fixed Asset', value: 'fixed_asset' },
  { label: 'Other Asset', value: 'other_asset' },
  { label: 'Accounts Payable', value: 'accounts_payable' },
  { label: 'Accrued Liability', value: 'accrued_liability' },
  { label: 'Deferred Revenue', value: 'deferred_revenue' },
  { label: 'Tax Payable', value: 'tax_payable' },
  { label: 'Other Liability', value: 'other_liability' },
  { label: 'Owner Equity', value: 'owner_equity' },
  { label: 'Retained Earnings', value: 'retained_earnings' },
  { label: 'Revenue', value: 'revenue' },
  { label: 'Other Income', value: 'other_income' },
  { label: 'Cost Of Sales', value: 'cost_of_sales' },
  { label: 'Operating Expense', value: 'operating_expense' },
  { label: 'Tax Expense', value: 'tax_expense' },
  { label: 'Other Expense', value: 'other_expense' },
] as const

export const NORMAL_BALANCE_OPTIONS = [
  { label: 'Debit', value: 'debit' },
  { label: 'Credit', value: 'credit' },
] as const

export const FISCAL_YEAR_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Open', value: 'open' },
  { label: 'Closed', value: 'closed' },
] as const

export const FISCAL_YEAR_CLOSE_MODE_OPTIONS = [
  { label: 'Manual', value: 'manual' },
  { label: 'Hard Lock', value: 'hard_lock' },
] as const

export const PERIOD_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Open', value: 'open' },
  { label: 'Soft Locked', value: 'soft_locked' },
  { label: 'Closed', value: 'closed' },
] as const

export const TAX_SCOPE_OPTIONS = [
  { label: 'Sales', value: 'sales' },
  { label: 'Purchase', value: 'purchase' },
  { label: 'Both', value: 'both' },
] as const

export const TAX_CALCULATION_METHOD_OPTIONS = [
  { label: 'Exclusive', value: 'exclusive' },
  { label: 'Inclusive', value: 'inclusive' },
] as const

export const JOURNAL_SOURCE_TYPE_OPTIONS = [
  { label: 'Manual', value: 'manual' },
  { label: 'Opening Balance', value: 'opening_balance' },
  { label: 'Adjustment', value: 'adjustment' },
  { label: 'Reversal', value: 'reversal' },
  { label: 'System', value: 'system' },
] as const

export const JOURNAL_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Posted', value: 'posted' },
  { label: 'Reversed', value: 'reversed' },
  { label: 'Voided', value: 'voided' },
] as const

export const POSTING_STATUS_OPTIONS = [
  { label: 'Unposted', value: 'unposted' },
  { label: 'Posted', value: 'posted' },
  { label: 'Reversed', value: 'reversed' },
  { label: 'Voided', value: 'voided' },
] as const

export const DEFAULT_ACCOUNTING_SETTINGS = {
  baseCurrency: 'PHP',
  timezone: 'Asia/Manila',
  journalNumberPrefix: 'JE',
  openingBalanceSourceType: 'opening_balance',
  allowBackdatedPosting: false,
  defaultTaxBehavior: 'exclusive',
} as const

export const ACCOUNTING_HOOK_CONTEXT = {
  skipJournalTotalsSync: 'skipJournalTotalsSync',
  skipPostedImmutability: 'skipPostedImmutability',
  skipReversalSync: 'skipReversalSync',
} as const
