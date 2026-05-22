For reference, please refer to the following files:
accounting-implementation/accounting-features.md
accounting-implementation/coding-principles.md

When implementing, ensure we are following the accounting scope in `accounting-features.md` and the architecture rules in `coding-principles.md`.


### Phase 2: Core commercial accounting

Mapped feature numbers:

- `3. Sales and accounts receivable`
- `4. Purchases and accounts payable`
- `5. Expense management`
- `6. Banking and cash management`
- `8. Reporting and dashboards`
- `9. Documents, attachments, and inbox`

Why these belong together:

- these are the standard business transaction modules that use the accounting foundation
- they create the daily commercial accounting flows needed before LMS-specific monetization
- reporting and documents become truly useful only once these source transactions exist

## Goal of Phase 2

Phase 2 should deliver the `daily commercial accounting layer` on top of the Phase 1 foundation.

That means:

- the system should move beyond manual journals into standard business transactions
- receivables and payables should become first-class workflows
- source documents should post through the Phase 1 accounting engine
- banking and document handling should become operationally usable
- accounting reports should begin reading from real commercial transaction flows

It should `not` yet focus on LMS-specific monetization, enrollment-linked billing, scholarships, corporate sponsorship accounting, or other domain-specific overlays.

## Core dependency on Phase 1

Phase 2 must not bypass the Phase 1 accounting foundation.

It depends on Phase 1 having:

- chart of accounts
- fiscal years and periods
- tax codes
- journal entry and journal line model
- posting engine
- trial balance and general ledger query layer
- accounting settings
- audit metadata and controlled access

Every Phase 2 source document should eventually resolve into:

- one or more balanced journal entries
- account movements against the Phase 1 chart of accounts
- period-aware posting behavior
- auditable accounting outputs

## Current `apps/cms` realities this plan must follow

Based on the current codebase, the implementation plan for Phase 2 must align with these repo realities:

- Payload collections are registered directly in `src/payload.config.ts`
- current domain collections are mostly flat under `src/collections`
- accounting should still use a dedicated namespace under `src/accounting/...`
- HTTP route handlers in this repo primarily live under `src/app/api/...`
- access helpers are centralized in `src/access/index.ts`
- database changes are handled through Payload migrations in `src/migrations`
- admin grouping is already used in the CMS and should continue for accounting
- there is already a `media` upload collection with Cloudinary-backed document support
- `media` already accepts PDFs, Office files, spreadsheets, zip files, and other common document types
- business logic in the repo is currently at risk of route-level orchestration in some places, so Phase 2 must stay strict about service-first accounting rules

These realities imply:

- Phase 2 accounting source documents should live in `src/accounting/collections`
- accounting services should stay under `src/accounting/services`
- finance read APIs should live under `src/app/api/accounting/...` if needed
- accounting attachments should reuse the existing `media` upload pipeline where possible
- a second document upload mechanism should be avoided unless there is a clear requirement that `media` cannot meet

## Phase 2 scope

### In scope

- customers
- vendors
- invoices
- invoice line items
- bills
- bill line items
- payments received
- payments made
- expenses
- credit notes
- vendor credits
- deposits
- transfers
- bank accounts
- bank transactions or equivalent imported/reconciled transaction layer
- bank reconciliations
- accounting documents linked to transactions
- operational accounting reports over commercial transactions

### Explicitly out of scope for now

- LMS enrollment billing automation
- scholarship accounting
- corporate billing overlays
- coupon and discount accounting tied to enrollments
- deferred revenue linked to course access rules
- LMS-specific receipts, certificate monetization, and instructor cost overlays
- projects, timesheets, fixed assets, payroll, and budgeting
- accountant-specific platform role expansion unless explicitly approved

## Phase 2 deliverables

At the end of Phase 2, the system should have:

- customer and vendor master data
- invoicing and billing workflows
- payment receipt and payment disbursement workflows
- expense recording workflows
- credit note and vendor credit workflows
- bank and cash account structures
- deposit, transfer, and reconciliation support
- accounting document linkage built on top of the existing `media` collection
- AR aging and AP aging becoming possible
- operational accounting reports built from posted commercial transactions
- all source documents posting through the Phase 1 posting engine

## Recommended file and folder plan for `apps/cms`

Phase 2 should extend the accounting namespace created in Phase 1 rather than creating a second structure.

### New accounting domain folders to use or extend

- `src/accounting/collections`
- `src/accounting/services`
- `src/accounting/services/customers`
- `src/accounting/services/vendors`
- `src/accounting/services/invoices`
- `src/accounting/services/bills`
- `src/accounting/services/payments`
- `src/accounting/services/expenses`
- `src/accounting/services/banking`
- `src/accounting/services/reports`
- `src/accounting/queries`
- `src/accounting/types`
- `src/accounting/utils`

### New HTTP route area if needed during or after Phase 2

- `src/app/api/accounting/...`
- `src/app/api/accounting/invoices/...`
- `src/app/api/accounting/bills/...`
- `src/app/api/accounting/reports/...`
- `src/app/api/accounting/banking/...`

As with Phase 1, these routes should remain delivery layers, not the home of accounting rules.

### Recommended Phase 2 files

- `src/accounting/collections/AccountingCustomers.ts`
- `src/accounting/collections/AccountingVendors.ts`
- `src/accounting/collections/AccountingInvoices.ts`
- `src/accounting/collections/AccountingInvoiceLineItems.ts`
- `src/accounting/collections/AccountingBills.ts`
- `src/accounting/collections/AccountingBillLineItems.ts`
- `src/accounting/collections/AccountingPaymentsReceived.ts`
- `src/accounting/collections/AccountingPaymentsMade.ts`
- `src/accounting/collections/AccountingExpenses.ts`
- `src/accounting/collections/AccountingCreditNotes.ts`
- `src/accounting/collections/AccountingVendorCredits.ts`
- `src/accounting/collections/AccountingBankAccounts.ts`
- `src/accounting/collections/AccountingBankTransactions.ts`
- `src/accounting/collections/AccountingBankReconciliations.ts`
- `src/accounting/collections/AccountingDeposits.ts`
- `src/accounting/collections/AccountingTransfers.ts`
- `src/accounting/collections/AccountingDocumentLinks.ts`
- `src/accounting/services/customers/AccountingCustomerService.ts`
- `src/accounting/services/vendors/AccountingVendorService.ts`
- `src/accounting/services/invoices/AccountingInvoiceService.ts`
- `src/accounting/services/bills/AccountingBillService.ts`
- `src/accounting/services/payments/AccountingPaymentReceivedService.ts`
- `src/accounting/services/payments/AccountingPaymentMadeService.ts`
- `src/accounting/services/expenses/AccountingExpenseService.ts`
- `src/accounting/services/banking/AccountingBankingService.ts`
- `src/accounting/services/reports/AccountingAgingReportService.ts`
- `src/accounting/services/reports/AccountingSalesReportService.ts`
- `src/accounting/services/reports/AccountingExpenseReportService.ts`
- `src/accounting/services/reports/AccountingCashReportService.ts`
- `src/accounting/queries/getAccountsReceivableAging.ts`
- `src/accounting/queries/getAccountsPayableAging.ts`
- `src/accounting/queries/getInvoiceRegister.ts`
- `src/accounting/queries/getBillRegister.ts`
- `src/accounting/queries/getCashActivity.ts`

### Required existing files that will later need registration changes

- `src/payload.config.ts`
- `src/migrations/index.ts`

## Recommended collection design

### 1. `accounting-customers`

Purpose:

- store customer master data for AR transactions

Important Phase 2 note:

- this is `generic accounting customer` data, not yet LMS billing linkage
- later LMS-specific payer mapping can connect trainees, sponsors, or companies to customers in Phase 3

Minimum fields:

- `customerCode`
- `displayName`
- `legalName`
- `customerType`
- `email`
- `phone`
- `billingAddress`
- `shippingAddress`
- `taxId`
- `taxProfile`
- `currency`
- `paymentTerms`
- `creditLimit`
- `status`
- `notes`

Recommended customer types:

- `individual`
- `company`
- `sponsor`
- `other`

### 2. `accounting-vendors`

Purpose:

- store vendor master data for AP and expenses

Minimum fields:

- `vendorCode`
- `displayName`
- `legalName`
- `vendorType`
- `email`
- `phone`
- `billingAddress`
- `taxId`
- `taxProfile`
- `currency`
- `paymentTerms`
- `status`
- `notes`

### 3. `accounting-invoices`

Purpose:

- store AR source documents before and after posting

Minimum fields:

- `invoiceNumber`
- `customer`
- `invoiceDate`
- `postingDate`
- `dueDate`
- `fiscalYear`
- `period`
- `status`
- `postingStatus`
- `currency`
- `exchangeRate`
- `subtotal`
- `taxTotal`
- `discountTotal`
- `total`
- `balanceDue`
- `referenceNumber`
- `memo`
- `sourceType`
- `sourceReference`
- `postedJournalEntry`
- `voidedAt`
- `voidedBy`
- `notes`

Recommended statuses:

- `draft`
- `approved`
- `posted`
- `partially_paid`
- `paid`
- `voided`

Important rule:

- invoice balances should be derived from invoice totals and payment allocations, not manually edited fields in multiple places

### 4. `accounting-invoice-line-items`

Purpose:

- store invoice detail lines in a normalized way

Minimum fields:

- `invoice`
- `lineNumber`
- `description`
- `itemType`
- `quantity`
- `unitPrice`
- `discountAmount`
- `taxCode`
- `lineSubtotal`
- `lineTax`
- `lineTotal`
- `incomeAccount`
- `receivableAccountOverride`
- `referenceEntityType`
- `referenceEntityId`
- `metadata`

Important design rule:

- line items should resolve account mapping clearly enough for future LMS billing bridges, but Phase 2 should still keep them generic

### 5. `accounting-bills`

Purpose:

- store AP source documents

Minimum fields:

- `billNumber`
- `vendor`
- `billDate`
- `postingDate`
- `dueDate`
- `fiscalYear`
- `period`
- `status`
- `postingStatus`
- `currency`
- `exchangeRate`
- `subtotal`
- `taxTotal`
- `total`
- `balanceDue`
- `referenceNumber`
- `memo`
- `postedJournalEntry`
- `notes`

Recommended statuses:

- `draft`
- `approved`
- `posted`
- `partially_paid`
- `paid`
- `voided`

### 6. `accounting-bill-line-items`

Purpose:

- store AP detail lines in a normalized way

Minimum fields:

- `bill`
- `lineNumber`
- `description`
- `quantity`
- `unitPrice`
- `taxCode`
- `lineSubtotal`
- `lineTax`
- `lineTotal`
- `expenseAccount`
- `assetAccount`
- `payableAccountOverride`
- `referenceEntityType`
- `referenceEntityId`
- `metadata`

### 7. `accounting-payments-received`

Purpose:

- store receipts against customer invoices and other AR balances

Minimum fields:

- `receiptNumber`
- `customer`
- `paymentDate`
- `postingDate`
- `fiscalYear`
- `period`
- `paymentMethod`
- `depositAccount`
- `undepositedFundsAccount`
- `amountReceived`
- `currency`
- `exchangeRate`
- `status`
- `postedJournalEntry`
- `referenceNumber`
- `notes`

Recommended statuses:

- `draft`
- `posted`
- `voided`

Important note:

- payment application to invoices should not be done by editing invoice balances directly
- it should happen through controlled allocation logic

### 8. `accounting-payments-made`

Purpose:

- store disbursements against bills, expenses, and vendor balances

Minimum fields:

- `paymentNumber`
- `vendor`
- `paymentDate`
- `postingDate`
- `fiscalYear`
- `period`
- `paymentMethod`
- `bankAccount`
- `amountPaid`
- `currency`
- `exchangeRate`
- `status`
- `postedJournalEntry`
- `referenceNumber`
- `notes`

### 9. `accounting-expenses`

Purpose:

- support direct expense recording outside the bill workflow when appropriate

Minimum fields:

- `expenseNumber`
- `expenseDate`
- `postingDate`
- `fiscalYear`
- `period`
- `vendor`
- `expenseCategory`
- `paymentMethod`
- `status`
- `currency`
- `subtotal`
- `taxTotal`
- `total`
- `expenseAccount`
- `taxCode`
- `postedJournalEntry`
- `notes`

Important rule:

- Phase 2 should define clearly when to use `bill` versus `expense`
- a direct expense should not become a shadow bill workflow

### 10. `accounting-credit-notes`

Purpose:

- support customer-side reductions and reversals in AR

Minimum fields:

- `creditNoteNumber`
- `customer`
- `creditDate`
- `postingDate`
- `fiscalYear`
- `period`
- `status`
- `currency`
- `subtotal`
- `taxTotal`
- `total`
- `appliedAmount`
- `remainingAmount`
- `sourceInvoice`
- `postedJournalEntry`
- `reason`
- `notes`

### 11. `accounting-vendor-credits`

Purpose:

- support vendor-side reductions in AP

Minimum fields:

- `vendorCreditNumber`
- `vendor`
- `creditDate`
- `postingDate`
- `fiscalYear`
- `period`
- `status`
- `currency`
- `subtotal`
- `taxTotal`
- `total`
- `appliedAmount`
- `remainingAmount`
- `sourceBill`
- `postedJournalEntry`
- `reason`
- `notes`

### 12. `accounting-bank-accounts`

Purpose:

- store bank and cash account masters

Minimum fields:

- `accountName`
- `accountNumberMasked`
- `bankName`
- `branchName`
- `accountType`
- `currency`
- `ledgerAccount`
- `isDefaultReceiptAccount`
- `isDefaultDisbursementAccount`
- `isActive`
- `notes`

Recommended account types:

- `bank`
- `cash_on_hand`
- `undeposited_funds`

### 13. `accounting-bank-transactions`

Purpose:

- store imported or manually captured statement-side bank activity when reconciliation is introduced

Minimum fields:

- `bankAccount`
- `transactionDate`
- `valueDate`
- `description`
- `referenceNumber`
- `amountIn`
- `amountOut`
- `runningBalance`
- `matchStatus`
- `matchedEntityType`
- `matchedEntityId`
- `metadata`

### 14. `accounting-bank-reconciliations`

Purpose:

- support bank rec workflow over posted accounting transactions and bank statement activity

Minimum fields:

- `bankAccount`
- `statementStartDate`
- `statementEndDate`
- `statementClosingBalance`
- `bookClosingBalance`
- `differenceAmount`
- `status`
- `completedAt`
- `completedBy`
- `notes`

Recommended statuses:

- `draft`
- `in_progress`
- `completed`
- `locked`

### 15. `accounting-deposits`

Purpose:

- move received cash from undeposited funds into a bank account through a formal workflow

Minimum fields:

- `depositNumber`
- `depositDate`
- `bankAccount`
- `sourceAccount`
- `amount`
- `status`
- `postedJournalEntry`
- `notes`

### 16. `accounting-transfers`

Purpose:

- record cash and bank transfers between internal accounts

Minimum fields:

- `transferNumber`
- `transferDate`
- `fromBankAccount`
- `toBankAccount`
- `amount`
- `status`
- `postedJournalEntry`
- `notes`

### 17. `accounting-document-links`

Purpose:

- index and link accounting transactions to uploaded files in the existing `media` collection

Important repo-specific rule:

- do `not` create a second upload engine in Phase 2
- reuse the existing `media` collection for actual file storage
- use this collection only as accounting metadata and transaction linkage if a dedicated accounting document index is needed

Minimum fields:

- `media`
- `entityType`
- `entityId`
- `documentCategory`
- `documentDate`
- `uploadedBy`
- `notes`
- `isPrimary`

## Recommended reporting approach for Phase 2

Phase 2 reporting should be practical and transaction-driven.

### Reports that should become possible in Phase 2

- invoice register
- bill register
- payments received register
- payments made register
- expense register
- AR aging
- AP aging
- cash activity report
- tax summary reports based on posted commercial documents

### Reports that should still depend on Phase 1 foundations

- general ledger
- journal report
- trial balance

### Dashboard principle for Phase 2

Only expose dashboard values that can be derived consistently from posted source documents and posted journals.

Examples:

- total receivables
- total payables
- overdue invoices
- overdue bills
- total cash and bank
- recent invoices
- recent bills
- recent payments

## Recommended document strategy for this repo

This part should explicitly follow the current `apps/cms` upload setup.

The repo already has:

- a `media` collection
- Cloudinary-backed uploads
- support for PDFs and Office documents

So the recommended Phase 2 approach is:

- keep binary file storage in `media`
- relate invoices, bills, expenses, payments, and vendor/customer records to `media`
- optionally add `accounting-document-links` only if a transaction-oriented accounting index is needed

This is better than creating a second upload collection because:

- it reuses the existing upload infrastructure
- it avoids duplicate storage logic
- it fits current repo conventions better

## Access and permissions strategy for Phase 2

This must still reflect the current top-level role system in `apps/cms`.

Current reality:

- the app currently has `trainee`, `service`, `instructor`, and `admin`
- dedicated finance roles do not yet exist at the platform enum level

Recommended Phase 2 access plan:

- `admin` gets full Phase 2 accounting access
- `service` gets no accounting write access by default
- `service` may later get narrow read access for internal integrations if needed
- `instructor` gets no Phase 2 accounting access
- `trainee` gets no Phase 2 accounting access

Important design rule:

- do not let business-facing web flows call core accounting write logic directly unless a finance-safe workflow is intentionally designed
- keep Phase 2 accounting operationally internal until permissions are deliberately expanded

## Posting and transaction integrity rules

These rules should be treated as mandatory in Phase 2:

- every invoice posts through the Phase 1 posting engine
- every bill posts through the Phase 1 posting engine
- every payment received posts through the Phase 1 posting engine
- every payment made posts through the Phase 1 posting engine
- every credit note and vendor credit posts through the Phase 1 posting engine
- expenses must either post through the Phase 1 engine directly or generate a standard source-document posting flow
- bank reconciliation must read posted transactions, not manually edited balances

Critical anti-spaghetti rules:

- never update account balances directly as a shortcut
- never update invoice or bill balances by freehand edits
- never duplicate posting logic across routes and hooks
- never let source documents bypass period control
- never let finance reports mix draft and posted accounting states without clear separation

## Source-document posting guidance

### Invoice posting

Expected accounting effect:

- debit `accounts receivable`
- credit `revenue`
- credit `output tax` where applicable

### Payment received posting

Expected accounting effect:

- debit `cash`, `bank`, or `undeposited funds`
- credit `accounts receivable`

### Bill posting

Expected accounting effect:

- debit `expense` or `asset`
- debit `input tax` where applicable
- credit `accounts payable`

### Payment made posting

Expected accounting effect:

- debit `accounts payable`
- credit `cash` or `bank`

### Credit note posting

Expected accounting effect:

- debit `sales returns / revenue reduction` or related control account
- debit tax reversal where applicable
- credit `accounts receivable`

### Vendor credit posting

Expected accounting effect:

- debit `accounts payable`
- credit `expense reduction`, `purchase return`, or related control account

### Deposit posting

Expected accounting effect:

- debit `bank`
- credit `undeposited funds`

### Transfer posting

Expected accounting effect:

- debit destination cash or bank account
- credit source cash or bank account

## Recommended implementation sequence

### Step 1. Confirm Phase 1 readiness

Plan:

- verify that chart of accounts, periods, tax codes, journals, and posting engine are stable enough for document posting
- confirm that accounting settings support the numbering and control requirements needed by source documents

Definition of done:

- Phase 2 does not start until source documents can safely post into Phase 1

### Step 2. Extend accounting settings for commercial workflows

Plan:

- extend `AccountingSettings` rather than scattering defaults across collections
- add numbering prefixes and default accounts for AR, AP, tax, cash, bank, and undeposited funds

Recommended settings additions:

- `invoiceNumberPrefix`
- `billNumberPrefix`
- `paymentReceivedNumberPrefix`
- `paymentMadeNumberPrefix`
- `creditNoteNumberPrefix`
- `vendorCreditNumberPrefix`
- `depositNumberPrefix`
- `transferNumberPrefix`
- `defaultReceivableAccount`
- `defaultPayableAccount`
- `defaultUndepositedFundsAccount`

Definition of done:

- Phase 2 source documents can rely on stable accounting defaults

### Step 3. Implement customer and vendor master data

Plan:

- create generic accounting customer and vendor collections
- keep them independent from LMS-specific payer mapping
- support status, contact, tax, and terms metadata

Definition of done:

- AR and AP documents have correct master entities to reference

### Step 4. Implement invoice and bill document models

Plan:

- create invoice and bill headers first
- create line-item collections second
- define numbering, statuses, totals, and posting references
- enforce fiscal year and period resolution

Definition of done:

- draft and postable sales and purchase documents can be stored consistently

### Step 5. Implement payment and credit workflows

Plan:

- create payments received
- create payments made
- create credit notes
- create vendor credits
- design controlled allocation behavior

Definition of done:

- receivable and payable balances can move through standard accounting flows

### Step 6. Implement expense workflows

Plan:

- create direct expense recording for appropriate cases
- make sure expense logic does not duplicate bill logic unnecessarily
- define clear rule for expense versus bill usage

Definition of done:

- outflows can be recorded consistently without undermining AP structure

### Step 7. Implement bank and cash structures

Plan:

- create bank account master records
- create deposit and transfer workflows
- create bank transaction capture/import layer
- create reconciliation structures

Definition of done:

- the platform can track and reconcile cash movement against posted accounting records

### Step 8. Implement document linkage using `media`

Plan:

- relate accounting entities to `media`
- add `accounting-document-links` only if accounting-specific indexing is needed
- avoid a new upload subsystem

Definition of done:

- accounting transactions can retain supporting documents using the repo’s existing upload pipeline

### Step 9. Implement reporting queries and dashboard-ready read models

Plan:

- build AR aging and AP aging queries
- build invoice, bill, payment, expense, and cash activity registers
- build read-oriented services for finance pages and reporting endpoints

Definition of done:

- operational commercial accounting reports can be produced from posted data

### Step 10. Implement route delivery only after services are stable

Plan:

- expose admin or internal read/write routes under `src/app/api/accounting/...` only when the service layer is trustworthy
- keep route handlers thin
- do not embed posting rules in route handlers

Definition of done:

- APIs deliver accounting functionality without becoming the accounting core

### Step 11. Register collections, extend migrations, and regenerate types

Plan:

- register Phase 2 accounting collections in `src/payload.config.ts`
- add or update migrations in `src/migrations`
- register migration files in `src/migrations/index.ts`
- regenerate Payload types after schema changes

Definition of done:

- the commercial accounting layer is consistently registered, migratable, and type-safe

## Recommended registration order in `src/payload.config.ts`

When implementation begins, register in this approximate order:

1. `AccountingCustomers`
2. `AccountingVendors`
3. `AccountingBankAccounts`
4. `AccountingInvoices`
5. `AccountingInvoiceLineItems`
6. `AccountingBills`
7. `AccountingBillLineItems`
8. `AccountingCreditNotes`
9. `AccountingVendorCredits`
10. `AccountingPaymentsReceived`
11. `AccountingPaymentsMade`
12. `AccountingExpenses`
13. `AccountingDeposits`
14. `AccountingTransfers`
15. `AccountingBankTransactions`
16. `AccountingBankReconciliations`
17. `AccountingDocumentLinks`

Why:

- master data should appear before source documents
- source documents should exist before reconciliation and document-link indexing layers
- collections with heavy relationships should follow the records they depend on

## Recommended admin grouping

All Phase 2 accounting collections should continue to use:

- `admin.group: 'Accounting'`

This keeps the commercial accounting layer separated from current groups such as:

- `Learning Management`
- `Chat`
- `Notifications`

## Recommended slug style

Use explicit accounting slugs:

- `accounting-customers`
- `accounting-vendors`
- `accounting-invoices`
- `accounting-invoice-line-items`
- `accounting-bills`
- `accounting-bill-line-items`
- `accounting-payments-received`
- `accounting-payments-made`
- `accounting-expenses`
- `accounting-credit-notes`
- `accounting-vendor-credits`
- `accounting-bank-accounts`
- `accounting-bank-transactions`
- `accounting-bank-reconciliations`
- `accounting-deposits`
- `accounting-transfers`
- `accounting-document-links`

## Recommended service rules

The following Phase 2 rules should be treated as non-negotiable:

- document totals should be computed in services
- posting should be executed in services
- allocations should be controlled in services
- route handlers must not handcraft AR and AP logic
- hooks must not become hidden posting engines
- reports must read standardized accounting outputs
- reconciliation must compare statement activity with posted accounting activity

## Testing and verification plan for later implementation

When implementation actually starts, Phase 2 should be verified with:

- unit tests for invoice total calculation
- unit tests for bill total calculation
- unit tests for tax application
- unit tests for payment allocation behavior
- unit tests for credit note and vendor credit application
- unit tests for deposit and transfer postings
- unit tests for reconciliation matching logic
- integration tests for invoice posting
- integration tests for bill posting
- integration tests for payment received and payment made posting
- integration tests for AR aging and AP aging outputs
- integration tests for document linkage using `media`

Critical scenarios to verify:

- an invoice posts the correct journal impact
- a bill posts the correct journal impact
- a payment received reduces receivable correctly
- a payment made reduces payable correctly
- tax calculations remain consistent between source documents and journals
- aging reports match the underlying outstanding balances
- reconciliation uses posted records rather than manually edited balances
- attachments remain linked to the correct accounting entities

## Practical risks to avoid during implementation

- putting invoice or bill posting logic directly in routes
- letting payments mutate balances directly instead of using allocations and postings
- creating a second upload system instead of reusing `media`
- making expenses an unstructured shortcut that duplicates bill logic
- mixing LMS-specific payer logic into generic customer and invoice models too early
- creating reporting queries that read mixed draft and posted states without discipline
- introducing reconciliation before cash and source-document posting behavior is stable

## Definition of done for the whole Phase 2

Phase 2 is complete when:

- customers and vendors can be created and maintained
- invoices and bills can be drafted, approved if needed, and posted
- payments received and payments made can be recorded and posted
- expenses, credit notes, and vendor credits work through standard accounting flows
- bank accounts, deposits, transfers, and reconciliations exist in usable form
- accounting attachments use the repo’s existing `media` infrastructure
- AR aging and AP aging can be generated
- operational finance reports can read consistent posted accounting outputs
- all Phase 2 source documents use the Phase 1 posting engine
- the implementation remains aligned with `accounting-features.md` and `coding-principles.md`

## Final implementation recommendation

The safest way to attack Phase 2 in this repo is:

1. treat Phase 1 as a hard dependency
2. build master data first
3. build source documents second
4. build payments and credits third
5. build banking and reconciliation after transaction posting is stable
6. build reports and read APIs only after posted outputs are trustworthy
7. keep the whole commercial layer generic so Phase 3 can later adapt it to LMS monetization cleanly

This preserves the current `apps/cms` architecture, reuses the existing upload and route patterns correctly, and prepares the system for Phase 3 without contaminating the accounting core with LMS-specific logic too early.
