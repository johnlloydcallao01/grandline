# Ask Instructor Implementation Plan

Based on a deep analysis of the existing CMS schema, the `chat-engine` shared package, and the provided UI mockup, the **"Ask Instructor" feature should be implemented as a specialized 1:1 direct chat between a Trainee and an Instructor**, leveraging the existing robust Chat Engine.

## Architectural Decision: Trainee ↔ Instructor
Yes, the implementation must be strictly between the **Trainee** and the **Instructor**. 
While the system has a `SupportTickets` collection, it is intended for platform-wide administrative support (Technical, Billing, Account). For course-specific questions, we should reuse the `Chats` and `ChatMessages` collections powered by `@grandline/chat-engine`. Interestingly, the `chat-engine` validation rules (`packages/chat-engine/src/validation/index.ts`) already anticipate an `instructor_trainee` chat type, proving this is the intended architecture.

We will map the "Question/Subject" ticketing concept from the UI into a 1:1 chat thread using the `Chats` collection's `metadata` field.

---

## Detailed Implementation Plan

### 1. Schema & Backend Enhancements
*   **Chats Collection (`apps/cms/src/collections/Chats.ts`)**: 
    *   We will create a chat document with `type: 'direct'` (or update the schema options to formally include `instructor_trainee` to match the package's `CHAT_TYPE_RULES`).
    *   We will heavily utilize the existing `metadata` JSON field to store the Q&A context required by the UI:
        ```json
        {
          "isAskInstructor": true,
          "subject": "Clarification on Marpol Annex VI",
          "courseId": 123,
          "status": "pending" // switches to "answered" or "archived"
        }
        ```
*   **Message Automation Hooks (`apps/cms/src/collections/ChatMessages.ts`)**:
    *   Extend the `afterChange` hook. When a new message is sent in an "Ask Instructor" chat, we automatically update the parent Chat's `metadata.status` and `lastMessageAt`.
    *   *Logic*: If `req.user.role === 'trainee'`, set `status: 'pending'`. If `req.user.role === 'instructor'`, set `status: 'answered'`. This completely drives the UI badges automatically.

### 2. Frontend Data Fetching (`apps/web/src/app/portal/ask-instructor/actions.ts`)
*   **Fetch Available Instructors**: Query the `CourseEnrollments` for the current trainee. Extract their active `Courses`, and map out the unique `Instructor` profiles linked to those courses.
*   **Fetch My Questions**: Query the standard `GET /api/chat` endpoint but filter for chats where `participants` includes the user and `metadata.isAskInstructor === true`.

### 3. Frontend UI Integration (`apps/web/src/app/portal/ask-instructor/page.tsx`)
*   **Create Question Flow**: When a user clicks "Ask a Question" or "Message", open a modal prompting for a `Subject`, the `Instructor`, and the initial `Message`.
*   **Initialization**: 
    1. Call `POST /api/chat` to instantiate the chat room, passing the `Trainee.id` and `Instructor.id` as participants, and injecting the Subject and initial Status into the `metadata`.
    2. Call `POST /api/chat/[id]/messages` to send the actual question content.
*   **Real-time Thread View**: When a user clicks on a question from the list, navigate them to a dedicated thread page (e.g., `/portal/ask-instructor/[chatId]`). This page will initialize the `ChatChannelManager` from `@grandline/chat-engine`—identical to the Discussion Board implementation—enabling seamless, real-time back-and-forth communication.
