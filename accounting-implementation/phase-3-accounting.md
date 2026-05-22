For reference, please refer to the following files:
accounting-implementation/accounting-features.md
accounting-implementation/coding-principles.md

When implementing, ensure we are following the accounting scope in `accounting-features.md` and the architecture rules in `coding-principles.md`.


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

## Goal of Phase 3

Phase 3 should deliver the `LMS-aware monetization layer` on top of the Phase 1 and Phase 2 accounting foundations.

That means:

- existing LMS records such as courses, enrollments, coupons, and certificates should begin participating in accounting flows
- the system should support enrollment-linked billing without turning the accounting core into LMS-specific code
- scholarships, sponsorships, corporate billing, coupons, refunds, receipts, and revenue recognition should work through standard accounting behavior
- LMS dashboards and finance views should be derived from the posted accounting and source-document model rather than custom ledger shortcuts

It should `not` rewrite Phase 1 or Phase 2 abstractions. Instead, it should adapt the LMS domain into them cleanly.

## Core dependency on Phases 1 and 2

Phase 3 must not bypass the earlier accounting layers.

It depends on Phase 1 having:

- chart of accounts
- fiscal years and periods
- tax codes
- journal and posting engine
- accounting settings
- general ledger and trial balance

It depends on Phase 2 having:

- customers
- invoices
- payments received
- credit notes and refunds pattern
- document linkage
- bank and cash handling
- reporting services

Every Phase 3 LMS workflow should eventually resolve into:

- standard source documents from Phase 2
- posted journal activity from Phase 1
- LMS-aware linking metadata rather than LMS-specific ledger hacks

## Current `apps/cms` realities this plan must follow

Based on the current codebase, the implementation plan for Phase 3 must align with these repo realities:

- the LMS already has `courses`, `course-enrollments`, `coupon-codes`, `coupon-redemptions`, `certificates`, `certificate-templates`, `instructors`, `trainees`, and `users`
- `course-enrollments` already stores `enrollmentType`, `status`, `paymentStatus`, `amountPaid`, coupon snapshots, pricing snapshots, and flexible `metadata`
- self-service enrollment requests already create `pending` enrollment records through `src/app/api/lms/enrollment-requests/route.ts`
- coupon validation and pricing logic already live in `src/utils/couponEngine.ts`
- coupon redemption audit logs already exist in `coupon-redemptions`
- certificate issuance already exists through `certificates` plus the `generate-certificate` endpoint
- certificate files already reuse the `media` collection
- course records already carry `price`, `discountedPrice`, and `certificateTemplate`
- the LMS already uses notification and route orchestration around enrollments
- finance logic is at risk of becoming mixed into LMS routes if Phase 3 is not strict about service-first boundaries

These realities imply:

- Phase 3 should reuse existing LMS collections instead of cloning them into accounting
- LMS-aware accounting should live in dedicated bridge modules under `src/accounting/...`
- route handlers such as enrollment routes should eventually call accounting bridge services rather than hand-implement finance behavior
- coupon pricing should reuse or wrap the existing coupon engine rather than replacing it
- certificates and enrollments should link into accounting through standard source-document patterns from Phase 2

## Phase 3 scope

### In scope

- course pricing overlays for finance purposes
- enrollment-to-invoice linkage
- installment and enrollment balance logic
- LMS payment allocation rules
- official receipts and proof-of-payment linkage
- scholarship and sponsorship support
- corporate billing support
- coupon and discount accounting visibility
- deferred revenue and revenue recognition schedules
- LMS refund, reversal, and credit memo flows
- instructor payout and training-delivery cost linkage
- certificate, retake, reassessment, and renewal monetization
- LMS-specific finance reporting and dashboards
- maritime training chart-of-accounts guidance

### Explicitly out of scope for now

- rewriting existing LMS course, enrollment, or certificate flows from scratch
- replacing the existing coupon engine with an accounting-only engine
- turning the accounting core into a hard dependency of every LMS route before bridge services are stable
- advanced operational finance such as projects, budgets, assets, payroll, or broader accounting-suite growth modules

## Phase 3 deliverables

At the end of Phase 3, the system should have:

- formal links between LMS enrollments and accounting invoices
- LMS-aware payment allocation support
- receipts and proof-of-payment tracking for enrollment payments
- scholarship, sponsorship, and corporate billing records linked to commercial accounting
- coupon and discount reporting tied to actual enrollment billing
- revenue recognition schedules for course service delivery
- refund and reversal workflows that trace back to enrollments and accounting documents
- instructor payout or cost-tracking support connected to courses and enrollments
- certificate and retake monetization support where applicable
- LMS-specific finance dashboards reading standardized accounting outputs

## Recommended file and folder plan for `apps/cms`

Phase 3 should extend the accounting namespace while linking into existing LMS collections.

### New accounting bridge folders to use or extend

- `src/accounting/collections`
- `src/accounting/services`
- `src/accounting/services/enrollment-billing`
- `src/accounting/services/scholarships`
- `src/accounting/services/corporate`
- `src/accounting/services/coupons`
- `src/accounting/services/revenue-recognition`
- `src/accounting/services/refunds`
- `src/accounting/services/instructor-costs`
- `src/accounting/services/receipts`
- `src/accounting/services/reports`
- `src/accounting/queries`
- `src/accounting/types`
- `src/accounting/utils`

### New HTTP route area if needed during or after Phase 3

- `src/app/api/accounting/lms/...`
- `src/app/api/accounting/lms/enrollments/...`
- `src/app/api/accounting/lms/receipts/...`
- `src/app/api/accounting/lms/reports/...`

These routes should remain delivery layers for finance-aware LMS views and actions, not the place where core accounting logic lives.

### Recommended Phase 3 files

- `src/accounting/collections/AccountingEnrollmentBillingLinks.ts`
- `src/accounting/collections/AccountingPaymentAllocations.ts`
- `src/accounting/collections/AccountingReceipts.ts`
- `src/accounting/collections/AccountingRefunds.ts`
- `src/accounting/collections/AccountingBillingAdjustments.ts`
- `src/accounting/collections/AccountingRevenueRecognitionSchedules.ts`
- `src/accounting/collections/AccountingScholarshipSponsors.ts`
- `src/accounting/collections/AccountingScholarshipAwards.ts`
- `src/accounting/collections/AccountingCorporateAccounts.ts`
- `src/accounting/collections/AccountingCorporateBillingLinks.ts`
- `src/accounting/collections/AccountingInstructorPayoutRules.ts`
- `src/accounting/collections/AccountingInstructorPayouts.ts`
- `src/accounting/collections/AccountingCourseFeeProfiles.ts`
- `src/accounting/services/enrollment-billing/AccountingEnrollmentBillingService.ts`
- `src/accounting/services/enrollment-billing/AccountingEnrollmentInvoiceService.ts`
- `src/accounting/services/payments/AccountingLmsPaymentAllocationService.ts`
- `src/accounting/services/receipts/AccountingReceiptService.ts`
- `src/accounting/services/scholarships/AccountingScholarshipService.ts`
- `src/accounting/services/corporate/AccountingCorporateBillingService.ts`
- `src/accounting/services/coupons/AccountingCouponReportingService.ts`
- `src/accounting/services/revenue-recognition/AccountingRevenueRecognitionService.ts`
- `src/accounting/services/refunds/AccountingLmsRefundService.ts`
- `src/accounting/services/instructor-costs/AccountingInstructorCostService.ts`
- `src/accounting/services/reports/AccountingLmsDashboardService.ts`
- `src/accounting/queries/getEnrollmentFinanceSummary.ts`
- `src/accounting/queries/getCorporateReceivables.ts`
- `src/accounting/queries/getScholarshipUtilization.ts`
- `src/accounting/queries/getCouponRevenueImpact.ts`
- `src/accounting/queries/getCompletionToRevenue.ts`
- `src/accounting/queries/getCertificateRevenue.ts`

### Existing LMS files and areas that Phase 3 must respect

- `src/collections/Courses.ts`
- `src/collections/CourseEnrollments.ts`
- `src/collections/CouponCodes.ts`
- `src/collections/CouponRedemptions.ts`
- `src/collections/Certificates.ts`
- `src/collections/Instructors.ts`
- `src/utils/couponEngine.ts`
- `src/app/api/lms/enrollment-requests/route.ts`
- `src/app/api/lms/enrollments/route.ts`
- `src/endpoints/generate-certificate.tsx`
- `src/payload.config.ts`
- `src/migrations/index.ts`

## Recommended integration principle for Phase 3

This is the most important design rule of the entire phase:

- `LMS records stay LMS records`
- `accounting records stay accounting records`
- `Phase 3 adds bridge layers between them`

That means:

- do not turn `course-enrollments` into the invoice itself
- do not turn `coupon-redemptions` into the accounting ledger
- do not turn `certificates` into a revenue schedule
- do not put full billing logic directly inside LMS API routes

Instead:

- keep enrollments as the LMS transaction trigger
- create or link Phase 2 accounting documents from them
- store links and finance metadata in dedicated accounting bridge collections or bridge services

## Recommended collection design

### 1. `accounting-enrollment-billing-links`

Purpose:

- link LMS enrollments to accounting documents without polluting either side

Minimum fields:

- `enrollment`
- `course`
- `trainee`
- `user`
- `invoice`
- `customer`
- `billingStatus`
- `sourceType`
- `sourceReference`
- `listPriceSnapshot`
- `salePriceSnapshot`
- `couponDiscountSnapshot`
- `scholarshipDiscountSnapshot`
- `corporateCoverageSnapshot`
- `finalChargeSnapshot`
- `currency`
- `linkedAt`
- `metadata`

Recommended billing statuses:

- `not_started`
- `drafted`
- `invoiced`
- `partially_paid`
- `paid`
- `cancelled`
- `refunded`

Important repo-specific note:

- `course-enrollments` already has pricing snapshots and metadata
- this bridge should reference or mirror the finance-relevant parts without overloading the LMS collection with accounting workflow state

### 2. `accounting-payment-allocations`

Purpose:

- allocate a payment across one or more invoices or enrollment-linked charges

Minimum fields:

- `paymentReceived`
- `invoice`
- `enrollmentBillingLink`
- `allocationDate`
- `allocatedAmount`
- `allocationType`
- `notes`

Recommended allocation types:

- `invoice_settlement`
- `deposit_application`
- `installment_payment`
- `refund_reversal`
- `manual_adjustment`

Important rule:

- balances should be derived from source documents plus allocations
- do not update enrollment or invoice balances by direct edits as a shortcut

### 3. `accounting-receipts`

Purpose:

- represent official receipts or receipt records for LMS payments

Minimum fields:

- `receiptNumber`
- `paymentReceived`
- `enrollmentBillingLink`
- `customer`
- `receiptDate`
- `amount`
- `currency`
- `status`
- `proofDocument`
- `issuedBy`
- `voidedAt`
- `voidedBy`
- `notes`

Recommended statuses:

- `draft`
- `issued`
- `voided`

Important repo-specific note:

- proof documents should reuse the existing `media` collection

### 4. `accounting-refunds`

Purpose:

- track LMS refund requests and their accounting treatment

Minimum fields:

- `refundNumber`
- `enrollmentBillingLink`
- `invoice`
- `paymentReceived`
- `creditNote`
- `refundDate`
- `refundReason`
- `refundType`
- `requestedAmount`
- `approvedAmount`
- `status`
- `processedBy`
- `proofDocument`
- `notes`

Recommended refund types:

- `full`
- `partial`
- `credit_only`

Recommended statuses:

- `draft`
- `requested`
- `approved`
- `processed`
- `rejected`
- `voided`

### 5. `accounting-billing-adjustments`

Purpose:

- capture manual LMS pricing adjustments outside base course price

Minimum fields:

- `enrollmentBillingLink`
- `adjustmentType`
- `reason`
- `amount`
- `direction`
- `approvedBy`
- `appliedAt`
- `notes`

Recommended adjustment types:

- `manual_discount`
- `manual_surcharge`
- `late_fee`
- `certificate_fee`
- `retake_fee`
- `reassessment_fee`
- `renewal_fee`

### 6. `accounting-revenue-recognition-schedules`

Purpose:

- defer and recognize revenue for LMS services over time or milestones

Minimum fields:

- `invoice`
- `enrollmentBillingLink`
- `recognitionMethod`
- `startDate`
- `endDate`
- `totalDeferredAmount`
- `recognizedAmount`
- `remainingDeferredAmount`
- `status`
- `scheduleData`
- `lastRecognitionAt`
- `notes`

Recommended recognition methods:

- `on_activation`
- `straight_line`
- `completion_based`
- `certificate_based`
- `manual`

Important repo-specific note:

- existing course and enrollment fields already include `enrollmentStartDate`, `courseStartDate`, `courseEndDate`, `accessExpiresAt`, `completedAt`, and certificate issuance behavior
- revenue recognition should reuse those signals rather than inventing unrelated lifecycle fields

### 7. `accounting-scholarship-sponsors`

Purpose:

- store scholarship or grant sponsor master data

Minimum fields:

- `sponsorCode`
- `name`
- `contactName`
- `email`
- `phone`
- `billingAddress`
- `defaultCustomer`
- `status`
- `notes`

### 8. `accounting-scholarship-awards`

Purpose:

- store scholarship coverage against specific enrollments

Minimum fields:

- `enrollmentBillingLink`
- `scholarshipSponsor`
- `trainee`
- `awardType`
- `awardAmount`
- `awardPercent`
- `traineeShareAmount`
- `effectiveDate`
- `status`
- `notes`

Recommended award types:

- `full`
- `partial`
- `contra_revenue`
- `third_party_billed`

### 9. `accounting-corporate-accounts`

Purpose:

- store B2B training customer structures for company-sponsored enrollments

Minimum fields:

- `accountCode`
- `name`
- `customer`
- `billingContact`
- `email`
- `phone`
- `creditTerms`
- `paymentTerms`
- `negotiatedPricingPolicy`
- `status`
- `notes`

Important repo-specific note:

- the current LMS already uses `corporate` as an enrollment type
- Phase 3 should formalize how that maps into Phase 2 customers and invoices

### 10. `accounting-corporate-billing-links`

Purpose:

- connect multiple trainee enrollments to a corporate billing account or invoice set

Minimum fields:

- `corporateAccount`
- `enrollmentBillingLink`
- `invoice`
- `coverageType`
- `coveredAmount`
- `traineeShareAmount`
- `status`
- `notes`

Recommended coverage types:

- `full_company_pay`
- `shared_pay`
- `credit_terms`

### 11. `accounting-instructor-payout-rules`

Purpose:

- define how instructors are compensated for monetized training activity

Minimum fields:

- `instructor`
- `course`
- `payoutMethod`
- `flatAmount`
- `percentOfRevenue`
- `perEnrollmentAmount`
- `completionBonusAmount`
- `status`
- `notes`

Recommended payout methods:

- `flat`
- `revenue_share`
- `per_enrollment`
- `hybrid`

### 12. `accounting-instructor-payouts`

Purpose:

- record calculated or approved instructor payout obligations

Minimum fields:

- `instructor`
- `course`
- `periodStart`
- `periodEnd`
- `sourceType`
- `sourceReference`
- `calculatedAmount`
- `approvedAmount`
- `status`
- `notes`

### 13. `accounting-course-fee-profiles`

Purpose:

- define optional LMS-specific monetized charges that sit above base course price

Minimum fields:

- `course`
- `certificateFee`
- `retakeFee`
- `reassessmentFee`
- `renewalFee`
- `latePaymentFee`
- `manualAdjustmentAllowed`
- `notes`

Important repo-specific note:

- the current LMS does not yet appear to store retake, reassessment, or renewal fees directly in `courses`
- this collection gives Phase 3 a clean place to add them without overloading the existing course schema too early

## Recommended handling of existing LMS collections

### `course-enrollments`

Use it as:

- the LMS service record
- the trigger for accounting linkage
- the place where operational enrollment state lives

Do not use it as:

- the invoice
- the payment ledger
- the receipt register
- the refund register
- the revenue recognition schedule

### `coupon-codes` and `coupon-redemptions`

Use them as:

- the LMS discount rule engine
- the coupon audit source for usage and eligibility

Do not use them as:

- the accounting discount report by themselves
- the source of truth for recognized revenue impact

Instead:

- Phase 3 accounting reporting should read coupon results in the context of linked invoices, enrollment billing links, and posted amounts

### `certificates`

Use it as:

- the service-delivery outcome
- the certificate issuance record
- a trigger or milestone reference for recognition or billing add-ons where relevant

Do not use it as:

- the accounting receipt
- the revenue schedule

### `courses`

Use it as:

- the catalog and pricing source
- the owner of base `price` and `discountedPrice`
- the owner of certificate template assignment

Do not use it as:

- the source of all LMS monetization logic forever

Instead:

- Phase 3 can add fee profiles or billing overlays while still respecting the existing course price fields

## Recommended coupon and discount strategy

The repo already has a real coupon engine in `src/utils/couponEngine.ts`.

That means Phase 3 should:

- reuse the current coupon validation logic
- reuse the current pricing snapshot approach
- reuse coupon-redemption audit records
- build accounting visibility on top of those results

Phase 3 should not:

- duplicate the coupon rule engine inside accounting services
- recalculate coupon logic differently in finance than in LMS checkout

Recommended accounting enhancement path:

- wrap the coupon engine where needed
- persist finance-relevant discount snapshots in `accounting-enrollment-billing-links`
- report discount impact using posted invoices and linked enrollments

## Recommended enrollment billing strategy

Phase 3 should define how LMS enrollment states map into Phase 2 accounting documents.

### Pending enrollment request

Recommended behavior:

- optionally create a `draft` billing link
- do not necessarily post an invoice yet unless the business wants invoice-on-request behavior
- preserve pricing snapshot and coupon outcome

### Approved paid enrollment

Recommended behavior:

- create or finalize the linked invoice
- create the enrollment billing link if not already present
- move the LMS learner into standard AR flow

### Free enrollment

Recommended behavior:

- do not force a standard AR invoice unless the business explicitly wants a zero-value invoice trail
- still allow billing linkage or analytics linkage if finance wants volume reporting

### Scholarship enrollment

Recommended behavior:

- create a billing link that records gross amount, sponsor share, and trainee share
- route the payable responsibility through customer or sponsor structures from Phase 2

### Corporate enrollment

Recommended behavior:

- route the payable side to a corporate account or customer
- allow batch or consolidated invoice logic later without changing the enrollment record shape

## Recommended payment, receipt, and proof-of-payment strategy

The current LMS already tracks only summary fields like `paymentStatus` and `amountPaid`.

Phase 3 should formalize payment handling by:

- linking LMS payments to Phase 2 `payments received`
- using `accounting-payment-allocations` for actual settlement logic
- using `accounting-receipts` for official receipt tracking
- storing proof-of-payment documents in `media`

Recommended payment channels to support in Phase 3:

- bank transfer
- over-the-counter
- GCash or e-wallet
- card
- manual cashier entry

Important rule:

- `course-enrollments.amountPaid` should become a derived or synchronized operational value, not the system’s deepest payment truth

## Recommended scholarship and corporate billing strategy

Phase 3 should support non-standard payers without breaking the Phase 2 customer/invoice model.

Recommended principle:

- a trainee remains the LMS learner
- a customer remains the accounting payer
- scholarship or corporate records explain who financially covers the charge

This means:

- trainee and payer do not have to be the same entity
- sponsor and corporate structures should map to Phase 2 `customers` rather than inventing a separate accounting universe

## Recommended revenue recognition strategy

This LMS is certificate- and access-driven, so revenue recognition must respect service delivery.

Recommended recognition candidates already present in the repo:

- enrollment activation
- access start and end windows
- course completion
- certificate issuance

Recommended recognition models:

- `on_activation` for short or instant-access training
- `straight_line` over course access period
- `completion_based` where the core service is course completion
- `certificate_based` where issuance is the true deliverable milestone

Important rule:

- do not recognize revenue from raw LMS events alone
- recognition should be tied to posted commercial documents and then scheduled through `accounting-revenue-recognition-schedules`

## Recommended refund and reversal strategy

The LMS already has statuses such as `dropped`, `expired`, and `refunded` payment states.

Phase 3 should standardize financial reversals by:

- linking refund events to Phase 2 invoices, payments received, and credit notes
- using `accounting-refunds` for workflow and audit state
- using standard reversal and credit memo patterns from Phase 2 and Phase 1

Important rule:

- LMS cancellation should not directly mutate ledger results
- cancellation should trigger finance workflows, not replace them

## Recommended instructor cost strategy

The repo already has:

- course ownership by instructor
- instructor records linked to users

Phase 3 can monetize delivery cost by:

- defining payout rules per instructor or course
- calculating payout obligations from enrollments, revenue, or completions
- keeping payout calculation separate from payroll or AP settlement if those are not yet in scope

This lets Phase 3 support:

- per-enrollment payout
- flat teaching fee
- revenue-share models
- completion bonuses

## Recommended certificate and reassessment monetization strategy

The repo already has:

- certificate templates
- certificate issuance
- generated certificate files uploaded to `media`

Phase 3 can build on that by:

- allowing fee profiles for certificate issuance, replacement certificates, retakes, reassessments, and renewals
- linking such fees into Phase 2 invoices through `accounting-billing-adjustments` or separate fee lines
- using certificate issuance or reassessment completion as a finance-linked milestone where appropriate

Important rule:

- certificate generation itself should remain an LMS service flow
- accounting should charge for it or recognize revenue around it through bridge logic, not by contaminating the certificate model

## Recommended LMS-specific dashboard and reporting strategy

Phase 3 dashboards should be built as read models over Phase 1 and Phase 2 outputs plus Phase 3 links.

### Useful Phase 3 dashboard outputs

- revenue by course
- revenue by instructor
- revenue by enrollment type
- paid versus free enrollments
- pending enrollment requests with estimated billings
- discount leakage report
- scholarship utilization report
- corporate receivables report
- trainee collections report
- completion-to-revenue report
- certificate issuance revenue report

### Important rule

- dashboards should not read raw LMS collections only
- dashboards should read LMS context plus standardized accounting outputs

This is exactly where the backend aggregation approach from `fetching-solution.md` is useful:

- build frontend-facing read endpoints for finance dashboards
- keep underlying finance logic in services and queries

## Recommended maritime chart-of-accounts guidance

Phase 3 should refine the generic chart from Phase 1 with maritime training-specific grouping guidance.

Recommended account groups to explicitly support:

- course revenue
- certification revenue
- exam retake revenue
- reassessment revenue
- renewal or recertification revenue
- training materials revenue
- discounts and sales deductions
- scholarship support expense
- deferred revenue
- accounts receivable
- cash and bank
- refunds payable
- instructor compensation
- promotional expense

Important note:

- this does not require replacing the entire chart of accounts collection
- it means Phase 3 should provide recommended account mappings, defaults, or setup guidance for this LMS business model

## Access and permissions strategy for Phase 3

Phase 3 must still respect the current role model in `apps/cms`.

Current reality:

- the app currently has `trainee`, `service`, `instructor`, and `admin`
- dedicated finance roles still do not exist at the platform enum level

Recommended Phase 3 access plan:

- `admin` gets full Phase 3 accounting access
- `service` may get narrow controlled read or system-integration access where needed
- `instructor` should not get general accounting write access just because they own a course
- `trainee` should not get direct access to accounting records beyond intentionally exposed LMS-facing summaries or receipt views

Important rule:

- if Phase 3 exposes learner-facing financial views, those should come from controlled API or BFF-style endpoints rather than broad collection access

## Posting and anti-spaghetti rules for Phase 3

These rules should be treated as mandatory:

- enrollment billing must create or link standard invoices, not bypass them
- scholarships and corporate coverage must resolve through customers, invoices, and allocations
- coupon accounting must reuse the current coupon engine results
- refunds must use Phase 2 refund or credit flows plus Phase 1 posting rules
- deferred revenue must use schedules linked to posted invoices
- instructor payout logic must remain a service or cost layer, not a direct ledger mutation in LMS routes

Critical anti-spaghetti rules:

- never let enrollment routes handcraft debit and credit logic
- never let `amountPaid` in LMS records become the deepest accounting truth
- never let coupon audit logs become the finance ledger
- never let certificate issuance directly post journal entries without going through accounting services
- never mix raw LMS snapshots and posted accounting data in the same report without clear purpose and boundaries

## Recommended implementation sequence

### Step 1. Confirm Phase 1 and Phase 2 readiness

Plan:

- verify that invoices, payments, credits, and reporting from earlier phases are stable
- confirm that the posting engine and customer model can support non-standard payers

Definition of done:

- Phase 3 starts only when LMS monetization can map into stable accounting structures

### Step 2. Define the LMS-to-accounting bridge model

Plan:

- create the enrollment billing link design first
- decide which LMS events should create, update, or finalize accounting links
- keep the bridge explicit rather than implicit inside LMS collections

Definition of done:

- there is one clear place where LMS monetization connects to commercial accounting

### Step 3. Implement enrollment billing links and pricing overlays

Plan:

- build `accounting-enrollment-billing-links`
- introduce course fee profiles and billing adjustments
- align price snapshots with existing LMS pricing fields

Definition of done:

- enrollment finance state can be modeled without overloading the enrollment record itself

### Step 4. Implement LMS payment allocations, receipts, and proof-of-payment support

Plan:

- build payment allocation support
- build official receipts
- link proof-of-payment files through `media`

Definition of done:

- learner payments can settle invoices through standard accounting flows with LMS-facing traceability

### Step 5. Implement scholarship, sponsorship, and corporate overlays

Plan:

- add sponsor master data
- add scholarship award mapping
- add corporate account linkage
- keep payer structures mapped to Phase 2 customers

Definition of done:

- non-standard payers work without introducing non-standard accounting logic

### Step 6. Implement coupon accounting visibility

Plan:

- wrap or reuse the existing coupon engine
- connect coupon snapshots to linked billing records
- create discount impact reports over real invoiced amounts

Definition of done:

- coupons are financially visible and auditable without forking discount logic

### Step 7. Implement deferred revenue and recognition schedules

Plan:

- define recognition rules per enrollment billing pattern
- build recognition schedules linked to invoices and enrollments
- use activation, completion, or certificate milestones where appropriate

Definition of done:

- revenue can be deferred and recognized using traceable LMS-aware rules

### Step 8. Implement refund and reversal workflows

Plan:

- add LMS refund records
- link them to payments, credit notes, invoices, and enrollments
- keep reversals consistent with Phase 1 and Phase 2 patterns

Definition of done:

- LMS cancellations and refund actions produce traceable, standardized finance outcomes

### Step 9. Implement instructor cost and payout linkage

Plan:

- define payout rules
- generate payout obligations from courses or enrollments
- keep settlement separate if AP settlement is handled later

Definition of done:

- delivery cost can be tracked without corrupting the accounting core

### Step 10. Implement certificate, retake, and renewal monetization

Plan:

- add fee profile support
- connect fee triggers to standard source documents
- preserve certificate generation as a separate LMS concern

Definition of done:

- certificate-related monetization works through accounting documents and standard posting flows

### Step 11. Implement LMS-specific reports and dashboard read models

Plan:

- build Phase 3 finance queries
- add backend aggregation endpoints only after services are stable
- expose dashboard-ready finance summaries

Definition of done:

- LMS finance dashboards read standard accounting outputs plus LMS bridge data

### Step 12. Register collections, extend migrations, and regenerate types

Plan:

- register Phase 3 accounting bridge collections in `src/payload.config.ts`
- create and register migrations in `src/migrations`
- regenerate Payload types after schema changes

Definition of done:

- LMS monetization modules are consistently registered, migratable, and type-safe

## Recommended registration order in `src/payload.config.ts`

When implementation begins, register in this approximate order:

1. `AccountingCourseFeeProfiles`
2. `AccountingScholarshipSponsors`
3. `AccountingCorporateAccounts`
4. `AccountingInstructorPayoutRules`
5. `AccountingEnrollmentBillingLinks`
6. `AccountingBillingAdjustments`
7. `AccountingPaymentAllocations`
8. `AccountingReceipts`
9. `AccountingRefunds`
10. `AccountingRevenueRecognitionSchedules`
11. `AccountingScholarshipAwards`
12. `AccountingCorporateBillingLinks`
13. `AccountingInstructorPayouts`

Why:

- setup and pricing metadata should exist before transactional LMS-finance links
- billing links should exist before downstream receipts, refunds, or schedules
- payout and reporting-side records should follow the finance linkage layer they depend on

## Recommended admin grouping

All Phase 3 accounting bridge collections should continue to use:

- `admin.group: 'Accounting'`

Important rule:

- even though these records are LMS-aware, they should not be grouped under `Learning Management` unless a collection is truly LMS editorial content

This keeps:

- LMS operational content under `Learning Management`
- finance records under `Accounting`

## Recommended slug style

Use explicit accounting bridge slugs:

- `accounting-enrollment-billing-links`
- `accounting-payment-allocations`
- `accounting-receipts`
- `accounting-refunds`
- `accounting-billing-adjustments`
- `accounting-revenue-recognition-schedules`
- `accounting-scholarship-sponsors`
- `accounting-scholarship-awards`
- `accounting-corporate-accounts`
- `accounting-corporate-billing-links`
- `accounting-instructor-payout-rules`
- `accounting-instructor-payouts`
- `accounting-course-fee-profiles`

## Recommended service rules

The following Phase 3 rules should be treated as non-negotiable:

- LMS routes call accounting bridge services instead of inventing finance behavior inline
- bridge services call Phase 2 document services and Phase 1 posting services
- price and discount snapshots are normalized in one service path
- finance read models are built from posted or finalized accounting data plus LMS links
- dashboard endpoints stay thin and read-oriented

## Testing and verification plan for later implementation

When implementation actually starts, Phase 3 should be verified with:

- unit tests for enrollment-to-invoice linkage
- unit tests for pricing snapshot normalization
- unit tests for scholarship and corporate coverage calculations
- unit tests for coupon discount reporting against real invoice amounts
- unit tests for revenue recognition schedule generation
- unit tests for refund linkage and reversal behavior
- unit tests for instructor payout calculations
- integration tests for self-service enrollment request to finance linkage
- integration tests for approved paid enrollment to invoice flow
- integration tests for scholarship and corporate enrollment billing flows
- integration tests for receipt and proof-of-payment linkage
- integration tests for certificate-related fee or milestone flows
- integration tests for LMS dashboard finance summaries

Critical scenarios to verify:

- a pending enrollment can exist without dirty ledger side effects
- an approved paid enrollment links cleanly into invoice flow
- coupon logic in accounting matches coupon logic in LMS pricing
- scholarship coverage splits the charge correctly between trainee and sponsor
- corporate billing can aggregate responsibility without breaking enrollment ownership
- refunds reverse financial impact consistently
- deferred revenue schedules reflect enrollment timing and service-delivery milestones
- instructor payout calculations remain traceable to their source activity

## Practical risks to avoid during implementation

- putting LMS monetization logic directly in enrollment routes
- turning `course-enrollments` into a hybrid invoice/payment model
- recalculating coupon logic differently in finance than in LMS
- treating receipt issuance as the same thing as payment posting
- coupling certificate issuance directly to accounting postings without a bridge service
- mixing sponsor identity, learner identity, and accounting customer identity into one overloaded model
- recognizing revenue directly from LMS progress or completion state without commercial document linkage

## Definition of done for the whole Phase 3

Phase 3 is complete when:

- enrollments can participate in accounting through formal bridge links
- payment allocations, receipts, and proof-of-payment tracking work through standard accounting flows
- scholarships, sponsorships, and corporate billing are modeled cleanly
- coupon impact can be reported financially without duplicating coupon logic
- deferred revenue and recognition schedules are traceable to enrollments and invoices
- refunds and reversals are traceable to both LMS events and accounting documents
- instructor cost tracking is supported without corrupting the accounting core
- certificate, retake, reassessment, and renewal monetization can be added through standard billing patterns
- LMS finance dashboards can read standardized accounting outputs plus LMS context
- the implementation remains aligned with `accounting-features.md` and `coding-principles.md`

## Final implementation recommendation

The safest way to attack Phase 3 in this repo is:

1. treat Phase 1 and Phase 2 as hard dependencies
2. build explicit LMS-to-accounting bridges first
3. reuse existing LMS collections instead of cloning them
4. reuse the existing coupon engine and certificate/media infrastructure
5. keep routes thin and finance logic service-first
6. keep accounting generic, and keep LMS-specific behavior in bridge modules only

This preserves the current `apps/cms` architecture, respects the LMS structures already in production, and lets the platform monetize maritime training workflows without introducing special-case ledger behavior.
