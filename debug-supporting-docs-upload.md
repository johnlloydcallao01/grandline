# Debug Session: supporting-docs-upload

- Status: OPEN
- Started: 2026-06-20
- Scope: `apps/web-admin` supporting-documents media upload and create flow

## Symptoms

- Browser upload/create flow reports `You are not allowed to perform this action.`
- Follow-up create request reports `Error: Not Found` from `fetchAccountingAdmin(...)`
- Failing surface: `/accounting/expenses/claims-reimbursements?tab=supporting-documents`

## Falsifiable Hypotheses

1. The browser-side media upload now authenticates correctly, but the subsequent supporting-document create action is calling a non-existent CMS/admin endpoint.
2. The `fetchAccountingAdmin(...)` base URL or path builder is incorrect for the new supporting-documents routes, causing a 404 before business logic runs.
3. The create payload contains a missing or malformed `media` or `entityId` value, and the backend route is rejecting/rewriting the request path unexpectedly.
4. The request reaches the CMS route, but the route registration or exported handler path for supporting-documents does not match the frontend action URL.
5. The earlier auth-header normalization fixed one layer but broke another browser/server helper that the supporting-documents workflow depends on.

## Plan

1. Inspect the current route/action wiring for supporting-documents.
2. Add minimal instrumentation to the failing fetch path and route entrypoints.
3. Collect runtime evidence from the next reproduction.
4. Apply the smallest fix that matches the evidence.
5. Re-verify and then clean up after user confirmation.
