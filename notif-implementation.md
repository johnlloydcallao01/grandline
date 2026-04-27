# Notification System Architecture Analysis

## Executive Summary

**VERDICT: Yes, the notification system is architecturally flexible and scalable.**

The `apps/cms` notification collections are designed with a 3-tier architecture that supports:
- **Arbitrary notification types** via templates + JSON metadata
- **Future expansion** (certificate notifications, etc.) without schema changes
- **Multi-channel delivery** (in-app, email, push)
- **Scalable broadcast-to-user delivery model**

---

## Architecture Overview

| Collection | Slug | Purpose |
|------------|------|---------|
| NotificationTemplates | `notification-templates` | Reusable notification type definitions with templates |
| Notifications | `notifications` | Logical notification events/broadcasts |
| UserNotifications | `user-notifications` | Per-user notification instances powering the in-app inbox |

---

## Flexibility Strengths

### 1. Template-Based Extensibility

**File:** `apps/cms/src/collections/NotificationTemplates.ts`

- **Unique `code` field** (line 37-41): Enables programmatic identification
  - Example: `CERTIFICATE_ISSUED`, `COURSE_ENROLLED`, `ASSESSMENT_PASSED`
  - Acts as the hook for triggering specific notification types

- **Dynamic content templates** (line 54-62):
  - `titleTemplate`: `"You've been enrolled in {{courseName}}"`
  - `bodyTemplate`: `"Welcome to {{courseName}}. Start learning today!"`
  - Variable interpolation at creation time

- **Metadata schema definition** (line 88-91):
  - `metadataSchema` (JSON): Defines expected data structure per template
  - Enables type safety and validation for custom notification data

### 2. Metadata-Driven Type Expansion

**Files:** 
- `apps/cms/src/collections/Notifications.ts` (line 60-62)
- `apps/cms/src/collections/UserNotifications.ts` (line 75-77)

Both collections have a `metadata` JSON field that stores arbitrary event-specific data:

```typescript
// Certificate notification metadata example
{
  "certificateId": 123,
  "courseName": "Maritime Safety 101",
  "issueDate": "2026-04-27T12:00:00Z",
  "downloadUrl": "/certificates/123/download"
}
```

**Key advantage:** Adding certificate notifications requires **zero schema changes**—just populate the metadata field.

### 3. Source Tracing

**File:** `apps/cms/src/collections/Notifications.ts` (line 64-70)

```typescript
{
  sourceType: 'certificate',  // or 'enrollment', 'assessment', 'chat'
  sourceId: '123'             // ID of the originating entity
}
```

This enables:
- Clicking a notification to navigate to the related resource
- Audit trails for notification origins
- Cascading updates when source entities change

### 4. Multi-Channel Delivery

**File:** `apps/cms/src/collections/NotificationTemplates.ts` (line 68-77)

```typescript
channels: ['in-app', 'email', 'push']  // HasMany select
```

**File:** `apps/cms/src/collections/UserNotifications.ts` (line 92-101)

```typescript
channel: 'in-app' | 'email' | 'push'  // Per-delivery tracking
```

Future expansion to SMS, webhooks, or Slack only requires:
1. Adding option to enum
2. Implementing delivery handler

### 5. Flexible Audience Targeting

**File:** `apps/cms/src/collections/Notifications.ts` (line 87-125)

| `audienceType` | Use Case |
|----------------|----------|
| `all-users` | System-wide announcements |
| `role` | All trainees, all instructors |
| `segment` | Custom JSON-defined segments |
| `specific-users` | Individual user targeting |

The `segmentDefinition` JSON field (line 120-125) allows complex targeting without schema changes:
```typescript
{
  "enrolledInCourseId": 456,
  "completedWithinDays": 30
}
```

---

## Scalability Features

### 1. Separation of Concerns

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│ NotificationTemplate│────▶│    Notification     │────▶│  UserNotification   │
│   (Definition)      │     │   (Broadcast Event) │     │ (Per-User Delivery) │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
                                                            ┌──────────────┐
                                                            │ User A: Unread│
                                                            │ User B: Read  │
                                                            │ User C: Unread│
                                                            └──────────────┘
```

**Benefits:**
- Query unread counts efficiently from `user-notifications`
- Paginate inbox without scanning broadcast records
- Update broadcast status independently of individual reads

### 2. Status Lifecycle Management

**File:** `apps/cms/src/collections/Notifications.ts` (line 135-145)

```typescript
status: 'draft' | 'scheduled' | 'sent' | 'cancelled'
```

With scheduling support (line 127-133):
```typescript
scheduledAt?: Date  // Future delivery
expiresAt?: Date    // Auto-expire notification
```

### 3. Read/Seen Tracking

**File:** `apps/cms/src/collections/UserNotifications.ts` (line 79-85)

```typescript
readAt?: Date    // User clicked/engaged
seenAt?: Date    // User viewed in list
deliveredAt: Date  // System delivered
```

Supports:
- Unread badges
- Engagement analytics
- "Mark all as read" functionality

### 4. Archiving

**File:** `apps/cms/src/collections/UserNotifications.ts` (line 102-106)

```typescript
archived: boolean  // Default: false
```

Allows users to clean up inbox without deleting history.

---

## Current Implementation Gap

**⚠️ Critical Finding:** The notification collections exist but are **not actively integrated** into business logic.

### Locations Where Notifications Should Be Triggered (Currently Missing):

| Event | Location | Current Status |
|-------|----------|----------------|
| Course enrollment | `apps/cms/src/app/api/lms/enrollments/route.ts:103-112` | ❌ Not implemented |
| Certificate issued | `apps/cms/src/endpoints/generate-certificate.tsx:211-230` | ❌ Not implemented |
| Chat message received | `apps/cms/src/app/api/chat/[id]/messages/route.ts` | ❌ Not implemented |
| Trainee registered | `apps/cms/src/app/api/trainee-register/route.ts` | ❌ Not implemented |
| Assessment submitted | `apps/cms/src/endpoints/submit-assessment.ts` | ❌ Not implemented |

### Current "Notification" Implementation

The codebase currently uses **ad-hoc email** for enrollment requests:

**File:** `apps/cms/src/app/api/lms/enrollment-requests/route.ts:45-95`

```typescript
// Direct Resend API call - NOT using notification collections
const resendRes = await fetch('https://api.resend.com/emails', {...})
```

This bypasses the notification system entirely—no in-app bell, no user notification history.

---

## Recommendation: Certificate Notification Implementation

To add certificate issuance notifications (your future use case):

### Step 1: Create Template (One-time setup)

```typescript
// Via CMS Admin or seed script
await payload.create({
  collection: 'notification-templates',
  data: {
    name: 'Certificate Issued',
    code: 'CERTIFICATE_ISSUED',
    category: 'learning',
    titleTemplate: '🎉 Your certificate for {{courseName}} is ready!',
    bodyTemplate: 'Congratulations on completing {{courseName}}. Download your certificate now.',
    defaultLink: '/portal/certificates/{{certificateId}}',
    channels: ['in-app', 'email'],
    automatic: true,
    manual: false,
    metadataSchema: {
      type: 'object',
      properties: {
        certificateId: { type: 'number' },
        courseName: { type: 'string' },
        courseId: { type: 'number' }
      }
    }
  }
})
```

### Step 2: Trigger in Certificate Generation

**File to modify:** `apps/cms/src/endpoints/generate-certificate.tsx`

Add after line 230 (after enrollment update):

```typescript
// Create notification
const notification = await payload.create({
  collection: 'notifications',
  data: {
    template: templateId,  // Reference to CERTIFICATE_ISSUED template
    category: 'learning',
    title: `Certificate issued for ${course.title}`,
    body: `Your certificate for ${course.title} is now available.`,
    metadata: {
      certificateId: certificate.id,
      courseName: course.title,
      courseId: course.id
    },
    sourceType: 'certificate',
    sourceId: String(certificate.id),
    origin: 'automatic',
    audienceType: 'specific-users',
    audienceUsers: [studentUser.id],
    status: 'sent'
  }
})

// Create per-user notification (for bell icon)
await payload.create({
  collection: 'user-notifications',
  data: {
    user: studentUser.id,
    notification: notification.id,
    category: 'learning',
    title: `🎉 Your certificate for ${course.title} is ready!`,
    body: 'Congratulations! Download your certificate from your dashboard.',
    link: `/portal/certificates/${certificate.id}`,
    metadata: {
      certificateId: certificate.id,
      courseName: course.title
    },
    channel: 'in-app',
    deliveredAt: new Date().toISOString()
  }
})
```

### Step 3: Frontend Bell Integration

**File:** `apps/web/src/app/portal/dashboard/page.tsx` (or notification component)

```typescript
// Fetch unread count for bell badge
const unreadRes = await fetch(
  '/api/user-notifications?where[readAt][exists]=false&limit=0'
)

// Fetch recent notifications for dropdown
const notificationsRes = await fetch(
  '/api/user-notifications?sort=-deliveredAt&limit=10&depth=1'
)
```

---

## Summary

| Aspect | Status | Notes |
|--------|--------|-------|
| **Schema Flexibility** | ✅ Excellent | JSON metadata + template system |
| **Scalability Pattern** | ✅ Tiered Architecture | Broadcast → Per-User separation |
| **Multi-Type Support** | ✅ Template-based | Unlimited types via `code` field |
| **Future-Proofing** | ✅ Source tracing, channels | Ready for expansion |
| **Current Utilization** | ❌ Not integrated | Collections exist but unused |
| **Certificate Notifications** | ✅ Ready to implement | Zero schema changes required |

---

## Files Referenced

- `apps/cms/src/collections/NotificationTemplates.ts` - Template definitions
- `apps/cms/src/collections/Notifications.ts` - Broadcast events
- `apps/cms/src/collections/UserNotifications.ts` - Per-user deliveries
- `apps/cms/src/endpoints/generate-certificate.tsx` - Certificate generation endpoint
- `apps/cms/src/app/api/lms/enrollments/route.ts` - Enrollment creation
- `apps/cms/src/app/api/lms/enrollment-requests/route.ts` - Ad-hoc email notification

---

# Course Enrollment Notification Implementation Plan

## Overview

This implementation adds **in-app notifications** when a trainee is enrolled in a course. The notification appears in the trainee's notification bell in `apps/web`.

## Data Flow Analysis

### Enrollment Creation Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        COURSE ENROLLMENT FLOW                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────┐    POST /api/lms/enrollments    ┌──────────────────────────┐│
│  │  apps/web    │ ───────────────────────────────▶│  apps/cms                ││
│  │  (Trainee)   │                                  │  Enrollment API         ││
│  └──────────────┘                                  └──────────────────────────┘│
│                                                              │                   │
│                                                              ▼                   │
│                                                  ┌──────────────────────────┐   │
│                                                  │  1. Check for existing   │   │
│                                                  │     enrollment           │   │
│                                                  │  2. Create enrollment    │   │
│                                                  │  3. Create notification  │◀──┼── NEW
│                                                  │     (NEW STEP)           │   │
│                                                  └──────────────────────────┘   │
│                                                              │                   │
│                                                              ▼                   │
│                                                  ┌──────────────────────────┐   │
│                                                  │  Notification Collections│   │
│                                                  │  ├─ notification-templates│   │
│                                                  │  ├─ notifications          │   │
│                                                  │  └─ user-notifications     │   │
│                                                  └──────────────────────────┘   │
│                                                              │                   │
│                                                              ▼                   │
│  ┌──────────────┐    GET /api/user-notifications  ┌──────────────────────────┐   │
│  │  apps/web    │ ◀───────────────────────────────│  Trainee Dashboard      │   │
│  │  (Bell Icon) │                                  │  (Unread Count + List)  │   │
│  └──────────────┘                                  └──────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Key Relationships

**Trainee → User Mapping:**
- `trainees` collection has `user` field (relationship to `users` collection)
- `course-enrollments` uses `student` field (relationship to `trainees`)
- To notify the user, we must resolve: `enrollment.student` → `trainee.user` → `user.id`

**Notification Targeting:**
| Collection | Field | Points To |
|------------|-------|-----------|
| `course-enrollments` | `student` | `trainees` (trainee profile) |
| `trainees` | `user` | `users` (user account for auth) |
| `user-notifications` | `user` | `users` (who sees the notification) |

## Implementation Steps

### Phase 1: Create Notification Template (One-Time Setup)

**Location:** CMS Admin → Notifications → Notification Templates (or seed script)

**Template Data:**
```typescript
{
  name: 'Course Enrolled',
  code: 'COURSE_ENROLLED',
  category: 'learning',
  titleTemplate: '🎓 Welcome to {{courseName}}!',
  bodyTemplate: 'You have been successfully enrolled in {{courseName}}. Start learning now!',
  defaultLink: '/portal/courses/{{courseId}}',
  channels: ['in-app'],
  automatic: true,
  manual: false,
  metadataSchema: {
    type: 'object',
    properties: {
      enrollmentId: { type: 'number' },
      courseId: { type: 'number' },
      courseName: { type: 'string' },
      enrollmentType: { type: 'string' }
    }
  }
}
```

### Phase 2: Modify Enrollment API

**File:** `apps/cms/src/app/api/lms/enrollments/route.ts`

**Current Code (lines 103-116):**
```typescript
// Create enrollment
const newEnrollment = await payload.create({
  collection: 'course-enrollments',
  data: {
    ...body,
    enrolledAt: new Date().toISOString(),
    status: body.status || 'active',
    progressPercentage: 0,
  },
})

// Note: Database integration can be added later

return NextResponse.json(newEnrollment, { status: 201 })
```

**New Code (with notification):**
```typescript
// Create enrollment
const newEnrollment = await payload.create({
  collection: 'course-enrollments',
  data: {
    ...body,
    enrolledAt: new Date().toISOString(),
    status: body.status || 'active',
    progressPercentage: 0,
  },
})

// ─────────────────────────────────────────────────────────────
// CREATE ENROLLMENT NOTIFICATION (NEW CODE)
// ─────────────────────────────────────────────────────────────
try {
  // Only notify if enrollment is active
  if (newEnrollment.status === 'active') {
    // 1. Get trainee's user ID
    const trainee = await payload.findByID({
      collection: 'trainees',
      id: newEnrollment.student,
      depth: 0,
    })
    
    const userId = typeof trainee.user === 'object' ? trainee.user.id : trainee.user
    
    // 2. Get course details
    const course = await payload.findByID({
      collection: 'courses',
      id: newEnrollment.course,
      depth: 0,
    })
    
    // 3. Find or use COURSE_ENROLLED template
    const templateRes = await payload.find({
      collection: 'notification-templates',
      where: {
        code: { equals: 'COURSE_ENROLLED' }
      },
      limit: 1,
    })
    
    const template = templateRes.docs[0]
    
    // 4. Create broadcast notification
    const notification = await payload.create({
      collection: 'notifications',
      data: {
        ...(template && { template: template.id }),
        category: 'learning',
        title: `🎓 Welcome to ${course.title}!`,
        body: `You have been successfully enrolled in ${course.title}. Start learning now!`,
        metadata: {
          enrollmentId: newEnrollment.id,
          courseId: course.id,
          courseName: course.title,
          enrollmentType: newEnrollment.enrollmentType,
        },
        sourceType: 'enrollment',
        sourceId: String(newEnrollment.id),
        origin: 'automatic',
        audienceType: 'specific-users',
        status: 'sent',
      },
    })
    
    // 5. Create per-user notification (for bell icon)
    await payload.create({
      collection: 'user-notifications',
      data: {
        user: userId,
        notification: notification.id,
        category: 'learning',
        title: `🎓 Welcome to ${course.title}!`,
        body: `You have been successfully enrolled in ${course.title}. Start learning now!`,
        link: `/portal/courses/${course.id}`,
        metadata: {
          enrollmentId: newEnrollment.id,
          courseId: course.id,
          courseName: course.title,
        },
        channel: 'in-app',
        deliveredAt: new Date().toISOString(),
      },
    })
    
    console.log(`[Notification] Enrollment notification created for user ${userId}, course ${course.title}`)
  }
} catch (notifyError) {
  // Log error but don't fail the enrollment
  console.error('[Notification] Failed to create enrollment notification:', notifyError)
}
// ─────────────────────────────────────────────────────────────

return NextResponse.json(newEnrollment, { status: 201 })
```

### Phase 3: Create Notification Bell Component (apps/web)

**New File:** `apps/web/src/components/NotificationBell.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

interface UserNotification {
  id: string;
  title: string;
  body: string;
  link?: string;
  readAt?: string;
  deliveredAt: string;
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api').replace(/\/api$/, '');

export function NotificationBell() {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Get current user
      const userRes = await fetch(`${API_BASE_URL}/api/users/me`, {
        credentials: 'include',
      });
      
      if (!userRes.ok) return;
      
      const userData = await userRes.json();
      const userId = userData.user?.id;
      
      if (!userId) return;

      // Fetch unread count
      const countRes = await fetch(
        `${API_BASE_URL}/api/user-notifications?where[user][equals]=${userId}&where[readAt][exists]=false&limit=0`,
        { credentials: 'include' }
      );
      
      if (countRes.ok) {
        const countData = await countRes.json();
        setUnreadCount(countData.totalDocs || 0);
      }

      // Fetch recent notifications
      const notifRes = await fetch(
        `${API_BASE_URL}/api/user-notifications?where[user][equals]=${userId}&sort=-deliveredAt&limit=10`,
        { credentials: 'include' }
      );
      
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData.docs || []);
      }
    } catch (error) {
      console.error('[NotificationBell] Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/user-notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          readAt: new Date().toISOString(),
        }),
      });
      
      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, readAt: new Date().toISOString() } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('[NotificationBell] Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.readAt);
      
      await Promise.all(
        unreadNotifications.map(n =>
          fetch(`${API_BASE_URL}/api/user-notifications/${n.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              readAt: new Date().toISOString(),
            }),
          })
        )
      );
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('[NotificationBell] Error marking all as read:', error);
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications yet
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.readAt ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    if (!notification.readAt) {
                      markAsRead(notification.id);
                    }
                    if (notification.link) {
                      window.location.href = notification.link;
                    }
                  }}
                >
                  <h4 className="font-medium text-sm text-gray-800 mb-1">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {notification.body}
                  </p>
                  <span className="text-xs text-gray-400">
                    {new Date(notification.deliveredAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

### Phase 4: Add Bell to Portal Header

**File:** `apps/web/src/components/PortalHeader.tsx` (or create if doesn't exist)

```typescript
import { NotificationBell } from './NotificationBell';

export function PortalHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      <h1 className="text-xl font-bold">Grandline Maritime Portal</h1>
      
      <div className="flex items-center gap-4">
        <NotificationBell />
        {/* ... other header items */}
      </div>
    </header>
  );
}
```

Or add directly to `apps/web/src/app/portal/dashboard/page.tsx`:

```typescript
import { NotificationBell } from '@/components/NotificationBell';

// In the return JSX, add to the header area:
<div className="flex items-center justify-between mb-8">
  <h1 className="text-2xl font-bold">Welcome back, {user?.firstName}</h1>
  <NotificationBell />
</div>
```

## Testing Checklist

### Backend Testing

| Test Case | Expected Result |
|-----------|-----------------|
| Enroll trainee via API | Enrollment created + notification created |
| Check `notifications` collection | Record exists with `sourceType: 'enrollment'` |
| Check `user-notifications` collection | Record exists for trainee's user ID |
| Duplicate enrollment check | Enrollment rejected, no duplicate notification |
| Notification creation failure | Enrollment still succeeds (non-blocking) |

### Frontend Testing

| Test Case | Expected Result |
|-----------|-----------------|
| Load dashboard with no notifications | Bell shows "0", empty dropdown |
| Load dashboard with unread notifications | Bell shows badge with count |
| Click notification | Marks as read, navigates to course |
| Click "Mark all as read" | All notifications marked read, badge disappears |
| New enrollment via API | Badge count increases on next poll |

## Migration Script (Optional)

For existing enrollments, you may want to backfill notifications:

```typescript
// scripts/backfill-enrollment-notifications.ts
import { getPayload } from 'payload';
import config from '../apps/cms/src/payload.config';

async function backfill() {
  const payload = await getPayload({ config });
  
  // Get all active enrollments
  const enrollments = await payload.find({
    collection: 'course-enrollments',
    where: { status: { equals: 'active' } },
    limit: 1000,
  });
  
  for (const enrollment of enrollments.docs) {
    // Check if notification already exists
    const existing = await payload.find({
      collection: 'notifications',
      where: {
        sourceType: { equals: 'enrollment' },
        sourceId: { equals: String(enrollment.id) },
      },
      limit: 1,
    });
    
    if (existing.totalDocs === 0) {
      // Create notification (same logic as Phase 2)
      console.log(`Creating notification for enrollment ${enrollment.id}`);
      // ... notification creation code
    }
  }
}

backfill().catch(console.error);
```

## Files to Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `apps/cms/src/app/api/lms/enrollments/route.ts` | Modify | Add notification creation after enrollment |
| `apps/web/src/components/NotificationBell.tsx` | Create | New notification bell component |
| `apps/web/src/app/portal/dashboard/page.tsx` | Modify | Add NotificationBell to header |
| CMS Admin (manual) | Create | Add `COURSE_ENROLLED` notification template |

## Summary

| Aspect | Implementation |
|--------|----------------|
| **Trigger Point** | `POST /api/lms/enrollments` - after successful creation |
| **Notification Type** | Course enrollment only (status = 'active') |
| **User Resolution** | `enrollment.student` → `trainee.user` → `user.id` |
| **Channels** | In-app only (email can be added later via template) |
| **Failure Handling** | Non-blocking - enrollment succeeds even if notification fails |
| **Frontend** | Bell icon with badge + dropdown list |
| **Backend Collections** | `notification-templates`, `notifications`, `user-notifications` |