# LMS Course Search — Implementation Plan

## Overview
- Implement two coordinated search experiences in the web app header:
  - Mobile: full-screen modal popup search.
  - Desktop/tablet: inline dropdown search anchored to the header input.
- Scope focuses exclusively on LMS courses and course categories from our CMS. No merchants, restaurants, or address/location logic.
- Suggestions and results derive from real course titles and course categories stored in `apps/cms`.

## Goals
- Fast, debounced search with cancel-on-new-input.
- Instant UI feedback matching the current header visuals for both mobile modal and desktop dropdown.
- Relevant suggestions powered by course titles and active course categories.
- Accessible interactions with proper roles, keyboard navigation, and focus management.

## Data Sources
- Courses: `PayloadCMS /courses` collection.
- Course Categories: `PayloadCMS /course-categories` collection.
- Existing server utilities: `apps/web/src/server/services/course-service.ts` and `apps/web/src/server/index.ts`.

## API Design (App Router, server-side only)
- `apps/web/src/app/api/search/route.ts`
  - `GET /api/search?q=string&limit=number`
  - Behavior:
    - Validate `q` (trim, lowercase, collapse whitespace; minimum length 2).
    - Query CMS `courses` with `status=published` and a `where` clause matching `title` and `excerpt`.
    - Response: `{ results: Array<{ id, title, subtitle, thumbnail, href, type }> }` where `type='course'`.
    - Use `Authorization: users API-Key ${PAYLOAD_API_KEY}`; never expose secrets on the client.
- `apps/web/src/app/api/search/suggestions/route.ts`
  - `GET /api/search/suggestions?q=string`
  - Behavior:
    - For empty or short queries: return top active course categories and a few featured course titles.
    - For non-empty queries: combine best-matching categories (prefix/exact/contains by `name`) and course title matches (prefix/exact/contains).
    - Response: `{ suggestions: Array<{ label, kind: 'category'|'course', href? }> }`.

## Types (shared)
- `apps/web/src/types/search.ts`
  - `export interface SearchResult { id: string; title: string; subtitle?: string; thumbnail?: string; href: string; type: 'course'; }`
  - `export interface Suggestion { label: string; kind: 'category'|'course'; href?: string; }`

## State & Provider
- `apps/web/src/contexts/SearchContext.tsx`
  - State: `{ query, results, recent, isOpen, isLoading, error, selectIndex }`.
  - Actions: `setQuery`, `setOpen`, `search(q)`, `clearQuery()`, `loadRecent()`, `saveRecent(item)`.
  - Debounce: 250ms; `AbortController` for canceling in-flight requests.
  - Client-side caching: `Map<string, SearchResult[]>` with short TTL (e.g., 60s).
- `apps/web/src/hooks/useSearch.ts`
  - Returns context consumption with helpers; central place to call `/api/search` and `/api/search/suggestions`.

## UI Integration (Header)
- Desktop dropdown
  - Component: `apps/web/src/components/search/DesktopSearchDropdown.tsx`.
  - Mimic the header input styling and open dropdown on focus/typing.
  - Classes: anchor `form.flex.w-full`, panel `absolute left-0 right-0 z-50 bg-white rounded-md shadow max-h-96 overflow-auto`.
  - Keyboard: Up/Down to move selection; Enter to open selected `href`; Escape to close.
- Mobile modal popup
  - Component: `apps/web/src/components/search/MobileSearchOverlay.tsx`.
  - Triggered by mobile header icon (`lg:hidden`).
  - Container: `fixed inset-0 z-50 bg-white` with header row and input.
  - Focus management on open; body scroll lock while open; Escape/back closes and returns focus.
- Header wiring
  - Mount `SearchProvider` at header/layout level to share state.
  - Mobile: icon toggles overlay `isOpen`.
  - Desktop: input focus sets dropdown `isOpen` and updates `query`.

## Suggestion Strategy (courses & categories only)
- Query normalization: lowercase, trim, collapse whitespace; no location/remove-near-me logic.
- Category ranking: exact > prefix > contains on `CourseCategories.name`.
- Title ranking: exact > prefix > contains on `Course.title`.
- Assembly:
  - For short/empty `query`: list popular categories and featured course titles.
  - For non-empty `query`: combine best category matches and top course title matches (dedupe labels), cap at 12.

## Result Assembly
- Courses only.
- Fields:
  - `id`: CMS course ID.
  - `title`: course title.
  - `subtitle`: category names joined or excerpt.
  - `thumbnail`: `course.thumbnail.cloudinaryURL || course.thumbnail.url`.
  - `href`: `/view-course/${id}` (or `/courses/${id}` depending on our routing).
  - `type`: `'course'`.

## Performance
- Debounce input to 250ms.
- Cancel stale requests with `AbortController`.
- Cache-by-query results with TTL.
- Limit results to 8; “View all results” CTA when more exist.

## Accessibility
- Desktop input container: `role="combobox"`, `aria-controls`, `aria-expanded`.
- Dropdown list: `role="listbox"`; items: `role="option"`.
- Modal: `role="dialog"`, `aria-modal="true"`; `aria-labelledby` for context.
- Keyboard: arrow navigation, Enter to select, Escape to close; focus trapping in modal.

## Security
- Server-side routes call CMS with `PAYLOAD_API_KEY`.
- No client exposure of API key; all data fetched via our `/api/search*` handlers.

## Validation & Testing
- Unit: provider debounce and abort; result normalization; suggestion ranking.
- Integration: dropdown/modal parity; keyboard behavior.
- E2E: mobile icon opens full-screen; desktop input opens dropdown; shared state across both.
- Tooling: `pnpm --filter @encreasl/web lint` and `pnpm --filter @encreasl/web type-check`.

## Implementation Steps
1. Add shared types: `apps/web/src/types/search.ts`.
2. Create server routes: `apps/web/src/app/api/search/route.ts` and `apps/web/src/app/api/search/suggestions/route.ts` with CMS queries.
3. Build provider/hook: `SearchContext.tsx` and `useSearch.ts` with debounce, abort, caching, recents.
4. Implement UI components: `MobileSearchOverlay.tsx`, `DesktopSearchDropdown.tsx`, and shared list renderers.
5. Wire header: mount `SearchProvider` and connect icons/inputs to open overlay/dropdown.
6. Add “View all results” page (optional): `apps/web/src/app/search/page.tsx` for full listings.
7. Validate lint/type-check; test interactions across devices.

## CMS Query Details
- Courses endpoint (examples):
  - Titles: `/courses?where[status][equals]=published&where[title][contains]="<q>"&limit=8&depth=1`
  - Excerpts: `/courses?where[status][equals]=published&where[excerpt][contains]="<q>"&limit=8&depth=1`
- Categories endpoint:
  - Active categories: `/course-categories?where[isActive][equals]=true&limit=24&depth=0`

## Files to Touch
-- Web app
  - `apps/web/src/components/layout/Header.tsx` (mount provider, hook up triggers)
  - `apps/web/src/components/search/DesktopSearchDropdown.tsx`
  - `apps/web/src/components/search/MobileSearchOverlay.tsx`
  - `apps/web/src/contexts/SearchContext.tsx`
  - `apps/web/src/hooks/useSearch.ts`
  - `apps/web/src/types/search.ts`
  - `apps/web/src/app/api/search/route.ts`
  - `apps/web/src/app/api/search/suggestions/route.ts`

## Rollout Notes
- Keep visuals consistent with existing header styles.
- Ensure graceful fallback states: empty query, no results, network error.
- Reuse the avatar/logo and spacing patterns already present to minimize visual drift.
