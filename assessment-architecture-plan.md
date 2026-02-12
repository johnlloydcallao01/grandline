# Assessment Architecture Plan: "Evaluate via Lessons"

## 1. Executive Summary
This document outlines the architectural plan to implement robust assessment tracking in Grandline. Based on professional LMS standards (e.g., Canvas, Blackboard), we will implement a **Two-Table Strategy** to separate the "Attempt Metadata" from the "Granular Question Responses".

**Why this approach?**
- **Performance:** `CourseItemProgress` remains lightweight for the sidebar (green checks).
- **Analytics:** `SubmissionAnswers` allows deep queries (e.g., "Which question do 80% of students fail?").
- **Integrity:** `AssessmentSubmissions` ensures we have a complete history of every attempt, not just the latest score.

---

## 2. Existing Schema Integration
We are integrating with the following existing collections:

*   **Trainees (`trainees`)**: The user taking the quiz.
*   **CourseEnrollments (`course-enrollments`)**: The context of the attempt (validates access).
*   **Assessments (`assessments`)**: The definition of the quiz (questions, time limit).
*   **Questions (`questions`)**: The individual prompts and correct answers.
*   **CourseItemProgress (`course-item-progress`)**: The *summary* status (Completed/Passed) used by the frontend UI.

---

## 3. New Collection: AssessmentSubmissions
*Slug: `assessment-submissions`*

This collection represents a single "sitting" or "attempt" of an assessment.

### Fields
| Name | Type | Relation / Details | Purpose |
| :--- | :--- | :--- | :--- |
| `trainee` | Relationship | `trainees` (Required) | Who took it? |
| `enrollment` | Relationship | `course-enrollments` (Required) | Link to their active course context. |
| `assessment` | Relationship | `assessments` (Required) | Which quiz is this? |
| `course` | Relationship | `courses` (Required) | Optimization for querying submissions by course. |
| `status` | Select | `in_progress`, `submitted`, `graded` | State of the attempt. |
| `attemptNumber` | Number | Integer (1, 2, 3...) | Sequential attempt counter. |
| `score` | Number | Min 0, Max 100 | The final calculated score. |
| `pointsTotal` | Number | | Total points earned (raw). |
| `pointsPossible` | Number | | Total points possible (at time of taking). |
| `passingScoreSnapshot` | Number | | Snapshot of the passing score required at that time. |
| `startedAt` | Date | | Timestamp when they clicked "Start". |
| `completedAt` | Date | | Timestamp when they clicked "Submit". |
| `isLatest` | Checkbox | | Helper to easily find the student's current standing. |

### Access Control
*   **Read:** Admin, Instructor (Course Owner), Trainee (Own).
*   **Create:** Admin, Service (API).
*   **Update:** Admin, Service (API).
*   **Delete:** Admin only.

---

## 4. New Collection: SubmissionAnswers
*Slug: `submission-answers`*

This collection stores the granular response to *each question* within a submission.

### Fields
| Name | Type | Relation / Details | Purpose |
| :--- | :--- | :--- | :--- |
| `submission` | Relationship | `assessment-submissions` (Required) | Parent attempt. |
| `question` | Relationship | `questions` (Required) | The question being answered. |
| `questionType` | Select | `single_choice`, `multiple_choice`, `true_false` | Snapshot of type for rendering history. |
| `response` | JSON | | Flexible storage for the selected option ID(s).<br>`{ optionId: "id" }` for single/true-false.<br>`{ optionIds: ["id1", "id2"] }` for multiple choice. |
| `isCorrect` | Checkbox | | Calculated at submission time by comparing `optionId` with `isCorrect` in Question's options. |
| `pointsEarned` | Number | | Points awarded for this specific question (sourced from `Assessments.items[].points`). |
| `feedback` | Textarea | | (Future) Instructor comments or auto-feedback. |

### Access Control
*   **Read:** Admin, Instructor, Trainee (Own).
*   **Create/Update:** Service (API) only. (Trainees submit via API, which writes these).

---

## 5. Workflow & Logic

### A. Starting an Assessment
1.  **API:** `POST /api/assessments/[id]/start`
2.  **Action:**
    *   Check `CourseItemProgress` (is it locked?).
    *   Check `AssessmentSubmissions` (max attempts reached?).
    *   **Create** a new `AssessmentSubmissions` record (`status: 'in_progress'`, `attemptNumber: X+1`).
    *   Return the `submissionId`.

### B. Saving Progress (Optional/Future)
1.  **API:** `PUT /api/assessments/submission/[id]/save`
2.  **Action:**
    *   Upsert `SubmissionAnswers` records.
    *   Does *not* grade them yet.

### C. Submitting & Grading
1.  **API:** `POST /api/assessments/submission/[id]/submit`
2.  **Payload:** `{ answers: [{ questionId: "...", optionId: "..." } | { questionId: "...", optionIds: ["..."] }] }`
3.  **Action:**
    *   **Fetch Assessment & Questions:** Get the assessment definition and all linked questions in one go.
    *   **Loop through user answers:**
        *   Find the matching `Question` document and the specific `points` assigned in `Assessment.items`.
        *   **For single_choice / true_false:** Check if the selected `optionId` has `isCorrect: true` in the question's `options` array.
        *   **For multiple_choice:** Check if the set of `optionIds` exactly matches the set of options where `isCorrect: true`.
        *   Calculate `isCorrect` (boolean) and `pointsEarned` (0 or `points`).
        *   **Create/Update** `SubmissionAnswers` rows.
    *   **Calculate Total:** Sum `pointsEarned` and compare against `Assessment.passingScore`.
    *   **Update Submission:** Set `score`, `status: 'graded'`, `completedAt: now`.
    *   **Update Progress:**
        *   Find/Create `CourseItemProgress` for this assessment.
        *   If `score >= passingScore`, set `status: 'passed'`, `isCompleted: true`.
        *   Else, set `status: 'failed'`.
    *   **Update Enrollment:** (Optional) Trigger re-calculation of overall course grade.

---

## 6. Implementation Steps
1.  **Scaffold Collections:** Create `AssessmentSubmissions.ts` and `SubmissionAnswers.ts` in `apps/cms`.
2.  **Register Collections:** Add to `payload.config.ts`.
3.  **Generate Types:** Run Payload type generation.
4.  **Build API Endpoints:** Create Next.js API routes for the logic flow above.
5.  **Frontend Integration:** Connect the Quiz Player to these new endpoints.
