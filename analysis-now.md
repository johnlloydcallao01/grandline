## Course Data Architecture – Recommended Design (Case B)

This document describes the recommended database design for representing course data in the LMS. It focuses on creating a scalable, flexible, and enterprise‑ready structure.

The core idea is to:
- Keep **Courses** as the source of truth.
- Model each major concept (curriculum, materials, announcements, etc.) as its own related entity.
- Avoid one generic “catch‑all” content table.

---

## 1. Courses Table (Parent Entity)

The **Courses** table remains the main source of truth for each course.

Key responsibilities:
- Identify the course (id, slug, code).
- Store core metadata (title, category, language, level, status).
- Store the **course description** directly as one or more columns (e.g., short_description, long_description, description_blocks or similar).

Rationale:
- Description is a 1‑to‑1 attribute of a course.
- It is usually represented as rich content (headings, paragraphs, images, etc.), but it still belongs logically to the course entity rather than to a separate table.

---

## 2. Curriculum Structure (Modules and Lessons)

The curriculum is hierarchical, so it should be modeled with dedicated tables instead of a single field.

Typical structure:
- **Modules/Sections table**
  - Belongs to a course.
  - Represents high‑level units (e.g., “Week 1: Fundamentals”).
  - Has an order/position field for sequencing within the course.
- **Lessons/Units table**
  - Belongs to a module/section.
  - Represents individual learning items (e.g., “Lesson 1: Introduction”).
  - Has an order/position field for sequencing within the module.

Scalability benefits:
- Easy reordering of modules and lessons without touching other data.
- Supports progress tracking at the lesson level.
- Allows advanced features such as prerequisites, release schedules, and completion rules.

---

## 3. Materials Table (Learning Assets)

Materials are reusable assets such as PDFs, videos, links, and SCORM packages. They should live in a dedicated **Materials** (or **Resources**) table.

Typical fields:
- id
- type (video, pdf, image, audio, link, scorm, zip, etc.)
- storage location (URL, file path, provider/video id)
- title / display name
- description (optional)
- metadata (JSON for extra details such as duration, file size, resolution, etc.)

Relationships:
- A material can belong to:
  - A course (course‑level resources, like a syllabus).
  - A lesson (lesson‑specific resources).
  - Potentially multiple courses or lessons via linking tables if reuse is desired.

Benefits:
- Supports many file and media types without changing the table structure.
- Enables reuse of the same asset across multiple courses or lessons.
- Allows rich UI (icons, duration, badges) based on metadata.

---

## 4. Announcements Table (Course Communication)

Announcements are time‑based communication events for a course, so they should have their own table.

Typical fields:
- id
- course_id
- title
- body (text or rich text)
- created_by (instructor or system user)
- created_at, updated_at
- pinned / priority flags
- visibility rules (optional)

Characteristics:
- A course starts with zero announcements and can accumulate many over time.
- Behaves like a timeline or activity log for each course.

Benefits:
- Supports features such as pinning, scheduling, filtering, and notifications.
- Allows later extension with comments, reactions, or read‑tracking without changing other entities.

---

## 5. Why This Is a “Pro” / Enterprise‑Ready Approach

**Flexibility**
- New features (Quizzes, Assignments, Live Sessions, Surveys, Certificates, etc.) can be added as new tables that relate to courses, modules, or lessons.
- No need to redesign existing tables when adding new content types.

**Performance**
- When a learner opens “Announcements”, the system queries only the announcements table.
- Curriculum, materials, and announcements can be loaded, cached, and paginated independently.
- Large assets (videos, files) are separated from core course metadata.

**Media Support**
- The Materials table can store metadata such as:
  - File type, file size, duration, resolution.
  - Provider information (YouTube ID, Vimeo ID, internal media service ID).
- This supports a polished UI with appropriate icons, labels, and playback options.

**Analytics and Reporting**
- Clear entities (courses, modules, lessons, materials, announcements) make it easy to:
  - Count lessons per module.
  - Track material usage.
  - Measure announcement engagement over time.
- Avoids complex “if type = X then …” logic over a single generic content table.

**Access Control and Security**
- Permissions can be defined per entity type:
  - Who can edit curriculum versus announcements?
  - Who can upload or approve materials?
  - Who can schedule live sessions or publish quizzes?
- This is much simpler when each concept has its own table.

---

## 6. Extensibility for Future Content Types

When a new content type is needed, follow this pattern:
- Create a new dedicated table for the new concept (e.g., **Quizzes**, **Assignments**, **Surveys**, **LiveSessions**).
- Link it to the appropriate level:
  - Course‑level (e.g., course‑wide surveys).
  - Module‑level (e.g., module recap quiz).
  - Lesson‑level (e.g., short quiz after a specific lesson).
- Add any specific fields or metadata that concept needs (time limits, grading rules, attendance, etc.).

This approach keeps the model clean while remaining flexible and future‑proof.

---

## 7. Content Format for Rich Text (JSON Blocks)

For rich text content such as course descriptions, lesson bodies, and announcement bodies, use a **block‑based JSON format** rather than storing raw HTML.

Modern pattern:
- Use a rich text or block editor that outputs structured JSON (for example, EditorJS, Slate, TipTap, Draft.js, or a similar tool).
- Store the resulting JSON in the relevant column (e.g., description_blocks, lesson_body_blocks, announcement_body_blocks).
- On the frontend, render each block according to its type (heading, paragraph, image, list, quote, etc.).

Benefits:
- Platform independent: the same stored content can be rendered on web, mobile, emails, and other clients.
- Secure: avoids storing arbitrary user‑supplied HTML and reduces XSS risk.
- Flexible: design and styling can change over time without rewriting stored content.
- Searchable and analyzable: it is possible to query or inspect content by block type (e.g., “lessons that contain video blocks”).
- Future‑proof: structured content is easier to feed into AI pipelines for summaries, translations, and quality checks.

This content‑format decision is orthogonal to the relational design above: the tables define **what entities exist and how they relate**, while JSON blocks define **how rich text and media inside those entities are structured and rendered.**

---

## 8. Summary for Developers

Feature | Database Design | Rationale
------- | ---------------- | --------
Description | Columns on **Courses** (e.g., description_blocks JSON) | 1‑to‑1 attribute of a course with rich content stored as structured blocks.
Curriculum | **Modules** and **Lessons** tables | Ordered, hierarchical structure with progress tracking.
Materials | Separate **Materials/Resources** table | Supports many formats and reuse across courses/lessons.
Announcements | Separate **Announcements** table | Time‑based events that grow over time (log/history).
New content types (Quizzes, etc.) | Dedicated tables linked to courses/modules/lessons | Extensible and easy to evolve without redesign.

This design balances flexibility, performance, and clarity, and is suitable for large‑scale, enterprise‑level LMS platforms.

