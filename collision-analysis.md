# Authentication Collision Analysis

## Issue Description
When both `apps/web` (Trainee Portal) and `apps/web-admin` (Admin Portal) are open in the same browser, refreshing one application causes the other to log out or redirect to the sign-in page. This suggests that despite renaming the `localStorage` keys, there is still some shared state or event mechanism causing interference.

## Analysis of Current Implementation

### 1. Local Storage Keys (Resolved)
- `apps/web` uses:
  - `grandline_auth_token_trainee`
  - `grandline_auth_user_trainee`
  - `grandline_auth_expires_trainee`
- `apps/web-admin` uses:
  - `grandline_auth_token_admin`
  - `grandline_auth_user_admin`
  - `grandline_auth_expires_admin`

**Conclusion:** The storage keys are correctly isolated. The collision is **not** caused by overwriting `localStorage` values.

### 2. Session Monitoring & Event Listeners (The Culprit)
Both applications use an identical mechanism to monitor session state across tabs using the `storage` event and custom `window` events.

#### `apps/web` (AuthContext.tsx)
```typescript
    // Listen for auth events from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth:logout') { // <--- GENERIC KEY
        handleSessionExpired();
      }
    };

    // Listen for custom auth events
    const handleAuthEvent = (e: CustomEvent) => {
      if (e.type === 'auth:logout' || e.type === 'auth:session_expired') { // <--- GENERIC EVENT NAMES
        handleSessionExpired();
      }
    };
```

#### `apps/web-admin` (AuthContext.tsx)
```typescript
    // Listen for auth events from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth:logout') { // <--- SAME GENERIC KEY
        handleSessionExpired();
      }
    };

    // Listen for custom auth events
    const handleAuthEvent = (e: CustomEvent) => {
      if (e.type === 'auth:logout' || e.type === 'auth:session_expired') { // <--- SAME GENERIC EVENT NAMES
        handleSessionExpired();
      }
    };
```

### 3. The Collision Mechanism
1.  **Scenario:** You have both apps open.
2.  **Trigger:** You refresh App A (e.g., `apps/web`).
3.  **Initialization:** App A initializes. If it decides the session is invalid (or during a logout action), it calls `clearAuthState()`.
4.  **Event Emission:** `clearAuthState` dispatches a `window` event named `auth:logout`.
    ```typescript
    window.dispatchEvent(new CustomEvent('auth:logout'));
    ```
5.  **Cross-App Interference:** Since both apps run on the same browser window (if testing in same tab context) or share `localStorage` events (if across tabs), the event listeners are generic.
    *   *Note on `window` events:* `CustomEvent` dispatched on `window` only affects the **current window/tab**. If you are refreshing one tab, it shouldn't affect another tab *unless* it triggers a `localStorage` change that the other tab is listening to.
    *   *Note on `storage` events:* The `storage` event fires in *other* tabs when `localStorage` changes.

    **CRITICAL FINDING in `clearAuthState` (Both Apps):**
    ```typescript
    export function clearAuthState(): void {
      if (typeof window !== 'undefined') {
        // ... removes keys ...
        
        // This is likely not the issue for cross-tab if keys are different, 
        // BUT look at what happens in AuthContext.tsx
      }
    }
    ```

    **The Real Issue: `storage` Event Handling**
    Both apps listen for `storage` events.
    ```typescript
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth:logout') { 
        handleSessionExpired();
      }
    };
    ```
    
    Wait, `auth:logout` is NOT a standard localStorage key. It seems the apps might be setting a dummy key to signal logout to other tabs?
    
    Let's check `clearAuthState` in `apps/web-admin/src/lib/auth.ts`:
    ```typescript
    export function clearAuthState(): void {
      if (typeof window !== 'undefined') {
        // ... removes specific keys ...
        
        // DOES IT SET A SHARED KEY?
        // No, it just dispatches window event.
      }
    }
    ```

    **Wait, re-reading the code provided:**
    The `AuthContext.tsx` in both apps has this:
    ```typescript
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth:logout') {
        handleSessionExpired();
      }
    };
    ```
    
    This implies that somewhere, `localStorage.setItem('auth:logout', ...)` is expected to happen to notify other tabs. 
    
    **HOWEVER**, if `localStorage` keys are namespaced, the `storage` event `e.key` will be specific (e.g., `grandline_auth_token_trainee`).
    
    If the code *was* relying on `localStorage.removeItem` to trigger the event, `e.key` would be the key removed.
    
    **BUT**, `apps/web/src/lib/auth.ts` and `apps/web-admin/src/lib/auth.ts` **DO NOT** seem to set a generic `auth:logout` key in localStorage.
    
    **Let's look at `clearAuthState` again.**
    It removes the specific keys.
    It dispatches `window.dispatchEvent(new CustomEvent('auth:logout'))`.
    
    **If you are in the SAME browser window (e.g. refreshing):**
    The `window` event is local to that document. It won't affect another tab.
    
    **If you are in DIFFERENT tabs:**
    The `storage` event is the only communication channel.
    
    **Hypothesis:**
    The issue might be related to `sessionStorage` or a shared cookie if used.
    
    **Check `sessionStorage`:**
    Both apps use: `sessionStorage.removeItem('auth:redirectAfterLogin');` -> Same key, but `sessionStorage` is per-tab, so no collision.
    
    **Check Cookies:**
    Both apps talk to the same backend API.
    The backend sets an **HTTP-only cookie** (`payload-token`?).
    
    If `apps/web` (Trainee) and `apps/web-admin` (Admin) share the same backend domain (e.g. `localhost:3000` proxying to `cms.grandlinemaritime.com` or similar), and the backend uses **Cookies** for auth, then:
    
    1. Admin logs in -> Browser gets `payload-token` (Admin Role).
    2. Trainee logs in -> Browser gets `payload-token` (Trainee Role), **overwriting** the Admin cookie.
    3. Admin app makes a request (e.g. `getCurrentUser` or `refreshSession`).
    4. Backend sees Trainee cookie.
    5. Backend returns `403 Forbidden` (User is not Admin).
    6. Admin app catches 403 -> Calls `clearAuthState()` -> Logs out locally.
    
    **Verification of Hypothesis:**
    *   `apps/web/src/lib/auth.ts`: `credentials: 'include'` is set.
    *   `apps/web-admin/src/lib/auth.ts`: `credentials: 'include'` is set.
    
    **This is the collision.** Both apps are sending/receiving the **SAME** cookie (`payload-token`) from the PayloadCMS backend. The browser cannot distinguish between "Admin Cookie" and "Trainee Cookie" if they are set by the same backend domain.
    
    Since PayloadCMS (the backend) uses a single cookie name (`payload-token`) by default, logging into one role overwrites the session cookie of the other role.
    
    When you refresh the page:
    1. The app initializes.
    2. It calls `getCurrentUser()` (or `refreshSession`).
    3. This request sends the *current* cookie.
    4. If the cookie belongs to the *other* user role (because you logged into the other app last), the backend returns the wrong user or an error.
    5. The app detects a role mismatch (e.g., `response.user.role !== 'admin'`) and forces a logout.

## Solution Strategy

We cannot easily change the cookie name on the backend without complex server configuration or using different domains.
However, since we are using **JWT Tokens in LocalStorage** as our primary client-side auth mechanism for these Frontends (Headless mode), we should **STOP** relying on the cookie for the "Me" request if possible, or at least understand that the cookie is the source of truth for the *Backend*, but we are trying to maintain two separate sessions.

**Actually, the fix is to rely EXCLUSIVELY on the Authorization Header and IGNORE cookies for these specific API calls if possible, OR accept that we cannot share the same backend session.**

But wait, `makeAuthRequest` uses:
```typescript
const REQUEST_CONFIG: RequestInit = {
  credentials: 'include', // <--- THIS SENDS COOKIES
  headers: {
    'Content-Type': 'application/json',
  },
};
```

And:
```typescript
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('grandline_auth_token_admin');
      if (token) headers = { Authorization: `users JWT ${token}` };
    }
```

PayloadCMS logic:
If `Authorization` header is present, it *usually* takes precedence over the cookie.
**However**, if `credentials: 'include'` is sending a conflicting cookie, Payload might be getting confused or prioritizing one.

**Wait, let's look at `getCurrentUser` validation logic:**

**App Admin:**
```typescript
    if (response.user.role !== 'admin') {
      clearAuthState(); // <--- LOGS OUT if the returned user is not admin
      return null;
    }
```

**App Web:**
```typescript
    if (response.user.role !== 'trainee') {
      clearAuthState(); // <--- LOGS OUT if the returned user is not trainee
      return null;
    }
```

**Scenario:**
1. Log in to Admin. `grandline_auth_token_admin` is set. Cookie is Admin.
2. Log in to Web. `grandline_auth_token_trainee` is set. Cookie is **overwritten** to Trainee.
3. Refresh Admin.
4. Admin calls `/me` with `Authorization: JWT <AdminToken>` AND `Cookie: <TraineeCookie>`.
5. **If Payload prioritizes Cookie**: It sees Trainee. Returns Trainee User.
6. Admin App checks `user.role` ('trainee') !== 'admin'.
7. **Admin App logs out.**

**Correct Fix:**
We must **DISABLE** sending cookies for these API calls if we want to rely purely on the Bearer token (JWT) to distinguish sessions. 
If we remove `credentials: 'include'`, the browser won't send the confusing cookie, and Payload will rely solely on the `Authorization: users JWT ...` header, which is unique and correct for each app.

## Implementation Plan

1.  **Modify `apps/web/src/lib/auth.ts`**:
    *   Change `credentials: 'include'` to `credentials: 'omit'` (or simply remove it) in `REQUEST_CONFIG`.
    *   Ensure all auth requests rely explicitly on the `Authorization` header.

2.  **Modify `apps/web-admin/src/lib/auth.ts`**:
    *   Change `credentials: 'include'` to `credentials: 'omit'` (or simply remove it) in `REQUEST_CONFIG`.

**Wait, does PayloadCMS *require* cookies for some endpoints?**
The code comments say: `// Enterprise-grade authentication with HTTP-only cookies`.
If the intention was to use Cookies for security (HttpOnly), then we **cannot** have two different users logged in on the same browser to the same backend domain simultaneously. It's physically impossible with standard cookies unless we use different browser profiles or different domains (e.g. `admin.grandline...` and `app.grandline...`).

**HOWEVER**, the code *also* manually stores the token in `localStorage` and sends it via Header. This is a "Hybrid" approach.
If we want to support simultaneous logins, we **MUST** drop the Cookie reliance for the API calls and rely on the Header.

**Risk:** `refresh-token` endpoint might rely on the cookie if the JWT is short-lived?
Let's check `refreshSession`:
```typescript
    const response = await makeAuthRequest<PayloadAuthResponse>('/refresh-token', {
      method: 'POST',
      headers: { Authorization: `users JWT ${currentToken}` },
    });
```
It sends the token in the header. It should be fine without the cookie.

## Action Items
1.  **apps/web**: Remove `credentials: 'include'` from `REQUEST_CONFIG` in `src/lib/auth.ts`.
2.  **apps/web-admin**: Remove `credentials: 'include'` from `REQUEST_CONFIG` in `src/lib/auth.ts`.
