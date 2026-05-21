# [OPEN] Debug Session: instructor-refresh-signout

## Summary
- Symptom: `apps/web-instructor` signs in successfully, but refreshing the page redirects back to `/signin`.
- Expected: refresh should preserve the authenticated session, matching `apps/web`.

## Hypotheses
1. `getServerUser()` in `apps/web-instructor` fails on refresh because it sends the wrong auth header format or token source for instructor users.
2. `serverRefresh()` or session validation still uses a trainee/admin-oriented path or role gate, causing authenticated instructor sessions to be invalidated on reload.
3. `AuthProvider` initializes more slowly than `ProtectedRoute` in `apps/web-instructor`, so a transient unauthenticated state triggers redirect before hydration settles.
4. The instructor cookie is set on login, but refresh-time auth restore reads from localStorage or stale state instead of the HTTP-only cookie path used by `apps/web`.
5. `NEXT_PUBLIC_API_URL` and the new `.env.local` fixed login requests, but the reload flow still uses a mismatched endpoint/authorization contract versus `apps/web`.

## Evidence
- User confirmed sign-in is now fast after adding `.env.local`.
- User also confirmed refresh drops to `/signin`, unlike `apps/web`.

## Plan
1. Compare `apps/web` and `apps/web-instructor` auth bootstrap, route protection, and refresh behavior.
2. Isolate the first divergence in cookie restore or protected-route timing.
3. Apply the minimal fix to make refresh persistence match `apps/web`.
4. Validate with diagnostics and TypeScript.
