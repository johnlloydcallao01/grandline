# Consistency Guidelines for Implementing Accounting Pages

## Golden Rule: Pattern Analysis Before Implementation

Before building any new page, deeply analyze the newest existing page we have created — from the full complete UI pattern, backend pattern from apps/cms (collections, API routes, services, register services), and all related backend infrastructure. Study:

- How icons are used for actions (Eye, Edit, Trash2, Plus, RefreshCw, Download)
- The reusable sidebar modal (SlideOver via `createPortal` to `document.body`) for all CRUD displays
- The delete/edit/view patterns
- The `@fetching-solution.md` BFF-style data fetching pattern

Using the **same consistent pattern** from backend to UI, design, and principles, apply it consistently to the new page.

**⚠️ DANGER — Do NOT blindly copy without thinking:**
1. **Filter tags must be accurate** — carefully check the backend CMS collection fields to determine what filter tags are actually relevant. Do NOT blindly copy filter tags from other pages.
2. **Consistent pattern ≠ blind copy** — follow the structural pattern (header, tabs card, section header + metrics + search/filters + table + CRUD SlideOvers) but adapt the content (fields, columns, filters, metrics) to the specific entity.
3. **Filter tags within the same dimension use OR semantics** — allow selecting as many tags as possible within the same filter dimension (e.g., Debit AND Credit, or Balanced AND Unbalanced). When both are selected, show rows matching EITHER value. Use string arrays (e.g., `lineTypes: string[]`, `balancedFilters: string[]`) with `toggleFilterValue()` for toggle-able chips. Different filter dimensions (e.g., Has Tax Code AND line type) still use AND logic between them.

---

## 1. Header Structure (Page Level)
- **Breadcrumb**: `<p className="text-sm font-medium text-blue-600">Core / Section Name</p>`
- **Icon + Title + Description**: Icon in `rounded-xl bg-blue-50 p-3 text-blue-700`, title as `text-2xl font-bold text-gray-900`, description as `mt-1 max-w-3xl text-sm text-gray-600`
- **Outer container**: `space-y-6 p-6`
- **Tabs inside a card**: `<div className="rounded-xl border border-gray-200 bg-white shadow-sm">`
- **Tab bar**: `border-b border-gray-200 px-6`, nav with `-mb-px flex space-x-8 overflow-x-auto`, active tab: `border-blue-500 text-blue-600`, inactive: `border-transparent text-gray-500`

## 2. Tab Content Section
- Each tab has its own **section header** inside the tab content: `rounded-xl border border-gray-200 bg-gray-50 p-5`
- Header contains: title, description, matching count (`{total ?? 0} matching {entity}`)
- Action buttons use `getActionClasses('primary')` / `getActionClasses('secondary')`

## 3. Action Buttons (Every Tab MUST Have)
- **Create button** (primary): `Plus` icon + "Create {Entity}" — must open a **SlideOver** with a proper form
- **Refresh button** (secondary): `RefreshCw` icon + "Refresh"
- **Download View / Export** (ghost/outline): `Download` icon + "Download View" — must export CSV
- ALL THREE buttons must be present on every tab that manages records

## 4. CRUD Operations — ALL Must Be Functional
- **Create**: Opens SlideOver with form → submits via server action → refreshes data in real-time → metrics update without page reload
- **View (Eye icon)**: Opens Detail SlideOver showing all relevant fields including computed/read-only ones
- **Edit (pencil icon)**: Opens Edit SlideOver with form pre-populated → submits via server action → refreshes data in real-time
- **Delete (Trash icon)**: Opens Delete SlideOver → first checks for blockers (dependencies) → if blockers exist: amber warning + Close button; if no blockers: red confirmation + Cancel/Delete buttons

## 5. SlideOver Pattern
- Must use `createPortal` to `document.body` (fixes `position: fixed` inside `will-change: transform` container)
- Animation: slide-in from right (`translate-x-full` → `translate-x-0`), 300ms ease-in-out
- Backdrop fade: `bg-transparent` → `bg-black/50`
- Header: title + optional description + X close button
- Scrollable body: `flex-1 overflow-y-auto px-6 py-4`

## 6. Form Fields — Relationship Fields MUST Be Dropdowns
- **NEVER use plain `<Input>` for relationship/reference fields** (e.g., journal entry ID, account ID, branch ID)
- Instead use `<select>` populated from a choices endpoint (e.g., `/api/accounting/journal-entry-choices`, `/api/accounting/chart-account-choices`)
- Choices endpoints return `{ choices: [{ value, label }] }`
- Fetch choices when the SlideOver opens
- Include a placeholder `<option value="">Select a {entity}...</option>`

## 7. Read-Only Computed Fields in Edit Forms
- Fields auto-computed by backend hooks (e.g., `totalDebit`, `totalCredit`, `isBalanced`) must be displayed as **read-only** in edit forms
- Use `<div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">` for read-only display
- Store these values in a separate state (e.g., `editingTotals`) when loading the edit form

## 8. Quick Filter Tags
- **Must be accurate based on the actual CMS collection fields** — don't blindly copy tags from other pages
- **Filter tags within the same dimension use OR logic (array-based)** — tags like Debit/Credit, Balanced/Unbalanced within the same filter category must be independently toggle-able using string arrays (e.g., `lineTypes: string[]`, `balancedFilters: string[]`) with `toggleFilterValue()` to add/remove values
- **Cross-dimension filters still use AND logic** — e.g., Has Tax Code AND line type filters apply independently (both conditions must match)
- **Implementation pattern**: `type FilterState = { statuses: string[]; lineTypes: string[]; balancedFilters: string[] }` — never a single string/boolean for a multi-option filter dimension
- Active state: `bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200`
- Inactive state: `bg-gray-100 text-gray-700 hover:bg-gray-200`
- Server-driven: quick filters come from the CMS API response's `section.filters.quickFilters`
- Filter panel with Apply/Reset buttons using draft state pattern
- **CMS `matchesFilters` function must handle arrays with OR logic**: if array contains both values, return all rows (since every row matches at least one); if one value, filter to that; if empty, return all

## 9. Metrics Must Be Real-Time
- After create/edit/delete operations, the fetch function for the current tab must be called so metrics update immediately
- Do NOT require a manual page refresh to see updated metrics
- Use `useCallback` for fetch functions and call them after successful mutations

## 10. Table Actions
- Three action icons per row: `Eye` (view), `Edit` (pencil), `Trash2` (delete)
- ALL THREE must have functional `onClick` handlers
- Icons wrapped in `<button>` with `p-2` padding and hover styles

## 11. Tab Switching
- URL-based tab sync via `searchParams.get('tab')`
- `useEffect` normalizes tab and calls `setActiveTab`
- Each tab has its own fetch effect triggered on tab switch
- Non-implemented tabs show a placeholder: "This tab is under development."

## 12. Register Service Pattern (CMS Backend)
- Each tab backed by a collection gets its own register service `*RegisterService.ts`
- Pattern: `findAllDocs` → sort → map to rows → filter (search + statuses + entity-specific filters) → paginate → return
- `buildFilterOptions()` returns statuses, entity-specific filter options, and quickFilters
- `buildMetrics()` returns 4 metrics
- API route returns `{ section, appliedFilters, pagination, totals }`
- Row mapping includes `cells` array with proper `{ text, emphasis, tone, align }` formatting

## 13. Status Badge Colors
- Draft → `amber` (`bg-amber-50 text-amber-700 ring-amber-200`)
- Posted/Active → `green` (`bg-green-50 text-green-700 ring-green-200`)
- Reversed/Voided/Inactive → `gray` (`bg-gray-100 text-gray-700 ring-gray-200`)

## 14. Consistent Component Imports
- Use shared components: `SlideOver`, `FormField`, `Input`, `Select`, `TextArea`, `MetricCard`, `LoadingSkeleton`, `renderCell`
- Helpers: `formatDateTime`, `formatUser`, `escapeCsvValue`, `toggleFilterValue`, `getStatusBadgeClasses`, `getActionClasses`, `getMetricTone`

