# Accounting Coding Principles For `apps/cms`

## Core principle

For accounting implementation in `apps/cms`, the safest principle is `layered architecture`, not `API-first only` and not `generic collections only`.

The clean rule is:

- `collections/models` define schema and persistence boundaries
- `services/domain layer` contain reusable accounting rules
- `endpoints/api routes` orchestrate requests, auth, validation, and response shaping
- `hooks/access rules` stay thin and handle Payload-specific integration concerns only

In short:

- do not put core accounting logic directly inside endpoints
- do not rely only on generic collections and hooks
- put the real accounting behavior in services
- let endpoints, hooks, jobs, and admin actions call the same service layer

## Why service-first is the best fit

This approach is better because:

- endpoints are `transport-specific`
- collections are `storage-specific`
- hooks are `Payload lifecycle-specific`
- services are reusable across API routes, admin actions, scripts, jobs, and future integrations

If you make everything endpoint-driven:

- logic gets duplicated across routes
- admin panel actions and hooks cannot reuse behavior cleanly
- testing becomes harder
- future non-HTTP use cases become awkward

If you make everything collection-driven:

- business rules become too coupled to Payload internals
- workflows become harder to reason about
- domain logic gets scattered across hooks

So the best principle for accounting in this repo is:

- `collections for schema`
- `services for business logic`
- `api/endpoints for delivery`
- `hooks only for thin integration glue`

## Recommended coding architecture

At implementation level, the safest structure is:

- `master data layer`
- `source document layer`
- `posting engine layer`
- `ledger/query/reporting layer`
- `domain adapters` for LMS-specific flows

In practical terms:

- master data holds accounts, tax codes, fiscal years, customers, vendors, and banks
- source documents hold invoices, bills, expenses, payments, refunds, and other accounting records
- posting engine translates business events into journal entries
- ledger and reports read posted accounting data
- LMS-specific features map enrollments, scholarships, and corporate billing into standard source documents

## Layer responsibilities

### Collections and models

Collections should own:

- schema definition
- relationships
- field validation that is structural
- indexing
- admin configuration
- persistence boundaries

Collections should not own:

- full accounting posting logic
- complex multi-step workflows
- duplicated business rules that also exist in endpoints or jobs

### Services and domain logic

Services should own:

- posting rules
- journal generation
- receivable and payable logic
- reversal logic
- refund behavior
- revenue recognition behavior
- reusable accounting calculations
- orchestration across multiple collections

This is the real accounting core.

### Endpoints and API routes

Endpoints should own:

- request parsing
- auth checks
- input validation
- calling the correct service
- shaping the response for the caller

Endpoints should not own:

- core debit and credit logic
- ledger mutations written ad hoc per route
- duplicated accounting rules

### Hooks and access rules

Hooks should own:

- thin integration glue
- safe lifecycle triggers
- simple synchronization work
- narrow guardrails

Hooks should not become:

- the main workflow engine
- the primary location of accounting policy

## How `fetching-solution.md` applies here

The guidance in [fetching-solution.md](file:///C:/Users/User/Desktop/grandline/fetching-solution.md) is correct, but only for the right layer and problem type.

It is strong for:

- frontend-to-backend fetching strategy
- BFF-style aggregation endpoints
- pages that need data from multiple collections
- keeping `apps/web` thin
- letting `apps/cms` resolve relationships, access, and response shaping

This pattern is especially correct for:

- announcements
- ask-instructor
- dashboard summaries
- trainee-scoped aggregated views

Its core principle is good:

- frontend should not stitch many raw collection calls
- backend should aggregate domain data
- frontend should consume one prepared response

That is the right approach for:

- access-sensitive fetching
- multi-collection joins
- normalized response shapes
- reducing duplication in `apps/web`

## Where the fetching pattern is not enough

For accounting, `fetching-solution.md` is only `partially applicable`.

Why:

- accounting is not just a fetching problem
- accounting is mainly about domain model, posting engine, ledger rules, journals, period controls, and transaction integrity
- an aggregation endpoint helps read or present accounting data
- it does not define how the accounting rules should be structured internally

So in accounting:

- yes for `read APIs`
- yes for `UI-facing endpoints`
- no as the `core implementation principle`

Best application in this case:

- use `services` for accounting behavior
- use `collections` for schema
- use `endpoints` for delivery and response shaping
- use BFF-style endpoints for finance dashboards and read models

So if the question is:

- should accounting dashboards or finance pages use backend aggregated endpoints?

Then:

- `Yes`

If the question is:

- should accounting business logic live mainly in those endpoints?

Then:

- `No`

The logic should live in reusable accounting services, with endpoints calling them.

## Practical warning signs of future spaghetti

Stop and refactor early if you see:

- invoice logic posting differently from bill logic without a clear reason
- payment modules updating balances directly instead of posting entries
- reports reading mixed raw tables instead of standardized accounting outputs
- enrollment logic bypassing invoice and payment flows
- tax logic duplicated across modules
- refund logic implemented differently in each feature
- bank reconciliation relying on manually adjusted balances instead of posted transactions
- business logic duplicated across hooks, endpoints, and admin actions
- services becoming thin wrappers while routes hold the real logic

## Naming convention and admin grouping

To keep accounting features from visually polluting LMS collections inside `apps/cms`, use a clear naming convention from the start.

Recommended rule:

- all accounting collections should use an `accounting/` mental namespace
- all accounting code should live under dedicated accounting folders
- all accounting collections in Payload admin should be grouped under a separate admin group such as `Accounting`
- LMS collections should remain under `Learning Management`

Recommended folder grouping examples:

- `src/accounting/collections`
- `src/accounting/services`
- `src/accounting/utils`
- `src/accounting/reports`
- `src/accounting/types`
- `src/accounting/queries`

Recommended route grouping examples:

- `src/app/api/accounting/...`
- `src/app/api/accounting/reports/...`
- `src/app/api/accounting/journals/...`

Why this is more aligned with `apps/cms`:

- the repo already uses `src/app/api/...` for HTTP route handlers
- collections already live in `src/collections`
- utility code already lives in `src/utils`
- so accounting domain code fits best under `src/accounting/...`, while HTTP handlers should stay under `src/app/api/accounting/...`

Recommended collection naming examples:

- `accounting-chart-of-accounts`
- `accounting-journal-entries`
- `accounting-journal-entry-lines`
- `accounting-customers`
- `accounting-vendors`
- `accounting-invoices`
- `accounting-bills`
- `accounting-payments-received`
- `accounting-payments-made`
- `accounting-bank-accounts`

Recommended code symbol naming examples:

- `AccountingChartOfAccounts`
- `AccountingJournalEntries`
- `AccountingInvoices`
- `AccountingPostingService`
- `AccountingReportService`
- `AccountingReadService`

Recommended admin grouping approach:

- use `admin.group: 'Accounting'` for accounting collections
- use `admin.group: 'Learning Management'` for LMS collections
- do not mix accounting collections into the LMS admin group unless the collection is truly LMS-specific

Recommended bridge naming for LMS-aware accounting modules:

- keep generic accounting modules generic
- use separate bridge modules for LMS-linked behavior, such as:
- `accounting-enrollment-billing-links`
- `accounting-scholarship-links`
- `accounting-corporate-billing-links`

Recommended practical split:

- use `src/accounting/...` for reusable accounting domain code
- use `src/app/api/accounting/...` for accounting HTTP delivery
- do not create a parallel endpoint convention that fights the existing route layout

Why this matters:

- it keeps the admin panel clean
- it makes code ownership clearer
- it prevents accounting modules from being mistaken for LMS content models
- it reduces naming collisions and future confusion as the codebase grows

## Final verdict

The clean conclusion for accounting coding principles in `apps/cms` is:

- `endpoint/API design matters`
- `fetching aggregation is valid for reads`
- `but endpoint design is not the primary accounting foundation`
- `service-first architecture is the right base`
- `collections and endpoints should act as adapters around reusable accounting services`
