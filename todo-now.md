# Tap2Go Search Functionality — Deep Analysis (apps/web)

## Summary
- Two coordinated search experiences exist in the header:
  - Mobile: an icon button (`p-2 rounded-full`) opens a full‑screen overlay popup for search.
  - Desktop/tablet: an inline search form (`form.flex.w-full`) that, on focus/input, opens a dropdown panel for searching.
- Both experiences are synchronized through shared state and reusable logic/components, so queries, suggestions, and results are consistent regardless of entry point.

## Mobile Header Search (Popup)
- Trigger: a header icon button with compact touch target (`p-2 rounded-full bg-white shadow-md border`) on mobile (`lg:hidden`).
- Behavior: clicking opens a full‑width, full‑height search overlay.
- Structure:
  - Container: fixed overlay (`fixed inset-0 z-50`) with white background and subtle shadow.
  - Header row: includes a back/close control and an input with a magnifying glass icon.
  - Content: suggestions, recent searches, and live results, scrollable (`overflow-y-auto`) beneath the input.
- Interactions:
  - Focus automatically placed in the input when opened.
  - Debounced query updates; results streamed or updated as typing occurs.
  - Escape/close button closes the overlay and returns focus to the header icon.
  - Body scroll locked while overlay is open.
- Accessibility:
  - Uses an accessible dialog (e.g., `role="dialog"`, `aria-modal="true"`) or a headless `Dialog` implementation mounted to a portal.
  - `aria-labelledby`/`aria-describedby` for screen reader context.
  - Keyboard navigation through suggestion list with `aria-activedescendant`.

## Desktop/Tablet Header Search (Dropdown)
- Trigger: a header search form (`form.flex.w-full`) visible on large screens (`lg:flex`, mobile version hidden).
- Behavior: focusing the input or typing opens a dropdown below the input.
- Structure:
  - Anchor: the input field wrapper serving as the dropdown anchor.
  - Panel: absolutely positioned popover (`absolute left-0 right-0 z-50`) with rounded corners, shadow, and max height with scroll.
  - Contents: unified suggestion list, recent searches, and live results matching the mobile overlay content.
- Interactions:
  - Debounced queries; Enter navigates to selected result; Arrow keys move selection.
  - Click outside or Escape closes the dropdown; input retains query.
- Accessibility:
  - `role="combobox"` on the input container with `aria-controls`/`aria-expanded`.
  - List uses `role="listbox"` and items `role="option"`.

## Shared Logic and Reuse
- State is centralized so both UIs stay in sync:
  - Shared provider (e.g., `SearchProvider`) at header/layout scope.
  - Hook (e.g., `useSearch`) returns `{ query, setQuery, results, isOpen, setOpen, isLoading, error, recent, selectIndex, setSelectIndex }`.
  - Common components: `SearchInput`, `SearchResultsList`, `SuggestionItem`, `RecentList`.
- Query handling:
  - Debounce (typically 200–300ms) to limit request rate.
  - Abortable fetch via `AbortController` to cancel stale requests.
  - Minimum query length (e.g., 2 chars) before hitting the API.
- Result model:
  - Unified result interface across entities (e.g., courses/restaurants/items) with fields like `{ id, title, subtitle, thumbnail, href, type }`.
  - Optional highlighting metadata for matched terms.

## Data Flow
1. User types in either the mobile overlay input or the desktop input.
2. `setQuery` updates shared state; debounce timer fires.
3. Shared fetch routine requests `/api/search?q=...` (and optionally `/api/search/suggestions?q=...`).
4. Results propagate to the provider; both UIs render from the same `results` array.
5. Selecting an item triggers a shared `onSelect` that navigates to `result.href`, and updates recent history.

## UI/UX Details
- Visual consistency:
  - Same typography, spacing, and item rendering across overlay and dropdown.
  - Icons and badges consistent between experiences.
- Lists:
  - Grouped sections: “Recent”, “Top Results”, “Categories”, etc.
  - Optional virtualization for long lists.
- Animations:
  - Overlay fade/slide in; dropdown subtle scale/fade.
  - Motion reduces under `prefers-reduced-motion`.

## Performance and Caching
- Client-side caching by query (e.g., `Map<string, Result[]>`) with short TTL.
- Prevent duplicate requests for the same in-flight query via keying.
- Limit result payload (e.g., top 8–10 suggestions); “View all” navigates to a dedicated results page.

## State Management
- Implementation options:
  - Lightweight context + hook.
  - Zustand/redux slice if global persistence/history syncing is needed.
- Shared actions:
  - `openOverlay()`, `openDropdown()`, `closeSearch()`, `setQuery()`, `clearQuery()`, `loadRecent()`, `saveRecent()`.

## API Contract (Illustrative)
- `GET /api/search?q=string&limit=number&type=optional` → `{ results: Result[], total: number }`.
- `GET /api/search/suggestions?q=string` → `{ suggestions: Suggestion[] }`.
- Results normalized to a single interface for rendering convergence.

## Sync Behavior Between UIs
- Shared `query` ensures typing on mobile instantly reflects in desktop dropdown (and vice versa) when both are present.
- `recent` history is persisted (localStorage or backend) and rendered identically across both.
- Selection index and keyboard navigation are isolated per UI instance, but operate on the same `results` data.

## Edge Cases and Handling
- Empty query: show recent searches or popular items.
- No results: render an empty state with helpful copy and possible category shortcuts.
- Network failure: display error state with retry.
- Rapid toggling: abort previous requests and debounce to avoid flicker.
- Route changes: close overlay/dropdown; keep query optionally.

## Implementation Outline (Reusable)

```ts
// search/types.ts
export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  thumbnail?: string;
  href: string;
  type: string;
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  recent: SearchResult[];
  isOpen: boolean;
  isLoading: boolean;
  error?: string;
  selectIndex: number;
}
```

```ts
// search/context.tsx
import React, { createContext, useContext, useMemo, useRef, useState } from 'react';

const SearchContext = createContext<any>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recent, setRecent] = useState<SearchResult[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [selectIndex, setSelectIndex] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const search = async (q: string) => {
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);
    setError(undefined);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=8`, { signal: ac.signal });
      const json = await res.json();
      setResults(json.results || []);
    } catch (e: any) {
      if (e?.name !== 'AbortError') setError('Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(() => ({
    query, setQuery,
    results, setResults,
    recent, setRecent,
    isOpen, setOpen,
    isLoading, error,
    selectIndex, setSelectIndex,
    search,
  }), [query, results, recent, isOpen, isLoading, error, selectIndex]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export const useSearch = () => useContext(SearchContext);
```

```tsx
// header/MobileSearchOverlay.tsx
export function MobileSearchOverlay() {
  const { query, setQuery, results, isOpen, setOpen, isLoading, search } = useSearch();
  // open/close, focus management, body scroll lock, etc.
  return (
    <div className={isOpen ? 'fixed inset-0 z-50 bg-white' : 'hidden'}>
      <div className="p-3 flex items-center gap-2">
        <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-white border shadow-md">
          <i className="fas fa-arrow-left"></i>
        </button>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onInput={(e) => { const v = (e.target as HTMLInputElement).value; if (v.length >= 2) search(v); }}
          className="flex-1 h-10 border rounded-md px-3"
          placeholder="Search"
        />
      </div>
      {/* results list */}
    </div>
  );
}
```

```tsx
// header/DesktopSearchDropdown.tsx
export function DesktopSearchDropdown() {
  const { query, setQuery, results, isOpen, setOpen, isLoading, search } = useSearch();
  return (
    <form className="flex w-full relative" onSubmit={(e) => e.preventDefault()}>
      <input
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => { const v = e.target.value; setQuery(v); if (v.length >= 2) search(v); }}
        className="flex-1 h-10 border rounded-md px-3"
        placeholder="Search"
      />
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white rounded-md shadow max-h-96 overflow-auto">
          {/* shared results rendering */}
        </div>
      )}
    </form>
  );
}
```

## Testing and Validation
- Cross-device tests: mobile overlay and desktop dropdown parity.
- Keyboard navigation: arrow keys, Enter, Escape.
- Debounce/cancel correctness under fast typing.
- Accessibility checks: roles, labels, focus trapping.
- Performance: request frequency, cache hits, long lists rendering.

## Implementation Notes
- Style classes match the provided header icon (`p-2 rounded-full ...`) and desktop form (`form.flex.w-full`).
- Limit suggestions to 8 and expose a “View all” navigation for larger result sets.
- Reuse the same renderers for items to guarantee consistent visuals across both UIs.

## File Structure Analysis (tap2go apps/web)

### High-Level Layout
- `apps/web` (Next.js application)
  - `src/app` — App Router entry, root `layout.tsx`, pages (e.g., `search/page.tsx` for full results)
  - `src/components` — UI components for header, search, overlay, dropdown
  - `src/contexts` or `src/providers` — shared state providers (e.g., `SearchProvider`)
  - `src/hooks` — reusable hooks (e.g., `useSearch`)
  - `src/types` — normalized search types and result interfaces
  - `src/lib` or `src/utils` — helpers (debounce, highlight, caching)
  - `src/app/api` — route handlers for search endpoints (App Router)

### Files Involved (by responsibility)
- Header integration
  - `src/components/header/Header.tsx`
    - Renders mobile icon (`lg:hidden`) to open overlay
    - Renders desktop form (`lg:flex`) as anchor for dropdown
    - Consumes shared search state via context/hook
- Mobile overlay (full-screen)
  - `src/components/search/MobileSearchOverlay.tsx`
    - Fixed overlay container; focus management; body scroll lock
    - Input bound to `query`; calls `search()` on change with debounce
    - Renders `SearchResultsList`, `RecentList`, `SuggestionItem` (shared)
- Desktop dropdown (popover)
  - `src/components/search/DesktopSearchDropdown.tsx`
    - Positioned popover tied to input wrapper; click-outside/escape close
    - Input bound to `query`; calls `search()`; renders shared items
- Shared building blocks
  - `src/components/search/SearchInput.tsx` — shared input control (optional)
  - `src/components/search/SearchResultsList.tsx` — list rendering across overlay/dropdown
  - `src/components/search/SuggestionItem.tsx` — standardized option row
  - `src/components/search/RecentList.tsx` — recent searches block
  - `src/components/overlay/Dialog.tsx` — generic accessible dialog (mobile overlay basis)
  - `src/components/popover/Dropdown.tsx` — generic dropdown/popover (desktop basis)
- State and hooks
  - `src/contexts/SearchContext.tsx` or `src/providers/SearchProvider.tsx`
    - Centralizes `query`, `results`, `recent`, `isOpen`, `isLoading`, `error`
    - Exposes `search()` with abortable fetch and debounce
  - `src/hooks/useSearch.ts` — consumer hook returning context values/actions
- API layer
  - `src/app/api/search/route.ts` (Next.js App Router)
    - Handles `GET /api/search?q=&limit=&type=...`
    - Normalizes payload to unified result interface; supports highlighting
  - `src/app/api/search/suggestions/route.ts` — autocomplete suggestions (if present)
- Normalized types and helpers
  - `src/types/search.ts` — `SearchResult`, `SearchState`, `Suggestion` types
  - `src/lib/search.ts` — highlight terms, map entities (courses/restaurants/categories) to common shape
  - `src/utils/debounce.ts` — debounce utility
  - `src/utils/focus.ts` — focus trap and return focus helpers
- Full results page
  - `src/app/search/page.tsx` — complete search results, pagination, “View all” target
    - Consumes same context for continuity; optionally re-fetches with larger limit
- Styles
  - Tailwind-first with utility classes; optional module/CSS for overlay/dropdown polish
  - Motion reduced under `prefers-reduced-motion`

### Reuse Observations
- Shared query/state: overlay and dropdown bind to a single source of truth (`SearchProvider`)
- Shared item renderers: identical components for suggestions/results produce consistent UI across contexts
- Shared actions: `openOverlay`, `openDropdown`, `closeSearch`, `setQuery`, `search` used by both entry points
- Unified result model: all entity types mapped to `{ id, title, subtitle, thumbnail, href, type }`
- Common behaviors: debounce, abort in-flight requests, highlight matches, maintain `recent`

### Data & Control Flow (mounted at header level)
1. Header mounts `SearchProvider` so both mobile icon and desktop form share the same context
2. Mobile icon toggles overlay open; desktop form toggles dropdown open
3. Typing updates `query`; debounced `search()` executes; results stored in provider
4. Overlay/dropdown render `results` via shared list components
5. Selecting an item navigates (`href`) and records recents; closing returns focus to trigger

### Edge Cases and Behavior Guarantees
- Overlay and dropdown do not fight over `isOpen`: distinct flags or contextual scoping prevent overlap
- Close on route change; optional persistence of `query`
- Accessibility maintained by role attributes and focus handling across both experiences
- “View all” routes to `search/page.tsx` when result count exceeds 8–10

### Testing & Maintainability
- Unit: hooks (debounce, abort), components (list rendering)
- Integration: overlay vs dropdown parity, keyboard navigation
- E2E: mobile icon opens full-screen, desktop input opens dropdown, shared query sync
- Encapsulation: move all search UI into `src/components/search/*` + provider/hook to reduce header complexity

## Smart Suggestion Strategy (tap2go code)

- Query normalization and parsing:
  - `apps/web/src/components/search/SearchModal.tsx:42–54` lowercases, trims, removes “near me”, strips “ in ...” suffix, collapses whitespace.
  - `apps/web/src/components/layout/Header.tsx:67–75` identical normalization for desktop.
- Product name suggestions (typed input → product names):
  - `SearchModal.tsx:178–203` fetches `/products?where[name][contains]=<q>&limit=12&depth=0`, dedupes names, slices to 12.
  - `Header.tsx:291–315` same pipeline for desktop dropdown.
- Product→merchant matching (after commit):
  - `SearchModal.tsx:205–244` maps product IDs via `/merchant-products` filtered by `is_active`/`is_available`, then intersects with location merchants.
  - `Header.tsx:355–393` same mapping and merging.
- Category and tag suggestions:
  - `SearchModal.tsx:155–176` ranks category match score (exact/prefix/contains), picks best.
  - `SearchModal.tsx:297–310` builds tag matches by scanning merchant tags.
  - `Header.tsx:317–337` category ranking; `575–607` builds suggestions list including tags/products.
- Suggestion assembly (with location-aware variants):
  - `SearchModal.tsx:280–326` composes merchant/category/product/tag suggestions; adds “near me” and “ in <active address>”.
  - `Header.tsx:575–607` equivalent for dropdown.
- Recent searches persistence:
  - Read: `SearchModal.tsx:82–106`, `Header.tsx:270–289` fetch recent queries by user and scope.
  - Write: `SearchModal.tsx:342–371`, `Header.tsx:417–459` POST to `/recent-searches`; fallback updates existing via PATCH using composite key.

## Concrete Code References (tap2go apps/web)

- Mobile overlay specifics:
  - Body scroll lock: `SearchModal.tsx:63–78`
  - Input and header row: `SearchModal.tsx:391–399`
  - Recent/suggested/results rendering: `SearchModal.tsx:401–486`
- Desktop dropdown specifics:
  - Mobile search icon triggers overlay: `Header.tsx:486–489`
  - Desktop search form and dropdown anchor: `Header.tsx:535–705`
  - Dropdown content sections: `Header.tsx:548–692`
- Shared components:
  - Search input component: `apps/web/src/components/ui/SearchField.tsx:19–49`
  - Merchant card renderer: `LocationMerchantCard` used at `SearchModal.tsx:474–480`, `Header.tsx:676–684`
- Address suggestions (Google Places):
  - Fetch + convert suggestions: `apps/web/src/hooks/useGoogleMapsPlaces.ts:115–152`
  - Select place details: `apps/web/src/hooks/useGoogleMapsPlaces.ts:154–187`
  - UI wrapper: `apps/web/src/components/shared/AddressSearchInput.tsx:66–139`
- Location-based merchant service:
  - Merchants fetch + cache: `apps/web/src/lib/client-services/location-based-merchant-service.ts:65–139`
  - Categories from merchant set: `apps/web/src/lib/client-services/location-based-merchant-service.ts:141–189`
  - Resolve current customerId: `apps/web/src/lib/client-services/location-based-merchant-service.ts:259–300`
- Active address integration:
  - Get active address via Next.js API: `apps/web/src/lib/services/address-service.ts:468–549`
  - Used in overlay: `SearchModal.tsx:138–153`; in header: `Header.tsx:395–409`
