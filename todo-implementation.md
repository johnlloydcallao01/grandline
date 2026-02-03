## Notifications Collection Design Plan (apps/cms)

### 1. Goals and Constraints

- Support multiple high-level notification categories:
  - Learning (course completions, assignments, reminders, achievements, etc.)
  - Account (payments, certificates, security/account changes)
  - System Updates (platform-wide changes, feature releases, maintenance)
  - More categories in the future without schema rewrites
- Support both:
  - Manual notifications created by admins in the CMS (broadcasts, announcements)
  - Automatic notifications triggered by app events (course completion, upcoming deadlines, etc.)
- Fit cleanly into Payload CMS and the existing grandline patterns:
  - Collections per concern (e.g. `user-events`, `recently-viewed-courses`, `recent-searches`)
  - Role-based access control (admin, service, trainee, etc.)
- Be scalable for:
  - Many notification types
  - High volume of per-user notification rows
  - Future multi-channel delivery (in-app, email, push) without major redesign

### 2. High-Level Data Model (Enterprise-Inspired)

Industry patterns from large systems (Blackboard, social networks, etc.) generally separate:

- A core "notification item" or "notification entity" that represents the event and content
- Per-recipient records that track who received what and their read status
- Optional templates for different notification types and channels

References:
- Blackboard’s `eud_item` + `eud_item_recipient` model where one item fans out to many recipients and stores per-recipient status [Blackboard docs].
- Scalable designs that use a `NotificationEntity` / `Notification` / `NotificationReceivers` triad for templates, events, and recipients respectively.
- Tutorials and blog posts that separate notification templates, notifications, and user-specific read status.

For grandline (apps/cms), a practical and scalable adaptation:

1. **NotificationTemplates** (optional but recommended)
   - Defines reusable notification types and text templates.
   - Used for both manual broadcasts and automatic notifications.
2. **Notifications** (event-level records)
   - One row per notification event (e.g. "Course X completed by user Y", or "System maintenance on DATE").
   - Points to:
     - What happened
     - Which template/type was used
     - Who or what triggered it (actor)
     - Target audience definition (all users, specific segments, one user, etc.)
3. **UserNotifications** (per-user inbox)
   - One row per recipient per notification.
   - Tracks read/seen status, soft delete, per-user metadata.
   - This is effectively the "notifications table" that powers the UI.

This structure:
- Scales to many users and many notification types.
- Allows manual broadcasts (admin creates a `Notification` and the system generates many `UserNotifications`).
- Allows automatic events (backend code creates `Notification` and `UserNotifications` programmatically).
- Keeps Payload CMS admin UI usable (admins see templates and events, but the heavy per-user rows can be virtualized/paginated).

### 3. Collections Overview (apps/cms)

#### 3.1 NotificationTemplates (cms collection)

**Purpose**
- Define reusable notification types and copy for both manual and automatic use.
- Store business-level metadata like category, purpose, and default channel behavior.

**Key fields (conceptual)**
- `slug: 'notification-templates'`
- Fields:
  - `name` (text, required)  
    - Human-readable name (e.g. "Assignment Due Reminder").
  - `code` (text, unique, required)  
    - Machine identifier (e.g. `ASSIGNMENT_DUE`, `PAYMENT_SUCCESS`, `SYSTEM_MAINTENANCE`).
  - `category` (select)  
    - Enum: `learning`, `account`, `system-update`, `other`.  
    - This maps to UI tabs: Learning, Account, System Updates, etc.
  - `titleTemplate` (text)  
    - E.g. `Assignment due in {{days}} days`.
  - `bodyTemplate` (richText or textarea)  
    - With placeholders like `{{courseName}}`, `{{dueDate}}`, `{{amount}}`.
  - `defaultLink` (text or relationship to route config)
    - Where the notification should deep-link by default.
  - `channels` (checkbox group)  
    - `in-app`, `email`, `push` (future; in-app first).
  - `automatic` (checkbox)
    - Whether this template is intended for automatic triggers.
  - `manual` (checkbox)
    - Whether admins can send this template manually from CMS.
  - `metadataSchema` (json) [optional]
    - Structured description of expected `metadata` fields for validation or forms.

**How it helps**
- Adds new notification types by configuring CMS, not changing database schema.
- Cleanly categorizes by `category` for UI tabs.
- Supports both manual and automatic usage paths.

#### 3.2 Notifications (cms collection)

**Purpose**
- Represent one logical notification event (one "broadcast" or one "event instance").
- Does NOT represent per-user state; instead, it describes what happened and who should receive it.

**Key fields (conceptual)**
- `slug: 'notifications'`
- Fields:
  - `template` (relationship -> `notification-templates`, optional)
    - If present, tells how to render the title/body; if null, title/body fields are used directly.
  - `category` (select, redundant but denormalized for querying)
    - `learning`, `account`, `system-update`, `other`.
  - `title` (text)
    - Actual title used for this event (resolved from template or custom).
  - `body` (richText or textarea)
    - Actual message string (can be pre-rendered).
  - `metadata` (json)
    - Arbitrary structured data (courseId, assignmentId, amount, etc.).
  - `sourceType` (text)
    - E.g. `course`, `assignment`, `payment`, `system`.
  - `sourceId` (text)
    - ID of the entity that triggered it (e.g. course ID).
  - `actor` (relationship -> `users`, optional)
    - User who triggered the notification (admin for manual, system/service user for automatic).
  - `origin` (select)
    - `manual` | `automatic`.
  - `audienceType` (select)
    - `all-users`, `role`, `segment`, `specific-users`.
  - `audienceRole` (select, when `audienceType = 'role'`)
    - `trainee`, `instructor`, `admin`, etc.
  - `audienceUsers` (relationship to `users`, hasMany, when `audienceType = 'specific-users'`)
  - `segmentDefinition` (json, optional)
    - Future: conditions (e.g. enrolled in course X, region Y).
  - `scheduledAt` (date)
    - When this notification should go live.
  - `expiresAt` (date)
    - When it becomes irrelevant and can be archived.
  - `status` (select)
    - `draft` | `scheduled` | `sent` | `cancelled`.

**How it supports manual vs automatic**
- Manual:
  - Admin creates a `Notification` in CMS.
  - Chooses template (or custom title/body), audience, scheduledAt, etc.
  - Backend job reads this, resolves recipients, and generates `UserNotifications`.
- Automatic:
  - Backend code (in web or functions) creates `Notification` using a template with `origin = 'automatic'`, `sourceType`, `sourceId`, and `audienceType = 'specific-users'` (or `role`, etc.).
  - Same fan-out logic as manual.

#### 3.3 UserNotifications (cms collection, the "notifications table")

**Purpose**
- Store per-user delivered notifications.
- Power the UI tabs: All, Unread, Learning, Account, System Updates.

**Key fields (conceptual)**
- `slug: 'user-notifications'`
- Fields:
  - `user` (relationship -> `users`, required)
  - `notification` (relationship -> `notifications`, required)
  - `category` (select)
    - Copied from `notification.category` for fast filtering.
  - `title` (text)
    - Denormalized snapshot of title at send time.
  - `body` (textarea or richText)
    - Denormalized snapshot of body at send time.
  - `link` (text)
    - Deep link the UI should open.
  - `metadata` (json)
    - Light data for client-side behavior (course slug, etc.).
  - `readAt` (date, nullable)
  - `seenAt` (date, nullable)
    - `seenAt` can be set when the list is opened; `readAt` when the user clicks.
  - `deliveredAt` (date, default now)
  - `channel` (select)
    - For now, `in-app` only; future: `email`, `push`.
  - `archived` (checkbox)
    - Whether the user hid this notification from their list.

**Access control ideas**
- Read:
  - Users: only their own `user-notifications`.
  - Admin/service: all.
- Create/update:
  - Service/admin roles (system jobs or admin UI).
- Delete:
  - Hard delete limited to service/admin; user-level delete can be `archived = true`.

### 4. Manual vs Automatic Notification Flows

#### 4.1 Manual Notifications (Admin Broadcasts)

1. Admin goes to `NotificationTemplates` or `Notifications` in CMS.
2. Chooses:
   - Template (e.g. "System Maintenance", category `system-update`) OR
   - Writes custom title/body.
3. Sets `audienceType`:
   - `all-users`, `role`, or `specific-users`.
4. Optionally sets `scheduledAt`.
5. Saves a `Notification` document (`origin = 'manual'`).
6. Background job or CMS hook:
   - Resolves target users based on `audienceType`.
   - For each target user, creates a `UserNotification` row with:
     - `user`, `notification`, `category`, `title`, `body`, `link`, `metadata`.
   - Marks `Notification.status` as `sent` when done.

This is a common pattern in production apps:
- Admin broadcasts (announcements, maintenance, marketing) are created once and fanned out by the backend.
- Blackboard’s data model explicitly separates the notification (`eud_item`) from its recipients (`eud_item_recipient`).
- Many large systems use similar event + recipients tables for scale (see also enterprise blog posts and academic designs).

#### 4.2 Automatic Notifications (Event-Driven)

Examples:
- Course completed
- Assignment due soon
- Payment succeeded

Flow:

1. Some business event happens in `apps/web` or `apps/web-admin` (e.g. course completion).
2. Backend logic:
   - Selects the appropriate `NotificationTemplate` using `code`.
   - Fills placeholders (course name, due date, amount).
   - Creates a `Notification` with `origin = 'automatic'`, `actor` (system or user), `sourceType`, and `sourceId`.
3. Same fan-out mechanism:
   - If event targets a single user, create one `UserNotification`.
   - If event targets many (e.g. a batch announcement), create many `UserNotifications`.
4. Frontend in `apps/web`:
   - Fetches from `user-notifications` (`/users/{id}/notifications` style API).
   - Shows UI tabs using `category` and `readAt` filters:
     - All: all `user-notifications` for that user.
     - Unread: `readAt IS NULL`.
     - Learning: `category = 'learning'`.
     - Account: `category = 'account'`.
     - System Updates: `category = 'system-update'`.

This pattern (automatic event -> template -> notification -> per-recipient records) is extremely common in modern SaaS and LMS platforms. It’s basically an internal "messaging" pipeline.

### 5. Extensibility for Future Notification Types

- **Adding new categories**:
  - Add new enum values to `NotificationTemplates.category` and `Notifications.category`.
  - Update UI filters to map categories to tabs.
  - No table/collection change needed.
- **Adding new notification types**:
  - Create a new `NotificationTemplate` with unique `code`.
  - Implement backend logic that uses that `code`.
  - Existing schema and UI can handle the new type.
- **Supporting multiple channels**:
  - Start with `in-app` only (simplest).
  - Later:
    - Add `emailStatus`, `pushStatus`, `lastEmailSentAt`, etc. to `UserNotifications`.
    - Or define separate collections for channel-specific logs (optional).
- **User notification preferences**:
  - Future `user-notification-preferences` collection:
    - Per-user + per-category toggles (e.g. user can mute system updates but keep account notifications).

### 6. Commonality of Manual + Automatic Notifications in the Real World

Yes, this pattern is very common and considered standard in professional systems:

- Enterprise LMS (like Blackboard) separate notification items from recipient records, support scheduled/available notifications, and generate recipient rows based on roles and course membership.
- Many production systems (social apps, academic platforms) use:
  - Templates/notification entities → event-level notifications → per-recipient records, as described in several high-scale design articles.
- Admin-initiated and event-driven notifications share the same underlying schema; only the origin and trigger logic differ.

For grandline, adopting this pattern in `apps/cms` gives:
- A clean "notifications table" (`user-notifications`) aligned with industry patterns.
- Strong support for both manual broadcasts and automatic, event-driven notifications.
- A schema that can grow with more types, channels, and user preferences without breaking.
