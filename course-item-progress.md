# Course Item Progress Field Definitions

This document details the purpose of each field in the `CourseItemProgress` collection, which serves as the granular tracking engine for the LMS. This table supports all 7 evaluation modes by decoupling "content consumption" from "assessment performance."

## Core Relationships

### **Trainee**
*   **Type:** Relationship (`trainees`)
*   **Purpose:** Identifies *who* this progress record belongs to.
*   **Why it's needed:** Essential for filtering progress by user. We link to `Trainees` (not just `Users`) to support corporate hierarchy features (e.g., Department Heads viewing their trainees' progress).

### **Course**
*   **Type:** Relationship (`courses`)
*   **Purpose:** Identifies the parent course for the item.
*   **Why it's needed:** Performance optimization. It allows us to fetch "All progress for Student A in Course B" in a single database query without complex joins through the `Item` relationship.

### **Item**
*   **Type:** Polymorphic Relationship (`course-lessons` | `assessments`)
*   **Purpose:** The specific content piece being tracked.
*   **Why it's needed:** A course is a mix of Lessons (videos/text) and Assessments (quizzes/exams). Polymorphism allows this single table to track progress for *both* types of content uniformly.

### **Enrollment**
*   **Type:** Relationship (`course-enrollments`)
*   **Purpose:** Links this progress to a specific registration instance.
*   **Why it's needed:** If a student retakes a course (e.g., yearly compliance), they will have a *new* Enrollment. This field ensures we attribute progress to the *current* active attempt, not a past one.

---

## Progress State

### **Status**
*   **Type:** Select (`not_started`, `in_progress`, `completed`, `passed`, `failed`)
*   **Purpose:** The high-level semantic state of the item.
*   **Why it's needed:**
    *   `completed`: Used for Lessons (e.g., watched the video).
    *   `passed`/`failed`: Used for Assessments (quizzes/exams).
    *   `in_progress`: Indicates the user started but didn't finish (e.g., paused a video).

### **Is Completed**
*   **Type:** Boolean (Checkbox)
*   **Purpose:** A simplified "Done" flag.
*   **Why it's needed:** **Optimization.** When calculating "Course Progress: 80%", the backend just counts records where `isCompleted = true`. It doesn't need to parse complex logic like *"If it's a quiz, check if score > passing_grade; if it's a lesson, check status..."*. The API sets this flag automatically when the logic is satisfied.

### **Progress Percentage**
*   **Type:** Number (0-100)
*   **Purpose:** Tracks partial consumption.
*   **Why it's needed:**
    *   **Video Resume:** If a user watches 50% of a 1-hour video, we store `50` here. When they return, the player seeks to that timestamp.
    *   **Reading:** Scroll depth tracking (optional future feature).

---

## Timestamps & Auditing

### **Started At**
*   **Type:** Date
*   **Purpose:** When the user *first* opened or clicked the item.
*   **Why it's needed:** Analytics (e.g., "Time to start").

### **Completed At**
*   **Type:** Date
*   **Purpose:** When the `isCompleted` flag was set to true.
*   **Why it's needed:**
    *   **Deadlines:** Did they finish before the due date?
    *   **Certificates:** Used to determine the "Date of Completion" on certificates.

### **Last Accessed At**
*   **Type:** Date
*   **Purpose:** The most recent interaction.
*   **Why it's needed:** "Resume Learning" features. We sort by this field to show the user exactly where they left off.

### **Duration Seconds**
*   **Type:** Number
*   **Purpose:** Cumulative "Seat Time".
*   **Why it's needed:** **Compliance.** Many regulatory bodies (e.g., OSHA, CPD) require proof that a student spent X hours actually viewing the material, not just clicking "Next". The frontend sends "heartbeats" to increment this counter.

---

## Assessment Data (Quizzes/Exams)

### **Score**
*   **Type:** Number
*   **Purpose:** The raw points achieved (e.g., `15` out of 20).
*   **Why it's needed:** Detailed reporting.

### **Grade**
*   **Type:** Number (0-100)
*   **Purpose:** The normalized percentage score.
*   **Why it's needed:** Standardization. A score of 15/20 is `75`. The system uses *this* field to compare against the `passingGrade` defined in the Assessment settings to determine Pass/Fail status.

### **Attempts**
*   **Type:** Number
*   **Purpose:** How many times the user tried this item.
*   **Why it's needed:**
    *   **Limits:** Some exams allow only 3 attempts.
    *   **Analytics:** High average attempts indicate a poorly written or too difficult lesson/quiz.

### **Quiz Data**
*   **Type:** JSON
*   **Purpose:** A snapshot of the full submission.
*   **Why it's needed:** **Audit Trail.** It stores exactly which options the user selected for every question. This is critical for:
    *   Student disputes ("I swear I clicked B!").
    *   Reviewing results (showing the student which questions they got wrong).
