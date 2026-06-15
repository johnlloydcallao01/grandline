# Consistency Guidelines for Accounting Pages

## 1. Preparation & Baseline
- [✅] **Study the newest complete page** (UI & Backend) before building a new one.
- [✅] **Copy the exact pattern** (action flow, layout, panels, data fetching), do not reinvent.
- [✅] **Run TS Error Checker** immediately after implementation (`ts-error-checker.md`).

## 2. Page & Tab Layout
- [✅] **Breadcrumb, Title, & Description** exist at the top of the page.
- [✅] **Tabs Container** is clear, active tab is obvious.
- [✅] **Tab Header** includes title, description, and visible record count.
- [✅] **Tab Switching** properly loads correct data, no cross-contamination.

## 3. Actions & Forms
- [✅] **Primary Actions (Right)**: Create (if applicable), Refresh, Export.
- [✅] **No "Create" Button for Read-Only** (e.g., Ledgers, Reports, Aggregations).
- [✅] **Side Panel Form**: Forms open in a consistent right-side slide-over panel.
- [✅] **Edit Pre-fills Data**: Editing loads existing values, not a blank form.
- [✅] **Read-Only Fields**: System-calculated fields are visible but disabled.
- [✅] **Guided Selections**: Use dropdowns/selectors for relations, not free text.

## 4. Filters & Search
- [✅] **Multi-Select Allowed**: Users can select multiple filters in the same group (widens results).
- [✅] **Cross-Group Filtering**: Selecting from different groups narrows results.
- [✅] **Filter Logic**: Quick filters map directly to backend array logic (e.g., `statuses: string[]`).
- [✅] **Same-Group Quick Filters Use OR**: If users check multiple quick filters/tabs/chips in the same filter group, results must widen using OR logic, never shrink using AND logic.
- [✅] **Show As Many As Possible**: Adding another checked quick filter in the same group must return the union of matching rows, not only the overlap.
- [✅] **AND Only Across Different Intentional Groups**: Narrowing behavior is allowed only when users combine different filter groups such as `status` plus `entityType`, not multiple options inside one group.

## 5. Metrics & Table Data
- [✅] **Metrics Update Instantly**: Metrics refresh automatically based on filtered data.
- [✅] **Right-Align Financials**: Monetary amounts and rates are strictly right-aligned (Headers & Cells).
- [✅] **Row Actions**: View, Edit, and Delete icons are aligned right on every row.
- [✅] **Delete Validation**: Checks dependencies before removal; gives clear errors if blocked.

## 6. Backend Integration
- [✅] **Register Pattern**: Backend returns `{ rows, metrics, filterOptions, appliedFilters, pagination, totals }`.
- [✅] **Mapping Consistency**: Backend prepares all UI-ready labels and formatted values.
- [✅] **Status Consistency**: Use standard status terms and visual indicators (colors).
