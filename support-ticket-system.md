# Support Ticket System Feature Proposal

## Overview
This document outlines the proposed features for a standard Support Ticket System to be integrated into the existing Grandline ecosystem (`apps/cms` and `apps/web`). The system aims to provide a structured channel for Trainees to report issues and for Administrators/Support Staff to resolve them.

## 1. Data Architecture (PayloadCMS)

We will introduce two new collections to `apps/cms`: `SupportTickets` and `SupportTicketMessages`.

### A. Collection: `SupportTickets`
Represents the main issue thread.

*   **Slug:** `support-tickets`
*   **Fields:**
    *   `subject` (Text, Required): Brief summary of the issue.
    *   `status` (Select):
        *   `open` (Default): Ticket created, waiting for action.
        *   `in_progress`: Being worked on by support.
        *   `waiting_for_user`: Support replied, waiting for user response.
        *   `resolved`: Issue fixed.
        *   `closed`: Ticket archived.
    *   `priority` (Select):
        *   `low`: General questions.
        *   `medium` (Default): Standard issues.
        *   `high`: Urgent issues preventing learning (e.g., video not playing).
        *   `critical`: System outages.
    *   `category` (Select):
        *   `technical`: Bugs, errors, login issues.
        *   `billing`: Payment, invoices, refunds.
        *   `course_content`: Clarification on lessons, quizzes.
        *   `account`: Profile updates, certificates.
        *   `general`: Other inquiries.
    *   `user` (Relationship to `users`, Required): The trainee reporting the issue.
    *   `assignedTo` (Relationship to `users`): The admin/support staff handling the ticket.
    *   `attachments` (Relationship to `media`, HasMany): Initial screenshots or files.
    *   `lastMessageAt` (Date): Timestamp of the last activity (for sorting).

### B. Collection: `SupportTicketMessages`
Represents individual replies within a ticket.

*   **Slug:** `support-ticket-messages`
*   **Fields:**
    *   `ticket` (Relationship to `SupportTickets`, Required): Parent ticket.
    *   `sender` (Relationship to `users`, Required): Who sent the message (Trainee or Admin).
    *   `message` (RichText/Textarea, Required): The content of the reply.
    *   `attachments` (Relationship to `media`, HasMany): Files attached to this specific reply.
    *   `isInternal` (Boolean): If true, visible only to Admins (for internal notes).

## 2. User Roles & Access Control

*   **Trainees:**
    *   **Create:** Can create tickets.
    *   **Read:** Can view ONLY their own tickets.
    *   **Update:** Can update status (e.g., close their own ticket) but mostly interact via adding messages.
    *   **Delete:** Cannot delete tickets.
*   **Admins / Instructors (Support Staff):**
    *   **Create:** Can create tickets on behalf of users.
    *   **Read:** Can view ALL tickets.
    *   **Update:** Can update all fields (status, priority, assignment).
    *   **Delete:** Can delete tickets (optional, usually soft delete).

## 3. Web Application Features (`apps/web`)

The support section in the Trainee Portal will be expanded.

### A. Ticket Dashboard (`/support/tickets`)
*   **Ticket List:** A table or card view showing all tickets created by the user.
*   **Filters:** Filter by Status (Open, Closed) or Category.
*   **Sorting:** Sort by `Last Updated` (default), `Date Created`.
*   **Status Badges:** Color-coded badges (e.g., Green for Open, Gray for Closed).

### B. Create Ticket Page (`/support/tickets/new`)
*   **Form:**
    *   Subject Line.
    *   Category Selection.
    *   Priority Selection.
    *   Description (Rich Text Editor).
    *   File Upload (Drag & Drop for screenshots/logs).

### C. Ticket Detail View (`/support/tickets/[id]`)
*   **Header:** Shows Subject, ID, Status, and Created Date.
*   **Conversation History:** Chat-like timeline of messages between User and Support.
*   **Reply Box:** Area to type a new message and attach files.
*   **Actions:** Button to "Mark as Resolved" (if the user is satisfied).

## 4. Notifications & Automation

*   **Email Notifications:**
    *   **New Ticket:** Notify Admins when a new ticket is created.
    *   **New Reply (Admin -> User):** Notify User via email that their ticket has a response.
    *   **New Reply (User -> Admin):** Notify the `assignedTo` admin (or general support email if unassigned).
*   **In-App Notifications:**
    *   Use existing `UserNotifications` system to alert users of status changes or replies.

## 5. Future Enhancements (Post-MVP)
*   **Knowledge Base Integration:** Auto-suggest FAQ articles based on ticket subject before submission.
*   **SLA Tracking:** Timers to ensure high-priority tickets are answered within X hours.
*   **Canned Responses:** Templates for admins to reply quickly to common issues.
