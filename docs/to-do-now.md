# Course Player LMS Refactor Plan

## Goal

Refactor the course player, lessons, quizzes/assessments, assignment submission, feedback submission, and course completion flows to follow `fetching-solution.md`.

Target architecture:

- `apps/cms/src/app/api/lms/...` owns the domain query and mutation logic
- `apps/web` uses server actions or server pages to call those LMS endpoints
- player pages render prepared data instead of orchestrating many raw CMS requests
- `apps/web` no longer performs trainee/enrollment/progress stitching with API-key-backed collection access

---

## Main Problems To Eliminate

Current fragility to remove:

1. `apps/web` course player layout fetches many endpoints after hydration
2. `apps/web` API routes repeatedly resolve trainee, enrollment, course, submissions, and feedback state
3. progress/completion/evaluation logic is duplicated across client and server
4. feedback and assignment submission still write raw collections from `apps/web`
5. assessment start/save/load/submit flows are split and not consistently protected by one LMS contract
6. unrelated backend changes can break the player because logic is scattered across many routes

---

## Desired End State

The player should become:

`apps/web server page/action -> one LMS course player endpoint + a few LMS mutation endpoints -> CMS owns all domain rules`

The frontend should mainly:

1. get signed-in user on the server
2. call LMS endpoint(s)
3. render response
4. trigger LMS mutations for user actions

---

## Phase 1: Build The Main LMS Read Endpoint

Create a new CMS endpoint for the player read model.

Suggested route:

- `apps/cms/src/app/api/lms/course-player/route.ts`

Suggested request:

- `GET /api/lms/course-player?courseId=...&userId=...`

This endpoint should own:

- trainee lookup from `userId`
- course lookup
- enrollment lookup and validation
- curriculum flattening
- final exam resolution
- lesson completion lookup
- assessment attempt counts
- assessment submission history
- assignment submission history
- feedback submission status
- computed progress percentage
- evaluation and finish eligibility summary

Return a page-ready shape such as:

```ts
{
  course: {...},
  enrollment: {
    id: string,
    status: string,
    progressPercentage: number,
    finalEvaluation: string | null,
  },
  player: {
    flatItems: [...],
    moduleTitleMap: {...},
    completedLessonIds: string[],
    attemptCounts: Record<string, number>,
    submissionHistory: Record<string, any[]>,
    assignmentSubmissions: Record<string, any[]>,
    hasSubmittedFeedback: boolean,
    finish: {
      isEligible: boolean,
      isPassed: boolean,
      reason: string | null,
    },
  },
}
```

Acceptance criteria:

- no player boot-time stitching in `apps/web`
- one LMS read call can render the course player
- progress/evaluation state comes from CMS, not client recomputation

---

## Phase 2: Move `apps/web` Player Read To Server Loading

Refactor the player so initial data loads on the server.

Target files:

- `apps/web/src/app/portal/courses/[courseId]/player/layout.tsx`
- `apps/web/src/app/portal/courses/[courseId]/player/[[...slug]]/page.tsx`

Implementation direction:

1. create server actions in `apps/web` that call the LMS course-player endpoint
2. load the player data in a server page or server layout
3. pass prepared data into a thin client provider/component
4. remove browser-side startup fetches for:
   - `/api/courses/:id`
   - `/api/courses/:id/progress`
   - `/api/courses/:id/feedback-status`
   - assignment submission history loading in layout

Acceptance criteria:

- no initial `useEffect` orchestration for player boot
- no multi-request startup chain in the browser
- player route still renders the same UI and behavior

---

## Phase 3: Consolidate Assessment Flows Behind LMS Endpoints

Create LMS endpoints for all assessment actions.

Suggested CMS routes:

- `POST /api/lms/course-player/assessment/start`
- `POST /api/lms/course-player/assessment/save-answer`
- `GET /api/lms/course-player/assessment/answers?submissionId=...`
- `POST /api/lms/course-player/assessment/submit`

These routes should own:

- trainee ownership validation
- enrollment validation
- assessment/course relationship validation
- attempt limit checks
- safe resume behavior
- answer save/load ownership checks
- grading handoff or grading execution in CMS
- course item progress updates

Important:

- stop relying on `apps/web` API-key proxy routes for answer save/load
- every request must validate that the submission belongs to the signed-in trainee

Acceptance criteria:

- no raw `apps/web/api/assessments/...` orchestration remains
- save/load/submit cannot access another trainee's submission
- assessment logic is consistently owned by CMS

---

## Phase 4: Move Assignment Flows Into LMS Endpoints

Create LMS endpoints for assignments.

Suggested CMS routes:

- `GET /api/lms/course-player/assignment-submissions?courseId=...&userId=...`
- `POST /api/lms/course-player/assignment/submit`

These routes should own:

- trainee lookup
- enrollment lookup
- assignment ownership and course membership checks
- draft/revision handling
- submission history shaping
- backend-safe content normalization

`apps/web` should stop directly querying:

- `trainees`
- `course-enrollments`
- `assignment-submissions`

Acceptance criteria:

- assignment submissions load from LMS endpoint only
- assignment submit action uses LMS endpoint only
- `apps/web` no longer writes assignment collections directly

---

## Phase 5: Move Feedback Submission Into LMS Endpoints

Create LMS endpoints for feedback.

Suggested CMS routes:

- `GET /api/lms/course-player/feedback-status?courseId=...&userId=...`
- `POST /api/lms/course-player/feedback`

These routes should own:

- trainee lookup
- course enrollment validation
- duplicate submission checks if needed
- feedback form validation
- feedback submission creation

`apps/web` should stop directly querying:

- `trainees`
- `feedback-submissions`

Acceptance criteria:

- feedback status comes from LMS
- feedback submission writes through LMS only
- required-feedback gating depends on CMS result, not duplicated assumptions

---

## Phase 6: Move Finish-Course Evaluation Into LMS

Create one LMS finish endpoint.

Suggested CMS route:

- `POST /api/lms/course-player/finish`

This route should own:

- course evaluation mode resolution
- lesson completion requirement checks
- quiz/final-exam submission and pass/fail checks
- assignment inclusion if required by future rules
- feedback-required gating
- final enrollment update
- final evaluation result

Important:

- do not keep completion logic split between client button logic and `apps/web/api/courses/[id]/finish-course`
- the LMS read endpoint should return enough finish/evaluation state so the client only renders button state

Acceptance criteria:

- one source of truth for completion eligibility
- button visibility and API completion result match the same backend rule set

---

## Phase 7: Remove Legacy `apps/web` Orchestration Routes

After LMS endpoints are stable, remove or retire these old routes:

- `apps/web/src/app/api/courses/[id]/route.ts`
- `apps/web/src/app/api/courses/[id]/progress/route.ts`
- `apps/web/src/app/api/courses/[id]/feedback-status/route.ts`
- `apps/web/src/app/api/courses/[id]/lesson-completion/route.ts`
- `apps/web/src/app/api/courses/[id]/sync-progress/route.ts`
- `apps/web/src/app/api/courses/[id]/finish-course/route.ts`
- `apps/web/src/app/api/assessments/[id]/start/route.ts`
- `apps/web/src/app/api/assessments/submission/[id]/answers/route.ts`
- `apps/web/src/app/api/assessments/submission/[id]/save/route.ts`
- `apps/web/src/app/api/assessments/submission/[id]/submit/route.ts`

Only remove them after all callers have moved.

Acceptance criteria:

- no remaining player feature depends on raw collection orchestration in `apps/web`

---

## Phase 8: Add Targeted Regression Tests

Add focused tests around the new LMS endpoints and player contract.

Recommended coverage:

1. course-player read returns correct shaped payload for enrolled trainee
2. non-enrolled user cannot access player payload
3. lesson completion updates only the current trainee's progress
4. assessment start respects max attempts and enrollment
5. assessment save/load only works for the submission owner
6. assessment submit updates score and progress correctly
7. assignment submit works for enrolled trainee only
8. feedback submit works for enrolled trainee only
9. finish-course enforces evaluation mode and feedback rules correctly

Acceptance criteria:

- key LMS boundaries have regression protection
- future unrelated changes are less likely to silently break the player

---

## Suggested Execution Order

Recommended safest order:

1. build LMS course-player read endpoint
2. switch player initial load to server-side LMS read
3. move assessment start/save/load/submit into LMS
4. move feedback status and feedback submit into LMS
5. move assignment submission/history into LMS
6. move finish-course evaluation into LMS
7. delete legacy `apps/web` orchestration routes
8. add focused regression tests

---

## Success Definition

This refactor is done when all of the following are true:

- course player initial render comes from one LMS read model
- user actions hit LMS mutation endpoints, not raw collection orchestration in `apps/web`
- `apps/web` no longer performs trainee/enrollment/business-rule stitching for player features
- completion/evaluation rules exist in one backend source of truth
- assessment, assignment, feedback, and lesson progress all follow the same backend-mediated pattern as `fetching-solution.md`

---

## Notes

- Keep the rollout phased to avoid breaking the live player all at once
- Preserve existing UI behavior while replacing the data flow underneath
- Prefer compatibility responses first, then cleanup old routes after migration
- If necessary, allow temporary dual paths only during migration, then remove them quickly
