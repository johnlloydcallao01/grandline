# Accounting Feature Analysis For `apps/cms`

## Purpose

This document reorganizes the accounting scope for `apps/cms` so the structure starts with `general accounting foundations` first, then narrows into `Grandline LMS-specific accounting`.

The goal is not just to describe `billing for courses`, but to define what a `full-fledged accounting platform` would look like if built around this LMS.

## Business context of the LMS

Based on the schemas and APIs in `apps/cms`, this platform is best described as a:

- `Maritime training and certification LMS`
- `Trainee / instructor / admin role-based platform`
- `Course-selling LMS with manual enrollment review`
- `Certificate-oriented vocational or compliance training platform`
- `B2C plus sponsored/corporate enrollment LMS`

Key clues from the codebase:

- branding repeatedly uses `Grandline Maritime`
- learners are called `trainees`
- registration captures `SRN`, personal profile details, and emergency contacts
- courses support `paid`, `free`, `scholarship`, `trial`, and `corporate` enrollment types
- enrollments can be submitted as `pending` requests for review
- the platform issues `certificates`
- courses include modules, lessons, assessments, grades, and pass/fail outcomes
- pricing already includes `price`, `discountedPrice`, coupons, redemption logs, and price snapshots
- currency snapshots use `PHP`

Operationally, this behaves more like a `commercial maritime training center` than a semester-based university ERP.

## Full accounting foundation

Before defining LMS-specific accounting, the system should first cover the core modules expected from accounting software similar in scope to `QuickBooks` or `Zoho Books`.

### 1. Core ledger and bookkeeping

This is the accounting backbone:

- chart of accounts
- account types and sub-accounts
- opening balances
- manual journal entries
- recurring journals
- journal reversals
- adjustment entries
- general ledger browsing
- ledger drilldown
- trial balance
- retained earnings
- clearing or suspense accounts

Why it matters:

- Without this layer, the platform is a billing tool, not true accounting software.

### 2. Fiscal years, accounting periods, and closing

The system should support:

- fiscal year setup
- accounting periods
- open and closed periods
- month-end close
- year-end close
- lock dates
- post-close adjustments with permissions
- reopening closed periods with audit history
- balance carry-forward

Why it matters:

- Reliable accounting requires period control so prior financial statements do not change silently.

### 3. Sales and accounts receivable

The receivables side should include:

- customer master records
- customer types such as trainee, parent, sponsor, and company
- quotes or estimates
- sales orders
- invoices
- recurring invoices
- progress invoices
- sales receipts
- customer credits and credit notes
- deposits from customers
- payment reminders
- statements of account
- aging reports
- collections notes
- overpayment tracking
- bad debt write-offs

Why it matters:

- Full `AR` is broader than simply generating an invoice after enrollment.

### 4. Purchases and accounts payable

The payables side should include:

- vendor master records
- vendor categories
- purchase requests
- purchase orders
- bills
- recurring bills
- vendor credits
- payments made
- bill matching against purchase orders
- partial bill payments
- outstanding payables tracking
- payable aging
- overdue bills
- vendor statements

Why it matters:

- A full accounting system must handle money owed out, not only money collected in.

### 5. Expense management

The platform should support:

- manual expense entries
- recurring expenses
- petty cash
- reimbursement requests
- employee or staff expense claims
- expense categories
- receipt attachments
- approval workflows for expenses
- reimbursable and non-reimbursable expenses
- tax-inclusive and tax-exclusive expense handling

Why it matters:

- Training operations still incur daily business expenses beyond course delivery.

### 6. Banking and cash management

The banking layer should support:

- bank account records
- cash on hand accounts
- undeposited funds
- deposits
- bank transfers
- bank statement imports
- bank feeds if later integrated
- transaction categorization rules
- bank reconciliation
- reconciliation history
- bounced payment handling
- check handling or check printing
- cash flow visibility
- cash flow forecasting

Why it matters:

- Accounting accuracy depends on matching book balances to actual bank and cash balances.

### 7. Tax and compliance

The tax layer should support:

- tax rates and tax groups
- VAT or sales tax setup
- withholding tax rules
- tax-inclusive and tax-exclusive pricing
- official receipt and invoice numbering rules
- customer and vendor tax profiles
- tax reports
- tax export or filing support
- tax breakdown per transaction

Why it matters:

- Real accounting software must support compliance, especially in production finance operations.

### 8. Reporting and dashboards

The reporting layer should include:

- profit and loss
- balance sheet
- cash flow statement
- trial balance report
- general ledger report
- journal report
- AR aging
- AP aging
- sales reports
- expense reports
- tax reports
- budget versus actual
- scheduled report delivery
- custom dashboards
- KPI tiles

The default accounting dashboard should show:

- total receivables
- total payables
- overdue invoices
- overdue bills
- cash on hand
- bank balances
- current month revenue
- current month expenses
- net income
- pending approvals
- recent transactions

Why it matters:

- Finance teams need summary insight, not just raw transaction storage.

### 9. Documents, attachments, and inbox

The system should support:

- accounting document inbox
- uploaded invoices and bills inbox
- all files view
- folders and document organization
- receipt archive
- attachment tagging
- linking documents to transactions
- supporting document retention
- document permissions
- optional future OCR document capture

Why it matters:

- Accounting work is document-heavy, and source files must be part of the process.

### 10. Audit trail and internal control

The system should include:

- accounting audit log
- transaction activity history
- who created, edited, approved, voided, or deleted a transaction
- before and after values
- accountant notes
- internal review comments
- export logs
- attachment history
- version history for important records

And approval workflows for:

- invoices
- discounts
- refunds
- journals
- bills
- expenses
- purchase orders
- vendor credits
- write-offs
- period close

Why it matters:

- Auditability and controls reduce fraud, mistakes, and unauthorized changes.

### 11. Roles, permissions, and finance access

The accounting module should support roles such as:

- accountant
- finance manager
- cashier
- accounts receivable officer
- accounts payable officer
- auditor
- approver

And permissions such as:

- create invoice
- approve journal
- approve refund
- approve bill
- reconcile bank
- close books
- view sensitive reports
- export data

Why it matters:

- Finance access is more specialized than generic admin access.

### 12. Manual accounting actions and shortcuts

A complete system should support quick-create actions such as:

- `New Customer`
- `New Invoice`
- `New Bill`
- `New Expense`
- `New Vendor`
- `New Payment Received`
- `New Payment Made`
- `New Journal`
- `New Purchase Order`
- `New Credit Note`
- `New Vendor Credit`
- `New Deposit`
- `New Bank Transfer`
- `Open Reconciliation`
- `Run Reports`

It should also support manual accounting actions such as:

- manually record revenue
- manually record other income
- manually record expenses
- manually post receivable adjustments
- manually post payable adjustments
- manually record bank charges
- manually record owner contributions
- manually record asset purchases

Why it matters:

- Real finance teams need both automation and manual control.

### 13. Projects, time, and profitability

For broader accounting completeness, the system can also support:

- projects
- project tasks
- project status
- time entries
- timesheets
- start/stop timer
- billable and non-billable time
- project expenses
- project budgets
- project profitability
- invoices from project time and expenses

Why it matters:

- This is common in mature accounting products and useful for custom corporate training engagements.

### 14. Budgeting, planning, and forecasting

The platform should support:

- annual budgets
- monthly budgets
- budget by department
- budget by project
- budget by course category
- budget versus actual
- forecasting
- scenario planning

Why it matters:

- Finance teams need forward-looking planning, not only history.

### 15. Fixed assets, payroll, and growth support

For a more advanced suite, include:

- fixed asset register
- asset categories
- acquisition records
- depreciation methods
- useful life setup
- disposal and write-off records
- accumulated depreciation reports
- payroll runs
- salary expense posting
- contractor payouts
- tax deductions
- reimbursements
- payroll journal posting
- branch or location tracking
- multiple training centers
- department or class tagging

Why it matters:

- These are common growth-stage accounting requirements as the organization matures.

### 16. Common master records

A complete accounting platform should maintain master data for:

- customers
- vendors
- trainees
- sponsors
- corporate accounts
- staff
- accountants
- bank accounts
- tax codes
- payment methods
- currencies
- expense categories
- departments
- projects
- fiscal years

## LMS-specific accounting extensions

Once the general accounting foundation exists, the system can layer on the accounting features that are specific to `Grandline Maritime` and its LMS business model.

### 17. Course pricing and fee setup

Each course should support a billing layer with:

- list price
- sale price
- coupon-adjusted price
- scholarship-adjusted price
- corporate-negotiated price
- certificate fee
- exam retake fee
- reassessment fee
- late payment fee
- manual billing adjustment

Why it fits this LMS:

- The LMS already stores `price`, `discountedPrice`, and price snapshots.

### 18. Enrollment-based invoicing

Billing should be generated from `course-enrollments`:

- draft invoice on pending enrollment request
- final invoice on approved paid enrollment
- zero-value invoice for free enrollment
- sponsored invoice for corporate enrollment
- scholarship invoice showing gross, subsidy, and net due
- printable official receipt after payment

Why it fits this LMS:

- Enrollment is the natural financial transaction object in the current platform.

### 19. LMS receivables and installment plans

The LMS should track:

- outstanding balance by enrollment
- total balance by trainee
- aging by trainee
- due dates
- overdue notices
- account holds for non-payment
- reservation fees
- installment schedules
- balance carry-forward
- defaulted installment tracking

Why it fits this LMS:

- The current schema already has `paymentStatus`, `amountPaid`, and status transitions such as `pending`, `suspended`, and `expired`.

### 20. Payments, receipts, and proof of payment

Add a dedicated payment layer for:

- payment reference number
- payment channel
- payment date
- payer
- amount received
- payment allocation across one or many enrollments
- official receipt number
- voided receipt history
- proof of payment attachment

Typical payment channels:

- bank transfer
- over-the-counter
- GCash or e-wallet
- card
- manual cashier entry

Why it fits this LMS:

- The existing schema tracks only payment summaries, not a full payment journal.

### 21. Scholarship, sponsorship, and corporate billing

Because the LMS supports `scholarship` and `corporate` enrollments, it should also support:

- scholarship sponsor master records
- sponsorship agreements
- trainee sponsor mapping
- sponsored amount versus trainee share
- grant utilization
- sponsor statement of account
- corporate customer records
- batch billing for company-sponsored trainees
- monthly company invoices
- negotiated company pricing
- corporate receivables

Why it fits this LMS:

- The business already supports non-standard payers beyond the trainee.

### 22. Coupon and discount accounting

The accounting layer should expose coupon and discount activity clearly:

- discount campaign tracking
- per-coupon revenue impact
- promo budget reporting
- discount approval workflows
- coupon redemption audit report
- gross revenue versus net revenue after discount

Why it fits this LMS:

- Coupon definitions, usage limits, redemptions, and price snapshots already exist in the system.

### 23. Deferred revenue and revenue recognition

This LMS should not always recognize revenue immediately upon payment.

Recommended recognition approaches:

- upon activation for short on-demand courses
- straight-line over the access period
- milestone-based recognition tied to service delivery or completion

The system should support:

- cash receipt at payment time
- deferred revenue posting
- scheduled revenue recognition
- recognition by course access or completion logic

Why it fits this LMS:

- The platform has enrollment dates, course dates, access expiry, and certificate issuance.

### 24. Refunds, reversals, and credit memos

The LMS should support:

- trainee cancellations before access
- partial refunds
- full refunds
- coupon reversals
- credit memo issuance
- voided enrollment cleanup with audit trail
- certificate-related financial reversals when relevant

Why it fits this LMS:

- The current system already models reversals and enrollment status changes such as `dropped` and `expired`.

### 25. Instructor and training-delivery cost tracking

If instructors are paid per course, per trainee, or by contract, the system should support:

- instructor payout rules
- revenue sharing
- fixed teaching fees
- per-enrollment commission
- per-course completion incentive
- contractor payout exports

Why it fits this LMS:

- Course ownership and instructor assignment already exist in the platform.

### 26. Certificates, reassessment, and renewal monetization

Because this LMS is certificate-driven, the accounting layer can support:

- certificate issuance fees
- replacement certificate fees
- certificate verification fees if ever commercialized
- exam retake fees
- reassessment fees
- recertification or renewal fees

Why it fits this LMS:

- Certificates and assessments are central to the product model.

### 27. LMS-specific finance dashboards

In addition to standard accounting dashboards, this LMS should support:

- revenue by course
- revenue by instructor
- revenue by category
- paid versus free enrollments
- pending enrollment requests with expected billings
- discount leakage report
- scholarship utilization report
- corporate receivables dashboard
- trainee collections dashboard
- completion-to-revenue dashboard
- certificate issuance volume versus revenue

### 28. Maritime training chart of accounts guidance

A maritime training-oriented chart of accounts should include groups such as:

- course revenue
- certification revenue
- exam retake revenue
- training materials revenue
- discounts and sales deductions
- scholarship support expense
- accounts receivable
- deferred revenue
- cash and bank
- refunds payable
- instructor compensation
- marketing promo expense

## Recommended implementation phases

If this accounting system will be built gradually, the clean rollout order is:

### Phase 1: Accounting foundation

- `ChartOfAccounts`
- `FiscalYears`
- `AccountingPeriods`
- `JournalEntries`
- `JournalEntryLines`
- `GeneralLedgerEntries`
- `Customers`
- `Vendors`
- `BankAccounts`
- `TaxCodes`

### Phase 2: Core commercial accounting

- `Invoices`
- `InvoiceLineItems`
- `PaymentsReceived`
- `Bills`
- `BillLineItems`
- `PaymentsMade`
- `Expenses`
- `CreditNotes`
- `VendorCredits`
- `BankReconciliations`
- `Documents`

### Phase 3: LMS-specific monetization

- `CorporateAccounts`
- `ScholarshipSponsors`
- `BillingAdjustments`
- `RevenueRecognitionSchedules`
- `Refunds`
- `PaymentAllocations`
- `Receipts`

### Phase 4: Advanced operational finance

- `Projects`
- `ProjectTasks`
- `TimeEntries`
- `Timesheets`
- `Budgets`
- `FixedAssets`
- `DepreciationEntries`
- `ApprovalWorkflows`
- `AuditLogs`

## Suggested collections or modules

If `apps/cms` evolves toward a full accounting platform, the module list should include:

- `ChartOfAccounts`
- `AccountingPeriods`
- `FiscalYears`
- `JournalEntries`
- `JournalEntryLines`
- `GeneralLedgerEntries`
- `Customers`
- `CustomerContacts`
- `Vendors`
- `VendorContacts`
- `Quotes`
- `SalesOrders`
- `Invoices`
- `InvoiceLineItems`
- `CreditNotes`
- `PaymentsReceived`
- `Bills`
- `BillLineItems`
- `PurchaseOrders`
- `VendorCredits`
- `PaymentsMade`
- `Expenses`
- `ExpenseClaims`
- `BankAccounts`
- `BankTransactions`
- `BankReconciliations`
- `Deposits`
- `Transfers`
- `Receipts`
- `Documents`
- `DocumentFolders`
- `Projects`
- `ProjectTasks`
- `TimeEntries`
- `Timesheets`
- `Budgets`
- `RevenueRecognitionSchedules`
- `Refunds`
- `BillingAdjustments`
- `CorporateAccounts`
- `ScholarshipSponsors`
- `TaxCodes`
- `FixedAssets`
- `DepreciationEntries`
- `ApprovalWorkflows`
- `AuditLogs`

## Final recommendation

This LMS should be treated as:

`a maritime training center LMS with paid enrollments, admin approval, coupons, scholarships, corporate sponsorships, progress tracking, and certificate issuance`

So the correct accounting strategy is:

- build `full accounting foundations` first
- then layer `LMS-specific monetization and training-center finance`
- keep `standard accounting modules` separate from `domain-specific extensions`
- avoid mixing `general accounting`, `dashboard ideas`, and `LMS billing logic` in the same section

The most important capabilities overall are:

- `general ledger and journals`
- `fiscal periods and close controls`
- `sales and receivables`
- `purchases and payables`
- `banking and reconciliation`
- `expenses and documents`
- `tax and compliance`
- `reports, dashboards, and audit trail`
- `enrollment-linked billing`
- `scholarship and corporate billing`
- `deferred revenue and refunds`
- `certificate, retake, and instructor-related finance`

If this should become the next implementation artifact, the best follow-up is a `proposed accounting schema design` mapped directly to your existing Payload collections, split into `MVP accounting`, `intermediate accounting`, and `full accounting suite`.

## Implementation notes and strategy

This section is the practical guide for how to attack implementation without creating `spaghetti` across phases.

### Core implementation principle

The safest implementation strategy is:

- build from `Phase 1` to `Phase 4`
- finish the current phase before moving deeply into the next one
- allow future phases in the design, but do not try to build all phases at once
- keep `accounting foundation logic` generic and reusable
- keep `LMS-specific behavior` on top of the accounting foundation, not mixed into it

In simple terms:

- `Phase 1` creates the accounting engine
- `Phase 2` uses that engine for standard business transactions
- `Phase 3` adapts that engine to LMS-specific monetization
- `Phase 4` adds advanced operational finance

### Why chronological implementation is correct

Implementing the phases in order is the correct attack path because:

- later phases depend on structures introduced earlier
- ledger posting rules should not be reinvented per module
- tax, reporting, reconciliation, and audit become easier if transactions already post consistently
- LMS monetization is much safer when built on top of stable accounting primitives

This means the order is `good and recommended`, but only if each early phase is built as a reusable foundation rather than a one-off solution.

### The main anti-spaghetti rule

The number one rule is:

- `business documents do not become the ledger`

Instead:

- invoices, bills, payments, refunds, and enrollments are `source documents`
- journal entries and journal lines are the `accounting result`
- reports should read from standardized posted accounting data
- LMS features should trigger accounting behavior through posting rules, not by inventing their own custom ledgers

If this separation is kept clean, later phases remain manageable.

### Non-negotiable design rules for Phase 1

Before moving beyond `Core ledger and bookkeeping`, the implementation should establish:

- one authoritative `ChartOfAccounts`
- one authoritative `JournalEntries` structure
- one authoritative `JournalEntryLines` structure
- strict debit and credit balancing rules
- clear posting states such as `draft`, `posted`, and `reversed`
- immutable or tightly controlled posted entries
- source-document linkage such as invoice, bill, payment, refund, or enrollment reference
- audit metadata such as created by, approved by, posted at, reversed at
- ability to support future period locking
- support for adjustment and reversal entries

If these are weak, every later module becomes harder to maintain.

### What Phase 1 should not do

To avoid future refactors, `Phase 1` should not:

- hardcode logic only for enrollments
- assume only one revenue flow exists
- mix journal logic directly inside UI screens
- let each module invent separate debit and credit behavior
- skip source-document references
- skip reversal support
- skip audit fields
- skip account typing

### Recommended implementation attack plan by phase

To make the roadmap easier to follow, the best structure is not `28 separate phases`, but `4 phases` with the feature numbers mapped into them.

This gives you:

- a clean implementation order
- visible coverage of all feature numbers
- less fragmentation
- better dependency control

### Phase mapping

### Phase 1: Accounting foundation

Mapped feature numbers:

- `1. Core ledger and bookkeeping`
- `2. Fiscal years, accounting periods, and closing`
- `7. Tax and compliance`
- `10. Audit trail and internal control`
- `11. Roles, permissions, and finance access`
- `12. Manual accounting actions and shortcuts`
- `16. Common master records`

Why these belong together:

- these features define the accounting engine, control model, permissions, master records, and posting environment
- everything else depends on these concepts being stable

### Phase 1 attack plan

Implement these first:

- `ChartOfAccounts`
- `FiscalYears`
- `AccountingPeriods`
- `JournalEntries`
- `JournalEntryLines`
- `GeneralLedgerEntries` or equivalent ledger view/posting layer
- `TaxCodes`
- base posting service or posting engine

Recommended internal order:

1. account model and account hierarchy
2. fiscal year and accounting period model
3. journal entry header
4. journal entry lines
5. posting validation rules
6. reversal and adjustment support
7. ledger read model and reports foundation
8. audit metadata and permissions

Definition of done for Phase 1:

- accounts can be created and categorized correctly
- journal entries can be drafted and posted
- posted entries are balanced
- reversal entries work
- trial balance can be produced
- general ledger can be queried
- periods can be referenced even if full close workflow comes slightly later

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

### Phase 2 attack plan

Once `Phase 1` is stable, build standard business transaction modules:

- customers
- vendors
- invoices
- bills
- payments received
- payments made
- expenses
- credit notes
- vendor credits
- bank reconciliations
- documents

Recommended rule:

- every source document posts through the same accounting engine from Phase 1

For example:

- invoice posting creates receivable and revenue entries
- payment received clears receivable and increases cash or bank
- bill posting creates expense or asset and payable
- payment made clears payable and reduces cash or bank

Definition of done for Phase 2:

- standard sales and purchase transactions can post consistently
- AR and AP aging become possible
- bank and cash balances reconcile to posted transactions
- reports can read consistent accounting outputs

### Phase 3: LMS-specific monetization

Mapped feature numbers:

- `17. Course pricing and fee setup`
- `18. Enrollment-based invoicing`
- `19. LMS receivables and installment plans`
- `20. Payments, receipts, and proof of payment`
- `21. Scholarship, sponsorship, and corporate billing`
- `22. Coupon and discount accounting`
- `23. Deferred revenue and revenue recognition`
- `24. Refunds, reversals, and credit memos`
- `25. Instructor and training-delivery cost tracking`
- `26. Certificates, reassessment, and renewal monetization`
- `27. LMS-specific finance dashboards`
- `28. Maritime training chart of accounts guidance`

Why these belong together:

- these are the parts that adapt the accounting core to the actual `Grandline Maritime` LMS business model
- they should extend standard accounting behavior instead of redefining it

### Phase 3 attack plan

Only after standard accounting works cleanly, add LMS-specific monetization:

- corporate accounts
- scholarship sponsors
- billing adjustments
- revenue recognition schedules
- refunds
- payment allocations
- receipts

Recommended rule:

- LMS-specific objects should extend existing accounting behavior instead of bypassing it

For example:

- an enrollment can generate or link to an invoice
- a scholarship can apply discounts or third-party coverage through normal billing logic
- a corporate sponsor can act as a customer or payer type
- refunds should use standard refund and credit memo patterns
- revenue recognition should build on posted invoice and payment data

Definition of done for Phase 3:

- LMS enrollments can participate in accounting without special-case ledger hacks
- discounts, scholarships, sponsors, and receipts work through standard accounting flows
- deferred revenue and refund rules are traceable

### Phase 4: Advanced operational finance

Mapped feature numbers:

- `13. Projects, time, and profitability`
- `14. Budgeting, planning, and forecasting`
- `15. Fixed assets, payroll, and growth support`

Why these belong together:

- these are important, but they are not the first blockers for building accounting around the LMS
- they are safer to add after the core transaction, reporting, and LMS monetization flows are already stable

### Phase 4 attack plan

Advanced operational finance should come last:

- projects
- time tracking
- budgets
- fixed assets
- depreciation
- approval workflows
- audit tools

These are valuable, but they should sit on top of stable transaction and ledger behavior.

Definition of done for Phase 4:

- operational tools enrich finance without redefining the accounting core

### Safe independence guidance

You can work `phase by phase`, but not every feature is truly independent.

Safe interpretation:

- you can focus on the current phase without implementing later phases yet
- you should still design extension points for later phases
- you should not let current-phase shortcuts block future posting, reconciliation, tax, or reporting

So the practical rule is:

- `implement current phase only`
- `design with later phases in mind`
- `do not implement later phase behavior prematurely`

### Dependency map

The dependency flow is roughly:

- `Phase 1` supports everything
- `Phase 2` depends heavily on Phase 1
- `Phase 3` depends on both Phase 1 and Phase 2
- `Phase 4` depends on all previous phases

Another way to view it:

- `ledger first`
- `commercial accounting second`
- `LMS monetization third`
- `advanced finance last`

### Practical warning signs of future spaghetti

Stop and refactor early if you see:

- invoice logic posting differently from bill logic without a clear reason
- payment modules updating balances directly instead of posting entries
- reports reading mixed raw tables instead of standardized accounting outputs
- enrollment logic bypassing invoice and payment flows
- tax logic duplicated across modules
- refund logic implemented differently in each feature
- bank reconciliation relying on manually adjusted balances instead of posted transactions

### Recommended coding architecture

At implementation level, the safest structure is:

- `master data layer`
- `source document layer`
- `posting engine layer`
- `ledger/query/reporting layer`
- `domain adapters` for LMS-specific flows

In practical terms:

- master data holds accounts, tax codes, fiscal years, customers, vendors, and banks
- source documents hold invoices, bills, expenses, payments, and refunds
- posting engine translates business events into journal entries
- ledger and reports read posted accounting data
- LMS-specific features map enrollments, scholarships, and corporate billing into standard source documents



### Recommended mindset while building

The safest mindset is:

- do not chase completeness too early
- do not skip accounting primitives
- do not make the ledger dependent on one product workflow
- do not make LMS billing the center of accounting
- do make the accounting core reusable
- do make later features consume the same core services

### Final implementation advice

If execution stays disciplined, the clean attack path is:

1. finish `Core ledger and bookkeeping`
2. finish `Fiscal years, accounting periods, and closing`
3. build standard `AR`, `AP`, `Expenses`, and `Banking`
4. stabilize posting, reports, tax, and audit behavior
5. only then build `LMS-specific monetization`
6. lastly build advanced operational finance

So yes, the document can be attacked chronologically, but the safe interpretation is:

- `build in order`
- `keep each phase narrow`
- `make each early phase reusable`
- `never let later domain-specific logic rewrite the accounting core`
