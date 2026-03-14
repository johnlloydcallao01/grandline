# Authentication Token Rename Implementation Plan (apps/web-admin)

## 1. Goal
Rename the `localStorage` authentication keys in `apps/web-admin` to avoid session collision with `apps/web` when both applications are accessed from the same domain.

## 2. Key Changes
To ensure complete isolation, all related auth keys must be renamed, not just the token:
* `grandline_auth_token` ➔ `grandline_auth_token_admin`
* `grandline_auth_user` ➔ `grandline_auth_user_admin`
* `grandline_auth_expires` ➔ `grandline_auth_expires_admin`

## 3. Files to Update
Based on the codebase analysis, the following files in `apps/web-admin` directly reference these `localStorage` keys and require updates:

### Core Auth & Context
1. **`src/lib/auth.ts`**
   - Central hub for auth logic.
   - Has multiple `setItem`, `getItem`, and `removeItem` calls for `token`, `user`, and `expires`.
   - Functions to update: `login`, `getCurrentUser`, `refreshSession`, `hasValidStoredToken`, `getSessionInfo`, `clearAuthState`.
2. **`src/contexts/AuthContext.tsx`**
   - Retrieves the cached user (`grandline_auth_user`) during context initialization.

## 4. Proposed Execution Steps

**Step 1: Update Core Auth Library**
* In `src/lib/auth.ts`, do a direct find-and-replace for the exact string matches of the 3 keys.
* Ensure `clearAuthState` correctly removes the new `_admin` suffixed keys.

**Step 2: Update Auth Context**
* In `src/contexts/AuthContext.tsx`, update the fallback `localStorage.getItem` call to use `grandline_auth_user_admin`.

## 5. Verification
After the changes are applied:
1. Open the browser and clear existing `localStorage` for the domain.
2. Log into the Admin Portal (`apps/web-admin`).
3. Inspect DevTools ➔ Application ➔ Local Storage.
4. Verify the presence of `grandline_auth_token_admin`, `grandline_auth_user_admin`, and `grandline_auth_expires_admin`.
5. Log into the Trainee Portal (`apps/web`) in the same window/browser.
6. Verify the Trainee Portal creates its own `grandline_auth_token_trainee` without logging out the Admin session.
