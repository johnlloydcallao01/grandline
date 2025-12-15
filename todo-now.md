# Forgot Password Implementation Analysis

## Question 1: Forgot Password UI URLs in apps/web

**✅ CONFIRMED - Both URLs are correct:**

| URL | Status |
|-----|--------|
| `https://app.grandlinemaritime.com/signin/forgot-password` | ✅ Confirmed |
| `https://app.grandlinemaritime.com/signin/reset-password?token={token}` | ✅ Confirmed |

### Implementation Details

The UI is implemented in Next.js App Router at:
- [forgot-password/page.tsx](file:///c:/Users/User/Desktop/grandline/apps/web/src/app/(auth)/signin/forgot-password/page.tsx) - Email input form to request reset link
- [reset-password/page.tsx](file:///c:/Users/User/Desktop/grandline/apps/web/src/app/(auth)/signin/reset-password/page.tsx) - Password reset form with token validation

**Forgot Password Page Flow:**
1. User enters email address
2. Calls `POST https://cms.grandlinemaritime.com/api/forgot-password` with `{ email }`
3. Always shows "If an account exists, an email has been sent" (security measure)

**Reset Password Page Flow:**
1. Reads `token` from URL query params
2. User enters new password + confirmation
3. Client-side validation: 8-40 chars, uppercase, number, special char, match
4. Calls `POST https://cms.grandlinemaritime.com/api/reset-password` with `{ token, newPassword }`

---

## Question 2: Backend Endpoints in apps/cms

**✅ CONFIRMED - Both endpoints exist:**

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/forgot-password` | POST | ✅ Confirmed |
| `/api/reset-password` | POST | ✅ Confirmed |

### Location

Both endpoints are defined as custom endpoints in [payload.config.ts](file:///c:/Users/User/Desktop/grandline/apps/cms/src/payload.config.ts):

- **`/forgot-password`** - Lines 309-406
- **`/reset-password`** - Lines 408-548

### Endpoint Logic Summary

#### `POST /api/forgot-password`
1. Extracts and normalizes email from request body
2. Looks up user in `users` collection by email
3. If user exists and is active:
   - Generates raw token (32 random bytes → hex)
   - Hashes token with SHA-256 for storage
   - Stores `{ token: hashed, expiresAt: now + TTL }` in user's `resetPasswordTokens` array
   - Sends email via Resend API with reset link containing raw token
4. Always returns success response (security measure)

#### `POST /api/reset-password`
1. Extracts `token` and `newPassword` from request body
2. Validates password policy (8-40 chars, uppercase, number, special char)
3. Hashes the submitted token with SHA-256
4. Searches `users` collection for matching `resetPasswordTokens.token`
5. Validates token is not expired
6. Updates user: sets new password, clears used token, resets login attempts
7. Sends confirmation email via Resend API

---

## Question 3: Database/Supabase Involvement

**✅ CONFIRMED - Uses PayloadCMS (PostgreSQL) via `resetPasswordTokens` field - NOT Supabase SDK**

### Key Finding

The forgot password implementation **does NOT use the Supabase SDK directly**. Instead, it:

1. Uses **PayloadCMS's built-in database layer** (`req.payload.find()`, `req.payload.update()`)
2. Stores reset tokens in the `users` collection via the `resetPasswordTokens` array field
3. The underlying database is PostgreSQL (hosted on Supabase infrastructure, but accessed via PayloadCMS)

### Database Schema

The `resetPasswordTokens` field is defined in [Users.ts](file:///c:/Users/User/Desktop/grandline/apps/cms/src/collections/Users.ts#L255-L262):

```typescript
{
  name: 'resetPasswordTokens',
  type: 'array',
  fields: [
    { name: 'token', type: 'text', required: true },
    { name: 'expiresAt', type: 'date', required: true },
  ],
}
```

### Supabase Usage in apps/cms

While Supabase environment variables exist in the project (for database hosting/backup scripts), the forgot password implementation:
- ❌ Does NOT import `@supabase/supabase-js`
- ❌ Does NOT call any Supabase Auth methods
- ✅ Uses only PayloadCMS API (`req.payload.find()`, `req.payload.update()`)

---

## Summary

| Question | Answer |
|----------|--------|
| 1. Forgot password URLs? | ✅ Yes, both URLs confirmed |
| 2. Backend endpoints? | ✅ Yes, `POST /api/forgot-password` and `POST /api/reset-password` |
| 3. Uses Supabase? | ❌ No - uses PayloadCMS database layer (PostgreSQL) |