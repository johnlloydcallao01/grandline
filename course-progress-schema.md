# Course Progress Architecture & Schema

## 1. Overview
To support the 7 distinct evaluation methods (ranging from simple "view-based" progress to strict "academic" requirements), we have implemented a dedicated, granular tracking system. This decouples "content consumption" from "assessment performance," allowing the backend to compute course completion status dynamically based on the course's `evaluationMode`.

## 2. Database Schema: `CourseItemProgress`
We have moved away from storing progress in the `CourseEnrollments` table (which is an anti-pattern for granular data) and created a dedicated `course_item_progress` table.

### Collection Definition
**File:** `apps/cms/src/collections/CourseItemProgress.ts`

| Field | Type | Purpose |
| :--- | :--- | :--- |
| `trainee` | Relationship | Links to the Student/Trainee. |
| `course` | Relationship | Links to the Course (for fast filtering). |
| `item` | Relationship (Polymorphic) | Can be a **Lesson** (`course-lessons`) or an **Assessment** (`assessments`). |
| `enrollment` | Relationship | Links to the specific enrollment record. |
| `status` | Select | `not_started`, `in_progress`, `completed`, `passed`, `failed`. |
| `isCompleted` | Boolean | Explicit flag for quick "count" queries (e.g., "7/10 items done"). |
| `progressPercentage` | Number (0-100) | For video resume or partial reading status. |
| `score` | Number | Raw score for quizzes/exams. |
| `grade` | Number (0-100) | Normalized grade for quizzes/exams. |
| `attempts` | Number | Count of how many times the item was attempted. |
| `quizData` | JSON | Stores detailed question-level responses (for review/audit). |
| `lastAccessedAt` | Date | Timestamp for "Resume where you left off". |
| `durationSeconds` | Number | Total time spent (audit requirement). |

### Indexing Strategy
*   `[trainee, course]`: Optimized for fetching *all* progress for a student in a specific course (the primary Course Player query).
*   `[enrollment, isCompleted]`: Optimized for counting completed items to calculate overall course percentage.

---

## 3. Support for 7 Evaluation Methods

The `CourseItemProgress` table provides the raw data points needed to support all 7 strategies defined in `course-evaluation.md`. The logic for "Course Completion" will reside in the API/Service layer, querying this table.

| Evaluation Method | Required Data Points | Schema Implementation |
| :--- | :--- | :--- |
| **1. Evaluate via Lessons** | Count of completed lessons vs. total lessons. | Query `CourseItemProgress` where `item.type = lesson` AND `isCompleted = true`. |
| **2. Evaluate via Final Exam** | Score of the Final Exam item. | Query `CourseItemProgress` where `item.id = finalExamId` AND `status = passed`. |
| **3. Evaluate via Passed Quizzes** | Status of all module quizzes. | Query `CourseItemProgress` where `item.type = assessment` AND `status = passed`. |
| **4. Lessons + Final Exam** | Lesson completion count AND Final Exam score. | Check `isCompleted` for lessons (prerequisite) THEN check `status = passed` for Final Exam. |
| **5. Lessons + Quizzes** | Lesson completion count AND Quiz pass status. | Check `isCompleted` for lessons AND `status = passed` for all quizzes. |
| **6. Quizzes + Final Exam** | Quiz pass status (prerequisite) AND Final Exam score. | Check `status = passed` for quizzes THEN check `status = passed` for Final Exam. |
| **7. Lessons + Quizzes + Final Exam** | All of the above. | Comprehensive check of all records in `CourseItemProgress`. |

## 4. Frontend Integration Plan (Course Player)

### Phase 1: Reading Progress (Initialization)
1.  **Fetch**: When the Course Player loads, call `GET /api/courses/:id/progress`.
2.  **API Logic**:
    *   Find the current user's enrollment.
    *   Query `CourseItemProgress` for this enrollment.
    *   Return a map: `{ [itemId]: { status: 'completed', progress: 100, score: 85, ... } }`.
3.  **State**: Hydrate the `CoursePlayerContext` with this map.
4.  **UI**:
    *   Show checkmarks on the Sidebar.
    *   Lock/Unlock items based on the Course's `evaluationMode` (e.g., if Mode 4, disable Final Exam until lessons are done).

### Phase 2: Writing Progress (Updates)
1.  **Trigger**:
    *   **Lessons**: User clicks "Mark as Completed" OR video ends.
    *   **Quizzes**: User submits the quiz and receives a passing grade.
2.  **API Call**: `POST /api/courses/:id/lesson-completion` (to be renamed/expanded to `item-progress`).
3.  **Payload**: `{ itemId: string, status: 'completed', score?: number }`.
4.  **Backend Logic**:
    *   Upsert into `CourseItemProgress`.
    *   Recalculate "Overall Course Progress" (0-100%).
    *   Update `CourseEnrollments` with the new overall percentage (for dashboard views).
5.  **Response**: Return updated item status + new overall course progress.
