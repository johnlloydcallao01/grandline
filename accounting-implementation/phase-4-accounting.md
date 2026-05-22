For reference, please refer to the following files:
accounting-implementation/accounting-features.md
accounting-implementation/coding-principles.md

When implementing, ensure we are following the accounting scope in `accounting-features.md` and the architecture rules in `coding-principles.md`.


### Phase 4: Advanced operational finance

Mapped feature numbers:

- `13. Projects, time, and profitability`
- `14. Budgeting, planning, and forecasting`
- `15. Fixed assets, payroll, and growth support`

Why these belong together:

- these are important, but they are not the first blockers for building accounting around the LMS
- they are safer to add after the core transaction, reporting, and LMS monetization flows are already stable

## Goal of Phase 4

Phase 4 should deliver the `advanced operational finance layer` that sits on top of the accounting foundation, commercial accounting, and LMS monetization layers.

That means:

- finance should gain operational planning and analysis tools beyond basic bookkeeping and invoicing
- the system should support project profitability, time tracking, budgeting, and asset lifecycle tracking
- the platform should begin supporting growth-stage finance operations such as payroll-linked postings, approval workflows, branch or location dimensions, and richer audit tooling

It should `not` redefine the accounting core. It should enrich it.

## Core dependency on Phases 1, 2, and 3

Phase 4 must not bypass the earlier accounting layers.

It depends on Phase 1 having:

- chart of accounts
- fiscal years and periods
- journal and posting engine
- tax codes
- accounting settings
- general ledger and trial balance

It depends on Phase 2 having:

- customers and vendors
- invoices, bills, payments, expenses, and banking
- document linkage
- reports over commercial accounting transactions

It depends on Phase 3 having:

- LMS-to-accounting bridge records
- enrollment-linked billing
- receipts and payment allocations
- refunds and revenue recognition
- instructor-cost linkage and LMS finance reporting patterns

Every Phase 4 workflow should eventually resolve into:

- standard operational master data
- standard source documents or schedules
- posted journal effects using the earlier accounting engine
- reportable outputs that do not alter the underlying accounting truth

## Current `apps/cms` realities this plan must follow

Based on the current codebase, the implementation plan for Phase 4 must align with these repo realities:

- there are currently no project, timesheet, budget, fixed-asset, depreciation, payroll, branch, or location collections in `apps/cms`
- current collections are heavily centered on LMS, content, support, chat, notifications, and user/account records
- admin grouping already exists in the CMS for domains such as `Learning Management`, `Support`, `Chat`, and `Notifications`
- shared upload infrastructure already exists in the `media` collection and should be reused for Phase 4 attachments where needed
- there is an existing `user-events` collection that shows a precedent for audit-like event storage, but it is user/security oriented rather than finance-operational
- there is no mature finance role model yet beyond the current top-level roles of `admin`, `service`, `instructor`, and `trainee`
- there are hints that department-oriented access was removed historically, so Phase 4 should reintroduce dimensions like department or branch only in a deliberate finance-safe way

These realities imply:

- Phase 4 is mostly `net-new accounting and operational finance` work rather than adaptation of existing collections
- the new modules should live under the accounting namespace rather than being mixed into LMS structures
- the phase should stay optional and modular because it is not required for the accounting backbone to function
- branch, location, department, and approval capabilities should be introduced as structured finance dimensions and workflows, not casual flags added across unrelated collections

## Phase 4 scope

### In scope

- projects
- project tasks
- time entries
- timesheets
- timer support
- billable and non-billable time
- project profitability views
- budgets
- forecasts
- scenario planning
- fixed assets
- asset categories
- depreciation schedules
- asset disposal and write-off workflows
- payroll-linked finance support
- contractor payout support
- reimbursement-linked payroll or payable posting support
- branch, location, and department dimensions
- approval workflows
- richer finance audit tools

### Explicitly out of scope for now

- replacing the earlier accounting foundation
- turning the CMS into a full HRIS or workforce-management suite
- replacing LMS teaching workflows with generic project management
- overengineering advanced enterprise modules before core finance adoption is proven

## Phase 4 deliverables

At the end of Phase 4, the system should have:

- project and profitability structures
- time tracking and timesheet flows
- budget and forecast models
- fixed asset and depreciation support
- payroll-related accounting support at a practical finance level
- branch, location, and department dimensions for reporting and tagging
- approval workflows for sensitive operational finance actions
- dedicated finance audit tooling beyond basic record-level metadata

## Recommended file and folder plan for `apps/cms`

Phase 4 should extend the accounting namespace created in earlier phases rather than creating a parallel operational system.

### New accounting domain folders to use or extend

- `src/accounting/collections`
- `src/accounting/services`
- `src/accounting/services/projects`
- `src/accounting/services/time`
- `src/accounting/services/budgets`
- `src/accounting/services/assets`
- `src/accounting/services/payroll`
- `src/accounting/services/approvals`
- `src/accounting/services/audit`
- `src/accounting/services/reports`
- `src/accounting/queries`
- `src/accounting/types`
- `src/accounting/utils`

### New HTTP route area if needed during or after Phase 4

- `src/app/api/accounting/projects/...`
- `src/app/api/accounting/time/...`
- `src/app/api/accounting/budgets/...`
- `src/app/api/accounting/assets/...`
- `src/app/api/accounting/payroll/...`
- `src/app/api/accounting/approvals/...`
- `src/app/api/accounting/reports/...`

These routes should stay delivery-oriented and should call services rather than owning the finance logic.

### Recommended Phase 4 files

- `src/accounting/collections/AccountingProjects.ts`
- `src/accounting/collections/AccountingProjectTasks.ts`
- `src/accounting/collections/AccountingTimeEntries.ts`
- `src/accounting/collections/AccountingTimesheets.ts`
- `src/accounting/collections/AccountingBudgets.ts`
- `src/accounting/collections/AccountingBudgetLines.ts`
- `src/accounting/collections/AccountingForecastScenarios.ts`
- `src/accounting/collections/AccountingFixedAssets.ts`
- `src/accounting/collections/AccountingDepreciationEntries.ts`
- `src/accounting/collections/AccountingAssetDisposals.ts`
- `src/accounting/collections/AccountingPayrollRuns.ts`
- `src/accounting/collections/AccountingPayrollEntries.ts`
- `src/accounting/collections/AccountingApprovalWorkflows.ts`
- `src/accounting/collections/AccountingApprovalRequests.ts`
- `src/accounting/collections/AccountingAuditLogs.ts`
- `src/accounting/collections/AccountingBranches.ts`
- `src/accounting/collections/AccountingDepartments.ts`
- `src/accounting/collections/AccountingLocations.ts`
- `src/accounting/services/projects/AccountingProjectService.ts`
- `src/accounting/services/time/AccountingTimeTrackingService.ts`
- `src/accounting/services/budgets/AccountingBudgetService.ts`
- `src/accounting/services/assets/AccountingFixedAssetService.ts`
- `src/accounting/services/assets/AccountingDepreciationService.ts`
- `src/accounting/services/payroll/AccountingPayrollService.ts`
- `src/accounting/services/approvals/AccountingApprovalService.ts`
- `src/accounting/services/audit/AccountingAuditService.ts`
- `src/accounting/services/reports/AccountingProjectProfitabilityService.ts`
- `src/accounting/services/reports/AccountingBudgetVarianceService.ts`
- `src/accounting/services/reports/AccountingAssetRegisterService.ts`
- `src/accounting/services/reports/AccountingPayrollPostingReportService.ts`
- `src/accounting/queries/getProjectProfitability.ts`
- `src/accounting/queries/getBudgetVsActual.ts`
- `src/accounting/queries/getAssetRegister.ts`
- `src/accounting/queries/getDepreciationSchedule.ts`
- `src/accounting/queries/getApprovalQueue.ts`

### Existing repo areas that Phase 4 should respect

- `src/collections/Users.ts`
- `src/collections/Instructors.ts`
- `src/collections/Media.ts`
- `src/collections/UserEvents.ts`
- `src/access/index.ts`
- `src/payload.config.ts`
- `src/migrations/index.ts`

## Recommended integration principle for Phase 4

This is the most important design rule of the phase:

- `Phase 4 modules enrich accounting`
- `they do not redefine posting truth`

That means:

- project profitability should read invoices, expenses, time, and cost allocations rather than inventing a separate finance ledger
- budgets should compare against posted or standardized accounting outputs rather than freehand spreadsheets hidden in JSON blobs
- asset depreciation should post through standard journal flows
- payroll-related postings should still result in standard accounting documents or journal entries
- approvals should control sensitive actions, not become the accounting engine themselves
- audit tooling should observe and explain finance behavior, not replace proper finance service boundaries

## Recommended collection design

### 1. `accounting-projects`

Purpose:

- support project-based finance analysis for corporate training engagements, internal initiatives, or special operational work

Important repo-specific note:

- the LMS is course-centric, not project-centric, so Phase 4 should treat projects as an optional overlay rather than a replacement for course structures

Minimum fields:

- `projectCode`
- `name`
- `status`
- `customer`
- `managerUser`
- `projectType`
- `startDate`
- `endDate`
- `department`
- `branch`
- `location`
- `budgetAmount`
- `notes`

Recommended project types:

- `internal`
- `customer_project`
- `training_delivery`
- `implementation`

Recommended statuses:

- `draft`
- `active`
- `on_hold`
- `completed`
- `cancelled`

### 2. `accounting-project-tasks`

Purpose:

- break project work into trackable units for time and profitability analysis

Minimum fields:

- `project`
- `taskCode`
- `name`
- `status`
- `assignedTo`
- `billable`
- `startDate`
- `dueDate`
- `notes`

### 3. `accounting-time-entries`

Purpose:

- record billable and non-billable time against projects, tasks, or finance-relevant work

Minimum fields:

- `entryDate`
- `user`
- `project`
- `projectTask`
- `course`
- `instructor`
- `hours`
- `minutes`
- `billable`
- `billingRate`
- `costRate`
- `status`
- `sourceType`
- `notes`

Recommended statuses:

- `draft`
- `submitted`
- `approved`
- `rejected`
- `posted`

Important rule:

- time entries should not directly generate invoices or payroll entries without controlled service logic

### 4. `accounting-timesheets`

Purpose:

- group time entries for approval and payroll or billing use

Minimum fields:

- `user`
- `periodStart`
- `periodEnd`
- `status`
- `totalHours`
- `approvedBy`
- `approvedAt`
- `notes`

Recommended statuses:

- `draft`
- `submitted`
- `approved`
- `rejected`
- `locked`

### 5. `accounting-budgets`

Purpose:

- support budget planning across organizational and operational dimensions

Minimum fields:

- `budgetCode`
- `name`
- `fiscalYear`
- `status`
- `budgetType`
- `department`
- `branch`
- `location`
- `project`
- `courseCategory`
- `scenario`
- `notes`

Recommended budget types:

- `annual`
- `monthly`
- `project`
- `department`
- `course_category`

Recommended statuses:

- `draft`
- `approved`
- `locked`
- `archived`

### 6. `accounting-budget-lines`

Purpose:

- store budget values at account or category line level

Minimum fields:

- `budget`
- `account`
- `period`
- `plannedAmount`
- `notes`

### 7. `accounting-forecast-scenarios`

Purpose:

- support scenario planning and future-looking financial views

Minimum fields:

- `name`
- `scenarioType`
- `fiscalYear`
- `status`
- `assumptions`
- `notes`

Recommended scenario types:

- `base_case`
- `best_case`
- `worst_case`
- `custom`

### 8. `accounting-fixed-assets`

Purpose:

- maintain a fixed asset register for long-lived operational assets

Minimum fields:

- `assetCode`
- `name`
- `assetCategory`
- `purchaseDate`
- `inServiceDate`
- `cost`
- `salvageValue`
- `usefulLifeMonths`
- `depreciationMethod`
- `expenseAccount`
- `assetAccount`
- `accumulatedDepreciationAccount`
- `branch`
- `location`
- `department`
- `status`
- `notes`

Recommended statuses:

- `draft`
- `active`
- `fully_depreciated`
- `disposed`
- `written_off`

### 9. `accounting-depreciation-entries`

Purpose:

- record scheduled or posted depreciation amounts for fixed assets

Minimum fields:

- `fixedAsset`
- `fiscalYear`
- `period`
- `depreciationDate`
- `amount`
- `status`
- `postedJournalEntry`
- `notes`

Recommended statuses:

- `scheduled`
- `posted`
- `reversed`

### 10. `accounting-asset-disposals`

Purpose:

- track disposal, sale, or write-off of assets

Minimum fields:

- `fixedAsset`
- `disposalDate`
- `disposalType`
- `proceedsAmount`
- `bookValueAtDisposal`
- `gainOrLossAmount`
- `status`
- `postedJournalEntry`
- `notes`

Recommended disposal types:

- `sale`
- `write_off`
- `scrap`
- `transfer`

### 11. `accounting-payroll-runs`

Purpose:

- group payroll periods and support payroll-related journal posting without turning the CMS into a full HR system

Important repo-specific note:

- there is no existing payroll module in `apps/cms`
- Phase 4 should keep payroll support finance-oriented and practical rather than trying to become a full workforce platform

Minimum fields:

- `payrollCode`
- `periodStart`
- `periodEnd`
- `paymentDate`
- `status`
- `branch`
- `department`
- `notes`

Recommended statuses:

- `draft`
- `review`
- `approved`
- `posted`
- `voided`

### 12. `accounting-payroll-entries`

Purpose:

- store person-level payroll or contractor payout figures inside a payroll run

Minimum fields:

- `payrollRun`
- `user`
- `instructor`
- `entryType`
- `grossAmount`
- `deductionAmount`
- `netAmount`
- `expenseAccount`
- `payableAccount`
- `status`
- `notes`

Recommended entry types:

- `salary`
- `contractor`
- `reimbursement`
- `adjustment`

### 13. `accounting-approval-workflows`

Purpose:

- define reusable approval chains for sensitive accounting and finance actions

Minimum fields:

- `workflowCode`
- `name`
- `entityType`
- `isActive`
- `steps`
- `notes`

Recommended entity types:

- `invoice`
- `bill`
- `expense`
- `journal`
- `budget`
- `asset_disposal`
- `timesheet`
- `payroll_run`

### 14. `accounting-approval-requests`

Purpose:

- capture actual approval instances against documents or workflows

Minimum fields:

- `workflow`
- `entityType`
- `entityId`
- `status`
- `requestedBy`
- `currentApprover`
- `requestedAt`
- `resolvedAt`
- `resolutionNotes`

Recommended statuses:

- `pending`
- `approved`
- `rejected`
- `cancelled`

### 15. `accounting-audit-logs`

Purpose:

- provide finance-specific audit tooling beyond general record metadata and the existing user-events collection

Important repo-specific note:

- `user-events` is useful precedent, but it is user/security focused
- finance needs a dedicated operational and accounting audit view

Minimum fields:

- `entityType`
- `entityId`
- `actionType`
- `performedBy`
- `performedAt`
- `beforeData`
- `afterData`
- `reason`
- `metadata`

Recommended action types:

- `created`
- `updated`
- `submitted`
- `approved`
- `posted`
- `reversed`
- `voided`
- `exported`

### 16. `accounting-branches`

Purpose:

- support multi-branch and operational segmentation

Minimum fields:

- `branchCode`
- `name`
- `status`
- `address`
- `notes`

### 17. `accounting-departments`

Purpose:

- support departmental planning, budgeting, and reporting

Minimum fields:

- `departmentCode`
- `name`
- `status`
- `branch`
- `notes`

### 18. `accounting-locations`

Purpose:

- support physical or operational locations for assets, budgets, and reporting

Minimum fields:

- `locationCode`
- `name`
- `status`
- `branch`
- `notes`

## Recommended handling of existing repo structures

### `users` and `instructors`

Use them as:

- the human identity layer for project ownership, time entry ownership, instructor payout, and payroll linkage

Do not use them as:

- the finance record itself

Instead:

- Phase 4 collections should reference `users` or `instructors` where needed and keep finance calculations in accounting services

### `media`

Use it as:

- the upload and attachment pipeline for time-entry evidence, payroll supporting documents, asset invoices, asset photos, approval attachments, and budget files

Do not create:

- a second upload engine for Phase 4

### `user-events`

Use it as:

- a precedent that the repo already supports event-style logging

Do not use it as:

- the finance audit layer itself

Instead:

- build dedicated `accounting-audit-logs` for finance and operational accounting activity

## Recommended project and profitability strategy

Phase 4 projects should not fight the LMS model.

Recommended principle:

- courses remain training products
- projects represent finance or delivery overlays where profitability analysis is useful

Good Phase 4 use cases in this repo:

- corporate training engagements
- internal implementation or platform initiatives
- special instructor-led delivery work
- bundled service packages around maritime training operations

Profitability should be derived from:

- linked revenue
- linked expenses
- linked time cost
- linked instructor or contractor cost

It should not rely on:

- manually maintained profitability totals with no traceable source records

## Recommended time tracking strategy

Time tracking is useful in Phase 4, but it should stay optional and structured.

Recommended principle:

- time entries feed profitability, project analysis, approval, and possibly payroll or contractor payout support

They should not:

- become the core LMS lesson-tracking model
- replace existing LMS progress tracking

If timer support is added later:

- keep timer state as a UI or workflow convenience
- persist only finalized time entries as the finance-relevant record

## Recommended budgeting and forecasting strategy

Budgets should compare against real accounting outputs from earlier phases.

Recommended dimensions:

- account
- fiscal year
- period
- department
- branch
- location
- project
- course category where useful

Recommended reporting outputs:

- budget vs actual by account
- budget vs actual by department
- budget vs actual by project
- budget vs actual by course category
- scenario variance reporting

Important rule:

- do not use budget collections as a shadow accounting ledger

## Recommended fixed asset strategy

The LMS likely uses equipment, office assets, and operational infrastructure, but those do not yet exist as structured finance records in the repo.

Phase 4 should support:

- fixed asset register
- depreciation scheduling
- disposal and write-off flows
- branch, department, and location assignment

Important rule:

- asset movements should post through standard journal flows from earlier phases
- accumulated depreciation should remain traceable to the asset register and depreciation entries

## Recommended payroll and contractor strategy

Phase 4 payroll support should be finance-oriented, not full HR software.

Recommended principle:

- use payroll runs and payroll entries to support accounting postings
- support salary expense, contractor payouts, reimbursements, and deductions at a practical accounting level
- keep personnel administration, attendance, and deep HR workflows out of scope unless explicitly expanded later

Repo-specific application:

- instructors and possibly service or admin users can become payroll or contractor-linked parties
- instructor payout records from Phase 3 can later feed into Phase 4 payroll or payable flows

## Recommended approval workflow strategy

The repo already uses status-based operational flows in modules like support tickets and enrollments.

Phase 4 should generalize controlled approvals for finance-sensitive actions such as:

- timesheet approval
- budget approval
- expense approval
- bill approval
- journal approval
- asset disposal approval
- payroll approval

Important rule:

- approval workflows should coordinate authorization and status transitions
- they should not own posting logic

## Recommended audit tooling strategy

Phase 4 should add stronger finance observability than earlier phases.

Recommended outputs:

- approval trail view
- posting activity view
- reversal history view
- export log view
- budget revision view
- asset lifecycle history
- payroll posting audit trail

This should complement, not replace:

- collection-level metadata
- audit fields on documents
- service-level accounting controls

## Recommended branch, location, and department strategy

Phase 4 should add these as structured finance dimensions instead of ad hoc text fields scattered across modules.

Recommended principle:

- introduce master records first
- then reference them from budgets, projects, assets, payroll runs, and reports

Important repo-specific note:

- because department-oriented access appears to have been removed historically, this phase should reintroduce dimensions deliberately and only where finance benefits clearly outweigh complexity

## Access and permissions strategy for Phase 4

Phase 4 must still respect the current top-level role model in `apps/cms`.

Current reality:

- the app currently has `admin`, `service`, `instructor`, and `trainee`
- dedicated finance roles do not yet exist as platform roles

Recommended Phase 4 access plan:

- `admin` gets full Phase 4 access
- `service` may get narrow controlled read or system-level support access where necessary
- `instructor` should only interact with Phase 4 indirectly where they submit time, view payout-relevant summaries, or participate in approvals intentionally designed for them
- `trainee` should have no general Phase 4 accounting access

Important rule:

- even if later finance-specific role granularity is introduced, Phase 4 should still keep business logic in services and use controlled endpoints for delivery

## Posting and anti-spaghetti rules for Phase 4

These rules should be treated as mandatory:

- project profitability must read real finance sources
- budgets must compare against standardized accounting outputs
- depreciation must post through standard journal flows
- payroll-related postings must map to standard accounting documents or journal entries
- approval workflows must call services instead of duplicating accounting decisions
- audit tooling must observe service outcomes rather than re-implement them

Critical anti-spaghetti rules:

- never create a second financial truth inside project modules
- never let timesheets directly mutate invoice, payroll, or ledger data without service orchestration
- never let budgets become editable substitutes for actual accounting results
- never let asset depreciation exist only as spreadsheet-like snapshots with no posting link
- never mix branch, location, and department dimensions into random JSON blobs if they are report dimensions

## Recommended implementation sequence

### Step 1. Confirm earlier phase stability

Plan:

- verify that Phase 1, 2, and 3 finance structures are stable enough to support advanced overlays
- ensure commercial accounting and LMS monetization reports are trustworthy before adding operational planning layers

Definition of done:

- Phase 4 starts only after the earlier accounting layers are reliable

### Step 2. Introduce finance dimensions

Plan:

- create branch, department, and location master records first
- use them as shared dimensions across later Phase 4 modules

Definition of done:

- advanced operational modules can tag and report data consistently

### Step 3. Implement projects and task structure

Plan:

- create projects
- create project tasks
- define optional linkage to customers, courses, and branches

Definition of done:

- the platform can group financial activity around optional operational units

### Step 4. Implement time entries and timesheets

Plan:

- create time entries
- create timesheets
- define billable and cost logic
- define approval readiness

Definition of done:

- time can be captured and reviewed as structured finance-adjacent data

### Step 5. Implement budgets and forecast scenarios

Plan:

- create budgets
- create budget lines
- create scenario records
- define budget vs actual report logic

Definition of done:

- finance planning data can be compared to actual accounting performance

### Step 6. Implement fixed asset and depreciation support

Plan:

- create fixed assets
- create depreciation entries
- create disposal records
- post depreciation through the accounting engine

Definition of done:

- the platform can track asset lifecycle and depreciation with traceable postings

### Step 7. Implement payroll and contractor finance support

Plan:

- create payroll runs
- create payroll entries
- support salary, contractor, reimbursement, and adjustment types
- keep this accounting-focused rather than HR-heavy

Definition of done:

- payroll-related finance activity can be grouped, reviewed, and posted consistently

### Step 8. Implement approval workflows

Plan:

- define workflow templates
- define approval instances
- connect them to sensitive finance actions

Definition of done:

- high-risk finance operations can be controlled through structured workflow gates

### Step 9. Implement finance audit tools and report views

Plan:

- create dedicated audit-log collections and audit services
- surface approval, posting, reversal, and export history in finance-oriented views

Definition of done:

- operational finance actions become explainable and reviewable

### Step 10. Expose controlled APIs and read models only after services are stable

Plan:

- add read or action routes under `src/app/api/accounting/...` as needed
- keep routes thin and service-driven

Definition of done:

- Phase 4 functionality is accessible without routes becoming the true business-logic layer

### Step 11. Register collections, extend migrations, and regenerate types

Plan:

- register Phase 4 accounting collections in `src/payload.config.ts`
- create and register migrations in `src/migrations`
- regenerate Payload types after schema changes

Definition of done:

- Phase 4 modules are consistently registered, migratable, and type-safe

## Recommended registration order in `src/payload.config.ts`

When implementation begins, register in this approximate order:

1. `AccountingBranches`
2. `AccountingDepartments`
3. `AccountingLocations`
4. `AccountingProjects`
5. `AccountingProjectTasks`
6. `AccountingBudgets`
7. `AccountingBudgetLines`
8. `AccountingForecastScenarios`
9. `AccountingTimeEntries`
10. `AccountingTimesheets`
11. `AccountingFixedAssets`
12. `AccountingDepreciationEntries`
13. `AccountingAssetDisposals`
14. `AccountingPayrollRuns`
15. `AccountingPayrollEntries`
16. `AccountingApprovalWorkflows`
17. `AccountingApprovalRequests`
18. `AccountingAuditLogs`

Why:

- finance dimensions should exist before operational records reference them
- project and planning structures should come before dependent time or profitability records
- asset and payroll structures should follow shared dimensions and earlier accounting primitives
- approval and audit tooling should follow the entities they will monitor

## Recommended admin grouping

All Phase 4 collections should continue to use:

- `admin.group: 'Accounting'`

Important rule:

- even when a Phase 4 collection touches instructors, users, or LMS delivery concepts, it should stay under `Accounting` if its primary purpose is finance or operational accounting

## Recommended slug style

Use explicit accounting slugs:

- `accounting-projects`
- `accounting-project-tasks`
- `accounting-time-entries`
- `accounting-timesheets`
- `accounting-budgets`
- `accounting-budget-lines`
- `accounting-forecast-scenarios`
- `accounting-fixed-assets`
- `accounting-depreciation-entries`
- `accounting-asset-disposals`
- `accounting-payroll-runs`
- `accounting-payroll-entries`
- `accounting-approval-workflows`
- `accounting-approval-requests`
- `accounting-audit-logs`
- `accounting-branches`
- `accounting-departments`
- `accounting-locations`

## Recommended service rules

The following Phase 4 rules should be treated as non-negotiable:

- service layers compute profitability, depreciation, and payroll posting logic
- routes only deliver or orchestrate requests
- approvals coordinate state but do not implement posting rules
- audit services record finance activity rather than replacing finance services
- reporting services read standardized outputs from earlier phases plus Phase 4 dimensions

## Testing and verification plan for later implementation

When implementation actually starts, Phase 4 should be verified with:

- unit tests for project profitability calculations
- unit tests for time cost calculations
- unit tests for budget variance calculations
- unit tests for depreciation schedule generation
- unit tests for payroll posting preparation
- unit tests for approval routing and resolution logic
- unit tests for finance audit-log creation
- integration tests for project-to-profitability flows
- integration tests for timesheet approval flows
- integration tests for budget vs actual reporting
- integration tests for depreciation posting flows
- integration tests for payroll-run posting flows
- integration tests for approval-controlled finance actions

Critical scenarios to verify:

- project profitability matches real underlying transactions and costs
- rejected timesheets do not leak into profitability or payroll logic
- budget variance uses posted or standardized actuals correctly
- depreciation entries reconcile to asset records and posted journals
- payroll-run approvals prevent premature posting
- audit logs reflect sensitive finance actions consistently
- branch, location, and department filters produce stable report slices

## Practical risks to avoid during implementation

- building Phase 4 before earlier phases are stable
- treating projects as replacements for LMS courses
- storing time, budgets, or assets only in generic JSON fields
- building a payroll HR suite when only finance posting support is needed
- creating a second audit universe that conflicts with document-level audit metadata
- overusing dimensions like department or branch before finance actually needs them
- letting approval workflows become the hidden owner of accounting business logic

## Definition of done for the whole Phase 4

Phase 4 is complete when:

- projects, time tracking, and profitability analysis can work without redefining the accounting core
- budgets and forecasts can be maintained and compared to actual accounting outputs
- fixed assets, depreciation, and disposals are tracked and financially traceable
- payroll-related finance support is available at a practical accounting level
- branch, location, and department dimensions can be used consistently across advanced finance modules
- approval workflows can gate sensitive operational finance actions
- finance audit tooling gives visibility into high-risk actions and changes
- the implementation remains aligned with `accounting-features.md` and `coding-principles.md`

## Final implementation recommendation

The safest way to attack Phase 4 in this repo is:

1. treat it as optional and additive
2. build finance dimensions first
3. build projects, time, and planning next
4. add assets and payroll only after reporting and approvals are ready to control them
5. keep all advanced modules under `Accounting`
6. keep services as the true owner of finance behavior

This preserves the current `apps/cms` architecture, keeps advanced operational finance decoupled from the LMS core, and lets the platform grow into a richer finance system without destabilizing the accounting backbone.
