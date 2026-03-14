# Authentication Token Rename Implementation Plan (apps/web)

## 1. Goal
Rename the `localStorage` authentication keys in `apps/web` to avoid session collision with `apps/web-admin` when both applications are accessed from the same domain. 

## 2. Key Changes
To ensure complete isolation, all related auth keys must be renamed, not just the token:
* `grandline_auth_token` ➔ `grandline_auth_token_trainee`
* `grandline_auth_user` ➔ `grandline_auth_user_trainee`
* `grandline_auth_expires` ➔ `grandline_auth_expires_trainee`

## 3. Files to Update
Based on the codebase analysis, the following files in `apps/web` directly reference these `localStorage` keys and require updates:

### Core Auth & Context
1. **`src/lib/auth.ts`**
   - Central hub for auth logic. 
   - Has multiple `setItem`, `getItem`, and `removeItem` calls for `token`, `user`, and `expires`.
2. **`src/contexts/AuthContext.tsx`**
   - Retrieves the cached user (`grandline_auth_user`) during context initialization.

### Auxiliary Libraries
3. **`src/lib/wishlist.ts`**
   - Reads `grandline_auth_token` to make authenticated API requests.
   - Reads `grandline_auth_user` to attach user ID to requests.
4. **`src/lib/recentlyViewed.ts`**
   - Reads `grandline_auth_user` to attach user ID to tracking payloads.

### UI Components & Layouts
5. **`src/app/view-course/[id]/ViewCourseClient.tsx`**
   - Reads `grandline_auth_token` to authorize course actions (e.g., enrollment).
6. **`src/app/view-course/[id]/page.tsx`**
   - Reads `grandline_auth_user` (likely for UI conditional rendering).
7. **`src/app/portal/courses/[courseId]/player/layout.tsx`**
   - Contains multiple reads for `grandline_auth_user` to validate access and retrieve trainee details.

## 4. Proposed Execution Steps

**Step 1: Update Core Auth Library**
* In `src/lib/auth.ts`, do a direct find-and-replace for the exact string matches of the 3 keys.
* Ensure `clearAuthState` correctly removes the new `_trainee` suffixed keys.

**Step 2: Update Auth Context**
* In `src/contexts/AuthContext.tsx`, update the fallback `localStorage.getItem` call to use `grandline_auth_user_trainee`.

**Step 3: Update Libraries and Helpers**
* In `src/lib/wishlist.ts` and `src/lib/recentlyViewed.ts`, update the `getItem` calls to use the new `_trainee` keys.

**Step 4: Update UI and Pages**
* Go through `ViewCourseClient.tsx`, `page.tsx` (view-course), and the player `layout.tsx` to update all remaining hardcoded `localStorage.getItem` references.

## 5. Verification
After the changes are applied:
1. Open the browser and clear existing `localStorage` for the domain.
2. Log into the Trainee Portal (`apps/web`).
3. Inspect DevTools ➔ Application ➔ Local Storage.
4. Verify the presence of `grandline_auth_token_trainee`, `grandline_auth_user_trainee`, and `grandline_auth_expires_trainee`.
5. Log into the Admin Portal (`apps/web-admin`) in the same window/browser.
6. Verify the Admin Portal creates its own `grandline_auth_token` without logging out the Trainee session.
