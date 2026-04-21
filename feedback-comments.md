For our page /portal/feedback-comments

Which schemas or collections from our apps/cms do you think we can derive the data we need for this page?

Example mock data:
Feedback & Comments
Instructor feedback and assessment comments

Mark all as read
All
Unread
Capt. James Wilson
Capt. James WilsonSenior Instructor
12/2/2025
Excellent work on your Passage Planning Project. Your waypoints calculation was precise. However, please pay more attention to the weather routing section next time.
Regarding:
Passage Planning Project
Project
Advanced Navigation
New
Chief Eng. Sarah Chen
Chief Eng. Sarah ChenEngineering Faculty
11/26/2025
Please resubmit your analysis of the Maritime Law Case Study. You missed citing the relevant conventions regarding pollution prevention.
Regarding:
Maritime Law Case Study
Assignment
Maritime Law
System
SystemAutomated Feedback
11/20/2025
You scored 93% on the Radio Communication Simulation. Great job on the distress signal procedures!
Regarding:
Radio Communication Simulation
Quiz
GMDSS
Lt. Cmdr. Mark Davis
Lt. Cmdr. Mark DavisSafety Instructor
11/16/2025
Good detailed report on the Fire Fighting Drill. Your observations on the team response time were very astute.
Regarding:
Fire Fighting Drill Report
Assignment
Safety at Sea



So what do you think?

---

# Complete Implementation Plan for `/portal/feedback-comments`

Based on a deep architectural analysis of the `apps/cms` schemas, the Feedback & Comments page must operate as a **persistent, direct-query inbox**. It must *not* rely on the ephemeral Notification bell system, ensuring that academic feedback records cannot be accidentally "cleared" or lost by the trainee.

## 1. The 8 Required Collections
To directly query the source of truth for all feedback while maintaining context, we need these collections:
1. **`AssignmentSubmissions`**: Source for instructor feedback on projects/assignments.
2. **`AssessmentSubmissions`**: Source for system-automated quiz scores and pass/fail status.
3. **`SubmissionAnswers`**: Source for instructor comments on specific quiz questions.
4. **`Users`**: Instructor names and avatars.
5. **`Instructors`**: Instructor specializations/roles (e.g., "Senior Instructor").
6. **`Assignments`**: The assignment title and item type (e.g., "Project").
7. **`Assessments`**: The quiz title and item type (e.g., "Quiz").
8. **`Courses`**: The contextual subject/course name.

## 2. Phase 1: Backend CMS (Schema Updates)
To track "Read/Unread" states without using the Notification system, we must add a boolean tracking field directly to the three source collections.

*   **Action**: Add `isFeedbackRead: { type: 'boolean', defaultValue: false, admin: { hidden: true } }` to:
    1. `AssignmentSubmissions`
    2. `AssessmentSubmissions`
    3. `SubmissionAnswers`
*   **Database Migration**: Run `pnpm payload migrate:create` and `pnpm payload migrate` to apply these schema changes to PostgreSQL.

## 3. Phase 2: Next.js Server Action (The Aggregator)
Create a new dedicated server action in `apps/web`: `GET /portal/feedback-comments/actions.ts`

*   **Direct Queries**: 
    *   Query 1: Fetch `AssignmentSubmissions` where `trainee === currentTrainee` AND `feedback` is not empty.
    *   Query 2: Fetch `AssessmentSubmissions` where `trainee === currentTrainee`.
    *   Query 3: Fetch `SubmissionAnswers` where `submission.trainee === currentTrainee` AND `feedback` is not empty.
*   **Resolution & Formatting Logic**:
    *   Map Query 1 into `FeedbackCommentItem` objects, extracting the RichText feedback and populating the Instructor details.
    *   Map Query 2 into `FeedbackCommentItem` objects, generating the automated string (e.g., *"You scored {score}% on the {title}."*) and setting the actor to "System Automated Feedback".
    *   Map Query 3 into `FeedbackCommentItem` objects, extracting the specific question feedback.
*   **Sorting**: Combine all three arrays and sort them by their respective `updatedAt` timestamps descending.

## 4. Phase 3: Frontend UI (`/portal/feedback-comments/page.tsx`)
Build the React UI to consume the unified, persistent data.

*   **State Management**: 
    *   `const [items, setItems] = useState<FeedbackCommentItem[]>(...)`
    *   `const [filter, setFilter] = useState<'all' | 'unread'>('all')`
*   **Rendering**: 
    *   Map through the sorted items. Render the specific colored badges based on `itemType`.
    *   Render the blue "New" badge if `isFeedbackRead === false`.
*   **Interactions**:
    *   **Mark all as read**: A button that calls a server action to bulk-update `isFeedbackRead = true` across all three collections for this specific trainee.
    *   **Mark single as read**: When a trainee clicks a specific comment card, it triggers a server action to update `isFeedbackRead = true` for that exact submission record.

This Direct-Query architecture guarantees that academic feedback is permanently preserved, perfectly separated from the ephemeral notification bell, and highly performant.