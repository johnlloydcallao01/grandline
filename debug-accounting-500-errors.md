[OPEN] Accounting 500 Errors Debug Session

## Session
- Session ID: `accounting-500-errors`
- Started: 2026-06-20
- Scope:
  - `apps/web-admin` accounting pages returning `Failed to load accounting data.`
  - `apps/cms` accounting endpoints behind those pages
  - `ts-error-checker.md` verification for touched apps

## Symptoms
- `tax-operations` works.
- Other accounting pages intermittently fail with HTTP 500 and frontend fallback message `Failed to load accounting data.`
- Reported failures include:
  - `/accounting/audit-history/audit-logs`
  - `/accounting/tax-compliance/compliance-controls`
  - `/accounting/tax-compliance/tax-reporting-filing`

## Initial Hypotheses
1. Some `web-admin` actions point to CMS routes that do not exist or do not match the actual backend path contract.
2. Some CMS accounting routes throw before returning structured `{ error }` payloads, so `fetchAccountingAdmin()` only surfaces the generic fallback.
3. Working pages such as `tax-operations` share a valid backend contract, while failing pages use stale request params or stale response assumptions.
4. A subset of backend routes depends on reference data or collection fields that are missing in the current production dataset, causing server-side exceptions only on those pages.
5. Some pages are using POST-backed server actions correctly on the frontend, but the underlying GET/POST CMS route or auth gate behaves differently from the working `tax-operations` flow.

## Evidence Log
- Pending instrumentation and runtime evidence collection.

## Verification Checklist
- [ ] Run `pnpm exec tsc --noEmit` in `apps/web-admin`
- [ ] Run `pnpm exec eslint` in `apps/web-admin`
- [ ] Run `pnpm exec tsc --noEmit` in `apps/cms`
- [ ] Run `pnpm exec eslint` in `apps/cms`
- [ ] Trace failing `web-admin` actions to CMS routes
- [ ] Instrument failing CMS routes
- [ ] Compare failing routes against working `tax-operations`
- [ ] Implement minimal fix only after evidence confirms root cause
