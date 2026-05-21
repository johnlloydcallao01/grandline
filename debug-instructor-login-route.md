# [OPEN] Debug Session: instructor-login-route

## Summary
- Symptom: `apps/web-instructor` signin fails with `Route not found "/api/instructor-login"`.
- Expected: signin should call the CMS instructor login endpoint successfully and continue auth flow.

## Hypotheses
1. `NEXT_PUBLIC_API_URL` in `apps/web-instructor` resolves to a relative `/api`, so the server action fetch is hitting the Next app itself instead of the CMS.
2. `apps/web-instructor` lacks the proxy/rewrites behavior that `apps/web` relies on, so `/api/instructor-login` is never forwarded to CMS.
3. The new CMS endpoint exists in source but is not the actual runtime endpoint the app is targeting, because the app should still call a fully qualified CMS URL.
4. The failure is happening before role/auth logic, purely at route resolution, because the response already says `Route not found` rather than an auth error.
5. The app may be using a different env/config path in server actions than expected, causing `API_BASE_URL` to differ from the CMS host used by `apps/web`.

## Evidence
- User-provided runtime log shows: `Route not found "/api/instructor-login"`.
- Stack points to `apps/web-instructor/src/app/actions/auth.ts` inside `serverLogin()`.

## Plan
1. Inspect env/config/proxy differences between `apps/web` and `apps/web-instructor`.
2. Add minimal instrumentation to log the resolved login URL and fetch status.
3. Reproduce or validate against the provided runtime evidence.
4. Apply the minimal route-resolution fix.
5. Verify with diagnostics and TypeScript.
