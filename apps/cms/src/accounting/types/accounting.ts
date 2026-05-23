import type {
  ACCOUNT_SUB_TYPE_OPTIONS,
  ACCOUNT_TYPE_OPTIONS,
  FISCAL_YEAR_CLOSE_MODE_OPTIONS,
  FISCAL_YEAR_STATUS_OPTIONS,
  JOURNAL_SOURCE_TYPE_OPTIONS,
  JOURNAL_STATUS_OPTIONS,
  NORMAL_BALANCE_OPTIONS,
  PERIOD_STATUS_OPTIONS,
  POSTING_STATUS_OPTIONS,
  TAX_CALCULATION_METHOD_OPTIONS,
  TAX_SCOPE_OPTIONS,
} from '../constants/accounting'

type OptionValue<T extends readonly { value: string }[]> = T[number]['value']

export type AccountingAccountType = OptionValue<typeof ACCOUNT_TYPE_OPTIONS>
export type AccountingAccountSubType = OptionValue<typeof ACCOUNT_SUB_TYPE_OPTIONS>
export type AccountingNormalBalance = OptionValue<typeof NORMAL_BALANCE_OPTIONS>
export type AccountingFiscalYearStatus = OptionValue<typeof FISCAL_YEAR_STATUS_OPTIONS>
export type AccountingFiscalYearCloseMode = OptionValue<typeof FISCAL_YEAR_CLOSE_MODE_OPTIONS>
export type AccountingPeriodStatus = OptionValue<typeof PERIOD_STATUS_OPTIONS>
export type AccountingTaxScope = OptionValue<typeof TAX_SCOPE_OPTIONS>
export type AccountingTaxCalculationMethod = OptionValue<typeof TAX_CALCULATION_METHOD_OPTIONS>
export type AccountingJournalSourceType = OptionValue<typeof JOURNAL_SOURCE_TYPE_OPTIONS>
export type AccountingJournalStatus = OptionValue<typeof JOURNAL_STATUS_OPTIONS>
export type AccountingPostingStatus = OptionValue<typeof POSTING_STATUS_OPTIONS>

export type AccountingResolvedPostingWindow = {
  fiscalYear: {
    id: number | string
    status: AccountingFiscalYearStatus
    closeMode?: AccountingFiscalYearCloseMode | null
    startDate?: string | null
    endDate?: string | null
    lockedFromDate?: string | null
  }
  period: {
    id: number | string
    status: AccountingPeriodStatus
    startDate?: string | null
    endDate?: string | null
    lockedFromDate?: string | null
  }
}

export type AccountingLedgerRow = {
  journalEntryId: number | string
  journalEntryNumber?: string | null
  journalStatus?: string | null
  postingDate?: string | null
  entryDate?: string | null
  memo?: string | null
  lineId: number | string
  lineNumber?: number | null
  accountId: number | string
  accountCode?: string | null
  accountName?: string | null
  normalBalance?: AccountingNormalBalance | null
  description?: string | null
  debit: number
  credit: number
  runningBalance?: number | null
}

export type AccountingTrialBalanceRow = {
  accountId: number | string
  accountCode?: string | null
  accountName?: string | null
  accountType?: AccountingAccountType | null
  normalBalance?: AccountingNormalBalance | null
  totalDebit: number
  totalCredit: number
  closingBalance: number
}
