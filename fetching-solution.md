# Fetching Solution Guide

## Summary

The fix applied in this repository uses a **backend-mediated LMS aggregation pattern**.

Instead of letting the frontend fetch several raw CMS collections directly and then stitch everything together in the browser, we move that logic into a dedicated backend endpoint inside `apps/cms`, then let `apps/web` consume that single endpoint.

This is the main idea behind the fixes for:

- `/announcements`
- `/portal/announcements`
- `/portal/ask-instructor`
- related custom chat fetch fixes like `/portal/discussion-board`

---

## What This Pattern Is Called

You can think of it as:

- **Backend-mediated fetching**
- **Server-side aggregation**
- **BFF-style fetching** (Backend For Frontend)
- **LMS endpoint pattern**

In this codebase, the most practical name is:

**LMS backend aggregation endpoint**

Because the solution is:

1. create a dedicated endpoint in `apps/cms/src/app/api/lms/...`
2. let that endpoint resolve trainee context and relationships safely
3. let `apps/web` fetch only that prepared result

---

## Why The Old Approach Was Fragile

The previous fetching style had these characteristics:

1. the frontend or server action made multiple separate requests
2. it directly queried collections like `trainees`, `course-enrollments`, `announcements`, or `chats`
3. it depended on the caller using the correct auth header format
4. it depended on collection access rules behaving the same way everywhere
5. it rebuilt relationship logic repeatedly in different places
6. it often depended on client-only state like `localStorage`

That is fragile because even if each individual request is "correct", the chain as a whole can fail for many reasons:

- wrong auth header for a custom route
- collection access restrictions
- missing trainee lookup
- bad enrollment filtering
- inconsistent status assumptions
- browser-only auth state not available in the correct render path
- duplicated mapping logic drifting across pages

### Example Of The Fragile Pattern

The old flow often looked like this:

1. get token from `localStorage` or cookies
2. fetch `/users/me`
3. fetch `/trainees`
4. fetch `/course-enrollments`
5. extract course IDs
6. fetch `/announcements` or `/chat`
7. filter/map in the page

This means the page is responsible for both:

- data access
- business logic

That is exactly what makes it easy to break.

---

## What The New Pattern Does

The new pattern moves the business logic into a CMS endpoint.

### New Flow

1. `apps/web` gets the signed-in user on the server
2. `apps/web` calls one dedicated endpoint such as:
   - `/api/lms/announcements?userId=...`
   - `/api/lms/ask-instructor?userId=...`
3. `apps/cms` resolves the trainee internally
4. `apps/cms` loads enrollments, chats, announcements, instructors, or related entities
5. `apps/cms` applies the access strategy internally, including `overrideAccess: true` where appropriate
6. `apps/cms` returns a frontend-ready shape
7. `apps/web` renders that shape with minimal extra logic

So the frontend becomes a consumer, not a data orchestrator.

---

## Core Principle

### Rule

If a page needs trainee-scoped data that depends on multiple collections or special access behavior, **do not fetch raw collections directly from the page**.

Instead:

- create one backend endpoint that owns the query logic
- centralize relationship resolution there
- return a clean response shaped for the page

### Why This Is Better

- fewer moving parts in the frontend
- consistent auth behavior
- centralized business logic
- less duplication
- easier debugging
- safer handling of restricted collections
- easier future changes

---

## Architecture Principle

### Fragile Architecture

`apps/web page -> many raw CMS collection requests -> page merges data`

Problems:

- duplicated logic
- repeated trainee resolution
- repeated auth/header mistakes
- different pages can behave differently for the same domain data

### Stable Architecture

`apps/web page -> one LMS endpoint -> CMS aggregates domain data`

Benefits:

- one source of truth
- backend controls domain rules
- page gets ready-to-render data
- easier to test and maintain

---

## Concrete Examples In This Repo

### 1. Announcements

#### Old style

`apps/web` tried to:

- resolve the user
- resolve the trainee
- fetch enrollments
- derive course IDs
- fetch announcements collection directly

Why that broke:

- direct collection access path was weaker than the backend dashboard path
- enrollment filtering and access behavior could diverge
- the standalone page was not using the same source of truth as the working backend summary

#### New style

A dedicated endpoint was added:

- `apps/cms/src/app/api/lms/announcements/route.ts`

Now:

- CMS resolves trainee from `userId`
- CMS loads enrollments with backend access
- CMS fetches announcements with backend aggregation logic
- `apps/web` only calls that endpoint

### 2. Ask Instructor

#### Old style

The page directly used:

- `localStorage`
- client-side calls to `/api/chat`
- separate client logic for instructors and questions

Why that broke:

- client-only auth path is fragile
- custom chat endpoints are sensitive to auth header format
- topic list and instructor list were assembled in separate ways

#### New style

A dedicated endpoint was added:

- `apps/cms/src/app/api/lms/ask-instructor/route.ts`

Now the endpoint returns:

- enrolled instructors
- ask-instructor question summaries
- single-question summary when needed

And `apps/web` now reads through server actions instead of direct client orchestration.

### 3. Discussion Board

This was slightly different.

The main problem was not aggregation first, but **custom route auth mismatch**.

The custom `/api/chat` routes expected the standard `JWT` header path, while the page logic was using a collection-style auth format.

So the principle here is related:

- custom domain routes should be treated as backend APIs with their own contract
- do not assume raw collection auth format works everywhere

---

## Design Rules To Follow Going Forward

When adding or fixing data fetching in this repo, use these rules.

### Use A Dedicated LMS Endpoint When

Create a backend endpoint if the page needs any of the following:

- trainee resolution from `userId`
- multiple collections joined together
- filtering by enrollment relationships
- special access handling
- domain-level mapping or normalization
- reusable data for more than one page

### Keep The Frontend Thin

The page or server action should mostly do only this:

1. get the signed-in user
2. call one endpoint
3. render the result

Avoid putting domain stitching logic in the page.

### Put Domain Logic In CMS

The backend endpoint should own:

- trainee lookup
- enrollment lookup
- joining related collections
- status normalization
- sorting and filtering
- access-sensitive querying

### Use `overrideAccess: true` Carefully

This should be used in CMS backend endpoints when the endpoint itself is the safe boundary and must read data that the frontend should not query directly via raw collection access.

Important:

- use it in backend code, not in the browser
- use it only where the endpoint is intentionally acting as the controlled access layer

### Treat Custom Routes As Contracts

For routes like `/api/chat/...`, do not guess the auth behavior.

Always confirm:

- expected auth header format
- expected request body shape
- response shape

Do not assume collection REST behavior and custom route behavior are identical.

---

## Recommended Fetching Template

### In `apps/cms`

Create a route like:

```ts
// apps/cms/src/app/api/lms/example/route.ts
export async function GET(request: NextRequest) {
  const payload = await getPayload({ config: configPromise })
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  // 1. Resolve trainee
  // 2. Load related domain data
  // 3. Apply backend access strategy
  // 4. Return page-shaped JSON
}
```

### In `apps/web`

Use a server action or server component:

```ts
const user = await getServerUser()

if (!user) return []

const res = await fetch(`${API_BASE_URL}/lms/example?userId=${user.id}`, {
  cache: 'no-store',
})

const data = await res.json()
return data
```

### In The Page

The page should only:

- call the server action
- manage UI state
- render the returned data

---

## Anti-Patterns To Avoid

Avoid this in pages and client components:

- reading auth state from `localStorage` to build critical data queries
- chaining many collection fetches directly from the page
- duplicating trainee resolution logic in multiple features
- mixing raw collection access and custom route access for the same feature
- assuming `users JWT` and `JWT` are interchangeable everywhere
- filtering business-critical data only in the page if the backend should own that rule

---

## Debugging Checklist

If a page suddenly becomes blank again, check in this order:

1. Is the page using a dedicated LMS/backend endpoint, or is it stitching raw collections itself?
2. Is the endpoint resolving trainee context from `userId` correctly?
3. Is the backend query using the correct access strategy?
4. Is the page calling a custom route with the correct auth header format?
5. Is the response shape stable and already mapped for the UI?
6. Is the page depending on browser-only auth state that may be unavailable?

---

## Short Version

The fix is basically:

**Move complex trainee-scoped fetching out of the frontend and into a dedicated CMS backend endpoint, then let the frontend consume one prepared response.**

That is more stable than:

**Frontend -> many direct collection fetches -> manual stitching -> fragile auth and access behavior**

---

## Recommended Standard For This Repo

For trainee-facing features in this repository, prefer this standard:

1. `apps/cms/src/app/api/lms/...` owns the domain query
2. `apps/web` server actions call that endpoint
3. pages render the returned data
4. custom chat routes use their documented auth contract
5. raw collection fetching from pages should be avoided when the feature depends on multiple related entities or restricted access

This is the principle behind the fixes that were applied.
