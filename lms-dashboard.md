# LMS Trainee Dashboard — Implementation Plan

> **Scope**: Research & planning only. No code changes yet.  
> **Target page**: `apps/web/src/app/portal/dashboard/page.tsx`  
> **Current state**: Fully static fake data. Needs to be replaced with real CMS data.

---

## Part 1 — Professional LMS Dashboard Research

### What world-class platforms show learners (Udemy, Coursera, Moodle, Absorb LMS)

| Platform Pattern | Core Widgets |
|---|---|
| **Personalized Welcome** | Greeting with name + avatar, daily/weekly goal nudge |
| **Hero: Continue Learning** | "Pick up where you left off" — last accessed course with progress bar |
| **Stats Overview Strip** | Active courses, completed courses, total study hours, certificates earned |
| **My Courses Grid** | Enrolled courses cards with `progressPercentage`, status badge, thumbnail |
| **Pending Work Feed** | Upcoming assignments & quizzes with due dates, urgency colour coding |
| **Assessment Scores** | Recent quiz/exam scores (grade %, pass/fail badge) |
| **Certificates Shelf** | Earned certificate cards (course name, issue date, download/verify link) |
| **Announcements Stream** | Pinned + latest course announcements |
| **Instructor Contact** | My instructors list with "Ask" quick action |

### Key UX principles applied

- **Five-second rule** — the user must see their most important next-action within 5 seconds.
- **Actionability** — every metric must lead to a link or action.
- **Urgency first** — overdue/pending items float to the top.
- **Contextual empty states** — when there is no data, show a call to action (e.g., "Browse courses to enroll").

---

## Part 2 — CMS Data Inventory (Trainee Focus)

A complete audit of Payload CMS collections strictly mapped to the Trainee dashboard.

### 2.1 Core Data Collections (directly shown on dashboard)

#### `course-enrollments`
The **master record** for everything on the dashboard.
- **Query needed**: `where[student.user][equals]={userId} &depth=2 &sort=-lastAccessedAt`
- **Fields mapped**: `course` details, `status`, `progressPercentage`, `lastAccessedAt`, `currentGrade`, `certificateIssued`.

#### `course-item-progress`
Granular per-lesson tracking.
- **Query needed**: "Continue Learning" deeply links to the most recent `item`.
- **Fields mapped**: `item` (polymorphic), `status`, `lastAccessedAt`.

#### `assessment-submissions`
Quiz/exam history for the "Recent Scores" widget.
- **Query needed**: `where[isLatest][equals]=true &sort=-completedAt`
- **Fields mapped**: `assessment`, `score`, `passingScoreSnapshot`, `status`.

#### `assignment-submissions`
Pending/graded assignments widget.
- **Key states**: Filter for `status = 'draft'` AND `assignment.dueDate` exists (Pending) OR `status = 'returned_for_revision'` (Urgent).

#### `certificates`
Certificate shelf widget.
- **Fields mapped**: `course`, `certificateCode`, `issueDate`, `file` (PDF link), `verificationUrl`.

#### `announcements`
Announcements widget (course-specific).
- **Query needed**: Retrieve enrolled course IDs first, then fetch `announcements` `where[course][in]={courseIds}`. 

#### `chats`
"Ask Instructor" unread messages indicator.
- **Query needed**: `participants.id` equals trainee, filter to `active` chats to see if they're awaiting an instructor's reply.

---

## Part 3 — Dashboard Widget Map

### Layout: 2-column grid (main + sidebar)

```text
┌──────────────────────────────────────────────────────────────────┐
│  HEADER: Welcome Banner (Trainee name + avatar + SRN + level)    │
├───────────────────────────────────┬──────────────────────────────┤
│  HERO: Continue Learning          │  STAT CARDS (4-up strip)     │
│  (last accessed course card)      │  Active │ Completed │ Grade  │
├───────────────────────────────────┴──────────────────────────────┤
│  ← LEFT (col-span-2)              │  → RIGHT (col-span-1)        │
│                                   │                              │
│  My Courses Grid                  │  Pending Work Feed           │
│  – progress bars                  │  – assignments due           │
│  – last accessed time             │  – unanswered quizzes        │
│  – difficulty badge               │                              │
│                                   │  Recent Scores               │
│  Certificates Earned              │  – quiz/exam score cards     │
│  – PDF download                   │  – pass/fail badges          │
│  – verify button                  │                              │
│                                   │  Announcements               │
│                                   │  – pinned first              │
│                                   │  – relative timestamps       │
│                                   │                              │
│                                   │  My Instructors              │
│                                   │  – avatar + name             │
│                                   │  – "Ask" quick link          │
└───────────────────────────────────┴──────────────────────────────┘
```

---

## Part 4 — Data Fetching Strategy

### Authentication Pattern
The trainee flow:
1. `getCurrentUser()` → gets `users.id` + `users.role`.
2. Ensure role is `trainee`.
3. Query `trainees` where `user = {userId}` to grab the `trainees.id` and `srn`.

### Recommended Fetch Architecture
```text
Dashboard Server Component (async)
│
├── Parallel batch (Promise.all)
│   ├── getEnrollmentsSummary(userId)      → course-enrollments (depth=2)
│   ├── getCertificates(userId)            → certificates
│   ├── getRecentScores(userId)            → assessment-submissions
│   ├── getPendingWork(userId)             → assignment-submissions
│   └── getAnnouncements(enrolledCourseIds)→ announcements
│
└── Derive from enrollments (no extra fetch):
    ├── activeCount, completedCount
    ├── avgGrade
    ├── continueLearningSuggestion (sort by lastAccessedAt)
    └── instructorList (deduplicate from enrolled courses)
```

---

## Part 5 — Component Structure

```text
apps/web/src/app/portal/dashboard/
├── page.tsx                      ← Server component, orchestrates all fetches
├── _components/
│   ├── WelcomeBanner.tsx          ← User name, avatar, SRN, level
│   ├── StatStrip.tsx              ← 4-card stats row
│   ├── ContinueLearningHero.tsx   ← Last-accessed course hero card
│   ├── MyCourseGrid.tsx           ← Enrolled courses grid
│   ├── PendingWorkFeed.tsx        ← Assignments + unanswered assessments
│   ├── RecentScores.tsx           ← Latest quiz/exam results
│   ├── CertificatesShelf.tsx      ← Earned certificate cards
│   ├── AnnouncementStream.tsx     ← Course announcements
│   ├── InstructorMiniList.tsx     ← Quick instructor contact
│   └── DashboardSkeleton.tsx      ← Loading skeleton
```

---

## Part 6 — Empty States

| Widget | Empty State Concept |
|---|---|
| My Courses | "You're not enrolled in any courses yet." + "Browse Courses" button |
| Certificates | "Complete a course to earn your first certificate." |
| Pending Work | "You're all caught up! No pending assignments." |
| Recent Scores | "No quizzes taken yet." |
| Announcements| "No announcements for your courses." |
| Instructors  | "Enroll in a course to connect with instructors." |

---

## Part 7 — UI Design Approach

### Theme & Design Language
- Dark navy sidebar + white card surface (matching existing portal layout)
- Accent color: blue-600 (already in use across portal)
- Progress bars: `bg-blue-500` with `bg-gray-200` track
- Status badges: colored pills (green=active/passed, yellow=in_progress, red=overdue/failed, gray=pending)

---

## Open Questions for Review

> [!IMPORTANT]
> Please review these decisions for the **Trainee Dashboard** before implementation begins.

1. **"Pending assessments" definition**: An assessment is "pending" if the trainee is enrolled in the course but has NO `course-item-progress` record for that assessment. This requires a 2-step fetch (get assessments in enrolled modules, then cross-reference progress). Confirm this approach?

---

## Architecture Recommendation: Centralized vs. Individual Fetching

**Question:** *Do you recommend creating a centralized endpoint or data source instead of fetching one by one to collections in our payload cms? What is the professional approach?*

**Answer:** 
The professional industry standard for complex dashboards is to use a **Centralized Aggregation Strategy** (often called the Backend-For-Frontend or BFF pattern) rather than executing individual fetches from the client to multiple CMS collections.

Here is why a centralized approach is recommended:

1. **Elimination of Network Waterfalls**: If you fetch individually from the client, the browser has to make 5 to 7 separate HTTP requests to the CMS. This causes visible "pop-in" loading and heavy network latency, especially on mobile devices.
2. **Data Pruning (Reduced Payload)**: A CMS like Payload often returns large, deeply nested JSON objects. A centralized endpoint can pick exactly what the dashboard needs (just the title, progress %, and thumbnail) and strip out the heavy rich-text blocks and unused fields before sending data over the network to the client.
3. **Database Efficiency**: Fetching multiple collections requires cross-referencing (e.g., getting enrolled courses, then filtering announcements for *only* those courses). Doing this sequentially from the client requires multiple round-trips. A centralized endpoint handles this instantly within the same server environment.

**How to implement it (Given `apps/cms` is your primary backend):**

Since `apps/cms` (Payload CMS) serves as the backend for the entire monorepo, the absolute best practice is to build this centralized endpoint **inside `apps/cms`** as a **Custom Payload Endpoint**. 

Instead of configuring `apps/web` to make 5 different API calls to standard Payload collections, you create ONE custom endpoint in Payload's config (e.g., `GET /api/dashboard/trainee-summary`). 

Here is why this is the optimal backend approach:

* **Native DB Performance (Local API):** Inside Payload CMS, you can use the Local API (e.g., `req.payload.find()`). This bypasses HTTP over-the-network overhead entirely, executing queries directly against the database natively.
* **True Centralization:** The heavy computational lifting—calculating average grades, deriving assessment statuses, sorting overlapping dates—belongs in the backend (`apps/cms`). This keeps your frontend (`apps/web`) incredibly thin, "dumb," and incredibly fast.
* **Single Network Trip:** `apps/web` simply calls the CMS via `fetch('http://cms/api/dashboard/trainee-summary')` once. The CMS does all the complex database aggregations and returns a perfectly formatted JSON package.

**Recommendation:** **Build the custom endpoint in `apps/cms`**. You would likely add a handler in an `endpoints` directory and register it in your `payload.config.ts`. The `apps/web` dashboard page will remain incredibly clean, simply awaiting that single payload.

---

## Part 8 — Phased Implementation Plan

This is the step-by-step execution strategy to build the Trainee Dashboard natively aligning with `apps/cms` as the centralized backend.

### Phase 1: Backend Architecture (Payload CMS)
**Goal:** Create a single, highly-optimized Custom Endpoint returning the exact data structure needed.
1. **Create Endpoint File**: Create `apps/cms/src/endpoints/getTraineeDashboardSummary.ts`.
2. **Register Endpoint**: Add `getTraineeDashboardSummary` into `apps/cms/src/payload.config.ts` under the `endpoints: [{ path: '/dashboard/trainee-summary', method: 'get', handler: ... }]` configuration.
3. **Authentication Check**: In the handler, extract the user from `req.user` and ensure they have the `trainee` role. Fetch the `trainees` document using `req.payload.find({ collection: 'trainees' })`.
4. **Parallel Data Fetching (Local API)**:
   - Use `req.payload.find()` to query `course-enrollments` (active courses, calc average grade).
   - Query `course-item-progress` for the single latest item to power the "Continue Learning" widget.
   - Query `assignment-submissions` and assessments to compile the "Pending Work" response.
   - Query `certificates`.
   - Extract unique `enrolledCourseIds` and compile active `announcements`.
5. **Data Pruning**: Map the heavy Payload CMS result objects into a lightweight, stripped-down JSON response object (e.g., stripping rich text, only keeping titles and thumbnails).

### Phase 2: Connection & Types (Monorepo setup)
**Goal:** Define Typescript interfaces and connect `apps/web` to the new endpoint.
1. **Typescript Definitions**: In `apps/web`, define `TraineeDashboardSummary` type corresponding exactly to the returned JSON from Phase 1.
2. **Data Fetching Service**: In `apps/web/src/app/portal/dashboard/page.tsx` (Server Component), configure the `fetch()` call pointing to your CMS backend URL.
3. **Session Forwarding**: Attach the existing session cookie / JWT token to the `Authorization` headers inside the fetch request to ensure the Payload backend recognizes the authenticated user.

### Phase 3: UI Development (Next.js Application)
**Goal:** Build the modular React Server and Client components inside `/portal/dashboard/_components/`.
1. **Layout Shell**: Establish the 2-column grid layout within `page.tsx`.
2. **Build the Hero Widget**: Construct `ContinueLearningHero.tsx`. Pass strictly typed props.
3. **Build the Overview Grid**: Construct `MyCourseGrid.tsx` and the `StatStrip.tsx` with progress bars and difficulty tags.
4. **Build Task Feeds**: Code the `PendingWorkFeed.tsx` prioritizing overdue dates first, utilizing red and yellow visual alert indicators.
5. **Build Supplemental Widgets**: Develop the `CertificatesShelf.tsx`, `RecentScores.tsx`, and `AnnouncementStream.tsx`.

### Phase 4: Empty States & Polish
**Goal:** Perfect the UX and prepare for production.
1. **Empty State Fallbacks**: Implement the design logic mapped in **Part 6** for brand new trainees without data.
2. **Responsive Check**: Test the grid collapse mechanism on mobile tablet breakpoints (ensuring the side column elegantly wraps below the main column).
3. **Cache Policy**: Decide on the Next.js cache strategy (e.g., `revalidate: 60` seconds or `no-store` if we want aggressive real-time freshness).
