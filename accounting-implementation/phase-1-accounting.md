For reference, please refer to the following files:
accounting-implementation/accounting-features.md
accounting-implementation/coding-principles.md

When implementing, ensure we are following the accounting scope in `accounting-features.md` and the architecture rules in `coding-principles.md`.

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

## Goal of Phase 1

Phase 1 should deliver a `usable basic accounting foundation` inside `apps/cms`.

That means:

- manual accounting should be possible
- chart of accounts should exist
- journal entries should be draftable and postable
- fiscal years and periods should exist
- trial balance and general ledger should be queryable
- tax codes should be available for future transactions
- auditability and finance-safe access should be present from the start

It should `not` try to deliver full invoices, bills, AR, AP, banking, LMS billing, or finance dashboards yet.

## Current `apps/cms` realities this plan must follow

Based on the current codebase, the implementation plan must align with these real conventions:

- Payload collections are registered directly in `src/payload.config.ts`
- existing domain collections are mostly flat under `src/collections`
- HTTP routes already live primarily under `src/app/api/...`
- there is also an existing `src/endpoints/...` pattern for a few Payload custom endpoints
- admin grouping is already used, such as `Learning Management`, `Chat`, and `Notifications`
- access helpers are centralized in `src/access/index.ts`
- shared utilities live in `src/utils`
- database schema changes are managed through Payload migrations in `src/migrations`
- migration registration is centralized in `src/migrations/index.ts`
- current top-level user roles are `trainee`, `service`, `instructor`, and `admin`
- there is not yet a dedicated accounting namespace in the CMS

These realities imply:

- accounting code should be introduced in a dedicated namespace such as `src/accounting/...`
- accounting collections will still need to be imported and registered in `src/payload.config.ts`
- accounting HTTP routes, if needed, should live in `src/app/api/accounting/...`
- hooks should stay thin, and accounting rules should live in services
- Phase 1 access should likely start as `admin-first`, because finance-specific user roles do not yet exist at the platform role level

## Phase 1 scope

### In scope

- chart of accounts
- fiscal years
- accounting periods
- tax codes
- journal entries
- journal entry lines
- posting engine
- reversal and adjustment support
- general ledger query layer
- trial balance query layer
- accounting audit metadata
- minimal finance access model
- manual accounting workflows for accountants or admins

### Explicitly out of scope for now

- invoices
- bills
- payments received
- payments made
- expenses module
- bank reconciliation
- AR and AP aging
- LMS enrollment billing automation
- scholarship, corporate, or coupon accounting flows
- advanced dashboards
- accountant-specific top-level user role expansion unless explicitly approved as part of Phase 1

## Phase 1 deliverables

At the end of Phase 1, the system should have:

- an `Accounting` admin group in Payload
- accounting foundation collections registered in the CMS
- migrations for all new accounting schema objects
- a reusable accounting service layer under `src/accounting/services`
- draft and posted journal workflows
- balanced journal validation
- period-aware posting
- reversal and adjustment support
- general ledger queries
- trial balance queries
- tax code master data
- clear access boundaries for finance actions

## Recommended file and folder plan for `apps/cms`

This plan should follow the current repo structure while introducing a dedicated accounting namespace.

### New accounting domain folders

- `src/accounting/collections`
- `src/accounting/services`
- `src/accounting/services/posting`
- `src/accounting/services/journals`
- `src/accounting/services/periods`
- `src/accounting/services/reports`
- `src/accounting/queries`
- `src/accounting/types`
- `src/accounting/utils`
- `src/accounting/constants`
- `src/accounting/globals`

### New HTTP route area if needed during or after Phase 1

- `src/app/api/accounting/...`

This should be used only for delivery and read APIs, not as the place where accounting logic lives.

### Recommended Phase 1 files

- `src/accounting/collections/AccountingChartOfAccounts.ts`
- `src/accounting/collections/AccountingFiscalYears.ts`
- `src/accounting/collections/AccountingPeriods.ts`
- `src/accounting/collections/AccountingTaxCodes.ts`
- `src/accounting/collections/AccountingJournalEntries.ts`
- `src/accounting/collections/AccountingJournalEntryLines.ts`
- `src/accounting/globals/AccountingSettings.ts`
- `src/accounting/services/posting/AccountingPostingService.ts`
- `src/accounting/services/journals/AccountingJournalService.ts`
- `src/accounting/services/periods/AccountingPeriodService.ts`
- `src/accounting/services/reports/AccountingLedgerReportService.ts`
- `src/accounting/services/reports/AccountingTrialBalanceService.ts`
- `src/accounting/queries/getGeneralLedger.ts`
- `src/accounting/queries/getTrialBalance.ts`
- `src/accounting/types/accounting.ts`
- `src/accounting/constants/accounting.ts`
- `src/accounting/utils/amounts.ts`
- `src/accounting/utils/accounting-audit.ts`

### Required existing files that will later need registration changes

- `src/payload.config.ts`
- `src/migrations/index.ts`

## Recommended collection and global design

### 1. `accounting-chart-of-accounts`

Purpose:

- store the full account hierarchy and chart metadata

Minimum fields:

- `code`
- `name`
- `accountType`
- `accountSubType`
- `normalBalance`
- `parentAccount`
- `isActive`
- `allowManualEntries`
- `isControlAccount`
- `isRetainedEarnings`
- `isSuspenseAccount`
- `description`
- `sortOrder`

Recommended rules:

- `code` should be unique
- parent-child hierarchy must not allow cycles
- control accounts should be protected from casual manual misuse
- suspense and retained earnings flags should exist from the start

### 2. `accounting-fiscal-years`

Purpose:

- define financial years and their state

Minimum fields:

- `code`
- `name`
- `startDate`
- `endDate`
- `status`
- `closeMode`
- `lockedFromDate`
- `closedAt`
- `closedBy`
- `notes`

Recommended statuses:

- `draft`
- `open`
- `closed`

### 3. `accounting-periods`

Purpose:

- define month-level or period-level posting windows under a fiscal year

Minimum fields:

- `fiscalYear`
- `periodNumber`
- `label`
- `startDate`
- `endDate`
- `status`
- `lockedFromDate`
- `closedAt`
- `closedBy`
- `notes`

Recommended statuses:

- `draft`
- `open`
- `soft_locked`
- `closed`

Important rule:

- journal posting should always resolve against a period

### 4. `accounting-tax-codes`

Purpose:

- create reusable tax metadata for future invoices, bills, and journals

Minimum fields:

- `code`
- `name`
- `scope`
- `rate`
- `calculationMethod`
- `purchaseAccount`
- `salesAccount`
- `isActive`
- `description`

Recommended scope values:

- `sales`
- `purchase`
- `both`

Recommended calculation method values:

- `exclusive`
- `inclusive`

### 5. `accounting-journal-entries`

Purpose:

- store the accounting header for manual, opening, adjustment, and reversal entries

Minimum fields:

- `entryNumber`
- `entryDate`
- `postingDate`
- `fiscalYear`
- `period`
- `sourceType`
- `sourceReference`
- `memo`
- `referenceNumber`
- `status`
- `postingStatus`
- `totalDebit`
- `totalCredit`
- `isBalanced`
- `reversalOf`
- `reversedBy`
- `postedAt`
- `postedBy`
- `approvedBy`
- `notes`

Recommended source types:

- `manual`
- `opening_balance`
- `adjustment`
- `reversal`
- `system`

Recommended statuses:

- `draft`
- `posted`
- `reversed`
- `voided`

### 6. `accounting-journal-entry-lines`

Purpose:

- store debit and credit lines for each journal entry

Minimum fields:

- `journalEntry`
- `lineNumber`
- `account`
- `description`
- `debit`
- `credit`
- `taxCode`
- `referenceEntityType`
- `referenceEntityId`
- `lineMeta`

Critical validation rules:

- exactly one of `debit` or `credit` should be greater than zero per line
- zero-value lines should not be allowed
- journal totals must balance before posting
- posted lines should become immutable except through approved reversal workflows

### 7. `AccountingSettings` global

Purpose:

- hold accounting-wide defaults that should not be scattered across collections

Recommended fields:

- `baseCurrency`
- `timezone`
- `journalNumberPrefix`
- `openingBalanceSourceType`
- `defaultSuspenseAccount`
- `retainedEarningsAccount`
- `allowBackdatedPosting`
- `defaultTaxBehavior`

This is useful because the current repo already uses Payload globals, such as `SiteSettings`.

## Recommended approach for general ledger and trial balance

`GeneralLedgerEntries` should not necessarily start as a writable collection.

For Phase 1, the safer approach is:

- use `accounting-journal-entries` and `accounting-journal-entry-lines` as the source of truth
- build `general ledger` as a query or report layer over posted journal lines
- build `trial balance` as a report layer over posted journal lines

Why this is better:

- it avoids duplicating accounting truth
- it reduces risk of drift between journal lines and ledger rows
- it fits the current service-first principle better
- if needed later, a SQL view or materialized read model can be added through migrations

## Access and permissions strategy for Phase 1

This part must reflect the current role system in `apps/cms`.

Current reality:

- the app currently has `trainee`, `service`, `instructor`, and `admin`
- it does not yet have dedicated `accountant`, `cashier`, or `finance manager` top-level roles

Recommended Phase 1 access plan:

- `admin` gets full accounting access
- `service` gets no accounting write access by default
- `instructor` gets no accounting access
- `trainee` gets no accounting access

Optional controlled exception:

- `service` may get narrow read access later for internal reporting or integrations, but not at initial rollout

Important design rule:

- do not expand the platform-wide role enum casually during Phase 1 unless that is explicitly approved as its own user-management change
- if finance permissions must become more granular later, build them as a dedicated finance permission layer after the accounting foundation is stable

## Audit and internal-control strategy for Phase 1

Phase 1 should already include enough control to avoid future accounting chaos.

At minimum:

- every journal entry should track creator
- posting should track who posted and when
- reversal should track who reversed and why
- period-sensitive actions should be logged
- destructive edits to posted records should be blocked
- admin notes should be allowed where useful

Recommended model:

- use collection fields for core audit metadata
- use thin hooks to capture transition metadata
- keep the actual accounting state rules inside services

## Manual accounting workflow to support in Phase 1

Even without invoices and bills, the following workflows should be supported:

- create chart of accounts
- define fiscal year
- define accounting periods
- define tax codes
- create manual journal entry draft
- validate journal balances
- post journal entry
- reverse posted journal entry
- create adjustment entry
- browse general ledger by account and date range
- generate trial balance by period or date range
- maintain opening balances through controlled journal logic

## Detailed implementation sequence

### Step 1. Create the accounting namespace

Plan:

- establish `src/accounting/...` folder structure
- keep Payload route delivery under `src/app/api/accounting/...` if needed later
- do not mix accounting files into LMS folders

Definition of done:

- repo structure for accounting is clear before any business logic is added

### Step 2. Introduce accounting constants, types, and settings

Plan:

- define shared enums and types for account types, normal balance, period status, journal status, and source types
- define base accounting settings as a Payload global

Definition of done:

- all Phase 1 collections and services can depend on shared accounting types instead of ad hoc strings

### Step 3. Implement chart of accounts

Plan:

- implement the chart of accounts collection
- define hierarchy and validation rules
- establish admin grouping under `Accounting`

Definition of done:

- accounts can be created, ordered, and categorized safely

### Step 4. Implement fiscal years and accounting periods

Plan:

- implement fiscal years first
- implement periods under each fiscal year
- add guardrails for overlapping ranges
- define period resolution rules for journal posting

Definition of done:

- periods can be resolved consistently from a posting date

### Step 5. Implement tax code master data

Plan:

- add tax codes as master data
- keep the model simple but future-friendly
- avoid overengineering sales and purchase tax logic in Phase 1

Definition of done:

- tax codes exist as reusable accounting metadata

### Step 6. Implement journal entry header and lines

Plan:

- create separate header and line collections
- define immutable posting behavior
- support manual, opening, adjustment, and reversal entries

Definition of done:

- draft journal entries with multiple balanced lines can be stored and prepared for posting

### Step 7. Implement the posting engine

Plan:

- centralize all posting rules in `AccountingPostingService`
- validate period, status, and balancing rules before posting
- compute totals in one place
- block duplicate or partial posting behavior

Definition of done:

- journal posting uses one consistent service and does not rely on ad hoc route or hook logic

### Step 8. Implement reversal and adjustment workflows

Plan:

- add service support for reversal entries
- prevent direct mutation of posted entries
- require reversal links between original and reversing entries

Definition of done:

- posted entries are corrected through accounting-safe workflows only

### Step 9. Implement general ledger and trial balance queries

Plan:

- create query services over posted journal lines
- support account filter, date range filter, fiscal year filter, and period filter
- return frontend-ready report shapes

Definition of done:

- general ledger and trial balance can be generated from posted accounting data

### Step 10. Implement audit metadata and minimal finance access

Plan:

- apply `Accounting` admin grouping
- use admin-first access for write operations
- capture posting and reversal metadata
- keep hooks thin and use services for decisions

Definition of done:

- Phase 1 is safe enough for controlled internal accounting use

### Step 11. Register everything in Payload and migrations

Plan:

- import accounting collections and globals in `src/payload.config.ts`
- add them under the `collections` and `globals` arrays in the correct order
- create migrations for schema changes
- update `src/migrations/index.ts`
- regenerate Payload types after schema changes

Definition of done:

- the accounting foundation is recognized by Payload and migratable in a repeatable way

## Recommended registration order in `src/payload.config.ts`

When implementation begins, register in this approximate order:

1. `AccountingChartOfAccounts`
2. `AccountingFiscalYears`
3. `AccountingPeriods`
4. `AccountingTaxCodes`
5. `AccountingJournalEntries`
6. `AccountingJournalEntryLines`
7. `AccountingSettings` global

Why:

- master data should come before transactional accounting records
- journal lines depend on journals and accounts
- settings should exist before advanced posting defaults are used

## Recommended admin grouping

All Phase 1 accounting collections should use:

- `admin.group: 'Accounting'`

This keeps them visually separate from existing groups such as:

- `Learning Management`
- `Chat`
- `Notifications`

## Recommended slug style

Use clear and explicit slugs:

- `accounting-chart-of-accounts`
- `accounting-fiscal-years`
- `accounting-periods`
- `accounting-tax-codes`
- `accounting-journal-entries`
- `accounting-journal-entry-lines`

This makes the accounting namespace obvious and avoids collisions with future LMS models.

## Recommended service rules

The following rules should be treated as non-negotiable:

- only services should decide if an entry can be posted
- only services should compute entry totals
- only services should decide whether a period is open
- endpoints must not handcraft debit and credit logic
- hooks must not become the primary accounting workflow engine
- reports must read from posted accounting outputs, not mixed draft states

## Testing and verification plan for later implementation

When implementation actually starts, Phase 1 should be verified with:

- unit tests for balancing rules
- unit tests for period resolution
- unit tests for posting restrictions
- unit tests for reversal logic
- integration tests for collection creation and posting flow
- integration tests for general ledger output
- integration tests for trial balance output

Critical scenarios to verify:

- unbalanced entries are rejected
- posting to a closed period is rejected
- posted entries cannot be freely edited
- reversal entries link correctly
- trial balance stays balanced after reversals and adjustments

## Practical risks to avoid during implementation

- making `GeneralLedgerEntries` a second mutable source of truth too early
- putting posting logic inside collection hooks only
- putting posting logic directly inside API routes
- expanding user roles too broadly before the accounting model is stable
- mixing accounting collections into LMS admin groups
- skipping migration discipline when introducing accounting schema
- hardcoding LMS-specific behavior into the accounting foundation

## Definition of done for the whole Phase 1

Phase 1 is complete when:

- accounts can be created and categorized correctly
- fiscal years and periods can be created and maintained
- tax codes exist as reusable master data
- journal entries can be drafted and posted
- posted entries are balanced
- posting respects fiscal period rules
- reversal entries work
- trial balance can be produced
- general ledger can be queried
- posted accounting data is auditable
- access is restricted safely for internal finance use
- the implementation remains aligned with `accounting-features.md` and `coding-principles.md`

## Final implementation recommendation

The safest way to attack Phase 1 in this repo is:

1. create the accounting namespace under `src/accounting/...`
2. add master accounting collections first
3. add journal collections next
4. build the posting engine before any route-driven finance behavior
5. expose read models only after the posting rules are trustworthy
6. keep everything `admin-first` until the finance permission model is intentionally expanded

This preserves the current `apps/cms` architecture, avoids spaghetti, and gives the LMS a real accounting backbone before Phase 2 commercial accounting begins.
