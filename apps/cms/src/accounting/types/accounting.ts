import type {
  ACCOUNT_SUB_TYPE_OPTIONS,
  ACCOUNT_TYPE_OPTIONS,
  ACCOUNTING_DOCUMENT_CATEGORY_OPTIONS,
  ACCOUNTING_ENTITY_TYPE_OPTIONS,
  ACCOUNTING_PARTY_STATUS_OPTIONS,
  BANK_ACCOUNT_TYPE_OPTIONS,
  BANK_RECONCILIATION_STATUS_OPTIONS,
  BANK_TRANSACTION_MATCH_STATUS_OPTIONS,
  CUSTOMER_TYPE_OPTIONS,
  DOCUMENT_STATUS_OPTIONS,
  EXPENSE_PAYMENT_METHOD_OPTIONS,
  FISCAL_YEAR_CLOSE_MODE_OPTIONS,
  FISCAL_YEAR_STATUS_OPTIONS,
  INVOICE_ITEM_TYPE_OPTIONS,
  JOURNAL_SOURCE_TYPE_OPTIONS,
  JOURNAL_STATUS_OPTIONS,
  LMS_ADJUSTMENT_DIRECTION_OPTIONS,
  LMS_ADJUSTMENT_TYPE_OPTIONS,
  LMS_ALLOCATION_TYPE_OPTIONS,
  LMS_BILLING_STATUS_OPTIONS,
  LMS_COVERAGE_TYPE_OPTIONS,
  LMS_PAYOUT_METHOD_OPTIONS,
  LMS_PAYOUT_STATUS_OPTIONS,
  LMS_RECEIPT_STATUS_OPTIONS,
  LMS_RECOGNITION_METHOD_OPTIONS,
  LMS_RECOGNITION_STATUS_OPTIONS,
  LMS_REFUND_STATUS_OPTIONS,
  LMS_REFUND_TYPE_OPTIONS,
  LMS_SCHOLARSHIP_AWARD_TYPE_OPTIONS,
  LMS_SPONSOR_STATUS_OPTIONS,
  NORMAL_BALANCE_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  PERIOD_STATUS_OPTIONS,
  POSTING_STATUS_OPTIONS,
  SIMPLE_POSTING_STATUS_OPTIONS,
  TAX_CALCULATION_METHOD_OPTIONS,
  TAX_SCOPE_OPTIONS,
  VENDOR_TYPE_OPTIONS,
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
export type AccountingPartyStatus = OptionValue<typeof ACCOUNTING_PARTY_STATUS_OPTIONS>
export type AccountingCustomerType = OptionValue<typeof CUSTOMER_TYPE_OPTIONS>
export type AccountingVendorType = OptionValue<typeof VENDOR_TYPE_OPTIONS>
export type AccountingDocumentStatus = OptionValue<typeof DOCUMENT_STATUS_OPTIONS>
export type AccountingSimplePostingStatus = OptionValue<typeof SIMPLE_POSTING_STATUS_OPTIONS>
export type AccountingPaymentMethod = OptionValue<typeof PAYMENT_METHOD_OPTIONS>
export type AccountingExpensePaymentMethod = OptionValue<typeof EXPENSE_PAYMENT_METHOD_OPTIONS>
export type AccountingBankAccountType = OptionValue<typeof BANK_ACCOUNT_TYPE_OPTIONS>
export type AccountingBankTransactionMatchStatus = OptionValue<typeof BANK_TRANSACTION_MATCH_STATUS_OPTIONS>
export type AccountingBankReconciliationStatus = OptionValue<typeof BANK_RECONCILIATION_STATUS_OPTIONS>
export type AccountingEntityType = OptionValue<typeof ACCOUNTING_ENTITY_TYPE_OPTIONS>
export type AccountingDocumentCategory = OptionValue<typeof ACCOUNTING_DOCUMENT_CATEGORY_OPTIONS>
export type AccountingInvoiceItemType = OptionValue<typeof INVOICE_ITEM_TYPE_OPTIONS>
export type AccountingLmsBillingStatus = OptionValue<typeof LMS_BILLING_STATUS_OPTIONS>
export type AccountingLmsAllocationType = OptionValue<typeof LMS_ALLOCATION_TYPE_OPTIONS>
export type AccountingLmsReceiptStatus = OptionValue<typeof LMS_RECEIPT_STATUS_OPTIONS>
export type AccountingLmsRefundType = OptionValue<typeof LMS_REFUND_TYPE_OPTIONS>
export type AccountingLmsRefundStatus = OptionValue<typeof LMS_REFUND_STATUS_OPTIONS>
export type AccountingLmsAdjustmentType = OptionValue<typeof LMS_ADJUSTMENT_TYPE_OPTIONS>
export type AccountingLmsAdjustmentDirection = OptionValue<typeof LMS_ADJUSTMENT_DIRECTION_OPTIONS>
export type AccountingLmsRecognitionMethod = OptionValue<typeof LMS_RECOGNITION_METHOD_OPTIONS>
export type AccountingLmsRecognitionStatus = OptionValue<typeof LMS_RECOGNITION_STATUS_OPTIONS>
export type AccountingLmsSponsorStatus = OptionValue<typeof LMS_SPONSOR_STATUS_OPTIONS>
export type AccountingLmsScholarshipAwardType = OptionValue<typeof LMS_SCHOLARSHIP_AWARD_TYPE_OPTIONS>
export type AccountingLmsCoverageType = OptionValue<typeof LMS_COVERAGE_TYPE_OPTIONS>
export type AccountingLmsPayoutMethod = OptionValue<typeof LMS_PAYOUT_METHOD_OPTIONS>
export type AccountingLmsPayoutStatus = OptionValue<typeof LMS_PAYOUT_STATUS_OPTIONS>

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

export type AccountingAgingBucketRow = {
  entityId: number | string
  entityCode?: string | null
  entityName?: string | null
  documentId: number | string
  documentNumber?: string | null
  documentDate?: string | null
  dueDate?: string | null
  currency?: string | null
  total: number
  balanceDue: number
  currentAmount: number
  bucket1to30: number
  bucket31to60: number
  bucket61to90: number
  bucketOver90: number
  daysOverdue: number
}

export type AccountingRegisterRow = {
  documentId: number | string
  documentNumber?: string | null
  postingDate?: string | null
  documentDate?: string | null
  dueDate?: string | null
  partyId?: number | string | null
  partyCode?: string | null
  partyName?: string | null
  status?: string | null
  currency?: string | null
  total: number
  balanceDue?: number | null
  postedJournalEntryId?: number | string | null
}

export type AccountingDashboardSummary = {
  totalReceivables: number
  totalPayables: number
  overdueInvoiceCount: number
  overdueBillCount: number
  totalCashAndBank: number
}

export type AccountingDashboardPaymentRow = {
  entityType: 'payment_received' | 'payment_made'
  documentId: number | string
  documentNumber?: string | null
  documentDate?: string | null
  partyId?: number | string | null
  partyCode?: string | null
  partyName?: string | null
  currency?: string | null
  total: number
}

export type AccountingDashboardData = {
  summary: AccountingDashboardSummary
  recentInvoices: AccountingRegisterRow[]
  recentBills: AccountingRegisterRow[]
  recentPayments: AccountingDashboardPaymentRow[]
}

export type AccountingCashActivityRow = {
  entityType: AccountingEntityType | 'bank_account'
  entityId: number | string
  documentNumber?: string | null
  activityDate?: string | null
  bankAccountId?: number | string | null
  bankAccountName?: string | null
  direction: 'inflow' | 'outflow' | 'transfer'
  amount: number
  status?: string | null
  memo?: string | null
}

export type AccountingTaxSummaryRow = {
  taxCodeId?: number | string | null
  taxCode?: string | null
  taxName?: string | null
  taxScope?: AccountingTaxScope | null
  calculationMethod?: AccountingTaxCalculationMethod | null
  taxableAmount: number
  taxAmount: number
  sourceDocumentCount: number
}

export type AccountingReconciliationMatchRow = {
  bankTransactionId: number | string
  transactionDate?: string | null
  description?: string | null
  referenceNumber?: string | null
  amountIn: number
  amountOut: number
  runningBalance?: number | null
  matchStatus?: AccountingBankTransactionMatchStatus | null
  matchedEntityType?: AccountingEntityType | null
  matchedEntityId?: string | null
}

export type AccountingReconciliationSnapshot = {
  bankAccountId: number | string
  statementStartDate?: string | null
  statementEndDate?: string | null
  bankTransactionCount: number
  matchedTransactionCount: number
  unmatchedTransactionCount: number
  statementActivityNet: number
  statementClosingBalance: number
  bookClosingBalance: number
  differenceAmount: number
  canComplete: boolean
  matches: AccountingReconciliationMatchRow[]
}

export type AccountingEnrollmentFinanceSummary = {
  enrollmentId: number | string
  billingLinkId?: number | string | null
  invoiceId?: number | string | null
  invoiceNumber?: string | null
  customerId?: number | string | null
  customerName?: string | null
  enrollmentType?: string | null
  billingStatus: AccountingLmsBillingStatus
  listPrice: number
  salePrice: number
  couponDiscount: number
  scholarshipDiscount: number
  corporateCoverage: number
  adjustmentsNet: number
  finalCharge: number
  amountAllocated: number
  amountPaid: number
  balanceDue: number
  currency: string
}

export type AccountingCorporateReceivableRow = {
  corporateAccountId: number | string
  corporateAccountCode?: string | null
  corporateAccountName?: string | null
  invoiceId?: number | string | null
  invoiceNumber?: string | null
  enrollmentBillingLinkId?: number | string | null
  coveredAmount: number
  traineeShareAmount: number
  balanceDue: number
  status?: string | null
}

export type AccountingScholarshipUtilizationRow = {
  sponsorId: number | string
  sponsorCode?: string | null
  sponsorName?: string | null
  awardCount: number
  awardedAmount: number
  traineeShareAmount: number
  billedSponsorAmount: number
}

export type AccountingCouponRevenueImpactRow = {
  couponId?: number | string | null
  couponCode?: string | null
  enrollmentCount: number
  grossRevenue: number
  couponDiscountAmount: number
  netRevenue: number
}

export type AccountingCompletionRevenueRow = {
  enrollmentId: number | string
  courseId?: number | string | null
  courseTitle?: string | null
  completedAt?: string | null
  finalCharge: number
  recognizedRevenue: number
  remainingDeferredRevenue: number
}

export type AccountingCertificateRevenueRow = {
  certificateId: number | string
  enrollmentId?: number | string | null
  courseId?: number | string | null
  courseTitle?: string | null
  issueDate?: string | null
  billedAmount: number
}
