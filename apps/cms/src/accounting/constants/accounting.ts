export const ACCOUNTING_ADMIN_GROUP = 'Accounting'

export const ACCOUNTING_COLLECTION_SLUGS = {
  chartOfAccounts: 'accounting-chart-of-accounts',
  fiscalYears: 'accounting-fiscal-years',
  periods: 'accounting-periods',
  taxCodes: 'accounting-tax-codes',
  journalEntries: 'accounting-journal-entries',
  journalEntryLines: 'accounting-journal-entry-lines',
  currencies: 'accounting-currencies',
  paymentTerms: 'accounting-payment-terms',
  customers: 'accounting-customers',
  vendors: 'accounting-vendors',
  invoices: 'accounting-invoices',
  invoiceLineItems: 'accounting-invoice-line-items',
  bills: 'accounting-bills',
  billLineItems: 'accounting-bill-line-items',
  paymentsReceived: 'accounting-payments-received',
  paymentsMade: 'accounting-payments-made',
  expenses: 'accounting-expenses',
  creditNotes: 'accounting-credit-notes',
  vendorCredits: 'accounting-vendor-credits',
  bankAccounts: 'accounting-bank-accounts',
  bankStatementImports: 'accounting-bank-statement-imports',
  bankTransactions: 'accounting-bank-transactions',
  bankReconciliations: 'accounting-bank-reconciliations',
  deposits: 'accounting-deposits',
  transfers: 'accounting-transfers',
  documentLinks: 'accounting-document-links',
  enrollmentBillingLinks: 'accounting-enrollment-billing-links',
  paymentAllocations: 'accounting-payment-allocations',
  receipts: 'accounting-receipts',
  refunds: 'accounting-refunds',
  billingAdjustments: 'accounting-billing-adjustments',
  revenueRecognitionSchedules: 'accounting-revenue-recognition-schedules',
  scholarshipSponsors: 'accounting-scholarship-sponsors',
  scholarshipAwards: 'accounting-scholarship-awards',
  corporateAccounts: 'accounting-corporate-accounts',
  corporateBillingLinks: 'accounting-corporate-billing-links',
  instructorPayoutRules: 'accounting-instructor-payout-rules',
  instructorPayouts: 'accounting-instructor-payouts',
  courseFeeProfiles: 'accounting-course-fee-profiles',
  branches: 'accounting-branches',
  departments: 'accounting-departments',
  locations: 'accounting-locations',
  projects: 'accounting-projects',
  projectTasks: 'accounting-project-tasks',
  timeEntries: 'accounting-time-entries',
  timesheets: 'accounting-timesheets',
  budgets: 'accounting-budgets',
  budgetLines: 'accounting-budget-lines',
  forecastScenarios: 'accounting-forecast-scenarios',
  fixedAssets: 'accounting-fixed-assets',
  depreciationEntries: 'accounting-depreciation-entries',
  assetDisposals: 'accounting-asset-disposals',
  payrollRuns: 'accounting-payroll-runs',
  payrollEntries: 'accounting-payroll-entries',
  approvalWorkflows: 'accounting-approval-workflows',
  approvalRequests: 'accounting-approval-requests',
  auditLogs: 'accounting-audit-logs',
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

export const ACCOUNTING_PARTY_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'On Hold', value: 'on_hold' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Archived', value: 'archived' },
] as const

export const CUSTOMER_TYPE_OPTIONS = [
  { label: 'Individual', value: 'individual' },
  { label: 'Company', value: 'company' },
  { label: 'Sponsor', value: 'sponsor' },
  { label: 'Other', value: 'other' },
] as const

export const VENDOR_TYPE_OPTIONS = [
  { label: 'Supplier', value: 'supplier' },
  { label: 'Contractor', value: 'contractor' },
  { label: 'Utility', value: 'utility' },
  { label: 'Government', value: 'government' },
  { label: 'Other', value: 'other' },
] as const

export const DOCUMENT_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Approved', value: 'approved' },
  { label: 'Posted', value: 'posted' },
  { label: 'Partially Paid', value: 'partially_paid' },
  { label: 'Paid', value: 'paid' },
  { label: 'Voided', value: 'voided' },
] as const

export const SIMPLE_POSTING_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Posted', value: 'posted' },
  { label: 'Voided', value: 'voided' },
] as const

export const BANK_RECONCILIATION_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Locked', value: 'locked' },
] as const

export const PAYMENT_METHOD_OPTIONS = [
  { label: 'Cash', value: 'cash' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Check', value: 'check' },
  { label: 'Card', value: 'card' },
  { label: 'E-Wallet', value: 'e_wallet' },
  { label: 'Other', value: 'other' },
] as const

export const EXPENSE_PAYMENT_METHOD_OPTIONS = [
  { label: 'Cash', value: 'cash' },
  { label: 'Bank', value: 'bank' },
  { label: 'Card', value: 'card' },
  { label: 'Other', value: 'other' },
] as const

export const BANK_ACCOUNT_TYPE_OPTIONS = [
  { label: 'Bank', value: 'bank' },
  { label: 'Cash On Hand', value: 'cash_on_hand' },
  { label: 'Undeposited Funds', value: 'undeposited_funds' },
] as const

export const BANK_TRANSACTION_MATCH_STATUS_OPTIONS = [
  { label: 'Unmatched', value: 'unmatched' },
  { label: 'Suggested', value: 'suggested' },
  { label: 'Matched', value: 'matched' },
  { label: 'Ignored', value: 'ignored' },
] as const

export const ACCOUNTING_DOCUMENT_CATEGORY_OPTIONS = [
  { label: 'Invoice', value: 'invoice' },
  { label: 'Bill', value: 'bill' },
  { label: 'Receipt', value: 'receipt' },
  { label: 'Proof Of Payment', value: 'proof_of_payment' },
  { label: 'Expense Receipt', value: 'expense_receipt' },
  { label: 'Bank Statement', value: 'bank_statement' },
  { label: 'Contract', value: 'contract' },
  { label: 'Tax', value: 'tax' },
  { label: 'Other', value: 'other' },
] as const

export const ACCOUNTING_ENTITY_TYPE_OPTIONS = [
  { label: 'Customer', value: 'customer' },
  { label: 'Vendor', value: 'vendor' },
  { label: 'Invoice', value: 'invoice' },
  { label: 'Bill', value: 'bill' },
  { label: 'Payment Received', value: 'payment_received' },
  { label: 'Payment Made', value: 'payment_made' },
  { label: 'Expense', value: 'expense' },
  { label: 'Credit Note', value: 'credit_note' },
  { label: 'Vendor Credit', value: 'vendor_credit' },
  { label: 'Bank Transaction', value: 'bank_transaction' },
  { label: 'Bank Reconciliation', value: 'bank_reconciliation' },
  { label: 'Deposit', value: 'deposit' },
  { label: 'Transfer', value: 'transfer' },
  { label: 'Journal Entry', value: 'journal_entry' },
  { label: 'Enrollment Billing Link', value: 'enrollment_billing_link' },
  { label: 'Payment Allocation', value: 'payment_allocation' },
  { label: 'Receipt', value: 'receipt' },
  { label: 'Refund', value: 'refund' },
  { label: 'Revenue Recognition Schedule', value: 'revenue_recognition_schedule' },
  { label: 'Scholarship Award', value: 'scholarship_award' },
  { label: 'Corporate Billing Link', value: 'corporate_billing_link' },
  { label: 'Instructor Payout', value: 'instructor_payout' },
  { label: 'Branch', value: 'branch' },
  { label: 'Department', value: 'department' },
  { label: 'Location', value: 'location' },
  { label: 'Project', value: 'project' },
  { label: 'Project Task', value: 'project_task' },
  { label: 'Time Entry', value: 'time_entry' },
  { label: 'Timesheet', value: 'timesheet' },
  { label: 'Budget', value: 'budget' },
  { label: 'Forecast Scenario', value: 'forecast_scenario' },
  { label: 'Fixed Asset', value: 'fixed_asset' },
  { label: 'Depreciation Entry', value: 'depreciation_entry' },
  { label: 'Asset Disposal', value: 'asset_disposal' },
  { label: 'Payroll Run', value: 'payroll_run' },
  { label: 'Payroll Entry', value: 'payroll_entry' },
  { label: 'Approval Workflow', value: 'approval_workflow' },
  { label: 'Approval Request', value: 'approval_request' },
  { label: 'Audit Log', value: 'audit_log' },
] as const

export const INVOICE_ITEM_TYPE_OPTIONS = [
  { label: 'Service', value: 'service' },
  { label: 'Product', value: 'product' },
  { label: 'Fee', value: 'fee' },
  { label: 'Other', value: 'other' },
] as const

export const LMS_BILLING_STATUS_OPTIONS = [
  { label: 'Not Started', value: 'not_started' },
  { label: 'Drafted', value: 'drafted' },
  { label: 'Invoiced', value: 'invoiced' },
  { label: 'Partially Paid', value: 'partially_paid' },
  { label: 'Paid', value: 'paid' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Refunded', value: 'refunded' },
] as const

export const LMS_ALLOCATION_TYPE_OPTIONS = [
  { label: 'Invoice Settlement', value: 'invoice_settlement' },
  { label: 'Deposit Application', value: 'deposit_application' },
  { label: 'Installment Payment', value: 'installment_payment' },
  { label: 'Refund Reversal', value: 'refund_reversal' },
  { label: 'Manual Adjustment', value: 'manual_adjustment' },
] as const

export const LMS_RECEIPT_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Issued', value: 'issued' },
  { label: 'Voided', value: 'voided' },
] as const

export const LMS_REFUND_TYPE_OPTIONS = [
  { label: 'Full', value: 'full' },
  { label: 'Partial', value: 'partial' },
  { label: 'Credit Only', value: 'credit_only' },
] as const

export const LMS_REFUND_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Requested', value: 'requested' },
  { label: 'Approved', value: 'approved' },
  { label: 'Processed', value: 'processed' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Voided', value: 'voided' },
] as const

export const LMS_ADJUSTMENT_TYPE_OPTIONS = [
  { label: 'Manual Discount', value: 'manual_discount' },
  { label: 'Manual Surcharge', value: 'manual_surcharge' },
  { label: 'Late Fee', value: 'late_fee' },
  { label: 'Certificate Fee', value: 'certificate_fee' },
  { label: 'Retake Fee', value: 'retake_fee' },
  { label: 'Reassessment Fee', value: 'reassessment_fee' },
  { label: 'Renewal Fee', value: 'renewal_fee' },
] as const

export const LMS_ADJUSTMENT_DIRECTION_OPTIONS = [
  { label: 'Increase', value: 'increase' },
  { label: 'Decrease', value: 'decrease' },
] as const

export const LMS_RECOGNITION_METHOD_OPTIONS = [
  { label: 'On Activation', value: 'on_activation' },
  { label: 'Straight Line', value: 'straight_line' },
  { label: 'Completion Based', value: 'completion_based' },
  { label: 'Certificate Based', value: 'certificate_based' },
  { label: 'Manual', value: 'manual' },
] as const

export const LMS_RECOGNITION_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Partially Recognized', value: 'partially_recognized' },
  { label: 'Recognized', value: 'recognized' },
  { label: 'Cancelled', value: 'cancelled' },
] as const

export const LMS_SPONSOR_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Archived', value: 'archived' },
] as const

export const LMS_SCHOLARSHIP_AWARD_TYPE_OPTIONS = [
  { label: 'Full', value: 'full' },
  { label: 'Partial', value: 'partial' },
  { label: 'Contra Revenue', value: 'contra_revenue' },
  { label: 'Third Party Billed', value: 'third_party_billed' },
] as const

export const LMS_COVERAGE_TYPE_OPTIONS = [
  { label: 'Full Company Pay', value: 'full_company_pay' },
  { label: 'Shared Pay', value: 'shared_pay' },
  { label: 'Credit Terms', value: 'credit_terms' },
] as const

export const LMS_PAYOUT_METHOD_OPTIONS = [
  { label: 'Flat', value: 'flat' },
  { label: 'Revenue Share', value: 'revenue_share' },
  { label: 'Per Enrollment', value: 'per_enrollment' },
  { label: 'Hybrid', value: 'hybrid' },
] as const

export const LMS_PAYOUT_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Calculated', value: 'calculated' },
  { label: 'Approved', value: 'approved' },
  { label: 'Paid', value: 'paid' },
  { label: 'Voided', value: 'voided' },
] as const

export const ACCOUNTING_DIMENSION_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Archived', value: 'archived' },
] as const

export const ACCOUNTING_PROJECT_TYPE_OPTIONS = [
  { label: 'Internal', value: 'internal' },
  { label: 'Customer Project', value: 'customer_project' },
  { label: 'Training Delivery', value: 'training_delivery' },
  { label: 'Implementation', value: 'implementation' },
] as const

export const ACCOUNTING_PROJECT_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Active', value: 'active' },
  { label: 'On Hold', value: 'on_hold' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
] as const

export const ACCOUNTING_PROJECT_TASK_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
] as const

export const ACCOUNTING_TIME_ENTRY_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Posted', value: 'posted' },
] as const

export const ACCOUNTING_TIME_ENTRY_SOURCE_TYPE_OPTIONS = [
  { label: 'Manual', value: 'manual' },
  { label: 'Timer', value: 'timer' },
  { label: 'Course Delivery', value: 'course_delivery' },
  { label: 'Project Work', value: 'project_work' },
  { label: 'Support', value: 'support' },
  { label: 'Other', value: 'other' },
] as const

export const ACCOUNTING_TIMESHEET_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Locked', value: 'locked' },
] as const

export const ACCOUNTING_BUDGET_TYPE_OPTIONS = [
  { label: 'Annual', value: 'annual' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Project', value: 'project' },
  { label: 'Department', value: 'department' },
  { label: 'Course Category', value: 'course_category' },
] as const

export const ACCOUNTING_BUDGET_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Approved', value: 'approved' },
  { label: 'Locked', value: 'locked' },
  { label: 'Archived', value: 'archived' },
] as const

export const ACCOUNTING_SCENARIO_TYPE_OPTIONS = [
  { label: 'Base Case', value: 'base_case' },
  { label: 'Best Case', value: 'best_case' },
  { label: 'Worst Case', value: 'worst_case' },
  { label: 'Custom', value: 'custom' },
] as const

export const ACCOUNTING_SCENARIO_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Approved', value: 'approved' },
  { label: 'Archived', value: 'archived' },
] as const

export const ACCOUNTING_FIXED_ASSET_CATEGORY_OPTIONS = [
  { label: 'Equipment', value: 'equipment' },
  { label: 'Furniture', value: 'furniture' },
  { label: 'IT Infrastructure', value: 'it_infrastructure' },
  { label: 'Vehicle', value: 'vehicle' },
  { label: 'Leasehold Improvement', value: 'leasehold_improvement' },
  { label: 'Other', value: 'other' },
] as const

export const ACCOUNTING_DEPRECIATION_METHOD_OPTIONS = [
  { label: 'Straight Line', value: 'straight_line' },
  { label: 'Manual', value: 'manual' },
] as const

export const ACCOUNTING_FIXED_ASSET_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Active', value: 'active' },
  { label: 'Fully Depreciated', value: 'fully_depreciated' },
  { label: 'Disposed', value: 'disposed' },
  { label: 'Written Off', value: 'written_off' },
] as const

export const ACCOUNTING_DEPRECIATION_ENTRY_STATUS_OPTIONS = [
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Posted', value: 'posted' },
  { label: 'Reversed', value: 'reversed' },
] as const

export const ACCOUNTING_ASSET_DISPOSAL_TYPE_OPTIONS = [
  { label: 'Sale', value: 'sale' },
  { label: 'Write Off', value: 'write_off' },
  { label: 'Scrap', value: 'scrap' },
  { label: 'Transfer', value: 'transfer' },
] as const

export const ACCOUNTING_ASSET_DISPOSAL_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Approved', value: 'approved' },
  { label: 'Posted', value: 'posted' },
  { label: 'Voided', value: 'voided' },
] as const

export const ACCOUNTING_PAYROLL_RUN_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Review', value: 'review' },
  { label: 'Approved', value: 'approved' },
  { label: 'Posted', value: 'posted' },
  { label: 'Voided', value: 'voided' },
] as const

export const ACCOUNTING_PAYROLL_ENTRY_TYPE_OPTIONS = [
  { label: 'Salary', value: 'salary' },
  { label: 'Contractor', value: 'contractor' },
  { label: 'Reimbursement', value: 'reimbursement' },
  { label: 'Adjustment', value: 'adjustment' },
] as const

export const ACCOUNTING_PAYROLL_ENTRY_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Approved', value: 'approved' },
  { label: 'Posted', value: 'posted' },
  { label: 'Voided', value: 'voided' },
] as const

export const ACCOUNTING_APPROVAL_ENTITY_TYPE_OPTIONS = [
  { label: 'Invoice', value: 'invoice' },
  { label: 'Bill', value: 'bill' },
  { label: 'Expense', value: 'expense' },
  { label: 'Journal', value: 'journal' },
  { label: 'Budget', value: 'budget' },
  { label: 'Asset Disposal', value: 'asset_disposal' },
  { label: 'Timesheet', value: 'timesheet' },
  { label: 'Payroll Run', value: 'payroll_run' },
] as const

export const ACCOUNTING_APPROVAL_REQUEST_STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Cancelled', value: 'cancelled' },
] as const

export const ACCOUNTING_FINANCE_AUDIT_ACTION_OPTIONS = [
  { label: 'Created', value: 'created' },
  { label: 'Updated', value: 'updated' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Approved', value: 'approved' },
  { label: 'Posted', value: 'posted' },
  { label: 'Reversed', value: 'reversed' },
  { label: 'Voided', value: 'voided' },
  { label: 'Exported', value: 'exported' },
] as const

export const DEFAULT_ACCOUNTING_SETTINGS = {
  baseCurrency: 'PHP',
  timezone: 'Asia/Manila',
  journalNumberPrefix: 'JE',
  invoiceNumberPrefix: 'INV',
  billNumberPrefix: 'BILL',
  paymentReceivedNumberPrefix: 'RCPT',
  paymentMadeNumberPrefix: 'PAY',
  officialReceiptNumberPrefix: 'OR',
  creditNoteNumberPrefix: 'CN',
  vendorCreditNumberPrefix: 'VCN',
  refundNumberPrefix: 'REF',
  depositNumberPrefix: 'DEP',
  transferNumberPrefix: 'TRF',
  customerNumberPrefix: 'CUST',
  vendorNumberPrefix: 'VEND',
  openingBalanceSourceType: 'opening_balance',
  allowBackdatedPosting: false,
  defaultTaxBehavior: 'exclusive',
  defaultReceivableAccount: null,
  defaultPayableAccount: null,
  defaultUndepositedFundsAccount: null,
  defaultOutputTaxAccount: null,
  defaultInputTaxAccount: null,
} as const

export const ACCOUNTING_HOOK_CONTEXT = {
  skipJournalTotalsSync: 'skipJournalTotalsSync',
  skipPostedImmutability: 'skipPostedImmutability',
  skipReversalSync: 'skipReversalSync',
  skipInvoiceTotalsSync: 'skipInvoiceTotalsSync',
  skipBillTotalsSync: 'skipBillTotalsSync',
  skipInvoiceBalanceSync: 'skipInvoiceBalanceSync',
  skipBillBalanceSync: 'skipBillBalanceSync',
} as const
