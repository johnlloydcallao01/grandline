# Debug Session: web-turbopack-panic [OPEN]

## Symptom
- `apps/web` crashes in `pnpm run dev` after the Sentry setup.
- Next.js 16.2.0 with Turbopack panics while compiling `instrumentation Node.js` / `proxy`.

## Scope
- App: `apps/web`
- Suspected area: Sentry Next.js integration files and Next config

## Initial Evidence
- User report shows repeated Turbopack panic:
  - `inner_of_upper_lost_followers ... compute_async_module_info`
  - panic appears during `Compiling instrumentation Node.js`

## Hypotheses
- H1: The new `src/instrumentation.ts` export shape triggers a Turbopack bug in this Next 16 setup.
- H2: One of the Sentry init files imported from `instrumentation.ts` causes the crash during graph analysis.
- H3: `withSentryConfig(...)` plus Turbopack is valid, but one added runtime hook such as `onRequestError` or `onRouterTransitionStart` is not compatible here.
- H4: The dedicated verification page/API route is not the cause; the panic starts before route compilation finishes.
- H5: The crash is specific to Turbopack dev mode and may not affect the underlying Sentry package installation itself.

## Plan
- Inspect the exact files added for Sentry.
- Collect compatibility evidence from official Sentry / Next.js docs.
- Isolate the minimal failing integration point.
- Apply the smallest safe fix and verify.
