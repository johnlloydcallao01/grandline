# Forgot Password / Reset Password – Implementation Steps

## 1. apps/web – Forgot Password Page (`/signin/forgot-password`)

- Page already implemented at `apps/web/src/app/(auth)/signin/forgot-password/page.tsx`.
- Verify behavior matches the spec:
  - Uses `PublicRoute` so authenticated users are redirected away from auth pages.
  - Shows a single `email` field with controlled state.
  - Trims whitespace and validates non-empty, well-formed email (e.g. `^[^\s@]+@[^\s@]+\.[^\s@]+$`).
  - On submit:
    - Prevents default.
    - Clears previous `error` and `successMessage`.
    - If validation fails, sets `error` and aborts.
    - Builds API base URL as  
      `const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';`  
      and strips trailing slash.
    - Calls `POST {apiBase}/forgot-password` with JSON body `{ email }` and `Content-Type: application/json`.
    - On any successful HTTP response, shows generic success message:  
      “If an account exists for this email, we have sent a password reset link.”
    - On network/other failure, shows a friendly error and logs details to the console only.
    - Always clears the loading state in a `finally` block.
  - UI:
    - Uses the existing signin layout/branding.
    - Renders an error banner for `error` and success banner for `successMessage`.
    - Provides a “Back to Sign In” action that navigates to `/signin` via the router.

## 2. apps/web – Wire Signin “Forgot Password” Link

- In `apps/web/src/app/(auth)/signin/page.tsx`:
  - Import `Link` from `next/link`.
  - Replace the `<a href="#">Forgot your password?</a>` with:
    - A `Link` component using SPA navigation.
    - Use `href={{ pathname: '/signin/forgot-password' }}` to satisfy Next 16 typed routes.

## 3. apps/web – Reset Password Page (`/signin/reset-password?token={token}`)

- Create page at `apps/web/src/app/(auth)/signin/reset-password/page.tsx`.
- Mark the page as a client component and wrap it in `PublicRoute`.
- Read the `token` from the query string:
  - Use `useSearchParams()` from `next/navigation`.
  - If `token` is missing or empty:
    - Show an error UI (“Invalid or missing reset link”).
    - Optionally render a button back to `/signin/forgot-password`.
- Add local state:
  - `password`, `confirmPassword`.
  - `isSubmitting`.
  - `error`, `successMessage`.
- Implement password validation exactly as specified:
  - Length between 8 and 40 characters.
  - Contains at least one uppercase letter `[A-Z]`.
  - Contains at least one digit `[0-9]`.
  - Contains at least one special character (e.g. `[^A-Za-z0-9]`).
  - `password === confirmPassword`.
  - If any rule fails, set a clear `error` message and abort submission.
- On submit:
  - Prevent default.
  - Clear previous `error` and `successMessage`.
  - Validate password and confirmation; if invalid, set `error` and return.
  - Build `apiBase` as in the forgot-password page.
  - Call `POST {apiBase}/reset-password` with body:
    - `{ token, newPassword: password }`.
  - If the response is successful:
    - Show success message indicating the password has been reset.
    - After a short delay (e.g. 2–3 seconds), navigate to `/signin`.
  - On error:
    - Parse response JSON if available and show a generic but user-friendly error.
    - Log technical details to the console only.
- UI requirements:
  - Show the same auth layout look-and-feel as signin/forgot-password.
  - Two password fields with show/hide toggle icons.
  - Summary of password rules near the fields (e.g. bullet list or hint text).

## 4. apps/cms – Endpoint and Data Validation

- Confirm custom endpoints in `apps/cms/src/payload.config.ts`:
  - `/api/forgot-password`:
    - Accepts `{ email }`, normalizes and looks up the user.
    - When user is active:
      - Generates raw token.
      - Hashes with SHA-256.
      - Pushes `{ token: hashed, expiresAt: now + TTL }` into `users.resetPasswordTokens`.
      - Sends email via Resend with link `https://app.grandlinemaritime.com/signin/reset-password?token={rawToken}`.
    - Returns success response regardless of user existence.
  - `/api/reset-password`:
    - Accepts `{ token, newPassword }`.
    - Validates password based on the same rules as the UI (length, uppercase, number, special char).
    - Hashes the submitted token and finds user by `resetPasswordTokens.token`.
    - Validates `expiresAt` > now.
    - Updates user:
      - Sets new password.
      - Removes used token from `resetPasswordTokens`.
      - Resets login attempts and lockout fields.
    - Sends confirmation email.
- Ensure `Users` collection has the proper field:
  - `resetPasswordTokens` array with fields:
    - `token` text, required.
    - `expiresAt` date, required.

## 5. Environment and Configuration

- Ensure `NEXT_PUBLIC_API_URL` is set in the web app environment to the PayloadCMS base URL:
  - For example: `https://cms.grandlinemaritime.com/api`.
- Verify email sending configuration in `apps/cms`:
  - Resend API key configured in environment variables.
  - Reset email template includes the correct frontend URL:  
    `https://app.grandlinemaritime.com/signin/reset-password?token={token}`.

## 6. Testing Plan

- Unit/integration tests (optional but recommended):
  - Test forgot-password form validation (invalid/empty email).
  - Test reset-password validation for:
    - Too short / too long passwords.
    - Missing uppercase / number / special char.
    - Non-matching confirmation.
- Manual flows:
  - Request reset:
    - Go to `/signin`.
    - Click “Forgot your password?”.
    - Submit valid email and confirm generic success message.
  - Reset with valid token:
    - Use email link to open `/signin/reset-password?token=...`.
    - Enter valid password and confirmation.
    - Confirm success message and redirect to `/signin`.
    - Verify login works with new password.
  - Reset with invalid/expired token:
    - Use a tampered or expired token.
    - Confirm appropriate error message and that no password change occurs.