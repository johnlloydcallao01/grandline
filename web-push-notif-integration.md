# Web Push Notification Integration Plan

## Objective

Add browser web push notifications to the existing notification system without breaking or weakening the current real-time in-app bell notification flow.

The final result should be:

1. Existing bell notification keeps working exactly as it does today.
2. Supabase realtime keeps driving the instant bell increment and inbox refresh.
3. Web push becomes an additional delivery channel for the same underlying notification event.
4. Failure in web push must never prevent the existing in-app notification from being created.

## Core Safety Rule

The current notification system must remain the source of truth.

That means:

- `notifications` remains the logical notification event.
- `user-notifications` remains the per-user inbox/bell record.
- Supabase realtime remains the mechanism for instant in-app bell updates.
- Web push must be implemented as a second delivery channel that consumes the same event.

Web push must not replace:

- `readAt`
- `seenAt`
- `unreadCount`
- `unseenCount`
- Supabase broadcast
- current bell click behavior

## Current System Analysis

### CMS data model

Current CMS collections already define a good multi-channel notification foundation:

- `apps/cms/src/collections/Notifications.ts`
  - logical notification event
  - stores category, title, body, metadata, sourceType, sourceId, origin, audienceType, status

- `apps/cms/src/collections/UserNotifications.ts`
  - per-user delivery/inbox record
  - stores `user`, `notification`, `category`, `title`, `body`, `link`, `metadata`
  - stores current inbox state:
    - `readAt`
    - `seenAt`
    - `deliveredAt`
    - `channel`
  - already allows `channel: 'push'`

- `apps/cms/src/collections/NotificationTemplates.ts`
  - already supports channels:
    - `in-app`
    - `email`
    - `push`

This means the schema concept is already aligned with multi-channel delivery.

### Existing enrollment notification flow

Current working flow for course enrollment notifications:

1. Enrollment is created.
2. CMS creates a logical notification record in `notifications`.
3. CMS creates a per-user record in `user-notifications` with `channel: 'in-app'`.
4. CMS broadcasts a realtime event through Supabase.
5. Web app receives the realtime event and updates the bell immediately.

Relevant code:

- `apps/cms/src/collections/CourseEnrollments.ts`
  - creates `notifications`
  - creates `user-notifications`
  - calls `broadcastNotification(...)`

- `apps/cms/src/utils/supabaseNotifications.ts`
  - publishes to `notifications:user:{userId}`

- `apps/web/src/contexts/NotificationsContext.tsx`
  - fetches notifications from `/api/notifications`
  - subscribes to Supabase realtime
  - updates local `notifications`, `unreadCount`, `unseenCount`

- `apps/web/src/components/notifications/NotificationBell.tsx`
  - badge is driven by `unseenCount`
  - clicking bell triggers `markAllAsSeen()`
  - clicking bell does not mark notifications as read

### Current bell logic that must be preserved

The current logic is good and must remain untouched:

- bell count is based on `seenAt`, not `readAt`
- clicking the bell marks notifications as seen
- notifications can remain unread after the bell has been clicked
- realtime updates are currently handled by Supabase broadcast

This behavior is implemented primarily in:

- `apps/web/src/contexts/NotificationsContext.tsx`
- `apps/web/src/components/notifications/NotificationBell.tsx`
- `apps/web/src/app/api/notifications/mark-seen/route.ts`

### Important risk already present

Enrollment notifications are currently created in two places:

- `apps/cms/src/collections/CourseEnrollments.ts`
- `apps/cms/src/app/api/lms/enrollments/route.ts`

This is the highest-risk area for adding web push because it can lead to:

- duplicate `notifications`
- duplicate `user-notifications`
- duplicate web push sends
- inconsistent behavior depending on which enrollment path is used

Before adding web push, notification fan-out for enrollment must be centralized into one authoritative path.

## Current Web App Gaps

The web app currently has no real web push implementation.

Confirmed missing pieces:

- no service worker registration for push
- no web push subscription flow
- no manifest for PWA/home-screen install behavior
- no push subscription storage
- no push send service
- no server endpoint to subscribe/unsubscribe browsers

The web app only has:

- feature flags for PWA/service worker in `apps/web/src/lib/env.ts`
- a local UI toggle for "Push Notifications" in `apps/web/src/app/portal/account/page.tsx`
  - this is currently only local component state
  - it is not persisted
  - it does not actually enable or disable browser push

## Integration Strategy

## Principle

Use the existing notification system as the canonical event pipeline, then add web push as an optional delivery fan-out.

Desired event flow:

1. Enrollment happens.
2. Existing notification record is created.
3. Existing per-user inbox record is created.
4. Existing Supabase realtime broadcast fires.
5. Existing bell increments in real time.
6. New web push delivery is attempted for subscribed browsers/devices.

This means:

- bell and inbox remain authoritative
- push is only an extra alert
- if push fails, bell still works
- if there is no subscription, bell still works

## What must not happen

Do not:

- replace Supabase realtime with push
- drive bell state from service worker state
- mark `seenAt` because a push was delivered
- mark `readAt` because a push was clicked
- let push delivery failure interrupt notification creation
- send push from multiple code paths
- directly tie push permission to current unread/seen logic

## Safe Architecture

### Source of truth

Source of truth remains:

- `notifications`
- `user-notifications`

### Delivery channels

Channels become:

- `in-app`
  - current bell/inbox
  - current Supabase realtime broadcast

- `push`
  - browser push subscription delivery
  - independent from in-app state mutation

### Responsibilities

CMS responsibilities:

- create notification events
- create user inbox records
- look up active web push subscriptions
- queue or send push safely
- record push delivery result without affecting in-app success

Web app responsibilities:

- register service worker
- request browser permission on user action
- create browser push subscription
- send subscription to backend
- display push notification via service worker
- navigate user to the relevant route on notification click

## Implementation Phases

## Phase 1: Stabilize the notification event source

### Goal

Ensure there is only one authoritative place where enrollment notifications fan out.

### Work

1. Review both current enrollment notification creation paths:
   - `apps/cms/src/collections/CourseEnrollments.ts`
   - `apps/cms/src/app/api/lms/enrollments/route.ts`

2. Choose one authoritative path for notification creation.
   Recommended:
   - keep notification fan-out in the collection hook layer, because it is closest to the data write and applies consistently regardless of caller

3. Remove duplicated notification creation logic from the secondary path.

### Why this phase matters

If this is not fixed first, web push risks:

- double-sending on enrollment
- drifting from the bell logic
- creating hard-to-debug production issues

## Phase 2: Add persistent browser push subscription storage

### Goal

Store which user/browser/device combinations can receive push.

### New collection recommendation

Add a new CMS collection, for example:

- `web-push-subscriptions`

Recommended fields:

- `user`
  - relationship to `users`
  - required

- `endpoint`
  - text
  - required
  - unique or effectively unique

- `p256dh`
  - text
  - required

- `auth`
  - text
  - required

- `userAgent`
  - text

- `platform`
  - text

- `browser`
  - text

- `deviceLabel`
  - text

- `isActive`
  - checkbox
  - default `true`

- `lastSeenAt`
  - date

- `lastSubscribedAt`
  - date

- `lastSuccessAt`
  - date

- `lastFailureAt`
  - date

- `failureReason`
  - text or textarea

- `permissionState`
  - select
  - values like `default`, `granted`, `denied`

- `subscriptionJson`
  - json
  - optional full raw backup of the browser subscription

### Access rules

Recommended access:

- user can create/read/update only their own subscription records
- admin/service can manage all

### Why separate subscription storage is required

Push subscriptions are browser/device-specific and are not the same thing as inbox notifications.

They must not be stored inside `user-notifications`.

## Phase 3: Add web push sending infrastructure on the server

### Goal

Add a safe server-side sender that can send push to subscribed users.

### Recommended approach

Use standards-based web push with VAPID.

Recommended server library:

- `web-push`

### New server module

Add a dedicated CMS utility/service, for example:

- `apps/cms/src/utils/webPush.ts`

Responsibilities:

- initialize VAPID keys from environment
- build push payload
- send push to one subscription
- handle common delivery errors
- mark expired subscriptions inactive
- never throw fatal errors that break in-app notification creation

### Environment variables

Add server-side env variables for CMS:

- `WEB_PUSH_VAPID_PUBLIC_KEY`
- `WEB_PUSH_VAPID_PRIVATE_KEY`
- `WEB_PUSH_VAPID_SUBJECT`

Notes:

- public key is exposed to the browser
- private key is server-only
- subject should be a valid `mailto:` or URL

### Failure handling policy

Push send failures must be non-fatal.

Rules:

- if push send succeeds:
  - optionally record `lastSuccessAt`

- if push send returns expired/invalid subscription:
  - mark subscription inactive

- if push send fails transiently:
  - log it
  - do not fail the main enrollment notification flow

## Phase 4: Add subscription management APIs in the web app or CMS

### Goal

Allow authenticated users to register and remove browser subscriptions safely.

### Required endpoints

Add endpoints for:

- subscribe current browser/device
- unsubscribe current browser/device
- optionally list current subscriptions for debugging/admin

Possible location:

- `apps/web/src/app/api/push/subscribe/route.ts`
- `apps/web/src/app/api/push/unsubscribe/route.ts`

or directly in CMS if preferred.

Recommended behavior:

- require authenticated user
- deduplicate by endpoint
- update existing record if the same endpoint already exists
- set `isActive = true` on resubscribe

### Why this should be separate

Subscription lifecycle is not the same as notification creation.

This should be its own feature boundary.

## Phase 5: Add service worker and browser subscription flow in the web app

### Goal

Allow supported browsers to receive push notifications.

### New frontend pieces

Add:

- service worker file at the web app public root
- client helper for registration and subscription
- explicit user action to enable push

### Required components

1. Service worker
   Example location:
   - `apps/web/public/sw.js`

   Responsibilities:
   - listen for `push`
   - call `showNotification(...)`
   - handle `notificationclick`
   - open the correct route

2. Client-side push helper
   Example location:
   - `apps/web/src/lib/push.ts`

   Responsibilities:
   - register service worker
   - request permission only after user gesture
   - subscribe through `registration.pushManager.subscribe(...)`
   - send subscription to backend
   - unsubscribe when disabled

3. UI integration
   Best place:
   - existing notification preferences area in `apps/web/src/app/portal/account/page.tsx`

### Important behavior rules

- permission request must be triggered by a user click
- do not auto-prompt on page load
- if permission is denied, do not affect the bell system
- if service worker registration fails, do not affect the bell system

## Phase 6: Connect web push to the existing notification event

### Goal

When a new notification is created for a user, optionally send web push too.

### Recommended trigger point

After successful creation of:

- `notifications`
- `user-notifications`

and after the current realtime broadcast remains intact.

Recommended sequence:

1. Create `notifications` event.
2. Create `user-notifications` inbox record for `in-app`.
3. Broadcast via Supabase realtime.
4. Look up active push subscriptions for the user.
5. Send web push.
6. Record delivery success/failure if desired.

### Why this order is safest

It preserves the current system.

Even if step 4 or 5 fails, the existing bell behavior is already complete.

### Should a separate `user-notifications` record be created for push?

Recommended answer:

- keep the existing `user-notifications` inbox record as the canonical per-user notification
- do not create a second duplicate inbox record just because push was sent

If delivery tracking is needed, use one of these:

Option A:
- extend `user-notifications` with optional push delivery metadata

Option B:
- add a separate `notification-deliveries` collection

Safer long-term recommendation:

- add a dedicated `notification-deliveries` collection if detailed channel auditing is needed

Suggested fields:

- `userNotification`
- `channel`
- `status`
- `attemptedAt`
- `deliveredAt`
- `failureReason`
- `subscription`

This avoids polluting inbox semantics.

## Phase 7: Preserve the current bell and seen logic exactly

### Non-negotiable rules

Web push must not change current bell semantics.

Specifically:

- do not update `seenAt` when a push is delivered
- do not update `readAt` when a push is delivered
- do not zero the bell badge when a push is clicked
- do not make the service worker the source of unread state

### Correct behavior

If a user receives a push and later opens the app:

- the bell still reflects the actual persisted `seenAt` state
- the inbox still reflects the persisted `readAt` state
- current behavior remains unchanged

## Phase 8: Make push clicks open the correct existing destination

### Goal

Reuse the same navigation target as the current in-app notification.

Current notification flow already stores useful target data in:

- `link`
- `metadata.enrollmentId`

The service worker should open the same destination the in-app notification would take the user to.

For enrollment notifications:

- prefer `/portal/account/enrollments/{enrollmentId}`

This keeps the push channel aligned with the bell/inbox channel.

## Phase 9: Add user-facing opt-in and preference persistence

### Goal

Turn the current local UI toggle into a real preference and browser subscription control.

### Current state

`apps/web/src/app/portal/account/page.tsx` contains a "Push Notifications" toggle, but it is only local state.

### Recommended enhancement

Separate two concepts:

1. browser permission/subscription state
2. user preference for whether this app should send push notifications

Recommended user-level preference storage:

- add fields to `users` or a separate preferences collection

Possible fields:

- `notificationPreferences.pushEnabled`
- `notificationPreferences.marketingEnabled`
- `notificationPreferences.securityEnabled`

### Important distinction

A user preference of "enabled" does not guarantee push can be sent.
The browser must also have an active subscription.

Push send eligibility should require both:

- user preference enabled
- active browser subscription exists

## Phase 10: Testing and rollout

### Required regression checks for current system

Before implementation:

- verify enrollment still creates `notifications`
- verify enrollment still creates `user-notifications`
- verify bell increments in real time
- verify clicking bell still marks `seenAt`
- verify inbox read/unread still behaves correctly

After each phase:

- repeat those same checks

### New push checks

- user can enable push from an explicit UI action
- subscription is stored correctly
- enrollment sends push when subscription exists
- no push is sent when user has no subscription
- no duplicate pushes occur
- clicking push opens the correct route
- failed push does not interrupt bell behavior

### Rollout recommendation

Roll out in stages:

1. internal or admin-only testing
2. limited user rollout
3. production rollout after verifying no regression in bell behavior

## Detailed File-Level Plan

## CMS changes

### New

- add collection:
  - `apps/cms/src/collections/WebPushSubscriptions.ts`

- optionally add collection:
  - `apps/cms/src/collections/NotificationDeliveries.ts`

- add utility:
  - `apps/cms/src/utils/webPush.ts`

- add helper/service:
  - `apps/cms/src/utils/notificationFanout.ts`
  - recommended purpose:
    - centralize creation of `notifications`
    - centralize creation of `user-notifications`
    - centralize Supabase broadcast
    - centralize optional push send

### Update

- `apps/cms/src/payload.config.ts`
  - register new collections

- `apps/cms/src/collections/CourseEnrollments.ts`
  - keep or become the single source that triggers notification fan-out
  - do not change bell semantics

- `apps/cms/src/app/api/lms/enrollments/route.ts`
  - remove duplicate notification creation logic if collection hook is chosen as canonical

- `apps/cms/src/seeders/notification-templates.ts`
  - update `COURSE_ENROLLED` channels from `['in-app']`
  - likely to `['in-app', 'push']`

## Web app changes

### New

- `apps/web/public/sw.js`
- `apps/web/public/manifest.json`
- `apps/web/src/lib/push.ts`
- `apps/web/src/app/api/push/subscribe/route.ts`
- `apps/web/src/app/api/push/unsubscribe/route.ts`

### Update

- `apps/web/src/app/layout.tsx`
  - include manifest link if needed

- `apps/web/src/app/portal/account/page.tsx`
  - turn current local push toggle into real subscription management UI

- optionally `apps/web/src/lib/env.ts` and `packages/env/src/index.ts`
  - add any new public env keys required by the frontend

## Preservation Checklist

The implementation is only acceptable if all of the following remain true:

- current Supabase realtime channel remains in place
- current bell badge still uses `seenAt`
- current bell click still triggers mark-seen only
- current notification fetch API still works
- current NotificationsContext state model still works
- existing enrollment notification still appears in the in-app inbox
- push sending cannot block the in-app flow
- duplicate enrollment notification creation path is eliminated

## Recommended Order of Work

1. Confirm canonical enrollment notification source.
2. Remove duplicate notification creation path.
3. Add push subscription storage collection.
4. Add VAPID env configuration and server-side push sender.
5. Add service worker and browser subscribe/unsubscribe flow.
6. Turn account preference toggle into real persisted preference.
7. Connect push sending to the canonical notification fan-out point.
8. Test regression on bell logic after each step.

## Recommended Acceptance Criteria

The feature is complete only when:

- enrolling a trainee in a course still creates the same in-app notification as before
- the bell increments in real time exactly as before
- clicking the bell still marks items as seen exactly as before
- a subscribed browser also receives a web push for the same enrollment event
- no duplicate notifications are created
- no duplicate push sends are triggered
- disabling or failing web push does not affect the existing notification system

## Final Recommendation

Implement web push as an additive layer on top of the existing notification event pipeline.

Do not redesign the current bell logic.

The safest architecture for this repository is:

- existing `notifications` + `user-notifications` stay canonical
- existing Supabase realtime stays responsible for live bell updates
- web push is attached after successful notification creation as a second delivery channel

That approach gives the new feature while preserving the current professional behavior that already works well.
