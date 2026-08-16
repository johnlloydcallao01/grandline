# Backend-Mediated Fetching Guide (General Purpose)

## Summary

When a frontend feature needs data that depends on multiple related entities, auth context, or restricted access rules, do not let the frontend fetch raw data sources directly and stitch them together in the browser. Instead, move that orchestration into a dedicated backend endpoint that owns the query logic and returns one prepared, frontend-ready response.

The frontend becomes a consumer, not a data orchestrator.

---

## What This Pattern Is Called

Depending on your stack, you can call it any of:

- Backend-mediated fetching
- Server-side aggregation
- BFF-style fetching (Backend For Frontend)
- Gateway / API-composition pattern
- Domain endpoint pattern

The practical, stack-neutral name is:

**Backend domain aggregation endpoint**

The idea is always the same:

1. Create a dedicated backend endpoint for a feature.
2. Let that endpoint resolve user/tenant/relationship context safely.
3. Let the frontend fetch only that prepared result.

---

## Why The Old Approach Was Fragile

The previous style typically had these characteristics:

1. The page or its data layer made several separate requests.
2. It queried raw domain collections directly.
3. It depended on the caller using the correct auth format for each call.
4. It depended on access rules behaving identically everywhere.
5. It rebuilt relationship logic repeatedly in different places.
6. It sometimes relied on client-only state that isn't available in every render path.

Even when every individual request is "correct", the chain as a whole can fail for many reasons:

- wrong auth header for a custom route
- access restrictions on certain data sources
- missing or wrong context lookup (user, tenant, account)
- bad relationship/enrollment filtering
- inconsistent status or mapping assumptions
- browser-only auth state unavailable during server rendering
- duplicated mapping logic drifting across pages

### Example Of The Fragile Pattern

1. Get token from local storage or cookies.
2. Resolve the current user.
3. Resolve the related context record (e.g., member, account, student).
4. Fetch enrollment/relationship data.
5. Derive related entity IDs.
6. Fetch each dependent entity separately.
7. Filter, map, and merge everything inside the page.

The page ends up responsible for both data access and business logic — which is exactly what makes it easy to break.

---

## What The New Pattern Does

The new pattern moves the business logic into a backend endpoint.

### New Flow

1. The frontend resolves the signed-in user on the server.
2. The frontend calls one dedicated feature endpoint.
3. The backend resolves the user's context internally.
4. The backend loads all related entities.
5. The backend applies the access strategy internally, using elevated access only where the endpoint itself is the safe boundary.
6. The backend returns a clean, frontend-ready shape.
7. The frontend renders that shape with minimal extra logic.

---

## Core Principle

### Rule

If a page needs context-scoped data that depends on multiple data sources or special access behavior, do not fetch raw sources directly from the page.

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
- safer handling of restricted data sources
- easier future changes

---

## Architecture Principle

### Fragile Architecture

Frontend page → many raw data-source requests → page merges data

Problems:

- duplicated logic
- repeated context resolution
- repeated auth/header mistakes
- different pages can behave differently for the same domain data

### Stable Architecture

Frontend page → one domain endpoint → backend aggregates the data

Benefits:

- one source of truth
- backend controls domain rules
- page gets ready-to-render data
- easier to test and maintain

---

## Design Rules Going Forward

Use these rules whenever you add or fix data fetching.

### Use A Dedicated Domain Endpoint When

Create a backend endpoint if the page needs any of the following:

- context resolution from a user or tenant identifier
- multiple related data sources joined together
- filtering based on relationship membership
- special access handling
- domain-level mapping or normalization
- data that is reusable by more than one page

### Keep The Frontend Thin

The page or its data layer should mostly do only this:

1. resolve the signed-in user
2. call one endpoint
3. render the result

Avoid putting domain stitching logic in the page.

### Put Domain Logic In The Backend

The endpoint should own:

- context lookup
- relationship lookup
- joining related data
- status normalization
- sorting and filtering
- access-sensitive querying

### Use Elevated Access Carefully

Elevated/override access is acceptable inside the backend endpoint when the endpoint itself is the controlled access boundary and must read data the frontend should not query directly.

Important:

- use it in backend code, never in the browser
- use it only where the endpoint is intentionally acting as the controlled access layer

### Treat Custom Routes As Contracts

Do not guess the behavior of custom routes. Always confirm:

- expected auth header format
- expected request body shape
- expected response shape

Do not assume raw data-source behavior and custom route behavior are identical.

---

## Anti-Patterns To Avoid

Avoid the following in pages and client components:

- reading auth state from local storage to build critical data queries
- chaining many raw data-source fetches directly from the page
- duplicating context resolution logic in multiple features
- mixing raw data-source access and custom route access for the same feature
- assuming different auth header formats are interchangeable
- filtering business-critical data only in the page when the backend should own that rule

---

## Debugging Checklist

If a page suddenly stops loading, check in this order:

1. Is the page using a dedicated domain endpoint, or is it stitching raw data sources itself?
2. Is the endpoint resolving context correctly from the user identifier?
3. Is the backend query using the correct access strategy?
4. Is the page calling a custom route with the correct auth header format?
5. Is the response shape stable and already mapped for the UI?
6. Is the page depending on browser-only auth state that may be unavailable?

---

## Short Version

**Move complex, context-scoped fetching out of the frontend and into a dedicated backend endpoint, then let the frontend consume one prepared response.**

That is more stable than:

**Frontend → many direct data-source fetches → manual stitching → fragile auth and access behavior.**

---

## Recommended Standard

For context-scoped features, prefer this standard:

1. The backend owns the domain query in a dedicated endpoint.
2. Server-side data functions in the frontend call that endpoint.
3. Pages render the returned data.
4. Custom routes use their documented auth contract.
5. Raw collection fetching from pages is avoided when a feature depends on multiple related entities or restricted access.

This is the principle behind the fixes that were applied.