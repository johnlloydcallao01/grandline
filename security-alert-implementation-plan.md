# Security Alert Implementation Plan

## Objective

Implement email-based security alerts for the existing `Notification Preferences -> Security Alerts` setting on `/portal/account?tab=Preferences`, using the existing Resend configuration in `apps/cms`, while keeping all secrets and security event detection on the server side.

The alerts should cover:

- failed login attempts / account lock situations
- password changes

## Official Documentation Reviewed

### Payload CMS

- Auth overview: https://payloadcms.com/docs/authentication/overview
- Auth operations: https://payloadcms.com/docs/authentication/operations
- Collection hooks, including auth hooks: https://github.com/payloadcms/payload/blob/main/docs/hooks/collections.mdx

Relevant takeaways:

- Payload auth collections support `maxLoginAttempts` and `lockTime`.
- Payload exposes built-in auth operations such as `login`, `forgot-password`, `reset-password`, and `refresh-token`.
- Payload supports auth lifecycle hooks such as `beforeLogin` and `afterLogin`.
- Payload Local API supports `payload.login(...)`, which makes a custom backend-owned login wrapper feasible.

### Resend

- API introduction: https://www.resend.com/docs/api-reference/introduction
- Send email API: https://resend.com/docs/api-reference/emails/send-email

Relevant takeaways:

- Resend API calls require server-side auth with `Authorization: Bearer <key>`.
- Direct HTTP requests should include an explicit `User-Agent` header.
- The send-email API supports `tags` and `Idempotency-Key`, which are useful for security emails and duplicate protection.

## Current-State Analysis

### `apps/web` login flow

Current trainee sign-in flow:

1. `apps/web/src/app/(auth)/signin/page.tsx`
2. `apps/web/src/hooks/useAuth.ts`
3. `apps/web/src/contexts/AuthContext.tsx`
4. `apps/web/src/lib/auth.ts`
5. `apps/web/src/app/actions/auth.ts`
6. `POST ${NEXT_PUBLIC_API_URL}/users/login`

Important details:

- `serverLogin` in `apps/web/src/app/actions/auth.ts` directly calls `POST /users/login`.
- The web app then stores the returned token inside its own `grandline-web-token` HTTP-only cookie.
- Role filtering for trainee access happens in `apps/web` after the CMS login returns successfully.
- This means the backend does not currently own the full trainee-portal login policy or event fanout for login alerts.

### `apps/web` forgot/reset password flow

Current flow:

- `apps/web/src/app/(auth)/signin/forgot-password/page.tsx` calls `POST /forgot-password`
- `apps/web/src/app/(auth)/signin/reset-password/page.tsx` calls `POST /reset-password`

These are custom CMS endpoints defined in:

- `apps/cms/src/payload.config.ts`

Important details:

- `/forgot-password` already creates a reset token and sends an email via Resend.
- `/reset-password` already updates the password and sends a password-changed email via Resend.
- This is already server-owned and is the correct architectural side for security email sending.

### `apps/web` authenticated password change flow

There is a second password-change path that does not use `/reset-password`:

- `apps/web/src/app/portal/account/page.tsx`
- `apps/web/src/app/actions/user.ts`
- `PATCH /users/:id`

Important details:

- In the Account Profile form, if `profileData.password` is set, the web app sends `password` in `updateUserProfile(...)`.
- This means users can change their password while logged in through a normal user update request.
- Today, this path does not appear to send a security email.
- Because of this, implementing password-change alerts only inside `/reset-password` is incomplete.

### `apps/web` notification preferences UI

In `apps/web/src/app/portal/account/page.tsx`, the Preferences tab already contains:

- `Security Alerts`
- `Login attempts and password changes`

Important details:

- The `security` toggle is currently UI-only and disabled.
- Current local state defaults to `security: true`.
- This strongly suggests the product already intends the setting to exist, but persistence and backend behavior are not wired yet.

### `apps/cms` auth configuration

In `apps/cms/src/collections/Users.ts`:

- `auth.maxLoginAttempts = 5`
- `auth.lockTime = 600 * 1000`
- `auth.tokenExpiration = 30 days`

Important details:

- Payload already tracks login attempt counters and account lock state.
- The `users` auth collection is the natural source of truth for security-alert triggers.

### `apps/cms` audit/logging primitives that already exist

There are already useful building blocks:

- `apps/cms/src/utils/auth-logger.ts`
- `apps/cms/src/collections/UserEvents.ts`

Important details:

- `auth-logger.ts` already has structured methods for login success/failure and refresh events.
- `UserEvents` already defines `LOGIN_SUCCESS`, `LOGIN_FAILED`, and `PASSWORD_CHANGED`.
- Current repo search did not show active writes to `user-events` for these auth events.
- So the audit model exists, but it is not yet connected to the actual auth flows.

### `apps/cms` Resend setup

Current email sending is already using env vars in `apps/cms`:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `ENABLE_EMAIL_NOTIFICATIONS`
- `EMAIL_FROM_NAME`
- `EMAIL_REPLY_TO`

Important details:

- `apps/cms/package.json` does not currently include the official `resend` SDK.
- Existing code uses raw `fetch('https://api.resend.com/emails', ...)`.
- That is acceptable, but it should be hardened to match the official docs more closely.

## Key Gaps

### Gap 1: Password change alerting is split across two different flows

Today:

- reset-password flow sends a password-changed email
- authenticated profile-password update flow does not

Result:

- users are not consistently alerted for all password changes

### Gap 2: Failed login attempt alerting is not backend-owned

Today:

- trainee sign-in goes directly from `apps/web` to Payload's built-in `/users/login`
- there is no custom CMS wrapper around failed trainee login attempts
- `afterLogin` can help for successful logins, but not for failed credential attempts

Result:

- the exact event described by `Security Alerts -> Login attempts` does not have a complete server-controlled hook point yet

### Gap 3: Security preference is not persisted

Today:

- the UI shows a security toggle
- there is no persisted `users` field controlling whether security emails should be sent

Result:

- there is no trustworthy user preference to read during backend alert sending

### Gap 4: Audit collection exists but is not being used

Today:

- `user-events` supports security event types
- current auth flows do not appear to record them

Result:

- there is no durable audit trail for later troubleshooting or admin review

### Gap 5: Existing Resend usage should be centralized

Today:

- Resend logic is duplicated inline in `payload.config.ts`

Risks:

- inconsistent headers / payload structure
- duplicated HTML building
- harder retry and idempotency handling
- possible missed explicit `User-Agent` header expected by official docs for direct HTTP requests

## Recommended Architecture

### System of record

Use `apps/cms` as the sole backend owner for:

- security event detection
- security audit persistence
- security email delivery through Resend

The frontend should only do two things:

- allow the user to turn the preference on or off
- call backend-owned auth/password endpoints as it already does

### Preference model

Add a persisted user field in `apps/cms/src/collections/Users.ts`.

Recommended first version:

- `securityAlertsEmailEnabled: boolean`

Why this field name:

- it is explicit about channel
- it avoids ambiguity with push / in-app
- it matches the current product question, which is email-based alerts
- it is consistent with the existing flat field `pushNotificationsEnabled`

Recommended default:

- `true`

Reason:

- the current UI placeholder is already checked
- security alerts are usually safer as opt-out than opt-in

## Trigger Strategy

### 1. Password changed

Recommended owner:

- `Users` collection hook in `apps/cms/src/collections/Users.ts`

Recommended hook:

- `afterChange`

Why:

- it covers both password-change paths:
  - custom `/reset-password`
  - authenticated `PATCH /users/:id`
- it centralizes logic so the email is not tied to only one endpoint

Recommended detection rule:

- on `operation === 'update'`
- detect whether `data.password` was provided in the incoming change

Why this is safer here than endpoint-only logic:

- the current profile page changes password through a generic user update
- both current flows already pass `password` into a user update operation

Important duplicate-prevention note:

- if password-changed email is moved into `Users.afterChange`, remove the inline password-changed email send currently inside `/reset-password`
- otherwise reset-password will trigger duplicate emails

### 2. Successful login

Recommended owner:

- `Users` collection auth hook

Recommended hook:

- `afterLogin`

Recommended uses:

- record `LOGIN_SUCCESS` in `user-events`
- update trusted metadata if needed
- optionally evaluate whether the login is suspicious

Recommendation on emailing:

- do not send an email on every successful login by default
- record the event always
- only send a login-success email later if you add a suspicious-login heuristic such as:
  - new device
  - new country
  - unusual IP change
  - login immediately after repeated failures

Reason:

- emailing on every successful login is noisy and trains users to ignore alerts
- the UI says `login attempts`, not `every login`

### 3. Failed login attempt

Recommended owner:

- a custom CMS endpoint dedicated to portal sign-in

Recommended new endpoint:

- `POST /portal-login`

Why a custom endpoint is needed:

- Payload's built-in `/users/login` gives you a clean success path, but failed-attempt alerting needs backend-owned logic around the login attempt
- `afterLogin` only helps after successful login
- the frontend should not be responsible for security alert emission

Recommended endpoint behavior:

1. accept `email` and `password`
2. look up the user by email if it exists
3. call `payload.login({ collection: 'users', data: { email, password } })`
4. on success:
   - enforce trainee-only access here, not only in `apps/web`
   - record `LOGIN_SUCCESS`
   - return the same response shape expected by the current web app
5. on failure for an existing account:
   - re-read the user to inspect updated `loginAttempts` / `lockUntil`
   - record `LOGIN_FAILED`
   - conditionally send a security email if rules are met
6. on failure for an unknown email:
   - do not reveal whether the account exists
   - do not send an email

Recommended email threshold policy:

- do not email on every single bad password attempt
- send only when:
  - the account becomes locked, or
  - login attempts reach a chosen threshold such as 3, or
  - repeated failures happen from a clearly unusual IP/device

Reason:

- avoids attacker-triggered email spam
- reduces alert fatigue
- still warns the real user when the situation becomes meaningful

## Email Delivery Design

### Centralize Resend sending in one helper

Create a reusable utility in `apps/cms`, for example:

- `apps/cms/src/utils/email/sendTransactionalEmail.ts`
- or `apps/cms/src/utils/resend.ts`

Responsibilities:

- load env vars
- enforce `ENABLE_EMAIL_NOTIFICATIONS`
- send the request to Resend
- include explicit `User-Agent`
- support `tags`
- support optional `Idempotency-Key`
- parse and log response safely

Recommended implementation style for this repo:

- keep using `fetch` for now, since the repo already uses it and the `resend` SDK is not currently installed

Recommended request hardening:

- add `User-Agent: grandline-cms/1.0`
- add tags such as:
  - `category=security-alert`
  - `event=password-changed`
  - `event=login-failed`
- use an `Idempotency-Key` for retry-safe sends when appropriate

### Email content recommendations

Password-changed email should include:

- timestamp
- IP address if available
- browser / device if available
- a support/contact instruction if the user did not make the change

Failed-login alert email should include:

- number of failed attempts or lock status
- timestamp
- IP address if available
- browser / device if available
- what the user should do next

Do not include:

- passwords
- reset tokens
- sensitive auth internals

## Audit Trail Design

Use the existing `user-events` collection as the durable audit log.

Recommended helper:

- `recordUserSecurityEvent(...)`

Suggested event payload shape in `eventData`:

- `requestId`
- `source`
- `channel`
- `ipAddress`
- `userAgent`
- `attemptCount`
- `lockUntil`
- `sentEmail`
- `resendEmailId`
- `preferenceEnabled`

Recommended `source` values:

- `portal-login`
- `forgot-password`
- `reset-password`
- `profile-password-change`

## Detailed Implementation Plan

### Phase 1: Add user preference field

Changes:

- update `apps/cms/src/collections/Users.ts`
- add `securityAlertsEmailEnabled` with default `true`
- generate and run a migration for the schema update

Frontend follow-up:

- update `apps/web/src/types/auth.ts`
- hydrate the existing `notifications.security` value from the user record
- make the security toggle functional instead of disabled
- update label copy to something explicit such as:
  - `Email me about failed login attempts and password changes`

### Phase 2: Create centralized security email utility

Changes:

- add a reusable email helper in `apps/cms/src/utils/...`
- move repeated Resend request logic out of `payload.config.ts`

Refactor existing flows to use the helper:

- forgot-password email
- password-changed email
- new security alert emails

### Phase 3: Create shared audit/event helper

Changes:

- add a helper that writes into `user-events`
- optionally reuse `auth-logger.ts` for structured console logging

Why now:

- every subsequent auth action can write a consistent audit record

### Phase 4: Centralize password-changed alert in `Users.afterChange`

Changes:

- add `afterChange` hook to `apps/cms/src/collections/Users.ts`
- detect password changes via incoming update data
- create `PASSWORD_CHANGED` event
- send security email only if `securityAlertsEmailEnabled !== false`

Important cleanup:

- remove the inline password-changed email send from `/reset-password`
- let the hook own password-change alerts for both reset and authenticated profile updates

### Phase 5: Add custom portal login endpoint in `apps/cms`

Changes:

- create a new custom endpoint in `apps/cms/src/payload.config.ts` or a dedicated endpoint module
- implement `POST /portal-login`
- use `payload.login(...)` internally

Recommended logic:

- success:
  - allow only `trainee`
  - record `LOGIN_SUCCESS`
  - return user + token in the same shape expected by `apps/web`
- failure:
  - if matching user exists, record `LOGIN_FAILED`
  - only send email when threshold or lock policy is met
  - keep generic error responses

### Phase 6: Point `apps/web` sign-in to the new backend endpoint

Changes:

- update `apps/web/src/app/actions/auth.ts`
- replace direct call to `/users/login` with `/portal-login`

Benefits:

- failed-attempt detection becomes backend-owned
- trainee-only role enforcement moves to the correct side
- email alerts and audit logging happen in one place

### Phase 7: Wire the UI toggle to the persisted field

Changes:

- update `apps/web/src/app/portal/account/page.tsx`
- load `securityAlertsEmailEnabled`
- allow save via `updateUserProfile(...)`

Expected UX:

- toggle on: password-change and eligible failed-login alerts can email the user
- toggle off: no security email is sent, but audit records still persist

### Phase 8: Verification and regression checks

Must verify:

- forgot-password still sends reset email
- reset-password still works
- authenticated profile password change still works
- only one password-changed email is sent per password update
- failed login attempts still increment `loginAttempts`
- account lock behavior still matches Payload config
- no email is sent for nonexistent email addresses
- no account existence leakage appears in responses
- trainee sign-in still works
- non-trainee portal sign-in is denied cleanly

## Important Implementation Decisions

### Decision 1: Backend, not frontend

Security alerts must be triggered only in `apps/cms`.

Reason:

- the backend owns secrets
- the backend sees the real auth result
- the backend can inspect `loginAttempts`, `lockUntil`, IP, and user agent
- the frontend can be bypassed and should not be trusted for alert emission

### Decision 2: Do not email on every successful login

Recommended:

- audit all successful logins
- email only on suspicious-success cases later, if needed

Reason:

- better user experience
- fewer noisy emails
- more trust in the alerts that do arrive

### Decision 3: Email failed attempts only at meaningful thresholds

Recommended:

- threshold or lock-based alerts instead of every failure

Reason:

- protects against email spam attacks
- keeps alerts actionable

### Decision 4: Use one password-change alert pipeline

Recommended:

- centralize in `Users.afterChange`

Reason:

- catches both existing password-change paths
- avoids forgetting one code path
- prevents drift between reset and profile-update behavior

## Risks and Mitigations

### Risk: Duplicate password-changed emails

Cause:

- sending from both `/reset-password` and `Users.afterChange`

Mitigation:

- remove endpoint-specific password-changed email after hook-based implementation is in place

### Risk: Email spam from attacker-triggered failed attempts

Cause:

- emailing on every bad password attempt

Mitigation:

- only send on threshold / lock / suspicious pattern

### Risk: Login failure handling leaks whether an account exists

Cause:

- different error messages or email behavior

Mitigation:

- keep generic response text
- never send alert for unknown email addresses

### Risk: Missing Resend request headers / inconsistent delivery behavior

Cause:

- raw `fetch` implementation duplicated in multiple places

Mitigation:

- centralize sending helper
- explicitly include `User-Agent`
- log Resend response IDs

### Risk: IP parsing is inaccurate behind proxies

Cause:

- `x-forwarded-for` may contain multiple comma-separated IPs

Mitigation:

- normalize and store the first trusted client IP in helper logic

## Recommended Final Shape

### Backend ownership

- `apps/cms` owns all security-event detection and all security emails

### Event sources

- password change: `Users.afterChange`
- successful login: `Users.afterLogin`
- failed login attempts: new `POST /portal-login` endpoint

### User preference

- `users.securityAlertsEmailEnabled`

### Audit trail

- `user-events` collection

### Email sender

- centralized Resend helper in `apps/cms`

## Minimum Safe Rollout Order

1. add `securityAlertsEmailEnabled` field and migration
2. add centralized Resend helper
3. add `user-events` write helper
4. move password-changed alert into `Users.afterChange`
5. remove duplicate reset-password confirmation email
6. add custom `POST /portal-login`
7. switch `apps/web` sign-in to the new endpoint
8. wire the Preferences toggle to the persisted user field
9. run focused regression tests on login, lockout, forgot-password, reset-password, and profile password update

## Summary Recommendation

The safest implementation is:

- keep email sending in `apps/cms`
- persist a real `securityAlertsEmailEnabled` user preference
- centralize password-change alerts in the `Users` collection hook so both existing password-change flows are covered
- create a custom `POST /portal-login` endpoint so failed login attempts can be recorded and, when appropriate, emailed using Resend
- use the existing `user-events` collection for durable audit history

This approach matches the current architecture, reuses your existing Resend env setup, avoids frontend-owned security logic, and closes the biggest current gap: login-attempt alerts are not fully implementable until login is wrapped by a backend-owned CMS endpoint.
