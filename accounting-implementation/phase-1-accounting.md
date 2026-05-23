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

## Scope

- `In scope`
- chart of accounts
- fiscal years
- accounting periods
- tax codes
- journal entries
- journal entry lines
- posting engine
- reversal workflows
- adjustment workflows
- opening balance workflows
- general ledger queries
- trial balance queries
- audit metadata
- admin-first finance access

- `Out of scope`
- invoices
- bills
- payments
- expenses module
- bank reconciliation
- AR/AP aging
- LMS billing automation
- scholarship/corporate/coupon accounting
- advanced dashboards
- new finance-specific platform roles

## Implementation Checklist

### 1. Accounting Namespace

- [ ] `src/accounting/collections`
- [ ] `src/accounting/services`
- [ ] `src/accounting/services/posting`
- [ ] `src/accounting/services/journals`
- [ ] `src/accounting/services/periods`
- [ ] `src/accounting/services/reports`
- [ ] `src/accounting/queries`
- [ ] `src/accounting/types`
- [ ] `src/accounting/utils`
- [ ] `src/accounting/constants`
- [ ] `src/accounting/globals`

### 2. Shared Core

- [ ] `src/accounting/constants/accounting.ts`
- [ ] `src/accounting/types/accounting.ts`
- [ ] `src/accounting/utils/amounts.ts`
- [ ] `src/accounting/utils/accounting-audit.ts`
- [ ] `src/accounting/globals/AccountingSettings.ts`

### 3. Master Data

- [ ] `AccountingChartOfAccounts`
- [ ] `AccountingFiscalYears`
- [ ] `AccountingPeriods`
- [ ] `AccountingTaxCodes`

### 4. Journal Data

- [ ] `AccountingJournalEntries`
- [ ] `AccountingJournalEntryLines`

### 5. Posting And Journal Services

- [ ] `AccountingJournalService`
- [ ] `AccountingPostingService`
- [ ] `AccountingPeriodService`
- [ ] `AccountingManualWorkflowService`
- [ ] `AccountingCloseService`

### 6. Reports And Queries

- [ ] `AccountingLedgerReportService`
- [ ] `AccountingTrialBalanceService`
- [ ] `getGeneralLedger`
- [ ] `getTrialBalance`

### 7. Manual Workflows

- [ ] create chart of accounts
- [ ] create fiscal year
- [ ] create accounting periods
- [ ] create tax codes
- [ ] create manual journal draft
- [ ] validate journal balances
- [ ] post journal entry
- [ ] reverse posted journal entry
- [ ] create adjustment entry
- [ ] create opening balance entry
- [ ] browse general ledger by account/date range
- [ ] generate trial balance by period/date range
- [ ] close accounting period
- [ ] reopen accounting period
- [ ] close fiscal year
- [ ] reopen fiscal year

### 8. Non-Negotiable Rules

- [ ] account code uniqueness
- [ ] no account hierarchy cycles
- [ ] no overlap in fiscal year ranges
- [ ] no overlap in period ranges within fiscal year
- [ ] every line has exactly one positive debit or credit
- [ ] zero-value lines rejected
- [ ] journal totals must balance before posting
- [ ] posted entries immutable except through reversal workflow
- [ ] posting resolves fiscal year and period from posting date
- [ ] posting blocked in closed/draft periods
- [ ] `lockedFromDate` enforced
- [ ] `closeMode` enforced
- [ ] `allowManualEntries` enforced
- [ ] `isControlAccount` enforced
- [ ] inactive accounts blocked
- [ ] reports read only posted accounting data
- [ ] general ledger running balance calculated in sorted order
- [ ] report batching/pagination prevents truncation

### 9. Access And Audit

- [ ] `admin.group: 'Accounting'`
- [ ] admin-only accounting write access
- [ ] creator tracking
- [ ] updater tracking
- [ ] postedBy tracking
- [ ] postedAt tracking
- [ ] reversedBy tracking
- [ ] closedBy tracking
- [ ] closedAt tracking
- [ ] destructive edits to posted data blocked

### 10. Payload Registration

- [ ] register `AccountingChartOfAccounts`
- [ ] register `AccountingFiscalYears`
- [ ] register `AccountingPeriods`
- [ ] register `AccountingTaxCodes`
- [ ] register `AccountingJournalEntries`
- [ ] register `AccountingJournalEntryLines`
- [ ] register `AccountingSettings`
- [ ] wire accounting endpoints in `src/payload.config.ts`

### 11. Migrations And Types

- [ ] create accounting migration
- [ ] register migration in `src/migrations/index.ts`
- [ ] regenerate Payload types

### 12. Tests

- [ ] balancing rules
- [ ] period resolution
- [ ] posting restrictions
- [ ] reversal logic
- [ ] general ledger output
- [ ] trial balance output
- [ ] lock-date enforcement
- [ ] control-account/manual-account restrictions

## Verification Checklist

- [ ] accounts can be created and categorized
- [ ] fiscal years can be created and maintained
- [ ] periods can be created and maintained
- [ ] tax codes exist as reusable master data
- [ ] journal entries can be drafted
- [ ] journal entries can be posted
- [ ] posted entries are balanced
- [ ] posting respects fiscal period rules
- [ ] reversal entries work
- [ ] opening balance workflow works
- [ ] trial balance can be produced
- [ ] general ledger can be queried
- [ ] posted accounting data is auditable
- [ ] access is safely restricted for internal finance use
- [ ] implementation stays aligned with `accounting-features.md`
- [ ] implementation stays aligned with `coding-principles.md`
