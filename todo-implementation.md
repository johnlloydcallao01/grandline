## LMS Course Architecture – Implementation Plan

This plan turns the architecture from `analysis-now.md` into concrete, step‑by‑step work for your team. It is organized by phases so you can track progress and assign ownership.

You can treat each checkbox as a ticket or task.

---

## Phase 0 – Alignment and Scoping

- [ ] Confirm that **Case B** is the target architecture (Courses, Modules, Lessons, Materials, Announcements, JSON blocks) and that all new work follows it.
- [ ] Confirm which parts are **MVP** for the first release:
  - [ ] Required (now): Courses, Curriculum (Modules + Lessons), Materials, Announcements.
  - [ ] Optional (later): Quizzes, Assignments, Surveys, Certificates.
- [ ] Decide which platforms must be supported:
  - [ ] Web (apps/web).
  - [ ] Mobile (if applicable).
  - [ ] API consumers (e.g., partners, internal tools).
- [ ] Agree on the **rich text editor** strategy:
  - [ ] Use the PayloadCMS‑provided block‑based editor for course, lesson, and announcement content.
  - [ ] Confirm that rich content from PayloadCMS is stored as **JSON blocks**, not HTML, and align database fields accordingly.

Deliverable: short internal spec approved by product + engineering leads referencing `analysis-now.md`.

---

## Phase 1 – Data Model and Database Changes

### 1.1 Courses Table Updates

- [ ] Review existing `Courses` table.
- [ ] Add or confirm fields:
  - [ ] `short_description` (optional, simple text).
  - [ ] `description_blocks` (JSON column for block‑based content).
  - [ ] `level`, `language`, `status` (if not already present).
- [ ] Decide on indexing and constraints (e.g., unique slug).

### 1.2 Curriculum Structure: Modules and Lessons

- [ ] Design **Modules/Sections** table:
  - [ ] `id`
  - [ ] `course_id` (FK to Courses)
  - [ ] `title`
  - [ ] `order` or `position`
  - [ ] `release_at` (optional for scheduled release)
  - [ ] Timestamps (`created_at`, `updated_at`)
- [ ] Design **Lessons/Units** table:
  - [ ] `id`
  - [ ] `module_id` (FK to Modules)
  - [ ] `title`
  - [ ] `order` or `position`
  - [ ] `body_blocks` (JSON for lesson content blocks)
  - [ ] `estimated_duration` (optional)
  - [ ] Timestamps
- [ ] Define foreign keys and cascading rules (e.g., delete lessons when module is deleted).

### 1.3 Materials Table (Learning Assets)

- [ ] Design **Materials/Resources** table:
  - [ ] `id`
  - [ ] `type` (enum/string: video, pdf, image, audio, link, scorm, zip, etc.)
  - [ ] `title`
  - [ ] `description` (optional)
  - [ ] `storage_url` or `storage_key`
  - [ ] `metadata` (JSON: duration, size, resolution, provider id, etc.)
  - [ ] Timestamps
- [ ] Decide on relationships:
  - [ ] Simple approach: one of `course_id` or `lesson_id` columns.
  - [ ] Advanced reuse: separate join tables (e.g., `course_materials`, `lesson_materials`) to attach the same material to multiple entities.

### 1.4 Announcements Table

- [ ] Design **Announcements** table:
  - [ ] `id`
  - [ ] `course_id`
  - [ ] `title`
  - [ ] `body_blocks` (JSON for announcement content)
  - [ ] `created_by` (user id of instructor or system user)
  - [ ] `created_at`, `updated_at`
  - [ ] `pinned` (boolean)
  - [ ] `visible_from`, `visible_until` (optional for scheduling)

### 1.5 Future Content Types (Foundations)

- [ ] Reserve naming and patterns for future tables:
  - [ ] `quizzes`
  - [ ] `assignments`
  - [ ] `live_sessions`
  - [ ] `surveys`
- [ ] Ensure existing tables (courses/modules/lessons) have clear primary keys and consistent foreign key style for easy extension.

### 1.6 Database Migrations

- [ ] Write migrations for all new tables and columns.
- [ ] Run migrations on development database.
- [ ] Verify schema with the backend codebase (types, ORM models, etc.).

Deliverable: database schema updated according to `analysis-now.md`.

---

## Phase 2 – Backend Domain Logic (PayloadCMS)

- [ ] Align backend types with collections:
  - [ ] Use Payload’s generated types for Course (with `description_blocks`), Module/Section, Lesson/Unit, Material/Resource, Announcement.
- [ ] Implement LMS operations using Payload hooks and `payload` API:
  - [ ] Course operations (create, update, publish/unpublish).
  - [ ] Curriculum operations (create/reorder modules and lessons).
  - [ ] Material operations (attach/detach materials to courses/lessons).
  - [ ] Announcement operations (create, update, pin, schedule).
- [ ] Add validation rules:
  - [ ] Ensure ordering fields are unique per parent (no duplicates within the same course/module).
  - [ ] Enforce required relationships (no lesson without a module, etc.).
- [ ] Add basic error handling and logging for course‑related operations.

Deliverable: backend (PayloadCMS + hooks) can manage all core entities programmatically (without frontend).

---

## Phase 3 – JSON Block Content Handling

### 3.1 CMS Storage & Shared Schema (apps/cms + packages)

- [ ] Ensure JSON fields exist for block content:
  - [ ] `courses.description_blocks` (apps/cms)
  - [ ] `course-lessons.body_blocks` (apps/cms)
  - [ ] `announcements.body_blocks` (apps/cms)
- [ ] Define a shared JSON block schema in `packages/cms-types`:
  - [ ] Supported block types: heading, paragraph, list, image, quote, code, etc.
  - [ ] Required fields per block type (e.g., `level` for headings, `url` for images).

### 3.2 Admin Editor & Serialization (apps/cms admin panel using Lexical)

- [ ] In **apps/cms** Payload admin, integrate the Lexical‑based block editor into collection forms:
  - [ ] Course editor for `description_blocks` (JSON stored in `courses.description_blocks`).
  - [ ] Lesson editor for `body_blocks` (JSON stored in `course-lessons.body_blocks`).
  - [ ] Announcement editor for `body_blocks` (JSON stored in `announcements.body_blocks`).
- [ ] Implement serialization between Lexical editor state and the shared JSON block schema:
  - [ ] On save, convert Lexical state to `ContentBlock[]` and write it into:
    - [ ] `courses.description_blocks`
    - [ ] `course-lessons.body_blocks`
    - [ ] `announcements.body_blocks`

Deliverable: rich content is stored as JSON blocks in apps/cms and rendered correctly in the course views (apps/web and apps/web-admin).

---

## Phase 4 – Public Course View (apps/web)

### 4.1 Course Overview Page (Tabs)

- [ ] Implement or update the **View Course** page layout with tabs:
  - [ ] Course Description
  - [ ] Curriculum
  - [ ] Materials
  - [ ] Announcements
- [ ] Ensure responsive behavior on desktop and mobile.

### 4.2 Course Description Tab

- [ ] Fetch course data including `description_blocks`.
- [ ] Implement rendering components that map block types to UI (apps/web):
  - [ ] HeadingBlock → H1/H2/H3 components.
  - [ ] ParagraphBlock → text component.
  - [ ] ImageBlock → image component with responsive handling.
  - [ ] ListBlock → ordered/unordered lists.
- [ ] Use the block renderer to display:
  - [ ] Headings, paragraphs, lists.
  - [ ] Images/media blocks.
  - [ ] Proper spacing and typography according to design.
- [ ] Ensure safe handling of user input (no raw HTML injection) (apps/web).

### 4.3 Curriculum Tab

- [ ] Fetch modules and lessons for the course.
- [ ] Render hierarchical tree:
  - [ ] Modules in order.
  - [ ] Lessons under each module in order.
- [ ] Show status indicators (completed/in progress/not started) if progress tracking exists or is planned.

### 4.4 Materials Tab

- [ ] Fetch course‑level materials (and lesson‑level, if desired).
- [ ] Group materials logically (by type or module).
- [ ] Show:
  - [ ] Title.
  - [ ] Type icon (video, file, link, etc.).
  - [ ] Any visible metadata (duration, size).
- [ ] Implement actions (download, open in new tab, play, etc.).

### 4.5 Announcements Tab

- [ ] Fetch announcements for the course (with pagination if needed).
- [ ] Display:
  - [ ] Title.
  - [ ] Rendered `body_blocks`.
  - [ ] Author name and date.
  - [ ] Pinned badge for pinned announcements.
- [ ] Sort announcements (pinned first, then newest first).

### 4.6 Tests (apps/web-admin + apps/web)

- [ ] Add tests for saving and loading block JSON (apps/web-admin).
- [ ] Add tests for rendering typical content (apps/web):
  - [ ] Text only.
  - [ ] Text + image.
  - [ ] Long content with multiple block types.

Deliverable: learners see all four tabs populated from the new data model.

---

## Phase 5 – Instructor/Admin Interfaces

### 5.1 Course Management

- [ ] Create or update screens for:
  - [ ] Creating and editing courses (title, metadata, description blocks).
  - [ ] Setting course status (draft, published, archived).

### 5.2 Curriculum Builder

- [ ] Implement UI for:
  - [ ] Creating modules/sections.
  - [ ] Creating lessons within modules.
  - [ ] Drag‑and‑drop reordering of modules and lessons.
- [ ] Integrate block editor for lesson content (`body_blocks`).
- [ ] Add validation and warning messages (e.g., unsaved changes).

### 5.3 Materials Management

- [ ] Implement UI for uploading and managing materials:
  - [ ] File upload (PDF, images, videos, etc.) or external links.
  - [ ] Setting titles and descriptions.
  - [ ] Selecting type and attaching to course/lesson.
- [ ] Show which lessons/courses a material is attached to.

### 5.4 Announcements Management

- [ ] Implement UI for:
  - [ ] Creating announcements using the block editor.
  - [ ] Editing and deleting announcements.
  - [ ] Pinning/unpinning.
  - [ ] Scheduling visibility if supported.

Deliverable: instructors can fully manage courses, curriculum, materials, and announcements through the UI.

---

## Phase 6 – APIs and Integration

- [ ] Define and document API endpoints for:
  - [ ] Fetching course details with description blocks.
  - [ ] Fetching curriculum (modules + lessons).
  - [ ] Fetching materials.
  - [ ] Fetching announcements.
- [ ] Add authentication/authorization rules:
  - [ ] Public vs. enrolled access.
  - [ ] Instructor/admin‑only endpoints for creation and updates.
- [ ] Ensure responses are consistent and versioned if needed.

Deliverable: stable API layer supporting web and potential mobile clients.

---

## Phase 7 – Testing, QA, and Performance

- [ ] Add unit tests for backend services (courses, curriculum, materials, announcements).
- [ ] Add integration tests for:
  - [ ] Course creation including description blocks.
  - [ ] Full curriculum setup (modules + lessons).
  - [ ] Material upload and attachment.
  - [ ] Announcement creation and rendering.
- [ ] Add frontend tests (where applicable):
  - [ ] Rendering of each tab.
  - [ ] Rendering block‑based content.
  - [ ] Navigation between tabs and deep links.
- [ ] Run performance checks:
  - [ ] Large courses with many modules/lessons.
  - [ ] Many announcements.
  - [ ] Heavy use of materials.

Deliverable: confidence that the new architecture performs and behaves correctly at scale.

---

## Phase 8 – Migration and Rollout Strategy

- [ ] Plan migration of existing courses:
  - [ ] Map old description fields to `description_blocks` (e.g., simple text → single paragraph block).
  - [ ] Migrate any existing curriculum or materials if they exist.
  - [ ] Migrate any existing announcements if applicable.
- [ ] Run migration scripts in a staging environment.
- [ ] Validate migrated data with sample courses.
- [ ] Plan rollout:
  - [ ] Feature flags or gradual rollout per course or per instructor.
  - [ ] Communication to instructors about new editing experience.

Deliverable: legacy data is safely transitioned to the new model.

---

## Phase 9 – Analytics and Future Enhancements

- [ ] Define analytics events:
  - [ ] Page views per tab (Description, Curriculum, Materials, Announcements).
  - [ ] Engagement with materials (downloads, plays).
  - [ ] Engagement with announcements (views, clicks).
- [ ] Implement tracking in web app and backend.
- [ ] Identify next‑step enhancements:
  - [ ] Quizzes linked to lessons.
  - [ ] Assignments and grading workflows.
  - [ ] Certificates and completion rules.
  - [ ] Recommendation engine (similar courses, suggested materials).

Deliverable: data and roadmap for continuous improvement on top of the new architecture.














Then edit our existing lexical editor in the apps/cms in the courses collection by adding our own custom from scratch add image widget. The name of that will be "Image". After that, the goal is we can then type "/" in the lexical editor and we must be able to see that in the description field in the courses collection in the admin panel in PayloadCMS!!!!!!!!!!

You add it in the lexical editor in our Courses collection in the description editor there in the payload cms admin panel:

Currently, we only have these in the toolbar:

Lists

Check ListOrdered ListUnordered List

Basic

lexical:upload:labelHorizontal RuleBlockquoteRelationshipHeading 1Heading 2Heading 3Heading 4Heading 5Heading 6Paragraph